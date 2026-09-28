import React, { useEffect, useState, useMemo } from 'react';
import type { MapResponse, MapAccidentRecord } from '../types';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, RefreshCw, Flame, Layers, 
  Navigation, Crosshair, Wind, Car, AlertTriangle, 
  Sun, CloudRain, CloudFog, Compass, Search,
  Eye, ShieldAlert, Activity, CheckCircle2, Maximize2, ZoomIn, ZoomOut
} from 'lucide-react';

const CITY_COORDINATES: { [key: string]: { coords: [number, number]; state: string; count: string } } = {
  'Mumbai': { coords: [19.0760, 72.8777], state: 'Maharashtra', count: '1,480 Accidents' },
  'Delhi': { coords: [28.6139, 77.2090], state: 'Delhi NCR', count: '1,450 Accidents' },
  'Bangalore': { coords: [12.9716, 77.5946], state: 'Karnataka', count: '1,420 Accidents' },
  'Chennai': { coords: [13.0827, 80.2707], state: 'Tamil Nadu', count: '1,390 Accidents' },
  'Kolkata': { coords: [22.5726, 88.3639], state: 'West Bengal', count: '1,360 Accidents' },
  'Hyderabad': { coords: [17.3850, 78.4867], state: 'Telangana', count: '1,340 Accidents' },
  'Pune': { coords: [18.5204, 73.8567], state: 'Maharashtra', count: '1,310 Accidents' },
  'Ahmedabad': { coords: [23.0225, 72.5714], state: 'Gujarat', count: '1,290 Accidents' }
};

