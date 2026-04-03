import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { useProperties } from '../hooks/useProperties';
import { useVendors, useVendorScores } from '../hooks/useVendors';
import { WorkOrderCard } from '../components/WorkOrderCard';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { VendorScorecard } from '../components/VendorScorecard';
import { PropertyHealthCard } from '../components/PropertyHealthCard';
import { BudgetOverview } from '../components/BudgetOverview';
import { ComplaintVolumeChart } from '../components/ComplaintVolumeChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { computePropertyHealth, computePropertyBudget, computeWeeklyVolume } from '../domain/propertyHealthCalculator';
import type { WorkOrder, VendorScoreRecord } from '../types';
import {
  Building2, TrendingUp, Users,
  Zap, Lightbulb, TrendingDown, Activity, AlertTriangle, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIssueDetection } from '../hooks/useIssueDetection';

// Budget data has no backend endpoint yet — keep as local constant
const PROPERTY_BUDGETS: { propertyId: string; annualBudget: number }[] = [
  { propertyId: 'b8279fbf-42e2-4549-81f3-235a9676f370', annualBudget: 150000 },
  { propertyId: 'a01e943b-0797-4cb8-b6a1-a0b8f5035c11', annualBudget: 200000 },
  { propertyId: 'ab2dea97-8367-44bc-aeba-175c8f674dcf', annualBudget: 80000 },
];

