# 🧪 HƯỚNG DẪN TEST API VỚI POSTMAN

## 📥 Bước 1: Cài đặt Postman
- Tải tại: https://www.postman.com/downloads/
- Hoặc dùng Postman Web: https://web.postman.com/

## 🚀 Bước 2: Test từng API

### ✅ 1. ĐĂNG KÝ TÀI KHOẢN ADMIN

**Request:**
```
Method: POST
URL: http://localhost:5000/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body (chọn raw → JSON):**
```json
{
  "username": "admin",
  "password": "123456",
  "role": "ADMIN"
}
```

**Response thành công:**
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

---

### ✅ 2. ĐĂNG KÝ TÀI KHOẢN USER

**Request:**
```
Method: POST
URL: http://localhost:5000/auth/register
```

**Body:**
```json
{
  "username": "user1",
  "password": "123456",
  "role": "USER"
}
```

---

### ✅ 3. ĐĂNG NHẬP (LẤY TOKEN)

**Request:**
```
Method: POST
URL: http://localhost:5000/auth/login
```

**Body:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response:**
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

**⚠️ QUAN TRỌNG: Copy token này để dùng cho các request tiếp theo!**

---

### ✅ 4. TẠO SINH VIÊN MỚI (CHỈ ADMIN)

**Request:**
```
Method: POST
URL: http://localhost:5000/students
```

**Headers:**
```
Authorization: Bearer <paste_token_ở_đây>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nguyen Van A",
  "age": 20,
  "email": "nguyenvana@email.com",
  "phone": "0123456789"
}
```

**Response:**
```json
{
  "message": "Tạo sinh viên thành công",
  "data": {
    "_id": "...",
    "name": "Nguyen Van A",
    "age": 20,
    "email": "nguyenvana@email.com",
    "phone": "0123456789",
    "avatar": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### ✅ 5. LẤY DANH SÁCH SINH VIÊN (USER CÓ THỂ XEM)

**Request:**
```
Method: GET
URL: http://localhost:5000/students
```

**Headers:**
```
Authorization: Bearer <paste_token_ở_đây>
```

**Hoặc với phân trang + tìm kiếm:**
```
URL: http://localhost:5000/students?page=1&limit=10&search=nguyen&sort=age&order=asc
```

**Response:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 5,
  "totalPages": 1,
  "data": [
    {
      "_id": "...",
      "name": "Nguyen Van A",
      "age": 20,
      ...
    }
  ]
}
```

---

### ✅ 6. LẤY CHI TIẾT SINH VIÊN

**Request:**
```
Method: GET
URL: http://localhost:5000/students/<student_id>
```

**Headers:**
```
Authorization: Bearer <token>
```

---

### ✅ 7. CẬP NHẬT SINH VIÊN (CHỈ ADMIN)

**Request:**
```
Method: PUT
URL: http://localhost:5000/students/<student_id>
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nguyen Van B",
  "age": 21,
  "email": "nguyenvanb@email.com",
  "phone": "0987654321"
}
```

---

### ✅ 8. XÓA SINH VIÊN (CHỈ ADMIN)

**Request:**
```
Method: DELETE
URL: http://localhost:5000/students/<student_id>
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Xóa sinh viên thành công"
}
```

---

### ✅ 9. UPLOAD ẢNH KHI TẠO/CẬP NHẬT SINH VIÊN

**Request:**
```
Method: POST
URL: http://localhost:5000/students
```

**Headers:**
```
Authorization: Bearer <token>
```

**Body (chọn form-data):**
```
name: Nguyen Van C
age: 22
email: nguyenvanc@email.com
phone: 0111222333
avatar: [chọn file ảnh]
```

---

## 🎯 FLOW TEST CHUẨN

### Bước 1: Đăng ký Admin
```
POST /auth/register
Body: { "username": "admin", "password": "123456", "role": "ADMIN" }
```

### Bước 2: Đăng nhập Admin
```
POST /auth/login
Body: { "username": "admin", "password": "123456" }
→ Copy token
```

### Bước 3: Tạo sinh viên (dùng token Admin)
```
POST /students
Headers: Authorization: Bearer <token>
Body: { "name": "Nguyen Van A", "age": 20, ... }
```

### Bước 4: Xem danh sách
```
GET /students
Headers: Authorization: Bearer <token>
```

### Bước 5: Đăng ký User
```
POST /auth/register
Body: { "username": "user1", "password": "123456", "role": "USER" }
```

### Bước 6: Đăng nhập User
```
POST /auth/login
Body: { "username": "user1", "password": "123456" }
→ Copy token User
```

### Bước 7: Thử xóa sinh viên bằng token User (sẽ bị từ chối)
```
DELETE /students/<id>
Headers: Authorization: Bearer <token_user>
→ Kết quả: 403 Forbidden - "Không có quyền truy cập"
```

---

## 📌 LƯU Ý QUAN TRỌNG

1. **Token phải có "Bearer " ở đầu:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Token hết hạn sau 7 ngày** - cần đăng nhập lại

3. **USER chỉ xem được, ADMIN mới thêm/sửa/xóa được**

4. **Upload ảnh phải dùng form-data, không dùng raw JSON**

5. **Các query parameters cho phân trang:**
   - `page`: số trang (mặc định 1)
   - `limit`: số item/trang (mặc định 10)
   - `search`: tìm kiếm theo tên
   - `sort`: sắp xếp theo field (name, age, createdAt)
   - `order`: asc hoặc desc

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 401 Unauthorized
- Chưa có token hoặc token sai
- Kiểm tra header Authorization

### Lỗi 403 Forbidden
- Không có quyền (USER cố xóa/sửa)
- Cần dùng tài khoản ADMIN

### Lỗi 404 Not Found
- ID sinh viên không tồn tại
- Kiểm tra lại ID

### Lỗi 400 Bad Request
- Dữ liệu không hợp lệ
- Kiểm tra validation (username >= 3 ký tự, password >= 6 ký tự)

---

## 🎉 HOÀN THÀNH!

Sau khi test xong tất cả API, bạn có thể:
1. Chụp màn hình kết quả để đưa vào báo cáo
2. Export Postman Collection để nộp kèm
3. Deploy lên Render để có API online

**Chúc bạn test thành công! 🚀**
