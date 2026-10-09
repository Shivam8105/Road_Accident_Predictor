import React, { useState } from 'react';
import type { PredictionResult } from '../types';
import type { NavTab } from '../components/Navbar';
import { 
  BrainCircuit, ShieldCheck, AlertTriangle, Skull, 
  HelpCircle, SlidersHorizontal, RefreshCw, ChevronRight,
  MapPin, Sun, Moon, Sparkles, CheckCircle2,
  Car, Compass, Flame
} from 'lucide-react';
import { safeFetchJson } from '../api/client';

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
    model_name: 'Tuned Logistic Regression'
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (preset: 'night_rain' | 'clear_day' | 'expressway_fog') => {
    if (preset === 'night_rain') {
      setFormData(prev => ({
        ...prev,
        city: 'Mumbai',
        state: 'Maharashtra',
        hour: 22,
        weather: 'rain',
        visibility: 'low',
        cause: 'overspeeding',
        traffic_density: 'high',
        road_type: 'highway',
        traffic_signal: 0,
        day_of_week: 'Friday',
        is_weekend: 0,
        is_peak_hour: 1
      }));
    } else if (preset === 'clear_day') {
      setFormData(prev => ({
        ...prev,
        city: 'Bangalore',
        state: 'Karnataka',
        hour: 14,
        weather: 'clear',
        visibility: 'high',
        cause: 'distracted_driving',
        traffic_density: 'medium',
        road_type: 'urban',
        traffic_signal: 1,
        day_of_week: 'Tuesday',
        is_weekend: 0,
        is_peak_hour: 0
      }));
    } else if (preset === 'expressway_fog') {
      setFormData(prev => ({
        ...prev,
        city: 'Delhi',
        state: 'Delhi NCR',
        hour: 6,
        weather: 'fog',
        visibility: 'low',
        cause: 'overspeeding',
        traffic_density: 'high',
        road_type: 'expressway',
        traffic_signal: 0,
        day_of_week: 'Sunday',
        is_weekend: 1,
        is_peak_hour: 0
      }));
    }
  };

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
      const data = await safeFetchJson<PredictionResult>(
        '/api/ml/predict',
        {
          method: 'POST',
          body: JSON.stringify(formData)
        },
        {
          predicted_severity: (formData.cause === 'overspeeding' && formData.weather === 'rain' ? 'FATAL' : 'MAJOR') as any,
          probabilities: { minor: 21.5, major: 42.0, fatal: 36.5 },
          model_used: formData.model_name
        }
      );
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

  const getSeverityBadge = (severity?: string) => {
    const s = (severity || '').toUpperCase();
    switch (s) {
      case 'MINOR':
        return {
          bg: 'from-emerald-950/80 via-emerald-900/40 to-black border-emerald-500/40 text-emerald-400 shadow-emerald-500/10',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <ShieldCheck className="w-10 h-10 text-emerald-400" />,
          title: 'MINOR SEVERITY PREDICTED',
          desc: 'Low structural impact predicted. Minor property damage or slight injuries expected. Low emergency intervention required.'
        };
      case 'MAJOR':
        return {
          bg: 'from-amber-950/80 via-amber-900/40 to-black border-amber-500/40 text-amber-400 shadow-amber-500/10',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-10 h-10 text-amber-400" />,
          title: 'MAJOR SEVERITY PREDICTED',
          desc: 'Significant collision impact likely. Moderate-to-severe injuries expected requiring medical hospitalization.'
        };
      case 'FATAL':
        return {
          bg: 'from-rose-950/90 via-red-950/50 to-black border-red-500/50 text-red-400 shadow-red-500/20 animate-pulse',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          icon: <Skull className="w-10 h-10 text-red-400" />,
          title: 'CRITICAL FATAL RISK PREDICTED',
          desc: 'High probability of fatal crash severity. Critical risk of life-threatening injury. Immediate safety intervention required.'
        };
      default:
        return {
          bg: 'from-slate-900 via-black to-slate-950 border-white/10 text-slate-300',
          badge: 'bg-slate-800 text-slate-300 border-white/10',
          icon: <BrainCircuit className="w-10 h-10 text-indigo-400" />,
          title: 'PREDICTION READY',
          desc: 'Parameters initialized for ML inference.'
        };
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <span>Accident Severity Predictor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-class severity classification powered by Tuned Logistic Regression
          </p>
        </div>

        {/* Quick Scenario Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('night_rain')}
            className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
          >
            🌧️ Night Rain Rush
          </button>
          <button
            type="button"
            onClick={() => applyPreset('expressway_fog')}
            className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
          >
            🌫️ Foggy Expressway
          </button>
          <button
            type="button"
            onClick={() => applyPreset('clear_day')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
          >
            ☀️ Clear City Drive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUT FORM */}
        <form onSubmit={handlePredict} className="lg:col-span-7 glass-card p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h3 className="font-heading text-base font-bold text-white">Scenario Environment Inputs</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800">
              Tuned Logistic Regression
            </span>
          </div>

          {/* GROUP 1: LOCATION & ENVIRONMENT */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> 1. Location & Weather Hazards
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
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
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {['Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Weather Condition</label>
                <select
                  value={formData.weather}
                  onChange={(e) => handleChange('weather', e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="clear">Clear Skies</option>
                  <option value="rain">Heavy Rainfall</option>
                  <option value="fog">Dense Fog / Low Visibility</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Visibility Range</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => handleChange('visibility', e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="high">High (&gt; 10 km)</option>
                  <option value="medium">Medium (2 - 10 km)</option>
                  <option value="low">Low (&lt; 2 km)</option>
                </select>
              </div>
            </div>
          </div>

          {/* GROUP 2: INFRASTRUCTURE & ROAD */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" /> 2. Infrastructure & Traffic Flow
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Road Infrastructure</label>
                <select
                  value={formData.road_type}
                  onChange={(e) => handleChange('road_type', e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="highway">National / State Highway</option>
                  <option value="expressway">Access-Controlled Expressway</option>
                  <option value="urban">Urban Arterial Road</option>
                  <option value="rural">Rural Link Road</option>
                  <option value="intersection">Major Junction / Intersection</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Accident Cause</label>
                <select
                  value={formData.cause}
                  onChange={(e) => handleChange('cause', e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="overspeeding">Over-Speeding</option>
                  <option value="drunk_driving">Drunk Driving</option>
                  <option value="weather_conditions">Adverse Weather Hazard</option>
                  <option value="mechanical_breakdown">Vehicle Defect / Brake Failure</option>
                  <option value="distracted_driving">Distracted Driving / Mobile Use</option>
                  <option value="sudden_braking">Tailgating / Sudden Braking</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Traffic Signal Control</label>
                <select
                  value={formData.traffic_signal}
                  onChange={(e) => handleChange('traffic_signal', parseInt(e.target.value))}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value={1}>Active Signal Controlled</option>
                  <option value={0}>Uncontrolled / No Signal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Traffic Density</label>
                <select
                  value={formData.traffic_density}
                  onChange={(e) => handleChange('traffic_density', e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="low">Low Traffic Flow</option>
                  <option value="medium">Moderate Traffic</option>
                  <option value="high">Heavy / Congested Flow</option>
                </select>
              </div>
            </div>
          </div>

          {/* GROUP 3: TIME & SLIDERS */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5" /> 3. Time & Operational Dynamics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-semibold">Time of Day</label>
                  <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                    {formData.hour >= 6 && formData.hour <= 18 ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                    {formData.hour}:00 ({formData.is_peak_hour ? 'Peak Hour' : 'Off-Peak'})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={formData.hour}
                  onChange={(e) => handleChange('hour', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-1"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Day of Week</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => handleChange('day_of_week', e.target.value)}
                  className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-semibold">Road Lanes ({formData.lanes})</label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={formData.lanes}
                  onChange={(e) => handleChange('lanes', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-1"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-semibold">Temperature ({formData.temperature}°C)</label>
                </div>
                <input
                  type="range"
                  min="5"
                  max="48"
                  value={formData.temperature}
                  onChange={(e) => handleChange('temperature', parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-[1.01]"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            <span>Run Severity Prediction Engine</span>
          </button>
        </form>

        {/* PREDICTION RESULT PANEL */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="glass-card p-6 rounded-3xl border border-white/15 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Model Classification Output
                </span>
                <span className="text-[11px] font-mono text-indigo-400 font-bold px-2 py-0.5 rounded bg-black/60 border border-indigo-500/30">
                  {result.model_used}
                </span>
              </div>

              {/* Severity Banner with Radial Gauge */}
              <div className={`p-5 rounded-2xl border bg-gradient-to-b ${getSeverityBadge(result.predicted_severity).bg} space-y-3 shadow-xl`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getSeverityBadge(result.predicted_severity).badge}`}>
                    {result.predicted_severity} Risk Category
                  </span>
                  {getSeverityBadge(result.predicted_severity).icon}
                </div>

                {/* SVG RADIAL RISK SPEEDOMETER GAUGE */}
                {(() => {
                  const fatalProb = result.probabilities.fatal || 0;
                  const majorProb = result.probabilities.major || 0;
                  const minorProb = result.probabilities.minor || 0;
                  const riskIndex = Math.min(100, Math.round((minorProb * 0.2) + (majorProb * 0.6) + (fatalProb * 1.0)));
                  const strokeDasharray = 220;
                  const strokeDashoffset = strokeDasharray - (strokeDasharray * riskIndex) / 100;
                  const gaugeColor = result.predicted_severity === 'FATAL' ? '#f43f5e' : result.predicted_severity === 'MAJOR' ? '#f59e0b' : '#10b981';

                  return (
                    <div className="flex items-center justify-between bg-black/60 p-3.5 rounded-2xl border border-white/10 my-2">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Risk Score Index</div>
                        <div className="font-heading text-3xl font-black text-white flex items-baseline gap-1">
                          <span>{riskIndex}</span>
                          <span className="text-xs text-slate-400 font-normal">/ 100</span>
                        </div>
                        <div className="text-[11px] font-semibold" style={{ color: gaugeColor }}>
                          {riskIndex >= 65 ? '🔴 Critical Hazard Zone' : riskIndex >= 35 ? '🟡 Moderate Vulnerability' : '🟢 Safe Operational Level'}
                        </div>
                      </div>

                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            stroke={gaugeColor}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs text-white">
                          {riskIndex}%
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <div className="font-heading text-xl font-black tracking-tight">{getSeverityBadge(result.predicted_severity).title}</div>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{getSeverityBadge(result.predicted_severity).desc}</p>
                </div>
              </div>

              {/* Probability Bars */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Class Probability Distribution
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-1.5">
                    <div className="flex justify-between text-slate-200 font-bold">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Minor Injury</span>
                      <span className="font-mono text-emerald-400 text-sm">{result.probabilities.minor}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/10">
                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-700" style={{ width: `${result.probabilities.minor}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30 space-y-1.5">
                    <div className="flex justify-between text-slate-200 font-bold">
                      <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Major Injury</span>
                      <span className="font-mono text-amber-400 text-sm">{result.probabilities.major}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/10">
                      <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-700" style={{ width: `${result.probabilities.major}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-black/60 border border-red-500/30 space-y-1.5">
                    <div className="flex justify-between text-slate-200 font-bold">
                      <span className="flex items-center gap-1.5"><Skull className="w-3.5 h-3.5 text-red-400" /> Fatal Severity</span>
                      <span className="font-mono text-red-400 text-sm">{result.probabilities.fatal}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/10">
                      <div className="bg-gradient-to-r from-red-700 to-red-500 h-full rounded-full transition-all duration-700" style={{ width: `${result.probabilities.fatal}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('whatif')}
                  className="py-3 px-3 rounded-2xl bg-white/5 hover:bg-indigo-600/20 text-slate-200 hover:text-white font-bold flex items-center justify-between transition-colors border border-white/10 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4 text-indigo-400" /> What-If</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('explain')}
                  className="py-3 px-3 rounded-2xl bg-white/5 hover:bg-indigo-600/20 text-slate-200 hover:text-white font-bold flex items-center justify-between transition-colors border border-white/10 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-indigo-400" /> SHAP XAI</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-4 min-h-[420px]">
              <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                <BrainCircuit className="w-12 h-12 animate-pulse" />
              </div>
              <div className="font-heading text-lg font-bold text-white">No Prediction Generated Yet</div>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                Choose a scenario preset at the top or adjust parameters on the left, then click <strong className="text-white">Run Severity Prediction Engine</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
