import React, { useEffect, useState } from 'react';
import { Route, Menu, X } from 'lucide-react';
import { Button } from './ui';

interface LandingNavProps {
  onLaunch: () => void;
}

const links = [
  { label: 'Platform', href: '#platform' },
  { label: 'Map', href: '#map-preview' },
  { label: 'Analytics', href: '#analytics-preview' },
  { label: 'Explainability', href: '#explainability' },
];

export const LandingNav: React.FC<LandingNavProps> = ({ onLaunch }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Route className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-slate-900">AcciPredict</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button onClick={onLaunch}>Open dashboard</Button>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 md:hidden"
        >
          {open ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700 last:border-0"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <Button
            className="mt-4 w-full"
            onClick={() => {
              setOpen(false);
              onLaunch();
            }}
          >
            Open dashboard
          </Button>
        </div>
      )}
    </header>
  );
};
