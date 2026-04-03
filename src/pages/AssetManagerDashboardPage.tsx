import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { useProperties } from '../hooks/useProperties';
import { useVendors, useVendorScores } from '../hooks/useVendors';
import { PropertyHealthCard } from '../components/PropertyHealthCard';
import { VendorDetailModal } from '../components/VendorDetailModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { computePropertyHealth, computePropertyBudget } from '../domain/propertyHealthCalculator';
import { computePortfolioSummary, computeCostTrends, computeVendorAuditData, getTopCostCenters } from '../domain/portfolioAnalytics';
import type { Vendor, VendorScoreRecord } from '../types';
import {
  Building2, DollarSign, Users, Activity, TrendingUp,
  BarChart3, PieChart, AlertTriangle, Lightbulb
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useIssueDetection } from '../hooks/useIssueDetection';

// Budget data has no backend endpoint yet — keep as local constant
const PROPERTY_BUDGETS: { propertyId: string; annualBudget: number }[] = [
  { propertyId: 'b8279fbf-42e2-4549-81f3-235a9676f370', annualBudget: 150000 },
  { propertyId: 'a01e943b-0797-4cb8-b6a1-a0b8f5035c11', annualBudget: 200000 },
  { propertyId: 'ab2dea97-8367-44bc-aeba-175c8f674dcf', annualBudget: 80000 },
];

