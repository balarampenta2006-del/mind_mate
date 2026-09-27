/**
 * @fileoverview Therapist & availability service (user-facing).
 *
 * BACKEND DEPENDENCIES:
 *   GET  /therapists?search=&specialization=  → Therapist[]
 *   GET  /therapists/:id                      → Therapist & { availability: AvailabilitySlot[] }
 *   GET  /therapists/:id/availability         → AvailabilitySlot[]
 *   POST /therapists/availability             → AvailabilitySlot   (therapist portal)
 *   DELETE /therapists/availability/:slotId   → { success: true }  (therapist portal)
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { THERAPISTS, AVAILABILITY } from '@/mock/therapists.js';

let _availability = [...AVAILABILITY];

/**
 * @param {{ search?:string, specialization?:string }} [filters]
 * @returns {Promise<import('@/types').Therapist[]>}
 */
export async function getTherapists({ search, specialization } = {}) {
  if (USE_MOCK) {
    await mockDelay(500);
    let result = THERAPISTS.filter((t) => t.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q)
      );
    }
    if (specialization) result = result.filter((t) => t.specialization === specialization);
    return result;
  }
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (specialization) params.set('specialization', specialization);
  const q = params.toString() ? `?${params}` : '';
  return apiRequest(`/therapists${q}`);
}

/**
 * @param {string} id
 * @returns {Promise<import('@/types').Therapist & { availability: import('@/types').AvailabilitySlot[] }>}
 */
export async function getTherapist(id) {
  if (USE_MOCK) {
    await mockDelay(300);
    const t = THERAPISTS.find((t) => t.therapistId === id);
    if (!t) throw new Error('Therapist not found.');
    return { ...t, availability: _availability.filter((s) => s.therapistId === id) };
  }
  return apiRequest(`/therapists/${encodeURIComponent(id)}`);
}

/**
 * @param {string} therapistId
 * @returns {Promise<import('@/types').AvailabilitySlot[]>}
 */
export async function getAvailability(therapistId) {
  if (USE_MOCK) {
    await mockDelay(300);
    return _availability.filter((s) => s.therapistId === therapistId && !s.isBooked);
  }
  return apiRequest(`/therapists/${encodeURIComponent(therapistId)}/availability`);
}

/**
 * @param {{ therapistId:string, date:string, startTime:string, endTime:string }} slot
 * @returns {Promise<import('@/types').AvailabilitySlot>}
 */
export async function addSlot({ therapistId, date, startTime, endTime }) {
  if (USE_MOCK) {
    await mockDelay(400);
    const slot = {
      slotId: `s_${Date.now()}`,
      therapistId, date, startTime, endTime,
      isBooked: false,
    };
    _availability = [..._availability, slot];
    return slot;
  }
  return apiRequest('/therapists/availability', {
    method: 'POST',
    body: JSON.stringify({ therapistId, date, startTime, endTime }),
  });
}

/**
 * Therapist: update own professional profile (backend pins the id to the
 * authenticated therapist, non-therapists receive 403).
 * @param {string} therapistId
 * @param {Partial<import('@/types').Therapist>} updates
 * @returns {Promise<import('@/types').Therapist>}
 */
export async function updateTherapistProfile(therapistId, updates) {
  if (USE_MOCK) {
    await mockDelay(500);
    const idx = THERAPISTS.findIndex((t) => t.therapistId === therapistId);
    if (idx === -1) throw new Error('Therapist not found.');
    THERAPISTS[idx] = { ...THERAPISTS[idx], ...updates };
    return THERAPISTS[idx];
  }
  return apiRequest(`/therapists/${encodeURIComponent(therapistId)}/profile`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * @param {string} slotId
 * @returns {Promise<{ success: boolean }>}
 */
export async function removeSlot(slotId) {
  if (USE_MOCK) {
    await mockDelay(300);
    _availability = _availability.filter((s) => s.slotId !== slotId);
    return { success: true };
  }
  return apiRequest(`/therapists/availability/${encodeURIComponent(slotId)}`, { method: 'DELETE' });
}
