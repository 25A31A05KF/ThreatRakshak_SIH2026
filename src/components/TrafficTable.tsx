import type { SimState } from '@/types';
import { statusColor, riskLevelColor } from '@/simulation';

interface TrafficTableProps {
  traffic: SimState['traffic'];
  maxRows?: number;
}

export default function TrafficTable({ traffic, maxRows = 12 }: TrafficTableProps) {
  return (
    <div className="overflow-auto" style={{ maxHeight: `${maxRows * 38 + 40}px` }}>
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-soc-panel-2 border-b border-soc-border z-10">
          <tr className="text-slate-400 font-mono">
            <th className="text-left py-2 px-3 font-medium">Timestamp</th>
            <th className="text-left py-2 px-3 font-medium">Source</th>
            <th className="text-left py-2 px-3 font-medium">Destination</th>
            <th className="text-left py-2 px-3 font-medium">Protocol</th>
            <th className="text-right py-2 px-3 font-medium">Packets</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
            <th className="text-left py-2 px-3 font-medium">Risk</th>
          </tr>
        </thead>
        <tbody>
          {traffic.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-slate-500">
                No traffic events recorded
              </td>
            </tr>
          )}
          {traffic.slice(0, maxRows).map((event, i) => {
            const sColor = statusColor(event.status);
            const rColor = riskLevelColor(event.risk);
            return (
              <tr
                key={event.id}
                className="border-b border-soc-border/50 hover:bg-soc-panel/40 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="py-2 px-3 font-mono text-slate-400">{event.timestamp}</td>
                <td className="py-2 px-3 font-mono text-slate-300">{event.source}</td>
                <td className="py-2 px-3 text-slate-300">{event.destination}</td>
                <td className="py-2 px-3 font-mono text-slate-400">{event.protocol}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-300">{event.packets}</td>
                <td className="py-2 px-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold"
                    style={{ color: sColor, backgroundColor: `${sColor}15`, border: `1px solid ${sColor}30` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sColor }} />
                    {event.status}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: rColor }}
                  >
                    {event.risk}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
