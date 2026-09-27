/**
 * @fileoverview Notification service.
 *
 * BACKEND DEPENDENCIES:
 *   GET /notifications?userId=              → Notification[]
 *   GET /notifications/unread-count?userId= → number
 *   PUT /notifications/:id/read             → { success: true }
 *   PUT /notifications/read-all?userId=     → { success: true }
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { NOTIFICATIONS } from '@/mock/notifications.js';

let _notifications = [...NOTIFICATIONS];

/**
 * @param {string} userId
 * @returns {Promise<import('@/types').Notification[]>}
 */
export async function getNotifications(userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    return _notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return apiRequest(`/notifications?userId=${encodeURIComponent(userId)}`);
}

/**
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getUnreadCount(userId) {
  if (USE_MOCK) {
    await mockDelay(100);
    return _notifications.filter((n) => n.userId === userId && !n.isRead).length;
  }
  return apiRequest(`/notifications/unread-count?userId=${encodeURIComponent(userId)}`);
}

/**
 * @param {string} notificationId
 * @returns {Promise<{ success: boolean }>}
 */
export async function markRead(notificationId) {
  if (USE_MOCK) {
    await mockDelay(200);
    _notifications = _notifications.map((n) =>
      n.notificationId === notificationId ? { ...n, isRead: true } : n
    );
    return { success: true };
  }
  return apiRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PUT' });
}

/**
 * @param {string} userId
 * @returns {Promise<{ success: boolean }>}
 */
export async function markAllRead(userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    _notifications = _notifications.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    return { success: true };
  }
  return apiRequest(`/notifications/read-all?userId=${encodeURIComponent(userId)}`, { method: 'PUT' });
}
