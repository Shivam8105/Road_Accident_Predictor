import { useState } from 'react';
import { Navbar } from './components/Navbar';
import type { NavTab } from './components/Navbar';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { PredictSeverity } from './pages/PredictSeverity';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { ExplainPrediction } from './pages/ExplainPrediction';
import { AccidentMap } from './pages/AccidentMap';
import { AccidentAnalytics } from './pages/AccidentAnalytics';
import { DetailedAccidentFactors } from './pages/DetailedAccidentFactors';
import { ModelComparison } from './pages/ModelComparison';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const isLanding = activeTab === 'home';

  return (
    <div className={`flex min-h-dvh flex-col overflow-x-clip font-sans text-ink scheme-light ${isLanding ? 'bg-canvas' : 'bg-workspace'}`}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={isLanding ? 'w-full flex-1' : 'mx-auto w-full max-w-[1360px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10'}>
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'predict' && (
          <PredictSeverity 
            setActiveTab={setActiveTab} 
          />
        )}
        {activeTab === 'whatif' && <WhatIfSimulator />}
        {activeTab === 'explain' && <ExplainPrediction />}
        {activeTab === 'map' && <AccidentMap />}
        {activeTab === 'analytics' && <AccidentAnalytics />}
        {activeTab === 'detailed' && <DetailedAccidentFactors />}
        {activeTab === 'models' && <ModelComparison />}
      </main>

      <footer className="border-t border-line bg-surface text-muted">
        <div className={`mx-auto grid w-[calc(100%-2rem)] max-w-[1180px] items-center gap-5 py-8 sm:w-[calc(100%-3rem)] md:grid-cols-[1fr_1fr_auto] md:gap-12 ${isLanding ? 'md:min-h-[150px]' : 'md:min-h-[104px]'}`}>
          <div>
            <strong className="text-[16px] font-semibold tracking-[-0.025em] text-ink">Acci<span className="text-brand">Predict</span></strong>
            <p className="mt-1.5 max-w-sm text-[12px] leading-5">Road safety intelligence for clearer decisions.</p>
          </div>
          <p className="m-0 max-w-sm text-[12px] leading-5">Predictions support analysis. They do not guarantee accident prevention.</p>
          <button className="w-fit cursor-pointer border-0 bg-transparent py-2 text-[13px] font-semibold text-brand-deep focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand/25" type="button" onClick={() => setActiveTab('predict')}>Predict severity</button>
        </div>
      </footer>
    </div>
  );
}

export default App;
