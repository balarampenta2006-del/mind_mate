import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { validateEmail, validatePassword } from '@/utils/validation.js';
import { Role, DEMO_CREDENTIALS } from '@/constants/enums.js';

export default function UserLoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/user/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function validate() {
    const e = {};
    if (!validateEmail(email)) e.email = 'Please enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login({ email, password }, Role.USER);
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_CREDENTIALS.user.email);
    setPassword(DEMO_CREDENTIALS.user.password);
    setErrors({});
  }

  return (
    <main className="auth-shell theme-user">
      <aside className="brand">
        <div className="brand-head">
          <div className="brand-logo"><i className="fa-solid fa-heart-pulse" /></div>
          <div>
            <small>SMHC</small>
            <h1>Mental Health Companion</h1>
          </div>
        </div>
        <div className="brand-mid">
          <h2>Your space to feel heard, understood &amp; supported.</h2>
          <p>A calm, private place where your mental wellbeing comes first. Join thousands who start their wellness journey here every day.</p>
        </div>
        <div className="brand-points">
          <div><i className="fa-solid fa-shield-halved" /> Confidential &amp; private sessions</div>
          <div><i className="fa-solid fa-user-doctor" /> Verified, caring professionals</div>
          <div><i className="fa-solid fa-moon" /> Guided tools for daily calm</div>
        </div>
        <div className="brand-foot"><i className="fa-solid fa-lock" /> Your data stays private, always.</div>
      </aside>

      <section className="panel">
        <div className="panel-head">
          <div className="greet">Welcome back</div>
          <p>Sign in to your Mind Mate account to continue your wellness journey.</p>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          {/* Demo credentials hint */}
          <div className="privacy-note" style={{ cursor: 'pointer' }} onClick={fillDemo} title="Click to fill demo credentials">
            <i className="fa-solid fa-circle-info" />
            <span>Demo: <strong>user@mindmate.com</strong> / <strong>demo1234</strong> — <em style={{ textDecoration: 'underline' }}>click to fill</em></span>
          </div>

          <div className="field">
            <label htmlFor="email"><i className="fa-solid fa-envelope" /> Email Address</label>
            <div className={`input-wrap${errors.email ? ' has-error' : ''}`}>
              <input
                id="email" type="email" autoComplete="email"
                placeholder="your@email.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                aria-describedby={errors.email ? 'email-err' : undefined}
              />
            </div>
            {errors.email && <p className="error-msg show" id="email-err"><i className="fa-solid fa-circle-exclamation" /> {errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="password"><i className="fa-solid fa-lock" /> Password</label>
            <div className={`input-wrap${errors.password ? ' has-error' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                placeholder="Your password" value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                aria-describedby={errors.password ? 'pw-err' : undefined}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}
              >
                <i className={`fa-solid ${showPw ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {errors.password && <p className="error-msg show" id="pw-err"><i className="fa-solid fa-circle-exclamation" /> {errors.password}</p>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: 16, marginTop: -8 }}>
            <Link to="/forgot-password" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-dark)', fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>
            {!isLoading && <><i className="fa-solid fa-right-to-bracket" /> Sign In</>}
          </button>
        </form>

        <div className="hint">
          Don't have an account?{' '}
          <Link to="/register">Create one — it's free</Link>
        </div>

        <div className="panel-foot">
          <i className="fa-solid fa-lock" /> Secured and private
        </div>
      </section>
    </main>
  );
}
