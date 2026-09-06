import type { SimState } from '@/types';
import ThreatForecast from '@/components/ThreatForecast';
import AttackProgression from '@/components/AttackProgression';
import Panel from '@/components/Panel';
import { Brain, GitBranch, TrendingUp, Target } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from 'recharts';
import { FORECAST_CONFIDENCE } from '@/mockData';

const tooltipStyle = {
  backgroundColor: '#0e1525',
  border: '1px solid #1c2942',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
};

interface PredictionsProps {
  state: SimState;
}

const PROBABILITY_TREND = [
  { time: 'T+0', recon: 15, initial: 5, execution: 2 },
  { time: 'T+1', recon: 28, initial: 10, execution: 4 },
  { time: 'T+2', recon: 52, initial: 22, execution: 8 },
  { time: 'T+3', recon: 71, initial: 45, execution: 15 },
  { time: 'T+4', recon: 82, initial: 67, execution: 28 },
  { time: 'T+5', recon: 91, initial: 82, execution: 45 },
  { time: 'T+6', recon: 93, initial: 87, execution: 61 },
];

export default function Predictions({ state }: PredictionsProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ThreatForecast forecast={state.forecast} />

        <Panel title="Attack Stage Progression" icon={<GitBranch className="w-4 h-4" />}>
          <AttackProgression stages={state.stages} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-soc-panel/40 rounded-lg p-2 border border-soc-border/50">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Completed</p>
              <p className="text-lg font-bold text-green-400">{state.stages.filter(s => s.status === 'completed').length}</p>
            </div>
            <div className="bg-soc-panel/40 rounded-lg p-2 border border-soc-border/50">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Current</p>
              <p className="text-lg font-bold text-red-400">{state.stages.filter(s => s.status === 'current').length}</p>
            </div>
            <div className="bg-soc-panel/40 rounded-lg p-2 border border-soc-border/50">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Predicted</p>
              <p className="text-lg font-bold text-amber-400">{state.stages.filter(s => s.status === 'predicted').length}</p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Stage Progression Probability Over Time" icon={<TrendingUp className="w-4 h-4" />}>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PROBABILITY_TREND} margin={{ left: -10, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: '50% threshold', fill: '#f59e0b', fontSize: 9 }} />
              <Line type="monotone" dataKey="recon" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} name="Reconnaissance" />
              <Line type="monotone" dataKey="initial" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Initial Access" />
              <Line type="monotone" dataKey="execution" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Execution" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Forecast Confidence by Stage" icon={<Target className="w-4 h-4" />}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FORECAST_CONFIDENCE} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" vertical={false} />
                <XAxis dataKey="stage" stroke="#475569" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(34,211,238,0.05)' }} />
                <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                  {FORECAST_CONFIDENCE.map((entry, i) => {
                    const color = entry.confidence >= 80 ? '#ef4444' : entry.confidence >= 60 ? '#f59e0b' : '#22d3ee';
                    return <Cell key={i} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Prediction Model Summary" icon={<Brain className="w-4 h-4" />}>
          <div className="space-y-3">
            <div className="bg-soc-panel/40 rounded-lg p-3 border border-soc-border/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Model Type</p>
              <p className="text-sm text-slate-200">Sequence-based Threat Progression Predictor</p>
            </div>
            <div className="bg-soc-panel/40 rounded-lg p-3 border border-soc-border/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Input Features</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {['Traffic patterns', 'Port activity', 'Protocol anomalies', 'Source reputation', 'Behavioral sequence'].map(f => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">{f}</span>
                ))}
              </div>
            </div>
            <div className="bg-soc-panel/40 rounded-lg p-3 border border-soc-border/50">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Prediction</p>
              <p className="text-sm text-slate-200">{state.forecast.currentStage} → {state.forecast.predictedNextStage}</p>
              <p className="text-[10px] text-slate-400 mt-1">Confidence: {state.forecast.confidence}% | Risk: {state.forecast.risk}</p>
            </div>
            <div className="bg-soc-panel/40 rounded-lg p-3 border border-soc-border/50 border-l-2 border-l-amber-500/50">
              <p className="text-[10px] text-amber-500 uppercase tracking-wider mb-1">Disclaimer</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Predictions are probabilistic estimates based on simulated telemetry. They do not represent certainty and should be validated by security analysts.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
