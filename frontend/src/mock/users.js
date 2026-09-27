import { Role } from '@/constants/enums.js';

/** @type {import('@/types').User[]} */
export const USERS = [
  {
    userId: 'u1',
    name: 'Aarav Sharma',
    email: 'user@mindmate.com',
    phone: '9876543210',
    dob: '1998-04-15',
    role: Role.USER,
    isActive: true,
    createdAt: '2024-01-10T08:30:00Z',
  },
  {
    userId: 'u2',
    name: 'Priya Nair',
    email: 'priya@mindmate.com',
    phone: '9845678901',
    dob: '2000-07-22',
    role: Role.USER,
    isActive: true,
    createdAt: '2024-02-14T10:00:00Z',
  },
  {
    userId: 'u3',
    name: 'Rohan Das',
    email: 'rohan@mindmate.com',
    phone: '9712345678',
    dob: '1995-11-30',
    role: Role.USER,
    isActive: false,
    createdAt: '2024-03-05T09:15:00Z',
  },
  {
    userId: 'u4',
    name: 'Sneha Reddy',
    email: 'sneha@mindmate.com',
    phone: '8899001122',
    dob: '2001-01-08',
    role: Role.USER,
    isActive: true,
    createdAt: '2024-03-20T11:45:00Z',
  },
  {
    userId: 'u5',
    name: 'Vikram Mehta',
    email: 'vikram@mindmate.com',
    phone: '9988776655',
    dob: '1992-09-17',
    role: Role.USER,
    isActive: true,
    createdAt: '2024-04-01T07:00:00Z',
  },
];

/** Currently logged-in demo user */
export const DEMO_USER = USERS[0];
