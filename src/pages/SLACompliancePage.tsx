import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Settings, Plus, Trash2, Save, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSLACompliance, useSLAConfigs, useUpsertSLAConfig, useDeleteSLAConfig } from '../hooks/useSLA';
import { useProperties } from '../hooks/useProperties';
import { CATEGORY_LABELS } from '../types';
import type { WorkOrderCategory, Severity } from '../types';

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

          {/* SLA Configuration Management */}
          <SLAConfigSection />
        </>
      )}
    </div>
  );
}

// ── Severity label helper ───────────────────────────────────

const SEVERITY_LABELS: Record<string, string> = {
  minor: 'Minor',
  needs_fix_today: 'Needs Fix Today',
  immediate: 'Immediate',
};

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ── SLA Config Table Section ────────────────────────────────

function SLAConfigSection() {
  const { data: configs, isLoading } = useSLAConfigs();
  const { data: propertiesData } = useProperties();
  const upsertConfig = useUpsertSLAConfig();
  const deleteConfig = useDeleteSLAConfig();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    category: 'general' as WorkOrderCategory,
    severity: 'minor' as Severity,
    responseTimeMin: 60,
    resolveTimeMin: 480,
  });

  const properties = propertiesData?.items ?? [];

  const resetForm = () => {
    setFormData({ propertyId: '', category: 'general', severity: 'minor', responseTimeMin: 60, resolveTimeMin: 480 });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (config: NonNullable<typeof configs>[number]) => {
    setFormData({
      propertyId: config.propertyId,
      category: config.category as WorkOrderCategory,
      severity: config.severity as Severity,
      responseTimeMin: config.responseTimeMin,
      resolveTimeMin: config.resolveTimeMin,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertConfig.mutateAsync(formData);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteConfig.mutateAsync(id);
  };

  return (
    <div className="glass-card p-6 animate-slide-up animate-slide-up-delay-3">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-cre-400" />
          <h2 className="text-lg font-semibold text-white">SLA Configuration</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cre-500 text-white text-sm font-semibold hover:bg-cre-600 transition-colors shadow-lg shadow-cre-500/20"
          >
            <Plus size={16} />
            Add Rule
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Property</label>
              <select
                required
                value={formData.propertyId}
                onChange={e => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                disabled={!!editingId}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-cre-950 text-gray-400">Select...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id} className="bg-cre-950 text-white">{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as WorkOrderCategory }))}
                disabled={!!editingId}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none disabled:opacity-50"
              >
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-cre-950 text-white">{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Severity</label>
              <select
                value={formData.severity}
                onChange={e => setFormData(prev => ({ ...prev, severity: e.target.value as Severity }))}
                disabled={!!editingId}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50 appearance-none disabled:opacity-50"
              >
                {Object.entries(SEVERITY_LABELS).map(([val, label]) => (
                  <option key={val} value={val} className="bg-cre-950 text-white">{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Response Target (min)</label>
              <input
                required
                type="number"
                min={1}
                value={formData.responseTimeMin}
                onChange={e => setFormData(prev => ({ ...prev, responseTimeMin: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Resolve Target (min)</label>
              <input
                required
                type="number"
                min={1}
                value={formData.resolveTimeMin}
                onChange={e => setFormData(prev => ({ ...prev, resolveTimeMin: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-cre-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={upsertConfig.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cre-500 text-white text-sm font-semibold hover:bg-cre-600 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {upsertConfig.isPending ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Config table */}
      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading configurations...</div>
      ) : !configs?.length ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No SLA configurations yet. Add rules to define response and resolution targets.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="pb-3 pr-4">Property</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Severity</th>
                <th className="pb-3 pr-4">Response</th>
                <th className="pb-3 pr-4">Resolve</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {configs.map(config => (
                <tr key={config.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4 text-white">{config.property.name}</td>
                  <td className="py-3 pr-4 text-gray-300">{CATEGORY_LABELS[config.category as WorkOrderCategory] ?? config.category}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      config.severity === 'immediate' ? 'bg-red-500/20 text-red-400'
                      : config.severity === 'needs_fix_today' ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {SEVERITY_LABELS[config.severity] ?? config.severity}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-300 font-mono text-xs">{formatMinutes(config.responseTimeMin)}</td>
                  <td className="py-3 pr-4 text-gray-300 font-mono text-xs">{formatMinutes(config.resolveTimeMin)}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(config)}
                        className="px-3 py-1 rounded-lg text-xs font-medium text-cre-400 hover:bg-cre-500/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
