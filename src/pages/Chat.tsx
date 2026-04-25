import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/api'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#16A34A', blue: '#3B82F6', purple: '#7C3AED' }

const AGENTS = [
  { slug: 'paco',   name: 'Paco',   initials: 'P',  color: '#60a5fa', desc: 'Tu Compi de trial',   avatar: '/avatars/paco.jpg',   endpoint: '/chat-paco',   tagline: 'Ventas y captación' },
  { slug: 'pelayo', name: 'Pelayo', initials: 'PE', color: '#a78bfa', desc: 'Director del equipo', avatar: '/avatars/pelayo.jpg', endpoint: '/chat-pelayo', tagline: 'Dirección estratégica' },
]

const WELCOME_MESSAGES: Record<string, string> = {
  paco:   '¡Hola! Soy Paco, tu Compi de ventas. ¿Qué necesitas hoy?',
  pelayo: '¡Hola! Soy Pelayo, tu Director. ¿Qué quieres resolver?',
}

type Agent = typeof AGENTS[0]
type MessageRole = 'user' | 'assistant' | 'system'

interface ChatMessage {
  id?: number
  role: MessageRole
  content: string
  created_at?: string
  agent_slug?: string
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function formatDateSeparator(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(dateStr)) return 'Hoy'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
}

function TypingIndicator({ agent }: { agent: Agent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem' }}>
      <img src={agent.avatar} alt={agent.name} style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${C.yellow}`, flexShrink: 0 }} />
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', background: C.cream, borderRadius: 12, padding: '0.5rem 0.75rem', border: `1.5px solid ${C.pastel}` }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: C.muted,
            animation: `bounce 1.2s ease ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }`}</style>
    </div>
  )
}

// ─── SSE Streaming ─────────────────────────────────────────────────────────
async function* streamChat(
  endpoint: string, userId: string, token: string, message: string, abortSignal: AbortSignal
): AsyncGenerator<string> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Agent-Slug': endpoint.replace('/chat-', ''),
    },
    body: JSON.stringify({ userId, message }),
    signal: abortSignal,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  const reader = res.body?.getReader()
  if (!reader) throw new Error('Sin respuesta del servidor')
  const decoder = new TextDecoder()
  let buffer = ''
  let done = false
  while (!done) {
    const { value, done: d } = await reader.read()
    done = d
    if (value) {
      buffer += decoder.decode(value, { stream: !done })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]' || data === '') continue
        try {
          const p = JSON.parse(data)
          if (p.type === 'chunk') yield p.text
          else if (p.type === 'limit_reached' || p.type === 'blocked') {
            yield `\n[${p.message || p.reason || 'Fin del mensaje'}]`
          }
        } catch { /* skip */ }
      }
    }
  }
}

// ─── Inner Chat ─────────────────────────────────────────────────────────────
function ChatWindow({ agent, userId, token, initialMessages }: {
  agent: Agent; userId: string; token: string; initialMessages: ChatMessage[]
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setTyping(true)
    setSending(true)
    abortRef.current = new AbortController()
    try {
      let full = ''
      for await (const chunk of streamChat(agent.endpoint, userId, token, text, abortRef.current.signal)) {
        full += chunk
        setMessages(m => {
          const last = m[m.length - 1]
          if (last?.role === 'assistant') return [...m.slice(0, -1), { ...last, content: last.content + chunk }]
          return [...m, { role: 'assistant', content: chunk, agent_slug: agent.slug, created_at: new Date().toISOString() }]
        })
      }
      if (!full.trim()) {
        setMessages(m => m.slice(0, -1))
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages(m => [...m, { role: 'assistant', content: `Ups, algo falló: ${e.message}. Intenta de nuevo.`, agent_slug: agent.slug }])
      }
    } finally {
      setTyping(false)
      setSending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.cream }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.75rem', textAlign: 'center', padding: '2rem' }}>
            <img src={agent.avatar} alt={agent.name} style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${C.yellow}` }} />
            <div>
              <p style={{ fontWeight: 700, color: C.dark, fontSize: '1rem' }}>Habla con {agent.name}</p>
              <p style={{ color: C.muted, fontSize: '0.82rem', marginTop: '0.25rem' }}>{agent.tagline}</p>
            </div>
            <p style={{ color: C.muted, fontSize: '0.78rem', maxWidth: 280, lineHeight: 1.5 }}>
              {WELCOME_MESSAGES[agent.slug]}
            </p>
          </div>
        )}

        {/* Date separators + messages */}
        {(() => {
          let lastDate = ''
          return messages.map((msg, i) => {
            const msgDate = msg.created_at ? new Date(msg.created_at).toDateString() : ''
            const showSep = msgDate !== lastDate
            if (msgDate) lastDate = msgDate
            const isUser = msg.role === 'user'
            return (
              <div key={i}>
                {showSep && msg.created_at && (
                  <div style={{ textAlign: 'center', padding: '0.5rem 0', fontSize: '0.65rem', color: C.muted, fontWeight: 600, letterSpacing: '0.05em' }}>
                    {formatDateSeparator(msg.created_at)}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: '0.35rem' }}>
                  <div style={{
                    maxWidth: '80%', padding: '0.55rem 0.75rem',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? C.dark : C.white,
                    color: isUser ? C.white : C.dark,
                    fontSize: '0.82rem', lineHeight: 1.5, wordBreak: 'break-word',
                    border: isUser ? 'none' : `1.5px solid ${C.pastel}`,
                    boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    {msg.content}
                  </div>
                  {msg.created_at && (
                    <span style={{ fontSize: '0.6rem', color: C.muted, padding: '0 0.25rem' }}>
                      {formatTime(msg.created_at)}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        })()}

        {typing && <TypingIndicator agent={agent} />}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div style={{ padding: '0.65rem 0.75rem', background: C.white, borderTop: `1px solid ${C.pastel}`, display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={`Pregúntale a ${agent.name}...`}
          disabled={sending}
          style={{
            flex: 1, padding: '0.65rem 0.9rem',
            border: `2px solid ${C.pastel}`, borderRadius: 24,
            fontSize: '0.88rem', fontFamily: 'inherit', background: C.cream,
            color: C.dark, outline: 'none', minWidth: 0,
          }}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: sending || !input.trim() ? C.pastel : C.dark,
            color: sending || !input.trim() ? C.muted : C.yellow,
            border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', flexShrink: 0, transition: 'all 0.15s',
          }}
        >{sending ? '...' : '↑'}</button>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Chat() {
  const navigate = useNavigate()
  const session = getSession()
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0])
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([])

  if (!session) return null

  const userId = session?.user?.id ?? 'unknown'

  // Load chat history when agent changes
  useEffect(() => {
    if (!session?.token) return
    setLoadingHistory(true)
    fetch(`${EDGE_FUNCTIONS_URL}/chat-paco/history?userId=${userId}&limit=50`, {
      headers: { 'Authorization': `Bearer ${session.token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.messages) {
          // Filter for current agent
          const agentMsgs = data.messages.filter((m: any) => !m.agent_slug || m.agent_slug === selectedAgent.slug)
          setHistoryMessages(agentMsgs.map((m: any) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            created_at: m.created_at,
            agent_slug: m.agent_slug,
          })))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [selectedAgent.slug, userId, session?.token])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: C.cream, overflow: 'hidden' }}>

      {/* HEADER */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.6rem 0.75rem', background: C.dark,
        borderBottom: `3px solid ${C.yellow}`, flexShrink: 0
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: C.yellow, cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
        >←</button>

        <div style={{ position: 'relative', flex: 1 }}>
          <button
            onClick={() => setAgentDropdownOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: 8, width: '100%', minHeight: 44 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: selectedAgent.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 800, color: C.white, flexShrink: 0,
              border: `2px solid ${C.yellow}`
            }}>
              {selectedAgent.initials}
            </div>
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.white }}>{selectedAgent.name}</div>
              <div style={{ fontSize: '0.7rem', color: C.yellow }}>{selectedAgent.tagline}</div>
            </div>
            <span style={{ color: C.yellow, marginLeft: 'auto', fontSize: '0.8rem' }}>▼</span>
          </button>

          {agentDropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: C.white, borderRadius: 12,
              boxShadow: '0 8px 32px rgba(45,50,97,0.25)',
              border: `2px solid ${C.pastel}`, zIndex: 100, marginTop: '0.25rem', overflow: 'hidden'
            }}>
              {AGENTS.map(agent => (
                <button
                  key={agent.slug}
                  onClick={() => { setSelectedAgent(agent); setAgentDropdownOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    width: '100%', padding: '0.7rem 0.9rem',
                    background: agent.slug === selectedAgent.slug ? C.cream : 'none',
                    border: 'none', cursor: 'pointer',
                    borderBottom: `1px solid ${C.pastel}`, minHeight: 56
                  }}
                >
                  <img src={agent.avatar} alt={agent.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${agent.color}` }} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: C.dark }}>{agent.name}</div>
                    <div style={{ fontSize: '0.7rem', color: C.muted }}>{agent.tagline}</div>
                  </div>
                  {agent.slug === selectedAgent.slug && (
                    <span style={{ marginLeft: 'auto', color: C.green, fontSize: '1rem' }}>✓</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => setAgentDropdownOpen(false)}
                style={{ display: 'block', width: '100%', padding: '0.6rem', background: C.cream, border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.8rem', fontWeight: 600 }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CHAT WINDOW */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loadingHistory ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: C.muted, fontSize: '0.85rem' }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${C.pastel}`, borderTopColor: C.yellow, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Cargando conversación...
          </div>
        ) : (
          <ChatWindow
            key={selectedAgent.slug}
            agent={selectedAgent}
            userId={userId}
            token={session!.token}
            initialMessages={historyMessages}
          />
        )}
      </div>

      <style>{`
        * { -ms-overflow-style: none; scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}