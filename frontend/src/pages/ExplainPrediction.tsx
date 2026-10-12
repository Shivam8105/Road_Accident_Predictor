import React, { useCallback, useEffect, useState } from 'react';
import type { GlobalSHAPItem, SHAPExplanation } from '../types';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { FALLBACK_GLOBAL_SHAP, FALLBACK_SHAP_EXPLANATION, safeFetchJson } from '../api/client';
import { ui } from '../ui';

const tooltipStyle = {
  backgroundColor: '#fcfdff',
  borderColor: '#d9e1ec',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#101828',
};

const readableFeature = (feature: string) =>
  feature.replace('cat__', '').replace('num__', '').replaceAll('_', ' ');

export const ExplainPrediction: React.FC = () => {
  const [shapData, setShapData] = useState<SHAPExplanation>(FALLBACK_SHAP_EXPLANATION);
  const [globalShap, setGlobalShap] = useState<GlobalSHAPItem[]>(FALLBACK_GLOBAL_SHAP);
  const [loading, setLoading] = useState(true);

  const fetchExplanations = useCallback(async () => {
    const sampleInput = {
      city: 'Mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.877,
      hour: 22, day_of_week: 'Friday', is_weekend: 0, road_type: 'highway', lanes: 4,
      traffic_signal: 0, weather: 'rain', visibility: 'low', temperature: 26,
      traffic_density: 'high', cause: 'overspeeding', is_peak_hour: 1, festival: 'None',
    };

    try {
      const [individual, global] = await Promise.all([
        safeFetchJson<SHAPExplanation>(
          '/api/ml/explain',
          { method: 'POST', body: JSON.stringify(sampleInput) },
          FALLBACK_SHAP_EXPLANATION,
        ),
        safeFetchJson<{ importances: GlobalSHAPItem[] }>(
          '/api/ml/global-shap',
          undefined,
          { importances: FALLBACK_GLOBAL_SHAP },
        ),
      ]);

      if (individual?.increasing_factors) setShapData(individual);
      if (Array.isArray(global?.importances)) setGlobalShap(global.importances.slice(0, 10));
    } catch (error) {
      console.error('Error fetching SHAP explanations:', error);
      setShapData(FALLBACK_SHAP_EXPLANATION);
      setGlobalShap(FALLBACK_GLOBAL_SHAP);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- state updates happen after the explanation requests resolve.
    void fetchExplanations();
  }, [fetchExplanations]);

  const refreshExplanations = () => {
    setLoading(true);
    void fetchExplanations();
  };

  if (loading) {
    return (
      <div className={ui.loading}>
        <div><RefreshCw size={19} className="animate-spin" /> Reading feature influence...</div>
      </div>
    );
  }

  const maxImpact = Math.max(...shapData.top_contributions.map((item) => Math.abs(item.impact)), 1);

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div>
          <h1>Why did the model decide this?</h1>
          <p>Read the conditions that pushed one forecast higher or lower, then compare them with the model’s broader behavior.</p>
        </div>
        <div className={ui.headerActions}>
          <button className={ui.button} type="button" onClick={refreshExplanations}>
            <RefreshCw size={16} /> Recalculate
          </button>
        </div>
      </header>

      <section className="grid items-start gap-12 py-6 lg:grid-cols-[minmax(280px,0.72fr)_minmax(520px,1.28fr)] lg:gap-[clamp(3rem,8vw,6.75rem)] lg:pb-16" aria-labelledby="local-explanation-title">
        <div>
          <h2 className="m-0 max-w-[13ch] text-[clamp(2.5rem,4.7vw,4.4rem)] font-semibold leading-none tracking-[-0.055em] text-ink lg:max-w-[10ch]" id="local-explanation-title">This prediction, unpacked.</h2>
          <p className="mt-5 max-w-[430px] text-[14px] leading-6 text-muted">The current example uses {shapData.model_used}. Each line shows direction and relative strength, not causation.</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 [&>div]:flex [&>div]:flex-col [&>div]:items-start [&>div]:gap-2 [&>div]:border-t [&>div]:border-line [&>div]:pt-4 [&_svg]:mb-1 [&_svg]:text-brand [&_strong]:text-[13px] [&_strong]:text-ink [&_span]:text-[12px] [&_span]:leading-5 [&_span]:text-muted">
            <div>
              <TrendingUp size={19} strokeWidth={1.7} />
              <strong>Raised severity</strong>
              {shapData.increasing_factors.slice(0, 3).map((factor) => <span key={factor}>{factor}</span>)}
            </div>
            <div>
              <TrendingDown size={19} strokeWidth={1.7} />
              <strong>Reduced severity</strong>
              {shapData.decreasing_factors.slice(0, 3).map((factor) => <span key={factor}>{factor}</span>)}
            </div>
          </div>
        </div>

        <div className="pt-1" aria-label="Feature contribution values">
          {shapData.top_contributions.map((item) => {
            const positive = item.impact > 0;
            const size = `${Math.max(9, (Math.abs(item.impact) / maxImpact) * 48)}%`;

            return (
              <div className="grid min-h-12 grid-cols-[minmax(100px,0.7fr)_minmax(150px,1fr)_52px] items-center gap-2.5 border-b border-line sm:grid-cols-[minmax(130px,0.8fr)_minmax(240px,1.4fr)_68px] sm:gap-[18px]" key={item.feature}>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold capitalize text-slate-700">{readableFeature(item.feature)}</span>
                <div className="relative h-[18px] before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-slate-300" aria-hidden="true">
                  <i
                    className={`absolute top-1 h-2.5 rounded-[3px] ${positive ? 'left-1/2 bg-danger' : 'right-1/2 bg-brand'}`}
                    style={{ width: size }}
                  />
                </div>
                <strong className={`text-right text-[13px] font-bold ${positive ? 'text-danger' : 'text-brand'}`}>
                  {positive ? '+' : ''}{item.impact}
                </strong>
              </div>
            );
          })}
          <div className="ml-[110px] mr-[62px] mt-3 flex justify-between gap-4 text-[11px] text-muted sm:ml-[148px] sm:mr-[86px]">
            <span>Reduces predicted severity</span>
            <span>Raises predicted severity</span>
          </div>
        </div>
      </section>

      <section className={`${ui.panel} mt-2.5`} aria-labelledby="global-explanation-title">
        <div className={ui.panelHeader}>
          <div>
            <h2 id="global-explanation-title">What matters across the dataset</h2>
            <p>Average SHAP magnitude across the primary 20,000-record dataset.</p>
          </div>
        </div>
        <div className={`${ui.panelBody} ${ui.chart}`}>
          <ResponsiveContainer width="100%" height={330} minHeight={330}>
            <BarChart data={globalShap} layout="vertical" margin={{ top: 8, right: 24, left: 118, bottom: 8 }}>
              <XAxis type="number" stroke="#7a8799" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#667085"
                fontSize={11}
                axisLine={false}
                tickLine={false}
                tickFormatter={readableFeature}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5fa' }} />
              <Bar dataKey="importance" name="Average importance" fill="#175cd3" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
