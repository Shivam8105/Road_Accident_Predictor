import React, { useState, useEffect } from 'react';
import type { WhatIfResult } from '../types';
import { SlidersHorizontal, RefreshCw, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

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
      const res = await fetch('/api/ml/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_scenario: currentScenario, modified_scenario: modifiedScenario })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error('What-If simulation error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleModifiedChange = (field: string, value: any) => {
    setModifiedScenario(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <SlidersHorizontal className="w-8 h-8 text-indigo-400" />
          <span>What-If Scenario Simulator</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium">
          Interactively modify environmental & situational factors to evaluate predicted severity shifts.
        </p>
      </div>

      {/* LIMITATION NOTICE */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200">
        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-white">Simulation Context & Scope:</strong>
          <p className="mt-0.5">
            The What-If simulator re-evaluates the trained model pipeline with modified inputs. Under this scenario, the model estimates severity probability shifts based on learned historical patterns.
          </p>
        </div>
      </div>

      {/* MAIN SIMULATOR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MODIFIERS PANEL */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Modify Target Conditions (After Scenario)</span>
            </h3>
            <button
              onClick={runWhatIfSimulation}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-run Simulation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Weather</label>
              <select
                value={modifiedScenario.weather}
                onChange={(e) => handleModifiedChange('weather', e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-200"
              >
                <option value="clear">Clear Weather</option>
                <option value="rain">Heavy Rain</option>
                <option value="fog">Dense Fog</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Visibility Level</label>
              <select
                value={modifiedScenario.visibility}
                onChange={(e) => handleModifiedChange('visibility', e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-200"
              >
                <option value="high">High Visibility</option>
                <option value="medium">Medium Visibility</option>
                <option value="low">Low Visibility</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Traffic Density</label>
              <select
                value={modifiedScenario.traffic_density}
                onChange={(e) => handleModifiedChange('traffic_density', e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-200"
              >
                <option value="low">Low Density</option>
                <option value="medium">Medium Density</option>
                <option value="high">High Density</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Time of Day: {modifiedScenario.hour}:00</label>
              <input
                type="range"
                min="0"
                max="23"
                value={modifiedScenario.hour}
                onChange={(e) => handleModifiedChange('hour', parseInt(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Traffic Signal Presence</label>
              <select
                value={modifiedScenario.traffic_signal}
                onChange={(e) => handleModifiedChange('traffic_signal', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-200"
              >
                <option value={1}>Active Traffic Signal (1)</option>
                <option value={0}>No Signal / Uncontrolled (0)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Primary Cause</label>
              <select
                value={modifiedScenario.cause}
                onChange={(e) => handleModifiedChange('cause', e.target.value)}
                className="w-full bg-slate-900 border border-gray-700 rounded-xl px-3 py-2 text-gray-200"
              >
                <option value="overspeeding">Overspeeding</option>
                <option value="distraction">Distraction</option>
                <option value="weather">Weather Hazards</option>
                <option value="drunk_driving">Drunk Driving</option>
              </select>
            </div>
          </div>
        </div>

        {/* COMPARISON RESULTS PANEL */}
        <div className="lg:col-span-6 glass-card p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-base font-bold text-white">Before vs After Comparison</h3>
            {result && (
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                result.severity_changed 
                  ? 'bg-amber-950 text-amber-300 border-amber-800' 
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {result.transition}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 text-cyan-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* BEFORE SCENARIO CARD */}
                <div className="p-4 rounded-xl glass-panel border border-rose-500/20 space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Before (Baseline)</div>
                  <div className="text-xl font-black text-rose-400">{result.current.predicted_severity}</div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-gray-400">
                        <span>Minor</span> <span>{result.current.probabilities.minor}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${result.current.probabilities.minor}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-gray-400">
                        <span>Major</span> <span>{result.current.probabilities.major}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${result.current.probabilities.major}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-gray-400">
                        <span>Fatal</span> <span>{result.current.probabilities.fatal}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: `${result.current.probabilities.fatal}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AFTER SCENARIO CARD */}
                <div className="p-4 rounded-xl glass-panel border border-emerald-500/20 space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">After (Simulated)</div>
                  <div className="text-xl font-black text-emerald-400">{result.modified.predicted_severity}</div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-gray-400">
                        <span>Minor</span> <span>{result.modified.probabilities.minor}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${result.modified.probabilities.minor}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-gray-400">
                        <span>Major</span> <span>{result.modified.probabilities.major}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${result.modified.probabilities.major}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-gray-400">
                        <span>Fatal</span> <span>{result.modified.probabilities.fatal}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: `${result.modified.probabilities.fatal}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DELTA ANALYSIS */}
              <div className="p-4 rounded-xl glass-card border border-indigo-500/30 text-xs space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Probability Shift Highlights</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2 rounded-lg bg-slate-900">
                    <div className="text-[10px] text-gray-400">Minor Shift</div>
                    <div className={`font-bold ${result.modified.probabilities.minor - result.current.probabilities.minor >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(result.modified.probabilities.minor - result.current.probabilities.minor).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900">
                    <div className="text-[10px] text-gray-400">Major Shift</div>
                    <div className="font-bold text-amber-400">
                      {(result.modified.probabilities.major - result.current.probabilities.major).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900">
                    <div className="text-[10px] text-gray-400">Fatal Shift</div>
                    <div className={`font-bold ${result.modified.probabilities.fatal - result.current.probabilities.fatal <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
