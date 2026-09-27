import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { getNotifications, markRead, markAllRead } from '@/services/notificationService.js';
import Spinner from '@/components/ui/Spinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useToast } from '@/stores/toastStore.jsx';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [user.userId]);

  async function loadNotifications() {
    try {
      const data = await getNotifications(user.userId);
      setNotifications(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markRead(id);
      setNotifications(notifications.map(n => 
        n.notificationId === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAll() {
    setMarking(true);
    try {
      await markAllRead(user.userId);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      showToast('All caught up!', 'success');
    } catch (err) {
      showToast('Failed to update notifications', 'error');
    } finally {
      setMarking(false);
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-body">
      <div className="flex-between" style={{ marginBottom: 'var(--sp-5)' }}>
        <div>
          <div className="flex-center" style={{ justifyContent: 'flex-start' }}>
            <h2>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 700 }}>
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-muted">Stay updated on your appointments and activity.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={handleMarkAll} disabled={marking}>
            {marking ? <Spinner /> : <><i className="fa-solid fa-check-double" /> Mark all read</>}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState 
          icon="fa-bell" 
          title="No Notifications" 
          description="You're all caught up! We'll notify you when something important happens." 
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {notifications.map((n) => (
            <div 
              key={n.notificationId} 
              className={`notification-item ${!n.isRead ? 'unread' : ''}`}
              onClick={() => !n.isRead && handleMarkRead(n.notificationId)}
            >
              <div style={{ 
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: n.type === 'system' ? 'var(--info-soft)' : n.type === 'booking' ? 'var(--warning-soft)' : 'var(--primary-soft)',
                color: n.type === 'system' ? '#1e40af' : n.type === 'booking' ? '#92400e' : 'var(--primary-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
              }}>
                <i className={`fa-solid ${n.type === 'system' ? 'fa-gear' : n.type === 'booking' ? 'fa-calendar-check' : 'fa-message'}`} />
              </div>
              <div className="notification-item-body">
                <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 2 }}>{n.title || n.message}</h4>
                <p>{n.message}</p>
                <div className="n-time">{new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
              </div>
              {!n.isRead && <div className="notification-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
