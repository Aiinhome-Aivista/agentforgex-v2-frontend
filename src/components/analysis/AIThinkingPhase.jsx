import { useState, useEffect, useMemo, useRef } from 'react'
import avatarVideo from '../../assets/now_instead_of_robot_do_this_a.mp4'

/**
 * AIThinkingPhase
 * ─────────────────────────────────────────────────────────────────────────
 * A modern AI assistant character with subtle active thinking animations,
 * rotating hologram rings, dynamic glowing colors synced to stages, and
 * animated floating knowledge particles.
 *
 * Props:
 *   words     {string[]}  rotating status phrases
 *   title     {string}    headline above the word (default: "AI is thinking")
 *   subtitle  {string}    small line under the rotating word
 *   compact   {boolean}   smaller size
 */
const DEFAULT_WORDS = [
  'Analyzing',
  'Processing data',
  'Evaluating information',
  'Generating insights',
  'Synthesizing information',
  'Computing results',
]

const STAGES = {
  '0.0': { glow: 'rgba(16, 185, 129, 0.35)', border: '#10b981', text: 'text-emerald-400' },
  '1.8': { glow: 'rgba(6, 182, 212, 0.35)', border: '#06b6d4', text: 'text-cyan-400' },
  '3.8': { glow: 'rgba(245, 158, 11, 0.35)', border: '#f59e0b', text: 'text-amber-400' },
  '5.8': { glow: 'rgba(139, 92, 246, 0.35)', border: '#8b5cf6', text: 'text-violet-400' },
  '7.8': { glow: 'rgba(244, 63, 94, 0.35)', border: '#f43f5e', text: 'text-pink-400' },
}

const PARTICLES = [
  { id: 1, left: '12%', delay: '0s', size: '4px', speed: '3.5s' },
  { id: 2, left: '28%', delay: '1.2s', size: '5px', speed: '4.5s' },
  { id: 3, left: '42%', delay: '0.6s', size: '3px', speed: '3.0s' },
  { id: 4, left: '58%', delay: '2.0s', size: '6px', speed: '4.0s' },
  { id: 5, left: '72%', delay: '0.9s', size: '4px', speed: '5.0s' },
  { id: 6, left: '88%', delay: '0.3s', size: '5px', speed: '3.6s' },
  { id: 7, left: '22%', delay: '2.5s', size: '3px', speed: '3.8s' },
  { id: 8, left: '78%', delay: '1.5s', size: '4px', speed: '4.2s' },
]

const getSegmentForWord = (word) => {
  if (!word) return [0.0, 1.8];
  const w = word.toLowerCase();
  if (w.includes('analyz') || w.includes('workfl') || w.includes('map')) {
    return [1.8, 3.8];
  }
  if (w.includes('bottleneck') || w.includes('problem') || w.includes('issue')) {
    return [3.8, 5.8];
  }
  if (w.includes('embed') || w.includes('stor') || w.includes('reason') || w.includes('concept') || w.includes('knowl') || w.includes('graph') || w.includes('synthes') || w.includes('reconcil')) {
    return [5.8, 7.8];
  }
  if (w.includes('generat') || w.includes('insight') || w.includes('result') || w.includes('final') || w.includes('comput')) {
    return [7.8, 9.8];
  }
  return [0.0, 1.8];
}

