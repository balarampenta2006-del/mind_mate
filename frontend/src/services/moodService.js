/**
 * @fileoverview Mood tracking service.
 *
 * BACKEND DEPENDENCIES:
 *   GET  /moods?userId=&days=       → Mood[]
 *   POST /moods                     → Mood
 *   GET  /moods/trend?userId=&period= → MoodTrendPoint[]
 *   GET  /moods/latest?userId=      → Mood | null
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { MOODS } from '@/mock/moods.js';

let _moods = [...MOODS];

/**
 * @param {string} userId
 * @param {number} [days=30]
 * @returns {Promise<import('@/types').Mood[]>}
 */
export async function getMoodHistory(userId, days = 30) {
  if (USE_MOCK) {
    await mockDelay(400);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return _moods
      .filter((m) => m.userId === userId && new Date(m.date) >= cutoff)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return apiRequest(`/moods?userId=${encodeURIComponent(userId)}&days=${days}`);
}

/**
 * @param {{ userId:string, moodType:string, moodLevel:number, note?:string }} payload
 * @returns {Promise<import('@/types').Mood>}
 */
export async function logMood({ userId, moodType, moodLevel, note }) {
  if (USE_MOCK) {
    await mockDelay(500);
    const newMood = {
      moodId: `m_${Date.now()}`,
      userId,
      moodType,
      moodLevel: Number(moodLevel),
      note: note || '',
      date: new Date().toISOString().slice(0, 10),
    };
    _moods = [newMood, ..._moods];
    return newMood;
  }
  return apiRequest('/moods', {
    method: 'POST',
    body: JSON.stringify({ userId, moodType, moodLevel, note }),
  });
}

/**
 * @param {string} userId
 * @param {'7d'|'30d'|'90d'} [period='30d']
 * @returns {Promise<import('@/types').MoodTrendPoint[]>}
 */
export async function getMoodTrend(userId, period = '30d') {
  if (USE_MOCK) {
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const history = await getMoodHistory(userId, days);
    return history.map((m) => ({ date: m.date, level: m.moodLevel, type: m.moodType }));
  }
  return apiRequest(`/moods/trend?userId=${encodeURIComponent(userId)}&period=${period}`);
}

/**
 * @param {string} userId
 * @returns {Promise<import('@/types').Mood|null>}
 */
export async function getLatestMood(userId) {
  if (USE_MOCK) {
    const history = await getMoodHistory(userId, 30);
    return history[0] ?? null;
  }
  return apiRequest(`/moods/latest?userId=${encodeURIComponent(userId)}`);
}
