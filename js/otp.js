/* =============================================
   OTP ENGINE
   - Generates a 6-digit OTP
   - Manages 10-min countdown timer
   - Manages 30-sec resend cooldown
   - Verifies OTP entered by user
   ============================================= */

const OTP_EXPIRY_MS  = 10 * 60 * 1000;   // 10 minutes
const RESEND_WAIT_S  = 30;               // seconds before resend allowed

let _otpValue      = null;
let _otpEmail      = null;
let _otpExpiresAt  = null;
let _otpAttempts   = 0;
const MAX_ATTEMPTS = 5;

let _countdownInterval = null;
let _resendInterval    = null;

/* ─── Generate & "send" OTP ─── */
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Initiates OTP for the given email.
 * In a real app you would POST to your backend here and the
 * backend would call SendGrid / Nodemailer / AWS SES etc.
 * For this demo we just store the OTP in memory and show it
 * in the dev-hint box.
 */
function initiateOTP(email) {
  // Clear any previous
  clearOTPState();

  _otpValue     = generateOTP();
  _otpEmail     = email;
  _otpExpiresAt = Date.now() + OTP_EXPIRY_MS;
  _otpAttempts  = 0;

  console.log(`[OTP] Generated for ${email}: ${_otpValue}`);

  // Show in dev-hint box
  const hint = document.getElementById('otp-devhint-code');
  if (hint) hint.textContent = _otpValue;

  // Start countdown
  startCountdown();

  // Start resend cooldown
  startResendCooldown();

  return _otpValue;   // returned so caller can confirm it was created
}

/* ─── Verify ─── */
function verifyOTPCode(entered) {
  if (!_otpValue || !_otpExpiresAt) {
    return { ok: false, error: 'No OTP found. Please request a new one.' };
  }
  if (Date.now() > _otpExpiresAt) {
    clearOTPState();
    return { ok: false, error: 'OTP has expired. Please request a new one.' };
  }
  if (_otpAttempts >= MAX_ATTEMPTS) {
    clearOTPState();
    return { ok: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  _otpAttempts++;

  if (entered.trim() !== _otpValue) {
    const left = MAX_ATTEMPTS - _otpAttempts;
    return {
      ok: false,
      error: `Incorrect OTP. ${left} attempt${left !== 1 ? 's' : ''} remaining.`
    };
  }

  clearOTPState();
  return { ok: true };
}

/* ─── Countdown display (MM:SS) ─── */
function startCountdown() {
  clearInterval(_countdownInterval);
  const el = document.getElementById('otp-countdown');

  _countdownInterval = setInterval(() => {
    const remaining = _otpExpiresAt - Date.now();
    if (!el) { clearInterval(_countdownInterval); return; }
    if (remaining <= 0) {
      el.textContent = '00:00';
      el.style.color = 'var(--danger)';
      clearInterval(_countdownInterval);
      // grey out the verify button
      const btn = document.querySelector('#signup-step2 .btn-auth');
      if (btn) { btn.disabled = true; btn.textContent = 'OTP Expired — Resend'; }
      return;
    }
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    // turn red in last 60 s
    el.style.color = remaining < 60000 ? 'var(--danger)' : 'var(--accent)';
  }, 500);
}

/* ─── Resend cooldown (30 s) ─── */
function startResendCooldown() {
  clearInterval(_resendInterval);
  const btn   = document.getElementById('btn-resend');
  const label = document.getElementById('resend-timer');
  if (!btn) return;

  btn.disabled = true;
  let secs = RESEND_WAIT_S;
  if (label) label.textContent = `(${secs}s)`;

  _resendInterval = setInterval(() => {
    secs--;
    if (label) label.textContent = secs > 0 ? `(${secs}s)` : '';
    if (secs <= 0) {
      clearInterval(_resendInterval);
      btn.disabled = false;
    }
  }, 1000);
}

/* ─── Clear all state ─── */
function clearOTPState() {
  _otpValue     = null;
  _otpEmail     = null;
  _otpExpiresAt = null;
  _otpAttempts  = 0;
  clearInterval(_countdownInterval);
  clearInterval(_resendInterval);
}
