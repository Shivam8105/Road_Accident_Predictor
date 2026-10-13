import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Menu, Search, X } from 'lucide-react';

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

interface NavItem {
  id: NavTab;
  label: string;
  description: string;
  group: 'primary' | 'tools' | 'research';
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', description: 'Platform overview', group: 'primary' },
  { id: 'dashboard', label: 'Dashboard', description: 'Historical accident overview', group: 'primary' },
  { id: 'predict', label: 'Predictor', description: 'Accident severity forecast', group: 'primary' },
  { id: 'map', label: 'GIS Map', description: 'Explore spatial risk', group: 'primary' },
  { id: 'analytics', label: 'Analytics', description: 'Review accident patterns', group: 'primary' },
  { id: 'whatif', label: 'What-If', description: 'Compare safer scenarios', group: 'tools' },
  { id: 'explain', label: 'XAI (SHAP)', description: 'Explain prediction factors', group: 'tools' },
  { id: 'detailed', label: 'Factors', description: 'Inspect detailed accident factors', group: 'research' },
  { id: 'models', label: 'Models', description: 'Compare model performance', group: 'research' }
];

const primaryItems = navItems.filter((item) => item.group === 'primary');
const desktopPrimaryItems = primaryItems.filter((item) => item.id !== 'home');
const overflowItems = navItems.filter((item) => item.group !== 'primary');

