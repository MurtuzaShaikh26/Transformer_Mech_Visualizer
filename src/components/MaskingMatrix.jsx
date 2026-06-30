import React, { useState, useMemo } from 'react';
import { HelpCircle, Layers, Grid, ChevronRight, Info } from 'lucide-react';

export default function MaskingMatrix() {
  const [maskType, setMaskType] = useState('decoder'); // 'encoder' or 'decoder'
  const [currentStep, setCurrentStep] = useState(3); // 0: Raw, 1: Scale, 2: Mask, 3: Softmax
  const [hoveredCell, setHoveredCell] = useState(null);

  const tokens = ['I', 'think', 'therefore', 'I', 'am'];
  const dk = 64;
  const sqrtDk = 8;

  // Mock raw dot product scores QK^T for "I think therefore I am"
  // Higher scores represent stronger semantic alignment
  const rawScores = [
    [32, 12, 8, 24, 10],   // Query "I" -> attending to Keys "I", "think", "therefore", "I", "am"
    [28, 36, 16, 20, 12],  // Query "think"
    [14, 32, 40, 16, 18],  // Query "therefore"
    [26, 18, 12, 38, 15],  // Query "I" (second instance)
    [20, 24, 28, 32, 42]   // Query "am"
  ];

  // Step 1: Scale
  const scaledScores = useMemo(() => {
    return rawScores.map(row => row.map(val => Number((val / sqrtDk).toFixed(2))));
  }, [rawScores]);

  // Step 2: Apply Mask
  const maskedScores = useMemo(() => {
    return scaledScores.map((row, rIdx) => 
      row.map((val, cIdx) => {
        if (maskType === 'decoder' && cIdx > rIdx) {
          return -Infinity;
        }
        return val;
      })
    );
  }, [scaledScores, maskType]);

  // Step 3: Softmax
  const softmaxProbabilities = useMemo(() => {
    return maskedScores.map(row => {
      // Find max value in row to avoid numerical instability
      const validVals = row.filter(val => val !== -Infinity);
      const maxVal = validVals.length > 0 ? Math.max(...validVals) : 0;
      
      const exps = row.map(val => val === -Infinity ? 0 : Math.exp(val - maxVal));
      const sumExps = exps.reduce((a, b) => a + b, 0);
      
      return exps.map(exp => sumExps === 0 ? 0 : Number((exp / sumExps).toFixed(4)));
    });
  }, [maskedScores]);

  const steps = [
    { name: '1. Raw Scores (Q Kᵀ)', desc: 'Dot product between Query and Key vectors' },
    { name: '2. Scale (/√dₖ)', desc: `Scale scores by dividing by √dₖ (√${dk} = ${sqrtDk}) to maintain stable gradients` },
    { name: '3. Masking (+M)', desc: 'Set future tokens (upper-right) to -∞ (Decoder only)' },
    { name: '4. Softmax', desc: 'Compute probability distribution over keys (rows sum to 100%)' }
  ];

  const getCellValue = (rIdx, cIdx) => {
    switch (currentStep) {
      case 0:
        return rawScores[rIdx][cIdx];
      case 1:
        return scaledScores[rIdx][cIdx];
      case 2:
        const val = maskedScores[rIdx][cIdx];
        return val === -Infinity ? '-∞' : val;
      case 3:
        return `${(softmaxProbabilities[rIdx][cIdx] * 100).toFixed(1)}%`;
      default:
        return '';
    }
  };

  const getCellBg = (rIdx, cIdx) => {
    const isMasked = maskType === 'decoder' && cIdx > rIdx;
    
    // Hover focus
    const isHovered = hoveredCell && hoveredCell.r === rIdx && hoveredCell.c === cIdx;
    const isHoveredRow = hoveredCell && hoveredCell.r === rIdx;
    const isHoveredCol = hoveredCell && hoveredCell.c === cIdx;

    if (isMasked && currentStep >= 2) {
      return `bg-pink-950/20 border-pink-500/30 text-pink-500/70 ${isHovered ? 'ring-1 ring-pink-400' : ''}`;
    }

    if (currentStep === 3) {
      return `${isHovered ? 'ring-2 ring-white scale-105 z-10' : ''}`;
    }

    let baseBg = 'bg-slate-900/50';
    if (isHovered) {
      baseBg = 'bg-slate-800 border-cyan-400';
    } else if (isHoveredRow || isHoveredCol) {
      baseBg = 'bg-slate-900/90 border-slate-700';
    }

    return `${baseBg} border-white/5`;
  };

  const getCellStyle = (rIdx, cIdx) => {
    if (currentStep !== 3) return {};
    const isMasked = maskType === 'decoder' && cIdx > rIdx;
    if (isMasked) return {};
    const prob = softmaxProbabilities[rIdx][cIdx];
    return {
      backgroundColor: `rgba(6, 182, 212, ${0.15 + prob * 0.85})`,
      color: prob > 0.4 ? '#0b0f19' : '#e2e8f0',
      borderColor: 'rgba(6, 182, 212, 0.4)'
    };
  };

  return (
    <div className="space-y-8">
      {/* Intro and Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Grid className="w-5 h-5 text-cyan-400" />
            <span>The Masking Matrix Visualizer</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Step inside the core math of the Attention block. Swap between Encoder (Unmasked) and Decoder (Masked).
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setMaskType('encoder')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              maskType === 'encoder' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Encoder Matrix (Unmasked)
          </button>
          <button
            onClick={() => setMaskType('decoder')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              maskType === 'decoder' ? 'bg-pink-500 text-slate-950 font-bold' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Decoder Matrix (Masked)
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* The Matrix Table (Left) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          
          {/* Step Selector Tab */}
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  currentStep === idx
                    ? maskType === 'decoder' && idx === 2
                      ? 'bg-pink-950/20 border-pink-500 text-pink-400'
                      : 'bg-cyan-950/20 border-cyan-500 text-cyan-400'
                    : 'bg-slate-950/40 border-white/5 text-gray-400 hover:bg-slate-900/60'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">{s.name}</div>
                <div className="text-[9px] text-gray-500 truncate mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Matrix Container */}
          <div className="bg-slate-950/50 rounded-2xl p-6 border border-white/5 overflow-x-auto">
            <div className="min-w-[500px]">
              
              {/* Matrix Columns Header */}
              <div className="flex mb-2">
                <div className="w-24 flex items-center justify-center font-mono text-[10px] text-purple-400 font-bold">
                  Query \ Key
                </div>
                <div className="flex-1 flex gap-2">
                  {tokens.map((tok, idx) => (
                    <div key={idx} className="flex-1 text-center font-mono text-xs text-gray-400 font-bold py-1 bg-slate-900/40 rounded border border-white/5">
                      {tok}
                      <span className="block text-[8px] text-gray-500 font-normal">K{idx}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-2">
                {tokens.map((rowTok, rIdx) => (
                  <div key={rIdx} className="flex gap-2 items-center">
                    {/* Row Header */}
                    <div className="w-24 text-right pr-4 font-mono text-xs text-gray-400 font-bold bg-slate-900/40 py-3 rounded border border-white/5">
                      <span className="text-[8px] text-gray-500 font-normal block">Q{rIdx}</span>
                      {rowTok}
                    </div>

                    {/* Cells */}
                    <div className="flex-1 flex gap-2">
                      {tokens.map((colTok, cIdx) => {
                        const cellVal = getCellValue(rIdx, cIdx);
                        const isMasked = maskType === 'decoder' && cIdx > rIdx;
                        
                        return (
                          <div
                            key={cIdx}
                            onMouseEnter={() => setHoveredCell({ r: rIdx, c: cIdx })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`flex-1 h-14 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 cursor-help ${getCellBg(rIdx, cIdx)}`}
                            style={getCellStyle(rIdx, cIdx)}
                          >
                            <span className="text-xs font-mono font-semibold">{cellVal}</span>
                            {isMasked && currentStep >= 2 && (
                              <span className="text-[8px] text-pink-500 font-mono mt-0.5 uppercase tracking-tighter">Masked</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Tooltip detail block */}
          {hoveredCell ? (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div>
                  <span className="font-bold text-gray-200">Attention cell (Q{hoveredCell.r}: "{tokens[hoveredCell.r]}" &rarr; K{hoveredCell.c}: "{tokens[hoveredCell.c]}")</span>
                </div>
                <div className="text-gray-400 leading-relaxed">
                  {maskType === 'decoder' && hoveredCell.c > hoveredCell.r ? (
                    <span>
                      This cell represents Query word <strong className="text-pink-400">"{tokens[hoveredCell.r]}"</strong> trying to look ahead at Key word <strong className="text-pink-400">"{tokens[hoveredCell.c]}"</strong>. 
                      Since keys to the right are in the future, the masking step forces this score to <strong className="font-mono text-pink-400">-&infin;</strong>. 
                      Softmax converts this to exactly <strong className="text-pink-400 font-mono">0.0%</strong> weight, stopping illegal information leaks.
                    </span>
                  ) : (
                    <span>
                      Query word <strong>"{tokens[hoveredCell.r]}"</strong> is computing its similarity score with Key word <strong>"{tokens[hoveredCell.c]}"</strong>. 
                      Its raw score was <strong className="font-mono">{rawScores[hoveredCell.r][hoveredCell.c]}</strong>, scaled down to <strong className="font-mono">{scaledScores[hoveredCell.r][hoveredCell.c]}</strong>. 
                      After softmax, this key receives <strong className="text-cyan-400 font-mono">{(softmaxProbabilities[hoveredCell.r][hoveredCell.c]*100).toFixed(1)}%</strong> of the attention weight.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic text-center">
              Hover over cells in the grid to inspect the math behind that attention alignment score.
            </div>
          )}
        </div>

        {/* Explainers (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              <span>Attention Formula</span>
            </h4>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] space-y-1.5 border border-white/5">
              <div className="text-purple-400 font-semibold">Step-by-step:</div>
              <div>1. Raw: Q &times; Kᵀ</div>
              <div>2. Scale: (Q &times; Kᵀ) / &radic;dₖ</div>
              <div>3. Mask: (Q &times; Kᵀ) / &radic;dₖ + M</div>
              <div>4. Softmax: softmax(Result) &times; V</div>
            </div>
            <div className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <p>
                In the encoder, <strong>M = 0</strong>. The self-attention matrix is fully unmasked, meaning words can build representations by looking at both their preceding words and succeeding words.
              </p>
              <p>
                In the decoder, <strong>M</strong> contains <strong>-&infin;</strong> for all keys at positions larger than the current query. This forces the model to learn only from preceding tokens.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono">Why -∞? Why not 0?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              If we set the attention scores of future words to <strong>0</strong> *before* applying softmax, the softmax formula would still assign them a positive weight because e⁰ = 1.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              By setting the scores to <strong>-&infin;</strong>, we ensure that e⁻&infin; = 0. When we divide by the row sum, these future tokens receive a final attention weight of exactly <strong>0</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
