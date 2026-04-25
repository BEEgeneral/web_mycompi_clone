import React, { Component, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const payload = {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }
    try {
      fetch('/__logger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: '#2D3261', color: 'white', fontFamily: 'Poppins, sans-serif',
          padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😵</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Algo salió mal</h2>
          <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', maxWidth: 400 }}>
            {this.state.error?.message || 'Error desconocido'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.5rem', background: '#FFD054', color: '#2D3261',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
            }}>
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
