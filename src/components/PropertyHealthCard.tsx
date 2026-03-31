import { PropertyHealthScore, PropertyBudget } from '../domain/propertyHealthCalculator';
import { Property } from '../types';
import { Building2, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface PropertyHealthCardProps {
  property: Property;
  health: PropertyHealthScore;
  budget: PropertyBudget;
  onClick?: () => void;
}

function getScoreColor(score: number) {
  if (score >= 80) return { ring: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (score >= 60) return { ring: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  return { ring: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
}

function TrendIcon({ trend }: { trend: 'rising' | 'stable' | 'falling' }) {
  if (trend === 'rising') return <TrendingUp size={12} className="text-rose-400" />;
  if (trend === 'falling') return <TrendingDown size={12} className="text-emerald-400" />;
  return <Minus size={12} className="text-gray-500" />;
}

export function PropertyHealthCard({ property, health, budget, onClick }: PropertyHealthCardProps) {
  const colors = getScoreColor(health.score);
  const budgetPercent = budget.monthlyBudget > 0
    ? Math.min(100, Math.round((budget.monthlySpend / budget.monthlyBudget) * 100))
    : 0;
  const budgetOverrun = budgetPercent > 85;

  return (
    <div
      onClick={onClick}
      className={`glass-card-hover p-5 cursor-pointer ${colors.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Building2 size={18} className={colors.ring} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{property.name}</h3>
            <p className="text-[11px] text-gray-500">{property.type} · {property.city}</p>
          </div>
        </div>

        {/* Score Ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2"
              className={colors.ring}
              strokeDasharray={`${health.score * 0.94} 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${colors.ring}`}>
            {health.score}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Open WOs</div>
          <div className={`text-sm font-semibold ${health.openTicketCount > 3 ? 'text-amber-400' : 'text-white'}`}>
            {health.openTicketCount}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-0.5">SLA</div>
          <div className={`text-sm font-semibold ${health.slaCompliancePercent >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {health.slaCompliancePercent}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-0.5">Trend</div>
          <div className="flex items-center gap-1">
            <TrendIcon trend={health.complaintTrend} />
            <span className="text-xs text-gray-400 capitalize">{health.complaintTrend}</span>
          </div>
        </div>
      </div>

      {/* Budget Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Monthly Budget</span>
          <div className="flex items-center gap-1">
            {budgetOverrun && <AlertTriangle size={10} className="text-amber-400" />}
            <span className={`text-[10px] font-medium ${budgetOverrun ? 'text-amber-400' : 'text-gray-400'}`}>
              ${budget.monthlySpend.toLocaleString()} / ${budget.monthlyBudget.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${budgetOverrun ? 'bg-amber-500' : 'bg-cre-500'}`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
