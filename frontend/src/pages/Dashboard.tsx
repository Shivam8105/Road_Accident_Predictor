import React, { useEffect, useState } from 'react';
import type { OverviewKPIs } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { AlertTriangle, ShieldCheck, Skull, Building2, TrendingUp, RefreshCw, MapPin } from 'lucide-react';

const DEFAULT_KPIS: OverviewKPIs = {
  total_accidents: 20000,
  minor_accidents: 11025,
  major_accidents: 5988,
  fatal_accidents: 2987,
  fatal_percentage: 14.94,
  total_cities: 15,
  total_states: 7
};

const DEFAULT_CITIES = [
  { city: "Mumbai", total: 1480, minor: 810, major: 450, fatal: 220 },
  { city: "Delhi", total: 1450, minor: 790, major: 440, fatal: 220 },
  { city: "Bangalore", total: 1420, minor: 780, major: 430, fatal: 210 },
  { city: "Chennai", total: 1390, minor: 760, major: 420, fatal: 210 },
  { city: "Kolkata", total: 1360, minor: 750, major: 410, fatal: 200 },
  { city: "Hyderabad", total: 1340, minor: 740, major: 400, fatal: 200 },
  { city: "Pune", total: 1310, minor: 720, major: 390, fatal: 200 },
  { city: "Ahmedabad", total: 1290, minor: 710, major: 380, fatal: 200 }
];

const DEFAULT_WEATHER = [
  { weather: "clear", total: 9800, minor: 5400, major: 2930, fatal: 1470 },
  { weather: "rain", total: 6100, minor: 3360, major: 1830, fatal: 910 },
  { weather: "fog", total: 4100, minor: 2265, major: 1228, fatal: 607 }
];

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<OverviewKPIs>(DEFAULT_KPIS);
  const [cityData, setCityData] = useState<any[]>(DEFAULT_CITIES);
  const [weatherData, setWeatherData] = useState<any[]>(DEFAULT_WEATHER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resKpis, resCities, resWeather] = await Promise.all([
        fetch('/api/analytics/overview').then(r => r.json()),
        fetch('/api/analytics/cities').then(r => r.json()),
        fetch('/api/analytics/weather').then(r => r.json())
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
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Accident Analytics Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dataset 1 Overview — Indian Roads Historical Distribution (20,000 Records)
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700/80 cursor-pointer w-fit transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Accidents</span>
            <AlertTriangle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{kpis.total_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Dataset 1 records</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-emerald-400">Minor Severity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{kpis.minor_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">
            {((kpis.minor_accidents / kpis.total_accidents) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-amber-400">Major Severity</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{kpis.major_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">
            {((kpis.major_accidents / kpis.total_accidents) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-rose-400">Fatal Severity</span>
            <Skull className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{kpis.fatal_accidents.toLocaleString()}</div>
          <div className="text-[11px] text-rose-400 font-medium">
            {kpis.fatal_percentage}% Fatal Rate
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-indigo-400">Geographic Coverage</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{kpis.total_cities} <span className="text-xs font-normal text-slate-400">Cities</span></div>
          <div className="text-[11px] text-slate-400">{kpis.total_states} States Covered</div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* City Breakdown Stacked Bar Chart */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>Top Cities by Severity Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">Accident Count</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar dataKey="minor" stackId="a" fill={SEVERITY_COLORS.minor} name="Minor" />
                <Bar dataKey="major" stackId="a" fill={SEVERITY_COLORS.major} name="Major" />
                <Bar dataKey="fatal" stackId="a" fill={SEVERITY_COLORS.fatal} name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Distribution Donut Chart */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Weather Conditions Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
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
                      fill={['#6366f1', '#f59e0b', '#f43f5e', '#8b5cf6', '#10b981'][index % 5]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
