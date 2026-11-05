// ===================== CONFIG =====================
const API = '';  // relative URL (served from same origin)
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
let allStudents = [];
let allCourses = [];
let chartCourses = null;
let chartAge = null;

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded', () => {
  if (token && currentUser) {
    enterApp();
  }
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
});

// ===================== AUTH =====================
async function doLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.classList.add('hidden');

  if (!username || !password) {
    showLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      showLoginError(data.message || 'Đăng nhập thất bại');
      return;
    }
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    enterApp();
  } catch (err) {
    showLoginError('Không thể kết nối server. Kiểm tra backend đang chạy tại port 5000.');
  }
}

function quickLogin(u, p) {
  document.getElementById('loginUsername').value = u;
  document.getElementById('loginPassword').value = p;
  doLogin();
}

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function enterApp() {
  document.getElementById('loginModal').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('headerUsername').textContent = currentUser.username;
  document.getElementById('headerRole').textContent = currentUser.role === 'ADMIN' ? '👑 Quản trị viên' : '👤 Sinh viên';

  // Apply role visibility
  const isAdmin = currentUser.role === 'ADMIN';
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  checkBackendStatus();
  showSection('dashboard');
  loadStudents();
  loadCourses();
  loadNotifications();
  setInterval(checkBackendStatus, 30000);
}

function doLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  token = null;
  currentUser = null;
  document.getElementById('loginModal').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').classList.add('hidden');
}

// ===================== API HELPER =====================
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401) { doLogout(); return null; }
  return res;
}

// ===================== NAVIGATION =====================
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.remove('bg-blue-50', 'text-blue-700', 'font-semibold');
  });
  const section = document.getElementById(`section-${name}`);
  if (section) section.classList.remove('hidden');
  document.querySelectorAll(`[data-section="${name}"]`).forEach(a => {
    a.classList.add('bg-blue-50', 'text-blue-700');
  });

  if (name === 'dashboard') loadDashboard();
  if (name === 'grades') loadGradeSelectors();
  if (name === 'attendance') loadAttendanceSelectors();
  if (name === 'notifications') loadNotifications();
  if (name === 'export') loadBackupList();
  if (name === 'health') loadHealth();

  // Close sidebar on mobile
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth < 1024 && !sidebar.classList.contains('-translate-x-full')) {
    toggleSidebar();
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('-translate-x-full');
  overlay.classList.toggle('hidden');
}

// ===================== BACKEND STATUS =====================
async function checkBackendStatus() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  document.getElementById('headerStatus').classList.remove('hidden');
  try {
    const res = await fetch(`${API}/health`);
    if (res.ok) {
      const data = await res.json();
      dot.className = 'w-2 h-2 rounded-full bg-green-400';
      text.textContent = `Online · ${data.database?.status || 'connected'}`;
    } else {
      dot.className = 'w-2 h-2 rounded-full bg-yellow-400';
      text.textContent = 'Cảnh báo';
    }
  } catch {
    dot.className = 'w-2 h-2 rounded-full bg-red-400';
    text.textContent = 'Offline';
  }
}

// ===================== DASHBOARD =====================
async function loadDashboard() {
  if (currentUser?.role !== 'ADMIN') {
    document.getElementById('dashboardStats').innerHTML = `
      <div class="col-span-4 text-center py-8 text-gray-400">
        <i class="fas fa-lock text-3xl mb-2"></i>
        <p class="text-sm">Chỉ Admin mới xem được thống kê</p>
      </div>`;
    return;
  }
  try {
    const res = await apiFetch('/stats/dashboard');
    const data = await res.json();
    renderDashboardStats(data);
    loadAnalytics();
  } catch {
    toast('Không tải được thống kê', 'error');
  }
}

