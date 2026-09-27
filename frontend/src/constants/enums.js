/** @enum {string} */
export const Role = {
  USER: 'user',
  THERAPIST: 'therapist',
  ADMIN: 'admin',
};

/** @enum {string} */
export const MoodType = {
  HAPPY: 'Happy',
  CALM: 'Calm',
  ANXIOUS: 'Anxious',
  SAD: 'Sad',
  ANGRY: 'Angry',
  NEUTRAL: 'Neutral',
};

/** @enum {string} */
export const BookingStatus = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
};

/** @enum {string} */
export const SOSStatus = {
  SENT: 'Active',
  ACKNOWLEDGED: 'Acknowledged',
  RESOLVED: 'Resolved',
};

/** @enum {string} */
export const NotificationType = {
  BOOKING: 'booking',
  RECOMMENDATION: 'recommendation',
  SOS: 'sos',
  ADVICE: 'advice',
  SYSTEM: 'system',
};

/** @enum {string} */
export const ReportType = {
  MOOD: 'mood',
  SUMMARY: 'summary',
  CLINICAL: 'clinical',
};

/** @enum {string} */
export const MeditationCategory = {
  BREATHING: 'Breathing',
  SLEEP: 'Sleep',
  ANXIETY: 'Anxiety Relief',
  FOCUS: 'Focus',
  MINDFULNESS: 'Mindfulness',
  STRESS: 'Stress Relief',
};

/** Mood emoji map */
export const MOOD_EMOJIS = {
  [MoodType.HAPPY]: '😊',
  [MoodType.CALM]: '😌',
  [MoodType.ANXIOUS]: '😰',
  [MoodType.SAD]: '😢',
  [MoodType.ANGRY]: '😤',
  [MoodType.NEUTRAL]: '😐',
};

/** Mood color map (CSS var names) */
export const MOOD_COLORS = {
  [MoodType.HAPPY]: '#3a9d6f',
  [MoodType.CALM]: '#2e8b7f',
  [MoodType.ANXIOUS]: '#d97706',
  [MoodType.SAD]: '#3b82f6',
  [MoodType.ANGRY]: '#c96a6a',
  [MoodType.NEUTRAL]: '#6b7f7b',
};

export const DEMO_CREDENTIALS = {
  user: { email: 'user@mindmate.com', password: 'demo1234' },
  therapist: { email: 'therapist@mindmate.com', password: 'demo1234' },
  admin: { email: 'admin@mindmate.com', password: 'demo1234' },
};
