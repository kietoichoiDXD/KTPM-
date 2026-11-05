# Hệ thống Quản lý Sinh viên – Backend API

## 1. Tổng quan dự án

Đây là hệ thống Backend REST API phục vụ quản lý sinh viên, khóa học, điểm số, điểm danh và các dữ liệu liên quan trong môi trường đào tạo.

Project được xây dựng theo mô hình phân lớp gần với MVC, trong đó:

- `routes` tiếp nhận và định tuyến request.
- `controllers` xử lý nghiệp vụ.
- `models` định nghĩa schema và tương tác với MongoDB thông qua Mongoose.
- `middlewares` xử lý xác thực, phân quyền, bảo mật, giới hạn request, logging và hiệu năng.
- `validators` kiểm tra dữ liệu đầu vào.
- `utils` chứa các hàm dùng chung và service hỗ trợ.

Hiện tại project là **Backend API**. Project chưa bao gồm Frontend, giao diện người dùng hoặc bộ thiết kế UI/UX.

## 2. Mục tiêu hệ thống

- Quản lý hồ sơ sinh viên.
- Quản lý khóa học và sinh viên tham gia khóa học.
- Quản lý điểm số và bảng điểm.
- Theo dõi tình trạng điểm danh.
- Quản lý thông báo cho người dùng.
- Cung cấp thống kê và phân tích dữ liệu.
- Hỗ trợ tìm kiếm, lọc và phân trang.
- Xuất dữ liệu CSV/JSON.
- Sao lưu dữ liệu.
- Cung cấp health check và theo dõi hiệu năng API.
- Bảo vệ API bằng xác thực, phân quyền và các middleware bảo mật.

## 3. Công nghệ sử dụng

### Backend

- Node.js 18.x theo tài liệu dự án.
- Express.js.
- MongoDB Atlas.
- Mongoose ODM.

### Xác thực và bảo mật

- JSON Web Token (JWT).
- `bcryptjs` để mã hóa mật khẩu.
- CORS.
- Security headers.
- Input sanitization.
- Rate limiting.

### Xử lý dữ liệu và tệp

- `express-validator` để kiểm tra dữ liệu đầu vào.
- `multer` để upload ảnh đại diện.
- Export dữ liệu CSV/JSON.
- Backup dữ liệu dạng file.

## 4. Cấu trúc thư mục

```text
quanlysinhvienbackendapi/
├── controllers/
│   ├── analytics.controller.js
│   ├── attendance.controller.js
│   ├── auth.controller.js
│   ├── backup.controller.js
│   ├── course.controller.js
│   ├── export.controller.js
│   ├── grade.controller.js
│   ├── health.controller.js
│   ├── notification.controller.js
│   ├── profile.controller.js
│   ├── search.controller.js
│   ├── stats.controller.js
│   └── student.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── cache.middleware.js
│   ├── error.middleware.js
│   ├── logger.middleware.js
│   ├── performance.middleware.js
│   ├── rateLimiter.middleware.js
│   ├── role.middleware.js
│   ├── security.middleware.js
│   └── upload.middleware.js
├── models/
│   ├── attendance.model.js
│   ├── course.model.js
│   ├── grade.model.js
│   ├── notification.model.js
│   ├── student.model.js
│   └── user.model.js
├── routes/
│   ├── analytics.routes.js
│   ├── attendance.routes.js
│   ├── auth.routes.js
│   ├── backup.routes.js
│   ├── course.routes.js
│   ├── export.routes.js
│   ├── grade.routes.js
│   ├── health.routes.js
│   ├── notification.routes.js
│   ├── profile.routes.js
│   ├── search.routes.js
│   ├── stats.routes.js
│   └── student.routes.js
├── utils/
│   ├── emailService.js
│   └── responseHelper.js
├── validators/
│   ├── auth.validator.js
│   ├── course.validator.js
│   └── student.validator.js
├── index.js
├── package.json
├── API_FEATURES.md
├── COMPLETE_API_DOCUMENTATION.md
├── POSTMAN_GUIDE.md
└── README.md
```

## 5. Kiến trúc xử lý request

```text
Client/Postman
      │
      ▼
Express Server
      │
      ├── CORS
      ├── Security headers
      ├── Input sanitization
      ├── Logger
      ├── Performance monitor
      ├── Rate limiter
      ├── JWT authentication
      ├── Role authorization
      ├── Validator
      ▼
Routes → Controllers → Models → MongoDB
      │
      ▼
JSON response / file download
```

## 6. Các module chức năng

### 6.1. Authentication và Authorization

