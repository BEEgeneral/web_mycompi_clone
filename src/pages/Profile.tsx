import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSession, clearSession } from '../lib/api'
import { API_URL, EDGE_FUNCTIONS_URL, ANON_KEY } from '../lib/insforge'
import { logApiError } from '../lib/logger'

const C = {
  dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1',
  pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF',
  red: '#DC2626', green: '#22C55E', blue: '#3B82F6',
}
const LOGO_URL = 'https://mycompi.com/logo.png'

// ── Interfaces ──────────────────────────────────────────────────────────────────

interface TrialStatus {
  has_trial: boolean
  trial_ends_at: string | null
  trial_converted: boolean
  messages_used_today: number
  messages_limit?: number
}

interface Company {
  id: number
  name: string
  issue_prefix: string
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  nombre?: string
  clienteId?: string
  referral_code?: string
  referral_rewards?: number
  subscription_plan?: 'monthly' | 'annual'
  subscription_renewal?: string
}

interface SkeletonProps { height?: number; width?: string; radius?: string }

// ── Helpers ────────────────────────────────────────────────────────────────────

function getDaysRemaining(endsAt: string | null): number {
  if (!endsAt) return 0
  return Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 86400000))
}

function getTrialProgress(endsAt: string | null): number {
  if (!endsAt) return 0
  const start = new Date(endsAt).getTime() - 5 * 86400000
  const now = Date.now()
  const total = 5 * 86400000
  return Math.min(100, Math.max(0, ((now - start) / total) * 100))
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [C.dark, C.blue, '#7C3AED', '#059669', '#DC2626', '#D97706']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton({ height = 20, width = '100%', radius = '8px' }: SkeletonProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])
  return (
    <div
      style={{
        height, width,
        borderRadius: radius,
        background: visible ? C.pastel : 'transparent',
        transition: 'background 0.4s ease',
        animation: visible ? 'none' : 'pulse 1.5s infinite',
      }}
    />
  )
}

// ── Section card ───────────────────────────────────────────────────────────────

interface SectionCardProps { children: React.ReactNode; style?: React.CSSProperties }

function SectionCard({ children, style }: SectionCardProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return (
    <div style={{
      background: C.white,
      borderRadius: 16,
      border: `1.5px solid ${C.pastel}`,
      padding: isMobile ? '1.1rem' : '1.5rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── EditableField ──────────────────────────────────────────────────────────────

interface EditableFieldProps {
  label: string
  value: string
  onSave: (value: string) => Promise<void>
  inputType?: 'text' | 'textarea'
  placeholder?: string
}

function EditableField({ label, value, onSave, inputType = 'text', placeholder }: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setVal(value) }, [value])

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const handleSave = async () => {
    if (val.trim() === value) { setEditing(false); return }
    setSaving(true)
    try {
      await onSave(val.trim())
      setEditing(false)
    } catch { /* keep editing open */ }
    setSaving(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setVal(value); setEditing(false) }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.pastel}` }}>
      <span style={{ fontSize: '0.75rem', color: C.muted, flexShrink: 0 }}>{label}</span>
      {editing ? (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type={inputType}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            style={{
              border: `1.5px solid ${C.yellow}`, borderRadius: 8, padding: '0.3rem 0.6rem',
              fontSize: '0.8rem', fontFamily: 'inherit', color: C.dark, background: C.cream,
              outline: 'none', maxWidth: 180,
            }}
          />
          <button onClick={handleSave} disabled={saving} style={{ background: C.green, color: C.white, border: 'none', borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'inherit', minHeight: 28 }}>
            {saving ? '...' : 'OK'}
          </button>
          <button onClick={() => { setVal(value); setEditing(false) }} style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.muted}`, borderRadius: 6, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit', minHeight: 28 }}>✕</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: C.dark, textAlign: 'right', maxWidth: 200, wordBreak: 'break-word' }}>{value || placeholder || '—'}</span>
          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '0.2rem', display: 'flex', alignItems: 'center', fontSize: '0.85rem', borderRadius: 4, transition: 'color 0.2s, background 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = C.dark; (e.target as HTMLElement).style.background = C.pastel }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = C.muted; (e.target as HTMLElement).style.background = 'none' }}
          >✏️</button>
        </div>
      )}
    </div>
  )
}

