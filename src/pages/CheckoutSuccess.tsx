import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSession } from '../lib/api'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', green: '#22C55E' }

const AGENTS = [
  { name: 'Paco', role: 'Ventas' },
  { name: 'Pelayo', role: 'CEO' },
  { name: 'Carmen', role: 'Marketing' },
  { name: 'Laura', role: 'RRHH' },
  { name: 'Enzo', role: 'Soporte' },
  { name: 'Daniel', role: 'Analítica' },
  { name: 'Diana', role: 'Legal' },
  { name: 'Elena', role: 'Finanzas' },
  { name: 'Lucía', role: 'Compras' },
  { name: 'Marcos', role: 'Operations' },
]

const TICKER_ITEMS = [
  '500+ empresas ya usan MyCompi',
  '4.8/5 satisfacción',
  'Respuesta media: 4 segundos',
]

export default function CheckoutSuccess() {
  const navigate = useNavigate()
  const session = getSession()
  const userName = session?.user?.profile?.name || session?.user?.nombre?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'emprendedor'

  useEffect(() => {
    const timer = setTimeout(() => navigate('/dashboard'), 8000)
    return () => clearTimeout(timer)
  }, [navigate])

  const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2.5 + Math.random() * 2,
    color: [C.yellow, C.dark, C.pastel, C.green, '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 8,
    drift: -30 + Math.random() * 60,
  }))

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100vh', WebkitFontSmoothing: 'antialiased', overflowX: 'hidden', width: '100%', maxWidth: '100vw', position: 'relative' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .confetti-piece {
          position: fixed;
          top: -20px;
          animation: confettiFall linear infinite;
          border-radius: 2px;
          pointer-events: none;
          z-index: 999;
        }
        .fade-in-up { animation: fadeInUp 0.7s ease-out both; }
        .fade-in-up-1 { animation-delay: 0.1s; }
        .fade-in-up-2 { animation-delay: 0.25s; }
        .fade-in-up-3 { animation-delay: 0.4s; }
        .fade-in-up-4 { animation-delay: 0.55s; }
        .fade-in-up-5 { animation-delay: 0.7s; }
        .fade-in-up-6 { animation-delay: 0.85s; }
        .pulse-emoji { animation: pulse 2s ease-in-out infinite; }
        .ticker-track { animation: tickerScroll 20s linear infinite; }
      `}</style>

      {/* Confetti */}
      {confettiPieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `translateX(${p.drift}px)`,
          }}
        />
      ))}

      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 1rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div className="fade-in-up" style={{ marginBottom: '1rem' }}>
          <span className="pulse-emoji" style={{ fontSize: '5rem', lineHeight: 1, display: 'block' }}>🎉</span>
        </div>
        <h1 className="fade-in-up fade-in-up-1" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.8rem)', fontWeight: 800, color: C.dark, marginBottom: '0.5rem', lineHeight: 1.2 }}>
          ¡Bienvenido a MyCompi Pro!
        </h1>
        <div className="fade-in-up fade-in-up-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ background: C.green, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <span style={{ fontSize: '1.1rem', color: C.dark, fontWeight: 500 }}>Tu suscripción está activa</span>
        </div>
        <p className="fade-in-up fade-in-up-2" style={{ fontSize: '1rem', color: C.muted, marginBottom: '2.5rem' }}>
          {userName}, gracias por confiar en MyCompi. Tu equipo IA te espera.
        </p>

        {/* What you unlocked */}
        <div className="fade-in-up fade-in-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%', maxWidth: 680, marginBottom: '2rem' }}>
          {[
            { icon: '🤖', title: 'Equipo completo de Compis', desc: 'Accede a los 10 agentes especializados', badge: '10 agentes' },
            { icon: '♾️', title: 'Sin límite de mensajes', desc: '∞ mensajes al día, sin restricción', badge: 'Ilimitado' },
            { icon: '⚡', title: 'Tu primer Compi te espera', desc: 'Configura tu equipo en 5 minutos', badge: '5 min setup' },
          ].map(card => (
            <div key={card.title} style={{ background: C.white, borderRadius: 16, padding: '1.25rem 1rem', boxShadow: '0 2px 12px rgba(45,50,97,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2rem' }}>{card.icon}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, background: C.yellow, color: C.dark, padding: '0.2rem 0.6rem', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.badge}</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: C.dark, lineHeight: 1.3 }}>{card.title}</p>
              <p style={{ fontSize: '0.8rem', color: C.muted }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Team preview */}
        <div className="fade-in-up fade-in-up-4" style={{ width: '100%', maxWidth: 700, marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: C.dark, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tu equipo — Todos activos y listos</p>
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {AGENTS.map(agent => (
              <div key={agent.name} style={{ background: C.white, borderRadius: 12, padding: '0.6rem 0.8rem', minWidth: 90, textAlign: 'center', boxShadow: '0 1px 6px rgba(45,50,97,0.06)', flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.pastel, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.4rem', fontSize: '1.1rem' }}>
                  🤖
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.75rem', color: C.dark }}>{agent.name}</p>
                <p style={{ fontSize: '0.65rem', color: C.muted }}>{agent.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="fade-in-up fade-in-up-5" style={{ width: '100%', maxWidth: 480, marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: C.dark, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Próximos pasos</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <Link to="/onboarding" style={{ background: C.dark, color: C.white, padding: '0.8rem 1.25rem', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Configura tu primer Compi</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link to="/dashboard" style={{ background: C.white, color: C.dark, padding: '0.8rem 1.25rem', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 6px rgba(45,50,97,0.07)' }}>
              <span>Explora tu dashboard</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <a href="https://mycompi.es/integraciones" style={{ color: C.muted, fontSize: '0.85rem', textDecoration: 'none', textAlign: 'center', padding: '0.4rem' }}>
              Añádelos a tu web →
            </a>
          </div>
        </div>

        {/* Email confirmation */}
        <div className="fade-in-up fade-in-up-6" style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: C.muted }}>
            📧 Recibirás un email de confirmación en breve
          </p>
        </div>

        {/* Redirect hint */}
        <p style={{ fontSize: '0.75rem', color: C.muted, opacity: 0.7 }}>
          Redirigiendo a tu dashboard en 8s...
        </p>
      </div>

      {/* Stats ticker */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.dark, padding: '0.5rem 0', overflow: 'hidden', zIndex: 100 }}>
        <div className="ticker-track" style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 500 }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
