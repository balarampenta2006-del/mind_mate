import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatDate } from '@/utils/formatters.js';
import { MOOD_COLORS } from '@/constants/enums.js';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: 'var(--text-xs)',
    }}>
      <p style={{ color: 'var(--muted)', marginBottom: 4 }}>{formatDate(label)}</p>
      <p style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>Level: {payload[0]?.value}/10</p>
      {d?.type && <p style={{ color: MOOD_COLORS[d.type] || 'var(--muted)' }}>{d.type}</p>}
    </div>
  );
}

/**
 * @param {{ data: Array<{date:string,level:number,type?:string}>, height?:number }} props
 */
export default function MoodTrendChart({ data = [], height = 220 }) {
  if (!data.length) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
        No mood data available for this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => formatDate(d, 'dd MMM')}
          tick={{ fontSize: 10, fill: 'var(--muted)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 9, 10]} tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={5} stroke="var(--border-strong)" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="level"
          stroke="var(--primary)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: 'var(--primary)', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: 'var(--primary-dark)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
