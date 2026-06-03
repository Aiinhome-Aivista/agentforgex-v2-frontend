import { useState, useEffect, useMemo } from 'react'

/**
 * AIThinkingPhase
 * ─────────────────────────────────────────────────────────────────────────
 * A self-contained "AI is thinking" animation: a pulsing neural brain with
 * traveling synapse pulses, an orbiting glow, and a rotating status word.
 *
 * Props:
 *   words     {string[]}  rotating status phrases
 *   title     {string}    headline above the word (default: "AI is thinking")
 *   subtitle  {string}    small line under the rotating word
 *   compact   {boolean}   smaller brain (used for the final "synthesizing" pass)
 */
const DEFAULT_WORDS = [
  'Analyzing',
  'Processing data',
  'Evaluating information',
  'Generating insights',
  'Synthesizing information',
  'Computing results',
]

// Neural nodes positioned inside the brain silhouette (viewBox 0 0 240 200)
const NODES = [
  [70, 60], [105, 45], [150, 52], [185, 78],
  [60, 100], [98, 92], [138, 88], [175, 112],
  [78, 138], [118, 130], [158, 132], [188, 150],
  [95, 168], [140, 168],
]

// Synapse connections between node indices
const LINKS = [
  [0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 7],
  [4, 5], [5, 6], [6, 7], [4, 8], [5, 9], [6, 10], [7, 11],
  [8, 9], [9, 10], [10, 11], [8, 12], [9, 12], [10, 13], [11, 13],
  [12, 13], [5, 8], [6, 9], [2, 5],
]

export default function AIThinkingPhase({
  words = DEFAULT_WORDS,
  title = 'AI is thinking',
  subtitle = 'Mapping entities, relationships and meaning from your data',
  compact = false,
}) {
  const [wordIdx, setWordIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx(i => (i + 1) % words.length)
    }, 1600)
    return () => clearInterval(id)
  }, [words.length])

  const size = compact ? 150 : 220
  const linkPaths = useMemo(
    () => LINKS.map(([a, b]) => ({
      x1: NODES[a][0], y1: NODES[a][1], x2: NODES[b][0], y2: NODES[b][1],
    })),
    []
  )

  return (
    <div className="afx-think w-full flex flex-col items-center justify-center py-12 select-none animate-fade-in">
      <style>{`
        @keyframes afxPulseNode {
          0%, 100% { opacity: .35; transform: scale(.8); }
          50%      { opacity: 1;   transform: scale(1.35); }
        }
        @keyframes afxDash {
          to { stroke-dashoffset: -40; }
        }
        @keyframes afxRing {
          0%   { transform: rotate(0deg);   opacity: .5; }
          50%  { opacity: 1; }
          100% { transform: rotate(360deg); opacity: .5; }
        }
        @keyframes afxFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes afxWordIn {
          from { opacity: 0; transform: translateY(8px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
        @keyframes afxBar {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(1); transform-origin: left; }
          50.01% { transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
        .afx-think .afx-node { transform-box: fill-box; transform-origin: center;
          animation: afxPulseNode 2.4s ease-in-out infinite; }
        .afx-think .afx-link { stroke-dasharray: 6 14;
          animation: afxDash 1.4s linear infinite; }
        .afx-think .afx-brain { animation: afxFloat 4s ease-in-out infinite; }
        .afx-think .afx-ring  { transform-origin: 50% 50%;
          animation: afxRing 9s linear infinite; }
      `}</style>

      {/* Brain */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Soft glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,.35), transparent 65%)' }}
        />
        {/* Orbiting dashed ring */}
        <svg className="afx-ring absolute inset-0" viewBox="0 0 240 240" width={size} height={size}>
          <circle cx="120" cy="120" r="108" fill="none"
            stroke="rgba(16,185,129,.35)" strokeWidth="1.5" strokeDasharray="3 12" />
        </svg>

        {/* Neural brain */}
        <svg className="afx-brain relative" viewBox="0 0 240 200" width={size} height={size}>
          <defs>
            <radialGradient id="afxNodeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </radialGradient>
            <linearGradient id="afxBrainStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"  stopColor="#34d399" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* Brain silhouette */}
          <path
            d="M120 24
               C150 8 196 14 206 52
               C228 60 230 104 206 120
               C214 150 188 184 150 178
               C138 192 102 192 90 178
               C52 184 26 150 34 120
               C10 104 12 60 34 52
               C44 14 90 8 120 24 Z"
            fill="rgba(16,185,129,0.05)"
            stroke="url(#afxBrainStroke)"
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />
          {/* Central fissure */}
          <path d="M120 24 C116 70 124 120 120 178" fill="none"
            stroke="url(#afxBrainStroke)" strokeWidth="1.2" strokeOpacity="0.4" />

          {/* Synapse links */}
          <g>
            {linkPaths.map((l, i) => (
              <line
                key={i}
                className="afx-link"
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke="#10b981"
                strokeWidth="1"
                strokeOpacity="0.55"
                style={{ animationDelay: `${(i % 7) * 0.18}s` }}
              />
            ))}
          </g>

          {/* Neural nodes */}
          <g>
            {NODES.map(([x, y], i) => (
              <circle
                key={i}
                className="afx-node"
                cx={x} cy={y} r={i % 3 === 0 ? 4.5 : 3.2}
                fill="url(#afxNodeGrad)"
                style={{ animationDelay: `${(i % 6) * 0.32}s` }}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Status text */}
      <div className="mt-8 text-center">
        <p className="text-xs font-bold tracking-[0.25em] uppercase text-brand-500/70">
          {title}
        </p>
        <div className="h-9 mt-2 flex items-center justify-center overflow-hidden">
          <span
            key={wordIdx}
            className="text-2xl font-black gradient-text"
            style={{ animation: 'afxWordIn .5s ease-out' }}
          >
            {words[wordIdx]}
            <span className="text-brand-400">…</span>
          </span>
        </div>
        <p className="mt-3 text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Indeterminate progress bar */}
        <div className="mt-5 mx-auto w-48 h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-cyan-400 rounded-full"
            style={{ animation: 'afxBar 1.8s ease-in-out infinite' }}
          />
        </div>
      </div>
    </div>
  )
}
