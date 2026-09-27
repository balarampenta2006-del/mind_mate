/**
 * @fileoverview Reports service.
 *
 * BACKEND DEPENDENCIES:
 *   GET  /reports?userId=          → Report[]
 *   GET  /reports/:id              → Report
 *   POST /reports/generate         → Report
 *   GET  /therapist/reports/:userId → Report[]  (therapist viewing patient reports)
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { REPORTS } from '@/mock/reports.js';

/**
 * @param {string} userId
 * @returns {Promise<import('@/types').Report[]>}
 */
export async function getReports(userId) {
  if (USE_MOCK) {
    await mockDelay(400);
    return REPORTS.filter((r) => r.userId === userId);
  }
  return apiRequest(`/reports?userId=${encodeURIComponent(userId)}`);
}

/**
 * @param {string} reportId
 * @returns {Promise<import('@/types').Report>}
 */
export async function getReport(reportId) {
  if (USE_MOCK) {
    await mockDelay(300);
    const r = REPORTS.find((r) => r.reportId === reportId);
    if (!r) throw new Error('Report not found.');
    return r;
  }
  return apiRequest(`/reports/${encodeURIComponent(reportId)}`);
}

/**
 * Therapist: view a patient's reports.
 * @param {string} userId
 * @returns {Promise<import('@/types').Report[]>}
 */
export async function getUserReportForTherapist(userId) {
  if (USE_MOCK) {
    await mockDelay(400);
    return REPORTS.filter((r) => r.userId === userId);
  }
  return apiRequest(`/therapist/reports/${encodeURIComponent(userId)}`);
}

/**
 * @param {string} userId
 * @param {'7d'|'30d'|'90d'} period
 * @returns {Promise<import('@/types').Report>}
 */
export async function generateReport(userId, period) {
  if (USE_MOCK) {
    await mockDelay(1000);
    return REPORTS[0];
  }
  return apiRequest('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ userId, period }),
  });
}
