import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// User Model
const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    dob: { type: String, default: '' },
    role: { type: String, enum: ['user', 'therapist', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// Therapist Model
const therapistSchema = new Schema(
  {
    therapistId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: '' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    specialization: { type: String, default: 'General Therapy' },
    experience: { type: Number, default: 1 },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    languages: [{ type: String }],
    avatar: { type: String, default: '' },
    sessionFee: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Availability Model
const availabilitySchema = new Schema(
  {
    slotId: { type: String, required: true, unique: true, index: true },
    therapistId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Booking Model
const bookingSchema = new Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    therapistId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['Confirmed', 'Cancelled', 'Completed', 'Pending'], default: 'Confirmed' },
    notes: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// Mood Model
const moodSchema = new Schema(
  {
    moodId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    mood: { type: String, default: '' },
    moodType: { type: String, default: '' },
    intensity: { type: Number, default: 3 },
    moodLevel: { type: Number, default: 3 },
    date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    notes: { type: String, default: '' },
    note: { type: String, default: '' },
    tags: [{ type: String }],
  },
  { timestamps: true, strict: false }
);

// SOS Alert Model
const sosAlertSchema = new Schema(
  {
    sosId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Acknowledged', 'Resolved'], default: 'Active' },
    triggeredAt: { type: String, default: () => new Date().toISOString() },
    resolvedAt: { type: String, default: null },
    viewToken: { type: String, default: '' },
    location: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      address: { type: String, default: '' },
    },
    emergencyContacts: [{ type: Schema.Types.Mixed }],
  },
  { timestamps: true }
);

// Emergency Contact Model
const emergencyContactSchema = new Schema(
  {
    contactId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String, default: 'Contact' },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Notification Model
const notificationSchema = new Schema(
  {
    notificationId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

// Admin Notification Model
const adminNotificationSchema = new Schema(
  {
    adminNotificationId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'broadcast' },
    targetRole: { type: String, default: 'all' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// Report Model
const reportSchema = new Schema(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, default: 'mood' },
    period: { type: String, default: 'monthly' },
    generatedAt: { type: String, default: () => new Date().toISOString() },
    summary: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    moodSummary: { type: Schema.Types.Mixed, default: {} },
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

// Recommendation Model
const recommendationSchema = new Schema(
  {
    recId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    category: { type: String, default: 'general' },
    type: { type: String, default: 'general' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    actionUrl: { type: String, default: '' },
    date: { type: String, default: '' },
  },
  { timestamps: true }
);

// Meditation Model
const meditationSchema = new Schema(
  {
    meditationId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    duration: { type: Number, default: 10 },
    category: { type: String, default: 'mindfulness' },
    audioUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    completedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Chat Message Model
const chatMessageSchema = new Schema(
  {
    chatId: { type: String, default: () => `c_${Date.now()}` },
    userId: { type: String, required: true, index: true },
    message: { type: String, default: '' },
    reply: { type: String, default: '' },
    emotion: { type: String, default: '' },
    dateTime: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true, strict: false }
);

// Therapist Message Model
const therapistMessageSchema = new Schema(
  {
    msgId: { type: String, default: () => `msg_${Date.now()}` },
    therapistId: { type: String, default: 't1' },
    userId: { type: String, required: true, index: true },
    fromTherapist: { type: Boolean, default: false },
    text: { type: String, default: '' },
    dateTime: { type: String, default: () => new Date().toISOString() },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false }
);

export const UserModel = model('User', userSchema);
export const TherapistModel = model('Therapist', therapistSchema);
export const AvailabilityModel = model('Availability', availabilitySchema);
export const BookingModel = model('Booking', bookingSchema);
export const MoodModel = model('Mood', moodSchema);
export const SosAlertModel = model('SosAlert', sosAlertSchema);
export const EmergencyContactModel = model('EmergencyContact', emergencyContactSchema);
export const NotificationModel = model('Notification', notificationSchema);
export const AdminNotificationModel = model('AdminNotification', adminNotificationSchema);
export const ReportModel = model('Report', reportSchema);
export const RecommendationModel = model('Recommendation', recommendationSchema);
export const MeditationModel = model('Meditation', meditationSchema);
export const ChatMessageModel = model('ChatMessage', chatMessageSchema);
export const TherapistMessageModel = model('TherapistMessage', therapistMessageSchema);
