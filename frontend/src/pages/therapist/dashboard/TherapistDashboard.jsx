import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { getBookingsForTherapist } from '@/services/bookingService.js';
import { getPatients } from '@/services/userService.js';
import { BookingStatus } from '@/constants/enums.js';
import { formatTime, formatDate } from '@/utils/formatters.js';

import { SkeletonCard } from '@/components/ui/Skeleton.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import Avatar from '@/components/ui/Avatar.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';

export default function TherapistDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pData, bData] = await Promise.all([
          getPatients(),
          getBookingsForTherapist(user.userId)
        ]);
        setPatients(pData);
        setBookings(bData.filter(b => b.status === BookingStatus.CONFIRMED));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.userId]);

  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings.filter(b => b.date === today).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="page-body">
      <header className="page-header" style={{ padding: '0 0 var(--sp-6) 0', border: 'none', background: 'transparent', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Welcome, Dr. {user.name.split(' ')[0]}</h1>
          <p style={{ color: 'var(--muted)' }}>Here's an overview of your practice today.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>{todaysBookings.length}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Sessions Today</div>
        </div>
      </header>

      {loading ? (
        <PageSpinner />
      ) : (
        <div className="grid-2">
          {/* Today's Schedule */}
          <section>
            <div className="flex-between" style={{ marginBottom: 'var(--sp-4)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Today's Schedule</h2>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{formatDate(today)}</span>
            </div>
            
            {todaysBookings.length === 0 ? (
              <div className="card card-body">
                <EmptyState icon="fa-mug-hot" title="No sessions today" description="Take a break or update your availability." />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {todaysBookings.map(b => {
                  const patient = patients.find(p => p.userId === b.userId) || { name: 'Unknown Patient' };
                  return (
                    <div key={b.bookingId} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-md)', color: 'var(--primary-dark)', width: 80, flexShrink: 0 }}>
                        {formatTime(`2000-01-01T${b.time}`)}
                      </div>
                      <Avatar name={patient.name} size="md" />
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 'var(--text-md)', margin: 0 }}>{patient.name}</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Session #{b.bookingId.split('-')[0]}</p>
                      </div>
                      <button className="btn btn-ghost btn-sm" aria-label="Join Session">
                        <i className="fa-solid fa-video" /> Join
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Patient Overview */}
          <section>
            <h2 className="section-title" style={{ marginBottom: 'var(--sp-4)' }}>Patient Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <div className="card card-body" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary-light)' }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 4 }}>{patients.length}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-dark)', fontWeight: 600 }}>Total Patients</div>
              </div>
              <div className="card card-body">
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>3</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', fontWeight: 600 }}>Unread Messages</div>
              </div>
            </div>

            <h3 style={{ fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', fontWeight: 700, marginBottom: 12 }}>Recent Alerts</h3>
            <div className="card card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderLeft: '4px solid var(--warning)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--warning)', marginTop: 4 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Low Mood Trend: Jane Doe</strong>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>Jane has logged 'Sad' for 4 consecutive days. Consider reaching out.</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
