import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import Avatar from '@/components/ui/Avatar.jsx';

const NAV_ITEMS = [
  { to: '/admin/dashboard',      icon: 'fa-gauge-high',   label: 'Dashboard' },
  { to: '/admin/users',          icon: 'fa-users',        label: 'Users' },
  { to: '/admin/therapists',     icon: 'fa-user-doctor',  label: 'Therapists' },
  { to: '/admin/analytics',      icon: 'fa-chart-bar',    label: 'Analytics' },
  { to: '/admin/reports',        icon: 'fa-file-lines',   label: 'Reports' },
  { to: '/admin/sos',            icon: 'fa-triangle-exclamation', label: 'SOS Alerts', danger: true },
  { to: '/admin/notifications',  icon: 'fa-bell',         label: 'Notifications', badge: true },
];

const BOTTOM_NAV = [
  { to: '/admin/dashboard',   icon: 'fa-gauge-high',  label: 'Home' },
  { to: '/admin/users',       icon: 'fa-users',       label: 'Users' },
  { to: '/admin/therapists',  icon: 'fa-user-doctor', label: 'Therapists' },
  { to: '/admin/analytics',   icon: 'fa-chart-bar',   label: 'Analytics' },
  { to: '/admin/sos',         icon: 'fa-triangle-exclamation', label: 'SOS' },
];

export default function AdminLayout() {
  const { user, notificationCount, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="app-layout admin-theme">
      <nav className={`sidebar${mobileOpen ? ' mobile-open' : ''}`} aria-label="Admin navigation">
        <div className="sidebar-brand">
          <div className="sidebar-logo" style={{ background: 'var(--primary)' }}><i className="fa-solid fa-server" /></div>
          <div className="sidebar-brand-text">
            <strong>Mind Mate</strong>
            <small>Admin Console</small>
          </div>
        </div>

        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
              style={item.danger ? { color: 'var(--danger)' } : undefined}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.badge && notificationCount > 0 && <span className="nav-badge">{notificationCount}</span>}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Avatar name={user?.name} size="sm" color="var(--primary-soft)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Administrator</div>
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
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)' }}>Admin Console</strong>
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
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
