/**
 * ================================================================
 * HỆ THỐNG KIỂM THỬ TỰ ĐỘNG ĐA TÁC TỬ (MULTI-BOT TEST RUNNER)
 * Tích hợp: Khởi động server + chạy test + dừng server
 * ================================================================
 */

require('dotenv').config();
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 5050; // Port riêng cho test
const BASE_URL = `http://localhost:${PORT}`;

// ================================================================
// CẤU TRÚC DỮ LIỆU KẾT QUẢ KIỂM THỬ
// ================================================================
const testResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  duration: null,
  summary: { total: 0, passed: 0, failed: 0, passRate: '0%' },
  chapters: {
    auth: { name: '🔑 Bot 2: Auth & Header (Xác thực & Phân quyền)', tests: [] },
    payload: { name: '🧪 Bot 3: Payload & Boundary (Dữ liệu Biên & Rỗng)', tests: [] },
    restful: { name: '📋 Bot 4: RESTful & Schema (Mã Trạng thái & Cấu trúc)', tests: [] },
    database: { name: '💾 Bot 5: Database Inspector (Đối soát Cơ sở dữ liệu)', tests: [] },
    workflow: { name: '🔄 Kiểm thử Luồng Nghiệp vụ E2E (End-to-End)', tests: [] }
  }
};

let adminToken = null;
let userToken = null;
let createdStudentId = null;
let createdStudentCode = null;

// ================================================================
// TIỆN ÍCH: GHI NHẬN KẾT QUẢ TEST
// ================================================================
function recordTest(chapter, testName, passed, expected, actual, detail = '') {
  const result = {
    id: testResults.summary.total + 1,
    name: testName,
    status: passed ? '✅ PASS' : '❌ FAIL',
    expected: String(expected),
    actual: String(actual),
    detail,
    timestamp: new Date().toISOString()
  };
  testResults.chapters[chapter].tests.push(result);
  testResults.summary.total++;
  if (passed) testResults.summary.passed++;
  else testResults.summary.failed++;

  const statusIcon = passed ? '✅' : '❌';
  console.log(`  ${statusIcon} [TC-${String(result.id).padStart(2,'0')}] ${testName}`);
  if (!passed) {
    console.log(`         → Kỳ vọng: ${expected}`);
    console.log(`         → Nhận được: ${actual}`);
    if (detail) console.log(`         → Chi tiết: ${detail}`);
  }
}

// ================================================================
// TIỆN ÍCH: GỬI REQUEST HTTP AN TOÀN
// ================================================================
async function sendRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: BASE_URL + url,
      headers: { 'Content-Type': 'application/json', ...headers },
      validateStatus: () => true,
      timeout: 15000
    };
    if (data) config.data = data;
    const start = Date.now();
    const res = await axios(config);
    res.responseTime = Date.now() - start;
    return res;
  } catch (err) {
    return { status: 0, data: { error: err.message }, responseTime: 9999, headers: {} };
  }
}

// ================================================================
// KHỞI ĐỘNG SERVER NHÚNG
// ================================================================
async function startServer() {
  return new Promise((resolve, reject) => {
    // Patch PORT env cho server
    process.env.PORT = String(PORT);
    
    // Reset mongoose để không conflict với in-memory test
    const mongoose = require('mongoose');
    
    // Load app
    const express = require('express');
    const cors = require('cors');
    const connectDB = require('./utils/db');
    const seedInitialData = require('./utils/seeder');
    
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/uploads', express.static('uploads'));
    app.use(express.static('public'));

    const { securityHeaders, sanitizeInput } = require('./middlewares/security.middleware');
    app.use(securityHeaders);
    app.use(sanitizeInput);
    
    app.use(require('./middlewares/logger.middleware'));
    
    const { performanceMonitor } = require('./middlewares/performance.middleware');
    app.use(performanceMonitor);
    
    const rateLimiter = require('./middlewares/rateLimiter.middleware');
    app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 10000 }));

    // Routes
    app.use('/auth', require('./routes/auth.routes'));
    app.use('/profile', require('./routes/profile.routes'));
    app.use('/users', require('./routes/user.routes'));
    app.use('/students', require('./routes/student.routes'));
    app.use('/courses', require('./routes/course.routes'));
    app.use('/attendance', require('./routes/attendance.routes'));
    app.use('/grades', require('./routes/grade.routes'));
    app.use('/notifications', require('./routes/notification.routes'));
    app.use('/stats', require('./routes/stats.routes'));
    app.use('/export', require('./routes/export.routes'));
    app.use('/search', require('./routes/search.routes'));
    app.use('/backup', require('./routes/backup.routes'));
    app.use('/analytics', require('./routes/analytics.routes'));
    app.use('/health', require('./routes/health.routes'));
    
    const { getPerformanceStats } = require('./middlewares/performance.middleware');
    app.get('/performance', getPerformanceStats);
    
    app.use(require('./middlewares/error.middleware'));
    
    connectDB().then(async () => {
      await seedInitialData();
      const server = app.listen(PORT, () => {
        console.log(`\n🚀 Test Server khởi động trên port ${PORT}`);
        resolve({ server, mongoose });
      });
      server.on('error', reject);
    }).catch(reject);
  });
}

