import type { AttackStage } from '@/types';

interface AttackProgressionProps {
  stages: AttackStage[];
}

export default function AttackProgression({ stages }: AttackProgressionProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-center gap-0 min-w-max px-2">
        {stages.map((stage, i) => {
          const isCompleted = stage.status === 'completed';
          const isCurrent = stage.status === 'current';
          const isPredicted = stage.status === 'predicted';

          const color = isCompleted ? '#10b981' : isCurrent ? '#ef4444' : isPredicted ? '#f59e0b' : '#334155';
          const bgColor = isCompleted ? 'rgba(16,185,129,0.15)' : isCurrent ? 'rgba(239,68,68,0.15)' : isPredicted ? 'rgba(245,158,11,0.12)' : 'transparent';
          const glow = isCurrent ? '0 0 12px rgba(239,68,68,0.5)' : isPredicted ? '0 0 8px rgba(245,158,11,0.3)' : 'none';

          return (
            <div key={stage.name} className="flex items-center">
              {i > 0 && (
                <div className="flex items-center mx-1">
                  <div
                    className="h-px w-6"
                    style={{
                      background: isCompleted ? 'linear-gradient(90deg, #10b981, #10b981)' : 'linear-gradient(90deg, #1c2942, #1c2942)',
                    }}
                  />
                  {isCurrent && (
                    <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
              )}
              <div className="group relative flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500"
                  style={{
                    borderColor: color,
                    backgroundColor: bgColor,
                    boxShadow: glow,
                  }}
                >
                  {isCompleted && (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isCurrent && (
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse-glow" />
                  )}
                  {isPredicted && (
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                  {stage.status === 'upcoming' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </div>
                <span
                  className="text-[9px] font-medium mt-1.5 text-center whitespace-nowrap transition-colors"
                  style={{ color: isCompleted || isCurrent || isPredicted ? '#cbd5e1' : '#475569' }}
                >
                  {stage.name}
                </span>
                {isCurrent && (
                  <span className="absolute -top-5 text-[8px] font-bold text-red-400 whitespace-nowrap animate-fade-in">
                    CURRENT
                  </span>
                )}
                {isPredicted && (
                  <span className="absolute -top-5 text-[8px] font-bold text-amber-400 whitespace-nowrap animate-fade-in">
                    PREDICTED
                  </span>
                )}

                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 p-3 rounded-lg bg-soc-panel-2 border border-soc-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-panel">
                  <p className="text-xs font-semibold text-slate-200">{stage.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{stage.description}</p>
                  <p className="text-[9px] mt-2 font-mono" style={{ color }}>
                    {stage.status.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
