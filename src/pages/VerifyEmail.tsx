import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { saveSession, resendVerificationCode } from '../lib/api'
import { insforge } from '../lib/insforge'
import type { User } from '../lib/api'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#16A34A' }

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email || sessionStorage.getItem('pending_email') || ''
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[idx] = val
    setCode(next)
    if (error) setError('')
    if (val && idx < 5) {
      const inputs = document.querySelectorAll<HTMLInputElement>('.code-input')
      inputs[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      const inputs = document.querySelectorAll<HTMLInputElement>('.code-input')
      inputs[idx - 1]?.focus()
    }
    if (e.key === 'Enter') {
      document.querySelector<HTMLButtonElement>('[data-submit]')?.click()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array(6).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setCode(next)
    if (pasted.length === 6) {
      const inputs = document.querySelectorAll<HTMLInputElement>('.code-input')
      inputs[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = code.join('')
    if (otp.length < 6) { setError('Faltan dígitos. Revisa el código.'); return }
    setError('')
    setLoading(true)
    try {
      const { error: verifyErr } = await insforge.auth.verifyEmail({ email, otp })
      if (verifyErr) throw new Error(verifyErr.message)

      const storedToken = sessionStorage.getItem('pending_token')
      const userId = sessionStorage.getItem('pending_user')

      if (storedToken && userId) {
        const parsedUser = JSON.parse(userId) as User
        saveSession(storedToken, parsedUser)
        sessionStorage.removeItem('pending_token')
        navigate('/onboarding')
        return
      }

      const { data: sessData } = await insforge.auth.getCurrentUser()
      const accessToken = (sessData as any)?.session?.access_token || (sessData as any)?.access_token
      const user = (sessData as any)?.user as User
      if (!accessToken) throw new Error('No se pudo iniciar sesión después de la verificación')

      saveSession(accessToken, user || { id: email, email })
      navigate('/onboarding')
    } catch (err: any) {
      setError(err.message || 'Código incorrecto. Revisa el email e intenta de nuevo.')
      setCode(['', '', '', '', '', ''])
      setTimeout(() => document.querySelector<HTMLInputElement>('.code-input')?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setResendSuccess(false)
    setError('')
    try {
      await resendVerificationCode(email)
      setResendSuccess(true)
      setResendTimer(60)
      const interval = setInterval(() => {
        setResendTimer(t => {
          if (t <= 1) { clearInterval(interval); return 0 }
          return t - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'No se pudo reenviar. Intenta en unos segundos.')
    }
  }

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        background: C.white, borderRadius: '20px', padding: '2.25rem',
        width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(45,50,97,0.1)',
        animation: 'fadeUp 0.4s ease-out', textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, background: `${C.yellow}22`, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.dark, marginBottom: '0.4rem' }}>
          Revisa tu correo
        </h1>
        <p style={{ color: C.muted, fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '0.4rem' }}>
          Hemos enviado un código de verificación a
        </p>
        <p style={{ fontSize: '0.95rem', fontWeight: 700, color: C.dark, marginBottom: '1.75rem', wordBreak: 'break-all' }}>
          {email || 'tu email'}
        </p>

        {/* Success after resend */}
        {resendSuccess && (
          <div style={{ background: '#F0FDF4', border: `1.5px solid ${C.green}`, borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', color: C.green, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            ✓ Código reenviado. Revisa tu bandeja.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
            padding: '0.65rem 0.9rem', marginBottom: '1rem', color: C.red, fontSize: '0.82rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
            animation: error.includes('incorrecto') || error.includes('Faltan') ? 'shake 0.4s ease' : 'none',
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Code inputs */}
        <form onSubmit={handleSubmit}>
          <div
            style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}
            onPaste={handlePaste}
          >
            {code.map((ch, i) => (
              <input
                key={i}
                className="code-input"
                value={ch}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
                autoFocus={i === 0}
                style={{
                  width: 46, height: 54,
                  textAlign: 'center', fontSize: '1.35rem', fontWeight: 800,
                  background: code[i] ? C.dark : C.cream,
                  border: code[i] ? 'none' : `2px solid ${C.pastel}`,
                  borderRadius: '10px', color: code[i] ? C.yellow : C.dark,
                  fontFamily: 'inherit', caretColor: C.yellow,
                  transition: 'all 0.15s ease',
                  boxShadow: code[i] ? '0 2px 8px rgba(45,50,97,0.3)' : 'none',
                }}
              />
            ))}
          </div>

          <button
            data-submit
            type="submit"
            disabled={loading || code.join('').length < 6}
            style={{
              width: '100%', padding: '0.85rem',
              background: (loading || code.join('').length < 6) ? C.pastel : C.dark,
              color: (loading || code.join('').length < 6) ? C.muted : C.yellow,
              border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700,
              cursor: (loading || code.join('').length < 6) ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <><div style={{ width: 16, height: 16, border: `2px solid ${C.muted}`, borderTopColor: C.yellow, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Verificando...</>
            ) : 'Verificar email →'}
          </button>
        </form>

        {/* Resend */}
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', color: C.muted }}>¿No lo recibiste?</span>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            style={{
              background: 'none', border: 'none',
              color: resendTimer > 0 ? C.muted : C.dark,
              fontWeight: 700, cursor: resendTimer > 0 ? 'default' : 'pointer',
              fontSize: '0.8rem', fontFamily: 'inherit', padding: 0,
              textDecoration: resendTimer === 0 ? 'underline' : 'none',
            }}
          >
            {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar código'}
          </button>
        </div>

        <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: C.muted }}>
          <Link to="/registro" style={{ color: C.muted, textDecoration: 'none' }}>← Cambiar email</Link>
        </p>
      </div>
    </div>
  )
}