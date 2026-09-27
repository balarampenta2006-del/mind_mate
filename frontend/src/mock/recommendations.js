/** @type {import('@/types').Recommendation[]} */
export const RECOMMENDATIONS = [
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

export const DAILY_MOTIVATION = [
  "Your feelings are valid. You deserve support. 💚",
  "Every small step forward is still progress.",
  "It's okay not to be okay — reaching out is strength.",
  "You have survived difficult days before. You will get through this too.",
  "Healing isn't linear. Be gentle with yourself today.",
  "The bravest thing you can do is ask for help.",
  "Your mental health matters as much as your physical health.",
  "One breath at a time. One moment at a time.",
];

/** Get today's motivational message (rotates daily) */
export function getDailyMotivation() {
  const idx = new Date().getDate() % DAILY_MOTIVATION.length;
  return DAILY_MOTIVATION[idx];
}
