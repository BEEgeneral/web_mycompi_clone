import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/api'
import { API_URL, EDGE_FUNCTIONS_URL } from '../lib/insforge'
import { logApiError } from '../lib/logger'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF', red: '#DC2626', green: '#22C55E', blue: '#3B82F6', purple: '#7C3AED', orange: '#F97316', pink: '#EC4899' }

// ─── Types ────────────────────────────────────────────────────────────────
interface WikiPage { id: string; page_name: string; content: string; created_at: string; updated_at: string }
interface DrawerEntry { id: string; agent_id: string; role: string; content: string; created_at: string }

// ─── Graph View (D3 Force) ─────────────────────────────────────────────────
function GraphView({ pages, onPageClick }: { pages: WikiPage[]; onPageClick?: (page: WikiPage) => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || pages.length === 0) return
    import('d3').then(d3 => {
      const container = containerRef.current!
      const width = container.offsetWidth || 600
      const height = 340

      d3.select(container).selectAll('*').remove()

      const svg = d3.select(container).append('svg')
        .attr('width', width).attr('height', height)
        .style('background', C.cream)
        .style('border-radius', '12px')

      const g = svg.append('g')
      const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]).on('zoom', (event: any) => {
        g.attr('transform', event.transform)
      })
      svg.call(zoom)

      const words = pages.flatMap(p => (p.page_name + ' ' + p.content).toLowerCase().split(/\s+/).filter(w => w.length > 4))
      const wordCounts: Record<string, number> = {}
      words.forEach((w: string) => { wordCounts[w] = (wordCounts[w] || 0) + 1 })
      const topWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 20)
      const hubs = topWords.map(([word]) => ({ id: word, type: 'topic' as const, radius: 5 + Math.min(wordCounts[word] * 2, 12), count: wordCounts[word] }))

      const allNodes: any[] = [
        ...pages.map(p => ({ id: p.id, label: p.page_name, page: p, type: 'page' as const, radius: 14 })),
        ...hubs
      ]

      const links: any[] = []
      pages.forEach(p => {
        const text = (p.page_name + ' ' + p.content).toLowerCase()
        hubs.forEach((h: any) => { if (text.includes(h.id)) links.push({ source: p.id, target: h.id }) })
      })

      const sim = d3.forceSimulation(allNodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(50))
        .force('charge', d3.forceManyBody().strength(-60))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius((d: any) => d.radius + 5))

      const link = g.append('g').selectAll('line').data(links).join('line')
        .attr('stroke', C.pastel).attr('stroke-width', 1.5).attr('stroke-opacity', 0.5)

      const node = g.append('g').selectAll('g').data(allNodes).join('g')
        .style('cursor', (d: any) => d.type === 'page' ? 'pointer' : 'default')
        .on('click', (event: any, d: any) => {
          if (d.type === 'page' && onPageClick) { event.stopPropagation(); onPageClick(d.page) }
        })
        .call(d3.drag<any, any>().on('start', (event: any, d: any) => {
          if (!event.active) sim.alphaTarget(0.3).restart()
          d.fx = d.x; d.fy = d.y
        }).on('drag', (event: any, d: any) => { d.fx = event.x; d.fy = event.y }).on('end', (event: any, d: any) => {
          if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null
        }))

      node.append('circle')
        .attr('r', (d: any) => d.radius)
        .attr('fill', (d: any) => d.type === 'page' ? C.purple + '33' : C.yellow + '88')
        .attr('stroke', (d: any) => d.type === 'page' ? C.purple : C.dark)
        .attr('stroke-width', 2)

      node.append('text')
        .text((d: any) => d.type === 'page' ? d.label.slice(0, 14) : '#' + d.id.slice(0, 6))
        .attr('text-anchor', 'middle').attr('dy', (d: any) => d.radius + 12)
        .attr('font-size', '9px').attr('fill', C.muted)
        // @ts-ignore
        .each(function(this: SVGGElement, d: any) {
          const self = d3.select(this)
          if (d.type === 'page') self.attr('font-weight', '700').attr('fill', C.dark).attr('font-size', '10px')
        })

      sim.on('tick', () => {
        link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      })
    })
  }, [pages, onPageClick])

  return <div ref={containerRef} style={{ width: '100%', minHeight: 340 }} />
}

