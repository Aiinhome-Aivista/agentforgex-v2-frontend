import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import avatarVideo from "../../assets/now_instead_of_robot_do_this_a.mp4";

const STEPS = [
  {
    id: 1,
    title: "Uploading Files",
    desc: "Preparing your documents...",
    progress: 10,
  },
  {
    id: 2,
    title: "Pre-processing Data",
    desc: "Cleaning and extracting content...",
    progress: 20,
  },

  {
    id: 3,
    title: "Reviewing Information",
    desc: "Organizing and understanding the uploaded content...",
    progress: 35,
  },
  {
    id: 4,
    title: "Identifying Key Processes",
    desc: "Discovering important activities, workflows, and business operations...",
    progress: 50,
  },
  {
    id: 5,
    title: "Creating AI Embeddings",
    desc: "Organizing information to enable smarter decision-making...",
    progress: 65,
  },
  {
    id: 6,
    title: "Storing Intelligence",
    desc: "Indexing data for rapid retrieval...",
    progress: 75,
  },
  {
    id: 7,
    title: "Discovering Workflows",
    desc: "Identifying process steps and actions...",
    progress: 85,
  },
  {
    id: 8,
    title: "AI Reasoning",
    desc: "Connecting insights and patterns...",
    progress: 95,
  },
  {
    id: 9,
    title: "Generating Results",
    desc: "Creating summaries and recommendations...",
    progress: 100,
  },
];

const STAGES = {
  "0.0": { glow: "rgba(16, 185, 129, 0.35)", border: "#10b981", text: "text-emerald-400" },
  "1.8": { glow: "rgba(6, 182, 212, 0.35)", border: "#06b6d4", text: "text-cyan-400" },
  "3.8": { glow: "rgba(245, 158, 11, 0.35)", border: "#f59e0b", text: "text-amber-400" },
  "5.8": { glow: "rgba(139, 92, 246, 0.35)", border: "#8b5cf6", text: "text-violet-400" },
  "7.8": { glow: "rgba(244, 63, 94, 0.35)", border: "#f43f5e", text: "text-pink-400" },
};

const PARTICLES = [
  { id: 1, left: "12%", delay: "0s", size: "4px", speed: "3.5s" },
  { id: 2, left: "28%", delay: "1.2s", size: "5px", speed: "4.5s" },
  { id: 3, left: "42%", delay: "0.6s", size: "3px", speed: "3.0s" },
  { id: 4, left: "58%", delay: "2.0s", size: "6px", speed: "4.0s" },
  { id: 5, left: "72%", delay: "0.9s", size: "4px", speed: "5.0s" },
  { id: 6, left: "88%", delay: "0.3s", size: "5px", speed: "3.6s" },
  { id: 7, left: "22%", delay: "2.5s", size: "3px", speed: "3.8s" },
  { id: 8, left: "78%", delay: "1.5s", size: "4px", speed: "4.2s" },
];