const focusRing = 'cursor-pointer focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25';

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setToolsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || searchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, searchOpen]);

  useEffect(() => {
    if (!toolsOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!toolsMenuRef.current?.contains(event.target as Node)) setToolsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [toolsOpen]);

  const filteredNavItems = navItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    return item.label.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
  });

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setToolsOpen(false);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItemClass = (item: NavItem) => [
    'relative flex h-16 items-center whitespace-nowrap border-0 bg-transparent px-0 text-[13px] font-medium transition-colors',
    focusRing,
    activeTab === item.id
      ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand'
      : 'text-muted hover:text-ink'
  ].join(' ');

  return (
    <>
      <header className="sticky top-0 z-40 h-16 border-b border-line bg-canvas/95 text-ink">
        <div className="mx-auto flex h-full w-[calc(100%-2rem)] max-w-[1360px] items-center justify-between gap-5 sm:w-[calc(100%-3rem)]">
          <button
            className={`flex shrink-0 items-center gap-2.5 border-0 bg-transparent p-0 text-ink ${focusRing}`}
            type="button"
            onClick={() => handleSelectTab('home')}
            aria-label="Go to AcciPredict home"
          >
            <img className="size-9" src="/accipredict-mark.svg" alt="" aria-hidden="true" />
            <span className="text-[18px] font-bold tracking-[-0.035em]">Acci<span className="text-brand">Predict</span></span>
          </button>

          <nav className="hidden h-full items-center gap-5 xl:flex" aria-label="Primary navigation">
            {desktopPrimaryItems.map((item) => (
              <button key={item.id} className={navItemClass(item)} type="button" onClick={() => handleSelectTab(item.id)}>
                {item.label}
              </button>
            ))}

            <div ref={toolsMenuRef} className="relative flex h-full items-center">
              <button
                className={`flex h-10 items-center gap-1.5 rounded-[10px] border-0 bg-transparent px-2.5 text-[13px] font-medium transition-colors hover:bg-brand-soft hover:text-brand-deep ${overflowItems.some((item) => item.id === activeTab) ? 'text-brand-deep' : 'text-muted'} ${focusRing}`}
                type="button"
                onClick={() => setToolsOpen((open) => !open)}
                aria-expanded={toolsOpen}
                aria-haspopup="menu"
              >
                More
                <ChevronDown className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`} size={15} />
              </button>

              {toolsOpen && (
                <div className="absolute right-0 top-[calc(100%-4px)] w-72 overflow-hidden rounded-[14px] border border-line bg-surface p-2 shadow-[0_20px_55px_rgba(24,89,201,0.14)]" role="menu">
                  {overflowItems.map((item) => (
                    <button
                      key={item.id}
                      className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-[10px] border-0 px-3 py-3 text-left transition-colors hover:bg-brand-soft ${activeTab === item.id ? 'bg-brand-soft' : 'bg-transparent'} ${focusRing}`}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      role="menuitem"
                    >
                      <span>
                        <strong className="block text-[13px] font-semibold text-ink">{item.label}</strong>
                        <span className="mt-1 block text-[11px] text-muted">{item.description}</span>
                      </span>
                      <ArrowRight size={15} className="text-brand" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              className={`grid size-10 place-items-center rounded-[10px] border border-line bg-surface text-slate-700 transition-colors hover:border-slate-300 hover:text-brand ${focusRing}`}
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search pages"
              title="Search pages (Command K)"
            >
              <Search size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              className={`hidden h-10 items-center gap-2 whitespace-nowrap rounded-[10px] border border-brand bg-brand px-4 text-[13px] font-semibold text-white transition-colors hover:border-brand-deep hover:bg-brand-deep active:scale-[0.98] sm:flex ${focusRing}`}
              type="button"
              onClick={() => handleSelectTab('predict')}
            >
              Predict severity
              <ArrowRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button
              className={`grid size-10 place-items-center rounded-[10px] border border-line bg-surface text-slate-700 transition-colors hover:border-slate-300 hover:text-brand xl:hidden ${focusRing}`}
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {mobileMenuOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div id="mobile-navigation" className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-canvas xl:hidden">
          <nav className="mx-auto grid w-[calc(100%-2rem)] max-w-3xl gap-8 py-7 sm:w-[calc(100%-3rem)]" aria-label="Mobile navigation">
            {[
              { label: 'Main', items: primaryItems },
              { label: 'Tools and research', items: overflowItems }
            ].map((section) => (
              <section key={section.label}>
                <h2 className="mb-3 text-[12px] font-semibold text-muted">{section.label}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      className={`grid min-h-20 grid-cols-[1fr_auto] items-center gap-4 rounded-[12px] border p-4 text-left transition-colors ${activeTab === item.id ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:border-slate-300'} ${focusRing}`}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                    >
                      <span>
                        <strong className="block text-[15px] font-semibold text-ink">{item.label}</strong>
                        <span className="mt-1 block text-[12px] leading-5 text-muted">{item.description}</span>
                      </span>
                      <ArrowRight size={17} className="text-brand" />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </div>
      )}

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 px-4 pt-20 sm:pt-24"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <section className="w-full max-w-[590px] overflow-hidden rounded-[16px] border border-line bg-surface text-ink shadow-[0_28px_90px_rgba(16,24,40,0.22)]" role="dialog" aria-modal="true" aria-label="Search AcciPredict pages">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line px-4 py-4 text-muted">
              <Search size={19} strokeWidth={1.8} aria-hidden="true" />
              <input
                className="w-full border-0 bg-transparent py-1 text-[15px] text-ink outline-none placeholder:text-slate-500"
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search pages and tools"
                aria-label="Search pages and tools"
              />
              <button className={`grid size-8 place-items-center rounded-[8px] border-0 bg-slate-100 text-slate-700 hover:text-brand ${focusRing}`} type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={17} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>

            <div className="p-3">
              <p className="mb-2 px-2 text-[12px] font-semibold text-muted">Search pages</p>
              <div className="max-h-[min(370px,60dvh)] overflow-y-auto">
                {filteredNavItems.length > 0 ? (
                  filteredNavItems.map((item) => (
                    <button
                      key={item.id}
                      className={`grid w-full grid-cols-[1fr_auto] items-center gap-4 border-0 border-b border-slate-100 bg-transparent px-3 py-3 text-left transition-colors hover:bg-slate-50 ${focusRing}`}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                    >
                      <span>
                        <strong className="block text-[14px] font-semibold text-ink">{item.label}</strong>
                        <span className="mt-1 block text-[12px] text-muted">{item.description}</span>
                      </span>
                      <ArrowRight size={17} strokeWidth={1.8} className="text-brand" aria-hidden="true" />
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-10 text-center text-[14px] text-muted">No matching page found.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};
