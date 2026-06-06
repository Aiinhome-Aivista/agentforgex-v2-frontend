import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FolderOpen,
  ScanLine,
  Database,
  GitBranch,
  FileCheck,
  Sparkles,
  Box,
  ArrowRight,
} from "lucide-react";
import { useMemo } from "react";

/**
 * StageEnvironment — Renders the animated environment scene around the robot.
 * Each of the 9 stages has its own unique visual scene.
 *
 * @param {{ stageIndex: number }} props
 */
export default function StageEnvironment({ stageIndex = 0 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {stageIndex === 0 && <UploadScene />}
          {stageIndex === 1 && <PreProcessScene />}
          {stageIndex === 2 && <UnderstandScene />}
          {stageIndex === 3 && <KnowledgeGraphScene />}
          {stageIndex === 4 && <EmbeddingsScene />}
          {stageIndex === 5 && <StoringScene />}
          {stageIndex === 6 && <WorkflowScene />}
          {stageIndex === 7 && <ReasoningScene />}
          {stageIndex === 8 && <ResultsScene />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Scene 0: Uploading — Documents fall into a folder ──────────────────────
function UploadScene() {
  const docs = [
    { x: "20%", delay: 0 },
    { x: "50%", delay: 0.4 },
    { x: "75%", delay: 0.8 },
    { x: "35%", delay: 1.2 },
    { x: "62%", delay: 0.6 },
  ];
  return (
    <>
      {/* Folder at the bottom center */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-emerald-400/60"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <FolderOpen size={36} />
      </motion.div>
      {/* Falling document icons */}
      {docs.map((doc, i) => (
        <motion.div
          key={i}
          className="absolute text-emerald-300/40"
          style={{ left: doc.x }}
          initial={{ y: -30, opacity: 0, rotate: -10 + i * 5 }}
          animate={{
            y: ["-10%", "70%"],
            opacity: [0, 0.7, 0.5, 0],
            rotate: [-10 + i * 5, 5 - i * 3],
          }}
          transition={{
            duration: 2.5,
            delay: doc.delay,
            repeat: Infinity,
            ease: "easeIn",
          }}
        >
          <FileText size={20} />
        </motion.div>
      ))}
    </>
  );
}

// ─── Scene 1: Pre-processing — Laser scan line ─────────────────────────────
function PreProcessScene() {
  return (
    <>
      {/* Document silhouette */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-20 border border-emerald-500/20 rounded-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Text lines */}
        <div className="mt-3 mx-2 space-y-1.5">
          <div className="h-0.5 bg-emerald-500/15 rounded-full w-10" />
          <div className="h-0.5 bg-emerald-500/15 rounded-full w-8" />
          <div className="h-0.5 bg-emerald-500/15 rounded-full w-11" />
          <div className="h-0.5 bg-emerald-500/15 rounded-full w-6" />
          <div className="h-0.5 bg-emerald-500/15 rounded-full w-9" />
        </div>
      </motion.div>
      {/* Scanning laser line */}
      <motion.div
        className="absolute left-[30%] right-[30%] h-0.5 rounded-full"
        style={{
          background: "linear-gradient(90deg, transparent, #34d399, #6ee7b7, #34d399, transparent)",
          boxShadow: "0 0 12px 2px rgba(52, 211, 153, 0.4)",
        }}
        animate={{ top: ["30%", "70%", "30%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Scan icon */}
      <motion.div
        className="absolute top-4 right-4 text-emerald-400/30"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ScanLine size={18} />
      </motion.div>
    </>
  );
}

// ─── Scene 2: Understanding — Floating text labels orbit ────────────────────
function UnderstandScene() {
  const labels = ["Entity", "Context", "Task", "Intent", "Meaning"];
  return (
    <>
      {labels.map((label, i) => {
        const angle = (i / labels.length) * 360;
        const radius = 42;
        return (
          <motion.div
            key={label}
            className="absolute text-[10px] font-mono font-medium text-emerald-300/50 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [
                Math.cos(((angle) * Math.PI) / 180) * radius,
                Math.cos(((angle + 360) * Math.PI) / 180) * radius,
              ],
              y: [
                Math.sin(((angle) * Math.PI) / 180) * radius,
                Math.sin(((angle + 360) * Math.PI) / 180) * radius,
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.2,
            }}
          >
            {label}
          </motion.div>
        );
      })}
    </>
  );
}

// ─── Scene 3: Knowledge Graph — Self-drawing nodes & lines ──────────────────
function KnowledgeGraphScene() {
  const nodes = useMemo(
    () => [
      { x: 20, y: 25 },
      { x: 80, y: 15 },
      { x: 75, y: 65 },
      { x: 15, y: 75 },
      { x: 50, y: 45 },
      { x: 45, y: 80 },
    ],
    []
  );
  const edges = [
    [0, 4], [1, 4], [2, 4], [3, 4], [4, 5], [0, 3], [1, 2], [3, 5],
  ];

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Edges draw themselves */}
      {edges.map(([a, b], i) => (
        <motion.line
          key={`edge-${i}`}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="#34d399"
          strokeWidth="0.4"
          strokeOpacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
        />
      ))}
      {/* Nodes appear */}
      {nodes.map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.x}
          cy={node.y}
          r="2"
          fill="#10b981"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: [0.5, 1, 0.5] }}
          transition={{
            scale: { duration: 0.4, delay: i * 0.1 },
            opacity: { duration: 2, repeat: Infinity, delay: i * 0.3 },
          }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        />
      ))}
      {/* Central node pulses */}
      <motion.circle
        cx={nodes[4].x}
        cy={nodes[4].y}
        r="3"
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="0.5"
        animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: `${nodes[4].x}px ${nodes[4].y}px` }}
      />
    </svg>
  );
}

