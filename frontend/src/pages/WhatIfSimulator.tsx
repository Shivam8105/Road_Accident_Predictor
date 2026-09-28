import React, { useState, useEffect } from 'react';
import type { WhatIfResult } from '../types';
import { SlidersHorizontal, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

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
    <div className="space-y-6 py-2">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
          <SlidersHorizontal className="w-6 h-6 text-indigo-400" />
          <span>What-If Scenario Simulation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interactively modify environmental & situational factors to evaluate predicted severity shifts.
        </p>
      </div>

      {/* LIMITATION NOTICE */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-200">Simulation Context:</strong>
          <span className="ml-1 text-slate-400">
            The What-If simulator re-evaluates the trained ML model pipeline with modified inputs to estimate severity probability shifts based on learned historical patterns.
          </span>
        </div>
      </div>

      {/* MAIN SIMULATOR LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MODIFIERS PANEL */}
        <div className="lg:col-span-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100">Simulated Target Conditions</h3>
            <button
              onClick={runWhatIfSimulation}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Update Simulation</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Weather</label>
              <select
                value={modifiedScenario.weather}
                onChange={(e) => handleModifiedChange('weather', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="clear">Clear Weather</option>
                <option value="rain">Heavy Rain</option>
                <option value="fog">Dense Fog</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Visibility Level</label>
              <select
                value={modifiedScenario.visibility}
                onChange={(e) => handleModifiedChange('visibility', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="high">High Visibility</option>
                <option value="medium">Medium Visibility</option>
                <option value="low">Low Visibility</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Traffic Density</label>
              <select
                value={modifiedScenario.traffic_density}
                onChange={(e) => handleModifiedChange('traffic_density', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low Density</option>
                <option value="medium">Medium Density</option>
                <option value="high">High Density</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Time of Day: {modifiedScenario.hour}:00</label>
              <input
                type="range"
                min="0"
                max="23"
                value={modifiedScenario.hour}
                onChange={(e) => handleModifiedChange('hour', parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer mt-1"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Traffic Signal Presence</label>
              <select
                value={modifiedScenario.traffic_signal}
                onChange={(e) => handleModifiedChange('traffic_signal', parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value={1}>Active Traffic Signal</option>
                <option value={0}>No Signal / Uncontrolled</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Primary Cause</label>
              <select
                value={modifiedScenario.cause}
                onChange={(e) => handleModifiedChange('cause', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
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
        <div className="lg:col-span-6 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100">Scenario Transition Comparison</h3>
            {result && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase border ${
                result.severity_changed 
                  ? 'bg-amber-950 text-amber-300 border-amber-800' 
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {result.transition}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 text-indigo-400">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3.5">
                {/* BEFORE SCENARIO CARD */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Baseline Scenario</div>
                  <div className="text-lg font-bold text-rose-400">{result.current.predicted_severity}</div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Minor</span> <span>{result.current.probabilities.minor}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${result.current.probabilities.minor}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Major</span> <span>{result.current.probabilities.major}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${result.current.probabilities.major}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Fatal</span> <span>{result.current.probabilities.fatal}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: `${result.current.probabilities.fatal}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AFTER SCENARIO CARD */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Simulated Scenario</div>
                  <div className="text-lg font-bold text-emerald-400">{result.modified.predicted_severity}</div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Minor</span> <span>{result.modified.probabilities.minor}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${result.modified.probabilities.minor}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Major</span> <span>{result.modified.probabilities.major}%</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${result.modified.probabilities.major}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
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
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Probability Shift Analysis</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Minor Shift</div>
                    <div className={`font-bold ${result.modified.probabilities.minor - result.current.probabilities.minor >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(result.modified.probabilities.minor - result.current.probabilities.minor).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Major Shift</div>
                    <div className="font-bold text-amber-400">
                      {(result.modified.probabilities.major - result.current.probabilities.major).toFixed(1)}%
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Fatal Shift</div>
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
