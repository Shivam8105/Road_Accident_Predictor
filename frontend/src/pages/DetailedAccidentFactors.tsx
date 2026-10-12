import React, { useCallback, useEffect, useState } from 'react';
import type { Dataset2Analytics, Dataset2FactorItem } from '../types';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Route,
  Sun,
  Truck,
  UserCheck,
  Users,
} from 'lucide-react';
import { FALLBACK_DATASET2_ANALYTICS, safeFetchJson } from '../api/client';
import { ui } from '../ui';

type FactorTab = 'driver' | 'vehicle' | 'road' | 'environment' | 'accident' | 'casualty';

const tabs: Array<{ id: FactorTab; label: string; description: string; icon: React.ReactNode }> = [
  { id: 'driver', label: 'Driver characteristics', description: 'Age and driving experience', icon: <UserCheck size={17} /> },
  { id: 'vehicle', label: 'Vehicle factors', description: 'Type and recorded defects', icon: <Truck size={17} /> },
  { id: 'road', label: 'Road conditions', description: 'Surface and alignment', icon: <Route size={17} /> },
  { id: 'environment', label: 'Environment', description: 'Light and surrounding conditions', icon: <Sun size={17} /> },
  { id: 'accident', label: 'Collision dynamics', description: 'Reported causes', icon: <AlertTriangle size={17} /> },
  { id: 'casualty', label: 'Casualty profile', description: 'Recorded casualty classes', icon: <Users size={17} /> },
];

const tooltipStyle = {
  backgroundColor: '#fcfdff',
  borderColor: '#d9e1ec',
  borderRadius: '10px',
  fontSize: '12px',
  color: '#101828',
};

interface FactorChartProps {
  title: string;
  description: string;
  data: Dataset2FactorItem[];
  layout?: 'horizontal' | 'vertical';
  color?: string;
}

const FactorChart: React.FC<FactorChartProps> = ({ title, description, data, layout = 'horizontal', color = '#175cd3' }) => (
  <article className={ui.panel}>
    <div className={ui.panelHeader}>
      <div><h3>{title}</h3><p>{description}</p></div>
    </div>
    <div className={`${ui.panelBody} ${ui.chart}`}>
      <ResponsiveContainer width="100%" height={280} minHeight={280}>
        <BarChart
          data={data}
          layout={layout}
          margin={layout === 'vertical' ? { left: 90, right: 16, top: 8, bottom: 8 } : { left: -10, right: 12, top: 8, bottom: 8 }}
        >
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" stroke="#7a8799" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" stroke="#667085" fontSize={11} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey="category" stroke="#667085" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#7a8799" fontSize={11} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5fa' }} />
          <Bar dataKey="count" fill={color} radius={layout === 'vertical' ? [0, 5, 5, 0] : [5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </article>
);

export const DetailedAccidentFactors: React.FC = () => {
  const [data, setData] = useState<Dataset2Analytics>(FALLBACK_DATASET2_ANALYTICS);
  const [activeTab, setActiveTab] = useState<FactorTab>('driver');
  const [loading, setLoading] = useState(true);

  const fetchDataset2Analytics = useCallback(async () => {
    try {
      const response = await safeFetchJson<Dataset2Analytics>(
        '/api/dataset2/analytics',
        undefined,
        FALLBACK_DATASET2_ANALYTICS,
      );
      if (response?.driver_factors) setData(response);
    } catch (error) {
      console.error('Error fetching Dataset 2 analytics:', error);
      setData(FALLBACK_DATASET2_ANALYTICS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- state updates happen after the dataset request resolves.
    void fetchDataset2Analytics();
  }, [fetchDataset2Analytics]);

  const refreshFactors = () => {
    setLoading(true);
    void fetchDataset2Analytics();
  };

  if (loading) {
    return <div className={ui.loading}><div><RefreshCw size={19} className="animate-spin" /> Loading detailed factors...</div></div>;
  }

  const activeMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const singleChartData =
    activeTab === 'road' ? data.road_factors.surface_type
      : activeTab === 'environment' ? data.environmental_factors.light_conditions
        : activeTab === 'accident' ? data.accident_factors.cause_of_accident
          : data.casualty_factors.casualty_class;

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div>
          <h1>Look beyond the crash count.</h1>
          <p>Explore driver, vehicle, road, environment, collision, and casualty factors from the independent detailed dataset.</p>
        </div>
        <div className={ui.headerActions}>
          <button className={ui.button} type="button" onClick={refreshFactors}><RefreshCw size={16} /> Refresh data</button>
        </div>
      </header>

      <div className={`${ui.note} mb-7`}>
        <AlertCircle size={18} />
        <div><strong>Kept separate by design.</strong> {data.metadata.imbalance_warning}</div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-[clamp(2rem,6vw,4.875rem)]">
        <aside className="grid border-t border-line sm:grid-cols-3 lg:sticky lg:top-24 lg:grid-cols-1" aria-label="Factor categories">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`grid w-full grid-cols-[28px_minmax(0,1fr)] items-start gap-2.5 border-0 border-b border-line bg-transparent px-2.5 py-3.5 text-left text-muted transition hover:bg-surface hover:text-ink lg:border-l-[3px] ${activeTab === tab.id ? 'bg-brand-soft text-brand-deep shadow-[inset_0_-2px_0_#175cd3] lg:border-l-brand lg:shadow-none' : 'lg:border-l-transparent'} ${ui.focus}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="grid place-items-center pt-px">{tab.icon}</span>
              <span className="grid gap-0.5"><strong className="text-[13px] font-semibold">{tab.label}</strong><small className="text-[11px] leading-4 text-muted">{tab.description}</small></span>
            </button>
          ))}
        </aside>

        <section className="min-w-0" aria-live="polite">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-[38px] place-items-center rounded-[11px] bg-brand-soft text-brand">{activeMeta.icon}</span>
            <div><h2 className="m-0 text-[22px] font-semibold tracking-[-0.025em]">{activeMeta.label}</h2><p className="mt-1 text-[12px] text-muted">{activeMeta.description}</p></div>
          </div>

          {activeTab === 'driver' && (
            <div className="grid gap-5 md:grid-cols-2">
              <FactorChart title="Age bands" description="Recorded drivers grouped by age." data={data.driver_factors.age_band} />
              <FactorChart title="Driving experience" description="Years of experience reported for each driver." data={data.driver_factors.experience} color="#6d8fc3" />
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div className="grid gap-5 md:grid-cols-2">
              <FactorChart title="Vehicle types" description="Vehicle categories represented in the records." data={data.vehicle_factors.vehicle_type} layout="vertical" />
              <FactorChart title="Vehicle defects" description="Mechanical conditions noted in the dataset." data={data.vehicle_factors.defects} color="#b42318" />
            </div>
          )}

          {!['driver', 'vehicle'].includes(activeTab) && (
            <FactorChart
              title={`${activeMeta.label} distribution`}
              description="Counts for the selected factor category."
              data={singleChartData}
              layout={activeTab === 'accident' ? 'vertical' : 'horizontal'}
            />
          )}
        </section>
      </div>
    </div>
  );
};
