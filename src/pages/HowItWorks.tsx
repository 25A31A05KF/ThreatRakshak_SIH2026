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

const FLOW_STAGES = [
  { name: 'Network Telemetry', icon: Network, description: 'Raw packet and flow data is collected from network sensors in real time.' },
  { name: 'Feature Extraction', icon: Filter, description: 'Traffic is parsed into structured features such as byte counts, durations, and port patterns.' },
  { name: 'Threat Detection', icon: ScanSearch, description: 'A classification model flags individual events that match known suspicious patterns.' },
  { name: 'Behavioral Sequence Analysis', icon: GitCompareArrows, description: 'Detected events are ordered into behavioral sequences to reveal attack progression patterns.' },
  { name: 'Threat Forecasting', icon: TrendingUp, description: 'A temporal model estimates the most likely next attack stage from the observed sequence.' },
  { name: 'MITRE ATT&CK Mapping', icon: Map, description: 'Each detected and predicted stage is mapped to the corresponding MITRE ATT&CK tactic.' },
  { name: 'Risk Scoring', icon: Gauge, description: 'A composite risk score is calculated from threat severity, confidence, and network health.' },
  { name: 'Real-Time Alert', icon: BellRing, description: 'When risk exceeds a threshold, an alert with context and recommended action is raised.' },
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
        <div className="flex items-center gap-2 mb-4">
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
            This architecture represents a proposed prototype implementation. Model outputs are probabilistic estimates intended to support analyst decision-making, not guaranteed predictions.
          </span>
        </div>
      </Panel>
    </div>
  );
}