// ── CopyButton ─────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? C.green : C.pastel,
        color: copied ? C.white : C.dark,
        border: 'none', borderRadius: 8, padding: '0.35rem 0.75rem',
        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem', minHeight: 32,
      }}
    >
      {copied ? '✓ Copiado' : '📋 Copiar'}
    </button>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate()
  const session = getSession()

  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [savingName, setSavingName] = useState(false)

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    await Promise.all([fetchTrialStatus(), fetchCompany()])
    setLoading(false)
  }

  const fetchTrialStatus = async () => {
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/trial-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session?.user?.id || session?.user?.clienteId }),
      })
      if (!res.ok) throw new Error('Error fetching trial status')
      const data = await res.json()
      setTrialStatus({
        has_trial: data.has_trial ?? false,
        trial_ends_at: data.trial_ends_at ?? null,
        trial_converted: data.trial_converted ?? false,
        messages_used_today: data.messages_used_today ?? 0,
        messages_limit: data.messages_limit ?? 50,
      })
    } catch {
      setError('No se pudo cargar el estado de tu suscripción.')
      logApiError("/trial-status", 0, "fetch error", session?.user?.id).catch(() => {})
    }
  }

  const fetchCompany = async () => {
    if (!session?.user?.id && !session?.user?.clienteId) return
    const companyId = (session.user as UserProfile).clienteId || session?.user?.id
    try {
      const res = await fetch(
        `${API_URL}/rest/v1/companies?id=eq.${companyId}&select=id,name,issue_prefix,created_at`,
        {
          headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
            'Prefer': '命中=rows',
          },
        }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) setCompany(data[0])
      }
    } catch(e) { logApiError("/companies", 0, String(e), session?.user?.id).catch(() => {}) }
  }

  const updateCompanyName = async (newName: string) => {
    if (!company) return
    const res = await fetch(`${API_URL}/rest/v1/companies?id=eq.${company.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ name: newName }),
    })
    if (!res.ok) throw new Error('Error updating company')
    const data = await res.json()
    if (data.length > 0) setCompany(data[0])
  }

  const handleSaveName = async () => {
    if (!nameVal.trim()) return
    setSavingName(true)
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre: nameVal.trim() }),
      })
      if (res.ok) {
        const updatedUser = { ...session!.user, nombre: nameVal.trim() }
        localStorage.setItem('if_user', JSON.stringify(updatedUser))
        setEditingName(false)
        // Force re-render by updating session reference
        window.dispatchEvent(new Event('session-update'))
      }
    } catch(e) { logApiError("/update-profile", 0, String(e), session?.user?.id).catch(() => {}) }
    setSavingName(false)
  }

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  const user = session?.user as UserProfile | undefined
  const userName = user?.nombre || 'Usuario'
  const initials = getInitials(userName)
  const avatarColor = getAvatarColor(userName)

  // Determine plan state
  const isExpired = trialStatus && !loading && trialStatus.has_trial === false && trialStatus.trial_converted === false && !trialStatus.trial_ends_at
  const isPaid = trialStatus && !loading && (trialStatus.has_trial === false || trialStatus.trial_converted)

  const daysLeft = trialStatus ? getDaysRemaining(trialStatus.trial_ends_at) : 0
  const trialProgress = getTrialProgress(trialStatus?.trial_ends_at ?? null)
  const urgentTrial = daysLeft <= 1

  const referralCode = user?.referral_code || `COMPI-${(user?.clienteId || user?.id || 'X').slice(-6).toUpperCase()}`
  const referralRewards = user?.referral_rewards || 0

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, display: 'flex', flexDirection: 'column', fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isMobile ? '0.6rem 0.85rem' : '0.55rem 1.5rem',
        background: C.dark, borderBottom: `3px solid ${C.yellow}`, flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src={LOGO_URL} alt="MyCompi" style={{ height: 32, objectFit: 'contain' }} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: C.white }}>
            <span style={{ color: C.yellow }}>My</span>Compi
          </span>
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{
            padding: '0.4rem 0.85rem', background: 'transparent',
            border: `1.5px solid ${C.yellow}`, borderRadius: 8, color: C.yellow,
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
            display: 'flex', alignItems: 'center', minHeight: 40, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget).style.background = `${C.yellow}22` }}
            onMouseLeave={e => { (e.currentTarget).style.background = 'transparent' }}
          >← Volver</Link>
        </div>
      </nav>

      {/* ── Expired Banner ──────────────────────────────────────────────── */}
      {isExpired && (
        <div style={{
          background: `linear-gradient(90deg, ${C.red}, #B91C1C)`,
          color: C.white, padding: '0.9rem 1.5rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
          fontSize: '0.9rem', fontWeight: 700,
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <span>Tu trial ha terminado. Actualiza ahora para seguir usando MyCompi.</span>
          <button
            onClick={() => navigate('/checkout')}
            style={{
              background: C.white, color: C.red, border: 'none', borderRadius: 10,
              padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 800,
              fontSize: '0.85rem', fontFamily: 'inherit', minHeight: 40,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >Upgrade ahora →</button>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: isMobile ? '1rem 0.75rem' : '2rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 580, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* ── Error state ────────────────────────────────────────────── */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: `1px solid ${C.red}44`,
              borderRadius: 12, padding: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span style={{ color: C.red, fontSize: '0.85rem', flex: 1 }}>{error}</span>
              <button onClick={fetchAll} style={{
                background: C.red, color: C.white, border: 'none', borderRadius: 8,
                padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem',
                fontWeight: 700, fontFamily: 'inherit', minHeight: 36,
              }}>Reintentar</button>
            </div>
          )}

          {/* ── Avatar + Name section ──────────────────────────────────────── */}
          <SectionCard>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Skeleton height={72} width="72px" radius="50%" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Skeleton height={24} width="60%" />
                  <Skeleton height={16} width="40%" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: avatarColor, color: C.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', fontWeight: 800, flexShrink: 0,
                  boxShadow: `0 4px 14px ${avatarColor}44`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onClick={() => { setNameVal(userName); setEditingName(true) }}
                  onMouseEnter={e => { (e.currentTarget).style.transform = 'scale(1.05)'; (e.currentTarget).style.boxShadow = `0 6px 20px ${avatarColor}66` }}
                  onMouseLeave={e => { (e.currentTarget).style.transform = 'scale(1)'; (e.currentTarget).style.boxShadow = `0 4px 14px ${avatarColor}44` }}
                  title="Clic para cambiar nombre"
                >
                  {initials}
                </div>

                {/* Name + email */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingName ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        autoFocus
                        value={nameVal}
                        onChange={e => setNameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveName()
                          if (e.key === 'Escape') setEditingName(false)
                        }}
                        style={{
                          border: `1.5px solid ${C.yellow}`, borderRadius: 8,
                          padding: '0.5rem 0.75rem', fontSize: '1rem', fontWeight: 700,
                          fontFamily: 'inherit', color: C.dark, background: C.cream, outline: 'none',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleSaveName} disabled={savingName} style={{
                          background: C.green, color: C.white, border: 'none', borderRadius: 8,
                          padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.8rem',
                          fontWeight: 700, fontFamily: 'inherit', minHeight: 36,
                        }}>{savingName ? 'Guardando...' : 'Guardar'}</button>
                        <button onClick={() => setEditingName(false)} style={{
                          background: 'transparent', color: C.muted, border: `1px solid ${C.muted}`,
                          borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer',
                          fontSize: '0.8rem', fontFamily: 'inherit', minHeight: 36,
                        }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: C.dark }}>{userName}</span>
                        <button onClick={() => { setNameVal(userName); setEditingName(true) }} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: C.muted,
                          fontSize: '0.9rem', padding: '0.2rem', borderRadius: 4,
                          transition: 'color 0.2s, background 0.2s',
                        }}
                          onMouseEnter={e => { (e.target as HTMLElement).style.color = C.dark; (e.target as HTMLElement).style.background = C.pastel }}
                          onMouseLeave={e => { (e.target as HTMLElement).style.color = C.muted; (e.target as HTMLElement).style.background = 'none' }}
                        >✏️</button>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: C.muted, marginTop: '0.2rem' }}>{user?.email || 'Sin email'}</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Plan Section ────────────────────────────────────────────── */}
          <SectionCard>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              Tu plan
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Skeleton height={48} />
                <Skeleton height={20} width="70%" />
              </div>
            ) : isPaid ? (
              /* Paid plan */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div style={{ padding: '0.4rem 0.85rem', background: `${C.green}15`, border: `1.5px solid ${C.green}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.green }}>
                      Plan {user?.subscription_plan === 'annual' ? 'Anual' : 'Mensual'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${C.pastel}` }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted }}>Renovación</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: C.dark }}>
                    {user?.subscription_renewal ? formatDate(user.subscription_renewal) : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted }}>Coste mensual</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.dark }}>
                    {user?.subscription_plan === 'annual' ? '€39' : '€49'}/mes
                  </span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', marginTop: '1rem', padding: '0.7rem',
                    background: C.pastel, color: C.dark, border: 'none', borderRadius: 10,
                    cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit',
                    minHeight: 48, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.background = `${C.pastel}CC` }}
                  onMouseLeave={e => { (e.currentTarget).style.background = C.pastel }}
                >
                  Gestionar suscripción
                </button>
              </div>
            ) : isExpired ? (
              /* Expired */
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>😔</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: C.red, marginBottom: '0.3rem' }}>Trial finalizado</div>
                <div style={{ fontSize: '0.82rem', color: C.muted, marginBottom: '1rem' }}>Tu periodo de prueba ha terminado.</div>
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', padding: '0.85rem',
                    background: C.red, color: C.white, border: 'none', borderRadius: 10,
                    cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'inherit',
                    minHeight: 52, boxShadow: `0 4px 14px ${C.red}44`,
                  }}
                >Contratar ahora →</button>
              </div>
            ) : (
              /* Active trial */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgentTrial ? C.yellow : C.blue }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: urgentTrial ? C.yellow : C.dark }}>Plan Trial</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: urgentTrial ? C.yellow : C.dark }}>
                    {daysLeft === 0 ? '¡Último día!' : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ background: C.pastel, borderRadius: 10, height: 10, overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div style={{
                    height: '100%',
                    width: `${trialProgress}%`,
                    background: urgentTrial
                      ? `linear-gradient(90deg, ${C.yellow}, ${C.red})`
                      : `linear-gradient(90deg, ${C.blue}, ${C.dark})`,
                    borderRadius: 10,
                    transition: 'width 0.5s ease',
                  }} />
                </div>

                {/* Messages counter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: urgentTrial ? `${C.yellow}18` : `${C.pastel}`, borderRadius: 10, marginBottom: '1rem', border: `1px solid ${urgentTrial ? C.yellow : 'transparent'}` }}>
                  <span style={{ fontSize: '0.75rem', color: urgentTrial ? C.yellow : C.muted }}>
                    Mensajes usados hoy
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.dark }}>
                    {trialStatus?.messages_used_today ?? 0} / {trialStatus?.messages_limit ?? 50}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%', padding: '0.8rem',
                    background: urgentTrial ? C.red : C.yellow,
                    color: urgentTrial ? C.white : C.dark, border: 'none', borderRadius: 10,
                    cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'inherit',
                    minHeight: 52, boxShadow: urgentTrial ? `0 4px 14px ${C.red}44` : 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.opacity = '0.9'; (e.currentTarget).style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { (e.currentTarget).style.opacity = '1'; (e.currentTarget).style.transform = 'translateY(0)' }}
                >
                  {urgentTrial ? '¡Upgrade ahora!' : 'Mejorar a Profesional →'}
                </button>
              </div>
            )}
          </SectionCard>

          {/* ── Company Section ──────────────────────────────────────────── */}
          <SectionCard>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              Empresa
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <Skeleton height={18} width="50%" />
                <Skeleton height={18} width="40%" />
                <Skeleton height={18} width="35%" />
              </div>
            ) : company ? (
              <>
                <EditableField label="Nombre" value={company.name} onSave={updateCompanyName} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.pastel}` }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted }}>Prefijo tickets</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.dark, fontFamily: 'monospace', background: C.pastel, padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                    {company.issue_prefix}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0' }}>
                  <span style={{ fontSize: '0.75rem', color: C.muted }}>Creado</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: C.dark }}>{formatDate(company.created_at)}</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: C.muted, fontSize: '0.85rem' }}>
                Sin empresa asignada
              </div>
            )}
          </SectionCard>

          {/* ── Referral Widget ─────────────────────────────────────────── */}
          <SectionCard>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.85rem' }}>
              Programa de referidos
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.2rem' }}>Tu código</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: C.dark, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{referralCode}</div>
              </div>
              <CopyButton text={referralCode} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.85rem', background: `${C.green}12`, borderRadius: 10, border: `1px solid ${C.green}33`, marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: C.dark }}>💰 Recompensas ganadas</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: C.green }}>{referralRewards === 0 ? '0' : referralRewards}€</span>
            </div>

            <Link
              to="/dashboard"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: '0.7rem', background: `linear-gradient(135deg, ${C.yellow}33, ${C.yellow}11)`,
                border: `1.5px solid ${C.yellow}`, borderRadius: 10, textDecoration: 'none',
                color: C.dark, fontWeight: 800, fontSize: '0.82rem',
                minHeight: 48, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget).style.background = `${C.yellow}44` }}
              onMouseLeave={e => { (e.currentTarget).style.background = `linear-gradient(135deg, ${C.yellow}33, ${C.yellow}11)` }}
            >
              🎁 Invita y gana — Ver programa →
            </Link>
          </SectionCard>

          {/* ── Danger Zone ─────────────────────────────────────────────── */}
          <div style={{
            background: `${C.red}08`, border: `1.5px solid ${C.red}33`,
            borderRadius: 16, padding: isMobile ? '1.1rem' : '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
              Zona de peligro
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'transparent', border: `2px solid ${C.muted}`,
                borderRadius: 12, color: C.muted, cursor: 'pointer',
                fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', minHeight: 52, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = C.dark; (e.currentTarget).style.color = C.dark }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = C.muted; (e.currentTarget).style.color = C.muted }}
            >
              <span style={{ fontSize: '1.1rem' }}>🚪</span> Cerrar sesión
            </button>

            <button
              disabled
              style={{
                width: '100%', padding: '0.75rem',
                background: 'transparent', border: `2px solid ${C.red}44`,
                borderRadius: 12, color: `${C.red}88`, cursor: 'not-allowed',
                fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', minHeight: 52,
              }}
              title="Para eliminar tu cuenta, contacta con nosotros"
            >
              <span style={{ fontSize: '1rem' }}>🗑️</span> Eliminar cuenta (contacta con nosotros)
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

