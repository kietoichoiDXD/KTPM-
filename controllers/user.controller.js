const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const Student = require('../models/student.model');

// Lấy danh sách users (phân trang, tìm kiếm username, lọc role, status)
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const role = req.query.role ? req.query.role.trim().toUpperCase() : '';
    const status = req.query.status ? req.query.status.trim().toUpperCase() : '';
    const sortBy = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }
    if (role) {
      query.role = role;
    }
    if (status) {
      query.status = status;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('student', 'name studentCode email phone avatar')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết user kèm student info
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('student');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo user mới (dành riêng cho ADMIN)
exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role, status, studentId, student } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const targetStudentId = studentId || student;

    let linkedStudent = null;
    if (targetStudentId) {
      if (!mongoose.Types.ObjectId.isValid(targetStudentId)) {
        return res.status(400).json({ message: 'ID sinh viên liên kết không hợp lệ' });
      }
      linkedStudent = await Student.findOne({ _id: targetStudentId, isDeleted: false });
      if (!linkedStudent) {
        return res.status(404).json({ message: 'Không tìm thấy sinh viên để liên kết' });
      }
    }

    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      role: role || 'USER',
      status: status || 'ACTIVE',
      student: linkedStudent ? linkedStudent._id : null
    });

    await newUser.save();

    // Liên kết hai chiều nếu có student
    if (linkedStudent) {
      // Hủy liên kết user cũ nếu student này đã từng gắn với user khác
      if (linkedStudent.user && linkedStudent.user.toString() !== newUser._id.toString()) {
        await User.findByIdAndUpdate(linkedStudent.user, { student: null });
      }
      linkedStudent.user = newUser._id;
      await linkedStudent.save();
    }

    const createdUser = await User.findById(newUser._id)
      .select('-password')
      .populate('student');

    res.status(201).json({
      message: 'Tạo người dùng thành công',
      data: createdUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật user (role, reset password, link student, username, trạng thái)
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { username, password, role, status, studentId, student } = req.body;

    // Cập nhật username
    if (username && username.trim() !== user.username) {
      const existingUser = await User.findOne({
        username: username.trim(),
        _id: { $ne: user._id }
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username đã tồn tại' });
      }
      user.username = username.trim();
    }

    // Cập nhật role
    if (role) {
      const normalizedRole = role.trim().toUpperCase();
      if (!['USER', 'ADMIN'].includes(normalizedRole)) {
        return res.status(400).json({ message: 'Role không hợp lệ' });
      }
      // Không cho admin tự gỡ quyền admin của chính mình nếu là admin duy nhất
      if (req.user.id === user._id.toString() && normalizedRole !== 'ADMIN') {
        return res.status(400).json({ message: 'Bạn không thể tự hạ quyền ADMIN của chính mình' });
      }
      user.role = normalizedRole;
    }

    // Cập nhật trạng thái
    if (status) {
      const normalizedStatus = status.trim().toUpperCase();
      if (!['ACTIVE', 'INACTIVE', 'LOCKED'].includes(normalizedStatus)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }
      if (req.user.id === user._id.toString() && normalizedStatus !== 'ACTIVE') {
        return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản của chính mình' });
      }
      user.status = normalizedStatus;
    }

    // Reset password
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    // Liên kết / Hủy liên kết sinh viên (Two-way linkage)
    const targetStudentInput = studentId !== undefined ? studentId : student;
    if (targetStudentInput !== undefined) {
      if (targetStudentInput === null || targetStudentInput === '') {
        // Hủy liên kết
        if (user.student) {
          await Student.findByIdAndUpdate(user.student, { user: null });
          user.student = null;
        }
      } else {
        if (!mongoose.Types.ObjectId.isValid(targetStudentInput)) {
          return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
        }

        const studentDoc = await Student.findOne({ _id: targetStudentInput, isDeleted: false });
        if (!studentDoc) {
          return res.status(404).json({ message: 'Không tìm thấy sinh viên để liên kết' });
        }

        // Nếu user này trước đó đang liên kết với student khác -> gỡ liên kết student cũ
        if (user.student && user.student.toString() !== studentDoc._id.toString()) {
          await Student.findByIdAndUpdate(user.student, { user: null });
        }

        // Nếu student này trước đó đang liên kết với user khác -> gỡ liên kết user cũ
        if (studentDoc.user && studentDoc.user.toString() !== user._id.toString()) {
          await User.findByIdAndUpdate(studentDoc.user, { student: null });
        }

        // Thiết lập hai chiều
        studentDoc.user = user._id;
        await studentDoc.save();
        user.student = studentDoc._id;
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('student');

    res.json({
      message: 'Cập nhật người dùng thành công',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa user (không cho tự xóa chính mình)
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Không thể tự xóa tài khoản của chính mình' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Hủy liên kết hai chiều với sinh viên nếu có
    if (user.student) {
      await Student.findByIdAndUpdate(user.student, { user: null });
    }
    await Student.updateMany({ user: user._id }, { user: null });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
