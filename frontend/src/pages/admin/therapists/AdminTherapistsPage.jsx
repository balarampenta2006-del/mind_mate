import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminTherapists, onboardTherapist, updateTherapist,
  deactivateTherapist, reactivateTherapist, removeTherapist,
} from '@/services/adminService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import { SkeletonTable } from '@/components/ui/Skeleton.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useToast } from '@/stores/toastStore.jsx';

const EMPTY_FORM = { name: '', email: '', phone: '', specialization: '', experience: '', bio: '' };

function TherapistFormModal({ therapist, onClose, onSaved }) {
  const isEdit = !!therapist;
  const [form, setForm] = useState(
    isEdit
      ? { name: therapist.name, email: therapist.email, phone: therapist.phone || '', specialization: therapist.specialization, experience: String(therapist.experience), bio: therapist.bio || '' }
      : { ...EMPTY_FORM }
  );
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, experience: Number(form.experience) };
      if (isEdit) await updateTherapist(therapist.therapistId, payload);
      else await onboardTherapist(payload);
      showToast(isEdit ? 'Therapist updated.' : 'Therapist onboarded successfully.', 'success');
      onSaved();
    } catch {
      showToast('Failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Therapist' : 'Onboard Therapist'} size="md"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className={`btn btn-primary${saving ? ' btn-loading' : ''}`} form="therapist-form" type="submit" disabled={saving}>
            {!saving && (isEdit ? 'Save Changes' : 'Onboard')}
          </button>
        </div>
      }
    >
      <form id="therapist-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} required disabled={isEdit} style={isEdit ? { opacity: 0.6 } : {}} />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={set('phone')} />
        </div>
        <div>
          <label className="form-label">Specialization *</label>
          <input className="form-input" value={form.specialization} onChange={set('specialization')} required />
        </div>
        <div>
          <label className="form-label">Years of Experience *</label>
          <input className="form-input" type="number" min="0" value={form.experience} onChange={set('experience')} required />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Bio</label>
          <textarea className="form-input" rows={3} value={form.bio} onChange={set('bio')} style={{ resize: 'vertical' }} />
        </div>
      </form>
    </Modal>
  );
}

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formTarget, setFormTarget] = useState(null); // null=closed, false=new, therapist obj=edit
  const [confirmAction, setConfirmAction] = useState(null); // { type, therapist }
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    getAdminTherapists({ search, status: statusFilter })
      .then(setTherapists)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const { type, therapist } = confirmAction;
      if (type === 'deactivate') await deactivateTherapist(therapist.therapistId);
      else if (type === 'reactivate') await reactivateTherapist(therapist.therapistId);
      else if (type === 'remove') await removeTherapist(therapist.therapistId);
      showToast(
        type === 'remove' ? 'Therapist removed.' : type === 'deactivate' ? 'Therapist deactivated.' : 'Therapist reactivated.',
        'success'
      );
      setConfirmAction(null);
      load();
    } catch {
      showToast('Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmMeta = confirmAction ? {
    deactivate: { title: 'Deactivate Therapist', message: `Deactivate ${confirmAction.therapist.name}? They will no longer appear to users.`, label: 'Deactivate', destructive: true },
    reactivate: { title: 'Reactivate Therapist', message: `Reactivate ${confirmAction.therapist.name}?`, label: 'Reactivate', destructive: false },
    remove: { title: 'Remove Therapist', message: `Permanently remove ${confirmAction.therapist.name}? This cannot be undone.`, label: 'Remove', destructive: true },
  }[confirmAction.type] : null;

  return (
    <div className="page-body">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Therapist Management</h1>
          <p style={{ color: 'var(--muted)' }}>{therapists.length} therapists on platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormTarget(false)}>
          <i className="fa-solid fa-user-plus" /> Onboard Therapist
        </button>
      </header>

      <div className="card card-body" style={{ marginBottom: 'var(--sp-4)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13 }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search by name, specialization or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="card card-body"><SkeletonTable rows={5} cols={5} /></div>
      ) : therapists.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--muted)' }}>
          <i className="fa-solid fa-user-doctor" style={{ fontSize: 32, marginBottom: 12 }} />
          <p>No therapists found.</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>Therapist</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>Specialization</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>Exp.</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {therapists.map((t) => (
                <tr key={t.therapistId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={t.name} size="sm" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{t.specialization}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{t.experience} yrs</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge-ui ${t.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" title="View" onClick={() => navigate(`/admin/therapists/${t.therapistId}`)}>
                        <i className="fa-solid fa-eye" />
                      </button>
                      <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setFormTarget(t)}>
                        <i className="fa-solid fa-pen" />
                      </button>
                      {t.isActive ? (
                        <button className="btn btn-ghost btn-sm" title="Deactivate" style={{ color: 'var(--warning)' }} onClick={() => setConfirmAction({ type: 'deactivate', therapist: t })}>
                          <i className="fa-solid fa-ban" />
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" title="Reactivate" style={{ color: 'var(--success)' }} onClick={() => setConfirmAction({ type: 'reactivate', therapist: t })}>
                          <i className="fa-solid fa-circle-check" />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" title="Remove" style={{ color: 'var(--danger)' }} onClick={() => setConfirmAction({ type: 'remove', therapist: t })}>
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formTarget !== null && (
        <TherapistFormModal
          therapist={formTarget || null}
          onClose={() => setFormTarget(null)}
          onSaved={() => { setFormTarget(null); load(); }}
        />
      )}

      {confirmAction && confirmMeta && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          title={confirmMeta.title}
          message={confirmMeta.message}
          confirmLabel={confirmMeta.label}
          isDestructive={confirmMeta.destructive}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
