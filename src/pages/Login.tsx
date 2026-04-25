import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login, saveSession } from '../lib/api'
import { insforge } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626' }

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextUrl = searchParams.get('next') || '/dashboard'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')

  // Recovery from OAuth redirect
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const msg = decodeURIComponent(errorParam)
      if (msg.includes('popup_closed') || msg.includes('cancelled')) {
        setGoogleError('Ventana cerrada. Intenta de nuevo.')
      } else {
        setGoogleError(msg)
      }
      // Clean URL without refresh
      window.history.replaceState({}, '', '/login')
    }
    // Check for OAuth session — InsForge may have set a session cookie/token
    const sessionParam = searchParams.get('session')
    if (sessionParam) {
      try {
        const sessionData = JSON.parse(atob(sessionParam))
        if (sessionData.accessToken && sessionData.user) {
          saveSession(sessionData.accessToken, sessionData.user)
          window.history.replaceState({}, '', '/dashboard')
          navigate('/dashboard')
        }
      } catch { /* ignore */ }
    }
  }, [searchParams, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form.email, form.password)
      saveSession(res.accessToken, res.user)
      navigate(nextUrl)
    } catch (err: any) {
      setError(err.message || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    setGoogleError('')
    setGoogleLoading(true)
    // Encode return URL to preserve next param
    const returnTo = `${window.location.origin}/login?next=${encodeURIComponent(nextUrl)}`
    try {
      insforge.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: returnTo,
        skipBrowserRedirect: true,
      }).then((result) => {
        if (result?.data?.url) window.location.href = result.data.url
        else setGoogleLoading(false)
      }).catch((err: any) => {
        setGoogleLoading(false)
        const msg = err?.message || ''
        if (msg.includes('popup') || msg.includes('closed')) {
          setGoogleError('Ventana cerrada. Intenta de nuevo.')
        } else if (msg.includes('redirect_uri')) {
          setGoogleError('Configuración OAuth pendiente. Usa email y contraseña.')
        } else {
          setGoogleError('Error con Google. Intenta de nuevo.')
        }
      })
    } catch (err: any) {
      setGoogleLoading(false)
      setGoogleError('No se pudo iniciar Google.')
    }
  }

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input:focus { outline: 2px solid ${C.yellow}; border-color: ${C.yellow} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        background: C.white, borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '420px',
        boxShadow: '0 8px 40px rgba(45,50,97,0.1)', animation: 'fadeUp 0.4s ease-out'
      }}>

        {/* Logo + tagline */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: C.dark, marginBottom: '0.35rem' }}>
            <span style={{ color: C.yellow }}>My</span>Compi
          </div>
          <p style={{ color: C.muted, fontSize: '0.9rem' }}>Tu equipo IA siempre disponible</p>
        </div>

        {/* Google error */}
        {googleError && (
          <div style={{ background: '#FEF9EC', border: `1.5px solid ${C.yellow}`, borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', color: C.dark, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span>{googleError}</span>
          </div>
        )}

        {/* Login error */}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', color: C.red, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: C.dark, marginBottom: '0.35rem' }}>Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange} required
              placeholder="tu@email.com" autoComplete="email"
              style={{ width: '100%', padding: '0.75rem 1rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: '10px', color: C.dark, fontSize: '0.92rem', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: C.dark }}>Contraseña</label>
              <Link to="/recuperar" style={{ color: C.muted, fontWeight: 500, fontSize: '0.75rem', textDecoration: 'none' }}>¿La olvidaste?</Link>
            </div>
            <input
              name="password" type="password" value={form.password} onChange={handleChange} required
              placeholder="Tu contraseña" autoComplete="current-password"
              style={{ width: '100%', padding: '0.75rem 1rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: '10px', color: C.dark, fontSize: '0.92rem', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', marginTop: '0.4rem',
              background: loading ? C.pastel : C.dark, color: loading ? C.muted : C.white,
              border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: `2px solid ${C.muted}`, borderTopColor: C.white, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Entrando...
              </>
            ) : 'Entrar →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: C.pastel }} />
          <span style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 500 }}>o</span>
          <div style={{ flex: 1, height: '1px', background: C.pastel }} />
        </div>

        {/* Google */}
        <button
          disabled={googleLoading}
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '0.8rem',
            background: googleLoading ? C.cream : C.white,
            color: googleLoading ? C.muted : C.dark,
            border: `2px solid ${googleLoading ? C.pastel : C.pastel}`,
            borderRadius: '12px', fontSize: '0.92rem', fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            transition: 'all 0.15s',
          }}
        >
          {googleLoading ? (
            <>
              <div style={{ width: 16, height: 16, border: `2px solid ${C.pastel}`, borderTopColor: C.dark, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Conectando con Google...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Continuar con Google
            </>
          )}
        </button>

        {/* Register link */}
        <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.875rem', marginTop: '1.5rem' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" style={{ color: C.dark, fontWeight: 700, textDecoration: 'none' }}>Regístrate gratis →</Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/" style={{ color: C.muted, fontSize: '0.8rem', textDecoration: 'none' }}>← Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}