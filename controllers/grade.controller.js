const Grade = require('../models/grade.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');

// Nhập điểm
exports.createGrade = async (req, res) => {
  try {
    const { studentId, courseId, semester, midtermScore, finalScore, assignmentScore } = req.body;

    // Kiểm tra sinh viên và khóa học
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({ message: 'Sinh viên hoặc khóa học không tồn tại' });
    }

    // Kiểm tra đã có điểm chưa
    const existingGrade = await Grade.findOne({
      student: studentId,
      course: courseId,
      semester
    });

    if (existingGrade) {
      return res.status(400).json({ 
        message: 'Điểm đã tồn tại, vui lòng sử dụng API cập nhật' 
      });
    }

    const grade = new Grade({
      student: studentId,
      course: courseId,
      semester,
      midtermScore,
      finalScore,
      assignmentScore
    });

    await grade.save();

    res.status(201).json({
      message: 'Nhập điểm thành công',
      data: grade
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Cập nhật điểm
exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { midtermScore, finalScore, assignmentScore } = req.body;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({ message: 'Không tìm thấy điểm' });
    }

    if (midtermScore !== undefined) grade.midtermScore = midtermScore;
    if (finalScore !== undefined) grade.finalScore = finalScore;
    if (assignmentScore !== undefined) grade.assignmentScore = assignmentScore;

    await grade.save(); // Tự động tính lại totalScore và grade

    res.json({
      message: 'Cập nhật điểm thành công',
      data: grade
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xem bảng điểm sinh viên
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    const query = { student: studentId };
    if (semester) query.semester = semester;

    const grades = await Grade.find(query)
      .populate('course', 'name code credits')
      .sort({ semester: -1, createdAt: -1 });

    // Tính GPA
    if (grades.length > 0) {
      const totalCredits = grades.reduce((sum, g) => sum + (g.course.credits || 0), 0);
      const weightedSum = grades.reduce((sum, g) => {
        const gradePoint = getGradePoint(g.grade);
        return sum + (gradePoint * (g.course.credits || 0));
      }, 0);
      const gpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;

      return res.json({
        student: studentId,
        semester,
        gpa,
        totalCredits,
        grades
      });
    }

    res.json({
      student: studentId,
      semester,
      gpa: 0,
      totalCredits: 0,
      grades: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xem bảng điểm khóa học
exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester } = req.query;

    const query = { course: courseId };
    if (semester) query.semester = semester;

    const grades = await Grade.find(query)
      .populate('student', 'name email')
      .sort({ totalScore: -1 });

    // Thống kê
    const stats = {
      total: grades.length,
      pass: grades.filter(g => g.status === 'PASS').length,
      fail: grades.filter(g => g.status === 'FAIL').length,
      avgScore: grades.length > 0 
        ? (grades.reduce((sum, g) => sum + g.totalScore, 0) / grades.length).toFixed(2)
        : 0
    };

    res.json({
      course: courseId,
      semester,
      stats,
      grades
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Helper function
function getGradePoint(grade) {
  const gradePoints = {
    'A': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'D+': 1.5,
    'D': 1.0,
    'F': 0.0
  };
  return gradePoints[grade] || 0;
}
