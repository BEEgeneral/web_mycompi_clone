import { useEffect, useState, useCallback } from 'react'
import { API_URL } from '../lib/insforge'
import { logApiError } from '../lib/logger'

const C = {
  dark: '#2D3261',
  yellow: '#FFD054',
  cream: '#FCF9F1',
  pastel: '#D1E0F3',
  muted: '#9CA3AF',
  white: '#FFFFFF',
  red: '#DC2626',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#7C3AED',
  orange: '#F97316',
}

// ── Interfaces ────────────────────────────────────────────────────────────────

interface DashboardStats {
  total_trials: number
  converted_trials: number
  conversion_rate: number | null
  nps_avg: number | null
  nps_count: number
}

interface CronEntry {
  id: string
  name: string
  schedule: string
  last_run: string | null
  next_run: string | null
  status: 'active' | 'running' | 'failed'
}

interface ActivityItem {
  id: string
  type: 'signup' | 'conversion' | 'trial_expiry' | 'nps_response'
  description: string
  timestamp: string
}

interface AgentInfo {
  slug: string
  role: string
  last_seen: string | null
  tasks_today: number
}

interface ClientOrg {
  id: string
  company_name: string
  status: 'paid' | 'trial' | 'expired'
  trial_ends_at: string | null
}

interface AlertItem {
  id: string
  severity: 'warning' | 'critical'
  message: string
  link?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: string | null): string {
  if (!ts) return 'nunca'
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `hace ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  return `hace ${d}d`
}

function formatDate(ts: string | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CronEntry['status'] }) {
  const map = {
    active: { bg: C.green + '22', color: C.green, label: 'Activo' },
    running: { bg: C.yellow + '22', color: C.orange, label: 'Ejecutando' },
    failed: { bg: C.red + '22', color: C.red, label: 'Fallido' },
  }
  const s = map[status]
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

function StatCard({ icon, value, label, trend }: { icon: string; value: string | number; label: string; trend?: 'up' | 'down' }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 12,
      padding: '14px 18px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      flex: 1,
      minWidth: 130,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        {trend && (
          <span style={{ fontSize: 14, color: trend === 'up' ? C.green : C.red, fontWeight: 700 }}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.dark, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  )
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 12,
      border: `1px solid ${C.muted}22`,
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: `1px solid ${C.muted}15`,
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>{title}</h2>
        {action}
      </div>
      <div style={{ padding: '14px 18px' }}>{children}</div>
    </div>
  )
}

function AgentStatusDot({ lastSeen }: { lastSeen: string | null }) {
  if (!lastSeen) return <span style={{ color: C.muted, fontSize: 11 }}>sin datos</span>
  const diff = Date.now() - new Date(lastSeen).getTime()
  const min = Math.floor(diff / 60000)
  const color = min < 5 ? C.green : min < 30 ? C.yellow : C.red
  const label = min < 5 ? 'Online' : min < 30 ? 'Away' : 'Offline'
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Crons
  const [crons, setCrons] = useState<CronEntry[]>([])
  const [runningCron, setRunningCron] = useState<string | null>(null)

  // Activity feed
  const [activity, setActivity] = useState<ActivityItem[]>([])

  // Agents
  const [agents, setAgents] = useState<AgentInfo[]>([])

  // Org / clients
  const [clients, setClients] = useState<ClientOrg[]>([])

  // Alerts
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  // ── Fetch dashboard data ─────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/functions/v1/admin-dashboard`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.error) return

      if (data.stats) setStats(data.stats)
      if (data.crons) setCrons(data.crons)
      if (data.activity) setActivity(data.activity.slice(0, 15))
      if (data.agents) setAgents(data.agents)
      if (data.clients) setClients(data.clients)
      if (data.alerts) setAlerts(data.alerts)

      setLastUpdated(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    } catch (e) {
      console.error('Dashboard fetch error:', e)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // ── Manual refresh ───────────────────────────────────────────────────────

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboard()
    setRefreshing(false)
  }

  // ── Run cron manually ─────────────────────────────────────────────────────

  const handleRunCron = async (cronId: string, cronName: string) => {
    setRunningCron(cronId)
    try {
      const res = await fetch(`${API_URL}/functions/v1/admin-dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_cron', cron_id: cronId }),
      })
      const data = await res.json()
      if (data.ok || res.ok) {
        setCrons(prev => prev.map(c => c.id === cronId ? { ...c, last_run: new Date().toISOString(), status: 'active' as const } : c))
      } else {
        setAlerts(prev => [{ id: `cron-${cronId}`, severity: 'critical', message: `Cron ${cronName} falló: ${data.error || 'error desconocido'}` }, ...prev])
      }
    } catch(e) {
      setAlerts(prev => [{ id: `cron-${cronId}`, severity: 'critical', message: `Cron ${cronName} falló: error de red` }, ...prev])
      logApiError('/admin-dashboard', 0, String(e), undefined).catch(() => {})
    } finally {
      setRunningCron(null)
    }
  }

  // ── Ping agent ────────────────────────────────────────────────────────────

  const handlePingAgent = async (slug: string) => {
    try {
      await fetch(`${API_URL}/functions/v1/admin-dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping_agent', agent_slug: slug }),
      })
      setAgents(prev => prev.map(a => a.slug === slug ? { ...a, last_seen: new Date().toISOString() } : a))
    } catch (e) {
      console.error('Ping error:', e)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: 'Poppins, sans-serif' }}>

      {/* ── Top Navigation ── */}
      <div style={{
        background: C.dark,
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.yellow }}>⚙️ MyCompi</span>
          <span style={{
            background: C.yellow,
            color: C.dark,
            borderRadius: 999,
            padding: '2px 10px',
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: C.muted }}>
              Actualizado {lastUpdated}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: refreshing ? C.muted : C.yellow,
              color: C.dark,
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.2s',
            }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}>
              ↻
            </span>
            {refreshing ? 'Actualizando...' : 'Refrescar'}
          </button>
          <a
            href="/"
            style={{
              background: 'transparent',
              color: C.white,
              border: `1px solid ${C.white}44`,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← Dashboard
          </a>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── A. Live Stats Bar ── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <StatCard
            icon="🧪"
            value={stats?.total_trials ?? '—'}
            label="Total Trials"
          />
          <StatCard
            icon="✅"
            value={stats?.converted_trials ?? '—'}
            label="Convertidos"
            trend={stats && stats.conversion_rate != null && stats.conversion_rate > 0 ? 'up' : undefined}
          />
          <StatCard
            icon="📊"
            value={stats?.conversion_rate != null ? `${stats.conversion_rate}%` : '—'}
            label="Tasa Conversión"
          />
          <StatCard
            icon="⭐"
            value={stats?.nps_avg != null ? stats.nps_avg.toFixed(1) : '—'}
            label={`NPS (${stats?.nps_count ?? 0} resp.)`}
            trend={stats && stats.nps_avg != null && stats.nps_avg >= 7 ? 'up' : stats && stats.nps_avg != null ? 'down' : undefined}
          />
        </div>

        {/* ── F. Alert Panel ── */}
        {alerts.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                style={{
                  flex: '1 1 280px',
                  background: alert.severity === 'critical' ? C.red + '12' : C.yellow + '12',
                  border: `1px solid ${alert.severity === 'critical' ? C.red + '44' : C.yellow + '55'}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 16 }}>
                  {alert.severity === 'critical' ? '🔴' : '🟡'}
                </span>
                <span style={{ fontSize: 12, color: alert.severity === 'critical' ? C.red : '#92400e', flex: 1 }}>
                  {alert.message}
                </span>
                {alert.link && (
                  <a href={alert.link} style={{ fontSize: 11, color: C.dark, fontWeight: 600, textDecoration: 'underline' }}>
                    Ver →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── B. Cron Monitor ── */}
        <SectionCard title="⏰ Monitor de Crons">
          {crons.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
              Sin crons configurados
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.muted}22` }}>
                    {['Nombre', 'Schedule', 'Última ejecución', 'Estado', 'Próxima', 'Acción'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crons.map(cron => (
                    <tr key={cron.id} style={{ borderBottom: `1px solid ${C.muted}11` }}>
                      <td style={{ padding: '10px 10px', fontWeight: 600, color: C.dark }}>{cron.name}</td>
                      <td style={{ padding: '10px 10px', color: C.muted, fontFamily: 'monospace', fontSize: 12 }}>{cron.schedule}</td>
                      <td style={{ padding: '10px 10px', color: C.muted, fontSize: 12 }}>{timeAgo(cron.last_run)}</td>
                      <td style={{ padding: '10px 10px' }}><StatusBadge status={cron.status} /></td>
                      <td style={{ padding: '10px 10px', color: C.muted, fontSize: 12 }}>{formatDate(cron.next_run)}</td>
                      <td style={{ padding: '10px 10px' }}>
                        <button
                          onClick={() => handleRunCron(cron.id, cron.name)}
                          disabled={runningCron === cron.id}
                          style={{
                            background: runningCron === cron.id ? C.muted : C.blue + '22',
                            color: runningCron === cron.id ? C.white : C.blue,
                            border: `1px solid ${C.blue}44`,
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: runningCron === cron.id ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {runningCron === cron.id ? 'Ejecutando...' : 'Ejecutar ahora'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* ── C. Recent Activity Feed + D. Agents Grid (side by side) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 0 }}>

          {/* ── C. Activity Feed ── */}
          <SectionCard title="📋 Actividad Reciente">
            {activity.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                Sin actividad reciente
              </div>
            ) : (
              <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activity.map(item => {
                  const icons: Record<string, string> = {
                    signup: '👤',
                    conversion: '💰',
                    trial_expiry: '⏰',
                    nps_response: '⭐',
                  }
                  return (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      background: C.cream,
                      borderRadius: 8,
                    }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{icons[item.type] ?? '📌'}</span>
                      <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{item.description}</span>
                      <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{timeAgo(item.timestamp)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>

          {/* ── D. Agents Grid ── */}
          <SectionCard title="🤖 Agentes">
            {agents.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                Sin datos de agentes
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {agents.map(agent => (
                  <div key={agent.slug} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: C.cream,
                    borderRadius: 10,
                    border: `1px solid ${C.muted}22`,
                  }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: C.dark,
                      color: C.yellow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {agent.slug.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.dark, textTransform: 'capitalize' }}>
                        {agent.slug}
                        <span style={{ fontWeight: 400, color: C.muted, fontSize: 11, marginLeft: 6 }}>{agent.role}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <AgentStatusDot lastSeen={agent.last_seen} />
                        <span style={{ fontSize: 11, color: C.muted }}>·</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{agent.tasks_today} tareas hoy</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePingAgent(agent.slug)}
                      style={{
                        background: C.pastel,
                        color: C.dark,
                        border: `1px solid ${C.muted}33`,
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      Ping
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── E. Org Chart / Clients ── */}
        <SectionCard title="🏢 Organizaciones">
          {clients.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
              Sin organizaciones activas
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.muted}22` }}>
                    {['Empresa', 'Estado', 'Trial expira'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: C.muted, fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => {
                    const statusColor = client.status === 'paid' ? C.green : client.status === 'trial' ? C.yellow : C.red
                    const statusBg = statusColor + '18'
                    return (
                      <tr key={client.id} style={{ borderBottom: `1px solid ${C.muted}11` }}>
                        <td style={{ padding: '10px 10px', fontWeight: 600, color: C.dark }}>{client.company_name}</td>
                        <td style={{ padding: '10px 10px' }}>
                          <span style={{
                            background: statusBg,
                            color: statusColor,
                            borderRadius: 999,
                            padding: '2px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                          }}>
                            {client.status === 'paid' ? '💳 Pagado' : client.status === 'trial' ? '🧪 Trial' : '❌ Expirado'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px', color: C.muted, fontSize: 12 }}>
                          {client.trial_ends_at ? formatDate(client.trial_ends_at) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

      </div>

      {/* ── Spin animation ── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
