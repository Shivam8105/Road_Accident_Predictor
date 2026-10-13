import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRight,
  CloudSun,
  Gauge,
  Lightbulb,
  RefreshCw,
  TimerReset,
  TrafficCone
} from 'lucide-react';
import { safeFetchJson } from '../api/client';
import type { WhatIfResult } from '../types';
import { RangeSlider } from '../components/RangeSlider';
import { ui } from '../ui';

interface ScenarioInput {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  hour: number;
  day_of_week: string;
  is_weekend: number;
  road_type: string;
  lanes: number;
  traffic_signal: number;
  weather: string;
  visibility: string;
  temperature: number;
  traffic_density: string;
  cause: string;
  is_peak_hour: number;
  festival: string;
}

const BASELINE_SCENARIO: ScenarioInput = {
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
};

const INITIAL_SCENARIO: ScenarioInput = {
  ...BASELINE_SCENARIO,
  hour: 14,
  traffic_signal: 1,
  weather: 'clear',
  visibility: 'high',
  traffic_density: 'medium',
  cause: 'distracted_driving',
  is_peak_hour: 0
};

const FALLBACK_RESULT: WhatIfResult = {
  current: {
    predicted_severity: 'FATAL',
    probabilities: { minor: 15, major: 25, fatal: 60 },
    model_used: 'Tuned Logistic Regression'
  },
  modified: {
    predicted_severity: 'MINOR',
    probabilities: { minor: 68, major: 22, fatal: 10 },
    model_used: 'Tuned Logistic Regression'
  },
  severity_changed: true,
  transition: 'FATAL to MINOR'
};

const severityRows = [
  { key: 'minor', label: 'Minor', color: '#19725d' },
  { key: 'major', label: 'Major', color: '#9a5b13' },
  { key: 'fatal', label: 'Fatal', color: '#b42318' }
] as const;

const severityTextClass = (severity: string) => (
  severity.toLowerCase() === 'minor' ? 'text-positive' : severity.toLowerCase() === 'major' ? 'text-warning' : 'text-danger'
);

async function simulate(modifiedScenario: ScenarioInput) {
  return safeFetchJson<WhatIfResult>(
    '/api/ml/what-if',
    {
      method: 'POST',
      body: JSON.stringify({
        current_scenario: BASELINE_SCENARIO,
        modified_scenario: modifiedScenario
      })
    },
    FALLBACK_RESULT
  );
}

