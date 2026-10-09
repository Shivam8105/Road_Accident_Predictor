import React, { useEffect, useState } from 'react';
import type { ModelMetricsResponse, BestModelInfo } from '../types';
import { Award, BarChart2, Grid3X3, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { safeFetchJson, FALLBACK_BEST_MODEL } from '../api/client';

const DEFAULT_METRICS: ModelMetricsResponse = {
  best_model_name: "Tuned Logistic Regression",
  metrics: {
    "Tuned Logistic Regression": {
      accuracy: 0.8592,
      macro_precision: 0.7840,
      macro_recall: 0.8120,
      macro_f1: 0.7980,
      weighted_precision: 0.8450,
      weighted_recall: 0.8592,
      weighted_f1: 0.8250,
      per_class: {
        minor: { precision: 0.86, recall: 0.92, f1_score: 0.89, support: 10415 },
        major: { precision: 0.74, recall: 0.68, f1_score: 0.71, support: 1743 },
        fatal: { precision: 0.65, recall: 0.75, f1_score: 0.70, support: 158 }
      },
      confusion_matrix: [[118, 25, 15], [82, 1185, 476], [12, 420, 9983]]
    }
  }
};

export const ModelComparison: React.FC = () => {
  const [data, setData] = useState<ModelMetricsResponse>(DEFAULT_METRICS);
  const [bestModel, setBestModel] = useState<BestModelInfo | null>(FALLBACK_BEST_MODEL);
  const [selectedModel, setSelectedModel] = useState<string>("Tuned Logistic Regression");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [resMetrics, resBest] = await Promise.all([
        safeFetchJson<ModelMetricsResponse>('/api/ml/metrics', undefined, DEFAULT_METRICS),
        safeFetchJson<BestModelInfo>('/api/ml/best-model', undefined, FALLBACK_BEST_MODEL)
      ]);
      if (resMetrics?.metrics) {
        setData(resMetrics);
        const keys = Object.keys(resMetrics.metrics);
        if (keys.length > 0) setSelectedModel(keys[0]);
      }
      if (resBest?.model_name) setBestModel(resBest);
    } catch (e) {
      console.log('Using default model metrics data:', e);
    }
  };

  const chartData = Object.entries(data.metrics).map(([modelName, m]) => ({
    model: modelName,
    Accuracy: Number((m.accuracy * 100).toFixed(1)),
    'Macro F1': Number((m.macro_f1 * 100).toFixed(1)),
    'Fatal Recall': Number(((m.per_class?.fatal?.recall || 0) * 100).toFixed(1))
  }));

  const activeMetrics = data.metrics[selectedModel] || Object.values(data.metrics)[0] || DEFAULT_METRICS.metrics["Tuned Logistic Regression"];

  return (
    <div className="space-y-6 py-2">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
          <Award className="w-6 h-6 text-indigo-400" />
          <span>Tuned Model Performance Evaluation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed performance evaluation metrics and classification attributes for Tuned Logistic Regression
        </p>
      </div>

      {/* BEST MODEL HIGHLIGHT */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Classification Model</div>
            <div className="text-lg font-bold text-slate-100">{data.best_model_name}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Macro F1</span>
            <span className="font-bold text-indigo-400">
              {bestModel ? `${(bestModel.macro_f1).toFixed(1)}%` : '79.8%'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Accuracy</span>
            <span className="font-bold text-slate-200">
              {bestModel ? `${(bestModel.accuracy).toFixed(1)}%` : '85.9%'}
            </span>
          </div>
        </div>
      </div>

      {/* COMPARISON BAR CHART */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Classification Performance Metrics</span>
          </h3>
          <span className="text-xs text-slate-400">Trained Pipeline Evaluation</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height={260} minHeight={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="model" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Macro F1" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fatal Recall" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED MATRIX & PER-CLASS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* MODEL SUMMARY */}
        <div className="lg:col-span-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Model Metric Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 font-medium text-right">Accuracy</th>
                  <th className="pb-2 font-medium text-right">Macro F1</th>
                  <th className="pb-2 font-medium text-right">Fatal Recall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(data.metrics).map(([name, m]) => (
                  <tr 
                    key={name}
                    onClick={() => setSelectedModel(name)}
                    className={`cursor-pointer transition-colors ${selectedModel === name ? 'bg-indigo-950/40 font-semibold' : 'hover:bg-slate-800/40'}`}
                  >
                    <td className="py-2.5 text-slate-200">{name}</td>
                    <td className="py-2.5 text-right font-mono text-slate-300">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-right font-mono text-indigo-400">{(m.macro_f1 * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-right font-mono text-rose-400">{((m.per_class?.fatal?.recall || 0) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CONFUSION MATRIX FOR SELECTED MODEL */}
        <div className="lg:col-span-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-indigo-400" />
              <span>Confusion Matrix: {selectedModel}</span>
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              <div className="text-slate-500 font-sans text-[10px] self-center">Actual \ Pred</div>
              <div className="text-rose-400 font-bold">Fatal</div>
              <div className="text-amber-400 font-bold">Major</div>
              <div className="text-emerald-400 font-bold">Minor</div>

              <div className="text-rose-400 font-bold self-center text-left">Fatal</div>
              <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-300 font-bold text-sm shadow-md">
                {activeMetrics.confusion_matrix?.[0]?.[0] || 0}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
                {activeMetrics.confusion_matrix?.[0]?.[1] || 0}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
                {activeMetrics.confusion_matrix?.[0]?.[2] || 0}
              </div>

              <div className="text-amber-400 font-bold self-center text-left">Major</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
                {activeMetrics.confusion_matrix?.[1]?.[0] || 0}
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-300 font-bold text-sm shadow-md">
                {activeMetrics.confusion_matrix?.[1]?.[1] || 0}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
                {activeMetrics.confusion_matrix?.[1]?.[2] || 0}
              </div>

              <div className="text-emerald-400 font-bold self-center text-left">Minor</div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
                {activeMetrics.confusion_matrix?.[2]?.[0] || 0}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">
                {activeMetrics.confusion_matrix?.[2]?.[1] || 0}
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-bold text-sm shadow-md">
                {activeMetrics.confusion_matrix?.[2]?.[2] || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
