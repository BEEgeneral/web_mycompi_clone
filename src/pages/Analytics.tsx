import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { EDGE_FUNCTIONS_URL } from '../lib/insforge'

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
  orange: '#F59E0B',
}

const AGENT_COLORS: Record<string, string> = {
  paco: '#6366F1',
  pelayo: '#8B5CF6',
  carmen: '#EC4899',
  enzo: '#F59E0B',
  marcos: '#10B981',
  lucia: '#3B82F6',
  laura: '#F97316',
  daniel: '#14B8A6',
  elena: '#A855F7',
  diana: '#EF4444',
}

const AGENT_COLORS_LIST = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#F97316', '#14B8A6', '#A855F7', '#EF4444']

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface Overview {
  trial_conversion: { value: number | null; label: string }
  total_trials: { value: number }
  converted_trials: { value: number }
  nps_avg: { value: number | null; label: string }
  nps_count: { value: number }
  active_users_7d: { value: number }
  paying_users: { value: number }
  churn_rate: { value: number | null; label: string }
  churned_users: { value: number }
  nps_distribution: { low: number; medium: number; high: number }
  // trending fields
  trial_conversion_trend: number
  active_users_trend: number
  nps_trend: number
  churn_trend: number
}

interface AgentUsage {
  agent: string
  messages_30d: number
  users_30d: number
}

interface TimelinePoint {
  date: string
  trials: number
  converted: number
  conversion_rate: number
}

interface UserRecord {
  id: string
  name: string
  email: string
  status: 'trial' | 'paid' | 'expired' | string
  created_at: string
  last_active: string | null
}

interface AnalyticsData {
  overview: Overview
  usage: AgentUsage[]
  timeline: TimelinePoint[]
  recent_users: UserRecord[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `hace ${diff} segundos`
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} minutos`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} horas`
  return `hace ${Math.floor(diff / 86400)} días`
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) }
  catch { return iso }
}

function formatFullDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch { return iso }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Trend Arrow ───────────────────────────────────────────────────────────────

