import Panel from '@/components/Panel';
import { CheckCircle2, BarChart3, Grid3x3, TrendingUp, Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { DETECTION_PERFORMANCE, FORECAST_CONFIDENCE, CONFUSION_MATRIX } from '@/mockData';

const tooltipStyle = {
  backgroundColor: '#0e1525',
  border: '1px solid #1c2942',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
};

export default function Validation() {
  const metrics = [
    { label: 'Precision', color: '#22d3ee', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Recall', color: '#10b981', icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'F1 Score', color: '#3b82f6', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const cm = CONFUSION_MATRIX;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-card p-5 border-l-2 border-l-amber-500/50">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-amber-400 tracking-wide">PROTOTYPE VALIDATION</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Illustrative evaluation interface — final metrics will be generated after training and testing on real network datasets.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass-card glass-card-hover p-5 relative overflow-hidden group">
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: metric.color }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{metric.label}</span>
              <span style={{ color: metric.color }}>{metric.icon}</span>
            </div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: metric.color, textShadow: `0 0 16px ${metric.color}40` }}>
              Illustrative
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-soc-border overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: '100%', backgroundColor: `${metric.color}40` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Illustrative Detection Performance" icon={<TrendingUp className="w-4 h-4" />}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DETECTION_PERFORMANCE} margin={{ left: -10, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" />
                <XAxis dataKey="epoch" stroke="#475569" tick={{ fontSize: 10 }} label={{ value: 'Epoch', fill: '#475569', fontSize: 10, position: 'insideBottom', offset: -2 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[0.6, 1]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="precision" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} name="Precision" />
                <Line type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Recall" />
                <Line type="monotone" dataKey="f1" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="F1 Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Illustrative Forecast Confidence" icon={<BarChart3 className="w-4 h-4" />}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FORECAST_CONFIDENCE} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" vertical={false} />
                <XAxis dataKey="stage" stroke="#475569" tick={{ fontSize: 9 }} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#475569" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(34,211,238,0.05)' }} />
                <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                  {FORECAST_CONFIDENCE.map((entry, i) => {
                    const color = entry.confidence >= 80 ? '#ef4444' : entry.confidence >= 60 ? '#f59e0b' : '#22d3ee';
                    return <Cell key={i} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="flex items-start gap-2.5 px-1">
        <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Final performance will be established using held-out test data from the selected network intrusion datasets.
        </p>
      </div>

      <Panel title="Illustrative Confusion Matrix" icon={<Grid3x3 className="w-4 h-4" />}>
        <div className="flex items-start gap-2.5 mb-4">
          <Info className="w-3.5 h-3.5 text-amber-500/70 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Example evaluation visualization — values shown for prototype demonstration only.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="grid grid-cols-3 gap-1 max-w-sm mx-auto">
            <div className="text-center text-[10px] text-slate-500 p-2"></div>
            <div className="text-center text-[10px] text-slate-400 p-2 font-semibold">Predicted Threat</div>
            <div className="text-center text-[10px] text-slate-400 p-2 font-semibold">Predicted Normal</div>

            <div className="text-center text-[10px] text-slate-400 p-2 font-semibold flex items-center justify-center">Actual Threat</div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-2xl font-bold text-green-400 tabular-nums">{cm.truePositive}</p>
              <p className="text-[9px] text-slate-400 mt-1">True Positive</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{cm.falseNegative}</p>
              <p className="text-[9px] text-slate-400 mt-1">False Negative</p>
            </div>

            <div className="text-center text-[10px] text-slate-400 p-2 font-semibold flex items-center justify-center">Actual Normal</div>
            <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{cm.falsePositive}</p>
              <p className="text-[9px] text-slate-400 mt-1">False Positive</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-2xl font-bold text-green-400 tabular-nums">{cm.trueNegative}</p>
              <p className="text-[9px] text-slate-400 mt-1">True Negative</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center p-4 rounded-lg bg-soc-panel/40 border border-soc-border/50">
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                Derived statistics (Accuracy, Precision, Recall, Total Samples) are intentionally omitted.
                Final values will be computed from real test-set results after model training.
              </p>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
