import { EDGE_FUNCTIONS_URL } from './insforge'

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'critical'
  event: string
  message: string
  context?: Record<string, unknown>
  userId: string
  url?: string
  timestamp?: string
}

const LOG_ENDPOINT = `${EDGE_FUNCTIONS_URL}/client-logger`

export function initLogger(userId?: string) {
  if (typeof window === 'undefined') return

  const payload = {
    userId: userId || 'anonymous',
    url: window.location.href,
    timestamp: new Date().toISOString(),
    level: 'info' as const,
    event: 'page_load',
    message: window.location.pathname,
  }

  // Log page loads
  sendLog({ ...payload, level: 'info', event: 'page_load' }).catch(() => {})

  // Catch JS errors
  window.onerror = (message, source, lineno, colno, error) => {
    sendLog({
      level: 'critical',
      event: 'js_error',
      message: String(message),
      userId: userId || 'anonymous',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      context: {
        source: String(source),
        lineno,
        colno,
        stack: error?.stack,
      },
    }).catch(() => {})
    return false
  }

  // Catch unhandled promise rejections
  window.onunhandledrejection = (event) => {
    sendLog({
      level: 'error',
      event: 'unhandled_rejection',
      message: String(event.reason),
      userId: userId || 'anonymous',
      url: window.location.href,
      timestamp: new Date().toISOString(),
      context: { reason: String(event.reason) },
    }).catch(() => {})
  }
}

export async function logApiError(
  endpoint: string,
  status: number,
  statusText: string,
  userId?: string,
  extra?: Record<string, unknown>
) {
  const level = status === 0 || status === 0 ? 'warn' : status >= 500 ? 'error' : 'warn'
  await sendLog({
    level,
    event: 'api_error',
    message: `${endpoint} → ${status} ${statusText}`,
    userId: userId || 'anonymous',
    url: window.location.href,
    timestamp: new Date().toISOString(),
    context: { endpoint, status, statusText, ...extra },
  })
}

export async function sendLog(entry: LogEntry): Promise<void> {
  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
  } catch {
    // Silently fail — never throw inside a logger
  }
}
