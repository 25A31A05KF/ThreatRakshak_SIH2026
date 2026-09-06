import type { SimState } from '@/types';
import { riskLevelColor } from '@/simulation';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface AlertPanelProps {
  alerts: SimState['alerts'];
}

export default function AlertPanel({ alerts }: AlertPanelProps) {
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <ShieldAlert className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No active alerts</p>
          <p className="text-[10px] mt-1">System operating normally</p>
        </div>
      )}
      {alerts.map((alert, i) => {
        const color = riskLevelColor(alert.severity);
        return (
          <div
            key={alert.id}
            className="glass-card glass-card-hover p-3 animate-slide-up border-l-2"
            style={{
              borderLeftColor: color,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color }} />
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                >
                  {alert.severity}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
            </div>
            <p className="text-sm font-semibold text-slate-100 mb-1">{alert.threat}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
              <div>
                <span className="text-slate-500">Source: </span>
                <span className="font-mono text-slate-300">{alert.source}</span>
              </div>
              <div>
                <span className="text-slate-500">Predicted Stage: </span>
                <span className="text-slate-300">{alert.predictedStage}</span>
              </div>
            </div>
            <div className="bg-soc-panel/40 rounded p-2 border border-soc-border/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Recommended Action</p>
              <p className="text-xs text-slate-300 leading-relaxed">{alert.recommendedAction}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
