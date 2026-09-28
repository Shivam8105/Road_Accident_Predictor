import React, { useEffect, useState } from 'react';
import type { ModelMetricsResponse, BestModelInfo } from '../types';
import { Award, BarChart2, Grid3X3, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DEFAULT_METRICS: ModelMetricsResponse = {
  best_model_name: "Random Forest",
  metrics: {
    "Logistic Regression": {
      accuracy: 0.2983,
      macro_precision: 0.3252,
      macro_recall: 0.3221,
      macro_f1: 0.2886,
      weighted_precision: 0.4085,
      weighted_recall: 0.2983,
      weighted_f1: 0.3155,
      per_class: {
        minor: { precision: 0.5479, recall: 0.2540, f1_score: 0.3471, support: 2205 },
        major: { precision: 0.2834, recall: 0.3456, f1_score: 0.3114, support: 1198 },
        fatal: { precision: 0.1444, recall: 0.3668, f1_score: 0.2072, support: 597 }
      },
      confusion_matrix: [[560, 816, 829], [315, 414, 469], [147, 231, 219]]
    },
    "Decision Tree": {
      accuracy: 0.3103,
      macro_precision: 0.3463,
      macro_recall: 0.3507,
      macro_f1: 0.3051,
      weighted_precision: 0.4269,
      weighted_recall: 0.3103,
      weighted_f1: 0.3276,
      per_class: {
        minor: { precision: 0.5529, recall: 0.2585, f1_score: 0.3523, support: 2205 },
        major: { precision: 0.3297, recall: 0.3280, f1_score: 0.3289, support: 1198 },
        fatal: { precision: 0.1564, recall: 0.4657, f1_score: 0.2342, support: 597 }
      },
      confusion_matrix: [[570, 645, 990], [296, 393, 509], [165, 154, 278]]
    },
    "Random Forest": {
      accuracy: 0.4625,
      macro_precision: 0.3286,
      macro_recall: 0.3306,
      macro_f1: 0.3198,
      weighted_precision: 0.4127,
      weighted_recall: 0.4625,
      weighted_f1: 0.4298,
      per_class: {
        minor: { precision: 0.5503, recall: 0.6893, f1_score: 0.6120, support: 2205 },
        major: { precision: 0.2950, recall: 0.2487, f1_score: 0.2699, support: 1198 },
        fatal: { precision: 0.1404, recall: 0.0536, f1_score: 0.0776, support: 597 }
      },
      confusion_matrix: [[1520, 561, 124], [828, 298, 72], [414, 151, 32]]
    },
    "XGBoost": {
      accuracy: 0.5433,
      macro_precision: 0.3103,
      macro_recall: 0.3342,
      macro_f1: 0.2566,
      weighted_precision: 0.4081,
      weighted_recall: 0.5433,
      weighted_f1: 0.4072,
      per_class: {
        minor: { precision: 0.5532, recall: 0.9660, f1_score: 0.7036, support: 2205 },
        major: { precision: 0.3111, recall: 0.0351, f1_score: 0.0630, support: 1198 },
        fatal: { precision: 0.0667, recall: 0.0017, f1_score: 0.0033, support: 597 }
      },
      confusion_matrix: [[2130, 65, 10], [1152, 42, 4], [568, 28, 1]]
    },
    "LightGBM": {
      accuracy: 0.3182,
      macro_precision: 0.3263,
      macro_recall: 0.3210,
      macro_f1: 0.2990,
      weighted_precision: 0.4095,
      weighted_recall: 0.3182,
      weighted_f1: 0.3421,
      per_class: {
        minor: { precision: 0.5440, recall: 0.3283, f1_score: 0.4095, support: 2205 },
        major: { precision: 0.2979, recall: 0.2830, f1_score: 0.2902, support: 1198 },
        fatal: { precision: 0.1372, recall: 0.3518, f1_score: 0.1974, support: 597 }
      },
      confusion_matrix: [[724, 762, 719], [403, 339, 456], [204, 183, 210]]
    }
  }
};

export const ModelComparison: React.FC = () => {
  const [data, setData] = useState<ModelMetricsResponse>(DEFAULT_METRICS);
  const [bestModel, setBestModel] = useState<BestModelInfo | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("Random Forest");

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [resMetrics, resBest] = await Promise.all([
        fetch('/api/ml/metrics').then(r => r.json()),
        fetch('/api/ml/best-model').then(r => r.json())
      ]);
      if (resMetrics?.metrics) setData(resMetrics);
      if (resBest?.model_name) setBestModel(resBest);
    } catch (e) {
      console.log('Using default model comparison data:', e);
    }
  };

  const chartData = Object.entries(data.metrics).map(([modelName, m]) => ({
    model: modelName,
    Accuracy: Number((m.accuracy * 100).toFixed(1)),
    'Macro F1': Number((m.macro_f1 * 100).toFixed(1)),
    'Fatal Recall': Number(((m.per_class?.fatal?.recall || 0) * 100).toFixed(1))
  }));

  const activeMetrics = data.metrics[selectedModel] || data.metrics['Random Forest'];

  return (
    <div className="space-y-6 py-2">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
          <Award className="w-6 h-6 text-indigo-400" />
          <span>Model Benchmark Evaluation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Comparative performance evaluation of 5 classification models on the 20% test split (Dataset 1)
        </p>
      </div>

      {/* BEST MODEL HIGHLIGHT */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Selected Primary Inference Model</div>
            <div className="text-lg font-bold text-slate-100">{data.best_model_name} Classifier</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">Macro F1</span>
            <span className="font-bold text-indigo-400">
              {bestModel ? `${(bestModel.macro_f1 * 100).toFixed(1)}%` : '32.0%'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Accuracy</span>
            <span className="font-bold text-slate-200">
              {bestModel ? `${(bestModel.accuracy * 100).toFixed(1)}%` : '46.3%'}
            </span>
          </div>
        </div>
      </div>

      {/* COMPARISON BAR CHART */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Algorithm Metrics Comparison</span>
          </h3>
          <span className="text-xs text-slate-400">Test Set Evaluation</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
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
        {/* MODEL SELECTOR TABLE */}
        <div className="lg:col-span-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Evaluated Models Summary</h3>
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
              <div className="text-emerald-400 font-bold">Minor</div>
              <div className="text-amber-400 font-bold">Major</div>
              <div className="text-rose-400 font-bold">Fatal</div>

              <div className="text-emerald-400 font-bold self-center text-left">Minor</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-bold">{activeMetrics.confusion_matrix?.[0]?.[0] || 0}</div>
              <div className="p-2 rounded bg-slate-900/60 text-slate-400">{activeMetrics.confusion_matrix?.[0]?.[1] || 0}</div>
              <div className="p-2 rounded bg-slate-900/60 text-slate-400">{activeMetrics.confusion_matrix?.[0]?.[2] || 0}</div>

              <div className="text-amber-400 font-bold self-center text-left">Major</div>
              <div className="p-2 rounded bg-slate-900/60 text-slate-400">{activeMetrics.confusion_matrix?.[1]?.[0] || 0}</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-bold">{activeMetrics.confusion_matrix?.[1]?.[1] || 0}</div>
              <div className="p-2 rounded bg-slate-900/60 text-slate-400">{activeMetrics.confusion_matrix?.[1]?.[2] || 0}</div>

              <div className="text-rose-400 font-bold self-center text-left">Fatal</div>
              <div className="p-2 rounded bg-slate-900/60 text-slate-400">{activeMetrics.confusion_matrix?.[2]?.[0] || 0}</div>
              <div className="p-2 rounded bg-slate-900/60 text-slate-400">{activeMetrics.confusion_matrix?.[2]?.[1] || 0}</div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 font-bold">{activeMetrics.confusion_matrix?.[2]?.[2] || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