// ─── Main Brain Page ──────────────────────────────────────────────────────
export default function Brain() {
  const navigate = useNavigate()
  const session = getSession()
  const [pages, setPages] = useState<WikiPage[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [drawer, setDrawer] = useState<DrawerEntry[]>([])
  const [activeTab, setActiveTab] = useState<'wiki' | 'graph' | 'memory' | 'sessions'>('wiki')
  const [search, setSearch] = useState('')
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [newPageName, setNewPageName] = useState('')
  const [newPageContent, setNewPageContent] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!session) { navigate('/login'); return }
    loadData()
  }, [navigate, session])

  async function loadData() {
    setLoading(true)
    const userId = session?.user?.id || (session as any)?.user?.clienteId
    try {
      const [pagesRes, drawerRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/brain-wiki?user_id=${userId}`),
        fetch(`${API_URL}/brain-drawer?user_id=${userId}&limit=20`),
        fetch(`${EDGE_FUNCTIONS_URL}/list-chat-sessions?user_id=${userId}&agent_slug=pelayo&limit=50`)
      ])
      if (pagesRes.ok) {
        const pData = await pagesRes.json()
        setPages(pData.pages || [])
      }
      if (drawerRes.ok) {
        const dData = await drawerRes.json()
        setDrawer(dData.entries || [])
      }
      if (sessionsRes.ok) {
        const sData = await sessionsRes.json()
        setSessions(sData.sessions || [])
      }
    } catch(e) { logApiError('/list-chat-sessions', 0, String(e), userId).catch(() => {}) }
    setLoading(false)
  }

  async function createPage() {
    if (!newPageName.trim()) return
    setCreating(true)
    try {
      const res = await fetch(`${API_URL}/brain-wiki`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session?.user?.id || (session as any)?.user?.clienteId, page_name: newPageName, content: newPageContent })
      })
      if (res.ok) {
        setNewPageName(''); setNewPageContent('')
        await loadData()
      }
    } catch(e) { logApiError('/brain-wiki', 0, String(e), session?.user?.id || (session as any)?.user?.clienteId).catch(() => {}) }
    setCreating(false)
  }

  async function deletePage(id: string) {
    if (!confirm('¿Eliminar esta página?')) return
    await fetch(`${API_URL}/brain-wiki?id=${id}`, { method: 'DELETE' })
    setSelectedPage(null)
    await loadData()
  }

  const filteredPages = pages.filter(p =>
    !search || p.page_name.toLowerCase().includes(search.toLowerCase()) ||
    p.content.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: C.muted }}>Cargando cerebro...</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: C.white, cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}>←</button>
        <div>
          <h1 style={{ color: C.white, margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>🧠 Cerebro</h1>
          <p style={{ color: C.yellow, margin: 0, fontSize: '0.75rem' }}>{pages.length} páginas · {drawer.length} entradas de memoria</p>
        </div>
        <button onClick={() => navigate('/chat/pelayo')} style={{ marginLeft: 'auto', background: C.yellow, color: C.dark, border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
          Chatear con Pelayo →
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: C.white, borderBottom: `2px solid ${C.pastel}`, display: 'flex' }}>
        {(['wiki', 'graph', 'memory'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '0.75rem', background: 'none', border: 'none',
            borderBottom: `3px solid ${activeTab === tab ? C.purple : 'transparent'}`,
            color: activeTab === tab ? C.purple : C.muted,
            fontWeight: activeTab === tab ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer',
            fontFamily: 'inherit'
          }}>
            {tab === 'wiki' ? '📄 Wiki' : tab === 'graph' ? '🔮 Graph' : tab === 'memory' ? '💬 Memoria' : '💬 Sesiones'}
          </button>
        ))}
      </div>

      <div style={{ padding: '1rem 1rem 2rem' }}>
        {/* ── WIKI ── */}
        {activeTab === 'wiki' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Search + New */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar páginas..." style={{ flex: 1, padding: '0.6rem 0.8rem', border: `2px solid ${C.pastel}`, borderRadius: '10px', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none', background: C.white }} />
              <button onClick={() => { setNewPageName(''); setNewPageContent(''); document.getElementById('new-page-modal')?.remove() }}
                style={{ background: C.purple, color: C.white, border: 'none', borderRadius: '10px', padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Nueva
              </button>
            </div>

            {/* New page form */}
            {newPageName !== 'SENTINEL' && (
              <div style={{ background: C.white, borderRadius: '12px', padding: '1rem', border: `2px solid ${C.purple}44` }}>
                <input value={newPageName} onChange={e => setNewPageName(e.target.value)} placeholder="Título de la página..." style={{ width: '100%', padding: '0.5rem', border: `2px solid ${C.pastel}`, borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', marginBottom: '0.5rem', outline: 'none', boxSizing: 'border-box' }} />
                <textarea value={newPageContent} onChange={e => setNewPageContent(e.target.value)} placeholder="Contenido..." rows={4} style={{ width: '100%', padding: '0.5rem', border: `2px solid ${C.pastel}`, borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={createPage} disabled={creating || !newPageName.trim()} style={{ flex: 1, padding: '0.5rem', background: creating ? C.muted : C.purple, color: C.white, border: 'none', borderRadius: '8px', fontWeight: 700, cursor: creating ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>Guardar</button>
                  <button onClick={() => setNewPageName('SENTINEL')} style={{ padding: '0.5rem 0.75rem', background: C.pastel, color: C.dark, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Pages grid */}
            {filteredPages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: C.muted, background: C.white, borderRadius: '12px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</div>
                <p style={{ margin: 0 }}>{search ? 'Sin resultados' : 'Tu cerebro está vacío. Crea tu primera página.'}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {filteredPages.map(page => (
                  <div key={page.id} onClick={() => setSelectedPage(page)} style={{ background: C.white, borderRadius: '12px', padding: '0.9rem', border: `2px solid ${selectedPage?.id === page.id ? C.purple : C.pastel}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: C.dark, margin: '0 0 0.3rem 0' }}>{page.page_name}</h3>
                    <p style={{ fontSize: '0.78rem', color: C.muted, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{page.content}</p>
                    <div style={{ fontSize: '0.68rem', color: C.pastel, marginTop: '0.4rem' }}>{new Date(page.updated_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GRAPH ── */}
        {activeTab === 'graph' && (
          <div>
            <div style={{ background: C.white, borderRadius: '12px', padding: '1rem', border: `2px solid ${C.pastel}`, marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: C.dark, margin: '0 0 0.3rem 0' }}>🔮 Mapa de conocimiento</h3>
              <p style={{ fontSize: '0.78rem', color: C.muted, margin: 0 }}>Páginas conectadas por temas compartidos. Arrastra los nodos.</p>
            </div>
            {pages.length > 0 ? <GraphView pages={pages} /> : (
              <div style={{ textAlign: 'center', padding: '3rem', background: C.white, borderRadius: '12px', color: C.muted }}>
                Añade páginas wiki para ver el graph
              </div>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: C.muted }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: C.purple + '33', border: `2px solid ${C.purple}`, display: 'inline-block' }} /> Página</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: C.muted }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: C.yellow + '88', border: `1.5px solid ${C.dark}`, display: 'inline-block' }} /> Tema</span>
            </div>
          </div>
        )}

        {/* ── MEMORY ── */}
        {activeTab === 'memory' && (
          <div>
            <div style={{ background: C.white, borderRadius: '12px', padding: '1rem', border: `2px solid ${C.pastel}`, marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: C.dark, margin: '0 0 0.3rem 0' }}>💬 Memoria reciente</h3>
              <p style={{ fontSize: '0.78rem', color: C.muted, margin: 0 }}>Últimas {drawer.length} interacciones guardadas por los agentes.</p>
            </div>
            {drawer.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: C.white, borderRadius: '12px', color: C.muted }}>
                Sin memoria aún. Los agentes guardan aquí sus interacciones.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {drawer.map(entry => (
                  <div key={entry.id} style={{ background: C.white, borderRadius: '10px', padding: '0.75rem 1rem', border: `2px solid ${C.pastel}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: entry.role === 'user' ? C.blue : C.purple, textTransform: 'uppercase' }}>
                        {entry.role === 'user' ? 'Cliente' : entry.agent_id}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: C.muted }}>{new Date(entry.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: C.dark, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SESSIONS ── */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1rem', border: `2px solid ${C.pastel}`, marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: C.dark, margin: '0 0 0.3rem 0' }}>💬 Historial de conversaciones</h3>
            <p style={{ fontSize: '0.78rem', color: C.muted, margin: 0 }}> tus sesiones con Pelayo. Clic para retomar.</p>
          </div>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: C.white, borderRadius: '12px', color: C.muted }}>
              Sin sesiones aún. Chatea con Pelayo para verlas aquí.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(() => {
                const today = new Date()
                const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
                const thisWeek = new Date(today); thisWeek.setDate(thisWeek.getDate() - 7)
                const groups: Record<string, typeof sessions> = { 'Hoy': [], 'Ayer': [], 'Esta semana': [], 'Anterior': [] }
                for (const s of sessions) {
                  const d = new Date(s.last_message_at)
                  if (d.toDateString() === today.toDateString()) groups['Hoy'].push(s)
                  else if (d.toDateString() === yesterday.toDateString()) groups['Ayer'].push(s)
                  else if (d > thisWeek) groups['Esta semana'].push(s)
                  else groups['Anterior'].push(s)
                }
                return Object.entries(groups).filter(([, g]) => g.length > 0).map(([label, group]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: '0.4rem', marginTop: '0.5rem' }}>{label}</div>
                    {group.map((s: any) => (
                      <div key={s.session_id} onClick={() => navigate(`/chat?resume=${s.session_id}`)} style={{ background: C.white, borderRadius: '10px', padding: '0.8rem 1rem', border: `2px solid ${C.pastel}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: C.dark }}>{s.title || 'Sin título'}</span>
                            <span style={{ fontSize: '0.72rem', color: C.muted, marginLeft: '0.5rem' }}>{s.message_count} msgs</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: C.muted }}>{new Date(s.last_message_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              })()}
            </div>
          )}
        </div>
      )}

      {/* Page detail modal */}
      {selectedPage && (
        <div onClick={() => setSelectedPage(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: '16px', padding: '1.5rem', maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: C.dark, margin: 0 }}>{selectedPage.page_name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => deletePage(selectedPage.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: '0.8rem', padding: '0.2rem' }}>🗑</button>
                <button onClick={() => setSelectedPage(null)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' }}>✕</button>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: C.dark, whiteSpace: 'pre-wrap', lineHeight: 1.6, margin: 0 }}>{selectedPage.content}</p>
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.pastel}`, fontSize: '0.72rem', color: C.muted }}>
              Creado {new Date(selectedPage.created_at).toLocaleDateString('es-ES')} · Actualizado {new Date(selectedPage.updated_at).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
