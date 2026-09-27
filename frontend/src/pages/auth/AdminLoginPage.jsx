import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { validateEmail } from '@/utils/validation.js';
import { Role, DEMO_CREDENTIALS } from '@/constants/enums.js';

export default function AdminLoginPage() {
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
      await login({ email, password }, Role.ADMIN);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell theme-admin">
      <aside className="brand">
        <div className="brand-head">
          <div className="brand-logo"><i className="fa-solid fa-server" /></div>
          <div><small>SMHC</small><h1>Admin Console</h1></div>
        </div>
        <div className="brand-mid">
          <h2>Platform administration &amp; oversight.</h2>
          <p>Manage users, therapists, analytics, and platform-level reports from one secure dashboard.</p>
        </div>
        <div className="brand-points">
          <div><i className="fa-solid fa-users-gear" /> User &amp; therapist management</div>
          <div><i className="fa-solid fa-chart-bar" /> Platform analytics</div>
          <div><i className="fa-solid fa-triangle-exclamation" /> SOS alert oversight</div>
        </div>
        <div className="brand-foot"><i className="fa-solid fa-lock" /> Admin-only restricted access</div>
      </aside>

      <section className="panel">
        <div className="panel-head">
          <span className="kicker"><i className="fa-solid fa-shield-halved" /> Administrator Login</span>
          <div className="greet">Secure Access</div>
          <p>This area is restricted to authorised platform administrators only.</p>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          <div className="privacy-note" style={{ cursor: 'pointer' }} onClick={() => { setEmail(DEMO_CREDENTIALS.admin.email); setPassword(DEMO_CREDENTIALS.admin.password); }} title="Click to fill demo credentials">
            <i className="fa-solid fa-circle-info" />
            <span>Demo: <strong>admin@mindmate.com</strong> / <strong>demo1234</strong> — <em style={{ textDecoration: 'underline' }}>click to fill</em></span>
          </div>

          <div className="field">
            <label htmlFor="a-email"><i className="fa-solid fa-envelope" /> Admin Email</label>
            <div className={`input-wrap${errors.email ? ' has-error' : ''}`}>
              <input id="a-email" type="email" placeholder="admin@mindmate.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }} autoComplete="email" />
            </div>
            {errors.email && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="a-pw"><i className="fa-solid fa-lock" /> Admin Password</label>
            <div className={`input-wrap${errors.password ? ' has-error' : ''}`}>
              <input id="a-pw" type="password" placeholder="Your password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }} autoComplete="current-password" />
            </div>
            {errors.password && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {errors.password}</p>}
          </div>

          <button type="submit" className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>
            {!isLoading && <><i className="fa-solid fa-right-to-bracket" /> Sign In to Admin</>}
          </button>
        </form>

        <div className="hint">
          <Link to="/login">Back to Patient Login</Link>
        </div>
        <div className="panel-foot"><i className="fa-solid fa-lock" /> Restricted area</div>
      </section>
    </main>
  );
}
