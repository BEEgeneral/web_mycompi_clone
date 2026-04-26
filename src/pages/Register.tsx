import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { insforge } from '../lib/insforge'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', green: '#16A34A' }

export default function Register() {
  const navigate = useNavigate()
  const [step] = useState<'email' | 'done'>('email')
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.includes('@')) { setError('Email no valido'); return }
    if (form.password.length < 6) { setError('Minimo 6 caracteres'); return }
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/auth-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.email.split('@')[0],
          company: form.email.split('@')[0],
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Error en el registro')

      if (data.token) {
        sessionStorage.setItem('auth_token', data.token)
        sessionStorage.setItem('user', JSON.stringify(data.user))
      }

      navigate('/new')
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
      redirectTo: `${window.location.origin}/new`,
    }).then((result) => {
      if (result?.data?.url) window.location.href = result.data.url
      else setGoogleLoading(false)
    }).catch(() => setGoogleLoading(false))
  }

  if (step === 'done') {
    return (
      <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: C.dark, marginBottom: '1rem' }}>
            <span style={{ color: C.yellow }}>My</span>Compi
          </div>
          <p style={{ color: C.muted }}>Cuenta creada. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: C.dark }}>
            <span style={{ color: C.yellow }}>My</span>Compi
          </div>
          <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: '0.5rem' }}>Crea tu cuenta gratis</p>
        </div>

        <div style={{ background: C.white, borderRadius: 20, padding: '2rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <button disabled={googleLoading} onClick={handleGoogleRegister}
            style={{ width: '100%', padding: '0.85rem', background: googleLoading ? C.cream : C.white, color: googleLoading ? C.muted : C.dark, border: `2px solid ${C.pastel}`, borderRadius: 12, fontSize: '0.95rem', fontWeight: 600, cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: '1.25rem' }}>
            {googleLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: '1px', background: C.pastel }} />
            <span style={{ fontSize: '0.72rem', color: C.muted }}>o</span>
            <div style={{ flex: 1, height: '1px', background: C.pastel }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="tu@email.com" autoComplete="email"
              style={{ width: '100%', padding: '0.8rem 1rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: 10, fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Contrasena (minimo 6 caracteres)" autoComplete="new-password"
              style={{ width: '100%', padding: '0.8rem 1rem', background: C.cream, border: `1.5px solid ${C.pastel}`, borderRadius: 10, fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.9rem', background: loading ? C.pastel : C.dark, color: loading ? C.muted : C.yellow, border: 'none', borderRadius: 12, fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: C.muted, marginTop: '1rem' }}>
            Al registrarte aceptas <a href="/terminos" style={{ color: C.dark, fontWeight: 600 }}>terminos</a> y <a href="/privacidad" style={{ color: C.dark, fontWeight: 600 }}>privacidad</a>.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: C.muted, marginTop: '1.5rem' }}>
          Ya tienes cuenta? <a href="/login" style={{ color: C.dark, fontWeight: 700 }}>Entra aqui</a>
        </p>
      </div>
    </div>
  )
}