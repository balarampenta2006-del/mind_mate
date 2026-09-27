import { useState, useEffect } from 'react';
import {
  getAdminNotifications,
  markAdminNotificationRead,
  sendPlatformNotification,
} from '@/services/adminService.js';
import { SkeletonList } from '@/components/ui/Skeleton.jsx';
import Modal from '@/components/ui/Modal.jsx';
import { NotificationType } from '@/constants/enums.js';
import { timeAgo } from '@/utils/formatters.js';
import { useToast } from '@/stores/toastStore.jsx';

const TYPE_ICON = {
  [NotificationType.SOS]: { icon: 'fa-triangle-exclamation', color: 'var(--danger)' },
  [NotificationType.BOOKING]: { icon: 'fa-calendar-check', color: 'var(--primary)' },
  [NotificationType.SYSTEM]: { icon: 'fa-server', color: 'var(--info)' },
  [NotificationType.ADVICE]: { icon: 'fa-lightbulb', color: '#f59e0b' },
  [NotificationType.RECOMMENDATION]: { icon: 'fa-star', color: '#8b5cf6' },
};

function BroadcastModal({ onClose, onSent }) {
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'user' });
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await sendPlatformNotification(form);
      showToast('Notification broadcast sent.', 'success');
      onSent();
    } catch {
      showToast('Failed to send notification.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Broadcast Notification" size="sm"
      footer={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={sending}>Cancel</button>
          <button className={`btn btn-primary${sending ? ' btn-loading' : ''}`} form="broadcast-form" type="submit" disabled={sending}>
            {!sending && 'Send'}
          </button>
        </div>
      }
    >
      <form id="broadcast-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title} onChange={set('title')} required placeholder="e.g. Scheduled Maintenance" />
        </div>
        <div>
          <label className="form-label">Message *</label>
          <textarea className="form-input" rows={3} value={form.message} onChange={set('message')} required placeholder="Notification body…" style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className="form-label">Target Audience</label>
          <select className="form-input" value={form.targetRole} onChange={set('targetRole')}>
            <option value="user">All Users</option>
            <option value="therapist">All Therapists</option>
            <option value="all">Everyone</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

const adminNotifId = (n) => n.adminNotificationId ?? n.notificationId;

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    getAdminNotifications().then(setNotifications).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markAdminNotificationRead(id);
      setNotifications((prev) => prev.map((n) => adminNotifId(n) === id ? { ...n, isRead: true } : n));
    } catch {
      showToast('Failed to mark as read.', 'error');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="page-body">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>Notifications</h1>
          <p style={{ color: 'var(--muted)' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up.'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBroadcast(true)}>
          <i className="fa-solid fa-bullhorn" /> Broadcast
        </button>
      </header>

      {loading ? (
        <SkeletonList count={4} />
      ) : notifications.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--muted)' }}>
          <i className="fa-solid fa-bell-slash" style={{ fontSize: 32, marginBottom: 12 }} />
          <p>No notifications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {notifications.map((n) => {
            const meta = TYPE_ICON[n.type] || TYPE_ICON[NotificationType.SYSTEM];
            return (
              <div
                key={adminNotifId(n)}
                className="card card-body"
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: n.isRead ? 0.7 : 1, cursor: n.isRead ? 'default' : 'pointer' }}
                onClick={() => !n.isRead && handleMarkRead(adminNotifId(n))}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fa-solid ${meta.icon}`} style={{ color: meta.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  {n.title && <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 2 }}>{n.title}</p>}
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: n.isRead ? 400 : 600, marginBottom: 4 }}>{n.message}</p>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{timeAgo(n.createdAt)}</span>
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {showBroadcast && (
        <BroadcastModal onClose={() => setShowBroadcast(false)} onSent={() => { setShowBroadcast(false); load(); }} />
      )}
    </div>
  );
}
