const Student = require('../models/student.model');
const Course = require('../models/course.model');

// Export danh sách sinh viên dạng CSV
exports.exportStudentsCSV = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false });

    // Tạo CSV header
    let csv = 'ID,Tên,Tuổi,Email,Số điện thoại,Ngày tạo\n';

    // Thêm dữ liệu
    students.forEach(student => {
      csv += `${student._id},${student.name},${student.age},${student.email || ''},${student.phone || ''},${student.createdAt}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Export danh sách khóa học dạng CSV
exports.exportCoursesCSV = async (req, res) => {
  try {
    const courses = await Course.find().populate('students');

    let csv = 'ID,Mã khóa học,Tên khóa học,Tín chỉ,Giảng viên,Số sinh viên\n';

    courses.forEach(course => {
      csv += `${course._id},${course.code},${course.name},${course.credits},${course.teacher || ''},${course.students.length}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=courses.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Export dữ liệu JSON
exports.exportJSON = async (req, res) => {
  try {
    const { type } = req.params; // 'students' hoặc 'courses'

    let data;
    if (type === 'students') {
      data = await Student.find({ isDeleted: false });
    } else if (type === 'courses') {
      data = await Course.find().populate('students');
    } else {
      return res.status(400).json({ message: 'Type không hợp lệ' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${type}.json`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
