import { BookingStatus } from '@/constants/enums.js';

/** @type {import('@/types').TherapistBooking[]} */
export const BOOKINGS = [
  {
    bookingId: 'b1',
    userId: 'u1',
    therapistId: 't1',
    date: '2026-09-05',
    time: '10:00',
    status: BookingStatus.CONFIRMED,
    notes: 'Follow-up session on anxiety management techniques.',
  },
  {
    bookingId: 'b2',
    userId: 'u1',
    therapistId: 't2',
    date: '2026-09-12',
    time: '14:00',
    status: BookingStatus.PENDING,
    notes: '',
  },
  {
    bookingId: 'b3',
    userId: 'u1',
    therapistId: 't1',
    date: '2026-08-20',
    time: '11:00',
    status: BookingStatus.CANCELLED,
    notes: 'Had to cancel due to travel.',
  },
  {
    bookingId: 'b4',
    userId: 'u2',
    therapistId: 't3',
    date: '2026-09-03',
    time: '12:00',
    status: BookingStatus.CONFIRMED,
    notes: '',
  },
  {
    bookingId: 'b5',
    userId: 'u3',
    therapistId: 't1',
    date: '2026-09-10',
    time: '15:00',
    status: BookingStatus.PENDING,
    notes: '',
  },
];
