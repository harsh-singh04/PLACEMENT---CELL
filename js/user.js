/* =============================================
   USER ACCOUNT MANAGEMENT
   Stores all registered users in localStorage
   ============================================= */

const ADMIN_SECRET = 'ADMIN@2026';   // Coordinator sets this

/* ---- Storage helpers ---- */

function getUsers() {
  const raw = localStorage.getItem('pc_users');
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem('pc_users', JSON.stringify(users));
}

/* ---- Register a new user ---- */
// Returns { ok: true } or { ok: false, error: "message" }
function registerUser({ firstName, lastName, email, password, role, branch, batch, cgpa, adminCode }) {
  const users = getUsers();

  // Email already taken?
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists. Try logging in.' };
  }

  // Admin secret check
  if (role === 'admin') {
    if (!adminCode || adminCode.trim() !== ADMIN_SECRET) {
      return { ok: false, error: 'Invalid admin secret code. Contact your placement coordinator.' };
    }
  }

  const user = {
    id:        Date.now(),
    firstName: firstName.trim(),
    lastName:  lastName.trim(),
    email:     email.toLowerCase().trim(),
    password,               // plain-text for demo; hash in production
    role,
    createdAt: new Date().toISOString(),
    // Student-specific
    branch:    branch  || '',
    batch:     batch   || '',
    cgpa:      cgpa    || ''
  };

  users.push(user);
  saveUsers(users);
  return { ok: true, user };
}

/* ---- Authenticate a user ---- */
// Returns { ok: true, user } or { ok: false, error: "message" }
function authenticateUser(email, password) {
  const users = getUsers();
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return { ok: false, error: 'No account found with this email. Please create an account.' };
  }
  if (user.password !== password) {
    return { ok: false, error: 'Incorrect password. Please try again.' };
  }

  return { ok: true, user };
}

/* ---- Get current logged-in user object ---- */
function getCurrentUser() {
  const raw = sessionStorage.getItem('pc_session');
  return raw ? JSON.parse(raw) : null;
}

/* ---- Save session ---- */
function setSession(user) {
  sessionStorage.setItem('pc_session', JSON.stringify({
    id:        user.id,
    firstName: user.firstName,
    lastName:  user.lastName,
    email:     user.email,
    role:      user.role,
    branch:    user.branch,
    batch:     user.batch,
    cgpa:      user.cgpa
  }));
}

/* ---- Clear session ---- */
function clearSession() {
  sessionStorage.removeItem('pc_session');
}
