import { WorkOrder, CATEGORY_LABELS } from '../types';
import { StatusChip } from './StatusChip';
import { SeverityBadge } from './SeverityBadge';
import { SLABadge } from './SLABadge';
import { computeSLAStatus } from '../domain/slaTracker';
import { MapPin, User, Building2 } from 'lucide-react';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onClick?: (wo: WorkOrder) => void;
}

export function WorkOrderCard({ workOrder, onClick }: WorkOrderCardProps) {
  const sla = workOrder.slaResponseMin && workOrder.slaResolveMin
    ? computeSLAStatus({
        createdAt: workOrder.createdAt,
        respondedAt: workOrder.respondedAt,
        resolvedAt: workOrder.resolvedAt,
        slaResponseMin: workOrder.slaResponseMin,
        slaResolveMin: workOrder.slaResolveMin,
      })
    : null;

  const showResolveSLA = workOrder.status !== 'closed' && workOrder.status !== 'skipped';
  const isUrgent = workOrder.severity === 'immediate';

  return (
    <div
      className={`glass-card-hover p-5 cursor-pointer animate-fade-in ${
        isUrgent ? 'border-rose-500/30 shadow-rose-500/5 shadow-lg' : ''
      }`}
      onClick={() => onClick?.(workOrder)}
      id={`work-order-card-${workOrder.id}`}
    >
      {/* Top Row: Status + Severity */}
      <div className="flex items-center justify-between mb-3">
        <StatusChip status={workOrder.status} />
        {workOrder.status !== 'closed' && (
          <SeverityBadge severity={workOrder.severity} size="sm" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{workOrder.title}</h3>

      {/* Category */}
      <span className="inline-block px-2 py-0.5 text-[10px] font-medium text-cre-400 bg-cre-500/10 border border-cre-500/15 rounded-md mb-3 uppercase tracking-wider">
        {CATEGORY_LABELS[workOrder.category]}
      </span>

      {/* Location */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
        <div className="flex items-center gap-1.5">
          <Building2 size={12} className="text-gray-500" />
          <span>{workOrder.property?.name || '—'}</span>
        </div>
        {workOrder.space && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-gray-500" />
            <span>{workOrder.space.name}</span>
          </div>
        )}
      </div>

      {/* Assignee */}
      {workOrder.assignedTo && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <User size={12} className="text-gray-500" />
          <span>{workOrder.assignedTo.name}</span>
          {workOrder.vendor && (
            <span className="text-gray-600">· {workOrder.vendor.companyName}</span>
          )}
        </div>
      )}

      {/* SLA */}
      {sla && showResolveSLA && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <SLABadge
            elapsedMin={sla.resolveElapsedMin}
            targetMin={sla.resolveTargetMin}
            label="Resolve"
          />
        </div>
      )}

      {/* Inspection Badge */}
      {workOrder.isInspection && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-violet-400 font-medium uppercase tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          Inspection Required
        </div>
      )}
    </div>
  );
}
