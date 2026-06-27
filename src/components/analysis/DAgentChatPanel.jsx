import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, Sparkles, X, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'
import { sendChatMessage, triggerReanalysis } from '../../services/api'

export default function DAgentChatPanel({ open, processKey, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        "Hi, I'm DAgent — your data assistant. Ask me anything about your process workflow, list the actors, or provide missing context to re-analyze the map.",
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)

  // New state for the Re-Analyze Yes/No flow
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const [pendingContext, setPendingContext] = useState(null)

  const scrollRef = useRef(null)
  const inputRef = useRef(null)

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

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [open])

  // Handles the actual API call to re-analyze the graph
  const handleReanalyze = async (contextToUse) => {
    setBusy(true)
    setAwaitingConfirmation(false)
    setPendingContext(null)
    setMessages(m => [...m, { role: 'bot', content: 'Re-analyzing process map... This might take a moment.' }])
    try {
      const res = await triggerReanalysis(processKey, contextToUse)
      if (res?.status) {
        setMessages(m => [...m, { role: 'bot', content: 'Process map updated successfully! The page should refresh shortly.' }])
        window.dispatchEvent(new CustomEvent('refresh-process-map'))
      } else {
        setMessages(m => [...m, { role: 'bot', content: 'Re-analysis failed. Please try again.' }])
      }
    } catch {
      setMessages(m => [...m, { role: 'bot', content: 'Re-analysis failed.' }])
    } finally {
      setBusy(false)
    }
  }

  const send = useCallback(async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')

    setMessages(m => [...m, { role: 'user', content: q }])
    setBusy(true)

    try {
      const res = await sendChatMessage(q, processKey, pendingContext)

      setMessages(m => [
        ...m,
        {
          role: 'bot',
          content: res?.answer || "I couldn't find that in your data — try rephrasing your question.",
        },
      ])

      if (res?.awaiting_confirmation) {
        setAwaitingConfirmation(true)
        setPendingContext(res.captured_context)
      } else {
        setAwaitingConfirmation(false)
        setPendingContext(null)
      }

      if (pendingContext && res?.confirmed) {
        await handleReanalyze(pendingContext)
      }

    } catch {
      setMessages(m => [
        ...m,
        { role: 'bot', content: 'Something went wrong reaching your data. Please try again.' },
      ])
    } finally {
      setBusy(false)
      inputRef.current?.focus()
    }
  }, [input, busy, processKey, pendingContext])


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
                  'max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
                  m.role === 'user'
                    ? 'bg-brand-500 text-black font-medium rounded-br-sm whitespace-pre-wrap'
                    : 'bg-white/[0.06] border border-white/10 text-white/85 rounded-bl-sm'
                )}
              >
                {m.role === 'user' ? (
                  m.content
                ) : (
                  <ReactMarkdown
                    components={{
                      // Custom Tailwind styling for Markdown elements so they aren't unstyled
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                      h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mt-3 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-base font-bold text-white mt-3 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-white mt-3 mb-1" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline
                          ? <code className="bg-black/30 px-1 py-0.5 rounded text-brand-300 font-mono text-xs" {...props} />
                          : <code className="block bg-black/40 p-2 rounded-lg font-mono text-xs overflow-x-auto my-2" {...props} />
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                )}
              </div>

            </div>
          ))}

          {/* Render Yes/No Buttons perfectly aligned with the bot messages */}
          {awaitingConfirmation && !busy && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 shrink-0 opacity-0" /> {/* Spacer for avatar alignment */}
              <div className="flex gap-2">
                <button
                  onClick={() => send('yes')}
                  className="px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 text-sm font-medium transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => send('no')}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          )}

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
            Answers are grounded in your generated process model for this session.
          </p>
        </div>
      </aside>
    </>
  )
}
