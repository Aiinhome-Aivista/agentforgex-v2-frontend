import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import DoodleRobot from "./DoodleRobot";
import StageEnvironment from "./StageEnvironment";
import AIThinkingPhase from "./AIThinkingPhase";
import { STAGES, THINKING_MESSAGES } from "./processingStages";

const API_WAITING_MESSAGES = [
  "Connecting final nodes and generating insights...",
  "Formatting rich-text analysis modules...",
  "Synthesizing future state operating model...",
  "Scoring automation opportunities...",
  "Assembling final presentation layers...",
  "Securing pipelines and finalizing results...",
];

/**
 * AIProcessingLoader — Premium AI processing visualization.
 *
 * Displays a Doodle Robot character that physically reacts to 9 processing
 * stages, surrounded by stage-specific environment animations, a progress bar,
 * rotating thinking messages, and a timeline checklist.
 *
 * Public API (unchanged):
 * @param {number}   duration       — Total animation duration in ms (default: 15000)
 * @param {boolean}  isApiFinished  — Set true when backend work completes
 * @param {function} onComplete     — Callback fired after completion animation
 */
export default function AIProcessingLoader({
  duration = 15000,
  isApiFinished = false,
  onComplete,
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const stepDuration = duration / STAGES.length;

  // Ref to track if we've already fired onComplete to avoid duplicates
  const completeFired = useRef(false);
  const containerRef = useRef(null);
  const isWaitingForApi = activeStep === STAGES.length - 1 && !isApiFinished;

  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // ─── Step progression ──────────────────────────────────────────────────
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

  // ─── Watch for API finish at last step ─────────────────────────────────
  useEffect(() => {
    if (activeStep === STAGES.length - 1 && isApiFinished && !isCompleted) {
      const delayTimer = setTimeout(() => {
        setIsCompleted(true);
      }, 800);
      return () => clearTimeout(delayTimer);
    }
  }, [activeStep, isApiFinished, isCompleted]);

  // ─── Trigger onComplete after success animation ────────────────────────
  useEffect(() => {
    if (isCompleted && onComplete && !completeFired.current) {
      const timer = setTimeout(() => {
        completeFired.current = true;
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, onComplete]);

  // ─── Rotate thinking messages every 2 seconds ─────────────────────────
  useEffect(() => {
    const messages = isWaitingForApi
      ? API_WAITING_MESSAGES
      : THINKING_MESSAGES[activeStep] || [];
    if (messages.length <= 1) return;

    setThinkingIdx(0);
    const timer = setInterval(() => {
      setThinkingIdx((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [activeStep, isWaitingForApi]);

  const currentThinkingMessage = useCallback(() => {
    const messages = isWaitingForApi
      ? API_WAITING_MESSAGES
      : THINKING_MESSAGES[activeStep] || [];
    return messages[thinkingIdx % messages.length] || "";
  }, [activeStep, isWaitingForApi, thinkingIdx]);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center p-4 min-h-[500px]">
      <AnimatePresence mode="wait">
        {!isCompleted ? (
          isWaitingForApi ? (
            <motion.div
              key="synthesis-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-4xl bg-brand-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
            >
              {/* Ambient background glows */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-brand-500/10 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none" />

              <AIThinkingPhase
                title="Finalizing Synthesis"
                subtitle="We are compiling your final report. This may take a few seconds..."
                words={[
                  "Connecting final nodes",
                  "Synthesizing insights",
                  "Scoring automation targets",
                  "Securing data channels",
                  "Assembling final report",
                ]}
              />
            </motion.div>
          ) : (
            <motion.div
              key="loader-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-4xl bg-brand-surface/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center"
            >
              {/* Ambient background glows */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-brand-500/10 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 blur-[100px] pointer-events-none" />

              {/* ══════════════════════════════════════════════════════════════
                  LEFT COLUMN — Robot + Environment + Stage Info
                 ══════════════════════════════════════════════════════════════ */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center space-y-6">
                {/* Robot Arena — Environment wraps the robot */}
                <div className="relative w-[260px] h-[280px] flex items-center justify-center">
                  {/* Soft radial glow behind robot */}
                  <div className="absolute w-[180px] h-[180px] rounded-full bg-brand-500/5 blur-xl animate-pulse" />

                  {/* Stage environment scene */}
                  <StageEnvironment stageIndex={isWaitingForApi ? 7 : activeStep} />

                  {/* Doodle Robot — positioned centrally */}
                  <div className="relative z-10">
                    <DoodleRobot stageIndex={isWaitingForApi ? 7 : activeStep} />
                  </div>
                </div>

                {/* ── Stage Info Box ── */}
                <div className="w-full text-center space-y-2 px-4">
                  <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-brand-400">
                    {isWaitingForApi ? "Final Phase" : `Step ${activeStep + 1} of ${STAGES.length}`}
                  </span>

                  {/* Title + Description with transition */}
                  <div className="h-16 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isWaitingForApi ? "waiting" : activeStep}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-1"
                      >
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                          {isWaitingForApi ? (
                            <>
                              <Loader2 className="animate-spin text-brand-400 shrink-0" size={18} />
                              <span>Finalizing Synthesis</span>
                            </>
                          ) : (
                            STAGES[activeStep].title
                          )}
                        </h3>
                        <p className="text-sm text-white/50">
                          {isWaitingForApi ? (
                            "We are compiling your final report. This may take a few seconds..."
                          ) : (
                            STAGES[activeStep].desc
                          )}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mt-4 max-w-xs mx-auto">
                    <div className="w-full h-1.5 rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        animate={
                          isWaitingForApi
                            ? { width: ["95%", "99%", "95%"] }
                            : { width: `${STAGES[activeStep].progress}%` }
                        }
                        transition={
                          isWaitingForApi
                            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            : { duration: 0.5, ease: "easeOut" }
                        }
                        style={{ boxShadow: "0 0 10px rgba(16, 185, 129, 0.4)" }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono text-white/40">
                      <span>STATUS</span>
                      <span className="font-bold text-brand-400">
                        {isWaitingForApi ? "FINALIZING..." : `${STAGES[activeStep].progress}%`}
                      </span>
                    </div>
                  </div>

                  {/* Rotating Thinking Messages */}
                  <div className="h-6 mt-3 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={`${activeStep}-${thinkingIdx}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="text-xs text-white/30 font-mono italic"
                      >
                        {currentThinkingMessage()}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  RIGHT COLUMN — Timeline Checklist
                 ══════════════════════════════════════════════════════════════ */}
              <div className="w-full md:w-1/2 flex flex-col justify-center pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0">
                <div className="relative space-y-5">
                  {/* Vertical connecting line */}
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-white/5" />
                  <motion.div
                    className="absolute left-[13px] top-2 w-0.5 bg-gradient-to-b from-brand-500 to-cyan-400 origin-top"
                    animate={{
                      height: `${(activeStep / (STAGES.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{ maxHeight: "calc(100% - 16px)" }}
                  />

                  {/* Steps Timeline items */}
                  {STAGES.map((step, idx) => {
                    const isCompletedStep = idx < activeStep;
                    const isActiveStep = idx === activeStep;

                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-4 transition-all duration-300 ${
                          isActiveStep
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
                            className={`text-sm font-semibold tracking-tight transition-colors duration-200 ${
                              isActiveStep
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
          )
        ) : (
          /* ══════════════════════════════════════════════════════════════
             COMPLETION CARD
             ══════════════════════════════════════════════════════════════ */
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

            {/* Celebrating robot */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
            >
              <DoodleRobot stageIndex={8} />
            </motion.div>

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
