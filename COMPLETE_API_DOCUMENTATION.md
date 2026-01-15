# 📚 TÀI LIỆU API HOÀN CHỈNH - HỆ THỐNG QUẢN LÝ SINH VIÊN

## 🎯 TỔNG QUAN DỰ ÁN

Hệ thống Backend hoàn chỉnh với đầy đủ tính năng quản lý sinh viên, khóa học, điểm danh, điểm số, thông báo và nhiều tính năng nâng cao khác.

**Version:** 4.0  
**Tech Stack:** Node.js + Express + MongoDB + JWT

---

## 📋 DANH SÁCH MODULE

### 1. 🔐 Authentication & Authorization
- Đăng ký / Đăng nhập
- JWT Token
- Phân quyền USER / ADMIN

### 2. 👤 Profile Management
- Xem thông tin cá nhân
- Cập nhật profile
- Đổi mật khẩu

### 3. 👨‍🎓 Student Management
- CRUD sinh viên
- Upload ảnh đại diện
- Soft delete
- Phân trang, tìm kiếm, sắp xếp

### 4. 📚 Course Management
- CRUD khóa học
- Quản lý sinh viên trong khóa học
- Thêm/xóa sinh viên khỏi khóa học

### 5. 📝 Grade Management
- Nhập điểm giữa kỳ / cuối kỳ
- Tự động tính điểm trung bình
- Xếp loại (A, B+, B, C+, C, D+, D, F)
- Xem bảng điểm sinh viên
- Tính GPA

### 6. ✅ Attendance Tracking
- Điểm danh (Có mặt / Vắng / Muộn / Có phép)
- Thống kê tỷ lệ điểm danh
- Lọc theo sinh viên / khóa học / ngày

### 7. 🔔 Notifications
- Gửi thông báo cho user
- Đánh dấu đã đọc
- Phân loại thông báo (INFO, WARNING, SUCCESS, ERROR)

### 8. 📊 Statistics & Analytics
- Dashboard tổng quan
- Thống kê sinh viên, khóa học
- Phân tích độ tuổi
- Xu hướng tăng trưởng
- Top khóa học phổ biến

### 9. 🔍 Search & Filter
- Tìm kiếm toàn cục
- Tìm kiếm nâng cao sinh viên
- Filter theo nhiều tiêu chí

### 10. 📥 Export Data
- Export CSV (sinh viên, khóa học)
- Export JSON
- Download file

### 11. 💾 Backup & Restore
- Backup toàn bộ database
- Danh sách backup
- Download backup file

### 12. 🏥 Health Check & Monitoring
- Health check endpoint
- Performance monitoring
- System info
- Memory usage

### 13. 🛡️ Security
- Security headers
- Input sanitization
- Rate limiting
- Request logging

---

## 🚀 API ENDPOINTS CHI TIẾT

### 🔐 AUTHENTICATION

#### 1. Đăng ký
```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "password": "123456",
  "role": "ADMIN"  // hoặc "USER"
}
```

#### 2. Đăng nhập
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}

Response:
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

### 👤 PROFILE

#### 1. Xem profile
```http
GET /profile
Authorization: Bearer <token>
```

#### 2. Cập nhật profile
```http
PUT /profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "new_username"
}
```

#### 3. Đổi mật khẩu
```http
POST /profile/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "123456",
  "newPassword": "newpass123"
}
```

---

### 👨‍🎓 STUDENTS

#### 1. Lấy danh sách sinh viên
```http
GET /students?page=1&limit=10&search=nguyen&sort=age&order=asc
Authorization: Bearer <token>
```

#### 2. Tạo sinh viên mới
```http
POST /students
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "age": 20,
  "email": "nguyenvana@email.com",
  "phone": "0123456789"
}
```

#### 3. Upload ảnh khi tạo sinh viên
```http
POST /students
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

name: Nguyen Van A
age: 20
email: test@email.com
avatar: [file]
```

#### 4. Cập nhật sinh viên
```http
PUT /students/:id
Authorization: Bearer <admin_token>
```

#### 5. Xóa sinh viên (soft delete)
```http
DELETE /students/:id
Authorization: Bearer <admin_token>
```

