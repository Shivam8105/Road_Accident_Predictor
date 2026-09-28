import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { BarChart3, Building2, MapPin, Clock, CloudRain, Car, AlertOctagon, RefreshCw } from 'lucide-react';

export const AccidentAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'city' | 'state' | 'time' | 'weather' | 'road' | 'cause'>('city');

  const [cityList, setCityList] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [cityDetails, setCityDetails] = useState<any>(null);

  const [stateData, setStateData] = useState<any[]>([]);
  const [timeData, setTimeData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [roadData, setRoadData] = useState<any>(null);
  const [causeData, setCauseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        fetch('/api/analytics/cities').then(r => r.json()),
        fetch('/api/analytics/states').then(r => r.json()),
        fetch('/api/analytics/time').then(r => r.json()),
        fetch('/api/analytics/weather').then(r => r.json()),
        fetch('/api/analytics/roads').then(r => r.json()),
        fetch('/api/analytics/causes').then(r => r.json())
      ]);

      setCityList(resCities);
      setStateData(resStates);
      setTimeData(resTime);
      setWeatherData(resWeather);
      setRoadData(resRoads);
      setCauseData(resCauses);
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityDetails = async (city: string) => {
    try {
      const res = await fetch(`/api/analytics/cities?city=${city}`);
      if (res.ok) setCityDetails(await res.json());
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
          <span>Accident Trends & Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical accident factor distribution across Indian road networks (Dataset 1)
        </p>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'city', label: 'City Analysis', icon: <MapPin className="w-3.5 h-3.5" /> },
          { id: 'state', label: 'State Analysis', icon: <Building2 className="w-3.5 h-3.5" /> },
          { id: 'time', label: 'Time Analysis', icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'weather', label: 'Weather Analysis', icon: <CloudRain className="w-3.5 h-3.5" /> },
          { id: 'road', label: 'Road Infrastructure', icon: <Car className="w-3.5 h-3.5" /> },
          { id: 'cause', label: 'Accident Causes', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
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
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
            <label className="font-medium text-slate-300">Select City:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-medium"
            >
              {cityList.map(c => (
                <option key={c.city} value={c.city}>{c.city} ({c.total} accidents)</option>
              ))}
            </select>
          </div>

          {cityDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-100">Severity Breakdown in {cityDetails.city}</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Minor</div>
                    <div className="text-lg font-bold text-emerald-400">{cityDetails.minor}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Major</div>
                    <div className="text-lg font-bold text-amber-400">{cityDetails.major}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-medium">Fatal</div>
                    <div className="text-lg font-bold text-rose-400">{cityDetails.fatal}</div>
                  </div>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[cityDetails]}>
                      <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                      <Bar dataKey="minor" fill="#10b981" name="Minor" />
                      <Bar dataKey="major" fill="#f59e0b" name="Major" />
                      <Bar dataKey="fatal" fill="#f43f5e" name="Fatal" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">City Hotspot Overview</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Historical accident density profile for {cityDetails.city}, {cityDetails.state}. Recorded total: <strong className="text-slate-200">{cityDetails.total}</strong> incidents.
                </p>
                <div className="space-y-2 pt-2 text-xs font-mono">
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Fatal Rate %</span>
                    <span className="text-rose-400 font-bold">{((cityDetails.fatal / cityDetails.total) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Major Injury Rate %</span>
                    <span className="text-amber-400 font-bold">{((cityDetails.major / cityDetails.total) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Minor Incident Rate %</span>
                    <span className="text-emerald-400 font-bold">{((cityDetails.minor / cityDetails.total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: TIME */}
      {activeTab === 'time' && timeData && (
        <div className="space-y-5">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Accident Volume by Hour of Day</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData.hourly}>
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="accidents" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEATHER */}
      {activeTab === 'weather' && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Weather Condition Risk Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weatherData}>
                <XAxis dataKey="weather" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
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
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">State Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <XAxis dataKey="state" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAUSE */}
      {activeTab === 'cause' && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Primary Cause Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={causeData} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="cause" stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROAD */}
      {activeTab === 'road' && roadData && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Road Infrastructure Types</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roadData.by_type}>
                <XAxis dataKey="road_type" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
