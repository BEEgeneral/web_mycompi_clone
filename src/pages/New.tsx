import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/api'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', green: '#22C55E' }

type Step = 'choice' | 'new-company' | 'existing-company' | 'generating' | 'idea-ready'

export default function New() {
  const navigate = useNavigate()
  const session = getSession()
  const [step, setStep] = useState<Step>('choice')
  const [companyUrl, setCompanyUrl] = useState('')
  const [userIdea, setUserIdea] = useState('')
  
  const [, setGenerating] = useState(false)
  const [idea, setIdea] = useState<any>(null)
  const [error, setError] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    if (!session) navigate('/login')
  }, [session, navigate])

  useEffect(() => {
    if (step !== 'generating') return
    const interval = setInterval(() => {
      setMsgIdx(i => i < 4 ? i + 1 : i)
    }, 2000)
    return () => clearInterval(interval)
  }, [step])

  const handleNewCompany = () => {
    setCompanyName(session?.user?.email?.split('@')[0] || 'MiEmpresa')
    setStep('new-company')
  }

  const handleGrowCompany = () => setStep('existing-company')

  const generateIdea = async (promptData: any, fallbackStep: Step) => {
    setGenerating(true)
    setStep('generating')
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/idea-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData)
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setIdea(data.idea || data)
      setStep('idea-ready')
    } catch (e: any) {
      setError(e.message || 'Error')
      setStep(fallbackStep)
    } finally {
      setGenerating(false)
    }
  }

  const handleSurpriseMe = () => {
    generateIdea({ action: 'generate_idea', sector: 'otro', companyName: companyName, language: 'es' }, 'new-company')
  }

  const handleBuildMyIdea = () => {
    if (!userIdea.trim()) return
    generateIdea({ action: 'build_idea', userIdea, sector: 'otro', language: 'es' }, 'new-company')
  }

  const handleAnalyzeWebsite = () => {
    if (!companyUrl.trim()) return
    generateIdea({ action: 'analyze_website', website: companyUrl, language: 'es' }, 'existing-company')
    navigate('/dashboard', { state: { website: companyUrl } })
  }

  const handleAcceptIdea = () => navigate('/dashboard')
  const handleTryAgain = () => { setIdea(null); setStep('new-company') }

  const messages = ['Analizando mercado...', 'Identificando oportunidades...', 'Evaluando competencia...', 'Construyendo propuesta...', 'Idea lista!']

  // Generating
  if (step === 'generating') {
    return (
      <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ background: '#000', borderRadius: '12px 12px 0 0', padding: '0.75rem 1.25rem', display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
            <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: 8 }}>mycompi</span>
          </div>
          <div style={{ background: '#000', borderRadius: '0 0 12px 12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ color: '#27C93F', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 2 }}>
              <div>&gt; &gt; &gt; {messages[msgIdx]}</div>
            </div>
          </div>
          <div style={{ width: 48, height: 48, border: `4px solid ${C.pastel}`, borderTopColor: C.dark, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: C.muted, fontSize: '0.9rem', marginTop: '1rem' }}>Procesando...</p>
        </div>
      </div>
    )
  }

  // Idea ready
  if (step === 'idea-ready' && idea) {
    return (
      <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', padding: '2rem' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ background: '#000', borderRadius: '12px 12px 0 0', padding: '0.75rem 1.25rem', display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
            <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: 8 }}>tu oportunidad</span>
          </div>
          <div style={{ background: C.white, borderRadius: '0 0 16px 16px', padding: '2rem', boxShadow: '0 8px 40px rgba(45,50,97,0.12)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', color: C.green, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Idea de negocio</p>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.dark, marginBottom: '0.5rem' }}>{idea.name || 'Tu idea'}</h1>
              <p style={{ fontSize: '1rem', color: C.green, fontWeight: 600 }}>{idea.tagline || ''}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Descripcion', value: idea.description },
                { label: 'Problema', value: idea.problem },
                { label: 'Solucion', value: idea.solution },
                { label: 'Cliente ideal', value: idea.target },
                { label: 'Ingresos', value: idea.revenue },
                { label: 'Diferencial', value: idea.diferencial },
              ].map(item => (
                <div key={item.label} style={{ background: C.cream, borderRadius: 10, padding: '0.85rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{item.label}</p>
                  <p style={{ fontSize: '0.85rem', color: C.dark }}>{item.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleTryAgain} style={{ flex: 1, padding: '0.85rem', background: C.white, color: C.dark, border: `2px solid ${C.pastel}`, borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Generar otra</button>
              <button onClick={handleAcceptIdea} style={{ flex: 2, padding: '0.85rem', background: C.dark, color: C.yellow, border: 'none', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Aceptar y continuar</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Choice
  if (step === 'choice') {
    return (
      <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <div style={{ background: '#000', borderRadius: '12px 12px 0 0', padding: '0.75rem 1.25rem', display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
            <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: 8 }}>mycompi setup</span>
          </div>
          <div style={{ background: C.white, borderRadius: '0 0 20px 20px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>Que quieres hacer?</h1>
            <p style={{ color: C.muted, fontSize: '0.85rem', marginBottom: '2rem' }}>Elige como quieres empezar</p>
            <button onClick={handleNewCompany} style={{ width: '100%', padding: '1.25rem', background: C.dark, color: C.white, border: 'none', borderRadius: 14, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.4rem' }}>
              Crear empresa nueva
            </button>
            <p style={{ fontSize: '0.75rem', color: C.muted, marginBottom: '1.5rem' }}>Empezar desde cero</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: C.pastel }} />
              <span style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600 }}>o</span>
              <div style={{ flex: 1, height: '1px', background: C.pastel }} />
            </div>
            <button onClick={handleGrowCompany} style={{ width: '100%', padding: '1.25rem', background: C.white, color: C.dark, border: `2px solid ${C.dark}`, borderRadius: 14, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Hacer crecer mi empresa
            </button>
            <p style={{ fontSize: '0.75rem', color: C.muted }}>Ya tienes un negocio</p>
          </div>
        </div>
      </div>
    )
  }

  // New company
  if (step === 'new-company') {
    return (
      <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', padding: '2rem' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: '#000', borderRadius: '12px 12px 0 0', padding: '0.75rem 1.25rem', display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
            <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: 8 }}>nueva empresa</span>
          </div>
          <div style={{ background: C.white, borderRadius: '0 0 20px 20px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>
            <button onClick={() => setStep('choice')} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>Volver</button>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>Como quieres empezar?</h1>
            <p style={{ color: C.muted, fontSize: '0.85rem', marginBottom: '2rem' }}>Deja que MyCompi te sorprenda o desarrolla tu propia idea</p>
            {error && <p style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
            <button onClick={handleSurpriseMe} style={{ width: '100%', padding: '1.5rem', background: C.dark, color: C.white, border: 'none', borderRadius: 14, fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '0.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>Sorprendeme</button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: C.muted, marginBottom: '1.5rem' }}>MyCompi genera una oportunidad para ti</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: C.pastel }} />
              <span style={{ color: C.muted, fontSize: '0.75rem', fontWeight: 600 }}>o</span>
              <div style={{ flex: 1, height: '1px', background: C.pastel }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: C.dark }}>Ya tienes tu idea?</p>
              <textarea value={userIdea} onChange={e => setUserIdea(e.target.value)} placeholder="Escribe tu idea aqui..." rows={3} style={{ width: '100%', padding: '0.85rem', background: C.cream, border: `2px solid ${C.pastel}`, borderRadius: 12, fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleBuildMyIdea} disabled={!userIdea.trim()} style={{ width: '100%', padding: '0.95rem', background: !userIdea.trim() ? C.pastel : C.green, color: C.white, border: 'none', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, cursor: !userIdea.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: !userIdea.trim() ? 0.7 : 1 }}>Desarrollar mi idea</button>
          </div>
        </div>
      </div>
    )
  }

  // Existing company
  if (step === 'existing-company') {
    return (
      <div style={{ fontFamily: 'Poppins, system-ui, sans-serif', background: C.cream, minHeight: '100dvh', padding: '2rem' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ background: '#000', borderRadius: '12px 12px 0 0', padding: '0.75rem 1.25rem', display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
            <span style={{ color: '#666', fontSize: '0.75rem', marginLeft: 8 }}>hacer crecer</span>
          </div>
          <div style={{ background: C.white, borderRadius: '0 0 20px 20px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(45,50,97,0.1)' }}>
            <button onClick={() => setStep('choice')} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>Volver</button>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.dark, marginBottom: '0.5rem' }}>Cual es tu web?</h1>
            <p style={{ color: C.muted, fontSize: '0.85rem', marginBottom: '2rem' }}>Analizamos tu negocio y configuramos los Compis</p>
            {error && <p style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
            <div style={{ marginBottom: '1.25rem' }}>
              <input type="url" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} placeholder="tuweb.com" style={{ width: '100%', padding: '1rem', background: C.cream, border: `2px solid ${C.pastel}`, borderRadius: 12, fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleAnalyzeWebsite} disabled={!companyUrl.trim()} style={{ width: '100%', padding: '0.95rem', background: !companyUrl.trim() ? C.pastel : C.dark, color: C.white, border: 'none', borderRadius: 12, fontSize: '0.95rem', fontWeight: 700, cursor: !companyUrl.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: !companyUrl.trim() ? 0.7 : 1 }}>Analizar y continuar</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}