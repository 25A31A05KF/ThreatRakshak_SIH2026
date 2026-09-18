import Panel from '@/components/Panel';
import DataStatusBadge from '@/components/DataStatusBadge';
import { CheckCircle2, BarChart3, Grid3x3, Info, BrainCircuit } from 'lucide-react';

const STATES = [
  'analysis',
  'backdoor',
  'dos',
  'exploits',
  'fuzzers',
  'generic',
  'reconnaissance',
  'shellcode',
  'worms',
];

const TEST_METRICS = [
  { label: 'Top-1 Accuracy', value: 93.61, suffix: '%' },
  { label: 'Top-3 Accuracy', value: 98.56, suffix: '%' },
  { label: 'Macro Precision', value: 33.77, suffix: '%' },
  { label: 'Macro Recall', value: 33.67, suffix: '%' },
  { label: 'Macro F1', value: 33.41, suffix: '%' },
  { label: 'Weighted F1', value: 92.94, suffix: '%' },
];

const CONFUSION_MATRIX = [
  [73,0,0,0,2,0,0,0,0],
  [0,0,0,0,1,0,0,0,0],
  [1,0,0,0,9,5,0,0,0],
  [3,0,0,13,33,56,1,0,0],
  [6,0,0,32,1622,16,29,0,0],
  [0,0,0,4,21,2376,16,0,0],
  [1,0,0,1,12,24,0,0,0],
  [0,0,0,0,3,2,0,0,0],
  [0,0,0,0,1,0,0,0,0],
];

const CLASS_METRICS = [
  { state: 'analysis', support: 75, precision: 86.90, recall: 97.33, f1: 91.82 },
  { state: 'backdoor', support: 1, precision: 0.00, recall: 0.00, f1: 0.00 },
  { state: 'dos', support: 15, precision: 0.00, recall: 0.00, f1: 0.00 },
  { state: 'exploits', support: 106, precision: 26.00, recall: 12.26, f1: 16.67 },
  { state: 'fuzzers', support: 1705, precision: 95.19, recall: 95.13, f1: 95.16 },
  { state: 'generic', support: 2417, precision: 95.85, recall: 98.30, f1: 97.06 },
  { state: 'reconnaissance', support: 38, precision: 0.00, recall: 0.00, f1: 0.00 },
  { state: 'shellcode', support: 5, precision: 0.00, recall: 0.00, f1: 0.00 },
  { state: 'worms', support: 1, precision: 0.00, recall: 0.00, f1: 0.00 },
];

