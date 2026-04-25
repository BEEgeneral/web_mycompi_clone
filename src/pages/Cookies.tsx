import { Link } from 'react-router-dom'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF' }

export default function Cookies() {
  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } a { color: #6366f1; text-decoration: none; } a:hover { text-decoration: underline; }`}</style>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2.5rem', borderBottom: `1px solid ${C.pastel}`, background: C.dark, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.white }}><span style={{ color: C.yellow }}>My</span>Compi</div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: C.pastel, fontSize: '0.9rem', textDecoration: 'none' }}>Inicio</Link>
          <Link to="/login" style={{ color: C.white, fontSize: '0.9rem', textDecoration: 'none' }}>Acceder</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: C.dark, marginBottom: '2rem', paddingTop: '3rem' }}>Política de Cookies</h1>
        <p style={{ marginBottom: '2rem', color: C.muted, fontSize: '0.85rem' }}>Última actualización: marzo 2026</p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>1. ¿Qué son las cookies?</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, móvil, tablet) cuando visitas un sitio web. Se utilizan para hacer que los sitios web funcionen correctamente, proporcionar una mejor experiencia de usuario, y ofrecer información analítica a los propietarios del sitio.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>2. Tipos de cookies que usamos</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          En MyCompi utilizamos exclusivamente <strong>cookies técnicas y funcionales</strong>. No utilizamos cookies de publicidad, ni cookies de terceros con fines de tracking o perfilado.
        </p>

        <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: C.pastel }}>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: C.dark }}>Cookie</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: C.dark }}>Tipo</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: C.dark }}>Finalidad</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: C.dark }}>Duración</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['session_id', 'Técnica', 'Mantiene tu sesión activa en la plataforma', 'Sesión'],
                ['auth_token', 'Funcional', 'Recuerda tu login para no pedir credenciales en cada visita', '30 días'],
                ['csrf_token', 'Técnica', 'Protección contra ataques CSRF', 'Sesión'],
                ['cookies_consent', 'Funcional', 'Guarda tu preferencia sobre el uso de cookies', '1 año'],
              ].map((row, i) => (
                <tr key={row[0]} style={{ background: i % 2 === 0 ? C.white : 'transparent' }}>
                  {[0, 1, 2, 3].map(col => (
                    <td key={col} style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${C.pastel}`, color: '#4B5563' }}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>3. Cookies de terceros</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Utilizamos servicios de terceros que pueden instalar cookies en tu dispositivo:
        </p>
        <ul style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          <li><strong>Stripe</strong> — para el proceso de pago. <a href="https://stripe.com/cookies" target="_blank" rel="noopener">Ver política de cookies de Stripe</a></li>
          <li><strong>Google Fonts</strong> — para cargar fuentes tipográficas.</li>
        </ul>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>4. ¿Cómo gestionar o desactivar cookies?</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Puedes configurar tu navegador para que rechace todas las cookies o para que te avise cada vez que se intenta instalar una. Ten en cuenta que si desactivas las cookies, algunas funcionalidades de la plataforma pueden dejar de funcionar correctamente.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Instrucciones para los principales navegadores:
        </p>
        <ul style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/Borrar%20cookies" target="_blank" rel="noopener">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener">Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/windows/microsoft-edge-datos-de-exploraci%C3%B3n-y-privacidad-bb8174ba-9cfd-4aa3-c14d-cf1ba1a55e03" target="_blank" rel="noopener">Microsoft Edge</a></li>
        </ul>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>5. Consentimiento</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Al visitar MyCompi por primera vez, se muestra un banner informativo sobre el uso de cookies. Al continuar navegando o al hacer clic en "Aceptar", consientes el uso de las cookies descritas en esta política.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>6. Más información</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '3rem', fontSize: '0.95rem' }}>
          Para cualquier duda sobre nuestra política de cookies, contacta con nosotros en <strong>paco@mycompi.com</strong>.
        </p>
      </div>
    </div>
  )
}