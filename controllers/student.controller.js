const mongoose = require('mongoose');
const Student = require('../models/student.model');
const User = require('../models/user.model');

// Lấy thông tin hồ sơ sinh viên của chính tài khoản đang đăng nhập (GET /students/me)
exports.getMyProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ 
      user: req.user.id, 
      isDeleted: false 
    }).populate('user', 'username role status');

    // Kiểm tra dự phòng qua User.student
    if (!student) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser && currentUser.student) {
        student = await Student.findOne({ 
          _id: currentUser.student, 
          isDeleted: false 
        }).populate('user', 'username role status');

        // Đồng bộ liên kết hai chiều nếu chưa có
        if (student && (!student.user || student.user.toString() !== currentUser._id.toString())) {
          student.user = currentUser._id;
          await student.save();
        }
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Tài khoản chưa được liên kết với hồ sơ sinh viên nào' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Sinh viên tự cập nhật thông tin cá nhân: phone, email, avatar (PUT /students/me)
exports.updateMyProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ 
      user: req.user.id, 
      isDeleted: false 
    });

    if (!student) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser && currentUser.student) {
        student = await Student.findOne({ 
          _id: currentUser.student, 
          isDeleted: false 
        });
        if (student && (!student.user || student.user.toString() !== currentUser._id.toString())) {
          student.user = currentUser._id;
          await student.save();
        }
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Tài khoản chưa được liên kết với hồ sơ sinh viên nào' });
    }

    const { email, phone } = req.body;

    if (email !== undefined) {
      student.email = email.trim();
    }
    if (phone !== undefined) {
      student.phone = phone.trim();
    }

    if (req.file) {
      student.avatar = `/uploads/images/${req.file.filename}`;
    } else if (req.body.avatar !== undefined) {
      student.avatar = req.body.avatar;
    }

    await student.save();
    await student.populate('user', 'username role status');

    res.json({
      message: 'Cập nhật thông tin cá nhân thành công',
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách sinh viên (có phân trang, tìm kiếm theo tên hoặc mã sinh viên, sắp xếp)
exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const sortBy = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Tìm kiếm theo tên hoặc mã sinh viên
    const query = { isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentCode: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .populate('user', 'username role status')
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết sinh viên
exports.getStudentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
    }

    const student = await Student.findOne({ 
      _id: req.params.id,
      isDeleted: false 
    }).populate('user', 'username role status');
    
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo sinh viên mới (ADMIN)
exports.createStudent = async (req, res) => {
  try {
    const { name, age, email, phone, studentCode, userId, user } = req.body;

    // Kiểm tra studentCode nếu có
    if (studentCode) {
      const existingCode = await Student.findOne({ 
        studentCode: studentCode.trim(), 
        isDeleted: false 
      });
      if (existingCode) {
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
      }
    }

    const targetUserId = userId || user;
    let linkedUser = null;
    if (targetUserId) {
      if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: 'ID tài khoản người dùng không hợp lệ' });
      }
      linkedUser = await User.findById(targetUserId);
      if (!linkedUser) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng để liên kết' });
      }
    }

    const student = new Student({
      name: name.trim(),
      age,
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      studentCode: studentCode ? studentCode.trim() : undefined,
      avatar: req.file ? `/uploads/images/${req.file.filename}` : null,
      user: linkedUser ? linkedUser._id : null
    });

    await student.save();

    // Liên kết hai chiều nếu có user
    if (linkedUser) {
      if (linkedUser.student && linkedUser.student.toString() !== student._id.toString()) {
        await Student.findByIdAndUpdate(linkedUser.student, { user: null });
      }
      linkedUser.student = student._id;
      await linkedUser.save();
    }

    const createdStudent = await Student.findById(student._id).populate('user', 'username role status');

    res.status(201).json({
      message: 'Tạo sinh viên thành công',
      data: createdStudent
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật sinh viên (ADMIN)
exports.updateStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
    }

    const student = await Student.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    const { name, age, email, phone, studentCode, userId, user } = req.body;

    if (studentCode && studentCode.trim() !== student.studentCode) {
      const existingCode = await Student.findOne({
        studentCode: studentCode.trim(),
        _id: { $ne: student._id },
        isDeleted: false
      });
      if (existingCode) {
        return res.status(400).json({ message: 'Mã sinh viên đã tồn tại' });
      }
      student.studentCode = studentCode.trim();
    }

    if (name !== undefined) student.name = name.trim();
    if (age !== undefined) student.age = age;
    if (email !== undefined) student.email = email ? email.trim() : undefined;
    if (phone !== undefined) student.phone = phone ? phone.trim() : undefined;

    if (req.file) {
      student.avatar = `/uploads/images/${req.file.filename}`;
    }

    // Xử lý liên kết user
    const targetUserInput = userId !== undefined ? userId : user;
    if (targetUserInput !== undefined) {
      if (targetUserInput === null || targetUserInput === '') {
        // Hủy liên kết
        if (student.user) {
          await User.findByIdAndUpdate(student.user, { student: null });
          student.user = null;
        }
      } else {
        if (!mongoose.Types.ObjectId.isValid(targetUserInput)) {
          return res.status(400).json({ message: 'ID tài khoản người dùng không hợp lệ' });
        }
        const userDoc = await User.findById(targetUserInput);
        if (!userDoc) {
          return res.status(404).json({ message: 'Không tìm thấy tài khoản người dùng để liên kết' });
        }

        // Hủy liên kết user cũ nếu student đang gắn với user khác
        if (student.user && student.user.toString() !== userDoc._id.toString()) {
          await User.findByIdAndUpdate(student.user, { student: null });
        }

        // Hủy liên kết student cũ nếu user đó đang gắn với student khác
        if (userDoc.student && userDoc.student.toString() !== student._id.toString()) {
          await Student.findByIdAndUpdate(userDoc.student, { user: null });
        }

        userDoc.student = student._id;
        await userDoc.save();
        student.user = userDoc._id;
      }
    }

    await student.save();

    const updatedStudent = await Student.findById(student._id).populate('user', 'username role status');

    res.json({
      message: 'Cập nhật sinh viên thành công',
      data: updatedStudent
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa sinh viên (soft delete - ADMIN)
exports.deleteStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID sinh viên không hợp lệ' });
    }

    const student = await Student.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    // Hủy liên kết tài khoản user
    if (student.user) {
      await User.findByIdAndUpdate(student.user, { student: null });
    }
    await User.updateMany({ student: student._id }, { student: null });

    await student.softDelete();

    res.json({ message: 'Xóa sinh viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