function renderDashboardStats(d) {
  // API trả về: { overview: {totalStudents, totalCourses, totalUsers}, popularCourses, ageDistribution, recentStudents }
  const ov = d.overview || {};
  const stats = [
    { label: 'Sinh viên', value: ov.totalStudents ?? d.students?.total ?? '—', icon: 'fas fa-user-graduate', color: 'blue', sub: `${ov.totalUsers ?? 0} tài khoản` },
    { label: 'Khóa học', value: ov.totalCourses ?? d.courses?.total ?? '—', icon: 'fas fa-book', color: 'violet', sub: `${(d.popularCourses || []).length} phổ biến` },
    { label: 'Điểm đã nhập', value: d.grades?.total ?? (d.ageDistribution?.length ? '✓' : '—'), icon: 'fas fa-star', color: 'green', sub: `Tỷ lệ đậu: ${d.grades?.passRate ?? 0}%` },
    { label: 'Quản trị', value: ov.totalAdmins ?? '—', icon: 'fas fa-shield-alt', color: 'orange', sub: `${ov.totalUsers ?? 0} người dùng` },
  ];
  const colors = { blue: 'bg-blue-500', violet: 'bg-violet-500', green: 'bg-green-500', orange: 'bg-orange-500' };
  document.getElementById('dashboardStats').innerHTML = stats.map(s => `
    <div class="bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4">
      <div class="w-12 h-12 ${colors[s.color]} rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">
        <i class="${s.icon}"></i>
      </div>
      <div>
        <div class="text-2xl font-bold text-gray-800">${s.value}</div>
        <div class="text-sm font-medium text-gray-600">${s.label}</div>
        <div class="text-xs text-gray-400">${s.sub}</div>
      </div>
    </div>`).join('');
}

