import axios from 'axios'

// In production builds, set VITE_API_BASE_URL in your .env.production file
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}`
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
})

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.error || err.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export const analyzeFiles = (files, userInput = '', opts = {}) => {
  const { sessionId = null, smeContext = '', missionVisionContext = '' } = opts
  const form = new FormData()
  if (files && files.length > 0) {
    files.forEach(f => form.append('files', f))
  }
  // Fold the SME conversation into user_input so the existing analysis
  // pipeline incorporates the captured business knowledge.
  let finalInput = userInput || ''
  if (smeContext && smeContext.trim()) {
    finalInput = `${finalInput}\n\n=== SME CONTEXT (captured in chat) ===\n${smeContext.trim()}`.trim()
  }
  if (finalInput) {
    form.append('user_input', finalInput)
  }
  if (sessionId) {
    form.append('session_id', sessionId)
  }
  if (missionVisionContext && missionVisionContext.trim()) {
    form.append('mission_vision_context', missionVisionContext.trim())
  }
  return api.post('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const sendOnboardingMessage = (message, history = []) =>
  api.post('/chatbot/onboarding', { message, history })


/* ── SME-driven workflow (base graph → chat → enrich → analyze) ───────────── */

/**
 * Build the base Knowledge Graph from the uploaded data BEFORE analysis.
 * Returns { status, session_id, domain, summary, node_count, edge_count,
 *           entities[], glossary[], suggested_questions[] }.
 */
export const ingestBaseGraph = (files, userInput = '', sessionId = null) => {
  const form = new FormData()
  if (files && files.length > 0) files.forEach(f => form.append('files', f))
  if (userInput) form.append('user_input', userInput)
  if (sessionId) form.append('session_id', sessionId)
  return api.post('/sme/ingest', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/** Ask the SME assistant a question grounded in the base graph. */
export const smeChat = (sessionId, query, history = []) =>
  api.post('/sme/chat', { session_id: sessionId, query, history })

/**
 * Start the system-led SME interview: the system speaks first with a warm,
 * personalised opening message + first question. Returns { message, question }.
 */
export const smeStart = (sessionId) =>
  api.post(`/sme/${sessionId}/start`)

/** Fold the SME conversation into the base graph before final analysis. */
export const finalizeSme = (sessionId, transcript) =>
  api.post('/sme/finalize', { session_id: sessionId, transcript })

/**
 * DAgent — fetch suggested starter questions generated from the uploaded data.
 * Returned pre-ordered by question philosophy: What → Where → Why → rest.
 */
export const getSuggestedQuestions = (sessionId) =>
  api.get(`/sme/${sessionId}/suggested-questions`)

export const getProcess = (id) => api.get(`/processes/${id}`)
export const listProcesses = () => api.get('/processes')
export const getAutomation = (id) => api.get(`/processes/${id}/automation`)

// In-memory promise caches — share in-flight requests across components.
const flowCache = new Map()
const archCache = new Map()

export const getProcessFlow = (id) => {
  if (flowCache.has(id)) return flowCache.get(id)
  const promise = api.get(`/processes/${id}/flow`).catch(err => {
    flowCache.delete(id)
    throw err
  })
  flowCache.set(id, promise)
  return promise
}

export const getAutomationArchitecture = (id) => {
  if (archCache.has(id)) return archCache.get(id)
  const promise = api.get(`/suggestions/${id}/architecture`).catch(err => {
    archCache.delete(id)
    throw err
  })
  archCache.set(id, promise)
  return promise
}

export const getTechnicalDesign = (id) => api.get(`/suggestions/${id}/technical-design`)

// NEW: Dynamic blueprint export payload (GET /api/processes/<key>/blueprint-export)
// Returns { status, data: { process_key, cover, sections[], closing, generated_at, llm_generated } }
// Consumed by the blueprint PDF / DOCX / PPTX generators. The frontend renders
// cover/sections/closing verbatim — no hardcoded blueprint text in the UI.
export const getProcessBlueprint = (processKey) =>
  api.get(`/processes/${processKey}/blueprint-export`)

// NEW per spec (Scenario 2) — Suggestion-focused blueprint export payload.
// GET /api/suggestions/<suggestion_id>/blueprint-export
// Same shape as getProcessBlueprint, but the content is focused on the
// chosen suggestion's process step (the one with the higher agentic
// intervention). Consumed by the new "EXPORT BLUEPRINT PDF/WORD/PPT"
// entries in the suggestion-level dropdown.
export const getSuggestionBlueprint = (suggestionId) =>
  api.get(`/suggestions/${suggestionId}/blueprint-export`)
export const runAutomationArchitecture = (data) => api.post(`/agent/run`, data)
export const loginUser = (email, password) => api.post('/login', { email, password })


/* ════════════════════════════════════════════════════════════════════════════
   ▼ NEW endpoints for the spec features                                    ▼
   ════════════════════════════════════════════════════════════════════════════ */

/**
 * NEW: AgentForgeX-scoped chatbot.
 *
 *   sendChatMessage("Explain process", "p2p-abc123")
 *
 * Returns: { status, answer, in_scope, intent, process_key }
 * On out-of-scope queries, the backend returns the canonical out-of-scope
 * message but still status:true so the UI just renders it as a bot reply.
 */
export const sendChatMessage = (query, processKey = null, pendingContext = null) => {
  const body = { query, process_key: processKey }
  if (pendingContext) body.pending_context = pendingContext
  return api.post('/chatbot/ask', body)
}

/**
 * NEW: Download the auto-generated source code ZIP for a suggestion.
 *
 * Triggers a browser download of `agentforgex_<slug>.zip` containing the
 * orchestrator, per-agent files, per-tool files, ETL scripts, pipeline.yaml,
 * connections.yaml, run/deploy scripts and tests.
 *
 * Returns a Promise that resolves once the download has started.  Caller
 * should show a loader between resolve/reject.
 */
export const downloadSuggestionCode = async (suggestionId) => {
  // Use Axios to fetch the binary ZIP file.
  // This keeps the loader spinning on the button until the file is generated by the server (~50 seconds).
  const blob = await api.get(`/suggestions/${suggestionId}/download-code`, {
    responseType: 'blob',
  })

  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = `agentforgex_${suggestionId}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)

  return { filename: `agentforgex_${suggestionId}.zip` }
}

export const triggerReanalysis = (processKey, additionalContext) =>
  api.post('/chatbot/reanalyze', {
    process_key: processKey,
    additional_context: additionalContext,
  })

/**
* Process Discovery Assistant — returns a gap analysis plus the highest-value
* follow-up questions for a process. Used by the chatbot to proactively guide
* the user when the panel is opened.
*   → { status, process_key, summary, identified_gaps, follow_up_questions: [{question, reason}] }
*/
export const fetchProcessDiscovery = (processKey) =>
  api.get(`/chatbot/${processKey}/discover`)

export default api
