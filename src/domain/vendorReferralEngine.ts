// ============================================================
// Vendor Referral Engine — Pure Domain Logic
// ============================================================
// Detects underperforming vendors and suggests alternatives.
// Zero framework imports.
// ============================================================
// Revenue integration point: In production, referral events
// would be logged here for analytics and fee tracking.
// ============================================================

import { Vendor, VendorScoreRecord } from '../types/index.js';

export interface VendorReferralSuggestion {
  underperformingVendor: Vendor;
  suggestedVendor: Vendor;
  sharedSpecialties: string[];
  scoreDelta: number;
  reason: string;
}

/**
 * Returns vendors whose score falls below the threshold.
 */
export function detectUnderperformers(
  vendors: Vendor[],
  scores: VendorScoreRecord[],
  threshold: number = 80
): { vendor: Vendor; score: VendorScoreRecord }[] {
  return vendors
    .map(vendor => {
      const score = scores.find(s => s.vendorId === vendor.id);
      return score ? { vendor, score } : null;
    })
    .filter((entry): entry is { vendor: Vendor; score: VendorScoreRecord } =>
      entry !== null && entry.score.score < threshold
    )
    .sort((a, b) => a.score.score - b.score.score);
}

/**
 * Finds alternative vendors that share specialties with the underperformer
 * and have a higher score.
 */
export function findAlternativeVendors(
  underperformer: Vendor,
  underperformerScore: number,
  allVendors: Vendor[],
  allScores: VendorScoreRecord[]
): VendorReferralSuggestion[] {
  const alternatives: VendorReferralSuggestion[] = [];

  for (const candidate of allVendors) {
    if (candidate.id === underperformer.id) continue;
    if (!candidate.isActive) continue;

    const candidateScore = allScores.find(s => s.vendorId === candidate.id);
    if (!candidateScore || candidateScore.score <= underperformerScore) continue;

    const shared = underperformer.specialties.filter(s =>
      candidate.specialties.includes(s)
    );
    if (shared.length === 0) continue;

    const delta = Math.round(candidateScore.score - underperformerScore);

    alternatives.push({
      underperformingVendor: underperformer,
      suggestedVendor: candidate,
      sharedSpecialties: shared,
      scoreDelta: delta,
      reason: `${candidate.companyName} scores ${delta} points higher in shared specialties: ${shared.join(', ')}`,
    });
  }

  // Revenue integration point: log referral suggestion generation event

  return alternatives.sort((a, b) => b.scoreDelta - a.scoreDelta);
}
