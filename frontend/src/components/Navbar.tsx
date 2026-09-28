import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, BrainCircuit, SlidersHorizontal, 
  HelpCircle, Map, BarChart3, Layers, Award, Home, ArrowRight, Sparkles,
  Search, Command, X, Menu
} from 'lucide-react';
import gsap from 'gsap';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activePillRef = useRef<HTMLDivElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-3.5 h-3.5" />, desc: 'System overview & platform features' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, desc: 'Dataset 1 historical overview KPIs' },
    { id: 'predict', label: 'Predictor', icon: <BrainCircuit className="w-3.5 h-3.5" />, desc: 'Run multiclass severity classification model' },
    { id: 'whatif', label: 'What-If', icon: <SlidersHorizontal className="w-3.5 h-3.5" />, desc: 'Simulate hypothetical scenario risk shifts' },
    { id: 'explain', label: 'XAI (SHAP)', icon: <HelpCircle className="w-3.5 h-3.5" />, desc: 'SHAP feature attribution & explainability' },
    { id: 'map', label: 'GIS Map', icon: <Map className="w-3.5 h-3.5" />, desc: 'India spatial risk map & city hotspot layers' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" />, desc: 'Temporal, weather & road infrastructure trends' },
    { id: 'detailed', label: 'Factors', icon: <Layers className="w-3.5 h-3.5" />, desc: 'Dataset 2 driver, vehicle & casualty metrics' },
    { id: 'models', label: 'Models', icon: <Award className="w-3.5 h-3.5" />, desc: '5-model evaluation benchmark & confusion matrix' },
  ];

  // Scroll detection for navbar shrink effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // GSAP animation on active tab change
  useEffect(() => {
    if (!navContainerRef.current) return;
    const activeBtn = navContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    if (activeBtn && activePillRef.current) {
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();

      gsap.to(activePillRef.current, {
        x: btnRect.left - containerRect.left,
        width: btnRect.width,
        duration: 0.35,
        ease: 'power3.out'
      });
    }
  }, [activeTab]);

  const filteredNavItems = navItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTab = (tabId: NavTab) => {
    setActiveTab(tabId);
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#060609]/95 backdrop-blur-2xl border-b border-red-500/20 shadow-xl shadow-red-600/5 py-2' 
          : 'bg-[#060609]/85 backdrop-blur-xl border-b border-white/10 py-3'
      } px-4 lg:px-8`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Name: AcciPredict */}
          <div 
            onClick={() => handleSelectTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                  Acci<span className="text-red-500">Predict</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Traffic Accident Severity & Analytics
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Interactive Pill Container with Sliding GSAP Indicator) */}
          <div 
            ref={navContainerRef}
            className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 relative overflow-x-auto scrollbar-none"
          >
            {/* Sliding GSAP Active Pill Background */}
            <div 
              ref={activePillRef}
              className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/30 pointer-events-none z-0"
              style={{ left: 0, width: 0 }}
            />

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-tab-id={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Utilities: Cmd+K Quick Search & Action CTA */}
          <div className="flex items-center gap-2">
            {/* Cmd+K Quick Jump Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-medium backdrop-blur-md cursor-pointer transition-all hover:scale-105"
              title="Quick Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-400 border border-white/10">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            {/* Predict Severity Action CTA */}
            <button
              onClick={() => handleSelectTab('predict')}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Predict Severity</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 space-y-1 border-t border-white/10 mt-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === item.id ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">{item.desc}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* QUICK COMMAND PALETTE MODAL (CMD + K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl glass-card rounded-3xl border border-red-500/30 overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Search className="w-5 h-5 text-red-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search tools, modules, analytics..."
                className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500 font-medium"
              />
              <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white p-1 text-xs">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Quick Navigation</div>
              {filteredNavItems.length > 0 ? (
                filteredNavItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-red-600/20 border border-transparent hover:border-red-500/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/5 group-hover:bg-red-600 text-slate-300 group-hover:text-white transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-red-300">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">No matching module found.</div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] text-slate-500 flex justify-between">
              <span>Press <kbd className="px-1 bg-white/10 rounded">ESC</kbd> to close</span>
              <span>AcciPredict Quick Navigation</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
