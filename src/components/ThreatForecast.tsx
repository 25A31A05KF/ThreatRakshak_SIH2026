import { useState } from 'react';
import type { SimState } from '@/types';
import { riskLevelColor } from '@/simulation';
import { Brain, ArrowDown, ChevronDown, Activity, Network, Repeat, AlertCircle } from 'lucide-react';

interface ThreatForecastProps {
  forecast: SimState['forecast'];
}

const SIGNALS = [
  { icon: <Network className="w-4 h-4" />, label: 'Increased connection attempts', detail: '342 outbound connections in 60s — 4.2x baseline average' },
  { icon: <Activity className="w-4 h-4" />, label: 'Unusual destination-port activity', detail: 'Non-standard ports 445, 3389, 22 scanned sequentially' },
  { icon: <Repeat className="w-4 h-4" />, label: 'Repeated requests from the same source', detail: 'Source 10.0.0.15 issued 287 requests to multiple internal hosts' },
];

export default function ThreatForecast({ forecast }: ThreatForecastProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const riskColor = riskLevelColor(forecast.risk);
  const confidenceColor =
    forecast.confidence >= 80 ? '#ef4444'
    : forecast.confidence >= 60 ? '#f59e0b'
    : forecast.confidence >= 40 ? '#22d3ee'
    : '#10b981';

  const isIdle = forecast.currentStage === 'Normal' || forecast.currentStage === '—';

  return (
    <div className="glass-card glass-card-hover p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan/3 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-5 relative">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan/20 blur-md rounded-full" />
          <Brain className="relative w-5 h-5 text-cyan" />
        </div>
        <h3 className="text-sm font-bold text-cyan tracking-wider glow-text-cyan">AI THREAT FORECAST</h3>
        <span className="ml-auto text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded border border-soc-border">
          PREDICTION ENGINE
        </span>
      </div>

      {/* Stage progression: Current → Predicted */}
      <div className="flex items-stretch gap-3 mb-5 relative">
        <div className="flex-1 bg-soc-panel/60 rounded-lg p-4 border border-soc-border text-center">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Current Stage</p>
          <p className="text-lg font-bold text-slate-100 leading-tight">{forecast.currentStage}</p>
        </div>

        <div className="flex flex-col items-center justify-center px-1">
          <ArrowDown
            className="w-6 h-6 animate-pulse"
            style={{ color: isIdle ? '#475569' : riskColor }}
          />
        </div>

        <div className="flex-1 bg-soc-panel/60 rounded-lg p-4 border text-center" style={{ borderColor: `${riskColor}40` }}>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Predicted Next Stage</p>
          <p className="text-lg font-bold leading-tight" style={{ color: riskColor }}>
            {forecast.predictedNextStage}
          </p>
        </div>
      </div>

      {/* Probability + Risk */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Probability with visualization */}
        <div className="bg-soc-panel/60 rounded-lg p-3 border border-soc-border">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Probability</p>
          <div className="flex items-center gap-3">
            {/* Radial probability indicator */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1c2942" strokeWidth="3" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={confidenceColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(forecast.confidence / 100) * 125.6} 125.6`}
                  style={{
                    transition: 'stroke-dasharray 1s ease-in-out, stroke 0.5s ease',
                    filter: `drop-shadow(0 0 4px ${confidenceColor}80)`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold tabular-nums" style={{ color: confidenceColor }}>
                  {forecast.confidence}%
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-2xl font-bold tabular-nums" style={{ color: confidenceColor }}>
                {forecast.confidence}%
              </span>
              <div className="mt-1 h-1 rounded-full bg-soc-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${forecast.confidence}%`, backgroundColor: confidenceColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-soc-panel/60 rounded-lg p-3 border border-soc-border">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Risk Level</p>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: riskColor,
                boxShadow: `0 0 12px ${riskColor}`,
                animation: isIdle ? 'none' : 'pulse-glow 2s ease-in-out infinite',
              }}
            />
            <span className="text-2xl font-bold" style={{ color: riskColor }}>{forecast.risk}</span>
          </div>
          <div className="mt-2 flex gap-1">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => {
              const active = forecast.risk === lvl;
              return (
                <div
                  key={lvl}
                  className="flex-1 h-1 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: active ? riskColor : '#1c2942',
                    boxShadow: active ? `0 0 6px ${riskColor}80` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Prediction Horizon */}
      <div className="mb-4">
        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Prediction Horizon</p>
        <p className="text-xs text-slate-300 font-mono">{forecast.horizon}</p>
      </div>

      {/* Why this prediction? */}
      <div className="bg-soc-panel/40 rounded-lg p-3 border border-soc-border/50 border-l-2 border-l-cyan/50 mb-4">
        <p className="text-[9px] text-cyan/70 uppercase tracking-widest mb-1.5">Why this prediction?</p>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          {forecast.explanation}
        </p>
      </div>

      {/* View Reasoning button */}
      <button
        onClick={() => setShowReasoning(!showReasoning)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 border"
        style={{
          borderColor: showReasoning ? 'rgba(34,211,238,0.4)' : 'rgba(28,41,66,0.8)',
          backgroundColor: showReasoning ? 'rgba(34,211,238,0.08)' : 'transparent',
          color: '#22d3ee',
        }}
      >
        <Brain className="w-3.5 h-3.5" />
        VIEW REASONING
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${showReasoning ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Reasoning panel */}
      {showReasoning && (
        <div className="mt-4 animate-slide-up space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-cyan/60" />
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Observed Signals</p>
          </div>

          {SIGNALS.map((signal, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-soc-panel/50 border border-soc-border/50 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/20 flex-shrink-0">
                <span className="text-cyan">{signal.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200">{signal.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{signal.detail}</p>
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">#{i + 1}</span>
            </div>
          ))}

          {/* Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 border-l-2 border-l-amber-500/50">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              These signals do not guarantee an attack progression. They increase the estimated likelihood of the next stage.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
        <span className="font-mono">Model output is probabilistic — not a certainty determination</span>
      </div>
    </div>
  );
}
