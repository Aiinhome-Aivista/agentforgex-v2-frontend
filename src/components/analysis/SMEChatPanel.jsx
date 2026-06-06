import { useState, useRef, useEffect, useMemo } from 'react'
import {
  Send, Sparkles, CheckCircle2, MessageSquare, Loader2,
  ArrowRight, Network, X,
} from 'lucide-react'
import clsx from 'clsx'
import { smeChat, smeStart } from '../../services/api'

/**
 * SMEChatPanel
 * ─────────────────────────────────────────────────────────────────────────
 * System-led SME interview that sits directly below the upload section after
 * the AI "thinking" phase. The SYSTEM speaks first and asks targeted
 * what / where / why-or-how questions; the user answers in their own words.
 * Each answer enriches the knowledge graph, and the next question is
 * dynamically personalised — like talking to a sharp, friendly colleague.
 *
 * Props:
 *   sessionId        {string}
 *   baseGraph        {object}   payload from /sme/ingest
 *   onConfirmAnalyze {(transcript:string)=>void}
 *   onCancel         {()=>void}   optional — abandon the SME flow
 */
export default function SMEChatPanel({ sessionId, baseGraph, onConfirmAnalyze, onCancel }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(true) // busy while fetching the opening question
  const [stage, setStage] = useState(() => {
    if (baseGraph?.analysis_ready === true && baseGraph?.status === 'knowledge_collection_complete') {
      return 'confirm'
    }
    return 'chat'
  })
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const openedRef = useRef(false)

  // The system opens the conversation: greeting + first question.
  useEffect(() => {
    if (!sessionId || openedRef.current) return
    openedRef.current = true
    let cancelled = false
    ;(async () => {
      try {
        const res = await smeStart(sessionId)
        if (cancelled) return
        
        let messageText = res?.message?.trim() || ''
        const questionText = res?.question?.trim() || res?.followup_question?.trim() || ''
        
        if (messageText && questionText) {
          // Strip the duplicate question from the end of the message text if present
          const qIndex = messageText.lastIndexOf(questionText)
          if (qIndex !== -1) {
            messageText = messageText.substring(0, qIndex).trim()
          }
        }
        
        const opening = messageText || `Thanks for sharing your data — I'd love to ask you a few quick questions so the analysis reflects how things really work.`
        const initialQuestion = questionText || `To start, what's your role in this process?`
        
        setMessages([{ role: 'bot', content: opening, question: initialQuestion }])
      } catch {
        if (cancelled) return
        const fallbackText = baseGraph?.summary?.trim()
          ? `Thanks for the upload — ${baseGraph.summary}`
          : `Thanks for sharing your data — I'd love to ask you a few quick questions so the analysis reflects how things really work.`
        const fallbackQuestion = `To start, what's your role in this process?`
        
        setMessages([{
          role: 'bot',
          content: fallbackText,
          question: fallbackQuestion
        }])
      } finally {
        if (!cancelled) {
          setBusy(false)
          inputRef.current?.focus()
        }
      }
    })()
    return () => {
      cancelled = true
      openedRef.current = false
    }
  }, [sessionId, baseGraph])

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
        .map(m => {
          if (m.role === 'user') return `SME: ${m.content}`
          const fullContent = m.question ? `${m.content} ${m.question}`.trim() : m.content
          return `Assistant: ${fullContent}`
        })
        .join('\n'),
    [messages]
  )

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || busy) return
    setInput('')
    const history = messages
      .filter(m => m.role === 'user' || m.role === 'bot')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.role === 'bot' && m.question ? `${m.content} ${m.question}`.trim() : m.content
      }))

    setMessages(m => [...m, { role: 'user', content: q }])
    setBusy(true)
    try {
      const res = await smeChat(sessionId, q, history)
      
      let answerText = res?.answer || 'Noted — I will use that in the analysis.'
      const nextQuestion = res?.question || res?.followup_question || ''
      
      if (answerText && nextQuestion) {
        const qIndex = answerText.lastIndexOf(nextQuestion)
        if (qIndex !== -1) {
          answerText = answerText.substring(0, qIndex).trim()
        }
      }
      
      setMessages(m => [...m, { role: 'bot', content: answerText, question: nextQuestion }])
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
              <div className="max-w-[78%]">
                <div
                  className={clsx(
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-brand-500 text-black font-medium rounded-br-sm'
                      : 'bg-white/[0.06] border border-white/10 text-white/85 rounded-bl-sm'
                  )}
                >
                  <div>{m.content}</div>
                  {m.role === 'bot' && m.question && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] text-brand-400 font-semibold tracking-wide animate-fade-in shadow-sm">
                        <Sparkles size={10} className="text-brand-400 shrink-0" />
                        <span>{m.question}</span>
                      </div>
                    </div>
                  )}
                </div>
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
                placeholder="Type your answer in your own words..."
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
                  ? 'Answer in your own words — every answer makes to enrich context and information..'
                  : `${userTurns} answer${userTurns > 1 ? 's' : ''} shared`}
              </p>
              <button
                onClick={() => setStage('confirm')}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                <CheckCircle2 size={14} /> I'm done — Proceed
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
