# 📸 HƯỚNG DẪN CHỤP ẢNH CHO GITHUB

## 🎯 Mục đích
Tạo ảnh minh họa đẹp và chuyên nghiệp để đưa lên GitHub README, giúp người xem hiểu rõ dự án.

---

## 📋 DANH SÁCH ẢNH CẦN CHỤP

### 1️⃣ CẤU TRÚC DỰ ÁN (VS Code)

**Chụp gì:**
- Mở VS Code Explorer
- Expand tất cả các thư mục chính
- Hiển thị cấu trúc MVC rõ ràng

**Tên file:** `01-project-structure.png`

**Nội dung cần thấy:**
```
backend/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── validators/
├── utils/
├── uploads/
├── logs/
├── backups/
├── index.js
├── package.json
└── README.md
```

---

### 2️⃣ SERVER RUNNING (Terminal)

**Chụp gì:**
- Terminal khi chạy `npm start`
- Hiển thị các log thành công

**Tên file:** `02-server-running.png`

**Nội dung cần thấy:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📊 API Documentation: http://localhost:5000
💚 Health Check: http://localhost:5000/health
⚡ Performance Stats: http://localhost:5000/performance
```

---

### 3️⃣ MONGODB ATLAS DASHBOARD

**Chụp gì:**
- Truy cập MongoDB Atlas
- Vào Database → Browse Collections
- Hiển thị các collections

**Tên file:** `03-mongodb-collections.png`

**Nội dung cần thấy:**
- Collections: users, students, courses, grades, attendance, notifications
- Số lượng documents trong mỗi collection

---

### 4️⃣ POSTMAN - ĐĂNG NHẬP

**Chụp gì:**
- POST `/auth/login`
- Request body (JSON)
- Response thành công với token

**Tên file:** `04-postman-login.png`

**Request:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response cần thấy:**
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

### 5️⃣ POSTMAN - DANH SÁCH SINH VIÊN

**Chụp gì:**
- GET `/students?page=1&limit=10`
- Headers: Authorization Bearer token
- Response với pagination

**Tên file:** `05-postman-students-list.png`

**Response cần thấy:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "data": [...]
}
```

---

### 6️⃣ POSTMAN - TẠO SINH VIÊN

**Chụp gì:**
- POST `/students`
- Headers: Authorization Bearer token (ADMIN)
- Request body
- Response thành công

**Tên file:** `06-postman-create-student.png`

**Request:**
```json
{
  "name": "Nguyen Van A",
  "age": 20,
  "email": "nguyenvana@email.com",
  "phone": "0123456789"
}
```

---

### 7️⃣ POSTMAN - TẠO KHÓA HỌC

**Chụp gì:**
- POST `/courses`
- Headers: Authorization Bearer token (ADMIN)
- Request body
- Response thành công

**Tên file:** `07-postman-create-course.png`

**Request:**
```json
{
  "name": "Lập trình Web",
  "code": "WEB101",
  "credits": 3,
  "teacher": "Nguyễn Văn A"
}
```

---

### 8️⃣ POSTMAN - NHẬP ĐIỂM

**Chụp gì:**
- POST `/grades`
- Request body với điểm số
- Response với điểm TB và xếp loại tự động

**Tên file:** `08-postman-grades.png`

**Request:**
```json
{
  "studentId": "...",
  "courseId": "...",
  "midtermScore": 8.5,
  "finalScore": 9.0,
  "semester": "1",
  "year": 2024
}
```

**Response cần thấy:**
```json
{
  "averageScore": 8.8,
  "letterGrade": "A",
  "status": "PASS"
}
```

---

### 9️⃣ POSTMAN - ĐIỂM DANH

**Chụp gì:**
- POST `/attendance`
- Request body
- Response thành công

**Tên file:** `09-postman-attendance.png`

**Request:**
```json
{
  "studentId": "...",
  "courseId": "...",
  "date": "2024-01-15",
  "status": "PRESENT"
}
```

---

### 🔟 POSTMAN - THỐNG KÊ DASHBOARD

**Chụp gì:**
- GET `/stats/dashboard`
- Headers: Authorization Bearer token (ADMIN)
- Response với thống kê đầy đủ

**Tên file:** `10-postman-dashboard.png`

**Response cần thấy:**
```json
{
  "overview": {
    "totalStudents": 150,
    "totalCourses": 20,
    "totalUsers": 25,
    "totalAdmins": 3
  },
  "ageDistribution": [...],
  "popularCourses": [...],
  "recentStudents": [...]
}
```

---

### 1️⃣1️⃣ POSTMAN - BẢNG ĐIỂM SINH VIÊN

