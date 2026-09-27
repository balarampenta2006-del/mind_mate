/**
 * @fileoverview Meditation service.
 *
 * BACKEND DEPENDENCIES:
 *   GET  /meditation?category=      → Meditation[]
 *   GET  /meditation/:id            → Meditation
 *   POST /meditation/:id/complete   → { success: true }
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { MEDITATION_SESSIONS } from '@/mock/meditation.js';

/**
 * @param {{ category?: string }} [filters]
 * @returns {Promise<import('@/types').Meditation[]>}
 */
export async function getSessions({ category } = {}) {
  if (USE_MOCK) {
    await mockDelay(400);
    return category
      ? MEDITATION_SESSIONS.filter((s) => s.category === category)
      : MEDITATION_SESSIONS;
  }
  const q = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiRequest(`/meditation${q}`);
}

/**
 * @param {string} id
 * @returns {Promise<import('@/types').Meditation>}
 */
export async function getSession(id) {
  if (USE_MOCK) {
    await mockDelay(300);
    const s = MEDITATION_SESSIONS.find((s) => s.meditationId === id);
    if (!s) throw new Error('Meditation session not found.');
    return s;
  }
  return apiRequest(`/meditation/${encodeURIComponent(id)}`);
}

/**
 * @param {string} meditationId
 * @param {string} userId
 * @returns {Promise<{ success: boolean }>}
 */
export async function markComplete(meditationId, userId) {
  if (USE_MOCK) {
    await mockDelay(300);
    return { success: true, meditationId, userId };
  }
  return apiRequest(`/meditation/${encodeURIComponent(meditationId)}/complete`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}
