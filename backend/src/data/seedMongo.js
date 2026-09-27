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

import {
  UserModel,
  TherapistModel,
  AvailabilityModel,
  BookingModel,
  MoodModel,
  SosAlertModel,
  EmergencyContactModel,
  NotificationModel,
  AdminNotificationModel,
  ReportModel,
  RecommendationModel,
  MeditationModel,
  ChatMessageModel,
  TherapistMessageModel,
} from '../models/index.js';
import { hashSeedUsers } from '../utils/password.js';

export async function seedMongoDatabase() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount > 0) {
      console.log('🍃 MongoDB already contains users. Topping up any empty collections only.');
    }

    console.log('🌱 Seeding initial records into MongoDB...');

    const initialTherapistMsgs = Object.entries(INITIAL_THERAPIST_MESSAGES).flatMap(([userId, msgs]) =>
      msgs.map((m) => ({ ...m, userId }))
    );

    const collections = [
      ['users', UserModel, () => UserModel.insertMany(hashSeedUsers(INITIAL_USERS))],
      ['therapists', TherapistModel, () => TherapistModel.insertMany(INITIAL_THERAPISTS)],
      ['availability', AvailabilityModel, () => AvailabilityModel.insertMany(INITIAL_AVAILABILITY)],
      ['bookings', BookingModel, () => BookingModel.insertMany(INITIAL_BOOKINGS)],
      ['moods', MoodModel, () => MoodModel.insertMany(generateInitialMoods())],
      ['sos alerts', SosAlertModel, () => SosAlertModel.insertMany(INITIAL_SOS_ALERTS)],
      ['emergency contacts', EmergencyContactModel, () => EmergencyContactModel.insertMany(INITIAL_EMERGENCY_CONTACTS)],
      ['notifications', NotificationModel, () => NotificationModel.insertMany(INITIAL_NOTIFICATIONS)],
      ['admin notifications', AdminNotificationModel, () => AdminNotificationModel.insertMany(INITIAL_ADMIN_NOTIFICATIONS)],
      ['reports', ReportModel, () => ReportModel.insertMany(INITIAL_REPORTS)],
      [
        'recommendations',
        RecommendationModel,
        () =>
          RecommendationModel.insertMany(
            INITIAL_RECOMMENDATIONS.map((r) => ({ ...r, category: r.type || 'general' }))
          ),
      ],
      ['meditations', MeditationModel, () => MeditationModel.insertMany(INITIAL_MEDITATIONS)],
      ['chat history', ChatMessageModel, () => ChatMessageModel.insertMany(INITIAL_CHAT_HISTORY)],
      ['therapist messages', TherapistMessageModel, () => TherapistMessageModel.insertMany(initialTherapistMsgs)],
    ];

    // Seed each collection independently (only when that collection is empty)
    // so one invalid document or a partial seed cannot leave the demo broken.
    let inserted = 0;
    let skipped = 0;
    for (const [label, model, insert] of collections) {
      try {
        const count = await model.countDocuments();
        if (count > 0) {
          skipped++;
          continue;
        }
        await insert();
        inserted++;
      } catch (err) {
        console.error(`⚠️ Seeding "${label}" failed: ${err.message}`);
      }
    }

    console.log(`✅ MongoDB seeding finished (${inserted} collections inserted, ${skipped} already populated).`);
  } catch (err) {
    console.error('⚠️ Error seeding MongoDB:', err.message);
  }
}
