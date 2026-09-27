import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers, updateUser, deactivateUser, reactivateUser, removeUser } from '@/services/adminService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import { SkeletonTable } from '@/components/ui/Skeleton.jsx';
import Modal from '@/components/ui/Modal.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { formatDate } from '@/utils/formatters.js';
import { useToast } from '@/stores/toastStore.jsx';

const PAGE_SIZE = 5;

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '' });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(user.userId, form);
      showToast('User updated successfully.', 'success');
      onSaved();
    } catch {
      showToast('Failed to update user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit User" size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className={`btn btn-primary${saving ? ' btn-loading' : ''}`} form="edit-user-form" type="submit" disabled={saving}>
            {!saving && 'Save Changes'}
          </button>
        </div>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="form-label">Full Name</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="form-input" value={user.email} disabled style={{ opacity: 0.6 }} />
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4 }}>Email cannot be changed.</p>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    getAdminUsers({ search, status: statusFilter })
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const { type, user } = confirmAction;
      if (type === 'deactivate') await deactivateUser(user.userId);
      else if (type === 'reactivate') await reactivateUser(user.userId);
      else if (type === 'remove') await removeUser(user.userId);
      showToast(
        type === 'remove' ? 'User removed.' : type === 'deactivate' ? 'User deactivated.' : 'User reactivated.',
        'success'
      );
      setConfirmAction(null);
      load();
    } catch {
      showToast('Action failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmMeta = confirmAction ? {
    deactivate: { title: 'Deactivate User', message: `Deactivate ${confirmAction.user.name}? They will lose access to the platform.`, label: 'Deactivate', destructive: true },
    reactivate: { title: 'Reactivate User', message: `Reactivate ${confirmAction.user.name}? They will regain access.`, label: 'Reactivate', destructive: false },
    remove: { title: 'Remove User', message: `Permanently remove ${confirmAction.user.name}? This cannot be undone.`, label: 'Remove', destructive: true },
  }[confirmAction.type] : null;

  return (
    <div className="page-body">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>User Management</h1>
          <p style={{ color: 'var(--muted)' }}>{users.length} registered users</p>
        </div>
      </header>

      <div className="card card-body" style={{ marginBottom: 'var(--sp-4)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13 }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="card card-body"><SkeletonTable rows={5} cols={5} /></div>
      ) : users.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--muted)' }}>
          <i className="fa-solid fa-users-slash" style={{ fontSize: 32, marginBottom: 12 }} />
          <p>No users found.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>User</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'left' }}>Joined</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((u) => (
                  <tr key={u.userId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={u.name} size="sm" />
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{u.email}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge-ui ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--muted)' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" title="View details" onClick={() => navigate(`/admin/users/${u.userId}`)}>
                          <i className="fa-solid fa-eye" />
                        </button>
                        <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEditUser(u)}>
                          <i className="fa-solid fa-pen" />
                        </button>
                        {u.isActive ? (
                          <button className="btn btn-ghost btn-sm" title="Deactivate" style={{ color: 'var(--warning)' }} onClick={() => setConfirmAction({ type: 'deactivate', user: u })}>
                            <i className="fa-solid fa-ban" />
                          </button>
                        ) : (
                          <button className="btn btn-ghost btn-sm" title="Reactivate" style={{ color: 'var(--success)' }} onClick={() => setConfirmAction({ type: 'reactivate', user: u })}>
                            <i className="fa-solid fa-circle-check" />
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" title="Remove" style={{ color: 'var(--danger)' }} onClick={() => setConfirmAction({ type: 'remove', user: u })}>
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 'var(--sp-4)' }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <i className="fa-solid fa-chevron-left" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                <i className="fa-solid fa-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}

      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={() => { setEditUser(null); load(); }} />
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