export default function AIProcessingLoader({
  duration = 15000,
  isApiFinished = false,
  onComplete,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const stepDuration = duration / STEPS.length;
  const size = 210;

  const videoRef = useRef(null);

  const range = useMemo(() => {
    switch (activeStep) {
      case 0:
      case 1:
      case 2:
        return [0.0, 1.8]; // Understanding Process
      case 3:
        return [1.8, 3.8]; // Analyzing Workflow
      case 6:
        return [3.8, 5.8]; // Identifying Bottlenecks
      case 4:
      case 5:
      case 7:
        return [5.8, 7.8]; // Building Knowledge Graph
      case 8:
        return [7.8, 9.8]; // Generating Insights
      default:
        return [0.0, 1.8];
    }
  }, [activeStep]);

  const activeStage = useMemo(() => {
    const key = range[0].toFixed(1);
    return STAGES[key] || STAGES["0.0"];
  }, [range]);

  // Sync segment playback on step changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const [start, end] = range;
    const buffer = 0.3;

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
      video.play().catch((err) => console.log("Autoplay warning:", err));
    }

    frameId = requestAnimationFrame(checkTime);
    return () => cancelAnimationFrame(frameId);
  }, [range]);

  // Ref to track if we've already fired onComplete to avoid duplicates
  const completeFired = useRef(false);

  // Step progression effect
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => {
        // If we are at the last step (index 8)
        if (prev === STEPS.length - 1) {
          // If the API call has finished, we can trigger the final complete animation state
          if (isApiFinished) {
            clearInterval(timer);
            setIsCompleted(true);
          }
          // Otherwise, we hold at Step 8 (95% progress state) waiting for isApiFinished
          return prev;
        }
        return prev + 1;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [stepDuration, isApiFinished, isCompleted]);

  // Watch for isApiFinished if we are already at the last step
  useEffect(() => {
    if (activeStep === STEPS.length - 1 && isApiFinished && !isCompleted) {
      const delayTimer = setTimeout(() => {
        setIsCompleted(true);
      }, 800); // Small breathing room to show the last step before success
      return () => clearTimeout(delayTimer);
    }
  }, [activeStep, isApiFinished, isCompleted]);

  // Trigger onComplete after success animation finishes
  useEffect(() => {
    if (isCompleted && onComplete && !completeFired.current) {
      const timer = setTimeout(() => {
        completeFired.current = true;
        onComplete();
      }, 2000); // Duration of the success screen display
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onComplete]);

  return (
    <div className="afx-think w-full flex items-center justify-center p-4 min-h-[500px]">
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
        .animate-float-particle {
          animation: floatUp var(--speed, 4s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
      `}</style>
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="loader-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-4xl bg-brand-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center"
          >
            {/* Absolute gradients for premium feel */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-brand-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none" />

            {/* Left Column: Network Visualization & Core Step Info */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-6">
              {/* Central Knowledge Graph / Avatar Video */}
              <div 
                className="relative w-full transition-all duration-500 ease-in-out rounded-2xl animate-fade-in"
                style={{ maxWidth: '380px', aspectRatio: '16/9' }}
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
                <div className="absolute left-[-18px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-20 flex flex-col items-center justify-between text-[7px] font-mono text-white select-none">
                  <span className="animate-[pulse_1.5s_infinite]">1</span>
                  <span className="animate-[pulse_2s_infinite_0.3s]">0</span>
                  <span className="animate-[pulse_1.2s_infinite_0.6s]">1</span>
                  <span className="animate-[pulse_2.5s_infinite_0.1s]">1</span>
                  <span className="animate-[pulse_1.8s_infinite_0.4s]">0</span>
                </div>
                <div className="absolute right-[-18px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-20 flex flex-col items-center justify-between text-[7px] font-mono text-white select-none">
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

                {/* Video Rectangle Container */}
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

              {/* Step Info Box */}
              <div className="w-full text-center space-y-2 px-4">
                <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-brand-400">
                  Step {activeStep + 1} of {STEPS.length}
                </span>

                <div className="h-16 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-1"
                    >
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {STEPS[activeStep].title}
                      </h3>
                      <p className="text-sm text-white/50">
                        {STEPS[activeStep].desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Progress Bar Container */}
                <div className="space-y-2 mt-4 max-w-xs mx-auto">
                  <div className="w-full h-1.5 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${activeStage.border}, #22d3ee)`,
                        boxShadow: `0 0 10px ${activeStage.border}`,
                      }}
                      animate={{ width: `${STEPS[activeStep].progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono text-white/40">
                    <span>PROGRESS</span>
                    <span className="font-bold text-brand-400">
                      {STEPS[activeStep].progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline Checklist */}
            <div className="w-full md:w-1/2 flex flex-col justify-center pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0">
              <div className="relative space-y-5">
                {/* Vertical connecting line */}
                <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-white/5" />
                <motion.div
                  className="absolute left-[13px] top-2 w-0.5 bg-gradient-to-b from-brand-500 to-cyan-400 origin-top"
                  animate={{
                    height: `${(activeStep / (STEPS.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ maxHeight: "calc(100% - 16px)" }}
                />

                {/* Steps Timeline items */}
                {STEPS.map((step, idx) => {
                  const isCompletedStep = idx < activeStep;
                  const isActiveStep = idx === activeStep;
                  const isUpcomingStep = idx > activeStep;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-4 transition-all duration-300 ${isActiveStep
                        ? "scale-[1.02] translate-x-1"
                        : "opacity-60"
                        }`}
                    >
                      {/* Timeline Dot Indicator */}
                      <div className="relative z-10 flex items-center justify-center w-7 h-7">
                        {isCompletedStep ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                            className="w-5 h-5 rounded-full bg-brand-500 text-black flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          >
                            <Check size={12} className="stroke-[3]" />
                          </motion.div>
                        ) : isActiveStep ? (
                          <div className="relative w-5 h-5 flex items-center justify-center">
                            <motion.div
                              className="absolute w-5 h-5 rounded-full bg-brand-500/25 border border-brand-500"
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{
                                duration: 1.6,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                            />
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                          </div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-brand-dark border-2 border-white/20" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-sm font-semibold tracking-tight transition-colors duration-200 ${isActiveStep
                            ? "text-white"
                            : isCompletedStep
                              ? "text-white/80"
                              : "text-white/30"
                            }`}
                        >
                          {step.title}
                        </h4>
                        {isActiveStep && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="text-xs text-white/50 mt-0.5 line-clamp-1"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full max-w-md bg-brand-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6"
          >
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-radial-gradient from-brand-500/10 to-transparent blur-[80px] pointer-events-none" />

            {/* Checkmark draw animation */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-brand-500/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.3, opacity: [0.6, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="w-16 h-16 rounded-full bg-brand-500/10 border-2 border-brand-500 flex items-center justify-center text-brand-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <svg
                  className="w-8 h-8 stroke-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6L9 17L4 12"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                  />
                </svg>
              </motion.div>
            </div>

            {/* Status texts */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black gradient-text">
                Analysis Complete
              </h2>
              <p className="text-sm text-white/60">
                Your intelligent report is ready.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
