import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSearch,
  Cpu,
  Lightbulb,
  Workflow,
  Layers,
  FileText,
} from "lucide-react";
import FileUploader from "../components/upload/FileUploader";
import AIProcessingLoader from "../components/analysis/AIProcessingLoader";
import SMEChatPanel from "../components/analysis/SMEChatPanel";
import { analyzeFiles, ingestBaseGraph, finalizeSme } from "../services/api";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Deep Analysis",
    desc: "Extract steps from complex documents",
    color: "text-brand-500 bg-brand-500/10",
  },
  {
    icon: Lightbulb,
    title: "Agentic Suggestions",
    desc: "AI-driven automation opportunities",
    color: "text-yellow-500 bg-yellow-500/10",
  },
  {
    icon: Workflow,
    title: "Agentic Operating Model",
    desc: "Future State Human + AI workflow",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Layers,
    title: "Deployment Architecture",
    desc: "Deployment modules for execution",
    color: "text-purple-500 bg-purple-500/10",
  },
];

const INGEST_WORDS = [
  "Analyzing",
  "Processing data",
  "Evaluating information",
  "Generating insights",
  "Synthesizing information",
  "Computing results",
];
const FINAL_WORDS = [
  "Synthesizing information",
  "Reconciling SME context",
  "Mapping the process",
  "Scoring automation",
  "Generating insights",
  "Finalizing analysis",
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// phase: 'idle' | 'thinking' | 'chat' | 'finalizing'
export default function HomePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [baseGraph, setBaseGraph] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const [isIngestFinished, setIsIngestFinished] = useState(false);
  const [isFinalizingFinished, setIsFinalizingFinished] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);

  // Captured at analyze time so chat + final analysis use the same inputs.
  const filesRef = useRef([]);
  const userTextRef = useRef("");
  const phaseRef = useRef(null);
  const loaderTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
      }
    };
  }, []);

  const reset = () => {
    setPhase("idle");
    setError("");
    setBaseGraph(null);
    setSessionId(null);
    setIsIngesting(false);
    if (loaderTimerRef.current) {
      clearTimeout(loaderTimerRef.current);
      loaderTimerRef.current = null;
    }
    filesRef.current = [];
    userTextRef.current = "";
    setResetKey((prev) => prev + 1);
  };

  // Fallback: original single-shot behaviour (no SME loop).
  const runDirectAnalyze = async (files, userText) => {
    const result = await analyzeFiles(files, userText);
    if (result.session_id)
      localStorage.setItem("session_id", result.session_id);
    navigate(`/analysis/${result.process.id}`, { state: { result } });
  };

  // Step 1+2: thinking → build base graph → SME chat
  const handleAnalyze = async (files, userText = "") => {
    setError("");
    filesRef.current = files;
    userTextRef.current = userText;
    setIsIngestFinished(false);
    setIsIngesting(true);

    let apiCompleted = false;
    let loaderShown = false;

    if (loaderTimerRef.current) {
      clearTimeout(loaderTimerRef.current);
    }

    loaderTimerRef.current = setTimeout(() => {
      if (!apiCompleted) {
        loaderShown = true;
        setPhase("thinking");
      }
    }, 800);

    try {
      const res = await ingestBaseGraph(files, userText);
      apiCompleted = true;
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
      setSessionId(res?.session_id || null);
      setBaseGraph(res || null);
      setIsIngestFinished(true);
      setIsIngesting(false);

      if (!loaderShown) {
        setPhase("chat");
      }
    } catch (err) {
      // New backend not reachable → fall back to the classic direct analysis.
      try {
        const result = await analyzeFiles(files, userText);
        apiCompleted = true;
        if (loaderTimerRef.current) {
          clearTimeout(loaderTimerRef.current);
          loaderTimerRef.current = null;
        }
        setIsIngesting(false);

        if (result.session_id)
          localStorage.setItem("session_id", result.session_id);
        navigate(`/analysis/${result.process.id}`, { state: { result } });
      } catch (e2) {
        apiCompleted = true;
        if (loaderTimerRef.current) {
          clearTimeout(loaderTimerRef.current);
          loaderTimerRef.current = null;
        }
        setIsIngesting(false);
        setError(e2.message || "Analysis failed. Please try again.");
        setPhase("idle");
      }
    }
  };

  // Step 3-6: enrich graph from chat → final analysis → process page
  const handleConfirmAnalyze = async (transcript) => {
    setIsFinalizingFinished(false);
    setPhase("finalizing");
    try {
      if (sessionId) {
        try {
          await finalizeSme(sessionId, transcript);
        } catch {
          /* best effort */
        }
      }
      const result = await analyzeFiles(filesRef.current, userTextRef.current, {
        sessionId,
        smeContext: transcript,
      });
      if (result.session_id)
        localStorage.setItem("session_id", result.session_id);
      setFinalResult(result);
      setIsFinalizingFinished(true);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
      setPhase("chat");
    }
  };

  useEffect(() => {
    if (phase !== "idle") {
      setTimeout(() => {
        phaseRef.current?.scrollIntoView({
          behavior: "smooth",
          block: phase === "chat" ? "start" : "center",
        });
      }, 150);
    }
  }, [phase]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-white tracking-tight leading-tight">
          Let's <span className="gradient-text">Agentify</span> Your{" "}
          <span className="text-white">Process</span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
          Upload your process documentation or ERP data dumps. Our AI will map
          your workflows and suggest agentic automations to boost productivity.
        </p>
      </div>

      {/* Uploader section */}
      <div ref={phase === "thinking" || phase === "finalizing" ? phaseRef : null}>
        {phase === "thinking" ? (
          <AIProcessingLoader
            duration={15000}
            isApiFinished={isIngestFinished}
            onComplete={() => setPhase("chat")}
          />
        ) : phase === "finalizing" ? (
          <AIProcessingLoader
            duration={15000}
            isApiFinished={isFinalizingFinished}
            onComplete={() => {
              if (finalResult) {
                navigate(`/analysis/${finalResult.process.id}`, { state: { result: finalResult } });
              }
            }}
          />
        ) : (
          <FileUploader
            key={resetKey}
            onAnalyze={handleAnalyze}
            loading={isIngesting}
            disabled={phase !== "idle" || isIngesting}
          />
        )}
      </div>

      {/* Inline SME Chat Panel (only chat phase since loader is inside FileUploader) */}
      {phase === "chat" && (
        <div
          ref={phaseRef}
          className="space-y-6 pt-6 border-t border-white/5 scroll-mt-6"
        >
          <SMEChatPanel
            sessionId={sessionId}
            baseGraph={baseGraph}
            onConfirmAnalyze={handleConfirmAnalyze}
            onCancel={reset}
          />
        </div>
      )}

      {error && (
        <div className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {FEATURES.map(({ icon: Icon, title, desc, color }) => (
          <div
            key={title}
            className="card p-5 space-y-3 hover:bg-white/10 transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
            >
              <Icon size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white/90 text-sm">{title}</h3>
              <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
