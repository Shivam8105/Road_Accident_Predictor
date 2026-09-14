import React from 'react';
import { 
  ShieldAlert, LayoutDashboard, BrainCircuit, SlidersHorizontal, 
  HelpCircle, Map, BarChart3, Layers, Award, Home
} from 'lucide-react';

export type NavTab = 
  | 'home' 
  | 'dashboard' 
  | 'predict' 
  | 'whatif' 
  | 'explain' 
  | 'map' 
  | 'analytics' 
  | 'detailed' 
  | 'models';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'predict', label: 'Predict Severity', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'whatif', label: 'What-If Simulator', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'explain', label: 'Explain Prediction', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'map', label: 'Accident Map', icon: <Map className="w-4 h-4" /> },
    { id: 'analytics', label: 'Accident Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'detailed', label: 'Detailed Factors', icon: <Layers className="w-4 h-4" /> },
    { id: 'models', label: 'Model Comparison', icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/60 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                TRAFFIC<span className="text-cyan-400">AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 rounded-full">
                XAI 2.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              Accident Severity Prediction & Analytics Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
