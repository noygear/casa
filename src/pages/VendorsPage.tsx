import { useState } from 'react';
import { MOCK_VENDORS, MOCK_VENDOR_SCORES } from '../data/mockData';
import { VendorScorecard } from '../components/VendorScorecard';
import { VendorDetailModal } from '../components/VendorDetailModal';
import { Award, TrendingUp } from 'lucide-react';
import type { Vendor } from '../types';

export function VendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const vendorData = MOCK_VENDORS.map(v => ({
    vendor: v,
    score: MOCK_VENDOR_SCORES.find(s => s.vendorId === v.id)!,
  })).filter(d => d.score);

  const avgScore = Math.round(
    vendorData.reduce((sum, d) => sum + d.score.score, 0) / vendorData.length
  );

  const topPerformer = vendorData.reduce((best, d) =>
    d.score.score > (best?.score.score ?? 0) ? d : best, vendorData[0]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl font-bold text-white">Vendor Performance</h1>
        <p className="text-sm text-gray-400 mt-1">
          Quality → Consistency → Speed → Volume scoring model
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 animate-slide-up animate-slide-up-delay-1">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-cre-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Avg Score</span>
          </div>
          <div className={`text-4xl font-bold ${avgScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {avgScore}
          </div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${avgScore >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(100, avgScore)}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up animate-slide-up-delay-2">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-violet-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Top Performer</span>
          </div>
          <div className="text-lg font-bold text-white">{topPerformer.vendor.companyName}</div>
          <div className="text-sm text-emerald-400 font-semibold mt-1">
            Score: {Math.round(topPerformer.score.score)}
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up animate-slide-up-delay-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Vendors</span>
          </div>
          <div className="text-4xl font-bold text-white">{MOCK_VENDORS.filter(v => v.isActive).length}</div>
          <div className="text-xs text-gray-500 mt-1">of {MOCK_VENDORS.length} total</div>
        </div>
      </div>

      {/* Scoring Formula */}
      <div className="glass-surface p-4">
        <p className="text-xs text-gray-500 font-mono">
          score = 100 − Σ(rejections × 10 × sev) − Σ(skips × 5 × sev) − Σ(daysLate × 3 × sev) + bonus
        </p>
        <p className="text-[10px] text-gray-600 mt-1">
          Severity multipliers: minor = 1×, needs_fix_today = 2×, immediate = 4× · Scores can go negative
        </p>
      </div>

      {/* Vendor Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendorData.map(({ vendor, score }) => (
          <div key={vendor.id} onClick={() => setSelectedVendor(vendor)} className="cursor-pointer transition-transform hover:-translate-y-1">
            <VendorScorecard vendor={vendor} score={score} />
          </div>
        ))}
      </div>

      {selectedVendor && (
        <VendorDetailModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
      )}
    </div>
  );
}
