import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { getBookings, cancelBooking } from '@/services/bookingService.js';
import { BookingStatus } from '@/constants/enums.js';
import { formatDate, formatTime } from '@/utils/formatters.js';

import { SkeletonList } from '@/components/ui/Skeleton.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Avatar from '@/components/ui/Avatar.jsx';
import BookingStatusBadge from '@/components/domain/booking/BookingStatusBadge.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';

export default function BookingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    load();
  }, [user.userId]);

  async function load() {
    setLoading(true);
    try {
      const data = await getBookings(user.userId);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancellingId) return;
    try {
      await cancelBooking(cancellingId);
      showToast('Booking cancelled successfully.');
      setCancellingId(null);
      load();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  }

  return (
    <div className="page-body-narrow mx-auto">
      <header className="page-header" style={{ padding: '0 0 var(--sp-6) 0', border: 'none', background: 'transparent' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>My Bookings</h1>
        <p style={{ color: 'var(--muted)' }}>Manage your therapy sessions.</p>
      </header>

      {loading ? (
        <SkeletonList count={3} />
      ) : bookings.length === 0 ? (
        <div className="card card-body">
          <EmptyState icon="fa-calendar-xmark" title="No bookings found" description="You don't have any upcoming or past sessions." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {bookings.map(b => (
            <div key={b.bookingId} className="card card-body">
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <BookingStatusBadge status={b.status} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600 }}>ID: {b.bookingId}</span>
              </div>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                <Avatar name={b.therapist?.name} size="md" />
                <div>
                  <h3 style={{ fontSize: 'var(--text-md)', margin: 0 }}>{b.therapist?.name}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Clinical Psychologist</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, fontSize: 'var(--text-sm)', color: 'var(--text)', background: 'var(--surface)', padding: 12, borderRadius: 8, marginBottom: b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED ? 16 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-regular fa-calendar" style={{ color: 'var(--primary-dark)' }} /> {formatDate(b.date)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><i className="fa-regular fa-clock" style={{ color: 'var(--primary-dark)' }} /> {formatTime(`2000-01-01T${b.time}`)}</div>
              </div>

              {(b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setCancellingId(b.bookingId)}>Cancel Session</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!cancellingId}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancel}
        title="Cancel Session?"
        message="Are you sure you want to cancel this session? This action cannot be undone."
        confirmLabel="Yes, Cancel it"
        isDestructive={true}
      />
    </div>
  );
}
