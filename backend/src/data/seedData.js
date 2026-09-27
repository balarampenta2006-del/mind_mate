export const INITIAL_USERS = [
  {
    userId: 'u1',
    name: 'Aarav Sharma',
    email: 'user@mindmate.com',
    password: 'demo1234', // hashed or validated in auth
    phone: '9876543210',
    dob: '1998-04-15',
    role: 'user',
    isActive: true,
    createdAt: '2024-01-10T08:30:00.000Z',
  },
  {
    userId: 'u2',
    name: 'Priya Nair',
    email: 'priya@mindmate.com',
    password: 'demo1234',
    phone: '9845678901',
    dob: '2000-07-22',
    role: 'user',
    isActive: true,
    createdAt: '2024-02-14T10:00:00.000Z',
  },
  {
    userId: 'u3',
    name: 'Rohan Das',
    email: 'rohan@mindmate.com',
    password: 'demo1234',
    phone: '9712345678',
    dob: '1995-11-30',
    role: 'user',
    isActive: false,
    createdAt: '2024-03-05T09:15:00.000Z',
  },
  {
    userId: 'u4',
    name: 'Sneha Reddy',
    email: 'sneha@mindmate.com',
    password: 'demo1234',
    phone: '8899001122',
    dob: '2001-01-08',
    role: 'user',
    isActive: true,
    createdAt: '2024-03-20T11:45:00.000Z',
  },
  {
    userId: 'u5',
    name: 'Vikram Mehta',
    email: 'vikram@mindmate.com',
    password: 'demo1234',
    phone: '9988776655',
    dob: '1992-09-17',
    role: 'user',
    isActive: true,
    createdAt: '2024-04-01T07:00:00.000Z',
  },
  {
    userId: 't1',
    name: 'Dr. Meera Kapoor',
    email: 'therapist@mindmate.com',
    password: 'demo1234',
    phone: '9011223344',
    dob: '1985-05-12',
    role: 'therapist',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    userId: 'adm1',
    name: 'Admin User',
    email: 'admin@mindmate.com',
    password: 'demo1234',
    phone: '9900112233',
    dob: '1980-01-01',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const INITIAL_THERAPISTS = [
  {
    therapistId: 't1',
    userId: 't1',
    name: 'Dr. Meera Kapoor',
    specialization: 'Anxiety & Depression',
    experience: 9,
    email: 'therapist@mindmate.com',
    phone: '9011223344',
    isActive: true,
    bio: 'Dr. Kapoor specialises in cognitive-behavioural approaches for anxiety and depression. She creates a warm, non-judgmental space for her clients.',
  },
  {
    therapistId: 't2',
    userId: 't2',
    name: 'Dr. Arjun Patel',
    specialization: 'Trauma & PTSD',
    experience: 14,
    email: 'arjun.patel@mindmate.com',
    phone: '9022334455',
    isActive: true,
    bio: 'Dr. Patel uses evidence-based trauma therapies including EMDR. He has extensive experience helping survivors rebuild their lives.',
  },
  {
    therapistId: 't3',
    userId: 't3',
    name: 'Dr. Sunita Rao',
    specialization: 'Relationships & Family',
    experience: 7,
    email: 'sunita.rao@mindmate.com',
    phone: '9033445566',
    isActive: true,
    bio: 'Dr. Rao works with individuals, couples and families navigating communication challenges and relationship transitions.',
  },
  {
    therapistId: 't4',
    userId: 't4',
    name: 'Dr. Karthik Bose',
    specialization: 'Stress & Burnout',
    experience: 11,
    email: 'karthik.bose@mindmate.com',
    phone: '9044556677',
    isActive: true,
    bio: 'Dr. Bose focuses on occupational stress, burnout recovery, and building sustainable work-life balance strategies.',
  },
  {
    therapistId: 't5',
    userId: 't5',
    name: 'Dr. Ananya Singh',
    specialization: 'Youth & Adolescent Mental Health',
    experience: 6,
    email: 'ananya.singh@mindmate.com',
    phone: '9055667788',
    isActive: false,
    bio: 'Dr. Singh specialises in helping young adults and adolescents navigate academic pressure, identity, and emotional health.',
  },
];

export const INITIAL_AVAILABILITY = [
  { slotId: 's1', therapistId: 't1', date: '2026-09-02', startTime: '10:00', endTime: '11:00', isBooked: false },
  { slotId: 's2', therapistId: 't1', date: '2026-09-02', startTime: '14:00', endTime: '15:00', isBooked: true },
  { slotId: 's3', therapistId: 't1', date: '2026-09-03', startTime: '10:00', endTime: '11:00', isBooked: false },
  { slotId: 's4', therapistId: 't1', date: '2026-09-03', startTime: '11:00', endTime: '12:00', isBooked: false },
  { slotId: 's5', therapistId: 't1', date: '2026-09-04', startTime: '15:00', endTime: '16:00', isBooked: false },
  { slotId: 's6', therapistId: 't2', date: '2026-09-02', startTime: '09:00', endTime: '10:00', isBooked: false },
  { slotId: 's7', therapistId: 't2', date: '2026-09-03', startTime: '16:00', endTime: '17:00', isBooked: false },
  { slotId: 's8', therapistId: 't3', date: '2026-09-02', startTime: '12:00', endTime: '13:00', isBooked: false },
  { slotId: 's9', therapistId: 't3', date: '2026-09-04', startTime: '10:00', endTime: '11:00', isBooked: true },
  { slotId: 's10', therapistId: 't4', date: '2026-09-05', startTime: '11:00', endTime: '12:00', isBooked: false },
];

export const INITIAL_BOOKINGS = [
  {
    bookingId: 'b1',
    userId: 'u1',
    therapistId: 't1',
    date: '2026-09-05',
    time: '10:00',
    status: 'Confirmed',
    notes: 'Follow-up session on anxiety management techniques.',
  },
  {
    bookingId: 'b2',
    userId: 'u1',
    therapistId: 't2',
    date: '2026-09-12',
    time: '14:00',
    status: 'Pending',
    notes: '',
  },
  {
    bookingId: 'b3',
    userId: 'u1',
    therapistId: 't1',
    date: '2026-08-20',
    time: '11:00',
    status: 'Cancelled',
    notes: 'Had to cancel due to travel.',
  },
  {
    bookingId: 'b4',
    userId: 'u2',
    therapistId: 't3',
    date: '2026-09-03',
    time: '12:00',
    status: 'Confirmed',
    notes: '',
  },
  {
    bookingId: 'b5',
    userId: 'u3',
    therapistId: 't1',
    date: '2026-09-10',
    time: '15:00',
    status: 'Pending',
    notes: '',
  },
];

export function generateInitialMoods() {
  const types = ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Neutral'];
  const notes = [
    'Feeling better after a walk.',
    'Work was stressful today.',
    'Good session with friends.',
    "Couldn't sleep well last night.",
    'Meditation helped a lot today.',
    'Feeling overwhelmed with deadlines.',
    'Had a calm, productive morning.',
    'Watched a nice movie, relaxed.',
  ];
  const moods = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    moods.push({
      moodId: `m${30 - i}`,
      userId: 'u1',
      moodType: types[Math.floor(Math.random() * types.length)],
      moodLevel: Math.floor(Math.random() * 7) + 3,
      note: notes[Math.floor(Math.random() * notes.length)],
      date: d.toISOString().slice(0, 10),
    });
  }
  return moods;
}

export const INITIAL_SOS_ALERTS = [
  {
    sosId: 'sos1',
    userId: 'u1',
    message: 'Feeling overwhelmed. Need immediate support.',
    location: { latitude: 12.9716, longitude: 77.5946, address: 'Bengaluru, Karnataka' },
    viewToken: 'demo-view-token-sos1',
    triggeredAt: '2026-08-28T15:45:00.000Z',
    status: 'Acknowledged',
  },
  {
    sosId: 'sos2',
    userId: 'u2',
    message: 'Having a panic attack. Please help.',
    location: { latitude: 13.0827, longitude: 80.2707, address: 'Chennai, Tamil Nadu' },
    viewToken: 'demo-view-token-sos2',
    triggeredAt: '2026-08-29T10:20:00.000Z',
    status: 'Resolved',
  },
  {
    sosId: 'sos3',
    userId: 'u4',
    message: 'In distress. Emergency contact notified.',
    location: { latitude: 17.385, longitude: 78.4867, address: 'Hyderabad, Telangana' },
    viewToken: 'demo-view-token-sos3',
    triggeredAt: '2026-08-31T07:15:00.000Z',
    status: 'Active',
  },
];

export const INITIAL_EMERGENCY_CONTACTS = [
  {
    contactId: 'ec1',
    userId: 'u1',
    name: 'Ravi Sharma',
    relation: 'Father',
    phone: '9876500001',
  },
  {
    contactId: 'ec2',
    userId: 'u1',
    name: 'Kavya Sharma',
    relation: 'Sister',
    phone: '9876500002',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    notificationId: 'n1',
    userId: 'u1',
    title: 'Booking Confirmed',
    message: 'Your session with Dr. Meera Kapoor on 5 Sep at 10:00 AM has been confirmed.',
    type: 'booking',
    isRead: false,
    createdAt: '2026-08-31T09:00:00.000Z',
  },
  {
    notificationId: 'n2',
    userId: 'u1',
    title: 'Wellness Note from Your Therapist',
    message: 'Dr. Meera Kapoor sent you a new wellness note. Tap to read.',
    type: 'advice',
    isRead: false,
    createdAt: '2026-08-30T14:30:00.000Z',
  },
  {
    notificationId: 'n3',
    userId: 'u1',
    title: 'New Recommendation',
    message: 'A new personalised recommendation is available for you: "Try a Morning Breathing Session".',
    type: 'recommendation',
    isRead: true,
    createdAt: '2026-08-30T08:00:00.000Z',
  },
  {
    notificationId: 'n4',
    userId: 'u1',
    title: 'SOS Alert Acknowledged',
    message: 'Your SOS alert from 28 Aug has been acknowledged by the support team.',
    type: 'sos',
    isRead: true,
    createdAt: '2026-08-28T16:00:00.000Z',
  },
  {
    notificationId: 'n5',
    userId: 'u1',
    title: 'Welcome to Mind Mate',
    message: 'Welcome to Mind Mate! Your wellness journey starts today.',
    type: 'system',
    isRead: true,
    createdAt: '2026-08-10T07:00:00.000Z',
  },
];

export const INITIAL_ADMIN_NOTIFICATIONS = [
  { adminNotificationId: 'an1', title: 'New Registration', message: 'New user Sneha Reddy registered.', type: 'system', isRead: false, createdAt: '2026-08-31T11:45:00.000Z' },
  { adminNotificationId: 'an2', title: 'SOS Alert Acknowledged', message: 'SOS alert from Aarav Sharma acknowledged.', type: 'sos', isRead: false, createdAt: '2026-08-28T16:00:00.000Z' },
  { adminNotificationId: 'an3', title: 'Therapist Deactivated', message: 'Dr. Ananya Singh account deactivated.', type: 'system', isRead: true, createdAt: '2026-08-25T09:00:00.000Z' },
  { adminNotificationId: 'an4', title: 'Backup Completed', message: 'Platform backup completed successfully.', type: 'system', isRead: true, createdAt: '2026-08-24T02:00:00.000Z' },
];

export const INITIAL_REPORTS = [
  {
    reportId: 'rep1',
    userId: 'u1',
    type: 'mood',
    data: {
      period: '30d',
      label: 'August 2026',
      trend: [
        { date: '2026-08-01', moodLevel: 6, moodType: 'Calm' },
        { date: '2026-08-15', moodLevel: 7, moodType: 'Happy' },
        { date: '2026-08-30', moodLevel: 8, moodType: 'Calm' },
      ],
      averageMoodLevel: 6.2,
      mostFrequentMood: 'Calm',
      insights: [
        'Your mood trend showed a gradual improvement over the past 30 days.',
        'You logged moods most consistently on weekdays.',
        'Mood levels were generally higher on days following meditation sessions.',
      ],
    },
    generatedAt: '2026-08-31T08:00:00.000Z',
    period: '30d',
  },
  {
    reportId: 'rep2',
    userId: 'u1',
    type: 'mood',
    data: {
      period: '7d',
      label: 'Last 7 Days',
      trend: [
        { date: '2026-08-25', moodLevel: 5, moodType: 'Anxious' },
        { date: '2026-08-28', moodLevel: 6, moodType: 'Calm' },
        { date: '2026-08-31', moodLevel: 7, moodType: 'Happy' },
      ],
      averageMoodLevel: 5.8,
      mostFrequentMood: 'Anxious',
      insights: [
        'This week showed some variation in mood levels.',
        'Wednesday and Thursday recorded lower mood scores.',
        'Consider the anxiety-relief meditation series this coming week.',
      ],
    },
    generatedAt: '2026-08-31T08:00:00.000Z',
    period: '7d',
  },
];

export const INITIAL_RECOMMENDATIONS = [
  {
    recId: 'r1',
    userId: 'u1',
    type: 'meditation',
    title: 'Try a Morning Breathing Session',
    description: 'Based on your recent mood logs, starting your day with 10 minutes of focused breathing may help reduce morning anxiety.',
    date: '2026-08-30',
  },
  {
    recId: 'r2',
    userId: 'u1',
    type: 'journaling',
    title: 'Gratitude Journaling',
    description: 'Spending 5–10 minutes writing three things you are grateful for each day has been shown to improve overall mood and wellbeing.',
    date: '2026-08-29',
  },
  {
    recId: 'r3',
    userId: 'u1',
    type: 'exercise',
    title: 'Light Physical Activity',
    description: 'Even a 20-minute walk outdoors can meaningfully lift your mood. Try scheduling a short walk this afternoon.',
    date: '2026-08-28',
  },
  {
    recId: 'r4',
    userId: 'u1',
    type: 'sleep',
    title: 'Sleep Routine Consistency',
    description: 'Your recent logs suggest irregular sleep patterns. Setting a consistent sleep time can significantly improve emotional regulation.',
    date: '2026-08-27',
  },
];

export const INITIAL_MEDITATIONS = [
  {
    meditationId: 'med1',
    title: 'Morning Calm',
    description: 'Begin your day with a gentle 10-minute breathing exercise to set a peaceful intention for the hours ahead.',
    duration: 10,
    category: 'Breathing',
    audioUrl: null,
  },
  {
    meditationId: 'med2',
    title: 'Deep Sleep Relaxation',
    description: 'A soothing body-scan and progressive relaxation practice designed to ease you into restful sleep.',
    duration: 20,
    category: 'Sleep',
    audioUrl: null,
  },
  {
    meditationId: 'med3',
    title: 'Anxiety Release',
    description: 'Grounding techniques and slow, controlled breathing to release anxious energy and restore calm.',
    duration: 15,
    category: 'Anxiety Relief',
    audioUrl: null,
  },
  {
    meditationId: 'med4',
    title: 'Focus & Clarity',
    description: 'A mindful concentration practice to sharpen attention and clear mental fog before important tasks.',
    duration: 12,
    category: 'Focus',
    audioUrl: null,
  },
  {
    meditationId: 'med5',
    title: 'Present Moment Awareness',
    description: 'A classic mindfulness practice bringing full attention to the present moment through breath and body awareness.',
    duration: 18,
    category: 'Mindfulness',
    audioUrl: null,
  },
  {
    meditationId: 'med6',
    title: 'Stress Melt',
    description: 'Release physical and mental tension with this gentle guided body-scan and visualisation practice.',
    duration: 25,
    category: 'Stress Relief',
    audioUrl: null,
  },
  {
    meditationId: 'med7',
    title: '4-7-8 Breathing',
    description: 'A powerful breathing technique that activates the parasympathetic nervous system for instant calm.',
    duration: 8,
    category: 'Breathing',
    audioUrl: null,
  },
  {
    meditationId: 'med8',
    title: 'Evening Wind-Down',
    description: 'A 15-minute guided practice to transition from the busyness of the day to peaceful rest.',
    duration: 15,
    category: 'Sleep',
    audioUrl: null,
  },
];

export const INITIAL_CHAT_HISTORY = [
  {
    chatId: 'c0',
    userId: 'u1',
    message: "Hello, I've been feeling quite anxious lately.",
    reply: "Thank you for sharing that with me. Anxiety can be really difficult to carry. I'm here to listen — would you like to tell me more about what's been on your mind?",
    emotion: 'anxious',
    dateTime: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const INITIAL_THERAPIST_MESSAGES = {
  u1: [
    { msgId: 'msg1', fromTherapist: true, text: 'Hello Aarav, how have you been since our last session?', dateTime: new Date(Date.now() - 7200000).toISOString() },
    { msgId: 'msg2', fromTherapist: false, text: 'A bit anxious but managing. Thank you for checking in.', dateTime: new Date(Date.now() - 3600000).toISOString() },
  ],
};
