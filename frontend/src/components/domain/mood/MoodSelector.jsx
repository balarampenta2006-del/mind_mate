import { MoodType, MOOD_EMOJIS, MOOD_COLORS } from '@/constants/enums.js';

/**
 * @param {{ value: string, onChange: (val: string) => void }} props
 */
export default function MoodSelector({ value, onChange }) {
  const types = Object.values(MoodType);

  return (
    <div className="mood-grid">
      {types.map((type) => {
        const isSelected = value === type;
        const color = MOOD_COLORS[type];
        return (
          <button
            key={type}
            type="button"
            className={`mood-option${isSelected ? ' selected' : ''}`}
            onClick={() => onChange(type)}
            style={isSelected ? { borderColor: color, color: color, background: `${color}18` } : undefined}
          >
            <div className="mood-emoji">{MOOD_EMOJIS[type] || '😐'}</div>
            <span>{type}</span>
          </button>
        );
      })}
    </div>
  );
}
