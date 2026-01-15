const Student = require('../models/student.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

// Phân tích xu hướng tăng trưởng
exports.getGrowthTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Sinh viên mới theo ngày
    const studentGrowth = await Student.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Khóa học mới theo ngày
    const courseGrowth = await Course.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      period: `${days} days`,
      students: studentGrowth,
      courses: courseGrowth
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Phân tích độ tuổi chi tiết
exports.getAgeAnalytics = async (req, res) => {
  try {
    const ageRanges = await Student.aggregate([
      { $match: { isDeleted: false } },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 22, 25, 30, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            students: { $push: { name: '$name', age: '$age' } }
          }
        }
      }
    ]);

    const labels = ['Dưới 18', '18-21', '22-24', '25-29', 'Trên 30'];
    const formattedData = ageRanges.map((range, index) => ({
      range: labels[index] || 'Khác',
      count: range.count,
      percentage: 0
    }));

    const total = formattedData.reduce((sum, item) => sum + item.count, 0);
    formattedData.forEach(item => {
      item.percentage = ((item.count / total) * 100).toFixed(2);
    });

    res.json({
      total,
      distribution: formattedData
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Top khóa học
exports.getTopCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topCourses = await Course.aggregate([
      {
        $project: {
          name: 1,
          code: 1,
          teacher: 1,
          studentCount: { $size: '$students' }
        }
      },
      { $sort: { studentCount: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      topCourses
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
