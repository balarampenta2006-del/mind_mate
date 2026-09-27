import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import Avatar from '@/components/ui/Avatar.jsx';

const NAV_ITEMS = [
  { to: '/therapist/dashboard',   icon: 'fa-house',         label: 'Dashboard' },
  { to: '/therapist/patients',    icon: 'fa-users',         label: 'My Patients' },
  { to: '/therapist/messages',    icon: 'fa-comments',      label: 'Messages' },
  { to: '/therapist/availability',icon: 'fa-calendar-plus', label: 'Availability' },
  { to: '/therapist/notifications',icon: 'fa-bell',         label: 'Notifications', badge: true },
  { to: '/therapist/profile',     icon: 'fa-user',          label: 'Profile' },
];

const BOTTOM_NAV = [
  { to: '/therapist/dashboard',    icon: 'fa-house',    label: 'Home' },
  { to: '/therapist/patients',     icon: 'fa-users',    label: 'Patients' },
  { to: '/therapist/messages',     icon: 'fa-comments', label: 'Messages' },
  { to: '/therapist/availability', icon: 'fa-calendar-plus', label: 'Schedule' },
  { to: '/therapist/notifications',icon: 'fa-bell',     label: 'Alerts', badge: true },
];

export default function TherapistLayout() {
  const { user, notificationCount, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/therapist/login', { replace: true });
  };

  return (
    <div className="app-layout therapist-theme">
      <nav className={`sidebar${mobileOpen ? ' mobile-open' : ''}`} aria-label="Therapist navigation">
        <div className="sidebar-brand">
          <div className="sidebar-logo"><i className="fa-solid fa-user-doctor" /></div>
          <div className="sidebar-brand-text">
            <strong>Mind Mate</strong>
            <small>Therapist Portal</small>
          </div>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge && notificationCount > 0 && (
                <span className="nav-badge">{notificationCount}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Avatar name={user?.name} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Therapist</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" /> Sign Out
          </button>
        </div>
      </nav>

      {mobileOpen && <div className="mobile-menu-overlay open" onClick={() => setMobileOpen(false)} aria-hidden="true" />}

      <main className="main-content">
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><i className="fa-solid fa-bars" /></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="sidebar-logo" style={{ width: 28, height: 28, fontSize: 13, borderRadius: 8 }}><i className="fa-solid fa-user-doctor" /></div>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)' }}>Therapist Portal</strong>
          </div>
          <div style={{ width: 36 }} />
        </header>
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Quick navigation">
        <div className="bottom-nav-inner">
          {BOTTOM_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge && notificationCount > 0 && <span className="nav-badge">{notificationCount}</span>}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
