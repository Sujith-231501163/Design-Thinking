/* Faculty Dashboard */
function renderFacultyDashboard() {
  return `
  <div class="bg-mesh"></div>
  <div class="dashboard-layout">
    ${renderSidebar('faculty')}
    <div class="main-content fade-in">
      <div id="facultyPageContent"></div>
    </div>
  </div>`;
}

async function initFacultyDashboard() {
  await loadFacultyData();
  renderFacultyPage('overview');
}

async function loadFacultyData() {
  const [students, analytics] = await Promise.all([API.getStudents(), API.getAnalytics()]);
  Store.set('students', students);
  Store.set('analytics', analytics);
}

function renderFacultyPage(page) {
  const el = document.getElementById('facultyPageContent');
  if (!el) return;
  if (page === 'overview') el.innerHTML = renderFacultyOverview();
  else if (page === 'students') el.innerHTML = renderStudentsTable();
  else if (page === 'analytics') el.innerHTML = renderAnalyticsPage();
}

function renderFacultyOverview() {
  const a = Store.get('analytics');
  if (!a) return '<p>Loading...</p>';
  const d = a.riskDistribution;
  return `
  <div class="page-header">
    <h1>Teacher Dashboard 📋</h1>
    <p>Overview of student risk distribution and key metrics</p>
  </div>
  <div class="stats-grid slide-in">
    <div class="card stat-card">
      <div class="stat-icon purple">👥</div>
      <div><div class="stat-value">${a.totalStudents}</div><div class="stat-label">Total Students</div></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon red">🔴</div>
      <div><div class="stat-value" style="color:var(--red)">${d.High}</div><div class="stat-label">High Risk</div></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon yellow">🟡</div>
      <div><div class="stat-value" style="color:var(--yellow)">${d.Medium}</div><div class="stat-label">Medium Risk</div></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon green">🟢</div>
      <div><div class="stat-value" style="color:var(--green)">${d.Low}</div><div class="stat-label">Low Risk</div></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon cyan">📊</div>
      <div><div class="stat-value">${a.avgAttendance}%</div><div class="stat-label">Avg Attendance</div></div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon purple">📈</div>
      <div><div class="stat-value">${a.avgCGPA}</div><div class="stat-label">Avg CGPA</div></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
    <div class="card">
      <h3 style="margin-bottom:16px;font-size:16px;font-weight:700">Risk Distribution</h3>
      ${renderDonut(d)}
    </div>
    <div class="card">
      <h3 style="margin-bottom:16px;font-size:16px;font-weight:700">Attendance vs Risk</h3>
      ${renderBarChart(a.attendanceVsRisk)}
    </div>
  </div>
  <div class="card" style="margin-top:24px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <h3 style="font-size:16px;font-weight:700">⚠️ High Risk Students</h3>
      <button class="btn btn-primary btn-sm" onclick="runPrediction()">🤖 Run ML Prediction</button>
    </div>
    ${renderMiniTable(a.highRiskStudents)}
  </div>`;
}

function renderDonut(d) {
  const total = d.High + d.Medium + d.Low;
  const r = 70, c = 2 * Math.PI * r;
  const pHigh = d.High / total, pMed = d.Medium / total, pLow = d.Low / total;
  return `
  <div class="donut-chart">
    <svg viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="${r}" stroke="var(--green)" stroke-dasharray="${c * pLow} ${c}" stroke-dashoffset="0" />
      <circle cx="90" cy="90" r="${r}" stroke="var(--yellow)" stroke-dasharray="${c * pMed} ${c}" stroke-dashoffset="${-c * pLow}" />
      <circle cx="90" cy="90" r="${r}" stroke="var(--red)" stroke-dasharray="${c * pHigh} ${c}" stroke-dashoffset="${-c * (pLow + pMed)}" />
    </svg>
    <div class="donut-center"><div class="value">${total}</div><div class="label">Students</div></div>
  </div>
  <div class="chart-legend">
    <span><span class="dot" style="background:var(--green)"></span> Low (${d.Low})</span>
    <span><span class="dot" style="background:var(--yellow)"></span> Medium (${d.Medium})</span>
    <span><span class="dot" style="background:var(--red)"></span> High (${d.High})</span>
  </div>`;
}

function renderBarChart(data) {
  const maxAtt = 100;
  const bars = data.map(d => {
    const color = d.risk === 'High' ? 'var(--red)' : d.risk === 'Medium' ? 'var(--yellow)' : 'var(--green)';
    const h = (d.attendance / maxAtt) * 100;
    return `<div class="chart-bar" style="height:${h}%;background:${color}"><div class="tooltip">${d.name}<br>Att: ${d.attendance}% | CGPA: ${d.cgpa}</div></div>`;
  }).join('');
  const labels = data.map(d => `<span>${d.name.split(' ')[0]}</span>`).join('');
  return `<div class="chart-bar-group">${bars}</div><div class="chart-labels">${labels}</div>`;
}

