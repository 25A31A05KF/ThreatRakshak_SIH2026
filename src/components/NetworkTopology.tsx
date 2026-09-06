import { useMemo } from 'react';
import type { NetworkNode, NetworkLink, ThreatStatus } from '@/types';
import { statusColor } from '@/simulation';
import { Globe, Shield, Server, Monitor, AlertTriangle } from 'lucide-react';

interface NetworkTopologyProps {
  nodes: NetworkNode[];
  links: NetworkLink[];
  height?: number;
}

const NODE_RADIUS: Record<string, number> = {
  internet: 3.2,
  gateway: 2.8,
  server: 2.8,
  workstation: 2.4,
};

function NodeIcon({ type, color, size }: { type: string; color: string; size: number }) {
  const props = { size, color, strokeWidth: 1.8 };
  switch (type) {
    case 'internet': return <Globe {...props} />;
    case 'gateway': return <Shield {...props} />;
    case 'server': return <Server {...props} />;
    case 'workstation': return <Monitor {...props} />;
    default: return <Server {...props} />;
  }
}

interface ParticleConfig {
  count: number;
  speed: number;
  size: number;
  opacity: number;
}

function particleConfig(status: ThreatStatus): ParticleConfig {
  switch (status) {
    case 'Normal': return { count: 2, speed: 4, size: 0.35, opacity: 0.5 };
    case 'Suspicious': return { count: 5, speed: 1.8, size: 0.45, opacity: 0.85 };
    case 'Compromised': return { count: 8, speed: 1.0, size: 0.5, opacity: 1 };
    default: return { count: 2, speed: 4, size: 0.35, opacity: 0.5 };
  }
}

