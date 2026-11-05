const Grade = require('../models/grade.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');

// Helper quy đổi điểm chữ sang thang điểm 4
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

// Lấy danh sách điểm
exports.getGrades = async (req, res) => {
  try {
    const { studentId, courseId, semester, year } = req.query;
    const query = {};

    if (studentId) query.student = studentId;
    if (courseId) query.course = courseId;
    if (semester) query.semester = semester;
    if (year) query.year = year;

    const grades = await Grade.find(query)
      .populate('student', 'name email mssv class')
      .populate('course', 'name code credits')
      .sort({ createdAt: -1 });

    res.json({
      count: grades.length,
      data: grades
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Nhập / Cập nhật điểm (Upsert)
exports.upsertGrade = async (req, res) => {
  try {
    const { studentId, courseId, midtermScore, finalScore, semester, year, notes } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    let grade = await Grade.findOne({
      student: studentId,
      course: courseId,
      semester: semester || '1',
      year: year || new Date().getFullYear()
    });

    if (grade) {
      if (midtermScore !== undefined) grade.midtermScore = midtermScore;
      if (finalScore !== undefined) grade.finalScore = finalScore;
      if (notes !== undefined) grade.notes = notes;
    } else {
      grade = new Grade({
        student: studentId,
        course: courseId,
        midtermScore,
        finalScore,
        semester: semester || '1',
        year: year || new Date().getFullYear(),
        notes
      });
    }

    grade.calculateGrade();
    await grade.save();
    await grade.populate('student', 'name email mssv class');
    await grade.populate('course', 'name code credits');

    res.json({
      message: 'Lưu điểm thành công',
      data: grade
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xem bảng điểm sinh viên (Transcript)
exports.getStudentTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, year } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    const query = { student: studentId };
    if (semester) query.semester = semester;
    if (year) query.year = year;

    const grades = await Grade.find(query)
      .populate('course', 'name code credits')
      .sort({ semester: -1, createdAt: -1 });

    const totalCourses = grades.length;
    const passedCourses = grades.filter(g => g.status === 'PASS').length;
    const failedCourses = grades.filter(g => g.status === 'FAIL').length;
    const totalCredits = grades.reduce((sum, g) => sum + (g.course?.credits || 0), 0);

    let gpa = 0;
    if (totalCredits > 0) {
      const weightedSum = grades.reduce((sum, g) => {
        const gradePoint = getGradePoint(g.letterGrade);
        return sum + (gradePoint * (g.course?.credits || 0));
      }, 0);
      gpa = parseFloat((weightedSum / totalCredits).toFixed(2));
    }

    res.json({
      student: student.name,
      mssv: student.mssv,
      totalCourses,
      passedCourses,
      failedCourses,
      totalCredits,
      gpa,
      grades
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Xóa điểm
exports.deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Không tìm thấy điểm' });
    }
    res.json({ message: 'Xóa điểm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Aliases cho tương thích ngược
exports.createGrade = exports.upsertGrade;
exports.updateGrade = exports.upsertGrade;
exports.getStudentGrades = exports.getStudentTranscript;
exports.getCourseGrades = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester, year } = req.query;

    const query = { course: courseId };
    if (semester) query.semester = semester;
    if (year) query.year = year;

    const grades = await Grade.find(query)
      .populate('student', 'name email mssv class')
      .sort({ averageScore: -1 });

    const stats = {
      total: grades.length,
      pass: grades.filter(g => g.status === 'PASS').length,
      fail: grades.filter(g => g.status === 'FAIL').length,
      avgScore: grades.length > 0
        ? (grades.reduce((sum, g) => sum + (g.averageScore || 0), 0) / grades.length).toFixed(2)
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
