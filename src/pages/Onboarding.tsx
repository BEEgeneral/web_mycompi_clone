import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/api'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#22C55E' }

type Step = 'welcome' | 'url' | 'idea' | 'loading' | 'complete'

const LOADING_STEPS = [
  'Conectando con tu web...',
  'Analizando tu sector y propuesta...',
  'Configurando tu equipo IA...',
  'Personalizando cerebros...',
  '¡Todo listo!',
]

const STEPS_CONFIG = [
  { label: 'Bienvenido', icon: '👋', xp: 5 },
  { label: 'Tu negocio', icon: '🌐', xp: 5 },
  { label: 'Equipo listo', icon: '🤖', xp: 10 },
]

const LEVEL_XP = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000]

function getLevel(xp: number): { level: number; progress: number; next: number } {
  let level = 1
  for (let i = 1; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) level = i + 1
    else break
  }
  const currentMin = LEVEL_XP[level - 1] ?? 0
  const nextMin = LEVEL_XP[level] ?? LEVEL_XP[LEVEL_XP.length - 1]
  const progress = nextMin > currentMin ? ((xp - currentMin) / (nextMin - currentMin)) * 100 : 100
  return { level, progress: Math.min(progress, 100), next: nextMin }
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('welcome')
  const [idea, setIdea] = useState('')
  const [url, setUrl] = useState('')
  const [progressIdx, setProgressIdx] = useState(0)
  const [error, setError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [earnedXP, setEarnedXP] = useState(0)
  const [achievementToast, setAchievementToast] = useState<string | null>(null)
  const [currentXP] = useState(0)
  const [saveError, setSaveError] = useState('')

  const session = getSession()

  const userTz = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone } catch { return 'Europe/Madrid' }
  })()

  // Auth guard
  useEffect(() => {
    if (!session?.token) navigate('/login')
  }, [session, navigate])

  useEffect(() => {
    if (step === 'complete' && earnedXP > 0) {
      triggerAchievement('Bienvenido a bordo 🎉')
      const t = setTimeout(() => navigate('/dashboard'), 4000)
      return () => clearTimeout(t)
    }
  }, [step, earnedXP, navigate])

  // Loading progress animator
  useEffect(() => {
    if (step !== 'loading') return
    if (progressIdx >= LOADING_STEPS.length - 1) {
      setEarnedXP(20)
      setStep('complete')
      return
    }
    const t = setTimeout(() => setProgressIdx(i => i + 1), 1500)
    return () => clearTimeout(t)
  }, [step, progressIdx])

  const triggerAchievement = (msg: string) => {
    setAchievementToast(msg)
    setTimeout(() => setAchievementToast(null), 3500)
  }

  const runOnboarding = async (data: { tipo: string; contenido: string; nombre_empresa?: string; sector?: string; objetivos?: string; timezone?: string }) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/onboarding-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token ?? ''}`
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          tipo: data.tipo,
          contenido: data.contenido,
          nombre_empresa: data.nombre_empresa || '',
          sector: data.sector || '',
          objetivos: data.objetivos || '',
          timezone: data.timezone || userTz,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }
      return await res.json()
    } catch (e: any) {
      clearTimeout(timeout)
      console.error('[OB] save error:', e)
      throw e
    }
  }

  // ─── COMPLETE ──────────────────────────────────────────────────────────────
  if (step === 'complete') {
    const { level, progress, next } = getLevel(currentXP + earnedXP)
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', WebkitFontSmoothing: 'antialiased' }}>
        <style>{`
          @keyframes xpFloat { 0% { opacity: 0; transform: translateY(10px); } 20% { opacity: 1; transform: translateY(-4px); } 80% { opacity: 1; transform: translateY(-8px); } 100% { opacity: 0; transform: translateY(-20px); } }
          @keyframes confetti { 0% { transform: translateY(0) rotate(0); opacity: 1; } 100% { transform: translateY(-80px) rotate(360deg); opacity: 0; } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        `}</style>

        {achievementToast && (
          <div style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: C.dark, color: C.yellow, padding: '0.75rem 1.5rem', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', animation: 'xpFloat 3.5s ease forwards' }}>
            🎉 {achievementToast}
          </div>
        )}

        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.dark, marginBottom: '2rem' }}>
            <span style={{ color: C.yellow }}>My</span>Compi
          </div>

          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute', width: 8, height: 8, borderRadius: '50%',
                background: [C.yellow, C.dark, C.green, C.pastel][i % 4],
                left: '50%', top: '50%',
                animation: `confetti 1s ease ${i * 0.1}s forwards`,
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-40px)`,
              }} />
            ))}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', margin: '0 auto', animation: 'pulse 2s ease infinite',
            }}>🎉</div>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>
            ¡Tu equipo está listo!
          </h1>
          <p style={{ color: C.muted, fontSize: '1rem', marginBottom: '2rem' }}>
            Has desbloqueado tu primer logro
          </p>

          <div style={{ background: C.white, borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(45,50,97,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
              <span style={{ fontSize: '2.5rem' }}>🎉</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: C.dark }}>Bienvenido a bordo</div>
                <div style={{ color: C.muted, fontSize: '0.85rem' }}>Completaste tu onboarding</div>
                <div style={{ color: C.yellow, fontWeight: 700, fontSize: '0.9rem', marginTop: '0.25rem' }}>+20 XP</div>
              </div>
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(45,50,97,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: C.dark }}>Nivel {level}</span>
              <span style={{ fontSize: '0.85rem', color: C.muted }}>{currentXP + earnedXP} / {next} XP</span>
            </div>
            <div style={{ background: C.pastel, borderRadius: 8, height: 10, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${C.dark}, ${C.yellow})`, borderRadius: 8, transition: 'width 1s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { icon: '🤖', name: 'Paco', role: 'Ventas', color: '#FFF3F3' },
              { icon: '📊', name: 'Pelayo', role: 'Dirección', color: '#F5F0FF' },
              { icon: '✉️', name: 'Carmen', role: 'Marketing', color: '#E8F4FD' },
              { icon: '💬', name: 'Laura', role: 'Soporte', color: '#F0FFF4' },
            ].map(agent => (
              <div key={agent.name} style={{ background: agent.color, borderRadius: 10, padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: C.dark }}>
                <span>{agent.icon} {agent.name}</span>
                <div style={{ color: C.muted, fontSize: '0.65rem', marginTop: '0.1rem' }}>{agent.role}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{ width: '100%', padding: '1rem', background: C.dark, color: C.white, border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Ir a mi dashboard →
          </button>
        </div>
      </div>
    )
  }

  // ─── WELCOME ──────────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', WebkitFontSmoothing: 'antialiased' }}>
        <style>{`a:focus, button:focus, input:focus { outline: 2px solid ${C.yellow}; outline-offset: 2px; }`}</style>
        <div style={{ maxWidth: 560, width: '100%', background: C.white, borderRadius: 20, padding: '2.5rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.dark }}>
              <span style={{ color: C.yellow }}>My</span>Compi
            </div>
            <div style={{ background: C.cream, borderRadius: 20, padding: '0.3rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, color: C.dark }}>
              ⭐ Nivel 1
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {STEPS_CONFIG.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ background: C.pastel, borderRadius: 6, padding: '0.35rem 0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.9rem' }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: C.muted }}>{s.label}</div>
              </div>
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem', color: C.dark }}>
            Tu equipo IA, listo en 2 minutos
          </h1>
          <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Nos adaptamos a tu sector, analizamos tu negocio y montamos un equipo especializado para ti. Sin configuración, sin técnicos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
            {[
              { icon: '🎯', title: 'Agentes especializados', desc: 'Ventas, soporte, marketing, análisis... cada uno con su rol' },
              { icon: '⚡', title: 'Listos en minutos', desc: 'Se adaptan a tu sector automáticamente' },
              { icon: '🔒', title: '5 días gratis', desc: 'Sin compromiso. Si no te convence, no debes nada.' },
            ].map(item => (
              <div key={item.icon} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: C.dark }}>{item.title}</strong>
                  <p style={{ fontSize: '0.82rem', color: C.muted, margin: '0.1rem 0 0' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              style={{ width: '100%', padding: '1rem', background: C.dark, color: C.white, border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => setStep('url')}
            >
              <span>🌐</span> Ya tengo un negocio — analizar mi web
            </button>
            <button
              style={{ width: '100%', padding: '1rem', background: C.cream, color: C.dark, border: `2px solid ${C.pastel}`, borderRadius: 12, fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => setStep('idea')}
            >
              <span>🚀</span> Empiezo de cero — describir mi idea
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: C.yellow, fontWeight: 600, background: C.dark, padding: '0.25rem 0.75rem', borderRadius: 20 }}>
              +20 XP al completar
            </span>
          </div>

          <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', marginTop: '1rem' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: '0.8rem' }}>
              Saltar este paso →
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ─── URL PATH ─────────────────────────────────────────────────────────────
  if (step === 'url') {
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', WebkitFontSmoothing: 'antialiased' }}>
        <style>{`a:focus, button:focus, input:focus { outline: 2px solid ${C.yellow}; outline-offset: 2px; }`}</style>
        <div style={{ maxWidth: 520, width: '100%', background: C.white, borderRadius: 20, padding: '2.5rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>
          <button onClick={() => setStep('welcome')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem', fontFamily: 'inherit' }}>
            ← Atrás
          </button>

          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= 1 ? C.yellow : C.pastel }} />
            ))}
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: C.dark }}>
            🌐 Analiza mi web
          </h1>
          <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Pon tu URL y nuestro equipo IA analizará tu sector, propuesta de valor y competidores automáticamente.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="url"
              value={url}
              onChange={e => { setUrl(e.target.value); setUrlError('') }}
              onKeyDown={e => e.key === 'Enter' && !analyzing && document.querySelector<HTMLButtonElement>('[data-start-url]')?.click()}
              placeholder="https://tuweb.com"
              style={{ width: '100%', padding: '0.85rem 1rem', background: C.cream, border: `2px solid ${urlError ? C.red : C.pastel}`, borderRadius: 10, color: C.dark, fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            {urlError && <p style={{ color: C.red, fontSize: '0.8rem', marginTop: '0.4rem' }}>{urlError}</p>}
          </div>

          <button
            data-start-url
            onClick={async () => {
              if (!url.trim()) { setUrlError('Pon tu URL'); return }
              let normalized = url.trim()
              if (!normalized.startsWith('http')) normalized = 'https://' + normalized
              setAnalyzing(true)
              setError('')
              setSaveError('')

              let data: Record<string, string> | null = null
              try {
                const res = await fetch(`${EDGE_FUNCTIONS_URL}/analyze-website`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.token ?? ''}` },
                  body: JSON.stringify({ url: normalized }),
                })
                if (res.ok) data = await res.json()
                else console.warn('[OB] analyze-website:', res.status)
              } catch (e) { console.warn('[OB] analyze-website error:', e) }

              setStep('loading')
              try {
                await runOnboarding({
                  tipo: 'url',
                  contenido: normalized,
                  nombre_empresa: data?.nombre_empresa || '',
                  sector: data?.sector || '',
                  objetivos: `${data?.propuesta_valor || ''} | ${data?.productos_servicios || ''}`,
                  timezone: userTz,
                })
              } catch (e: any) {
                setSaveError(e.message)
                setStep('url')
              } finally {
                setAnalyzing(false)
              }
            }}
            disabled={analyzing}
            style={{ width: '100%', padding: '0.9rem', background: analyzing ? C.pastel : C.dark, color: analyzing ? C.muted : C.white, border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: analyzing ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {analyzing ? 'Conectando...' : 'Analizar mi web →'}
          </button>

          {saveError && (
            <p style={{ color: C.red, fontSize: '0.8rem', marginTop: '0.6rem', textAlign: 'center' }}>
              Error: {saveError}. Inténtalo de nuevo.
            </p>
          )}

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: C.yellow, fontWeight: 600, background: C.dark, padding: '0.2rem 0.6rem', borderRadius: 20 }}>
              +5 XP
            </span>
          </div>

          <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', marginTop: '1rem' }}>
            <button onClick={() => setStep('idea')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: '0.8rem' }}>
              No tengo web — describir idea →
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ─── IDEA PATH ────────────────────────────────────────────────────────────
  if (step === 'idea') {
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', WebkitFontSmoothing: 'antialiased' }}>
        <style>{`a:focus, button:focus, input:focus { outline: 2px solid ${C.yellow}; outline-offset: 2px; }`}</style>
        <div style={{ maxWidth: 520, width: '100%', background: C.white, borderRadius: 20, padding: '2.5rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>
          <button onClick={() => setStep('welcome')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1.5rem', fontFamily: 'inherit' }}>
            ← Atrás
          </button>

          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= 1 ? C.yellow : C.pastel }} />
            ))}
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: C.dark }}>
            🚀 Cuéntanos tu idea
          </h1>
          <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Sin rodeos. Describe tu proyecto como se lo contarías a un amigo. Nosotros montamos el equipo.
          </p>

          <textarea
            value={idea}
            onChange={e => { setIdea(e.target.value); setError('') }}
            placeholder="Ej: Quiero montar una tienda online de productos ecológicos para mascotas..."
            rows={5}
            style={{ width: '100%', padding: '0.85rem 1rem', background: C.cream, border: `2px solid ${error ? C.red : C.pastel}`, borderRadius: 10, color: C.dark, fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }}
          />
          {error && <p style={{ color: C.red, fontSize: '0.8rem', marginTop: '0.4rem' }}>{error}</p>}

          <div style={{ textAlign: 'center', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: C.yellow, fontWeight: 600, background: C.dark, padding: '0.2rem 0.6rem', borderRadius: 20 }}>
              +5 XP
            </span>
          </div>

          <button
            onClick={async () => {
              if (!idea.trim()) { setError('Cuéntanos algo sobre tu idea'); return }
              setStep('loading')
              setSaveError('')
              try {
                await runOnboarding({ tipo: 'idea', contenido: idea.trim(), sector: '', objetivos: '', timezone: userTz })
              } catch (e: any) {
                setSaveError(e.message)
                setStep('idea')
              }
            }}
            style={{ width: '100%', padding: '0.9rem', background: C.dark, color: C.white, border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: '0.75rem' }}
          >
            Crear mi equipo IA →
          </button>

          {saveError && (
            <p style={{ color: C.red, fontSize: '0.8rem', marginTop: '0.6rem', textAlign: 'center' }}>
              Error: {saveError}. Inténtalo de nuevo.
            </p>
          )}

          <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', marginTop: '1rem' }}>
            <button onClick={() => setStep('url')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: '0.8rem' }}>
              Tengo una web — analizar en vez →
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', WebkitFontSmoothing: 'antialiased' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.dark, marginBottom: '2rem' }}>
            <span style={{ color: C.yellow }}>My</span>Compi
          </div>

          <div style={{
            width: 48, height: 48, border: `4px solid ${C.pastel}`,
            borderTopColor: C.yellow, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 2rem',
          }} />

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {LOADING_STEPS.map((_, i) => (
              <div key={i} style={{
                width: i <= progressIdx ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: i <= progressIdx ? C.yellow : C.pastel,
                transition: 'all 0.5s ease',
              }} />
            ))}
          </div>

          <p style={{ color: C.dark, fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            {LOADING_STEPS[progressIdx] ?? LOADING_STEPS[LOADING_STEPS.length - 1]}
          </p>
          <p style={{ color: C.muted, fontSize: '0.85rem' }}>
            Esto tarda unos segundos...
          </p>
        </div>
      </div>
    )
  }

  return null
}