export default function NetworkTopology({ nodes, links, height = 400 }: NetworkTopologyProps) {
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const hasAlerts = nodes.some((n) => n.status !== 'Normal');

  return (
    <div className="relative w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="topo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="topo-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bg-radial" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0a1220" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
          </radialGradient>
          {nodes.map((node) => {
            const color = statusColor(node.status);
            return (
              <radialGradient key={`node-fill-${node.id}`} id={`node-fill-${node.id}`} cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor={color} stopOpacity={node.status === 'Normal' ? 0.15 : 0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={node.status === 'Normal' ? 0.02 : 0.08} />
              </radialGradient>
            );
          })}
        </defs>

        <rect width="100" height="100" fill="url(#bg-radial)" />

        {/* Subtle grid */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`gh-${i}`} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} stroke="#1c2942" strokeWidth="0.06" opacity="0.3" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`gv-${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" stroke="#1c2942" strokeWidth="0.06" opacity="0.3" />
        ))}

        {/* Links */}
        {links.map((link, i) => {
          const source = nodeMap.get(link.source);
          const target = nodeMap.get(link.target);
          if (!source || !target) return null;

          const color = statusColor(link.status);
          const isAlert = link.status !== 'Normal';
          const pc = particleConfig(link.status);

          return (
            <g key={`link-${i}`}>
              {/* Base connection line */}
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={color}
                strokeWidth={isAlert ? 0.4 : 0.2}
                strokeOpacity={isAlert ? 0.5 : 0.25}
                strokeLinecap="round"
                style={{ transition: 'stroke 0.6s ease, stroke-width 0.6s ease, stroke-opacity 0.6s ease' }}
              />

              {/* Animated dashed overlay for alert links */}
              {isAlert && (
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={color}
                  strokeWidth="0.12"
                  strokeDasharray="1 1.5"
                  strokeOpacity="0.5"
                  style={{ animation: 'flow 1.5s linear infinite' }}
                />
              )}

              {/* Traffic particles */}
              {Array.from({ length: pc.count }, (_, pIdx) => {
                const delay = (pIdx / pc.count) * pc.speed;
                return (
                  <circle
                    key={`particle-${i}-${pIdx}`}
                    r={pc.size}
                    fill={color}
                    opacity={pc.opacity}
                    style={{
                      animation: `particle-flow-${i} ${pc.speed}s linear infinite`,
                      animationDelay: `${delay}s`,
                      offsetPath: `path('M ${source.x} ${source.y} L ${target.x} ${target.y}')`,
                    }}
                  >
                    <animateMotion
                      dur={`${pc.speed}s`}
                      repeatCount="indefinite"
                      path={`M ${source.x},${source.y} L ${target.x},${target.y}`}
                      begin={`${delay}s`}
                    />
                  </circle>
                );
              })}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const r = NODE_RADIUS[node.type] || 2.5;
          const color = statusColor(node.status);
          const isAlert = node.status !== 'Normal';
          const filterId = isAlert ? 'topo-glow-strong' : 'topo-glow';

          return (
            <g key={node.id} filter={`url(#${filterId})`} style={{ transition: 'filter 0.6s ease' }}>
              {/* Pulsing ring for alert nodes */}
              {isAlert && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 1.5}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.12"
                  opacity="0.3"
                  style={{ animation: 'ping-slow 2.5s cubic-bezier(0,0,0.2,1) infinite' }}
                />
              )}
              {isAlert && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 3}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.08"
                  opacity="0.15"
                  style={{ animation: 'ping-slow 2.5s cubic-bezier(0,0,0.2,1) infinite', animationDelay: '0.8s' }}
                />
              )}

              {/* Outer ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={`url(#node-fill-${node.id})`}
                stroke={color}
                strokeWidth={isAlert ? 0.22 : 0.14}
                strokeOpacity={isAlert ? 0.8 : 0.5}
                style={{ transition: 'stroke 0.6s ease, stroke-width 0.6s ease, stroke-opacity 0.6s ease' }}
              />

              {/* Inner core */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r * 0.45}
                fill={color}
                opacity={isAlert ? 0.85 : 0.4}
                style={{ transition: 'opacity 0.6s ease, fill 0.6s ease' }}
              />
            </g>
          );
        })}
      </svg>

      {/* HTML overlay for node labels and icons */}
      {nodes.map((node) => {
        const color = statusColor(node.status);
        const isAlert = node.status !== 'Normal';
        const iconSize = node.type === 'internet' ? 18 : node.type === 'workstation' ? 14 : 16;

        return (
          <div
            key={`overlay-${node.id}`}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Icon centered in node */}
            <div style={{ opacity: 0.9 }}>
              <NodeIcon type={node.type} color={isAlert ? color : '#94a3b8'} size={iconSize} />
            </div>

            {/* Label below node */}
            <span
              className="text-[10px] font-semibold whitespace-nowrap mt-1.5 transition-colors duration-500"
              style={{ color: isAlert ? color : '#94a3b8' }}
            >
              {node.label}
            </span>

            {/* Status badge */}
            <span
              className="text-[8px] font-mono mt-0.5 px-1.5 py-0.5 rounded-full border transition-all duration-500"
              style={{
                color,
                borderColor: `${color}40`,
                backgroundColor: `${color}12`,
              }}
            >
              {node.status}
            </span>

            {/* Warning indicator for suspicious/compromised */}
            {isAlert && (
              <div
                className="absolute -top-5 -right-3 animate-fade-in"
                style={{ animationDuration: '0.4s' }}
              >
                <AlertTriangle
                  size={12}
                  color={color}
                  fill={color}
                  fillOpacity={0.2}
                  className="animate-pulse"
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-soc-panel/80 backdrop-blur border border-soc-border/50">
        {(['Normal', 'Suspicious', 'Compromised'] as const).map((s) => {
          const c = statusColor(s);
          return (
            <div key={s} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}80` }} />
              <span className="text-[9px] font-mono text-slate-400">{s}</span>
            </div>
          );
        })}
      </div>

      {/* Status indicator */}
      {hasAlerts && (
        <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-soc-panel/80 backdrop-blur border border-soc-border/50 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-red-400">ANOMALY DETECTED</span>
        </div>
      )}
    </div>
  );
}