async function loadAnalytics() {
  try {
    const [topRes, ageRes] = await Promise.all([
      apiFetch('/analytics/top-courses'),
      apiFetch('/analytics/age')
    ]);
    if (!topRes || !ageRes) return;
    const topData = await topRes.json();
    const ageData = await ageRes.json();

    // Chart: Top courses
    const ctx1 = document.getElementById('chartCourses').getContext('2d');
    if (chartCourses) chartCourses.destroy();
    // API trả về { topCourses: [...] }
    const courses = topData.topCourses || topData.courses || (Array.isArray(topData) ? topData : []);
    chartCourses = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: courses.map(c => c.name || c._id || 'N/A').slice(0, 6),
        datasets: [{ label: 'Số sinh viên', data: courses.map(c => c.studentCount || c.count || 0).slice(0, 6), backgroundColor: '#8b5cf6', borderRadius: 6 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });

    // Chart: Age distribution
    // API trả về { total, distribution: [{range, count, percentage}] }
    const ctx2 = document.getElementById('chartAge').getContext('2d');
    if (chartAge) chartAge.destroy();
    const ages = ageData.distribution || ageData.ageGroups || (Array.isArray(ageData) ? ageData : []);
    chartAge = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ages.map(a => a._id ? `${a._id} tuổi` : (a.range || 'N/A')),
        datasets: [{ data: ages.map(a => a.count || 0), backgroundColor: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  } catch {
    // ignore chart errors
  }
}

// ===================== STUDENTS =====================
async function loadStudents() {
  try {
    const res = await apiFetch('/students');
    if (!res) return;
    const data = await res.json();
    allStudents = Array.isArray(data) ? data : (data.data || data.students || []);
    renderStudentList(allStudents);
    populateStudentSelectors();
  } catch {
    document.getElementById('studentList').innerHTML = '<p class="text-center text-red-400 py-6">Không tải được danh sách sinh viên</p>';
  }
}

function renderStudentList(students) {
  const container = document.getElementById('studentList');
  if (!students.length) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Chưa có sinh viên nào</p>';
    return;
  }
  const isAdmin = currentUser?.role === 'ADMIN';
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b">
            <th class="pb-3 pr-4 font-semibold">Họ tên</th>
            <th class="pb-3 pr-4 font-semibold">Tuổi</th>
            <th class="pb-3 pr-4 font-semibold hidden md:table-cell">Email</th>
            <th class="pb-3 pr-4 font-semibold hidden lg:table-cell">SĐT</th>
            ${isAdmin ? '<th class="pb-3 font-semibold text-right">Hành động</th>' : ''}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${students.map(s => `
            <tr class="hover:bg-gray-50 transition">
              <td class="py-3 pr-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                    ${(s.name || '?').charAt(0)}
                  </div>
                  <span class="font-medium text-gray-800">${s.name || '—'}</span>
                </div>
              </td>
              <td class="py-3 pr-4 text-gray-600">${s.age ?? '—'}</td>
              <td class="py-3 pr-4 text-gray-500 hidden md:table-cell">${s.email || '—'}</td>
              <td class="py-3 pr-4 text-gray-500 hidden lg:table-cell">${s.phone || '—'}</td>
              ${isAdmin ? `
                <td class="py-3 text-right">
                  <button onclick='editStudent(${JSON.stringify(s)})' class="text-blue-500 hover:text-blue-700 px-2 py-1 rounded" title="Sửa"><i class="fas fa-edit"></i></button>
                  <button onclick="deleteStudent('${s._id}','${s.name}')" class="text-red-400 hover:text-red-600 px-2 py-1 rounded" title="Xóa"><i class="fas fa-trash"></i></button>
                </td>
              ` : ''}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function filterStudents() {
  const q = document.getElementById('searchStudent').value.toLowerCase();
  if (!q) { renderStudentList(allStudents); return; }
  renderStudentList(allStudents.filter(s =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.email || '').toLowerCase().includes(q) ||
    (s.phone || '').toLowerCase().includes(q)
  ));
}

function openStudentModal(data = null) {
  document.getElementById('studentModalTitle').textContent = data ? 'Cập nhật sinh viên' : 'Thêm sinh viên';
  document.getElementById('studentId').value = data?._id || '';
  document.getElementById('studentName').value = data?.name || '';
  document.getElementById('studentAge').value = data?.age || '';
  document.getElementById('studentEmail').value = data?.email || '';
  document.getElementById('studentPhone').value = data?.phone || '';
  document.getElementById('studentModal').classList.remove('hidden');
}

function editStudent(s) { openStudentModal(s); }

async function saveStudent() {
  const id = document.getElementById('studentId').value;
  const name = document.getElementById('studentName').value.trim();
  const age = document.getElementById('studentAge').value;
  const email = document.getElementById('studentEmail').value.trim();
  const phone = document.getElementById('studentPhone').value.trim();
  if (!name || !age) { toast('Vui lòng nhập đầy đủ họ tên và tuổi', 'error'); return; }
  const body = { name, age: parseInt(age), email, phone };
  const res = await apiFetch(id ? `/students/${id}` : '/students', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(body)
  });
  if (!res) return;
  if (res.ok) {
    toast(id ? 'Cập nhật thành công' : 'Thêm sinh viên thành công', 'success');
    closeModal('studentModal');
    loadStudents();
    if (!id) loadDashboard();
  } else {
    const data = await res.json();
    toast(data.message || 'Lỗi khi lưu', 'error');
  }
}

async function deleteStudent(id, name) {
  if (!confirm(`Xóa sinh viên "${name}"?`)) return;
  const res = await apiFetch(`/students/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) { toast('Đã xóa sinh viên', 'success'); loadStudents(); loadDashboard(); }
  else toast('Không thể xóa', 'error');
}

function populateStudentSelectors() {
  const opts = allStudents.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
  ['gradeStudentFilter','gradeStudent','attStudentFilter','attStudent'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value;
    el.innerHTML = `<option value="">-- Tất cả sinh viên --</option>${opts}`;
    if (val) el.value = val;
  });
}

// ===================== COURSES =====================
async function loadCourses() {
  try {
    const res = await apiFetch('/courses');
    if (!res) return;
    const data = await res.json();
    allCourses = Array.isArray(data) ? data : (data.data || data.courses || []);
    renderCourseList(allCourses);
    populateCourseSelectors();
  } catch {
    document.getElementById('courseList').innerHTML = '<p class="text-center text-red-400 py-8 col-span-3">Không tải được danh sách khóa học</p>';
  }
}

function renderCourseList(courses) {
  const container = document.getElementById('courseList');
  if (!courses.length) {
    container.innerHTML = '<p class="col-span-3 text-center text-gray-400 py-8">Chưa có khóa học nào</p>';
    return;
  }
  const isAdmin = currentUser?.role === 'ADMIN';
  container.innerHTML = courses.map(c => `
    <div class="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition">
      <div class="flex justify-between items-start mb-3">
        <div>
          <div class="font-bold text-gray-800">${c.name}</div>
          <div class="text-xs text-violet-600 font-semibold mt-1 bg-violet-50 px-2 py-0.5 rounded-full inline-block">${c.code}</div>
        </div>
        <div class="text-right flex-shrink-0 ml-2">
          <div class="text-lg font-bold text-blue-600">${c.credits}</div>
          <div class="text-xs text-gray-400">tín chỉ</div>
        </div>
      </div>
      ${c.description ? `<p class="text-sm text-gray-500 mb-3 line-clamp-2">${c.description}</p>` : ''}
      <div class="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t">
        <span><i class="fas fa-chalkboard-teacher mr-1"></i>${c.teacher || 'Chưa có'}</span>
        <span><i class="fas fa-users mr-1"></i>${c.students?.length ?? 0} sinh viên</span>
      </div>
      ${isAdmin ? `
        <div class="flex gap-2 mt-3">
          <button onclick='editCourse(${JSON.stringify(c)})' class="flex-1 text-xs text-blue-600 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-50 transition">
            <i class="fas fa-edit mr-1"></i>Sửa
          </button>
          <button onclick="deleteCourse('${c._id}','${c.name}')" class="flex-1 text-xs text-red-500 border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition">
            <i class="fas fa-trash mr-1"></i>Xóa
          </button>
        </div>` : ''}
    </div>`).join('');
}

function openCourseModal(data = null) {
  document.getElementById('courseModalTitle').textContent = data ? 'Cập nhật khóa học' : 'Thêm khóa học';
  document.getElementById('courseId').value = data?._id || '';
  document.getElementById('courseName').value = data?.name || '';
  document.getElementById('courseCode').value = data?.code || '';
  document.getElementById('courseCredits').value = data?.credits || '';
  document.getElementById('courseTeacher').value = data?.teacher || '';
  document.getElementById('courseDesc').value = data?.description || '';
  document.getElementById('courseModal').classList.remove('hidden');
}

function editCourse(c) { openCourseModal(c); }

async function saveCourse() {
  const id = document.getElementById('courseId').value;
  const name = document.getElementById('courseName').value.trim();
  const code = document.getElementById('courseCode').value.trim();
  const credits = parseInt(document.getElementById('courseCredits').value);
  if (!name || !code || !credits) { toast('Vui lòng nhập đủ thông tin bắt buộc', 'error'); return; }
  const body = { name, code, credits, teacher: document.getElementById('courseTeacher').value.trim(), description: document.getElementById('courseDesc').value.trim() };
  const res = await apiFetch(id ? `/courses/${id}` : '/courses', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(body)
  });
  if (!res) return;
  if (res.ok) {
    toast(id ? 'Cập nhật thành công' : 'Thêm khóa học thành công', 'success');
    closeModal('courseModal');
    loadCourses();
    loadDashboard();
  } else {
    const data = await res.json();
    toast(data.message || 'Lỗi khi lưu', 'error');
  }
}

