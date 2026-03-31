import { useState } from 'react';
import { VendorReferralSuggestion } from '../domain/vendorReferralEngine';
import { AlertTriangle, ArrowRight, UserPlus, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface VendorReferralBannerProps {
  vendorName: string;
  score: number;
  suggestions: VendorReferralSuggestion[];
}

export function VendorReferralBanner({ vendorName, score, suggestions }: VendorReferralBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());

  const handleRequestIntro = (suggestedVendorId: string) => {
    // Revenue integration point: In production, this would send a
    // notification to the Casa team and log the referral event for
    // fee tracking and analytics.
    console.log(`[Referral] Introduction requested for vendor ${suggestedVendorId} to replace ${vendorName}`);
    setRequestedIds(prev => new Set([...prev, suggestedVendorId]));
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-400">
              Performance below threshold (score: {Math.round(score)})
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {suggestions.length} alternative vendor{suggestions.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-[11px] text-amber-400 font-medium hover:bg-amber-500/20 transition-all"
        >
          {expanded ? 'Hide' : 'View Alternatives'}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 animate-slide-up">
          {suggestions.map(suggestion => {
            const isRequested = requestedIds.has(suggestion.suggestedVendor.id);
            return (
              <div
                key={suggestion.suggestedVendor.id}
                className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 line-through">{vendorName}</span>
                    <ArrowRight size={12} className="text-gray-600" />
                    <span className="text-xs text-white font-medium">{suggestion.suggestedVendor.companyName}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-400 bg-emerald-500/10">
                    +{suggestion.scoreDelta} pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">{suggestion.sharedSpecialties.join(', ')}</span>
                  {isRequested ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 size={12} />
                      Requested
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRequestIntro(suggestion.suggestedVendor.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cre-500/10 text-[11px] text-cre-400 font-medium hover:bg-cre-500/20 transition-all"
                    >
                      <UserPlus size={12} />
                      Request Intro
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
