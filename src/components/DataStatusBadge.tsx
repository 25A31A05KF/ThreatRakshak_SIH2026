import { CheckCircle2, CircleDashed, Info } from 'lucide-react';

export type DataStatus = 'demo' | 'verified' | 'pending';

const STATUS_CONFIG: Record<DataStatus, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  demo: {
    icon: Info,
    label: 'DEMO / SIMULATED',
    color: 'text-cyan/80',
    bg: 'bg-cyan/5',
    border: 'border-cyan/20',
  },
  verified: {
    icon: CheckCircle2,
    label: 'VERIFIED MODEL RESULT',
    color: 'text-green-400',
    bg: 'bg-green-500/5',
    border: 'border-green-500/20',
  },
  pending: {
    icon: CircleDashed,
    label: 'PENDING',
    color: 'text-amber-400/80',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
  },
};

interface DataStatusBadgeProps {
  status: DataStatus;
  size?: 'sm' | 'xs';
  showLabel?: boolean;
}

export default function DataStatusBadge({ status, size = 'xs', showLabel = true }: DataStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-[8px]';

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color} ${textSize} font-mono tracking-wider whitespace-nowrap`}
    >
      <Icon className={iconSize} />
      {showLabel && cfg.label}
    </span>
  );
}
