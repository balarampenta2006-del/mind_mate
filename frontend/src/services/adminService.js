import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { USERS } from '@/mock/users.js';
import { THERAPISTS } from '@/mock/therapists.js';
import { MOODS } from '@/mock/moods.js';
import { BOOKINGS } from '@/mock/bookings.js';
import { SOS_ALERTS } from '@/mock/sos.js';
import { NotificationType } from '@/constants/enums.js';

let _users = [...USERS];
let _therapists = [...THERAPISTS];
let _adminNotifications = [
  { notificationId: 'an1', message: 'New user Sneha Reddy registered.', type: NotificationType.SYSTEM, isRead: false, createdAt: '2026-08-31T11:45:00Z' },
  { notificationId: 'an2', message: 'SOS alert from Aarav Sharma acknowledged.', type: NotificationType.SOS, isRead: false, createdAt: '2026-08-28T16:00:00Z' },
  { notificationId: 'an3', message: 'Dr. Ananya Singh account deactivated.', type: NotificationType.SYSTEM, isRead: true, createdAt: '2026-08-25T09:00:00Z' },
  { notificationId: 'an4', message: 'Platform backup completed successfully.', type: NotificationType.SYSTEM, isRead: true, createdAt: '2026-08-24T02:00:00Z' },
];

// Therapist messages — in-memory for mock
let _messages = {
  u1: [
    { msgId: 'msg1', fromTherapist: true, text: 'Hello Aarav, how have you been since our last session?', dateTime: new Date(Date.now() - 7200000).toISOString() },
    { msgId: 'msg2', fromTherapist: false, text: 'A bit anxious but managing. Thank you for checking in.', dateTime: new Date(Date.now() - 3600000).toISOString() },
  ],
};

export async function getAdminStats() {
  if (USE_MOCK) {
    await mockDelay(500);
    return {
      totalUsers: _users.length,
      activeUsers: _users.filter((u) => u.isActive).length,
      totalTherapists: _therapists.length,
      activeTherapists: _therapists.filter((t) => t.isActive).length,
      totalBookings: BOOKINGS.length,
      moodLogs: MOODS.length,
      sosAlerts: SOS_ALERTS.length,
      pendingBookings: BOOKINGS.filter((b) => b.status === 'Pending').length,
    };
  }
  return apiRequest('/admin/stats');
}

/**
 * Admin: every mood log on the platform (for analytics/reports).
 * @returns {Promise<import('@/types').Mood[]>}
 */
export async function getAdminMoods() {
  if (USE_MOCK) {
    await mockDelay(400);
    return MOODS;
  }
  return apiRequest('/admin/moods');
}

export async function getAdminUsers({ search, status } = {}) {
  if (USE_MOCK) {
    await mockDelay(400);
    let result = _users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (status === 'active') result = result.filter((u) => u.isActive);
    if (status === 'inactive') result = result.filter((u) => !u.isActive);
    return result;
  }
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const q = params.toString() ? `?${params}` : '';
  return apiRequest(`/admin/users${q}`);
}

export async function getAdminUser(userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    const user = _users.find((u) => u.userId === userId);
    if (!user) throw new Error('User not found');
    const bookings = BOOKINGS.filter((b) => b.userId === userId);
    const moods = MOODS.filter((m) => m.userId === userId).slice(-7);
    return { user, bookings, recentMoods: moods };
  }
  return apiRequest(`/admin/users/${userId}`);
}

export async function updateUser(userId, updates) {
  if (USE_MOCK) {
    await mockDelay(400);
    _users = _users.map((u) => u.userId === userId ? { ...u, ...updates } : u);
    return _users.find((u) => u.userId === userId);
  }
  return apiRequest(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deactivateUser(userId) {
  if (USE_MOCK) {
    await mockDelay(400);
    _users = _users.map((u) => u.userId === userId ? { ...u, isActive: false } : u);
    return { success: true };
  }
  return apiRequest(`/admin/users/${userId}/deactivate`, { method: 'POST' });
}

export async function reactivateUser(userId) {
  if (USE_MOCK) {
    await mockDelay(400);
    _users = _users.map((u) => u.userId === userId ? { ...u, isActive: true } : u);
    return { success: true };
  }
  return apiRequest(`/admin/users/${userId}/reactivate`, { method: 'POST' });
}

export async function removeUser(userId) {
  if (USE_MOCK) {
    await mockDelay(500);
    _users = _users.filter((u) => u.userId !== userId);
    return { success: true };
  }
  return apiRequest(`/admin/users/${userId}`, { method: 'DELETE' });
}

export async function getAdminTherapists({ search, status } = {}) {
  if (USE_MOCK) {
    await mockDelay(400);
    let result = _therapists;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
      );
    }
    if (status === 'active') result = result.filter((t) => t.isActive);
    if (status === 'inactive') result = result.filter((t) => !t.isActive);
    return result;
  }
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const q = params.toString() ? `?${params}` : '';
  return apiRequest(`/admin/therapists${q}`);
}

