import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../lib/api'
import { insforge } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#16A34A' }

const BENEFITS = [
  { icon: '🤖', text: 'Equipo IA adaptado a tu sector' },
  { icon: '⚡', text: 'Listo en 5 minutos, sin técnicos' },
  { icon: '🛡️', text: '5 días gratis — sin compromiso' },
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'done'>('form')
  const [form, setForm] = useState({ nombre: '', email: '', password: '', nombreEmpresa: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (!form.email.includes('@')) { setError('Email no válido'); return }
    setError('')
    setLoading(true)
    try {
      const result = await register(form)
      if (result.requireEmailVerification) {
        sessionStorage.setItem('pending_email', form.email)
        navigate('/verificar-email', { state: { email: form.email } })
      } else {
        setStep('done')
      }
    } catch (err: any) {
      setError(err.message || 'Error en el registro')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleRegister = () => {
    setGoogleLoading(true)
    insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: `${window.location.origin}/login`,
      skipBrowserRedirect: true,
    }).then((result) => {
      if (result?.data?.url) window.location.href = result.data.url
      else setGoogleLoading(false)
    }).catch(() => setGoogleLoading(false))
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', WebkitFontSmoothing: 'antialiased' }}>
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        `}</style>
        <div style={{ textAlign: 'center', maxWidth: 460, animation: 'fadeUp 0.5s ease-out' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', background: C.yellow,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.75rem', fontSize: '2.8rem', animation: 'pulse 2s infinite',
          }}>🎉</div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.dark, marginBottom: '0.6rem' }}>
            ¡Bienvenido a MyCompi!
          </h1>
          <p style={{ color: C.muted, fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Tu cuenta está creada. Tienes <strong style={{ color: C.dark }}>5 días gratis</strong> para probar todo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: C.dark, color: C.yellow, border: 'none', padding: '0.9rem 2.5rem', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Ir a mi dashboard →
            </button>
            <button onClick={() => navigate('/onboarding')} style={{ background: C.white, color: C.dark, border: `2px solid ${C.pastel}`, padding: '0.75rem 2rem', borderRadius: 12, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Configurar mi equipo IA
            </button>
          </div>
          <p style={{ color: C.muted, fontSize: '0.78rem', marginTop: '1.5rem' }}>
            No te cobraremos nada durante los 5 días de trial
          </p>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input:focus { outline: 2px solid ${C.yellow}; border-color: ${C.yellow} !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', gap: '2rem', width: '100%', maxWidth: 880, alignItems: 'flex-start', flexWrap: 'wrap' as const }}>

        {/* Left — social proof */}
        <div style={{ flex: '1 1 280px', animation: 'fadeUp 0.4s ease-out' }}>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: C.dark, marginBottom: '0.4rem' }}>
            <span style={{ color: C.yellow }}>My</span>Compi
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: C.dark, lineHeight: 1.3, marginBottom: '1.5rem' }}>
            Tu primer Compi<br />ya te está esperando
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '2rem' }}>
            {BENEFITS.map(b => (
              <div key={b.icon} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{b.icon}</span>
                <span style={{ fontSize: '0.88rem', color: C.dark, lineHeight: 1.4 }}>{b.text}</span>
              </div>
            ))}
          </div>
          <div style={{ background: C.white, borderRadius: 14, padding: '1.1rem 1.25rem', boxShadow: '0 2px 16px rgba(45,50,97,0.08)' }}>
            <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: 1.6, fontStyle: 'italic' }}>
              "MyCompi me ahorra 3 horas al día. Tengo un equipo que trabaja mientras yo duermo."
            </p>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: C.dark, marginTop: '0.6rem' }}>— Marta R., fundadora</p>
          </div>
          <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '1.5rem' }}>
            ← ¿Ya tienes cuenta? <Link to="/login" style={{ color: C.dark, fontWeight: 700 }}>Entra aquí</Link>
          </p>
        </div>

        {/* Right — form */}
        <div style={{ flex: '1 1 340px', background: C.white, borderRadius: '20px', padding: '2.25rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)', animation: 'fadeUp 0.5s 0.1s ease-out both' }}>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '1rem', color: C.red, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nombre</label>
              <input name="nombre" type="text" value={form.nombre} onChange={handleChange} required placeholder="Tu nombre" autoComplete="name"
                style={{ width: '100%', padding: '0.7rem 0.9rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" autoComplete="email"
                style={{ width: '100%', padding: '0.7rem 0.9rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Contraseña <span style={{ color: C.muted, fontWeight: 400, fontSize: '0.72rem' }}>(mín. 6 caracteres)</span>
              </label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Crea tu contraseña" autoComplete="new-password"
                style={{ width: '100%', padding: '0.7rem 0.9rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                Empresa <span style={{ color: C.muted, fontWeight: 400 }}>(opcional)</span>
              </label>
              <input name="nombreEmpresa" type="text" value={form.nombreEmpresa} onChange={handleChange} placeholder="Nombre de tu empresa"
                style={{ width: '100%', padding: '0.7rem 0.9rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '0.85rem', marginTop: '0.4rem',
                background: loading ? C.pastel : C.dark, color: loading ? C.muted : C.yellow,
                border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
              }}>
              {loading ? (
                <><div style={{ width: 16, height: 16, border: `2px solid ${C.muted}`, borderTopColor: C.yellow, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Creando cuenta...</>
              ) : 'Crear mi cuenta gratis →'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: C.pastel }} />
            <span style={{ fontSize: '0.72rem', color: C.muted }}>o</span>
            <div style={{ flex: 1, height: '1px', background: C.pastel }} />
          </div>

          <button disabled={googleLoading} onClick={handleGoogleRegister}
            style={{ width: '100%', padding: '0.75rem', background: googleLoading ? C.cream : C.white, color: googleLoading ? C.muted : C.dark, border: `2px solid ${C.pastel}`, borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
            {googleLoading ? (
              <><div style={{ width: 15, height: 15, border: `2px solid ${C.pastel}`, borderTopColor: C.dark, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Conectando...</>
            ) : (
              <><svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>Continuar con Google</>
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: C.muted, marginTop: '1.1rem', lineHeight: 1.5 }}>
            Al registrarte aceptas nuestros <Link to="/terminos" style={{ color: C.dark, fontWeight: 600 }}>términos</Link> y <Link to="/privacidad" style={{ color: C.dark, fontWeight: 600 }}>privacidad</Link>.
          </p>
        </div>

      </div>
    </div>
  )
}