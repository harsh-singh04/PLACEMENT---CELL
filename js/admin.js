/* =============================================
   ADMIN MODULE
   ============================================= */

let currentAdminPage = 'dashboard';

function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const map = {
    'dashboard':    0,
    'all-drives':   1,
    'add-drive':    2,
    'applications': 3
  };
  const items = document.querySelectorAll('.nav-item');
  if (items[map[page]]) items[map[page]].classList.add('active');
}

function showPage(page) {
  currentAdminPage = page;
  setActiveNav(page);
  const c = document.getElementById('main-content');
  if (page === 'dashboard')    c.innerHTML = renderDashboard();
  if (page === 'all-drives')   c.innerHTML = renderAllDrives();
  if (page === 'add-drive')    c.innerHTML = renderAddDriveForm();
  if (page === 'applications') c.innerHTML = renderApplications();
  if (page === 'profile')      c.innerHTML = renderProfile();
}

/* ---- DASHBOARD ---- */
function renderDashboard() {
  const drives = getDrives();
  const apps   = getApplications();
  const open   = drives.filter(d => d.status === 'open').length;
  const cos    = [...new Set(drives.map(d => d.company))].length;

  const recent = drives.slice(-5).reverse();

  return `
    <div class="page-title">Dashboard</div>
    <div class="page-sub">Overview of all placement activities</div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-val accent">${drives.length}</div><div class="stat-label">Total Drives</div></div>
      <div class="stat-card"><div class="stat-val success">${open}</div><div class="stat-label">Active Drives</div></div>
      <div class="stat-card"><div class="stat-val warn">${apps.length}</div><div class="stat-label">Applications</div></div>
      <div class="stat-card"><div class="stat-val info">${cos}</div><div class="stat-label">Companies</div></div>
    </div>

    <div class="section-header">
      <div class="section-title">Recent Drives</div>
      <button class="btn-sm btn-view" style="width:auto;padding:6px 16px;" onclick="showPage('all-drives')">View All →</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Company</th><th>Role</th><th>Type</th><th>CTC</th><th>Status</th><th>Deadline</th></tr>
        </thead>
        <tbody>
          ${recent.length === 0
            ? '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:2rem">No drives yet</td></tr>'
            : recent.map(d => `
              <tr>
                <td class="td-company">${d.company}</td>
                <td>${d.role}</td>
                <td><span class="badge new">${d.type}</span></td>
                <td style="color:var(--success);font-family:var(--mono);font-size:0.82rem">${d.ctc}</td>
                <td><span class="badge ${d.status}">${cap(d.status)}</span></td>
                <td style="color:var(--muted);font-size:0.82rem">${d.deadline}</td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---- ALL DRIVES ---- */
function renderAllDrives() {
  const drives = getDrives();
  return `
    <div class="page-title">All Drives</div>
    <div class="page-sub">Manage and control all placement drives</div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Company</th><th>Role</th><th>CTC</th><th>Batch</th><th>Status</th><th>Deadline</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${drives.length === 0
            ? '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:2rem">No drives yet. <a href="#" onclick="showPage(\'add-drive\');return false;" style="color:var(--accent)">Add one →</a></td></tr>'
            : drives.map(d => `
              <tr>
                <td class="td-company">${d.company}</td>
                <td>${d.role}</td>
                <td style="color:var(--success);font-family:var(--mono);font-size:0.82rem">${d.ctc}</td>
                <td style="color:var(--muted)">${d.batch}</td>
                <td><span class="badge ${d.status}">${cap(d.status)}</span></td>
                <td style="color:var(--muted);font-size:0.82rem">${d.deadline}</td>
                <td>
                  <div class="td-actions">
                    <button class="btn-icon" onclick="toggleDriveStatus(${d.id})">${d.status === 'open' ? '🔒 Close' : '✅ Open'}</button>
                    <button class="btn-icon del" onclick="deleteDrive(${d.id})">🗑 Delete</button>
                  </div>
                </td>
              </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ---- ADD DRIVE FORM ---- */
function renderAddDriveForm() {
  return `
    <div class="page-title">Add New Drive</div>
    <div class="page-sub">Publish a new placement opportunity for students</div>

    <div class="panel">
      <div class="panel-title">🏢 Company Details</div>
      <div class="form-grid">
        <div class="field-group">
          <label>Company Name *</label>
          <input id="f-company" placeholder="e.g. Google" />
        </div>
        <div class="field-group">
          <label>Role / Position *</label>
          <input id="f-role" placeholder="e.g. Software Engineer" />
        </div>
        <div class="field-group">
          <label>Job Type</label>
          <select id="f-type">
            <option>Full-time</option>
            <option>Internship</option>
            <option>Part-time</option>
          </select>
        </div>
        <div class="field-group">
          <label>CTC / Stipend</label>
          <input id="f-ctc" placeholder="e.g. 12 LPA or 60k/mo" />
        </div>
        <div class="field-group">
          <label>Location</label>
          <input id="f-loc" placeholder="e.g. Bangalore" />
        </div>
        <div class="field-group">
          <label>Application Deadline</label>
          <input id="f-deadline" type="date" />
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">🎓 Eligibility Criteria</div>
      <div class="form-grid">
        <div class="field-group">
          <label>Minimum CGPA</label>
          <input id="f-cgpa" placeholder="e.g. 7.0" />
        </div>
        <div class="field-group">
          <label>Eligible Batch / Year</label>
          <input id="f-batch" placeholder="e.g. 2026" />
        </div>
        <div class="field-group full">
          <label>Required Skills (comma-separated)</label>
          <input id="f-skills" placeholder="e.g. Python, DSA, SQL, Communication" />
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">📄 Drive Info</div>
      <div class="form-grid">
        <div class="field-group">
          <label>Drive Status</label>
          <select id="f-status" style="max-width:200px">
            <option value="open">Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      <div class="field-group" style="margin-top:1rem">
        <label>Description / Selection Process</label>
        <textarea id="f-desc" rows="4"
          placeholder="Describe the drive, number of rounds, selection process, etc."></textarea>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn-cancel" onclick="showPage('all-drives')">Cancel</button>
      <button class="btn-submit" onclick="submitNewDrive()">🚀 Publish Drive</button>
    </div>`;
}

/* ---- APPLICATIONS ---- */
function renderApplications() {
  const apps   = getApplications();
  const drives = getDrives();

  return `
    <div class="page-title">Student Applications</div>
    <div class="page-sub">${apps.length} total application${apps.length !== 1 ? 's' : ''} received</div>

    ${apps.length === 0
      ? `<div class="empty-state">
           <div class="empty-icon">📭</div>
           <div class="empty-text">No applications received yet.</div>
         </div>`
      : `<div class="table-wrap">
           <table>
             <thead>
               <tr><th>Student Name</th><th>Email</th><th>Company</th><th>Role</th><th>CGPA</th><th>Branch</th><th>Applied On</th></tr>
             </thead>
             <tbody>
               ${apps.map(a => {
                 const d = drives.find(x => x.id === a.driveId);
                 return `<tr>
                   <td class="td-company">${a.name}</td>
                   <td style="color:var(--muted);font-size:0.82rem">${a.email}</td>
                   <td>${d ? d.company : '—'}</td>
                   <td>${d ? d.role : '—'}</td>
                   <td style="color:var(--info)">${a.cgpa || '—'}</td>
                   <td style="color:var(--muted)">${a.branch || '—'}</td>
                   <td style="color:var(--muted);font-size:0.8rem">${a.date}</td>
                 </tr>`;
               }).join('')}
             </tbody>
           </table>
         </div>`}`;
}

/* ---- ACTIONS ---- */
function submitNewDrive() {
  const company = document.getElementById('f-company').value.trim();
  const role    = document.getElementById('f-role').value.trim();
  if (!company || !role) {
    showToast('Company name and Role are required!', 'error');
    return;
  }

  const drives = getDrives();
  const drive = {
    id:       getNextId(),
    company,
    role,
    type:     document.getElementById('f-type').value,
    ctc:      document.getElementById('f-ctc').value.trim()     || 'TBD',
    location: document.getElementById('f-loc').value.trim()     || 'Remote',
    deadline: document.getElementById('f-deadline').value       || '2026-12-31',
    cgpa:     document.getElementById('f-cgpa').value.trim()    || '6.0',
    batch:    document.getElementById('f-batch').value.trim()   || '2026',
    skills:   document.getElementById('f-skills').value
                .split(',').map(s => s.trim()).filter(Boolean),
    status:   document.getElementById('f-status').value,
    desc:     document.getElementById('f-desc').value.trim()    || 'Details to be announced.'
  };

  drives.push(drive);
  saveDrives(drives);
  showToast(`Drive published: ${company} – ${role} 🎉`, 'success');
  showPage('all-drives');
}

function toggleDriveStatus(id) {
  const drives = getDrives();
  const d = drives.find(x => x.id === id);
  if (!d) return;
  d.status = d.status === 'open' ? 'closed' : 'open';
  saveDrives(drives);
  showToast(`Drive status set to "${d.status}"`, 'success');
  showPage('all-drives');
}

function deleteDrive(id) {
  if (!confirm('Are you sure you want to delete this drive?')) return;
  let drives = getDrives();
  let apps   = getApplications();
  drives = drives.filter(x => x.id !== id);
  apps   = apps.filter(a => a.driveId !== id);
  saveDrives(drives);
  saveApplications(apps);
  showToast('Drive deleted.', 'error');
  showPage('all-drives');
}

/* ---- UTILS ---- */
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ---- SIDEBAR PROFILE ---- */
function renderSidebarProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const el = document.getElementById('sidebar-profile');
  if (!el) return;
  el.innerHTML = `
    <div style="font-weight:600;color:var(--text);margin-bottom:4px">${user.firstName} ${user.lastName}</div>
    <div style="font-size:0.73rem;margin-bottom:2px">${user.email}</div>
    <div style="font-size:0.7rem;margin-top:6px;background:var(--tag-bg);color:var(--accent);border-radius:6px;padding:2px 8px;display:inline-block">Admin</div>`;
}

/* ---- PROFILE PAGE ---- */
function renderProfile() {
  const user = getCurrentUser();
  if (!user) return '';
  return `
    <div class="page-title">My Profile</div>
    <div class="page-sub">Your account details</div>
    <div class="panel" style="max-width:520px">
      <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem">
        <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,var(--accent),var(--accent3));display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;flex-shrink:0">
          ${(user.firstName[0]+(user.lastName[0]||'')).toUpperCase()}
        </div>
        <div>
          <div style="font-size:1.2rem;font-weight:700">${user.firstName} ${user.lastName}</div>
          <div style="color:var(--muted);font-size:0.83rem">${user.email}</div>
          <span class="badge new" style="margin-top:6px;display:inline-flex">Admin</span>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">Account Info</div>
        <div class="detail-grid">
          <div class="detail-item"><label>First Name</label><p>${user.firstName}</p></div>
          <div class="detail-item"><label>Last Name</label><p>${user.lastName}</p></div>
          <div class="detail-item"><label>Email</label><p style="font-size:0.82rem">${user.email}</p></div>
          <div class="detail-item"><label>Role</label><p>Administrator</p></div>
        </div>
      </div>
    </div>`;
}
