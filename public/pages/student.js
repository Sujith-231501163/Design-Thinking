/* Student Dashboard — read-only view of own data + chatbot for medium/high risk */
function renderStudentDashboard() {
  return `
  <div class="bg-mesh"></div>
  <div class="dashboard-layout">
    ${renderSidebar('student')}
    <div class="main-content fade-in"><div id="studentPageContent"><p style="color:var(--text-secondary)">Loading your data...</p></div></div>
  </div>
  <div id="floatingChatContainer"></div>`;
}

async function initStudentDashboard() {
  try {
    const student = await API.getMyData();
    Store.set('currentStudent', student);
    renderStudentPage('overview');
    initFloatingChat();
  } catch (err) {
    document.getElementById('studentPageContent').innerHTML =
      `<div class="card" style="text-align:center;padding:48px"><h2>⚠️ No Student Record</h2><p style="color:var(--text-secondary);margin-top:12px">${err.message}</p><p style="color:var(--text-muted);margin-top:8px;font-size:13px">Your teacher needs to add your details using your email address.</p></div>`;
  }
}

function renderStudentPage(page) {
  const el = document.getElementById('studentPageContent');
  if (!el) return;
  const student = Store.get('currentStudent');
  if (!student) return;
  if (page === 'overview') el.innerHTML = renderStudentOverview(student);
  // Chat is now handled globally via floating widget
}

function renderStudentOverview(s) {
  const riskColor = s.risk_level === 'High' ? 'var(--red)' : s.risk_level === 'Medium' ? 'var(--yellow)' : 'var(--green)';
  const reasonsHtml = s.risk_reasons.length > 0
    ? s.risk_reasons.map(r => `<li>⚠️ ${r}</li>`).join('')
    : '<li>✅ No risk factors detected</li>';
  const updated = new Date(s.last_updated).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit' });

  return `
  <div class="page-header">
    <h1>Welcome, ${s.name} 👋</h1>
    <p>Here's your academic overview and risk assessment <em>(read-only)</em></p>
  </div>
  <div class="profile-grid slide-in">
    <div class="card profile-card">
      <div class="profile-avatar">${s.name.split(' ').map(n=>n[0]).join('')}</div>
      <div class="profile-name">${s.name}</div>
      <div class="profile-dept">${s.department} • Semester ${s.semester}</div>
      <div class="profile-details">
        <div class="detail-item">
          <div class="detail-value" style="color:${s.attendance<60?'var(--red)':s.attendance<75?'var(--yellow)':'var(--green)'}">${s.attendance}%</div>
          <div class="detail-label">Attendance</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${s.marks || '—'}</div>
          <div class="detail-label">Marks</div>
        </div>
        <div class="detail-item">
          <div class="detail-value" style="color:${s.cgpa<5?'var(--red)':s.cgpa<7?'var(--yellow)':'var(--green)'}">${s.cgpa}</div>
          <div class="detail-label">CGPA</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${s.financial_status}</div>
          <div class="detail-label">Financial Status</div>
        </div>
      </div>
    </div>
    <div class="card risk-display">
      <div class="risk-circle ${s.risk_level.toLowerCase()}" style="--confidence:${s.risk_confidence}">
        <div class="risk-level-text" style="color:${riskColor}">${s.risk_level} Risk</div>
        <div class="risk-confidence">${Math.round(s.risk_confidence * 100)}% confidence</div>
      </div>
      <ul class="risk-reasons">${reasonsHtml}</ul>
      <p style="font-size:12px;color:var(--text-muted);margin-top:12px">Last updated: ${updated}</p>
    </div>
  </div>
  ${s.risk_level === 'High' ? '<div class="card" style="border-color:rgba(239,68,68,0.3);margin-top:12px"><p style="color:var(--red);font-weight:600">⚠️ You are flagged as high risk. Please use the AI Counsellor for personalized guidance.</p></div>' : ''}
  ${s.risk_level === 'Low' ? '<div class="card" style="border-color:rgba(34,197,94,0.3);margin-top:12px"><p style="color:var(--green);font-weight:600">✅ You are at low risk. Keep up the great work! The chatbot is available for medium/high risk students.</p></div>' : ''}`;
}

/* Floating Chat Logic */
function initFloatingChat() {
  const container = document.getElementById('floatingChatContainer');
  if (!container) return;
  const student = Store.get('currentStudent');
  
  container.innerHTML = `
    <button class="floating-chat-btn" onclick="toggleChat()">💬</button>
    <div class="chat-panel" id="chatPanel">
      <div class="chat-header">
        <h3>AI Counsellor</h3>
        <button class="chat-close-btn" onclick="toggleChat()">×</button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div id="chatSuggestions" class="chat-suggestions"></div>
      ${student && student.risk_level === 'High' ? '<button class="counsellor-btn" onclick="showToast(\'Request sent to campus counsellor!\')">🆘 Request Human Counsellor</button>' : ''}
      <div class="chat-input-bar">
        <input class="form-input" id="chatInput" placeholder="Type your message..." onkeydown="if(event.key==='Enter')sendChat()" />
        <button class="btn btn-primary" onclick="sendChat()">Send</button>
      </div>
    </div>
  `;
  
  API.chatWelcome().then(res => {
    appendBotMsg(res.text, res.suggestions, res.cards);
  }).catch(console.error);
}

function toggleChat() {
  const panel = document.getElementById('chatPanel');
  if (panel) panel.classList.toggle('active');
}

function showTypingIndicator() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'chat-msg bot typing';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTypingIndicator() {
  const ind = document.getElementById('typingIndicator');
  if (ind) ind.remove();
}

function appendBotMsg(text, suggestions, cards = []) {
  hideTypingIndicator();
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  
  let html = '<div class="msg-text">' + formatMsg(text) + '</div>';
  if (cards && cards.length > 0) {
    html += '<div class="chat-cards-container">';
    cards.forEach(c => {
      html += `<a href="${c.link}" target="_blank" class="chat-card">
        <div class="chat-card-title">${c.title}</div>
        <div class="chat-card-desc">${c.description}</div>
      </a>`;
    });
    html += '</div>';
  }
  
  div.innerHTML = html;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  
  const sugEl = document.getElementById('chatSuggestions');
  if (sugEl) {
    if (suggestions && suggestions.length) {
      sugEl.innerHTML = suggestions.map(s => `<button class="chat-suggestion" onclick="sendSuggestion('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('');
    } else {
      sugEl.innerHTML = '';
    }
  }
}

function appendUserMsg(text) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'chat-msg user';
  div.innerHTML = '<div class="msg-text">' + text + '</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendUserMsg(msg);
  const sugEl = document.getElementById('chatSuggestions');
  if (sugEl) sugEl.innerHTML = '';
  showTypingIndicator();
  try {
    const res = await API.chat(msg);
    setTimeout(() => {
      appendBotMsg(res.text, res.suggestions, res.cards);
    }, 600); // Simulate typing delay
  } catch (err) { 
    hideTypingIndicator();
    appendBotMsg('Sorry, something went wrong. Please try again.', []); 
  }
}

function sendSuggestion(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}
