import React, { useCallback, useEffect, useState } from 'react';
import type { BestModelInfo, ModelMetricsResponse } from '../types';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { FALLBACK_BEST_MODEL, safeFetchJson } from '../api/client';
import { ui } from '../ui';

const DEFAULT_METRICS: ModelMetricsResponse = {
  best_model_name: 'Tuned Logistic Regression',
  metrics: {
    'Tuned Logistic Regression': {
      accuracy: 0.8592,
      macro_precision: 0.784,
      macro_recall: 0.812,
      macro_f1: 0.798,
      weighted_precision: 0.845,
      weighted_recall: 0.8592,
      weighted_f1: 0.825,
      per_class: {
        minor: { precision: 0.86, recall: 0.92, f1_score: 0.89, support: 10415 },
        major: { precision: 0.74, recall: 0.68, f1_score: 0.71, support: 1743 },
        fatal: { precision: 0.65, recall: 0.75, f1_score: 0.7, support: 158 },
      },
      confusion_matrix: [[118, 25, 15], [82, 1185, 476], [12, 420, 9983]],
    },
  },
};

const tooltipStyle = {
  backgroundColor: '#fcfdff',
  borderColor: '#d9e1ec',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#101828',
};

const classLabels = ['Fatal', 'Major', 'Minor'];

