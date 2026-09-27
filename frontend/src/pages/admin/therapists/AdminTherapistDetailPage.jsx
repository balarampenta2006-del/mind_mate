import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAdminTherapist, updateTherapist,
  deactivateTherapist, reactivateTherapist, removeTherapist,
} from '@/services/adminService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { formatDate } from '@/utils/formatters.js';
import { BookingStatus } from '@/constants/enums.js';
import { useToast } from '@/stores/toastStore.jsx';

export default function AdminTherapistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getAdminTherapist(id)
      .then((d) => {
        setData(d);
        setForm({ name: d.therapist.name, phone: d.therapist.phone || '', specialization: d.therapist.specialization, experience: String(d.therapist.experience), bio: d.therapist.bio || '' });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTherapist(id, { ...form, experience: Number(form.experience) });
      showToast('Therapist updated.', 'success');
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
      if (confirmAction === 'deactivate') await deactivateTherapist(id);
      else if (confirmAction === 'reactivate') await reactivateTherapist(id);
      else if (confirmAction === 'remove') {
        await removeTherapist(id);
        navigate('/admin/therapists', { replace: true });
        return;
      }
      showToast(confirmAction === 'deactivate' ? 'Therapist deactivated.' : 'Therapist reactivated.', 'success');
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
        <p>{error}</p>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </div>
  );

  const { therapist, bookings, patients } = data;
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const confirmMeta = {
    deactivate: { title: 'Deactivate Therapist', message: `Deactivate ${therapist.name}? They will no longer appear to users.`, label: 'Deactivate', destructive: true },
    reactivate: { title: 'Reactivate Therapist', message: `Reactivate ${therapist.name}?`, label: 'Reactivate', destructive: false },
    remove: { title: 'Remove Therapist', message: `Permanently remove ${therapist.name}? This cannot be undone.`, label: 'Remove', destructive: true },
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--sp-6)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/therapists')}>
          <i className="fa-solid fa-arrow-left" /> Back
        </button>
        <h1 style={{ fontSize: 'var(--text-2xl)', flex: 1 }}>Therapist Details</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing && <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><i className="fa-solid fa-pen" /> Edit</button>}
          {therapist.isActive
            ? <button className="btn btn-outline btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }} onClick={() => setConfirmAction('deactivate')}>Deactivate</button>
            : <button className="btn btn-outline btn-sm" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => setConfirmAction('reactivate')}>Reactivate</button>
          }
          <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff', border: 'none' }} onClick={() => setConfirmAction('remove')}>Remove</button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'var(--sp-4)' }}>
            <Avatar name={therapist.name} size="lg" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{therapist.name}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{therapist.specialization}</div>
              <span className={`badge-ui ${therapist.isActive ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: 4, display: 'inline-block' }}>
                {therapist.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={set('name')} required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="form-label">Specialization</label>
                <input className="form-input" value={form.specialization} onChange={set('specialization')} required />
              </div>
              <div>
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" min="0" value={form.experience} onChange={set('experience')} required />
              </div>
              <div>
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={3} value={form.bio} onChange={set('bio')} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className={`btn btn-primary btn-sm${saving ? ' btn-loading' : ''}`} disabled={saving}>{!saving && 'Save'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 100 }}>Email</span><span>{therapist.email}</span></div>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 100 }}>Phone</span><span>{therapist.phone || '—'}</span></div>
              <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 100 }}>Experience</span><span>{therapist.experience} years</span></div>
              {therapist.bio && <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>{therapist.bio}</p>}
            </div>
          )}
        </div>

        <div className="card card-body">
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
            Assigned Patients ({patients.length})
          </h2>
          {patients.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No patients assigned yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {patients.map((p) => (
                <div key={p.userId} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-sm)' }}>
                  <Avatar name={p.name} size="sm" />
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>{p.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card card-body">
        <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
          Booking History ({bookings.length})
        </h2>
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No bookings found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const patient = patients.find((p) => p.userId === b.userId);
                return (
                  <tr key={b.bookingId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0' }}>{patient?.name || b.userId}</td>
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
