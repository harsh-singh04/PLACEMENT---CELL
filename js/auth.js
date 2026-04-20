/* =============================================
   AUTH UI — Login · Signup (3 steps) · OTP
   ============================================= */

let signupRole    = 'student';
let pendingUser   = null;   // holds form data between step 1 → step 2

/* ══════════════════════════════════════════════
   TAB SWITCHING
══════════════════════════════════════════════ */
function switchTab(tab) {
  const loginForm  = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');

  if (tab === 'login') {
    loginForm.style.display  = 'block';
    signupForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    hideEl('login-error');
  } else {
    loginForm.style.display  = 'none';
    signupForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    showSignupStep(1);
  }
}

/* ══════════════════════════════════════════════
   STEP NAVIGATION
══════════════════════════════════════════════ */
function showSignupStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById('signup-step'+i).style.display = (i === n) ? 'block' : 'none';
  });
  updateStepBar(n);
}

function updateStepBar(active) {
  const dots  = [1,2,3].map(i => document.getElementById('step-dot-'+i));
  const lines = document.querySelectorAll('.step-line');

  dots.forEach((d,i) => {
    const n = i + 1;
    d.classList.toggle('active', n === active);
    d.classList.toggle('done',   n < active);
  });
  lines.forEach((l,i) => {
    l.classList.toggle('done', active > i+1);
  });
}

function backToStep1() {
  clearOTPState();
  showSignupStep(1);
  hideEl('signup-error');
  clearOTPBoxes();
}

/* ══════════════════════════════════════════════
   ROLE PICKER
══════════════════════════════════════════════ */
function pickRole(role) {
  signupRole = role;
  document.getElementById('rp-student').classList.toggle('active', role === 'student');
  document.getElementById('rp-admin').classList.toggle('active',   role === 'admin');
  document.getElementById('admin-code-wrap').style.display  = (role === 'admin')   ? 'block' : 'none';
  document.getElementById('student-fields').style.display   = (role === 'student') ? 'block' : 'none';
  hideEl('signup-error');
}

/* ══════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════ */
function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pwd   = document.getElementById('l-pwd').value;

  if (!email || !pwd) { showErr('login-error', 'Please enter your email and password.'); return; }

  const result = authenticateUser(email, pwd);
  if (!result.ok) { showErr('login-error', result.error); return; }

  setSession(result.user);
  redirect(result.user.role);
}

/* ══════════════════════════════════════════════
   STEP 1 → validate form → send OTP
══════════════════════════════════════════════ */
function sendOTP() {
  hideEl('signup-error');

  const firstName  = val('s-fname');
  const lastName   = val('s-lname');
  const email      = val('s-email');
  const pwd        = document.getElementById('s-pwd').value;
  const cpwd       = document.getElementById('s-cpwd').value;
  const adminCode  = signupRole === 'admin' ? val('s-admincode') : '';
  const branch     = signupRole === 'student' ? val('s-branch') : '';
  const batch      = signupRole === 'student' ? val('s-batch')  : '';
  const cgpa       = signupRole === 'student' ? val('s-cgpa')   : '';

  // ── Validation ──
  if (!firstName)           { showErr('signup-error', '⚠ First name is required.');           return; }
  if (!lastName)            { showErr('signup-error', '⚠ Last name is required.');            return; }
  if (!email)               { showErr('signup-error', '⚠ Email address is required.');        return; }
  if (!isValidEmail(email)) { showErr('signup-error', '⚠ Enter a valid email address.');      return; }
  if (pwd.length < 6)       { showErr('signup-error', '⚠ Password must be at least 6 characters.'); return; }
  if (pwd !== cpwd)         { showErr('signup-error', '⚠ Passwords do not match.');           return; }

  // Check if email already registered
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    showErr('signup-error', '⚠ An account with this email already exists. Try logging in.');
    return;
  }

  // Admin secret check
  if (signupRole === 'admin') {
    if (!adminCode || adminCode.trim() !== 'ADMIN@2026') {
      showErr('signup-error', '⚠ Invalid admin secret code.');
      return;
    }
  }

  // Store form data for step 3
  pendingUser = { firstName, lastName, email, password: pwd, role: signupRole, branch, batch, cgpa, adminCode };

  // Show loading state on button
  const btn = document.getElementById('btn-send-otp');
  btn.innerHTML = '<span class="btn-spinner"></span> Sending OTP…';
  btn.classList.add('loading');

  // Simulate slight delay (network call in real app)
  setTimeout(() => {
    btn.innerHTML = 'Send Verification OTP →';
    btn.classList.remove('loading');

    // Generate & "send" OTP
    initiateOTP(email);

    // Update email display in step 2
    document.getElementById('otp-email-display').textContent = email;

    // Move to step 2
    showSignupStep(2);
    clearOTPBoxes();

    // Focus first box
    setTimeout(() => {
      const boxes = document.querySelectorAll('.otp-box');
      if (boxes[0]) boxes[0].focus();
    }, 100);
  }, 900);
}

