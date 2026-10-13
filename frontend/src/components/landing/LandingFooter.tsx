import React from 'react';
import { Route } from 'lucide-react';
import type { NavTab } from '../Navbar';

interface LandingFooterProps {
  onNavigate: (tab: NavTab) => void;
}

const columns: { heading: string; items: { label: string; tab: NavTab }[] }[] = [
  {
    heading: 'Platform',
    items: [
      { label: 'Predict severity', tab: 'predict' },
      { label: 'Explain a prediction', tab: 'explain' },
      { label: 'What-if simulator', tab: 'whatif' },
      { label: 'GIS risk map', tab: 'map' },
    ],
  },
  {
    heading: 'Analytics',
    items: [
      { label: 'Dashboard', tab: 'dashboard' },
      { label: 'Accident analytics', tab: 'analytics' },
      { label: 'Detailed factors', tab: 'detailed' },
      { label: 'Model comparison', tab: 'models' },
    ],
  },
];

export const LandingFooter: React.FC<LandingFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Route className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <span className="text-[17px] font-semibold tracking-tight text-slate-900">AcciPredict</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              Machine learning and spatial analytics for road accident severity. Built for teams that need to trust
              the numbers behind a decision.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading} className="md:col-span-3">
              <h3 className="text-sm font-semibold text-slate-900">{column.heading}</h3>
              <ul className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <li key={item.tab}>
                    <button
                      onClick={() => onNavigate(item.tab)}
                      className="text-sm text-slate-600 transition-colors hover:text-brand-700"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>AcciPredict</span>
          <span>Dataset 1 and Dataset 2 are kept strictly separate by design.</span>
        </div>
      </div>
    </footer>
  );
};
