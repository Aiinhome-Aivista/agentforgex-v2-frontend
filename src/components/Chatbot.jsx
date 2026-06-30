/**

 * Chatbot.jsx — UPDATED for the Yes/No confirmation flow.

 *

 * Flow (matches the user's spec):

 *  1. User sends a message.

 *  2. If the bot detects context-provision keywords, it replies with the

 *     CANONICAL prompt:

 *

 *       Do you want me to re-create the process map based on your

 *       suggested context "..." ?

 *       Please acknowledge ( Yes / No ) ?

 *

 *     The UI then shows:

 *       • "Thinking…" placeholder bubble below it (while we wait for the

 *         user to acknowledge).

 *       • Two inline action buttons: [Yes] [No].

 *  3. Clicking Yes → POSTs to /api/chatbot/reanalyze and shows a real

 *     "Re-analyzing…" spinner.

 *  4. Clicking No → bot acknowledges and drops the pending context.

 *  5. The user can also TYPE "yes" / "no" — the backend interprets these

 *     when `pending_context` is sent along.

 */



import React, { useState, useEffect, useRef, useCallback } from 'react';

import {

  MessageCircle, X, Send, Loader2, Check, XCircle, RefreshCw, CheckCircle2,

} from 'lucide-react';

import { useLocation, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { sendChatMessage, triggerReanalysis, fetchProcessDiscovery } from '../services/api';
import { updateWorkspaceChat } from '../services/workspaceApi';





const formatMessageText = (text) => {

  if (!text) return '';



  // Split by lines

  const lines = text.split('\n');



  return lines.map((line, index) => {

    let trimmedLine = line.trim();



    // 1. Check for headings (e.g. ### Title or #### Title) and strip hashes

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);

    let isHeading = false;

    if (headingMatch) {

      isHeading = true;

      trimmedLine = headingMatch[2];

    }



    // 2. Check for lists

    const isBullet = trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('✓') || trimmedLine.startsWith('* ');

    const isNumbered = /^\d+\.\s/.test(trimmedLine);



    let content = isHeading ? trimmedLine : line;

    if (isBullet) {

      content = trimmedLine.replace(/^(•|-|✓|\*\s)\s*/, '');

    } else if (isNumbered) {

      content = trimmedLine.replace(/^\d+\.\s*/, '');

    }



    // Parse **bold**, *italic*, and `code` inline

    const parts = [];

    const boldAndCodeRegex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;

    let match;

    let lastIndex = 0;



    while ((match = boldAndCodeRegex.exec(content)) !== null) {

      const matchIndex = match.index;

      const matchedStr = match[0];



      // Add preceding text

      if (matchIndex > lastIndex) {

        parts.push(content.substring(lastIndex, matchIndex));

      }



      // Add formatted part (using inherited colors)

      if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {

        parts.push(<strong key={matchIndex} className="font-bold">{matchedStr.slice(2, -2)}</strong>);

      } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {

        parts.push(<em key={matchIndex} className="italic opacity-90">{matchedStr.slice(1, -1)}</em>);

      } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {

        parts.push(<code key={matchIndex} className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-xs border border-white/5">{matchedStr.slice(1, -1)}</code>);

      }



      lastIndex = boldAndCodeRegex.lastIndex;

    }



    if (lastIndex < content.length) {

      parts.push(content.substring(lastIndex));

    }



    const renderedContent = parts.length > 0 ? parts : content;



    if (isHeading) {

      return (

        <p key={index} className="text-sm font-bold leading-relaxed mb-1.5">

          {renderedContent}

        </p>

      );

    }



    if (isBullet) {

      return (

        <li key={index} className="ml-4 list-disc text-sm leading-relaxed mb-1">

          {renderedContent}

        </li>

      );

    }

    if (isNumbered) {

      const matchNum = trimmedLine.match(/^(\d+)\.\s/);

      const num = matchNum ? matchNum[1] : '';

      return (

        <div key={index} className="flex gap-2 text-sm leading-relaxed mb-1 pl-1">

          <span className="font-bold min-w-[15px]">{num}.</span>

          <span className="flex-1">{renderedContent}</span>

        </div>

      );

    }



    return (

      <p key={index} className={trimmedLine === '' ? 'h-2' : 'text-sm leading-relaxed mb-1.5'}>

        {renderedContent}

      </p>

    );

  });

};



export default function Chatbot() {

  const { isAuthenticated } = useAuth();

  const location = useLocation();

  const params = useParams();



  const [isOpen, setIsOpen] = useState(false);

  const [isBouncing, setIsBouncing] = useState(true);

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([]);

  const [isSending, setIsSending] = useState(false);

  const [isDagentOpen, setIsDagentOpen] = useState(false);



  // Pending context awaiting Yes/No confirmation.  When set, the next

  // user reply is interpreted in light of it (server-side).

  const [pendingContext, setPendingContext] = useState(null);

  const [pendingMessageId, setPendingMessageId] = useState(null);



  // Guided discovery interview: the agent asks questions one-by-one and

  // collects answers, then offers to rebuild the process map / KG.

  // Shape: { questions: [{question, reason}], index: number, answers: [{question, answer}] } | null

  const [interview, setInterview] = useState(null);



  const messagesEndRef = useRef(null);

  const scrollContainerRef = useRef(null);

  const inputRef = useRef(null);

  const discoveredRef = useRef(null);   // tracks the processKey we've already run discovery for



  let urlId =
    params.id ||
    location.pathname.match(/\/analysis\/([^/?]+)/)?.[1] ||
    location.pathname.match(/\/suggestion\/([^/?]+)/)?.[1] ||
    location.pathname.match(/\/workspaces\/([^/?]+)/)?.[1] ||
    null;

  let processKey = urlId;
  if (location.pathname.includes('/workspaces/') && urlId) {
    try {
      const cached = localStorage.getItem(`analysis_${urlId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // ArangoDB document usually has _key, or we returned it as process_key or id
        processKey = parsed?.process?.process_key || parsed?.process?._key || parsed?.process?.id || parsed?.process_key || urlId;
      }
    } catch (e) {
      console.error("Failed to parse workspace analysis data", e);
    }
  }



  const isVisiblePath =

    location.pathname.includes('/analysis/') ||

    location.pathname.includes('/suggestion/') ||

    location.pathname.includes('/workspaces/');

  const shouldShow = isAuthenticated && isVisiblePath;



  // ─── lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {

    const timer = setTimeout(() => setIsBouncing(false), 2000);

    return () => clearTimeout(timer);

  }, []);



  useEffect(() => {

    const handleToggle = (e) => {

      setIsDagentOpen(!!e?.detail?.open);

    };

    window.addEventListener('dagent-panel-toggle', handleToggle);

    return () => {

      window.removeEventListener('dagent-panel-toggle', handleToggle);

    };

  }, []);



  const activeProcessKeyRef = useRef(processKey);

  useEffect(() => {
    if (processKey !== activeProcessKeyRef.current) {
      activeProcessKeyRef.current = processKey;

      if (processKey) {
        try {
          const saved = localStorage.getItem(`agentforgex_chat_${processKey}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.messages && parsed.messages.length > 0) {
              setMessages(parsed.messages);
              setPendingContext(parsed.pendingContext || null);
              setPendingMessageId(parsed.pendingMessageId || null);
              setInterview(parsed.interview || null);
              discoveredRef.current = processKey; // prevent discovery from re-running
              return;
            }
          } else if (location.pathname.includes('/workspaces/') && urlId) {
            const cachedWorkspace = localStorage.getItem(`analysis_${urlId}`);
            if (cachedWorkspace) {
              const parsedWorkspace = JSON.parse(cachedWorkspace);
              if (parsedWorkspace.chat_history && parsedWorkspace.chat_history.length > 0) {
                setMessages(parsedWorkspace.chat_history);
                discoveredRef.current = processKey;
                return;
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse chat history", e);
        }
      }

      setMessages([]);
      setPendingContext(null);
      setPendingMessageId(null);
      setInterview(null);
      discoveredRef.current = null;   // allow discovery to re-run for the new process
    }
  }, [processKey]);

  useEffect(() => {
    if (!processKey || processKey !== activeProcessKeyRef.current) return;
    if (messages.length > 0) {
      const stateToSave = {
        messages,
        pendingContext,
        pendingMessageId,
        interview
      };
      localStorage.setItem(`agentforgex_chat_${processKey}`, JSON.stringify(stateToSave));
      
      if (location.pathname.includes('/workspaces/') && urlId) {
        updateWorkspaceChat(urlId, messages).catch(e => console.error("Failed to sync chat to backend", e));
      }
    } else {
      localStorage.removeItem(`agentforgex_chat_${processKey}`);
      if (location.pathname.includes('/workspaces/') && urlId) {
        updateWorkspaceChat(urlId, []).catch(e => console.error("Failed to sync chat to backend", e));
      }
    }
  }, [messages, pendingContext, pendingMessageId, interview, processKey, location.pathname, urlId]);



  useEffect(() => {

    if (messagesEndRef.current) {

      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });

    }

    if (scrollContainerRef.current) {

      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;

    }

  }, [messages, isSending]);



  useEffect(() => {

    if (isOpen && inputRef.current) {

      const t = setTimeout(() => inputRef.current?.focus(), 250);

      return () => clearTimeout(t);

    }

  }, [isOpen]);



  const toggleChat = () => setIsOpen((v) => !v);



  // ─── helper: append a bot message ─────────────────────────────────────

  const appendBot = useCallback((extra) => {

    const id = `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    setMessages((prev) => [...prev, { id, isBot: true, ...extra }]);

    return id;

  }, []);



  // ─── Guided discovery interview ────────────────────────────────────────

  // The agent asks the follow-up questions one at a time, collects answers,

  // then offers to use them to rebuild the process map / knowledge graph.



  const askQuestion = useCallback((q, idx, total) => {
    const prefixes = [
      "I have a doubt about this,",
      "Could you clarify this,",
      "I'd like to understand,",
      "I'm curious about this,"
    ];
    const prefix = prefixes[idx % prefixes.length];

    let questionText = q.question;
    if (questionText.length > 0) {
      questionText = questionText.charAt(0).toLowerCase() + questionText.slice(1);
    }

    appendBot({
      text: `${prefix} ${questionText}`
    });
  }, [appendBot]);



  const finishInterview = useCallback((answers) => {

    const lines = answers

      .map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer || '(skipped)'}`)

      .join('\n\n');

    const ctx =

      'Additional context gathered from a guided process-discovery interview. ' +

      'Use these answers to refine the steps, inputs/outputs, decisions, actors, ' +

      'durations and the knowledge graph:\n\n' + lines;



    const answeredCount = answers.filter((a) => a.answer && a.answer !== '(skipped)').length;



    const offerId = appendBot({

      text:

        answeredCount > 0

          ? "Thanks — that's really helpful. I can use your answers to refine the " +

          'process map and knowledge base. Want me to re-create it now?'

          : "No problem. If you'd like, I can still re-create the process map, or " +

          'you can ask me anything about the current one.',

      offerReanalyze: true,

      reanalyzeState: 'awaiting',

      capturedContext: ctx,

    });

    // Wire the typed yes/no path too (mirrors the normal reanalyze offer).

    setPendingContext(ctx);

    setPendingMessageId(offerId);

  }, [appendBot]);



  const advanceInterview = useCallback((answerText) => {

    if (!interview) return;

    const current = interview.questions[interview.index];

    const answers = [

      ...interview.answers,

      { question: current.question, answer: answerText },

    ];

    const nextIndex = interview.index + 1;

    if (nextIndex < interview.questions.length) {

      setInterview({ ...interview, index: nextIndex, answers });

      askQuestion(interview.questions[nextIndex], nextIndex, interview.questions.length);

    } else {

      setInterview(null);

      finishInterview(answers);

    }

  }, [interview, askQuestion, finishInterview]);



  const skipInterviewQuestion = useCallback(() => {

    advanceInterview(null);

  }, [advanceInterview]);



  const stopInterview = useCallback(() => {

    setInterview(null);

    appendBot({

      text:

        "Sure — I'll stop the questions. Ask me anything about the process, or " +

        'share more context anytime and I can re-create the map.',

    });

  }, [appendBot]);



  // ─── Discovery: summarise gaps, then begin the interview ───────────────

  const runDiscovery = useCallback(async () => {

    if (!processKey) return;

    const typingId = appendBot({ isTyping: true, text: 'Reviewing your process…' });

    try {

      const resp = await fetchProcessDiscovery(processKey);

      const data = resp?.data ?? resp ?? {};

      const summary = (data.summary || '').trim();

      const gaps = Array.isArray(data.identified_gaps) ? data.identified_gaps : [];

      const questions = Array.isArray(data.follow_up_questions)

        ? data.follow_up_questions.filter((q) => q && q.question)

        : [];



      if (!summary && gaps.length === 0 && questions.length === 0) {
        setMessages((prev) => prev
          .filter((m) => m.id !== typingId)
          .concat({ 
            id: `b-discovery-${Date.now()}`, 
            text: "Hello! I'm your AgentForgeX Assistant. To help me generate the best automation code for you, could you tell me about the technology stack you plan to use? For example, what is your main data source and what type of data is involved? You can also ask me anything about this workflow, or provide more context to re-create the process map.", 
            isBot: true 
          })
        );
        return;
      }



      let text = summary || 'I reviewed your process map.';

      if (gaps.length) {

        text += '\n\nGaps I noticed:\n' + gaps.map((g) => `• ${g}`).join('\n');

      }



      // Post the summary, then kick off the interview (if there are questions).

      setMessages((prev) => prev

        .filter((m) => m.id !== typingId)

        .concat({ id: `b-discovery-${Date.now()}`, text, isBot: true }));



      if (questions.length) {
        setInterview({ questions, index: 0, answers: [] });
        askQuestion(questions[0], 0, questions.length);
      }

    } catch (err) {

      // Discovery is best-effort: never block the chat. Drop the placeholder.

      setMessages((prev) => prev.filter((m) => m.id !== typingId));

    }

  }, [processKey, appendBot, askQuestion]);



  // Run discovery once, the first time the panel is opened for a process.

  useEffect(() => {

    if (!isOpen || !processKey) return;

    if (discoveredRef.current === processKey) return;

    discoveredRef.current = processKey;

    runDiscovery();

  }, [isOpen, processKey, runDiscovery]);



  // ─── handler: send the message ────────────────────────────────────────

  const handleSend = useCallback(async (e, overrideText) => {

    if (e && e.preventDefault) e.preventDefault();

    const text = (overrideText ?? message ?? '').trim();

    if (!text || isSending) return;



    // 1. Push user message

    const userMsg = { id: `u-${Date.now()}`, text, isBot: false };

    setMessages((prev) => [...prev, userMsg]);

    if (!overrideText) setMessage('');



    // INTERVIEW MODE: treat the message as the answer to the current question

    // and advance, instead of sending it to the Q&A endpoint.

    if (interview) {

      advanceInterview(text);

      return;

    }



    setIsSending(true);



    // 2. Typing placeholder

    const typingId = `b-typing-${Date.now()}`;

    setMessages((prev) => [...prev, {

      id: typingId, text: 'Thinking…', isBot: true, isTyping: true,

    }]);



    try {

      const resp = await sendChatMessage(text, processKey, pendingContext);

      const data = resp?.data ?? resp ?? {};

      const answer = data.answer ||

        "I couldn't process that — please try a different question.";



      const offerReanalyze = data.offer_reanalyze === true;

      const awaitingConfirmation = data.awaiting_confirmation === true;

      const capturedContext = data.captured_context || null;

      const confirmed = data.confirmed;



      // Build the new bot message

      const botMsgId = `b-${Date.now()}`;

      const newBotMessage = {

        id: botMsgId,

        text: answer,

        isBot: true,

        inScope: data.in_scope !== false,

        intent: data.intent || null,

        offerReanalyze,

        awaitingConfirmation,

        capturedContext: offerReanalyze ? capturedContext : null,

        reanalyzeState: offerReanalyze ? 'awaiting' : null,

      };



      setMessages((prev) => prev

        .filter((m) => m.id !== typingId)

        .concat(newBotMessage));



      // 3. Manage pending-context state

      if (offerReanalyze && awaitingConfirmation && capturedContext) {

        setPendingContext(capturedContext);

        setPendingMessageId(botMsgId);

      } else if (data.intent === 'confirm_reanalyze_yes' && confirmed) {

        // User typed "yes" — trigger re-analysis NOW

        const ctxToUse = data.captured_context || pendingContext;

        setPendingContext(null);

        setPendingMessageId(null);

        if (ctxToUse) await runReanalysis(ctxToUse, pendingMessageId);

      } else if (data.intent === 'confirm_reanalyze_no') {

        setPendingContext(null);

        setPendingMessageId(null);

      }

    } catch (err) {

      setMessages((prev) => prev

        .filter((m) => m.id !== typingId)

        .concat({

          id: `b-err-${Date.now()}`,

          text: 'Sorry — I had trouble reaching the workflow service. Please try again.',

          isBot: true,

          isError: true,

        }));

    } finally {

      setIsSending(false);

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [message, isSending, processKey, pendingContext, pendingMessageId, interview, advanceInterview]);



  // ─── handler: actually run the re-analysis ────────────────────────────

  const runReanalysis = useCallback(async (ctx, offerMsgId) => {

    if (!processKey || !ctx) return;



    // Update the offer bubble to "running"

    if (offerMsgId) {

      setMessages((prev) => prev.map((m) =>

        m.id === offerMsgId ? { ...m, reanalyzeState: 'running' } : m,

      ));

    }



    const progressId = `b-reanalyzing-${Date.now()}`;

    setMessages((prev) => [...prev, {

      id: progressId,

      text: 'Re-analyzing the process and re-creating the process map…',

      isBot: true,

      isTyping: true,

    }]);



    try {

      const resp = await triggerReanalysis(processKey, ctx);

      const data = resp?.data ?? resp ?? {};

      const ok = data.status === true;

      const revisionCount = data.revision_count ?? 0;



      setMessages((prev) => prev

        .filter((m) => m.id !== progressId)

        .map((m) => (m.id === offerMsgId

          ? { ...m, reanalyzeState: ok ? 'done' : 'failed' }

          : m))

        .concat({

          id: `b-${Date.now()}`,

          text: ok

            ? `✓ Process map re-created with your new context.${revisionCount > 0 ? ` (${revisionCount} context update${revisionCount === 1 ? '' : 's'} applied.)` : ''}\n\nThe analysis page will refresh to show the updated steps, suggestions, and exports.`

            : `⚠ Re-analysis didn't complete cleanly: ${data.message || 'unknown error'}.`,

          isBot: true,

          isSuccess: ok,

          isError: !ok,

        }));



      if (ok) {

        window.dispatchEvent(new CustomEvent('agentforgex:process-reanalyzed', {

          detail: { processKey, revisionCount, refreshedAt: Date.now(), data },

        }));

      } else {

        window.dispatchEvent(new CustomEvent('agentforgex:process-reanalyze-failed', {

          detail: { processKey, message: data.message || 'unknown error', refreshedAt: Date.now() },

        }));

      }

    } catch (err) {

      window.dispatchEvent(new CustomEvent('agentforgex:process-reanalyze-failed', {

        detail: { processKey, error: err.message, refreshedAt: Date.now() },

      }));



      setMessages((prev) => prev

        .filter((m) => m.id !== progressId)

        .map((m) => (m.id === offerMsgId

          ? { ...m, reanalyzeState: 'failed' }

          : m))

        .concat({

          id: `b-err-${Date.now()}`,

          text: `Re-analysis failed: ${err.message || 'unknown error'}.`,

          isBot: true,

          isError: true,

        }));

    }

  }, [processKey]);



  // ─── handlers: Yes / No button clicks ─────────────────────────────────

  const handleYes = useCallback(async (msg) => {

    const ctx = msg.capturedContext || pendingContext;

    if (!ctx) return;

    setPendingContext(null);

    setPendingMessageId(null);

    await runReanalysis(ctx, msg.id);

  }, [pendingContext, runReanalysis]);



  const handleNo = useCallback((msg) => {

    setPendingContext(null);

    setPendingMessageId(null);

    setMessages((prev) => prev.map((m) =>

      m.id === msg.id ? { ...m, reanalyzeState: 'declined' } : m,

    ).concat({

      id: `b-${Date.now()}`,

      text: "Got it — I won't re-create the process map. Let me know if you change your mind.",

      isBot: true,

    }));

  }, []);



  // ─── keyboard ─────────────────────────────────────────────────────────

  const onKeyDown = (e) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();

      handleSend();

    }

  };



  if (!shouldShow) return null;



  return (

    <>





      {/* Floating Button */}

      <button

        onClick={toggleChat}

        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg bg-[#00FF9D] text-[#0A0A0B] hover:bg-[#00e68d] transition-all duration-300 ${isDagentOpen ? 'z-30' : 'z-50'} ${isOpen ? 'scale-0' : 'scale-100'} ${isBouncing && !isOpen ? 'animate-bounce' : ''}`}

        aria-label="Open chat"

      >

        <MessageCircle size={28} />

      </button>



      {/* Chat Window */}

      <div

        className={`fixed bottom-6 right-6 w-[400px] sm:w-[480px] h-[600px] max-h-[80vh] bg-[#121214] border border-[#27272A] rounded-2xl shadow-2xl flex flex-col ${isDagentOpen ? 'z-30' : 'z-50'} transition-all duration-300 transform origin-[calc(100%-30px)_calc(100%-30px)] ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}

      >

        {/* Header */}

        <div className="flex justify-between items-center p-4 border-b border-[#27272A] bg-[#1A1A1D] rounded-t-2xl">

          <div className="flex items-center space-x-2">

            <div className="w-8 h-8 rounded-full bg-[#00FF9D] flex justify-center items-center">

              <MessageCircle size={18} className="text-[#0A0A0B]" />

            </div>

            <div className="flex flex-col">

              <h3 className="text-white font-semibold leading-tight">AgentForgeX Assistant</h3>

              <span className="text-[10px] text-white/40 uppercase tracking-wider">

                Workflow &amp; Process Q&amp;A

              </span>

            </div>

          </div>

          <button onClick={toggleChat} className="text-gray-400 hover:text-white transition-colors">

            <X size={20} />

          </button>

        </div>



        {/* Messages */}

        <div

          ref={scrollContainerRef}

          className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"

        >

          {messages.map((msg) => (

            <div key={msg.id} className={`flex flex-col ${msg.isBot ? 'items-start' : 'items-end'}`}>

              <div

                className={`max-w-[85%] rounded-2xl p-3 text-sm whitespace-pre-wrap break-words ${msg.isBot

                  ? msg.isError

                    ? 'bg-red-500/20 text-red-200 rounded-tl-none'

                    : msg.isSuccess

                      ? 'bg-emerald-500/15 text-emerald-100 rounded-tl-none border border-emerald-500/30'

                      : 'bg-[#27272A] text-gray-200 rounded-tl-none'

                  : 'bg-[#00FF9D] text-[#0A0A0B] font-medium rounded-tr-none'

                  }`}

              >

                {msg.isTyping ? (

                  <span className="inline-flex items-center gap-2 text-white/70">

                    <Loader2 size={14} className="animate-spin text-[#00FF9D]" />

                    {msg.text || 'Thinking…'}

                  </span>

                ) : (

                  formatMessageText(msg.text)

                )}

              </div>



              {/* ─── Yes/No confirmation buttons ──────────────────────── */}

              {msg.offerReanalyze && msg.reanalyzeState === 'awaiting' && (

                <div className="mt-2 flex flex-wrap gap-2 items-center">

                  <button

                    onClick={() => handleYes(msg)}

                    disabled={!processKey || isSending}

                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#00FF9D] text-[#0A0A0B] text-xs font-bold uppercase tracking-wider hover:bg-[#00e68d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

                    title="Re-create the process map"

                  >

                    <Check size={13} />

                    Yes

                  </button>

                  <button

                    onClick={() => handleNo(msg)}

                    disabled={isSending}

                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#27272A] text-white/70 text-xs font-bold uppercase tracking-wider hover:bg-[#3F3F46] transition-colors disabled:opacity-50"

                    title="Don't re-create"

                  >

                    <XCircle size={13} />

                    No

                  </button>

                  <span className="text-[10px] text-white/40 ml-1">

                    or type <span className="text-white/60">yes</span> / <span className="text-white/60">no</span>

                  </span>

                </div>

              )}

              {msg.offerReanalyze && msg.reanalyzeState === 'running' && (

                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] text-white/60 text-xs">

                  <Loader2 size={13} className="animate-spin text-[#00FF9D]" />

                  Re-analyzing…

                </div>

              )}

              {msg.offerReanalyze && msg.reanalyzeState === 'done' && (

                <div className="mt-2 flex flex-col gap-1.5">

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 text-xs border border-sky-500/30">

                    <CheckCircle2 size={13} />

                    Yes selected for re-analysis

                  </div>

                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs border border-emerald-500/30">

                    <CheckCircle2 size={13} />

                    Process map re-created

                  </div>

                </div>

              )}

              {msg.offerReanalyze && msg.reanalyzeState === 'declined' && (

                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] text-white/40 text-xs">

                  Declined

                </div>

              )}

              {msg.offerReanalyze && msg.reanalyzeState === 'failed' && (

                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs border border-red-500/30">

                  <XCircle size={13} />

                  Re-analysis failed

                </div>

              )}

            </div>

          ))}

          <div ref={messagesEndRef} />

        </div>



        {/* Discovery interview banner */}





        {/* Pending-context banner */}

        {pendingContext && !interview && (

          <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 text-[11px] text-amber-200/90 flex items-center gap-2">

            <RefreshCw size={11} />

            <span className="truncate">

              Awaiting Yes/No on the suggested context update…

            </span>

          </div>

        )}



        {/* Input Area */}

        <form onSubmit={handleSend} className="p-4 border-t border-[#27272A] bg-[#1A1A1D] rounded-b-2xl">

          <div className="relative">

            <textarea

              ref={inputRef}

              rows={1}

              value={message}

              onChange={(e) => setMessage(e.target.value)}

              onKeyDown={onKeyDown}

              placeholder={
                interview
                  ? 'Type your answer...'
                  : pendingContext

                    ? 'Type yes or no — or use the buttons above'

                    : (isSending ? 'Thinking…' : 'Ask, or add context about the process…')

              }

              disabled={isSending}

              className="w-full bg-[#0A0A0B] text-white border border-[#27272A] rounded-2xl pl-4 pr-12 py-2.5 focus:outline-none focus:border-[#00FF9D] transition-colors disabled:opacity-50 resize-none max-h-28 overflow-y-auto scrollbar-thin"

              style={{ minHeight: '44px', verticalAlign: 'middle', lineHeight: '20px' }}

            />

            <button

              type="submit"

              disabled={!message.trim() || isSending}

              className="absolute right-2.5 bottom-2.5 p-2 bg-[#00FF9D] text-[#0A0A0B] rounded-full hover:bg-[#00e68d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"

            >

              {isSending

                ? <Loader2 size={16} className="animate-spin" />

                : <Send size={16} />}

            </button>

          </div>

        </form>

      </div>

    </>

  );

}