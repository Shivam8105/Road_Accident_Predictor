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
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
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

      <footer className="glass-panel border-t border-gray-800/80 py-6 px-4 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">TRAFFIC AI</span>
            <span>— Final Year AI Project</span>
          </div>
          <div>
            Powered by FastAPI, PyTorch/Scikit-Learn, SHAP XAI & React Leaflet
          </div>
          <div className="text-[11px] text-gray-500">
            Strict Dataset Separation Architecture Maintained
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