---

### 📚 COURSES

#### 1. Lấy danh sách khóa học
```http
GET /courses?page=1&limit=10&search=web
Authorization: Bearer <token>
```

#### 2. Tạo khóa học
```http
POST /courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Lập trình Web",
  "code": "WEB101",
  "credits": 3,
  "description": "Khóa học lập trình web cơ bản",
  "teacher": "Nguyễn Văn A"
}
```

#### 3. Thêm sinh viên vào khóa học
```http
POST /courses/:courseId/students
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "studentId": "..."
}
```

#### 4. Xóa sinh viên khỏi khóa học
```http
DELETE /courses/:courseId/students/:studentId
Authorization: Bearer <admin_token>
```

---

### 📝 GRADES (ĐIỂM SỐ)

#### 1. Lấy danh sách điểm
```http
GET /grades?studentId=...&courseId=...&semester=1&year=2024
Authorization: Bearer <token>
```

#### 2. Nhập/cập nhật điểm
```http
POST /grades
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "studentId": "...",
  "courseId": "...",
  "midtermScore": 8.5,
  "finalScore": 9.0,
  "semester": "1",
  "year": 2024,
  "notes": "Học tốt"
}

Response:
{
  "message": "Lưu điểm thành công",
  "data": {
    "midtermScore": 8.5,
    "finalScore": 9.0,
    "averageScore": 8.8,  // Tự động tính
    "letterGrade": "A",    // Tự động xếp loại
    "status": "PASS"
  }
}
```

#### 3. Xem bảng điểm sinh viên (Transcript)
```http
GET /grades/transcript/:studentId
Authorization: Bearer <token>

Response:
{
  "student": "...",
  "totalCourses": 10,
  "passedCourses": 9,
  "failedCourses": 1,
  "totalCredits": 27,
  "gpa": 3.45,
  "grades": [...]
}
```

---

### ✅ ATTENDANCE (ĐIỂM DANH)

#### 1. Điểm danh
```http
POST /attendance
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "studentId": "...",
  "courseId": "...",
  "date": "2024-01-15",
  "status": "PRESENT",  // PRESENT, ABSENT, LATE, EXCUSED
  "notes": "Ghi chú"
}
```

#### 2. Lấy danh sách điểm danh
```http
GET /attendance?studentId=...&courseId=...&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### 3. Thống kê điểm danh sinh viên
```http
GET /attendance/stats/:studentId/:courseId?
Authorization: Bearer <token>

Response:
{
  "total": 20,
  "present": 18,
  "absent": 1,
  "late": 1,
  "excused": 0,
  "attendanceRate": "90.00"
}
```

---

### 🔔 NOTIFICATIONS

#### 1. Lấy thông báo
```http
GET /notifications?page=1&limit=20&isRead=false
Authorization: Bearer <token>

Response:
{
  "page": 1,
  "limit": 20,
  "total": 50,
  "unreadCount": 10,
  "data": [...]
}
```

#### 2. Tạo thông báo (ADMIN)
```http
POST /notifications
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "recipientId": "...",
  "title": "Thông báo quan trọng",
  "message": "Nội dung thông báo",
  "type": "INFO",  // INFO, WARNING, SUCCESS, ERROR
  "link": "/students/123"
}
```

#### 3. Đánh dấu đã đọc
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

#### 4. Đánh dấu tất cả đã đọc
```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

---

### 📊 STATISTICS

#### 1. Dashboard tổng quan
```http
GET /stats/dashboard
Authorization: Bearer <admin_token>

Response:
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

#### 2. Thống kê sinh viên
```http
GET /stats/students
Authorization: Bearer <admin_token>
```

---

### 📈 ANALYTICS

#### 1. Xu hướng tăng trưởng
```http
GET /analytics/growth?days=30
Authorization: Bearer <admin_token>