export function AssetManagerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorSortKey, setVendorSortKey] = useState<'totalSpend' | 'avgScore' | 'rejectionRate'>('totalSpend');

  const { data: workOrdersData, isLoading: woLoading, isError: woError, error: woErr, refetch: refetchWO } = useWorkOrders();
  const { data: propertiesData, isLoading: propsLoading } = useProperties();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendors();
  const { data: scoresData, isLoading: scoresLoading } = useVendorScores();

  const workOrders = workOrdersData?.items || [];
  const issueFlags = useIssueDetection(workOrders, 90, 2);

  const isLoading = woLoading || propsLoading || vendorsLoading || scoresLoading;
  if (isLoading) return <LoadingSpinner />;
  if (woError) return <ErrorBanner message={woErr?.message || 'Failed to load dashboard'} onRetry={refetchWO} />;

  const properties = propertiesData?.items || [];
  const vendors = vendorsData?.items || [];
  const vendorScoreRecords: VendorScoreRecord[] = (scoresData || []).map(s => ({
    id: s.id, vendorId: s.vendorId, periodStart: s.periodStart, periodEnd: s.periodEnd,
    score: s.score, rejections: s.rejections, skips: s.skips, lateDays: s.lateDays,
    completions: s.completions, bonus: s.bonus, quality: s.quality, consistency: s.consistency,
    speed: s.speed, volume: s.volume, createdAt: s.createdAt,
  }));

  // Property metrics
  const propertyMetrics = properties.map(property => {
    const health = computePropertyHealth(workOrders, property.id);
    const budgetConfig = PROPERTY_BUDGETS.find(b => b.propertyId === property.id);
    const budget = computePropertyBudget(workOrders, property.id, budgetConfig?.annualBudget ?? 0);
    return { property, health, budget };
  });

  const healthScores = propertyMetrics.map(m => m.health.score);

  // Portfolio summary
  const portfolio = computePortfolioSummary(properties, workOrders, healthScores);

  // Cost trends
  const costTrends = computeCostTrends(workOrders, 12);

  // Vendor audit
  const vendorAudit = [...computeVendorAuditData(vendors, workOrders, vendorScoreRecords)].sort((a, b) => {
    if (vendorSortKey === 'avgScore') return b.avgScore - a.avgScore;
    if (vendorSortKey === 'rejectionRate') return b.rejectionRate - a.rejectionRate;
    return b.totalSpend - a.totalSpend;
  });

  // Top cost centers
  const topCostCenters = getTopCostCenters(workOrders, properties, 5);

  // Total spend YTD
  const totalYtdSpend = propertyMetrics.reduce((s, m) => s + m.budget.ytdSpend, 0);
  const totalAnnualBudget = propertyMetrics.reduce((s, m) => s + m.budget.annualBudget, 0);

  // Properties needing attention
  const attentionProperties = propertyMetrics.filter(m => m.health.score < 70);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-white">
          Portfolio Overview
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {user?.name?.split(' ')[0]}. Here's your portfolio at a glance.
        </p>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-up">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={14} className="text-cre-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Properties</span>
          </div>
          <div className="text-2xl font-bold text-white">{portfolio.totalProperties}</div>
          <div className="text-xs text-gray-500">{portfolio.totalSqFt.toLocaleString()} sq ft</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-amber-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Active WOs</span>
          </div>
          <div className="text-2xl font-bold text-white">{portfolio.totalActiveWOs}</div>
          <div className="text-xs text-gray-500">across portfolio</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Occupancy</span>
          </div>
          <div className={`text-2xl font-bold ${portfolio.avgOccupancy >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {portfolio.avgOccupancy}%
          </div>
          <div className="text-xs text-gray-500">avg across properties</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-cre-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">${(portfolio.totalMonthlyRevenue / 1000).toFixed(0)}k</div>
          <div className="text-xs text-gray-500">combined</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-violet-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Health Score</span>
          </div>
          <div className={`text-2xl font-bold ${portfolio.portfolioHealthScore >= 80 ? 'text-emerald-400' : portfolio.portfolioHealthScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
            {portfolio.portfolioHealthScore}
          </div>
          <div className="text-xs text-gray-500">portfolio avg</div>
        </div>
      </div>

      {/* Properties At-a-Glance */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Building2 size={16} className="text-cre-400" />
          Properties At-a-Glance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {propertyMetrics.map(({ property, health, budget }) => (
            <PropertyHealthCard
              key={property.id}
              property={property}
              health={health}
              budget={budget}
              onClick={() => navigate(`/work-orders?search=${encodeURIComponent(property.name)}`)}
            />
          ))}
        </div>
      </div>

      {/* Performance Metrics + Roll-up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Maintenance Cost Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-cre-400" />
            <h3 className="text-sm font-semibold text-gray-300">Maintenance Cost Trend (12 months)</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrends} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0f1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Cost']}
                />
                <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roll-Up Reporting */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={16} className="text-cre-400" />
            <h3 className="text-sm font-semibold text-gray-300">Roll-Up Reporting</h3>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Portfolio Spend YTD</span>
              <span className="text-xs text-gray-400">
                <span className="text-white font-semibold">${totalYtdSpend.toLocaleString()}</span>
                {' '}/ ${totalAnnualBudget.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-cre-500 transition-all"
                style={{ width: `${totalAnnualBudget > 0 ? Math.min(100, Math.round((totalYtdSpend / totalAnnualBudget) * 100)) : 0}%` }}
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Top Cost Centers</span>
            <div className="mt-2 space-y-2">
              {topCostCenters.map((center, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] text-gray-500 font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-300">{center.propertyName}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400 capitalize">{center.category.replace('_', ' ')}</span>
                  </div>
                  <span className="text-white font-medium">${center.totalCost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Audit Trail */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-cre-400" />
            <h3 className="text-sm font-semibold text-gray-300">Vendor Audit Trail</h3>
          </div>
          <select
            value={vendorSortKey}
            onChange={e => setVendorSortKey(e.target.value as typeof vendorSortKey)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cre-500/50 appearance-none cursor-pointer"
          >
            <option value="totalSpend" className="bg-cre-950">Sort by Spend</option>
            <option value="avgScore" className="bg-cre-950">Sort by Score</option>
            <option value="rejectionRate" className="bg-cre-950">Sort by Rejection Rate</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider pb-3 pr-4">Vendor</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider pb-3 px-3">Properties</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider pb-3 px-3">Total Spend</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider pb-3 px-3">Score</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider pb-3 px-3">Completions</th>
                <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider pb-3 pl-3">Reject Rate</th>
              </tr>
            </thead>
            <tbody>
              {vendorAudit.map(row => (
                <tr
                  key={row.vendor.id}
                  onClick={() => setSelectedVendor(row.vendor)}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="text-sm text-white font-medium">{row.vendor.companyName}</div>
                    <div className="text-[10px] text-gray-500">{row.vendor.specialties.join(', ')}</div>
                  </td>
                  <td className="text-right text-sm text-gray-300 px-3">{row.propertiesServed}</td>
                  <td className="text-right text-sm text-emerald-400 font-medium px-3">${row.totalSpend.toLocaleString()}</td>
                  <td className="text-right px-3">
                    <span className={`text-sm font-medium ${row.avgScore >= 85 ? 'text-emerald-400' : row.avgScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {Math.round(row.avgScore)}
                    </span>
                  </td>
                  <td className="text-right text-sm text-gray-300 px-3">{row.completions}</td>
                  <td className="text-right pl-3">
                    <span className={`text-sm font-medium ${row.rejectionRate > 10 ? 'text-rose-400' : 'text-gray-400'}`}>
                      {row.rejectionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Insights */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-violet-400" />
          Strategic Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attentionProperties.length > 0 && (
            <div className="glass-card border-rose-500/20 p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-rose-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Properties Requiring Attention</h4>
                <div className="space-y-1.5">
                  {attentionProperties.map(m => (
                    <div key={m.property.id} className="flex items-center gap-2 text-xs">
                      <span className="text-rose-400 font-medium">{m.health.score}</span>
                      <span className="text-gray-300">{m.property.name}</span>
                      <span className="text-gray-600">— {m.health.openTicketCount} open tickets</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {issueFlags.slice(0, 2).map((flag, i) => (
            <div key={i} className="glass-card border-purple-500/20 p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Activity size={18} className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Recurring: {flag.category.replace('_', ' ')}
                </h4>
                <p className="text-xs text-gray-400">
                  <strong className="text-purple-400">{flag.ticketCount} tickets</strong> at{' '}
                  <span className="text-gray-200">{flag.property.name}</span>. Consider systemic review.
                </p>
              </div>
            </div>
          ))}

          {vendorAudit.filter(v => v.avgScore < 80).length > 0 && (
            <div className="glass-card border-amber-500/20 p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Users size={18} className="text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Vendor Contract Review</h4>
                <p className="text-xs text-gray-400">
                  {vendorAudit.filter(v => v.avgScore < 80).length} vendor(s) have scores below 80.
                  Consider performance review or alternative sourcing.
                </p>
                <button
                  onClick={() => navigate('/vendors')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors mt-2"
                >
                  View Vendors &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedVendor && (
        <VendorDetailModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
      )}
    </div>
  );
}
