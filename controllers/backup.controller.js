const Student = require('../models/student.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

// Backup toàn bộ database
exports.backupDatabase = async (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        students: await Student.find(),
        courses: await Course.find(),
        users: await User.find().select('-password')
      }
    };

    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const filename = `backup_${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    res.json({
      message: 'Backup thành công',
      filename,
      size: fs.statSync(filepath).size,
      records: {
        students: backupData.data.students.length,
        courses: backupData.data.courses.length,
        users: backupData.data.users.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi backup', error: error.message });
  }
};

// Lấy danh sách backup
exports.listBackups = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(backupDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime
        };
      })
      .sort((a, b) => b.created - a.created);

    res.json({ backups });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Download backup file
exports.downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../backups', filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ message: 'File backup không tồn tại' });
    }

    res.download(filepath);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
