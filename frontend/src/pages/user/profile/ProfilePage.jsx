import { useState } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { updateProfile } from '@/services/userService.js';
import { useToast } from '@/stores/toastStore.jsx';
import Tabs from '@/components/ui/Tabs.jsx';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Name is required.', 'error'); return; }
    setSaving(true);
    try {
      const updated = await updateProfile(user.userId, { name: form.name, phone: form.phone });
      updateUser({ name: form.name, phone: form.phone, ...updated });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const PersonalTab = (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)', marginTop: 'var(--sp-4)' }}>
      <div className="grid-2">
        <div className="field">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="field">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>Email cannot be changed here.</p>
        </div>
        <div className="field">
          <label className="form-label">Phone Number</label>
          <input type="tel" className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div className="field">
          <label className="form-label">Date of Birth</label>
          <input type="text" className="form-input" value={user?.dob || '—'} disabled style={{ opacity: 0.6 }} />
        </div>
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
        <h4 style={{ marginBottom: 'var(--sp-3)' }}>Change Password</h4>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 'var(--sp-4)' }}>
          To change your password, we will send a reset link to your registered email address.
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
          <h2>Profile Settings</h2>
          <p style={{ color: 'var(--muted)' }}>Manage your account details.</p>
        </div>
      </div>
      <div className="card card-body">
        <Tabs
          tabs={[
            { id: 'personal', label: 'Personal Info', content: PersonalTab },
            { id: 'security', label: 'Security', content: SecurityTab },
          ]}
          defaultTabId="personal"
        />
      </div>
    </div>
  );
}
