import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/services/authService.js';
import { validateEmail } from '@/utils/validation.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    setIsLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell theme-user" style={{ maxWidth: 600, gridTemplateColumns: '1fr' }}>
      <section className="panel" style={{ padding: '52px 48px 40px' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="success-cover show" style={{ position: 'static', opacity: 1, visibility: 'visible' }}>
              <div className="check"><i className="fa-solid fa-envelope-circle-check" /></div>
              <h2>Check your inbox</h2>
              <p>We've sent password reset instructions to <strong>{email}</strong>. Please check your email.</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: 12 }}>Back to Sign In</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="panel-head">
              <div className="greet">Forgot your password?</div>
              <p>Enter your registered email and we'll send reset instructions.</p>
            </div>
            <form noValidate onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="fp-email"><i className="fa-solid fa-envelope" /> Email Address</label>
                <div className={`input-wrap${error ? ' has-error' : ''}`}>
                  <input
                    id="fp-email" type="email" autoComplete="email"
                    placeholder="your@email.com" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  />
                </div>
                {error && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}
              </div>
              <button type="submit" className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>
                {!isLoading && <><i className="fa-solid fa-paper-plane" /> Send Reset Link</>}
              </button>
            </form>
            <div className="hint"><Link to="/login">Back to Sign In</Link></div>
          </>
        )}
      </section>
    </main>
  );
}
