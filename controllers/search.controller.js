const Student = require('../models/student.model');
const Course = require('../models/course.model');

// Tìm kiếm toàn cục (students + courses)
exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query; // query string

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự' 
      });
    }

    const searchRegex = { $regex: q, $options: 'i' };

    // Tìm sinh viên
    const students = await Student.find({
      isDeleted: false,
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ]
    }).limit(10);

    // Tìm khóa học
    const courses = await Course.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { teacher: searchRegex }
      ]
    }).limit(10);

    res.json({
      query: q,
      results: {
        students: {
          count: students.length,
          data: students
        },
        courses: {
          count: courses.length,
          data: courses
        }
      },
      total: students.length + courses.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tìm kiếm nâng cao sinh viên
exports.advancedStudentSearch = async (req, res) => {
  try {
    const { name, minAge, maxAge, email, hasAvatar } = req.query;

    const query = { isDeleted: false };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge);
      if (maxAge) query.age.$lte = parseInt(maxAge);
    }

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    if (hasAvatar === 'true') {
      query.avatar = { $ne: null };
    } else if (hasAvatar === 'false') {
      query.avatar = null;
    }

    const students = await Student.find(query);

    res.json({
      count: students.length,
      filters: { name, minAge, maxAge, email, hasAvatar },
      data: students
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
