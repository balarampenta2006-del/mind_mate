/**
 * @fileoverview Booking service.
 *
 * BACKEND DEPENDENCIES:
 *   GET  /bookings?userId=      → TherapistBooking[]  (enriched with therapist)
 *   GET  /bookings/:id          → TherapistBooking
 *   POST /bookings              → TherapistBooking
 *   POST /bookings/:id/cancel   → TherapistBooking
 *   GET  /admin/bookings        → TherapistBooking[]  (admin: all bookings)
 *
 * All endpoints are implemented. Mock is preserved for offline/demo use.
 */

import { USE_MOCK, mockDelay, apiRequest } from './apiClient.js';
import { BOOKINGS } from '@/mock/bookings.js';
import { THERAPISTS } from '@/mock/therapists.js';
import { BookingStatus } from '@/constants/enums.js';

let _bookings = [...BOOKINGS];

/** @param {import('@/types').TherapistBooking} booking */
function enrich(booking) {
  const therapist = THERAPISTS.find((t) => t.therapistId === booking.therapistId) ?? null;
  return { ...booking, therapist };
}

/**
 * @param {string} userId
 * @returns {Promise<import('@/types').TherapistBooking[]>}
 */
export async function getBookings(userId) {
  if (USE_MOCK) {
    await mockDelay(400);
    return _bookings.filter((b) => b.userId === userId).map(enrich);
  }
  return apiRequest(`/bookings?userId=${encodeURIComponent(userId)}`);
}

/**
 * Therapist: sessions assigned to this therapist (backend requires the
 * therapist role and pins therapistId to the token subject).
 * @param {string} therapistId
 * @returns {Promise<import('@/types').TherapistBooking[]>}
 */
export async function getBookingsForTherapist(therapistId) {
  if (USE_MOCK) {
    await mockDelay(400);
    return _bookings.filter((b) => b.therapistId === therapistId).map(enrich);
  }
  return apiRequest(`/bookings?therapistId=${encodeURIComponent(therapistId)}`);
}

/**
 * @param {string} bookingId
 * @returns {Promise<import('@/types').TherapistBooking>}
 */
export async function getBooking(bookingId) {
  if (USE_MOCK) {
    await mockDelay(300);
    const b = _bookings.find((b) => b.bookingId === bookingId);
    if (!b) throw new Error('Booking not found.');
    return enrich(b);
  }
  return apiRequest(`/bookings/${encodeURIComponent(bookingId)}`);
}

/**
 * @param {{ userId:string, therapistId:string, date:string, time:string, notes?:string }} payload
 * @returns {Promise<import('@/types').TherapistBooking>}
 */
export async function book({ userId, therapistId, date, time, notes }) {
  if (USE_MOCK) {
    await mockDelay(600);
    const newBooking = {
      bookingId: `b_${Date.now()}`,
      userId, therapistId, date, time,
      status: BookingStatus.PENDING,
      notes: notes || '',
    };
    _bookings = [newBooking, ..._bookings];
    return enrich(newBooking);
  }
  return apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify({ userId, therapistId, date, time, notes }),
  });
}

/**
 * @param {string} bookingId
 * @returns {Promise<import('@/types').TherapistBooking>}
 */
export async function cancelBooking(bookingId) {
  if (USE_MOCK) {
    await mockDelay(400);
    _bookings = _bookings.map((b) =>
      b.bookingId === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b
    );
    return enrich(_bookings.find((b) => b.bookingId === bookingId));
  }
  return apiRequest(`/bookings/${encodeURIComponent(bookingId)}/cancel`, { method: 'POST' });
}

/**
 * Admin: all bookings across all users.
 * @returns {Promise<import('@/types').TherapistBooking[]>}
 */
export async function getAllBookings() {
  if (USE_MOCK) {
    await mockDelay(400);
    return _bookings.map(enrich);
  }
  return apiRequest('/admin/bookings');
}
