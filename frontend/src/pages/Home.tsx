import React from 'react';
import type { NavTab } from '../components/Navbar';
import { 
  BrainCircuit, SlidersHorizontal, HelpCircle, Map, BarChart3, 
  Layers, Award, ShieldCheck, Database, ArrowRight, Zap
} from 'lucide-react';

interface HomeProps {
  setActiveTab: (tab: NavTab) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-10 py-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-card p-8 lg:p-12 border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Final-Year AI Engineering Project</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            AI-Powered Traffic Accident Severity Prediction & Explainable Analytics
          </h1>

          <p className="text-base lg:text-lg text-gray-300 font-normal leading-relaxed">
            An advanced machine learning framework evaluating 5 classification algorithms, SHAP feature attribution, interactive What-If scenario simulations, and spatial accident risk mapping across India.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('predict')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Predict Severity</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold text-sm transition-all hover:scale-105 cursor-pointer"
            >
              <Map className="w-4 h-4 text-cyan-400" />
              <span>Explore India Map</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold text-sm transition-all hover:scale-105 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Model Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Architecture Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dataset 1 Card */}
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
              PRIMARY DATASET (20,000 Rows)
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Dataset 1: Indian Roads Dataset</h3>
          <p className="text-xs text-gray-400 mb-4">
            Powers the 5 ML severity models, SHAP Explainable AI, What-If simulator, interactive Leaflet map, and city/state/weather/time analytics.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">5 ML Models</span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">SHAP Explainability</span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">What-If Simulator</span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">Geo Map & Heatmap</span>
          </div>
        </div>

        {/* Dataset 2 Card */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700">
              INDEPENDENT ANALYTICS (12,316 Rows)
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Dataset 2: Detailed Accident Factors (Road.csv)</h3>
          <p className="text-xs text-gray-400 mb-4">
            Used strictly as an independent analytics pipeline to analyze driver experience, vehicle service age, road surface conditions, and casualty characteristics.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">Driver Experience</span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">Vehicle Defects</span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">Casualty Severity</span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">Collision Types</span>
          </div>
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span>Platform Capabilities & Modules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setActiveTab('predict')}
            className="glass-card p-6 rounded-2xl hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="p-3 w-fit rounded-xl bg-cyan-950 text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Accident Severity Prediction</h3>
            <p className="text-xs text-gray-400">
              Enter real-time road, environmental, and temporal parameters to obtain predicted severity (Minor, Major, Fatal) and class probabilities.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('whatif')}
            className="glass-card p-6 rounded-2xl hover:border-indigo-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="p-3 w-fit rounded-xl bg-indigo-950 text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">What-If Scenario Simulator</h3>
            <p className="text-xs text-gray-400">
              Interactively adjust weather, speed, traffic density, or road conditions to simulate severity probability shifts.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('explain')}
            className="glass-card p-6 rounded-2xl hover:border-purple-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="p-3 w-fit rounded-xl bg-purple-950 text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">SHAP Explainable AI</h3>
            <p className="text-xs text-gray-400">
              Understand exact feature attributions behind every model decision with positive & negative feature contribution graphs.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('map')}
            className="glass-card p-6 rounded-2xl hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="p-3 w-fit rounded-xl bg-emerald-950 text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">India Accident GIS Map</h3>
            <p className="text-xs text-gray-400">
              Explore historical accident distribution across Indian cities with Leaflet markers, density heatmaps, and multi-parameter filters.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('analytics')}
            className="glass-card p-6 rounded-2xl hover:border-amber-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="p-3 w-fit rounded-xl bg-amber-950 text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Dataset 1 Analytics</h3>
            <p className="text-xs text-gray-400">
              Deep dive into city rankings, state trends, hourly peak period spikes, weather conditions, and accident cause distributions.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('models')}
            className="glass-card p-6 rounded-2xl hover:border-rose-500/40 cursor-pointer transition-all hover:-translate-y-1 group"
          >
            <div className="p-3 w-fit rounded-xl bg-rose-950 text-rose-400 mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">5-Model Benchmarking</h3>
            <p className="text-xs text-gray-400">
              Evaluate Logistic Regression, Decision Tree, Random Forest, XGBoost, and LightGBM using Accuracy, Macro F1, and Confusion Matrices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
