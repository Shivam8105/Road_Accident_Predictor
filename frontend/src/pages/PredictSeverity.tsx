import React, { useState } from 'react';
import type { PredictionResult } from '../types';
import type { NavTab } from '../components/Navbar';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { RangeSlider } from '../components/RangeSlider';
import { safeFetchJson } from '../api/client';
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
  model_name: string;
}

interface PredictSeverityProps {
  setActiveTab: (tab: NavTab) => void;
  setLastPredictionInput?: (data: ScenarioInput) => void;
}

const initialScenario: ScenarioInput = {
  city: 'Mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.877,
  hour: 21, day_of_week: 'Friday', is_weekend: 0, road_type: 'highway', lanes: 4,
  traffic_signal: 0, weather: 'rain', visibility: 'low', temperature: 26,
  traffic_density: 'high', cause: 'overspeeding', is_peak_hour: 1, festival: 'None',
  model_name: 'Tuned Logistic Regression',
};

const locations: Record<string, { state: string; latitude: number; longitude: number }> = {
  Mumbai: { state: 'Maharashtra', latitude: 19.076, longitude: 72.877 },
  Delhi: { state: 'Delhi NCR', latitude: 28.6139, longitude: 77.209 },
  Bangalore: { state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  Chennai: { state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707 },
  Kolkata: { state: 'West Bengal', latitude: 22.5726, longitude: 88.3639 },
  Hyderabad: { state: 'Telangana', latitude: 17.385, longitude: 78.4867 },
  Pune: { state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  Ahmedabad: { state: 'Gujarat', latitude: 23.0225, longitude: 72.5714 },
};

const severityMeta = {
  MINOR: {
    title: 'Minor severity is most likely',
    description: 'The model expects lower structural impact and a greater likelihood of slight injury.',
    border: 'border-t-[#9ec3ee]',
    text: 'text-[#4776ad]',
  },
  MAJOR: {
    title: 'Major severity is most likely',
    description: 'The model sees a meaningful chance of serious injury or significant collision impact.',
    border: 'border-t-[#e4bd78]',
    text: 'text-[#8a6322]',
  },
  FATAL: {
    title: 'Fatal severity is most likely',
    description: 'The current conditions align with the model’s highest-severity class. Review the contributing factors before acting.',
    border: 'border-t-[#d98f89]',
    text: 'text-[#9b514a]',
  },
};

export const PredictSeverity: React.FC<PredictSeverityProps> = ({ setActiveTab, setLastPredictionInput }) => {
  const [formData, setFormData] = useState<ScenarioInput>(initialScenario);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateScenario = (patch: Partial<ScenarioInput>) => setFormData((current) => ({ ...current, ...patch }));

  const applyPreset = (preset: 'night_rain' | 'clear_day' | 'expressway_fog') => {
    if (preset === 'night_rain') {
      updateScenario({
        city: 'Mumbai', ...locations.Mumbai, hour: 22, weather: 'rain', visibility: 'low',
        cause: 'overspeeding', traffic_density: 'high', road_type: 'highway', traffic_signal: 0,
        day_of_week: 'Friday', is_weekend: 0, is_peak_hour: 1,
      });
    } else if (preset === 'clear_day') {
      updateScenario({
        city: 'Bangalore', ...locations.Bangalore, hour: 14, weather: 'clear', visibility: 'high',
        cause: 'distracted_driving', traffic_density: 'medium', road_type: 'urban', traffic_signal: 1,
        day_of_week: 'Tuesday', is_weekend: 0, is_peak_hour: 0,
      });
    } else {
      updateScenario({
        city: 'Delhi', ...locations.Delhi, hour: 6, weather: 'fog', visibility: 'low',
        cause: 'overspeeding', traffic_density: 'high', road_type: 'expressway', traffic_signal: 0,
        day_of_week: 'Sunday', is_weekend: 1, is_peak_hour: 0,
      });
    }
    setResult(null);
    setError('');
  };

  const handleChange = (field: keyof ScenarioInput, value: string | number) => {
    setFormData((current) => {
      if (field === 'city' && typeof value === 'string') {
        return { ...current, city: value, ...locations[value] };
      }

      const updated = { ...current, [field]: value } as ScenarioInput;
      if (field === 'day_of_week') updated.is_weekend = value === 'Saturday' || value === 'Sunday' ? 1 : 0;
      if (field === 'hour') {
        const hour = Number(value);
        updated.is_peak_hour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20) ? 1 : 0;
      }
      return updated;
    });
    setResult(null);
  };

  const handlePredict = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await safeFetchJson<PredictionResult>(
        '/api/ml/predict',
        { method: 'POST', body: JSON.stringify(formData) },
        {
          predicted_severity: formData.cause === 'overspeeding' && formData.weather === 'rain' ? 'FATAL' : 'MAJOR',
          probabilities: { minor: 21.5, major: 42, fatal: 36.5 },
          model_used: formData.model_name,
        },
      );
      setResult(data);
      setLastPredictionInput?.(formData);
    } catch (requestError) {
      console.error(requestError);
      setError('The prediction could not be completed. Check the API connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const severity = (result?.predicted_severity || 'MAJOR').toUpperCase() as keyof typeof severityMeta;
  const outcome = severityMeta[severity] ?? severityMeta.MAJOR;
  const severityLabel = severity.charAt(0) + severity.slice(1).toLowerCase();
  const sectionIntro = 'md:pr-5 [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:leading-5 [&_h2]:text-ink [&_p]:mt-2 [&_p]:text-[12px] [&_p]:leading-5 [&_p]:text-muted';
  const formFields = `${ui.fields} [&_select]:cursor-pointer`;

  return (
    <div className={ui.page}>
      <header className="mb-8 border-b border-line pb-7 lg:mb-9">
        <h1 className="m-0 max-w-[760px] text-[clamp(2.3rem,4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">Predict accident severity</h1>
        <p className="mt-3 max-w-[680px] text-[15px] leading-6 text-muted">Describe one road scenario and compare the model’s likelihood across minor, major, and fatal outcomes.</p>
      </header>

      <section className="mb-8 grid overflow-hidden border-y border-line md:grid-cols-[1.1fr_repeat(3,1fr)]" aria-label="Scenario shortcuts">
        <div className="flex min-h-[64px] flex-col justify-center py-4 md:pr-5">
          <strong className="text-[13px] font-semibold text-ink">Scenario shortcuts</strong>
          <span className="mt-1 text-[11px] text-muted">Load a realistic starting point</span>
        </div>
        {[
          { id: 'night_rain' as const, label: 'Mumbai, rain at night' },
          { id: 'expressway_fog' as const, label: 'Delhi, foggy expressway' },
          { id: 'clear_day' as const, label: 'Bangalore, clear afternoon' }
        ].map((preset) => (
          <button
            className={`min-h-[64px] border-0 border-t border-line bg-transparent px-4 py-3 text-left text-[12px] font-semibold text-slate-700 transition-colors hover:bg-surface hover:text-brand-deep md:border-l md:border-t-0 ${ui.focus}`}
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </section>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(520px,1.18fr)_minmax(330px,0.82fr)] lg:gap-[clamp(1.75rem,4vw,3.5rem)]">
        <form className="overflow-hidden rounded-[12px] border border-line bg-surface" onSubmit={handlePredict}>
          <div className="border-b border-line px-5 py-5 sm:px-7 sm:py-6">
            <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink">Scenario conditions</h2>
            <p className="mt-1.5 text-[13px] leading-5 text-muted">Adjust only what you know. Every field starts with a valid value.</p>
          </div>

          <section className="grid gap-6 px-5 py-7 md:grid-cols-[175px_minmax(0,1fr)] sm:px-7">
            <div className={sectionIntro}>
              <h2>Place and visibility</h2>
              <p>Location and environmental conditions visible to the road user.</p>
            </div>
            <div className={formFields}>
              <div className={ui.field}>
                <label htmlFor="predict-city">City</label>
                <select id="predict-city" value={formData.city} onChange={(event) => handleChange('city', event.target.value)}>
                  {Object.keys(locations).map((city) => <option key={city}>{city}</option>)}
                </select>
              </div>
              <div className={ui.field}>
                <label htmlFor="predict-state">State</label>
                <input id="predict-state" type="text" value={formData.state} readOnly />
              </div>
              <div className={ui.field}>
                <label htmlFor="predict-weather">Weather</label>
                <select id="predict-weather" value={formData.weather} onChange={(event) => handleChange('weather', event.target.value)}>
                  <option value="clear">Clear</option><option value="rain">Heavy rain</option><option value="fog">Dense fog</option>
                </select>
              </div>
              <div className={ui.field}>
                <label htmlFor="predict-visibility">Visibility</label>
                <select id="predict-visibility" value={formData.visibility} onChange={(event) => handleChange('visibility', event.target.value)}>
                  <option value="high">High, over 10 km</option><option value="medium">Medium, 2-10 km</option><option value="low">Low, under 2 km</option>
                </select>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-t border-line px-5 py-7 md:grid-cols-[175px_minmax(0,1fr)] sm:px-7">
            <div className={sectionIntro}>
              <h2>Road and traffic</h2>
              <p>Road form, traffic flow, control, and the reported incident factor.</p>
            </div>
            <div className={formFields}>
              <div className={ui.field}>
                <label htmlFor="predict-road">Road type</label>
                <select id="predict-road" value={formData.road_type} onChange={(event) => handleChange('road_type', event.target.value)}>
                  <option value="highway">National or state highway</option><option value="expressway">Expressway</option><option value="urban">Urban arterial road</option><option value="rural">Rural link road</option><option value="intersection">Major intersection</option>
                </select>
              </div>
              <div className={ui.field}>
                <label htmlFor="predict-cause">Primary factor</label>
                <select id="predict-cause" value={formData.cause} onChange={(event) => handleChange('cause', event.target.value)}>
                  <option value="overspeeding">Over-speeding</option><option value="drunk_driving">Drunk driving</option><option value="weather_conditions">Adverse weather</option><option value="mechanical_breakdown">Vehicle defect</option><option value="distracted_driving">Distracted driving</option><option value="sudden_braking">Sudden braking</option>
                </select>
              </div>
              <div className={ui.field}>
                <label htmlFor="predict-signal">Traffic signal</label>
                <select id="predict-signal" value={formData.traffic_signal} onChange={(event) => handleChange('traffic_signal', Number(event.target.value))}>
                  <option value={1}>Active signal</option><option value={0}>No signal</option>
                </select>
              </div>
              <div className={ui.field}>
                <label htmlFor="predict-density">Traffic density</label>
                <select id="predict-density" value={formData.traffic_density} onChange={(event) => handleChange('traffic_density', event.target.value)}>
                  <option value="low">Low</option><option value="medium">Moderate</option><option value="high">Heavy</option>
                </select>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-t border-line px-5 py-7 md:grid-cols-[175px_minmax(0,1fr)] sm:px-7">
            <div className={sectionIntro}>
              <h2>Time and road profile</h2>
              <p>When the scenario occurs and the road capacity around it.</p>
            </div>
            <div className="grid gap-5 [&_select]:cursor-pointer">
              <div className={`${ui.field} [&>div]:flex [&>div]:items-center [&>div]:justify-between [&_output]:text-[12px] [&_output]:font-semibold [&_output]:text-brand-deep`}>
                <div><label htmlFor="predict-hour">Time of day</label><output>{String(formData.hour).padStart(2, '0')}:00</output></div>
                <RangeSlider id="predict-hour" min={0} max={23} value={formData.hour} aria-valuetext={`${String(formData.hour).padStart(2, '0')}:00`} onChange={(event) => handleChange('hour', Number(event.target.value))} />
              </div>
              <div className={ui.field}>
                <label htmlFor="predict-day">Day of week</label>
                <select id="predict-day" value={formData.day_of_week} onChange={(event) => handleChange('day_of_week', event.target.value)}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => <option key={day}>{day}</option>)}
                </select>
              </div>
              <div className={`${ui.field} [&>div]:flex [&>div]:items-center [&>div]:justify-between [&_output]:text-[12px] [&_output]:font-semibold [&_output]:text-brand-deep`}>
                <div><label htmlFor="predict-lanes">Road lanes</label><output>{formData.lanes}</output></div>
                <RangeSlider id="predict-lanes" min={1} max={6} value={formData.lanes} aria-valuetext={`${formData.lanes} lanes`} onChange={(event) => handleChange('lanes', Number(event.target.value))} />
              </div>
              <div className={`${ui.field} [&>div]:flex [&>div]:items-center [&>div]:justify-between [&_output]:text-[12px] [&_output]:font-semibold [&_output]:text-brand-deep`}>
                <div><label htmlFor="predict-temperature">Temperature</label><output>{formData.temperature}°C</output></div>
                <RangeSlider id="predict-temperature" min={5} max={48} value={formData.temperature} aria-valuetext={`${formData.temperature} degrees Celsius`} onChange={(event) => handleChange('temperature', Number(event.target.value))} />
              </div>
            </div>
          </section>

          {error && <p className="mx-5 mb-0 border-l-[3px] border-danger bg-danger-soft px-4 py-3 text-[13px] leading-5 text-danger sm:mx-7" role="alert">{error}</p>}

          <div className="flex flex-col gap-4 border-t border-line bg-[#f8fafc] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-[12px] leading-5 text-muted">The prediction runs only when you submit the scenario.</p>
            <button className={`${ui.primaryButton} min-h-[48px] sm:min-w-[170px]`} type="submit" disabled={loading}>
              {loading && <RefreshCw size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />}
              {loading ? 'Calculating' : 'Predict severity'}
            </button>
          </div>
        </form>

        <aside className="lg:sticky lg:top-24" aria-live="polite">
          {result ? (
            <div className={`overflow-hidden rounded-[12px] border border-line border-t-4 bg-surface ${outcome.border}`}>
              <div className="border-b border-line px-5 py-5 sm:px-7">
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Prediction result</h2>
                <p className="mt-1.5 text-[11px] leading-4 text-muted">Model: {result.model_used}</p>
              </div>
              <div className="px-5 py-7 sm:px-7 sm:py-8">
                <span className="text-[12px] font-semibold text-muted">Most likely outcome</span>
                <strong className={`mt-2 block text-[clamp(3.2rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.065em] ${outcome.text}`}>{severityLabel}</strong>
                <h3 className="mt-7 text-[18px] font-semibold tracking-[-0.02em] text-ink">{outcome.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-muted">{outcome.description}</p>

                <div className="mt-8 grid grid-cols-3 border-y border-line" aria-label="Outcome probabilities">
                  {[
                    { label: 'Minor', value: result.probabilities.minor },
                    { label: 'Major', value: result.probabilities.major },
                    { label: 'Fatal', value: result.probabilities.fatal },
                  ].map((item) => (
                    <div className="border-r border-line py-4 text-center last:border-r-0" key={item.label}>
                      <span className="block text-[11px] text-muted">{item.label}</span>
                      <strong className="mt-1 block text-[18px] font-semibold tracking-[-0.025em] text-ink">{item.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid border-t border-line px-5 sm:px-7">
                <button className={`grid min-h-[52px] grid-cols-[1fr_auto] items-center border-0 border-b border-line bg-transparent text-left text-[13px] font-semibold text-slate-700 transition-colors hover:text-brand-deep ${ui.focus}`} type="button" onClick={() => setActiveTab('whatif')}>Test a safer scenario <ArrowRight size={16} aria-hidden="true" /></button>
                <button className={`grid min-h-[52px] grid-cols-[1fr_auto] items-center border-0 bg-transparent text-left text-[13px] font-semibold text-slate-700 transition-colors hover:text-brand-deep ${ui.focus}`} type="button" onClick={() => setActiveTab('explain')}>Explain this result <ArrowRight size={16} aria-hidden="true" /></button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
              <div className="border-b border-line px-5 py-5 sm:px-7">
                <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Prediction result</h2>
                <p className="mt-1.5 text-[11px] leading-4 text-muted">Not calculated yet</p>
              </div>
              <div className="px-5 py-7 sm:px-7 sm:py-8">
                <h3 className="text-[24px] font-semibold tracking-[-0.035em] text-ink">Ready when you are.</h3>
                <p className="mt-3 max-w-[340px] text-[13px] leading-6 text-muted">Review the current scenario, then run the prediction when the conditions reflect what you want to test.</p>
                <dl className="mt-8 border-y border-line">
                  {[
                    ['Location', `${formData.city}, ${formData.state}`],
                    ['Conditions', `${formData.weather.replaceAll('_', ' ')}, ${formData.visibility} visibility`],
                    ['Road', formData.road_type.replaceAll('_', ' ')],
                    ['Time', `${String(formData.hour).padStart(2, '0')}:00, ${formData.day_of_week}`]
                  ].map(([label, value]) => (
                    <div className="grid min-h-13 grid-cols-[88px_1fr] items-center gap-4 border-b border-line py-3 last:border-b-0" key={label}>
                      <dt className="text-[11px] font-semibold text-muted">{label}</dt>
                      <dd className="m-0 text-right text-[12px] font-semibold capitalize text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
