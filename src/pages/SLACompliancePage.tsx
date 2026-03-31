import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSLACompliance } from '../hooks/useSLA';

type TimeFilter = '1M' | '6M' | 'ALL';

interface TrendPoint {
  label: string;
  compliance: number;
  volume: number;
}

function groupByDay(items: { createdAt: string; sla: { resolveOnTrack: boolean } }[]): TrendPoint[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);

  const buckets = new Map<string, { onTrack: number; total: number }>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    if (date < cutoff) continue;
    const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const bucket = buckets.get(key) ?? { onTrack: 0, total: 0 };
    bucket.total++;
    if (item.sla.resolveOnTrack) bucket.onTrack++;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries()).map(([label, { onTrack, total }]) => ({
    label,
    compliance: total > 0 ? Math.round((onTrack / total) * 100) : 100,
    volume: total,
  }));
}

function groupByMonth(items: { createdAt: string; sla: { resolveOnTrack: boolean } }[]): TrendPoint[] {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - 6);

  const buckets = new Map<string, { onTrack: number; total: number }>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    if (date < cutoff) continue;
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const bucket = buckets.get(key) ?? { onTrack: 0, total: 0 };
    bucket.total++;
    if (item.sla.resolveOnTrack) bucket.onTrack++;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries()).map(([label, { onTrack, total }]) => ({
    label,
    compliance: total > 0 ? Math.round((onTrack / total) * 100) : 100,
    volume: total,
  }));
}

function groupByQuarter(items: { createdAt: string; sla: { resolveOnTrack: boolean } }[]): TrendPoint[] {
  const buckets = new Map<string, { onTrack: number; total: number }>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    const q = Math.ceil((date.getMonth() + 1) / 3);
    const key = `${date.getFullYear()} Q${q}`;
    const bucket = buckets.get(key) ?? { onTrack: 0, total: 0 };
    bucket.total++;
    if (item.sla.resolveOnTrack) bucket.onTrack++;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries()).map(([label, { onTrack, total }]) => ({
    label,
    compliance: total > 0 ? Math.round((onTrack / total) * 100) : 100,
    volume: total,
  }));
}

export function SLACompliancePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TimeFilter>('6M');
  const { data: slaData, isLoading, isError } = useSLACompliance();

  const data = useMemo(() => {
    if (!slaData?.items.length) return [];
    switch (filter) {
      case '1M': return groupByDay(slaData.items);
      case '6M': return groupByMonth(slaData.items);
      case 'ALL': return groupByQuarter(slaData.items);
    }
  }, [filter, slaData]);

  const currentCompliance = slaData?.summary.resolveCompliancePercent ?? 0;
  const avgCompliance = data.length > 0
    ? Math.round(data.reduce((acc, curr) => acc + curr.compliance, 0) / data.length)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 mr-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp size={24} className="text-cre-400" />
              SLA Compliance History
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Historical view of preventative maintenance and reactive work order resolution speeds against Service Level Agreements.
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading SLA data...</div>
        </div>
      )}

      {isError && (
        <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
          <p className="text-red-400">Failed to load SLA compliance data. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up animate-slide-up-delay-1">
            <div className="glass-card p-6">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Period</div>
              <div className="flex items-end gap-3">
                <span className={`text-4xl font-bold ${currentCompliance >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentCompliance}%
                </span>
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Historical Average</div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-white">
                  {avgCompliance}%
                </span>
              </div>
            </div>
            <div className="glass-card p-6 border-cre-500/20 bg-cre-500/5">
              <div className="text-sm font-semibold text-cre-400 uppercase tracking-wider mb-2">Target SLA</div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-cre-400">
                  95%
                </span>
                <span className="text-xs text-gray-500 mb-1">compliance minimum</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="glass-card p-6 animate-slide-up animate-slide-up-delay-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-lg font-semibold text-white">Compliance Trend</h2>

              {/* Time Filters */}
              <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-xl">
                {(['1M', '6M', 'ALL'] as TimeFilter[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      filter === t
                        ? 'bg-cre-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t === 'ALL' && <Calendar size={14} />}
                    {t === 'ALL' ? 'All Time' : t}
                  </button>
                ))}
              </div>
            </div>

            {data.length === 0 ? (
              <div className="flex items-center justify-center h-[400px] text-gray-500">
                No SLA data available for this time period.
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#ffffff40"
                      fontSize={12}
                      tickMargin={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#ffffff40"
                      fontSize={12}
                      tickFormatter={(val) => val + "%"}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A0A0A',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#E63B2E' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="compliance"
                      name="SLA Compliance"
                      stroke="#E63B2E"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0A0A0A', stroke: '#E63B2E', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#E63B2E', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
