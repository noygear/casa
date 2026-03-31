// ============================================================
// Vendor Scoring Engine — Pure Domain Logic
// ============================================================
// Computes vendor performance scores using the
// Quality → Consistency → Speed → Volume priority model.
// Mirrors the household scoring formula adapted for CRE.
// ============================================================

import { Severity, SEVERITY_MULTIPLIER } from '../types/index.js';

export interface ScoringInput {
  rejections: Array<{ severity: Severity }>;
  skips: Array<{ severity: Severity }>;
  lateCompletions: Array<{ severity: Severity; daysLate: number }>;
  completions: number;
  bonus: number;
}

export interface ScoreBreakdown {
  total: number;
  quality: number;      // 100 - rejection penalties
  consistency: number;   // 100 - skip penalties
  speed: number;         // 100 - lateness penalties
  volume: number;        // Raw completion count
  rejectionPenalty: number;
  skipPenalty: number;
  latePenalty: number;
}

/**
 * Compute vendor score for a scoring period.
 *
 * Formula:
 *   score = 100
 *     − Σ(rejections × 10 × severityMultiplier)
 *     − Σ(skips × 5 × severityMultiplier)
 *     − Σ(daysLate × 3 × severityMultiplier)
 *     + bonus
 *
 * Priority: Quality → Consistency → Speed → Volume
 * Score can go NEGATIVE — no floor.
 */
export function computeVendorScore(input: ScoringInput): ScoreBreakdown {
  const rejectionPenalty = input.rejections.reduce(
    (sum, r) => sum + 10 * SEVERITY_MULTIPLIER[r.severity],
    0
  );

  const skipPenalty = input.skips.reduce(
    (sum, s) => sum + 5 * SEVERITY_MULTIPLIER[s.severity],
    0
  );

  const latePenalty = input.lateCompletions.reduce(
    (sum, l) => sum + l.daysLate * 3 * SEVERITY_MULTIPLIER[l.severity],
    0
  );

  const quality = 100 - rejectionPenalty;
  const consistency = 100 - skipPenalty;
  const speed = 100 - latePenalty;
  const volume = input.completions;

  const total = 100 - rejectionPenalty - skipPenalty - latePenalty + input.bonus;

  return {
    total,
    quality,
    consistency,
    speed,
    volume,
    rejectionPenalty,
    skipPenalty,
    latePenalty,
  };
}

/**
 * Get a letter grade from a numeric score.
 */
export function getScoreGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get the CSS color class for a score value.
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-rose-400';
}