/* ══════════════════════════════════════════════
   RESEND OTP
══════════════════════════════════════════════ */
function resendOTP() {
  if (!pendingUser) return;
  clearOTPBoxes();
  hideEl('otp-error');

  // Re-enable verify button if it was disabled
  const btn = document.querySelector('#signup-step2 .btn-auth');
  if (btn) { btn.disabled = false; btn.textContent = 'Verify & Create Account ✓'; }

  const countdownEl = document.getElementById('otp-countdown');
  if (countdownEl) countdownEl.style.color = 'var(--accent)';

  initiateOTP(pendingUser.email);

  // Flash the dev hint
  const hint = document.getElementById('otp-devhint');
  if (hint) {
    hint.style.borderColor = 'rgba(100,255,218,0.5)';
    setTimeout(() => { hint.style.borderColor = 'rgba(233,69,96,0.35)'; }, 1200);
  }

  setTimeout(() => {
    const boxes = document.querySelectorAll('.otp-box');
    if (boxes[0]) boxes[0].focus();
  }, 80);
}

/* ══════════════════════════════════════════════
   OTP BOX — keyboard navigation & auto-advance
══════════════════════════════════════════════ */
function otpInput(el, idx) {
  const v = el.value.replace(/\D/g,'');
  el.value = v.slice(-1);   // keep only last digit

  el.classList.toggle('filled', !!el.value);
  el.classList.remove('error', 'success');
  hideEl('otp-error');

  // Auto-advance
  if (el.value && idx < 5) {
    const next = document.querySelectorAll('.otp-box')[idx + 1];
    if (next) next.focus();
  }

  // Auto-submit when all 6 filled
  const boxes = document.querySelectorAll('.otp-box');
  const code  = [...boxes].map(b => b.value).join('');
  if (code.length === 6) {
    setTimeout(verifyOTP, 150);
  }
}

function otpKey(event, idx) {
  const boxes = document.querySelectorAll('.otp-box');
  if (event.key === 'Backspace' && !boxes[idx].value && idx > 0) {
    boxes[idx - 1].focus();
    boxes[idx - 1].value = '';
    boxes[idx - 1].classList.remove('filled');
  }
  if (event.key === 'ArrowLeft'  && idx > 0) boxes[idx-1].focus();
  if (event.key === 'ArrowRight' && idx < 5) boxes[idx+1].focus();
  // Allow paste on any box
  if (event.key === 'v' && (event.ctrlKey || event.metaKey)) return;
}

// Handle paste on otp boxes
document.addEventListener('paste', function(e) {
  const focused = document.activeElement;
  if (!focused || !focused.classList.contains('otp-box')) return;
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'');
  const boxes = document.querySelectorAll('.otp-box');
  [...text.slice(0,6)].forEach((ch, i) => {
    if (boxes[i]) { boxes[i].value = ch; boxes[i].classList.add('filled'); }
  });
  const lastIdx = Math.min(text.length - 1, 5);
  if (boxes[lastIdx]) boxes[lastIdx].focus();
  if (text.length >= 6) setTimeout(verifyOTP, 150);
});

function clearOTPBoxes() {
  document.querySelectorAll('.otp-box').forEach(b => {
    b.value = ''; b.classList.remove('filled','error','success');
  });
}

function setOTPBoxState(state) {   // 'error' | 'success'
  document.querySelectorAll('.otp-box').forEach(b => {
    b.classList.remove('error','success');
    if (state) b.classList.add(state);
  });
}

