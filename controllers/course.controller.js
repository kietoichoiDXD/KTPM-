const Course = require('../models/course.model');
const Student = require('../models/student.model');

// Lấy danh sách khóa học
exports.getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search ? { 
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const courses = await Course.find(query)
      .populate('students', 'name age email')
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: courses
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy chi tiết khóa học
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('students', 'name age email phone avatar');
    
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tạo khóa học mới
exports.createCourse = async (req, res) => {
  try {
    const { name, code, credits, description, teacher } = req.body;

    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Mã khóa học đã tồn tại' });
    }

    const course = new Course({
      name,
      code,
      credits,
      description,
      teacher
    });

    await course.save();

    res.status(201).json({
      message: 'Tạo khóa học thành công',
      data: course
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  try {
    const { name, code, credits, description, teacher } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, code, credits, description, teacher },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    res.json({
      message: 'Cập nhật khóa học thành công',
      data: course
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa khóa học
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    res.json({ message: 'Xóa khóa học thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm sinh viên vào khóa học
exports.addStudentToCourse = async (req, res) => {
  try {
    const { studentId } = req.body;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Sinh viên đã có trong khóa học' });
    }

    course.students.push(studentId);
    await course.save();

    res.json({
      message: 'Thêm sinh viên vào khóa học thành công',
      data: course
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa sinh viên khỏi khóa học
exports.removeStudentFromCourse = async (req, res) => {
  try {
    const { studentId } = req.params;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    course.students = course.students.filter(id => id.toString() !== studentId);
    await course.save();

    res.json({
      message: 'Xóa sinh viên khỏi khóa học thành công',
      data: course
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
