# 🎓 HỆ THỐNG QUẢN LÝ SINH VIÊN - BACKEND API

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![JWT](https://img.shields.io/badge/JWT-Auth-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Hệ thống Backend hoàn chỉnh cho quản lý sinh viên, khóa học, điểm số, điểm danh và nhiều tính năng nâng cao**

[Demo](#) • [Tài liệu API](./COMPLETE_API_DOCUMENTATION.md) • [Hướng dẫn Postman](./POSTMAN_GUIDE.md)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng-chính)
- [Tech Stack](#-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt](#-cài-đặt)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Tác giả](#-tác-giả)

---

## 🎯 Giới thiệu

Dự án Backend RESTful API hoàn chỉnh được xây dựng bằng Node.js + Express + MongoDB, phục vụ cho hệ thống quản lý sinh viên với đầy đủ các tính năng:

- 🔐 **Authentication & Authorization** - JWT, phân quyền USER/ADMIN
- 👨‍🎓 **Quản lý sinh viên** - CRUD, upload ảnh, soft delete
- 📚 **Quản lý khóa học** - CRUD, quản lý sinh viên trong khóa học
- 📝 **Quản lý điểm** - Nhập điểm, tự động tính GPA, xếp loại
- ✅ **Điểm danh** - Theo dõi tỷ lệ tham gia
- 🔔 **Thông báo** - Hệ thống notification
- 📊 **Thống kê & Analytics** - Dashboard, báo cáo, xu hướng
- 🔍 **Tìm kiếm nâng cao** - Search toàn cục, filter
- 📥 **Export dữ liệu** - CSV, JSON
- 💾 **Backup & Restore** - Sao lưu database
- 🏥 **Health Check** - Giám sát hệ thống

## ✨ Tính năng chính

### 🔐 Authentication & Security
- ✅ JWT Authentication
- ✅ Role-based Authorization (USER/ADMIN)
- ✅ Password hashing (bcrypt)
- ✅ Rate Limiting
- ✅ Security Headers
- ✅ Input Sanitization

### 👨‍🎓 Student Management
- ✅ CRUD sinh viên đầy đủ
- ✅ Upload ảnh đại diện (Multer)
- ✅ Soft Delete (có thể khôi phục)
- ✅ Phân trang, tìm kiếm, sắp xếp
- ✅ Validation dữ liệu

### 📚 Course Management
- ✅ CRUD khóa học
- ✅ Quản lý sinh viên trong khóa học
- ✅ Thêm/xóa sinh viên khỏi khóa học

### 📝 Grade Management
- ✅ Nhập điểm giữa kỳ / cuối kỳ
- ✅ Tự động tính điểm trung bình
- ✅ Xếp loại (A, B+, B, C+, C, D+, D, F)
- ✅ Xem bảng điểm (Transcript)
- ✅ Tính GPA tự động

### ✅ Attendance Tracking
- ✅ Điểm danh (Có mặt/Vắng/Muộn/Có phép)
- ✅ Thống kê tỷ lệ điểm danh
- ✅ Lọc theo sinh viên/khóa học/ngày

### 📊 Statistics & Analytics
- ✅ Dashboard tổng quan
- ✅ Thống kê sinh viên, khóa học
- ✅ Phân tích độ tuổi
- ✅ Xu hướng tăng trưởng
- ✅ Top khóa học phổ biến

### 🔍 Advanced Features
- ✅ Tìm kiếm toàn cục
- ✅ Export CSV/JSON
- ✅ Backup & Restore
- ✅ Notifications
- ✅ Performance Monitoring
- ✅ Request Logging
- ✅ Health Check

## 🧠 Tech Stack

**Backend:**
- Node.js 18.x
- Express.js 4.x
- MongoDB Atlas
- Mongoose ODM

**Authentication:**
- JWT (jsonwebtoken)
- bcryptjs

**File Upload:**
- Multer

**Validation:**
- express-validator

**Security:**
- helmet (security headers)
- cors
- rate-limiter

**Development:**
- nodemon
- dotenv

## 🗂 Cấu trúc thư mục
```
backend/
├── controllers/
│   ├── auth.controller.js
│   └── student.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── upload.middleware.js
│   └── error.middleware.js
├── models/
│   ├── user.model.js
│   └── student.model.js
├── routes/
│   ├── auth.routes.js
│   └── student.routes.js
├── validators/
│   └── auth.validator.js
├── uploads/
│   └── images/
├── .env
├── index.js
├── package.json
└── README.md
```

## ⚙️ Cài đặt

### 1. Clone project
```bash
git clone <repository-url>
cd backend
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình .env
Tạo file `.env` và cấu hình:
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student_db
JWT_SECRET=your_secret_key_here
```

### 4. Tạo MongoDB Atlas
1. Truy cập https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Tạo database user
4. Lấy connection string
5. Thay vào `MONGO_URI` trong file `.env`

### 5. Chạy server
```bash
npm start
# hoặc dùng nodemon để auto-reload
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 📋 API Endpoints

### Authentication
| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| POST | `/auth/register` | Đăng ký tài khoản | Public |
| POST | `/auth/login` | Đăng nhập | Public |

### Students
| Method | Endpoint | Mô tả | Quyền |
|--------|----------|-------|-------|
| GET | `/students` | Lấy danh sách | USER |
| GET | `/students/:id` | Lấy chi tiết | USER |
| POST | `/students` | Tạo mới | ADMIN |
| PUT | `/students/:id` | Cập nhật | ADMIN |
| DELETE | `/students/:id` | Xóa | ADMIN |

## 🔐 Authentication Flow

### 1. Đăng ký
```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "123456",
  "role": "ADMIN"
}
```

### 2. Đăng nhập
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

Response:
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### 3. Sử dụng token
Thêm vào header của các request:
```
Authorization: Bearer <token>
```

## 📂 CRUD Students

### Lấy danh sách (có phân trang, tìm kiếm)
```http
GET /students?page=1&limit=10&search=nguyen&sort=age&order=asc
Authorization: Bearer <token>
```

Response:
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "data": [...]
}
```

### Tạo sinh viên mới (với upload ảnh)
```http
POST /students
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: Nguyen Van A
age: 20
email: nguyenvana@email.com
phone: 0123456789
avatar: [file]
```

### Cập nhật sinh viên
```http
PUT /students/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: Nguyen Van B
age: 21
avatar: [file]
```

### Xóa sinh viên
```http
DELETE /students/:id
Authorization: Bearer <token>
```

## 🌍 Deploy lên Render

### 1. Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy trên Render
1. Truy cập https://render.com
2. Tạo Web Service mới
3. Connect GitHub repository
4. Cấu hình:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Thêm Environment Variables:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
6. Deploy!

## 🧪 Test với Postman

1. Import collection hoặc tạo requests thủ công
2. Test flow:
   - Đăng ký user
   - Đăng nhập → lấy token
   - Thêm token vào Authorization header
   - Test các API CRUD

## ✅ Checklist hoàn thành

- [x] REST API
- [x] MVC Pattern
- [x] MongoDB Atlas
- [x] JWT Authentication
- [x] Role Authorization (USER/ADMIN)
- [x] CRUD Operations
- [x] Upload File (Multer)
- [x] Pagination + Search + Sort
- [x] Validation
- [x] Error Handling
- [x] Sẵn sàng deploy

## 🚀 Mở rộng

Có thể kết hợp với:
- Frontend: React, Vue, Angular
- Mobile: React Native, Flutter
- Thêm tính năng: Email verification, Password reset, Refresh token

## 📝 Ghi chú

- Role mặc định khi đăng ký là `USER`
- Để tạo ADMIN, set `role: "ADMIN"` khi register
- File upload giới hạn 5MB
- Token hết hạn sau 7 ngày

## 👨‍💻 Tác giả

Dự án Backend hoàn chỉnh cho đồ án KTPM

---
**Chúc bạn thành công với dự án! 🎉**


---

## 📊 Screenshots

### 1. API Documentation (Postman)
> Chụp màn hình Postman với các request thành công

### 2. MongoDB Atlas Dashboard
> Chụp màn hình database trên MongoDB Atlas

### 3. Server Running
> Chụp màn hình terminal khi server chạy thành công

### 4. API Response Examples
> Chụp màn hình các response từ API

---

## 🎨 Hướng dẫn chụp ảnh cho GitHub

### Ảnh 1: Cấu trúc thư mục
```bash
# Chụp cấu trúc thư mục trong VS Code
```

### Ảnh 2: Postman - Đăng nhập thành công
```
POST /auth/login
Response: token + user info
```

### Ảnh 3: Postman - Lấy danh sách sinh viên
```
GET /students?page=1&limit=10
Response: paginated data
```

### Ảnh 4: Postman - Tạo sinh viên (ADMIN)
```
POST /students
Response: success message
```

### Ảnh 5: Postman - Thống kê Dashboard
```
GET /stats/dashboard
Response: overview statistics
```

### Ảnh 6: MongoDB Atlas - Collections
```
Hiển thị các collections: users, students, courses, grades, attendance
```

### Ảnh 7: Server Console
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Ảnh 8: Health Check
```
GET /health
Response: system info
```

---

## 📸 Checklist ảnh cần chụp

- [ ] Cấu trúc thư mục dự án (VS Code Explorer)
- [ ] Server running successfully (Terminal)
- [ ] MongoDB Atlas Dashboard
- [ ] Postman - Register/Login
- [ ] Postman - CRUD Students
- [ ] Postman - CRUD Courses
- [ ] Postman - Grade Management
- [ ] Postman - Attendance
- [ ] Postman - Statistics Dashboard
- [ ] Postman - Export CSV
- [ ] Health Check Response
- [ ] Performance Stats

---

## 🚀 Quick Start

```bash
# Clone repository
git clone <your-repo-url>
cd backend

# Install dependencies
npm install

# Setup .env file
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

# Run server
npm start
```

---

## 📝 License

MIT License - Dự án mã nguồn mở

---

## 👨‍💻 Tác giả

**Tên của bạn**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Node.js Community
- Express.js
- MongoDB
- Postman

---

<div align="center">

**⭐ Nếu thấy dự án hữu ích, hãy cho một star nhé! ⭐**

Made with ❤️ by [Your Name]

</div>