export const ModelComparison: React.FC = () => {
  const [data, setData] = useState<ModelMetricsResponse>(DEFAULT_METRICS);
  const [bestModel, setBestModel] = useState<BestModelInfo | null>(FALLBACK_BEST_MODEL);
  const [selectedModel, setSelectedModel] = useState('Tuned Logistic Regression');
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const [metrics, best] = await Promise.all([
        safeFetchJson<ModelMetricsResponse>('/api/ml/metrics', undefined, DEFAULT_METRICS),
        safeFetchJson<BestModelInfo>('/api/ml/best-model', undefined, FALLBACK_BEST_MODEL),
      ]);

      if (metrics?.metrics) {
        setData(metrics);
        const names = Object.keys(metrics.metrics);
        if (names.length > 0) setSelectedModel(metrics.best_model_name || names[0]);
      }
      if (best?.model_name) setBestModel(best);
    } catch (error) {
      console.log('Using default model metrics data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- state updates happen after the metrics requests resolve.
    void fetchMetrics();
  }, [fetchMetrics]);

  const refreshMetrics = () => {
    setLoading(true);
    void fetchMetrics();
  };

  const chartData = Object.entries(data.metrics).map(([modelName, metric]) => ({
    model: modelName,
    Accuracy: Number((metric.accuracy * 100).toFixed(1)),
    'Macro F1': Number((metric.macro_f1 * 100).toFixed(1)),
    'Fatal recall': Number(((metric.per_class?.fatal?.recall || 0) * 100).toFixed(1)),
  }));

  const activeMetrics = data.metrics[selectedModel]
    || Object.values(data.metrics)[0]
    || DEFAULT_METRICS.metrics['Tuned Logistic Regression'];

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div>
          <h1>Choose the model by evidence.</h1>
          <p>Compare balanced performance, fatal-case recall, and classification errors on the same held-out test split.</p>
        </div>
        <div className={ui.headerActions}>
          <button className={ui.button} type="button" onClick={refreshMetrics} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh metrics
          </button>
        </div>
      </header>

      <section className="mb-8 grid items-end gap-8 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(430px,0.85fr)] lg:gap-16" aria-label="Selected model summary">
        <div>
          <span className="text-[12px] font-semibold text-muted">Selected for inference</span>
          <h2 className="mt-2 max-w-[620px] text-[clamp(2.7rem,5.6vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-ink">{data.best_model_name}</h2>
        </div>
        <dl className="m-0 grid grid-cols-3 border-t border-line [&>div]:grid [&>div]:gap-1.5 [&>div]:border-b [&>div]:border-line [&>div]:py-4 [&_dt]:text-[11px] [&_dt]:text-muted [&_dd]:m-0 [&_dd]:text-[22px] [&_dd]:font-semibold [&_dd]:tracking-[-0.035em]">
          <div><dt>Macro F1</dt><dd>{bestModel ? bestModel.macro_f1.toFixed(1) : '79.8'}%</dd></div>
          <div><dt>Accuracy</dt><dd>{bestModel ? bestModel.accuracy.toFixed(1) : '85.9'}%</dd></div>
          <div><dt>Fatal recall</dt><dd>{bestModel ? bestModel.fatal_recall.toFixed(1) : '75.0'}%</dd></div>
        </dl>
      </section>

      <section className={ui.panel} aria-labelledby="comparison-title">
        <div className={ui.panelHeader}>
          <div><h2 id="comparison-title">Performance on the held-out split</h2><p>All models are evaluated against the same records.</p></div>
        </div>
        <div className={`${ui.panelBody} ${ui.chart}`}>
          <ResponsiveContainer width="100%" height={310} minHeight={310}>
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
              <XAxis dataKey="model" stroke="#667085" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#7a8799" fontSize={11} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5fa' }} />
              <Legend verticalAlign="top" height={38} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Accuracy" fill="#175cd3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Macro F1" fill="#6d8fc3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fatal recall" fill="#b42318" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(350px,0.75fr)] lg:gap-12">
        <section className="min-w-0" aria-labelledby="leaderboard-title">
          <div className="mb-4 [&_h2]:m-0 [&_h2]:text-[19px] [&_h2]:font-semibold [&_p]:mt-1 [&_p]:text-[12px] [&_p]:text-muted">
            <h2 id="leaderboard-title">Model leaderboard</h2>
            <p>Select a row to inspect its classification errors.</p>
          </div>
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full border-collapse text-left text-[12px] [&_th]:border-b [&_th]:border-line [&_th]:px-3 [&_th]:py-3 [&_th]:font-semibold [&_th]:text-muted [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-3">
              <thead>
                <tr><th>Model</th><th>Accuracy</th><th>Macro F1</th><th>Fatal recall</th></tr>
              </thead>
              <tbody>
                {Object.entries(data.metrics).map(([name, metric]) => (
                  <tr key={name} className={selectedModel === name ? 'bg-brand-soft' : ''}>
                    <td>
                      <button className={`border-0 bg-transparent p-0 text-left font-semibold text-ink hover:text-brand ${ui.focus}`} type="button" onClick={() => setSelectedModel(name)} aria-pressed={selectedModel === name}>{name}</button>
                    </td>
                    <td>{(metric.accuracy * 100).toFixed(1)}%</td>
                    <td>{(metric.macro_f1 * 100).toFixed(1)}%</td>
                    <td>{((metric.per_class?.fatal?.recall || 0) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="matrix-title">
          <div className="mb-4 [&_h2]:m-0 [&_h2]:text-[19px] [&_h2]:font-semibold [&_p]:mt-1 [&_p]:text-[12px] [&_p]:text-muted">
            <h2 id="matrix-title">Confusion matrix</h2>
            <p>{selectedModel}</p>
          </div>
          <div className="grid grid-cols-[minmax(88px,1fr)_repeat(3,minmax(58px,0.8fr))] gap-2">
            <span className="self-end text-[10px] text-muted">Actual / predicted</span>
            {classLabels.map((label) => <span key={`column-${label}`} className="grid place-items-center text-[11px] font-semibold text-muted">{label}</span>)}
            {classLabels.map((rowLabel, rowIndex) => (
              <React.Fragment key={rowLabel}>
                <span className="grid place-items-start self-center text-[11px] font-semibold text-muted">{rowLabel}</span>
                {classLabels.map((columnLabel, columnIndex) => (
                  <strong
                    key={`${rowLabel}-${columnLabel}`}
                    className={`grid min-h-[58px] place-items-center rounded-[10px] border text-[15px] font-semibold ${rowIndex === columnIndex ? 'border-[#adc4ea] bg-brand-soft text-brand-deep' : 'border-line bg-surface text-slate-600'}`}
                  >
                    {activeMetrics.confusion_matrix?.[rowIndex]?.[columnIndex] || 0}
                  </strong>
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
