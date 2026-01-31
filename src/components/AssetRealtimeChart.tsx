import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts';
import { useCoinbaseChart } from '../hooks/useCoinbaseChart';

export function AssetRealtimeChart({ symbol }: { symbol: string }) {
  const { data, loading, error } = useCoinbaseChart(symbol);

  if (loading) return <div className="text-xs text-gray-400">Loading chart...</div>;
  if (error) return <div className="text-xs text-red-500">Chart error: {error}</div>;
  if (!data.length) return <div className="text-xs text-gray-400">No chart data</div>;

  // Format data for recharts
  const chartData = data.map((d) => ({
    time: new Date(d[0] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    open: d[3],
    close: d[4],
    high: d[2],
    low: d[1],
    volume: d[5],
  }));

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" hide />
        <YAxis domain={['auto', 'auto']} hide />
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
        <Tooltip formatter={(v: any) => v.toFixed(4)} labelFormatter={() => ''} />
        <Area type="monotone" dataKey="close" stroke="#10b981" fill="url(#colorPrice)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
