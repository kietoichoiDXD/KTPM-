// Email service - có thể tích hợp với Nodemailer, SendGrid, etc.

// Giả lập gửi email (trong production thay bằng service thật)
exports.sendEmail = async (to, subject, content) => {
  console.log('📧 Sending email...');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:', content);
  
  // TODO: Tích hợp với email service thật
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({...});
  
  return { success: true, message: 'Email sent (simulated)' };
};

// Template email chào mừng
exports.sendWelcomeEmail = async (username, email) => {
  const subject = 'Chào mừng đến với hệ thống';
  const content = `
    Xin chào ${username},
    
    Chào mừng bạn đến với hệ thống quản lý sinh viên!
    
    Bạn có thể đăng nhập và sử dụng các tính năng của hệ thống.
    
    Trân trọng,
    Admin Team
  `;
  
  return await this.sendEmail(email, subject, content);
};

// Template email reset password
exports.sendResetPasswordEmail = async (email, resetToken) => {
  const subject = 'Yêu cầu đặt lại mật khẩu';
  const content = `
    Bạn đã yêu cầu đặt lại mật khẩu.
    
    Mã xác thực của bạn là: ${resetToken}
    
    Mã này có hiệu lực trong 15 phút.
    
    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
    
    Trân trọng,
    Admin Team
  `;
  
  return await this.sendEmail(email, subject, content);
};