export default function Validation() {
  return (
    <div className="space-y-4 animate-fade-in">

      <div className="glass-card p-5 border-l-2 border-l-green-500/50">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-green-400 tracking-wide">
                MODEL VALIDATION
              </h2>
              <DataStatusBadge status="verified" size="sm" />
            </div>

            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Evaluation results from the stored Temporal Forecaster test artifact.
              The model performs one-step prediction of the next observed UNSW-NB15
              attack-category state.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TEST_METRICS.map((metric) => (
          <div
            key={metric.label}
            className="glass-card glass-card-hover p-5 relative overflow-hidden group"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                {metric.label}
              </span>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>

            <div className="text-2xl font-bold text-green-400 tabular-nums">
              {metric.value.toFixed(2)}{metric.suffix}
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-soc-border overflow-hidden">
              <div
                className="h-full rounded-full bg-green-400/50"
                style={{ width: `${Math.min(metric.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Panel
          title="Stored Test Evaluation"
          icon={<BarChart3 className="w-4 h-4" />}
        >
          <div className="flex items-center gap-2 mb-4">
            <DataStatusBadge status="verified" />
            <span className="text-[10px] text-slate-500">
              Measured on 4,363 held-out test samples.
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-soc-panel/40 border border-soc-border/50">
              <span className="text-xs text-slate-400">Top-1 Accuracy</span>
              <span className="text-sm font-bold text-green-400">93.61%</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-soc-panel/40 border border-soc-border/50">
              <span className="text-xs text-slate-400">Top-3 Accuracy</span>
              <span className="text-sm font-bold text-cyan-400">98.56%</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-soc-panel/40 border border-soc-border/50">
              <span className="text-xs text-slate-400">Macro Precision</span>
              <span className="text-sm font-bold text-slate-200">33.77%</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-soc-panel/40 border border-soc-border/50">
              <span className="text-xs text-slate-400">Macro Recall</span>
              <span className="text-sm font-bold text-slate-200">33.67%</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-soc-panel/40 border border-soc-border/50">
              <span className="text-xs text-slate-400">Macro F1</span>
              <span className="text-sm font-bold text-slate-200">33.41%</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-soc-panel/40 border border-soc-border/50">
              <span className="text-xs text-slate-400">Weighted F1</span>
              <span className="text-sm font-bold text-slate-200">92.94%</span>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
            <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Macro Precision, Macro Recall, and Macro F1 are unweighted averages across the 9 model states.
              These metrics are interpreted alongside per-class results because the test set is class-imbalanced.
            </p>
          </div>
        </Panel>

        <Panel
          title="Model Configuration"
          icon={<BrainCircuit className="w-4 h-4" />}
        >
          <div className="space-y-3">
            {[
              ['Model', 'Embedding + LSTM + Linear classifier'],
              ['Task', 'Next observed UNSW-NB15 state'],
              ['Sequence Length', '8'],
              ['Classes', '9'],
              ['Epochs', '30'],
              ['Best Epoch', '30'],
              ['Batch Size', '128'],
              ['Learning Rate', '0.001'],
              ['Weight Decay', '0.0001'],
              ['Random Seed', '42'],
              ['Device', 'CPU'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 p-2.5 rounded-lg bg-soc-panel/30 border border-soc-border/40"
              >
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {label}
                </span>
                <span className="text-[11px] text-slate-200 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Panel>

      </div>

      <Panel
        title="Test Confusion Matrix — 9 UNSW-NB15 States"
        icon={<Grid3x3 className="w-4 h-4" />}
      >
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <DataStatusBadge status="verified" />
          <p className="text-[10px] text-slate-500">
            Rows = actual state • Columns = predicted state • Test set: 4,363 samples
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="p-2 text-[9px] text-slate-500">Actual ? / Predicted ?</th>
                {STATES.map((state) => (
                  <th
                    key={state}
                    className="p-2 text-[8px] text-slate-400 font-mono"
                  >
                    {state}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {CONFUSION_MATRIX.map((row, rowIndex) => (
                <tr key={STATES[rowIndex]}>
                  <th className="p-2 text-[8px] text-slate-400 font-mono text-right">
                    {STATES[rowIndex]}
                  </th>

                  {row.map((value, colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={`p-2 text-[10px] font-mono border border-soc-border/30 ${
                        rowIndex === colIndex
                          ? 'bg-green-500/15 text-green-300'
                          : value > 0
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'text-slate-600'
                      }`}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Per-Class Test Performance" icon={<BarChart3 className="w-4 h-4" />}>
        <div className="flex items-center gap-2 mb-3">
          <DataStatusBadge status="verified" />
          <span className="text-[10px] text-slate-500">
            Class-level results from the stored test evaluation artifact.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-soc-border">
                <th className="p-2 text-[9px] text-slate-500 uppercase">State</th>
                <th className="p-2 text-[9px] text-slate-500 uppercase text-right">Support</th>
                <th className="p-2 text-[9px] text-slate-500 uppercase text-right">Precision</th>
                <th className="p-2 text-[9px] text-slate-500 uppercase text-right">Recall</th>
                <th className="p-2 text-[9px] text-slate-500 uppercase text-right">F1</th>
              </tr>
            </thead>

            <tbody>
              {CLASS_METRICS.map((item) => (
                <tr key={item.state} className="border-b border-soc-border/30">
                  <td className="p-2 text-[10px] text-slate-300 font-mono">
                    {item.state}
                  </td>
                  <td className="p-2 text-[10px] text-slate-400 text-right">
                    {item.support}
                  </td>
                  <td className="p-2 text-[10px] text-slate-300 text-right">
                    {item.precision.toFixed(2)}%
                  </td>
                  <td className="p-2 text-[10px] text-slate-300 text-right">
                    {item.recall.toFixed(2)}%
                  </td>
                  <td className="p-2 text-[10px] text-slate-300 text-right">
                    {item.f1.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex items-start gap-2.5 px-1">
        <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The test results are measured model performance, not simulated dashboard
          values. The class distribution is imbalanced and several rare classes have
          zero recall in the test set; macro metrics should therefore be interpreted
          alongside per-class results.
        </p>
      </div>

    </div>
  );
}



