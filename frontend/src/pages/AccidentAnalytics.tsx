import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, Legend
} from 'recharts';
import { BarChart3, Building2, MapPin, Clock, CloudRain, Car, AlertOctagon, RefreshCw, PieChart as PieIcon, TrendingUp } from 'lucide-react';

import { 
  safeFetchJson, FALLBACK_CITIES, FALLBACK_STATES, 
  FALLBACK_TIME, FALLBACK_WEATHER, FALLBACK_ROADS, FALLBACK_CAUSES 
} from '../api/client';

export const AccidentAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'city' | 'state' | 'time' | 'weather' | 'road' | 'cause'>('city');

  const [cityList, setCityList] = useState<any[]>(FALLBACK_CITIES);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [cityDetails, setCityDetails] = useState<any>(FALLBACK_CITIES[0]);

  const [stateData, setStateData] = useState<any[]>(FALLBACK_STATES);
  const [timeData, setTimeData] = useState<any>(FALLBACK_TIME);
  const [weatherData, setWeatherData] = useState<any[]>(FALLBACK_WEATHER);
  const [roadData, setRoadData] = useState<any>(FALLBACK_ROADS);
  const [causeData, setCauseData] = useState<any[]>(FALLBACK_CAUSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  useEffect(() => {
    if (selectedCity) fetchCityDetails(selectedCity);
  }, [selectedCity]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [resCities, resStates, resTime, resWeather, resRoads, resCauses] = await Promise.all([
        safeFetchJson('/api/analytics/cities', undefined, FALLBACK_CITIES),
        safeFetchJson('/api/analytics/states', undefined, FALLBACK_STATES),
        safeFetchJson('/api/analytics/time', undefined, FALLBACK_TIME),
        safeFetchJson('/api/analytics/weather', undefined, FALLBACK_WEATHER),
        safeFetchJson('/api/analytics/roads', undefined, FALLBACK_ROADS),
        safeFetchJson('/api/analytics/causes', undefined, FALLBACK_CAUSES)
      ]);

      if (Array.isArray(resCities)) setCityList(resCities);
      if (Array.isArray(resStates)) setStateData(resStates);
      if (resTime?.hourly) setTimeData(resTime);
      if (Array.isArray(resWeather)) setWeatherData(resWeather);
      if (resRoads?.road_types) setRoadData(resRoads);
      if (Array.isArray(resCauses)) setCauseData(resCauses);
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityDetails = async (city: string) => {
    try {
      const fallback = FALLBACK_CITIES.find(c => c.city === city) || FALLBACK_CITIES[0];
      const data = await safeFetchJson(`/api/analytics/cities?city=${city}`, undefined, fallback);
      setCityDetails(data);
    } catch (e) {
      console.error('Error fetching city details:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-300 font-medium text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading Dataset 1 analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Accident Trends & Analytics Visualizer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical accident factor distribution across Indian road networks (Dataset 1)
        </p>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {[
          { id: 'city', label: 'City Analysis', icon: <MapPin className="w-3.5 h-3.5" /> },
          { id: 'state', label: 'State Analysis', icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: 'time', label: 'Time & Hourly Curve', icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'weather', label: 'Weather Hazard', icon: <CloudRain className="w-3.5 h-3.5" /> },
          { id: 'road', label: 'Road Infrastructure', icon: <Car className="w-3.5 h-3.5" /> },
          { id: 'cause', label: 'Accident Causes', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: CITY */}
      {activeTab === 'city' && (
        <div className="space-y-5">
          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <label className="font-bold text-slate-300">Select Target Metro City:</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-black/80 border border-white/15 rounded-xl px-3 py-1.5 text-white font-bold focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {cityList.map(c => (
                  <option key={c.city} value={c.city}>{c.city} ({c.total || c.total_accidents || (c.minor + c.major + c.fatal)} incidents)</option>
                ))}
              </select>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-xl border border-indigo-800/60">
              Interactive City Breakdown
            </span>
          </div>

          {(() => {
            const selectedObj = cityList.find(c => c.city === selectedCity) || cityList[0] || FALLBACK_CITIES[0];
            const currentCity = cityDetails || selectedObj;

            const minorCount = currentCity.minor ?? selectedObj?.minor ?? 0;
            const majorCount = currentCity.major ?? selectedObj?.major ?? 0;
            const fatalCount = currentCity.fatal ?? selectedObj?.fatal ?? 0;
            const totalAccidents = currentCity.total || currentCity.total_accidents || selectedObj?.total || (minorCount + majorCount + fatalCount) || 1;
            const stateName = currentCity.state || selectedObj?.state || 'Maharashtra';

            const fatalPct = ((fatalCount / totalAccidents) * 100).toFixed(1);
            const majorPct = ((majorCount / totalAccidents) * 100).toFixed(1);
            const minorPct = ((minorCount / totalAccidents) * 100).toFixed(1);

            const cityPie = [
              { name: 'Minor Injury', value: minorCount, color: '#10b981' },
              { name: 'Major Injury', value: majorCount, color: '#f59e0b' },
              { name: 'Fatal Severity', value: fatalCount, color: '#f43f5e' }
            ];

            return (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* BAR CHART & COUNTS */}
                <div className="md:col-span-7 glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      <span>Severity Breakdown in {selectedCity}</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">Dataset 1 Incidents</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Minor</div>
                      <div className="text-xl font-black text-emerald-400">{minorCount.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Major</div>
                      <div className="text-xl font-black text-amber-400">{majorCount.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-black/60 border border-rose-500/30">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Fatal</div>
                      <div className="text-xl font-black text-rose-400">{fatalCount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height={240} minHeight={240}>
                      <BarChart data={cityPie} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="minorGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#047857" stopOpacity={0.6}/>
                          </linearGradient>
                          <linearGradient id="majorGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#b45309" stopOpacity={0.6}/>
                          </linearGradient>
                          <linearGradient id="fatalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#be123c" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {cityPie.map((b, i) => (
                            <Cell key={i} fill={b.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PIE / DONUT RATIO CHART */}
                <div className="md:col-span-5 glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-indigo-400" />
                        <span>Proportional Severity Share</span>
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">{stateName}</span>
                    </div>

                    <div className="h-48 w-full relative flex items-center justify-center my-2">
                      <ResponsiveContainer width="100%" height={180} minHeight={180}>
                        <PieChart>
                          <Pie
                            data={cityPie}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {cityPie.map((entry, index) => (
                              <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#0b0f19" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-lg font-black text-white">{totalAccidents.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Total</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs font-mono">
                    <div className="flex justify-between p-2.5 rounded-xl bg-black/60 border border-rose-500/30">
                      <span className="text-slate-300 font-sans">Fatal Severity Share</span>
                      <span className="text-rose-400 font-black">{fatalPct}%</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-black/60 border border-amber-500/30">
                      <span className="text-slate-300 font-sans">Major Injury Share</span>
                      <span className="text-amber-400 font-black">{majorPct}%</span>
                    </div>
                    <div className="flex justify-between p-2.5 rounded-xl bg-black/60 border border-emerald-500/30">
                      <span className="text-slate-300 font-sans">Minor Incident Share</span>
                      <span className="text-emerald-400 font-black">{minorPct}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB CONTENT: TIME */}
      {activeTab === 'time' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/60 border border-indigo-500/30">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Peak Risk Window</div>
              <div className="text-lg font-black text-rose-400">18:00 - 22:00</div>
              <div className="text-[11px] text-slate-300">Evening rush & low light peak</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/30">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Highest Fatal Hour</div>
              <div className="text-lg font-black text-amber-400">12:00 PM - 1:00 PM</div>
              <div className="text-[11px] text-slate-300">147 Fatal crashes recorded</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/30">
              <div className="text-[10px] text-slate-400 font-bold uppercase">24-Hour Total Volume</div>
              <div className="text-lg font-black text-emerald-400">20,000 Incidents</div>
              <div className="text-[11px] text-slate-300">Monitored across 24 hourly ticks</div>
            </div>
          </div>

          {/* HOURLY SMOOTH AREA & STACKED BAR CHART */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Accident Volume & Trend Curve by Hour of Day (00:00 - 23:00)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">24-Hour Stacked Volume</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <AreaChart data={timeData?.hourly || []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <defs>
                    <linearGradient id="areaMinor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="areaMajor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="areaFatal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="minor" stackId="1" stroke="#10b981" fill="url(#areaMinor)" name="Minor Severity" />
                  <Area type="monotone" dataKey="major" stackId="1" stroke="#f59e0b" fill="url(#areaMajor)" name="Major Severity" />
                  <Area type="monotone" dataKey="fatal" stackId="1" stroke="#f43f5e" fill="url(#areaFatal)" name="Fatal Severity" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEATHER */}
      {activeTab === 'weather' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white">Weather Condition Risk Distribution</h3>
            <span className="text-xs text-slate-400 font-mono">Severity Breakdown</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={260} minHeight={260}>
              <BarChart data={weatherData}>
                <XAxis dataKey="weather" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => String(v).toUpperCase()} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="minor" stackId="a" fill="#10b981" name="Minor" />
                <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                <Bar dataKey="fatal" stackId="a" fill="#f43f5e" name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STATE */}
      {activeTab === 'state' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white">Accidents Across Indian States</h3>
            <span className="text-xs text-slate-400 font-mono">Ranked by Total Incidents</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={260} minHeight={260}>
              <BarChart data={stateData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="minor" stackId="a" fill="#10b981" name="Minor" />
                <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                <Bar dataKey="fatal" stackId="a" fill="#f43f5e" name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAUSE */}
      {activeTab === 'cause' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white">Primary Accident Causes</h3>
            <span className="text-xs text-slate-400 font-mono">Severity Breakdown</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={260} minHeight={260}>
              <BarChart data={causeData} layout="vertical" margin={{ left: 100, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="cause" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => String(v).replace('_', ' ').toUpperCase()} />
                <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="minor" stackId="a" fill="#10b981" name="Minor" />
                <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                <Bar dataKey="fatal" stackId="a" fill="#f43f5e" name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROAD */}
      {activeTab === 'road' && roadData && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-heading text-base font-bold text-white">Road Infrastructure Distribution</h3>
            <span className="text-xs text-slate-400 font-mono">Road Type vs Severity</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height={260} minHeight={260}>
              <BarChart data={roadData.road_types || roadData.by_type || []} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <XAxis dataKey="road_type" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => String(v).toUpperCase()} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090d', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="minor" stackId="a" fill="#10b981" name="Minor" />
                <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                <Bar dataKey="fatal" stackId="a" fill="#f43f5e" name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
