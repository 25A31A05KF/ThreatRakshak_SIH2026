import type { SimState } from '@/types';
import { riskLevelColor } from '@/simulation';
import { Crosshair } from 'lucide-react';

interface ThreatDetectionProps {
  state: SimState;
}

export default function ThreatDetection({ state }: ThreatDetectionProps) {
  const hasThreat = state.detectedThreat !== null;
  const severityColor = state.threatSeverity ? riskLevelColor(state.threatSeverity) : '#10b981';

  return (
    <div className="glass-card glass-card-hover p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: severityColor }} />
        <h3 className="text-xs font-bold text-slate-200 tracking-wider">CURRENT ACTIVITY</h3>
        {hasThreat && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-mono animate-fade-in" style={{ color: severityColor }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: severityColor }} />
            DETECTING
          </span>
        )}
      </div>

      {!hasThreat ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-500">
          <Crosshair className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No active threats</p>
          <p className="text-[10px] mt-1">Monitoring network activity...</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Detected Threat</p>
            <p className="text-sm font-bold text-slate-100">{state.detectedThreat}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Threat Category</p>
              <p className="text-xs font-semibold" style={{ color: severityColor }}>{state.threatCategory}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Severity</p>
              <span
                className="inline-block text-xs font-bold px-2 py-0.5 rounded"
                style={{ color: severityColor, backgroundColor: `${severityColor}15`, border: `1px solid ${severityColor}30` }}
              >
                {state.threatSeverity}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-soc-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${state.threatConfidence}%`, backgroundColor: severityColor }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums" style={{ color: severityColor }}>
                  {state.threatConfidence}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Score</p>
              <span className="text-lg font-bold tabular-nums" style={{ color: severityColor }}>
                {state.riskScore}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