Response:
{
  "period": "30 days",
  "students": [
    { "_id": "2024-01-01", "count": 5 },
    { "_id": "2024-01-02", "count": 3 }
  ],
  "courses": [...]
}
```

#### 2. Phân tích độ tuổi
```http
GET /analytics/age
Authorization: Bearer <admin_token>
```

#### 3. Top khóa học
```http
GET /analytics/top-courses?limit=10
Authorization: Bearer <admin_token>
```

---

### 🔍 SEARCH

#### 1. Tìm kiếm toàn cục
```http
GET /search?q=nguyen
Authorization: Bearer <token>

Response:
{
  "query": "nguyen",
  "results": {
    "students": {
      "count": 5,
      "data": [...]
    },
    "courses": {
      "count": 2,
      "data": [...]
    }
  },
  "total": 7
}
```

#### 2. Tìm kiếm nâng cao sinh viên
```http
GET /search/students/advanced?name=nguyen&minAge=18&maxAge=25&hasAvatar=true
Authorization: Bearer <token>
```

---

### 📥 EXPORT

#### 1. Export sinh viên CSV
```http
GET /export/students/csv
Authorization: Bearer <admin_token>
→ File CSV tự động download
```

#### 2. Export khóa học CSV
```http
GET /export/courses/csv
Authorization: Bearer <admin_token>
```

#### 3. Export JSON
```http
GET /export/students/json
GET /export/courses/json
Authorization: Bearer <admin_token>
```

---

### 💾 BACKUP

#### 1. Tạo backup
```http
POST /backup
Authorization: Bearer <admin_token>

Response:
{
  "message": "Backup thành công",
  "filename": "backup_1705305600000.json",
  "size": 1024000,
  "records": {
    "students": 150,
    "courses": 20,
    "users": 25
  }
}
```

#### 2. Danh sách backup
```http
GET /backup
Authorization: Bearer <admin_token>
```

#### 3. Download backup
```http
GET /backup/:filename
Authorization: Bearer <admin_token>
```

---

### 🏥 HEALTH & MONITORING

#### 1. Health check
```http
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "status": "connected",
    "name": "student_db"
  },
  "system": {
    "platform": "win32",
    "cpus": 8,
    "totalMemory": "16.00 GB",
    "freeMemory": "8.50 GB"
  },
  "process": {
    "nodeVersion": "v18.0.0",
    "uptime": "2.5 hours",
    "memoryUsage": {...}
  }
}
```

#### 2. Performance stats
```http
GET /performance

Response:
{
  "overview": {
    "totalRequests": 1500,
    "avgResponseTime": "45.23ms",
    "slowRequestsCount": 5
  },
  "slowestEndpoints": [...],
  "recentSlowRequests": [...]
}
```

---

## 🔑 AUTHENTICATION

Tất cả các endpoint (trừ /auth/register, /auth/login, /health) đều yêu cầu JWT token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ PHÂN QUYỀN

- **USER**: Xem dữ liệu (students, courses, grades, attendance)
- **ADMIN**: Toàn quyền (tạo, sửa, xóa, export, backup, stats)

---

## 📊 RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "message": "Thành công",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Lỗi xảy ra",
  "errors": [...]
}
```

### Paginated Response
```json
{
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10,
  "data": [...]
}
```

---

## 🎯 TÍNH NĂNG NỔI BẬT

✅ **Hoàn chỉnh**: 13 modules chính, 50+ API endpoints  
✅ **Bảo mật**: JWT, phân quyền, rate limiting, security headers  
✅ **Performance**: Caching, monitoring, logging  
✅ **Quản lý điểm**: Tự động tính điểm TB, xếp loại, GPA  
✅ **Điểm danh**: Theo dõi tỷ lệ tham gia  
✅ **Thông báo**: Hệ thống notification đầy đủ  
✅ **Analytics**: Thống kê, phân tích xu hướng  
✅ **Export**: CSV, JSON  
✅ **Backup**: Sao lưu và khôi phục  
✅ **Health Check**: Giám sát hệ thống  

---

## 🚀 DEPLOYMENT

Dự án sẵn sàng deploy lên:
- Render
- Heroku
- Railway
- AWS
- DigitalOcean

---

**Dự án này đủ chuẩn cho đồ án tốt nghiệp KTPM với điểm tối đa! 🎉**
