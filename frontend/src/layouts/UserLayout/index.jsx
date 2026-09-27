import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import Avatar from '@/components/ui/Avatar.jsx';

const NAV_ITEMS = [
  { to: '/user/dashboard',          icon: 'fa-house',           label: 'Dashboard' },
  { to: '/user/mood',               icon: 'fa-face-smile',      label: 'Mood' },
  { to: '/user/chat',               icon: 'fa-comments',        label: 'AI Chat' },
  { to: '/user/recommendations',    icon: 'fa-lightbulb',       label: 'Recommendations' },
  { to: '/user/meditation',         icon: 'fa-moon',            label: 'Meditation' },
  { to: '/user/therapists',         icon: 'fa-user-doctor',     label: 'Therapists' },
  { to: '/user/bookings',           icon: 'fa-calendar-check',  label: 'Bookings' },
  { to: '/user/reports',            icon: 'fa-chart-line',      label: 'Progress' },
  { to: '/user/sos',                icon: 'fa-circle-exclamation', label: 'SOS', danger: true },
  { to: '/user/emergency-contacts', icon: 'fa-address-book',    label: 'Emergency' },
  { to: '/user/notifications',      icon: 'fa-bell',            label: 'Notifications', badge: true },
  { to: '/user/profile',            icon: 'fa-user',            label: 'Profile' },
];

// Bottom nav shows most important 5 items
const BOTTOM_NAV = [
  { to: '/user/dashboard', icon: 'fa-house', label: 'Home' },
  { to: '/user/mood', icon: 'fa-face-smile', label: 'Mood' },
  { to: '/user/chat', icon: 'fa-comments', label: 'Chat' },
  { to: '/user/bookings', icon: 'fa-calendar-check', label: 'Bookings' },
  { to: '/user/notifications', icon: 'fa-bell', label: 'Alerts', badge: true },
];

export default function UserLayout() {
  const { user, notificationCount, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <nav className={`sidebar${mobileOpen ? ' mobile-open' : ''}`} aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <i className="fa-solid fa-heart-pulse" aria-hidden="true" />
          </div>
          <div className="sidebar-brand-text">
            <strong>Mind Mate</strong>
            <small>SMHC</small>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}${item.danger ? ' nav-item-danger' : ''}`}
              onClick={() => setMobileOpen(false)}
              aria-current={undefined}
              style={item.danger ? { color: 'var(--danger)', fontWeight: 600 } : undefined}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge && notificationCount > 0 && (
                <span className="nav-badge" aria-label={`${notificationCount} unread`}>{notificationCount}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Avatar name={user?.name} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-menu-overlay open" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Main content */}
      <main className="main-content">
        {/* Mobile header */}
        <header className="mobile-header">
          <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <i className="fa-solid fa-bars" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="sidebar-logo" style={{ width: 28, height: 28, fontSize: 13, borderRadius: 8 }}>
              <i className="fa-solid fa-heart-pulse" />
            </div>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)' }}>Mind Mate</strong>
          </div>
          <NavLink to="/user/sos" style={{ color: '#dc2626', fontSize: 20, display: 'flex', alignItems: 'center' }} aria-label="SOS">
            <i className="fa-solid fa-circle-exclamation" />
          </NavLink>
        </header>

        {/* Page content */}
        <Outlet />
      </main>

      {/* Persistent SOS button (desktop, above bottom nav on mobile) */}
      <NavLink
        to="/user/sos"
        className="sos-btn-persistent"
        aria-label="SOS — Emergency alert"
        title="SOS Emergency"
      >
        <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
      </NavLink>

      {/* Bottom navigation (mobile) */}
      <nav className="bottom-nav" aria-label="Quick navigation">
        <div className="bottom-nav-inner">
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge && notificationCount > 0 && (
                <span className="nav-badge" aria-label={`${notificationCount} unread`}>{notificationCount}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
