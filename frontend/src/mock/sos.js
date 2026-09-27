import { SOSStatus } from '@/constants/enums.js';

/** @type {import('@/types').SOS[]} */
export const SOS_ALERTS = [
  {
    sosId: 'sos1',
    userId: 'u1',
    message: 'Feeling overwhelmed. Need immediate support.',
    location: 'Bengaluru, Karnataka',
    sentAt: '2026-08-28T15:45:00Z',
    status: SOSStatus.ACKNOWLEDGED,
  },
  {
    sosId: 'sos2',
    userId: 'u2',
    message: 'Having a panic attack. Please help.',
    location: 'Chennai, Tamil Nadu',
    sentAt: '2026-08-29T10:20:00Z',
    status: SOSStatus.RESOLVED,
  },
  {
    sosId: 'sos3',
    userId: 'u4',
    message: 'In distress. Emergency contact notified.',
    location: 'Hyderabad, Telangana',
    sentAt: '2026-08-31T07:15:00Z',
    status: SOSStatus.SENT,
  },
];