Prefix: `/auth`

Chức năng:

- Đăng ký tài khoản.
- Đăng nhập.
- Sinh JWT token.
- Phân quyền giữa `USER` và `ADMIN`.
- Băm mật khẩu bằng `bcryptjs`.

Endpoint chính:

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/auth/register` | Public | Đăng ký tài khoản |
| POST | `/auth/login` | Public | Đăng nhập và nhận token |

Các endpoint bảo vệ sử dụng header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### 6.2. Quản lý profile

Prefix: `/profile`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/profile` | Xem thông tin người dùng hiện tại |
| PUT | `/profile` | Cập nhật profile |
| POST | `/profile/change-password` | Đổi mật khẩu |

### 6.3. Quản lý sinh viên

Prefix: `/students`

Chức năng:

- Thêm, xem, sửa và xóa sinh viên.
- Lấy danh sách có phân trang.
- Tìm kiếm và sắp xếp.
- Upload ảnh đại diện.
- Kiểm tra dữ liệu tên, tuổi, email và số điện thoại.
- Hỗ trợ cơ chế xóa mềm theo thiết kế tài liệu dự án.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/students` | USER/ADMIN | Lấy danh sách sinh viên |
| GET | `/students/:id` | USER/ADMIN | Xem chi tiết sinh viên |
| POST | `/students` | ADMIN | Tạo sinh viên |
| PUT | `/students/:id` | ADMIN | Cập nhật sinh viên |
| DELETE | `/students/:id` | ADMIN | Xóa sinh viên |

Ví dụ truy vấn danh sách:

```http
GET /students?page=1&limit=10&search=nguyen&sort=age&order=asc
```

### 6.4. Quản lý khóa học

Prefix: `/courses`

Chức năng:

- CRUD khóa học.
- Quản lý mã khóa học.
- Quản lý số tín chỉ, giảng viên và mô tả.
- Thêm sinh viên vào khóa học.
- Xóa sinh viên khỏi khóa học.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/courses` | USER/ADMIN | Lấy danh sách khóa học |
| GET | `/courses/:id` | USER/ADMIN | Xem chi tiết khóa học |
| POST | `/courses` | ADMIN | Tạo khóa học |
| PUT | `/courses/:id` | ADMIN | Cập nhật khóa học |
| DELETE | `/courses/:id` | ADMIN | Xóa khóa học |
| POST | `/courses/:id/students` | ADMIN | Thêm sinh viên vào khóa học |
| DELETE | `/courses/:id/students/:studentId` | ADMIN | Xóa sinh viên khỏi khóa học |

### 6.5. Quản lý điểm

Prefix: `/grades`

Chức năng:

- Lấy danh sách điểm theo sinh viên, khóa học, học kỳ và năm học.
- Nhập hoặc cập nhật điểm giữa kỳ và cuối kỳ.
- Tự động tính điểm trung bình.
- Xếp loại chữ.
- Xác định trạng thái đạt hoặc không đạt.
- Xem bảng điểm và GPA.
- Xóa bản ghi điểm.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| GET | `/grades` | USER/ADMIN | Lấy danh sách điểm |
| POST | `/grades` | ADMIN | Tạo hoặc cập nhật điểm |
| GET | `/grades/transcript/:studentId` | USER/ADMIN | Xem bảng điểm |
| DELETE | `/grades/:id` | ADMIN | Xóa điểm |

### 6.6. Điểm danh

Prefix: `/attendance`

Các trạng thái điểm danh được tài liệu dự án mô tả gồm:

- `PRESENT`: Có mặt.
- `ABSENT`: Vắng.
- `LATE`: Đi muộn.
- `EXCUSED`: Có phép.

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/attendance` | ADMIN | Ghi nhận điểm danh |
| GET | `/attendance` | USER/ADMIN | Lấy danh sách điểm danh |
| GET | `/attendance/stats/:studentId/:courseId` | USER/ADMIN | Thống kê theo sinh viên và khóa học |
| GET | `/attendance/stats/:studentId` | USER/ADMIN | Thống kê theo sinh viên |
| DELETE | `/attendance/:id` | ADMIN | Xóa bản ghi điểm danh |

### 6.7. Thông báo

Prefix: `/notifications`

Chức năng:

- Lấy thông báo của người dùng.
- Tạo thông báo.
- Đánh dấu một thông báo đã đọc.
- Đánh dấu toàn bộ thông báo đã đọc.
- Xóa thông báo.

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/notifications` | Lấy danh sách thông báo |
| POST | `/notifications` | Tạo thông báo |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc |
| PUT | `/notifications/read-all` | Đánh dấu tất cả đã đọc |
| DELETE | `/notifications/:id` | Xóa thông báo |

