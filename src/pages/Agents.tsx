import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/api'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#16A34A' }

interface Agent {
  id: string
  name: string
  role: string
  title: string
  status: string
  icon: string
  capabilities: string
  color: string
  createdAt: string
}

const PRESET_COLORS = ['#f472b6', '#60a5fa', '#4ade80', '#fb923c', '#a78bfa', '#22d3ee', '#FFD054', '#2d3261']
const PRESET_ROLES = ['customer-service', 'marketing', 'sales', 'operations', 'data', 'tech', 'general']

export default function Agents() {
  const navigate = useNavigate()
  const session = getSession()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [form, setForm] = useState({ name: '', role: '', title: '', capabilities: '', color: '#60a5fa' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    fetchAgents()
  }, [session, navigate, page])

  const fetchAgents = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/agents-crud?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${session?.token ?? ''}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error cargando agentes')
      setAgents(data.agents || [])
      setTotal(data.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingAgent(null)
    setForm({ name: '', role: '', title: '', capabilities: '', color: '#60a5fa' })
    setShowModal(true)
  }

  const openEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setForm({ name: agent.name, role: agent.role, title: agent.title || '', capabilities: agent.capabilities || '', color: agent.color })
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditingAgent(null) }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const method = editingAgent ? 'PATCH' : 'POST'
      const body: Record<string, string> = { name: form.name, role: form.role, title: form.title, capabilities: form.capabilities, color: form.color }
      if (editingAgent) body.id = editingAgent.id

      const res = await fetch(`${EDGE_FUNCTIONS_URL}/agents-crud`, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.token ?? ''}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error guardando')
      closeModal()
      fetchAgents()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'idle' : 'active'
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/agents-crud`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.token ?? ''}` },
        body: JSON.stringify({ id: agent.id, status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetchAgents()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/agents-crud?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.token ?? ''}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDeleteConfirm(null)
      fetchAgents()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', background: C.dark, borderBottom: `3px solid ${C.yellow}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: C.pastel, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>← Dashboard</button>
          <span style={{ color: C.pastel, fontSize: '0.9rem' }}>/</span>
          <span style={{ color: C.white, fontSize: '0.9rem', fontWeight: 600 }}>Compis</span>
        </div>
        <button onClick={openCreate} style={{ padding: '0.4rem 1rem', background: C.yellow, border: 'none', borderRadius: '8px', color: C.dark, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit' }}>
          + Nuevo Compi
        </button>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.dark, margin: 0 }}>Tu equipo</h1>
            <p style={{ color: C.muted, fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{total} Compis configurados</p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.75rem 1rem', color: C.red, marginBottom: '1rem', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: C.muted }}>Cargando...</div>
        ) : agents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: C.white, borderRadius: '16px', border: `2px solid ${C.pastel}` }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: C.dark, marginBottom: '0.5rem' }}>No tienes Compis aún</p>
            <p style={{ color: C.muted, marginBottom: '1.5rem' }}>Crea tu primer Compi para empezar</p>
            <button onClick={openCreate} style={{ padding: '0.6rem 1.5rem', background: C.dark, color: C.yellow, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit' }}>
              Crear primer Compi
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {agents.map(agent => (
                <div key={agent.id} style={{ background: C.white, borderRadius: '14px', padding: '1rem 1.25rem', border: `2px solid ${C.pastel}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: agent.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', fontWeight: 800, color: C.white, flexShrink: 0
                  }}>
                    {agent.name.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.dark }}>{agent.name}</span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                        background: agent.status === 'active' ? `${C.green}22` : `${C.muted}22`,
                        color: agent.status === 'active' ? C.green : C.muted
                      }}>
                        {agent.status === 'active' ? '● Activo' : '○ Inactivo'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: C.muted, margin: '2px 0 0 0' }}>
                      {agent.title || agent.role}
                      {agent.capabilities && <span style={{ color: C.pastel }}> · {agent.capabilities.substring(0, 40)}{agent.capabilities.length > 40 ? '...' : ''}</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button onClick={() => handleToggleStatus(agent)} style={{
                      padding: '0.3rem 0.7rem', borderRadius: '8px', border: `1.5px solid ${C.pastel}`,
                      background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      color: agent.status === 'active' ? C.muted : C.green, fontFamily: 'inherit'
                    }}>
                      {agent.status === 'active' ? 'Pausar' : 'Activar'}
                    </button>
                    <button onClick={() => openEdit(agent)} style={{
                      padding: '0.3rem 0.7rem', borderRadius: '8px', border: `1.5px solid ${C.pastel}`,
                      background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      color: C.dark, fontFamily: 'inherit'
                    }}>
                      Editar
                    </button>
                    {deleteConfirm === agent.id ? (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: C.red }}>¿?</span>
                        <button onClick={() => handleDelete(agent.id)} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: 'none', background: C.red, color: C.white, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}>Sí</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: `1px solid ${C.pastel}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'inherit' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(agent.id)} style={{
                        padding: '0.3rem 0.7rem', borderRadius: '8px', border: `1.5px solid ${C.red}44`,
                        background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                        color: C.red, fontFamily: 'inherit'
                      }}>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: `1px solid ${C.pastel}`, background: page === 1 ? C.pastel : C.white, color: page === 1 ? C.muted : C.dark, cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>←</button>
                <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: C.muted }}>Página {page} de {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: `1px solid ${C.pastel}`, background: page === totalPages ? C.pastel : C.white, color: page === totalPages ? C.muted : C.dark, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>→</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: C.white, borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.dark, marginBottom: '1.5rem' }}>
              {editingAgent ? 'Editar Compi' : 'Nuevo Compi'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: C.dark, marginBottom: '0.3rem' }}>Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ej: Lucía" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: `2px solid ${C.pastel}`, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: C.dark, marginBottom: '0.3rem' }}>Rol *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: `2px solid ${C.pastel}`, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', background: C.cream, boxSizing: 'border-box' }}>
                  <option value="">Selecciona un rol</option>
                  {PRESET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: C.dark, marginBottom: '0.3rem' }}>Título</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Atención al Cliente" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: `2px solid ${C.pastel}`, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: C.dark, marginBottom: '0.3rem' }}>Capabilities</label>
                <input value={form.capabilities} onChange={e => setForm(f => ({ ...f, capabilities: e.target.value }))} placeholder="Ej: respond_premium,chat,email (separadas por coma)" style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: `2px solid ${C.pastel}`, fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: C.dark, marginBottom: '0.4rem' }}>Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(color => (
                    <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))} style={{
                      width: 32, height: 32, borderRadius: '50%', background: color, border: form.color === color ? `3px solid ${C.dark}` : '3px solid transparent',
                      cursor: 'pointer', outline: form.color === color ? `2px solid ${C.yellow}` : 'none', outlineOffset: '2px'
                    }} />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: C.cream, borderRadius: '12px', padding: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: C.white }}>
                  {form.name ? form.name.substring(0, 2).toUpperCase() : '??'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: C.dark, margin: 0 }}>{form.name || 'Nombre'}</p>
                  <p style={{ fontSize: '0.75rem', color: C.muted, margin: 0 }}>{form.title || form.role || 'Rol'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: `2px solid ${C.pastel}`, background: 'transparent', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: C.muted, fontFamily: 'inherit' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', background: saving ? C.muted : C.dark, color: C.yellow, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit' }}>
                  {saving ? 'Guardando...' : editingAgent ? 'Guardar cambios' : 'Crear Compi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
