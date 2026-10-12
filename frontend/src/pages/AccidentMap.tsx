import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap
} from 'react-leaflet';
import {
  AlertTriangle,
  Flame,
  List,
  MapPin,
  Maximize2,
  RefreshCw,
  RotateCcw,
  Search,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { FALLBACK_MAP_ACCIDENTS, safeFetchJson } from '../api/client';
import type { MapAccidentRecord, MapResponse } from '../types';
import { ui } from '../ui';

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

const cityCoordinates: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  Delhi: [28.6139, 77.209],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Hyderabad: [17.385, 78.4867],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714]
};

const stateCoordinates: Record<string, [number, number]> = {
  Maharashtra: [19.7515, 75.7139],
  'Delhi NCR': [28.6139, 77.209],
  Karnataka: [15.3173, 75.7139],
  'Tamil Nadu': [11.1271, 78.6569],
  'West Bengal': [22.9868, 87.855],
  Telangana: [18.1124, 79.0193],
  Gujarat: [22.2587, 71.1924]
};

const severityColor: Record<string, string> = {
  minor: '#19725d',
  major: '#d28a2d',
  fatal: '#b42318'
};

const formatLabel = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());

const createMarkerIcon = (severity: string, selected: boolean) => {
  const color = severityColor[severity] || '#175cd3';
  const size = selected ? 22 : 16;
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:${size}px;height:${size}px;background:${color};border:${selected ? '4' : '2'}px solid #fcfdff;border-radius:50%;box-shadow:${selected ? '0 0 0 3px rgba(255,255,255,.75),0 3px 12px rgba(16,24,40,.3)' : '0 2px 8px rgba(16,24,40,.28)'}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const MapFlyController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.7 });
  }, [center, map, zoom]);
  return null;
};

const MapControls: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const map = useMap();
  return (
    <div className="absolute right-3.5 top-3.5 z-[500] grid overflow-hidden rounded-[9px] border border-line bg-surface shadow-[0_7px_22px_rgba(16,24,40,0.1)] [&>button]:grid [&>button]:size-[38px] [&>button]:cursor-pointer [&>button]:place-items-center [&>button]:border-0 [&>button]:border-t [&>button]:border-line [&>button]:bg-surface [&>button]:text-slate-700 [&>button:first-child]:border-t-0 [&>button:hover]:bg-brand-soft [&>button:hover]:text-brand">
      <button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in"><ZoomIn size={18} /></button>
      <button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out"><ZoomOut size={18} /></button>
      <button type="button" onClick={onReset} aria-label="Show all India"><Maximize2 size={18} /></button>
    </div>
  );
};

