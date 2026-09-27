import { useState } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { updateTherapistProfile } from '@/services/therapistService.js';
import Tabs from '@/components/ui/Tabs.jsx';

export default function TherapistProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    bio: user?.bio || '',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Name is required.', 'error'); return; }
    setSaving(true);
    try {
      await updateTherapistProfile(user.userId, { name: form.name, phone: form.phone, specialization: form.specialization, bio: form.bio });
      updateUser({ name: form.name, phone: form.phone });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const ProfessionalTab = (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', marginTop: 'var(--sp-4)' }}>
      <div className="grid-2">
        <div className="field">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" value={form.name} onChange={set('name')} required disabled={saving} />
        </div>
        <div className="field">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>Email cannot be changed here.</p>
        </div>
        <div className="field">
          <label className="form-label">Phone</label>
          <input type="tel" className="form-input" value={form.phone} onChange={set('phone')} disabled={saving} />
        </div>
        <div className="field">
          <label className="form-label">Specialization</label>
          <input type="text" className="form-input" value={form.specialization} onChange={set('specialization')} disabled={saving} />
        </div>
      </div>
      <div className="field">
        <label className="form-label">Bio</label>
        <textarea className="form-input" rows={3} value={form.bio} onChange={set('bio')} disabled={saving} style={{ resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className={`btn btn-primary${saving ? ' btn-loading' : ''}`} disabled={saving}>
          {!saving && 'Save Changes'}
        </button>
      </div>
    </form>
  );

  const SecurityTab = (
    <div style={{ marginTop: 'var(--sp-4)' }}>
      <div style={{ padding: 'var(--sp-5)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <h4 style={{ marginBottom: 'var(--sp-3)' }}>Account Security</h4>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 'var(--sp-4)' }}>
          To change your password, a reset link will be sent to your registered email.
        </p>
        <button className="btn btn-outline" onClick={() => showToast('Password reset link sent to your email.', 'info')}>
          Send Reset Link
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-body">
      <div style={{ marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h2>Therapist Profile</h2>
          <p style={{ color: 'var(--muted)' }}>Manage your credentials and practice settings.</p>
        </div>
      </div>
      <div className="card card-body">
        <Tabs
          tabs={[
            { id: 'professional', label: 'Professional Profile', content: ProfessionalTab },
            { id: 'security', label: 'Security', content: SecurityTab },
          ]}
          defaultTabId="professional"
        />
      </div>
    </div>
  );
}