### 6.8. Thống kê và analytics

Prefixes: `/stats`, `/analytics`

Các nhóm dữ liệu được hỗ trợ:

- Dashboard tổng quan.
- Tổng số sinh viên, khóa học và tài khoản.
- Phân tích độ tuổi.
- Xu hướng tăng trưởng.
- Top khóa học.
- Danh sách sinh viên mới.

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/stats/dashboard` | Thống kê tổng quan |
| GET | `/stats/students` | Thống kê sinh viên |
| GET | `/analytics/growth` | Xu hướng tăng trưởng |
| GET | `/analytics/age` | Phân tích độ tuổi |
| GET | `/analytics/top-courses` | Top khóa học |

### 6.9. Tìm kiếm

Prefix: `/search`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/search` | Tìm kiếm toàn cục |
| GET | `/search/students/advanced` | Tìm kiếm nâng cao sinh viên |

Tìm kiếm nâng cao có thể lọc theo các tiêu chí như tên, độ tuổi và trạng thái ảnh đại diện.

### 6.10. Export dữ liệu

Prefix: `/export`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/export/students/csv` | Xuất sinh viên dạng CSV |
| GET | `/export/courses/csv` | Xuất khóa học dạng CSV |
| GET | `/export/:type/json` | Xuất dữ liệu dạng JSON |

### 6.11. Backup và restore

Prefix: `/backup`

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/backup` | Tạo bản backup |
| GET | `/backup` | Lấy danh sách backup |
| GET | `/backup/:filename` | Tải file backup |

### 6.12. Health check và monitoring

Prefix: `/health`

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/health` | Kiểm tra trạng thái hệ thống và database |
| GET | `/health/ping` | Kiểm tra server còn hoạt động |

Project cũng có middleware theo dõi hiệu năng request, thời gian phản hồi và các request chậm.

## 7. Middleware

### Authentication middleware

Đọc JWT từ request, xác thực token và gắn thông tin người dùng vào request.

### Role middleware

Kiểm tra quyền truy cập, chủ yếu phân biệt `USER` và `ADMIN`.

### Security middleware

- Bổ sung security headers.
- Làm sạch input.
- Hạn chế dữ liệu đầu vào có nguy cơ gây lỗi hoặc tấn công.

### Rate limiter

Theo tài liệu cấu hình hiện tại, hệ thống giới hạn mặc định khoảng 100 request trong 15 phút cho một phạm vi request.

### Logger middleware

Theo dõi thông tin request như method, URL, IP, user, status code và thời gian xử lý.

### Performance middleware

Theo dõi số lượng request, thời gian phản hồi và các request có thời gian xử lý cao.

### Upload middleware

Xử lý upload ảnh đại diện cho sinh viên thông qua Multer.

### Error middleware

Tập trung xử lý lỗi và trả response lỗi thống nhất cho client.

## 8. Response format

Response thành công tiêu chuẩn:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {}
}
```

Response lỗi:

```json
{
  "success": false,
  "message": "Lỗi xảy ra",
  "errors": []
}
```

Response phân trang:

```json
{
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10,
  "data": []
}
```

## 9. Cài đặt và chạy project

### Yêu cầu

- Node.js.
- MongoDB hoặc MongoDB Atlas.
- npm.

### Cài đặt dependency

```bash
npm install
```

### Cấu hình biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student_db
JWT_SECRET=your_secret_key
```

Không đưa file `.env` chứa thông tin thật lên Git.

### Chạy môi trường development

```bash
npm run dev
```

### Chạy production/local thông thường

```bash
npm start
```

Server mặc định theo tài liệu có thể chạy tại:

```text
http://localhost:5000
```

## 10. Quy trình sử dụng API cơ bản

```text
Đăng ký tài khoản
        ↓
Đăng nhập
        ↓
Nhận JWT token
        ↓
Gửi token trong Authorization header
        ↓
Gọi API xem dữ liệu
        ↓