function renderMiniTable(students) {
  if (!students.length) return '<p style="color:var(--text-muted)">No high-risk students 🎉</p>';
  const rows = students.map(s => `
    <tr class="high-risk">
      <td><strong>${s.name}</strong></td>
      <td>${s.department}</td>
      <td style="color:${s.attendance<60?'var(--red)':'var(--text-primary)'}">${s.attendance}%</td>
      <td style="color:${s.cgpa<5?'var(--red)':'var(--text-primary)'}">${s.cgpa}</td>
      <td>${s.financial_status}</td>
      <td>${s.risk_reasons.map(r=>'<span style="font-size:11px;color:var(--red)">• '+r+'</span>').join('<br>')}</td>
    </tr>`).join('');
  return `<div class="table-container"><table><thead><tr><th>Name</th><th>Dept</th><th>Attendance</th><th>CGPA</th><th>Finance</th><th>Reasons</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* Students Management Page */
function renderStudentsTable() {
  const students = Store.get('students');
  const rows = students.map(s => `
    <tr class="${s.risk_level === 'High' ? 'high-risk' : ''}">
      <td><strong>${s.id}</strong></td>
      <td>${s.name}</td>
      <td>${s.department}</td>
      <td>${s.semester}</td>
      <td>${s.attendance}%</td>
      <td>${s.marks || '—'}</td>
      <td>${s.cgpa}</td>
      <td>${s.financial_status}</td>
      <td><span class="risk-badge ${s.risk_level.toLowerCase()}"><span class="risk-dot"></span>${s.risk_level}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="openEditModal('${s.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">❌</button>
        </div>
      </td>
    </tr>`).join('');

  return `
  <div class="page-header">
    <h1>Student Management 🎓</h1>
    <p>Add, edit, and manage student records</p>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
    <div class="filter-bar">
      <input class="form-input" placeholder="🔍 Search students..." oninput="filterStudents(this.value)" id="searchInput" />
      <select class="form-input" onchange="filterByRisk(this.value)" id="riskFilter">
        <option value="">All Risk Levels</option>
        <option value="High">🔴 High Risk</option>
        <option value="Medium">🟡 Medium Risk</option>
        <option value="Low">🟢 Low Risk</option>
      </select>
    </div>
    <div style="display:flex;gap:12px">
      <button class="btn btn-primary" onclick="openAddModal()">➕ Add Student</button>
      <button class="btn btn-success" onclick="runPrediction()">🤖 Predict All</button>
    </div>
  </div>
  <div class="card">
    <div class="table-container">
      <table><thead><tr>
        <th>ID</th><th>Name</th><th>Dept</th><th>Sem</th><th>Attendance</th><th>Marks</th><th>CGPA</th><th>Finance</th><th>Risk</th><th>Actions</th>
      </tr></thead><tbody id="studentsTableBody">${rows}</tbody></table>
    </div>
  </div>
  <div id="modalContainer"></div>`;
}

async function filterStudents(query) {
  const risk = document.getElementById('riskFilter')?.value || '';
  const students = await API.getStudents({ search: query, risk });
  Store.set('students', students);
  refreshTableBody();
}

async function filterByRisk(risk) {
  const search = document.getElementById('searchInput')?.value || '';
  const students = await API.getStudents({ risk, search });
  Store.set('students', students);
  refreshTableBody();
}

function refreshTableBody() {
  const students = Store.get('students');
  const tbody = document.getElementById('studentsTableBody');
  if (!tbody) return;
  tbody.innerHTML = students.map(s => `
    <tr class="${s.risk_level === 'High' ? 'high-risk' : ''}">
      <td><strong>${s.id}</strong></td><td>${s.name}</td><td>${s.department}</td><td>${s.semester}</td>
      <td>${s.attendance}%</td><td>${s.marks || '—'}</td><td>${s.cgpa}</td><td>${s.financial_status}</td>
      <td><span class="risk-badge ${s.risk_level.toLowerCase()}"><span class="risk-dot"></span>${s.risk_level}</span></td>
      <td><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="openEditModal('${s.id}')">✏️</button><button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">❌</button></div></td>
    </tr>`).join('');
}

function studentFormFields(s = {}) {
  return `
    <div class="form-group"><label>Name</label><input class="form-input" id="fName" value="${s.name||''}" required /></div>
    <div class="form-group"><label>Email</label><input class="form-input" id="fEmail" value="${s.email||''}" /></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
      <div class="form-group"><label>Attendance (%)</label><input class="form-input" id="fAtt" type="number" min="0" max="100" value="${s.attendance||''}" required /></div>
      <div class="form-group"><label>Marks</label><input class="form-input" id="fMarks" type="number" min="0" max="100" value="${s.marks||''}" /></div>
      <div class="form-group"><label>CGPA</label><input class="form-input" id="fCgpa" type="number" step="0.1" min="0" max="10" value="${s.cgpa||''}" required /></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="form-group"><label>Financial Status</label>
        <select class="form-input" id="fFin"><option ${s.financial_status==='High'?'selected':''}>High</option><option ${s.financial_status==='Medium'?'selected':''}>Medium</option><option ${s.financial_status==='Low'?'selected':''}>Low</option></select>
      </div>
      <div class="form-group"><label>Semester</label><input class="form-input" id="fSem" type="number" min="1" max="8" value="${s.semester||1}" /></div>
    </div>
    <div class="form-group"><label>Department</label>
      <select class="form-input" id="fDept"><option ${s.department==='Computer Science'?'selected':''}>Computer Science</option><option ${s.department==='Electronics'?'selected':''}>Electronics</option><option ${s.department==='Mechanical'?'selected':''}>Mechanical</option><option ${s.department==='Civil'?'selected':''}>Civil</option></select>
    </div>`;
}

function openAddModal() {
  document.getElementById('modalContainer').innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><h2>➕ Add New Student</h2>
      <form onsubmit="addStudent(event)">${studentFormFields()}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Add Student</button></div>
      </form>
    </div>
  </div>`;
}

