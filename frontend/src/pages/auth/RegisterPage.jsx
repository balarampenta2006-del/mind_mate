import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import {
  validateEmail, validatePassword, validateName,
  validatePhone, validateDob,
} from '@/utils/validation.js';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function set(field) {
    return (e) => { setForm((p) => ({ ...p, [field]: e.target.value })); setErrors((p) => ({ ...p, [field]: '' })); };
  }

  function validate() {
    const e = {};
    if (!validateName(form.name)) e.name = 'Enter your full name (2–50 characters).';
    if (!validateEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!validatePhone(form.phone)) e.phone = 'Enter a 10-digit mobile number.';
    if (!validateDob(form.dob)) e.dob = 'Enter a valid date of birth (you must be at least 13).';
    if (!validatePassword(form.password)) e.password = 'Password must be at least 8 characters with letters and a number.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, dob: form.dob, password: form.password });
      navigate('/user/dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  const field = (id, label, type, placeholder, key) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap${errors[key] ? ' has-error' : ''}`}>
        <input id={id} type={type} placeholder={placeholder} value={form[key]} onChange={set(key)} autoComplete={id} />
      </div>
      {errors[key] && <p className="error-msg show"><i className="fa-solid fa-circle-exclamation" /> {errors[key]}</p>}
    </div>
  );

  return (
    <main className="auth-shell theme-user">
      <aside className="brand">
        <div className="brand-head">
          <div className="brand-logo"><i className="fa-solid fa-heart-pulse" /></div>
          <div><small>SMHC</small><h1>Mental Health Companion</h1></div>
        </div>
        <div className="brand-mid">
          <h2>Begin your journey to better mental wellbeing today.</h2>
          <p>Create your free account and access personalised support, guided meditations, and professional therapy — all in one place.</p>
        </div>
        <div className="brand-points">
          <div><i className="fa-solid fa-check" /> Free to get started</div>
          <div><i className="fa-solid fa-check" /> AI-powered wellness insights</div>
          <div><i className="fa-solid fa-check" /> Connect with real therapists</div>
        </div>
        <div className="brand-foot"><i className="fa-solid fa-lock" /> Your data is safe with us.</div>
      </aside>

      <section className="panel" style={{ overflowY: 'auto' }}>
        <div className="panel-head">
          <div className="greet">Create your account</div>
          <p>Fill in the details below to get started for free.</p>
        </div>

        <form noValidate onSubmit={handleSubmit}>
          {field('name', <><i className="fa-solid fa-user" /> Full Name</>, 'text', 'Aarav Sharma', 'name')}
          {field('email', <><i className="fa-solid fa-envelope" /> Email Address</>, 'email', 'your@email.com', 'email')}
          {field('tel', <><i className="fa-solid fa-phone" /> Mobile Number</>, 'tel', '9876543210', 'phone')}
          {field('bday', <><i className="fa-solid fa-cake-candles" /> Date of Birth</>, 'date', '', 'dob')}
          {field('new-password', <><i className="fa-solid fa-lock" /> Password</>, 'password', 'Min 8 characters', 'password')}
          {field('confirm-password', <><i className="fa-solid fa-lock" /> Confirm Password</>, 'password', 'Repeat password', 'confirm')}

          <div className="privacy-note">
            <i className="fa-solid fa-shield-halved" />
            <span>By registering, you agree to our Terms of Service and Privacy Policy. Your data is encrypted and never sold.</span>
          </div>

          <button type="submit" className={`btn btn-primary btn-full${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>
            {!isLoading && <><i className="fa-solid fa-user-plus" /> Create Account</>}
          </button>
        </form>

        <div className="hint">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
        <div className="panel-foot"><i className="fa-solid fa-lock" /> Secured and private</div>
      </section>
    </main>
  );
}
