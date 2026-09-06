import type { RiskLevel } from '@/types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  size?: number;
}

export default function RiskGauge({ score, level, size = 180 }: RiskGaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const stroke = 10;
  const offset = circumference - (score / 100) * circumference * 0.75;
  const fullCircumference = 2 * Math.PI * radius;

  const color =
    level === 'LOW' ? '#10b981'
    : level === 'MEDIUM' ? '#f59e0b'
    : level === 'HIGH' ? '#ef4444'
    : '#dc2626';

  const glowColor =
    level === 'LOW' ? 'rgba(16,185,129,0.5)'
    : level === 'MEDIUM' ? 'rgba(245,158,11,0.5)'
    : level === 'HIGH' ? 'rgba(239,68,68,0.5)'
    : 'rgba(220,38,38,0.6)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-[135deg]">
        <defs>
          <filter id={`glow-${level}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1c2942"
          strokeWidth={stroke}
          strokeDasharray={`${fullCircumference * 0.75} ${fullCircumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${fullCircumference * 0.75} ${fullCircumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#glow-${level})`}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-bold tabular-nums"
          style={{ color, textShadow: `0 0 20px ${glowColor}` }}
        >
          {score}
        </span>
        <span className="text-xs font-semibold tracking-widest mt-1" style={{ color }}>
          {level} RISK
        </span>
      </div>
    </div>
  );
}
