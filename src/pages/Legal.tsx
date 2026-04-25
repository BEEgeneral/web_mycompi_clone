import { Link } from 'react-router-dom'

const C = { dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1', pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF' }

export default function Legal() {
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
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: C.dark, marginBottom: '2rem', paddingTop: '3rem' }}>Aviso Legal</h1>
        <p style={{ marginBottom: '2rem', color: C.muted, fontSize: '0.85rem' }}>Última actualización: marzo 2026</p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>1. Información general</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          En cumplimiento con el artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), se exponen los siguientes datos identificativos del titular de la plataforma MyCompi.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>2. Titular</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}><strong>Mycompi LLC</strong></p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>CIF: B60604238</p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Domicilio social: España</p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Actividad: Desarrollo y comercialización de software SaaS</p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Email: <strong>paco@mycompi.com</strong></p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>Web: <strong>mycompi.com</strong></p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>3. Objeto</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          MyCompi es una plataforma tecnológica SaaS que proporciona acceso a un equipo de Compis agentes — agentes de inteligencia artificial especializados en distintas áreas — que trabajan de forma autónoma para el negocio del cliente contratante.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          El presente aviso legal regula las condiciones de uso del sitio web <strong>mycompi.com</strong> (en adelante, el "Sitio Web").
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>4. Condiciones de uso del Sitio Web</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          La utilización del Sitio Web otorga la condición de Usuario del mismo e implica la aceptación plena de las condiciones presentes en este Aviso Legal. El Usuario se compromete a utilizar el Sitio Web y sus servicios conforme a la legislación vigente aplicable, los presentes términos y condiciones, la moral, buenas costumbres y orden público.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Queda prohibido el uso del Sitio Web con fines ilícitos, lesivos de derechos o intereses de terceros, o que puedan dañar, inutilizar o deteriorar el Sitio Web o impedir su normal disfrute.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>5. Propiedad intelectual e industrial</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Mycompi LLC es titular de todos los derechos de propiedad intelectual e industrial del Sitio Web, incluyendo pero no limitándose a: el nombre de dominio <strong>mycompi.com</strong>, el software, los textos, diseños gráficos, logotipos, combinaciones de colores, estructura de navegación, bases de datos, y cualquier otro elemento que lo compone.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Queda expresamente prohibida la reproducción, distribución, comunicación pública o transformación total o parcial del contenido del Sitio Web sin autorización expresa de Mycompi LLC
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>6. Exclusión de responsabilidad</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Mycompi LLC no garantiza la inexistencia de errores en el acceso al Sitio Web, ni en sus contenidos. En caso de detectarse, se procederán a subsanar dichos errores a la mayor brevedad posible.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Mycompi LLC no se hace responsable de los daños y perjuicios derivados de:
        </p>
        <ul style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          <li>Interferencias, interrupciones, fallos, omisiones, averías telefónicas, retrasos, bloqueos o desconexiones en el funcionamiento del sistema electrónico motivadas por deficiencias, sobrecargas o errores en las líneas de telecomunicaciones o en servicios de alojamiento web.</li>
          <li>Intromisiones ilegítimas mediante el uso de programas malignos de cualquier tipo.</li>
          <li>Utilisation indebite o inadecuada del Sitio Web por parte de los Usuarios.</li>
        </ul>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>7. Protección de datos de carácter personal</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Los datos personales que el Usuario facilite a través del Sitio Web serán tratados conforme a lo expuesto en la <Link to="/privacidad" style={{ color: '#6366f1' }}>Política de Privacidad</Link>.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), Mycompi LLC informa a los Usuarios de que dispone de un Registro de Actividades de Tratamiento documentado.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>8. Cookies</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          El uso de cookies en el Sitio Web se rige por lo establecido en la <Link to="/cookies" style={{ color: '#6366f1' }}>Política de Cookies</Link>.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>9. Ley aplicable y jurisdicción</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          El presente Aviso Legal se interpreta y rige conforme a la legislación española. Para cualquier controversia derivada del uso del Sitio Web, las partes se someten a los Juzgados y Tribunales de Madrid (España), con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>10. Contacto</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '3rem', fontSize: '0.95rem' }}>
          Para cualquier cuestión relativa al presente Aviso Legal, puede contactar con Mycompi LLC en: <strong>paco@mycompi.com</strong>.
        </p>
      </div>
    </div>
  )
}