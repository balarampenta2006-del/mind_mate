import { useState, useEffect } from 'react';
import { getRecommendations } from '@/services/recommendationService.js';
import { useAuth } from '@/stores/authStore.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations(user.userId)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.userId]);

  const ICONS = {
    meditation: 'fa-spa',
    journaling: 'fa-book-open',
    exercise: 'fa-person-running',
    sleep: 'fa-moon',
    article: 'fa-file-lines',
    video: 'fa-circle-play',
  };

  function renderItem(item) {
    const key = item.recId ?? item.id;
    const url = item.url || item.actionUrl;
    const inner = (
      <>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          <i className={`fa-solid ${ICONS[item.type] || 'fa-lightbulb'}`} />
        </div>
        <div>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{item.title}</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 8, lineHeight: 1.4 }}>{item.description}</p>
          <span className="badge-ui badge-neutral" style={{ textTransform: 'capitalize' }}>{item.type || item.category || 'Tip'}</span>
        </div>
      </>
    );

    // Only wrap in a link when the recommendation actually points somewhere.
    if (url) {
      return (
        <a key={key} href={url} target="_blank" rel="noreferrer" className="card card-body card-hover" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 16 }}>
          {inner}
        </a>
      );
    }
    return (
      <div key={key} className="card card-body" style={{ display: 'flex', gap: 16 }}>
        {inner}
      </div>
    );
  };

  return (
    <div className="page-body-narrow mx-auto">
      <header className="page-header" style={{ padding: '0 0 var(--sp-6) 0', border: 'none', background: 'transparent' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>For You</h1>
        <p style={{ color: 'var(--muted)' }}>Personalised content based on your recent activity and mood trends.</p>
      </header>

      {loading ? (
        <PageSpinner />
      ) : items.length === 0 ? (
        <div className="card card-body">
          <EmptyState icon="fa-lightbulb" title="No recommendations yet" description="Log your mood or start a chat to get personalised suggestions." />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
          {items.map((item) => renderItem(item))}
        </div>
      )}
    </div>
  );
}
