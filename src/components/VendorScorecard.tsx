import { getScoreColor, getScoreGrade } from '../domain/vendorScoringEngine';
import type { VendorScoreRecord, Vendor } from '../types';

interface VendorScorecardProps {
  vendor: Vendor;
  score: VendorScoreRecord;
}

export function VendorScorecard({ vendor, score }: VendorScorecardProps) {
  const grade = getScoreGrade(score.score);
  const colorClass = getScoreColor(score.score);

  const metrics = [
    { label: 'Quality', value: score.quality, weight: '1st' },
    { label: 'Consistency', value: score.consistency, weight: '2nd' },
    { label: 'Speed', value: score.speed, weight: '3rd' },
    { label: 'Volume', value: score.volume, weight: '4th', isCount: true },
  ];

  return (
    <div className="glass-card-hover p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{vendor.companyName}</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {vendor.specialties.map(s => s.replace('_', ' ')).join(' · ')}
          </p>
        </div>

        {/* Score Ring */}
        <div
          className="score-ring"
          style={{ '--score-color': score.score >= 85 ? '#10B981' : score.score >= 70 ? '#F59E0B' : '#EF4444', '--score-pct': Math.max(0, score.score) } as React.CSSProperties}
        >
          <div className="score-ring-inner flex flex-col items-center">
            <span className={`text-2xl font-bold ${colorClass}`}>{grade}</span>
            <span className="text-[10px] text-gray-500 font-medium">{Math.round(score.score)}</span>
          </div>
        </div>
      </div>

      {/* Metric Bars */}
      <div className="space-y-3">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{m.label}</span>
                <span className="text-[10px] text-gray-600 font-medium">{m.weight}</span>
              </div>
              <span className={`text-sm font-semibold ${m.isCount ? 'text-gray-300' : getScoreColor(m.value)}`}>
                {m.isCount ? m.value : `${Math.round(m.value)}`}
              </span>
            </div>
            {!m.isCount && (
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    m.value >= 85 ? 'bg-emerald-500' : m.value >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, m.value))}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{score.completions}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-rose-400">{score.rejections}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Rejected</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-400">{score.lateDays}d</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Late</div>
        </div>
        {score.bonus > 0 && (
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">+{score.bonus}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Bonus</div>
          </div>
        )}
      </div>
    </div>
  );
}
