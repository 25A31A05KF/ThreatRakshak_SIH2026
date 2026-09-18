import {
  Network,
  Filter,
  ScanSearch,
  GitCompareArrows,
  TrendingUp,
  Map,
  Gauge,
  BellRing,
  LayoutDashboard,
  Database,
  Cpu,
  BrainCircuit,
  Server,
  Monitor,
  ArrowDown,
  Layers,
} from 'lucide-react';
import Panel from '@/components/Panel';
import DataStatusBadge from '@/components/DataStatusBadge';

const FLOW_STAGES = [
  { name: 'Network Telemetry', icon: Network, description: 'Controlled simulated network telemetry is generated for the current prototype; live packet capture is planned for production integration.' },
  { name: 'Feature Extraction', icon: Filter, description: 'Traffic is parsed into structured features such as byte counts, durations, and port patterns.' },
  { name: 'Threat Detection', icon: ScanSearch, description: 'The current prototype encodes observed telemetry into the 9 UNSW-NB15 attack-category states used by the trained forecaster.' },
  { name: 'Behavioral Sequence Analysis', icon: GitCompareArrows, description: 'Detected events are ordered into behavioral sequences to reveal attack progression patterns.' },
  { name: 'Threat Forecasting', icon: TrendingUp, description: 'The trained PyTorch Embedding + LSTM + Linear model predicts the next observed UNSW-NB15 attack-category state.' },
  { name: 'MITRE ATT&CK Mapping', icon: Map, description: 'Predicted and observed states are interpreted through the project MITRE ATT&CK mapping layer.' },
  { name: 'Risk Scoring', icon: Gauge, description: 'The dashboard combines forecast confidence, threat severity, and network-health indicators into its risk presentation.' },
  { name: 'Real-Time Alert', icon: BellRing, description: 'When configured risk conditions are reached, the dashboard presents an alert with context and recommended analyst action.' },
  { name: 'SOC Dashboard', icon: LayoutDashboard, description: 'Analysts see the full picture — topology, forecast, alerts, and reasoning — in one view.' },
];

const TECH_LAYERS = [
  { label: 'Data', value: 'UNSW-NB15 / CIC-IDS2018', icon: Database },
  { label: 'Processing', value: 'Feature Engineering', icon: Cpu },
  { label: 'AI', value: 'Classification + Temporal Forecasting', icon: BrainCircuit },
  { label: 'Backend', value: 'API + Real-time Event Stream', icon: Server },
  { label: 'Frontend', value: 'SOC Dashboard', icon: Monitor },
];

export default function HowItWorks() {
  return (
    <div className="space-y-4 animate-fade-in">
      <Panel title="How It Works — Implementation Flow" icon={<Layers className="w-4 h-4" />}>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <DataStatusBadge status="pending" size="sm" />
          <span className="text-[10px] font-mono text-amber-400/80 px-2 py-0.5 rounded border border-amber-500/20 bg-amber-500/5">
            Proposed Implementation Architecture / Prototype
          </span>
        </div>

        <div className="flex flex-col items-center">
          {FLOW_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const isLast = i === FLOW_STAGES.length - 1;
            return (
              <div key={stage.name} className="flex flex-col items-center w-full" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-4 w-full max-w-2xl animate-fade-in">
                  {/* Step number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-soc-panel border border-cyan/30 flex items-center justify-center text-xs font-bold text-cyan font-mono">
                    {i + 1}
                  </div>

                  {/* Stage card */}
                  <div className="flex-1 flex items-center gap-3 p-3 rounded-lg bg-soc-panel/50 border border-soc-border/60 hover:border-cyan/30 transition-colors duration-300">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/20 flex-shrink-0">
                      <Icon className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-100 tracking-wide">{stage.name}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{stage.description}</p>
                    </div>
                  </div>
                </div>

                {/* Animated connecting arrow */}
                {!isLast && (
                  <div className="flex flex-col items-center py-1">
                    <ArrowDown className="w-5 h-5 text-cyan/50 animate-bounce-slow" style={{ animationDelay: `${i * 100}ms` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Technology Layers" icon={<Server className="w-4 h-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {TECH_LAYERS.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.label}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-soc-panel/50 border border-soc-border/60 hover:border-cyan/30 transition-colors duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/20 mb-2">
                  <Icon className="w-5 h-5 text-cyan" />
                </div>
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">{layer.label}</p>
                <p className="text-xs font-semibold text-slate-200 leading-snug">{layer.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 border-l-2 border-l-amber-500/40">
          <span className="text-[10px] text-slate-400 leading-relaxed">
            This prototype currently uses controlled simulated telemetry and a connected trained PyTorch Temporal Forecaster through the local Flask inference API. Live network packet capture is not connected. Forecast outputs are probabilistic estimates intended to support analyst decision-making, not guaranteed predictions.
          </span>
        </div>
      </Panel>
    </div>
  );
}