// ================================================================
// BOT 2: AUTH & HEADER BOT
// ================================================================
async function runAuthBot() {
  console.log('\n🔑 ========================================');
  console.log('   BOT 2: AUTH & HEADER BOT');
  console.log('   Kiểm tra Xác thực & Phân quyền (RBAC)');
  console.log('==========================================');

  const ts = Date.now();
  const adminUser = `admin_test_${ts}`;
  const userUser = `user_test_${ts}`;

  // TC-A01: Đăng ký ADMIN
  let res = await sendRequest('POST', '/auth/register', { username: adminUser, password: 'Admin@123', role: 'ADMIN' });
  recordTest('auth', 'TC-A01: Đăng ký tài khoản ADMIN mới thành công',
    res.status === 201 || res.status === 200, '200/201', res.status, res.data?.message || '');

  // TC-A02: Đăng nhập ADMIN lấy Token
  res = await sendRequest('POST', '/auth/login', { username: adminUser, password: 'Admin@123' });
  const loginAdminOk = (res.status === 200) && !!res.data?.token;
  if (loginAdminOk) adminToken = res.data.token;
  recordTest('auth', 'TC-A02: Đăng nhập ADMIN → Nhận JWT Token hợp lệ',
    loginAdminOk, '200 + token', `${res.status}${loginAdminOk ? ' + token✓' : ''}`, '');

  // TC-A03: Đăng ký USER
  res = await sendRequest('POST', '/auth/register', { username: userUser, password: 'User@123', role: 'USER' });
  res = await sendRequest('POST', '/auth/login', { username: userUser, password: 'User@123' });
  if (res.status === 200 && res.data?.token) userToken = res.data.token;
  recordTest('auth', 'TC-A03: Đăng nhập USER thường → Nhận JWT Token hợp lệ',
    res.status === 200 && !!userToken, '200 + token', res.status, '');

  // TC-A04: Không có Token → 401
  res = await sendRequest('GET', '/students');
  recordTest('auth', 'TC-A04: Gọi API không gửi Token → Từ chối 401 Unauthorized',
    res.status === 401, '401', res.status, '');

  // TC-A05: Token sai chữ ký → 401
  res = await sendRequest('GET', '/students', null, { Authorization: 'Bearer token.gia.mao.chukynhom' });
  recordTest('auth', 'TC-A05: Token sai chữ ký JWT → Từ chối 401 Unauthorized',
    res.status === 401, '401', res.status, '');

  // TC-A06: Token rác hoàn toàn → 401
  res = await sendRequest('GET', '/students', null, { Authorization: 'Bearer khong_phai_jwt' });
  recordTest('auth', 'TC-A06: Token rác (không phải JWT) → Từ chối 401',
    res.status === 401, '401', res.status, '');

  // TC-A07: RBAC - USER gọi POST /students (chỉ ADMIN)
  res = await sendRequest('POST', '/students', { name: 'Hacker', age: 20 }, { Authorization: `Bearer ${userToken}` });
  recordTest('auth', 'TC-A07: RBAC - Role USER gọi POST /students → Từ chối 403 Forbidden',
    res.status === 403, '403', res.status, '');

  // TC-A08: RBAC - USER gọi DELETE (chỉ ADMIN)
  res = await sendRequest('DELETE', '/students/507f1f77bcf86cd799439011', null, { Authorization: `Bearer ${userToken}` });
  recordTest('auth', 'TC-A08: RBAC - Role USER gọi DELETE /students → Từ chối 403 Forbidden',
    res.status === 403, '403', res.status, '');

  // TC-A09: Đăng nhập sai mật khẩu → 400/401
  res = await sendRequest('POST', '/auth/login', { username: adminUser, password: 'SaiMK@999' });
  recordTest('auth', 'TC-A09: Đăng nhập sai mật khẩu → Từ chối 400/401',
    res.status === 400 || res.status === 401, '400/401', res.status, '');

  // TC-A10: Đăng nhập username không tồn tại
  res = await sendRequest('POST', '/auth/login', { username: 'user_khong_ton_tai_xyz_999', password: '123456' });
  recordTest('auth', 'TC-A10: Đăng nhập username không tồn tại → Từ chối 400/401',
    res.status === 400 || res.status === 401, '400/401', res.status, '');
}

