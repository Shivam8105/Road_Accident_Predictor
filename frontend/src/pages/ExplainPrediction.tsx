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
        <div className="flex items-center gap-3 text-purple-400 font-medium">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Computing SHAP Feature Attribution...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-purple-400" />
          <span>SHAP Explainable AI (XAI) Analysis</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium">
          Feature importance & individual prediction explanations computed directly from model coefficients and SHAP values.
        </p>
      </div>

      {/* INDIVIDUAL EXPLANATION SECTION */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Why Was This Prediction Made?</h3>
            <p className="text-xs text-gray-400">Individual feature attribution for the current accident scenario</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
            Model: {shapData.model_used}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INCREASING FACTORS (Positive SHAP) */}
          <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-3">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Factors Increasing Predicted Severity</span>
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {shapData.increasing_factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* DECREASING FACTORS (Negative SHAP) */}
          <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              <span>Factors Decreasing / Moderating Severity</span>
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
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
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Top Feature Impact Values</h4>
          <div className="space-y-2">
            {shapData.top_contributions.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/80 border border-gray-800">
                <span className="font-mono text-gray-300">
                  {item.feature.replace('cat__', '').replace('num__', '').replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${item.impact > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {item.impact > 0 ? `+${item.impact}` : item.impact}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    item.impact > 0 ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
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
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              <span>Global Feature Importance Across Dataset 1</span>
            </h3>
            <p className="text-xs text-gray-400">Features with highest mean absolute impact on accident severity model</p>
          </div>
        </div>

        <div className="h-80 w-full">
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
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} />
              <Bar dataKey="importance" name="Global Importance" radius={[0, 6, 6, 0]}>
                {globalShap.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#a855f7', '#8b5cf6', '#6366f1', '#06b6d4', '#10b981'][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
