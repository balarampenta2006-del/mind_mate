import { useState, useEffect } from 'react';
import { getAdminStats, getAdminMoods } from '@/services/adminService.js';
import { getAllBookings } from '@/services/bookingService.js';
import { BookingStatus } from '@/constants/enums.js';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import { formatDate } from '@/utils/formatters.js';

function mostFrequent(arr) {
  if (!arr.length) return '—';
  const freq = {};
  arr.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState(null);
  const [moods, setMoods] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminMoods(), getAllBookings()])
      .then(([s, m, b]) => {
        setStats(s);
        setMoods(Array.isArray(m) ? m : []);
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
          icon="fa-file-lines"
          title="Reports unavailable"
          description="Platform reports could not be loaded right now. Please try again later."
        />
      </div>
    );
  }

  const confirmedBookings = bookings.filter((b) => b.status === BookingStatus.CONFIRMED);
  const cancelledBookings = bookings.filter((b) => b.status === BookingStatus.CANCELLED);
  const avgMoodLevel = moods.length
    ? (moods.reduce((s, m) => s + m.moodLevel, 0) / moods.length).toFixed(1)
    : '—';
  const topMood = mostFrequent(moods.map((m) => m.moodType));
  const topTherapistName = mostFrequent(bookings.map((b) => b.therapist?.name || b.therapistId));

  const sections = [
    {
      title: 'Booking Summary',
      icon: 'fa-calendar-check',
      color: 'var(--primary)',
      rows: [
        ['Total Bookings', stats.totalBookings],
        ['Confirmed', confirmedBookings.length],
        ['Pending', stats.pendingBookings],
        ['Cancelled', cancelledBookings.length],
        ['Most Booked Therapist', topTherapistName],
      ],
    },
    {
      title: 'User Summary',
      icon: 'fa-users',
      color: '#8b5cf6',
      rows: [
        ['Total Registered Users', stats.totalUsers],
        ['Active Users', stats.activeUsers],
        ['Inactive Users', (stats.totalUsers || 0) - (stats.activeUsers || 0)],
        ['Users with Bookings', new Set(bookings.map((b) => b.userId)).size],
      ],
    },
    {
      title: 'Mood & Wellness',
      icon: 'fa-face-smile',
      color: '#f59e0b',
      rows: [
        ['Total Mood Logs', stats.moodLogs],
        ['Average Mood Level', avgMoodLevel],
        ['Most Frequent Mood', topMood],
        ['Unique Users Logging Moods', new Set(moods.map((m) => m.userId)).size],
      ],
    },
    {
      title: 'Safety & Alerts',
      icon: 'fa-triangle-exclamation',
      color: 'var(--danger)',
      rows: [
        ['Total SOS Alerts', stats.sosAlerts],
        ['Active Therapists', stats.activeTherapists],
        ['Total Therapists', stats.totalTherapists],
      ],
    },
  ];

  return (
    <div className="page-body">
      <header style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Platform Reports</h1>
        <p style={{ color: 'var(--muted)' }}>
          Aggregated summaries from platform data. Generated {formatDate(new Date().toISOString())}.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}>
        {sections.map((section) => (
          <div key={section.title} className="card card-body" style={{ borderTop: `3px solid ${section.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--sp-4)' }}>
              <i className={`fa-solid ${section.icon}`} style={{ color: section.color, fontSize: 18 }} />
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{section.title}</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <tbody>
                {section.rows.map(([label, value]) => (
                  <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0', color: 'var(--muted)' }}>{label}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>Recent Bookings Log</h2>
        {bookings.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>No bookings yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Therapist</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 25).map((b) => (
                  <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px' }}>{b.user?.name || b.userId}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{b.therapist?.name || b.therapistId}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{b.date} · {b.time}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge-ui ${b.status === BookingStatus.CONFIRMED ? 'badge-success' : b.status === BookingStatus.CANCELLED ? 'badge-danger' : 'badge-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
