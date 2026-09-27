import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { validateEmail } from '@/utils/validation.js';
import { Role, DEMO_CREDENTIALS } from '@/constants/enums.js';

export default function TherapistLoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e = {};
    if (!validateEmail(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ email, password }, Role.THERAPIST);
      navigate('/therapist/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell theme-therapist">
      <aside className="brand">
        <div className="brand-head">
          <div className="brand-logo"><i className="fa-solid fa-user-doctor" /></div>
          <div><small>SMHC</small><h1>Therapist Portal</h1></div>
        </div>
        <div className="brand-mid">
          <h2>Support your patients. Grow your practice.</h2>
          <p>Access your patient dashboard, manage availability, and send wellness notes — all from one place.</p>
        </div>
        <div className="brand-points">
          <div><i className="fa-solid fa-calendar" /> Manage your appointment slots</div>
          <div><i className="fa-solid fa-chart-line" /> View patient mood trends</div>
          <div><i className="fa-solid fa-comments" /> Send text-based advice</div>
        </div>
        <div className="brand-foot"><i className="fa-solid fa-lock" /> Therapist-only secure access</div>
      </aside>

      <section className="panel">
        <div className="panel-head">
          <span className="kicker"><i className="fa-solid fa-user-doctor" /> Therapist Login</span>
          <div className="greet">Welcome, Doctor</div>
          <p>Sign in with your registered therapist credentials.</p>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          <div className="privacy-note" style={{ cursor: 'pointer' }} onClick={() => { setEmail(DEMO_CREDENTIALS.therapist.email); setPassword(DEMO_CREDENTIALS.therapist.password); }} title="Click to fill demo credentials">
            <i className="fa-solid fa-circle-info" />
            <span>Demo: <strong>therapist@mindmate.com</strong> / <strong>demo1234</strong> — <em style={{ textDecoration: 'underline' }}>click to fill</em></span>
          </div>

          <div className="field">
            <label htmlFor="t-email"><i className="fa-solid fa-envelope" /> Email</label>
            <div className={`input-wrap${errors.email ? ' has-error' : ''}`}>
              <input id="t-email" type="email" placeholder="doctor@clinic.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }} autoComplete="email" />
            </div>
            {errors.email && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="t-pw"><i className="fa-solid fa-lock" /> Password</label>
            <div className={`input-wrap${errors.password ? ' has-error' : ''}`}>
              <input id="t-pw" type="password" placeholder="Your password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }} autoComplete="current-password" />
            </div>
            {errors.password && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {errors.password}</p>}
          </div>

          <button type="submit" className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>
            {!isLoading && <><i className="fa-solid fa-right-to-bracket" /> Sign In to Portal</>}
          </button>
        </form>

        <div className="hint">
          Not a therapist? <Link to="/login">Patient Login</Link> · <Link to="/admin/login">Admin</Link>
        </div>
        <div className="panel-foot"><i className="fa-solid fa-lock" /> Secured and private</div>
      </section>
    </main>
  );
}
