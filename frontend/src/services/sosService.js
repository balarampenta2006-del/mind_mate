/**
 * @fileoverview SOS / emergency alert service.
 *
 * BACKEND DEPENDENCIES:
 *   POST /sos                       → SOS
 *   GET  /sos?userId=               → SOS[]  (user's own alerts)
 *   GET  /sos                       → SOS[]  (admin: all alerts, no userId param)
 *   PUT  /sos/:id/status            → SOS    (admin: acknowledge / resolve)
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { SOS_ALERTS } from '@/mock/sos.js';
import { SOSStatus } from '@/constants/enums.js';

let _alerts = [...SOS_ALERTS];

/**
 * Backend alerts carry `triggeredAt` while the UI expects `sentAt`.
 * Normalise so every consumer can rely on `sentAt`.
 * @param {import('@/types').SOS} alert
 */
function normalizeAlert(alert) {
  if (!alert || typeof alert !== 'object') return alert;
  return { ...alert, sentAt: alert.sentAt || alert.triggeredAt || alert.createdAt };
}

/**
 * @param {{ userId:string, message:string, location?:string }} payload
 * @returns {Promise<import('@/types').SOS>}
 */
export async function sendSOS({ userId, message, location }) {
  if (USE_MOCK) {
    await mockDelay(600);
    const alert = {
      sosId: `sos_${Date.now()}`,
      userId,
      message,
      location: location || 'Location not shared',
      sentAt: new Date().toISOString(),
      status: SOSStatus.SENT,
    };
    _alerts = [alert, ..._alerts];
    return alert;
  }
  const created = await apiRequest('/sos', {
    method: 'POST',
    body: JSON.stringify({ userId, message, location }),
  });
  return normalizeAlert(created);
}

/**
 * @param {string} [userId]  Omit for admin (returns all alerts).
 * @returns {Promise<import('@/types').SOS[]>}
 */
export async function getSOSAlerts(userId) {
  if (USE_MOCK) {
    await mockDelay(400);
    return userId ? _alerts.filter((a) => a.userId === userId) : _alerts;
  }
  const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const data = await apiRequest(`/sos${q}`);
  return Array.isArray(data) ? data.map(normalizeAlert) : [];
}

/**
 * @param {string} sosId
 * @param {string} status  SOSStatus enum value
 * @returns {Promise<import('@/types').SOS>}
 */
export async function updateSOSStatus(sosId, status) {
  if (USE_MOCK) {
    await mockDelay(400);
    _alerts = _alerts.map((a) => (a.sosId === sosId ? { ...a, status } : a));
    return _alerts.find((a) => a.sosId === sosId);
  }
  return apiRequest(`/sos/${encodeURIComponent(sosId)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
