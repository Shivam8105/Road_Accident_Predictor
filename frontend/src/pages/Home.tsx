import React, { useEffect, useRef, useState } from 'react';
import type { NavTab } from '../components/Navbar';
import { 
  BrainCircuit, SlidersHorizontal, HelpCircle, Map, 
  Layers, Database, ArrowRight,
  ChevronDown, Zap, Compass
} from 'lucide-react';
import gsap from 'gsap';

interface HomeProps {
  setActiveTab: (tab: NavTab) => void;
}

export const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const workflowRef = useRef<HTMLDivElement>(null);

  // Interactive Live Estimator State (Homepage Interactive Widget)
  const [demoSpeed, setDemoSpeed] = useState(85);
  const [demoWeather, setDemoWeather] = useState<'clear' | 'rain' | 'fog'>('rain');
  const [demoDensity, setDemoDensity] = useState<'low' | 'medium' | 'high'>('high');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      // Feature cards staggered entrance
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 40, scale: 0.95 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.8, 
            stagger: 0.12, 
            ease: 'back.out(1.4)',
            delay: 0.3 
          }
        );
      }

      // Stats bar entrance
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', delay: 0.6 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Calculate live demo risk score based on sliders
  const calculateDemoRisk = () => {
    let score = 30; // base score
    if (demoSpeed > 60) score += (demoSpeed - 60) * 0.7;
    if (demoWeather === 'rain') score += 20;
    if (demoWeather === 'fog') score += 28;
    if (demoDensity === 'high') score += 18;
    if (demoDensity === 'medium') score += 8;
    return Math.min(Math.round(score), 98);
  };

  const demoRisk = calculateDemoRisk();
  const demoSeverity = demoRisk > 70 ? 'FATAL' : demoRisk > 45 ? 'MAJOR' : 'MINOR';

  const faqs = [
    {
      q: "How does AcciPredict classify accident severity?",
      a: "AcciPredict uses a 5-classifier machine learning pipeline (Logistic Regression, Decision Tree, Random Forest, XGBoost, LightGBM) trained on 20,000 records from Dataset 1 to predict 3 distinct multiclass outcomes: Minor, Major, and Fatal severity."
    },
    {
      q: "Why are Dataset 1 and Dataset 2 kept strictly separate?",
      a: "Dataset 1 (`indian_roads_dataset.csv`) contains GIS spatial coordinates and balanced multiclass targets suited for primary ML inference. Dataset 2 (`Road.csv`) contains detailed driver, vehicle, and casualty attributes but exhibits severe target class imbalance (84.6% Slight Injury). Keeping them isolated prevents synthetic data leakage and ensures domain-accurate analytics."
    },
    {
      q: "How does SHAP Explainable AI (XAI) work in AcciPredict?",
      a: "SHAP (SHapley Additive exPlanations) calculates game-theoretic Shapley values to attribute exact feature contribution scores for every prediction. It shows positive risk factors (e.g. Over-Speeding, Rain, Low Visibility) and risk moderation factors in clear visual charts."
    },
    {
      q: "Can I simulate hypothetical scenario shifts?",
      a: "Yes! The What-If Simulator lets you alter environmental parameters (e.g., weather from Rain to Clear, or adding active Traffic Signals) and immediately compares before-vs-after severity probability distributions."
    }
  ];

  return (
    <div className="space-y-16 py-6">
      {/* 1. HERO SECTION (GSAP ANIMATED & NEXORA STYLED) */}
      <div ref={heroRef} className="relative flex flex-col items-center text-center space-y-8 pt-4 pb-4 max-w-4xl mx-auto">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-red-600/15 rounded-full blur-[130px] pointer-events-none -z-10" />

        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-red-500/30 text-xs font-semibold text-red-400 backdrop-blur-md shadow-lg shadow-red-500/10">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Next-Generation Road Safety Intelligence</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Predict the Future of <br />
          <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(239,68,68,0.4)]">
            Traffic Safety & Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          AcciPredict empowers traffic authorities, urban planners, and researchers to evaluate ML models, simulate what-if scenario shifts, and map GIS accident risk hotspots.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('predict')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/35 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold text-sm backdrop-blur-md transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
          >
            <span>Explore GIS Map</span>
          </button>
        </div>

        {/* 4 NEXORA FEATURE CARDS GRID */}
        <div ref={cardsRef} className="w-full pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {/* Card 1: AI Models */}
          <div 
            onClick={() => setActiveTab('models')}
            className="glass-card p-5 rounded-2xl cursor-pointer group hover:border-red-500/40 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-base font-bold text-white mb-1 flex items-center justify-between">
              <span>AI Models</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access 5 state-of-the-art ML classifiers (Random Forest, XGBoost, LightGBM) in one place.
            </p>
          </div>

          {/* Card 2: What-If Simulator */}
          <div 
            onClick={() => setActiveTab('whatif')}
            className="glass-card p-5 rounded-2xl cursor-pointer group hover:border-red-500/40 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-base font-bold text-white mb-1 flex items-center justify-between">
              <span>What-If Simulator</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulate weather, speed limits, and traffic density changes in real-time.
            </p>
          </div>

          {/* Card 3: GIS Spatial Map */}
          <div 
            onClick={() => setActiveTab('map')}
            className="glass-card p-5 rounded-2xl cursor-pointer group hover:border-red-500/40 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-base font-bold text-white mb-1 flex items-center justify-between">
              <span>GIS Risk Map</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gain actionable spatial insights from interactive geographic hotspot maps across India.
            </p>
          </div>

          {/* Card 4: SHAP XAI Analytics */}
          <div 
            onClick={() => setActiveTab('explain')}
            className="glass-card p-5 rounded-2xl cursor-pointer group hover:border-red-500/40 relative overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-base font-bold text-white mb-1 flex items-center justify-between">
              <span>SHAP XAI</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understand exact positive and negative feature attributions behind every prediction.
            </p>
          </div>
        </div>

        {/* BOTTOM STATS PILL BAR */}
        <div ref={statsRef} className="w-full max-w-4xl glass-card p-4 rounded-full border border-white/10 flex flex-wrap items-center justify-around gap-6 text-center shadow-2xl">
          <div className="flex items-center gap-3 text-left">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-7 w-7 rounded-full bg-red-600 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
              <div className="inline-block h-7 w-7 rounded-full bg-rose-600 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">ML</div>
              <div className="inline-block h-7 w-7 rounded-full bg-amber-600 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">GIS</div>
            </div>
            <div className="text-xs">
              <div className="font-bold text-white">Dataset 1 & 2</div>
              <div className="text-[10px] text-slate-400">Isolated Pipelines</div>
            </div>
          </div>

          <div className="border-l border-white/10 pl-6 text-left">
            <div className="font-heading text-lg font-black text-red-500">20,000+</div>
            <div className="text-[10px] text-slate-400 font-medium">Dataset 1 Records</div>
          </div>

          <div className="border-l border-white/10 pl-6 text-left">
            <div className="font-heading text-lg font-black text-white">5 Models</div>
            <div className="text-[10px] text-slate-400 font-medium">Evaluated Benchmark</div>
          </div>

          <div className="border-l border-white/10 pl-6 text-left">
            <div className="font-heading text-lg font-black text-red-500">15+</div>
            <div className="text-[10px] text-slate-400 font-medium">Metro Hotspots</div>
          </div>

          <div className="border-l border-white/10 pl-6 text-left hidden sm:block">
            <div className="font-heading text-lg font-black text-white">SHAP XAI</div>
            <div className="text-[10px] text-slate-400 font-medium">Explainable Output</div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE LIVE RISK ESTIMATOR WIDGET (HOMEPAGE INTERACTIVE PREVIEW) */}
      <div className="max-w-5xl mx-auto glass-card p-6 sm:p-8 rounded-3xl border border-red-500/25 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-[11px] font-bold mb-2">
              <Zap className="w-3.5 h-3.5" /> Interactive Sandbox Widget
            </div>
            <h2 className="font-heading text-2xl font-bold text-white">Live Risk Severity Estimator</h2>
            <p className="text-xs text-slate-400 mt-1">Adjust controls to test immediate simulated severity output before running full inference</p>
          </div>

          <button
            onClick={() => setActiveTab('predict')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer w-fit"
          >
            <span>Open Full Predictor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1.5">
                <span>Vehicle Speed ({demoSpeed} km/h)</span>
                <span className={demoSpeed > 90 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  {demoSpeed > 90 ? 'High Risk' : 'Standard'}
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="140"
                value={demoSpeed}
                onChange={(e) => setDemoSpeed(parseInt(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Weather Condition</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['clear', 'rain', 'fog'] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setDemoWeather(w)}
                      className={`py-1.5 px-2 rounded-lg font-bold uppercase text-[10px] cursor-pointer border transition-all ${
                        demoWeather === w ? 'bg-red-600 text-white border-red-400 shadow-md' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Traffic Density</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDemoDensity(d)}
                      className={`py-1.5 px-2 rounded-lg font-bold uppercase text-[10px] cursor-pointer border transition-all ${
                        demoDensity === d ? 'bg-red-600 text-white border-red-400 shadow-md' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Meter Output Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Estimated Risk Index</span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                demoSeverity === 'FATAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                demoSeverity === 'MAJOR' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {demoSeverity} SEVERITY
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-black text-white font-heading">{demoRisk} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
                <div className="text-xs font-bold text-red-400">{demoRisk}% Vulnerability</div>
              </div>

              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    demoSeverity === 'FATAL' ? 'bg-gradient-to-r from-amber-500 to-red-600' :
                    demoSeverity === 'MAJOR' ? 'bg-amber-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${demoRisk}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {demoSeverity === 'FATAL' ? 'High probability of fatal structural outcome under current speed & visibility parameters.' :
               demoSeverity === 'MAJOR' ? 'Moderate severity threshold. Major injury risks present.' :
               'Controlled risk parameters within safety boundaries.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. HOW ACCIPREDICT WORKS (4-STEP WORKFLOW PIPELINE) */}
      <div ref={workflowRef} className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-red-400" /> End-to-End Workflow
          </div>
          <h2 className="font-heading text-3xl font-extrabold text-white">How AcciPredict Works</h2>
          <p className="text-xs text-slate-400">Systematic multi-stage inference & explainable analytics pipeline</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="font-heading text-3xl font-black text-red-500/40">01</div>
            <h3 className="font-heading text-base font-bold text-white">Data Ingestion</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inhales 17 spatial, weather, road type, traffic signal & temporal features without target leakage metrics.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="font-heading text-3xl font-black text-red-500/40">02</div>
            <h3 className="font-heading text-base font-bold text-white">ML Inference</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates Random Forest, XGBoost & LightGBM classifiers to generate class probability distributions.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="font-heading text-3xl font-black text-red-500/40">03</div>
            <h3 className="font-heading text-base font-bold text-white">SHAP Attribution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes game-theoretic Shapley values to highlight exact positive & negative severity factors.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="font-heading text-3xl font-black text-red-500/40">04</div>
            <h3 className="font-heading text-base font-bold text-white">What-If Shift</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Simulates real-time parameter changes to test how risk probabilities decrease under safety interventions.
            </p>
          </div>
        </div>
      </div>

      {/* 4. DATASET ISOLATION ARCHITECTURE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800/60 text-red-400">
              <Database className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
              PRIMARY ML & GEOGRAPHY
            </span>
          </div>

          <h3 className="font-heading text-xl font-bold text-white">Dataset 1: Indian Roads Dataset</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            20,000 records powering the 5 ML classification models, SHAP Explainable AI, What-If simulator, and India GIS Risk Map.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">3 Severity Classes</span>
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">Random Forest Best Model</span>
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">SHAP Values</span>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
              <Layers className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
              INDEPENDENT FACTORS
            </span>
          </div>

          <h3 className="font-heading text-xl font-bold text-white">Dataset 2: Road.csv Factors</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            12,316 records evaluated as an independent exploratory pipeline covering driver demographics, vehicle defects, and casualty metrics.
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">Driver Experience</span>
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">Vehicle Service Age</span>
            <span className="text-[10px] px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">Casualty Severity</span>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE FAQ ACCORDION */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Technical insights on models, datasets, and explainability</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-semibold text-white cursor-pointer hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
