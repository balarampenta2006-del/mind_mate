import {
  INITIAL_USERS,
  INITIAL_THERAPISTS,
  INITIAL_AVAILABILITY,
  INITIAL_BOOKINGS,
  INITIAL_SOS_ALERTS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_MEDITATIONS,
  INITIAL_CHAT_HISTORY,
  INITIAL_THERAPIST_MESSAGES,
  generateInitialMoods,
} from './seedData.js';
import { hashSeedUsers } from '../utils/password.js';

class Store {
  constructor() {
    this.reset();
  }

  reset() {
    this.users = hashSeedUsers(JSON.parse(JSON.stringify(INITIAL_USERS)));
    this.therapists = JSON.parse(JSON.stringify(INITIAL_THERAPISTS));
    this.availability = JSON.parse(JSON.stringify(INITIAL_AVAILABILITY));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.moods = generateInitialMoods();
    this.sosAlerts = JSON.parse(JSON.stringify(INITIAL_SOS_ALERTS));
    this.emergencyContacts = JSON.parse(JSON.stringify(INITIAL_EMERGENCY_CONTACTS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.adminNotifications = JSON.parse(JSON.stringify(INITIAL_ADMIN_NOTIFICATIONS));
    this.reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
    this.recommendations = JSON.parse(JSON.stringify(INITIAL_RECOMMENDATIONS));
    this.meditations = JSON.parse(JSON.stringify(INITIAL_MEDITATIONS));
    this.chatHistory = JSON.parse(JSON.stringify(INITIAL_CHAT_HISTORY));
    this.therapistMessages = JSON.parse(JSON.stringify(INITIAL_THERAPIST_MESSAGES));
    this.resetTokens = new Map(); // token -> { email, expiresAt }
  }
}

export const db = new Store();