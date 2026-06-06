import { Bot, Sparkles, X, ArrowRight, Database } from 'lucide-react'

/**
 * DAgentWelcome
 * ─────────────────────────────────────────────────────────────────────────
 * Floating invitation card pinned to the right edge of the Analysis page
 * (beside the "Analysis Complete" / "Process Mapping" cards). Invites the
 * user to open the DAgent data-chat panel.
 *
 * Props:
 *   onYes     {()=>void}  open the DAgent chat panel
 *   onNo      {()=>void}  dismiss (a small re-open tab remains)
 */
export default function DAgentWelcome({ onYes, onNo }) {
  return (
    <div
      className="fixed right-5 top-36 z-40 w-[300px] animate-dagent-in"
      role="dialog"
      aria-label="DAgent assistant invitation"
    >
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-brand-500/60 via-white/10 to-cyan-400/40 shadow-2xl shadow-brand-500/10">
        <div className="relative rounded-2xl bg-[#0d0f0e]/95 backdrop-blur-xl px-5 pt-5 pb-4 overflow-hidden">
          {/* ambient glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 w-32 h-32 rounded-full bg-cyan-400/10 blur-3xl" />

          {/* close */}
          <button
            onClick={onNo}
            className="absolute top-3 right-3 text-white/25 hover:text-white/70 transition-colors"
            title="Dismiss"
          >
            <X size={15} />
          </button>

          {/* header */}
          <div className="relative flex items-center gap-3 mb-3">
            <div className="relative w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-brand-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500 border border-black" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 flex items-center gap-1">
                <Sparkles size={10} /> DAgent
              </p>
              <h4 className="text-[15px] font-bold text-white leading-tight">
                Welcome to <span className="gradient-text">DAgent</span>
              </h4>
            </div>
          </div>

          {/* message */}
          <p className="relative text-[13px] text-white/65 leading-relaxed mb-1.5">
            <span className="text-white/90 font-semibold">Speak to your data.</span>{' '}

          </p>
          <p className="relative text-[13px] font-semibold text-white/85 mb-4 flex items-center gap-1.5">
            <Database size={13} className="text-brand-400 shrink-0" />
            Do you want to continue?
          </p>

          {/* actions */}
          <div className="relative flex items-center gap-2.5">
            <button
              onClick={onYes}
              className="flex-1 bg-brand-500 hover:bg-brand-400 text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/25"
            >
              Yes <ArrowRight size={14} />
            </button>
            <button
              onClick={onNo}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl border border-white/10 transition-all duration-200 active:scale-95"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
