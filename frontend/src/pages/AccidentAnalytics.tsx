import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertOctagon,
  BarChart3,
  Building2,
  Car,
  Clock,
  CloudRain,
  MapPin,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  FALLBACK_CAUSES,
  FALLBACK_CITIES,
  FALLBACK_ROADS,
  FALLBACK_STATES,
  FALLBACK_TIME,
  FALLBACK_WEATHER,
  safeFetchJson
} from '../api/client';
import { ui } from '../ui';

type AnalyticsTab = 'city' | 'state' | 'time' | 'weather' | 'road' | 'cause';

interface SeverityDatum {
  [key: string]: string | number | undefined;
  total: number;
  minor: number;
  major: number;
  fatal: number;
}

interface CityDatum extends SeverityDatum {
  city: string;
  state: string;
  total_accidents?: number;
}

interface StateDatum extends SeverityDatum {
  state: string;
}

interface WeatherDatum extends SeverityDatum {
  weather: string;
}

interface RoadDatum extends SeverityDatum {
  road_type: string;
}

interface CauseDatum {
  cause: string;
  total: number;
  fatal: number;
}

interface TimeDatum extends SeverityDatum {
  hour: number;
  accidents?: number;
}

interface TimeData {
  hourly: TimeDatum[];
}

interface RoadData {
  road_types?: RoadDatum[];
  by_type?: RoadDatum[];
}

const tabs: Array<{ id: AnalyticsTab; label: string; icon: React.ReactNode }> = [
  { id: 'city', label: 'Cities', icon: <MapPin size={15} /> },
  { id: 'state', label: 'States', icon: <Building2 size={15} /> },
  { id: 'time', label: 'Time', icon: <Clock size={15} /> },
  { id: 'weather', label: 'Weather', icon: <CloudRain size={15} /> },
  { id: 'road', label: 'Roads', icon: <Car size={15} /> },
  { id: 'cause', label: 'Causes', icon: <AlertOctagon size={15} /> }
];

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #d9e1ec',
  borderRadius: '10px',
  boxShadow: '0 12px 28px rgb(16 24 40 / 0.12)',
  color: '#101828',
  fontSize: '12px'
};

const formatLabel = (value: unknown) => String(value).replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());

interface DistributionChartProps {
  data: SeverityDatum[];
  dataKey: string;
  layout?: 'horizontal' | 'vertical';
}

