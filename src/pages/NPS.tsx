// NPS SURVEY - Capture Net Promoter Score
import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', green: '#22C55E', red: '#DC2626' }

export default function NPS() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const companyId = searchParams.get('company')
  const initialScore = searchParams.get('score')

  if (initialScore && score === null) {
    setScore(parseInt(initialScore, 10))
    setSubmitted(true)
  }

  const handleVote = async (value: number) => {
    if (submitted) return
    setScore(value)
    setLoading(true)

    try {
      await fetch('https://guuimyx3.functions.insforge.app/nps-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, score: value })
      })
      setSubmitted(true)
    } catch (e) {
      console.error('NPS error:', e)
    } finally {
      setLoading(false)
    }
  }

  const getEmoji = (s: number) => {
    if (s <= 6) return '😞'
    if (s <= 8) return '😐'
    return '😃'
  }

  const getColor = (s: number) => {
    if (s <= 6) return C.red
    if (s <= 8) return C.yellow
    return C.green
  }

  const getLabel = (s: number) => {
    if (s <= 6) return 'Lo sentimos'
    if (s <= 8) return 'OK'
    return '¡Genial!'
  }

  return (
    <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 500, width: '100%' }}>
        <div style={{ background: '#000', borderRadius: '12px 12px 0 0', padding: '0.75rem 1.25rem', display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
          <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: 8 }}>nps survey</span>
        </div>

        <div style={{ background: C.white, borderRadius: '0 0 20px 20px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>
          {!submitted ? (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>
                ¿Cuánto nos recomendarías?
              </h1>
              <p style={{ color: C.muted, marginBottom: '2rem' }}>
                Tu respuesta es anónima y nos ayuda a mejorar.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => handleVote(n)} disabled={loading}
                    style={{
                      width: 48, height: 48,
                      background: n <= 6 ? '#FEE2E2' : n <= 8 ? '#FEF9C3' : '#DCFCE7',
                      border: `2px solid ${n <= 6 ? '#FECACA' : n <= 8 ? '#FDE68A' : '#86EFAC'}`,
                      borderRadius: 12,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}>
                    {n}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: '0.75rem', color: C.muted }}>
                1 = Nada probable · 10 = Extremadamente probable
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{score !== null ? getEmoji(score) : '😃'}</div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: score !== null ? getColor(score) : C.green, marginBottom: '0.5rem' }}>
                {score !== null ? getLabel(score) : '¡Genial!'}
              </h1>
              <p style={{ color: C.muted, marginBottom: '1.5rem' }}>
                {score !== null && score <= 6 ? 'Lamentamos no haber cumplido tus expectativas. Aprenderemos de esto.' :
                 score !== null && score <= 8 ? 'Gracias por tu feedback. Seguiremos mejorando.' :
                 '¡Gracias! Tu respuesta nos ayuda a crecer.'}
              </p>

              <button onClick={() => navigate('/dashboard')} style={{
                padding: '0.85rem 2rem',
                background: C.dark,
                color: C.yellow,
                border: 'none',
                borderRadius: 12,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                Ir a mi Dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}