import React, { useEffect, useState, useMemo } from 'react';
import type { MapResponse, MapAccidentRecord } from '../types';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, RefreshCw, Flame, Layers, 
  Navigation, Crosshair, Wind, Car, AlertTriangle, 
  Sparkles, Sun, CloudRain, CloudFog, Compass, Palette, Search,
  Eye, Zap, ShieldAlert, Activity, CheckCircle2
} from 'lucide-react';

const CITY_COORDINATES: { [key: string]: { coords: [number, number]; state: string; count: string; color: string; badgeBg: string } } = {
  'Mumbai': { coords: [19.0760, 72.8777], state: 'Maharashtra', count: '1,480 Accidents', color: 'from-pink-500 via-rose-500 to-red-600', badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  'Delhi': { coords: [28.6139, 77.2090], state: 'Delhi NCR', count: '1,450 Accidents', color: 'from-amber-500 via-orange-500 to-amber-600', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  'Bangalore': { coords: [12.9716, 77.5946], state: 'Karnataka', count: '1,420 Accidents', color: 'from-emerald-400 via-teal-500 to-emerald-600', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'Chennai': { coords: [13.0827, 80.2707], state: 'Tamil Nadu', count: '1,390 Accidents', color: 'from-cyan-400 via-blue-500 to-indigo-600', badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'Kolkata': { coords: [22.5726, 88.3639], state: 'West Bengal', count: '1,360 Accidents', color: 'from-purple-500 via-violet-500 to-indigo-600', badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  'Hyderabad': { coords: [17.3850, 78.4867], state: 'Telangana', count: '1,340 Accidents', color: 'from-fuchsia-500 via-pink-500 to-purple-600', badgeBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40' },
  'Pune': { coords: [18.5204, 73.8567], state: 'Maharashtra', count: '1,310 Accidents', color: 'from-red-500 via-rose-600 to-pink-600', badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40' },
  'Ahmedabad': { coords: [23.0225, 72.5714], state: 'Gujarat', count: '1,290 Accidents', color: 'from-yellow-400 via-amber-500 to-orange-600', badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' }
};

// Vibrant Colorful Custom Markers with Neon Pulse & Glow
const createVibrantMarkerIcon = (severity: string, sizeMultiplier: number = 1) => {
  let mainColor = '#10b981'; // vibrant emerald
  let gradient = 'linear-gradient(135deg, #34d399 0%, #059669 100%)';
  let glow = 'rgba(16, 185, 129, 0.9)';
  let pulseClass = 'marker-pulse-minor';
  let iconSymbol = '🛡️';

  if (severity === 'major') {
    mainColor = '#f59e0b';
    gradient = 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)';
    glow = 'rgba(245, 158, 11, 0.95)';
    pulseClass = 'marker-pulse-major';
    iconSymbol = '⚠️';
  }
  if (severity === 'fatal') {
    mainColor = '#f43f5e';
    gradient = 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)';
    glow = 'rgba(244, 63, 94, 1)';
    pulseClass = 'marker-pulse-fatal';
    iconSymbol = '🔥';
  }

  const baseSize = 28 * sizeMultiplier;
  const innerSize = 20 * sizeMultiplier;
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
        background: ${gradient};
        border: 2px solid #ffffff;
        box-shadow: 0 0 16px ${glow}, 0 4px 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${10 * sizeMultiplier}px;
      ">
        <span>${iconSymbol}</span>
      </div>
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
    map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
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
  const [basemapTheme, setBasemapTheme] = useState<'voyager' | 'dark' | 'osm' | 'topo' | 'satellite' | 'positron'>('voyager');
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
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'osm':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'topo':
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'positron':
        return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      case 'voyager':
      default:
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
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
    <div className="space-y-6 py-4">
      {/* HEADER SECTION WITH PALETTE BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-indigo-950/80 border border-pink-500/40 text-pink-300 text-xs font-extrabold mb-2 shadow-lg shadow-pink-500/10">
            <Palette className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>Colorful GIS Spatial Explorer Suite 3.0</span>
            <span className="bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-mono">Dataset 1</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
            <MapPin className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
            <span className="bg-gradient-to-r from-white via-cyan-100 to-indigo-200 bg-clip-text text-transparent">
              India Traffic Risk & Colorful GIS Spatial Map
            </span>
          </h1>
          <p className="text-xs text-gray-300 font-medium mt-1">
            Vibrant multi-basemap geospatial engine, animated neon pinpoints, real-time cause filter, & hotspot density inspector
          </p>
        </div>

        {/* COLORFUL BASEMAP SELECTOR STRIP */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-card border border-cyan-500/30 shadow-xl overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 px-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" /> Theme:
          </span>
          <button
            onClick={() => setBasemapTheme('voyager')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'voyager' ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-300' : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🌈 Voyager Color
          </button>
          <button
            onClick={() => setBasemapTheme('dark')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white shadow-lg shadow-purple-500/30 ring-1 ring-purple-300' : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🌙 Dark Neon
          </button>
          <button
            onClick={() => setBasemapTheme('osm')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'osm' ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-green-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-300' : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🗺️ OpenStreet
          </button>
          <button
            onClick={() => setBasemapTheme('topo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'topo' ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-600 text-white shadow-lg shadow-amber-500/30 ring-1 ring-amber-300' : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🏔️ Topo Terrain
          </button>
          <button
            onClick={() => setBasemapTheme('satellite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'satellite' ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white shadow-lg shadow-rose-500/30 ring-1 ring-rose-300' : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🛰️ Satellite HD
          </button>
          <button
            onClick={() => setBasemapTheme('positron')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemapTheme === 'positron' ? 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 font-black shadow-lg shadow-white/20' : 'text-gray-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            🎨 Pastel Light
          </button>
        </div>
      </div>

      {/* FILTER CONTROL BAR & SEARCH INPUT */}
      <div className="glass-card p-4 rounded-3xl border border-gray-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* SEARCH BOX */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, cause, weather, road type..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* VIEW MODES */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">View Mode:</span>
            <button
              onClick={() => setViewMode('markers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'markers' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 ring-1 ring-cyan-300' : 'glass-panel text-gray-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Neon Markers
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'heatmap' ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white shadow-lg shadow-amber-500/40 ring-1 ring-amber-300' : 'glass-panel text-gray-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" /> Heatmap Gradient
            </button>
            <button
              onClick={() => setViewMode('density')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'density' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-300' : 'glass-panel text-gray-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Cluster Circles
            </button>
          </div>
        </div>

        {/* FILTER CHIPS ROW */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-gray-800/80">
          {/* Severity Chips */}
          <span className="text-gray-400 font-bold shrink-0">Severity:</span>
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              severityFilter === 'all' ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-900/90 text-gray-300 border border-gray-800 hover:border-gray-600'
            }`}
          >
            🌈 All ({mapData?.accidents?.length || 0})
          </button>
          <button
            onClick={() => setSeverityFilter('fatal')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              severityFilter === 'fatal' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40' : 'bg-slate-900/90 text-rose-400 border border-rose-900/60 hover:border-rose-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Fatal Only ({fatalCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('major')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              severityFilter === 'major' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40' : 'bg-slate-900/90 text-amber-400 border border-amber-900/60 hover:border-amber-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Major Only ({majorCount})</span>
          </button>
          <button
            onClick={() => setSeverityFilter('minor')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              severityFilter === 'minor' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40' : 'bg-slate-900/90 text-emerald-400 border border-emerald-900/60 hover:border-emerald-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Minor Only ({minorCount})</span>
          </button>

          {/* Weather Chips */}
          <span className="text-gray-400 font-bold shrink-0 ml-3">Weather:</span>
          <button
            onClick={() => setWeatherFilter(weatherFilter === 'clear' ? 'all' : 'clear')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
              weatherFilter === 'clear' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900/90 text-amber-300 border border-gray-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> ☀️ Clear
          </button>
          <button
            onClick={() => setWeatherFilter(weatherFilter === 'rain' ? 'all' : 'rain')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
              weatherFilter === 'rain' ? 'bg-blue-600 text-white' : 'bg-slate-900/90 text-blue-300 border border-gray-800'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> 🌧️ Heavy Rain
          </button>
          <button
            onClick={() => setWeatherFilter(weatherFilter === 'fog' ? 'all' : 'fog')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
              weatherFilter === 'fog' ? 'bg-purple-600 text-white' : 'bg-slate-900/90 text-purple-300 border border-gray-800'
            }`}
          >
            <CloudFog className="w-3.5 h-3.5" /> 🌫️ Fog
          </button>

          {/* Cause Filter Dropdown */}
          <span className="text-gray-400 font-bold shrink-0 ml-3">Cause:</span>
          <select
            value={causeFilter}
            onChange={(e) => setCauseFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-200 font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">🎯 All Accident Causes</option>
            <option value="over-speeding">⚡ Over-Speeding</option>
            <option value="drunk driving">🍷 Drunk Driving</option>
            <option value="weather conditions">🌧️ Adverse Weather</option>
            <option value="mechanical breakdown">🔧 Mechanical Failure</option>
            <option value="distracted driving">📱 Distracted Driving</option>
            <option value="sudden braking">🛑 Sudden Braking</option>
          </select>

          {/* Reset button */}
          <button
            onClick={resetMapView}
            className="ml-auto px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* QUICK CITY HOTSPOT FLY-TO CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-300">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Interactive City Hotspots (Click to Fly-To Metro Hotspot)</span>
          </div>
          <span className="text-gray-400 font-mono text-[11px]">8 Metro Clusters Active</span>
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
                    ? `bg-gradient-to-br ${info.color} text-white border-white shadow-xl shadow-cyan-500/20 ring-2 ring-white/60`
                    : 'glass-card text-gray-200 border-gray-800 hover:border-cyan-500/50 hover:bg-slate-800/80'
                }`}
              >
                <div className="font-extrabold text-sm flex items-center justify-between">
                  <span>{cityName}</span>
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white animate-bounce' : 'text-cyan-400 opacity-60 group-hover:opacity-100'}`} />
                </div>
                <div className="text-[10px] opacity-80 font-medium">{info.state}</div>
                <div className={`text-[10px] font-extrabold mt-2 inline-block px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/30 text-white' : info.badgeBg}`}>
                  {info.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN MAP CONTAINER & LOCATION INSPECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAP DISPLAY BOX */}
        <div className="lg:col-span-8 glass-card p-2 rounded-3xl h-[640px] relative overflow-hidden shadow-2xl border border-cyan-500/30">
          {loading && (
            <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-cyan-400 font-bold text-sm gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <span>Rendering Geospatial Coordinates & Multi-Tile Basemaps...</span>
            </div>
          )}

          {/* FLOATING HUD MINI STATS OVERLAY (Top-Left) */}
          {showHUD && mapData && (
            <div className="absolute top-4 left-4 z-[400] glass-card p-3.5 rounded-2xl border border-cyan-500/40 text-xs space-y-2 shadow-2xl backdrop-blur-xl max-w-[260px]">
              <div className="flex items-center justify-between border-b border-gray-700/80 pb-2">
                <span className="font-extrabold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" /> Spatial Analytics HUD
                </span>
                <button onClick={() => setShowHUD(false)} className="text-gray-400 hover:text-white font-bold text-xs">✕</button>
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Filtered:</span>
                  <span className="font-extrabold text-cyan-300">{totalCount} / {mapData.accidents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-400 flex items-center gap-1">🔴 Fatal Rate:</span>
                  <span className="font-extrabold text-rose-300">{fatalCount} ({fatalPct}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400 flex items-center gap-1">🟠 Major Rate:</span>
                  <span className="font-extrabold text-amber-300">{majorCount} ({majorPct}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 flex items-center gap-1">🟢 Minor Rate:</span>
                  <span className="font-extrabold text-emerald-300">{minorCount} ({minorPct}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* HUD TOGGLE RE-OPEN BUTTON IF CLOSED */}
          {!showHUD && (
            <button
              onClick={() => setShowHUD(true)}
              className="absolute top-4 left-4 z-[400] glass-card px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 shadow-lg hover:bg-slate-800"
            >
              <Activity className="w-3.5 h-3.5" /> Show HUD
            </button>
          )}

          {/* HEATMAP RADIUS / MARKER SCALE FLOATING OVERLAY (Top-Right) */}
          <div className="absolute top-4 right-4 z-[400] glass-card p-3 rounded-2xl border border-cyan-500/40 text-xs space-y-2 shadow-2xl backdrop-blur-xl">
            {viewMode === 'heatmap' ? (
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 animate-pulse" /> Heatmap Intensity Radius: {heatmapRadius}px
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={heatmapRadius}
                  onChange={(e) => setHeatmapRadius(parseInt(e.target.value))}
                  className="w-44 accent-amber-500 cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> Marker Size:
                </span>
                <button
                  onClick={() => setMarkerScale(0.8)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${markerScale === 0.8 ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Small
                </button>
                <button
                  onClick={() => setMarkerScale(1)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${markerScale === 1 ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setMarkerScale(1.4)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${markerScale === 1.4 ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Mega Glow
                </button>
              </div>
            )}
          </div>

          {/* COLOR LEGEND OVERLAY (Bottom-Left) */}
          <div className="absolute bottom-4 left-4 z-[400] glass-card p-3 rounded-2xl border border-cyan-500/30 text-[11px] space-y-1.5 shadow-2xl backdrop-blur-xl hidden sm:block">
            <div className="font-extrabold text-white flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> GIS Severity Legend
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-rose-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)] animate-ping" /> Fatal
              </div>
              <div className="flex items-center gap-1 text-amber-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]" /> Major
              </div>
              <div className="flex items-center gap-1 text-emerald-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" /> Minor
              </div>
            </div>
          </div>

          {/* LEAFLET MAP CANVAS */}
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', borderRadius: '1.25rem' }}
          >
            <MapFlyToController center={mapCenter} zoom={mapZoom} />

            <TileLayer
              attribution='&copy; <a href="https://www.carto.com/">CARTO</a> & OpenStreetMap'
              url={getTileUrl()}
            />

            {/* NEON PIN MARKERS MODE */}
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
                  <div className="p-2 space-y-2 text-xs font-sans text-gray-100 min-w-[200px]">
                    <div className="font-bold border-b border-gray-700 pb-1.5 text-sm uppercase flex items-center justify-between gap-2">
                      <span className="text-white font-extrabold">{record.city}, {record.state}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] text-white font-black uppercase shadow-lg ${
                        record.severity === 'fatal' ? 'bg-rose-600 shadow-rose-600/50' : 
                        record.severity === 'major' ? 'bg-amber-600 shadow-amber-600/50' : 
                        'bg-emerald-600 shadow-emerald-600/50'
                      }`}>
                        {record.severity}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-300">
                      <div><strong>Date & Time:</strong> {record.date} ({record.time})</div>
                      <div><strong>Weather:</strong> {record.weather} ({record.temperature}°C)</div>
                      <div><strong>Road Type:</strong> {record.road_type}</div>
                      <div><strong>Cause:</strong> <span className="text-cyan-300 font-bold">{record.cause}</span></div>
                    </div>

                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="mt-2 w-full py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-[11px] text-center block cursor-pointer transition-all shadow-md"
                    >
                      Inspect Location Parameters →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* DYNAMIC HEATMAP & DENSITY CIRCLES MODE */}
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
                  color: record.severity === 'fatal' ? '#f43f5e' : record.severity === 'major' ? '#f59e0b' : '#10b981',
                  fillColor: record.severity === 'fatal' ? '#f43f5e' : record.severity === 'major' ? '#f59e0b' : '#10b981',
                  fillOpacity: viewMode === 'heatmap' ? 0.5 : 0.75,
                  weight: viewMode === 'heatmap' ? 0.5 : 2
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* SIDE PANEL: ACCIDENT LOCATION INSPECTOR CARD */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-gray-800 space-y-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Location Accident Inspector</span>
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                Interactive Inspector
              </span>
            </div>

            {selectedRecord ? (
              <div className="space-y-4">
                {/* Location Header Badge */}
                <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-2 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-white uppercase tracking-wider">{selectedRecord.city}, {selectedRecord.state}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase shadow-lg ${
                      selectedRecord.severity === 'fatal' ? 'bg-rose-600 text-white shadow-rose-600/40 ring-1 ring-rose-300' :
                      selectedRecord.severity === 'major' ? 'bg-amber-600 text-white shadow-amber-600/40 ring-1 ring-amber-300' :
                      'bg-emerald-600 text-white shadow-emerald-600/40 ring-1 ring-emerald-300'
                    }`}>
                      {selectedRecord.severity}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-cyan-300 flex items-center justify-between pt-1 border-t border-gray-800/80">
                    <span className="flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" /> Lat: {selectedRecord.latitude.toFixed(4)}, Lng: {selectedRecord.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Detailed Attribute Cards */}
                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/80 border border-gray-800/80">
                    <span className="text-gray-400">Date & Time:</span>
                    <span className="font-bold text-white font-mono">{selectedRecord.date} ({selectedRecord.time})</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/80 border border-gray-800/80">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-cyan-400" /> Weather:
                    </span>
                    <span className="font-bold text-cyan-300 capitalize">{selectedRecord.weather} ({selectedRecord.temperature}°C)</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/80 border border-gray-800/80">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-indigo-400" /> Road Type:
                    </span>
                    <span className="font-bold text-white capitalize">{selectedRecord.road_type}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/80 border border-gray-800/80">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Primary Cause:
                    </span>
                    <span className="font-bold text-rose-300 capitalize">{selectedRecord.cause}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/80 border border-gray-800/80">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Traffic Density:
                    </span>
                    <span className="font-bold text-amber-300 capitalize">{selectedRecord.traffic_density || 'High'}</span>
                  </div>
                </div>

                {/* Risk Level Visualization Bar */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-gray-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-bold">Location Risk Severity Rating:</span>
                    <span className={`font-black uppercase ${
                      selectedRecord.severity === 'fatal' ? 'text-rose-400' : selectedRecord.severity === 'major' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedRecord.severity === 'fatal' ? 'Critical High' : selectedRecord.severity === 'major' ? 'Moderate High' : 'Low Risk'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedRecord.severity === 'fatal' ? 'w-full bg-gradient-to-r from-amber-500 to-rose-600' :
                        selectedRecord.severity === 'major' ? 'w-2/3 bg-gradient-to-r from-yellow-500 to-amber-500' :
                        'w-1/3 bg-gradient-to-r from-teal-500 to-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 space-y-3">
                <MapPin className="w-12 h-12 text-gray-700 animate-bounce" />
                <p className="text-xs">Click any accident pin or circle marker on the spatial map to inspect location parameters.</p>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-gray-800 space-y-3">
            <button
              onClick={fetchMapData}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh GIS Spatial Layer</span>
            </button>
          </div>
        </div>
      </div>

      {/* HISTORICAL CONCENTRATION DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/20 text-xs text-gray-400 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Historical Concentration Disclaimer:</span> Geographic coordinates displayed on the map represent spatial pattern samples from Dataset 1 (`indian_roads_dataset.csv`) aggregated for high-risk GIS hotspot identification, spatial pattern analysis, and traffic management decision support.
        </div>
      </div>
    </div>
  );
};