type DashboardTab = 'properties' | 'vendors' | 'workorders';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('properties');

  const { data: workOrdersData, isLoading: woLoading, isError: woError, error: woErr, refetch: refetchWO } = useWorkOrders();
  const { data: propertiesData, isLoading: propsLoading } = useProperties();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendors();
  const { data: scoresData, isLoading: scoresLoading } = useVendorScores();

  const workOrders = workOrdersData?.items || [];
  const issueFlags = useIssueDetection(workOrders, 90, 2);

  const isLoading = woLoading || propsLoading || vendorsLoading || scoresLoading;
  if (isLoading) return <LoadingSpinner />;
  if (woError) return <ErrorBanner message={woErr?.message || 'Failed to load dashboard data'} onRetry={refetchWO} />;

  const properties = propertiesData?.items || [];
  const vendors = vendorsData?.items || [];
  const scores: VendorScoreRecord[] = (scoresData || []).map(s => ({
    id: s.id,
    vendorId: s.vendorId,
    periodStart: s.periodStart,
    periodEnd: s.periodEnd,
    score: s.score,
    rejections: s.rejections,
    skips: s.skips,
    lateDays: s.lateDays,
    completions: s.completions,
    bonus: s.bonus,
    quality: s.quality,
    consistency: s.consistency,
    speed: s.speed,
    volume: s.volume,
    createdAt: s.createdAt,
  }));

  // Property health & budget data
  const propertyMetrics = properties.map(property => {
    const health = computePropertyHealth(workOrders, property.id);
    const budgetConfig = PROPERTY_BUDGETS.find(b => b.propertyId === property.id);
    const budget = computePropertyBudget(workOrders, property.id, budgetConfig?.annualBudget ?? 0);
    return { property, health, budget };
  });

  const allBudgets = propertyMetrics.map(m => m.budget);
  const weeklyVolume = computeWeeklyVolume(workOrders, 8);

  // Vendor data
  const topVendors = vendors.slice(0, 3).map(v => ({
    vendor: v,
    score: scores.find(s => s.vendorId === v.id),
  })).filter((d): d is { vendor: typeof d.vendor; score: VendorScoreRecord } => !!d.score);

  const stats = (() => {
    const total = workOrders.length;
    const urgent = workOrders.filter(wo => wo.severity === 'immediate' && wo.status !== 'closed').length;
    const slaCompliance = total > 0 ? Math.round(((total - urgent) / total) * 100) : 100;
    return { urgent, slaCompliance };
  })();

  // Work order data
  const urgentOrders = workOrders.filter(
    wo => wo.severity === 'immediate' && wo.status !== 'closed' && wo.status !== 'skipped'
  );
  const recentOrders = [...workOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Budget alert insights
  const budgetAlerts = propertyMetrics
    .filter(m => m.budget.monthlyBudget > 0 && (m.budget.monthlySpend / m.budget.monthlyBudget) > 0.8)
    .map(m => {
      const pct = Math.round((m.budget.monthlySpend / m.budget.monthlyBudget) * 100);
      return { property: m.property, pct };
    });

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Here's what's happening across your portfolio today.
        </p>
      </div>

      {/* Sub-nav Tabs */}
      <div className="flex bg-black/40 p-1 rounded-xl w-fit animate-slide-up border border-white/5">
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'properties' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 size={14} />
          Properties
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'vendors' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users size={14} />
          Vendors
        </button>
        <button
          onClick={() => setActiveTab('workorders')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'workorders' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ClipboardList size={14} />
          Work Orders
        </button>
      </div>

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BudgetOverview properties={properties} budgets={allBudgets} />
            <ComplaintVolumeChart data={weeklyVolume} />
          </div>

          {/* Smart Insights */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Lightbulb size={16} className="text-purple-400" />
              Smart Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetAlerts.map((alert, i) => (
                <div key={i} className="glass-card border-amber-500/20 p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Budget Alert</h4>
                    <p className="text-xs text-gray-400">
                      <span className="text-gray-200">{alert.property.name}</span> is at{' '}
                      <strong className="text-amber-400">{alert.pct}%</strong> of monthly budget.
                    </p>
                  </div>
                </div>
              ))}

              {issueFlags.map((flag, i) => (
                <div key={`issue-${i}`} className="glass-card border-purple-500/20 p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Activity size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">
                      Recurring Issue: {flag.category.replace('_', ' ')}
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      <strong className="text-purple-400">{flag.ticketCount} recent tickets</strong> at{' '}
                      <span className="text-gray-200">{flag.property.name}{flag.space ? ` (${flag.space.name})` : ''}</span>.
                    </p>
                    <button
                      onClick={() => navigate(`/work-orders?search=${flag.property.name}`)}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Related Tickets &rarr;
                    </button>
                  </div>
                </div>
              ))}

              <div className="glass-card border-emerald-500/20 p-5 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingDown size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Cost Optimization</h4>
                  <p className="text-xs text-gray-400">
                    Proactive maintenance on <span className="text-gray-200">Meridian Tower</span> HVAC units has reduced reactive call volume by{' '}
                    <strong className="text-emerald-400">15%</strong> this quarter vs last year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div className="space-y-8 animate-slide-up">
          <div
            onClick={() => navigate('/sla-compliance')}
            className="glass-card-hover cursor-pointer p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-cre-400" />
              <h3 className="text-sm font-semibold text-gray-300">SLA Compliance</h3>
            </div>
            <div className="flex items-end gap-3">
              <span className={`text-4xl font-bold ${stats.slaCompliance >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.slaCompliance}%
              </span>
              <span className="text-xs text-gray-500 mb-1">this period</span>
            </div>
            <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${stats.slaCompliance >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${stats.slaCompliance}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Vendor Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topVendors.map(({ vendor, score }) => (
                <VendorScorecard key={vendor.id} vendor={vendor} score={score} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Work Orders Tab */}
      {activeTab === 'workorders' && (
        <div className="space-y-8 animate-slide-up">
          {urgentOrders.length > 0 && (
            <div className="glass-card border-rose-500/20 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-rose-400" />
                <h3 className="text-sm font-semibold text-rose-400">Urgent Work Orders</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentOrders.map(wo => (
                  <WorkOrderCard key={wo.id} workOrder={wo} onClick={setSelectedWO} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent Work Orders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentOrders.map(wo => (
                <WorkOrderCard key={wo.id} workOrder={wo} onClick={setSelectedWO} />
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedWO && (
        <WorkOrderDetailModal workOrder={selectedWO} onClose={() => { refetchWO(); setSelectedWO(null); }} />
      )}
    </div>
  );
}
