/**
 * @fileoverview User / profile service.
 *
 * BACKEND DEPENDENCIES:
 *   GET /users?role=user        → User[]       (admin/therapist: list patients)
 *   GET /users?role=therapist   → Therapist[]  (admin: list therapists)
 *   PUT /users/:id/profile      → User         (update own profile)
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { USERS } from '@/mock/users.js';
import { THERAPISTS } from '@/mock/therapists.js';
import { Role } from '@/constants/enums.js';

/**
 * @returns {Promise<import('@/types').User[]>}
 */
export async function getPatients() {
  if (USE_MOCK) {
    await mockDelay(400);
    return USERS.filter((u) => u.role === Role.USER);
  }
  return apiRequest('/users?role=user');
}

/**
 * @returns {Promise<import('@/types').Therapist[]>}
 */
export async function getTherapists() {
  if (USE_MOCK) {
    await mockDelay(400);
    return THERAPISTS;
  }
  return apiRequest('/users?role=therapist');
}

/**
 * @param {string} userId
 * @param {Partial<import('@/types').User>} updates
 * @returns {Promise<import('@/types').User>}
 */
export async function updateProfile(userId, updates) {
  if (USE_MOCK) {
    await mockDelay(600);
    return { ...updates };
  }
  return apiRequest(`/users/${encodeURIComponent(userId)}/profile`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}
