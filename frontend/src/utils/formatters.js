import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format ISO date string to human-readable date
 * @param {string} isoString
 * @param {string} [fmt]
 */
export function formatDate(isoString, fmt = 'dd MMM yyyy') {
  try {
    const d = typeof isoString === 'string' ? parseISO(isoString) : isoString;
    if (!isValid(d)) return '—';
    return format(d, fmt);
  } catch {
    return '—';
  }
}

/** Format ISO datetime to time string */
export function formatTime(isoString, fmt = 'h:mm a') {
  return formatDate(isoString, fmt);
}

/** Format ISO datetime to full date + time */
export function formatDateTime(isoString) {
  return formatDate(isoString, 'dd MMM yyyy, h:mm a');
}

/** Relative time: "2 hours ago" */
export function timeAgo(isoString) {
  try {
    const d = typeof isoString === 'string' ? parseISO(isoString) : isoString;
    if (!isValid(d)) return '—';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

/** Get initials from a name */
export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

/** Truncate string to max length with ellipsis */
export function truncate(str = '', maxLen = 80) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '…';
}

/** Format booking status label */
export function formatStatus(status) {
  if (!status) return '—';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Render an SOS location that may be a plain string (mock) or an object
 * `{ latitude, longitude, address }` (backend). Returns '' when nothing
 * meaningful can be shown.
 * @param {string | { latitude?: number, longitude?: number, address?: string } | null | undefined} loc
 */
export function formatLocation(loc) {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  if (loc.address) return loc.address;
  const hasCoords = typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
    && !(loc.latitude === 0 && loc.longitude === 0);
  if (hasCoords) return `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;
  return '';
}

/** Format duration in minutes to Xm or Xh Xm */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Zero-pad numbers */
export function pad(n) {
  return String(n).padStart(2, '0');
}

/** Generate a simple random ID (for mock data) */
export function genId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
