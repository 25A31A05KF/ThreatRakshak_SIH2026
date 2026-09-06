import {
  THREAT_EVENTS,
  ATTACK_CATEGORIES,
  RISK_DISTRIBUTION,
  MITRE_STAGE_DISTRIBUTION,
} from '@/mockData';
import { riskLevelColor } from '@/simulation';
import Panel from '@/components/Panel';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Shield, Layers, PieChart as PieIcon, Grid3x3, Brain, AlertOctagon, Eye, Bell, Activity, TrendingUp, Zap } from 'lucide-react';

const tooltipStyle = {
  backgroundColor: '#0e1525',
  border: '1px solid #1c2942',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
};

export default function ThreatIntelligence() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Why ThreatRakshak comparison */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan/20 blur-md rounded-full" />
            <Brain className="relative w-5 h-5 text-cyan" />
          </div>
          <h3 className="text-sm font-bold text-cyan tracking-wider">Why ThreatRakshak?</h3>
          <span className="ml-auto text-[9px] font-mono text-slate-500 px-2 py-0.5 rounded border border-soc-border">
            APPROACH COMPARISON
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Traditional Detection */}
          <div className="rounded-lg p-4 bg-soc-panel/40 border border-soc-border/60">
            <div className="flex items-center gap-2 mb-3">
              <AlertOctagon className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Traditional Detection</h4>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: <Eye className="w-3.5 h-3.5" />, text: 'Detects after suspicious activity becomes evident' },
                { icon: <Activity className="w-3.5 h-3.5" />, text: 'Focuses on individual events' },
                { icon: <Zap className="w-3.5 h-3.5" />, text: 'Reactive investigation' },
                { icon: <Bell className="w-3.5 h-3.5" />, text: 'Alert overload' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="text-slate-500 mt-0.5 flex-shrink-0">{item.icon}</span>
                  <span className="text-xs text-slate-400 leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ThreatRakshak */}
          <div className="rounded-lg p-4 bg-cyan/5 border border-cyan/25 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 mb-3 relative">
              <Brain className="w-4 h-4 text-cyan" />
              <h4 className="text-xs font-bold text-cyan uppercase tracking-wider">ThreatRakshak</h4>
            </div>
            <div className="space-y-2.5 relative">
              {[
                { icon: <Activity className="w-3.5 h-3.5" />, text: 'Analyzes behavioral sequences' },
                { icon: <TrendingUp className="w-3.5 h-3.5" />, text: 'Estimates the next likely attack stage' },
                { icon: <Eye className="w-3.5 h-3.5" />, text: 'Provides early warning' },
                { icon: <Zap className="w-3.5 h-3.5" />, text: 'Connects detection with forecasting' },
                { icon: <Shield className="w-3.5 h-3.5" />, text: 'Shows risk and confidence together' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="text-cyan mt-0.5 flex-shrink-0">{item.icon}</span>
                  <span className="text-xs text-slate-200 leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 border-l-2 border-l-amber-500/40">
          <span className="text-[10px] text-slate-400 leading-relaxed">
            ThreatRakshak provides probabilistic estimates to support analyst decision-making. It does not guarantee prediction or prevention of attacks.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Recent Threat Events" icon={<Shield className="w-4 h-4" />}>
          <div className="overflow-auto max-h-[420px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-soc-panel-2 border-b border-soc-border">
                <tr className="text-slate-400 font-mono">
                  <th className="text-left py-2 px-2 font-medium">Time</th>
                  <th className="text-left py-2 px-2 font-medium">Category</th>
                  <th className="text-left py-2 px-2 font-medium">Source</th>
                  <th className="text-left py-2 px-2 font-medium">Target</th>
                  <th className="text-left py-2 px-2 font-medium">Stage</th>
                  <th className="text-left py-2 px-2 font-medium">Sev</th>
                  <th className="text-left py-2 px-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {THREAT_EVENTS.map((event, i) => {
                  const sevColor = riskLevelColor(event.severity);
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-soc-border/40 hover:bg-soc-panel/40 transition-colors animate-fade-in"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="py-2 px-2 font-mono text-slate-500">{event.timestamp}</td>
                      <td className="py-2 px-2 text-slate-300">{event.category}</td>
                      <td className="py-2 px-2 font-mono text-slate-400">{event.source}</td>
                      <td className="py-2 px-2 text-slate-300">{event.target}</td>
                      <td className="py-2 px-2 text-slate-400">{event.mitreStage}</td>
                      <td className="py-2 px-2">
                        <span className="text-[10px] font-bold" style={{ color: sevColor }}>{event.severity}</span>
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            color: event.status === 'active' ? '#ef4444' : event.status === 'investigating' ? '#f59e0b' : '#10b981',
                            backgroundColor: event.status === 'active' ? 'rgba(239,68,68,0.1)' : event.status === 'investigating' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                          }}
                        >
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Risk Distribution" icon={<PieIcon className="w-4 h-4" />}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RISK_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  stroke="#0a0f1c"
                  strokeWidth={2}
                >
                  {RISK_DISTRIBUTION.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {RISK_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}</span>
                <span className="ml-auto text-slate-300 font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Attack Categories" icon={<Layers className="w-4 h-4" />}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ATTACK_CATEGORIES} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" horizontal={false} />
                <XAxis type="number" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} width={100} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(34,211,238,0.05)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {ATTACK_CATEGORIES.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="MITRE ATT&CK Stage Distribution" icon={<Grid3x3 className="w-4 h-4" />}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={MITRE_STAGE_DISTRIBUTION}>
                <PolarGrid stroke="#1c2942" />
                <PolarAngleAxis dataKey="stage" tick={{ fontSize: 9, fill: '#64748b' }} />
                <PolarRadiusAxis tick={{ fontSize: 8, fill: '#475569' }} stroke="#1c2942" />
                <Radar dataKey="count" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
