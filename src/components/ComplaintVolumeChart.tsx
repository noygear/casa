import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

interface WeeklyData {
  week: string;
  count: number;
  categories: Record<string, number>;
}

interface ComplaintVolumeChartProps {
  data: WeeklyData[];
}

export function ComplaintVolumeChart({ data }: ComplaintVolumeChartProps) {
  // Find top categories across all weeks
  const categoryTotals: Record<string, number> = {};
  data.forEach(d => {
    Object.entries(d.categories).forEach(([cat, count]) => {
      categoryTotals[cat] = (categoryTotals[cat] || 0) + count;
    });
  });
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity size={16} className="text-cre-400" />
        <h3 className="text-sm font-semibold text-gray-300">Complaint Volume (8 weeks)</h3>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0f1c',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: '#fff',
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Top Categories</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {topCategories.map(([cat, count]) => (
              <span key={cat} className="px-2 py-1 text-[10px] font-medium text-gray-300 bg-white/5 border border-white/10 rounded-md">
                {cat.replace('_', ' ')} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
