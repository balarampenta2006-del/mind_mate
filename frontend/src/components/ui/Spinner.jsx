/** @param {{ size?:'sm'|'md'|'lg', color?:string }} props */
export default function Spinner({ size = 'md', color = 'var(--primary)' }) {
  const sizes = { sm: 16, md: 24, lg: 36 };
  const s = sizes[size];
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: s,
        height: s,
        borderRadius: '50%',
        border: `2px solid rgba(0,0,0,0.08)`,
        borderTopColor: color,
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

export function PageSpinner({ message = 'Loading…' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
        gap: 16,
        color: 'var(--muted)',
        fontSize: 'var(--text-sm)',
      }}
    >
      <Spinner size="lg" />
      <span>{message}</span>
    </div>
  );
}
