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

  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
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

      <footer className="glass-panel border-t border-white/10 py-6 px-4 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-white">Acci<span className="text-red-500">Predict</span></span>
            <span>— AI Traffic Safety & Severity Platform</span>
          </div>
          <div>
            FastAPI, Scikit-Learn / XGBoost, SHAP XAI & React Leaflet
          </div>
          <div className="text-[11px] text-slate-500">
            Strict Dataset Separation Maintained
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
