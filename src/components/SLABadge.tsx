import { getSLAUrgency, formatDuration } from '../domain/slaTracker';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const URGENCY_CONFIG = {
  good: { icon: CheckCircle2, text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  warning: { icon: Clock, text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  critical: { icon: AlertTriangle, text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

interface SLABadgeProps {
  elapsedMin: number;
  targetMin: number;
  label?: string;
}

export function SLABadge({ elapsedMin, targetMin, label = 'SLA' }: SLABadgeProps) {
  const percentUsed = targetMin > 0 ? Math.round((elapsedMin / targetMin) * 100) : 0;
  const urgency = getSLAUrgency(percentUsed);
  const config = URGENCY_CONFIG[urgency];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <Icon size={13} />
      <span>{label}</span>
      <span className="font-mono font-bold">{formatDuration(elapsedMin)}</span>
      <span className="text-gray-500">/</span>
      <span className="font-mono text-gray-400">{formatDuration(targetMin)}</span>
      {percentUsed > 100 && (
        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider ml-1">Breached</span>
      )}
    </div>
  );
}