Tài khoản ADMIN thực hiện thao tác tạo/sửa/xóa
```

Ví dụ đăng nhập:

```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}
```

Sau khi nhận token:

```http
GET /students
Authorization: Bearer <token>
```

## 11. Kiểm thử và tài liệu liên quan

Project hiện có các tài liệu hỗ trợ:

- `README.md`: giới thiệu, cài đặt và hướng dẫn nhanh.
- `API_FEATURES.md`: các tính năng mở rộng.
- `COMPLETE_API_DOCUMENTATION.md`: danh sách API chi tiết.
- `POSTMAN_GUIDE.md`: hướng dẫn kiểm thử API bằng Postman.
- `SCREENSHOT_GUIDE.md`: hướng dẫn chuẩn bị ảnh minh họa dự án.

Các nhóm kiểm thử nên thực hiện:

- Kiểm thử đăng ký và đăng nhập.
- Kiểm thử JWT và phân quyền.
- Kiểm thử CRUD sinh viên và khóa học.
- Kiểm thử validation dữ liệu.
- Kiểm thử phân trang, tìm kiếm và lọc.
- Kiểm thử upload ảnh.
- Kiểm thử điểm số và điểm danh.
- Kiểm thử export và backup.
- Kiểm thử health check.
- Kiểm thử giới hạn request và xử lý lỗi.

## 12. Phạm vi UI/UX và Frontend

Project hiện **chưa có Frontend/UI/UX**.

Chưa tìm thấy:

- Ứng dụng React, Vue, Angular hoặc Next.js.
- Thư mục `src`, `components`, `pages`, `views` hoặc `public` dành cho frontend.
- File HTML, CSS, JSX, TSX, Vue hoặc Svelte.
- Design system, wireframe hoặc mã giao diện.

Frontend có thể được phát triển sau dựa trên các nhóm chức năng API hiện có:

- Trang đăng nhập và đăng ký.
- Dashboard quản trị.
- Danh sách và form sinh viên.
- Danh sách khóa học.
- Quản lý điểm và điểm danh.
- Trung tâm thông báo.
- Báo cáo, thống kê và biểu đồ.
- Quản lý backup và export.

## 13. Điểm mạnh hiện tại

- Có nhiều module nghiệp vụ hơn một API CRUD cơ bản.
- Có xác thực JWT và phân quyền.
- Có validation dữ liệu.
- Có các middleware bảo mật và theo dõi request.
- Có phân trang, tìm kiếm, export và backup.
- Có tài liệu API và hướng dẫn Postman.
- Cấu trúc thư mục tách biệt theo trách nhiệm.

## 14. Các điểm cần hoàn thiện

- Bổ sung Frontend và UI/UX.
- Bổ sung test tự động thực tế nếu chưa có test collection/script hoàn chỉnh.
- Đồng bộ nội dung README với toàn bộ endpoint đang có.
- Kiểm tra và chuẩn hóa response format giữa các controller.
- Bổ sung file `.env.example`.
- Bổ sung xử lý cấu hình môi trường cho development và production.
- Kiểm tra ràng buộc unique ở tầng database cho các trường định danh sinh viên.
- Bổ sung index cho các trường thường xuyên tìm kiếm.
- Kiểm tra giới hạn và loại file upload.
- Bổ sung tài liệu triển khai chi tiết.
- Bổ sung logging bền vững và cơ chế quản lý file log nếu triển khai thực tế.

## 15. Hướng phát triển đề xuất

### Giai đoạn 1: Hoàn thiện backend

- Rà soát toàn bộ API.
- Chuẩn hóa lỗi và response.
- Bổ sung test case tự động.
- Bổ sung Swagger/OpenAPI.
- Bổ sung `.env.example` và hướng dẫn triển khai.

### Giai đoạn 2: Xây dựng UI/UX

- Xác định vai trò người dùng.
- Vẽ user flow và wireframe.
- Thiết kế dashboard, bảng dữ liệu, form và trạng thái lỗi.
- Xây dựng design system màu sắc, typography và component.

### Giai đoạn 3: Xây dựng Frontend

- Tạo ứng dụng React/Vue.
- Tích hợp JWT.
- Tạo route bảo vệ theo vai trò.
- Tích hợp các API chính.
- Thêm loading, empty state, validation và thông báo lỗi.

### Giai đoạn 4: Kiểm thử và triển khai

- Kiểm thử tích hợp Frontend–Backend.
- Kiểm thử responsive.
- Kiểm thử hiệu năng.
- Đóng gói và triển khai backend/frontend.
- Thiết lập biến môi trường và monitoring.

## 16. Kết luận

Project hiện là một Backend REST API tương đối đầy đủ cho hệ thống quản lý sinh viên. Backend đã có nền tảng cho xác thực, quản lý dữ liệu, thống kê, tìm kiếm, export, backup và monitoring.

Để trở thành một sản phẩm hoàn chỉnh cho người dùng cuối, project cần bổ sung Frontend và UI/UX, sau đó thực hiện kiểm thử tích hợp giữa giao diện và các API hiện có.
