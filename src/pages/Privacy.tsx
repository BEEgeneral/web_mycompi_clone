import { Link } from 'react-router-dom'

const C = {
  dark: '#2D3261',
  yellow: '#FFD054',
  cream: '#FCF9F1',
  pastel: '#D1E0F3',
  muted: '#9CA3AF',
  white: '#FFFFFF',
}

const navStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '1rem 2.5rem', borderBottom: `1px solid ${C.pastel}`,
  background: C.dark, position: 'sticky' as const, top: 0, zIndex: 100,
}
const brandStyle = { fontSize: '1.5rem', fontWeight: 800, color: C.white }
const navLinksStyle = { display: 'flex', gap: '2rem', alignItems: 'center' as const }
const navLinkStyle = { color: C.pastel, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }
const containerStyle = { maxWidth: 760, margin: '0 auto', padding: '0 2.5rem' }
const h1Style = { fontSize: '2rem', fontWeight: 800, color: C.dark, marginBottom: '2rem', paddingTop: '3rem' }
const h2Style = { fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }
const pStyle = { color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }
const olStyle = { color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }

export default function Privacy() {
  return (
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: C.cream, color: C.dark, minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } a { color: #6366f1; text-decoration: none; } a:hover { text-decoration: underline; }`}</style>

      <nav style={navStyle}>
        <div style={brandStyle}><span style={{ color: C.yellow }}>My</span>Compi</div>
        <div style={navLinksStyle}>
          <Link to="/" style={navLinkStyle}>Inicio</Link>
          <Link to="/login" style={{ ...navLinkStyle, color: C.white }}>Acceder</Link>
        </div>
      </nav>

      <div style={containerStyle}>
        <h1 style={h1Style}>Política de Privacidad</h1>

        <p style={{ ...pStyle, marginBottom: '2rem', color: C.muted, fontSize: '0.85rem' }}>Última actualización: marzo 2026</p>

        <h2 style={h2Style}>1. Responsable del tratamiento</h2>
        <p style={pStyle}>
          <strong>Mycompi LLC</strong> (en adelante, "MyCompi"), con CIF B60604238 y domicilio en España,
          es el responsable del tratamiento de los datos personales que nos proporcionas a través de la plataforma
          web <a href="https://mycompi.com">mycompi.com</a>.
        </p>
        <p style={pStyle}>Email de contacto: <strong>paco@mycompi.com</strong></p>

        <h2 style={h2Style}>2. Datos que recopilamos</h2>
        <p style={pStyle}><strong>Datos de registro:</strong> nombre, dirección de correo electrónico, contraseña (hashada), empresa, sector.</p>
        <p style={pStyle}><strong>Datos de pago:</strong> procesamos datos de tarjeta a través de Stripe. No almacenamos datos de tarjeta en nuestros servidores.</p>
        <p style={pStyle}><strong>Datos de uso:</strong> interacciones con el chat, tareas ejecutadas por los Compis, métricas de actividad.</p>
        <p style={pStyle}><strong>Datos de navegación:</strong> IP, navegador, dispositivo, páginas visitadas (a través de cookies técnicas).</p>

        <h2 style={h2Style}>3. Finalidad del tratamiento</h2>
        <p style={pStyle}><strong>Ejecución del contrato:</strong> prestar el servicio SaaS contratado.</p>
        <p style={pStyle}><strong>Emails transaccionales:</strong> bienvenida, recuperación de contraseña, notificaciones de los Compis.</p>
        <p style={pStyle}><strong>Mejora del servicio:</strong> analítica agregada (base legal: interés legítimo).</p>
        <p style={pStyle}><strong>Comunicaciones comerciales:</strong> solo si has dado tu consentimiento explícito.</p>
        <p style={pStyle}><strong>Cumplimiento legal:</strong> facturación, prevención de fraude.</p>

        <h2 style={h2Style}>4. Base legal</h2>
        <ul style={olStyle}>
          <li><strong>Ejecución del contrato:</strong> prestación del servicio, gestión de cuenta, facturación.</li>
          <li><strong>Consentimiento:</strong> comunicaciones comerciales electrónicas.</li>
          <li><strong>Interés legítimo:</strong> mejora del servicio, seguridad, prevención de fraude.</li>
          <li><strong>Cumplimiento legal:</strong> obligaciones fiscales y contables.</li>
        </ul>

        <h2 style={h2Style}>5. Destinatarios de los datos</h2>
        <p style={pStyle}><strong>Stripe</strong> (procesador de pagos) — <a href="https://stripe.com/privacy" target="_blank" rel="noopener">Política de privacidad de Stripe</a></p>
        <p style={pStyle}><strong>InsForge / Neon (NeonDB)</strong> — base de datos gestionada por InsForge — <a href="https://neon.tech/privacy" target="_blank" rel="noopener">Política de privacidad de Neon</a></p>
        <p style={pStyle}><strong>Resend</strong> (email transaccional) — <a href="https://resend.com/privacy" target="_blank" rel="noopener">Política de privacidad de Resend</a></p>
        <p style={pStyle}><strong>Autoridades competentes</strong> cuando exista obligación legal.</p>
        <p style={pStyle}>No vendemos ni cedemos tus datos personales a terceros para fines publicitarios.</p>

        <h2 style={h2Style}>6. Transferencias internacionales</h2>
        <p style={pStyle}>Algunos proveedores (Stripe, Resend, Neon) pueden transferir datos fuera del Espacio Económico Europeo (EEE). En tales casos, garantizamos que dichas transferencias se realizan bajo cláusulas contractuales tipo aprobadas por la Comisión Europea o bajo el EU-US Data Privacy Framework.</p>

        <h2 style={h2Style}>7. Plazo de conservación</h2>
        <ul style={olStyle}>
          <li><strong>Datos de cuenta:</strong> mientras la cuenta esté activa y hasta 3 años después del cierre.</li>
          <li><strong>Datos de facturación:</strong> conservados durante 6 años según obligación fiscal.</li>
          <li><strong>Datos de uso (chat):</strong> hasta 1 año después del cierre de cuenta.</li>
          <li><strong>Comunicaciones comerciales:</strong> hasta que retires el consentimiento.</li>
        </ul>

        <h2 style={h2Style}>8. Tus derechos</h2>
        <p style={pStyle}>Tienes derecho a:</p>
        <ul style={olStyle}>
          <li><strong>Acceso:</strong> saber qué datos tenemos tuyos.</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> solicitar la eliminación de tus datos (salvo obligación legal).</li>
          <li><strong>Limitación:</strong> restringir el tratamiento en ciertos casos.</li>
          <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
          <li><strong>Revocación:</strong> retirar consentimiento en cualquier momento.</li>
        </ul>
        <p style={pStyle}>Para ejercer tus derechos, escribe a <strong>paco@mycompi.com</strong>. Responderemos en un máximo de 30 días.</p>
        <p style={pStyle}>También tienes derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>: <a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a></p>

        <h2 style={h2Style}>9. Seguridad</h2>
        <p style={pStyle}>Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales contra acceso no autorizado, pérdida o alteración: cifrado en tránsito (TLS), hash de contraseñas con bcrypt, acceso restringido a personal autorizado, y monitorización continua.</p>

        <h2 style={h2Style}>10. Cambios en esta política</h2>
        <p style={pStyle}>Podremos actualizar esta política periódicamente. Los cambios se publicarán en esta misma página con fecha de "Última actualización" actualizada. Si los cambios son significativos, te notificaremos por email a la dirección asociada a tu cuenta.</p>

        <div style={{ height: '3rem' }} />
      </div>
    </div>
  )
}