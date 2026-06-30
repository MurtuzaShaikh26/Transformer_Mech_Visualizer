import React, { useState, useMemo } from 'react';
import { HelpCircle, Layers, Cpu, Zap, Activity } from 'lucide-react';

export default function ArchitectureOverview() {
  const [selectedNode, setSelectedNode] = useState('positional-encoding');
  const [selectedLayer, setSelectedLayer] = useState(1);
  const [pePosition, setPePosition] = useState(4);
  const [peModelDim, setPeModelDim] = useState(64);
  const [peSeqLength, setPeSeqLength] = useState(16);

  // Generate Positional Encoding Matrix for Heatmap
  const peMatrix = useMemo(() => {
    const matrix = [];
    for (let pos = 0; pos < peSeqLength; pos++) {
      const row = [];
      for (let i = 0; i < peModelDim; i++) {
        let val;
        if (i % 2 === 0) {
          val = Math.sin(pos / Math.pow(10000, i / peModelDim));
        } else {
          val = Math.cos(pos / Math.pow(10000, (i - 1) / peModelDim));
        }
        row.push(val);
      }
      matrix.push(row);
    }
    return matrix;
  }, [peSeqLength, peModelDim]);

  // Generate coordinates for Positional Encoding Curves
  const peCurvesData = useMemo(() => {
    // Generate sin/cos curves for selected position across dimensions
    const points = [];
    const step = peModelDim / 100;
    for (let i = 0; i <= peModelDim; i += step) {
      const angle = pePosition / Math.pow(10000, i / peModelDim);
      points.push({
        dim: i,
        sinVal: Math.sin(angle),
        cosVal: Math.cos(angle)
      });
    }
    return points;
  }, [pePosition, peModelDim]);

  const renderDetailPanel = () => {
    switch (selectedNode) {
      case 'positional-encoding':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg mb-1">
                <Activity className="w-5 h-5" />
                <span>Positional Encoding (PE) Injection</span>
              </div>
              <p className="text-sm text-gray-300">
                Transformers lack recurrence (like LSTMs) or convolutions, so they have no sense of sequence order. 
                To address this, we inject a positional signal directly into the input embeddings.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-4">
              <div className="text-xs text-cyan-400 uppercase font-mono tracking-wider">Mathematical Formula</div>
              <div className="bg-slate-950/60 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-white/5 space-y-2">
                <div>
                  <span className="text-purple-400">PE</span>(pos, 2i) = sin(pos / 10000<sup>2i/d<sub>model</sub></sup>)
                </div>
                <div>
                  <span className="text-pink-400">PE</span>(pos, 2i+1) = cos(pos / 10000<sup>2i/d<sub>model</sub></sup>)
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Where <span className="font-semibold text-gray-200">pos</span> is the word index in the sentence, and <span className="font-semibold text-gray-200">i</span> is the dimension index. Using sinusoidal waves of varying wavelengths allows the model to learn relative positions easily.
              </div>
            </div>

            {/* Interactive PE Visualization */}
            <div className="glass-card p-4 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Interactive PE Visualizer</span>
                <span className="text-xs text-gray-400">d<sub>model</sub> = {peModelDim}</span>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Selected Token Position (pos): {pePosition}</label>
                  <input 
                    type="range" 
                    min="0" 
                    max={peSeqLength - 1} 
                    value={pePosition} 
                    onChange={(e) => setPePosition(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Sequence Length: {peSeqLength}</label>
                  <input 
                    type="range" 
                    min="8" 
                    max="24" 
                    value={peSeqLength} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setPeSeqLength(val);
                      if (pePosition >= val) setPePosition(val - 1);
                    }}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
              </div>

              {/* Heatmap Matrix */}
              <div>
                <div className="text-xs text-gray-400 mb-1 font-mono">PE Matrix Heatmap (pos vs. dim)</div>
                <div className="flex flex-col border border-white/10 rounded overflow-hidden">
                  {peMatrix.map((row, rIdx) => (
                    <div key={rIdx} className="flex h-3">
                      <div className="w-10 text-[9px] font-mono text-gray-500 flex items-center justify-end pr-2 bg-slate-950/40 select-none">
                        p={rIdx}
                      </div>
                      <div className="flex-1 flex">
                        {row.map((val, cIdx) => {
                          // Scale color from -1 to 1: negative = pink, positive = cyan
                          const intensity = Math.abs(val);
                          const bgStyle = val >= 0 
                            ? `rgba(6, 182, 212, ${intensity})` 
                            : `rgba(236, 72, 153, ${intensity})`;
                          const isSelected = rIdx === pePosition;
                          return (
                            <div 
                              key={cIdx} 
                              className={`flex-1 transition-all duration-150 ${isSelected ? 'ring-1 ring-white/60 z-10 scale-y-110' : ''}`}
                              style={{ backgroundColor: bgStyle }}
                              title={`pos: ${rIdx}, dim: ${cIdx}, val: ${val.toFixed(3)}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-10">
                  <span>Dim 0</span>
                  <span>Dim {peModelDim - 1}</span>
                </div>
                <div className="flex gap-4 justify-center text-[10px] text-gray-400 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-cyan-500 rounded-sm"></div>
                    <span>Positive (+1)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-pink-500 rounded-sm"></div>
                    <span>Negative (-1)</span>
                  </div>
                </div>
              </div>

              {/* Wave Graph */}
              <div>
                <div className="text-xs text-gray-400 mb-1 font-mono">PE Waves at Position pos={pePosition}</div>
                <div className="h-32 bg-slate-950/80 rounded-lg p-2 relative border border-white/5">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {/* Zero line */}
                    <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                    
                    {/* Sine Curve */}
                    <path
                      d={peCurvesData.reduce((acc, p, idx) => {
                        const x = (p.dim / peModelDim) * 100;
                        const y = 20 - p.sinVal * 16; // scale to fit
                        return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }, '')}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                    />

                    {/* Cosine Curve */}
                    <path
                      d={peCurvesData.reduce((acc, p, idx) => {
                        const x = (p.dim / peModelDim) * 100;
                        const y = 20 - p.cosVal * 16; // scale to fit
                        return acc + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }, '')}
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="1.5"
                      strokeDasharray="2,2"
                    />
                  </svg>
                  <div className="absolute top-2 right-2 flex flex-col gap-1 text-[9px] bg-slate-900/90 p-1.5 rounded border border-white/10">
                    <div className="flex items-center gap-1 text-cyan-400">
                      <div className="w-2 border-b-2 border-cyan-400"></div>
                      <span>sin wave (even dims)</span>
                    </div>
                    <div className="flex items-center gap-1 text-pink-400">
                      <div className="w-2 border-b-2 border-dashed border-pink-400"></div>
                      <span>cos wave (odd dims)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'encoder-self-attention':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg mb-1">
                <Cpu className="w-5 h-5" />
                <span>Multi-Head Self-Attention (Encoder)</span>
              </div>
              <p className="text-sm text-gray-300">
                Allows the encoder to look at other words in the input sentence as it encodes a specific word, capturing context.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-4">
              <div className="text-xs text-cyan-400 uppercase font-mono tracking-wider">Formula & Mechanisms</div>
              <div className="bg-slate-950/60 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-white/5">
                Attention(Q, K, V) = softmax(Q K<sup>T</sup> / &radic;d<sub>k</sub>) V
              </div>
              <div className="text-xs text-gray-400 space-y-2">
                <p>1. <strong>Queries (Q), Keys (K), Values (V)</strong> are generated by multiplying the input vectors with learned weight matrices.</p>
                <p>2. <strong>Dot product</strong> measures the similarity between each query and all keys.</p>
                <p>3. <strong>Scaling</strong> by 1/&radic;d<sub>k</sub> prevents dot products from growing too large, which would push softmax into flat regions with tiny gradients.</p>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-3">
              <div className="text-sm font-semibold">Multi-Head Separation</div>
              <div className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded-lg border border-white/5">
                <div className="text-center flex-1">
                  <div className="text-xs text-gray-400">Inputs</div>
                  <div className="text-sm font-mono text-cyan-400">512 dims</div>
                </div>
                <div className="text-gray-600 font-bold">&rarr;</div>
                <div className="text-center flex-1">
                  <div className="text-xs text-gray-400">Split (h=8)</div>
                  <div className="text-sm font-mono text-purple-400">8 heads &times; 64 dims</div>
                </div>
                <div className="text-gray-600 font-bold">&rarr;</div>
                <div className="text-center flex-1">
                  <div className="text-xs text-gray-400">Concat & Project</div>
                  <div className="text-sm font-mono text-pink-400">512 dims</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">
                Rather than performing a single attention function with 512-dimensional queries, keys and values, we project the queries, keys and values <span className="text-gray-200">h=8</span> times with different, learned linear projections. This allows the model to jointly attend to information from different representation subspaces.
              </div>
            </div>
          </div>
        );

      case 'decoder-masked-attention':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-lg mb-1">
                <Layers className="w-5 h-5" />
                <span>Masked Multi-Head Self-Attention (Decoder)</span>
              </div>
              <p className="text-sm text-gray-300">
                Prevents positions from attending to subsequent positions. This masking ensures that the predictions for position <span className="font-mono text-pink-400">i</span> can depend only on the known outputs at positions less than <span className="font-mono text-pink-400">i</span>.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-4">
              <div className="text-xs text-pink-400 uppercase font-mono tracking-wider">The Masking Operation</div>
              <div className="bg-slate-950/60 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-white/5">
                Attention(Q, K, V) = softmax( (Q K<sup>T</sup> / &radic;d<sub>k</sub>) + M ) V
              </div>
              <div className="text-xs text-gray-400 space-y-2">
                <p>Where <strong>M</strong> is the masking matrix containing:</p>
                <ul className="list-disc list-inside pl-1 text-[11px] space-y-1">
                  <li><span className="font-semibold text-cyan-400">0</span> for positions we want to attend to (past & present).</li>
                  <li><span className="font-semibold text-pink-400">-&infin;</span> for positions we want to hide (future).</li>
                </ul>
                <p className="text-xs mt-2">
                  When passed through the softmax function, e<sup>-&infin;</sup> becomes <span className="text-gray-200 font-semibold">0</span>, effectively eliminating all attention weights to future words.
                </p>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-sm mb-1">Why is this necessary?</div>
              <p className="text-gray-400 leading-relaxed">
                During parallel training, the entire target sentence is fed into the decoder. Without the mask, the decoder's first word could look at the second word to predict the second word, which is "cheating". During inference, future words don't exist yet, so we must enforce this causality.
              </p>
            </div>
          </div>
        );

      case 'decoder-enc-dec-attention':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-lg mb-1">
                <Zap className="w-5 h-5" />
                <span>Encoder-Decoder Cross-Attention</span>
              </div>
              <p className="text-sm text-gray-300">
                Injects representation from the input sentence. The queries come from the previous decoder layer, while the keys and values come from the output of the encoder stack.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-4">
              <div className="text-xs text-purple-400 uppercase font-mono tracking-wider">How the inputs align</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-pink-950/40 rounded border border-pink-500/20">
                  <div className="text-pink-400 font-bold">Queries (Q)</div>
                  <div className="text-[10px] text-gray-400 mt-1">From Decoder Stack (Target Sentence)</div>
                </div>
                <div className="p-2 bg-cyan-950/40 rounded border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold">Keys (K)</div>
                  <div className="text-[10px] text-gray-400 mt-1">From Encoder Stack (Source Sentence)</div>
                </div>
                <div className="p-2 bg-cyan-950/40 rounded border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold">Values (V)</div>
                  <div className="text-[10px] text-gray-400 mt-1">From Encoder Stack (Source Sentence)</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">
                This allows every position in the decoder to attend to all positions in the input sequence. This mimics the classical attention mechanism in seq2seq models, aligning target words (e.g., in translation) with their corresponding source words.
              </div>
            </div>
          </div>
        );

      case 'feed-forward':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg mb-1">
                <Cpu className="w-5 h-5" />
                <span>Feed-Forward Networks (FFN)</span>
              </div>
              <p className="text-sm text-gray-300">
                Applied to each position separately and identically. It consists of two linear transformations with a ReLU activation in between.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-4">
              <div className="text-xs text-cyan-400 uppercase font-mono tracking-wider">Mathematical Formula</div>
              <div className="bg-slate-950/60 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-white/5">
                FFN(x) = max(0, x W<sub>1</sub> + b<sub>1</sub>) W<sub>2</sub> + b<sub>2</sub>
              </div>
              <div className="text-xs text-gray-400">
                While the linear transformations are the same across different positions, they use different parameters from layer to layer.
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-sm mb-1 text-gray-200">Dimensionality Expansion</div>
              <p className="text-gray-400 leading-relaxed">
                In the original paper, the input and output dimensionality is <span className="font-mono text-cyan-400">d<sub>model</sub> = 512</span>, while the inner-layer dimensionality is expanded to <span className="font-mono text-purple-400">d<sub>ff</sub> = 2048</span>. This expansion allows the model to encode rich non-linear mappings before compressing them back to the model dimension.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-10 text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto stroke-1 mb-2 opacity-55" />
            <p>Click on any architecture block in the diagram to inspect its inner workings.</p>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Schematic Diagram (Left) */}
      <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Full Encoder-Decoder Flow</span>
            </h3>
            <p className="text-xs text-gray-400">Both Encoder and Decoder contain stacked blocks (N = 6 identical layers)</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-white/5">
            <span className="text-[10px] text-gray-400 px-1 font-mono uppercase">Layer Stack</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedLayer(num)}
                  className={`w-6 h-6 text-xs font-mono rounded flex items-center justify-center transition-all ${
                    selectedLayer === num 
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' 
                      : 'hover:bg-white/5 text-gray-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Drawing of the Network Schema */}
        <div className="w-full bg-slate-950/40 rounded-xl border border-white/5 p-4 flex items-center justify-center">
          <svg viewBox="0 0 720 540" className="w-full max-h-[500px]" style={{ overflow: 'visible' }}>
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#db2777" stopOpacity="0.05" />
              </linearGradient>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
              </marker>
              <marker id="arrowActive" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a855f7" />
              </marker>
            </defs>

            {/* BACKGROUND BLOCKS: Stack of N=6 overlay shadows */}
            {/* Encoder Box */}
            <rect x="35" y="60" width="280" height="400" rx="16" fill="url(#cyanGrad)" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1.5" />
            <text x="50" y="88" className="font-sans font-bold text-xs uppercase fill-cyan-400 tracking-wider">Encoder Stack (N={selectedLayer}/6)</text>

            {/* Decoder Box */}
            <rect x="405" y="60" width="280" height="400" rx="16" fill="url(#pinkGrad)" stroke="rgba(236, 72, 153, 0.25)" strokeWidth="1.5" />
            <text x="420" y="88" className="font-sans font-bold text-xs uppercase fill-pink-400 tracking-wider">Decoder Stack (N={selectedLayer}/6)</text>

            {/* ENCODER SUBCOMPONENTS */}
            {/* Input embeddings */}
            <g transform="translate(60, 480)" className="cursor-pointer" onClick={() => setSelectedNode('positional-encoding')}>
              <rect x="0" y="0" width="230" height="30" rx="6" fill="#1e293b" stroke={selectedNode === 'positional-encoding' ? '#06b6d4' : '#334155'} strokeWidth="1.5" className="transition-all hover:fill-slate-800" />
              <text x="115" y="19" textAnchor="middle" className="text-xs font-sans fill-gray-200 font-semibold select-none">1. Input Embeddings + Positional Enc.</text>
            </g>

            {/* Multi-Head Self-Attention */}
            <g transform="translate(60, 310)" className="cursor-pointer" onClick={() => setSelectedNode('encoder-self-attention')}>
              <rect x="0" y="0" width="230" height="50" rx="8" fill={selectedNode === 'encoder-self-attention' ? 'rgba(6, 182, 212, 0.15)' : '#0f172a'} stroke={selectedNode === 'encoder-self-attention' ? '#06b6d4' : '#1e293b'} strokeWidth="2" className="transition-all hover:bg-cyan-950/20" />
              <text x="115" y="24" textAnchor="middle" className="text-xs font-sans fill-cyan-400 font-bold select-none">Multi-Head Self-Attention</text>
              <text x="115" y="40" textAnchor="middle" className="text-[10px] font-mono fill-gray-400 select-none">Attention(Q, K, V)</text>
            </g>

            {/* Feed Forward Network */}
            <g transform="translate(60, 150)" className="cursor-pointer" onClick={() => setSelectedNode('feed-forward')}>
              <rect x="0" y="0" width="230" height="50" rx="8" fill={selectedNode === 'feed-forward' ? 'rgba(6, 182, 212, 0.15)' : '#0f172a'} stroke={selectedNode === 'feed-forward' ? '#06b6d4' : '#1e293b'} strokeWidth="2" className="transition-all hover:bg-cyan-950/20" />
              <text x="115" y="24" textAnchor="middle" className="text-xs font-sans fill-cyan-400 font-bold select-none">Feed-Forward Network</text>
              <text x="115" y="40" textAnchor="middle" className="text-[10px] font-mono fill-gray-400 select-none">Linear &rarr; ReLU &rarr; Linear</text>
            </g>

            {/* DECODER SUBCOMPONENTS */}
            {/* Output embeddings */}
            <g transform="translate(430, 480)" className="cursor-pointer" onClick={() => setSelectedNode('positional-encoding')}>
              <rect x="0" y="0" width="230" height="30" rx="6" fill="#1e293b" stroke={selectedNode === 'positional-encoding' ? '#ec4899' : '#334155'} strokeWidth="1.5" className="transition-all hover:fill-slate-800" />
              <text x="115" y="19" textAnchor="middle" className="text-xs font-sans fill-gray-200 font-semibold select-none">Output Embeddings + Positional Enc.</text>
            </g>

            {/* Masked Multi-Head Self-Attention */}
            <g transform="translate(430, 360)" className="cursor-pointer" onClick={() => setSelectedNode('decoder-masked-attention')}>
              <rect x="0" y="0" width="230" height="50" rx="8" fill={selectedNode === 'decoder-masked-attention' ? 'rgba(236, 72, 153, 0.15)' : '#0f172a'} stroke={selectedNode === 'decoder-masked-attention' ? '#ec4899' : '#1e293b'} strokeWidth="2" className="transition-all hover:bg-pink-950/20" />
              <text x="115" y="24" textAnchor="middle" className="text-xs font-sans fill-pink-400 font-bold select-none">Masked Multi-Head Self-Attention</text>
              <text x="115" y="40" textAnchor="middle" className="text-[10px] font-mono fill-gray-400 select-none">Prevents look-ahead (future mask)</text>
            </g>

            {/* Multi-Head Encoder-Decoder Attention */}
            <g transform="translate(430, 250)" className="cursor-pointer" onClick={() => setSelectedNode('decoder-enc-dec-attention')}>
              <rect x="0" y="0" width="230" height="50" rx="8" fill={selectedNode === 'decoder-enc-dec-attention' ? 'rgba(168, 85, 247, 0.15)' : '#0f172a'} stroke={selectedNode === 'decoder-enc-dec-attention' ? '#a855f7' : '#1e293b'} strokeWidth="2" className="transition-all hover:bg-purple-950/20" />
              <text x="115" y="24" textAnchor="middle" className="text-xs font-sans fill-purple-400 font-bold select-none">Encoder-Decoder Attention</text>
              <text x="115" y="40" textAnchor="middle" className="text-[10px] font-mono fill-gray-400 select-none">Q from Dec, K & V from Enc</text>
            </g>

            {/* Feed Forward Network */}
            <g transform="translate(430, 140)" className="cursor-pointer" onClick={() => setSelectedNode('feed-forward')}>
              <rect x="0" y="0" width="230" height="50" rx="8" fill={selectedNode === 'feed-forward' ? 'rgba(236, 72, 153, 0.15)' : '#0f172a'} stroke={selectedNode === 'feed-forward' ? '#ec4899' : '#1e293b'} strokeWidth="2" className="transition-all hover:bg-pink-950/20" />
              <text x="115" y="24" textAnchor="middle" className="text-xs font-sans fill-pink-400 font-bold select-none">Feed-Forward Network</text>
              <text x="115" y="40" textAnchor="middle" className="text-[10px] font-mono fill-gray-400 select-none">Linear &rarr; ReLU &rarr; Linear</text>
            </g>

            {/* Top Linear / Softmax outputs */}
            <rect x="430" y="10" width="230" height="30" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            <text x="545" y="29" textAnchor="middle" className="text-xs font-sans fill-gray-400 select-none">Linear &amp; Softmax (Token Probabilities)</text>

            {/* FLOW LINES & CONNECTIONS */}
            {/* Encoder input flow */}
            <path d="M 175 480 L 175 363" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
            
            {/* Encoder attention to FFN */}
            <path d="M 175 310 L 175 203" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Encoder out flow */}
            <path d="M 175 150 L 175 105" stroke="#06b6d4" strokeWidth="1.5" />
            
            {/* Decoder input flow */}
            <path d="M 545 480 L 545 413" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Decoder Masked Attn to Enc-Dec Attn */}
            <path d="M 545 360 L 545 303" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Decoder Enc-Dec Attn to FFN */}
            <path d="M 545 250 L 545 193" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* Decoder out flow */}
            <path d="M 545 140 L 545 43" stroke="#ec4899" strokeWidth="1.5" markerEnd="url(#arrow)" />

            {/* CROSS CONNECTION: Encoder to Decoder Enc-Dec Attention */}
            <path 
              d="M 175 105 L 350 105 L 350 275 L 427 275" 
              fill="none" 
              stroke={selectedNode === 'decoder-enc-dec-attention' ? '#a855f7' : '#64748b'} 
              strokeWidth="2.5" 
              className={selectedNode === 'decoder-enc-dec-attention' ? 'animate-flow-line' : ''} 
              markerEnd={selectedNode === 'decoder-enc-dec-attention' ? 'url(#arrowActive)' : 'url(#arrow)'} 
            />

            {/* Label for cross connection */}
            <rect x="290" y="160" width="120" height="20" rx="4" fill="#0f172a" stroke="#1e293b" />
            <text x="350" y="173" textAnchor="middle" className="text-[9px] font-mono fill-gray-400 select-none">Encoder Key &amp; Value Vectors</text>
          </svg>
        </div>
      </div>

      {/* Detail Inspector Panel (Right) */}
      <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 min-h-[500px] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Detail Inspector</span>
            <span className="text-xs bg-slate-900 border border-white/5 py-1 px-2.5 rounded-full text-cyan-400 font-mono">
              Layer {selectedLayer} active
            </span>
          </div>

          <div className="border-b border-white/10 pb-4 mb-4">
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedNode('positional-encoding')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${selectedNode === 'positional-encoding' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                Pos. Encoding
              </button>
              <button 
                onClick={() => setSelectedNode('encoder-self-attention')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${selectedNode === 'encoder-self-attention' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                Self-Attention
              </button>
              <button 
                onClick={() => setSelectedNode('decoder-masked-attention')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${selectedNode === 'decoder-masked-attention' ? 'bg-pink-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                Masked Attn
              </button>
              <button 
                onClick={() => setSelectedNode('decoder-enc-dec-attention')}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${selectedNode === 'decoder-enc-dec-attention' ? 'bg-purple-500 text-slate-950' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                Cross Attn
              </button>
            </div>
          </div>

          {renderDetailPanel()}
        </div>

        <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
          <span>Click components to switch inspect mode</span>
          <span className="flex items-center gap-1 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Live mathematical visualizations
          </span>
        </div>
      </div>
    </div>
  );
}
