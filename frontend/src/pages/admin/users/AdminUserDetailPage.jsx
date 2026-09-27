import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminUser, getAdminTherapists, updateUser, deactivateUser, reactivateUser, removeUser } from '@/services/adminService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { formatDate } from '@/utils/formatters.js';
import { BookingStatus } from '@/constants/enums.js';
import { useToast } from '@/stores/toastStore.jsx';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      getAdminUser(id),
      getAdminTherapists().catch(() => []),
    ])
      .then(([d, th]) => {
        setData(d);
        setTherapists(Array.isArray(th) ? th : []);
        setForm({ name: d.user.name, phone: d.user.phone || '' });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(id, form);
      showToast('User updated.', 'success');
      setEditing(false);
      load();
    } catch {
      showToast('Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      if (confirmAction === 'deactivate') await deactivateUser(id);
      else if (confirmAction === 'reactivate') await reactivateUser(id);
      else if (confirmAction === 'remove') { await removeUser(id); navigate('/admin/users', { replace: true }); return; }
      showToast(confirmAction === 'deactivate' ? 'User deactivated.' : 'User reactivated.', 'success');
      setConfirmAction(null);
      load();
    } catch {
      showToast('Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (error) return (
    <div className="page-body">
      <div className="card card-body" style={{ textAlign: 'center', color: 'var(--danger)' }}>
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 32, marginBottom: 12 }} />
        <p>{error}</p>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  const { user, bookings, recentMoods } = data;

  const confirmMeta = {
    deactivate: { title: 'Deactivate User', message: `Deactivate ${user.name}? They will lose platform access.`, label: 'Deactivate', destructive: true },
    reactivate: { title: 'Reactivate User', message: `Reactivate ${user.name}?`, label: 'Reactivate', destructive: false },
    remove: { title: 'Remove User', message: `Permanently remove ${user.name}? This cannot be undone.`, label: 'Remove', destructive: true },
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--sp-6)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/users')}>
          <i className="fa-solid fa-arrow-left" /> Back
        </button>
        <h1 style={{ fontSize: 'var(--text-2xl)', flex: 1 }}>User Details</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing && <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><i className="fa-solid fa-pen" /> Edit</button>}
          {user.isActive
            ? <button className="btn btn-outline btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }} onClick={() => setConfirmAction('deactivate')}>Deactivate</button>
            : <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => setConfirmAction('reactivate')}>Reactivate</button>
          }
          <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={() => setConfirmAction('remove')}>Remove</button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'var(--sp-4)' }}>
            <Avatar name={user.name} size="lg" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{user.name}</div>
              <span className={`badge-ui ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className={`btn btn-primary btn-sm${saving ? ' btn-loading' : ''}`} disabled={saving}>{!saving && 'Save'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 80 }}>Email</span><span>{user.email}</span></div>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 80 }}>Phone</span><span>{user.phone || '—'}</span></div>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 80 }}>DOB</span><span>{user.dob ? formatDate(user.dob) : '—'}</span></div>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 80 }}>Joined</span><span>{formatDate(user.createdAt)}</span></div>
            </div>
          )}
        </div>

        <div className="card card-body">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Recent Mood Logs</h2>
          {recentMoods.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No mood logs recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentMoods.slice(-5).map((m) => (
                <div key={m.moodId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span>{m.moodType}</span>
                  <span style={{ color: 'var(--muted)' }}>{m.date} · Level {m.moodLevel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>Booking History</h2>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No bookings found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Therapist</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const therapist = therapists.find((t) => t.therapistId === b.therapistId || t.userId === b.therapistId);
                return (
                  <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0' }}>{therapist?.name || b.therapistId}</td>
                    <td style={{ padding: '10px 0', color: 'var(--muted)' }}>{b.date}</td>
                    <td style={{ padding: '10px 0', color: 'var(--muted)' }}>{b.time}</td>
                    <td style={{ padding: '10px 0' }}>
                      <span className={`badge-ui ${b.status === BookingStatus.CONFIRMED ? 'badge-success' : b.status === BookingStatus.CANCELLED ? 'badge-danger' : 'badge-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          title={confirmMeta[confirmAction].title}
          message={confirmMeta[confirmAction].message}
          confirmLabel={confirmMeta[confirmAction].label}
          isDestructive={confirmMeta[confirmAction].destructive}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
