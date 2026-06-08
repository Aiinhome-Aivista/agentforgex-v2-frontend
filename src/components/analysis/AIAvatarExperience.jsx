import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Check } from "lucide-react";

/**
 * AIAvatarExperience — Intelligent Avatar loading experience for AgentForgeX.
 *
 * Replaces the traditional loading animation with a friendly, professional AI
 * "expert" avatar that appears to actively analyse the user's request:
 *   • Natural blinking, gentle breathing, slight head movement
 *   • Occasional hand gestures + a hand-on-chin thinking pose
 *   • Premium thinking effects (neural net, holographic rings, orbiting
 *     particles, data streams, brainwave, floating thought dots, glow pulses)
 *   • Dynamic, stage-based processing status messages
 *
 * Public API matches the previous loader so it is a drop-in replacement:
 * @param {number}   duration       — Total animation duration in ms (default 15000)
 * @param {boolean}  isApiFinished  — Set true when backend work completes
 * @param {function} onComplete     — Fired after the completion animation
 */

// ─── Processing stages (status messages) ───────────────────────────────────
const STAGES = [
  { title: "Uploading Documents", sub: "Preparing your files...", progress: 12 },
  { title: "Understanding Process", sub: "Learning business context...", progress: 26 },
  { title: "Analysing Workflow", sub: "Mapping workflow relationships...", progress: 42 },
  { title: "Identifying Bottlenecks", sub: "Detecting inefficiencies...", progress: 58 },
  { title: "Identifying Key Processes", sub: "Creating process intelligence...", progress: 74 },
  { title: "Generating Insights", sub: "Producing actionable recommendations...", progress: 88 },
  { title: "Finalising Results", sub: "Preparing your analysis...", progress: 100 },
];

// Theme colours
const EMERALD = "#10b981";
const MINT = "#34d399";
const CYAN = "#22d3ee";

/* ═══════════════════════════════════════════════════════════════════════════
   THINKING EFFECTS — layered behind / around the avatar
   ═══════════════════════════════════════════════════════════════════════════ */

// Soft, breathing glow pulses behind the avatar (dynamic glow + intelligent pulse)
function GlowPulses() {
  return (
    <>
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 260, height: 260, background: `radial-gradient(circle, ${EMERALD}33 0%, transparent 70%)`, filter: "blur(8px)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{ width: 340, height: 340, background: `radial-gradient(circle, ${CYAN}1f 0%, transparent 70%)`, filter: "blur(20px)" }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

// Concentric holographic rings, rotating in opposite directions
function HoloRings() {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
      <motion.circle
        cx="200" cy="200" r="150" fill="none" stroke={EMERALD} strokeOpacity="0.18"
        strokeWidth="1" strokeDasharray="3 10"
        animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "200px 200px" }}
      />
      <motion.circle
        cx="200" cy="200" r="120" fill="none" stroke={CYAN} strokeOpacity="0.15"
        strokeWidth="1" strokeDasharray="1 14"
        animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "200px 200px" }}
      />
      <motion.circle
        cx="200" cy="200" r="178" fill="none" stroke={MINT} strokeOpacity="0.1"
        strokeWidth="1" strokeDasharray="22 18"
        animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "200px 200px" }}
      />
    </svg>
  );
}

// Neural network connection lines + pulsing nodes
function NeuralNet() {
  const nodes = [
    [60, 90], [120, 50], [330, 80], [355, 175], [70, 250], [300, 290], [200, 330], [40, 175],
  ];
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 5], [5, 6], [6, 4], [4, 7], [7, 0], [1, 7], [3, 2], [4, 6],
  ];
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
      {links.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke={EMERALD} strokeWidth="1" strokeOpacity="0.12" strokeDasharray="4 6"
          animate={{ strokeDashoffset: [0, -40] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, ease: "linear" }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle
          key={i} cx={x} cy={y} r="2.5" fill={i % 2 ? CYAN : MINT}
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.6, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
        />
      ))}
    </svg>
  );
}

