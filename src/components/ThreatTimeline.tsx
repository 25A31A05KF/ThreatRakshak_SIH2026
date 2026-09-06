import type { SimState } from '@/types';
import { riskLevelColor } from '@/simulation';

interface TimelineProps {
  events: SimState['timeline'];
}

export default function ThreatTimeline({ events }: TimelineProps) {
  return (
    <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2">
      {events.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No events recorded
        </div>
      )}
      {events.map((event, i) => {
        const color =
          event.severity === 'critical' ? '#ef4444'
          : event.severity === 'warning' ? '#f59e0b'
          : '#22d3ee';

        return (
          <div
            key={event.id}
            className="flex gap-3 animate-slide-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex flex-col items-center">
              <div
                className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}80`,
                }}
              />
              {i < events.length - 1 && (
                <div className="w-px flex-1 bg-soc-border mt-1" />
              )}
            </div>
            <div className="pb-4 flex-1">
              <span className="text-[10px] font-mono text-slate-500">{event.timestamp}</span>
              <p
                className="text-xs leading-relaxed mt-0.5"
                style={{
                  color: event.severity === 'critical' ? '#fca5a5' : event.severity === 'warning' ? '#fcd34d' : '#cbd5e1',
                }}
              >
                {event.message}
              </p>
              {event.severity === 'critical' && (
                <span
                  className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded"
                  style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)', border: `1px solid ${riskLevelColor('HIGH')}30` }}
                >
                  CRITICAL
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
