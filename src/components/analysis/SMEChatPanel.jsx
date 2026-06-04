import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Send, Sparkles, CheckCircle2, MessageSquare, Loader2,
  CircleHelp, ArrowRight, Network, X,
} from 'lucide-react'
import clsx from 'clsx'
import { smeChat } from '../../services/api'

/**
 * SMEChatPanel
 * ─────────────────────────────────────────────────────────────────────────
 * Interactive Subject-Matter-Expert chat that sits directly below the upload
 * section after the AI "thinking" phase. The user queries the base graph
 * (what / where / why), then marks the chat complete and confirms whether to
 * run the final analysis.
 *
 * Props:
 *   sessionId        {string}
 *   baseGraph        {object}   payload from /sme/ingest
 *   onConfirmAnalyze {(transcript:string)=>void}
 *   onCancel         {()=>void}   optional — abandon the SME flow
 */
const WH_STARTERS = [
  { k: 'What',  q: 'What are the key entities and what does each represent?' },
  { k: 'Where', q: 'Where does each important field originate in my data?' },
  { k: 'Why',   q: 'Why are these entities related the way they are?' },
  { k: 'How',   q: 'How does the data flow through this process?' },
]

export default function SMEChatPanel({ sessionId, baseGraph, onConfirmAnalyze, onCancel }) {
  const [messages, setMessages] = useState(() => ([
    {
      role: 'bot',
      content:
        baseGraph?.summary?.trim()
          ? `I've mapped a base knowledge graph from your data${baseGraph?.domain ? ` (${baseGraph.domain})` : ''}. ` +
            `${baseGraph.summary} Ask me anything — what an entity means, where a field comes from, or why things connect. ` +
            `Add any business knowledge I should fold into the analysis.`
          : `I've reviewed your data. Ask me what / where / why about it, and tell me any business rules or context I should use in the analysis.`,
    },
  ]))
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState(() => {
    if (baseGraph?.analysis_ready === true && baseGraph?.status === 'knowledge_collection_complete') {
      return 'confirm'
    }
    return 'chat'
  })
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const suggested = useMemo(() => {
    const fromApi = (baseGraph?.suggested_questions || []).filter(Boolean)
    return fromApi.length ? fromApi.slice(0, 6) : WH_STARTERS.map(s => s.q)
  }, [baseGraph])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, stage])

  useEffect(() => {
    if (baseGraph?.analysis_ready === true && baseGraph?.status === 'knowledge_collection_complete') {
      setStage('confirm')
    }
  }, [baseGraph])

  const transcript = useMemo(
    () =>
      messages
        .filter(m => m.role === 'user' || m.role === 'bot')
        .map(m => `${m.role === 'user' ? 'SME' : 'Assistant'}: ${m.content}`)
        .join('\n'),
    [messages]
  )

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    const history = messages
      .filter(m => m.role === 'user' || m.role === 'bot')
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))

    setMessages(m => [...m, { role: 'user', content: q }])
    setBusy(true)
    try {
      const res = await smeChat(sessionId, q, history)
      const answer = res?.answer || 'Noted — I will use that in the analysis.'
      const followup = res?.followup_question
      setMessages(m => [
        ...m,
        { role: 'bot', content: answer, followup: followup || null },
      ])
      if (res?.analysis_ready === true && res?.status === 'knowledge_collection_complete') {
        setStage('confirm')
      }
    } catch (err) {
      setMessages(m => [
        ...m,
        { role: 'bot', content: 'Your note has been captured and will be used in the final analysis.' },
      ])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }

  const userTurns = messages.filter(m => m.role === 'user').length

  return (
    <div className="w-full max-w-7xl mx-auto animate-slide-up">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <Network size={16} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-bold text-white/90 text-sm leading-tight">
                SME Knowledge Chat
              </h3>
              {/* <p className="text-[11px] text-white/40">
                {typeof baseGraph?.node_count === 'number'
                  ? `${baseGraph.node_count} entities · ${baseGraph.edge_count} relationships in base graph`
                  : 'Refine the analysis with your expertise'}
              </p> */}
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white/30 hover:text-white/70 transition-colors"
              title="Cancel"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="px-6 py-5 h-[360px] overflow-y-auto scrollbar-custom space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={clsx('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {m.role === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-brand-400" />
                </div>
              )}
              <div
                className={clsx(
                  'max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-brand-500 text-black font-medium rounded-br-sm'
                    : 'bg-white/[0.06] border border-white/10 text-white/85 rounded-bl-sm'
                )}
              >
                {m.content}
                {m.followup && (
                  <button
                    onClick={() => send(m.followup)}
                    disabled={busy}
                    className="mt-2 flex items-center gap-1.5 text-xs text-brand-300 hover:text-brand-200 transition-colors"
                  >
                    <ArrowRight size={12} /> {m.followup}
                  </button>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0">
                <Sparkles size={13} className="text-brand-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/10">
                <span className="flex gap-1">
                  {[0, 1, 2].map(d => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-brand-400/80 animate-bounce"
                      style={{ animationDelay: `${d * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested questions */}
        {stage === 'chat' && (
          <div className="px-6 pb-4 max-h-[160px] overflow-auto scrollbar-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {suggested.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  disabled={busy}
                  className="flex items-start gap-2.5 text-xs px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 hover:text-brand-300 hover:border-brand-500/30 transition-all disabled:opacity-40 text-left w-full h-auto"
                >
                  <CircleHelp size={14} className="shrink-0 mt-0.5 text-white/40 group-hover:text-brand-400 transition-colors" />
                  <span className="flex-1 leading-normal whitespace-normal break-words">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer / confirm */}
        {stage === 'chat' ? (
          <div className="border-t border-white/10 p-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Ask what / where / why — or add business context…"
                className="flex-1 resize-none bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/40 max-h-32"
              />
              <button
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="h-11 w-11 shrink-0 rounded-xl bg-brand-500 text-black flex items-center justify-center hover:bg-brand-400 transition-colors disabled:bg-brand-500/20 disabled:text-brand-500/50"
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-white/30 flex items-center gap-1.5">
                <MessageSquare size={11} />
                {userTurns === 0
                  ? 'Chat with your data, then mark complete when ready.'
                  : `${userTurns} question${userTurns > 1 ? 's' : ''} asked`}
              </p>
              <button
                onClick={() => setStage('confirm')}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                <CheckCircle2 size={14} /> Mark chat complete
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-white/10 p-6 bg-white/[0.02] animate-fade-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-brand-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Do you want to analyze the data?</h4>
                <p className="text-sm text-white/50 mt-1 max-w-md">
                  Your conversation will be folded into the knowledge graph and used to
                  generate the final process analysis.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setStage('chat')}
                  className="btn-secondary px-6"
                >
                  No, keep chatting
                </button>
                <button
                  onClick={() => onConfirmAnalyze?.(transcript)}
                  className="btn-primary px-8"
                >
                  Yes, analyze <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
