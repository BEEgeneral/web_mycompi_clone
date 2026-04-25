import { useEffect, useState } from 'react'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

interface Decision {
  id: string
  question: string
  context?: string
  options?: string[]
  recommended?: string
  status: string
  expires_at?: string
  created_at: string
}

export default function Decisions() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deciding, setDeciding] = useState<string | null>(null)

  const loadDecisions = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/user-decisions?status=pending`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.decisions) setDecisions(data.decisions)
    } catch (e) {
      setError('Error cargando decisiones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDecisions() }, [])

  const decide = async (id: string, decision: string) => {
    setDeciding(id)
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/user-decisions?id=${id}&decision=${encodeURIComponent(decision)}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (res.ok) {
        setDecisions(prev => prev.filter(d => d.id !== id))
      }
    } catch (e) {
      setError('Error al registrar decisión')
    } finally {
      setDeciding(null)
    }
  }

  const skip = async (id: string) => {
    setDeciding(id)
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`${EDGE_FUNCTIONS_URL}/user-decisions?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      setDecisions(prev => prev.filter(d => d.id !== id))
    } catch (e) {
      setError('Error al saltar decisión')
    } finally {
      setDeciding(null)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">
    <div className="text-gray-500">Cargando decisiones...</div>
  </div>

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📋 Decisiones</h1>
          <button onClick={loadDecisions} className="text-sm text-blue-600 hover:text-blue-800">
            ↻ Actualizar
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {decisions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-lg font-medium">No hay decisiones pendientes</p>
            <p className="text-sm mt-1">Los agentes te pedirán aprobación cuando sea necesario.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {decisions.map(d => (
              <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-gray-900 font-medium text-lg mb-2">{d.question}</p>
                {d.context && <p className="text-gray-600 text-sm mb-3">{d.context}</p>}
                {d.options && d.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {d.options.map((opt, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{opt}</span>
                    ))}
                  </div>
                )}
                {d.recommended && (
                  <p className="text-sm text-blue-600 mb-3">💡 Recomendado: {d.recommended}</p>
                )}
                {d.expires_at && (
                  <p className="text-xs text-gray-400 mb-3">⏰ Caduca: {new Date(d.expires_at).toLocaleString('es-ES')}</p>
                )}
                <div className="flex gap-2 mt-4">
                  {d.options?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => decide(d.id, opt)}
                      disabled={deciding === d.id}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      {deciding === d.id ? '...' : opt}
                    </button>
                  ))}
                  <button
                    onClick={() => decide(d.id, d.recommended || 'skipped')}
                    disabled={deciding === d.id}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
                  >
                    {deciding === d.id ? '...' : '✓ Aceptar'}
                  </button>
                  <button
                    onClick={() => skip(d.id)}
                    disabled={deciding === d.id}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Saltar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
