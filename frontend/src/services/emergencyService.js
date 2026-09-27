/**
 * @fileoverview Emergency contacts service.
 *
 * BACKEND DEPENDENCIES:
 *   GET    /emergency-contacts?userId=   → EmergencyContact[]
 *   POST   /emergency-contacts           → EmergencyContact
 *   PUT    /emergency-contacts/:id       → EmergencyContact
 *   DELETE /emergency-contacts/:id       → { success: true }
 *   GET    /emergency/view?token=        → EmergencyView  (public, no auth required)
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest, BASE_URL } from './apiClient.js';
import { EMERGENCY_CONTACTS } from '@/mock/emergencyContacts.js';

let _contacts = [...EMERGENCY_CONTACTS];

/**
 * @param {string} userId
 * @returns {Promise<import('@/types').EmergencyContact[]>}
 */
export async function getContacts(userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    return _contacts.filter((c) => c.userId === userId);
  }
  return apiRequest(`/emergency-contacts?userId=${encodeURIComponent(userId)}`);
}

/**
 * @param {{ userId:string, name:string, relation:string, phone:string }} payload
 * @returns {Promise<import('@/types').EmergencyContact>}
 */
export async function addContact({ userId, name, relation, phone }) {
  if (USE_MOCK) {
    await mockDelay(400);
    const contact = { contactId: `ec_${Date.now()}`, userId, name, relation, phone };
    _contacts = [..._contacts, contact];
    return contact;
  }
  return apiRequest('/emergency-contacts', {
    method: 'POST',
    body: JSON.stringify({ userId, name, relation, phone }),
  });
}

/**
 * @param {string} contactId
 * @param {{ name?:string, relation?:string, phone?:string }} updates
 * @returns {Promise<import('@/types').EmergencyContact>}
 */
export async function updateContact(contactId, updates) {
  if (USE_MOCK) {
    await mockDelay(400);
    _contacts = _contacts.map((c) => c.contactId === contactId ? { ...c, ...updates } : c);
    return _contacts.find((c) => c.contactId === contactId);
  }
  return apiRequest(`/emergency-contacts/${encodeURIComponent(contactId)}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * @param {string} contactId
 * @returns {Promise<{ success: boolean }>}
 */
export async function deleteContact(contactId) {
  if (USE_MOCK) {
    await mockDelay(300);
    _contacts = _contacts.filter((c) => c.contactId !== contactId);
    return { success: true };
  }
  return apiRequest(`/emergency-contacts/${encodeURIComponent(contactId)}`, { method: 'DELETE' });
}

/**
 * Public endpoint — no auth token required.
 * @param {string} token
 * @returns {Promise<import('@/types').EmergencyView>}
 */
export async function getEmergencyView(token) {
  if (USE_MOCK) {
    await mockDelay(500);
    return {
      userName: 'Aarav Sharma',
      sosMessage: 'Feeling overwhelmed. Need immediate support.',
      sentAt: new Date().toISOString(),
      status: 'Acknowledged',
    };
  }
  const res = await fetch(`${BASE_URL}/emergency/view?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Emergency view not found or link has expired.');
  return res.json();
}