// ─── Scene 4: Embeddings — Dissolve into glowing dot grid ───────────────────
function EmbeddingsScene() {
  const dots = useMemo(() => {
    const grid = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        grid.push({
          x: 15 + col * 10,
          y: 15 + row * 12,
          delay: (row + col) * 0.06,
        });
      }
    }
    return grid;
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      {dots.map((dot, i) => (
        <motion.circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r="1"
          fill="#6ee7b7"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0.3, 0.8],
            scale: [0, 1, 0.6, 1],
          }}
          transition={{
            duration: 2.5,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
        />
      ))}
    </svg>
  );
}

// ─── Scene 5: Storing — Database cubes stack up ─────────────────────────────
function StoringScene() {
  const cubes = [
    { x: "50%", delay: 0, bottom: 10 },
    { x: "40%", delay: 0.3, bottom: 10 },
    { x: "60%", delay: 0.6, bottom: 10 },
    { x: "50%", delay: 0.9, bottom: 34 },
    { x: "45%", delay: 1.2, bottom: 34 },
  ];
  return (
    <>
      {/* Database icon at base */}
      <motion.div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 text-emerald-400/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Database size={28} />
      </motion.div>
      {/* Falling cubes */}
      {cubes.map((cube, i) => (
        <motion.div
          key={i}
          className="absolute text-emerald-300/40"
          style={{ left: cube.x }}
          initial={{ y: "-20%", opacity: 0 }}
          animate={{
            y: ["-20%", `calc(100% - ${cube.bottom + 40}px)`],
            opacity: [0, 0.7, 0.6],
          }}
          transition={{
            duration: 1.8,
            delay: cube.delay,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeIn",
          }}
        >
          <Box size={16} />
        </motion.div>
      ))}
    </>
  );
}

// ─── Scene 6: Workflows — Diagram slides in ────────────────────────────────
function WorkflowScene() {
  const steps = ["Trigger", "Process", "Decide", "Output"];
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: "0%", opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-1">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            className="flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.15 }}
          >
            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-mono text-emerald-300/60 whitespace-nowrap">
              {step}
            </div>
            {i < steps.length - 1 && (
              <motion.div
                className="text-emerald-400/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.15 }}
              >
                <ArrowRight size={10} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      {/* GitBranch icon */}
      <motion.div
        className="absolute top-4 left-4 text-emerald-400/20"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <GitBranch size={16} />
      </motion.div>
    </motion.div>
  );
}

// ─── Scene 7: Reasoning — Pulsing network background ───────────────────────
function ReasoningScene() {
  const lines = useMemo(() => {
    const l = [];
    for (let i = 0; i < 12; i++) {
      l.push({
        x1: 10 + Math.random() * 80,
        y1: 10 + Math.random() * 80,
        x2: 10 + Math.random() * 80,
        y2: 10 + Math.random() * 80,
        delay: i * 0.15,
      });
    }
    return l;
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      {/* Pulsing network lines */}
      {lines.map((line, i) => (
        <motion.line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#34d399"
          strokeWidth="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.15, 0.5] }}
          transition={{
            duration: 3,
            delay: line.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Glowing dots at intersections */}
      {lines.slice(0, 6).map((line, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={line.x1}
          cy={line.y1}
          r="1.2"
          fill="#6ee7b7"
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
          style={{ transformOrigin: `${line.x1}px ${line.y1}px` }}
        />
      ))}
      {/* Soft full-background pulse */}
      <motion.rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="url(#reasoningPulse)"
        animate={{ opacity: [0, 0.08, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <defs>
        <radialGradient id="reasoningPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ─── Scene 8: Results — Report with sparkles ────────────────────────────────
function ResultsScene() {
  const sparklePositions = [
    { x: "30%", y: "20%", delay: 0, size: 14 },
    { x: "70%", y: "25%", delay: 0.3, size: 12 },
    { x: "25%", y: "70%", delay: 0.6, size: 10 },
    { x: "75%", y: "65%", delay: 0.2, size: 16 },
    { x: "50%", y: "15%", delay: 0.5, size: 11 },
    { x: "40%", y: "80%", delay: 0.8, size: 13 },
  ];

  return (
    <>
      {/* Polished report icon emerges */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400/50"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <FileCheck size={32} />
      </motion.div>

      {/* Success sparkles */}
      {sparklePositions.map((sparkle, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300/60"
          style={{ left: sparkle.x, top: sparkle.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 0.8, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 1.5,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: "easeInOut",
          }}
        >
          <Sparkles size={sparkle.size} />
        </motion.div>
      ))}

      {/* Subtle success ring */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-emerald-400/20"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
