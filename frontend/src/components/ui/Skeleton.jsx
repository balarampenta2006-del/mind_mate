/**
 * Skeleton placeholder
 * @param {{ type?:'text'|'title'|'card'|'avatar'|'chart', width?:string, height?:string, count?:number }} props
 */
export function Skeleton({ type = 'text', width, height, style }) {
  const classes = {
    text: 'skeleton skeleton-text',
    title: 'skeleton skeleton-title',
    card: 'skeleton skeleton-card',
    avatar: 'skeleton skeleton-avatar',
    chart: 'skeleton skeleton-chart',
  };
  return (
    <div
      className={classes[type] || 'skeleton'}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="card card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton type="title" width="60%" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} type="text" width={i === rows - 1 ? '40%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} type="text" />
          ))}
        </div>
      ))}
    </div>
  );
}
