// ============================================================
// SLA Tracker — Pure Domain Logic
// ============================================================
// Computes SLA compliance status for work orders by comparing
// elapsed time against configured targets.
// ============================================================

import { SLAStatus } from '../types/index.js';

export interface SLAInput {
  createdAt: string;          // ISO timestamp
  respondedAt?: string | null;
  resolvedAt?: string | null;
  slaResponseMin: number;     // Target response time in minutes
  slaResolveMin: number;      // Target resolution time in minutes
  currentTime?: string;       // For testing; defaults to now
}

/**
 * Compute SLA compliance status for a work order.
 */
export function computeSLAStatus(input: SLAInput): SLAStatus {
  const now = new Date(input.currentTime || Date.now());
  const created = new Date(input.createdAt);

  // Response time: created → respondedAt (or now if not yet responded)
  const responseEnd = input.respondedAt ? new Date(input.respondedAt) : now;
  const responseElapsedMs = responseEnd.getTime() - created.getTime();
  const responseElapsedMin = Math.max(0, responseElapsedMs / 60000);

  // Resolve time: created → resolvedAt (or now if not yet resolved)
  const resolveEnd = input.resolvedAt ? new Date(input.resolvedAt) : now;
  const resolveElapsedMs = resolveEnd.getTime() - created.getTime();
  const resolveElapsedMin = Math.max(0, resolveElapsedMs / 60000);

  const responsePercentUsed = input.slaResponseMin > 0
    ? (responseElapsedMin / input.slaResponseMin) * 100
    : 0;

  const resolvePercentUsed = input.slaResolveMin > 0
    ? (resolveElapsedMin / input.slaResolveMin) * 100
    : 0;

  return {
    responseOnTrack: responseElapsedMin <= input.slaResponseMin,
    resolveOnTrack: resolveElapsedMin <= input.slaResolveMin,
    responseElapsedMin: Math.round(responseElapsedMin),
    resolveElapsedMin: Math.round(resolveElapsedMin),
    responseTargetMin: input.slaResponseMin,
    resolveTargetMin: input.slaResolveMin,
    responsePercentUsed: Math.round(responsePercentUsed),
    resolvePercentUsed: Math.round(resolvePercentUsed),
  };
}

/**
 * Get SLA urgency level for color coding.
 */
export function getSLAUrgency(percentUsed: number): 'good' | 'warning' | 'critical' {
  if (percentUsed <= 50) return 'good';
  if (percentUsed <= 80) return 'warning';
  return 'critical';
}

/**
 * Format minutes into a human-readable duration string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