export default function AIThinkingPhase({
  words = DEFAULT_WORDS,
  title = 'AI is thinking',
  subtitle = 'Mapping entities, relationships and meaning from your data',
  compact = false,
}) {
  const [wordIdx, setWordIdx] = useState(0)
  const containerRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => {
      setWordIdx(i => (i + 1) % words.length)
    }, 1600)
    return () => clearInterval(id)
  }, [words.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  const currentWord = words[wordIdx] || ''
  const range = useMemo(() => getSegmentForWord(currentWord), [currentWord])
  
  const activeStage = useMemo(() => {
    const key = range[0].toFixed(1);
    return STAGES[key] || STAGES['0.0'];
  }, [range])

  // Custom looping mechanism to loop video segments matching stages
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const [start, end] = range;
    const buffer = 0.3;

    // If we're out of bounds, jump to the start of the current segment
    if (video.currentTime < start - buffer || video.currentTime > end + buffer) {
      video.currentTime = start;
    }

    let frameId;
    const checkTime = () => {
      if (!video) return;
      const endLimit = Math.min(end, video.duration || 9.8);
      if (video.currentTime >= endLimit) {
        video.currentTime = start;
      }
      frameId = requestAnimationFrame(checkTime);
    };

    if (video.paused) {
      video.play().catch((err) => console.log('Autoplay warning:', err));
    }

    frameId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(frameId);
  }, [range])

  const size = compact ? 140 : 210

  return (
    <div ref={containerRef} className="afx-think w-full flex flex-col items-center justify-center py-12 select-none animate-fade-in">
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(120%) scale(0.6);
            opacity: 0;
          }
          30% {
            opacity: 0.8;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-160px) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes scannerLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.95); opacity: 0.55; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes wordIn {
          from { opacity: 0; transform: translateY(8px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
        @keyframes barProgress {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(1); transform-origin: left; }
          50.01% { transform-origin: right; }
          100% { transform: scaleX(0); transform-origin: right; }
        }
        .animate-float-particle {
          animation: floatUp var(--speed, 4s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
      `}</style>

      {/* Avatar Container */}
      <div 
        className="relative w-full transition-all duration-500 ease-in-out rounded-2xl animate-fade-in" 
        style={{ 
          maxWidth: compact ? '280px' : '400px', 
          aspectRatio: '16/9'
        }}
      >
        {/* Soft dynamic glow background */}
        <div
          className="absolute inset-[-10px] rounded-2xl blur-3xl transition-all duration-700 ease-in-out"
          style={{
            background: `radial-gradient(circle, ${activeStage.glow}, transparent 75%)`,
            animation: 'pulseGlow 3s ease-in-out infinite',
          }}
        />

        {/* Orbiting dashed hologram frame (outer) */}
        <svg
          className="absolute inset-[-12px] pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: 'calc(100% + 24px)', height: 'calc(100% + 24px)' }}
        >
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            rx="5"
            fill="none"
            stroke={activeStage.border}
            strokeWidth="0.8"
            strokeDasharray="4 8"
            className="transition-all duration-700 ease-in-out opacity-60"
          />
        </svg>

        {/* Orbiting dashed hologram frame (inner) */}
        <svg
          className="absolute inset-[-6px] pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: 'calc(100% + 12px)', height: 'calc(100% + 12px)' }}
        >
          <rect
            x="1"
            y="1"
            width="98"
            height="98"
            rx="4"
            fill="none"
            stroke={activeStage.border}
            strokeWidth="0.4"
            strokeDasharray="2 4"
            className="transition-all duration-700 ease-in-out opacity-40 animate-[pulse_2s_infinite]"
          />
        </svg>

        {/* Holographic binary data streams on left/right edges */}
        <div className="absolute left-[-20px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-20 flex flex-col items-center justify-between text-[7px] font-mono text-white select-none">
          <span className="animate-[pulse_1.5s_infinite]">1</span>
          <span className="animate-[pulse_2s_infinite_0.3s]">0</span>
          <span className="animate-[pulse_1.2s_infinite_0.6s]">1</span>
          <span className="animate-[pulse_2.5s_infinite_0.1s]">1</span>
          <span className="animate-[pulse_1.8s_infinite_0.4s]">0</span>
        </div>
        <div className="absolute right-[-20px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-20 flex flex-col items-center justify-between text-[7px] font-mono text-white select-none">
          <span className="animate-[pulse_2s_infinite_0.2s]">0</span>
          <span className="animate-[pulse_1.4s_infinite_0.5s]">1</span>
          <span className="animate-[pulse_1.7s_infinite_0.1s]">0</span>
          <span className="animate-[pulse_2.2s_infinite_0.7s]">1</span>
          <span className="animate-[pulse_1.5s_infinite_0.3s]">0</span>
        </div>

        {/* Floating knowledge particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute bottom-0 rounded-full animate-float-particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: activeStage.border,
                boxShadow: `0 0 8px ${activeStage.border}`,
                opacity: 0.6,
                '--speed': p.speed,
                '--delay': p.delay,
              }}
            />
          ))}
        </div>

        {/* Video Container (Rectangle) */}
        <div className="w-full h-full rounded-2xl overflow-hidden border border-white/15 bg-brand-dark/40 backdrop-blur-md relative flex items-center justify-center">
          <video
            ref={videoRef}
            src={avatarVideo}
            muted
            playsInline
            autoPlay
            className="w-full h-full object-cover opacity-95"
          />

          {/* Scanner horizontal line overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
              style={{ animation: 'scannerLine 4.5s linear infinite' }}
            />
            {/* Subtle sci-fi vignette */}
            <div
              className="absolute inset-0 rounded-2xl mix-blend-overlay pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 65%, ${activeStage.glow} 100%)`,
              }}
            />
          </div>
        </div>
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
            style={{ animation: 'wordIn .5s ease-out' }}
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
            className="h-full rounded-full transition-all duration-700 ease-in-out"
            style={{
              background: `linear-gradient(to right, ${activeStage.border}, #22d3ee)`,
              boxShadow: `0 0 8px ${activeStage.border}`,
              animation: 'barProgress 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  )
}
