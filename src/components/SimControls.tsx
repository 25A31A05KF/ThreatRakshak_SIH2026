import { Play, Pause, RotateCcw } from 'lucide-react';

interface SimControlsProps {
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function SimControls({ running, onStart, onPause, onReset }: SimControlsProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-cyan" />
        <h3 className="text-xs font-bold text-slate-200 tracking-wider">SIMULATION CONTROL</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onStart}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: running ? undefined : 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))',
            border: '1px solid rgba(34,211,238,0.4)',
            color: '#22d3ee',
            boxShadow: running ? undefined : '0 0 16px rgba(34,211,238,0.15)',
          }}
        >
          <Play className="w-4 h-4" />
          START THREAT SIMULATION
        </button>
        <button
          onClick={onPause}
          disabled={!running}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
        >
          <Pause className="w-4 h-4" />
          PAUSE
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 border border-soc-border-bright text-slate-400 hover:text-slate-200 hover:border-slate-500"
        >
          <RotateCcw className="w-4 h-4" />
          RESET DEMO
        </button>
      </div>
      {running && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-cyan animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <span className="font-mono">Simulation running — attack progression in progress...</span>
        </div>
      )}
    </div>
  );
}
