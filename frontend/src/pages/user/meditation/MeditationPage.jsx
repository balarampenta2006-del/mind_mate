import { useState, useEffect } from 'react';
import { getSessions } from '@/services/meditationService.js';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';

const CATEGORY_ICONS = {
  Breathing: 'fa-wind',
  Sleep: 'fa-moon',
  'Anxiety Relief': 'fa-hands-holding-circle',
  Focus: 'fa-sun',
  Mindfulness: 'fa-spa',
  'Stress Relief': 'fa-heart-pulse',
};

const CATEGORIES = ['All', 'Breathing', 'Sleep', 'Anxiety Relief', 'Focus', 'Mindfulness', 'Stress Relief'];

export default function MeditationPage() {
  const [sessions, setSessions] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    setLoading(true);
    getSessions(category === 'All' ? {} : { category })
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="page-body-narrow mx-auto">
      <header className="page-header" style={{ padding: '0 0 var(--sp-6) 0', border: 'none', background: 'transparent' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Guided Meditation</h1>
        <p style={{ color: 'var(--muted)' }}>Find your center with these guided audio tracks.</p>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--sp-5)' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : failed ? (
        <div className="card card-body">
          <EmptyState
            icon="fa-headphones"
            title="Unable to load sessions"
            description="Meditation sessions are unavailable right now. Please try again later."
          />
        </div>
      ) : sessions.length === 0 ? (
        <div className="card card-body">
          <EmptyState
            icon="fa-headphones"
            title="No sessions found"
            description="There are no meditation sessions in this category yet."
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
          {sessions.map((track) => {
            const trackId = track.meditationId ?? track.id;
            const isPlaying = playing === trackId;
            const icon = CATEGORY_ICONS[track.category] || 'fa-spa';
            return (
              <div key={trackId} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  className="btn btn-primary"
                  style={{ width: 56, height: 56, borderRadius: '50%', padding: 0, flexShrink: 0 }}
                  onClick={() => setPlaying(isPlaying ? null : trackId)}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`} style={{ fontSize: 20 }} />
                </button>
                <div style={{ flex: 1 }}>
                  <div className="flex-between" style={{ marginBottom: 4 }}>
                    <h3 style={{ fontSize: 'var(--text-md)', margin: 0 }}>{track.title}</h3>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600 }}>{track.duration} min</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 8 }}>{track.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--primary-dark)', fontWeight: 600 }}>
                    <i className={`fa-solid ${icon}`} /> {track.category}
                  </div>
                  {isPlaying && (
                    <div style={{ marginTop: 12, height: 4, background: 'var(--primary-soft)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '30%', background: 'var(--primary)' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