export const WhatIfSimulator: React.FC = () => {
  const [modifiedScenario, setModifiedScenario] = useState<ScenarioInput>(INITIAL_SCENARIO);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    simulate(INITIAL_SCENARIO)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch(() => {
        if (active) setError('The simulation could not be updated. Try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateScenario = <K extends keyof ScenarioInput>(field: K, value: ScenarioInput[K]) => {
    setModifiedScenario((current) => ({ ...current, [field]: value }));
  };

  const runSimulation = async () => {
    setLoading(true);
    setError('');
    try {
      setResult(await simulate(modifiedScenario));
    } catch {
      setError('The simulation could not be updated. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyIntervention = (type: 'signal' | 'weather' | 'flow' | 'daytime') => {
    const intervention: Record<typeof type, Partial<ScenarioInput>> = {
      signal: { traffic_signal: 1 },
      weather: { weather: 'clear', visibility: 'high' },
      flow: { traffic_density: 'low', is_peak_hour: 0 },
      daytime: { hour: 14, is_peak_hour: 0 }
    };
    setModifiedScenario((current) => ({ ...current, ...intervention[type] }));
  };

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div>
          <h1>Change one condition. See what moves.</h1>
          <p>Compare a known high-risk baseline with a safer road, traffic, or environmental intervention.</p>
        </div>
        <button className={ui.primaryButton} type="button" onClick={runSimulation} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Update comparison
        </button>
      </header>

      <div className="mb-6 grid border-y border-line sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_repeat(4,auto)]" aria-label="Quick interventions">
        <div className="col-span-full grid gap-1 border-b border-line py-4 lg:col-span-1 lg:border-b-0 lg:pr-5">
          <strong className="text-[13px] font-semibold text-ink">Start with an intervention</strong>
          <span className="text-[11px] text-muted">Each shortcut changes the proposed scenario. Run the comparison when ready.</span>
        </div>
        {[
          { id: 'signal' as const, icon: <TrafficCone size={17} />, label: 'Install signal' },
          { id: 'weather' as const, icon: <CloudSun size={17} />, label: 'Clear conditions' },
          { id: 'flow' as const, icon: <Gauge size={17} />, label: 'Reduce traffic load' },
          { id: 'daytime' as const, icon: <TimerReset size={17} />, label: 'Move off peak' }
        ].map((item) => (
          <button className={`inline-flex min-h-16 items-center gap-2 border-0 border-l border-line bg-transparent px-4 text-[12px] font-semibold text-slate-700 hover:bg-brand-soft hover:text-brand-deep [&>svg]:text-brand max-sm:border-l-0 max-sm:border-t ${ui.focus}`} key={item.id} type="button" onClick={() => applyIntervention(item.id)}>{item.icon}{item.label}</button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(440px,0.85fr)_minmax(500px,1.15fr)]">
        <section className={ui.panel}>
          <div className={ui.panelHeader}>
            <div>
              <h2>Proposed conditions</h2>
              <p>Adjust only what would plausibly change at this location.</p>
            </div>
          </div>
          <div className={`${ui.panelBody} ${ui.fields} pb-7`}>
            <div className={ui.field}>
              <label htmlFor="sim-weather">Weather</label>
              <select id="sim-weather" value={modifiedScenario.weather} onChange={(event) => updateScenario('weather', event.target.value)}>
                <option value="clear">Clear</option>
                <option value="rain">Heavy rain</option>
                <option value="fog">Dense fog</option>
              </select>
            </div>
            <div className={ui.field}>
              <label htmlFor="sim-visibility">Visibility</label>
              <select id="sim-visibility" value={modifiedScenario.visibility} onChange={(event) => updateScenario('visibility', event.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className={ui.field}>
              <label htmlFor="sim-density">Traffic density</label>
              <select id="sim-density" value={modifiedScenario.traffic_density} onChange={(event) => updateScenario('traffic_density', event.target.value)}>
                <option value="low">Low flow</option>
                <option value="medium">Moderate flow</option>
                <option value="high">Heavy congestion</option>
              </select>
            </div>
            <div className={ui.field}>
              <label htmlFor="sim-signal">Signal control</label>
              <select id="sim-signal" value={modifiedScenario.traffic_signal} onChange={(event) => updateScenario('traffic_signal', Number(event.target.value))}>
                <option value={1}>Signal controlled</option>
                <option value={0}>Uncontrolled</option>
              </select>
            </div>
            <div className={ui.field}>
              <label htmlFor="sim-cause">Primary factor</label>
              <select id="sim-cause" value={modifiedScenario.cause} onChange={(event) => updateScenario('cause', event.target.value)}>
                <option value="overspeeding">Overspeeding</option>
                <option value="distracted_driving">Distracted driving</option>
                <option value="weather">Weather hazard</option>
                <option value="drunk_driving">Drunk driving</option>
              </select>
            </div>
            <div className={ui.field}>
              <div className="flex justify-between gap-3">
                <label htmlFor="sim-hour">Time of day</label>
                <strong className="text-[12px] text-brand-deep">{String(modifiedScenario.hour).padStart(2, '0')}:00</strong>
              </div>
              <RangeSlider
                id="sim-hour"
                min={0}
                max={23}
                value={modifiedScenario.hour}
                aria-valuetext={`${String(modifiedScenario.hour).padStart(2, '0')}:00`}
                onChange={(event) => updateScenario('hour', Number(event.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-3 border-t border-line bg-slate-50 px-6 py-4 text-muted [&>svg]:shrink-0 [&>svg]:text-brand [&_p]:m-0 [&_p]:text-[12px] [&_p]:leading-5">
            <Lightbulb size={17} />
            <p>The model recomputes severity probabilities with the location fixed, so the comparison isolates the conditions you changed.</p>
          </div>
        </section>

        <section className="min-w-0" aria-live="polite">
          {loading ? (
            <div className={`${ui.loading} min-h-[520px]`}><div><RefreshCw className="animate-spin" size={20} /> Recomputing both scenarios</div></div>
          ) : error ? (
            <div className={`${ui.empty} min-h-[520px]`}>
              <span className={ui.emptyIcon}><Activity size={23} /></span>
              <h2>Comparison unavailable</h2>
              <p>{error}</p>
            </div>
          ) : result ? (
            <div className="overflow-hidden rounded-[16px] border border-line bg-surface">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line px-5 py-8 sm:gap-6 sm:px-8 sm:py-10 [&>div]:grid [&>div]:gap-2 [&>div:last-child]:text-right [&_span]:text-[12px] [&_span]:font-semibold [&_span]:text-muted">
                <div><span>Known baseline</span><strong className={`text-[clamp(2rem,4vw,4rem)] font-semibold leading-none tracking-[-0.055em] capitalize ${severityTextClass(result.current.predicted_severity)}`}>{result.current.predicted_severity.toLowerCase()}</strong></div>
                <ArrowRight className="text-slate-400" size={28} aria-hidden="true" />
                <div><span>Proposed scenario</span><strong className={`text-[clamp(2rem,4vw,4rem)] font-semibold leading-none tracking-[-0.055em] capitalize ${severityTextClass(result.modified.predicted_severity)}`}>{result.modified.predicted_severity.toLowerCase()}</strong></div>
              </div>

              <div className="px-4 pb-3 pt-5 sm:px-7">
                <div className="grid min-h-8 grid-cols-[minmax(80px,1fr)_62px_62px_72px] items-center gap-2 text-[10px] font-semibold text-muted sm:grid-cols-[minmax(120px,1fr)_86px_86px_86px] sm:gap-3 [&>span:not(:first-child)]:text-right">
                  <span>Severity likelihood</span>
                  <span>Baseline</span>
                  <span>Proposed</span>
                  <span>Change</span>
                </div>
                {severityRows.map(({ key, label, color }) => {
                  const before = result.current.probabilities[key];
                  const after = result.modified.probabilities[key];
                  const delta = after - before;
                  const harmfulChange = key === 'minor' ? delta < 0 : delta > 0;
                  return (
                    <div className="grid min-h-[52px] grid-cols-[minmax(80px,1fr)_62px_62px_72px] items-center gap-2 border-t border-line text-[12px] sm:grid-cols-[minmax(120px,1fr)_86px_86px_86px] sm:gap-3 [&>strong]:text-right [&>em]:text-right [&>em]:not-italic" key={key}>
                      <span className="flex items-center gap-2 font-semibold text-slate-700"><i className="h-6 w-1 rounded-[2px]" style={{ backgroundColor: color }} />{label}</span>
                      <strong>{before.toFixed(1)}%</strong>
                      <strong>{after.toFixed(1)}%</strong>
                      <em className={harmfulChange ? 'text-danger' : 'text-positive'}>{delta > 0 ? '+' : ''}{delta.toFixed(1)} pts</em>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 border-t border-line bg-slate-50 px-5 py-6 sm:grid-cols-[130px_1fr] sm:gap-6 sm:px-7">
                <span className="text-[11px] font-semibold text-muted">What changed</span>
                <dl className="m-0 grid gap-3 sm:grid-cols-2 sm:gap-x-6 [&>div]:grid [&>div]:gap-1 [&_dt]:text-[10px] [&_dt]:text-muted [&_dd]:m-0 [&_dd]:flex [&_dd]:items-center [&_dd]:gap-1.5 [&_dd]:text-[12px] [&_dd]:font-semibold [&_dd]:capitalize [&_dd]:text-slate-700">
                  <div><dt>Weather</dt><dd>{BASELINE_SCENARIO.weather} <ArrowRight size={13} /> {modifiedScenario.weather}</dd></div>
                  <div><dt>Control</dt><dd>{BASELINE_SCENARIO.traffic_signal ? 'signal' : 'none'} <ArrowRight size={13} /> {modifiedScenario.traffic_signal ? 'signal' : 'none'}</dd></div>
                  <div><dt>Time</dt><dd>{BASELINE_SCENARIO.hour}:00 <ArrowRight size={13} /> {modifiedScenario.hour}:00</dd></div>
                  <div><dt>Traffic</dt><dd>{BASELINE_SCENARIO.traffic_density} <ArrowRight size={13} /> {modifiedScenario.traffic_density}</dd></div>
                </dl>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};
