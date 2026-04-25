import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { getSession } from '../lib/api'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', green: '#22C55E', red: '#DC2626', orange: '#F97316' }
const LOGO_URL = 'https://mycompi.com/logo.png'

export default function NPS() {
  const [score, setScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const session = getSession()

  useEffect(() => {
    const s = parseInt(searchParams.get('score') || '')
    if (s >= 1 && s <= 10) {
      setScore(s)
      setTimeout(() => handleSubmit(s), 800)
    }
  }, [])

  const handleSubmit = async (overrideScore?: number) => {
    const s = overrideScore ?? score
    if (s === null) return
    const userId = (session as any)?.user?.id || (session as any)?.user?.clienteId
    try {
      await fetch(`${EDGE_FUNCTIONS_URL}/nps-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: s, user_id: userId })
      })
    } catch (_) {}
    setSubmitted(true)
  }

  const displayScore = hovered ?? score
  const btnColor = (s: number) => {
    if (displayScore === null) return C.white
    if (s === displayScore) {
      if (s <= 3) return C.red
      if (s <= 6) return C.orange
      if (s <= 8) return '#F59E0B'
      return C.green
    }
    return C.white
  }
  const btnTextColor = (s: number) => {
    if (displayScore === null) return C.dark
    return s === displayScore ? C.white : C.dark
  }
  const btnBorder = (s: number) => {
    if (displayScore === null) return C.pastel
    return s === displayScore ? 'none' : C.pastel
  }

  if (submitted) {
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        `}</style>
        <div style={{ background: C.white, borderRadius: 20, padding: '2.5rem', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(45,50,97,0.08)', animation: 'fadeUp 0.5s ease-out' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>🙏</div>
          <h1 style={{ color: C.dark, marginBottom: '0.75rem', fontSize: '1.6rem', fontWeight: 800 }}>
            ¡Gracias por tu feedback!
          </h1>
          <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {score !== null && score <= 6
              ? 'Tu opinión nos ayuda a mejorar. Un Compi va a ponerse en contacto contigo en las próximas horas.'
              : '¡就知道你会喜欢 MyCompi! Gracias por la confianza, vamos a seguir mejorando juntos.'}
          </p>
          {score !== null && score >= 9 && (
            <div style={{ background: '#DCFCE7', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>
              🌟 ¿Sabías que tus amigos también pueden probar MyCompi gratis 5 días? ¡Compárteles tu código!
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '0.75rem 1.5rem', background: C.dark, color: C.yellow, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
              Ir al dashboard →
            </button>
            <button onClick={() => navigate('/checkout')} style={{ padding: '0.75rem 1.5rem', background: C.yellow, color: C.dark, border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
              Contratar ahora
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1.2rem', background: C.dark, borderBottom: `3px solid ${C.yellow}`, zIndex: 10 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src={LOGO_URL} alt="MyCompi" style={{ height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: C.white }}><span style={{ color: C.yellow }}>My</span>Compi</span>
        </Link>
        <Link to="/dashboard" style={{ color: C.yellow, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Volver</Link>
      </nav>

      <div style={{ background: C.white, borderRadius: 20, padding: '2.5rem', maxWidth: 520, width: '100%', boxShadow: '0 8px 40px rgba(45,50,97,0.1)', animation: 'fadeUp 0.4s ease-out', marginTop: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>⭐</span>
          <h1 style={{ color: C.dark, margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Tu valoración</h1>
        </div>
        <p style={{ color: C.muted, marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Tu trial de 5 días está terminando. ¿Cómo lo valorarías?<br />
          <span style={{ fontSize: '0.78rem' }}>Tu feedback real nos ayuda a mejorar. Siempre.</span>
        </p>

        {/* Score buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
            <button
              key={s}
              onClick={() => { setScore(s); setHovered(null) }}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '0.85rem 0',
                borderRadius: 10,
                border: `2px solid ${btnBorder(s)}`,
                background: btnColor(s),
                color: btnTextColor(s),
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
                transform: displayScore === s ? 'scale(1.08)' : 'scale(1)',
                boxShadow: displayScore === s ? `0 4px 12px rgba(0,0,0,0.15)` : 'none',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Scale labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: C.muted, marginBottom: '1.75rem', padding: '0 0.25rem' }}>
          <span>😔 No funciona</span>
          <span>🚀 ¡Increíble!</span>
        </div>

        {/* Preview message */}
        {score !== null && (
          <div style={{
            background: score <= 3 ? '#FEE2E2' : score <= 6 ? '#FEF3C7' : '#DCFCE7',
            borderRadius: 10,
            padding: '1rem',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            color: score <= 3 ? '#991B1B' : score <= 6 ? '#92400E' : '#166534',
            lineHeight: 1.5,
            animation: 'fadeUp 0.3s ease-out',
          }}>
            {score <= 3
              ? '😔 Lo sentimos. Un Compi va a conectarse contigo en la próxima hora para ayudarte a resolverlo.'
              : score <= 6
              ? '👍 Recibido. Tomamos nota y vamos a trabajar en mejorarlo. Te escribimos pronto.'
              : '🚀 ¡Genial! Gracias por la confianza. ¿Sabías que puedes invitar amigos y ganar meses gratis?'}
          </div>
        )}

        {score !== null && score <= 6 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => handleSubmit()}
              style={{
                padding: '0.75rem 2rem',
                background: score <= 3 ? C.red : C.orange,
                color: C.white,
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Enviar feedback
            </button>
          </div>
        )}

        {score !== null && score >= 7 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSubmit()}
              style={{
                padding: '0.75rem 1.5rem',
                background: C.green,
                color: C.white,
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
              }}
            >
              ✓ Enviar
            </button>
            <button
              onClick={() => navigate('/checkout')}
              style={{
                padding: '0.75rem 1.5rem',
                background: C.yellow,
                color: C.dark,
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
              }}
            >
              Contratar ahora →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}