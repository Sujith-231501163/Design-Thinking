/* Login & Signup Page */
function renderLogin() {
  return `
  <div class="bg-mesh"></div>
  <div class="login-page">
    <div class="login-container">
      <div class="login-brand">
        <div class="logo">🛡️</div>
        <h1>EduShield</h1>
        <p>AI-powered dropout risk prediction and counselling system designed to support every student's academic journey.</p>
        <div class="features">
          <span>🤖 ML-Based Risk Prediction</span>
          <span>📊 Real-time Analytics Dashboard</span>
          <span>💬 AI Counselling Chatbot</span>
          <span>🔐 Secure JWT Authentication</span>
        </div>
      </div>
      <div class="login-form-side">
        <div id="authFormContainer">${loginFormHTML()}</div>
      </div>
    </div>
  </div>`;
}

function loginFormHTML() {
  return `
    <h2>Welcome Back</h2>
    <p class="subtitle">Sign in to continue to your dashboard</p>
    <div id="authError" class="login-error"></div>
    <form id="loginForm" onsubmit="handleLogin(event)">
      <div class="form-group"><label>Email</label>
        <input class="form-input" id="loginEmail" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form-group"><label>Password</label>
        <input class="form-input" id="loginPass" type="password" placeholder="Enter password" required />
      </div>
      <button type="submit" class="btn btn-primary login-btn" id="authBtn">Sign In</button>
    </form>
    <p style="text-align:center;margin-top:20px;font-size:14px;color:var(--text-secondary)">
      Don't have an account? <a href="#" onclick="showSignup()" style="color:var(--accent);font-weight:600;text-decoration:none">Sign Up</a>
    </p>
    <div class="demo-creds">
      <p>Demo Credentials</p>
      <code>Teacher: rajesh@admin.com / admin123</code><br/>
      <code>Student: aarav@student.edu / pass123</code><br/>
      <code>Student (High Risk): priya@student.edu / pass123</code>
    </div>`;
}

function signupFormHTML() {
  return `
    <h2>Create Account</h2>
    <p class="subtitle">Use @admin.com email for Teacher role</p>
    <div id="authError" class="login-error"></div>
    <form id="signupForm" onsubmit="handleSignup(event)">
      <div class="form-group"><label>Full Name</label>
        <input class="form-input" id="signupName" type="text" placeholder="John Doe" required />
      </div>
      <div class="form-group"><label>Email</label>
        <input class="form-input" id="signupEmail" type="email" placeholder="you@example.com" required />
      </div>
      <div class="form-group"><label>Password</label>
        <input class="form-input" id="signupPass" type="password" placeholder="Min 6 characters" required minlength="6" />
      </div>
      <div id="roleHint" style="padding:10px;border-radius:8px;font-size:13px;margin-bottom:12px;background:var(--bg-glass);color:var(--text-secondary)">
        ℹ️ Role will be assigned based on your email domain
      </div>
      <button type="submit" class="btn btn-primary login-btn" id="authBtn">Create Account</button>
    </form>
    <p style="text-align:center;margin-top:20px;font-size:14px;color:var(--text-secondary)">
      Already have an account? <a href="#" onclick="showLogin()" style="color:var(--accent);font-weight:600;text-decoration:none">Sign In</a>
    </p>`;
}

function showSignup() { document.getElementById('authFormContainer').innerHTML = signupFormHTML(); attachRoleHint(); }
function showLogin() { document.getElementById('authFormContainer').innerHTML = loginFormHTML(); }

function attachRoleHint() {
  const emailInput = document.getElementById('signupEmail');
  if (!emailInput) return;
  emailInput.addEventListener('input', () => {
    const hint = document.getElementById('roleHint');
    if (emailInput.value.toLowerCase().endsWith('@admin.com')) {
      hint.innerHTML = '👨‍🏫 You will be registered as a <strong style="color:var(--accent)">Teacher</strong>';
      hint.style.borderLeft = '3px solid var(--accent)';
    } else if (emailInput.value.includes('@')) {
      hint.innerHTML = '👨‍🎓 You will be registered as a <strong style="color:var(--cyan)">Student</strong>';
      hint.style.borderLeft = '3px solid var(--cyan)';
    } else {
      hint.innerHTML = 'ℹ️ Role will be assigned based on your email domain';
      hint.style.borderLeft = 'none';
    }
  });
}

function showAuthError(msg) {
  const el = document.getElementById('authError');
  if (el) { el.textContent = '❌ ' + msg; el.style.display = 'block'; }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('authBtn');
  btn.textContent = 'Signing in...'; btn.disabled = true;
  try {
    const { token, user } = await API.login(
      document.getElementById('loginEmail').value,
      document.getElementById('loginPass').value
    );
    API.setToken(token);
    API.setUser(user);
    Store.set('user', user);
    Store.set('page', user.role === 'teacher' ? 'faculty-dashboard' : 'student-dashboard');
  } catch (err) { showAuthError(err.message); }
  btn.textContent = 'Sign In'; btn.disabled = false;
}

async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('authBtn');
  btn.textContent = 'Creating account...'; btn.disabled = true;
  try {
    const { token, user } = await API.signup(
      document.getElementById('signupName').value,
      document.getElementById('signupEmail').value,
      document.getElementById('signupPass').value
    );
    API.setToken(token);
    API.setUser(user);
    Store.set('user', user);
    showToast('Account created! Role: ' + user.role);
    Store.set('page', user.role === 'teacher' ? 'faculty-dashboard' : 'student-dashboard');
  } catch (err) { showAuthError(err.message); }
  btn.textContent = 'Create Account'; btn.disabled = false;
}
