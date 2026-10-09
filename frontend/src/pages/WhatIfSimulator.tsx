import React, { useState, useEffect } from 'react';
import type { WhatIfResult } from '../types';
import { 
  SlidersHorizontal, RefreshCw, ShieldCheck, 
  Sparkles, Sun, Moon, AlertTriangle, Lightbulb
} from 'lucide-react';
import { safeFetchJson } from '../api/client';

export const WhatIfSimulator: React.FC = () => {
  const [currentScenario] = useState({
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

  const [modifiedScenario, setModifiedScenario] = useState({
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.076,
    longitude: 72.877,
    hour: 14,
    day_of_week: 'Friday',
    is_weekend: 0,
    road_type: 'highway',
    lanes: 4,
    traffic_signal: 1,
    weather: 'clear',
    visibility: 'high',
    temperature: 26,
    traffic_density: 'medium',
    cause: 'distraction',
    is_peak_hour: 0,
    festival: 'None'
  });

  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    runWhatIfSimulation();
  }, []);

  const runWhatIfSimulation = async () => {
    setLoading(true);
    try {
      const fallbackResult: WhatIfResult = {
        current: { predicted_severity: 'FATAL', probabilities: { minor: 15.0, major: 25.0, fatal: 60.0 }, model_used: 'Tuned Logistic Regression' },
        modified: { predicted_severity: 'MINOR', probabilities: { minor: 68.0, major: 22.0, fatal: 10.0 }, model_used: 'Tuned Logistic Regression' },
        severity_changed: true,
        transition: 'FATAL ➔ MINOR'
      };

      const data = await safeFetchJson<WhatIfResult>(
        '/api/ml/what-if',
        {
          method: 'POST',
          body: JSON.stringify({ current_scenario: currentScenario, modified_scenario: modifiedScenario })
        },
        fallbackResult
      );
      setResult(data);
    } catch (e) {
      console.error('What-If simulation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleModifiedChange = (field: string, value: any) => {
    setModifiedScenario(prev => ({ ...prev, [field]: value }));
  };

  const applyIntervention = (type: 'add_signal' | 'clear_weather' | 'reduce_speed' | 'day_time') => {
    if (type === 'add_signal') {
      setModifiedScenario(prev => ({ ...prev, traffic_signal: 1 }));
    } else if (type === 'clear_weather') {
      setModifiedScenario(prev => ({ ...prev, weather: 'clear', visibility: 'high' }));
    } else if (type === 'reduce_speed') {
      setModifiedScenario(prev => ({ ...prev, cause: 'distraction' }));
    } else if (type === 'day_time') {
      setModifiedScenario(prev => ({ ...prev, hour: 14, is_peak_hour: 0 }));
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
            <span>What-If Scenario Risk Simulator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate safety interventions & environmental modifications to evaluate counterfactual risk shifts
          </p>
        </div>

        {/* Quick Safety Interventions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Interventions:
          </span>
          <button
            type="button"
            onClick={() => applyIntervention('add_signal')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
          >
            🚦 Install Signal
          </button>
          <button
            type="button"
            onClick={() => applyIntervention('clear_weather')}
            className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all cursor-pointer"
          >
            🌤️ Clear Weather
          </button>
          <button
            type="button"
            onClick={() => applyIntervention('day_time')}
            className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
          >
            ☀️ Off-Peak Daytime
          </button>
        </div>
      </div>

      {/* CONTEXT NOTICE */}
      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-start gap-3 text-xs text-slate-300">
        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-white">How Counterfactual Simulation Works:</strong>
          <span className="ml-1 text-slate-400">
            The simulator evaluates how environmental interventions (installing traffic signals, clearing rain/fog hazards, or shifting peak hours) alter the ML model's multi-class prediction probabilities compared to a high-risk baseline.
          </span>
        </div>
      </div>

      {/* MAIN SIMULATOR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MODIFIERS PANEL */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white">Simulated Target Interventions</h3>
            <button
              onClick={runWhatIfSimulation}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-indigo-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Update Simulation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weather Hazard</label>
              <select
                value={modifiedScenario.weather}
                onChange={(e) => handleModifiedChange('weather', e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="clear">Clear Weather</option>
                <option value="rain">Heavy Rainfall</option>
                <option value="fog">Dense Fog</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Visibility Level</label>
              <select
                value={modifiedScenario.visibility}
                onChange={(e) => handleModifiedChange('visibility', e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="high">High Visibility</option>
                <option value="medium">Medium Visibility</option>
                <option value="low">Low Visibility</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Traffic Density</label>
              <select
                value={modifiedScenario.traffic_density}
                onChange={(e) => handleModifiedChange('traffic_density', e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="low">Low Flow</option>
                <option value="medium">Moderate Flow</option>
                <option value="high">Heavy Congestion</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Traffic Signal Control</label>
              <select
                value={modifiedScenario.traffic_signal}
                onChange={(e) => handleModifiedChange('traffic_signal', parseInt(e.target.value))}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value={1}>Active Signal Controlled</option>
                <option value={0}>No Signal / Uncontrolled</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Incident Factor</label>
              <select
                value={modifiedScenario.cause}
                onChange={(e) => handleModifiedChange('cause', e.target.value)}
                className="w-full bg-black/80 border border-white/15 rounded-xl px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="overspeeding">Over-Speeding</option>
                <option value="distraction">Distraction / Mobile Use</option>
                <option value="weather">Weather Hazards</option>
                <option value="drunk_driving">Drunk Driving</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">Simulated Time</label>
                <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                  {modifiedScenario.hour >= 6 && modifiedScenario.hour <= 18 ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                  {modifiedScenario.hour}:00
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={modifiedScenario.hour}
                onChange={(e) => handleModifiedChange('hour', parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        {/* COMPARISON RESULTS PANEL */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white">Risk Transition Output</h3>
            {result && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border ${
                result.severity_changed 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                  : 'bg-amber-950 text-amber-300 border-amber-500/40'
              }`}>
                {result.transition}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 text-indigo-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {/* SIDE BY SIDE COMPARISON CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* BASELINE CARD */}
                <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Baseline Scenario</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-black text-rose-400">{result.current.predicted_severity}</div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 font-medium text-[11px] mb-0.5">
                        <span>Minor</span> <span className="font-mono text-emerald-400">{result.current.probabilities.minor}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
                        <div className="bg-emerald-500 h-full" style={{ width: `${result.current.probabilities.minor}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium text-[11px] mb-0.5">
                        <span>Major</span> <span className="font-mono text-amber-400">{result.current.probabilities.major}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
                        <div className="bg-amber-500 h-full" style={{ width: `${result.current.probabilities.major}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium text-[11px] mb-0.5">
                        <span>Fatal</span> <span className="font-mono text-rose-400">{result.current.probabilities.fatal}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
                        <div className="bg-rose-500 h-full" style={{ width: `${result.current.probabilities.fatal}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SIMULATED CARD */}
                <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulated Target</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-emerald-400">{result.modified.predicted_severity}</div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 font-medium text-[11px] mb-0.5">
                        <span>Minor</span> <span className="font-mono text-emerald-400">{result.modified.probabilities.minor}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${result.modified.probabilities.minor}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium text-[11px] mb-0.5">
                        <span>Major</span> <span className="font-mono text-amber-400">{result.modified.probabilities.major}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
                        <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${result.modified.probabilities.major}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 font-medium text-[11px] mb-0.5">
                        <span>Fatal</span> <span className="font-mono text-rose-400">{result.modified.probabilities.fatal}%</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/10">
                        <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${result.modified.probabilities.fatal}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROBABILITY DELTA SHIFT CARD */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/15 space-y-2.5 text-xs">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Probability Shift Delta</span>
                  <span className="text-[10px] text-slate-400 font-mono">Net Intervention Delta</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-sans">Minor Shift</div>
                    <div className={`font-bold text-sm ${result.modified.probabilities.minor - result.current.probabilities.minor >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.modified.probabilities.minor - result.current.probabilities.minor >= 0 ? '+' : ''}
                      {(result.modified.probabilities.minor - result.current.probabilities.minor).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-sans">Major Shift</div>
                    <div className="font-bold text-sm text-amber-400">
                      {result.modified.probabilities.major - result.current.probabilities.major >= 0 ? '+' : ''}
                      {(result.modified.probabilities.major - result.current.probabilities.major).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10">
                    <div className="text-[10px] text-slate-400 font-sans">Fatal Shift</div>
                    <div className={`font-bold text-sm ${result.modified.probabilities.fatal - result.current.probabilities.fatal <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.modified.probabilities.fatal - result.current.probabilities.fatal >= 0 ? '+' : ''}
                      {(result.modified.probabilities.fatal - result.current.probabilities.fatal).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
