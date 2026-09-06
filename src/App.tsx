import { useState } from 'react';
import TopNav, { type PageId } from '@/components/TopNav';
import TechnicalStatus from '@/components/TechnicalStatus';
import Overview from '@/pages/Overview';
import ThreatIntelligence from '@/pages/ThreatIntelligence';
import NetworkPage from '@/pages/NetworkPage';
import Predictions from '@/pages/Predictions';
import Validation from '@/pages/Validation';
import HowItWorks from '@/pages/HowItWorks';
import { useSimulation } from '@/useSimulation';

function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [techStatusOpen, setTechStatusOpen] = useState(false);
  const { state, running, start, pause, reset } = useSimulation();

  return (
    <div className="min-h-screen bg-soc-bg radar-bg">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-30" />
      <div className="relative">
        <TopNav
          activePage={activePage}
          onNavigate={setActivePage}
          lastUpdate={state.lastUpdate}
          onOpenTechStatus={() => setTechStatusOpen(true)}
        />
        <main className="max-w-[1600px] mx-auto p-4 lg:p-6">
          {activePage === 'overview' && (
            <Overview
              state={state}
              running={running}
              onStart={start}
              onPause={pause}
              onReset={reset}
            />
          )}
          {activePage === 'intelligence' && <ThreatIntelligence />}
          {activePage === 'network' && <NetworkPage state={state} />}
          {activePage === 'predictions' && <Predictions state={state} />}
          {activePage === 'validation' && <Validation />}
          {activePage === 'how-it-works' && <HowItWorks />}
        </main>
        <TechnicalStatus open={techStatusOpen} onClose={() => setTechStatusOpen(false)} />
        <footer className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between text-[10px] text-slate-600 font-mono">
          <span>ThreatRakshak SOC — Prototype Build</span>
          <span>Simulated telemetry for demonstration purposes</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
