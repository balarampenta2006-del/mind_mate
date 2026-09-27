import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/**
 * @param {{ data: Array<{label:string, value:number}>, color?:string, height?:number, title?:string }} props
 */
export default function AnalyticsBarChart({ data = [], color = 'var(--primary)', height = 200, title }) {
  return (
    <div>
      {title && <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}>{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', fontSize: 12,
            }}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
