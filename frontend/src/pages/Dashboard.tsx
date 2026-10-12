import React, { useCallback, useEffect, useState } from 'react';
import type { OverviewKPIs } from '../types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import { safeFetchJson, FALLBACK_CITIES, FALLBACK_KPIS, FALLBACK_WEATHER } from '../api/client';
import { ui } from '../ui';

const severityColors = {
  minor: '#9ec3ee',
  major: '#e4bd78',
  fatal: '#d98f89',
};

const weatherColors = ['#78a7df', '#aec8e5', '#d7e1ed'];

const tooltipStyle = {
  backgroundColor: '#fcfdff',
  borderColor: '#d9e1ec',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#101828',
  boxShadow: '0 12px 30px rgba(35, 61, 98, 0.1)',
};

type CityDatum = (typeof FALLBACK_CITIES)[number];
type WeatherDatum = (typeof FALLBACK_WEATHER)[number];

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<OverviewKPIs>(FALLBACK_KPIS);
  const [cityData, setCityData] = useState<CityDatum[]>(FALLBACK_CITIES);
  const [weatherData, setWeatherData] = useState<WeatherDatum[]>(FALLBACK_WEATHER);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [resKpis, resCities, resWeather] = await Promise.all([
        safeFetchJson('/api/analytics/overview', undefined, FALLBACK_KPIS),
        safeFetchJson<CityDatum[]>('/api/analytics/cities', undefined, FALLBACK_CITIES),
        safeFetchJson<WeatherDatum[]>('/api/analytics/weather', undefined, FALLBACK_WEATHER),
      ]);

      if (resKpis?.total_accidents) setKpis(resKpis);
      if (Array.isArray(resCities)) setCityData(resCities.slice(0, 8));
      if (Array.isArray(resWeather)) setWeatherData(resWeather);
    } catch (error) {
      console.log('Using default analytics dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- state updates happen after the analytics request resolves.
    void fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshDashboard = () => {
    setLoading(true);
    void fetchDashboardData();
  };

  const totalForShare = kpis.total_accidents || 1;
  const weatherTotal = weatherData.reduce((total, item) => total + Number(item.total), 0);

  const severityRows = [
    {
      label: 'Minor',
      value: kpis.minor_accidents,
      share: (kpis.minor_accidents / totalForShare) * 100,
      color: severityColors.minor,
    },
    {
      label: 'Major',
      value: kpis.major_accidents,
      share: (kpis.major_accidents / totalForShare) * 100,
      color: severityColors.major,
    },
    {
      label: 'Fatal',
      value: kpis.fatal_accidents,
      share: kpis.fatal_percentage,
      color: severityColors.fatal,
    },
  ];

  return (
    <div className={ui.page} aria-busy={loading}>
      <header className="mb-9 grid items-end gap-6 border-b border-line pb-7 md:grid-cols-[minmax(0,1fr)_auto] lg:mb-11">
        <div>
          <h1 className="m-0 max-w-[720px] text-[clamp(2.3rem,4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">Road safety overview</h1>
          <p className="mt-3 max-w-[650px] text-[15px] leading-6 text-muted">Severity, location, and weather patterns from the primary accident dataset.</p>
        </div>
        <div className="flex items-center md:justify-end">
          <button className={ui.button} type="button" onClick={refreshDashboard} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin motion-reduce:animate-none' : ''} aria-hidden="true" />
            {loading ? 'Refreshing' : 'Refresh data'}
          </button>
        </div>
      </header>

      <section className="mb-10 grid items-end gap-10 border-b border-line pb-10 lg:grid-cols-[minmax(280px,0.72fr)_minmax(540px,1.28fr)] lg:gap-[clamp(3.5rem,9vw,8rem)] lg:pb-12" aria-label="Accident overview">
        <div>
          <span className="text-[13px] font-semibold text-brand-deep">Recorded incidents</span>
          <strong className="my-3 block text-[clamp(4rem,7vw,7rem)] font-medium leading-[0.9] tracking-[-0.07em] text-ink">{kpis.total_accidents.toLocaleString()}</strong>
          <p className="m-0 max-w-[360px] text-[14px] leading-6 text-muted">Observed across {kpis.total_cities} cities in {kpis.total_states} states.</p>
        </div>
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Severity distribution</h2>
          <p className="mt-2 text-[13px] leading-5 text-muted">Every city is measured against the same three outcome levels.</p>
          <div className="mt-5 grid border-y border-line sm:grid-cols-3">
            {severityRows.map((row) => (
              <div key={row.label} className="flex min-h-[138px] flex-col justify-between border-b border-line py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
                <span className="flex items-center gap-2.5 text-[13px] font-semibold text-slate-700">
                  <span className="h-1.5 w-6 rounded-[2px]" style={{ backgroundColor: row.color }} aria-hidden="true" />
                  {row.label}
                </span>
                <div>
                  <strong className="block text-[28px] font-semibold tracking-[-0.04em] text-ink">{row.value.toLocaleString()}</strong>
                  <span className="mt-1 block text-[12px] text-muted">{row.share.toFixed(1)}% of records</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[12px] border border-line bg-surface lg:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.65fr)]" aria-label="Accident charts">
        <article className="min-w-0 border-b border-line lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-5 border-b border-line px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:py-6">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink">Severity by city</h2>
              <p className="mt-1.5 text-[13px] leading-5 text-muted">The eight highest-volume cities on one comparable scale.</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Severity chart legend">
              {severityRows.map((row) => (
                <span className="flex items-center gap-2 text-[11px] font-semibold text-slate-600" key={row.label}>
                  <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: row.color }} aria-hidden="true" />
                  {row.label}
                </span>
              ))}
            </div>
          </div>
          <div className="min-h-[410px] px-2 py-6 pr-4 sm:px-5 sm:pr-7">
            <ResponsiveContainer width="100%" height={360} minHeight={360}>
              <BarChart data={cityData} layout="vertical" margin={{ top: 2, right: 8, left: 4, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid horizontal={false} stroke="#e5ebf2" />
                <XAxis type="number" stroke="#7a8799" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis dataKey="city" type="category" width={76} stroke="#5f6c80" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f4f7fb' }} />
                <Bar dataKey="minor" stackId="severity" fill={severityColors.minor} name="Minor" />
                <Bar dataKey="major" stackId="severity" fill={severityColors.major} name="Major" />
                <Bar dataKey="fatal" stackId="severity" fill={severityColors.fatal} name="Fatal" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="min-w-0">
          <div className="border-b border-line px-5 py-5 sm:px-7 sm:py-6">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.025em] text-ink">Weather conditions</h2>
              <p className="mt-1.5 text-[13px] leading-5 text-muted">Conditions recorded at the time of each incident.</p>
            </div>
          </div>
          <div className="grid min-h-[410px] grid-rows-[1fr_auto] items-center px-5 py-6 sm:px-7">
            <div className="relative min-w-0">
              <ResponsiveContainer width="100%" height={245} minHeight={245}>
                <PieChart>
                  <Pie
                    data={weatherData}
                    dataKey="total"
                    nameKey="weather"
                    cx="50%"
                    cy="50%"
                    innerRadius={67}
                    outerRadius={96}
                    paddingAngle={1.5}
                    stroke="#fcfdff"
                    strokeWidth={3}
                  >
                    {weatherData.map((_, index) => (
                      <Cell key={index} fill={weatherColors[index % weatherColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1" aria-hidden="true">
                <strong className="text-[24px] font-semibold tracking-[-0.04em] text-ink">{weatherTotal.toLocaleString()}</strong>
                <span className="mt-0.5 text-[11px] text-muted">incidents</span>
              </div>
            </div>
            <div className="border-t border-line">
              {weatherData.map((item, index) => (
                <div className="grid min-h-12 grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line text-[12px] last:border-b-0" key={item.weather}>
                  <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: weatherColors[index % weatherColors.length] }} aria-hidden="true" />
                  <strong className="font-semibold capitalize text-slate-700">{String(item.weather).replaceAll('_', ' ')}</strong>
                  <span className="text-right text-muted">
                    {Number(item.total).toLocaleString()} <span className="ml-1 text-slate-400">{weatherTotal > 0 ? `${((Number(item.total) / weatherTotal) * 100).toFixed(1)}%` : '0.0%'}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};
