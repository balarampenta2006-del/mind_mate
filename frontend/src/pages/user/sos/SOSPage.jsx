import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import { getSOSAlerts, sendSOS as sendSOSAlert } from '@/services/sosService.js';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import SOSStatusCard from '@/components/domain/sos/SOSStatusCard.jsx';
import { SkeletonList } from '@/components/ui/Skeleton.jsx';
import { PageSpinner } from '@/components/ui/Spinner.jsx';

export default function SOSPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    load();
  }, [user.userId]);

  async function load() {
    try {
      const data = await getSOSAlerts();
      setAlerts(data.filter(a => a.userId === user.userId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendSOS() {
    setSending(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error('Geolocation not supported'));
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }).catch(() => null);

      // Backend accepts either a plain string or { latitude, longitude, address }.
      const location = pos
        ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude, address: '' }
        : 'Location unavailable';

      await sendSOSAlert({ userId: user.userId, location, message: 'I need immediate assistance.' });
      showToast('SOS Alert Sent. Help is on the way.', 'success');
      setShowConfirm(false);
      load();
    } catch (err) {
      showToast(err.message || 'Failed to send SOS', 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-body-narrow mx-auto">
      <header className="page-header" style={{ padding: '0 0 var(--sp-6) 0', border: 'none', background: 'transparent' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--danger)' }}>Emergency SOS</h1>
        <p style={{ color: 'var(--muted)' }}>Send an immediate alert to your emergency contacts and available professionals.</p>
      </header>

      <div className="card card-body" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: 'var(--sp-6)', borderColor: 'var(--danger-light)' }}>
        <button
          className="btn"
          style={{
            width: 160, height: 160, borderRadius: '50%', background: 'var(--danger)', color: '#fff',
            fontSize: 24, fontWeight: 700, border: '8px solid var(--danger-light)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto',
            boxShadow: '0 12px 32px rgba(220, 38, 38, 0.3)', transition: 'transform 0.2s',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => setShowConfirm(true)}
        >
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 40 }} />
          <span>PRESS SOS</span>
        </button>
        <p style={{ marginTop: 24, fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          Only use in case of an active crisis or emergency.
        </p>
      </div>

      <section>
        <h2 className="section-title">Recent Alerts</h2>
        {loading ? (
          <SkeletonList count={2} />
        ) : alerts.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No recent alerts.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {alerts.slice(0, 5).map(alert => <SOSStatusCard key={alert.sosId} alert={alert} />)}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSendSOS}
        title="Send SOS Alert?"
        message="This will immediately notify your emergency contacts and platform administrators with your current location. Are you sure you want to proceed?"
        confirmLabel="Yes, Send SOS"
        isDestructive={true}
        isLoading={sending}
      />
    </div>
  );
}
