import { Shield, Activity, Globe, Brain, CheckCircle2, Layers, Info } from 'lucide-react';

export type PageId = 'overview' | 'intelligence' | 'network' | 'predictions' | 'validation' | 'how-it-works';

interface TopNavProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  lastUpdate: string;
  onOpenTechStatus: () => void;
}

const NAV_ITEMS: { id: PageId; label: string; icon: typeof Shield }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'intelligence', label: 'Threat Intelligence', icon: Shield },
  { id: 'network', label: 'Network', icon: Globe },
  { id: 'predictions', label: 'Predictions', icon: Brain },
  { id: 'validation', label: 'Validation', icon: CheckCircle2 },
  { id: 'how-it-works', label: 'How It Works', icon: Layers },
];

export default function TopNav({ activePage, onNavigate, lastUpdate, onOpenTechStatus }: TopNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-soc-border bg-soc-bg/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan/30 blur-lg rounded-full" />
            <Shield className="relative w-8 h-8 text-cyan" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">
              Threat<span className="text-cyan glow-text-cyan">Rakshak</span>
            </h1>
            <p className="text-[10px] text-slate-400 tracking-wide mt-0.5">
              AI-Powered Threat Detection &amp; Forecasting
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'text-cyan bg-cyan/10 border border-cyan/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-soc-panel/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan' : ''}`} />
                <span>{item.label}</span>
                {active && (
                  <span className="absolute -bottom-px left-2 right-2 h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTechStatus}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
            title="Technical Status"
          >
            <Info className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-[10px] font-semibold text-amber-400/80 tracking-wide">DEMO MODE</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-soc-panel border border-soc-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-xs font-semibold text-green-400 tracking-wide">SYSTEM ONLINE</span>
          </div>
          <div className="hidden lg:block text-xs text-slate-500 font-mono">
            {lastUpdate}
          </div>
        </div>
      </div>

      <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? 'text-cyan bg-cyan/10 border border-cyan/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