// ================================================================
// BOT 3: PAYLOAD & BOUNDARY FUZZING BOT
// ================================================================
async function runPayloadBot() {
  console.log('\n🧪 ========================================');
  console.log('   BOT 3: PAYLOAD & BOUNDARY BOT');
  console.log('   Kiểm tra Dữ liệu Biên, Rỗng, Trùng lặp');
  console.log('==========================================');

  const authHeader = { Authorization: `Bearer ${adminToken}` };
  const ts = Date.now();

  // TC-P01: Body hoàn toàn rỗng
  let res = await sendRequest('POST', '/students', {}, authHeader);
  recordTest('payload', 'TC-P01: Body rỗng {} → Phải từ chối 400 Bad Request',
    res.status === 400, '400', res.status, 'Thiếu tất cả trường bắt buộc');

  // TC-P02: Thiếu trường name
  res = await sendRequest('POST', '/students', { age: 20 }, authHeader);
  recordTest('payload', 'TC-P02: Thiếu trường name bắt buộc → Phải từ chối 400',
    res.status === 400, '400', res.status, 'name là trường required');

  // TC-P03: Thiếu trường age
  res = await sendRequest('POST', '/students', { name: 'Test A' }, authHeader);
  recordTest('payload', 'TC-P03: Thiếu trường age bắt buộc → Phải từ chối 400',
    res.status === 400, '400', res.status, 'age là trường required');

  // TC-P04: BVA - age = 0 (Min-1, dưới biên)
  res = await sendRequest('POST', '/students', { name: 'BVA Test', age: 0, studentCode: `BVA001_${ts}` }, authHeader);
  recordTest('payload', 'TC-P04: BVA - Tuổi = 0 (Min-1=0) → Phải từ chối 400',
    res.status === 400, '400', res.status, 'Biên dưới: age min là 1');

  // TC-P05: BVA - age = 1 (Min, biên dưới hợp lệ)
  res = await sendRequest('POST', '/students', { name: 'BVA Min', age: 1, studentCode: `BVA002_${ts}` }, authHeader);
  recordTest('payload', 'TC-P05: BVA - Tuổi = 1 (Min=1, hợp lệ) → Phải chấp nhận 201',
    res.status === 201 || res.status === 200, '201', res.status, '');
  if ((res.status === 201 || res.status === 200)) {
    const id = res.data?.data?._id || res.data?._id;
    if (id) await sendRequest('DELETE', `/students/${id}`, null, authHeader);
  }

  // TC-P06: BVA - age = 100 (Max, biên trên hợp lệ)
  res = await sendRequest('POST', '/students', { name: 'BVA Max', age: 100, studentCode: `BVA003_${ts}` }, authHeader);
  recordTest('payload', 'TC-P06: BVA - Tuổi = 100 (Max=100, hợp lệ) → Phải chấp nhận 201',
    res.status === 201 || res.status === 200, '201', res.status, '');
  if ((res.status === 201 || res.status === 200)) {
    const id = res.data?.data?._id || res.data?._id;
    if (id) await sendRequest('DELETE', `/students/${id}`, null, authHeader);
  }

  // TC-P07: BVA - age = 101 (Max+1, vượt biên)
  res = await sendRequest('POST', '/students', { name: 'BVA Over', age: 101, studentCode: `BVA004_${ts}` }, authHeader);
  recordTest('payload', 'TC-P07: BVA - Tuổi = 101 (Max+1=101) → Phải từ chối 400',
    res.status === 400, '400', res.status, 'Biên trên: age max là 100');

  // TC-P08: Sai kiểu dữ liệu age
  res = await sendRequest('POST', '/students', { name: 'WrongType', age: 'hai_muoi', studentCode: `BVA005_${ts}` }, authHeader);
  recordTest('payload', 'TC-P08: Sai kiểu dữ liệu age="hai_muoi" (chuỗi) → Phải từ chối 400',
    res.status === 400, '400', res.status, 'age phải là số nguyên');

  // TC-P09: Email sai định dạng
  res = await sendRequest('POST', '/students', { name: 'Email Test', age: 20, email: 'khong_phai_email', studentCode: `BVA006_${ts}` }, authHeader);
  recordTest('payload', 'TC-P09: Email sai định dạng "khong_phai_email" → Phải từ chối 400',
    res.status === 400, '400', res.status, 'email phải là địa chỉ email hợp lệ');

  // TC-P10: Số điện thoại ngắn (< 10 chữ số)
  res = await sendRequest('POST', '/students', { name: 'Phone Test', age: 20, phone: '09012345', studentCode: `BVA007_${ts}` }, authHeader);
  recordTest('payload', 'TC-P10: Số điện thoại "09012345" (8 chữ số < 10) → Phải từ chối 400',
    res.status === 400, '400', res.status, 'phone phải có 10-11 chữ số');

  // TC-P11: Tên quá ngắn (1 ký tự < min 2)
  res = await sendRequest('POST', '/students', { name: 'A', age: 20, studentCode: `BVA008_${ts}` }, authHeader);
  recordTest('payload', 'TC-P11: Tên "A" (1 ký tự < min 2) → Phải từ chối 400',
    res.status === 400, '400', res.status, 'name phải có ít nhất 2 ký tự');

  // TC-P12: Happy Path - Tạo sinh viên hợp lệ hoàn toàn
  createdStudentCode = `SV_BOT_${ts}`;
  res = await sendRequest('POST', '/students', {
    name: 'Nguyễn Bot Kiểm Thử',
    age: 21,
    studentCode: createdStudentCode,
    email: `bot_${ts}@ued.udn.vn`,
    phone: '0901234567'
  }, authHeader);
  const happyOk = res.status === 201 || res.status === 200;
  createdStudentId = res.data?.data?._id || res.data?._id;
  recordTest('payload', 'TC-P12: Happy Path - Dữ liệu hợp lệ đầy đủ → Phải chấp nhận 201',
    happyOk, '201 Created', res.status, `ID: ${createdStudentId || 'null'}`);

  // TC-P13: Trùng lặp studentCode
  res = await sendRequest('POST', '/students', {
    name: 'Trùng Mã', age: 22, studentCode: createdStudentCode
  }, authHeader);
  recordTest('payload', `TC-P13: Trùng mã SV "${createdStudentCode}" → Phải từ chối 400/409`,
    res.status === 400 || res.status === 409, '400/409', res.status, 'studentCode phải là duy nhất');
}