/* ══════════════════════════════════════════════
   STEP 2 → VERIFY OTP
══════════════════════════════════════════════ */
function verifyOTP() {
  const boxes = document.querySelectorAll('.otp-box');
  const code  = [...boxes].map(b => b.value).join('');

  if (code.length < 6) {
    showErr('otp-error', '⚠ Please enter all 6 digits of the OTP.');
    return;
  }

  const result = verifyOTPCode(code);

  if (!result.ok) {
    setOTPBoxState('error');
    showErr('otp-error', '⚠ ' + result.error);
    // Clear boxes after a moment so user can retry
    setTimeout(() => { clearOTPBoxes(); document.querySelectorAll('.otp-box')[0]?.focus(); }, 900);
    return;
  }

  // OTP correct!
  setOTPBoxState('success');

  setTimeout(() => {
    // Register the user
    if (!pendingUser) return;
    const regResult = registerUser(pendingUser);
    if (!regResult.ok) {
      setOTPBoxState('error');
      showErr('otp-error', '⚠ ' + regResult.error);
      return;
    }

    setSession(regResult.user);
    showSignupStep(3);

    // Animate redirect bar then navigate
    setTimeout(() => {
      const fill = document.getElementById('redirect-fill');
      if (fill) fill.style.width = '100%';
    }, 100);

    setTimeout(() => redirect(regResult.user.role), 3100);
  }, 500);
}

/* ══════════════════════════════════════════════
   PASSWORD STRENGTH
══════════════════════════════════════════════ */
function checkStrength(val) {
  const wrap  = document.getElementById('pwd-strength-wrap');
  const fill  = document.getElementById('pwd-bar-fill');
  const label = document.getElementById('pwd-strength-label');
  if (!val) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';

  let score = 0;
  if (val.length >= 6)              score++;
  if (val.length >= 10)             score++;
  if (/[A-Z]/.test(val))           score++;
  if (/[0-9]/.test(val))           score++;
  if (/[^A-Za-z0-9]/.test(val))   score++;

  const levels = [
    { pct:'20%', color:'#ef476f', text:'Weak'      },
    { pct:'40%', color:'#ffd166', text:'Fair'      },
    { pct:'60%', color:'#ffd166', text:'Good'      },
    { pct:'80%', color:'#06d6a0', text:'Strong'    },
    { pct:'100%',color:'#64ffda', text:'Very Strong'}
  ];
  const lvl = levels[Math.min(score-1,4)] || levels[0];
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.text;
  label.style.color     = lvl.color;
}

/* ══════════════════════════════════════════════
   SHOW/HIDE PASSWORD
══════════════════════════════════════════════ */
function togglePwd(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') {
    inp.type = 'text'; btn.style.opacity = '0.9';
  } else {
    inp.type = 'password'; btn.style.opacity = '0.4';
  }
}

/* ══════════════════════════════════════════════
   LOGOUT (called from dashboard pages)
══════════════════════════════════════════════ */
function doLogout() {
  clearSession();
  const inPages = window.location.pathname.includes('/pages/');
  window.location.href = inPages ? '../index.html' : 'index.html';
}

/* ══════════════════════════════════════════════
   AUTH GUARD (called from admin/student pages)
══════════════════════════════════════════════ */
function checkAuth(expectedRole) {
  const user = getCurrentUser();
  if (!user || user.role !== expectedRole) {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? '../index.html' : 'index.html';
  }
}

/* ── Render user chip on dashboard ── */
function renderUserChip() {
  const user = getCurrentUser();
  if (!user) return;
  const nameEl   = document.getElementById('user-name');
  const avatarEl = document.getElementById('user-avatar');
  if (nameEl)   nameEl.textContent   = user.firstName + ' ' + user.lastName;
  if (avatarEl) avatarEl.textContent = (user.firstName[0] + (user.lastName[0]||'')).toUpperCase();
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function val(id)       { return document.getElementById(id)?.value.trim() || ''; }
function isValidEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
}
function hideEl(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function redirect(role) {
  window.location.href = role === 'admin'
    ? 'pages/admin.html'
    : 'pages/student.html';
}

/* Auto-redirect if already logged in */
(function autoRedirect() {
  if (!document.getElementById('form-login')) return;
  const user = getCurrentUser();
  if (user) redirect(user.role);
})();