// Rotating knowledge particles orbiting the avatar
function OrbitParticles() {
  const orbits = [
    { r: 135, dur: 14, size: 3, color: MINT, start: 0 },
    { r: 160, dur: 20, size: 2.5, color: CYAN, start: 120, reverse: true },
    { r: 110, dur: 11, size: 2, color: EMERALD, start: 240 },
    { r: 150, dur: 18, size: 2.5, color: MINT, start: 60, reverse: true },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {orbits.map((o, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{ width: 0, height: 0 }}
          animate={{ rotate: o.reverse ? [o.start, o.start - 360] : [o.start, o.start + 360] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "linear" }}
        >
          <span
            className="absolute rounded-full"
            style={{
              width: o.size * 2, height: o.size * 2, background: o.color,
              transform: `translate(${o.r}px, -50%)`,
              boxShadow: `0 0 8px ${o.color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Vertical data streams on the sides
function DataStreams() {
  const cols = [40, 70, 330, 360];
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
      <defs>
        <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={EMERALD} stopOpacity="0" />
          <stop offset="50%" stopColor={MINT} stopOpacity="0.5" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </linearGradient>
      </defs>
      {cols.map((x, i) => (
        <motion.rect
          key={i} x={x} width="1.5" height="60" rx="1" fill="url(#streamGrad)"
          animate={{ y: [-60, 400] }}
          transition={{ duration: 3.5 + i * 0.6, repeat: Infinity, ease: "linear", delay: i * 0.8 }}
        />
      ))}
    </svg>
  );
}

// Digital brainwave near the top of the avatar
function Brainwave() {
  return (
    <svg viewBox="0 0 200 40" className="absolute left-1/2 -translate-x-1/2 top-2 w-44 h-10 pointer-events-none" aria-hidden>
      <motion.path
        d="M0 20 Q 12 4 24 20 T 48 20 Q 60 32 72 20 T 96 20 Q 108 6 120 20 T 144 20 Q 156 30 168 20 T 200 20"
        fill="none" stroke={CYAN} strokeWidth="1.6" strokeOpacity="0.45" strokeLinecap="round"
        animate={{ pathLength: [0, 1], opacity: [0, 0.6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// Floating thought dots + an occasional bulb near the avatar's head
function ThoughtBursts() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {/* thinking dots floating up near the head */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${58 + i * 5}%`, top: "26%",
            width: 6 - i, height: 6 - i,
            background: i % 2 ? CYAN : MINT,
            boxShadow: `0 0 6px ${i % 2 ? CYAN : MINT}`,
          }}
          animate={{ y: [0, -26, -40], opacity: [0, 0.9, 0], scale: [0.6, 1, 0.6] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: i * 0.5 }}
        />
      ))}
      {/* occasional lightbulb idea */}
      <motion.div
        className="absolute"
        style={{ left: "63%", top: "16%" }}
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.6, 0.6, 1.05, 1, 0.7], y: [4, 4, -2, -4, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.55, 0.65, 0.85, 1] }}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-md" style={{ background: `${MINT}66` }} />
          <Lightbulb size={22} className="relative text-amber-300" strokeWidth={2} />
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE AVATAR — friendly, professional AI expert (SVG + framer-motion)
   ═══════════════════════════════════════════════════════════════════════════ */
