import React, { useEffect, useState } from 'react';
import type { Dataset2Analytics } from '../types';
import { 
  Layers, UserCheck, Truck, Route, Sun, AlertTriangle, Users, RefreshCw, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DetailedAccidentFactors: React.FC = () => {
  const [data, setData] = useState<Dataset2Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'driver' | 'vehicle' | 'road' | 'environment' | 'accident' | 'casualty'>('driver');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataset2Analytics();
  }, []);

  const fetchDataset2Analytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dataset2/analytics');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error('Error fetching Dataset 2 analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-indigo-400 font-medium">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Dataset 2 Detailed Factor Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Layers className="w-8 h-8 text-indigo-400" />
          <span>Detailed Accident Factors (Dataset 2: Road.csv)</span>
        </h1>
        <p className="text-xs text-gray-400 font-medium">
          Independent exploratory factor analysis covering driver, vehicle, road surface, environmental, and casualty metrics
        </p>
      </div>

      {/* IMBALANCE & SEPARATION NOTICE */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200">
        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-white">Dataset Independence & Severity Distribution Warning:</strong>
          <p className="mt-0.5">
            {data.metadata.imbalance_warning}
          </p>
        </div>
      </div>

      {/* SEVERITY BREAKDOWN BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.severity_distribution.map((item, idx) => (
          <div key={idx} className="glass-card p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 font-semibold">{item.label}</div>
              <div className="text-2xl font-black text-white">{item.count.toLocaleString()}</div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              idx === 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              idx === 1 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* FACTOR SUB-TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-800">
        {[
          { id: 'driver', label: 'Driver Characteristics', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'vehicle', label: 'Vehicle Factors', icon: <Truck className="w-4 h-4" /> },
          { id: 'road', label: 'Road & Surface', icon: <Route className="w-4 h-4" /> },
          { id: 'environment', label: 'Light & Weather', icon: <Sun className="w-4 h-4" /> },
          { id: 'accident', label: 'Collision & Cause', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'casualty', label: 'Casualty Factors', icon: <Users className="w-4 h-4" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-gray-200 glass-card'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* DRIVER TAB */}
      {activeTab === 'driver' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Driver Age Band Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.driver_factors.age_band}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Driving Experience Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.driver_factors.experience}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE TAB */}
      {activeTab === 'vehicle' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Type of Vehicle Involved</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vehicle_factors.vehicle_type} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Vehicle Service Age Breakdown</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vehicle_factors.service_years}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ROAD TAB */}
      {activeTab === 'road' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Road Surface Condition</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.road_factors.surface_condition}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Area Accident Occurred</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.road_factors.area} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={130} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ENVIRONMENT TAB */}
      {activeTab === 'environment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Light Conditions Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.environmental_factors.light_conditions}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Weather Conditions Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.environmental_factors.weather_conditions}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ACCIDENT TAB */}
      {activeTab === 'accident' && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white">Collision Type vs Severity</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.accident_factors.cause_vs_severity} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={160} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="slight" stackId="a" fill="#10b981" name="Slight" />
                <Bar dataKey="serious" stackId="a" fill="#f59e0b" name="Serious" />
                <Bar dataKey="fatal" stackId="a" fill="#ef4444" name="Fatal" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CASUALTY TAB */}
      {activeTab === 'casualty' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Casualty Class Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.casualty_factors.casualty_class}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Casualty Age Band Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.casualty_factors.age_band}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
