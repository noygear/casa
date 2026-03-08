import { WorkOrderStatus } from '../types';

const STATUS_CONFIG: Record<WorkOrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  open: { label: 'Open', bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  assigned: { label: 'Assigned', bg: 'bg-violet-500/15', text: 'text-violet-400', dot: 'bg-violet-400' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  needs_review: { label: 'Needs Review', bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  closed: { label: 'Closed', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  skipped: { label: 'Skipped', bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-400' },
};

interface StatusChipProps {
  status: WorkOrderStatus;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`status-chip ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`pulse-dot ${config.dot}`} />
      {config.label}
    </span>
  );
}
