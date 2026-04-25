import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSession } from '../lib/api'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'


const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', green: '#22C55E', red: '#DC2626' }

const FEATURES = [
  '6 Compis agentes especializados',
  'Atención al cliente 24/7',
  'Ventas y marketing automatizado',
  'Análisis de datos en tiempo real',
  'Sin permanencias ni compromisos',
  'Soporte por email incluido',
]

export default function Checkout() {
  const session = getSession()
  const navigate = useNavigate()

  // Redirect to login if not authenticated, with return URL
  useEffect(() => {
    if (!session) {
      navigate('/login?next=/checkout')
    }
  }, [session, navigate])

  if (!session) return null

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleContratar = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(EDGE_FUNCTIONS_URL + '/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`,
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          email: session?.user?.email,
          planType: plan,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        throw new Error(json.error || 'No se pudo iniciar el pago')
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago')
      setLoading(false)
    }
  }

  const monthlyAmount = 49
  const annualAmount = 39
  const annualSavings = 120

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100vh', WebkitFontSmoothing: 'antialiased', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '0.75rem 1rem' : '1rem 2rem', background: C.dark, position: 'sticky', top: 0, zIndex: 100, maxWidth: '100%', overflowX: 'hidden' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.white }}>
          <span style={{ color: C.yellow }}>My</span>Compi
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {session ? (
            <Link to="/dashboard" style={{ color: C.white, textDecoration: 'none', fontSize: '0.9rem', minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Ir al dashboard →</Link>
          ) : (
            <>
              <Link to="/login" style={{ color: C.pastel, textDecoration: 'none', fontSize: '0.9rem', minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Acceder</Link>
              <Link to="/registro" style={{ color: C.white, textDecoration: 'none', fontSize: '0.9rem', minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Regístrate</Link>
            </>
          )}
        </div>
      </nav>

      {/* Plan selector */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem 0', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: C.white,
          borderRadius: '16px',
          padding: '0.35rem',
          display: 'inline-flex',
          gap: '0',
          border: `2px solid ${C.pastel}`,
          fontSize: '0.9rem',
          fontFamily: 'inherit',
        }}>
          <button
            onClick={() => setPlan('monthly')}
            style={{
              flex: 1,
              padding: '0.6rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              background: plan === 'monthly' ? C.dark : 'transparent',
              color: plan === 'monthly' ? C.white : C.muted,
            }}>
            Mensual · €{monthlyAmount}/mes
          </button>
          <button
            onClick={() => setPlan('annual')}
            style={{
              flex: 1,
              padding: '0.6rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              background: plan === 'annual' ? C.dark : 'transparent',
              color: plan === 'annual' ? C.white : C.muted,
            }}>
            Anual · €{annualAmount}/mes
            <span style={{
              display: 'inline-block',
              marginLeft: '0.4rem',
              background: C.green,
              color: C.white,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              verticalAlign: 'middle',
            }}>
              −20%
            </span>
          </button>
        </div>
        {plan === 'annual' && (
          <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: C.green, fontWeight: 600 }}>
            🎁 Ahorras €{annualSavings}/año — 2 meses gratis
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{
        maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem 3rem',
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '2rem' : '2.5rem', alignItems: 'flex-start',
        boxSizing: 'border-box', width: '100%',
      }}>
        {/* Left: features */}
        <div style={{ flex: '1 1 60%', minWidth: 0 }}>
          <div style={{ display: 'inline-block', background: `${C.yellow}33`, color: C.dark, fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
            ✓ Suscripción activa
          </div>
          <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 800, color: C.dark, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            {plan === 'annual'
              ? <>Ahorra €{annualSavings} al año con<br /><span style={{ color: C.green }}>MyCompi Anual</span></>
              : <>Empieza hoy con<br /><span style={{ color: C.yellow }}>MyCompi</span></>
            }
          </h1>
          <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            {plan === 'annual'
              ? '6 Compis especializados trabajando 24/7 para tu negocio. Pago anual con 2 meses gratis incluidos.'
              : '9 Compis especializados trabajan 24/7 para tu negocio. Sin permanencias, sin promesas vacías — solo resultados.'
            }
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
            {FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#374151', fontSize: '0.95rem' }}>
                <div style={{ width: 20, height: 20, background: `${C.yellow}44`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                {f}
              </li>
            ))}
          </ul>

          <div style={{ background: C.white, borderRadius: '12px', padding: '1.25rem', border: `1px solid ${C.pastel}`, maxWidth: '100%', boxSizing: 'border-box' }}>
            <p style={{ color: C.muted, fontSize: '0.8rem', marginBottom: '0.5rem' }}>Testimonio</p>
            <p style={{ color: C.dark, fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.6 }}>
              "Lucía maneja el 80% de las consultas sin intervención nuestra. Ahorramos 1.200€/mes en personal."
            </p>
            <p style={{ color: C.muted, fontSize: '0.8rem', marginTop: '0.75rem' }}>— Jordi Serra, LogiFast</p>
          </div>
        </div>

        {/* Right: pricing card */}
        <div style={{
          background: C.white, borderRadius: '20px', padding: isMobile ? '1.75rem 1.25rem' : '2.5rem',
          boxShadow: '0 8px 40px rgba(45,50,97,0.12)', border: `2px solid ${plan === 'annual' ? C.green : C.pastel}`,
          flex: '0 0 auto', width: '100%', maxWidth: isMobile ? '100%' : 340, boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}>
          {plan === 'annual' && (
            <div style={{ background: C.green, color: C.white, fontSize: '0.8rem', fontWeight: 700, padding: '0.35rem 1rem', borderRadius: '20px', display: 'inline-block', marginBottom: '1.5rem' }}>
              🎁 2 meses gratis
            </div>
          )}
          {plan === 'monthly' && (
            <div style={{ background: C.dark, color: C.white, fontSize: '0.8rem', fontWeight: 700, padding: '0.35rem 1rem', borderRadius: '20px', display: 'inline-block', marginBottom: '1.5rem' }}>
              €49 / mes
            </div>
          )}
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>
            MyCompi {plan === 'annual' ? 'Anual' : 'Profesional'}
          </h2>
          <p style={{ color: C.muted, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {plan === 'annual' ? 'Pago anual · 2 meses gratis incluidos' : 'Sin permanencia · Cancela cuando quieras'}
          </p>

          {/* Price display */}
          <div style={{ marginBottom: '1.5rem' }}>
            {plan === 'annual' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: C.green }}>€{annualAmount}</span>
                  <span style={{ color: C.muted, fontSize: '1rem' }}>/mes</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: C.muted }}>
                  Facturado como <strong>€{annualAmount * 12}/año</strong>
                </div>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: '#F0FFF4', borderRadius: '8px', borderLeft: `3px solid ${C.green}`, fontSize: '0.82rem', color: C.green, fontWeight: 600 }}>
                  💰 Ahorras €{annualSavings} frente a mensual
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: C.dark }}>€{monthlyAmount}</span>
                  <span style={{ color: C.muted, fontSize: '1rem' }}>/mes</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: C.muted }}>Sin permanencia · Cancela cuando quieras</div>
              </>
            )}
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.875rem' }}>{error}</div>
          )}

          <button onClick={handleContratar} disabled={loading}
            style={{
              width: '100%', padding: '1rem',
              background: plan === 'annual' ? C.green : C.yellow,
              color: plan === 'annual' ? C.white : C.dark,
              border: 'none', borderRadius: '10px',
              fontSize: '1.1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, fontFamily: 'inherit', marginBottom: '1rem',
              minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: plan === 'annual' ? '0 4px 14px rgba(34,197,94,0.35)' : 'none',
            }}>
            {loading
              ? 'Redirigiendo a Stripe...'
              : plan === 'annual'
                ? `Contratar anual → (€${annualAmount * 12}/año)`
                : 'Contratar ahora →'
            }
          </button>

          <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            Pago seguro con Stripe · {plan === 'annual' ? 'Renovación anual automática' : 'Cancela cuando quieras'}
          </p>

          <div style={{ borderTop: `1px solid ${C.pastel}`, paddingTop: '1.5rem' }}>
            <p style={{ color: C.muted, fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 600 }}>Incluye:</p>
            {['Acceso a los 6 Compis', 'Dashboard completo', 'Integración en 24h', 'Soporte email', 'Actualizaciones incluidas'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.yellow} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ color: '#374151', fontSize: '0.875rem' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
