import { Link } from 'react-router-dom';

const PORTALS = [
  {
    role: 'User', href: '/login', icon: 'fa-user', theme: 'theme-user',
    color: '#2e8b7f', softColor: '#e4f2ef',
    tagline: 'Your mental wellness, your journey.',
    features: ['Mood tracking & AI chat', 'Personalised recommendations', 'Book therapy sessions'],
  },
  {
    role: 'Therapist', href: '/therapist/login', icon: 'fa-user-doctor', theme: 'theme-therapist',
    color: '#2e8b7f', softColor: '#e4f2ef',
    tagline: 'Support your patients effectively.',
    features: ['Manage your patients', 'Set availability slots', 'Send wellness advice'],
  },
  {
    role: 'Admin', href: '/admin/login', icon: 'fa-server', theme: 'theme-admin',
    color: '#3d6b99', softColor: '#e5eef7',
    tagline: 'Platform management & oversight.',
    features: ['User & therapist management', 'Analytics dashboard', 'SOS alert oversight'],
  },
];

export default function LandingPage() {
  return (
    <div style={{ maxWidth: 960, width: '100%', display: 'flex', flexDirection: 'column', gap: 40, padding: '20px 0' }}>
      {/* Hero */}
      <header style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, background: '#2e8b7f', color: '#fff',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 8px 24px rgba(46,139,127,0.35)',
          }}>
            <i className="fa-solid fa-heart-pulse" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#6b7f7b', fontWeight: 700 }}>SMHC</div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: '#22322f' }}>Mind Mate</div>
          </div>
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#22322f', marginBottom: 14, lineHeight: 1.25 }}>
          Smart Mental Health Care Companion
        </h1>
        <p style={{ color: '#6b7f7b', fontSize: 16, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          A holistic digital platform connecting users, therapists, and administrators to deliver personalised mental wellness support.
        </p>
      </header>

      {/* Portal cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {PORTALS.map((p) => (
          <Link
            key={p.role}
            to={p.href}
            style={{ textDecoration: 'none' }}
          >
            <article
              style={{
                background: '#fff', border: '1px solid #e3ece9', borderRadius: 20,
                padding: 28, display: 'flex', flexDirection: 'column', gap: 16,
                transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease',
                cursor: 'pointer', height: '100%',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 16px 40px rgba(35,70,62,0.14)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = p.color; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e3ece9'; }}
            >
              <div style={{
                width: 52, height: 52, background: p.softColor, color: p.color,
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                <i className={`fa-solid ${p.icon}`} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: p.color, marginBottom: 4 }}>{p.role} Portal</div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 600, color: '#22322f', margin: 0 }}>Sign in as {p.role}</h2>
                <p style={{ fontSize: 13, color: '#6b7f7b', marginTop: 6, lineHeight: 1.5 }}>{p.tagline}</p>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3d5450' }}>
                    <i className="fa-solid fa-check" style={{ color: p.color, fontSize: 11, flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color, fontSize: 14, fontWeight: 600 }}>
                Enter {p.role} Portal <i className="fa-solid fa-arrow-right" />
              </div>
            </article>
          </Link>
        ))}
      </div>

      <footer style={{ textAlign: 'center', color: '#8fa09c', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <i className="fa-solid fa-lock" /> Encrypted &amp; confidential &nbsp;·&nbsp; © 2026 Mind Mate · SMHC Platform
      </footer>
    </div>
  );
}
