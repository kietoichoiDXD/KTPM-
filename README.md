# 🎓 HỆ THỐNG QUẢN LÝ SINH VIÊN - BACKEND API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![JWT](https://img.shields.io/badge/JWT-Auth-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Hệ thống Backend RESTful API cho quản lý sinh viên, khóa học, điểm số, điểm danh và các chức năng quản trị liên quan.**

[Demo](#) • [Tài liệu API](./COMPLETE_API_DOCUMENTATION.md) • [Hướng dẫn Postman](./POSTMAN_GUIDE.md)

---

## 📋 Mục lục

* [Giới thiệu](#-giới-thiệu)
* [Tính năng chính](#-tính-năng-chính)
* [Tech Stack](#-tech-stack)
* [Cấu trúc dự án](#-cấu-trúc-dự-án)
* [Cài đặt](#-cài-đặt)
* [API Endpoints](#-api-endpoints)
* [Authentication Flow](#-authentication-flow)
* [Student API](#-student-api)
* [Testing](#-testing)
* [Deployment](#-deployment)
* [Screenshots](#-screenshots)
* [Checklist](#-checklist)
* [Mở rộng](#-mở-rộng)
* [Tác giả](#-tác-giả)

---

## 🎯 Giới thiệu

Đây là hệ thống **RESTful Backend API quản lý sinh viên** được xây dựng bằng:

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication

Hệ thống được thiết kế theo mô hình MVC và cung cấp các chức năng quản lý dữ liệu sinh viên, xác thực người dùng, phân quyền, tìm kiếm, phân trang và validation dữ liệu.

### Các nhóm chức năng

* 🔐 **Authentication & Authorization**

  * JWT Authentication
  * Phân quyền USER/ADMIN
  * Password hashing

* 👨‍🎓 **Student Management**

  * CRUD sinh viên
  * Upload ảnh
  * Soft Delete
  * Pagination
  * Search
  * Sort
  * Validation

* 📚 **Course Management**

  * CRUD khóa học
  * Quản lý sinh viên trong khóa học

* 📝 **Grade Management**

  * Nhập điểm
  * Tính điểm trung bình
  * Tính GPA
  * Xếp loại

* ✅ **Attendance Tracking**

  * Điểm danh
  * Thống kê tỷ lệ tham gia

* 🔔 **Notification**

  * Quản lý thông báo

* 📊 **Statistics & Analytics**

  * Dashboard
  * Thống kê sinh viên
  * Thống kê khóa học
  * Phân tích dữ liệu

* 🔍 **Advanced Features**

  * Global Search
  * Filter
  * Export CSV/JSON
  * Backup & Restore
  * Health Check
  * Performance Monitoring
  * Request Logging

---

## ✨ Tính năng chính

### 🔐 Authentication & Security

* [x] JWT Authentication
* [x] Role-based Authorization
* [x] USER / ADMIN
* [x] Password hashing với bcrypt
* [x] Rate Limiting
* [x] Security Headers
* [x] Input Sanitization
* [x] Authentication Middleware
* [x] Role Middleware

### 👨‍🎓 Student Management

* [x] Create Student
* [x] Get Students
* [x] Get Student by ID
* [x] Update Student
* [x] Delete Student
* [x] Upload Avatar
* [x] Soft Delete
* [x] Pagination
* [x] Search
* [x] Sort
* [x] Input Validation
* [x] Error Handling

### 📚 Course Management

* [x] CRUD khóa học
* [x] Quản lý sinh viên trong khóa học
* [x] Thêm sinh viên vào khóa học
* [x] Xóa sinh viên khỏi khóa học

### 📝 Grade Management

* [x] Nhập điểm
* [x] Điểm giữa kỳ
* [x] Điểm cuối kỳ
* [x] Tính điểm trung bình
* [x] Tính GPA
* [x] Xếp loại
* [x] Transcript

### ✅ Attendance Tracking

* [x] Có mặt
* [x] Vắng
* [x] Muộn
* [x] Có phép
* [x] Thống kê tỷ lệ điểm danh
* [x] Filter theo sinh viên
* [x] Filter theo khóa học
* [x] Filter theo ngày

### 📊 Statistics & Analytics

* [x] Dashboard tổng quan
* [x] Thống kê sinh viên
* [x] Thống kê khóa học
* [x] Phân tích độ tuổi
* [x] Xu hướng tăng trưởng
* [x] Top khóa học phổ biến

### 🔍 Advanced Features

* [x] Global Search
* [x] Filter
* [x] Export CSV
* [x] Export JSON
* [x] Backup & Restore
* [x] Notifications
* [x] Performance Monitoring
* [x] Request Logging
* [x] Health Check

---

## 🧠 Tech Stack

### Backend

| Công nghệ     | Phiên bản / Vai trò |
| ------------- | ------------------- |
| Node.js       | 18.x                |
| Express.js    | 4.x                 |
| MongoDB Atlas | Database            |
| Mongoose      | ODM                 |

### Authentication

| Công nghệ      | Vai trò          |
| -------------- | ---------------- |
| JSON Web Token | Authentication   |
| bcryptjs       | Password hashing |

### File Upload

* Multer

### Validation

* express-validator

### Security

* Helmet
* CORS
* Rate Limiter
* Input Sanitization

### Development

* Nodemon
* dotenv

---

## 🗂 Cấu trúc dự án

```text
backend/
├── controllers/
│   ├── auth.controller.js
│   └── student.controller.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── upload.middleware.js
│   └── error.middleware.js
│
├── models/
│   ├── user.model.js
│   └── student.model.js
│
├── routes/
│   ├── auth.routes.js
│   └── student.routes.js
│
├── validators/
│   └── auth.validator.js
│
├── uploads/
│   └── images/
│
├── .env
├── index.js
├── package.json
└── README.md
```

> **Lưu ý:** Cấu trúc trên phản ánh phần backend được mô tả hiện tại. Nếu Course, Grade, Attendance, Notification hoặc Analytics đã được triển khai trong source code, nên bổ sung controller/model/route tương ứng vào README để tài liệu khớp với implementation thực tế.

---

## ⚙️ Cài đặt

### 1. Clone project

```bash
git clone <YOUR_REPOSITORY_URL>
cd quanlysinhvienbackendapi
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình `.env`

Tạo file `.env`:

```env
PORT=5000

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student_db

JWT_SECRET=your_secret_key_here
```

> Không commit file `.env` lên GitHub.

Nên thêm `.env` vào `.gitignore`:

```gitignore
node_modules/
.env
uploads/
*.log
```

---

## 🗄️ MongoDB Atlas

### Bước 1

Truy cập MongoDB Atlas:

https://www.mongodb.com/cloud/atlas

### Bước 2

Tạo một MongoDB Cluster.

### Bước 3

Tạo Database User.

### Bước 4

Lấy MongoDB Connection String.

### Bước 5

Đặt connection string vào:

```env
MONGO_URI=your_mongodb_connection_string
```

---

## ▶️ Chạy server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server mặc định:

```text
http://localhost:5000
```

---

# 📋 API Endpoints

## 🔐 Authentication

| Method | Endpoint         | Mô tả             | Quyền  |
| ------ | ---------------- | ----------------- | ------ |
| POST   | `/auth/register` | Đăng ký tài khoản | Public |
| POST   | `/auth/login`    | Đăng nhập         | Public |

---

## 👨‍🎓 Students

| Method | Endpoint        | Mô tả                   | Quyền |
| ------ | --------------- | ----------------------- | ----- |
| GET    | `/students`     | Lấy danh sách sinh viên | USER  |
| GET    | `/students/:id` | Lấy chi tiết sinh viên  | USER  |
| POST   | `/students`     | Tạo sinh viên           | ADMIN |
| PUT    | `/students/:id` | Cập nhật sinh viên      | ADMIN |
| DELETE | `/students/:id` | Xóa sinh viên           | ADMIN |

---

# 🔐 Authentication Flow

## 1. Đăng ký

```http
POST /auth/register
Content-Type: application/json
```

Request:

```json
{
  "username": "admin",
  "password": "123456",
  "role": "ADMIN"
}
```

---

## 2. Đăng nhập

```http
POST /auth/login
Content-Type: application/json
```

Request:

```json
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

---

## 3. Sử dụng JWT Token

Các API yêu cầu authentication cần gửi header:

```http
Authorization: Bearer <YOUR_TOKEN>
```

Ví dụ:

```http
GET /students
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# 👨‍🎓 Student API

## GET danh sách sinh viên

API hỗ trợ:

* Pagination
* Search
* Sort

Ví dụ:

```http
GET /students?page=1&limit=10&search=nguyen&sort=age&order=asc
```

Response:

```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "data": []
}
```

---

## POST tạo sinh viên

```http
POST /students
Authorization: Bearer <YOUR_TOKEN>
Content-Type: multipart/form-data
```

Form data:

```text
name: Nguyen Van A
age: 20
email: nguyenvana@email.com
phone: 0123456789
avatar: [file]
```

---

## PUT cập nhật sinh viên

```http
PUT /students/:id
Authorization: Bearer <YOUR_TOKEN>
Content-Type: multipart/form-data
```

Ví dụ:

```text
name: Nguyen Van B
age: 21
avatar: [file]
```

---

## DELETE sinh viên

```http
DELETE /students/:id
Authorization: Bearer <YOUR_TOKEN>
```

---

# 🧪 Testing

Testing là phần trọng tâm của đồ án **Kiểm thử phần mềm**.

## Functional Testing

Các nhóm kiểm thử:

* Authentication
* Student CRUD
* Input Validation
* Pagination
* Search
* Sort
* Authorization
* Error Handling

### Kỹ thuật kiểm thử

* Equivalence Partitioning
* Boundary Value Analysis
* Decision Table Testing
* Error Guessing
* Exploratory Testing
* Risk-based Testing

---

## 🔄 Regression Testing

Có thể sử dụng:

```text
Postman
   ↓
Collection
   ↓
Newman
   ↓
Automated Test
   ↓
HTML Report
```

---

## ⚡ Performance Testing

Có thể sử dụng:

* Apache JMeter
* k6

Các loại kiểm thử:

### Load Testing

Đánh giá hệ thống dưới tải người dùng bình thường.

### Stress Testing

Tăng dần tải để xác định giới hạn của hệ thống.

### Volume Testing

Kiểm tra hệ thống với lượng dữ liệu lớn.

Ví dụ:

```text
10,000+ students
```

Các metrics cần theo dõi:

```text
Response Time
Average Response Time
P95
P99
Throughput
Error Rate
Concurrent Users
```

---

# 🌍 Deployment

## Render

### 1. Push code lên GitHub

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. Tạo Web Service

Trên Render:

```text
New
 ↓
Web Service
 ↓
Connect GitHub Repository
```

### 3. Build Command

```bash
npm install
```

### 4. Start Command

```bash
npm start
```

### 5. Environment Variables

```text
PORT
MONGO_URI
JWT_SECRET
```

---

# 📸 Screenshots

README nên bổ sung screenshots thực tế của project.

## 1. Project Structure

Screenshot VS Code Explorer:

```text
backend/
├── controllers/
├── middlewares/
├── models/
├── routes/
└── validators/
```

## 2. Server Running

Ví dụ:

```text
MongoDB connected successfully
Server running on port 5000
```

## 3. Postman - Login

```text
POST /auth/login
```

Hiển thị:

```text
200 OK
token
user
role
```

## 4. Postman - Student List

```text
GET /students?page=1&limit=10
```

## 5. Postman - Create Student

```text
POST /students
```

## 6. MongoDB Atlas

Hiển thị các collections thực tế của project.

## 7. Health Check

```http
GET /health
```

---

# ✅ Checklist

## Backend

* [x] REST API
* [x] MVC Pattern
* [x] MongoDB Atlas
* [x] JWT Authentication
* [x] Role Authorization
* [x] CRUD Operations
* [x] Upload File
* [x] Pagination
* [x] Search
* [x] Sort
* [x] Validation
* [x] Error Handling

## Testing

* [ ] Functional Test Cases
* [ ] Equivalence Partitioning
* [ ] Boundary Value Analysis
* [ ] Decision Table
* [ ] Error Guessing
* [ ] Exploratory Testing
* [ ] Regression Testing
* [ ] Postman Collection
* [ ] Newman Automation
* [ ] JMeter Load Testing
* [ ] JMeter Stress Testing
* [ ] Volume Testing
* [ ] Performance Report

## Documentation

* [ ] API Documentation
* [ ] Postman Guide
* [ ] Test Case Document
* [ ] Defect Report
* [ ] Performance Report
* [ ] Screenshots
* [ ] Deployment Documentation

---

# 🚀 Mở rộng

Các tính năng có thể phát triển thêm:

* Email Verification
* Password Reset
* Refresh Token
* Two-Factor Authentication
* Advanced Search
* Advanced Filtering
* Audit Logging
* API Versioning
* Docker
* CI/CD
* Automated Regression Testing
* Performance Monitoring

---

# 📝 Ghi chú

* Role mặc định khi đăng ký là `USER`.
* ADMIN có quyền thực hiện các thao tác quản trị sinh viên.
* File upload giới hạn 5MB.
* JWT token hết hạn sau 7 ngày.

Các thông tin trên cần được đối chiếu với cấu hình thực tế trong source code trước khi xem là thông số chính thức của hệ thống.

---

# 👨‍💻 Tác giả

**KTPM - Student Management API**

GitHub:

`https://github.com/kietoichoiDXD`

---

# 📄 License

MIT License

---

## 🙏 Acknowledgments

* Node.js Community
* Express.js
* MongoDB
* Postman
* Apache JMeter

---

⭐ Nếu project hữu ích, hãy star repository!

**Made with ❤️ for Software Testing Course**