const DistributionChart: React.FC<DistributionChartProps> = ({ data, dataKey, layout = 'horizontal' }) => (
  <div className={`${ui.chart} min-h-[340px]`}>
    <ResponsiveContainer width="100%" height={340} minHeight={340}>
      <BarChart
        data={data}
        layout={layout}
        margin={layout === 'vertical' ? { top: 8, right: 24, bottom: 8, left: 54 } : { top: 8, right: 10, bottom: 20, left: 0 }}
      >
        <CartesianGrid strokeDasharray="2 5" vertical={layout !== 'vertical'} horizontal={layout === 'vertical'} />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" fontSize={11} />
            <YAxis type="category" dataKey={dataKey} width={118} fontSize={11} tickFormatter={formatLabel} />
          </>
        ) : (
          <>
            <XAxis dataKey={dataKey} fontSize={11} interval={0} tickFormatter={formatLabel} />
            <YAxis fontSize={11} />
          </>
        )}
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '14px' }} />
        <Bar dataKey="minor" stackId="severity" fill="#19725d" name="Minor" radius={layout === 'vertical' ? [0, 0, 0, 0] : [3, 3, 0, 0]} />
        <Bar dataKey="major" stackId="severity" fill="#d28a2d" name="Major" />
        <Bar dataKey="fatal" stackId="severity" fill="#b42318" name="Fatal" radius={layout === 'vertical' ? [0, 3, 3, 0] : [3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const AccidentAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('city');
  const [cityList, setCityList] = useState<CityDatum[]>(FALLBACK_CITIES);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [cityDetails, setCityDetails] = useState<CityDatum>(FALLBACK_CITIES[0]);
  const [stateData, setStateData] = useState<StateDatum[]>(FALLBACK_STATES);
  const [timeData, setTimeData] = useState<TimeData>(FALLBACK_TIME);
  const [weatherData, setWeatherData] = useState<WeatherDatum[]>(FALLBACK_WEATHER);
  const [roadData, setRoadData] = useState<RoadData>(FALLBACK_ROADS);
  const [causeData, setCauseData] = useState<CauseDatum[]>(FALLBACK_CAUSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      safeFetchJson<CityDatum[]>('/api/analytics/cities', undefined, FALLBACK_CITIES),
      safeFetchJson<StateDatum[]>('/api/analytics/states', undefined, FALLBACK_STATES),
      safeFetchJson<TimeData>('/api/analytics/time', undefined, FALLBACK_TIME),
      safeFetchJson<WeatherDatum[]>('/api/analytics/weather', undefined, FALLBACK_WEATHER),
      safeFetchJson<RoadData>('/api/analytics/roads', undefined, FALLBACK_ROADS),
      safeFetchJson<CauseDatum[]>('/api/analytics/causes', undefined, FALLBACK_CAUSES)
    ])
      .then(([cities, states, time, weather, roads, causes]) => {
        if (!active) return;
        if (Array.isArray(cities)) setCityList(cities);
        if (Array.isArray(states)) setStateData(states);
        if (time?.hourly) setTimeData(time);
        if (Array.isArray(weather)) setWeatherData(weather);
        if (roads?.road_types || roads?.by_type) setRoadData(roads);
        if (Array.isArray(causes)) setCauseData(causes);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const fallback = cityList.find((city) => city.city === selectedCity) || FALLBACK_CITIES[0];
    safeFetchJson<CityDatum>(`/api/analytics/cities?city=${encodeURIComponent(selectedCity)}`, undefined, fallback)
      .then((data) => {
        if (active) setCityDetails(data);
      });

    return () => {
      active = false;
    };
  }, [cityList, selectedCity]);

  const currentCity = useMemo(() => {
    const listedCity = cityList.find((city) => city.city === selectedCity) || cityList[0] || FALLBACK_CITIES[0];
    const details = cityDetails?.city === selectedCity ? cityDetails : listedCity;
    return {
      ...listedCity,
      ...details,
      total: details.total || details.total_accidents || listedCity.total
    };
  }, [cityDetails, cityList, selectedCity]);

  const highestHour = useMemo(() => (
    timeData.hourly.reduce(
      (highest, hour) => (hour.total > highest.total ? hour : highest),
      timeData.hourly[0] || FALLBACK_TIME.hourly[0]
    )
  ), [timeData]);

  if (loading) {
    return <div className={ui.loading}><div><RefreshCw className="animate-spin" size={20} /> Preparing the research view</div></div>;
  }

  const citySeverity = [
    { label: 'Minor', value: currentCity.minor, color: '#19725d' },
    { label: 'Major', value: currentCity.major, color: '#d28a2d' },
    { label: 'Fatal', value: currentCity.fatal, color: '#b42318' }
  ];
  const currentCityTotal = Math.max(currentCity.total, 1);

  const renderPanel = () => {
    if (activeTab === 'city') {
      return (
        <div className="grid items-start gap-11 pt-2 lg:grid-cols-[minmax(280px,0.68fr)_minmax(540px,1.32fr)] lg:gap-[clamp(2.75rem,7vw,5.75rem)]">
          <aside className="grid gap-8 pt-2.5">
            <div className={ui.field}>
              <label htmlFor="analytics-city">City in focus</label>
              <select id="analytics-city" value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                {cityList.map((city) => <option key={city.city} value={city.city}>{city.city}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[12px] font-semibold text-muted">{currentCity.state}</span>
              <strong className="my-2 block text-[clamp(4.2rem,7vw,7rem)] font-medium leading-[0.9] tracking-[-0.075em] text-ink">{currentCity.total.toLocaleString()}</strong>
              <p className="m-0 text-[12px] text-muted">recorded accidents in this dataset</p>
            </div>
            <div className="border-t border-line">
              {citySeverity.map((item) => (
                <div className="grid min-h-[50px] grid-cols-[4px_minmax(80px,1fr)_auto_48px] items-center gap-3 border-b border-line text-[12px]" key={item.label}>
                  <i className="h-6 w-1 rounded-[2px]" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <strong className="font-bold text-ink">{item.value.toLocaleString()}</strong>
                  <em className="text-right not-italic text-muted">{((item.value / currentCityTotal) * 100).toFixed(1)}%</em>
                </div>
              ))}
            </div>
          </aside>
          <section className={`${ui.panel} min-w-0`}>
            <div className={`${ui.panelHeader} [&>svg]:text-brand`}>
              <div><h2>How severity is distributed</h2><p>A direct count comparison for {selectedCity}.</p></div>
              <BarChart3 size={18} />
            </div>
            <div className={ui.panelBody}>
              <ResponsiveContainer width="100%" height={360} minHeight={360}>
                <BarChart data={citySeverity} margin={{ top: 16, right: 8, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 5" vertical={false} />
                  <XAxis dataKey="label" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {citySeverity.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'time') {
      return (
        <div className="grid items-stretch gap-9 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-[clamp(2.25rem,6vw,4.75rem)]">
          <aside className="grid content-start border-t border-line [&>div]:grid [&>div]:gap-1.5 [&>div]:border-b [&>div]:border-line [&>div]:py-5 [&_span]:text-[11px] [&_span]:font-semibold [&_span]:text-muted [&_strong]:text-[19px] [&_strong]:font-semibold [&_strong]:tracking-[-0.025em] [&_p]:m-0 [&_p]:text-[11px] [&_p]:leading-4 [&_p]:text-muted">
            <div><span>Peak volume</span><strong>{String(highestHour.hour).padStart(2, '0')}:00</strong><p>{highestHour.total.toLocaleString()} incidents</p></div>
            <div><span>Evening window</span><strong>18:00 to 22:00</strong><p>Traffic volume and lower visibility overlap.</p></div>
            <div><span>Coverage</span><strong>24 hours</strong><p>Severity shown as a continuous daily profile.</p></div>
          </aside>
          <section className={`${ui.panel} min-w-0`}>
            <div className={`${ui.panelHeader} [&>svg]:text-brand`}>
              <div><h2>The day has a risk shape</h2><p>Accident volume by hour, stacked by recorded severity.</p></div>
              <TrendingUp size={18} />
            </div>
            <div className={ui.panelBody}>
              <ResponsiveContainer width="100%" height={390} minHeight={390}>
                <AreaChart data={timeData.hourly} margin={{ top: 12, right: 10, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 5" vertical={false} />
                  <XAxis dataKey="hour" fontSize={11} tickFormatter={(hour) => `${String(hour).padStart(2, '0')}:00`} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} labelFormatter={(hour) => `${String(hour).padStart(2, '0')}:00`} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '14px' }} />
                  <Area type="monotone" dataKey="minor" stackId="severity" stroke="#19725d" fill="#a9d8ca" name="Minor" />
                  <Area type="monotone" dataKey="major" stackId="severity" stroke="#9a5b13" fill="#f0c77f" name="Major" />
                  <Area type="monotone" dataKey="fatal" stackId="severity" stroke="#b42318" fill="#e8a19a" name="Fatal" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      );
    }

    const panelConfig = {
      state: {
        title: 'Where the incidents concentrate',
        description: 'States ranked by total recorded severity.',
        data: stateData,
        key: 'state'
      },
      weather: {
        title: 'Conditions change the mix',
        description: 'Severity distribution under clear, rain, and fog conditions.',
        data: weatherData,
        key: 'weather'
      },
      road: {
        title: 'Road form changes exposure',
        description: 'Highways, urban roads, expressways, and rural routes compared.',
        data: roadData.road_types || roadData.by_type || [],
        key: 'road_type'
      }
    };

    if (activeTab === 'cause') {
      return (
        <section className={`${ui.panel} min-w-0`}>
          <div className={`${ui.panelHeader} [&>svg]:text-brand`}>
            <div><h2>What appears most often</h2><p>Total crashes and fatal outcomes by reported primary cause.</p></div>
            <AlertOctagon size={18} />
          </div>
          <div className={ui.panelBody}>
            <ResponsiveContainer width="100%" height={390} minHeight={390}>
              <BarChart data={causeData} layout="vertical" margin={{ top: 8, right: 26, bottom: 8, left: 48 }}>
                <CartesianGrid strokeDasharray="2 5" horizontal={false} />
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="cause" width={130} fontSize={11} tickFormatter={formatLabel} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString()} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '14px' }} />
                <Bar dataKey="total" fill="#175cd3" name="All incidents" radius={[0, 3, 3, 0]} />
                <Bar dataKey="fatal" fill="#b42318" name="Fatal" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      );
    }

    const config = panelConfig[activeTab as 'state' | 'weather' | 'road'];
    return (
      <section className={`${ui.panel} min-w-0`}>
        <div className={`${ui.panelHeader} [&>svg]:text-brand`}>
          <div><h2>{config.title}</h2><p>{config.description}</p></div>
          <BarChart3 size={18} />
        </div>
        <div className={ui.panelBody}>
          <DistributionChart data={config.data} dataKey={config.key} />
        </div>
      </section>
    );
  };

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div>
          <h1>Find the pattern behind the count.</h1>
          <p>Read the historical dataset by place, time, weather, road type, and reported cause without losing the severity context.</p>
        </div>
        <span className="self-center text-[12px] font-semibold text-muted">Dataset 1 with 20,000 records</span>
      </header>

      <nav className={ui.tabs} aria-label="Analytics dimensions">
        {tabs.map((tab) => (
          <button
            className={`${ui.tab} ${activeTab === tab.id ? ui.activeTab : ''}`}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </nav>

      {renderPanel()}
    </div>
  );
};