// ================================================================
// BOT 4: RESTful & SCHEMA BOT
// ================================================================
async function runRestfulBot() {
  console.log('\n📋 ========================================');
  console.log('   BOT 4: RESTful & SCHEMA BOT');
  console.log('   Kiểm tra Mã Trạng thái HTTP & Cấu trúc JSON');
  console.log('==========================================');

  const authHeader = { Authorization: `Bearer ${adminToken}` };
  const userHeader = { Authorization: `Bearer ${userToken}` };

  // TC-R01: GET /students - Danh sách
  let res = await sendRequest('GET', '/students', null, authHeader);
  recordTest('restful', 'TC-R01: GET /students → 200 OK với dữ liệu hợp lệ',
    res.status === 200, '200', res.status, `${res.responseTime}ms`);

  // TC-R02: Response time < 500ms
  recordTest('restful', 'TC-R02: GET /students → Response Time < 500ms (Hiệu năng)',
    res.responseTime < 500, '< 500ms', `${res.responseTime}ms`, '');

  // TC-R03: GET /students/:id tồn tại
  if (createdStudentId) {
    res = await sendRequest('GET', `/students/${createdStudentId}`, null, authHeader);
    recordTest('restful', 'TC-R03: GET /students/:id (ID hợp lệ) → 200 OK',
      res.status === 200, '200', res.status, `ID: ${createdStudentId}`);
  }

  // TC-R04: GET /students/:id không tồn tại → 404
  res = await sendRequest('GET', '/students/507f1f77bcf86cd799439011', null, authHeader);
  recordTest('restful', 'TC-R04: GET /students/507f...9011 (ID không tồn tại) → 404 Not Found',
    res.status === 404, '404', res.status, '');

  // TC-R05: GET ID format sai
  res = await sendRequest('GET', '/students/khong_phai_objectid', null, authHeader);
  recordTest('restful', 'TC-R05: GET /students/INVALID_ID (format sai) → 400/404/500',
    res.status === 400 || res.status === 404 || res.status === 500, '400/404', res.status, '');

  // TC-R06: PUT hợp lệ → 200
  if (createdStudentId) {
    res = await sendRequest('PUT', `/students/${createdStudentId}`, { name: 'Nguyễn Updated', age: 22 }, authHeader);
    recordTest('restful', 'TC-R06: PUT /students/:id (dữ liệu hợp lệ) → 200 OK',
      res.status === 200, '200', res.status, '');
  }

  // TC-R07: PUT với age sai validator → 400
  if (createdStudentId) {
    res = await sendRequest('PUT', `/students/${createdStudentId}`, { age: 999 }, authHeader);
    recordTest('restful', 'TC-R07: PUT /students/:id (age=999 > 100) → 400 Bad Request',
      res.status === 400, '400', res.status, 'validator age max=100');
  }

  // TC-R08: USER xem GET /students (Được phép)
  res = await sendRequest('GET', '/students', null, userHeader);
  recordTest('restful', 'TC-R08: Role USER được phép GET /students → 200 OK',
    res.status === 200, '200', res.status, '');

  // TC-R09: Response body phải là JSON object hợp lệ
  res = await sendRequest('GET', '/students', null, authHeader);
  const isJson = res.data !== null && typeof res.data === 'object';
  recordTest('restful', 'TC-R09: Response body là JSON object hợp lệ',
    isJson, 'JSON object', typeof res.data, '');

  // TC-R10: Content-Type response phải là application/json
  const contentType = res.headers?.['content-type'] || '';
  recordTest('restful', 'TC-R10: Content-Type phản hồi phải là application/json',
    contentType.includes('application/json'), 'application/json', contentType.split(';')[0] || 'không có', '');

  // TC-R11: Health check → 200
  res = await sendRequest('GET', '/health');
  recordTest('restful', 'TC-R11: GET /health → 200 OK (Server Health Check)',
    res.status === 200, '200', res.status, `${res.responseTime}ms`);

  // TC-R12: DELETE thành công → 200
  if (createdStudentId) {
    res = await sendRequest('DELETE', `/students/${createdStudentId}`, null, authHeader);
    recordTest('restful', 'TC-R12: DELETE /students/:id hợp lệ → 200 OK',
      res.status === 200, '200', res.status, '');
  }

  // TC-R13: GET sau DELETE → 404
  if (createdStudentId) {
    res = await sendRequest('GET', `/students/${createdStudentId}`, null, authHeader);
    recordTest('restful', 'TC-R13: GET /students/:id sau khi DELETE → 404 Not Found',
      res.status === 404, '404', res.status, 'Dữ liệu đã bị xóa phải trả về 404');
    createdStudentId = null; // Đã xóa
  }
}

