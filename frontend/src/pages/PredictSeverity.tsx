import React, { useState } from 'react';
import type { PredictionResult } from '../types';
import type { NavTab } from '../components/Navbar';
import { 
  BrainCircuit, ShieldCheck, AlertTriangle, Skull, 
  HelpCircle, SlidersHorizontal, RefreshCw, ChevronRight
} from 'lucide-react';

interface PredictSeverityProps {
  setActiveTab: (tab: NavTab) => void;
  setLastPredictionInput?: (data: any) => void;
}

export const PredictSeverity: React.FC<PredictSeverityProps> = ({ setActiveTab, setLastPredictionInput }) => {
  const [formData, setFormData] = useState({
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.076,
    longitude: 72.877,
    hour: 21,
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
    festival: 'None',
    model_name: 'Random Forest'
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'day_of_week') {
        updated.is_weekend = (value === 'Saturday' || value === 'Sunday') ? 1 : 0;
      }
      if (field === 'hour') {
        const h = parseInt(value);
        updated.is_peak_hour = ((h >= 8 && h <= 10) || (h >= 17 && h <= 20)) ? 1 : 0;
      }
      return updated;
    });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Prediction API failed');
      const data = await res.json();
      setResult(data);
      if (setLastPredictionInput) {
        setLastPredictionInput(formData);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'MINOR':
        return {
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60 shadow-emerald-500/20',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
          desc: 'Low structural impact predicted. Minor injuries expected.'
        };
      case 'MAJOR':
        return {
          color: 'text-amber-400 border-amber-500/40 bg-amber-950/60 shadow-amber-500/20',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          desc: 'High impact collision likely. Significant medical intervention needed.'
        };
      case 'FATAL':
        return {
          color: 'text-rose-400 border-rose-500/40 bg-rose-950/60 shadow-rose-500/20',
          icon: <Skull className="w-8 h-8 text-rose-400" />,
          desc: 'Critical risk of life-threatening severity. Emergency priority.'
        };
      default:
        return {
          color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/60',
          icon: <BrainCircuit className="w-8 h-8 text-cyan-400" />,
          desc: 'Prediction output generated.'
        };
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-cyan-400" />
          <span>Accident Severity Prediction</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium">
          Multi-class severity classification powered by Dataset 1 ML Pipeline (Minor / Major / Fatal)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT FORM */}
        <form onSubmit={handlePredict} className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-lg font-bold text-white">Scenario Parameters</h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              Data Leakage Protected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Model Selection */}
            <div className="col-span-2">
              <label className="block text-gray-300 font-semibold mb-1">Select ML Classifier Model</label>
              <select
                value={formData.model_name}
                onChange={(e) => handleChange('model_name', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2.5 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Random Forest">Random Forest (🏆 Selected Best Model)</option>
                <option value="Logistic Regression">Logistic Regression (Interpretable Baseline)</option>
                <option value="Decision Tree">Decision Tree Classifier</option>
                <option value="XGBoost">XGBoost Classifier</option>
                <option value="LightGBM">LightGBM Classifier</option>
              </select>
            </div>

            {/* City & State */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">City</label>
              <select
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">State</label>
              <select
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Weather & Visibility */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Weather Condition</label>
              <select
                value={formData.weather}
                onChange={(e) => handleChange('weather', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="clear">Clear</option>
                <option value="rain">Rain</option>
                <option value="fog">Fog</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Visibility Level</label>
              <select
                value={formData.visibility}
                onChange={(e) => handleChange('visibility', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="high">High Visibility</option>
                <option value="medium">Medium Visibility</option>
                <option value="low">Low Visibility</option>
              </select>
            </div>

            {/* Road Type & Lanes */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Road Infrastructure Type</label>
              <select
                value={formData.road_type}
                onChange={(e) => handleChange('road_type', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="highway">Highway</option>
                <option value="urban">Urban Arterial</option>
                <option value="rural">Rural Road</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Number of Lanes</label>
              <select
                value={formData.lanes}
                onChange={(e) => handleChange('lanes', parseInt(e.target.value))}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 6].map(l => (
                  <option key={l} value={l}>{l} Lane{l > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Traffic Density & Cause */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Traffic Density</label>
              <select
                value={formData.traffic_density}
                onChange={(e) => handleChange('traffic_density', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="low">Low Density</option>
                <option value="medium">Medium Density</option>
                <option value="high">High Density</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Accident Primary Cause</label>
              <select
                value={formData.cause}
                onChange={(e) => handleChange('cause', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="overspeeding">Overspeeding</option>
                <option value="distraction">Distraction / Mobile</option>
                <option value="weather">Weather Hazards</option>
                <option value="drunk_driving">Drunk Driving</option>
                <option value="mechanical_failure">Mechanical Failure</option>
              </select>
            </div>

            {/* Time & Day */}
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Time of Day: {formData.hour}:00</label>
              <input
                type="range"
                min="0"
                max="23"
                value={formData.hour}
                onChange={(e) => handleChange('hour', e.target.value)}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Day of Week</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => handleChange('day_of_week', e.target.value)}
                className="w-full bg-slate-900/90 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 focus:border-cyan-500 focus:outline-none"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running Trained Model Pipeline...</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5" />
                <span>Generate Severity Prediction</span>
              </>
            )}
          </button>
        </form>

        {/* OUTPUT PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-6 min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white">Prediction Output</h3>
                {result && (
                  <span className="text-[11px] text-gray-400 font-medium">
                    Engine: <strong className="text-cyan-400">{result.model_used}</strong>
                  </span>
                )}
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-3">
                  <BrainCircuit className="w-12 h-12 text-gray-600" />
                  <p className="text-sm font-medium">
                    Adjust scenario parameters and click "Generate Severity Prediction" to evaluate the trained model.
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* PREDICTED SEVERITY BADGE */}
                  {(() => {
                    const badge = getSeverityBadge(result.predicted_severity);
                    return (
                      <div className={`p-5 rounded-2xl border ${badge.color} shadow-lg flex items-center gap-4`}>
                        {badge.icon}
                        <div>
                          <div className="text-xs uppercase tracking-wider font-semibold opacity-80">Predicted Severity Class</div>
                          <div className="text-3xl font-black">{result.predicted_severity}</div>
                          <div className="text-xs opacity-90 mt-0.5">{badge.desc}</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PROBABILITY DISTRIBUTION BARS */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Model Class Probabilities</h4>

                    {/* Minor Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-400">Minor Severity</span>
                        <span className="text-emerald-400 font-bold">{result.probabilities.minor}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-gray-800">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${result.probabilities.minor}%` }}
                        />
                      </div>
                    </div>

                    {/* Major Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-amber-400">Major Severity</span>
                        <span className="text-amber-400 font-bold">{result.probabilities.major}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-gray-800">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${result.probabilities.major}%` }}
                        />
                      </div>
                    </div>

                    {/* Fatal Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-rose-400">Fatal Severity</span>
                        <span className="text-rose-400 font-bold">{result.probabilities.fatal}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-gray-800">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${result.probabilities.fatal}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            {result && (
              <div className="pt-4 border-t border-gray-800 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('explain')}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700/60 text-purple-300 font-semibold text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>Explain Why Model Made This Prediction (SHAP)</span>
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('whatif')}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 font-semibold text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                    <span>Simulate What-If Changes for This Scenario</span>
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
