const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Student = require('../models/student.model');
const Course = require('../models/course.model');
const Grade = require('../models/grade.model');
const Attendance = require('../models/attendance.model');
const Notification = require('../models/notification.model');

async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Database đã có dữ liệu, bỏ qua bước khởi tạo mẫu.');
      return;
    }

    console.log('🌱 Đang khởi tạo dữ liệu mẫu cho hệ thống Quản lý Sinh viên...');

    // 1. Tạo Users
    const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
    const hashedPasswordUser = await bcrypt.hash('user123', 10);

    const admin = await User.create({
      username: 'admin',
      password: hashedPasswordAdmin,
      role: 'ADMIN'
    });

    const user = await User.create({
      username: 'user',
      password: hashedPasswordUser,
      role: 'USER'
    });

    // 2. Tạo Students
    const students = await Student.create([
      {
        name: 'Nguyễn Văn An',
        age: 20,
        email: 'nguyenvanan@ued.udn.vn',
        phone: '0905123456'
      },
      {
        name: 'Trần Thị Bích',
        age: 21,
        email: 'tranthibich@ued.udn.vn',
        phone: '0905234567'
      },
      {
        name: 'Lê Hoàng Cường',
        age: 20,
        email: 'lehoangcuong@ued.udn.vn',
        phone: '0905345678'
      },
      {
        name: 'Phạm Thu Dung',
        age: 22,
        email: 'phamthudung@ued.udn.vn',
        phone: '0905456789'
      },
      {
        name: 'Đặng Tuấn Kiệt',
        age: 21,
        email: 'dangtuankiet@ued.udn.vn',
        phone: '0905567890'
      }
    ]);

    // 3. Tạo Courses
    const courses = await Course.create([
      {
        name: 'Kiểm thử phần mềm',
        code: 'KTPM2026',
        credits: 3,
        description: 'Kiểm thử hộp trắng, hộp đen, automation test và performance test',
        teacher: 'ThS. Nguyễn Văn A',
        students: [students[0]._id, students[1]._id, students[2]._id, students[4]._id]
      },
      {
        name: 'Lập trình Web nâng cao',
        code: 'WEB301',
        credits: 3,
        description: 'Xây dựng ứng dụng Fullstack với REST API và Single Page Application',
        teacher: 'TS. Trần Thị B',
        students: [students[0]._id, students[2]._id, students[3]._id]
      },
      {
        name: 'Cơ sở dữ liệu & NoSQL',
        code: 'CSDL201',
        credits: 3,
        description: 'Thiết kế cơ sở dữ liệu quan hệ và phi quan hệ MongoDB',
        teacher: 'ThS. Lê Hoàng C',
        students: [students[1]._id, students[3]._id, students[4]._id]
      }
    ]);

    // 4. Tạo Điểm số (Grades)
    const gradeData = [
      { student: students[0]._id, course: courses[0]._id, midtermScore: 8.5, finalScore: 9.0, semester: '1', year: 2026, notes: 'Làm bài xuất sắc' },
      { student: students[1]._id, course: courses[0]._id, midtermScore: 7.0, finalScore: 7.5, semester: '1', year: 2026, notes: 'Tham gia đầy đủ' },
      { student: students[2]._id, course: courses[0]._id, midtermScore: 9.0, finalScore: 9.5, semester: '1', year: 2026, notes: 'Nắm vững kiến thức kiểm thử' },
      { student: students[4]._id, course: courses[0]._id, midtermScore: 8.0, finalScore: 8.5, semester: '1', year: 2026, notes: 'Thực hành tốt' },
      { student: students[0]._id, course: courses[1]._id, midtermScore: 8.0, finalScore: 8.5, semester: '1', year: 2026, notes: 'Project hoàn thiện tốt' },
      { student: students[2]._id, course: courses[1]._id, midtermScore: 6.5, finalScore: 7.0, semester: '1', year: 2026, notes: 'Cần cải thiện giao diện' },
      { student: students[1]._id, course: courses[2]._id, midtermScore: 8.5, finalScore: 8.0, semester: '1', year: 2026, notes: 'Tối ưu query tốt' }
    ];

    for (const item of gradeData) {
      const g = new Grade(item);
      g.calculateGrade();
      await g.save();
    }

    // 5. Tạo Điểm danh (Attendance)
    const today = new Date();
    await Attendance.create([
      { student: students[0]._id, course: courses[0]._id, date: today, status: 'PRESENT', notes: 'Đúng giờ', markedBy: admin._id },
      { student: students[1]._id, course: courses[0]._id, date: today, status: 'PRESENT', notes: 'Đúng giờ', markedBy: admin._id },
      { student: students[2]._id, course: courses[0]._id, date: today, status: 'LATE', notes: 'Muộn 10 phút', markedBy: admin._id },
      { student: students[4]._id, course: courses[0]._id, date: today, status: 'PRESENT', notes: 'Đúng giờ', markedBy: admin._id },
      { student: students[0]._id, course: courses[1]._id, date: today, status: 'PRESENT', notes: 'Đúng giờ', markedBy: admin._id }
    ]);

    // 6. Tạo Thông báo (Notifications)
    await Notification.create([
      {
        recipient: admin._id,
        title: 'Hệ thống khởi chạy thành công',
        message: 'Hệ thống Quản lý Sinh viên đã sẵn sàng phục vụ kiểm thử và hoạt động.',
        type: 'SUCCESS'
      },
      {
        recipient: user._id,
        title: 'Chào mừng sinh viên mới',
        message: 'Bạn đã đăng ký tham gia các khóa học học kỳ 1 năm học 2026.',
        type: 'INFO'
      }
    ]);

    console.log('✅ Khởi tạo dữ liệu mẫu thành công!');
    console.log('🔑 Tài khoản quản trị mặc định: username = "admin", password = "admin123" (Role: ADMIN)');
    console.log('🔑 Tài khoản sinh viên mặc định: username = "user", password = "user123" (Role: USER)');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo dữ liệu mẫu:', err);
  }
}

module.exports = seedInitialData;
