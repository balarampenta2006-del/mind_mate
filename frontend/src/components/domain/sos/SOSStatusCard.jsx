import { SOSStatus } from '@/constants/enums.js';
import { formatDateTime, formatLocation } from '@/utils/formatters.js';

const CONFIG = {
  [SOSStatus.SENT]:         { cls: 'badge-warning', icon: 'fa-paper-plane', label: 'Alert Sent' },
  [SOSStatus.ACKNOWLEDGED]: { cls: 'badge-info',    icon: 'fa-eye',         label: 'Acknowledged' },
  [SOSStatus.RESOLVED]:     { cls: 'badge-success', icon: 'fa-circle-check', label: 'Resolved' },
};

/** @param {{ alert: import('@/types').SOS }} props */
export default function SOSStatusCard({ alert }) {
  const cfg = CONFIG[alert.status] || CONFIG[SOSStatus.SENT];
  return (
    <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--danger)', fontSize: 18 }} />
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-md)' }}>SOS Alert</strong>
        </div>
        <span className={`badge-ui ${cfg.cls}`}>
          <i className={`fa-solid ${cfg.icon}`} aria-hidden="true" /> {cfg.label}
        </span>
      </div>
      {alert.message && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.6 }}>{alert.message}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        <span><i className="fa-solid fa-clock" style={{ marginRight: 4 }} />{formatDateTime(alert.sentAt || alert.triggeredAt)}</span>
        {formatLocation(alert.location) && (
          <span><i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />{formatLocation(alert.location)}</span>
        )}
      </div>
    </div>
  );
}
