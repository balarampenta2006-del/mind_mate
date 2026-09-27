import { NotificationType } from '@/constants/enums.js';

/** @type {import('@/types').Notification[]} */
export const NOTIFICATIONS = [
  {
    notificationId: 'n1',
    userId: 'u1',
    message: 'Your session with Dr. Meera Kapoor on 5 Sep at 10:00 AM has been confirmed.',
    type: NotificationType.BOOKING,
    isRead: false,
    createdAt: '2026-08-31T09:00:00Z',
  },
  {
    notificationId: 'n2',
    userId: 'u1',
    message: 'Dr. Meera Kapoor sent you a new wellness note. Tap to read.',
    type: NotificationType.ADVICE,
    isRead: false,
    createdAt: '2026-08-30T14:30:00Z',
  },
  {
    notificationId: 'n3',
    userId: 'u1',
    message: 'A new personalised recommendation is available for you: "Try a Morning Breathing Session".',
    type: NotificationType.RECOMMENDATION,
    isRead: true,
    createdAt: '2026-08-30T08:00:00Z',
  },
  {
    notificationId: 'n4',
    userId: 'u1',
    message: 'Your SOS alert from 28 Aug has been acknowledged by the support team.',
    type: NotificationType.SOS,
    isRead: true,
    createdAt: '2026-08-28T16:00:00Z',
  },
  {
    notificationId: 'n5',
    userId: 'u1',
    message: 'Welcome to Mind Mate! Your wellness journey starts today.',
    type: NotificationType.SYSTEM,
    isRead: true,
    createdAt: '2026-08-10T07:00:00Z',
  },
];