export async function getAdminTherapist(therapistId) {
  if (USE_MOCK) {
    await mockDelay(300);
    const therapist = _therapists.find((t) => t.therapistId === therapistId);
    if (!therapist) throw new Error('Therapist not found');
    const bookings = BOOKINGS.filter((b) => b.therapistId === therapistId);
    const patientIds = [...new Set(bookings.map((b) => b.userId))];
    const patients = _users.filter((u) => patientIds.includes(u.userId));
    return { therapist, bookings, patients };
  }
  return apiRequest(`/admin/therapists/${therapistId}`);
}

export async function onboardTherapist(data) {
  if (USE_MOCK) {
    await mockDelay(800);
    const newTherapist = { therapistId: `t_${Date.now()}`, ...data, isActive: true };
    _therapists = [..._therapists, newTherapist];
    return newTherapist;
  }
  return apiRequest('/admin/therapists', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTherapist(therapistId, updates) {
  if (USE_MOCK) {
    await mockDelay(400);
    _therapists = _therapists.map((t) => t.therapistId === therapistId ? { ...t, ...updates } : t);
    return _therapists.find((t) => t.therapistId === therapistId);
  }
  return apiRequest(`/admin/therapists/${therapistId}`, { method: 'PUT', body: JSON.stringify(updates) });
}

export async function deactivateTherapist(therapistId) {
  if (USE_MOCK) {
    await mockDelay(400);
    _therapists = _therapists.map((t) => t.therapistId === therapistId ? { ...t, isActive: false } : t);
    return { success: true };
  }
  return apiRequest(`/admin/therapists/${therapistId}/deactivate`, { method: 'POST' });
}

export async function reactivateTherapist(therapistId) {
  if (USE_MOCK) {
    await mockDelay(400);
    _therapists = _therapists.map((t) => t.therapistId === therapistId ? { ...t, isActive: true } : t);
    return { success: true };
  }
  return apiRequest(`/admin/therapists/${therapistId}/reactivate`, { method: 'POST' });
}

export async function removeTherapist(therapistId) {
  if (USE_MOCK) {
    await mockDelay(500);
    _therapists = _therapists.filter((t) => t.therapistId !== therapistId);
    return { success: true };
  }
  return apiRequest(`/admin/therapists/${therapistId}`, { method: 'DELETE' });
}

export async function getAdminNotifications() {
  if (USE_MOCK) {
    await mockDelay(300);
    return [..._adminNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return apiRequest('/admin/notifications');
}

export async function markAdminNotificationRead(notificationId) {
  if (USE_MOCK) {
    await mockDelay(200);
    _adminNotifications = _adminNotifications.map((n) =>
      n.notificationId === notificationId ? { ...n, isRead: true } : n
    );
    return { success: true };
  }
  return apiRequest(`/admin/notifications/${notificationId}/read`, { method: 'PUT' });
}

export async function sendPlatformNotification({ title, message, targetRole }) {
  if (USE_MOCK) {
    await mockDelay(600);
    const newNotif = {
      notificationId: `an_${Date.now()}`,
      message: `[Broadcast to ${targetRole}] ${title}: ${message}`,
      type: NotificationType.SYSTEM,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    _adminNotifications = [newNotif, ..._adminNotifications];
    return { success: true };
  }
  return apiRequest('/admin/notifications/broadcast', { method: 'POST', body: JSON.stringify({ title, message, targetRole }) });
}

// Therapist-side messages
export async function getAssignedPatients(therapistId) {
  if (USE_MOCK) {
    await mockDelay(400);
    const bookingUserIds = BOOKINGS.filter((b) => b.therapistId === therapistId).map((b) => b.userId);
    const unique = [...new Set(bookingUserIds)];
    return _users.filter((u) => unique.includes(u.userId));
  }
  return apiRequest(`/therapist/patients?therapistId=${therapistId}`);
}

export async function getMessages(userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    return _messages[userId] || [];
  }
  return apiRequest(`/therapist/messages/${userId}`);
}

export async function sendTherapistMessage({ userId, text, fromTherapist = true }) {
  if (USE_MOCK) {
    await mockDelay(400);
    const msg = { msgId: `msg_${Date.now()}`, fromTherapist, text, dateTime: new Date().toISOString() };
    _messages[userId] = [...(_messages[userId] || []), msg];
    return msg;
  }
  return apiRequest('/therapist/messages', { method: 'POST', body: JSON.stringify({ userId, text, fromTherapist }) });
}
