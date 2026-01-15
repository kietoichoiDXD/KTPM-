const Student = require('../models/student.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

// Thống kê tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });

    // Thống kê sinh viên theo độ tuổi
    const ageStats = await Student.aggregate([
      {
        $group: {
          _id: '$age',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Khóa học có nhiều sinh viên nhất
    const popularCourses = await Course.aggregate([
      {
        $project: {
          name: 1,
          code: 1,
          studentCount: { $size: '$students' }
        }
      },
      { $sort: { studentCount: -1 } },
      { $limit: 5 }
    ]);

    // Sinh viên mới nhất
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name age email createdAt');

    res.json({
      overview: {
        totalStudents,
        totalCourses,
        totalUsers,
        totalAdmins
      },
      ageDistribution: ageStats,
      popularCourses,
      recentStudents
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thống kê chi tiết sinh viên
exports.getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    
    const avgAge = await Student.aggregate([
      {
        $group: {
          _id: null,
          averageAge: { $avg: '$age' },
          minAge: { $min: '$age' },
          maxAge: { $max: '$age' }
        }
      }
    ]);

    const studentsWithAvatar = await Student.countDocuments({ avatar: { $ne: null } });
    const studentsWithEmail = await Student.countDocuments({ email: { $ne: null } });

    res.json({
      total: totalStudents,
      ageStats: avgAge[0] || { averageAge: 0, minAge: 0, maxAge: 0 },
      withAvatar: studentsWithAvatar,
      withEmail: studentsWithEmail,
      avatarPercentage: totalStudents > 0 ? ((studentsWithAvatar / totalStudents) * 100).toFixed(2) : 0,
      emailPercentage: totalStudents > 0 ? ((studentsWithEmail / totalStudents) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
