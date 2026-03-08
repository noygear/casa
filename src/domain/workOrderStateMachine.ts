// ============================================================
// Work Order State Machine — Pure Domain Logic
// ============================================================
// Enforces valid state transitions with role-based permission
// checks. Zero framework imports.
// ============================================================

import { WorkOrderStatus, UserRole } from '../types';

export class WorkOrderTransitionError extends Error {
  constructor(
    public fromStatus: WorkOrderStatus,
    public toStatus: WorkOrderStatus,
    public reason: string
  ) {
    super(`Cannot transition from "${fromStatus}" to "${toStatus}": ${reason}`);
    this.name = 'WorkOrderTransitionError';
  }
}

interface TransitionRule {
  to: WorkOrderStatus;
  allowedRoles: UserRole[];
  requiresPhotos?: boolean;
  requiresInspectionPhotos?: boolean; // before + after
  isRejection?: boolean;
}

const TRANSITION_MAP: Record<WorkOrderStatus, TransitionRule[]> = {
  open: [
    { to: 'assigned', allowedRoles: ['property_manager', 'asset_manager'] },
    { to: 'skipped', allowedRoles: ['property_manager', 'asset_manager'] },
  ],
  assigned: [
    { to: 'in_progress', allowedRoles: ['vendor', 'property_manager', 'asset_manager'] },
    { to: 'skipped', allowedRoles: ['property_manager', 'asset_manager'] },
  ],
  in_progress: [
    { to: 'needs_review', allowedRoles: ['vendor', 'property_manager', 'asset_manager'], requiresPhotos: true },
    { to: 'closed', allowedRoles: ['vendor', 'property_manager', 'asset_manager'], requiresPhotos: true },
  ],
  needs_review: [
    { to: 'closed', allowedRoles: ['vendor', 'property_manager', 'asset_manager'] },
    { to: 'in_progress', allowedRoles: ['property_manager', 'asset_manager'], isRejection: true },
  ],
  closed: [],    // Terminal state
  skipped: [],   // Terminal state
};

export interface TransitionContext {
  currentStatus: WorkOrderStatus;
  targetStatus: WorkOrderStatus;
  userRole: UserRole;
  hasCompletionPhotos: boolean;
  isInspection: boolean;
  hasBeforePhoto: boolean;
  hasAfterPhoto: boolean;
}

export function validateTransition(ctx: TransitionContext): void {
  const rules = TRANSITION_MAP[ctx.currentStatus];

  if (!rules || rules.length === 0) {
    throw new WorkOrderTransitionError(
      ctx.currentStatus,
      ctx.targetStatus,
      `"${ctx.currentStatus}" is a terminal state — no further transitions allowed.`
    );
  }

  const rule = rules.find(r => r.to === ctx.targetStatus);

  if (!rule) {
    const validTargets = rules.map(r => r.to).join(', ');
    throw new WorkOrderTransitionError(
      ctx.currentStatus,
      ctx.targetStatus,
      `Invalid transition. Valid targets from "${ctx.currentStatus}": [${validTargets}]`
    );
  }

  if (!rule.allowedRoles.includes(ctx.userRole)) {
    throw new WorkOrderTransitionError(
      ctx.currentStatus,
      ctx.targetStatus,
      `Role "${ctx.userRole}" is not permitted. Required: [${rule.allowedRoles.join(', ')}]`
    );
  }

  if (rule.requiresPhotos && !ctx.hasCompletionPhotos) {
    throw new WorkOrderTransitionError(
      ctx.currentStatus,
      ctx.targetStatus,
      'At least one completion photo is required before submitting for review.'
    );
  }

  if (ctx.isInspection && ctx.targetStatus === 'needs_review') {
    if (!ctx.hasBeforePhoto || !ctx.hasAfterPhoto) {
      throw new WorkOrderTransitionError(
        ctx.currentStatus,
        ctx.targetStatus,
        'Inspection work orders require both a "before" and "after" photo.'
      );
    }
  }
}

export function getAvailableTransitions(
  currentStatus: WorkOrderStatus,
  userRole: UserRole
): WorkOrderStatus[] {
  const rules = TRANSITION_MAP[currentStatus] || [];
  return rules
    .filter(r => r.allowedRoles.includes(userRole))
    .map(r => r.to);
}

export function isRejection(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  if (from !== 'needs_review' || to !== 'in_progress') return false;
  const rule = TRANSITION_MAP[from]?.find(r => r.to === to);
  return rule?.isRejection ?? false;
}
