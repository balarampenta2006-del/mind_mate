import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { getMoodHistory, getMoodTrend } from '@/services/moodService.js';
import { SkeletonList } from '@/components/ui/Skeleton.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';

import MoodHistoryCard from '@/components/domain/mood/MoodHistoryCard.jsx';
import MoodTrendChart from '@/components/charts/MoodTrendChart.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';

export default function MoodHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [h, t] = await Promise.all([
          getMoodHistory(user.userId, 30),
          getMoodTrend(user.userId, '30d'),
        ]);
        setHistory(h);
        setTrend(t.reverse()); // Ensure chronological order for chart
      } catch (err) {
        console.error('Failed to load mood history', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.userId]);

  return (
    <div className="page-body-narrow mx-auto">
      <header className="page-header" style={{ background: 'transparent', border: 'none', padding: 0, marginBottom: 'var(--sp-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button className="back-link" onClick={() => navigate('/user/dashboard')} aria-label="Back to dashboard">
            <i className="fa-solid fa-arrow-left" /> Dashboard
          </button>
          <h1 style={{ marginTop: 'var(--sp-2)' }}>Mood History</h1>
        </div>
        <Link to="/user/mood" className="btn btn-primary btn-sm">
          <i className="fa-solid fa-plus" /> Log Mood
        </Link>
      </header>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div className="card card-body"><SkeletonList count={1} /></div>
          <SkeletonList count={4} />
        </div>
      ) : history.length === 0 ? (
        <div className="card card-body">
          <EmptyState
            icon="fa-face-smile"
            title="No Mood Logs Yet"
            description="Start tracking your mood to see trends and get personalised insights over time."
            action={<Link to="/user/mood" className="btn btn-primary">Log First Mood</Link>}
          />
        </div>
      ) : (
        <>
          <section className="card card-body" style={{ marginBottom: 'var(--sp-6)' }}>
            <h2 className="section-title" style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--sp-5)' }}>30-Day Trend</h2>
            <MoodTrendChart data={trend} />
          </section>

          <section>
            <h2 className="section-title" style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--sp-4)' }}>History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {history.map((mood) => (
                <MoodHistoryCard key={mood.moodId} mood={mood} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
