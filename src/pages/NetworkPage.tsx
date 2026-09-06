import type { SimState } from '@/types';
import NetworkTopology from '@/components/NetworkTopology';
import TrafficTable from '@/components/TrafficTable';
import Panel from '@/components/Panel';
import { Radio, Activity, Server, Wifi } from 'lucide-react';
import { statusColor } from '@/simulation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { NETWORK_TRAFFIC_HISTORY } from '@/mockData';

const tooltipStyle = {
  backgroundColor: '#0e1525',
  border: '1px solid #1c2942',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
};

interface NetworkPageProps {
  state: SimState;
}

export default function NetworkPage({ state }: NetworkPageProps) {
  const nodeStatusCount = state.nodes.reduce((acc, n) => {
    acc[n.status] = (acc[n.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Network Topology Map" icon={<Radio className="w-4 h-4" />} className="lg:col-span-2">
          <NetworkTopology nodes={state.nodes} links={state.links} height={420} />
        </Panel>

        <div className="space-y-4">
          <Panel title="Node Status" icon={<Server className="w-4 h-4" />}>
            <div className="space-y-2">
              {(['Normal', 'Suspicious', 'Compromised'] as const).map((status) => {
                const color = statusColor(status);
                const count = nodeStatusCount[status] || 0;
                return (
                  <div key={status} className="flex items-center gap-3 p-2 rounded-lg bg-soc-panel/40 border border-soc-border/50">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
                    <span className="text-sm text-slate-300">{status}</span>
                    <span className="ml-auto text-lg font-bold tabular-nums" style={{ color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title="Node Inventory" icon={<Wifi className="w-4 h-4" />}>
            <div className="space-y-1.5">
              {state.nodes.map((node) => {
                const color = statusColor(node.status);
                return (
                  <div key={node.id} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-slate-300">{node.label}</span>
                    <span className="ml-auto font-mono text-[10px] uppercase" style={{ color }}>{node.status}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Traffic Volume History" icon={<Activity className="w-4 h-4" />}>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={NETWORK_TRAFFIC_HISTORY} margin={{ left: -10, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 9 }} interval={4} />
              <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="inbound" stroke="#22d3ee" strokeWidth={2} fill="url(#inboundGrad)" name="Inbound" />
              <Area type="monotone" dataKey="outbound" stroke="#3b82f6" strokeWidth={2} fill="url(#outboundGrad)" name="Outbound" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Live Network Traffic" icon={<Activity className="w-4 h-4" />}>
        <TrafficTable traffic={state.traffic} maxRows={15} />
      </Panel>
    </div>
  );
}