export const AccidentMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapResponse>(FALLBACK_MAP_ACCIDENTS);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'markers' | 'density'>('markers');
  const [mapCenter, setMapCenter] = useState<[number, number]>(INDIA_CENTER);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedRecord, setSelectedRecord] = useState<MapAccidentRecord | null>(FALLBACK_MAP_ACCIDENTS.accidents[0]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      severity: severityFilter,
      city: cityFilter,
      state: stateFilter,
      limit: '2000'
    });

    safeFetchJson<MapResponse>(`/api/map/accidents?${params.toString()}`, undefined, FALLBACK_MAP_ACCIDENTS)
      .then((data) => {
        if (active && Array.isArray(data.accidents)) setMapData(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cityFilter, severityFilter, stateFilter]);

  const filteredAccidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mapData.accidents.filter((record) => {
      const matchesCity = cityFilter === 'all' || record.city === cityFilter;
      const matchesState = stateFilter === 'all' || record.state === stateFilter;
      const matchesSeverity = severityFilter === 'all' || record.severity === severityFilter;
      const matchesSearch = !query || [record.city, record.state, record.cause, record.weather, record.road_type]
        .some((value) => value.toLowerCase().includes(query));
      return matchesCity && matchesState && matchesSeverity && matchesSearch;
    });
  }, [cityFilter, mapData.accidents, searchQuery, severityFilter, stateFilter]);

  const effectiveSelectedRecord = selectedRecord && filteredAccidents.some((record) => record.accident_id === selectedRecord.accident_id)
    ? selectedRecord
    : filteredAccidents[0] || null;

  const counts = useMemo(() => ({
    all: filteredAccidents.length,
    fatal: filteredAccidents.filter((record) => record.severity === 'fatal').length,
    major: filteredAccidents.filter((record) => record.severity === 'major').length,
    minor: filteredAccidents.filter((record) => record.severity === 'minor').length
  }), [filteredAccidents]);

  const resetMap = () => {
    setLoading(true);
    setSeverityFilter('all');
    setCityFilter('all');
    setStateFilter('all');
    setSearchQuery('');
    setMapCenter(INDIA_CENTER);
    setMapZoom(5);
  };

  const chooseCity = (city: string) => {
    setLoading(true);
    setCityFilter(city);
    setStateFilter('all');
    if (city === 'all') {
      setMapCenter(INDIA_CENTER);
      setMapZoom(5);
    } else if (cityCoordinates[city]) {
      setMapCenter(cityCoordinates[city]);
      setMapZoom(11);
    }
  };

  const chooseState = (state: string) => {
    setLoading(true);
    setStateFilter(state);
    setCityFilter('all');
    if (state === 'all') {
      setMapCenter(INDIA_CENTER);
      setMapZoom(5);
    } else if (stateCoordinates[state]) {
      setMapCenter(stateCoordinates[state]);
      setMapZoom(7);
    }
  };

  const inspectRecord = (record: MapAccidentRecord) => {
    setSelectedRecord(record);
    setMapCenter([record.latitude, record.longitude]);
    setMapZoom(Math.max(mapZoom, 11));
  };

  return (
    <div className={ui.page}>
      <header className={ui.header}>
        <div>
          <h1>Read the road network as evidence.</h1>
          <p>Move from a national view to a single recorded event, while keeping severity and context visible.</p>
        </div>
        <button className={ui.button} type="button" onClick={resetMap}><RotateCcw size={16} /> Reset view</button>
      </header>

      <section className="grid items-end gap-3.5 border border-line bg-surface p-4 md:grid-cols-2 lg:grid-cols-[minmax(300px,1fr)_190px_170px_auto]" aria-label="Map filters">
        <label className="relative block md:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-brand" size={17} />
          <input
            className="min-h-[43px] w-full rounded-[10px] border border-slate-300 bg-surface py-0 pl-10 pr-3 text-[13px] text-ink outline-none placeholder:text-slate-500 focus:border-brand focus:ring-3 focus:ring-brand/10"
            type="search"
            placeholder="Search a place, condition, or cause"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <div className={ui.field}>
          <label htmlFor="map-state">State</label>
          <select id="map-state" value={stateFilter} onChange={(event) => chooseState(event.target.value)}>
            <option value="all">All states</option>
            {Object.keys(stateCoordinates).map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        <div className={ui.field}>
          <label htmlFor="map-severity">Severity</label>
          <select
            id="map-severity"
            value={severityFilter}
            onChange={(event) => {
              setLoading(true);
              setSeverityFilter(event.target.value);
            }}
          >
            <option value="all">All severities</option>
            <option value="fatal">Fatal</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>
        <div className="flex min-h-[43px] rounded-[10px] border border-line" aria-label="Map display">
          <button className={`flex flex-1 items-center justify-center gap-1.5 border-0 bg-transparent px-3 text-[12px] font-semibold ${viewMode === 'markers' ? 'bg-brand-soft text-brand-deep' : 'text-muted'} ${ui.focus}`} type="button" onClick={() => setViewMode('markers')}><List size={15} /> Incidents</button>
          <button className={`flex flex-1 items-center justify-center gap-1.5 border-0 border-l border-line bg-transparent px-3 text-[12px] font-semibold ${viewMode === 'density' ? 'bg-brand-soft text-brand-deep' : 'text-muted'} ${ui.focus}`} type="button" onClick={() => setViewMode('density')}><Flame size={15} /> Density</button>
        </div>
      </section>

      <nav className="flex min-h-[55px] items-stretch gap-6 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Jump to city">
        <button className={`relative shrink-0 border-0 bg-transparent p-0 text-[12px] font-semibold ${cityFilter === 'all' ? 'text-ink after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-brand' : 'text-muted'} ${ui.focus}`} type="button" onClick={() => chooseCity('all')}>All India</button>
        {Object.keys(cityCoordinates).map((city) => (
          <button className={`relative shrink-0 border-0 bg-transparent p-0 text-[12px] font-semibold ${cityFilter === city ? 'text-ink after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-brand' : 'text-muted'} ${ui.focus}`} key={city} type="button" onClick={() => chooseCity(city)}>{city}</button>
        ))}
      </nav>

      <div className="mt-5 grid min-h-[650px] border border-line bg-surface lg:grid-cols-[minmax(0,1fr)_318px]">
        <section className="relative min-h-[540px] min-w-0 overflow-hidden border-b border-line lg:min-h-[650px] lg:border-b-0 lg:border-r">
          {loading && <div className="absolute left-4 top-4 z-[500] flex min-h-[38px] items-center gap-2 rounded-[9px] border border-line bg-surface/95 px-3 text-[12px] font-semibold text-slate-700 shadow-[0_7px_22px_rgba(16,24,40,0.1)] [&>svg]:text-brand"><RefreshCw className="animate-spin" size={16} /> Updating records</div>}
          <div className="absolute inset-x-2.5 bottom-2.5 z-[500] flex min-h-[42px] items-center justify-center gap-2 rounded-[9px] border border-line bg-surface/95 px-3 text-[10px] text-muted shadow-[0_7px_22px_rgba(16,24,40,0.1)] sm:left-auto sm:right-4 sm:bottom-4 sm:gap-2.5">
            <strong className="text-[14px] text-ink">{counts.all.toLocaleString()}</strong>
            <span>visible records</span>
            <i className="h-[18px] w-px bg-line" />
            <span>{counts.fatal} fatal</span>
            <span className="hidden sm:inline">{counts.major} major</span>
            <span className="hidden sm:inline">{counts.minor} minor</span>
          </div>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            zoomControl={false}
            className="h-[540px] w-full bg-[#e9eef5] lg:h-[650px] [&_.leaflet-popup-content-wrapper]:rounded-[10px] [&_.leaflet-popup-content-wrapper]:border [&_.leaflet-popup-content-wrapper]:border-line [&_.leaflet-popup-content-wrapper]:bg-surface [&_.leaflet-popup-content-wrapper]:text-ink [&_.leaflet-popup-content-wrapper]:shadow-[0_14px_38px_rgba(16,24,40,0.14)] [&_.leaflet-popup-tip]:bg-surface"
          >
            <MapFlyController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapControls onReset={resetMap} />

            {effectiveSelectedRecord && (
              <Circle
                center={[effectiveSelectedRecord.latitude, effectiveSelectedRecord.longitude]}
                radius={1400}
                pathOptions={{
                  color: severityColor[effectiveSelectedRecord.severity],
                  fillColor: severityColor[effectiveSelectedRecord.severity],
                  fillOpacity: 0.08,
                  weight: 1
                }}
              />
            )}

            {viewMode === 'markers' && filteredAccidents.slice(0, 600).map((record) => (
              <Marker
                key={record.accident_id}
                position={[record.latitude, record.longitude]}
                icon={createMarkerIcon(record.severity, effectiveSelectedRecord?.accident_id === record.accident_id)}
                eventHandlers={{ click: () => inspectRecord(record) }}
              >
                <Popup>
                  <div className="grid min-w-[175px] gap-1.5 p-1">
                    <strong className="text-[13px] text-ink">{record.city}, {record.state}</strong>
                    <span className="text-[12px] font-bold" style={{ color: severityColor[record.severity] }}>{formatLabel(record.severity)} severity</span>
                    <small className="text-[11px] text-muted">{formatLabel(record.cause)} · {record.time}</small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {viewMode === 'density' && filteredAccidents.slice(0, 600).map((record) => (
              <CircleMarker
                key={record.accident_id}
                center={[record.latitude, record.longitude]}
                radius={record.severity === 'fatal' ? 18 : record.severity === 'major' ? 13 : 9}
                pathOptions={{
                  fillColor: severityColor[record.severity],
                  fillOpacity: 0.48,
                  color: severityColor[record.severity],
                  weight: effectiveSelectedRecord?.accident_id === record.accident_id ? 3 : 1
                }}
                eventHandlers={{ click: () => inspectRecord(record) }}
              />
            ))}
          </MapContainer>
        </section>

        <aside className="grid min-w-0 gap-x-9 bg-surface p-5 sm:grid-cols-2 lg:block lg:p-6">
          {effectiveSelectedRecord ? (
            <>
              <div className="flex items-center justify-between gap-4 text-[11px] font-semibold text-muted sm:col-start-1 lg:flex">
                <span>Selected record</span><small>#{effectiveSelectedRecord.accident_id}</small>
              </div>
              <div className="py-5 sm:col-start-1 lg:py-6">
                <h2 className="m-0 text-[25px] font-semibold leading-tight tracking-[-0.035em] text-ink">{effectiveSelectedRecord.location_name || `${formatLabel(effectiveSelectedRecord.road_type)} corridor`}</h2>
                <p className="mb-4 mt-1.5 text-[12px] text-muted">{effectiveSelectedRecord.city}, {effectiveSelectedRecord.state}</p>
                <div className={`flex items-center gap-2 text-[12px] font-bold ${effectiveSelectedRecord.severity === 'minor' ? 'text-positive' : effectiveSelectedRecord.severity === 'major' ? 'text-warning' : 'text-danger'}`}>
                  <AlertTriangle size={17} />
                  <span>{formatLabel(effectiveSelectedRecord.severity)} severity</span>
                </div>
              </div>
              <dl className="m-0 border-t border-line sm:col-start-1 [&>div]:grid [&>div]:grid-cols-[92px_1fr] [&>div]:gap-3 [&>div]:border-b [&>div]:border-line [&>div]:py-3 [&_dt]:text-[11px] [&_dt]:leading-5 [&_dt]:text-muted [&_dd]:m-0 [&_dd]:text-right [&_dd]:text-[11px] [&_dd]:font-semibold [&_dd]:leading-5 [&_dd]:text-slate-700">
                <div><dt>Recorded</dt><dd>{effectiveSelectedRecord.date} at {effectiveSelectedRecord.time}</dd></div>
                <div><dt>Primary cause</dt><dd>{formatLabel(effectiveSelectedRecord.cause)}</dd></div>
                <div><dt>Conditions</dt><dd>{formatLabel(effectiveSelectedRecord.weather)}, {effectiveSelectedRecord.temperature}°C</dd></div>
                <div><dt>Traffic</dt><dd>{formatLabel(effectiveSelectedRecord.traffic_density)}</dd></div>
                <div><dt>Coordinates</dt><dd>{effectiveSelectedRecord.latitude.toFixed(4)}, {effectiveSelectedRecord.longitude.toFixed(4)}</dd></div>
              </dl>
              <div className="py-4 sm:col-start-1 lg:py-5">
                <span className="text-[11px] font-semibold text-muted">Location note</span>
                <p className="mt-1.5 text-[11px] leading-5 text-slate-700">{effectiveSelectedRecord.location_address || `${formatLabel(effectiveSelectedRecord.road_type)} sector, ${effectiveSelectedRecord.city}, ${effectiveSelectedRecord.state}`}</p>
              </div>
            </>
          ) : (
            <div className="grid min-h-[300px] content-center justify-items-start sm:col-start-1 lg:min-h-[300px]"><MapPin className="text-brand" size={24} /><h2 className="mt-4 text-[18px] font-semibold">No record selected</h2><p className="text-[12px] leading-5 text-muted">Choose a marker or adjust the filters to inspect an incident.</p></div>
          )}

          <div className="border-t border-line pt-5 sm:col-start-2 sm:row-span-4 sm:row-start-1 sm:border-t-0 sm:pt-0 lg:mt-0 lg:border-t lg:pt-5">
            <div className="mb-2 flex items-center justify-between gap-4 text-[11px] font-semibold text-muted"><span>Visible evidence</span><strong className="text-ink">{filteredAccidents.length}</strong></div>
            {filteredAccidents.slice(0, 4).map((record) => (
              <button className={`grid min-h-[52px] w-full grid-cols-[4px_minmax(0,1fr)_auto] items-center gap-2.5 border-0 border-b border-line bg-transparent p-0 text-left hover:[&_strong]:text-brand-deep ${ui.focus}`} key={record.accident_id} type="button" onClick={() => inspectRecord(record)}>
                <i className="h-6 w-1 rounded-[2px]" style={{ backgroundColor: severityColor[record.severity] }} />
                <span className="grid gap-0.5"><strong className="text-[12px] font-semibold text-slate-700">{record.city}</strong><small className="text-[10px] text-muted">{formatLabel(record.cause)}</small></span>
                <em className="text-[10px] not-italic text-muted">{record.time}</em>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
