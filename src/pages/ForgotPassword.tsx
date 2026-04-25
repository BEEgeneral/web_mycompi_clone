import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendResetPasswordEmail } from '../lib/api'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#22C55E' }
const LOGO_URL = 'https://mycompi.com/logo.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendResetPasswordEmail(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Error al enviar el email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ background: C.white, borderRadius: 20, padding: '2.5rem', maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(45,50,97,0.1)', animation: 'fadeUp 0.4s ease-out' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📧</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>Email enviado</h1>
          <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Hemos enviado un enlace de recuperación a <strong style={{ color: C.dark }}>{email}</strong>. Revisa tu bandeja de entrada.
          </p>
          <Link to="/login" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: C.dark, color: C.yellow, borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } } @keyframes spin { to { transform: rotate(360deg); } } input:focus { outline: 2px solid ${C.yellow}; border-color: ${C.yellow} !important; }`}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1.2rem', background: C.dark, borderBottom: `3px solid ${C.yellow}`, zIndex: 10 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <img src={LOGO_URL} alt="MyCompi" style={{ height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: C.white }}><span style={{ color: C.yellow }}>My</span>Compi</span>
        </Link>
        <Link to="/login" style={{ color: C.yellow, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>← Volver</Link>
      </nav>

      <div style={{ background: C.white, borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(45,50,97,0.1)', animation: 'fadeUp 0.4s ease-out', marginTop: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔑</span>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.dark }}>Recuperar contraseña</h1>
        </div>
        <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Te enviaremos un enlace para restablecer tu contraseña. Llegará en menos de 2 minutos.
        </p>

        {error && (
          <div style={{ background: '#FEF2F2', border: `1px solid #FECACA`, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: C.red, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            autoComplete="email"
            style={{ width: '100%', padding: '0.75rem 1rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: 10, color: C.dark, fontSize: '0.95rem', fontFamily: 'inherit', marginBottom: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', background: loading ? C.pastel : C.dark, color: loading ? C.muted : C.yellow,
              border: 'none', borderRadius: 10, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <><div style={{ width: 16, height: 16, border: `2px solid ${C.muted}`, borderTopColor: C.yellow, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Enviando...</>
            ) : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: C.muted }}>
            ¿Recordaste tu contraseña? <Link to="/login" style={{ color: C.dark, fontWeight: 700 }}>Entra aquí</Link>
          </p>
        </div>
      </div>
    </div>
  )
}