// Clean Vibrant Custom SVG Markers
const createVibrantMarkerIcon = (severity: string, sizeMultiplier: number = 1) => {
  let mainColor = '#10b981'; // emerald
  let pulseClass = 'marker-pulse-minor';

  if (severity === 'major') {
    mainColor = '#f59e0b'; // amber
    pulseClass = 'marker-pulse-major';
  }
  if (severity === 'fatal') {
    mainColor = '#ef4444'; // crimson red
    pulseClass = 'marker-pulse-fatal';
  }

  const baseSize = 24 * sizeMultiplier;
  const innerSize = 14 * sizeMultiplier;
  const anchor = baseSize / 2;

  const html = `
    <div style="position: relative; width: ${baseSize}px; height: ${baseSize}px; display: flex; align-items: center; justify-content: center;">
      <div class="${pulseClass}" style="
        position: absolute;
        width: ${baseSize}px;
        height: ${baseSize}px;
        border-radius: 50%;
        background-color: ${mainColor};
        opacity: 0.5;
      "></div>
      <div style="
        position: relative;
        z-index: 10;
        width: ${innerSize}px;
        height: ${innerSize}px;
        border-radius: 50%;
        background: ${mainColor};
        border: 2px solid #ffffff;
        box-shadow: 0 0 12px ${mainColor}, 0 2px 6px rgba(0,0,0,0.6);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'vibrant-map-marker',
    html: html,
    iconSize: [baseSize, baseSize],
    iconAnchor: [anchor, anchor]
  });
};

// Smooth Map Fly-To Controller
const MapFlyToController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.4, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
};

// Map Custom Zoom Controls Component
const MapCustomZoomControls: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-4 z-[400] flex flex-col gap-1.5 glass-card p-1 rounded-xl border border-white/10 shadow-2xl">
      <button
        onClick={() => map.zoomIn()}
        className="p-2 rounded-lg bg-white/5 hover:bg-red-600 text-white transition-colors cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="p-2 rounded-lg bg-white/5 hover:bg-red-600 text-white transition-colors cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <button
        onClick={onReset}
        className="p-2 rounded-lg bg-white/5 hover:bg-red-600 text-white transition-colors cursor-pointer"
        title="Fit India View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export const AccidentMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [severityFilter, setSeverityFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [weatherFilter, setWeatherFilter] = useState('all');
  const [roadTypeFilter, setRoadTypeFilter] = useState('all');
  const [causeFilter, setCauseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View Modes & Basemap Theme
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap' | 'density'>('markers');
  const [basemapTheme, setBasemapTheme] = useState<'dark' | 'voyager' | 'osm' | 'topo' | 'satellite' | 'positron'>('dark');
  const [heatmapRadius, setHeatmapRadius] = useState(16);
  const [markerScale, setMarkerScale] = useState<number>(1);
  const [showHUD, setShowHUD] = useState(true);

  // Map Navigation
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedRecord, setSelectedRecord] = useState<MapAccidentRecord | null>(null);

  useEffect(() => {
    fetchMapData();
  }, [severityFilter, cityFilter, weatherFilter, roadTypeFilter, causeFilter]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        severity: severityFilter,
        city: cityFilter,
        weather: weatherFilter,
        road_type: roadTypeFilter,
        cause: causeFilter,
        limit: '2000'
      });
      const res = await fetch(`/api/map/accidents?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMapData(data);
        if (data.accidents?.length > 0 && !selectedRecord) {
          setSelectedRecord(data.accidents[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching map data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCityJump = (cityName: string) => {
    setCityFilter(cityName);
    if (CITY_COORDINATES[cityName]) {
      setMapCenter(CITY_COORDINATES[cityName].coords);
      setMapZoom(11);
    }
  };

  const resetMapView = () => {
    setCityFilter('all');
    setSeverityFilter('all');
    setWeatherFilter('all');
    setRoadTypeFilter('all');
    setCauseFilter('all');
    setSearchQuery('');
    setMapCenter([20.5937, 78.9629]);
    setMapZoom(5);
  };

  const getTileUrl = () => {
    switch (basemapTheme) {
      case 'voyager':
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      case 'osm':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'topo':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'positron':
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      case 'dark':
      default:
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  // Filtered accidents by client search query
  const filteredAccidents = useMemo(() => {
    if (!mapData?.accidents) return [];
    if (!searchQuery.trim()) return mapData.accidents;

    const q = searchQuery.toLowerCase();
    return mapData.accidents.filter(a => 
      a.city.toLowerCase().includes(q) ||
      a.state.toLowerCase().includes(q) ||
      a.cause.toLowerCase().includes(q) ||
      a.weather.toLowerCase().includes(q) ||
      a.road_type.toLowerCase().includes(q)
    );
  }, [mapData, searchQuery]);

  // Statistics calculation for filtered records
  const totalCount = filteredAccidents.length;
  const fatalCount = filteredAccidents.filter(a => a.severity === 'fatal').length;
  const majorCount = filteredAccidents.filter(a => a.severity === 'major').length;
  const minorCount = filteredAccidents.filter(a => a.severity === 'minor').length;
  
  const fatalPct = totalCount > 0 ? ((fatalCount / totalCount) * 100).toFixed(1) : '0';
  const majorPct = totalCount > 0 ? ((majorCount / totalCount) * 100).toFixed(1) : '0';
  const minorPct = totalCount > 0 ? ((minorCount / totalCount) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 py-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
            <MapPin className="w-6 h-6 text-red-500" />
            <span>GIS Spatial Risk Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive multi-basemap geospatial risk engine & location parameter inspector (Dataset 1)
          </p>
        </div>

        {/* BASEMAP SELECTOR */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs overflow-x-auto scrollbar-none">
          <span className="text-slate-400 font-medium px-2 flex items-center gap-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-red-400" /> Theme:
          </span>
          <button
            onClick={() => setBasemapTheme('dark')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'dark' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dark Mode
          </button>
          <button
            onClick={() => setBasemapTheme('voyager')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'voyager' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Voyager
          </button>
          <button
            onClick={() => setBasemapTheme('satellite')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'satellite' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite HD
          </button>
          <button
            onClick={() => setBasemapTheme('topo')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'topo' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Topographic
          </button>
          <button
            onClick={() => setBasemapTheme('positron')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'positron' ? 'bg-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Positron
          </button>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter location, cause, weather, road type..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500 transition-all font-medium"
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

          {/* VIEW MODES */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Display Mode:</span>
            <button
              onClick={() => setViewMode('markers')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'markers' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Neon Markers
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'heatmap' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Heatmap
            </button>
            <button
              onClick={() => setViewMode('density')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'density' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Density Clusters
            </button>
          </div>
        </div>

        {/* CHIP FILTERS ROW */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-white/10">
          <span className="text-slate-400 font-semibold shrink-0">Severity:</span>
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
              severityFilter === 'all' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            All ({mapData?.accidents?.length || 0})
          </button>
          <button
            onClick={() => setSeverityFilter('fatal')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              severityFilter === 'fatal' ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'bg-red-950/60 text-red-400 border border-red-800/60 hover:border-red-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Fatal ({fatalCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('major')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              severityFilter === 'major' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40' : 'bg-amber-950/60 text-amber-400 border border-amber-800/60 hover:border-amber-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Major ({majorCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('minor')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              severityFilter === 'minor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 hover:border-emerald-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Minor ({minorCount})</span>
          </button>

          <span className="text-slate-400 font-semibold shrink-0 ml-3">Weather:</span>
          <button
            onClick={() => setWeatherFilter(weatherFilter === 'clear' ? 'all' : 'clear')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
              weatherFilter === 'clear' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> Clear
          </button>
          <button
            onClick={() => setWeatherFilter(weatherFilter === 'rain' ? 'all' : 'rain')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
              weatherFilter === 'rain' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Heavy Rain
          </button>
          <button
            onClick={() => setWeatherFilter(weatherFilter === 'fog' ? 'all' : 'fog')}
            className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 ${
              weatherFilter === 'fog' ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <CloudFog className="w-3.5 h-3.5" /> Fog
          </button>

          <span className="text-slate-400 font-semibold shrink-0 ml-3">Primary Cause:</span>
          <select
            value={causeFilter}
            onChange={(e) => setCauseFilter(e.target.value)}
            className="px-3 py-1 rounded-lg bg-black/60 border border-white/15 text-white font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Accident Causes</option>
            <option value="over-speeding">Over-Speeding</option>
            <option value="drunk driving">Drunk Driving</option>
            <option value="weather conditions">Adverse Weather</option>
            <option value="mechanical breakdown">Mechanical Failure</option>
            <option value="distracted driving">Distracted Driving</option>
            <option value="sudden braking">Sudden Braking</option>
          </select>

          <button
            onClick={resetMapView}
            className="ml-auto px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all border border-white/10"
          >
            <Crosshair className="w-3.5 h-3.5" /> Reset View
          </button>
        </div>
      </div>

      {/* INTERACTIVE METRO CITY HOTSPOT JUMP STRIP */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-red-500" />
            <span>Interactive Metro Hotspots (Click any city card to fly camera)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
          {Object.entries(CITY_COORDINATES).map(([cityName, info]) => {
            const isSelected = cityFilter === cityName;
            return (
              <div
                key={cityName}
                onClick={() => handleCityJump(cityName)}
                className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 border relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white border-white shadow-lg shadow-red-600/30'
                    : 'glass-card text-slate-200 border-white/10 hover:border-red-500/40'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <span>{cityName}</span>
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white animate-bounce' : 'text-red-400 opacity-60'}`} />
                </div>
                <div className="text-[10px] opacity-80 font-medium">{info.state}</div>
                <div className="text-[10px] font-bold text-red-300 mt-1">{info.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN MAP CONTAINER & INSPECTOR PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAP CANVAS DISPLAY */}
        <div className="lg:col-span-8 glass-card p-2 rounded-3xl h-[620px] relative overflow-hidden shadow-2xl border border-red-500/30">
          {loading && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-red-400 font-bold text-xs gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
              <span>Rendering GIS Spatial Risk Points...</span>
            </div>
          )}

          {/* FLOATING HUD MINI STATS OVERLAY (Top-Left) */}
          {showHUD && mapData && (
            <div className="absolute top-4 left-4 z-[400] glass-card p-3.5 rounded-2xl border border-red-500/40 text-xs space-y-2 shadow-2xl backdrop-blur-xl max-w-[240px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-red-500" /> Spatial Analytics HUD
                </span>
                <button onClick={() => setShowHUD(false)} className="text-slate-400 hover:text-white font-bold text-xs">✕</button>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Matched:</span>
                  <span className="font-extrabold text-white">{totalCount}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Fatal Rate:</span>
                  <span className="font-bold">{fatalCount} ({fatalPct}%)</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Major Rate:</span>
                  <span className="font-bold">{majorCount} ({majorPct}%)</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Minor Rate:</span>
                  <span className="font-bold">{minorCount} ({minorPct}%)</span>
                </div>
              </div>
            </div>
          )}

          {!showHUD && (
            <button
              onClick={() => setShowHUD(true)}
              className="absolute top-4 left-4 z-[400] glass-card px-3 py-1.5 rounded-xl border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-1 shadow-lg hover:bg-white/10"
            >
              <Activity className="w-3.5 h-3.5" /> Show HUD
            </button>
          )}

          {/* FLOATING CONTROLS: RADIUS & MARKER SIZE (Top-Right) */}
          <div className="absolute top-4 right-4 z-[400] glass-card p-3 rounded-2xl border border-red-500/40 text-xs space-y-2 shadow-2xl backdrop-blur-xl">
            {viewMode === 'heatmap' ? (
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" /> Radius: {heatmapRadius}px
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={heatmapRadius}
                  onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                  className="w-36 accent-red-500 cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-red-400" /> Size:
                </span>
                <button
                  onClick={() => setMarkerScale(0.8)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${markerScale === 0.8 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}
                >
                  S
                </button>
                <button
                  onClick={() => setMarkerScale(1)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${markerScale === 1 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}
                >
                  M
                </button>
                <button
                  onClick={() => setMarkerScale(1.3)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${markerScale === 1.3 ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-400'}`}
                >
                  L
                </button>
              </div>
            )}
          </div>

          {/* FLOATING ZOOM CONTROLS (Bottom-Right) */}
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: '1.25rem' }}
          >
            <MapFlyToController center={mapCenter} zoom={mapZoom} />
            <MapCustomZoomControls onReset={resetMapView} />

            <TileLayer
              attribution='&copy; <a href="https://www.carto.com/">CARTO</a>'
              url={getTileUrl()}
            />

            {/* MARKERS MODE */}
            {viewMode === 'markers' && filteredAccidents.map((record) => (
              <Marker
                key={record.accident_id}
                position={[record.latitude, record.longitude]}
                icon={createVibrantMarkerIcon(record.severity, markerScale)}
                eventHandlers={{
                  click: () => setSelectedRecord(record)
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-2 space-y-2 text-xs text-slate-100 min-w-[200px]">
                    <div className="font-bold border-b border-white/10 pb-1.5 text-sm uppercase flex items-center justify-between gap-2">
                      <span className="text-white font-extrabold">{record.city}, {record.state}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                        record.severity === 'fatal' ? 'bg-red-600' : 
                        record.severity === 'major' ? 'bg-amber-600' : 
                        'bg-emerald-600'
                      }`}>
                        {record.severity}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div><strong>Date & Time:</strong> {record.date} ({record.time})</div>
                      <div><strong>Weather:</strong> {record.weather} ({record.temperature}°C)</div>
                      <div><strong>Road Type:</strong> {record.road_type}</div>
                      <div><strong>Cause:</strong> <span className="text-red-400 font-bold">{record.cause}</span></div>
                    </div>

                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="mt-2 w-full py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl text-[11px] text-center block cursor-pointer transition-all shadow-md"
                    >
                      Inspect Location Parameters →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* HEATMAP / DENSITY CIRCLES MODE */}
            {(viewMode === 'heatmap' || viewMode === 'density') && filteredAccidents.map((record) => (
              <CircleMarker
                key={`circle-${record.accident_id}`}
                center={[record.latitude, record.longitude]}
                radius={
                  viewMode === 'heatmap'
                    ? (record.severity === 'fatal' ? heatmapRadius * 1.25 : record.severity === 'major' ? heatmapRadius * 0.9 : heatmapRadius * 0.6)
                    : (record.severity === 'fatal' ? 14 : record.severity === 'major' ? 9 : 6)
                }
                eventHandlers={{
                  click: () => setSelectedRecord(record)
                }}
                pathOptions={{
                  color: record.severity === 'fatal' ? '#ef4444' : record.severity === 'major' ? '#f59e0b' : '#10b981',
                  fillColor: record.severity === 'fatal' ? '#ef4444' : record.severity === 'major' ? '#f59e0b' : '#10b981',
                  fillOpacity: viewMode === 'heatmap' ? 0.5 : 0.75,
                  weight: viewMode === 'heatmap' ? 0.5 : 2
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* LOCATION INSPECTOR SIDE CARD */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-red-500/30 space-y-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Location Inspector</span>
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-800">
                Interactive Detail
              </span>
            </div>

            {selectedRecord ? (
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-white uppercase tracking-wider">{selectedRecord.city}, {selectedRecord.state}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-lg ${
                      selectedRecord.severity === 'fatal' ? 'bg-red-600 shadow-red-600/40' :
                      selectedRecord.severity === 'major' ? 'bg-amber-600 shadow-amber-600/40' :
                      'bg-emerald-600 shadow-emerald-600/40'
                    }`}>
                      {selectedRecord.severity}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-red-400 flex items-center gap-1.5 pt-1 border-t border-white/10">
                    <Crosshair className="w-3.5 h-3.5" /> Lat: {selectedRecord.latitude.toFixed(4)}, Lng: {selectedRecord.longitude.toFixed(4)}
                  </div>
                </div>

                {/* Attributes */}
                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400">Date & Time:</span>
                    <span className="font-bold text-white font-mono">{selectedRecord.date} ({selectedRecord.time})</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-red-400" /> Weather:
                    </span>
                    <span className="font-bold text-red-300 capitalize">{selectedRecord.weather} ({selectedRecord.temperature}°C)</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-400" /> Road Type:
                    </span>
                    <span className="font-bold text-white capitalize">{selectedRecord.road_type}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Primary Cause:
                    </span>
                    <span className="font-bold text-red-300 capitalize">{selectedRecord.cause}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Traffic Density:
                    </span>
                    <span className="font-bold text-amber-300 capitalize">{selectedRecord.traffic_density || 'High'}</span>
                  </div>
                </div>

                {/* Risk Bar */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">Severity Rating:</span>
                    <span className={`font-black uppercase ${
                      selectedRecord.severity === 'fatal' ? 'text-red-400' : selectedRecord.severity === 'major' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedRecord.severity === 'fatal' ? 'Critical High' : selectedRecord.severity === 'major' ? 'Moderate High' : 'Low Risk'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedRecord.severity === 'fatal' ? 'w-full bg-gradient-to-r from-amber-500 to-red-600' :
                        selectedRecord.severity === 'major' ? 'w-2/3 bg-amber-500' :
                        'w-1/3 bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-3">
                <MapPin className="w-10 h-10 text-slate-700 animate-bounce" />
                <p className="text-xs">Click any accident pin or circle marker on the map to inspect location parameters.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={fetchMapData}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Map Spatial Layer</span>
            </button>
          </div>
        </div>
      </div>

      {/* DISCLAIMER NOTICE */}
      <div className="p-4 rounded-2xl bg-white/5 border border-red-500/20 text-xs text-slate-400 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Historical Concentration Note:</span> Coordinates represent aggregated spatial pattern samples from Dataset 1 (`indian_roads_dataset.csv`) for geographic hotspot identification and traffic management decision support.
        </div>
      </div>
    </div>
  );
};
