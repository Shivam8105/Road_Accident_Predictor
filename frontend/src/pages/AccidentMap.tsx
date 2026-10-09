import React, { useEffect, useState, useMemo } from 'react';
import type { MapResponse, MapAccidentRecord } from '../types';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, RefreshCw, Flame, 
  AlertTriangle, ShieldCheck, Skull,
  Maximize2, ZoomIn, ZoomOut, Compass, Info, Search
} from 'lucide-react';
import { safeFetchJson, FALLBACK_MAP_ACCIDENTS } from '../api/client';

const CITY_COORDINATES: { [key: string]: { coords: [number, number]; state: string; count: string; icon: string } } = {
  'Mumbai': { coords: [19.0760, 72.8777], state: 'Maharashtra', count: '2,577 Incidents', icon: '🏙️' },
  'Delhi': { coords: [28.6139, 77.2090], state: 'Delhi NCR', count: '2,550 Incidents', icon: '🕌' },
  'Bangalore': { coords: [12.9716, 77.5946], state: 'Karnataka', count: '2,510 Incidents', icon: '🌴' },
  'Chennai': { coords: [13.0827, 80.2707], state: 'Tamil Nadu', count: '2,490 Incidents', icon: '🏖️' },
  'Kolkata': { coords: [22.5726, 88.3639], state: 'West Bengal', count: '2,460 Incidents', icon: '🌉' },
  'Hyderabad': { coords: [17.3850, 78.4867], state: 'Telangana', count: '2,410 Incidents', icon: '🏛️' },
  'Pune': { coords: [18.5204, 73.8567], state: 'Maharashtra', count: '2,577 Incidents', icon: '🏰' },
  'Ahmedabad': { coords: [23.0225, 72.5714], state: 'Gujarat', count: '2,390 Incidents', icon: '🏙️' },
  'Chandigarh': { coords: [30.7333, 76.7794], state: 'Punjab / Haryana', count: '2,577 Incidents', icon: '🏞️' }
};

const STATE_COORDINATES: { [key: string]: { coords: [number, number]; zoom: number } } = {
  'Maharashtra': { coords: [19.7515, 75.7139], zoom: 7 },
  'Delhi NCR': { coords: [28.6139, 77.2090], zoom: 10 },
  'Karnataka': { coords: [15.3173, 75.7139], zoom: 7 },
  'Tamil Nadu': { coords: [11.1271, 78.6569], zoom: 7 },
  'West Bengal': { coords: [22.9868, 87.8550], zoom: 7 },
  'Telangana': { coords: [18.1124, 79.0193], zoom: 7 },
  'Gujarat': { coords: [22.2587, 71.1924], zoom: 7 },
  'Punjab': { coords: [31.1471, 75.3412], zoom: 8 },
  'Haryana': { coords: [29.0588, 76.0856], zoom: 8 },
  'Uttar Pradesh': { coords: [26.8467, 80.9462], zoom: 7 },
  'Rajasthan': { coords: [27.0238, 74.2179], zoom: 7 },
  'Kerala': { coords: [10.8505, 76.2711], zoom: 8 },
  'Madhya Pradesh': { coords: [22.9734, 78.6569], zoom: 7 },
  'Bihar': { coords: [25.0961, 85.3131], zoom: 7 },
  'Odisha': { coords: [20.9517, 85.0985], zoom: 7 },
  'Andhra Pradesh': { coords: [15.9129, 79.7400], zoom: 7 },
  'Assam': { coords: [26.2006, 92.9376], zoom: 7 },
};

const createVibrantMarkerIcon = (severity: string, isSelected: boolean = false) => {
  let mainColor = '#10b981'; // Emerald Minor
  let glowColor = 'rgba(16, 185, 129, 0.6)';
  let size = isSelected ? 34 : 26;

  if (severity === 'major') {
    mainColor = '#f59e0b'; // Amber Major
    glowColor = 'rgba(245, 158, 11, 0.7)';
  }
  if (severity === 'fatal') {
    mainColor = '#f43f5e'; // Rose Fatal
    glowColor = 'rgba(244, 63, 94, 0.8)';
  }

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: ${mainColor};
        opacity: ${isSelected ? 0.6 : 0.35};
        animation: pulse ${isSelected ? '1.2s' : '2.5s'} infinite ease-in-out;
        box-shadow: 0 0 16px ${glowColor};
      "></div>
      <div style="
        position: relative;
        z-index: 10;
        width: ${isSelected ? 16 : 12}px;
        height: ${isSelected ? 16 : 12}px;
        border-radius: 50%;
        background: ${mainColor};
        border: ${isSelected ? '3px' : '2px'} solid #ffffff;
        box-shadow: 0 0 14px ${glowColor}, 0 3px 8px rgba(0,0,0,0.8);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'vibrant-map-marker',
    html: html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const MapFlyToController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
};

