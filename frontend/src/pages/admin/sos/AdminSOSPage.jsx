import { useState, useEffect } from 'react';
import { getSOSAlerts, updateSOSStatus } from '@/services/sosService.js';
import { SkeletonList } from '@/components/ui/Skeleton.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import { SOSStatus } from '@/constants/enums.js';
import { formatDateTime, formatLocation } from '@/utils/formatters.js';
import { useToast } from '@/stores/toastStore.jsx';

const STATUS_BADGE = {
  [SOSStatus.SENT]: 'badge-danger',
  [SOSStatus.ACKNOWLEDGED]: 'badge-warning',
  [SOSStatus.RESOLVED]: 'badge-success',
};

export default function AdminSOSPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null); // { alert, action }
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    getSOSAlerts()
      .then((data) =>
        setAlerts(
          [...data].sort((a, b) => {
            const order = { [SOSStatus.SENT]: 0, [SOSStatus.ACKNOWLEDGED]: 1, [SOSStatus.RESOLVED]: 2 };
            if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
            return new Date(b.sentAt) - new Date(a.sentAt);
          })
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      await updateSOSStatus(confirm.alert.sosId, confirm.action);
      showToast(
        confirm.action === SOSStatus.ACKNOWLEDGED ? 'Alert acknowledged.' : 'Alert resolved.',
        'success'
      );
      setConfirm(null);
      load();
    } catch {
      showToast('Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const activeCount = alerts.filter((a) => a.status !== SOSStatus.RESOLVED).length;

  return (
    <div className="page-body">
      <header style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--danger)' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 10 }} />
          SOS Alerts
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          {activeCount > 0
            ? `${activeCount} active alert${activeCount > 1 ? 's' : ''} require attention.`
            : 'All alerts have been resolved.'}
        </p>
      </header>

      {loading ? (
        <SkeletonList count={3} />
      ) : alerts.length === 0 ? (
        <div className="card card-body">
          <EmptyState icon="fa-shield-halved" title="No SOS alerts" description="No emergency alerts have been triggered." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {alerts.map((alert) => {
            const isResolved = alert.status === SOSStatus.RESOLVED;
            const isAcknowledged = alert.status === SOSStatus.ACKNOWLEDGED;
            return (
              <div key={alert.sosId} className="card card-body" style={{ borderLeft: `4px solid ${isResolved ? 'var(--success)' : isAcknowledged ? 'var(--warning)' : 'var(--danger)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span className={`badge-ui ${STATUS_BADGE[alert.status]}`}>{alert.status}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{formatDateTime(alert.sentAt)}</span>
                    </div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{alert.message}</p>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span><i className="fa-solid fa-user" style={{ marginRight: 6 }} />{alert.userName || 'Unknown User'}</span>
                      {formatLocation(alert.location) && (
                        <span><i className="fa-solid fa-location-dot" style={{ marginRight: 6 }} />{formatLocation(alert.location)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {!isAcknowledged && !isResolved && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setConfirm({ alert, action: SOSStatus.ACKNOWLEDGED })}
                      >
                        Acknowledge
                      </button>
                    )}
                    {!isResolved && (
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--success)', color: '#fff', border: 'none' }}
                        onClick={() => setConfirm({ alert, action: SOSStatus.RESOLVED })}
                      >
                        Mark Resolved
                      </button>
                    )}
                    {isResolved && (
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--success)' }}>
                        <i className="fa-solid fa-circle-check" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirm(null)}
          onConfirm={handleConfirm}
          title={confirm.action === SOSStatus.ACKNOWLEDGED ? 'Acknowledge Alert' : 'Resolve Alert'}
          message={
            confirm.action === SOSStatus.ACKNOWLEDGED
              ? 'Mark this SOS alert as acknowledged? The user will be notified that their alert is being handled.'
              : 'Mark this SOS alert as resolved? This indicates the situation has been addressed.'
          }
          confirmLabel={confirm.action === SOSStatus.ACKNOWLEDGED ? 'Acknowledge' : 'Mark Resolved'}
          isDestructive={false}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
