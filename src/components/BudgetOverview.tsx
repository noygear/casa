import { PropertyBudget } from '../domain/propertyHealthCalculator';
import { Property } from '../types';
import { DollarSign } from 'lucide-react';

interface BudgetOverviewProps {
  properties: Property[];
  budgets: PropertyBudget[];
}

export function BudgetOverview({ properties, budgets }: BudgetOverviewProps) {
  const totalAnnualBudget = budgets.reduce((s, b) => s + b.annualBudget, 0);
  const totalYtdSpend = budgets.reduce((s, b) => s + b.ytdSpend, 0);
  const ytdPercent = totalAnnualBudget > 0 ? Math.min(100, Math.round((totalYtdSpend / totalAnnualBudget) * 100)) : 0;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <DollarSign size={16} className="text-cre-400" />
        <h3 className="text-sm font-semibold text-gray-300">Budget Overview</h3>
      </div>

      {/* Portfolio Total */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Portfolio YTD Spend</span>
          <span className="text-xs text-gray-400">
            <span className="text-white font-semibold">${totalYtdSpend.toLocaleString()}</span>
            {' '}/ ${totalAnnualBudget.toLocaleString()}
          </span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${ytdPercent > 75 ? 'bg-amber-500' : 'bg-cre-500'}`}
            style={{ width: `${ytdPercent}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className={`text-[10px] font-medium ${ytdPercent > 75 ? 'text-amber-400' : 'text-gray-500'}`}>
            {ytdPercent}% utilized
          </span>
        </div>
      </div>

      {/* Per-Property Bars */}
      <div className="space-y-4">
        {budgets.map(budget => {
          const property = properties.find(p => p.id === budget.propertyId);
          const pct = budget.annualBudget > 0 ? Math.min(100, Math.round((budget.ytdSpend / budget.annualBudget) * 100)) : 0;
          return (
            <div key={budget.propertyId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300">{property?.name || budget.propertyId}</span>
                <span className="text-[10px] text-gray-500">
                  ${budget.ytdSpend.toLocaleString()} / ${budget.annualBudget.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
