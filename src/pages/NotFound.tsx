import { Link } from 'react-router-dom'

const C = {
  dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1',
  pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF',
}

export default function NotFound() {
  return (
    <div style={{
      fontFamily: "'Poppins', system-ui, sans-serif",
      background: C.cream, color: C.dark,
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '2rem', WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>

      <div style={{ fontSize: '5rem', fontWeight: 800, color: C.pastel, lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.dark, marginTop: '1rem', marginBottom: '0.5rem' }}>
        Página no encontrada
      </h1>
      <p style={{ color: C.muted, fontSize: '0.95rem', marginBottom: '2rem', maxWidth: 320 }}>
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 1.75rem', background: C.dark, color: C.yellow,
          borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
          textDecoration: 'none',
        }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}