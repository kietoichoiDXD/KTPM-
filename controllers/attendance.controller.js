const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');

// Điểm danh
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, courseId, date, status, notes } = req.body;

    // Kiểm tra student và course
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    // Tìm hoặc tạo mới
    let attendance = await Attendance.findOne({
      student: studentId,
      course: courseId,
      date: new Date(date)
    });

    if (attendance) {
      attendance.status = status;
      attendance.notes = notes || attendance.notes;
      attendance.markedBy = req.user.id;
    } else {
      attendance = new Attendance({
        student: studentId,
        course: courseId,
        date: new Date(date),
        status,
        notes,
        markedBy: req.user.id
      });
    }

    await attendance.save();
    await attendance.populate('student', 'name');
    await attendance.populate('course', 'name code');

    res.json({
      message: 'Điểm danh thành công',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Lấy danh sách điểm danh
exports.getAttendance = async (req, res) => {
  try {
    const { studentId, courseId, startDate, endDate } = req.query;
    const query = {};

    if (studentId) query.student = studentId;
    if (courseId) query.course = courseId;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name email')
      .populate('course', 'name code')
      .sort({ date: -1 });

    res.json({
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thống kê điểm danh của sinh viên
exports.getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const query = { student: studentId };
    if (courseId) query.course = courseId;

    const attendance = await Attendance.find(query);

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      excused: attendance.filter(a => a.status === 'EXCUSED').length
    };

    stats.attendanceRate = stats.total > 0 
      ? ((stats.present / stats.total) * 100).toFixed(2) 
      : 0;

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa điểm danh
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi điểm danh' });
    }

    res.json({ message: 'Xóa điểm danh thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
