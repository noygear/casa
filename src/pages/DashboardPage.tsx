import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_WORK_ORDERS, MOCK_PROPERTIES, MOCK_VENDORS, MOCK_VENDOR_SCORES } from '../data/mockData';
import { WorkOrderCard } from '../components/WorkOrderCard';
import { WorkOrderDetailModal } from '../components/WorkOrderDetailModal';
import { VendorScorecard } from '../components/VendorScorecard';
import { useState } from 'react';
import type { WorkOrder } from '../types';
import {
  ClipboardList, AlertTriangle, Clock, CheckCircle2, Building2,
  TrendingUp, Users, Zap, Activity, Lightbulb, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIssueDetection } from '../hooks/useIssueDetection';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);

  const stats = useMemo(() => {
    const open = MOCK_WORK_ORDERS.filter(wo => wo.status === 'open').length;
    const inProgress = MOCK_WORK_ORDERS.filter(wo => wo.status === 'in_progress' || wo.status === 'assigned').length;
    const needsReview = MOCK_WORK_ORDERS.filter(wo => wo.status === 'needs_review').length;
    const closed = MOCK_WORK_ORDERS.filter(wo => wo.status === 'closed').length;
    const urgent = MOCK_WORK_ORDERS.filter(wo => wo.severity === 'immediate' && wo.status !== 'closed').length;
    const total = MOCK_WORK_ORDERS.length;
    const slaCompliance = Math.round(((total - urgent) / total) * 100);

    return { open, inProgress, needsReview, closed, urgent, total, slaCompliance };
  }, []);

  const issueFlags = useIssueDetection(MOCK_WORK_ORDERS, 90, 2);

  const urgentOrders = MOCK_WORK_ORDERS.filter(
    wo => wo.severity === 'immediate' && wo.status !== 'closed' && wo.status !== 'skipped'
  );

  const recentOrders = [...MOCK_WORK_ORDERS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const topVendors = MOCK_VENDORS.slice(0, 3).map(v => ({
    vendor: v,
    score: MOCK_VENDOR_SCORES.find(s => s.vendorId === v.id)!,
  }));

  const kpiCards = [
    { label: 'Open', value: stats.open, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10', statusVal: 'open' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', statusVal: 'in_progress' },
    { label: 'Needs Review', value: stats.needsReview, icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', statusVal: 'needs_review' },
    { label: 'Closed', value: stats.closed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', statusVal: 'closed' },
  ];

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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.label} 
              onClick={() => navigate(`/work-orders?status=${kpi.statusVal}`)}
              className={`glass-card-hover p-5 animate-slide-up animate-slide-up-delay-${i + 1} cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon size={20} className={kpi.color} />
                </div>
                {kpi.label === 'In Progress' && stats.urgent > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full uppercase">
                    {stats.urgent} urgent
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* SLA Compliance + Properties Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SLA Compliance */}
        <div 
          onClick={() => navigate('/sla-compliance')}
          className="glass-card-hover cursor-pointer p-6 animate-slide-up"
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

        {/* Properties */}
        <div 
          onClick={() => navigate('/properties')}
          className="glass-card-hover cursor-pointer p-6 animate-slide-up"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-cre-400" />
            <h3 className="text-sm font-semibold text-gray-300">Properties</h3>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{MOCK_PROPERTIES.length}</div>
          <div className="text-xs text-gray-500">Active properties</div>
          <div className="mt-3 space-y-2">
            {MOCK_PROPERTIES.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{p.name}</span>
                <span className="text-gray-500">{p.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Vendors */}
        <div 
          onClick={() => navigate('/vendors')}
          className="glass-card-hover cursor-pointer p-6 animate-slide-up"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-cre-400" />
            <h3 className="text-sm font-semibold text-gray-300">Active Vendors</h3>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{MOCK_VENDORS.length}</div>
          <div className="text-xs text-gray-500">Service providers</div>
          <div className="mt-3 space-y-2">
            {MOCK_VENDORS.slice(0, 3).map(v => (
              <div key={v.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{v.companyName}</span>
                <span className={`font-medium ${v.rating >= 90 ? 'text-emerald-400' : v.rating >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {v.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Insights Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Lightbulb size={16} className="text-purple-400" />
          Smart Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recurring Issues */}
          {issueFlags.map((flag, i) => (
            <div key={i} className="glass-card border-purple-500/20 p-5 animate-slide-up flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Activity size={18} className="text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Recurring Issue: {flag.category.replace('_', ' ')}
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  System detected <strong className="text-purple-400">{flag.ticketCount} recent tickets</strong> for 
                  the same category at <span className="text-gray-200">{flag.property.name} {flag.space ? "(" + flag.space.name + ")" : ''}</span>. 
                  Consider a holistic inspection.
                </p>
                <button 
                  onClick={() => navigate(`/work-orders?search=${flag.property.name}`)}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  View Related Tickets &rarr;
                </button>
              </div>
            </div>
          ))}

          {/* Cost Optimization Insight */}
          <div className="glass-card border-emerald-500/20 p-5 animate-slide-up flex gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingDown size={18} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Cost Optimization Opportunity
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                Proactive maintenance on <span className="text-gray-200">Meridian Plaza</span> HVAC units has reduced reactive call volume by <strong className="text-emerald-400">15%</strong> this quarter vs last year. 
              </p>
              <button 
                onClick={() => navigate('/properties')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                View Property Details &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Orders Alert */}
      {urgentOrders.length > 0 && (
        <div className="glass-card border-rose-500/20 p-5 animate-slide-up">
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

      {/* Recent Work Orders */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent Work Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentOrders.map(wo => (
            <WorkOrderCard key={wo.id} workOrder={wo} onClick={setSelectedWO} />
          ))}
        </div>
      </div>

      {/* Vendor Performance */}
      {(user?.role === 'asset_manager' || user?.role === 'property_manager') && (
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Vendor Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topVendors.map(({ vendor, score }) => (
              <VendorScorecard key={vendor.id} vendor={vendor} score={score} />
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWO && (
        <WorkOrderDetailModal workOrder={selectedWO} onClose={() => setSelectedWO(null)} />
      )}
    </div>
  );
}
