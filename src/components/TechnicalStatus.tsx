import { useState } from 'react';
import {
  X,
  Database,
  Cpu,
  Radio,
  BrainCircuit,
  ClipboardCheck,
  GraduationCap,
  Network,
  ArrowDown,
  Info,
  Check,
  FileSearch,
  ListChecks,
  HardDrive,
  Target,
  AlertTriangle,
  Package,
  FileCode,
  Box,
  FileText,
  Grid3x3,
  Settings,
  CircleDot,
  CheckCircle2,
  CircleDashed,
} from 'lucide-react';

interface TechnicalStatusProps {
  open: boolean;
  onClose: () => void;
}

// ── Claim status legend ──────────────────────────────────────────
const CLAIM_STATUSES = {
  available: { icon: CheckCircle2, label: 'Verified / available', color: 'text-green-400', dot: 'bg-green-400' },
  pending: { icon: CircleDashed, label: 'Pending evidence', color: 'text-amber-400', dot: 'bg-amber-400' },
  demo: { icon: Info, label: 'Demonstration / architecture only', color: 'text-cyan/70', dot: 'bg-cyan/70' },
} as const;
type ClaimStatus = keyof typeof CLAIM_STATUSES;

// ── Demonstration mode rows ──────────────────────────────────────
const DEMO_MODE_ROWS: { label: string; value: string; status: ClaimStatus }[] = [
  { label: 'DATA SOURCE', value: 'Controlled demonstration telemetry', status: 'demo' },
  { label: 'PACKET CAPTURE', value: 'Not connected in the public prototype', status: 'pending' },
  { label: 'ML INFERENCE', value: 'Demonstration / simulated inference', status: 'demo' },
  { label: 'MODEL DEPLOYMENT', value: 'Not connected to the public prototype', status: 'pending' },
];

// ── Dataset evidence ────────────────────────────────────────────
const DATASET_SOURCES = ['UNSW-NB15', 'CSE-CIC-IDS2018'];

// ── Training evidence fields ────────────────────────────────────
const TRAINING_EVIDENCE_FIELDS: { label: string; status: ClaimStatus }[] = [
  { label: 'Dataset', status: 'demo' },
  { label: 'Preprocessing', status: 'pending' },
  { label: 'Selected features', status: 'pending' },
  { label: 'Train / validation / test split', status: 'pending' },
  { label: 'Model / algorithm', status: 'pending' },
  { label: 'Hyperparameters', status: 'pending' },
  { label: 'Random seed', status: 'pending' },
  { label: 'Training date', status: 'pending' },
  { label: 'Model artifact', status: 'pending' },
  { label: 'Evaluation results', status: 'pending' },
];

