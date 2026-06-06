import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Uploading Files', desc: 'Preparing your documents...', progress: 10 },
  { id: 2, title: 'Pre-processing Data', desc: 'Cleaning and extracting content...', progress: 20 },
  { id: 3, title: 'Understanding Content', desc: 'Analyzing context and meaning...', progress: 35 },
  { id: 4, title: 'Building Knowledge Graph', desc: 'Mapping entities and relationships...', progress: 50 },
  { id: 5, title: 'Creating AI Embeddings', desc: 'Converting knowledge into vectors...', progress: 65 },
  { id: 6, title: 'Storing Intelligence', desc: 'Indexing data for rapid retrieval...', progress: 75 },
  { id: 7, title: 'Discovering Workflows', desc: 'Identifying process steps and actions...', progress: 85 },
  { id: 8, title: 'AI Reasoning', desc: 'Connecting insights and patterns...', progress: 95 },
  { id: 9, title: 'Generating Results', desc: 'Creating summaries and recommendations...', progress: 100 },
]

// Custom knowledge graph coordinates inside a 300x300 viewBox
const CORE_NODE = [150, 150]
const SURROUNDING_NODES = [
  [90, 90],   // Node 1
  [210, 90],  // Node 2
  [210, 210], // Node 3
  [90, 210],  // Node 4
  [150, 60],  // Node 5
  [240, 150], // Node 6
  [150, 240], // Node 7
  [60, 150],  // Node 8
]

const LINKS = [
  { from: CORE_NODE, to: SURROUNDING_NODES[0] },
  { from: CORE_NODE, to: SURROUNDING_NODES[1] },
  { from: CORE_NODE, to: SURROUNDING_NODES[2] },
  { from: CORE_NODE, to: SURROUNDING_NODES[3] },
  { from: SURROUNDING_NODES[0], to: SURROUNDING_NODES[4] },
  { from: SURROUNDING_NODES[0], to: SURROUNDING_NODES[7] },
  { from: SURROUNDING_NODES[1], to: SURROUNDING_NODES[4] },
  { from: SURROUNDING_NODES[1], to: SURROUNDING_NODES[5] },
  { from: SURROUNDING_NODES[2], to: SURROUNDING_NODES[5] },
  { from: SURROUNDING_NODES[2], to: SURROUNDING_NODES[6] },
  { from: SURROUNDING_NODES[3], to: SURROUNDING_NODES[6] },
  { from: SURROUNDING_NODES[3], to: SURROUNDING_NODES[7] },
  { from: SURROUNDING_NODES[4], to: SURROUNDING_NODES[5] },
  { from: SURROUNDING_NODES[5], to: SURROUNDING_NODES[6] },
  { from: SURROUNDING_NODES[6], to: SURROUNDING_NODES[7] },
  { from: SURROUNDING_NODES[7], to: SURROUNDING_NODES[4] },
]

