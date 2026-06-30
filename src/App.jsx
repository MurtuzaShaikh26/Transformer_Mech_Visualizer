import React, { useState } from 'react';
import { Layers, RefreshCw, Grid, ArrowRightLeft, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import ArchitectureOverview from './components/ArchitectureOverview';
import TrainingInferenceToggle from './components/TrainingInferenceToggle';
import MaskingMatrix from './components/MaskingMatrix';
import AttentionHeadConnections from './components/AttentionHeadConnections';

export default function App() {
  const [activeTab, setActiveTab] = useState('architecture');

  const tabs = [
    {
      id: 'architecture',
      name: 'Architecture Overview',
      desc: 'Encoder-Decoder stacks, sublayers & PE injection',
      icon: Layers,
      component: ArchitectureOverview,
      color: 'border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
    },
    {
      id: 'training-inference',
      name: 'Training vs. Inference',
      desc: 'Parallel Teacher Forcing vs. Auto-Regressive generation',
      icon: RefreshCw,
      component: TrainingInferenceToggle,
      color: 'border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
    },
    {
      id: 'masking',
      name: 'Masking Matrix Visualizer',
      desc: 'Scaled dot-product attention steps & future-mask math',
      icon: Grid,
      component: MaskingMatrix,
      color: 'border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)]'
    },
    {
      id: 'attention-heads',
      name: 'Attention Head Connections',
      desc: 'Winograd schemas & head specialization weight curves',
      icon: ArrowRightLeft,
      component: AttentionHeadConnections,
      color: 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    }
  ];

  const activeTabDetails = tabs.find(t => t.id === activeTab);
  const ActiveComponent = activeTabDetails.component;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navigation Header */}
      <header className="border-b border-white/10 glass-panel py-4 px-6 md:px-12 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-xl glow-cyan animate-pulse-glow">
              <Sparkles className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 tracking-tight font-sans">
                Transformer Mechanics Visualizer
              </h1>
              <p className="text-[10px] md:text-xs text-gray-400 font-mono tracking-widest mt-0.5">
                INTERACTIVE DEEP LEARNING PLAYGROUND • "ATTENTION IS ALL YOU NEED"
              </p>
            </div>
          </div>

          {/* External Citation Badge */}
          <div className="flex items-center gap-2 bg-slate-900 border border-white/5 py-1.5 px-3 rounded-full text-xs text-gray-400">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[10px] tracking-wide">Vaswani et al. (2017)</span>
          </div>

        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? `bg-slate-900/80 ${tab.color} scale-[1.02]` 
                    : 'bg-slate-950/40 border-white/5 text-gray-400 hover:bg-slate-900/30 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-slate-950 border border-white/10 ${isActive ? 'text-inherit' : 'text-gray-500'}`}>
                    <TabIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold font-sans tracking-wide uppercase ${isActive ? 'text-inherit' : 'text-gray-300'}`}>
                    {tab.name}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 font-sans font-normal leading-relaxed leading-snug">
                  {tab.desc}
                </p>
              </button>
            );
          })}
        </section>

        {/* Selected Module Workspace */}
        <section className="transition-all duration-500">
          <ActiveComponent />
        </section>

      </main>

      {/* Premium Footer */}
      <footer className="border-t border-white/10 glass-panel py-6 text-center text-xs text-gray-500 space-y-2 mt-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 font-sans">
          <div className="flex items-center gap-1">
            <span>Designed for building machine learning intuition.</span>
            <HelpCircle className="w-3.5 h-3.5 text-gray-500 cursor-help" title="Interact with diagrams, sliders, toggles and cells to update visualizations dynamically." />
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
            <span>SCALED DOT-PRODUCT ATTENTION</span>
            <span>•</span>
            <span>MULTI-HEAD MODEL DEVIATIONS</span>
            <span>•</span>
            <span>TEACHER FORCING PARALLELISM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
