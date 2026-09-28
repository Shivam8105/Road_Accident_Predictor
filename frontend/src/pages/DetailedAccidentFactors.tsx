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
        <div className="flex items-center gap-3 text-slate-300 font-medium text-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Loading Dataset 2 detailed factors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5 tracking-tight">
          <Layers className="w-6 h-6 text-indigo-400" />
          <span>Detailed Accident Factors (Dataset 2)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Independent factor analysis covering driver characteristics, vehicle service age, road surface conditions, and casualty metrics (Road.csv)
        </p>
      </div>

      {/* INDEPENDENCE NOTICE */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-200">Dataset Isolation Note:</strong>
          <span className="ml-1 text-slate-400">
            {data.metadata.imbalance_warning}
          </span>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'driver', label: 'Driver Characteristics', icon: <UserCheck className="w-3.5 h-3.5" /> },
          { id: 'vehicle', label: 'Vehicle Factors', icon: <Truck className="w-3.5 h-3.5" /> },
          { id: 'road', label: 'Road Surface & Alignment', icon: <Route className="w-3.5 h-3.5" /> },
          { id: 'environment', label: 'Environmental Conditions', icon: <Sun className="w-3.5 h-3.5" /> },
          { id: 'accident', label: 'Collision Dynamics', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          { id: 'casualty', label: 'Casualty Demographics', icon: <Users className="w-3.5 h-3.5" /> },
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

      {/* TAB CONTENT: DRIVER */}
      {activeTab === 'driver' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Driver Age Band Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.driver_factors.age_band}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Driving Experience Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.driver_factors.experience}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: VEHICLE */}
      {activeTab === 'vehicle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Vehicle Type Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vehicle_factors.vehicle_type} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-100">Vehicle Defect Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vehicle_factors.defects}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS */}
      {(activeTab === 'road' || activeTab === 'environment' || activeTab === 'accident' || activeTab === 'casualty') && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Factor Category Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={
                activeTab === 'road' ? data.road_factors.surface_type :
                activeTab === 'environment' ? data.environmental_factors.light_conditions :
                activeTab === 'accident' ? data.accident_factors.cause_of_accident :
                data.casualty_factors.casualty_class
              }>
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