**Chụp gì:**
- GET `/grades/transcript/:studentId`
- Response với GPA và danh sách điểm

**Tên file:** `11-postman-transcript.png`

**Response cần thấy:**
```json
{
  "totalCourses": 10,
  "passedCourses": 9,
  "failedCourses": 1,
  "totalCredits": 27,
  "gpa": 3.45,
  "grades": [...]
}
```

---

### 1️⃣2️⃣ POSTMAN - EXPORT CSV

**Chụp gì:**
- GET `/export/students/csv`
- Headers: Authorization Bearer token (ADMIN)
- Hiển thị file CSV đã download

**Tên file:** `12-postman-export-csv.png`

---

### 1️⃣3️⃣ POSTMAN - HEALTH CHECK

**Chụp gì:**
- GET `/health`
- Response với system info

**Tên file:** `13-postman-health-check.png`

**Response cần thấy:**
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "name": "student_db"
  },
  "system": {
    "platform": "win32",
    "cpus": 8,
    "totalMemory": "16.00 GB"
  }
}
```

---

### 1️⃣4️⃣ POSTMAN - PERFORMANCE STATS

**Chụp gì:**
- GET `/performance`
- Response với performance metrics

**Tên file:** `14-postman-performance.png`

**Response cần thấy:**
```json
{
  "overview": {
    "totalRequests": 1500,
    "avgResponseTime": "45.23ms",
    "slowRequestsCount": 5
  },
  "slowestEndpoints": [...]
}
```

---

### 1️⃣5️⃣ POSTMAN COLLECTION

**Chụp gì:**
- Sidebar Postman với tất cả các request đã tạo
- Hiển thị cấu trúc folders

**Tên file:** `15-postman-collection.png`

**Nội dung cần thấy:**
```
📁 Student Management API
  📁 Auth
    - Register
    - Login
  📁 Students
    - Get All
    - Create
    - Update
    - Delete
  📁 Courses
    - Get All
    - Create
    - Add Student
  📁 Grades
    - Create Grade
    - Get Transcript
  📁 Attendance
    - Mark Attendance
    - Get Stats
  📁 Statistics
    - Dashboard
    - Analytics
```

---

## 🎨 TIPS CHỤP ẢNH ĐẸP

### 1. Postman
- Zoom 100%
- Ẩn sidebar nếu cần (Ctrl + \\)
- Chọn theme sáng hoặc tối nhất quán
- Hiển thị cả Request và Response
- Highlight phần quan trọng

### 2. VS Code
- Sử dụng theme đẹp (One Dark Pro, Dracula)
- Font size vừa phải (14-16px)
- Ẩn minimap nếu cần
- Expand folders cần thiết

### 3. Terminal
- Sử dụng terminal có màu sắc
- Font size rõ ràng
- Chụp đủ các log quan trọng

### 4. MongoDB Atlas
- Zoom 100%
- Hiển thị rõ tên collections
- Có thể blur thông tin nhạy cảm

---

## 📁 TỔ CHỨC ẢNH

Tạo thư mục `screenshots/` trong dự án:

```
backend/
├── screenshots/
│   ├── 01-project-structure.png
│   ├── 02-server-running.png
│   ├── 03-mongodb-collections.png
│   ├── 04-postman-login.png
│   ├── 05-postman-students-list.png
│   ├── 06-postman-create-student.png
│   ├── 07-postman-create-course.png
│   ├── 08-postman-grades.png
│   ├── 09-postman-attendance.png
│   ├── 10-postman-dashboard.png
│   ├── 11-postman-transcript.png
│   ├── 12-postman-export-csv.png
│   ├── 13-postman-health-check.png
│   ├── 14-postman-performance.png
│   └── 15-postman-collection.png
```

---

## 📝 SỬ DỤNG TRONG README

Sau khi chụp xong, thêm vào README.md:

```markdown
## 📊 Screenshots

### API Documentation
![Postman Collection](./screenshots/15-postman-collection.png)

### Login Success
![Login](./screenshots/04-postman-login.png)

### Dashboard Statistics
![Dashboard](./screenshots/10-postman-dashboard.png)

### Student Management
![Students](./screenshots/05-postman-students-list.png)

### Grade Management
![Grades](./screenshots/08-postman-grades.png)
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Chụp 15 ảnh theo hướng dẫn
- [ ] Đặt tên file đúng format
- [ ] Tạo thư mục `screenshots/`
- [ ] Upload ảnh lên GitHub
- [ ] Thêm ảnh vào README.md
- [ ] Kiểm tra ảnh hiển thị đúng
- [ ] Push lên GitHub

---

**Chúc bạn có những bức ảnh đẹp cho dự án! 📸✨**
