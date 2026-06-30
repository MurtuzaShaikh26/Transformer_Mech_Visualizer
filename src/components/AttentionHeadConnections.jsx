import React, { useState, useMemo } from 'react';
import { Eye, Settings, HelpCircle, ArrowRightLeft } from 'lucide-react';

const EXAMPLES = [
  {
    id: 'anaphora-law',
    name: 'Anaphora (Law vs Committee)',
    sentence: ['The', 'Law', 'gave', 'the', 'committee', 'its', 'approval'],
    defaultHover: 5, // "its"
    description: 'Anaphora resolution. Notice how different heads resolve the pronoun "its" to "Law" or "committee".'
  },
  {
    id: 'winograd-tired',
    name: 'Winograd Schema (Tired Animal)',
    sentence: ['The', 'animal', 'did', 'not', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'],
    defaultHover: 8, // "it"
    description: 'Winograd Schema. The pronoun "it" attends strongly to "animal" because of the adjective "tired".'
  },
  {
    id: 'winograd-wide',
    name: 'Winograd Schema (Wide Street)',
    sentence: ['The', 'animal', 'did', 'not', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'wide'],
    defaultHover: 8, // "it"
    description: 'Winograd Schema. The pronoun "it" attends strongly to "street" because of the adjective "wide".'
  }
];

// Color mapping for all 8 attention heads
const HEAD_COLORS = [
  '#06b6d4', // Cyan (Head 1)
  '#a855f7', // Purple (Head 2)
  '#ec4899', // Pink (Head 3)
  '#10b981', // Emerald (Head 4)
  '#f59e0b', // Amber (Head 5)
  '#3b82f6', // Blue (Head 6)
  '#ef4444', // Red (Head 7)
  '#84cc16'  // Lime (Head 8)
];

export default function AttentionHeadConnections() {
  const [selectedExample, setSelectedExample] = useState(EXAMPLES[0]);
  const [activeHead, setActiveHead] = useState(0); // 0 to 7 (Head 1-8), or 8 for "All Heads"
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Default active word index is the defaultHover of the sentence when no mouse hover is active
  const activeWordIdx = hoveredIdx !== null ? hoveredIdx : selectedExample.defaultHover;

  // Dynamically generate attention weights based on sentence, head, and selected word
  const attentionWeights = useMemo(() => {
    const N = selectedExample.sentence.length;
    const weights = Array(8).fill(0).map(() => Array(N).fill(0).map(() => Array(N).fill(0)));

    // Helper to normalize a row
    const normalize = (arr) => {
      const sum = arr.reduce((a, b) => a + b, 0);
      return arr.map(v => sum === 0 ? 0 : v / sum);
    };

    // Populate weights matrices for each sentence
    if (selectedExample.id === 'anaphora-law') {
      // "The Law gave the committee its approval"
      // indices: 0: The, 1: Law, 2: gave, 3: the, 4: committee, 5: its, 6: approval
      for (let h = 0; h < 8; h++) {
        for (let q = 0; q < N; q++) {
          let row = Array(N).fill(0.05); // baseline uniform
          row[q] += 0.3; // self-attention component

          if (h === 0) {
            // Head 1: Coreference attends to "Law"
            if (q === 5) { row[1] += 0.7; row[6] += 0.1; } // "its" -> "Law"
          } else if (h === 1) {
            // Head 2: Coreference attends to "committee"
            if (q === 5) { row[4] += 0.75; } // "its" -> "committee"
          } else if (h === 2) {
            // Head 3: Verb-Object relations
            if (q === 2) { row[1] += 0.4; row[6] += 0.4; } // "gave" -> "Law" and "approval"
            if (q === 6) { row[2] += 0.5; } // "approval" -> "gave"
          } else if (h === 3) {
            // Head 4: Noun Determiner modifier
            if (q === 0) row[1] += 0.6;
            if (q === 3) row[4] += 0.6;
            if (q === 5) row[6] += 0.6;
          } else if (h === 4) {
            // Head 5: Positional shift (attends to subsequent word)
            if (q < N - 1) row[q + 1] += 0.8;
          } else if (h === 5) {
            // Head 6: Positional shift (attends to preceding word)
            if (q > 0) row[q - 1] += 0.8;
          } else if (h === 6) {
            // Head 7: Global verb focus
            row[2] += 0.6;
          } else {
            // Head 8: Focuses on main object / punctuation
            row[6] += 0.7;
          }
          weights[h][q] = normalize(row);
        }
      }
    } else if (selectedExample.id === 'winograd-tired') {
      // "The animal did not cross the street because it was too tired"
      // indices: 0: The, 1: animal, 2: did, 3: not, 4: cross, 5: the, 6: street, 7: because, 8: it, 9: was, 10: too, 11: tired
      for (let h = 0; h < 8; h++) {
        for (let q = 0; q < N; q++) {
          let row = Array(N).fill(0.02);
          row[q] += 0.2;

          if (h === 0) {
            // Head 1: "it" -> "animal" (because it was tired)
            if (q === 8) { row[1] += 0.75; row[11] += 0.1; } 
          } else if (h === 1) {
            // Head 2: Verb relation "cross" -> "animal" and "street"
            if (q === 4) { row[1] += 0.4; row[6] += 0.4; }
          } else if (h === 2) {
            // Head 3: Adjective modifier "tired" -> "it" & "animal"
            if (q === 11) { row[8] += 0.4; row[1] += 0.4; }
          } else if (h === 3) {
            // Head 4: Left-shift local attention
            if (q > 0) row[q - 1] += 0.7;
          } else if (h === 4) {
            // Head 5: Self-attentive diagonal
            row[q] += 0.8;
          } else if (h === 5) {
            // Head 6: Conjunction "because" -> clause
            if (q === 7) { row[4] += 0.3; row[8] += 0.3; }
          } else if (h === 6) {
            // Head 7: Focus on main verb "cross"
            row[4] += 0.5;
          } else {
            // Head 8: Adverb focus
            if (q === 10) row[11] += 0.8; // "too" -> "tired"
          }
          weights[h][q] = normalize(row);
        }
      }
    } else if (selectedExample.id === 'winograd-wide') {
      // "The animal did not cross the street because it was too wide"
      // indices: 0: The, 1: animal, 2: did, 3: not, 4: cross, 5: the, 6: street, 7: because, 8: it, 9: was, 10: too, 11: wide
      for (let h = 0; h < 8; h++) {
        for (let q = 0; q < N; q++) {
          let row = Array(N).fill(0.02);
          row[q] += 0.2;

          if (h === 0) {
            // Head 1: "it" -> "street" (because it was wide)
            if (q === 8) { row[6] += 0.75; row[11] += 0.1; } 
          } else if (h === 1) {
            // Head 2: Verb relation "cross" -> "animal" and "street"
            if (q === 4) { row[1] += 0.4; row[6] += 0.4; }
          } else if (h === 2) {
            // Head 3: Adjective modifier "wide" -> "it" & "street"
            if (q === 11) { row[8] += 0.4; row[6] += 0.4; }
          } else if (h === 3) {
            // Head 4: Left-shift local attention
            if (q > 0) row[q - 1] += 0.7;
          } else if (h === 4) {
            // Head 5: Self-attentive diagonal
            row[q] += 0.8;
          } else if (h === 5) {
            // Head 6: Conjunction "because" -> clause
            if (q === 7) { row[4] += 0.3; row[8] += 0.3; }
          } else if (h === 6) {
            // Head 7: Focus on main verb "cross"
            row[4] += 0.5;
          } else {
            // Head 8: Adverb focus
            if (q === 10) row[11] += 0.8; // "too" -> "wide"
          }
          weights[h][q] = normalize(row);
        }
      }
    }

    return weights;
  }, [selectedExample]);

  const handleExampleChange = (e) => {
    const ex = EXAMPLES.find(x => x.id === e.target.value);
    setSelectedExample(ex);
    setHoveredIdx(null);
  };

  // Helper to draw connecting lines between left and right words
  const renderConnections = () => {
    const N = selectedExample.sentence.length;
    const lines = [];
    const height = 450;
    const step = height / (N + 1);

    const leftX = 80;
    const rightX = 320;

    // Draw for each head
    const headsToRender = activeHead === 8 ? [0, 1, 2, 3, 4, 5, 6, 7] : [activeHead];

    headsToRender.forEach((hIdx) => {
      const color = HEAD_COLORS[hIdx];
      const q = activeWordIdx;

      for (let k = 0; k < N; k++) {
        const weight = attentionWeights[hIdx][q][k];
        if (weight < 0.01) continue;

        const leftY = step * (q + 1);
        const rightY = step * (k + 1);

        // Control points for smooth Bezier curves
        const cp1x = leftX + 80;
        const cp1y = leftY;
        const cp2x = rightX - 80;
        const cp2y = rightY;

        lines.push(
          <path
            key={`h${hIdx}-q${q}-k${k}`}
            d={`M ${leftX} ${leftY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${rightX} ${rightY}`}
            fill="none"
            stroke={color}
            strokeWidth={activeHead === 8 ? weight * 3.5 : weight * 5.5 + 0.5}
            strokeOpacity={activeHead === 8 ? weight * 0.7 : weight * 0.85 + 0.05}
            className="transition-all duration-300"
          />
        );
      }
    });

    return lines;
  };

  const renderWords = (side) => {
    const N = selectedExample.sentence.length;
    const height = 450;
    const step = height / (N + 1);
    const x = side === 'left' ? 70 : 330;
    const textAnchor = side === 'left' ? 'end' : 'start';

    return selectedExample.sentence.map((word, idx) => {
      const y = step * (idx + 1);
      const isWordActive = activeWordIdx === idx;
      
      // Determine if this word receives high attention from the query word
      let isAttended = false;
      if (side === 'right') {
        const headsToInspect = activeHead === 8 ? [0, 1, 2, 3, 4, 5, 6, 7] : [activeHead];
        isAttended = headsToInspect.some(h => attentionWeights[h][activeWordIdx][idx] > 0.25);
      }

      const getTextColor = () => {
        if (side === 'left') {
          return isWordActive 
            ? 'fill-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' 
            : 'fill-gray-400 hover:fill-gray-200';
        } else {
          return isAttended
            ? 'fill-purple-400 font-bold drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]'
            : 'fill-gray-400';
        }
      };

      return (
        <text
          key={`${side}-${idx}`}
          x={x}
          y={y + 4} // adjust baseline alignment
          textAnchor={textAnchor}
          className={`font-mono text-xs cursor-pointer select-none transition-all duration-150 ${getTextColor()}`}
          onMouseEnter={() => side === 'left' && setHoveredIdx(idx)}
          onMouseLeave={() => side === 'left' && setHoveredIdx(null)}
        >
          {word}
        </text>
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* Settings Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-white/5">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            <span>Attention Head Connections</span>
          </h3>
          <p className="text-xs text-gray-400">
            Recreating Attention alignments from the original <em>Attention Is All You Need</em> paper.
          </p>
        </div>

        {/* Dropdowns / Head Selectors */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col">
            <label className="text-[9px] text-gray-500 uppercase font-mono tracking-wider mb-1">Sentence Context</label>
            <select
              value={selectedExample.id}
              onChange={handleExampleChange}
              className="bg-slate-950 border border-white/10 text-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none cursor-pointer focus:border-cyan-500"
            >
              {EXAMPLES.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[9px] text-gray-500 uppercase font-mono tracking-wider mb-1">Active Head</label>
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/10">
              <select
                value={activeHead}
                onChange={(e) => setActiveHead(parseInt(e.target.value))}
                className="bg-slate-950 text-gray-300 text-xs px-2.5 py-1 outline-none cursor-pointer rounded"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map((hIdx) => (
                  <option key={hIdx} value={hIdx}>Head {hIdx + 1}</option>
                ))}
                <option value={8}>Show All 8 Heads</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Connection Chart (Left) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center">
          <div className="w-full flex justify-between text-[10px] text-gray-500 uppercase font-mono border-b border-white/5 pb-2 mb-4 px-8">
            <span>Query Word (Hover to change)</span>
            <span>Attended Word (Context Key)</span>
          </div>

          {/* SVG canvas */}
          <div className="w-full bg-slate-950/40 rounded-xl border border-white/5 p-4 flex justify-center">
            <svg viewBox="0 0 400 450" className="w-full max-w-[400px] h-[450px]">
              {/* Connections (rendered below texts) */}
              {renderConnections()}

              {/* Text labels */}
              {renderWords('left')}
              {renderWords('right')}
            </svg>
          </div>
        </div>

        {/* Head details and explainer (Right) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>Inspection Insights</span>
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              {selectedExample.description}
            </p>

            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-400">Head Specialization Map:</div>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((hIdx) => {
                  const isActive = activeHead === hIdx || activeHead === 8;
                  const color = HEAD_COLORS[hIdx];
                  const specializations = [
                    'Pronoun Ref (A)',
                    'Pronoun Ref (B)',
                    'Verb-Object Align',
                    'Modifier Align',
                    'Positional Right (+1)',
                    'Positional Left (-1)',
                    'Verb Centralization',
                    'Object Focus'
                  ];

                  return (
                    <button
                      key={hIdx}
                      onClick={() => setActiveHead(hIdx)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        activeHead === hIdx
                          ? 'bg-slate-900 border-white/20'
                          : 'bg-slate-950/40 border-white/5 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ 
                            backgroundColor: color, 
                            opacity: isActive ? 1 : 0.2,
                            boxShadow: isActive ? `0 0 8px ${color}` : 'none'
                          }} 
                        />
                        <span className={`text-[10px] font-bold ${isActive ? 'text-gray-200' : 'text-gray-500'}`}>Head {hIdx + 1}</span>
                      </div>
                      <div className={`text-[8px] font-mono mt-1 ${isActive ? 'text-cyan-400' : 'text-gray-600'}`}>{specializations[hIdx]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 text-xs text-gray-400">
            <h4 className="font-bold text-gray-200 uppercase tracking-widest font-mono flex items-center gap-1">
              <Settings className="w-4 h-4 text-purple-400" />
              <span>How Attention Resolves Context</span>
            </h4>
            <p className="leading-relaxed">
              In older sequential architectures (like LSTMs), resolving long-distance dependencies (like connecting "its" to "Law" across a sentence) required scanning through all intermediate words step-by-step. Information easily washed out.
            </p>
            <p className="leading-relaxed">
              Transformers resolve dependencies in a single <strong className="text-purple-400 font-mono">O(1)</strong> step. By calculating compatibility between all pairs of words simultaneously, signals can jump directly from the pronoun to its noun antecedent, regardless of how far apart they are in the sequence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
