import { MOOD_COLORS } from '@/constants/enums.js';

/**
 * @param {{ value: number, onChange: (val: number) => void, moodType: string }} props
 */
export default function MoodLevelSlider({ value, onChange, moodType }) {
  const color = MOOD_COLORS[moodType] || 'var(--primary)';

  const getLabel = () => {
    if (value <= 3) return 'Mild';
    if (value <= 7) return 'Moderate';
    return 'Intense';
  };

  return (
    <div className="mood-level-wrap">
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <label style={{ margin: 0 }}>
          Intensity
          <span className="mood-level-value" style={{ background: color }}>{value}</span>
        </label>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          {getLabel()}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mood-range"
        style={{
          background: `linear-gradient(to right, ${color} ${(value - 1) * 11.11}%, var(--border) ${(value - 1) * 11.11}%)`,
        }}
        aria-label="Mood Intensity"
      />
      <div className="flex-between" style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        <span>1 (Low)</span>
        <span>10 (High)</span>
      </div>
    </div>
  );
}
