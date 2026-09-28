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
          color: 'text-emerald-400 border-emerald-800 bg-emerald-950/60 shadow-lg shadow-emerald-600/20',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
          desc: 'Low structural impact predicted. Minor injuries expected.'
        };
      case 'MAJOR':
        return {
          color: 'text-amber-400 border-amber-800 bg-amber-950/60 shadow-lg shadow-amber-600/20',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          desc: 'High impact collision likely. Significant medical intervention required.'
        };
      case 'FATAL':
        return {
          color: 'text-red-400 border-red-800 bg-red-950/60 shadow-lg shadow-red-600/30',
          icon: <Skull className="w-8 h-8 text-red-400" />,
          desc: 'Critical risk of life-threatening severity. Emergency priority.'
        };
      default:
        return {
          color: 'text-slate-300 border-white/10 bg-black/60',
          icon: <BrainCircuit className="w-8 h-8 text-red-500" />,
          desc: 'Prediction output generated.'
        };
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="border-b border-white/10 pb-4">
        <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
          <BrainCircuit className="w-6 h-6 text-red-500" />
          <span>Accident Severity Predictor</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Multiclass severity classification powered by Dataset 1 ML Pipeline (Minor / Major / Fatal)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT FORM */}
        <form onSubmit={handlePredict} className="lg:col-span-7 glass-card p-6 rounded-3xl border border-red-500/20 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white">Scenario Input Parameters</h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-800">
              ML Inference Pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Model Selection */}
            <div className="col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Select Classifier Model</label>
              <select
                value={formData.model_name}
                onChange={(e) => handleChange('model_name', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="Random Forest">Random Forest (Selected Primary Model)</option>
                <option value="Logistic Regression">Logistic Regression (Interpretable Baseline)</option>
                <option value="Decision Tree">Decision Tree Classifier</option>
                <option value="XGBoost">XGBoost Classifier</option>
                <option value="LightGBM">LightGBM Classifier</option>
              </select>
            </div>

            {/* City & State */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">City</label>
              <select
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">State</label>
              <select
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                {['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Weather & Visibility */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weather Condition</label>
              <select
                value={formData.weather}
                onChange={(e) => handleChange('weather', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="clear">Clear</option>
                <option value="rain">Rain</option>
                <option value="fog">Fog</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Visibility Level</label>
              <select
                value={formData.visibility}
                onChange={(e) => handleChange('visibility', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="high">High Visibility</option>
                <option value="medium">Medium Visibility</option>
                <option value="low">Low Visibility</option>
              </select>
            </div>

            {/* Road Type & Lanes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Road Infrastructure Type</label>
              <select
                value={formData.road_type}
                onChange={(e) => handleChange('road_type', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="highway">National / State Highway</option>
                <option value="expressway">Expressway</option>
                <option value="urban">Urban Street</option>
                <option value="rural">Rural Road</option>
                <option value="intersection">Junction / Intersection</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Number of Lanes ({formData.lanes})</label>
              <input
                type="range"
                min="1"
                max="6"
                value={formData.lanes}
                onChange={(e) => handleChange('lanes', parseInt(e.target.value))}
                className="w-full accent-red-500 cursor-pointer mt-1"
              />
            </div>

            {/* Hour of Day & Day of Week */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hour of Day ({formData.hour}:00)</label>
              <input
                type="range"
                min="0"
                max="23"
                value={formData.hour}
                onChange={(e) => handleChange('hour', parseInt(e.target.value))}
                className="w-full accent-red-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Day of Week</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => handleChange('day_of_week', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Traffic Density & Primary Cause */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Traffic Density</label>
              <select
                value={formData.traffic_density}
                onChange={(e) => handleChange('traffic_density', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="low">Low Traffic</option>
                <option value="medium">Moderate Traffic</option>
                <option value="high">Heavy / Congested</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Cause</label>
              <select
                value={formData.cause}
                onChange={(e) => handleChange('cause', e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
              >
                <option value="overspeeding">Over-Speeding</option>
                <option value="drunk_driving">Drunk Driving</option>
                <option value="weather_conditions">Adverse Weather</option>
                <option value="mechanical_breakdown">Mechanical Breakdown</option>
                <option value="distracted_driving">Distracted Driving</option>
                <option value="sudden_braking">Sudden Braking</option>
              </select>
            </div>

            {/* Temperature */}
            <div className="col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Ambient Temperature ({formData.temperature}°C)</label>
              <input
                type="range"
                min="5"
                max="48"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', parseInt(e.target.value))}
                className="w-full accent-red-500 cursor-pointer mt-1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            <span>Run Severity Prediction Engine</span>
          </button>
        </form>

        {/* PREDICTION RESULT CARD */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="glass-card p-6 rounded-3xl border border-red-500/30 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-400">Prediction Output</span>
                <span className="text-[11px] font-mono text-red-400 font-bold">{result.model_used}</span>
              </div>

              {/* Severity Banner */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${getSeverityBadge(result.predicted_severity).color}`}>
                <div className="shrink-0 mt-0.5">
                  {getSeverityBadge(result.predicted_severity).icon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase opacity-80">Predicted Class</div>
                  <div className="font-heading text-2xl font-black tracking-tight">{result.predicted_severity} SEVERITY</div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{getSeverityBadge(result.predicted_severity).desc}</p>
                </div>
              </div>

              {/* Probability Bars */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-white">Model Class Probabilities</h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>Minor Injury Probability</span>
                      <span className="font-mono text-emerald-400">{result.probabilities.minor}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.probabilities.minor}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>Major Injury Probability</span>
                      <span className="font-mono text-amber-400">{result.probabilities.major}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.probabilities.major}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 font-bold mb-1">
                      <span>Fatal Severity Probability</span>
                      <span className="font-mono text-red-400">{result.probabilities.fatal}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                      <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.probabilities.fatal}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Jump Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <button
                  onClick={() => setActiveTab('whatif')}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-red-600/20 text-slate-200 hover:text-white font-bold flex items-center justify-between transition-colors border border-white/10"
                >
                  <span className="flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5 text-red-400" /> What-If</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => setActiveTab('explain')}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-red-600/20 text-slate-200 hover:text-white font-bold flex items-center justify-between transition-colors border border-white/10"
                >
                  <span className="flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5 text-red-400" /> SHAP XAI</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
              <BrainCircuit className="w-12 h-12 text-slate-700 animate-pulse" />
              <div className="font-heading text-base font-bold text-white">No Prediction Generated Yet</div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Select your scenario inputs on the left and click "Run Severity Prediction Engine".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
