import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSession } from '../lib/api'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'
import { logApiError } from '../lib/logger'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', green: '#22C55E', red: '#DC2626' }
const LOGO_URL = 'https://mycompi.com/logo.png'

const LEADERBOARD = [
  { name: 'Marta R.', referrals: 3, reward: '3 meses gratis', avatar: '👩‍💼' },
  { name: 'Carlos L.', referrals: 2, reward: '2 meses gratis', avatar: '👨‍💻' },
  { name: 'Laura M.', referrals: 1, reward: '1 mes gratis', avatar: '👩‍🎨' },
]

const STEPS = [
  { n: '1', icon: '🔗', title: 'Compartes tu link', desc: 'Copia tu link único y compártelo con quien tú decidas.' },
  { n: '2', icon: '🤝', title: 'Amigo se apunta', desc: 'Él registra con 5 días gratis. Sin tarjeta, sin compromiso.' },
  { n: '3', icon: '🎁', title: 'Ambos ganan', desc: 'Si contrata → tú ganas 1 mes gratis. Él también recibe un mes extra.' },
]

export default function Referral() {
  const navigate = useNavigate()
  const session = getSession()
  const [referralData, setReferralData] = useState<{ code: string; url: string; total: number; converted: number; rewards_earned: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    fetchReferral()
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const fetchReferral = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/referral`, {
        headers: { 'Authorization': `Bearer ${session?.token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setReferralData(data)
      }
    } catch(e) { logApiError('/referral', 0, String(e), session?.user?.id).catch(() => {}) }
    setLoading(false)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareMessage = `¡Echa un vistazo a MyCompi! 🎉 Tu primer equipo de IA por €49/mes. 5 días gratis — sin compromiso → ${referralData?.url || 'https://mycompi.com'}`

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1.2rem', background: C.dark, borderBottom: `3px solid ${C.yellow}`, flexShrink: 0 }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src={LOGO_URL} alt="MyCompi" style={{ height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: C.white }}><span style={{ color: C.yellow }}>My</span>Compi</span>
        </Link>
        <Link to="/dashboard" style={{ color: C.yellow, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Dashboard</Link>
      </nav>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark} 0%, #1a1f4e 100%)`, padding: isMobile ? '2.5rem 1.25rem' : '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', animation: 'float 3s ease-in-out infinite' }}>
            <span>🎁</span><span>🎁</span><span>🎁</span>
          </div>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 900, color: C.white, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Invita amigos.<br />Gana <span style={{ color: C.yellow }}>1 mes gratis</span>.
          </h1>
          <p style={{ color: C.pastel, fontSize: '1rem', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
            Cada amigo que contrate MyCompi, tú ganas un mes gratis. Sin límites. Ellos también ganan un mes extra.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: C.pastel, borderBottom: `3px solid ${C.pastel}` }}>
        {[
          { value: referralData?.total ?? '—', label: 'Amigos invitados' },
          { value: referralData?.converted ?? '—', label: 'Conversiones' },
          { value: `${referralData?.rewards_earned ?? 0} meses`, label: 'Meses ganados' },
        ].map((stat, i) => (
          <div key={i} style={{ background: C.white, padding: '1rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C.dark }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: '0.15rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Your code card */}
      <div style={{ padding: '1.5rem 1.25rem' }}>
        <div style={{ background: C.white, borderRadius: 16, padding: '1.5rem', boxShadow: '0 4px 20px rgba(45,50,97,0.08)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.dark, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Tu código de referido</p>
          {loading ? (
            <div style={{ height: 44, background: C.cream, borderRadius: 10, animation: 'fadeUp 0.3s ease-out' }} />
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: C.cream, borderRadius: 10, padding: '0.5rem 0.5rem 0.5rem 0.75rem', border: `1.5px solid ${C.pastel}` }}>
              <code style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                {referralData?.url || window.location.origin}
              </code>
              <button
                onClick={() => handleCopy(referralData?.url || '')}
                style={{ padding: '0.4rem 0.9rem', background: copied ? C.green : C.dark, color: C.white, border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'background 0.2s', flexShrink: 0 }}
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share buttons */}
      <div style={{ padding: '0 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.dark, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Compartir vía</p>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#25D366', color: C.white, padding: '0.85rem 1rem', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', transition: 'transform 0.1s' }}
        >
          <span style={{ fontSize: '1.4rem' }}>💬</span> WhatsApp
          <span style={{ marginLeft: 'auto', opacity: 0.8, fontSize: '0.78rem' }}>Enviar link directo →</span>
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#000', color: C.white, padding: '0.85rem 1rem', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}
        >
          <span style={{ fontSize: '1.4rem' }}>𝕏</span> Twitter / X
          <span style={{ marginLeft: 'auto', opacity: 0.8, fontSize: '0.78rem' }}>Publicar tweet →</span>
        </a>

        <a
          href={`mailto:?subject=${encodeURIComponent('Mi equipo de IA gratis 5 días')}&body=${encodeURIComponent(shareMessage)}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: C.white, color: C.dark, padding: '0.85rem 1rem', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem', border: `2px solid ${C.pastel}` }}
        >
          <span style={{ fontSize: '1.4rem' }}>📧</span> Email
          <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.78rem' }}>Enviar a un amigo →</span>
        </a>

        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralData?.url || '')}`}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0A66C2', color: C.white, padding: '0.85rem 1rem', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}
        >
          <span style={{ fontSize: '1.4rem' }}>💼</span> LinkedIn
          <span style={{ marginLeft: 'auto', opacity: 0.8, fontSize: '0.78rem' }}>Compartir →</span>
        </a>
      </div>

      {/* How it works */}
      <div style={{ background: C.white, padding: '2rem 1.25rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.dark, marginBottom: '1.25rem', textAlign: 'center' }}>¿Cómo funciona?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400, margin: '0 auto' }}>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', animation: `fadeUp 0.5s ${i * 0.1}s ease-out both` }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: C.cream, border: `2px solid ${C.yellow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                {step.icon}
              </div>
              <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: C.dark, marginBottom: '0.2rem' }}>{step.title}</p>
                <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ padding: '0 1.25rem 2rem' }}>
        <div style={{ background: C.white, borderRadius: 16, padding: '1.25rem', boxShadow: '0 4px 20px rgba(45,50,97,0.08)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: C.dark, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>🏆 Top recompensas este mes</p>
          {LEADERBOARD.map((entry, i) => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < 2 ? `1px solid ${C.cream}` : 'none' }}>
              <div style={{ fontSize: '1.1rem' }}>{entry.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: C.dark }}>{entry.name}</p>
                <p style={{ fontSize: '0.72rem', color: C.muted }}>{entry.referrals} amigo{entry.referrals > 1 ? 's' : ''}</p>
              </div>
              <div style={{ background: `${C.yellow}25`, padding: '0.2rem 0.5rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, color: C.dark }}>{entry.reward}</div>
            </div>
          ))}
          <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: C.cream, borderRadius: 8, textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: C.muted }}>Tu posición se actualiza cuando un amigo se registra</p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div style={{ padding: '0 1.25rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.72rem', color: C.muted, lineHeight: 1.6 }}>
          El amigo recibe 5 días gratis de trial. Tú recibes 1 mes gratis por cada amigo que contrate un plan de pago. Sin límite máximo. Sujeto a términos y condiciones.
        </p>
      </div>
    </div>
  )
}