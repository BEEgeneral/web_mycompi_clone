import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../lib/api'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF' }

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token) setError('Token de recuperación no válido o expirado.')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError('')
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      await resetPassword(password, token)
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'No se pudo restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ background: C.white, borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 32px rgba(45,50,97,0.08)' }}>
        {!done ? (
          <>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>
              <span style={{ color: C.yellow }}>My</span>Compi
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: C.dark, marginBottom: '1.5rem' }}>Nueva contraseña</h1>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: '#DC2626', fontSize: '0.875rem' }}>{error}</div>
            )}

            {token ? (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nueva contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Mínimo 8 caracteres"
                    style={{ width: '100%', padding: '0.7rem 1rem', background: C.cream, border: `1px solid ${C.pastel}`, borderRadius: '8px', color: C.dark, fontSize: '0.95rem', fontFamily: 'inherit' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Repetir contraseña</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repite la contraseña"
                    style={{ width: '100%', padding: '0.7rem 1rem', background: C.cream, border: `1px solid ${C.pastel}`, borderRadius: '8px', color: C.dark, fontSize: '0.95rem', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '0.8rem', background: C.dark, color: C.white, border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            ) : (
              <p style={{ color: C.muted, fontSize: '0.9rem', textAlign: 'center' }}>Token no disponible. <Link to="/recuperar" style={{ color: C.dark, fontWeight: 600 }}>Solicita uno nuevo</Link>.</p>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: `${C.yellow}22`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: C.dark, marginBottom: '0.5rem' }}>Contraseña actualizada</h1>
            <p style={{ color: C.muted, fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Tu contraseña ha sido actualizada. Redirigiendo al login...
            </p>
          </div>
        )}

        <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.875rem', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: C.dark, textDecoration: 'none', fontWeight: 600 }}>← Volver al login</Link>
        </p>
      </div>
    </div>
  )
}