function openEditModal(id) {
  const s = Store.get('students').find(x => x.id === id);
  document.getElementById('modalContainer').innerHTML = `
  <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal"><h2>✏️ Edit Student</h2>
      <form onsubmit="editStudent(event,'${id}')">${studentFormFields(s)}
        <div class="modal-actions"><button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save Changes</button></div>
      </form>
    </div>
  </div>`;
}

function closeModal() { document.getElementById('modalContainer').innerHTML = ''; }

async function addStudent(e) {
  e.preventDefault();
  await API.addStudent({
    name: document.getElementById('fName').value,
    email: document.getElementById('fEmail').value,
    attendance: +document.getElementById('fAtt').value,
    marks: +document.getElementById('fMarks').value,
    cgpa: +document.getElementById('fCgpa').value,
    financial_status: document.getElementById('fFin').value,
    semester: +document.getElementById('fSem').value,
    department: document.getElementById('fDept').value
  });
  closeModal();
  showToast('Student added successfully!');
  await loadFacultyData();
  renderFacultyPage('students');
}

async function editStudent(e, id) {
  e.preventDefault();
  await API.updateStudent(id, {
    name: document.getElementById('fName').value,
    email: document.getElementById('fEmail').value,
    attendance: +document.getElementById('fAtt').value,
    marks: +document.getElementById('fMarks').value,
    cgpa: +document.getElementById('fCgpa').value,
    financial_status: document.getElementById('fFin').value,
    semester: +document.getElementById('fSem').value,
    department: document.getElementById('fDept').value
  });
  closeModal();
  showToast('Student updated!');
  await loadFacultyData();
  renderFacultyPage('students');
}

async function deleteStudent(id) {
  if (!confirm('Delete this student?')) return;
  await API.deleteStudent(id);
  showToast('Student deleted');
  await loadFacultyData();
  renderFacultyPage('students');
}

async function runPrediction() {
  showToast('Running ML prediction...');
  await API.predictAll();
  showToast('Prediction complete! Risk levels updated.');
  await loadFacultyData();
  const el = document.getElementById('facultyPageContent');
  if (el) renderFacultyPage(Store.get('currentFacultyPage') || 'overview');
}

/* Analytics Page */
function renderAnalyticsPage() {
  const a = Store.get('analytics');
  if (!a) return '<p>Loading...</p>';
  const deptHtml = Object.entries(a.departmentRisk).map(([dept, d]) => `
    <div class="card" style="padding:20px">
      <h4 style="font-size:14px;font-weight:700;margin-bottom:12px">${dept}</h4>
      <div style="display:flex;gap:12px">
        <span class="risk-badge low">${d.Low} Low</span>
        <span class="risk-badge medium">${d.Medium} Med</span>
        <span class="risk-badge high">${d.High} High</span>
      </div>
      <div style="margin-top:12px;height:8px;border-radius:4px;overflow:hidden;display:flex;background:var(--bg-glass)">
        <div style="width:${d.Low/d.total*100}%;background:var(--green)"></div>
        <div style="width:${d.Medium/d.total*100}%;background:var(--yellow)"></div>
        <div style="width:${d.High/d.total*100}%;background:var(--red)"></div>
      </div>
    </div>`).join('');

  return `
  <div class="page-header"><h1>Analytics 📊</h1><p>Detailed risk analytics by department</p></div>
  <div class="stats-grid">${deptHtml}</div>
  <div class="card"><h3 style="margin-bottom:16px;font-size:16px;font-weight:700">Student Attendance Overview</h3>${renderBarChart(a.attendanceVsRisk)}</div>`;
}