async function deleteCourse(id, name) {
  if (!confirm(`Xóa khóa học "${name}"?`)) return;
  const res = await apiFetch(`/courses/${id}`, { method: 'DELETE' });
  if (!res) return;
  if (res.ok) { toast('Đã xóa khóa học', 'success'); loadCourses(); loadDashboard(); }
  else toast('Không thể xóa', 'error');
}

function populateCourseSelectors() {
  const opts = allCourses.map(c => `<option value="${c._id}">${c.name} (${c.code})</option>`).join('');
  ['gradeCourse','attCourseFilter','attCourse'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.value;
    el.innerHTML = `<option value="">-- Tất cả khóa học --</option>${opts}`;
    if (val) el.value = val;
  });
}

// ===================== GRADES =====================
function loadGradeSelectors() {
  populateStudentSelectors();
  loadGrades();
}

async function loadGrades() {
  const studentId = document.getElementById('gradeStudentFilter').value;
  const semester = document.getElementById('gradeSemesterFilter').value;
  let url = '/grades?';
  if (studentId) url += `studentId=${studentId}&`;
  if (semester) url += `semester=${semester}&`;
  const container = document.getElementById('gradeList');
  container.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i></div>';
  try {
    const res = await apiFetch(url);
    if (!res) return;
    const data = await res.json();
    const grades = data.data || data.grades || (Array.isArray(data) ? data : []);
    renderGrades(grades);
  } catch {
    container.innerHTML = '<p class="text-center text-red-400 py-8">Không tải được bảng điểm</p>';
  }
}