// ================================================================
// BOT 5: DATABASE INSPECTOR BOT
// ================================================================
async function runDatabaseBot() {
  console.log('\n💾 ========================================');
  console.log('   BOT 5: DATABASE INSPECTOR BOT');
  console.log('   Đối soát trực tiếp dữ liệu trong MongoDB');
  console.log('==========================================');

  const authHeader = { Authorization: `Bearer ${adminToken}` };
  const Student = require('./models/student.model');
  const ts = Date.now();
  const dbTestCode = `DB_VERIFY_${ts}`;

  // Tạo một bản ghi mới để kiểm tra DB
  let res = await sendRequest('POST', '/students', {
    name: 'DB Inspector Test',
    age: 25,
    studentCode: dbTestCode,
    email: `dbtest_${ts}@ued.vn`
  }, authHeader);

  const dbTestId = res.data?.data?._id || res.data?._id;

  // TC-D01: API trả về 201 → Record phải tồn tại trong DB
  try {
    const dbRecord = await Student.findById(dbTestId);
    recordTest('database', 'TC-D01: API POST /students 201 → Bản ghi tồn tại trong MongoDB',
      dbRecord !== null, 'Record exists', dbRecord !== null ? 'Found ✓' : 'Not found ✗', `_id: ${dbTestId}`);

    if (dbRecord) {
      // TC-D02: Mã sinh viên khớp
      recordTest('database', 'TC-D02: studentCode trong DB khớp với payload đã gửi',
        dbRecord.studentCode === dbTestCode, dbTestCode, dbRecord.studentCode, '');
      // TC-D03: isDeleted phải là false
      recordTest('database', 'TC-D03: isDeleted trong DB = false (Chưa bị xóa)',
        dbRecord.isDeleted === false, 'false', String(dbRecord.isDeleted), '');
      // TC-D04: timestamps được tạo tự động
      recordTest('database', 'TC-D04: createdAt được tự động tạo bởi MongoDB timestamps',
        dbRecord.createdAt instanceof Date, 'Date object', typeof dbRecord.createdAt, '');
    }
  } catch (err) {
    recordTest('database', 'TC-D01: Kết nối kiểm tra MongoDB', false, 'Kết nối thành công', err.message, '');
  }

  // TC-D05: PUT qua API → Kiểm tra DB được cập nhật
  if (dbTestId) {
    const newName = 'DB Inspector Updated';
    const newAge = 26;
    res = await sendRequest('PUT', `/students/${dbTestId}`, { name: newName, age: newAge }, authHeader);
    if (res.status === 200) {
      try {
        const dbRecord = await Student.findById(dbTestId);
        recordTest('database', 'TC-D05: Sau PUT API → Trường name trong DB được cập nhật đúng',
          dbRecord && dbRecord.name === newName, newName, dbRecord?.name || 'null', '');
        recordTest('database', 'TC-D06: Sau PUT API → Trường age trong DB được cập nhật đúng',
          dbRecord && dbRecord.age === newAge, String(newAge), String(dbRecord?.age), '');
        recordTest('database', 'TC-D07: Sau PUT API → updatedAt trong DB được tự động cập nhật',
          dbRecord && dbRecord.updatedAt instanceof Date, 'Date updated', typeof dbRecord?.updatedAt, '');
      } catch (err) {
        recordTest('database', 'TC-D05: Kiểm tra DB sau PUT', false, 'Dữ liệu được cập nhật', err.message, '');
      }
    }
  }

  // TC-D08: DELETE qua API → Kiểm tra Soft Delete trong DB
  if (dbTestId) {
    res = await sendRequest('DELETE', `/students/${dbTestId}`, null, authHeader);
    if (res.status === 200) {
      try {
        const dbRecord = await Student.findById(dbTestId);
        const isSoftDeleted = dbRecord && dbRecord.isDeleted === true;
        const isHardDeleted = dbRecord === null;
        recordTest('database', 'TC-D08: Sau DELETE API → Bản ghi bị Soft Delete (isDeleted=true)',
          isSoftDeleted || isHardDeleted,
          'isDeleted=true hoặc null',
          isSoftDeleted ? 'isDeleted=true (Soft Delete ✓)' : (isHardDeleted ? 'Hard Delete ✓' : `isDeleted=${dbRecord?.isDeleted}`),
          '');

        // TC-D09: Sau xóa, GET API cũng phải trả về 404
        const getRes = await sendRequest('GET', `/students/${dbTestId}`, null, authHeader);
        recordTest('database', 'TC-D09: Sau DELETE → GET /students/:id phải trả về 404',
          getRes.status === 404, '404', getRes.status, 'API không được hiển thị dữ liệu đã bị xóa');
      } catch (err) {
        recordTest('database', 'TC-D08: Kiểm tra DB sau DELETE', false, 'Record đã xóa', err.message, '');
      }
    }
  }
}

