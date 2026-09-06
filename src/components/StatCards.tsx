import type { SimState } from '@/types';
import { riskLevelColor } from '@/simulation';
import { Activity, ShieldAlert, Brain, Wifi, Server } from 'lucide-react';

interface StatCardProps {
  state: SimState;
}

export default function StatCards({ state }: StatCardProps) {
  const riskColor = riskLevelColor(state.riskLevel);

  const cards = [
    {
      label: 'System Status',
      value: 'ONLINE',
      sub: `Updated ${state.lastUpdate}`,
      icon: <Activity className="w-5 h-5" />,
      color: '#10b981',
      glow: 'rgba(16,185,129,0.3)',
    },
    {
      label: 'Active Threats',
      value: String(state.activeThreats),
      sub: state.activeThreats > 0 ? 'Threats detected' : 'No active threats',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: state.activeThreats > 0 ? '#ef4444' : '#10b981',
      glow: state.activeThreats > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
    },
    {
      label: 'Predicted Threats',
      value: String(state.predictedThreats),
      sub: 'Forecasted by AI',
      icon: <Brain className="w-5 h-5" />,
      color: '#22d3ee',
      glow: 'rgba(34,211,238,0.3)',
    },
    {
      label: 'Network Health',
      value: `${state.networkHealth}%`,
      sub: state.networkHealth > 75 ? 'Healthy' : state.networkHealth > 50 ? 'Degraded' : 'Critical',
      icon: <Wifi className="w-5 h-5" />,
      color: state.networkHealth > 75 ? '#10b981' : state.networkHealth > 50 ? '#f59e0b' : '#ef4444',
      glow: state.networkHealth > 75 ? 'rgba(16,185,129,0.3)' : state.networkHealth > 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass-card glass-card-hover p-4 relative overflow-hidden group"
        >
          <div
            className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
            style={{ backgroundColor: card.color }}
          />
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{card.label}</span>
            <span style={{ color: card.color }}>{card.icon}</span>
          </div>
          <div
            className="text-2xl font-bold tabular-nums"
            style={{ color: card.color, textShadow: `0 0 12px ${card.glow}` }}
          >
            {card.value}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
