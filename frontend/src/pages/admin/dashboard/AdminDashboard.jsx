import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '@/services/adminService.js';
import { getAllBookings } from '@/services/bookingService.js';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import AnalyticsBarChart from '@/components/charts/AnalyticsBarChart.jsx';
import { BookingStatus } from '@/constants/enums.js';

function StatCard({ label, value, icon, color, to }) {
  const inner = (
    <div className="card card-body" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--muted)' }}>{label}</span>
        <i className={`fa-solid ${icon}`} style={{ color }} />
      </div>
      <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text)' }}>{value ?? '—'}</div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([getAdminStats(), getAllBookings()])
      .then(([s, b]) => {
        setStats(s);
        setBookings(Array.isArray(b) ? b : []);
      })
      .catch((err) => {
        console.error(err);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  if (failed || !stats) {
    return (
      <div className="page-body">
        <EmptyState
          icon="fa-triangle-exclamation"
          title="Unable to load dashboard"
          description="Platform statistics are unavailable right now. Please try again later."
        />
      </div>
    );
  }

  const recentBookings = bookings.slice(0, 4);
  const bookingsByStatus = [
    { label: 'Pending', value: bookings.filter((b) => b.status === BookingStatus.PENDING).length },
    { label: 'Confirmed', value: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length },
    { label: 'Cancelled', value: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length },
  ];

  return (
    <div className="page-body">
      <header style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Platform Overview</h1>
        <p style={{ color: 'var(--muted)' }}>Real-time metrics and system health.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <StatCard label="Total Users" value={stats.totalUsers} icon="fa-users" color="var(--primary)" to="/admin/users" />
        <StatCard label="Active Users" value={stats.activeUsers} icon="fa-user-check" color="var(--success)" to="/admin/users?status=active" />
        <StatCard label="Therapists" value={stats.totalTherapists} icon="fa-user-doctor" color="#8b5cf6" to="/admin/therapists" />
        <StatCard label="Total Bookings" value={stats.totalBookings} icon="fa-calendar-check" color="#06b6d4" />
        <StatCard label="Mood Logs" value={stats.moodLogs} icon="fa-face-smile" color="#f59e0b" />
        <StatCard label="SOS Alerts" value={stats.sosAlerts} icon="fa-triangle-exclamation" color="var(--danger)" to="/admin/sos" />
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="card card-body">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>Bookings by Status</h2>
          <AnalyticsBarChart data={bookingsByStatus} height={200} />
        </div>

        <div className="card card-body">
          <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Recent Bookings</h2>
            <Link to="/admin/reports" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary)' }}>View all</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentBookings.length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>No bookings yet.</p>
            ) : (
              recentBookings.map((b) => (
                <div key={b.bookingId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--muted)' }}>{b.date} · {b.time}</span>
                  <span className={`badge-ui ${b.status === BookingStatus.CONFIRMED ? 'badge-success' : b.status === BookingStatus.CANCELLED ? 'badge-danger' : 'badge-warning'}`}>
                    {b.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>Platform Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)' }}>
          {[
            { label: 'Active Therapists', value: stats.activeTherapists, total: stats.totalTherapists },
            { label: 'Pending Bookings', value: stats.pendingBookings, total: stats.totalBookings },
            { label: 'Inactive Users', value: (stats.totalUsers || 0) - (stats.activeUsers || 0), total: stats.totalUsers },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center', padding: 'var(--sp-4)', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{item.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>{item.label}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>of {item.total} total</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
