import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/stores/toastStore.jsx';
import { resetPassword } from '@/services/authService.js';
import { validatePassword } from '@/utils/validation.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!validatePassword(password)) e.password = 'Password must be at least 8 characters with letters and a number.';
    if (password !== confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPassword({ token, password });
      setSuccess(true);
      showToast('Password reset successfully! Redirecting to login…', 'success');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      showToast(err.message || 'Reset failed. The link may have expired.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell theme-user">
      <aside className="brand">
        <div className="brand-head">
          <div className="brand-logo"><i className="fa-solid fa-heart-pulse" /></div>
          <div><small>SMHC</small><h1>Mind Mate</h1></div>
        </div>
        <div className="brand-mid">
          <h2>Secure your account.</h2>
          <p>Enter a new password to regain access to your Mind Mate account.</p>
        </div>
        <div className="brand-foot"><i className="fa-solid fa-lock" /> Your data stays private, always.</div>
      </aside>

      <section className="panel">
        <div className="panel-head">
          <div className="greet">Reset Password</div>
          <p>Enter and confirm your new password below.</p>
        </div>

        {!token && (
          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            <i className="fa-solid fa-triangle-exclamation" />
            <span>No reset token found. Please use the link from your email.</span>
          </div>
        )}

        <form noValidate onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="rp-pw"><i className="fa-solid fa-lock" /> New Password</label>
            <div className={`input-wrap${errors.password ? ' has-error' : ''}`}>
              <input
                id="rp-pw" type="password" autoComplete="new-password"
                placeholder="Min 8 characters with a number"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                disabled={loading || success || !token}
              />
            </div>
            {errors.password && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {errors.password}</p>}
          </div>

          <div className="field">
            <label htmlFor="rp-confirm"><i className="fa-solid fa-lock" /> Confirm Password</label>
            <div className={`input-wrap${errors.confirm ? ' has-error' : ''}`}>
              <input
                id="rp-confirm" type="password" autoComplete="new-password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: '' })); }}
                disabled={loading || success || !token}
              />
            </div>
            {errors.confirm && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {errors.confirm}</p>}
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full${loading ? ' btn-loading' : ''}`}
            disabled={loading || success || !token}
          >
            {!loading && <><i className="fa-solid fa-key" /> Reset Password</>}
          </button>
        </form>

        <div className="hint">
          Remembered it? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Back to Sign In</a>
        </div>

        <div className={`success-cover${success ? ' show' : ''}`}>
          <div className="check"><i className="fa-solid fa-check" /></div>
          <h2>Password Reset!</h2>
          <p>Your password has been changed. Redirecting you to login…</p>
        </div>
      </section>
    </main>
  );
}