// ================================================================
// LUỒNG E2E WORKFLOW - KIỂM THỬ TÍCH HỢP
// ================================================================
async function runWorkflowTest() {
  console.log('\n🔄 ========================================');
  console.log('   KIỂM THỬ LUỒNG NGHIỆP VỤ E2E');
  console.log('   End-to-End Integration Testing');
  console.log('==========================================');

  const authHeader = { Authorization: `Bearer ${adminToken}` };
  const ts = Date.now();

  // E2E-01: Luồng hoàn chỉnh CRUD sinh viên
  console.log('  → Chạy luồng: Tạo → Đọc → Cập nhật → Xóa → Xác nhận 404');
  
  let res = await sendRequest('POST', '/students', {
    name: 'Sinh Viên E2E Test', age: 20,
    studentCode: `E2E_${ts}`,
    email: `e2e_${ts}@ued.vn`
  }, authHeader);
  const e2eId = res.data?.data?._id || res.data?._id;
  recordTest('workflow', 'E2E-01 Bước 1/5: Tạo sinh viên mới (POST /students → 201)',
    res.status === 201 || res.status === 200, '201', res.status, `ID: ${e2eId}`);

  if (e2eId) {
    // Bước 2: Đọc
    res = await sendRequest('GET', `/students/${e2eId}`, null, authHeader);
    recordTest('workflow', 'E2E-01 Bước 2/5: Đọc thông tin sinh viên (GET /students/:id → 200)',
      res.status === 200, '200', res.status, '');

    // Bước 3: Cập nhật
    res = await sendRequest('PUT', `/students/${e2eId}`, { name: 'SV E2E Updated', age: 21 }, authHeader);
    recordTest('workflow', 'E2E-01 Bước 3/5: Cập nhật thông tin (PUT /students/:id → 200)',
      res.status === 200, '200', res.status, '');

    // Bước 4: Xóa
    res = await sendRequest('DELETE', `/students/${e2eId}`, null, authHeader);
    recordTest('workflow', 'E2E-01 Bước 4/5: Xóa sinh viên (DELETE /students/:id → 200)',
      res.status === 200, '200', res.status, '');

    // Bước 5: Xác nhận 404
    res = await sendRequest('GET', `/students/${e2eId}`, null, authHeader);
    recordTest('workflow', 'E2E-01 Bước 5/5: Xác nhận sau xóa (GET → 404 Not Found)',
      res.status === 404, '404', res.status, '');
  }

  // E2E-02: Idempotency
  const r1 = await sendRequest('GET', '/students', null, authHeader);
  const r2 = await sendRequest('GET', '/students', null, authHeader);
  recordTest('workflow', 'E2E-02: Idempotency - GET /students 2 lần liên tiếp → Cùng status',
    r1.status === r2.status, `Cùng ${r1.status}`, `${r1.status} vs ${r2.status}`, '');

  // E2E-03: Danh sách sinh viên trả về Array
  const dataIsArray = Array.isArray(r1.data) || Array.isArray(r1.data?.data) || Array.isArray(r1.data?.students);
  recordTest('workflow', 'E2E-03: GET /students → Dữ liệu phải là mảng (Array)',
    dataIsArray, 'Array', Array.isArray(r1.data) ? 'Array ✓' : typeof r1.data, '');
}

