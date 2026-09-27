import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { getAvailability, addSlot, removeSlot } from '@/services/therapistService.js';
import { PageSpinner } from '@/components/ui/Spinner.jsx';

const ALL_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function getNextWeekDates() {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    if (!['Saturday', 'Sunday'].includes(day)) {
      dates.push({ label: day, date: d.toISOString().slice(0, 10) });
    }
  }
  return dates.slice(0, 5);
}

export default function AvailabilityPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [slots, setSlots] = useState([]); // existing slots from service
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // pending: { date_time: 'add'|'remove'|slotId }
  const [pending, setPending] = useState({});
  const days = getNextWeekDates();

  useEffect(() => {
    getAvailability(user.userId)
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.userId]);

  function isActive(date, time) {
    const key = `${date}_${time}`;
    if (pending[key] === 'add') return true;
    if (pending[key] === 'remove') return false;
    return slots.some((s) => s.date === date && s.startTime === time);
  }

  function toggle(date, time) {
    const key = `${date}_${time}`;
    const existing = slots.find((s) => s.date === date && s.startTime === time);
    setPending((prev) => {
      const next = { ...prev };
      if (existing) {
        // toggle remove/restore
        next[key] = prev[key] === 'remove' ? undefined : 'remove';
        if (next[key] === undefined) delete next[key];
      } else {
        // toggle add/cancel
        next[key] = prev[key] === 'add' ? undefined : 'add';
        if (next[key] === undefined) delete next[key];
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const ops = Object.entries(pending);
      await Promise.all(
        ops.map(async ([key, action]) => {
          const [date, time] = key.split('_');
          if (action === 'add') {
            const [h, m] = time.split(':').map(Number);
            const endTime = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            await addSlot({ therapistId: user.userId, date, startTime: time, endTime });
          } else if (action === 'remove') {
            const slot = slots.find((s) => s.date === date && s.startTime === time);
            if (slot) await removeSlot(slot.slotId);
          }
        })
      );
      // Refresh
      const updated = await getAvailability(user.userId);
      setSlots(updated);
      setPending({});
      showToast('Availability saved successfully.', 'success');
    } catch {
      showToast('Failed to save availability. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const hasPending = Object.keys(pending).length > 0;

  if (loading) return <PageSpinner />;

  return (
    <div className="page-body-narrow mx-auto">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Availability</h1>
          <p style={{ color: 'var(--muted)' }}>Manage your appointment slots for the next 5 working days.</p>
        </div>
        <button
          className={`btn btn-primary${saving ? ' btn-loading' : ''}`}
          onClick={handleSave}
          disabled={!hasPending || saving}
        >
          {!saving && <><i className="fa-solid fa-check" /> Save Changes</>}
        </button>
      </header>

      <div className="card card-body">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 24 }}>
          Click a time slot to toggle availability. Blue = available. Changes are not saved until you click Save.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {days.map(({ label, date }) => (
            <div key={date} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 110, flexShrink: 0 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{date}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ALL_TIMES.map((time) => {
                  const active = isActive(date, time);
                  const key = `${date}_${time}`;
                  const changed = pending[key] !== undefined;
                  return (
                    <button
                      key={key}
                      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
                      style={{ minWidth: 70, outline: changed ? '2px dashed var(--warning)' : undefined }}
                      onClick={() => toggle(date, time)}
                      title={changed ? 'Unsaved change' : undefined}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {hasPending && (
          <p style={{ marginTop: 16, fontSize: 'var(--text-xs)', color: 'var(--warning)', fontWeight: 600 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }} />
            You have unsaved changes. Click Save Changes to apply.
          </p>
        )}
      </div>
    </div>
  );
}
