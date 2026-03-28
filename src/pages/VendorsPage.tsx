import { useState, useMemo } from 'react';
import { MOCK_VENDORS, MOCK_VENDOR_SCORES, MOCK_PREFERRED_VENDOR_MAPPINGS, MOCK_PROPERTIES } from '../data/mockData';
import { VendorScorecard } from '../components/VendorScorecard';
import { VendorDetailModal } from '../components/VendorDetailModal';
import { VendorReferralBanner } from '../components/VendorReferralBanner';
import { detectUnderperformers, findAlternativeVendors } from '../domain/vendorReferralEngine';
import { Award, TrendingUp, AlertTriangle, Users, UserPlus, Building2 } from 'lucide-react';
import type { Vendor } from '../types';
import { CATEGORY_LABELS } from '../types';

type VendorTab = 'scorecards' | 'referrals' | 'preferred';

export function VendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<VendorTab>('scorecards');

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

  // Referral data
  const underperformers = useMemo(() =>
    detectUnderperformers(MOCK_VENDORS, MOCK_VENDOR_SCORES, 80),
    []
  );

  const referralSuggestions = useMemo(() => {
    const map = new Map<string, ReturnType<typeof findAlternativeVendors>>();
    underperformers.forEach(({ vendor, score }) => {
      map.set(vendor.id, findAlternativeVendors(vendor, score.score, MOCK_VENDORS, MOCK_VENDOR_SCORES));
    });
    return map;
  }, [underperformers]);

  // Preferred vendor mapping display
  const preferredMappings = useMemo(() => {
    return MOCK_PREFERRED_VENDOR_MAPPINGS.map(mapping => {
      const property = MOCK_PROPERTIES.find(p => p.id === mapping.propertyId);
      const vendor = MOCK_VENDORS.find(v => v.id === mapping.vendorId);
      return { ...mapping, property, vendor };
    });
  }, []);

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
            <Users size={16} className="text-gray-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Vendors</span>
          </div>
          <div className="text-4xl font-bold text-white">{MOCK_VENDORS.filter(v => v.isActive).length}</div>
          <div className="text-xs text-gray-500 mt-1">of {MOCK_VENDORS.length} total</div>
        </div>
      </div>

      {/* Performance Alerts */}
      {underperformers.length > 0 && (
        <div className="glass-card border-amber-500/20 p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400">Performance Alerts</h3>
          </div>
          <div className="space-y-2">
            {underperformers.map(({ vendor, score }) => {
              const suggestions = referralSuggestions.get(vendor.id) || [];
              return (
                <div key={vendor.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-rose-400 font-medium w-8">{Math.round(score.score)}</span>
                    <span className="text-white">{vendor.companyName}</span>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-400">{vendor.specialties.join(', ')}</span>
                  </div>
                  {suggestions.length > 0 && (
                    <span className="text-[10px] text-amber-400">
                      {suggestions.length} alternative{suggestions.length !== 1 ? 's' : ''} available
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-black/40 p-1 rounded-xl w-fit animate-slide-up border border-white/5">
        <button
          onClick={() => setActiveTab('scorecards')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'scorecards' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp size={14} />
          Scorecards
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'referrals' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus size={14} />
          Referrals
          {underperformers.length > 0 && (
            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
              activeTab === 'referrals' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {underperformers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('preferred')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'preferred' ? 'bg-cre-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 size={14} />
          Preferred Vendors
        </button>
      </div>

      {/* Scoring Formula */}
      {activeTab === 'scorecards' && (
        <div className="glass-surface p-4">
          <p className="text-xs text-gray-500 font-mono">
            score = 100 − Σ(rejections × 10 × sev) − Σ(skips × 5 × sev) − Σ(daysLate × 3 × sev) + bonus
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            Severity multipliers: minor = 1×, needs_fix_today = 2×, immediate = 4× · Scores can go negative
          </p>
        </div>
      )}

      {/* ═══ Scorecards Tab ═══ */}
      {activeTab === 'scorecards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
          {vendorData.map(({ vendor, score }) => {
            const isUnderperformer = underperformers.some(u => u.vendor.id === vendor.id);
            const suggestions = referralSuggestions.get(vendor.id) || [];
            return (
              <div key={vendor.id}>
                <div onClick={() => setSelectedVendor(vendor)} className="cursor-pointer transition-transform hover:-translate-y-1">
                  <VendorScorecard vendor={vendor} score={score} />
                </div>
                {isUnderperformer && (
                  <VendorReferralBanner
                    vendorName={vendor.companyName}
                    score={score.score}
                    suggestions={suggestions}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Referrals Tab ═══ */}
      {activeTab === 'referrals' && (
        <div className="space-y-6 animate-slide-up">
          {underperformers.length === 0 ? (
            <div className="glass-card py-16 flex flex-col items-center justify-center">
              <Award size={40} className="text-emerald-400/30 mb-3" />
              <p className="text-sm text-gray-400">All vendors are performing above threshold</p>
              <p className="text-xs text-gray-500 mt-1">No referrals needed at this time</p>
            </div>
          ) : (
            underperformers.map(({ vendor, score }) => {
              const suggestions = referralSuggestions.get(vendor.id) || [];
              return (
                <div key={vendor.id} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">{vendor.companyName}</h3>
                      <p className="text-xs text-gray-500">{vendor.specialties.join(', ')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-rose-400">{Math.round(score.score)}</span>
                      <p className="text-[10px] text-gray-500">current score</p>
                    </div>
                  </div>

                  {suggestions.length > 0 ? (
                    <div className="space-y-3">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Alternative Vendors</span>
                      {suggestions.map(suggestion => (
                        <div
                          key={suggestion.suggestedVendor.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="text-sm font-medium text-white">{suggestion.suggestedVendor.companyName}</div>
                              <div className="text-[11px] text-gray-500">{suggestion.sharedSpecialties.join(', ')}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium text-emerald-400 bg-emerald-500/10">
                              +{suggestion.scoreDelta} points higher
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              // Revenue integration point: track referral request
                              console.log(`[Referral] Introduction requested: ${suggestion.suggestedVendor.companyName}`);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cre-500/10 text-xs text-cre-400 font-medium hover:bg-cre-500/20 transition-all"
                          >
                            <UserPlus size={12} />
                            Request Introduction
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No alternative vendors with matching specialties found.</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ Preferred Vendors Tab ═══ */}
      {activeTab === 'preferred' && (
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-cre-400" />
            <h3 className="text-sm font-semibold text-gray-300">Preferred Vendor Assignments</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Preferred vendors are automatically assigned to new work orders when auto-assign is enabled on the Work Orders page.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider pb-3 pr-4">Property</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider pb-3 px-3">Category</th>
                  <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider pb-3 px-3">Vendor</th>
                  <th className="text-right text-[10px] text-gray-500 uppercase tracking-wider pb-3 pl-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {preferredMappings.map(mapping => (
                  <tr key={mapping.id} className="border-b border-white/[0.03]">
                    <td className="py-3 pr-4 text-sm text-gray-300">{mapping.property?.name || mapping.propertyId}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 text-[10px] font-medium text-cre-400 bg-cre-500/10 border border-cre-500/15 rounded-md uppercase">
                        {CATEGORY_LABELS[mapping.category] || mapping.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-sm text-white font-medium">{mapping.vendor?.companyName || mapping.vendorId}</td>
                    <td className="py-3 pl-3 text-right">
                      <span className="px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-white/5 rounded-md">
                        #{mapping.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedVendor && (
        <VendorDetailModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
      )}
    </div>
  );
}
