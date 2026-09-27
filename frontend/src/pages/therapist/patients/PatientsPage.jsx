import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedPatients } from '@/services/adminService.js';
import { useAuth } from '@/stores/authStore.jsx';
import Avatar from '@/components/ui/Avatar.jsx';
import { SkeletonTable } from '@/components/ui/Skeleton.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { formatDate } from '@/utils/formatters.js';

export default function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAssignedPatients(user.userId)
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.userId]);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-body">
      <header style={{ marginBottom: 'var(--sp-6)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>My Patients</h1>
        <p style={{ color: 'var(--muted)' }}>Manage your patient list and review their progress.</p>
      </header>

      <div className="card card-body" style={{ marginBottom: 'var(--sp-4)', padding: 16 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search patients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
      </div>

      {loading ? (
        <div className="card card-body"><SkeletonTable rows={4} cols={4} /></div>
      ) : filtered.length === 0 ? (
        <div className="card card-body">
          <EmptyState icon="fa-users" title="No patients found" description={search ? 'Try a different search term.' : 'You have no assigned patients yet.'} />
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Patient</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Date of Birth</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.userId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={p.name} size="sm" />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--muted)' }}>
                    <div><i className="fa-regular fa-envelope" style={{ width: 16 }} /> {p.email}</div>
                    {p.phone && <div style={{ marginTop: 4 }}><i className="fa-solid fa-phone" style={{ width: 16 }} /> {p.phone}</div>}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--muted)' }}>{formatDate(p.dob)}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/therapist/patients/${p.userId}`)}>
                      View Details
                    </button>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={() => navigate('/therapist/messages')}>
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
