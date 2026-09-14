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
        <div className="flex items-center gap-3 text-cyan-400 font-medium">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Dataset 1 Multi-Dimensional Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cyan-400" />
          <span>Accident Analytics (Dataset 1)</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium">
          In-depth exploration of Indian roads accident historical factors
        </p>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800">
        {[
          { id: 'city', label: 'City Analysis', icon: <MapPin className="w-4 h-4" /> },
          { id: 'state', label: 'State Analysis', icon: <Building2 className="w-4 h-4" /> },
          { id: 'time', label: 'Time Analysis', icon: <Clock className="w-4 h-4" /> },
          { id: 'weather', label: 'Weather Analysis', icon: <CloudRain className="w-4 h-4" /> },
          { id: 'road', label: 'Road Infrastructure', icon: <Car className="w-4 h-4" /> },
          { id: 'cause', label: 'Accident Causes', icon: <AlertOctagon className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'text-gray-400 hover:text-gray-200 glass-card'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: CITY */}
      {activeTab === 'city' && (
        <div className="space-y-6">
          <div className="glass-card p-4 rounded-xl flex items-center gap-4 text-xs">
            <label className="font-bold text-gray-300">Select City for Deep Dive:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-900 border border-gray-700 rounded-lg px-3 py-1.5 text-gray-200 font-semibold"
            >
              {cityList.map(c => (
                <option key={c.city} value={c.city}>{c.city} ({c.total} accidents)</option>
              ))}
            </select>
          </div>

          {cityDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white">Severity Breakdown in {cityDetails.city}</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                    <div className="text-[10px] text-emerald-400">Minor</div>
                    <div className="text-xl font-bold">{cityDetails.severity_distribution.minor || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300">
                    <div className="text-[10px] text-amber-400">Major</div>
                    <div className="text-xl font-bold">{cityDetails.severity_distribution.major || 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
                    <div className="text-[10px] text-rose-400">Fatal</div>
                    <div className="text-xl font-bold">{cityDetails.severity_distribution.fatal || 0}</div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white">Hourly Distribution in {cityDetails.city}</h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(cityDetails.hourly_distribution).map(([h, cnt]) => ({ hour: `${h}:00`, count: cnt }))}>
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: STATE */}
      {activeTab === 'state' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white">State-Level Rankings & Severity Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-300">
              <thead className="bg-slate-900 text-gray-400 uppercase text-[10px] border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Total Accidents</th>
                  <th className="py-3 px-4 text-emerald-400">Minor</th>
                  <th className="py-3 px-4 text-amber-400">Major</th>
                  <th className="py-3 px-4 text-rose-400">Fatal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {stateData.map((row) => (
                  <tr key={row.state} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-4 font-bold text-cyan-400">#{row.rank}</td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-white">{row.state}</td>
                    <td className="py-2.5 px-4 font-bold text-gray-200">{row.total.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-emerald-400">{row.minor}</td>
                    <td className="py-2.5 px-4 text-amber-400">{row.major}</td>
                    <td className="py-2.5 px-4 text-rose-400 font-bold">{row.fatal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIME */}
      {activeTab === 'time' && timeData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">24-Hour Hourly Severity Profile</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData.hourly}>
                  <XAxis dataKey="hour_label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="minor" stroke="#10b981" strokeWidth={2} name="Minor" />
                  <Line type="monotone" dataKey="major" stroke="#f59e0b" strokeWidth={2} name="Major" />
                  <Line type="monotone" dataKey="fatal" stroke="#ef4444" strokeWidth={2} name="Fatal" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Day of Week Severity Profile</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData.day_of_week}>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="minor" stackId="a" fill="#10b981" name="Minor" />
                  <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                  <Bar dataKey="fatal" stackId="a" fill="#ef4444" name="Fatal" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEATHER */}
      {activeTab === 'weather' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white">Weather Condition vs Severity</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weatherData}>
                <XAxis dataKey="weather" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="minor" fill="#10b981" name="Minor" radius={[4, 4, 0, 0]} />
                <Bar dataKey="major" fill="#f59e0b" name="Major" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fatal" fill="#ef4444" name="Fatal" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROAD */}
      {activeTab === 'road' && roadData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Road Infrastructure Type vs Severity</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roadData.road_type}>
                  <XAxis dataKey="road_type" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="minor" stackId="a" fill="#10b981" />
                  <Bar dataKey="major" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="fatal" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Traffic Density vs Severity</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roadData.traffic_density}>
                  <XAxis dataKey="traffic_density" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="minor" fill="#10b981" />
                  <Bar dataKey="major" fill="#f59e0b" />
                  <Bar dataKey="fatal" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CAUSE */}
      {activeTab === 'cause' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white">Most Common Accident Causes</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={causeData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="cause" stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="minor" stackId="a" fill="#10b981" name="Minor" />
                <Bar dataKey="major" stackId="a" fill="#f59e0b" name="Major" />
                <Bar dataKey="fatal" stackId="a" fill="#ef4444" name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
