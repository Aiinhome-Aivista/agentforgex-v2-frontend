import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  Bot, Send, Sparkles, X, Loader2, Database,
} from 'lucide-react'
import clsx from 'clsx'
import { smeChat, getSuggestedQuestions } from '../../services/api'

/**
 * DAgentChatPanel
 * ─────────────────────────────────────────────────────────────────────────
 * Right-hand slide-in chat drawer ("DAgent AI Assistant") on the Analysis
 * page. Lets the user query their UPLOADED DATA (grounded in the session's
 * base knowledge graph via /sme/chat).
 *
 * Suggested questions are generated from the uploaded data and shown as
 * horizontally-scrollable pills above the composer, ordered by question
 * philosophy: all "What…" first, then "Where…", then "Why…", then the rest.
 *
 * Props:
 *   open      {boolean}
 *   sessionId {string|null}
 *   onClose   {()=>void}
 */
const WH_ORDER = ['what', 'where', 'why']

const FALLBACK_QUESTIONS = [
  'What are the main entities in my uploaded data and what does each represent?',
  'What key metrics or fields stand out in this dataset?',
  'Where does each important field originate in the source files?',
  'Why are these entities related the way they are?',
]

const whRank = (q) => {
  const first = (q || '').trim().toLowerCase().split(/\s+/)[0]?.replace(/[',.?!:;]+$/, '')
  const idx = WH_ORDER.indexOf(first)
  return idx === -1 ? WH_ORDER.length : idx
}

/** Stable sort: What… → Where… → Why… → everything else. */
const orderByPhilosophy = (questions) =>
  questions
    .map((q, i) => [q, i])
    .sort((a, b) => whRank(a[0]) - whRank(b[0]) || a[1] - b[1])
    .map(([q]) => q)

export default function DAgentChatPanel({ open, sessionId, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        "Hi, I'm DAgent — your data assistant. I'm grounded in the data you uploaded, so ask me anything about it: what an entity means, where a field comes from, or why things connect.",
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [suggested, setSuggested] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const fetchedFor = useRef(null)

  // Fetch data-grounded suggested questions once per session.
  useEffect(() => {
    if (!open || !sessionId || fetchedFor.current === sessionId) return
    fetchedFor.current = sessionId
    setLoadingSuggestions(true)
    getSuggestedQuestions(sessionId)
      .then(res => {
        const qs = (res?.questions || []).filter(Boolean)
        setSuggested(orderByPhilosophy(qs.length ? qs : FALLBACK_QUESTIONS))
      })
      .catch(() => setSuggested(orderByPhilosophy(FALLBACK_QUESTIONS)))
      .finally(() => setLoadingSuggestions(false))
  }, [open, sessionId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('dagent-panel-toggle', { detail: { open } }))
    return () => {
      window.dispatchEvent(new CustomEvent('dagent-panel-toggle', { detail: { open: false } }))
    }
  }, [open])

  const history = useMemo(
    () =>
      messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    [messages]
  )

  const send = useCallback(async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: q }])
    setBusy(true)
    try {
      const res = await smeChat(sessionId, q, history)
      setMessages(m => [
        ...m,
        {
          role: 'bot',
          content: res?.answer || "I couldn't find that in your data — try rephrasing your question.",
        },
      ])
    } catch {
      setMessages(m => [
        ...m,
        { role: 'bot', content: 'Something went wrong reaching your data. Please try again.' },
      ])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }, [input, busy, sessionId, history])



  return (
    <>
      {/* dim backdrop (click to close) */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* drawer */}
      <aside
        className={clsx(
          'fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] flex flex-col',
          'bg-[#0c0e0d]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl shadow-black/60',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!open}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <Bot size={18} className="text-brand-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">
                DAgent AI Assistant
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-400 flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
                </span>
                Active Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors"
            title="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Messages ───────────────────────────────────────────────── */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-custom px-4 py-5 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={clsx('flex gap-2.5', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {m.role === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-brand-500/15 border border-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-brand-400" />
                </div>
              )}
              <div
                className={clsx(
                  'max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-brand-500 text-black font-medium rounded-br-sm'
                    : 'bg-white/[0.06] border border-white/10 text-white/85 rounded-bl-sm'
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex gap-2.5 justify-start">
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

        {/* ── Suggested questions (What → Where → Why) ───────────────── */}
        {(suggested.length > 0 || loadingSuggestions) && (
          <div className="px-4 pb-3 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2 px-1">
            
            </div>

            {loadingSuggestions ? (
              <div className="flex items-center gap-2 px-1 pb-2 text-[11px] text-white/35">
                <Loader2 size={12} className="animate-spin text-brand-400" />
                Generating questions from your uploaded data…
              </div>
            ) : (
              <div
                className="flex flex-col gap-2 max-h-36 overflow-y-auto scrollbar-custom pr-1 pb-1"
              >
                {suggested.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    disabled={busy}
                    title={q}
                    className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 hover:text-brand-300 hover:border-brand-500/40 hover:bg-brand-500/[0.06] transition-all disabled:opacity-40"
                  >
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Composer ───────────────────────────────────────────────── */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-end gap-2.5">
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
              placeholder="Ask anything about your data…"
              className="flex-1 resize-none bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-brand-500/40 max-h-32"
            />
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="h-11 w-11 shrink-0 rounded-xl bg-brand-500 text-black flex items-center justify-center hover:bg-brand-400 transition-colors disabled:bg-brand-500/20 disabled:text-brand-500/50"
              title="Send"
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/25 text-center">
            Answers are grounded in your uploaded data for this session.
          </p>
        </div>
      </aside>
    </>
  )
}
