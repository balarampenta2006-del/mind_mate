import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatients } from '@/services/userService.js';
import { getUserReportForTherapist } from '@/services/reportService.js';
import Avatar from '@/components/ui/Avatar.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import Tabs from '@/components/ui/Tabs.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function PatientDetailsPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [patients, patientReports] = await Promise.all([
          getPatients(),
          getUserReportForTherapist(patientId)
        ]);
        setPatient(patients.find(p => p.userId === patientId));
        setReports(patientReports);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;
  
  if (!patient) return (
    <div className="page-body">
      <EmptyState title="Patient Not Found" description="The requested patient could not be located." />
    </div>
  );

  const OverviewTab = (
    <div className="grid-2" style={{ marginTop: 'var(--sp-4)' }}>
      <div className="card card-body">
        <h4 style={{ marginBottom: 'var(--sp-4)' }}>Contact Information</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', color: 'var(--text)' }}>
          <div><strong>Email:</strong> <span className="text-muted">{patient.email}</span></div>
          <div><strong>Phone:</strong> <span className="text-muted">{patient.phone || 'Not provided'}</span></div>
          <div><strong>DOB:</strong> <span className="text-muted">{patient.dob && !Number.isNaN(new Date(patient.dob).getTime()) ? new Date(patient.dob).toLocaleDateString() : 'Not provided'}</span></div>
        </div>
      </div>
      <div className="card card-body">
        <h4 style={{ marginBottom: 'var(--sp-4)' }}>Clinical Notes</h4>
        <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
          No clinical notes have been added yet. Use the messaging interface to communicate directly with the patient.
        </p>
      </div>
    </div>
  );

  const ReportsTab = (
    <div style={{ marginTop: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
      {reports.length === 0 ? (
        <EmptyState icon="fa-chart-line" title="No Reports" description="This patient does not have any generated progress reports." />
      ) : (
        reports.map(report => (
          <div key={report.reportId} className="card" style={{ padding: 'var(--sp-5)' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
              <div>
                <h3 className="font-heading text-primary">{report.period} Report</h3>
                <p className="text-xs text-muted">Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid-2">
              <div>
                <h4 style={{ marginBottom: 'var(--sp-3)' }}>AI Insights</h4>
                <ul className="text-sm text-muted" style={{ lineHeight: 1.6, marginBottom: 'var(--sp-4)', paddingLeft: 'var(--sp-4)' }}>
                  {report.data?.insights?.map((insight, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{insight}</li>
                  ))}
                </ul>
                
                <div className="grid-2" style={{ gap: 'var(--sp-3)' }}>
                  <div style={{ padding: 'var(--sp-3)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <p className="text-xs text-muted font-bold text-uppercase">Avg Mood</p>
                    <p style={{ fontSize: 24, marginTop: 4 }}>{report.data?.averageMoodLevel || 'N/A'}/10</p>
                  </div>
                  <div style={{ padding: 'var(--sp-3)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <p className="text-xs text-muted font-bold text-uppercase">Frequent</p>
                    <p style={{ fontSize: 18, marginTop: 4, textTransform: 'capitalize' }}>{report.data?.mostFrequentMood || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: 'var(--sp-3)' }}>Mood Trend</h4>
                {report.data?.trend && report.data.trend.length > 0 ? (
                  <div style={{ height: 200, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-3)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={report.data.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="var(--muted)" fontSize={10} tickFormatter={(val) => val.substring(5)} />
                        <YAxis stroke="var(--muted)" fontSize={10} domain={[0, 10]} />
                        <Tooltip contentStyle={{ background: 'var(--card)', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }} />
                        <Line type="monotone" dataKey="moodLevel" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <p className="text-sm text-muted">Not enough data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="page-body">
      <button className="btn btn-ghost" style={{ marginBottom: 'var(--sp-4)' }} onClick={() => navigate('/therapist/patients')}>
        <i className="fa-solid fa-arrow-left" /> Back to Patients
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
        <Avatar name={patient.name} size="lg" />
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>{patient.name}</h2>
          <p className="text-muted">Patient ID: {patient.userId}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={() => navigate('/therapist/messages')}><i className="fa-solid fa-message" /> Send Message</button>
        </div>
      </div>

      <div className="card card-body">
        <Tabs 
          tabs={[
            { id: 'overview', label: 'Overview', content: OverviewTab },
            { id: 'reports', label: 'Progress Reports', content: ReportsTab }
          ]} 
        />
      </div>
    </div>
  );
}
