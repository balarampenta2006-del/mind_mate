import { BookingStatus } from '@/constants/enums.js';

const CONFIG = {
  [BookingStatus.CONFIRMED]: { cls: 'badge-success', icon: 'fa-circle-check', label: 'Confirmed' },
  [BookingStatus.PENDING]:   { cls: 'badge-warning', icon: 'fa-clock',        label: 'Pending' },
  [BookingStatus.CANCELLED]: { cls: 'badge-danger',  icon: 'fa-circle-xmark', label: 'Cancelled' },
};

/** @param {{ status:string }} props */
export default function BookingStatusBadge({ status }) {
  const cfg = CONFIG[status] || { cls: 'badge-neutral', icon: 'fa-circle', label: status };
  return (
    <span className={`badge-ui ${cfg.cls}`}>
      <i className={`fa-solid ${cfg.icon}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
