import type { SimState } from '@/types';
import { riskLevelColor } from '@/simulation';
import RiskGauge from '@/components/RiskGauge';
import StatCards from '@/components/StatCards';
import NetworkTopology from '@/components/NetworkTopology';
import TrafficTable from '@/components/TrafficTable';
import AttackProgression from '@/components/AttackProgression';
import ThreatForecast from '@/components/ThreatForecast';
import ThreatTimeline from '@/components/ThreatTimeline';
import AlertPanel from '@/components/AlertPanel';
import SimControls from '@/components/SimControls';
import ThreatDetection from '@/components/ThreatDetection';
import Panel from '@/components/Panel';
import { Activity, Radio, Target, AlertTriangle, GitBranch, Clock, Bell, Gauge } from 'lucide-react';

interface OverviewProps {
  state: SimState;
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function Overview({ state, running, onStart, onPause, onReset }: OverviewProps) {
  const riskColor = riskLevelColor(state.riskLevel);

  return (
    <div className="space-y-4 animate-fade-in">
      <SimControls running={running} onStart={onStart} onPause={onPause} onReset={onReset} />

      <StatCards state={state} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Overall Risk Score" icon={<Gauge className="w-4 h-4" />} className="flex flex-col items-center justify-center">
          <RiskGauge score={state.riskScore} level={state.riskLevel} size={200} />
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: riskColor }} />
            <span className="text-xs font-mono text-slate-400">
              {state.riskLevel === 'LOW' ? 'All systems nominal' : `${state.riskLevel} risk threshold exceeded`}
            </span>
          </div>
        </Panel>

        <Panel title="Network Topology" icon={<Radio className="w-4 h-4" />} className="lg:col-span-2">
          <NetworkTopology nodes={state.nodes} links={state.links} height={300} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Live Network Traffic" icon={<Activity className="w-4 h-4" />}>
          <TrafficTable traffic={state.traffic} maxRows={10} />
        </Panel>

        <ThreatDetection state={state} />
      </div>

      <Panel title="Attack Stage Progression — MITRE ATT&CK Lifecycle" icon={<GitBranch className="w-4 h-4" />}>
        <AttackProgression stages={state.stages} />
      </Panel>

      <ThreatForecast forecast={state.forecast} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Threat Timeline" icon={<Clock className="w-4 h-4" />}>
          <ThreatTimeline events={state.timeline} />
        </Panel>

        <Panel title="Security Alerts" icon={<Bell className="w-4 h-4" />}>
          <AlertPanel alerts={state.alerts} />
        </Panel>
      </div>
    </div>
  );
}