export default function AIProcessingLoader({
  duration = 15000,
  isApiFinished = false,
  onComplete,
}) {
  const [activeStep, setActiveStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const stepDuration = duration / STEPS.length
  
  // Ref to track if we've already fired onComplete to avoid duplicates
  const completeFired = useRef(false)

  // Step progression effect
  useEffect(() => {
    if (isCompleted) return

    const timer = setInterval(() => {
      setActiveStep((prev) => {
        // If we are at the last step (index 8)
        if (prev === STEPS.length - 1) {
          // If the API call has finished, we can trigger the final complete animation state
          if (isApiFinished) {
            clearInterval(timer)
            setIsCompleted(true)
          }
          // Otherwise, we hold at Step 8 (95% progress state) waiting for isApiFinished
          return prev
        }
        return prev + 1
      })
    }, stepDuration)

    return () => clearInterval(timer)
  }, [stepDuration, isApiFinished, isCompleted])

  // Watch for isApiFinished if we are already at the last step
  useEffect(() => {
    if (activeStep === STEPS.length - 1 && isApiFinished && !isCompleted) {
      const delayTimer = setTimeout(() => {
        setIsCompleted(true)
      }, 800) // Small breathing room to show the last step before success
      return () => clearTimeout(delayTimer)
    }
  }, [activeStep, isApiFinished, isCompleted])

  // Trigger onComplete after success animation finishes
  useEffect(() => {
    if (isCompleted && onComplete && !completeFired.current) {
      const timer = setTimeout(() => {
        completeFired.current = true
        onComplete()
      }, 2000) // Duration of the success screen display
      return () => clearTimeout(timer)
    }
  }, [isCompleted, onComplete])

  return (
    <div className="w-full flex items-center justify-center p-4 min-h-[500px]">
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          <motion.div
            key="loader-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-4xl bg-brand-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center"
          >
            {/* Absolute gradients for premium feel */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-brand-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none" />

            {/* Left Column: Network Visualization & Core Step Info */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-6">
              {/* Central Knowledge Graph */}
              <div className="relative w-[260px] h-[260px] flex items-center justify-center">
                {/* Glow ring in the background */}
                <div className="absolute w-[200px] h-[200px] rounded-full bg-brand-500/5 blur-xl animate-pulse" />

                <svg className="w-full h-full relative" viewBox="0 0 300 300">
                  <defs>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </radialGradient>
                    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#6ee7b7" />
                      <stop offset="100%" stopColor="#047857" />
                    </radialGradient>
                  </defs>

                  {/* Rotating Group containing graph elements */}
                  <motion.g
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: '150px 150px' }}
                  >
                    {/* Graph Links */}
                    {LINKS.map((link, idx) => (
                      <line
                        key={`link-${idx}`}
                        x1={link.from[0]}
                        y1={link.from[1]}
                        x2={link.to[0]}
                        y2={link.to[1]}
                        className="stroke-white/10"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Traveling Synapse Particles */}
                    {LINKS.map((link, idx) => (
                      <motion.circle
                        key={`particle-${idx}`}
                        r="3"
                        fill="#34d399"
                        style={{ filter: 'drop-shadow(0 0 4px #10b981)' }}
                        animate={{
                          cx: [link.from[0], link.to[0]],
                          cy: [link.from[1], link.to[1]],
                        }}
                        transition={{
                          duration: 2.2 + (idx % 3) * 0.4,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: (idx * 0.15) % 2,
                        }}
                      />
                    ))}

                    {/* Nodes (Surrounding) */}
                    {SURROUNDING_NODES.map((node, idx) => (
                      <g key={`node-grp-${idx}`}>
                        {/* Outer pulse */}
                        <motion.circle
                          cx={node[0]}
                          cy={node[1]}
                          r="7"
                          fill="rgba(16, 185, 129, 0.2)"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: idx * 0.25,
                          }}
                        />
                        {/* Node circle */}
                        <circle
                          cx={node[0]}
                          cy={node[1]}
                          r="4.5"
                          fill="url(#nodeGlow)"
                        />
                      </g>
                    ))}

                    {/* Central Core Node */}
                    <g>
                      {/* Ripple waves */}
                      {[1, 2, 3].map((i) => (
                        <motion.circle
                          key={`ripple-${i}`}
                          cx={CORE_NODE[0]}
                          cy={CORE_NODE[1]}
                          r="12"
                          fill="none"
                          stroke="rgba(16, 185, 129, 0.3)"
                          strokeWidth="1"
                          animate={{ scale: [1, 2.6, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.9,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                      <motion.circle
                        cx={CORE_NODE[0]}
                        cy={CORE_NODE[1]}
                        r="9.5"
                        fill="url(#coreGlow)"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </g>
                  </motion.g>
                </svg>
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
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
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
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                      animate={{ width: `${STEPS[activeStep].progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}
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
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ maxHeight: 'calc(100% - 16px)' }}
                />

                {/* Steps Timeline items */}
                {STEPS.map((step, idx) => {
                  const isCompletedStep = idx < activeStep
                  const isActiveStep = idx === activeStep
                  const isUpcomingStep = idx > activeStep

                  return (
                    <div
                      key={step.id}
                      className={`flex items-start gap-4 transition-all duration-300 ${
                        isActiveStep
                          ? 'scale-[1.02] translate-x-1'
                          : 'opacity-60'
                      }`}
                    >
                      {/* Timeline Dot Indicator */}
                      <div className="relative z-10 flex items-center justify-center w-7 h-7">
                        {isCompletedStep ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="w-5 h-5 rounded-full bg-brand-500 text-black flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          >
                            <Check size={12} className="stroke-[3]" />
                          </motion.div>
                        ) : isActiveStep ? (
                          <div className="relative w-5 h-5 flex items-center justify-center">
                            <motion.div
                              className="absolute w-5 h-5 rounded-full bg-brand-500/25 border border-brand-500"
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
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
                          className={`text-sm font-semibold tracking-tight transition-colors duration-200 ${
                            isActiveStep
                              ? 'text-white'
                              : isCompletedStep
                              ? 'text-white/80'
                              : 'text-white/30'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isActiveStep && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-xs text-white/50 mt-0.5 line-clamp-1"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  )
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
            transition={{ duration: 0.5, ease: 'easeInOut' }}
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
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="w-16 h-16 rounded-full bg-brand-500/10 border-2 border-brand-500 flex items-center justify-center text-brand-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
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
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
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
  )
}
