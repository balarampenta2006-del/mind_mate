/**
 * @fileoverview Authentication service.
 *
 * BACKEND DEPENDENCIES:
 *   POST /auth/login          → { user, token }
 *   POST /auth/register       → { user, token }
 *   POST /auth/logout         → 204
 *   POST /auth/forgot-password → 204
 *   POST /auth/reset-password  → 204
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { DEMO_USER, USERS } from '@/mock/users.js';
import { DEMO_CREDENTIALS, Role } from '@/constants/enums.js';

/**
 * @param {{ email:string, password:string, role:string }} credentials
 * @returns {Promise<import('@/types').AuthResponse>}
 */
export async function login({ email, password, role }) {
  if (USE_MOCK) {
    await mockDelay(600);
    const creds = DEMO_CREDENTIALS[role];
    if (!creds || email !== creds.email || password !== creds.password) {
      throw new Error('Invalid email or password. Please try again.');
    }
    const user =
      role === Role.USER      ? DEMO_USER
      : role === Role.THERAPIST ? { ...DEMO_USER, userId: 'th1', name: 'Dr. Meera Kapoor', role: Role.THERAPIST, email }
      :                           { ...DEMO_USER, userId: 'adm1', name: 'Admin User', role: Role.ADMIN, email };
    return { user: { ...user, role }, token: `mock-jwt-${role}` };
  }
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

/**
 * @param {{ name:string, email:string, password:string, phone:string, dob:string }} data
 * @returns {Promise<import('@/types').AuthResponse>}
 */
export async function register({ name, email, password, phone, dob }) {
  if (USE_MOCK) {
    await mockDelay(800);
    if (USERS.find((u) => u.email === email)) {
      throw new Error('This email is already registered. Please log in instead.');
    }
    const newUser = {
      userId: `u_${Date.now()}`,
      name, email, phone, dob,
      role: Role.USER,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    return { user: newUser, token: 'mock-jwt-user' };
  }
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone, dob }),
  });
}

/** @returns {Promise<void>} */
export async function logout() {
  if (USE_MOCK) { await mockDelay(200); return; }
  return apiRequest('/auth/logout', { method: 'POST' });
}

/**
 * @param {{ email:string }} payload
 * @returns {Promise<void>}
 */
export async function forgotPassword({ email }) {
  if (USE_MOCK) { await mockDelay(600); return; }
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * @param {{ token:string, password:string }} payload
 * @returns {Promise<void>}
 */
export async function resetPassword({ token, password }) {
  if (USE_MOCK) { await mockDelay(600); return; }
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}
