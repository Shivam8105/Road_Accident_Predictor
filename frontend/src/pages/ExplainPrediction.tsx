import React, { useState, useEffect } from 'react';
import type { SHAPExplanation, GlobalSHAPItem } from '../types';
import { 
  HelpCircle, TrendingUp, TrendingDown, RefreshCw, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ExplainPrediction: React.FC = () => {
  const [sampleInput] = useState({
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.076,
    longitude: 72.877,
    hour: 22,
    day_of_week: 'Friday',
    is_weekend: 0,
    road_type: 'highway',
    lanes: 4,
    traffic_signal: 0,
    weather: 'rain',
    visibility: 'low',
    temperature: 26,
    traffic_density: 'high',
    cause: 'overspeeding',
    is_peak_hour: 1,
    festival: 'None'
  });

  const [shapData, setShapData] = useState<SHAPExplanation | null>(null);
  const [globalShap, setGlobalShap] = useState<GlobalSHAPItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExplanations();
  }, []);

  const fetchExplanations = async () => {
    setLoading(true);
    try {
      const [resInd, resGlobal] = await Promise.all([
        fetch('/api/ml/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sampleInput)
        }).then(r => r.json()),
        fetch('/api/ml/global-shap').then(r => r.json())
      ]);

      setShapData(resInd);
      setGlobalShap(resGlobal.importances ? resGlobal.importances.slice(0, 10) : []);
    } catch (e) {
      console.error('Error fetching SHAP explanations:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !shapData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-300 font-medium text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Computing SHAP feature attributions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
          <HelpCircle className="w-6 h-6 text-indigo-400" />
          <span>SHAP Feature Attribution Analysis</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Feature importance & individual prediction attributions computed directly from model coefficients and SHAP values.
        </p>
      </div>

      {/* INDIVIDUAL EXPLANATION SECTION */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Local Prediction Explanation</h3>
            <p className="text-xs text-slate-400">Feature impact scores for the active scenario</p>
          </div>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Model: {shapData.model_used}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* INCREASING FACTORS */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Factors Increasing Predicted Severity</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {shapData.increasing_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DECREASING FACTORS */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span>Factors Decreasing Predicted Severity</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {shapData.decreasing_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FEATURE ATTRIBUTION IMPACT BARS */}
        <div className="space-y-2 pt-1">
          <h4 className="text-xs font-semibold text-slate-300">Feature Contribution Impact Scores</h4>
          <div className="space-y-1.5">
            {shapData.top_contributions.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="font-mono text-slate-300">
                  {item.feature.replace('cat__', '').replace('num__', '').replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className={`font-bold ${item.impact > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {item.impact > 0 ? `+${item.impact}` : item.impact}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    item.impact > 0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {item.impact > 0 ? 'High Severity Risk' : 'Risk Moderation'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GLOBAL FEATURE IMPORTANCE CHART */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Global Feature Importance Ranking</span>
            </h3>
            <p className="text-xs text-slate-400">Features with highest mean impact across Dataset 1</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={globalShap} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis 
                type="category" 
                dataKey="feature" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickFormatter={(val) => val.replace('cat__', '').replace('num__', '').replace('_', ' ')}
              />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
              <Bar dataKey="importance" name="Global Importance" radius={[0, 4, 4, 0]}>
                {globalShap.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981'][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
