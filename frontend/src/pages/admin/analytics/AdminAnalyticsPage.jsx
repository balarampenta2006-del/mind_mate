import { useState, useEffect } from 'react';
import { getAdminStats, getAdminMoods } from '@/services/adminService.js';
import { getAllBookings } from '@/services/bookingService.js';
import { BookingStatus } from '@/constants/enums.js';
import AnalyticsBarChart from '@/components/charts/AnalyticsBarChart.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';

function buildMoodDistribution(moods) {
  const counts = {};
  moods.forEach((m) => { counts[m.moodType] = (counts[m.moodType] || 0) + 1; });
  return Object.entries(counts).map(([label, value]) => ({ label, value }));
}

function buildBookingsByStatus(bookings) {
  return [
    { label: BookingStatus.CONFIRMED, value: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length },
    { label: BookingStatus.PENDING, value: bookings.filter((b) => b.status === BookingStatus.PENDING).length },
    { label: BookingStatus.CANCELLED, value: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length },
  ];
}

// Derive weekly mood level averages from the real mood logs (last 4 weeks)
function buildWeeklyMoodAvg(moods) {
  const weeks = [[], [], [], []];
  const now = new Date();
  moods.forEach((m) => {
    const diff = Math.floor((now - new Date(m.date)) / (7 * 24 * 3600 * 1000));
    if (diff >= 0 && diff < 4) weeks[diff].push(m.moodLevel);
  });
  return weeks.reverse().map((w, i) => ({
    label: `Week ${i + 1}`,
    value: w.length ? Math.round((w.reduce((a, b) => a + b, 0) / w.length) * 10) / 10 : 0,
  }));
}

export default function AdminAnalyticsPage() {
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
          icon="fa-chart-line"
          title="Analytics unavailable"
          description="Platform analytics could not be loaded right now. Please try again later."
        />
      </div>
    );
  }

  const moodDist = buildMoodDistribution(moods);
  const bookingStatus = buildBookingsByStatus(bookings);
  const weeklyMood = buildWeeklyMoodAvg(moods);

  return (
    <div className="page-body">
      <header style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Platform Analytics</h1>
        <p style={{ color: 'var(--muted)' }}>Insights derived from platform activity data.</p>
      </header>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)' }}>
        {[
          { label: 'Total Users', value: stats.totalUsers },
          { label: 'Active Users', value: stats.activeUsers },
          { label: 'Total Therapists', value: stats.totalTherapists },
          { label: 'Total Bookings', value: stats.totalBookings },
          { label: 'Mood Logs', value: stats.moodLogs },
          { label: 'SOS Alerts', value: stats.sosAlerts },
        ].map((s) => (
          <div key={s.label} className="card card-body" style={{ textAlign: 'center', padding: 'var(--sp-4)' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)', marginBottom: 'var(--sp-5)' }}>
        <div className="card card-body">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>Mood Distribution (All Users)</h2>
          {moodDist.length ? (
            <AnalyticsBarChart data={moodDist} color="#8b5cf6" height={240} />
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>No mood data yet.</p>
          )}
        </div>

        <div className="card card-body">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>Bookings by Status</h2>
          <AnalyticsBarChart data={bookingStatus} color="var(--primary)" height={240} />
        </div>
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>Average Mood Level — Last 4 Weeks</h2>
        <AnalyticsBarChart data={weeklyMood} color="#06b6d4" height={220} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 8 }}>
          Scale: 1 (very low) – 10 (very high). Based on {stats.moodLogs} mood log entries.
        </p>
      </div>
    </div>
  );
}
