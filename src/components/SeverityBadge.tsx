import { Severity } from '../types';
import { AlertTriangle, Clock, Zap } from 'lucide-react';

const SEVERITY_CONFIG: Record<Severity, { label: string; icon: typeof AlertTriangle; bg: string; text: string; border: string }> = {
  minor: {
    label: 'Minor', icon: Clock,
    bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/20',
  },
  needs_fix_today: {
    label: 'Fix Today', icon: AlertTriangle,
    bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20',
  },
  immediate: {
    label: 'URGENT', icon: Zap,
    bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30',
  },
};

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md';
}

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 10 : 14;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-lg font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}
