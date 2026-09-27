import { MoodType, ReportType } from '@/constants/enums.js';

/** Generate trend data points for report */
function genTrendData(days = 30) {
  const types = Object.values(MoodType);
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().slice(0, 10),
      moodLevel: Math.floor(Math.random() * 6) + 3,
      moodType: types[Math.floor(Math.random() * types.length)],
    });
  }
  return data;
}

/** @type {import('@/types').Report[]} */
export const REPORTS = [
  {
    reportId: 'rep1',
    userId: 'u1',
    type: ReportType.MOOD,
    data: {
      period: '30d',
      label: 'August 2026',
      trend: genTrendData(30),
      averageMoodLevel: 6.2,
      mostFrequentMood: MoodType.CALM,
      insights: [
        'Your mood trend showed a gradual improvement over the past 30 days.',
        'You logged moods most consistently on weekdays.',
        'Mood levels were generally higher on days following meditation sessions.',
      ],
    },
    generatedAt: '2026-08-31T08:00:00Z',
    period: '30d',
  },
  {
    reportId: 'rep2',
    userId: 'u1',
    type: ReportType.MOOD,
    data: {
      period: '7d',
      label: 'Last 7 Days',
      trend: genTrendData(7),
      averageMoodLevel: 5.8,
      mostFrequentMood: MoodType.ANXIOUS,
      insights: [
        'This week showed some variation in mood levels.',
        'Wednesday and Thursday recorded lower mood scores.',
        'Consider the anxiety-relief meditation series this coming week.',
      ],
    },
    generatedAt: '2026-08-31T08:00:00Z',
    period: '7d',
  },
];
