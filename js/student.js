/* =============================================
   STUDENT MODULE
   ============================================= */

let studentFilter = 'all';
let studentSearch = '';

function setStudentNav(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const map = { 'browse': 0, 'my-apps': 1 };
  const items = document.querySelectorAll('.nav-item');
  if (items[map[page]]) items[map[page]].classList.add('active');
}

function showStudentPage(page) {
  setStudentNav(page);
  const c = document.getElementById('main-content');
  if (page === 'browse')   c.innerHTML = renderBrowse();
  if (page === 'my-apps') c.innerHTML = renderMyApps();
  if (page === 'profile') c.innerHTML = renderProfile();
}

/* ---- BROWSE DRIVES ---- */
function renderBrowse() {
  const drives = getDrives();
  const filtered = drives.filter(d => {
    const matchStatus = studentFilter === 'all' || d.status === studentFilter;
    const q = studentSearch.toLowerCase();
    const matchSearch = !q ||
      d.company.toLowerCase().includes(q) ||
      d.role.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return `
    <div class="page-title">Placement Drives</div>
    <div class="page-sub">Discover and apply to the latest opportunities</div>

    <div class="filter-bar">
      <input class="search-input"
        placeholder="🔍  Search company, role, location…"
        value="${studentSearch}"
        oninput="studentSearch=this.value; document.getElementById('main-content').innerHTML=renderBrowse();" />
      ${['all','open','upcoming','closed'].map(f => `
        <button class="filter-pill ${studentFilter === f ? 'active' : ''}"
          onclick="studentFilter='${f}'; document.getElementById('main-content').innerHTML=renderBrowse();">
          ${f.charAt(0).toUpperCase() + f.slice(1)}
        </button>`).join('')}
    </div>

    ${filtered.length === 0
      ? `<div class="empty-state">
           <div class="empty-icon">🔎</div>
           <div class="empty-text">No drives match your search / filter.</div>
         </div>`
      : `<div class="drives-grid">${filtered.map(d => buildDriveCard(d)).join('')}</div>`}`;
}

function buildDriveCard(d) {
  const apps    = getApplications();
  const applied = apps.some(a => a.driveId === d.id);

  return `
    <div class="drive-card">
      <div class="dc-header">
        <div>
          <div class="company-name">${d.company}</div>
          <div class="dc-role">${d.role} &nbsp;·&nbsp; ${d.location}</div>
        </div>
        <div class="company-logo">${d.company.slice(0,2).toUpperCase()}</div>
      </div>

      <div class="dc-tags">
        <span class="badge ${d.status}">${d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span>
        <span class="tag neutral">${d.type}</span>
        <span class="tag neutral">Batch ${d.batch}</span>
      </div>

      <div class="dc-info">
        <div class="dc-info-item">
          <div class="dc-info-label">CTC</div>
          <div class="dc-info-val money">${d.ctc}</div>
        </div>
        <div class="dc-info-item">
          <div class="dc-info-label">Min CGPA</div>
          <div class="dc-info-val">${d.cgpa}+</div>
        </div>
        <div class="dc-info-item">
          <div class="dc-info-label">Deadline</div>
          <div class="dc-info-val">${d.deadline}</div>
        </div>
        <div class="dc-info-item">
          <div class="dc-info-label">Skills</div>
          <div class="dc-info-val" style="font-size:0.78rem;color:var(--muted)">
            ${d.skills.slice(0,2).join(', ')}${d.skills.length > 2 ? '…' : ''}
          </div>
        </div>
      </div>

      <div class="dc-footer">
        <button class="btn-sm btn-view" onclick="openDriveDetail(${d.id})">View Details</button>
        ${applied
          ? `<div class="applied-stamp">✓ Applied</div>`
          : d.status === 'closed'
            ? `<button class="btn-sm btn-apply" disabled>Closed</button>`
            : `<button class="btn-sm btn-apply" onclick="openApplyModal(${d.id})">Apply Now</button>`}
      </div>
    </div>`;
}

/* ---- MY APPLICATIONS ---- */
function renderMyApps() {
  const apps   = getApplications();
  const drives = getDrives();

  return `
    <div class="page-title">My Applications</div>
    <div class="page-sub">${apps.length} application${apps.length !== 1 ? 's' : ''} submitted</div>

    ${apps.length === 0
      ? `<div class="empty-state">
           <div class="empty-icon">📝</div>
           <div class="empty-text">
             You haven't applied to any drives yet.<br/><br/>
             <button class="btn-sm btn-apply" style="width:auto;padding:8px 20px;"
               onclick="showStudentPage('browse')">Browse Drives →</button>
           </div>
         </div>`
      : `<div class="drives-grid">
           ${apps.map(a => {
             const d = drives.find(x => x.id === a.driveId);
             if (!d) return '';
             return `
               <div class="drive-card">
                 <div class="dc-header">
                   <div>
                     <div class="company-name">${d.company}</div>
                     <div class="dc-role">${d.role}</div>
                   </div>
                   <div class="company-logo">${d.company.slice(0,2).toUpperCase()}</div>
                 </div>
                 <div class="dc-tags">
                   <span class="badge open">Applied</span>
                   <span class="tag neutral">${d.type}</span>
                 </div>
                 <div class="dc-info">
                   <div class="dc-info-item">
                     <div class="dc-info-label">CTC</div>
                     <div class="dc-info-val money">${d.ctc}</div>
                   </div>
                   <div class="dc-info-item">
                     <div class="dc-info-label">Location</div>
                     <div class="dc-info-val">${d.location}</div>
                   </div>
                   <div class="dc-info-item">
                     <div class="dc-info-label">Applied On</div>
                     <div class="dc-info-val">${a.date}</div>
                   </div>
                   <div class="dc-info-item">
                     <div class="dc-info-label">Status</div>
                     <div class="dc-info-val" style="color:var(--success)">Under Review</div>
                   </div>
                 </div>
                 <div class="dc-footer">
                   <button class="btn-sm btn-view" onclick="openDriveDetail(${d.id})">View Drive</button>
                 </div>
               </div>`;
           }).join('')}
         </div>`}`;
}

/* ---- DRIVE DETAIL MODAL ---- */
function openDriveDetail(id) {
  const drives = getDrives();
  const apps   = getApplications();
  const d      = drives.find(x => x.id === id);
  if (!d) return;
  const applied = apps.some(a => a.driveId === id);

  document.getElementById('modal-content').innerHTML = `
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div class="modal-title">${d.company}</div>
    <div style="color:var(--muted);font-size:0.85rem;margin-top:4px">${d.role}</div>
    <div class="modal-badge-row">
      <span class="badge ${d.status}">${d.status.charAt(0).toUpperCase() + d.status.slice(1)}</span>
      <span class="badge new">${d.type}</span>
      ${applied ? `<span class="applied-stamp">✓ Applied</span>` : ''}
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Compensation & Location</div>
      <div class="detail-grid">
        <div class="detail-item"><label>CTC / Stipend</label><p class="money">${d.ctc}</p></div>
        <div class="detail-item"><label>Location</label><p>${d.location}</p></div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Eligibility</div>
      <div class="detail-grid">
        <div class="detail-item"><label>Minimum CGPA</label><p>${d.cgpa}+</p></div>
        <div class="detail-item"><label>Eligible Batch</label><p>${d.batch}</p></div>
        <div class="detail-item"><label>Last Date to Apply</label><p>${d.deadline}</p></div>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Required Skills</div>
      <div class="skills-row">
        ${d.skills.map(s => `<span class="tag">${s}</span>`).join('')}
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">About This Drive</div>
      <div class="desc-text">${d.desc}</div>
    </div>

    <div class="modal-footer">
      ${applied
        ? `<button class="btn-modal-apply" disabled>Already Applied ✓</button>`
        : d.status === 'closed'
          ? `<button class="btn-modal-apply" disabled>Applications Closed</button>`
          : `<button class="btn-modal-apply" onclick="closeModal(); openApplyModal(${d.id})">Apply for This Drive →</button>`}
    </div>`;

  document.getElementById('modal-overlay').classList.add('open');
}

/* ---- APPLICATION FORM MODAL ---- */
function openApplyModal(driveId) {
  const drives = getDrives();
  const d = drives.find(x => x.id === driveId);
  if (!d) return;
  const user = getCurrentUser();

  document.getElementById('modal-content').innerHTML = `
    <button class="modal-close" onclick="closeModal()">✕</button>
    <div class="modal-title">Apply to ${d.company}</div>
    <div style="color:var(--muted);font-size:0.85rem;margin-top:4px;margin-bottom:1.5rem">
      ${d.role} &nbsp;·&nbsp; ${d.location}
    </div>
    <div style="background:rgba(100,255,218,0.07);border:1px solid rgba(100,255,218,0.2);border-radius:10px;padding:0.65rem 1rem;font-size:0.8rem;color:var(--success);margin-bottom:1rem">
      ✓ Your profile details have been pre-filled. Review before submitting.
    </div>

    <div class="field-group" style="margin-bottom:1rem">
      <label>Full Name *</label>
      <input id="app-name" placeholder="Your full name" value="${user ? user.firstName+' '+user.lastName : ''}" />
    </div>
    <div class="field-group" style="margin-bottom:1rem">
      <label>Email Address *</label>
      <input id="app-email" type="email" placeholder="your@college.edu" value="${user ? user.email : ''}" />
    </div>
    <div class="field-group" style="margin-bottom:1rem">
      <label>CGPA</label>
      <input id="app-cgpa" placeholder="e.g. 8.2" value="${user ? user.cgpa : ''}" />
    </div>
    <div class="field-group" style="margin-bottom:1rem">
      <label>Branch / Department</label>
      <input id="app-branch" placeholder="e.g. Computer Science & Engineering" value="${user ? user.branch : ''}" />
    </div>
    <div class="field-group" style="margin-bottom:1.5rem">
      <label>Cover Note (optional)</label>
      <textarea id="app-note" rows="3"
        placeholder="Why are you interested in this role?"></textarea>
    </div>

    <div class="modal-footer">
      <button class="btn-modal-apply" onclick="submitApplication(${driveId})">
        Submit Application 🚀
      </button>
    </div>`;

  document.getElementById('modal-overlay').classList.add('open');
}

/* ---- SUBMIT APPLICATION ---- */
function submitApplication(driveId) {
  const name  = document.getElementById('app-name').value.trim();
  const email = document.getElementById('app-email').value.trim();

  if (!name || !email) {
    showToast('Name and Email are required!', 'error');
    return;
  }

  const apps = getApplications();

  // Prevent duplicate
  if (apps.some(a => a.driveId === driveId)) {
    showToast('You have already applied for this drive.', 'error');
    closeModal();
    return;
  }

  apps.push({
    driveId,
    name,
    email,
    cgpa:   document.getElementById('app-cgpa').value.trim(),
    branch: document.getElementById('app-branch').value.trim(),
    note:   document.getElementById('app-note').value.trim(),
    date:   new Date().toISOString().split('T')[0]
  });

  saveApplications(apps);

  const drives = getDrives();
  const d = drives.find(x => x.id === driveId);
  closeModal();
  showToast(`Application submitted to ${d ? d.company : 'company'}! 🎉`, 'success');

  // Re-render current page
  document.getElementById('main-content').innerHTML = renderBrowse();
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
    ${user.branch ? `<div style="font-size:0.72rem;color:var(--muted)">${user.branch} · ${user.batch||''}</div>` : ''}
    <div style="font-size:0.7rem;margin-top:6px;background:rgba(83,52,131,0.2);color:#a78bfa;border-radius:6px;padding:2px 8px;display:inline-block">Student</div>`;
}

/* ---- PROFILE PAGE ---- */
function renderProfile() {
  const user = getCurrentUser();
  if (!user) return '';
  return `
    <div class="page-title">My Profile</div>
    <div class="page-sub">Your account details and academic info</div>
    <div class="panel" style="max-width:520px">
      <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem">
        <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#533483,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;flex-shrink:0">
          ${(user.firstName[0]+(user.lastName[0]||'')).toUpperCase()}
        </div>
        <div>
          <div style="font-size:1.2rem;font-weight:700">${user.firstName} ${user.lastName}</div>
          <div style="color:var(--muted);font-size:0.83rem">${user.email}</div>
          <span class="badge" style="margin-top:6px;display:inline-flex;background:rgba(83,52,131,0.2);color:#a78bfa;border:1px solid rgba(167,139,250,0.3)">Student</span>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">Personal Info</div>
        <div class="detail-grid">
          <div class="detail-item"><label>First Name</label><p>${user.firstName}</p></div>
          <div class="detail-item"><label>Last Name</label><p>${user.lastName}</p></div>
          <div class="detail-item"><label>Email</label><p style="font-size:0.82rem">${user.email}</p></div>
        </div>
      </div>
      <div class="detail-section">
        <div class="detail-section-title">Academic Info</div>
        <div class="detail-grid">
          <div class="detail-item"><label>Branch / Dept.</label><p>${user.branch || '—'}</p></div>
          <div class="detail-item"><label>Batch Year</label><p>${user.batch || '—'}</p></div>
          <div class="detail-item"><label>CGPA</label><p style="color:var(--success);font-family:var(--mono)">${user.cgpa || '—'}</p></div>
        </div>
      </div>
    </div>`;
}
