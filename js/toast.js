/* =============================================
   TOAST NOTIFICATIONS
   ============================================= */

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast-msg ${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3200);
}