function TrendArrow({ value, invert }: { value: number; invert?: boolean }) {
  const good = invert ? value < 0 : value > 0
  const color = value === 0 ? C.muted : good ? C.green : C.red
  const icon = value > 0 ? '▲' : value < 0 ? '▼' : '–'
  return (
    <span style={{ color, fontSize: 11, fontWeight: 700, marginLeft: 4 }}>
      {icon} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

// ─── Overview Cards ────────────────────────────────────────────────────────────

function OverviewCards({ data }: { data: Overview; days: number }) {
  const conversionColor = data.trial_conversion.value == null ? C.muted
    : data.trial_conversion.value >= 30 ? C.green
    : data.trial_conversion.value >= 20 ? C.orange
    : C.red

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
      {/* Trial Conversion % */}
      <div style={{ background: C.white, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Conversion Trials</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: conversionColor }}>
            {data.trial_conversion.value != null ? data.trial_conversion.value : '—'}
          </span>
          <span style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>%</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{data.trial_conversion.label}</div>
        <TrendArrow value={data.trial_conversion_trend} />
      </div>

      {/* Active Trials */}
      <div style={{ background: C.white, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Trials Activos</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: C.dark }}>{data.total_trials.value}</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{data.converted_trials.value} convertidos</div>
        <TrendArrow value={data.active_users_trend} />
      </div>

      {/* NPS Score */}
      <div style={{ background: C.white, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>NPS Score</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: data.nps_avg.value != null ? (data.nps_avg.value >= 7 ? C.green : data.nps_avg.value >= 5 ? C.orange : C.red) : C.muted }}>
            {data.nps_avg.value != null ? data.nps_avg.value.toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>/10</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{data.nps_count.value} respuestas</div>
        <TrendArrow value={data.nps_trend} />
      </div>

      {/* Churn Rate */}
      <div style={{ background: C.white, borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Churn Rate</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: data.churn_rate.value != null ? (data.churn_rate.value <= 8 ? C.green : data.churn_rate.value <= 15 ? C.orange : C.red) : C.muted }}>
            {data.churn_rate.value != null ? data.churn_rate.value : '—'}
          </span>
          <span style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>%</span>
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{data.churned_users.value} abandonados</div>
        <TrendArrow value={data.churn_trend} invert />
      </div>
    </div>
  )
}

// ─── Bar Chart (Trial Conversion) ─────────────────────────────────────────────

function TrialBarChart({ data }: { data: TimelinePoint[] }) {
  if (data.length === 0) return null
  const maxVal = Math.max(...data.map(d => d.trials), 1)
  const maxH = 140

  return (
    <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Conversion por día ({data.length} días)</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: maxH + 40, paddingBottom: 28, position: 'relative' }}>
        {/* Y-axis labels */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: maxH, fontSize: 10, color: C.muted, marginRight: 4, textAlign: 'right', minWidth: 24 }}>
          <span>{maxVal}</span>
          <span>{Math.round(maxVal / 2)}</span>
          <span>0</span>
        </div>
        {/* Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, flex: 1, height: maxH }}>
          {data.map(d => {
            const totalH = (d.trials / maxVal) * maxH
            const convH = (d.converted / maxVal) * maxH
            return (
              <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 0 }}>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: maxH }}>
                  <div title={`Trials: ${d.trials}`} style={{
                    width: 12,
                    background: C.pastel,
                    borderRadius: 4,
                    height: Math.max(4, totalH),
                    transition: 'height 0.3s',
                  }} />
                  <div title={`Convertidos: ${d.converted}`} style={{
                    width: 12,
                    background: C.green,
                    borderRadius: 4,
                    height: Math.max(4, convH),
                    transition: 'height 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: 8, color: C.muted, marginTop: 4, whiteSpace: 'nowrap' }}>{formatDate(d.date)}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: C.pastel, borderRadius: 2 }} /> Trials</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ display: 'inline-block', width: 10, height: 10, background: C.green, borderRadius: 2 }} /> Pagados</span>
      </div>
    </div>
  )
}

// ─── Agent Usage Horizontal Bar ─────────────────────────────────────────────────

function AgentUsageChart({ data }: { data: AgentUsage[] }) {
  const sorted = [...data].sort((a, b) => b.messages_30d - a.messages_30d)
  const maxMsgs = Math.max(...sorted.map(d => d.messages_30d), 1)

  return (
    <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Mensajes por agente</h3>
      {sorted.length === 0 ? (
        <span style={{ color: C.muted, fontSize: 13 }}>Sin datos aún</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((d, i) => {
            const color = AGENT_COLORS[d.agent.toLowerCase()] || AGENT_COLORS_LIST[i % AGENT_COLORS_LIST.length]
            const pct = (d.messages_30d / maxMsgs) * 100
            return (
              <div key={d.agent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{capitalize(d.agent)}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{d.messages_30d} msgs · {d.users_30d} users</span>
                </div>
                <div style={{ background: '#E5E7EB', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    background: color,
                    borderRadius: 6,
                    height: 10,
                    width: `${pct}%`,
                    transition: 'width 0.4s',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── NPS Distribution ──────────────────────────────────────────────────────────

function NPSDistribution({ dist, avg }: { dist: { low: number; medium: number; high: number }; avg: number | null }) {
  const total = dist.low + dist.medium + dist.high
  const pct = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0

  return (
    <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 4, alignSelf: 'flex-start' }}>Distribución NPS</h3>

      {total === 0 ? (
        <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: '20px 0' }}>Sin respuestas aún</div>
      ) : (
        <>
          {/* Big NPS avg */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: avg != null ? (avg >= 7 ? C.green : avg >= 5 ? C.orange : C.red) : C.muted }}>
              {avg != null ? avg.toFixed(1) : '—'}
            </span>
            <span style={{ fontSize: 18, color: C.muted, fontWeight: 600 }}>/10 NPS</span>
          </div>

          {/* 3-segment bar */}
          <div style={{ display: 'flex', width: '100%', height: 16, borderRadius: 8, overflow: 'hidden', gap: 2, marginBottom: 12 }}>
            {[
              { label: '1-6', value: dist.low, color: C.red },
              { label: '7-8', value: dist.medium, color: C.yellow },
              { label: '9-10', value: dist.high, color: C.green },
            ].map(b => (
              <div key={b.label} style={{
                flex: b.value || 0.01,
                background: b.color,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: b.value > 0 ? 30 : 0,
              }}>
                {b.value > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: b.label === '7-8' ? C.dark : C.white }}>
                    {pct(b.value)}%
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Labels */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', fontSize: 11, color: C.muted }}>
            <span>🔴 1-6 ({dist.low})</span>
            <span>🟡 7-8 ({dist.medium})</span>
            <span>🟢 9-10 ({dist.high})</span>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Engagement Timeline (Line Chart) ──────────────────────────────────────────

function EngagementTimeline({ data }: { data: TimelinePoint[] }) {
  if (data.length === 0) return null
  const vals = data.map(d => d.conversion_rate)
  const maxVal = Math.max(...vals, 1)
  const minVal = Math.min(...vals, 0)
  const range = maxVal - minVal || 1

  return (
    <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 16 }}>Tasa de conversión (timeline)</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
        {data.map((d, i) => {
          const pct = ((d.conversion_rate - minVal) / range) * 80 + 10
          const nextPct = i < data.length - 1
            ? ((data[i + 1].conversion_rate - minVal) / range) * 80 + 10
            : pct
          return (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
              <span style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>{d.conversion_rate.toFixed(0)}%</span>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: C.blue,
                position: 'relative',
                zIndex: 2,
              }} />
              {i < data.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: `calc(${100 / data.length}% + 4px)`,
                  height: 2,
                  background: C.pastel,
                  transform: 'rotate(' + String(Math.atan2(nextPct - pct, 40) * (180 / Math.PI)) + 'deg)',
                  transformOrigin: 'left center',
                  zIndex: 1,
                }} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 9, color: C.muted }}>{formatDate(data[0]?.date)}</span>
        <span style={{ fontSize: 9, color: C.muted }}>{formatDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  )
}