// ── Reproducibility checklist (with claim status per item) ──────
const REPRODUCIBILITY_SECTIONS: {
  icon: typeof HardDrive;
  title: string;
  items: { label: string; status: ClaimStatus }[];
}[] = [
  {
    icon: HardDrive,
    title: 'Dataset',
    items: [
      { label: 'Dataset name and version', status: 'demo' },
      { label: 'Dataset source', status: 'demo' },
      { label: 'Dataset preprocessing', status: 'pending' },
    ],
  },
  {
    icon: Cpu,
    title: 'Features',
    items: [
      { label: 'Selected network-flow features', status: 'pending' },
      { label: 'Encoding / scaling procedure', status: 'pending' },
      { label: 'Missing-value handling', status: 'pending' },
    ],
  },
  {
    icon: BrainCircuit,
    title: 'Training',
    items: [
      { label: 'Model / algorithm', status: 'pending' },
      { label: 'Train / validation / test split', status: 'pending' },
      { label: 'Hyperparameters', status: 'pending' },
      { label: 'Random seed', status: 'pending' },
    ],
  },
  {
    icon: Target,
    title: 'Evaluation',
    items: [
      { label: 'Accuracy', status: 'pending' },
      { label: 'Precision', status: 'pending' },
      { label: 'Recall', status: 'pending' },
      { label: 'F1-score', status: 'pending' },
      { label: 'Confusion matrix', status: 'demo' },
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Robustness',
    items: [
      { label: 'Class imbalance handling', status: 'pending' },
      { label: 'Noisy traffic evaluation', status: 'pending' },
      { label: 'False-positive analysis', status: 'pending' },
    ],
  },
  {
    icon: Network,
    title: 'Deployment',
    items: [
      { label: 'Packet / flow collection', status: 'demo' },
      { label: 'Feature extraction', status: 'demo' },
      { label: 'Model inference', status: 'demo' },
      { label: 'Threat scoring', status: 'demo' },
      { label: 'Forecasting', status: 'demo' },
    ],
  },
];

// ── Production data path ────────────────────────────────────────
const PRODUCTION_PATH = [
  'Network Interface / SPAN / TAP',
  'Packet or Flow Collector',
  'Flow Feature Extraction',
  'ML Detection',
  'Threat Scoring',
  'Forecasting',
  'Dashboard',
];

// ── Evidence package placeholders ───────────────────────────────
const EVIDENCE_PACKAGE: { icon: typeof FileCode; label: string }[] = [
  { icon: FileCode, label: 'Training script' },
  { icon: FileCode, label: 'Preprocessing script' },
  { icon: Box, label: 'Model artifact' },
  { icon: HardDrive, label: 'Dataset information' },
  { icon: FileText, label: 'Evaluation report' },
  { icon: Grid3x3, label: 'Confusion matrix' },
  { icon: Settings, label: 'Reproducibility configuration' },
];

// ── Small claim-status badge ────────────────────────────────────
function ClaimBadge({ status }: { status: ClaimStatus }) {
  const cfg = CLAIM_STATUSES[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-mono ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {status === 'available' ? 'Available' : status === 'pending' ? 'Pending' : 'Demo'}
    </span>
  );
}

export default function TechnicalStatus({ open, onClose }: TechnicalStatusProps) {
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showReproModal, setShowReproModal] = useState(false);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex justify-end">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
        <div className="relative w-full max-w-md h-full overflow-y-auto bg-soc-bg-2 border-l border-soc-border shadow-2xl animate-slide-in-right">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-soc-border bg-soc-bg-2/95 backdrop-blur-xl z-10">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan" />
              <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase">Technical Status</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-soc-panel transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* ── Claim Status Legend ── */}
            <div className="p-3 rounded-lg bg-soc-panel/40 border border-soc-border/60">
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Claim Status Legend</p>
              <div className="flex flex-col gap-1.5">
                {(Object.keys(CLAIM_STATUSES) as ClaimStatus[]).map((key) => {
                  const cfg = CLAIM_STATUSES[key];
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className={`w-3 h-3 ${cfg.color}`} />
                      <span className="text-[10px] text-slate-400">{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 1. Demonstration Mode ── */}
            <div className="p-4 rounded-lg bg-soc-panel/50 border border-soc-border/60 border-l-2 border-l-cyan/40">
              <div className="flex items-center gap-2 mb-3">
                <CircleDot className="w-4 h-4 text-cyan/70" />
                <h3 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Demonstration Mode</h3>
              </div>
              <div className="space-y-2">
                {DEMO_MODE_ROWS.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{row.label}</p>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5">{row.value}</p>
                    </div>
                    <ClaimBadge status={row.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── 2. Dataset Evidence ── */}
            <div className="p-4 rounded-lg bg-soc-panel/50 border border-soc-border/60">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="w-4 h-4 text-cyan/70" />
                <h3 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Dataset Evidence</h3>
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Benchmark Datasets</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DATASET_SOURCES.map((ds) => (
                      <span key={ds} className="px-2 py-1 rounded-md bg-cyan/10 border border-cyan/20 text-[10px] font-mono text-cyan/90">
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1">Purpose</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Supervised network intrusion detection research &amp; evaluation.
                  </p>
                </div>
                <div className="flex items-start gap-2 pt-1 border-t border-soc-border/40">
                  <Info className="w-3 h-3 text-amber-400/70 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-400/70 leading-relaxed">
                    These datasets are intended for the training pipeline — their listing does not prove that training has already occurred.
                  </p>
                </div>
              </div>
            </div>

            {/* ── 3. Training Evidence ── */}
            <div className="p-4 rounded-lg bg-soc-panel/50 border border-soc-border/60 border-l-2 border-l-amber-500/40">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-amber-400/80" />
                <h3 className="text-[10px] font-mono text-amber-400/90 uppercase tracking-widest">Training Evidence</h3>
              </div>
              <div className="space-y-1.5">
                {TRAINING_EVIDENCE_FIELDS.map((field) => (
                  <div key={field.label} className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-md bg-soc-panel/30">
                    <span className="text-[11px] text-slate-300">{field.label}</span>
                    {field.status === 'pending' ? (
                      <span className="text-[10px] font-mono text-amber-400/70 italic">Pending artifact</span>
                    ) : (
                      <ClaimBadge status={field.status} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 4. Reproducibility Checklist ── */}
            <div className="p-4 rounded-lg bg-soc-panel/40 border border-soc-border/60 border-l-2 border-l-cyan/40">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-4 h-4 text-cyan/80" />
                <h3 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Reproducibility Checklist</h3>
              </div>
              <div className="space-y-3">
                {REPRODUCIBILITY_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.title}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-3 h-3 text-cyan/60" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{section.title}</span>
                      </div>
                      <ul className="space-y-1 pl-5">
                        {section.items.map((item) => (
                          <li key={item.label} className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-400 leading-relaxed">{item.label}</span>
                            <ClaimBadge status={item.status} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-amber-400/70 mt-3 leading-relaxed border-t border-soc-border/40 pt-2">
                Actual trained-model results require reproducible training artifacts.
              </p>
            </div>

            {/* ── 5. Evidence Package ── */}
            <div className="p-4 rounded-lg bg-soc-panel/50 border border-soc-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-cyan/70" />
                <h3 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">Evidence Package</h3>
              </div>
              <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                Placeholder slots for reproducible artifacts. No files are attached in the public prototype.
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {EVIDENCE_PACKAGE.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg bg-soc-panel/30 border border-dashed border-soc-border/60"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] text-slate-400 flex-1">{item.label}</span>
                      <span className="text-[9px] font-mono text-slate-600 italic">Not attached</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setShowTrainingModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-cyan/10 border border-cyan/20 text-cyan hover:bg-cyan/15 hover:border-cyan/30 transition-colors text-xs font-semibold tracking-wide"
              >
                <FileSearch className="w-3.5 h-3.5" />
                View Training Evidence
              </button>
              <button
                onClick={() => setShowReproModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-soc-panel border border-soc-border text-slate-300 hover:border-soc-border-bright hover:text-slate-100 transition-colors text-xs font-semibold tracking-wide"
              >
                <ListChecks className="w-3.5 h-3.5" />
                Reproducibility Checklist
              </button>
            </div>

            {/* ── Production Data Path ── */}
            <div className="p-4 rounded-lg bg-soc-panel/40 border border-soc-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Network className="w-4 h-4 text-cyan/70" />
                <h3 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Production Data Path</h3>
              </div>
              <p className="text-[10px] text-amber-400/60 mb-3 leading-relaxed">
                Intended production architecture — not connected to the live prototype.
              </p>
              <div className="flex flex-col items-center">
                {PRODUCTION_PATH.map((step, i) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className="px-3 py-2 rounded-lg bg-soc-panel border border-soc-border/60 text-center w-full">
                      <span className="text-[11px] text-slate-300 font-medium">{step}</span>
                    </div>
                    {i < PRODUCTION_PATH.length - 1 && (
                      <ArrowDown className="w-3.5 h-3.5 text-cyan/40 my-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 6. Closing statement ── */}
            <div className="p-3 rounded-lg bg-black/20 border border-soc-border/40">
              <p className="text-[10px] text-slate-500 leading-relaxed text-center">
                Public prototype demonstrates the complete dashboard workflow. Production packet capture and trained-model
                deployment require connection to the organization's network environment and trained model artifacts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Training Evidence Modal ── */}
      {showTrainingModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowTrainingModal(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-soc-bg-2 border border-soc-border shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-soc-border">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-cyan" />
                <h3 className="text-sm font-bold text-slate-100 tracking-wide">Training Evidence</h3>
              </div>
              <button
                onClick={() => setShowTrainingModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-soc-panel transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/15 border-l-2 border-l-amber-500/40">
                <Info className="w-5 h-5 text-amber-400/80 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    No trained-model artifact is currently connected to this public prototype.
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    For final validation, the team can provide the training script, dataset preprocessing code, model artifact,
                    configuration, evaluation results, and reproducibility information.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrainingModal(false)}
                className="mt-4 w-full px-3 py-2 rounded-lg bg-soc-panel border border-soc-border text-slate-300 hover:border-soc-border-bright transition-colors text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reproducibility Checklist Modal ── */}
      {showReproModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowReproModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-soc-bg-2 border border-soc-border shadow-2xl animate-fade-in">
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-soc-border bg-soc-bg-2/95 backdrop-blur-xl z-10">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-cyan" />
                <h3 className="text-sm font-bold text-slate-100 tracking-wide">Reproducibility Checklist</h3>
              </div>
              <button
                onClick={() => setShowReproModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-soc-panel transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              {/* Legend inside modal */}
              <div className="flex flex-wrap gap-4 mb-4 p-3 rounded-lg bg-soc-panel/40 border border-soc-border/40">
                {(Object.keys(CLAIM_STATUSES) as ClaimStatus[]).map((key) => {
                  const cfg = CLAIM_STATUSES[key];
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <Icon className={`w-3 h-3 ${cfg.color}`} />
                      <span className="text-[10px] text-slate-400">{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPRODUCIBILITY_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.title} className="p-4 rounded-lg bg-soc-panel/50 border border-soc-border/60">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-3.5 h-3.5 text-cyan/70" />
                        <h4 className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">{section.title}</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {section.items.map((item) => (
                          <li key={item.label} className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-400 leading-relaxed">{item.label}</span>
                            <ClaimBadge status={item.status} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-4 text-center">
                All fields above are to be populated with actual values from the reproducible training pipeline.
              </p>
              <button
                onClick={() => setShowReproModal(false)}
                className="mt-4 w-full px-3 py-2 rounded-lg bg-soc-panel border border-soc-border text-slate-300 hover:border-soc-border-bright transition-colors text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
