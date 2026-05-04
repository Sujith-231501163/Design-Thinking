/* EduShield API Client — JWT Auth */
const API = {
  base: '/api',
  getToken() { return localStorage.getItem('edushield_token'); },
  setToken(t) { localStorage.setItem('edushield_token', t); },
  clearToken() { localStorage.removeItem('edushield_token'); localStorage.removeItem('edushield_user'); },
  getUser() { const u = localStorage.getItem('edushield_user'); return u ? JSON.parse(u) : null; },
  setUser(u) { localStorage.setItem('edushield_user', JSON.stringify(u)); },

  async request(method, path, body, auth = true) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (auth && this.getToken()) opts.headers['Authorization'] = 'Bearer ' + this.getToken();
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    if (res.status === 401 && auth) { this.clearToken(); Store.set('page', 'login'); throw new Error('Session expired'); }
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Request failed'); }
    return res.json();
  },
  signup(name, email, password) { return this.request('POST', '/auth/signup', { name, email, password }, false); },
  login(email, password) { return this.request('POST', '/auth/login', { email, password }, false); },
  getStudents(params = {}) { const q = new URLSearchParams(params).toString(); return this.request('GET', '/students' + (q ? '?' + q : '')); },
  getMyData() { return this.request('GET', '/my-data'); },
  addStudent(data) { return this.request('POST', '/students', data); },
  updateStudent(id, data) { return this.request('PUT', '/students/' + id, data); },
  deleteStudent(id) { return this.request('DELETE', '/students/' + id); },
  predictAll() { return this.request('POST', '/predict'); },
  getAnalytics() { return this.request('GET', '/analytics'); },
  chat(message) { return this.request('POST', '/chatbot', { message }); },
  chatWelcome() { return this.request('POST', '/chatbot/welcome', {}); }
};

const Store = {
  _state: { user: null, page: 'login', students: [], analytics: null },
  _listeners: [],
  get(key) { return this._state[key]; },
  set(key, val) { this._state[key] = val; this._listeners.forEach(fn => fn(key, val)); },
  on(fn) { this._listeners.push(fn); },
};

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function formatMsg(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
