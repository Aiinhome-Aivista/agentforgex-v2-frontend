import { motion } from "framer-motion";
import { ROBOT_POSES } from "./processingStages";

/**
 * DoodleRobot — Modular SVG "Doodle Robot" character.
 *
 * Built entirely from raw SVG paths with separate <motion.g> groups for:
 *   Head, LeftEye, RightEye, LeftArm, RightArm, Body
 *
 * Each body part animates based on the current processing stage via
 * framer-motion `animate` props driven by ROBOT_POSES[stageIndex].
 *
 * @param {{ stageIndex: number }} props
 */
export default function DoodleRobot({ stageIndex = 0 }) {
  const pose = ROBOT_POSES[stageIndex] || ROBOT_POSES[0];

  // Shared transition for smooth, organic feel
  const smoothTransition = {
    duration: 1.2,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  };

  const onceTransition = {
    duration: 0.8,
    ease: [0.22, 1, 0.36, 1],
  };

  // Eyes use faster transition for scanning / blinking
  const eyeTransition = {
    duration: stageIndex === 4 ? 0.4 : stageIndex === 1 ? 1.0 : 1.2,
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "mirror",
  };

  // Determine if eyes should "glow" (stages 7, 8)
  const eyeGlow = stageIndex === 7 || stageIndex === 8;
  // Body glow for stage 4 (embeddings)
  const bodyGlow = stageIndex === 4;

  return (
    <svg
      viewBox="0 0 200 260"
      width="200"
      height="260"
      fill="none"
      className="select-none"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Robot body gradient */}
        <linearGradient id="robotBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        {/* Head gradient */}
        <linearGradient id="robotHeadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        {/* Eye glow */}
        <radialGradient id="eyeGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="80%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
        {/* Bright eye glow for reasoning stage */}
        <radialGradient id="eyeBrightGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#34d399" />
        </radialGradient>
        {/* Body glow filter */}
        <filter id="bodyGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Antenna glow */}
        <filter id="antennaGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── BODY GROUP ── */}
      <motion.g
        animate={pose.body}
        transition={
          Array.isArray(pose.body.y) || Array.isArray(pose.body.scale)
            ? smoothTransition
            : onceTransition
        }
        style={{ transformOrigin: "100px 170px" }}
      >
        {/* Main torso — rounded rectangle */}
        <rect
          x="62"
          y="120"
          width="76"
          height="90"
          rx="16"
          ry="16"
          fill="url(#robotBodyGrad)"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />
        {/* Body glow overlay for stage 4 */}
        {bodyGlow && (
          <motion.rect
            x="62"
            y="120"
            width="76"
            height="90"
            rx="16"
            ry="16"
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="2"
            filter="url(#bodyGlowFilter)"
            animate={{ strokeOpacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {/* Circuit-board decoration lines */}
        <path
          d="M78 140 L78 155 L90 155"
          stroke="#34d399"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />
        <path
          d="M122 140 L122 150 L112 150 L112 160"
          stroke="#34d399"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />
        {/* Chest indicator light */}
        <motion.circle
          cx="100"
          cy="148"
          r="4"
          fill="#10b981"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="100" cy="148" r="2" fill="#6ee7b7" />
        {/* Belly panel */}
        <rect
          x="82"
          y="165"
          width="36"
          height="20"
          rx="4"
          fill="#0f172a"
          stroke="#34d399"
          strokeWidth="0.8"
          strokeOpacity="0.3"
        />
        {/* Belly panel lines */}
        <line x1="88" y1="170" x2="112" y2="170" stroke="#34d399" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="88" y1="175" x2="106" y2="175" stroke="#34d399" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="88" y1="180" x2="108" y2="180" stroke="#34d399" strokeWidth="0.5" strokeOpacity="0.2" />

        {/* Legs — small stubby legs */}
        <rect x="76" y="208" width="16" height="22" rx="8" fill="url(#robotBodyGrad)" stroke="#34d399" strokeWidth="1" strokeOpacity="0.4" />
        <rect x="108" y="208" width="16" height="22" rx="8" fill="url(#robotBodyGrad)" stroke="#34d399" strokeWidth="1" strokeOpacity="0.4" />
        {/* Feet */}
        <rect x="72" y="225" width="24" height="10" rx="5" fill="#1e293b" stroke="#34d399" strokeWidth="1" strokeOpacity="0.3" />
        <rect x="104" y="225" width="24" height="10" rx="5" fill="#1e293b" stroke="#34d399" strokeWidth="1" strokeOpacity="0.3" />
      </motion.g>

      {/* ── LEFT ARM GROUP ── */}
      <motion.g
        animate={pose.leftArm}
        transition={
          Array.isArray(pose.leftArm.y) ? smoothTransition : onceTransition
        }
        style={{ transformOrigin: "62px 135px" }}
      >
        {/* Upper arm */}
        <path
          d="M62 132 L38 148 L34 144"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.7"
          fill="none"
        />
        {/* Forearm */}
        <path
          d="M38 148 L28 170"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
          fill="none"
        />
        {/* Pincer hand */}
        <path
          d="M28 170 L22 178 M28 170 L32 179"
          stroke="#6ee7b7"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Shoulder joint */}
        <circle cx="62" cy="132" r="5" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />
      </motion.g>

      {/* ── RIGHT ARM GROUP ── */}
      <motion.g
        animate={pose.rightArm}
        transition={
          Array.isArray(pose.rightArm.y) ? smoothTransition : onceTransition
        }
        style={{ transformOrigin: "138px 135px" }}
      >
        {/* Upper arm */}
        <path
          d="M138 132 L162 148 L166 144"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.7"
          fill="none"
        />
        {/* Forearm */}
        <path
          d="M162 148 L172 170"
          stroke="#34d399"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
          fill="none"
        />
        {/* Pincer hand */}
        <path
          d="M172 170 L168 179 M172 170 L178 178"
          stroke="#6ee7b7"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Shoulder joint */}
        <circle cx="138" cy="132" r="5" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />
      </motion.g>

      {/* ── HEAD GROUP ── */}
      <motion.g
        animate={pose.head}
        transition={
          Array.isArray(pose.head.rotate) || Array.isArray(pose.head.y)
            ? smoothTransition
            : onceTransition
        }
        style={{ transformOrigin: "100px 80px" }}
      >
        {/* Antenna */}
        <line
          x1="100"
          y1="42"
          x2="100"
          y2="24"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <motion.circle
          cx="100"
          cy="20"
          r="5"
          fill="#10b981"
          filter="url(#antennaGlow)"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "100px 20px" }}
        />

        {/* Neck */}
        <rect x="92" y="106" width="16" height="16" rx="4" fill="#1e293b" stroke="#34d399" strokeWidth="1" strokeOpacity="0.3" />

        {/* Head — rounded square */}
        <rect
          x="64"
          y="38"
          width="72"
          height="68"
          rx="18"
          ry="18"
          fill="url(#robotHeadGrad)"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />

        {/* Visor / face plate */}
        <rect
          x="74"
          y="54"
          width="52"
          height="32"
          rx="10"
          fill="#0f172a"
          stroke="#34d399"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* ── LEFT EYE ── */}
        <motion.g
          animate={pose.leftEye}
          transition={eyeTransition}
          style={{ transformOrigin: "88px 70px" }}
        >
          {/* Eye socket */}
          <circle cx="88" cy="70" r="8" fill="#0f172a" />
          {/* Pupil */}
          <motion.circle
            cx="88"
            cy="70"
            r="5"
            fill={eyeGlow ? "url(#eyeBrightGrad)" : "url(#eyeGlowGrad)"}
            animate={
              eyeGlow
                ? { filter: ["drop-shadow(0 0 4px #6ee7b7)", "drop-shadow(0 0 10px #6ee7b7)", "drop-shadow(0 0 4px #6ee7b7)"] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Specular highlight */}
          <circle cx="86" cy="67" r="1.5" fill="white" opacity="0.7" />
        </motion.g>

        {/* ── RIGHT EYE ── */}
        <motion.g
          animate={pose.rightEye}
          transition={eyeTransition}
          style={{ transformOrigin: "112px 70px" }}
        >
          {/* Eye socket */}
          <circle cx="112" cy="70" r="8" fill="#0f172a" />
          {/* Pupil */}
          <motion.circle
            cx="112"
            cy="70"
            r="5"
            fill={eyeGlow ? "url(#eyeBrightGrad)" : "url(#eyeGlowGrad)"}
            animate={
              eyeGlow
                ? { filter: ["drop-shadow(0 0 4px #6ee7b7)", "drop-shadow(0 0 10px #6ee7b7)", "drop-shadow(0 0 4px #6ee7b7)"] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Specular highlight */}
          <circle cx="110" cy="67" r="1.5" fill="white" opacity="0.7" />
        </motion.g>

        {/* Mouth — small line that can express emotion */}
        <motion.path
          d={
            stageIndex === 8
              ? "M90 88 Q100 96 110 88"  // smile for celebration
              : stageIndex === 7
                ? "M88 88 L112 88"        // focused line for reasoning
                : "M92 88 Q100 93 108 88" // slight smile default
          }
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.6"
        />

        {/* Ear bolts */}
        <circle cx="66" cy="72" r="3" fill="#1e293b" stroke="#34d399" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="134" cy="72" r="3" fill="#1e293b" stroke="#34d399" strokeWidth="1" strokeOpacity="0.4" />
      </motion.g>
    </svg>
  );
}
