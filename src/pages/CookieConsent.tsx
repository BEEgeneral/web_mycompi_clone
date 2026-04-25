import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const C = {
  overlay: 'rgba(0,0,0,0.5)',
  bg: '#ffffff',
  text: '#1a1a2e',
  textLight: '#6b7280',
  primary: '#00C853',
  primaryHover: '#00a043',
  border: '#e5e7eb',
}

const ICONS = {
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  cookie: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0z"/>
      <path d="M16 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/>
      <path d="M9 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    </svg>
  ),
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [consented, setConsented] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const consent = localStorage.getItem('cookies_consent')
    if (consent === null) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('cookies_consent', 'accepted')
    setVisible(false)
    setConsented(true)
  }

  const decline = () => {
    localStorage.setItem('cookies_consent', 'declined')
    setVisible(false)
    setConsented(true)
  }

  if (!visible || consented) return null

  if (showConfig) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: C.bg, borderTop: `1px solid ${C.border}`,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        zIndex: 9999, padding: isMobile ? '1.25rem' : '1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflowX: 'hidden',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <div style={{ background: '#f0fdf4', borderRadius: 8, padding: 8, flexShrink: 0 }}>
                {ICONS.shield}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: 700, color: C.text }}>Configurar cookies</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: C.textLight }}>We only use essential cookies</p>
              </div>
            </div>
            <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, padding: 4, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {ICONS.close}
            </button>
          </div>

          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Essential Cookies (Always Active)
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: C.text, lineHeight: 1.5 }}>
              We use only essential and functional cookies: <strong>session_id</strong> (session management), <strong>auth_token</strong> (login memory), <strong>csrf_token</strong> (security), <strong>cookies_consent</strong> (your preference). These are required for the platform to function and do not require explicit consent under RGPD Article 22.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Link
              to="/cookies"
              style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', minHeight: 44 }}
            >
              Learn more
            </Link>
            <button
              onClick={accept}
              style={{ padding: '0.6rem 1.2rem', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', minHeight: 44, minWidth: 44 }}
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: C.bg, borderTop: `1px solid ${C.border}`,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      zIndex: 9999, padding: isMobile ? '1rem' : '1.25rem 1.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflowX: 'hidden',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
          <div style={{ background: '#fef9c3', borderRadius: 8, padding: 8, flexShrink: 0 }}>
            {ICONS.cookie}
          </div>
          <p style={{ margin: 0, fontSize: isMobile ? '0.8rem' : '0.875rem', color: C.text, lineHeight: 1.5 }}>
            We use <strong>only essential cookies</strong> to ensure the platform works properly. No tracking, no analytics, no third-party profiling.{' '}
            <Link to="/cookies" style={{ color: C.primary, textDecoration: 'underline', fontSize: '0.8rem' }}>Cookie policy</Link>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={decline}
            style={{ padding: '0.55rem 1rem', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.textLight, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500, minHeight: 44, minWidth: 44 }}
          >
            Decline
          </button>
          <button
            onClick={() => setShowConfig(true)}
            style={{ padding: '0.55rem 1rem', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500, minHeight: 44, minWidth: 44 }}
          >
            Configure
          </button>
          <button
            onClick={accept}
            style={{ padding: '0.55rem 1.2rem', borderRadius: 8, background: C.primary, color: '#fff', border: 'none', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600, minHeight: 44, minWidth: 44 }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
