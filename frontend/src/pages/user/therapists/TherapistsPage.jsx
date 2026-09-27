import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { getTherapists, getAvailability } from '@/services/therapistService.js';
import { book as createBooking } from '@/services/bookingService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import { SkeletonList } from '@/components/ui/Skeleton.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { formatTime } from '@/utils/formatters.js';

export default function TherapistsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [therapists, setTherapists] = useState([]);
  const [availability, setAvailability] = useState({}); // { therapistId: slots[] }
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bookingSlot, setBookingSlot] = useState(null); // { therapistId, therapistName, date, time }
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await getTherapists();
        setTherapists(list);
        // Load availability for all active therapists in parallel
        const avMap = {};
        await Promise.all(
          list.map(async (t) => {
            try {
              const slots = await getAvailability(t.therapistId);
              avMap[t.therapistId] = slots.slice(0, 3); // show up to 3 slots
            } catch {
              avMap[t.therapistId] = [];
            }
          })
        );
        setAvailability(avMap);
      } catch (err) {
        showToast('Failed to load therapists.', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = therapists.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase())
  );

  async function handleBook() {
    if (!bookingSlot) return;
    setBookingLoading(true);
    try {
      await createBooking({
        userId: user.userId,
        therapistId: bookingSlot.therapistId,
        date: bookingSlot.date,
        time: bookingSlot.time,
      });
      showToast('Booking request sent successfully!', 'success');
      setBookingSlot(null);
    } catch (err) {
      showToast(err.message || 'Failed to book session.', 'error');
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <div className="page-body-narrow mx-auto">
      <header style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Find a Therapist</h1>
        <p style={{ color: 'var(--muted)' }}>Browse our network of verified professionals and book a session.</p>
      </header>

      <div style={{ position: 'relative', marginBottom: 'var(--sp-5)' }}>
        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13 }} />
        <input
          className="form-input"
          style={{ paddingLeft: 40 }}
          placeholder="Search by name or specialization…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <div className="card card-body">
          <EmptyState icon="fa-user-doctor" title="No therapists found" description="Try a different search term." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {filtered.map((t) => {
            const slots = availability[t.therapistId] || [];
            return (
              <div key={t.therapistId} className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Avatar name={t.name} size="lg" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 'var(--text-md)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {t.name}
                      <i className="fa-solid fa-circle-check" style={{ color: 'var(--success)', fontSize: 14 }} title="Verified" />
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-dark)', marginTop: 2, fontWeight: 500 }}>{t.specialization}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>{t.experience} years experience</p>
                  </div>
                </div>

                {slots.length > 0 ? (
                  <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Available Slots</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {slots.map((slot) => (
                        <button
                          key={slot.slotId}
                          className="btn btn-outline btn-sm"
                          onClick={() => setBookingSlot({ therapistId: t.therapistId, therapistName: t.name, date: slot.date, time: slot.startTime })}
                        >
                          {slot.date} · {formatTime(`2000-01-01T${slot.startTime}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>No available slots at this time.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!bookingSlot}
        onClose={() => setBookingSlot(null)}
        onConfirm={handleBook}
        title="Confirm Booking"
        message={`Request a session with ${bookingSlot?.therapistName} on ${bookingSlot?.date} at ${bookingSlot?.time ? formatTime(`2000-01-01T${bookingSlot.time}`) : ''}?`}
        confirmLabel="Request Session"
        isLoading={bookingLoading}
      />
    </div>
  );
}
