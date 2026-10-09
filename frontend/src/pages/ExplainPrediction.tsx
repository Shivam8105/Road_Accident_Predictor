import React, { useState, useEffect } from 'react';
import type { SHAPExplanation, GlobalSHAPItem } from '../types';
import { 
  HelpCircle, TrendingUp, TrendingDown, RefreshCw, BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { safeFetchJson, FALLBACK_SHAP_EXPLANATION, FALLBACK_GLOBAL_SHAP } from '../api/client';

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

  const [shapData, setShapData] = useState<SHAPExplanation>(FALLBACK_SHAP_EXPLANATION);
  const [globalShap, setGlobalShap] = useState<GlobalSHAPItem[]>(FALLBACK_GLOBAL_SHAP);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExplanations();
  }, []);

  const fetchExplanations = async () => {
    setLoading(true);
    try {
      const [resInd, resGlobal] = await Promise.all([
        safeFetchJson<SHAPExplanation>(
          '/api/ml/explain',
          {
            method: 'POST',
            body: JSON.stringify(sampleInput)
          },
          FALLBACK_SHAP_EXPLANATION
        ),
        safeFetchJson<any>(
          '/api/ml/global-shap',
          undefined,
          { importances: FALLBACK_GLOBAL_SHAP }
        )
      ]);

      if (resInd && resInd.increasing_factors) {
        setShapData(resInd);
      }
      if (resGlobal && Array.isArray(resGlobal.importances)) {
        setGlobalShap(resGlobal.importances.slice(0, 10));
      }
    } catch (e) {
      console.error('Error fetching SHAP explanations:', e);
      setShapData(FALLBACK_SHAP_EXPLANATION);
      setGlobalShap(FALLBACK_GLOBAL_SHAP);
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

        {/* FEATURE ATTRIBUTION IMPACT BARS WITH PROGRESS METERS */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Feature Contribution Impact Meters</h4>
          <div className="space-y-2.5">
            {shapData.top_contributions.map((item, idx) => {
              const absVal = Math.min(100, Math.abs(item.impact * 25));
              const isPositive = item.impact > 0;
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-200 font-semibold">
                      {item.feature.replace('cat__', '').replace('num__', '').replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold font-mono ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {isPositive ? `+${item.impact}` : item.impact}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isPositive ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      }`}>
                        {isPositive ? 'Increases Risk' : 'Reduces Risk'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isPositive ? 'bg-gradient-to-r from-rose-600 to-red-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      }`}
                      style={{ width: `${Math.max(15, absVal)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GLOBAL FEATURE IMPORTANCE CHART */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Global Feature Importance Ranking (Dataset 1 Benchmark)</span>
            </h3>
            <p className="text-xs text-slate-400">Aggregated Shapley value magnitudes across 20,000 incident samples</p>
          </div>
          <span className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-xl border border-indigo-800/60">
            SHAP Summary
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height={290} minHeight={290}>
            <BarChart data={globalShap} layout="vertical" margin={{ top: 10, right: 30, left: 110, bottom: 10 }}>
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis 
                type="category" 
                dataKey="feature" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickFormatter={(val) => val.replace('cat__', '').replace('num__', '').replace('_', ' ')}
              />
              <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
              <Bar dataKey="importance" name="Global Importance" radius={[0, 6, 6, 0]}>
                {globalShap.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#10b981', '#3b82f6'][index % 6]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
