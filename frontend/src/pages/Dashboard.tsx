import React, { useEffect, useState } from 'react';
import type { OverviewKPIs } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, ShieldCheck, Skull, Building2, TrendingUp, RefreshCw, MapPin } from 'lucide-react';

import { safeFetchJson, FALLBACK_KPIS, FALLBACK_CITIES, FALLBACK_WEATHER } from '../api/client';

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<OverviewKPIs>(FALLBACK_KPIS);
  const [cityData, setCityData] = useState<any[]>(FALLBACK_CITIES);
  const [weatherData, setWeatherData] = useState<any[]>(FALLBACK_WEATHER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resKpis, resCities, resWeather] = await Promise.all([
        safeFetchJson('/api/analytics/overview', undefined, FALLBACK_KPIS),
        safeFetchJson('/api/analytics/cities', undefined, FALLBACK_CITIES),
        safeFetchJson('/api/analytics/weather', undefined, FALLBACK_WEATHER)
      ]);

      if (resKpis?.total_accidents) setKpis(resKpis);
      if (Array.isArray(resCities)) setCityData(resCities.slice(0, 8));
      if (Array.isArray(resWeather)) setWeatherData(resWeather);
    } catch (e) {
      console.log('Using default analytics dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const SEVERITY_COLORS = {
    minor: '#10b981', // Emerald
    major: '#f59e0b', // Amber
    fatal: '#f43f5e'  // Rose
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <span>Road Safety Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of historical accident severity and factors across 20,000 recorded incidents
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 cursor-pointer w-fit transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4.5 rounded-2xl border border-slate-800 space-y-1 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-semibold">Total Incidents</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-white">{kpis.total_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 font-medium">Recorded Hotspots</div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl border border-slate-800 space-y-1 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-semibold text-emerald-400">Minor Severity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-emerald-400">{kpis.minor_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 font-medium">
            {((kpis.minor_accidents / kpis.total_accidents) * 100).toFixed(1)}% of total cases
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl border border-slate-800 space-y-1 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-semibold text-amber-400">Major Severity</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-amber-400">{kpis.major_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 font-medium">
            {((kpis.major_accidents / kpis.total_accidents) * 100).toFixed(1)}% of total cases
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl border border-slate-800 space-y-1 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-semibold text-rose-400">Fatal Severity</span>
            <Skull className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-rose-400">{kpis.fatal_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-rose-400 font-semibold">
            {kpis.fatal_percentage}% Fatal Rate
          </div>
        </div>

        <div className="glass-card p-4.5 rounded-2xl border border-slate-800 space-y-1 col-span-2 md:col-span-1 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-semibold text-indigo-400">Coverage</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-heading text-2xl font-bold text-white">{kpis.total_cities} <span className="text-xs font-normal text-slate-400">Cities</span></div>
          <div className="text-[11px] text-slate-400 font-medium">{kpis.total_states} States Analyzed</div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Breakdown Stacked Bar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-indigo-400" />
              <span>Top Cities by Severity Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Incident Density</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={240} minHeight={240}>
              <BarChart data={cityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="city" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="minor" stackId="a" fill={SEVERITY_COLORS.minor} name="Minor" />
                <Bar dataKey="major" stackId="a" fill={SEVERITY_COLORS.major} name="Major" />
                <Bar dataKey="fatal" stackId="a" fill={SEVERITY_COLORS.fatal} name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Distribution Donut Chart */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-amber-400" />
              <span>Weather Conditions Distribution</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Impact Breakdown</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240} minHeight={240}>
              <PieChart>
                <Pie
                  data={weatherData}
                  dataKey="total"
                  nameKey="weather"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {weatherData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'][index % 5]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
