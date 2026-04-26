import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { getSession } from '../lib/api'
import { API_URL, EDGE_FUNCTIONS_URL } from '../lib/insforge'
import { logApiError } from '../lib/logger'
import { useTheme } from '../lib/theme'

export const C = {
  dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3',
  muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#22C55E',
  blue: '#3B82F6', purple: '#7C3AED',
}

const LOGO_URL = 'https://mycompi.com/logo.png'

const COMPIS = [
  { id: 'paco',   nombre: 'Paco',   area: 'Trial',      color: '#FFF3F3', avatar: '/avatars/paco.jpg',   chat: true  },
  { id: 'pelayo', nombre: 'Pelayo', area: 'Direccion',   color: '#F5F0FF', avatar: '/avatars/pelayo.jpg', chat: true  },
  { id: 'lucia',  nombre: 'Lucía',  area: 'Ventas',      color: '#E8F4FD', avatar: '/avatars/lucia.jpg',  chat: false },
  { id: 'marcos', nombre: 'Marcos', area: 'Soporte',     color: '#F0FDF4', avatar: '/avatars/marcos.jpg', chat: false },
  { id: 'daniel', nombre: 'Daniel', area: 'Analitica',   color: '#FEF9E7', avatar: '/avatars/daniel.jpg', chat: false },
  { id: 'laura',  nombre: 'Laura',  area: 'Finanzas',    color: '#F0FFF4', avatar: '/avatars/laura.jpg',  chat: false },
  { id: 'elena',  nombre: 'Elena',  area: 'Sales',        color: '#FFF5F5', avatar: '/avatars/elena.jpg',  chat: false },
  { id: 'diana',  nombre: 'Diana',  area: 'Legal & HR',  color: '#F5F0FF', avatar: '/avatars/diana.jpg',  chat: false },
  { id: 'carmen', nombre: 'Carmen', area: 'Asistenta',   color: '#FFF8F0', avatar: '/avatars/carmen.jpg', chat: false },
]

const ROADMAP = [
  { fase: 'Fase 0', nombre: 'Setup & Config', color: C.green, done: true },
  { fase: 'Fase 1', nombre: 'Core Agents & Chat', color: C.green, done: true },
  { fase: 'Fase 2', nombre: 'Dashboard & Tasks', color: C.green, done: true },
  { fase: 'Fase 3', nombre: 'Payments & Onboarding', color: C.blue, done: false, sub: 'Stripe, onboarding personalizado, email alerts' },
  { fase: 'Fase 4', nombre: 'Integrations & Growth', color: C.yellow, done: false, sub: 'CRM, Meta Ads, newsletter, partnerships, SEO' },
  { fase: 'Fase 5', nombre: 'Scale & Analytics', color: C.purple, done: false, sub: 'Scoring algoritmico, risk assessment, reporting' },
  { fase: 'Fase 6', nombre: 'Monetizacion', color: C.red, done: false, sub: 'Planes tiered, referral system' },
]

interface Message { role: 'user'|'assistant'|'system'; content: string; created_at?: string }
interface AgentStatus { agent_slug: string; last_seen_at: string | null }
interface AgentReport { agent_slug: string; tasks_done: string[]; status: string; alert_message?: string; created_at: string }
interface TrialStatus { trial_ends_at: string | null; trial_converted: boolean; messages_used_today: number; messages_limit?: number; has_trial?: boolean; trial_paused_at?: string | null; trial_pause_used?: boolean }
interface Task { id: number; title: string; description: string | null; agent_slug: string | null; status: string; priority: number; due_date: string | null; completed_at: string | null; created_at: string; updated_at: string }
interface ChatMessage { id?: number; role: string; content: string; created_at?: string }

