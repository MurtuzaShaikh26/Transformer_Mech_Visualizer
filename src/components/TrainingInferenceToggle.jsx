import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, RefreshCw, Zap, Cpu } from 'lucide-react';

export default function TrainingInferenceToggle() {
  const [mode, setMode] = useState('inference'); // 'training' or 'inference'
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500); // ms per step
  
  const timerRef = useRef(null);

  const englishTokens = ['The', 'blue', 'sky'];
  const frenchTokens = ['<sos>', 'Le', 'ciel', 'bleu'];
  const frenchOutputs = ['Le', 'ciel', 'bleu', '<eos>'];

  // Clear timers on unmount or mode change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          if (mode === 'inference') {
            if (prev >= frenchOutputs.length - 1) {
              setIsPlaying(false);
              return prev;
            }
            return prev + 1;
          } else {
            // Training mode: just loop or animate parallel pulse
            return (prev + 1) % 2;
          }
        });
      }, speed);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, mode, speed]);

  const handleModeChange = (newMode) => {
    setIsPlaying(false);
    setMode(newMode);
    setActiveStep(0);
  };

  const handleStep = () => {
    if (mode === 'inference') {
      if (activeStep < frenchOutputs.length - 1) {
        setActiveStep((prev) => prev + 1);
      } else {
        setActiveStep(0);
      }
    } else {
      setActiveStep((prev) => (prev + 1) % 2);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(0);
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            <span>Training vs. Inference Simulation</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Understand how Transformers parallelize training using "Teacher Forcing" but generate tokens sequentially during inference.
          </p>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex bg-slate-950 p-1.5 rounded-xl border border-white/10 select-none">
          <button
            onClick={() => handleModeChange('training')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              mode === 'training'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Training Mode (Parallel)
          </button>
          <button
            onClick={() => handleModeChange('inference')}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              mode === 'inference'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-slate-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Inference Mode (Auto-Regressive)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Simulation Screen (Left) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold uppercase tracking-wider">Simulation Visualization</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Animation Speed:</span>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="bg-slate-950 border border-white/10 text-gray-300 rounded px-2 py-1 text-xs outline-none"
              >
                <option value={2000}>Slow (2s)</option>
                <option value={1200}>Normal (1.2s)</option>
                <option value={600}>Fast (0.6s)</option>
              </select>
            </div>
          </div>

          {/* Animation Area */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 min-h-[360px] flex flex-col justify-between relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* ENCODER AREA (Top) */}
            <div className="space-y-3 relative z-10">
              <div className="text-[10px] text-cyan-400 uppercase font-mono tracking-widest flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Encoder Stack (Processes Source Text: "The blue sky")</span>
              </div>
              <div className="flex gap-3">
                {englishTokens.map((token, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-3 text-center transition-all duration-300 transform"
                    style={{
                      boxShadow: mode === 'training' || activeStep >= 0 
                        ? '0 0 10px rgba(6, 182, 212, 0.15)' 
                        : 'none',
                      borderColor: mode === 'training' || activeStep >= 0 
                        ? '#06b6d4' 
                        : '#1e293b'
                    }}
                  >
                    <div className="text-[9px] text-gray-500 font-mono">Token {idx}</div>
                    <div className="text-sm font-semibold text-cyan-400 mt-1">{token}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* PIPELINE / ATTENTION BRIDGE */}
            <div className="flex justify-center items-center py-6 relative z-10">
              <div className="h-10 w-0.5 bg-dashed border-l border-white/10 relative">
                {/* Flow particles */}
                {isPlaying && (
                  <div className="absolute top-0 -left-1 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />
                )}
              </div>
            </div>

            {/* DECODER AREA (Bottom) */}
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <div className="text-[10px] text-pink-400 uppercase font-mono tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                  <span>Decoder Stack ({mode === 'training' ? 'Parallel Training' : 'Step-by-Step Auto-regressive'})</span>
                </div>
                {mode === 'inference' && (
                  <span className="text-[10px] text-gray-400 bg-slate-900 border border-white/5 px-2 py-0.5 rounded-full">
                    Step {activeStep + 1} of 4
                  </span>
                )}
              </div>

              {/* Decoder Inputs Grid */}
              <div className="space-y-3">
                <div className="text-[10px] text-gray-500 font-mono">Decoder Inputs:</div>
                <div className="grid grid-cols-4 gap-3">
                  {frenchTokens.map((token, idx) => {
                    const isFed = mode === 'training' || idx <= activeStep;
                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl p-3 text-center transition-all duration-300 ${
                          isFed
                            ? 'bg-pink-950/20 border-pink-500 text-pink-400 shadow-lg glow-pink/10'
                            : 'bg-slate-950/40 border-white/5 text-gray-600'
                        }`}
                      >
                        <div className="text-[9px] font-mono text-gray-500">t = {idx}</div>
                        <div className="text-xs font-semibold mt-1">{token}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Decoder Outputs Grid */}
              <div className="space-y-3 pt-2">
                <div className="text-[10px] text-gray-500 font-mono">Model Predictions (Output):</div>
                <div className="grid grid-cols-4 gap-3">
                  {frenchOutputs.map((token, idx) => {
                    const isGenerated = mode === 'training' 
                      ? activeStep === 1 // Show generated in pulse step 1
                      : idx <= activeStep;
                    const isCurrent = mode === 'inference' && idx === activeStep;
                    
                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl p-3 text-center transition-all duration-300 relative ${
                          isGenerated
                            ? 'bg-purple-950/20 border-purple-500 text-purple-300 shadow-md'
                            : isCurrent
                            ? 'bg-slate-900 border-dashed border-purple-400/60 text-purple-400/80 animate-pulse'
                            : 'bg-slate-950/40 border-white/5 text-gray-600'
                        }`}
                      >
                        <div className="text-[9px] font-mono text-gray-500">Predict {idx}</div>
                        <div className="text-xs font-bold mt-1">{token}</div>

                        {/* AUTO-REGRESSIVE FEEDBACK ARROW (Inference Mode Only) */}
                        {mode === 'inference' && isGenerated && idx < frenchOutputs.length - 1 && idx === activeStep && (
                          <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
                            <span className="text-[8px] bg-purple-500 text-slate-950 font-bold px-1 rounded-sm select-none">
                              Feeds &rarr; t={idx + 1}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg border border-white/5 transition-all"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleStep}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-semibold rounded-lg border border-white/5 transition-all flex items-center gap-1.5"
              >
                <span>Step Forward</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`py-2 px-6 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                isPlaying 
                  ? 'bg-pink-500 hover:bg-pink-600 text-white glow-pink/30' 
                  : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 glow-cyan/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Animation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Technical Explainer (Right) */}
        <div className="lg:col-span-4 space-y-6">
          {mode === 'training' ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm uppercase font-mono tracking-wider">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>Parallel Training Mechanics</span>
              </div>
              <h4 className="text-lg font-bold text-gray-200">How Teacher Forcing Works</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                During training, we have the complete target translation: <span className="text-pink-400 font-semibold font-mono">"&lt;sos&gt; Le ciel bleu"</span>. 
                Instead of feeding the decoder its own predictions step-by-step, we feed the entire target sequence in parallel.
              </p>
              
              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400">The Parallel Shift</div>
                <p className="text-[11px] text-gray-300">
                  We offset the decoder input relative to the target output:
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono mt-1">
                  <div className="bg-slate-900 p-1.5 rounded">
                    <span className="text-pink-400">Input:</span><br/>[&lt;sos&gt;, Le, ciel]
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded">
                    <span className="text-purple-400">Target Output:</span><br/>[Le, ciel, bleu]
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 bg-cyan-950/10 p-3.5 rounded-lg border border-cyan-500/10 space-y-1.5">
                <strong className="text-cyan-400">Why is this a breakthrough?</strong>
                <p className="leading-relaxed text-[11px]">
                  Recurrent Neural Networks (RNNs) require <span className="font-mono text-gray-300">O(n)</span> steps because hidden states depend on previous states. 
                  By feeding the ground truth simultaneously and masking future tokens, Transformers process the entire sequence in <span className="font-mono text-gray-300">O(1)</span> steps, enabling efficient GPU training.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm uppercase font-mono tracking-wider">
                <Cpu className="w-5 h-5 text-pink-400" />
                <span>Auto-Regressive Generation</span>
              </div>
              <h4 className="text-lg font-bold text-gray-200">How Inference Works</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                During deployment, we do not know the target sequence. The decoder must generate words one-by-one in an **auto-regressive** sequence.
              </p>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400">The Loop Step</div>
                <ul className="text-[11px] text-gray-300 list-decimal list-inside space-y-1.5">
                  <li>Start with start-of-sequence token: <span className="font-semibold text-pink-400 font-mono">"&lt;sos&gt;"</span></li>
                  <li>Predict the next token probability distribution</li>
                  <li>Select the token with highest probability (or sample)</li>
                  <li>Append that token to the input, and feed it back into the decoder</li>
                </ul>
              </div>

              <div className="text-xs text-gray-400 bg-pink-950/10 p-3.5 rounded-lg border border-pink-500/10 space-y-1.5">
                <strong className="text-pink-400">Sequential Bottleneck</strong>
                <p className="leading-relaxed text-[11px]">
                  Inference cannot be parallelized. Because each word depends on the actual printed text of the previous steps, we are bound by the sequential bottleneck. This explains why running LLMs (like GPT-4) requires streaming tokens word-by-word.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