// ─── User Table ────────────────────────────────────────────────────────────────

function UserTable({ users, total }: { users: UserRecord[]; total: number }) {
  const [page, setPage] = useState(1)
  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paged = users.slice((page - 1) * pageSize, page * pageSize)

  const statusColor = (s: string) => {
    if (s === 'paid') return C.green
    if (s === 'trial') return C.yellow
    if (s === 'expired') return C.red
    return C.muted
  }

  return (
    <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Usuarios recientes</h3>
        <span style={{ fontSize: 12, color: C.muted }}>Total: {total}</span>
      </div>

      {paged.length === 0 ? (
        <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: 20 }}>Sin usuarios aún</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.muted}22` }}>
                  {['Nombre', 'Email', 'Estado', 'Alta', 'Última actividad'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: C.muted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.muted}11` }}>
                    <td style={{ padding: '10px 12px', color: C.dark, fontWeight: 600 }}>{u.name || '—'}</td>
                    <td style={{ padding: '10px 12px', color: C.muted }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: statusColor(u.status) + '22',
                        color: statusColor(u.status),
                        border: `1px solid ${statusColor(u.status)}44`,
                        borderRadius: 999,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: C.muted, fontSize: 12 }}>{formatFullDate(u.created_at)}</td>
                    <td style={{ padding: '10px 12px', color: C.muted, fontSize: 12 }}>{u.last_active ? formatFullDate(u.last_active) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Página {page} de {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: page === 1 ? C.muted + '33' : C.dark,
                  color: page === 1 ? C.muted : C.white,
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  background: page === totalPages ? C.muted + '33' : C.dark,
                  color: page === totalPages ? C.muted : C.white,
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      background: C.white,
      borderRadius: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
          <circle cx="40" cy="40" r="38" stroke={C.muted} strokeWidth="2" strokeDasharray="6 4" fill="none" />
          <path d="M28 40 L38 50 L52 34" stroke={C.muted} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: 8 }}>Aún no hay datos suficientes</div>
      <div style={{ fontSize: 13, color: C.muted }}>Los agentes necesitan tener actividad para que aparezcan métricas.</div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Analytics() {
  const navigate = useNavigate()
  const [days, setDays] = useState(14)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError('')
    fetch(`${EDGE_FUNCTIONS_URL}/analytics-api?days=${days}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(res => {
        if (res.error) { setError(res.error); return }
        setData(res as AnalyticsData)
        setLastUpdated(new Date())
      })
      .catch(err => setError(err.message || 'Error cargando analytics'))
      .finally(() => setLoading(false))
  }, [days])

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchData()
  }, [days, navigate, fetchData])

  const timeAgoStr = lastUpdated ? timeAgo(lastUpdated) : '—'

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Poppins', sans-serif" }}>
      {/* Navigation */}
      <div style={{ background: C.dark, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.yellow }}>📊 MyCompi</span>
        <span style={{ color: C.muted, fontSize: 14 }}>|</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.white }}>Analytics</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: `1px solid ${C.muted}55`,
            borderRadius: 8,
            padding: '6px 16px',
            color: C.white,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.dark, margin: 0 }}>Analytics</h1>
            <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>Métricas de MyCompi</p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Date range selector */}
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  background: days === d ? C.yellow : C.white,
                  color: days === d ? C.dark : C.muted,
                  border: `1px solid ${days === d ? C.yellow : C.muted}44`,
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {d} días
              </button>
            ))}

            {/* Refresh */}
            <button
              onClick={fetchData}
              style={{
                background: C.dark,
                color: C.white,
                border: 'none',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ↻ Actualizar
            </button>
          </div>
        </div>

        {/* Last updated */}
        {lastUpdated && (
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 16, textAlign: 'right' }}>
            Última actualización: {timeAgoStr}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: C.muted }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
            <div>Cargando métricas...</div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: C.red,
            background: '#fdf2f2',
            borderRadius: 16,
            border: `1px solid ${C.red}33`,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <div>
            {/* Overview cards */}
            <OverviewCards data={data.overview} days={days} />

            {/* Charts row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
              <TrialBarChart data={data.timeline} />
              <NPSDistribution dist={data.overview.nps_distribution} avg={data.overview.nps_avg.value} />
            </div>

            {/* Charts row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <AgentUsageChart data={data.usage} />
              <EngagementTimeline data={data.timeline} />
            </div>

            {/* User table */}
            <UserTable users={data.recent_users} total={data.recent_users.length} />

            {/* Footer */}
            <div style={{ marginTop: 24, fontSize: 11, color: C.muted, textAlign: 'center' }}>
              Datos agregados de trial_status, subscriptions, nps_scores, chat_message y app_user.
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !data && <EmptyState />}
      </div>
    </div>
  )
}