export default function Dashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const [loading, setLoading] = useState(true)
  const [trialStatus, setTrialStatus] = useState<TrialStatus|null>(null)
  const [trialDaysLeft, setTrialDaysLeft] = useState(0)
  const [trialHoursLeft, setTrialHoursLeft] = useState(0)
  const [trialExpired, setTrialExpired] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean|null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [reports, setReports] = useState<AgentReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportsError, setReportsError] = useState(false)
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const [agentStatuses, setAgentStatuses] = useState<Record<string,AgentStatus>>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [referralData, setReferralData] = useState<{code:string;url:string;total:number;converted:number;rewards_earned:number}|null>(null)
  const [referralLoading, setReferralLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const { toggle: toggleTheme, mode: themeMode } = useTheme()

  // Chat
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const isPaidUser = trialStatus && 'has_trial' in trialStatus && trialStatus.has_trial === false
  const isMobile = window.innerWidth < 1024

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    fetchTrialStatus()
    fetchOnboarding()
    fetchAgentStatuses()
    fetchTasks()
    fetchReports()
    fetchReferral()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const fetchTrialStatus = async () => {
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/trial-status`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user?.id || session?.user?.clienteId })
      })
      if (res.ok) {
        const data = await res.json()
        setTrialStatus(!data.has_trial ? { trial_ends_at: null, trial_converted: true, messages_used_today: 0, has_trial: false } : data)
      }
    } catch (e) { logApiError('/trial-status', 0, String(e), session?.user?.id).catch(() => {}) }
    setLoading(false)
  }

  const fetchOnboarding = async () => {
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/onboarding-status`, { headers: { 'Authorization': `Bearer ${session?.token}` } })
      if (res.ok) { const d = await res.json(); setOnboardingCompleted(d.completed) }
    } catch (e) { logApiError('/onboarding-status', 0, String(e), session?.user?.id).catch(() => {})
      setOnboardingCompleted(false) }
  }

  const fetchAgentStatuses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/database/records/agent_config?select=agent_slug,last_seen_at&limit=100`, {
        headers: { 'apikey': (await import('../lib/insforge')).ANON_KEY, 'Authorization': `Bearer ${(await import('../lib/insforge')).ANON_KEY}` }
      })
      if (res.ok) { const data: AgentStatus[] = await res.json(); const m: Record<string,AgentStatus> = {}; data.forEach(a => { m[a.agent_slug] = a }); setAgentStatuses(m) }
    } catch (e) { logApiError('/trial-status', 0, String(e), session?.user?.id).catch(() => {}) }
  }

  const fetchTasks = async () => {
    if (!session?.user?.id) return
    setTasksLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/database/records/task?user_id=eq.${session.user.id}&select=*&order=priority.asc,created_at.desc&limit=50`, {
        headers: { 'apikey': (await import('../lib/insforge')).ANON_KEY, 'Authorization': `Bearer ${(await import('../lib/insforge')).ANON_KEY}` }
      })
      if (res.ok) setTasks(await res.json())
    } catch (e) { logApiError('/trial-status', 0, String(e), session?.user?.id).catch(() => {}) }
    setTasksLoading(false)
  }

  const fetchReports = async () => {
    setReportsLoading(true)
    setReportsError(false)
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/get-agent-reports`, { headers: { 'Authorization': `Bearer ${session?.token}` } })
      if (res.ok) { const d = await res.json(); setReports(d.reports || []) }
      else setReportsError(true)
    } catch (e) { setReportsError(true) }
    setReportsLoading(false)
  }

  const fetchReferral = async () => {
    setReferralLoading(true)
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/referral`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user?.id })
      })
      if (res.ok) setReferralData(await res.json())
    } catch (e) { logApiError('/trial-status', 0, String(e), session?.user?.id).catch(() => {}) }
    setReferralLoading(false)
  }

  const fetchMessages = async () => {
    setChatLoading(true)
    setMessages([])
    try {
      const res = await fetch(`${API_URL}/api/database/records/chat_message?user_id=eq.${session?.user?.id || session?.user?.clienteId}&agent_id=eq.paco&order=created_at.asc&limit=50`, {
        headers: { 'apikey': (await import('../lib/insforge')).ANON_KEY, 'Authorization': `Bearer ${(await import('../lib/insforge')).ANON_KEY}` }
      })
      if (res.ok) {
        const data: ChatMessage[] = await res.json()
        setMessages(data.map(m => ({ role: m.role as 'user'|'assistant'|'system', content: m.content, created_at: m.created_at })))
      }
    } catch (e) { logApiError('/trial-status', 0, String(e), session?.user?.id).catch(() => {}) }
    setChatLoading(false)
  }

  useEffect(() => { fetchMessages() }, [])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg = input.trim()
    setInput('')
    setSending(true)
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/chat-paco`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userId: session?.user?.id || session?.user?.clienteId })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'Sin respuesta' }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexion.' }])
    }
    setSending(false)
  }

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    await fetch(`${API_URL}/api/database/records/task?id=eq.${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'apikey': (await import('../lib/insforge')).ANON_KEY, 'Authorization': `Bearer ${(await import('../lib/insforge')).ANON_KEY}`, 'Prefer': 'return=representation' },
      body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
    })
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  useEffect(() => {
    if (!trialStatus || isPaidUser) return
    const update = () => {
      if (!trialStatus?.trial_ends_at) return
      const diff = new Date(trialStatus.trial_ends_at).getTime() - Date.now()
      if (diff <= 0) { setTrialExpired(true); setTrialDaysLeft(0); setTrialHoursLeft(0); return }
      setTrialDaysLeft(Math.floor(diff / 86400000))
      setTrialHoursLeft(Math.floor((diff % 86400000) / 3600000))
      setTrialExpired(false)
    }
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [trialStatus, isPaidUser])

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      setShowCheckoutSuccess(true)
      // Clean URL without refresh
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  const statusDot = (slug: string) => {
    const lastSeen = agentStatuses[slug]?.last_seen_at ? new Date(agentStatuses[slug]?.last_seen_at!).getTime() : null
    const minsAgo = lastSeen ? Math.floor((Date.now() - lastSeen) / 60000) : null
    return minsAgo === null ? C.red : minsAgo < 5 ? C.green : minsAgo < 30 ? '#F59E0B' : C.red
  }

  const user = session?.user

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos dias'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const taskStatusColor = (status: string) => {
    if (status === 'completed') return C.green
    if (status === 'in_progress') return C.blue
    if (status === 'pending_approval') return '#F59E0B'
    return C.muted
  }
  const taskStatusLabel = (status: string) => {
    if (status === 'pending_approval') return 'Pendiente'
    if (status === 'todo') return 'Por hacer'
    if (status === 'in_progress') return 'En curso'
    if (status === 'completed') return 'Completada'
    return status
  }

  const agentTagColor: Record<string, string> = {
    paco: '#FFF3F3', pelayo: '#F5F0FF', lucia: '#E8F4FD',
    marcos: '#F0FDF4', daniel: '#FEF9E7', laura: '#F0FFF4',
    elena: '#FFF5F5', diana: '#F5F0FF', carmen: '#FFF8F0',
  }

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'rejected').slice(0, 5)

  // ── CHAT PANEL (reusable) ───────────────────────────────────────
  const ChatPanel = ({ fullScreen = false }: { fullScreen?: boolean }) => (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: fullScreen ? '100dvh' : '100%',
      background: C.white,
      border: fullScreen ? 'none' : `2px solid ${C.pastel}`,
      borderRadius: fullScreen ? 0 : 16,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: fullScreen ? '0.7rem 1rem' : '0.6rem 0.85rem', borderBottom: `1px solid ${C.pastel}`, display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0, background: C.dark }}>
        <img src="/avatars/paco.jpg" alt="Paco" style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${C.yellow}`, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: C.white }}>Chat con Paco</div>
          <div style={{ fontSize: '0.62rem', color: C.pastel }}>Tu asistente IA</div>
        </div>
        {fullScreen && (
          <button onClick={() => setChatOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.yellow, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, padding: '0.25rem 0.5rem', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center' }}>Cerrar</button>
        )}
      </div>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 0 }}>
        {chatLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><span style={{ color: C.muted, fontSize: '0.75rem' }}>Cargando...</span></div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '0.4rem', textAlign: 'center' }}>
            <img src="/avatars/paco.jpg" alt="Paco" style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${C.yellow}`, opacity: 0.7 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C.dark }}>En que te ayudo?</span>
            <span style={{ fontSize: '0.65rem', color: C.muted }}>Pide una tarea, pregunta o genera un informe.</span>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', padding: '0.5rem 0.7rem', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: msg.role === 'user' ? C.dark : C.cream, color: msg.role === 'user' ? C.white : C.dark, fontSize: '0.78rem', lineHeight: 1.45, wordBreak: 'break-word' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      {/* Input */}
      <div style={{ padding: '0.6rem 0.75rem', borderTop: `1px solid ${C.pastel}`, display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Pregunta a Paco o pide una tarea..."
          style={{ flex: 1, padding: '0.55rem 0.8rem', border: `1.5px solid ${C.pastel}`, borderRadius: 22, fontSize: '0.75rem', outline: 'none', fontFamily: 'inherit', background: C.cream, color: C.dark, minWidth: 0 }}
          disabled={sending}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          style={{ width: 38, height: 38, borderRadius: '50%', background: sending ? C.muted : C.dark, color: C.yellow, border: `2px solid ${C.yellow}`, cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem', transition: 'all 0.15s' }}
        >{sending ? '...' : '>'}</button>
      </div>
    </div>
  )

  // ── RENDER ──────────────────────────────────────────────────────
  return (
    <div id="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: C.cream, overflow: 'hidden', width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>

      {/* ── NAV ────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isMobile ? '0.6rem 0.85rem' : '0.55rem 1.2rem',
        background: C.dark, borderBottom: `3px solid ${C.yellow}`, flexShrink: 0, zIndex: 30
      }}>
        {isMobile ? (
          <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', color: C.yellow, fontSize: '1.4rem', cursor: 'pointer', padding: '0.2rem 0.4rem', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>|||</button>
        ) : (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <img src={LOGO_URL} alt="MyCompi" style={{ height: 32, objectFit: 'contain' }} />
          </Link>
        )}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Link to="/profile" style={{ padding: '0.4rem 0.65rem', background: 'transparent', border: `1px solid ${C.yellow}`, borderRadius: 8, color: C.yellow, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: 40 }}>Perfil</Link>
          <Link to="/referral" style={{ padding: '0.4rem 0.65rem', background: C.green, border: 'none', borderRadius: 8, color: C.white, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: 40 }}>🎁 Invita</Link>
          {isMobile && (
            <button onClick={() => setChatOpen(true)} style={{ padding: '0.4rem 0.75rem', background: C.yellow, border: 'none', borderRadius: 8, color: C.dark, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', minHeight: 40 }}>Chat</button>
          )}
        </div>
      </nav>

      {/* ── TRIAL BANNER ─────────────────────────────────────────── */}
      {!loading && !trialExpired && trialDaysLeft <= 1 && (
        <div style={{ background: C.yellow, padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.dark }}>
            {trialStatus?.trial_paused_at ? '⏸ Trial en pausa' : trialDaysLeft === 0 ? `Ultimo dia: ${trialHoursLeft}h restantes!` : 'Ultimo dia de trial!'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {!trialStatus?.trial_pause_used && !trialStatus?.trial_paused_at && (
              <button onClick={async () => {
                if (!confirm('¿Pausar trial por 3 días? Esta acción no se puede deshacer.')) return
                try {
                  const res = await fetch(`${EDGE_FUNCTIONS_URL}/pause-trial`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${session?.token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: session?.user?.id })
                  })
                  const d = await res.json()
                  if (d.ok) { alert(`Trial pausado ${d.pause_days} días. Nueva fecha: ${new Date(d.new_trial_ends_at).toLocaleDateString('es-ES')}`); window.location.reload() }
                  else alert(d.error || 'Error al pausar')
                } catch { alert('Error al pausar trial') }
              }} style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: C.dark, border: `1px solid ${C.dark}`, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', minHeight: 40 }}>Pausar 3 días</button>
            )}
            {trialStatus?.trial_paused_at ? (
              <a href={`${EDGE_FUNCTIONS_URL}/trial-ics?trial_ends_at=${encodeURIComponent(trialStatus.trial_ends_at || '')}`} download style={{ padding: '0.4rem 0.8rem', background: C.dark, color: C.white, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', minHeight: 40, display: 'inline-flex', alignItems: 'center' }}>📅 Añadir recordatorio</a>
            ) : (
              <button onClick={() => navigate('/checkout')} style={{ padding: '0.4rem 0.8rem', background: C.dark, color: C.white, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', minHeight: 40 }}>Contratar ahora</button>
            )}
          </div>
        </div>
      )}
      {trialExpired && !isPaidUser && (
        <div style={{ background: C.red, padding: '0.55rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', color: C.white, fontWeight: 600 }}>Tu trial ha finalizado.</span>
          <button onClick={() => navigate('/checkout')} style={{ padding: '0.4rem 0.8rem', background: C.white, color: C.red, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', minHeight: 40 }}>Reactivar</button>
          <a href={`${EDGE_FUNCTIONS_URL}/trial-ics?trial_ends_at=${encodeURIComponent(trialStatus?.trial_ends_at || '')}`} download style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: C.white, border: `1px solid ${C.white}`, borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', textDecoration: 'none', minHeight: 40, display: 'inline-flex', alignItems: 'center' }}>📅 Recordar después</a>
        </div>
      )}

      {/* ── ONBOARDING CTA ───────────────────────────────────────── */}
      {onboardingCompleted === false && (
        <div style={{ background: C.dark, borderRadius: isMobile ? 12 : 14, padding: isMobile ? '0.75rem 0.9rem' : '0.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: '0.5rem', margin: isMobile ? '0.5rem 0.75rem' : '0.5rem 1.2rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.yellow }}>Empieza aquí</div>
            <div style={{ fontSize: '0.75rem', color: C.pastel, marginTop: '0.1rem' }}>Configura tu empresa y activa a tu equipo de Compis</div>
          </div>
          <button onClick={() => navigate('/onboarding')} style={{ padding: '0.5rem 1rem', background: C.yellow, color: C.dark, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', minHeight: 40, whiteSpace: 'nowrap' }}>Comenzar</button>
        </div>
      )}

      {/* ── WELCOME BANNER — NEW USER FIRST VISIT ──────────────── */}
      {onboardingCompleted === true && !localStorage.getItem('welcome_dismissed') && (
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)', borderRadius: isMobile ? 12 : 14, padding: isMobile ? '0.75rem 0.9rem' : '0.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: '0.5rem', margin: isMobile ? '0.5rem 0.75rem' : '0.5rem 1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👋</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Bienvenido a MyCompi — esto es lo que puedes hacer ahora</div>
              <div style={{ fontSize: '0.72rem', color: '#BFDBFE', marginTop: '0.1rem' }}>🏢 Configura tu empresa · 👥 Invita a tu equipo · 💬 Chatea con tus Compis</div>
            </div>
          </div>
          <button onClick={() => localStorage.setItem('welcome_dismissed', '1')} style={{ padding: '0.4rem 0.85rem', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Entendido</button>
        </div>
      )}

      {/* ── PACO BRAIN PREVIEW CTA (P4-5) ─────────────────────── */}
      {onboardingCompleted === true && !localStorage.getItem('brain_visited') && (
        <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', borderRadius: isMobile ? 12 : 14, padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: '0.5rem', margin: isMobile ? '0.5rem 0.75rem' : '0.5rem 1.2rem' }}
          onClick={() => { localStorage.setItem('brain_visited', '1'); navigate('/brain') }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🧠</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>PACO: Tu segundo cerebro está listo</div>
              <div style={{ fontSize: '0.72rem', color: '#DDD6FE', marginTop: '0.1rem' }}>Echa un vistazo a lo que hemos preparado para ti →</div>
            </div>
          </div>
          <button style={{ padding: '0.5rem 1rem', background: '#FFD054', color: '#2D3261', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Ver cerebro →</button>
        </div>
      )}

      {/* ── DESKTOP: 4 EQUAL COLUMNS ──────────────────────────────── */}
      {!isMobile ? (

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, overflow: 'hidden', minHeight: 0 }}>

          {/* COL 1: Brand + Banners + Team */}
          <div style={{ background: C.white, borderRight: `2px solid ${C.pastel}`, overflowY: 'auto', padding: '1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

            {/* Logo + brand */}
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <img src={LOGO_URL} alt="MyCompi" style={{ height: 48, objectFit: 'contain', margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.dark }}>Vision Shared</div>
              <div style={{ fontSize: '0.65rem', color: C.muted, marginTop: '0.15rem', lineHeight: 1.4 }}>Tu equipo de Compis trabaja proactivamente. Ellos te presentan resultados, tu decides.</div>

              {/* Dark mode toggle */}
              <button onClick={toggleTheme}
                style={{ marginTop: '0.4rem', padding: '0.3rem 0.6rem', background: C.pastel, border: `1.5px solid ${C.muted}`, borderRadius: 8, cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600, color: C.dark, display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center', width: '100%' }}
              >{themeMode === 'dark' ? '☀️' : '🌙'} Modo {themeMode === 'dark' ? 'claro' : 'oscuro'}</button>
            </div>

            {/* Contratar CTA */}
            {!isPaidUser && (
              <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #1a2040 100%)`, borderRadius: 14, padding: '0.9rem', border: `2px solid ${C.yellow}` }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: C.yellow, marginBottom: '0.3rem' }}>MyCompi Profesional</div>
                <div style={{ fontSize: '0.68rem', color: C.pastel, marginBottom: '0.6rem', lineHeight: 1.4 }}>Acceso completo a todos los Compis, tareas ilimitadas y soporte prioritario.</div>
                <button onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '0.6rem', background: C.yellow, color: C.dark, border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: '0.78rem', fontFamily: 'inherit' }}>$49/mes - Contratar</button>
              </div>
            )}
            {isPaidUser && (
              <div style={{ background: `${C.green}15`, borderRadius: 12, padding: '0.85rem', border: `1.5px solid ${C.green}` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: C.green }}>Plan Profesional activo</div>
                <div style={{ fontSize: '0.68rem', color: C.muted, marginTop: '0.2rem' }}>Acceso completo sin limite</div>
              </div>
            )}

            {/* Referral program */}
            {!referralLoading && referralData && (
              <div style={{ background: `${C.green}12`, borderRadius: 12, padding: '0.85rem', border: `1.5px solid ${C.green}` }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: C.green, marginBottom: '0.3rem' }}>Invita y gana 1 mes gratis</div>
                <div style={{ fontSize: '0.65rem', color: C.muted, marginBottom: '0.5rem', lineHeight: 1.4 }}>Cada amigo que contrate, 1 mes gratis para ti.</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <code style={{ flex: 1, fontSize: '0.68rem', background: C.cream, padding: '0.3rem 0.5rem', borderRadius: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: `1px solid ${C.pastel}` }}>{referralData.url}</code>
                  <button onClick={() => { navigator.clipboard.writeText(referralData.url).catch(() => {}); alert('URL copiada al portapapeles!') }} style={{ padding: '0.3rem 0.5rem', background: C.green, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Copiar</button>
                </div>
                <div style={{ fontSize: '0.65rem', color: C.muted }}>{referralData.converted} referrals converted · {referralData.rewards_earned} recompensas aplicadas</div>
              </div>
            )}
            {referralLoading && (
              <div style={{ fontSize: '0.65rem', color: C.muted, textAlign: 'center', padding: '0.5rem' }}>Cargando...</div>
            )}

            {/* Onboarding CTA (si no completado) */}
            {onboardingCompleted === false && (
              <div style={{ background: `${C.blue}12`, borderRadius: 12, padding: '0.85rem', border: `1.5px solid ${C.blue}` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: C.blue, marginBottom: '0.3rem' }}>Onboarding pendiente</div>
                <div style={{ fontSize: '0.68rem', color: C.muted, marginBottom: '0.6rem', lineHeight: 1.4 }}>Completa la configuración para activar a tu equipo.</div>
                <button onClick={() => navigate('/onboarding')} style={{ width: '100%', padding: '0.5rem', background: C.blue, color: C.white, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem', fontFamily: 'inherit' }}>Empieza aquí</button>
              </div>
            )}

            {/* Business metrics */}
            <div style={{ borderTop: `1px solid ${C.pastel}`, paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Business</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>Completadas</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.green }}>{tasks.filter(t => t.status === 'completed').length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>En progreso</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.blue }}>{tasks.filter(t => t.status === 'in_progress').length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>Pendientes</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B' }}>{tasks.filter(t => t.status === 'pending_approval' || t.status === 'todo').length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: C.muted }}>Mensajes hoy</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.dark }}>{trialStatus?.messages_used_today || 0}/{trialStatus?.messages_limit || 10}</span>
                </div>
              </div>
            </div>

            {/* Equipo */}
            <div style={{ borderTop: `1px solid ${C.pastel}`, paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Equipo</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {COMPIS.map(compi => (
                  <div key={compi.id} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.4rem', borderRadius: 8, background: compi.color, opacity: compi.chat ? 1 : 0.55 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={compi.avatar} alt={compi.nombre} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${C.dark}22` }} />
                      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderRadius: '50%', background: statusDot(compi.id), border: `1px solid ${C.white}` }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.dark }}>{compi.nombre}</span>
                      <span style={{ fontSize: '0.62rem', color: C.muted, marginLeft: '0.3rem' }}>{compi.area}</span>
                    </div>
                    {!compi.chat && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.58rem', color: C.muted, background: `${C.muted}15`, padding: '0.1rem 0.35rem', borderRadius: 4 }}>🔒 Próximamente</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COL 2: Tasks */}
          <div style={{ background: C.cream, borderRight: `2px solid ${C.pastel}`, overflowY: 'auto', padding: '1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tareas</span>
              <span style={{ fontSize: '0.68rem', color: C.muted }}>{activeTasks.length} activas</span>
            </div>

            {tasksLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 72, background: C.white, borderRadius: 12, border: `1.5px solid ${C.pastel}`, opacity: 0.5 }} />)}
              </div>
            ) : activeTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: C.muted }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>-</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Todo al dia</div>
                <div style={{ fontSize: '0.72rem', marginTop: '0.25rem' }}>Pide una tarea nueva a Paco por chat</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {activeTasks.map(task => (
                  <div key={task.id} style={{ background: C.white, borderRadius: 12, border: `1.5px solid ${C.pastel}`, padding: '0.7rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.dark, lineHeight: 1.3 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: '0.68rem', color: C.muted, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: 4, background: agentTagColor[task.agent_slug || 'paco'] || C.pastel, color: C.dark }}>{task.agent_slug || 'paco'}</span>
                      <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: 4, background: `${taskStatusColor(task.status)}22`, color: taskStatusColor(task.status) }}>{taskStatusLabel(task.status)}</span>
                      {task.due_date && <span style={{ fontSize: '0.6rem', color: C.muted, marginLeft: 'auto' }}>{new Date(task.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>}
                    </div>
                    {task.status === 'pending_approval' && (
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem' }}>
                        <button onClick={() => updateTaskStatus(task.id, 'completed')} style={{ flex: 1, padding: '0.3rem', background: C.green, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'inherit' }}>Aprobar</button>
                        <button onClick={() => updateTaskStatus(task.id, 'rejected')} style={{ flex: 1, padding: '0.3rem', background: C.red, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'inherit' }}>Rechazar</button>
                      </div>
                    )}
                    {task.status === 'in_progress' && (
                      <button onClick={() => updateTaskStatus(task.id, 'completed')} style={{ marginTop: '0.25rem', padding: '0.3rem 0.6rem', background: C.green, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'inherit' }}>Marcar completada</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reports */}
            {/* Reports */}
            {reportsError && !reportsLoading && (
              <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: 8, padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#991B1B' }}>⚠️ No se pudieron cargar los reports</span>
                <button onClick={fetchReports} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}>Reintentar</button>
              </div>
            )}
            {!reportsLoading && reports.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.pastel}`, paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Actividad reciente</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {reports.slice(0, 4).map((r, i) => (
                    <div key={i} style={{ background: C.white, borderRadius: 8, padding: '0.5rem 0.65rem', border: `1px solid ${C.pastel}` }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: C.dark }}>{r.agent_slug}</div>
                      <div style={{ fontSize: '0.62rem', color: C.muted, marginTop: '0.1rem' }}>{r.tasks_done?.slice(0,2).join(', ') || r.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* COL 3: Integrations + Roadmap */}
          <div style={{ background: C.white, borderRight: `2px solid ${C.pastel}`, overflowY: 'auto', padding: '1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

            {/* Integrations */}
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Integraciones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { name: 'Twitter / X', icon: 'X', bg: '#000' },
                  { name: 'Email', icon: '@', bg: C.dark },
                  { name: 'Ads', icon: '$', bg: C.blue },
                ].map(item => (
                  <div key={item.name} style={{ background: '#F9FAFB', borderRadius: 12, border: `1.5px solid ${C.pastel}`, padding: '0.7rem 0.8rem', boxShadow: '2px 2px 0 #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: C.white, fontSize: '0.7rem', fontWeight: 900 }}>{item.icon}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: C.dark, flex: 1 }}>{item.name}</span>
                    <button style={{ padding: '0.3rem 0.6rem', background: C.dark, color: C.white, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.62rem', fontWeight: 700, fontFamily: 'inherit' }}>Conectar</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div style={{ borderTop: `1px solid ${C.pastel}`, paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Roadmap MyCompi</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {ROADMAP.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.5rem 0.65rem', background: C.cream, borderRadius: 10, border: `1.5px solid ${f.done ? f.color : C.pastel}` }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: f.done ? f.color : `${f.color}33`, border: `2px solid ${f.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      {f.done && <span style={{ color: C.white, fontSize: '0.55rem', fontWeight: 800 }}>v</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: C.muted }}>{f.fase}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: f.done ? C.dark : `${C.dark}99` }}>{f.nombre}</div>
                      {f.sub && <div style={{ fontSize: '0.58rem', color: C.muted, marginTop: '0.1rem' }}>{f.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COL 4: Chat Paco (full height) */}
          <div style={{ background: C.cream, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <ChatPanel />
          </div>

        </div>

      ) : (

        /* ── MOBILE: SINGLE COLUMN ── */
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxSizing: 'border-box' }}>

          {/* Greeting */}
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.dark, margin: 0 }}>{greeting()}, {user?.nombre || user?.email?.split('@')[0] || 'Bienvenido'}</h1>
            <p style={{ color: C.muted, fontSize: '0.8rem', margin: '0.15rem 0 0 0' }}>{isPaidUser ? 'Plan Profesional' : trialExpired ? 'Trial expirado' : !trialStatus?.trial_ends_at ? 'Trial no activado' : `${trialDaysLeft}d trial restantes`}</p>
          </div>

          {/* Profile card */}
          <div style={{ background: C.white, borderRadius: 14, border: `1.5px solid ${C.pastel}`, padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <img src={LOGO_URL} alt="Logo" style={{ height: 36, objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: C.dark }}>Vision Shared</div>
                <div style={{ fontSize: '0.68rem', color: C.muted }}>{user?.email}</div>
              </div>
              {!isPaidUser && <button onClick={() => navigate('/checkout')} style={{ marginLeft: 'auto', padding: '0.4rem 0.7rem', background: C.dark, color: C.yellow, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>$49/mes</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <div style={{ background: C.cream, borderRadius: 8, padding: '0.45rem 0.6rem', textAlign: 'center' }}><div style={{ fontSize: '0.9rem', fontWeight: 800, color: C.green }}>{tasks.filter(t => t.status === 'completed').length}</div><div style={{ fontSize: '0.62rem', color: C.muted }}>Completadas</div></div>
              <div style={{ background: C.cream, borderRadius: 8, padding: '0.45rem 0.6rem', textAlign: 'center' }}><div style={{ fontSize: '0.9rem', fontWeight: 800, color: C.blue }}>{tasks.filter(t => t.status === 'in_progress').length}</div><div style={{ fontSize: '0.62rem', color: C.muted }}>En curso</div></div>
            </div>
          </div>

          {/* Tasks */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tareas</span>
              <span style={{ fontSize: '0.68rem', color: C.muted }}>{activeTasks.length} activas</span>
            </div>
            {activeTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', background: C.white, borderRadius: 12, border: `1.5px solid ${C.pastel}` }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>-</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: C.dark }}>Todo al dia</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {activeTasks.map(task => (
                  <div key={task.id} style={{ background: C.white, borderRadius: 12, border: `1.5px solid ${C.pastel}`, padding: '0.7rem 0.8rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.dark }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '0.1rem 0.35rem', borderRadius: 4, background: agentTagColor[task.agent_slug || 'paco'] || C.pastel, color: C.dark }}>{task.agent_slug}</span>
                      <span style={{ fontSize: '0.6rem', fontWeight: 600, padding: '0.1rem 0.35rem', borderRadius: 4, background: `${taskStatusColor(task.status)}22`, color: taskStatusColor(task.status) }}>{taskStatusLabel(task.status)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integrations */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Integraciones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {[{ name: 'Twitter / X', icon: 'X' }, { name: 'Email', icon: '@' }, { name: 'Ads', icon: '$' }].map(item => (
                <div key={item.name} style={{ background: C.white, borderRadius: 10, border: `1.5px solid ${C.pastel}`, padding: '0.65rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: C.white, fontSize: '0.7rem', fontWeight: 900 }}>{item.icon}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.dark }}>{item.name}</span>
                  <button style={{ marginLeft: 'auto', padding: '0.3rem 0.6rem', background: C.cream, color: C.dark, border: `1px solid ${C.pastel}`, borderRadius: 6, cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'inherit' }}>Conectar</button>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Roadmap MyCompi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {ROADMAP.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: C.white, borderRadius: 10, border: `1.5px solid ${f.done ? f.color : C.pastel}`, padding: '0.5rem 0.65rem' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: f.done ? f.color : `${f.color}33`, border: `2px solid ${f.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {f.done && <span style={{ color: C.white, fontSize: '0.55rem', fontWeight: 800 }}>v</span>}
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: C.muted }}>{f.fase}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: C.dark }}>{f.nombre}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: chat button opens full screen */}
          <div style={{ background: C.white, borderRadius: 14, border: `1.5px solid ${C.pastel}`, padding: '0.85rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: C.muted, marginBottom: '0.5rem' }}>Chat con Paco</div>
            <button onClick={() => setChatOpen(true)} style={{ padding: '0.65rem 1.5rem', background: C.dark, color: C.yellow, border: `2px solid ${C.yellow}`, borderRadius: 12, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'inherit' }}>Abrir chat</button>
          </div>

        </div>
      )}

      {/* ── MOBILE CHAT FULLSCREEN ──────────────────────────────── */}
      {chatOpen && isMobile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: C.cream }}>
          <ChatPanel fullScreen />
        </div>
      )}

      {/* ── MOBILE MENU OVERLAY ──────────────────────────────── */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '75vw', maxWidth: 280, background: C.white, padding: '1rem 0.75rem', overflowY: 'auto', zIndex: 51 }}>
            <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: C.yellow, cursor: 'pointer', fontSize: '1rem', padding: '0.2rem', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>X</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <img src={LOGO_URL} alt="Logo" style={{ height: 40, objectFit: 'contain' }} />
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {[
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Perfil', to: '/profile' },
                { label: 'Business', to: '/business' },
                { label: 'Decisiones', to: '/decisions' },
                { label: 'Invita y gana', to: '/referral' },
                { label: 'Checkout', to: '/checkout' },
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.75rem', borderRadius: 10, background: C.cream, textDecoration: 'none', color: C.dark, fontSize: '0.82rem', fontWeight: 600, minHeight: 52 }}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ── CHECKOUT SUCCESS MODAL ─────────────────────────────────── */}
      {showCheckoutSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: C.white, borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.dark, margin: '0 0 0.5rem' }}>¡Suscripción activa!</h2>
            <p style={{ color: C.muted, fontSize: '0.95rem', margin: '0 0 1.75rem', lineHeight: 1.6 }}>Bienvenido a MyCompi Pro. Tu equipo de Compis ya está listo para ayudarte a escalar tu negocio sin límites.</p>
            <button onClick={() => setShowCheckoutSuccess(false)} style={{ padding: '0.75rem 2rem', background: C.dark, color: C.yellow, border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>¡Empezar!</button>
          </div>
        </div>
      )}

    </div>
  )
}
