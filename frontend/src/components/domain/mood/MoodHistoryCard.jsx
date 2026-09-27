import { MOOD_EMOJIS, MOOD_COLORS } from '@/constants/enums.js';
import { formatDate } from '@/utils/formatters.js';

/** @param {{ mood: import('@/types').Mood }} props */
export default function MoodHistoryCard({ mood }) {
  const emoji = MOOD_EMOJIS[mood.moodType] || '😐';
  const color = MOOD_COLORS[mood.moodType] || 'var(--muted)';

  return (
    <div className="card card-body" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <strong style={{ color, fontFamily: 'var(--font-heading)' }}>{mood.moodType}</strong>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{formatDate(mood.date)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: mood.note ? 8 : 0 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Intensity</span>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${mood.moodLevel * 10}%`, background: color, borderRadius: 999 }} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 700 }}>{mood.moodLevel}/10</span>
        </div>
        {mood.note && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{mood.note}"
          </p>
        )}
      </div>
    </div>
  );
}
