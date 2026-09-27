import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore.jsx';
import { getReports, generateReport } from '@/services/reportService.js';
import Spinner from '@/components/ui/Spinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { useToast } from '@/stores/toastStore.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function ReportsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [user.userId]);

  async function loadReports() {
    try {
      const data = await getReports(user.userId);
      setReports(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const newReport = await generateReport(user.userId, 'Monthly');
      setReports([newReport, ...reports]);
      showToast('New report generated successfully', 'success');
    } catch (err) {
      showToast('Failed to generate report', 'error');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spinner /></div>;

  return (
    <div className="page-body">
      <div className="flex-between" style={{ marginBottom: 'var(--sp-5)' }}>
        <div>
          <h2>Progress Reports</h2>
          <p className="text-muted">Track your emotional journey and therapy progress.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? <Spinner /> : <><i className="fa-solid fa-file-export" /> Generate New</>}
        </button>
      </div>

      {reports.length === 0 ? (
        <EmptyState 
          icon="fa-file-lines" 
          title="No Reports Yet" 
          description="Generate your first progress report to see insights." 
          action={
            <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
              <i className="fa-solid fa-file-export" /> Generate Report
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {reports.map((report) => (
            <div key={report.reportId} className="card" style={{ padding: 'var(--sp-5)' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <h3 className="font-heading text-primary">{report.period} Report</h3>
                  <p className="text-xs text-muted">Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
                </div>
                <button className="btn btn-outline" onClick={() => showToast('Downloading PDF...', 'info')}>
                  <i className="fa-solid fa-download" /> Download
                </button>
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
          ))}
        </div>
      )}
    </div>
  );
}