// ================================================================
// XUẤT BÁO CÁO
// ================================================================
function generateReport() {
  testResults.endTime = new Date().toISOString();
  const ms = new Date(testResults.endTime) - new Date(testResults.startTime);
  testResults.duration = `${(ms / 1000).toFixed(2)} giây`;
  testResults.summary.passRate = `${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`;

  console.log('\n\n📊 ================================================================');
  console.log('           BÁO CÁO TỔNG KẾT KIỂM THỬ TỰ ĐỘNG');
  console.log('           Hệ thống Quản lý Sinh viên Backend API');
  console.log('================================================================');
  console.log(`  ⏱️  Thời gian thực thi: ${testResults.duration}`);
  console.log(`  🕐  Bắt đầu:           ${new Date(testResults.startTime).toLocaleString('vi-VN')}`);
  console.log(`  🕑  Kết thúc:           ${new Date(testResults.endTime).toLocaleString('vi-VN')}`);
  console.log('----------------------------------------------------------------');
  console.log(`  📋 Tổng số test case:  ${testResults.summary.total}`);
  console.log(`  ✅ Số test PASSED:     ${testResults.summary.passed}`);
  console.log(`  ❌ Số test FAILED:     ${testResults.summary.failed}`);
  console.log(`  📈 Tỷ lệ PASS:         ${testResults.summary.passRate}`);
  console.log('================================================================');

  for (const [key, chapter] of Object.entries(testResults.chapters)) {
    if (chapter.tests.length === 0) continue;
    const passed = chapter.tests.filter(t => t.status.includes('PASS')).length;
    const total = chapter.tests.length;
    console.log(`\n  ${chapter.name}`);
    console.log(`  Kết quả: ${passed}/${total} PASS`);
    chapter.tests.forEach(t => {
      console.log(`    ${t.status} [TC-${String(t.id).padStart(2,'0')}] ${t.name}`);
      if (t.status.includes('FAIL')) {
        console.log(`             Kỳ vọng: ${t.expected} | Nhận được: ${t.actual}`);
        if (t.detail) console.log(`             Chi tiết: ${t.detail}`);
      }
    });
  }

  const outputPath = path.join(__dirname, 'test_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2), 'utf-8');
  console.log(`\n  💾 File kết quả JSON đã lưu: test_results.json`);
  console.log('================================================================\n');
  return testResults;
}

// ================================================================
// MAIN - ĐIỀU PHỐI TOÀN BỘ 5 BOT
// ================================================================
async function main() {
  console.log('================================================================');
  console.log('  🚀 HỆ THỐNG KIỂM THỬ TỰ ĐỘNG ĐA TÁC TỬ (MULTI-BOT)');
  console.log('  Dự án: Hệ thống Quản lý Sinh viên Backend API');
  console.log('  Trường: Đại học Sư phạm - Đại học Đà Nẵng (UED/UDN)');
  console.log('  Môn học: Kỹ thuật Phần mềm (KTPM)');
  console.log(`  Thời gian: ${new Date().toLocaleString('vi-VN')}`);
  console.log('================================================================');

  let serverHandle = null;
  try {
    // Bot 1: Khởi động Server
    console.log('\n🎯 BOT 1: COORDINATOR - Khởi động Test Server...');
    serverHandle = await startServer();
    console.log(`  ✅ Test Server sẵn sàng tại ${BASE_URL}`);

    // Bot 2: Auth & Header
    await runAuthBot();
    // Bot 3: Payload & Boundary
    await runPayloadBot();
    // Bot 4: RESTful & Schema
    await runRestfulBot();
    // Bot 5: Database Inspector
    await runDatabaseBot();
    // E2E Workflow
    await runWorkflowTest();

    // Báo cáo tổng kết
    const report = generateReport();

    // Dừng server
    serverHandle.server.close();
    await serverHandle.mongoose.disconnect();
    
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n❌ Lỗi nghiêm trọng:', err.message);
    if (serverHandle?.server) serverHandle.server.close();
    process.exit(1);
  }
}

main();
