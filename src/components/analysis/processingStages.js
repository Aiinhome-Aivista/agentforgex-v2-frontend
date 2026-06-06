/**
 * Processing Stages Configuration
 * Defines the 9 AI processing stages, robot animation poses, and thinking messages.
 */

// ─── Thinking Messages (rotated every 2s within each stage) ─────────────────
export const THINKING_MESSAGES = [
  // Stage 0 — Uploading
  [
    "Receiving document uploads...",
    "Validating file formats...",
    "Buffering document data...",
    "Preparing transfer pipeline...",
  ],
  // Stage 1 — Pre-processing
  [
    "Scanning document structure...",
    "Extracting text layers...",
    "Cleaning formatting artifacts...",
    "Normalizing content encoding...",
  ],
  // Stage 2 — Understanding
  [
    "Analyzing semantic meaning...",
    "Identifying key concepts...",
    "Mapping contextual relationships...",
    "Parsing domain terminology...",
  ],
  // Stage 3 — Knowledge Graph
  [
    "Discovering entity connections...",
    "Building relationship maps...",
    "Linking cross-references...",
    "Structuring knowledge nodes...",
  ],
  // Stage 4 — Embeddings
  [
    "Converting text to vectors...",
    "Computing semantic embeddings...",
    "Encoding knowledge dimensions...",
    "Optimizing vector space...",
  ],
  // Stage 5 — Storing
  [
    "Indexing processed data...",
    "Optimizing retrieval paths...",
    "Building search indices...",
    "Compressing storage layers...",
  ],
  // Stage 6 — Workflows
  [
    "Detecting process patterns...",
    "Mapping workflow sequences...",
    "Identifying automation triggers...",
    "Analyzing decision points...",
  ],
  // Stage 7 — Reasoning
  [
    "Cross-referencing insights...",
    "Evaluating logical patterns...",
    "Synthesizing conclusions...",
    "Connecting deep relationships...",
  ],
  // Stage 8 — Results
  [
    "Formatting final report...",
    "Generating recommendations...",
    "Polishing output summary...",
    "Finalizing analysis results...",
  ],
];

// ─── Robot Pose Presets ─────────────────────────────────────────────────────
// Each pose defines framer-motion `animate` targets for body parts.
// The DoodleRobot component reads these and applies them to <motion.g> groups.

export const ROBOT_POSES = [
  // Stage 0 — Uploading: Arms raise up to catch documents
  {
    body: { y: 0, scale: 1 },
    head: { rotate: 0, y: 0, scale: 1 },
    leftEye: { x: 0, scaleY: 1 },
    rightEye: { x: 0, scaleY: 1 },
    leftArm: { rotate: -45, y: -10 },
    rightArm: { rotate: 45, y: -10 },
  },
  // Stage 1 — Pre-processing: Eyes scan left-right
  {
    body: { y: 0, scale: 1 },
    head: { rotate: 0, y: 0, scale: 1 },
    leftEye: { x: [-3, 3, -3], scaleY: 1 },
    rightEye: { x: [-3, 3, -3], scaleY: 1 },
    leftArm: { rotate: 0, y: 0 },
    rightArm: { rotate: 0, y: 0 },
  },
  // Stage 2 — Understanding: Float up/down, head tilts
  {
    body: { y: [-4, 4, -4], scale: 1 },
    head: { rotate: [-5, 5, -5], y: 0, scale: 1 },
    leftEye: { x: 0, scaleY: 1 },
    rightEye: { x: 0, scaleY: 1 },
    leftArm: { rotate: -5, y: 0 },
    rightArm: { rotate: 5, y: 0 },
  },
  // Stage 3 — Knowledge Graph: Right arm extends to "draw"
  {
    body: { y: 0, scale: 1 },
    head: { rotate: 5, y: 0, scale: 1 },
    leftEye: { x: 2, scaleY: 1 },
    rightEye: { x: 2, scaleY: 1 },
    leftArm: { rotate: 0, y: 0 },
    rightArm: { rotate: 60, y: -8 },
  },
  // Stage 4 — Embeddings: Eyes blink rapidly, body pulses
  {
    body: { y: 0, scale: [1, 1.03, 1] },
    head: { rotate: 0, y: 0, scale: 1 },
    leftEye: { x: 0, scaleY: [1, 0.1, 1, 0.1, 1] },
    rightEye: { x: 0, scaleY: [1, 0.1, 1, 0.1, 1] },
    leftArm: { rotate: -8, y: 0 },
    rightArm: { rotate: 8, y: 0 },
  },
  // Stage 5 — Storing: Arms push down
  {
    body: { y: [0, 3, 0], scale: 1 },
    head: { rotate: 0, y: [0, 2, 0], scale: 1 },
    leftEye: { x: 0, scaleY: 1 },
    rightEye: { x: 0, scaleY: 1 },
    leftArm: { rotate: 15, y: [0, 12, 0] },
    rightArm: { rotate: -15, y: [0, 12, 0] },
  },
  // Stage 6 — Workflows: Points at diagram, head nods
  {
    body: { y: 0, scale: 1 },
    head: { rotate: [0, 8, 0, 8, 0], y: 0, scale: 1 },
    leftEye: { x: 2, scaleY: 1 },
    rightEye: { x: 2, scaleY: 1 },
    leftArm: { rotate: 0, y: 0 },
    rightArm: { rotate: 50, y: -4 },
  },
  // Stage 7 — Reasoning: Head scales up, eyes glow, arms float out
  {
    body: { y: 0, scale: 1 },
    head: { rotate: 0, y: -3, scale: 1.1 },
    leftEye: { x: 0, scaleY: 1 },
    rightEye: { x: 0, scaleY: 1 },
    leftArm: { rotate: -30, y: -6 },
    rightArm: { rotate: 30, y: -6 },
  },
  // Stage 8 — Results: Celebration bounce, arms thrown up
  {
    body: { y: [0, -10, 0, -6, 0], scale: [1, 1.05, 1] },
    head: { rotate: [0, -5, 5, 0], y: [0, -6, 0], scale: 1 },
    leftEye: { x: 0, scaleY: 1 },
    rightEye: { x: 0, scaleY: 1 },
    leftArm: { rotate: -60, y: -16 },
    rightArm: { rotate: 60, y: -16 },
  },
];

// ─── Stage Definitions ──────────────────────────────────────────────────────
export const STAGES = [
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
    title: "Understanding Content",
    desc: "Analyzing context and meaning...",
    progress: 35,
  },
  {
    id: 4,
    title: "Building Knowledge Graph",
    desc: "Mapping entities and relationships...",
    progress: 50,
  },
  {
    id: 5,
    title: "Creating AI Embeddings",
    desc: "Converting knowledge into vectors...",
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
