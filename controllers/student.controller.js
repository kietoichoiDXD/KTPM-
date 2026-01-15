const Student = require('../models/student.model');

// Lấy danh sách sinh viên (có phân trang, tìm kiếm, sắp xếp)
exports.getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Tìm kiếm theo tên
    const query = search ? { 
      name: { $regex: search, $options: 'i' },
      isDeleted: false 
    } : { isDeleted: false };

    const students = await Student.find(query)
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
    const student = await Student.findOne({ 
      _id: req.params.id,
      isDeleted: false 
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo sinh viên mới
exports.createStudent = async (req, res) => {
  try {
    const { name, age, email, phone } = req.body;

    const student = new Student({
      name,
      age,
      email,
      phone,
      avatar: req.file ? `/uploads/images/${req.file.filename}` : null
    });

    await student.save();

    res.status(201).json({
      message: 'Tạo sinh viên thành công',
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật sinh viên
exports.updateStudent = async (req, res) => {
  try {
    const { name, age, email, phone } = req.body;

    const updateData = { name, age, email, phone };
    
    if (req.file) {
      updateData.avatar = `/uploads/images/${req.file.filename}`;
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    res.json({
      message: 'Cập nhật sinh viên thành công',
      data: student
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa sinh viên (soft delete)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ 
      _id: req.params.id,
      isDeleted: false 
    });

    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    await student.softDelete();

    res.json({ message: 'Xóa sinh viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
