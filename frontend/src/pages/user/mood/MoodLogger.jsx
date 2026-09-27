import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { logMood } from '@/services/moodService.js';
import { MoodType } from '@/constants/enums.js';
import { validateNote } from '@/utils/validation.js';

import MoodSelector from '@/components/domain/mood/MoodSelector.jsx';
import MoodLevelSlider from '@/components/domain/mood/MoodLevelSlider.jsx';

export default function MoodLogger() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [type, setType] = useState(MoodType.CALM);
  const [level, setLevel] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validateNote(note)) {
      setError('Note must be less than 500 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await logMood({ userId: user.userId, moodType: type, moodLevel: level, note });
      showToast('Mood logged successfully!');
      navigate('/user/mood/history', { replace: true });
    } catch (err) {
      showToast(err.message || 'Failed to log mood. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-body-narrow mx-auto">
      <header className="page-header" style={{ background: 'transparent', border: 'none', padding: 0, marginBottom: 'var(--sp-6)' }}>
        <button className="back-link" onClick={() => navigate('/user/dashboard')} aria-label="Back to dashboard">
          <i className="fa-solid fa-arrow-left" /> Back
        </button>
        <h1 style={{ marginTop: 'var(--sp-2)' }}>Log Your Mood</h1>
      </header>

      <form onSubmit={handleSubmit} className="card card-body">
        <div className="form-group">
          <label className="form-label" style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--sp-4)' }}>
            How are you feeling right now?
          </label>
          <MoodSelector value={type} onChange={setType} />
        </div>

        <MoodLevelSlider value={level} onChange={setLevel} moodType={type} />

        <div className="form-group" style={{ marginTop: 'var(--sp-6)' }}>
          <label className="form-label" htmlFor="mood-note">Add a note (optional)</label>
          <p className="form-hint" style={{ marginBottom: 'var(--sp-3)' }}>Write down what's on your mind. This helps track patterns.</p>
          <textarea
            id="mood-note"
            className={`form-input form-textarea${error ? ' error' : ''}`}
            placeholder="I'm feeling..."
            value={note}
            onChange={(e) => { setNote(e.target.value); setError(''); }}
            maxLength={500}
          />
          <div className="flex-between" style={{ marginTop: 4 }}>
            {error ? <div className="form-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div> : <div />}
            <span style={{ fontSize: 11, color: note.length > 400 ? 'var(--warning)' : 'var(--muted)' }}>
              {note.length}/500
            </span>
          </div>
        </div>

        <button type="submit" className={`btn btn-primary btn-full btn-lg${loading ? ' btn-loading' : ''}`} disabled={loading} style={{ marginTop: 'var(--sp-4)' }}>
          {!loading && <><i className="fa-solid fa-check" /> Save Entry</>}
        </button>
      </form>
    </div>
  );
}