const MapCustomZoomControls: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-1.5 glass-card p-1.5 rounded-2xl border border-white/10 shadow-2xl bg-black/80 backdrop-blur-md">
      <button
        onClick={() => map.zoomIn()}
        className="p-2.5 rounded-xl bg-white/10 hover:bg-indigo-600 text-white transition-colors cursor-pointer flex items-center justify-center"
        title="Zoom In (+)"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="p-2.5 rounded-xl bg-white/10 hover:bg-indigo-600 text-white transition-colors cursor-pointer flex items-center justify-center"
        title="Zoom Out (-)"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button
        onClick={onReset}
        className="p-2.5 rounded-xl bg-white/10 hover:bg-indigo-600 text-white transition-colors cursor-pointer flex items-center justify-center"
        title="Show All India View"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export const AccidentMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapResponse | null>(FALLBACK_MAP_ACCIDENTS);
  const [loading, setLoading] = useState(false);

  // Simple Filters
  const [severityFilter, setSeverityFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View Modes & Basemap Theme
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
  const [basemapStyle, setBasemapStyle] = useState<'esri_dark' | 'osm'>('esri_dark');

  // Navigation & Selected Card
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedRecord, setSelectedRecord] = useState<MapAccidentRecord | null>(FALLBACK_MAP_ACCIDENTS.accidents[0]);

  useEffect(() => {
    fetchMapData();
  }, [severityFilter, cityFilter, stateFilter]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        severity: severityFilter,
        city: cityFilter,
        state: stateFilter,
        limit: '2000'
      });
      const data = await safeFetchJson<MapResponse>(
        `/api/map/accidents?${params.toString()}`,
        undefined,
        FALLBACK_MAP_ACCIDENTS
      );
      if (data && Array.isArray(data.accidents)) {
        setMapData(data);
        if (data.accidents.length > 0 && !selectedRecord) {
          setSelectedRecord(data.accidents[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching map data:', e);
      setMapData(FALLBACK_MAP_ACCIDENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleCityJump = (cityName: string) => {
    setCityFilter(cityName);
    if (cityName !== 'all') {
      setStateFilter('all');
    }
    if (CITY_COORDINATES[cityName]) {
      setMapCenter(CITY_COORDINATES[cityName].coords);
      setMapZoom(11);
    }
  };

  const handleStateJump = (stateName: string) => {
    setStateFilter(stateName);
    if (stateName !== 'all') {
      setCityFilter('all');
    }
    if (STATE_COORDINATES[stateName]) {
      setMapCenter(STATE_COORDINATES[stateName].coords);
      setMapZoom(STATE_COORDINATES[stateName].zoom);
    } else if (stateName === 'all') {
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
  };

  const resetMapView = () => {
    setCityFilter('all');
    setStateFilter('all');
    setSeverityFilter('all');
    setSearchQuery('');
    setMapCenter([20.5937, 78.9629]);
    setMapZoom(5);
  };

  const getTileUrl = () => {
    if (basemapStyle === 'osm') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    // Esri World Dark Gray Base (100% Free, High Quality, No API Key Required)
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
  };

  const getAttribution = () => {
    if (basemapStyle === 'osm') {
      return '&copy; OpenStreetMap contributors';
    }
    return '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ';
  };

  const filteredAccidents = useMemo(() => {
    if (!mapData?.accidents) return [];
    if (!searchQuery.trim()) return mapData.accidents;

    const q = searchQuery.toLowerCase();
    return mapData.accidents.filter(a => 
      a.city.toLowerCase().includes(q) ||
      a.state.toLowerCase().includes(q) ||
      a.cause.toLowerCase().includes(q) ||
      a.weather.toLowerCase().includes(q)
    );
  }, [mapData, searchQuery]);

  const totalCount = filteredAccidents.length;
  const fatalCount = filteredAccidents.filter(a => a.severity === 'fatal').length;
  const majorCount = filteredAccidents.filter(a => a.severity === 'major').length;
  const minorCount = filteredAccidents.filter(a => a.severity === 'minor').length;

  return (
    <div className="space-y-4 py-2">
      {/* SIMPLE ACCESSIBLE HEADER */}
      <div className="border-b border-white/10 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <MapPin className="w-6 h-6 text-indigo-400 animate-bounce" />
            <span>India Road Safety & Danger Map</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Click any city button below or tap map pins to see safety & risk spots in simple terms.</span>
          </p>
        </div>

        {/* Refresh & Reset View Button */}
        <button
          onClick={resetMapView}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-indigo-600 text-white text-xs font-bold transition-all cursor-pointer border border-white/15 w-fit"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset India Map View</span>
        </button>
      </div>

      {/* STATE SEARCH BAR & SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-black/60 p-3.5 rounded-2xl border border-white/10">
        {/* Search State or City text input */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search state (e.g. Maharashtra, Tamil Nadu) or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/80 text-white placeholder-slate-400 pl-10 pr-9 py-2 rounded-xl border border-white/15 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* State Dropdown Selector */}
        <div className="md:col-span-6 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 whitespace-nowrap flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>State Filter:</span>
          </span>
          <select
            value={stateFilter}
            onChange={(e) => handleStateJump(e.target.value)}
            className="w-full bg-black/80 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/15 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="all">🇮🇳 All States of India</option>
            {Object.keys(STATE_COORDINATES).map((st) => (
              <option key={st} value={st}>
                📍 {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ONE-TAP EASY CITY SELECTOR BUTTONS */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Tap a City to Jump Directly to its Hotspots:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setCityFilter('all'); setMapCenter([20.5937, 78.9629]); setMapZoom(5); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              cityFilter === 'all' 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                : 'bg-black/60 text-slate-300 border border-white/15 hover:border-indigo-500'
            }`}
          >
            <span>🇮🇳 All India</span>
          </button>
          {Object.entries(CITY_COORDINATES).map(([cityName, data]) => (
            <button
              key={cityName}
              onClick={() => handleCityJump(cityName)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                cityFilter === cityName 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                  : 'bg-black/60 text-slate-300 border border-white/15 hover:border-indigo-500'
              }`}
            >
              <span>{data.icon} {cityName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DANGER LEVEL SEVERITY LEGEND & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-black/60 p-3 rounded-2xl border border-white/10">
        {/* Simple Filter Chips */}
        <div className="md:col-span-8 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-300 mr-1">Filter Danger:</span>
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              severityFilter === 'all' ? 'bg-white text-black font-extrabold' : 'bg-white/10 text-slate-300 hover:text-white'
            }`}
          >
            All Incidents ({totalCount})
          </button>
          <button
            onClick={() => setSeverityFilter('fatal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              severityFilter === 'fatal' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-red-950/40 text-red-300 border border-red-800/40'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>High Danger / Fatal ({fatalCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('major')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              severityFilter === 'major' ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' : 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Medium Risk / Hospital ({majorCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('minor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              severityFilter === 'minor' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Low Risk / Minor ({minorCount})</span>
          </button>
        </div>

        {/* View Mode & Map Theme Toggle */}
        <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-2">
          {/* Map Basemap Style Switcher */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setBasemapStyle('esri_dark')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                basemapStyle === 'esri_dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌙 Dark Map
            </button>
            <button
              onClick={() => setBasemapStyle('osm')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                basemapStyle === 'osm' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🗺️ Street Map
            </button>
          </div>

          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('markers')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'markers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Pins</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'heatmap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Heatmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAP CONTAINER & SIDE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEAFLET MAP VIEWPORT */}
        <div className="lg:col-span-8 relative h-[520px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
          {loading && (
            <div className="absolute top-4 left-4 z-[400] glass-card px-4 py-2 rounded-2xl border border-indigo-500/30 flex items-center gap-2 text-xs font-bold text-white bg-black/80">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Updating Map...</span>
            </div>
          )}

          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            zoomControl={false}
            className="w-full h-full z-0 bg-[#0a0a0f]"
          >
            <MapFlyToController center={mapCenter} zoom={mapZoom} />
            <TileLayer url={getTileUrl()} maxZoom={18} attribution={getAttribution()} />
            <MapCustomZoomControls onReset={resetMapView} />

            {/* Floating Top HUD Stats Badge inside Map */}
            <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 text-[11px] font-bold">
              <div className="glass-card px-3 py-1.5 rounded-xl border border-white/10 bg-black/80 text-white flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Showing {filteredAccidents.length.toLocaleString()} Active Nodes</span>
              </div>
            </div>

            {/* Selected Spot Radar Ring */}
            {selectedRecord && (
              <Circle
                center={[selectedRecord.latitude, selectedRecord.longitude]}
                radius={2500}
                pathOptions={{
                  color: selectedRecord.severity === 'fatal' ? '#f43f5e' : selectedRecord.severity === 'major' ? '#f59e0b' : '#10b981',
                  fillColor: selectedRecord.severity === 'fatal' ? '#f43f5e' : selectedRecord.severity === 'major' ? '#f59e0b' : '#10b981',
                  fillOpacity: 0.18,
                  weight: 2,
                  dashArray: '5, 5'
                }}
              />
            )}

            {/* Render Pins / Markers */}
            {viewMode === 'markers' && filteredAccidents.slice(0, 500).map((record) => {
              const isSelected = selectedRecord?.accident_id === record.accident_id;
              return (
                <Marker
                  key={record.accident_id}
                  position={[record.latitude, record.longitude]}
                  icon={createVibrantMarkerIcon(record.severity, isSelected)}
                  eventHandlers={{
                    click: () => {
                      setSelectedRecord(record);
                      setMapCenter([record.latitude, record.longitude]);
                    }
                  }}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="p-2.5 space-y-1.5 text-slate-900 min-w-[180px]">
                      <div className="font-bold text-xs flex items-center gap-1.5 text-indigo-950 border-b pb-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{record.city}, {record.state}</span>
                      </div>
                      <div className="text-[11px] font-extrabold uppercase flex items-center gap-1" style={{
                        color: record.severity === 'fatal' ? '#e11d48' : record.severity === 'major' ? '#d97706' : '#059669'
                      }}>
                        {record.severity === 'fatal' ? '🔴 FATAL DANGER' : record.severity === 'major' ? '🟡 MAJOR INJURY' : '🟢 MINOR RISK'}
                      </div>
                      <div className="text-[10px] text-slate-600 font-medium">
                        Factor: {record.cause.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {record.latitude.toFixed(3)}°N, {record.longitude.toFixed(3)}°E
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Render Heatmap Circles */}
            {viewMode === 'heatmap' && filteredAccidents.slice(0, 400).map((record) => {
              const radius = record.severity === 'fatal' ? 20 : record.severity === 'major' ? 15 : 10;
              const color = record.severity === 'fatal' ? '#f43f5e' : record.severity === 'major' ? '#f59e0b' : '#10b981';
              const isSelected = selectedRecord?.accident_id === record.accident_id;

              return (
                <CircleMarker
                  key={`heat-${record.accident_id}`}
                  center={[record.latitude, record.longitude]}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: isSelected ? 0.9 : 0.6,
                    color: isSelected ? '#ffffff' : color,
                    weight: isSelected ? 3 : 1
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedRecord(record);
                      setMapCenter([record.latitude, record.longitude]);
                    }
                  }}
                />
              );
            })}
          </MapContainer>
        </div>

        {/* SIDE-BY-SIDE LOCATION & INCIDENT INSPECTOR */}
        <div className="lg:col-span-4 space-y-3">
          {selectedRecord ? (
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4 bg-slate-900/90 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-white">
                      {selectedRecord.location_name || `${selectedRecord.road_type.toUpperCase()} Corridor`}
                    </h3>
                    <p className="text-xs text-indigo-400 font-semibold">{selectedRecord.city}, {selectedRecord.state}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  #{selectedRecord.accident_id}
                </span>
              </div>

              {/* Exact Location & Coordinates Box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Exact Spot Coordinates</div>
                <div className="flex items-center justify-between font-mono text-slate-200">
                  <span className="font-bold text-indigo-300">
                    📍 {selectedRecord.latitude.toFixed(4)}° N, {selectedRecord.longitude.toFixed(4)}° E
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-sans">GPS Grid</span>
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                  {selectedRecord.location_address || `${selectedRecord.road_type.toUpperCase()} Sector, ${selectedRecord.city}, ${selectedRecord.state}`}
                </div>
              </div>

              {/* Danger Level Status Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                selectedRecord.severity === 'fatal' 
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-400' 
                  : selectedRecord.severity === 'major' 
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-400' 
                  : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
              }`}>
                {selectedRecord.severity === 'fatal' ? (
                  <Skull className="w-7 h-7 text-rose-400 shrink-0" />
                ) : selectedRecord.severity === 'major' ? (
                  <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="text-[10px] font-semibold uppercase opacity-80">Risk Severity</div>
                  <div className="font-heading text-base font-bold uppercase">
                    {selectedRecord.severity === 'fatal' ? 'FATAL DANGER' : selectedRecord.severity === 'major' ? 'MAJOR INJURY RISK' : 'MINOR SEVERITY'}
                  </div>
                </div>
              </div>

              {/* Incident Factor Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Weather Condition</span>
                  <span className="text-slate-200 font-medium capitalize">{selectedRecord.weather}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Primary Cause</span>
                  <span className="text-slate-200 font-medium capitalize">{selectedRecord.cause.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Road Infrastructure</span>
                  <span className="text-slate-200 font-medium capitalize">{selectedRecord.road_type}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Time Recorded</span>
                  <span className="text-slate-200 font-mono font-medium">{selectedRecord.time}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Traffic Density</span>
                  <span className="text-slate-200 font-medium capitalize">{selectedRecord.traffic_density}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 text-center space-y-3 min-h-[300px] flex flex-col items-center justify-center bg-slate-900/60">
              <Compass className="w-10 h-10 text-slate-600" />
              <div className="text-sm font-semibold text-slate-200">No Location Selected</div>
              <p className="text-xs text-slate-400">
                Click any heatmap circle or pin to inspect full location address, coordinates, and risk data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
