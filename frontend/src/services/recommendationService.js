/**
 * @fileoverview Recommendations service.
 *
 * BACKEND DEPENDENCIES:
 *   GET /recommendations?userId=        → Recommendation[]
 *   GET /recommendations/daily-motivation → { message: string }
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { RECOMMENDATIONS, getDailyMotivation } from '@/mock/recommendations.js';

/**
 * @param {string} userId
 * @returns {Promise<import('@/types').Recommendation[]>}
 */
export async function getRecommendations(userId) {
  if (USE_MOCK) {
    await mockDelay(400);
    return RECOMMENDATIONS.filter((r) => r.userId === userId);
  }
  return apiRequest(`/recommendations?userId=${encodeURIComponent(userId)}`);
}

/**
 * @returns {Promise<{ message: string }>}
 */
export async function getDailyMotivationMessage() {
  if (USE_MOCK) {
    await mockDelay(200);
    return { message: getDailyMotivation() };
  }
  return apiRequest('/recommendations/daily-motivation');
}
