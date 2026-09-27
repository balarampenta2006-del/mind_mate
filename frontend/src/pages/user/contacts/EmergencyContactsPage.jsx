import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { getContacts, addContact, deleteContact } from '@/services/emergencyService.js';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { useToast } from '@/stores/toastStore.jsx';

export default function EmergencyContactsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', relation: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadContacts(); }, [user.userId]);

  async function loadContacts() {
    try {
      setContacts(await getContacts(user.userId));
    } catch {
      showToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const newContact = await addContact({ ...formData, userId: user.userId });
      setContacts((prev) => [...prev, newContact]);
      showToast('Contact added successfully', 'success');
      setIsAddOpen(false);
      setFormData({ name: '', relation: '', phone: '' });
    } catch {
      showToast('Failed to add contact', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteContact(deleteTarget.contactId);
      setContacts((prev) => prev.filter((c) => c.contactId !== deleteTarget.contactId));
      showToast('Contact removed', 'success');
    } catch {
      showToast('Failed to remove contact', 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="page-body">
      <div className="flex-between" style={{ marginBottom: 'var(--sp-5)' }}>
        <div>
          <h2>Emergency Contacts</h2>
          <p className="text-muted">Trusted individuals we can reach out to if you need immediate support.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
          <i className="fa-solid fa-plus" /> Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon="fa-user-group"
          title="No Emergency Contacts"
          description="Add trusted friends or family members to your emergency contacts list."
          action={<button className="btn btn-primary btn-sm" onClick={() => setIsAddOpen(true)}>Add Contact</button>}
        />
      ) : (
        <div className="grid-3">
          {contacts.map((contact) => (
            <div key={contact.contactId} className="card" style={{ padding: 'var(--sp-5)' }}>
              <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: 'var(--sp-3)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  <i className="fa-solid fa-user" />
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => setDeleteTarget(contact)}
                  aria-label={`Remove ${contact.name}`}
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 4 }}>{contact.name}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 'var(--sp-3)' }}>
                {contact.relation}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)' }}>
                <i className="fa-solid fa-phone" style={{ color: 'var(--muted)', fontSize: 12 }} />
                {contact.phone}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isAddOpen} onClose={() => !saving && setIsAddOpen(false)} title="Add Emergency Contact"
        footer={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setIsAddOpen(false)} disabled={saving}>Cancel</button>
            <button className={`btn btn-primary${saving ? ' btn-loading' : ''}`} form="add-contact-form" type="submit" disabled={saving}>
              {!saving && 'Save Contact'}
            </button>
          </div>
        }
      >
        <form id="add-contact-form" onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Jane Doe" required disabled={saving} />
          </div>
          <div>
            <label className="form-label">Relationship</label>
            <input type="text" className="form-input" value={formData.relation} onChange={(e) => setFormData({ ...formData, relation: e.target.value })} placeholder="e.g. Sister, Partner" required disabled={saving} />
          </div>
          <div>
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" required disabled={saving} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Contact"
        message={`Are you sure you want to remove ${deleteTarget?.name} from your emergency contacts?`}
        confirmLabel="Remove"
        isDestructive={true}
      />
    </div>
  );
}