function ThinkingAvatar({ pose = "rest", complete = false }) {
  // Head tilt driven by pose / mood
  const headTilt = complete
    ? { rotate: 0, y: -2 }
    : pose === "think"
    ? { rotate: -4, y: 2 }
    : pose === "gesture"
    ? { rotate: 3, y: -1 }
    : { rotate: 0, y: 0 };

  // Eye focus (slightly narrowed while concentrating)
  const eyeFocus = !complete && pose === "think" ? 0.72 : 1;

  return (
    <svg viewBox="0 0 260 300" className="w-[230px] h-[265px] md:w-[250px] md:h-[290px] relative z-10" aria-hidden>
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f3d33" />
          <stop offset="55%" stopColor="#0c5a47" />
          <stop offset="100%" stopColor="#0a8f6e" />
        </linearGradient>
        <linearGradient id="headGrad" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#e9fff8" />
          <stop offset="45%" stopColor="#bff4e3" />
          <stop offset="100%" stopColor="#6fe0c0" />
        </linearGradient>
        <linearGradient id="visorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06241f" />
          <stop offset="100%" stopColor="#0a3a30" />
        </linearGradient>
        <radialGradient id="eyeGrad" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#d7fff4" />
          <stop offset="40%" stopColor={MINT} />
          <stop offset="100%" stopColor={EMERALD} />
        </radialGradient>
        <linearGradient id="armGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0c5a47" />
          <stop offset="100%" stopColor="#0a8f6e" />
        </linearGradient>
        <filter id="avatarGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── BREATHING wrapper (whole figure inflates gently from the base) ── */}
      <motion.g
        animate={complete ? { y: 0, scale: 1 } : { y: [0, -2, 0], scale: [1, 1.012, 1] }}
        transition={{ duration: 4.2, repeat: complete ? 0 : Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
      >
        {/* shoulders / torso */}
        <path
          d="M48 300 C 48 232 84 206 130 206 C 176 206 212 232 212 300 Z"
          fill="url(#bodyGrad)" stroke={EMERALD} strokeOpacity="0.5" strokeWidth="1.5"
        />
        {/* collar highlight */}
        <path d="M92 214 C 110 230 150 230 168 214" fill="none" stroke={MINT} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        {/* chest emblem — forge spark */}
        <motion.g
          animate={complete ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.6, repeat: complete ? 0 : Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <circle cx="130" cy="258" r="15" fill="#06241f" stroke={MINT} strokeOpacity="0.6" strokeWidth="1.2" />
          <path d="M133 248 l-9 12 h6 l-3 10 9 -12 h-6 z" fill={MINT} />
        </motion.g>

        {/* ── LEFT ARM (resting, screen-left) ── */}
        <path
          d="M58 240 C 40 256 36 282 44 300 L 70 300 C 64 280 70 258 84 246 Z"
          fill="url(#armGrad)" stroke={EMERALD} strokeOpacity="0.4" strokeWidth="1.2"
        />

        {/* ── RIGHT ARM — crossfaded poses ── */}
        {/* rest: hanging at side */}
        <motion.g
          animate={{ opacity: pose === "rest" || complete ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <path
            d="M202 240 C 220 256 224 282 216 300 L 190 300 C 196 280 190 258 176 246 Z"
            fill="url(#armGrad)" stroke={EMERALD} strokeOpacity="0.4" strokeWidth="1.2"
          />
        </motion.g>
        {/* think: forearm up, hand resting under the chin */}
        <motion.g
          animate={{ opacity: !complete && pose === "think" ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* connected bent arm: shoulder → elbow → forearm up to the chin */}
          <path
            d="M199 238 L214 282 L150 168"
            fill="none" stroke="url(#armGrad)" strokeWidth="19" strokeLinecap="round" strokeLinejoin="round"
            opacity="0.97"
          />
          {/* hand cupped at the chin */}
          <ellipse cx="146" cy="158" rx="14" ry="11" fill="url(#headGrad)" stroke={EMERALD} strokeOpacity="0.4" strokeWidth="1" transform="rotate(-18 146 158)" />
          <path d="M138 150 q3 8 16 6 M141 156 q4 7 15 4" fill="none" stroke="#0a8f6e" strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
        </motion.g>
        {/* gesture: hand raised outward, presenting */}
        <motion.g
          animate={{ opacity: !complete && pose === "gesture" ? 1 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <path
            d="M196 244 C 218 250 236 236 238 214"
            fill="none" stroke="url(#armGrad)" strokeWidth="22" strokeLinecap="round" opacity="0.96"
          />
          <motion.ellipse
            cx="240" cy="206" rx="13" ry="10" fill="url(#headGrad)" stroke={EMERALD} strokeOpacity="0.4" strokeWidth="1"
            animate={{ rotate: [0, 8, -4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        </motion.g>

        {/* neck */}
        <rect x="116" y="158" width="28" height="30" rx="10" fill="url(#bodyGrad)" stroke={EMERALD} strokeOpacity="0.4" strokeWidth="1" />

        {/* ── HEAD: pose tilt → idle sway → contents ── */}
        <motion.g animate={headTilt} transition={{ duration: 1.1, ease: "easeInOut" }} style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}>
          <motion.g
            animate={complete ? { rotate: [0, -3, 3, 0] } : { rotate: [-1.5, 1.5, -1.5], y: [0, -1.5, 0] }}
            transition={{ duration: complete ? 1.2 : 7, repeat: complete ? 0 : Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
          >
            {/* antenna */}
            <line x1="130" y1="46" x2="130" y2="30" stroke={EMERALD} strokeWidth="2.5" strokeLinecap="round" />
            <motion.circle
              cx="130" cy="26" r="5" fill={MINT}
              animate={{ opacity: [0.5, 1, 0.5], r: [4.5, 5.5, 4.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: `drop-shadow(0 0 5px ${MINT})` }}
            />

            {/* ear / headphone pods */}
            <rect x="78" y="86" width="14" height="34" rx="7" fill="url(#bodyGrad)" stroke={EMERALD} strokeOpacity="0.4" strokeWidth="1" />
            <rect x="168" y="86" width="14" height="34" rx="7" fill="url(#bodyGrad)" stroke={EMERALD} strokeOpacity="0.4" strokeWidth="1" />

            {/* head shell */}
            <rect x="86" y="46" width="88" height="92" rx="34" fill="url(#headGrad)" stroke="#0a8f6e" strokeOpacity="0.35" strokeWidth="1.5" filter="url(#avatarGlow)" />

            {/* visor */}
            <rect x="98" y="68" width="64" height="40" rx="20" fill="url(#visorGrad)" />

            {/* EYES — focus wrapper → blink wrapper */}
            <motion.g animate={{ scaleY: eyeFocus }} transition={{ duration: 0.5, ease: "easeInOut" }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              <motion.g
                animate={complete ? { scaleY: 0.35 } : { scaleY: [1, 1, 0.1, 1, 1] }}
                transition={complete ? { duration: 0.4 } : { duration: 4.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.92, 0.95, 0.98, 1] }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                {complete ? (
                  <>
                    {/* happy curved eyes */}
                    <path d="M112 90 q8 -9 16 0" fill="none" stroke="url(#eyeGrad)" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M134 90 q8 -9 16 0" fill="none" stroke="url(#eyeGrad)" strokeWidth="4.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <rect x="115" y="80" width="11" height="17" rx="5.5" fill="url(#eyeGrad)" style={{ filter: `drop-shadow(0 0 5px ${MINT})` }} />
                    <rect x="137" y="80" width="11" height="17" rx="5.5" fill="url(#eyeGrad)" style={{ filter: `drop-shadow(0 0 5px ${MINT})` }} />
                    {/* gleam */}
                    <circle cx="118" cy="84" r="2" fill="#ffffff" opacity="0.85" />
                    <circle cx="140" cy="84" r="2" fill="#ffffff" opacity="0.85" />
                  </>
                )}
              </motion.g>
            </motion.g>

            {/* mouth */}
            {complete ? (
              <path d="M116 120 q14 14 28 0" fill="none" stroke="#0a8f6e" strokeWidth="3" strokeLinecap="round" />
            ) : (
              <motion.path
                d="M120 122 q10 6 20 0"
                fill="none" stroke="#0a8f6e" strokeOpacity="0.7" strokeWidth="2.6" strokeLinecap="round"
                animate={{ d: ["M120 122 q10 6 20 0", "M120 123 q10 4 20 0", "M120 122 q10 6 20 0"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.g>
        </motion.g>
      </motion.g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AIAvatarExperience({ duration = 15000, isApiFinished = false, onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pose, setPose] = useState("rest");
  const completeFired = useRef(false);
  const stepDuration = duration / STAGES.length;

  // Stage progression — hold on the final stage until the API finishes
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => {
        if (prev === STAGES.length - 1) {
          if (isApiFinished) {
            clearInterval(timer);
            setIsCompleted(true);
          }
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);
    return () => clearInterval(timer);
  }, [stepDuration, isApiFinished, isCompleted]);

  // If we're parked on the last stage and the API just finished
  useEffect(() => {
    if (activeStep === STAGES.length - 1 && isApiFinished && !isCompleted) {
      const t = setTimeout(() => setIsCompleted(true), 700);
      return () => clearTimeout(t);
    }
  }, [activeStep, isApiFinished, isCompleted]);

  // Fire onComplete after the success animation
  useEffect(() => {
    if (isCompleted && onComplete && !completeFired.current) {
      const t = setTimeout(() => {
        completeFired.current = true;
        onComplete();
      }, 1900);
      return () => clearTimeout(t);
    }
  }, [isCompleted, onComplete]);

  // Posture / gesture state machine — natural variety
  useEffect(() => {
    if (isCompleted) return;
    const seq = ["rest", "think", "think", "rest", "gesture", "rest"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % seq.length;
      setPose(seq[i]);
    }, 3300);
    return () => clearInterval(id);
  }, [isCompleted]);

  const stage = STAGES[activeStep];

  return (
    <div className="w-full flex items-center justify-center p-4 min-h-[520px]">
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="avatar-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 30px 80px -30px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            {/* ambient corner glows */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none" style={{ background: `${EMERALD}1f`, filter: "blur(90px)" }} />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full pointer-events-none" style={{ background: `${CYAN}1a`, filter: "blur(90px)" }} />

            <div className="relative px-6 pt-10 pb-8 md:px-10 flex flex-col items-center">
              {/* live badge */}
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1">
                <motion.span
                  className="w-2 h-2 rounded-full bg-brand-400"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-brand-300">
                  AgentX · Analysing
                </span>
              </div>

              {/* ── AVATAR STAGE with all thinking effects ── */}
              <div className="relative w-[320px] h-[320px] md:w-[360px] md:h-[360px] flex items-center justify-center">
                <GlowPulses />
                <HoloRings />
                <NeuralNet />
                <DataStreams />
                <OrbitParticles />
                <Brainwave />
                <ThoughtBursts />
                <ThinkingAvatar pose={pose} />
              </div>

              {/* ── Dynamic status messages ── */}
              <div className="w-full max-w-sm text-center mt-2">
                <span className="text-[11px] font-mono font-bold tracking-[0.22em] uppercase text-brand-400">
                  Step {activeStep + 1} of {STAGES.length}
                </span>

                <div className="h-[68px] mt-2 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                    >
                      <h3 className="text-2xl font-bold text-white tracking-tight">{stage.title}</h3>
                      <p className="text-sm text-white/50 mt-1">{stage.sub}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* progress bar */}
                <div className="mt-4">
                  <div className="relative h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${EMERALD}, ${CYAN})`, boxShadow: `0 0 12px ${EMERALD}99` }}
                      animate={{ width: `${stage.progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    {/* travelling shimmer */}
                    <motion.div
                      className="absolute top-0 h-full w-1/3"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
                      animate={{ x: ["-120%", "320%"] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[11px] font-mono text-white/40">
                    <span>PROGRESS</span>
                    <span className="font-bold text-brand-400">{stage.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── COMPLETION ── */
          <motion.div
            key="avatar-complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-2xl overflow-hidden px-8 py-10 flex flex-col items-center text-center"
            style={{ boxShadow: "0 30px 80px -30px rgba(16,185,129,0.4)" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 40%, ${EMERALD}1f, transparent 70%)` }} />
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 13 }}>
              <ThinkingAvatar complete />
            </motion.div>

            <div className="relative w-16 h-16 -mt-2 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-brand-500/30"
                animate={{ scale: [0.85, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="w-14 h-14 rounded-full bg-brand-500/10 border-2 border-brand-500 flex items-center justify-center text-brand-400"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
              >
                <Check size={26} strokeWidth={3} />
              </motion.div>
            </div>

            <div className="relative mt-4 space-y-1.5">
              <h2 className="text-2xl font-black gradient-text">Analysis Complete</h2>
              <p className="text-sm text-white/60">Your intelligent report is ready.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
