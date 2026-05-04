/* Shared Sidebar Component */
function renderSidebar(role) {
  const user = Store.get('user');
  const initials = user.name.split(' ').map(n => n[0]).join('');

  const studentNav = `
    <div class="nav-section">
      <div class="nav-section-title">Menu</div>
      <button class="nav-item active" data-page="overview" onclick="navTo(this,'overview')"><span class="icon">📊</span> My Dashboard</button>
    </div>`;

  const teacherNav = `
    <div class="nav-section">
      <div class="nav-section-title">Menu</div>
      <button class="nav-item active" data-page="overview" onclick="navTo(this,'overview')"><span class="icon">📊</span> Dashboard</button>
      <button class="nav-item" data-page="students" onclick="navTo(this,'students')"><span class="icon">🎓</span> Students</button>
      <button class="nav-item" data-page="analytics" onclick="navTo(this,'analytics')"><span class="icon">📈</span> Analytics</button>
    </div>`;

  return `
  <aside class="sidebar">
    <div class="sidebar-logo"><span class="icon">🛡️</span><h2>EduShield</h2></div>
    ${role === 'student' ? studentNav : teacherNav}
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">${initials}</div>
        <div><div class="user-name">${user.name}</div><div class="user-role">${user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}</div></div>
      </div>
      <button class="nav-item" onclick="logout()" style="margin-top:8px;color:var(--red)"><span class="icon">🚪</span> Logout</button>
    </div>
  </aside>`;
}

function navTo(el, page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  const user = Store.get('user');
  if (user.role === 'teacher') {
    Store.set('currentFacultyPage', page);
    renderFacultyPage(page);
  } else {
    renderStudentPage(page);
  }
}

function logout() {
  API.clearToken();
  Store.set('user', null);
  Store.set('page', 'login');
}

/* App Router */
function render() {
  const app = document.getElementById('app');
  const page = Store.get('page');
  if (page === 'login') {
    app.innerHTML = renderLogin();
  } else if (page === 'student-dashboard') {
    app.innerHTML = renderStudentDashboard();
    initStudentDashboard();
  } else if (page === 'faculty-dashboard') {
    app.innerHTML = renderFacultyDashboard();
    initFacultyDashboard();
  }
}

Store.on((key) => { if (key === 'page') render(); });

/* Boot — check for existing JWT session */
document.addEventListener('DOMContentLoaded', () => {
  const token = API.getToken();
  const user = API.getUser();
  if (token && user) {
    Store.set('user', user);
    Store.set('page', user.role === 'teacher' ? 'faculty-dashboard' : 'student-dashboard');
  } else {
    render();
  }
});
