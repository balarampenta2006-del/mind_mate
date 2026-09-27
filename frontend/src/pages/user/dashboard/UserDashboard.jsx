import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/stores/authStore.jsx';
import { getDailyMotivationMessage } from '@/services/recommendationService.js';
import { getLatestMood } from '@/services/moodService.js';
import { getBookings } from '@/services/bookingService.js';
import { BookingStatus } from '@/constants/enums.js';
import { formatDate, formatTime } from '@/utils/formatters.js';

import { SkeletonCard } from '@/components/ui/Skeleton.jsx';
import Avatar from '@/components/ui/Avatar.jsx';
import MoodHistoryCard from '@/components/domain/mood/MoodHistoryCard.jsx';

export default function UserDashboard() {
  const { user } = useAuth();
  const [motivation, setMotivation] = useState('');
  const [latestMood, setLatestMood] = useState(null);
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [motRes, moodRes, bookings] = await Promise.all([
          getDailyMotivationMessage(),
          getLatestMood(user.userId),
          getBookings(user.userId),
        ]);
        setMotivation(motRes.message);
        setLatestMood(moodRes);

        const upcoming = bookings.find((b) =>
          b.status === BookingStatus.CONFIRMED && new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
        );
        setUpcomingBooking(upcoming || null);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.userId]);

  const firstName = user.name.split(' ')[0];

  return (
    <div style={{ paddingBottom: 40 }}>
      <header className="page-header" style={{ borderBottom: 'none', background: 'transparent' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>Hi, {firstName}</h1>
          <p style={{ color: 'var(--muted)' }}>How are you feeling today?</p>
        </div>
        <Avatar name={user.name} size="lg" />
      </header>

      <div className="page-body">
        <div className="grid-2" style={{ marginBottom: 'var(--sp-8)' }}>
          {/* Daily Motivation */}
          <section className="card card-body" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary-light)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, color: 'var(--primary-dark)' }}>
              <i className="fa-solid fa-leaf" style={{ fontSize: 20 }} />
              <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Daily Insight</h2>
            </div>
            {loading ? (
              <SkeletonCard rows={2} />
            ) : (
              <p style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-heading)', color: 'var(--primary-dark)', lineHeight: 1.4 }}>
                "{motivation}"
              </p>
            )}
          </section>

          {/* Quick Actions */}
          <section className="card card-body">
            <h2 className="section-title" style={{ fontSize: 'var(--text-base)' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              <Link to="/user/mood" className="btn btn-primary" style={{ height: 'auto', padding: '16px 12px', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
                <i className="fa-solid fa-face-smile" style={{ fontSize: 24 }} />
                <span>Log Mood</span>
              </Link>
              <Link to="/user/chat" className="btn btn-outline" style={{ height: 'auto', padding: '16px 12px', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
                <i className="fa-solid fa-comments" style={{ fontSize: 24 }} />
                <span>AI Chat</span>
              </Link>
            </div>
          </section>
        </div>

        <div className="grid-2">
          {/* Latest Mood */}
          <section>
            <div className="flex-between" style={{ marginBottom: 'var(--sp-5)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Recent Mood</h2>
              <Link to="/user/mood/history" style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>View History</Link>
            </div>
            {loading ? (
              <SkeletonCard />
            ) : latestMood ? (
              <MoodHistoryCard mood={latestMood} />
            ) : (
              <div className="card card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, color: 'var(--muted-light)', marginBottom: 12 }}>😶</div>
                <p style={{ color: 'var(--muted)', marginBottom: 16 }}>You haven't logged your mood recently.</p>
                <Link to="/user/mood" className="btn btn-primary btn-sm">Log Mood Now</Link>
              </div>
            )}
          </section>

          {/* Upcoming Session */}
          <section>
            <div className="flex-between" style={{ marginBottom: 'var(--sp-5)' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Upcoming Session</h2>
              <Link to="/user/bookings" style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>All Bookings</Link>
            </div>
            {loading ? (
              <SkeletonCard />
            ) : upcomingBooking ? (
              <div className="card card-body card-hover" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)', padding: 12, borderRadius: 12, textAlign: 'center', minWidth: 64 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{formatDate(upcomingBooking.date, 'MMM')}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{formatDate(upcomingBooking.date, 'dd')}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{upcomingBooking.therapist?.name}</h3>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-regular fa-clock" /> {formatTime(`2000-01-01T${upcomingBooking.time}`)}
                  </div>
                </div>
                <Link to="/user/bookings" className="btn btn-ghost btn-sm">
                  <i className="fa-solid fa-chevron-right" />
                </Link>
              </div>
            ) : (
              <div className="card card-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 32, color: 'var(--muted-light)', marginBottom: 16 }} />
                <p style={{ color: 'var(--muted)', marginBottom: 16 }}>No upcoming sessions.</p>
                <Link to="/user/therapists" className="btn btn-outline btn-sm">Find a Therapist</Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