function renderGrades(grades) {
  const container = document.getElementById('gradeList');
  const isAdmin = currentUser?.role === 'ADMIN';
  if (!grades.length) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Chưa có điểm nào được nhập</p>';
    return;
  }
  const gradeBadge = g => {
    const colors = { A: 'green', 'B+': 'teal', B: 'blue', 'C+': 'cyan', C: 'yellow', 'D+': 'orange', D: 'amber', F: 'red' };
    const col = colors[g] || 'gray';
    return `<span class="px-2 py-0.5 bg-${col}-100 text-${col}-700 rounded-full text-xs font-bold">${g || '—'}</span>`;
  };
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b bg-gray-50">
            <th class="py-3 px-4 font-semibold">Sinh viên</th>
            <th class="py-3 px-4 font-semibold hidden md:table-cell">Khóa học</th>
            <th class="py-3 px-4 font-semibold">GK</th>
            <th class="py-3 px-4 font-semibold">CK</th>
            <th class="py-3 px-4 font-semibold">TB</th>
            <th class="py-3 px-4 font-semibold">Xếp loại</th>
            <th class="py-3 px-4 font-semibold">Kết quả</th>
            ${isAdmin ? '<th class="py-3 px-4 font-semibold text-right">Xóa</th>' : ''}
          </tr>
        </thead>
        <tbody class="divide-y">
          ${grades.map(g => `
            <tr class="hover:bg-gray-50 transition">
              <td class="py-3 px-4 font-medium text-gray-800">${g.student?.name || '—'}</td>
              <td class="py-3 px-4 text-gray-600 hidden md:table-cell">${g.course?.name || '—'}</td>
              <td class="py-3 px-4">${g.midtermScore ?? '—'}</td>
              <td class="py-3 px-4">${g.finalScore ?? '—'}</td>
              <td class="py-3 px-4 font-semibold">${g.averageScore ?? '—'}</td>
              <td class="py-3 px-4">${gradeBadge(g.letterGrade)}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${g.status === 'PASS' ? 'bg-green-100 text-green-700' : g.status === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}">
                  ${g.status === 'PASS' ? '✅ Đậu' : g.status === 'FAIL' ? '❌ Rớt' : '⏳ Chưa có'}
                </span>
              </td>
              ${isAdmin ? `<td class="py-3 px-4 text-right"><button onclick="deleteGrade('${g._id}')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button></td>` : ''}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function openGradeModal() {
  document.getElementById('gradeStudent').innerHTML = '<option value="">-- Chọn sinh viên --</option>' +
    allStudents.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
  document.getElementById('gradeCourse').innerHTML = '<option value="">-- Chọn khóa học --</option>' +
    allCourses.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  document.getElementById('gradeMidterm').value = '';
  document.getElementById('gradeFinal').value = '';
  document.getElementById('gradeYear').value = new Date().getFullYear();
  document.getElementById('gradeModal').classList.remove('hidden');
}

async function saveGrade() {
  const studentId = document.getElementById('gradeStudent').value;
  const courseId = document.getElementById('gradeCourse').value;
  const midtermScore = parseFloat(document.getElementById('gradeMidterm').value);
  const finalScore = parseFloat(document.getElementById('gradeFinal').value);
  const semester = document.getElementById('gradeSemester').value;
  const year = parseInt(document.getElementById('gradeYear').value);
  if (!studentId || !courseId) { toast('Vui lòng chọn sinh viên và khóa học', 'error'); return; }
  const res = await apiFetch('/grades', {
    method: 'POST',
    body: JSON.stringify({ studentId, courseId, midtermScore, finalScore, semester, year })
  });
  if (!res) return;
  const data = await res.json();
  if (res.ok) {
    toast('Lưu điểm thành công', 'success');
    closeModal('gradeModal');
    loadGrades();
  } else {
    toast(data.message || 'Lỗi khi lưu điểm', 'error');
  }
}

async function deleteGrade(id) {
  if (!confirm('Xóa điểm này?')) return;
  const res = await apiFetch(`/grades/${id}`, { method: 'DELETE' });
  if (res?.ok) { toast('Đã xóa điểm', 'success'); loadGrades(); }
  else toast('Không thể xóa', 'error');
}

// ===================== ATTENDANCE =====================
function loadAttendanceSelectors() {
  populateStudentSelectors();
  populateCourseSelectors();
  loadAttendance();
}

async function loadAttendance() {
  const studentId = document.getElementById('attStudentFilter').value;
  const courseId = document.getElementById('attCourseFilter').value;
  let url = '/attendance?';
  if (studentId) url += `studentId=${studentId}&`;
  if (courseId) url += `courseId=${courseId}&`;
  const container = document.getElementById('attendanceList');
  container.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i></div>';
  try {
    const res = await apiFetch(url);
    if (!res) return;
    const data = await res.json();
    const records = data.data || (Array.isArray(data) ? data : []);
    renderAttendance(records);
  } catch {
    container.innerHTML = '<p class="text-center text-red-400 py-8">Không tải được dữ liệu điểm danh</p>';
  }
}

function renderAttendance(records) {
  const container = document.getElementById('attendanceList');
  const isAdmin = currentUser?.role === 'ADMIN';
  if (!records.length) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Chưa có dữ liệu điểm danh</p>';
    return;
  }
  const statusBadge = s => {
    const map = {
      PRESENT: ['bg-green-100 text-green-700', '✅ Có mặt'],
      ABSENT: ['bg-red-100 text-red-700', '❌ Vắng'],
      LATE: ['bg-yellow-100 text-yellow-700', '⏰ Muộn'],
      EXCUSED: ['bg-blue-100 text-blue-700', '📄 Có phép']
    };
    const [cls, label] = map[s] || ['bg-gray-100 text-gray-500', s];
    return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold ${cls}">${label}</span>`;
  };
  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b bg-gray-50">
            <th class="py-3 px-4 font-semibold">Sinh viên</th>
            <th class="py-3 px-4 font-semibold hidden md:table-cell">Khóa học</th>
            <th class="py-3 px-4 font-semibold">Ngày</th>
            <th class="py-3 px-4 font-semibold">Trạng thái</th>
            <th class="py-3 px-4 font-semibold hidden lg:table-cell">Ghi chú</th>
            ${isAdmin ? '<th class="py-3 px-4 text-right font-semibold">Xóa</th>' : ''}
          </tr>
        </thead>
        <tbody class="divide-y">
          ${records.map(r => `
            <tr class="hover:bg-gray-50 transition">
              <td class="py-3 px-4 font-medium text-gray-800">${r.student?.name || '—'}</td>
              <td class="py-3 px-4 text-gray-600 hidden md:table-cell">${r.course?.name || '—'}</td>
              <td class="py-3 px-4 text-gray-500">${r.date ? new Date(r.date).toLocaleDateString('vi-VN') : '—'}</td>
              <td class="py-3 px-4">${statusBadge(r.status)}</td>
              <td class="py-3 px-4 text-gray-400 hidden lg:table-cell">${r.notes || '—'}</td>
              ${isAdmin ? `<td class="py-3 px-4 text-right"><button onclick="deleteAttendance('${r._id}')" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button></td>` : ''}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function openAttendanceModal() {
  document.getElementById('attStudent').innerHTML = '<option value="">-- Chọn sinh viên --</option>' +
    allStudents.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
  document.getElementById('attCourse').innerHTML = '<option value="">-- Chọn khóa học --</option>' +
    allCourses.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  document.getElementById('attDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('attNote').value = '';
  document.querySelector('[name=attStatus][value=PRESENT]').checked = true;
  document.getElementById('attendanceModal').classList.remove('hidden');
}

async function saveAttendance() {
  const studentId = document.getElementById('attStudent').value;
  const courseId = document.getElementById('attCourse').value;
  const date = document.getElementById('attDate').value;
  const status = document.querySelector('[name=attStatus]:checked')?.value;
  const notes = document.getElementById('attNote').value;
  if (!studentId || !courseId || !date || !status) { toast('Vui lòng điền đủ thông tin', 'error'); return; }
  const res = await apiFetch('/attendance', {
    method: 'POST',
    body: JSON.stringify({ studentId, courseId, date, status, notes })
  });
  if (!res) return;
  const data = await res.json();
  if (res.ok) {
    toast('Điểm danh thành công', 'success');
    closeModal('attendanceModal');
    loadAttendance();
  } else {
    toast(data.message || 'Lỗi khi điểm danh', 'error');
  }
}

async function deleteAttendance(id) {
  if (!confirm('Xóa bản ghi điểm danh này?')) return;
  const res = await apiFetch(`/attendance/${id}`, { method: 'DELETE' });
  if (res?.ok) { toast('Đã xóa', 'success'); loadAttendance(); }
  else toast('Không thể xóa', 'error');
}

// ===================== NOTIFICATIONS =====================
async function loadNotifications() {
  try {
    const res = await apiFetch('/notifications');
    if (!res) return;
    const data = await res.json();
    const notifs = data.data || data.notifications || (Array.isArray(data) ? data : []);
    renderNotifications(notifs);
    const unread = notifs.filter(n => !n.isRead).length;
    const badge = document.getElementById('notifBadge');
    if (unread > 0) {
      badge.textContent = unread;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  } catch {}
}

function renderNotifications(notifs) {
  const container = document.getElementById('notifList');
  if (!notifs.length) {
    container.innerHTML = '<div class="text-center text-gray-400 py-10"><i class="fas fa-bell-slash text-3xl mb-2"></i><p>Chưa có thông báo</p></div>';
    return;
  }
  const typeIcon = { INFO: 'ℹ️', WARNING: '⚠️', SUCCESS: '✅', ERROR: '❌' };
  container.innerHTML = notifs.map(n => `
    <div class="bg-white rounded-xl border p-4 ${n.isRead ? 'opacity-70' : 'border-blue-200 shadow-sm'} flex gap-4 items-start">
      <span class="text-xl flex-shrink-0 mt-0.5">${typeIcon[n.type] || '🔔'}</span>
      <div class="flex-1">
        <div class="font-semibold text-gray-800 text-sm">${n.title}</div>
        <div class="text-sm text-gray-500 mt-0.5">${n.message}</div>
        <div class="text-xs text-gray-300 mt-2">${n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</div>
      </div>
      ${!n.isRead ? `<button onclick="markRead('${n._id}')" class="text-xs text-blue-500 hover:underline flex-shrink-0">Đã đọc</button>` : ''}
    </div>`).join('');
}

async function markRead(id) {
  await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
  loadNotifications();
}

async function markAllRead() {
  await apiFetch('/notifications/read-all', { method: 'PUT' });
  loadNotifications();
  toast('Đã đánh dấu tất cả đã đọc', 'success');
}

// ===================== EXPORT & BACKUP =====================
async function exportData(path) {
  toast('Đang tải xuống...', 'info');
  try {
    const res = await apiFetch(`/export/${path}`);
    if (!res || !res.ok) { toast('Lỗi xuất dữ liệu', 'error'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${path.replace('/', '_')}.${path.endsWith('csv') ? 'csv' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Tải xuống thành công', 'success');
  } catch { toast('Không thể tải xuống', 'error'); }
}

async function createBackup() {
  toast('Đang tạo backup...', 'info');
  const res = await apiFetch('/backup', { method: 'POST' });
  if (!res) return;
  const data = await res.json();
  if (res.ok) { toast('Tạo backup thành công', 'success'); loadBackupList(); }
  else toast(data.message || 'Lỗi tạo backup', 'error');
}

async function loadBackupList() {
  const container = document.getElementById('backupList');
  if (!container) return;
  try {
    const res = await apiFetch('/backup');
    if (!res) return;
    const data = await res.json();
    const backups = data.files || data.backups || (Array.isArray(data) ? data : []);
    if (!backups.length) { container.innerHTML = '<p class="text-xs text-gray-400">Chưa có backup nào</p>'; return; }
    container.innerHTML = backups.slice(0, 5).map(b => `
      <div class="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
        <span class="text-gray-700">${b.filename || b.name || b}</span>
        <a href="/backup/${b.filename || b}" class="text-blue-500 hover:underline">Tải</a>
      </div>`).join('');
  } catch { container.innerHTML = '<p class="text-xs text-gray-400">Không tải được danh sách</p>'; }
}

// ===================== HEALTH =====================
async function loadHealth() {
  const hContainer = document.getElementById('healthData');
  const pContainer = document.getElementById('perfData');
  try {
    const [hRes, pRes] = await Promise.all([
      fetch(`${API}/health`),
      apiFetch('/performance')
    ]);
    if (hRes.ok) {
      const data = await hRes.json();
      hContainer.innerHTML = Object.entries(data).map(([k, v]) => `
        <div class="flex justify-between border-b pb-2">
          <span class="text-gray-500 capitalize">${k}</span>
          <span class="font-medium text-gray-800">${typeof v === 'object' ? JSON.stringify(v) : v}</span>
        </div>`).join('') || '<p class="text-gray-400">Không có dữ liệu</p>';
    }
    if (pRes && pRes.ok) {
      const data = await pRes.json();
      pContainer.innerHTML = Object.entries(data).slice(0, 10).map(([k, v]) => `
        <div class="flex justify-between border-b pb-2">
          <span class="text-gray-500 capitalize">${k}</span>
          <span class="font-medium text-gray-800">${typeof v === 'object' ? JSON.stringify(v) : v}</span>
        </div>`).join('') || '<p class="text-gray-400">Không có dữ liệu</p>';
    }
  } catch {
    hContainer.innerHTML = '<p class="text-red-400">Không thể lấy thông tin health</p>';
  }
}

// ===================== UTILS =====================
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

let toastTimer;
function toast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  document.getElementById('toastIcon').textContent = icons[type] || 'ℹ️';
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}
