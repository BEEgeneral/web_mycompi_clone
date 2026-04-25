import { Link } from 'react-router-dom'

const C = {
  dark: '#2D3261', yellow: '#FFD054', cream: '#FCF9F1',
  pastel: '#D1E0F3', muted: '#9CA3AF', white: '#FFFFFF',
}

export default function Terms() {
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
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: C.dark, marginBottom: '2rem', paddingTop: '3rem' }}>Términos y Condiciones</h1>
        <p style={{ marginBottom: '2rem', color: C.muted, fontSize: '0.85rem' }}>Última actualización: marzo 2026</p>

        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Los presentes términos y condiciones (en adelante, "Términos") regulan la relación entre <strong>Mycompi LLC</strong> (en adelante, "MyCompi", "nosotros") y cualquier persona física o jurídica que contrate los servicios ofrecidos a través de la plataforma web <a href="https://mycompi.com">mycompi.com</a> (en adelante, el "Servicio").
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Al contratar cualquier plan de MyCompi, aceptas expresamente estos Términos en su totalidad. Si no estás de acuerdo con alguno de ellos, no deberías contratar el Servicio.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>2. Descripción del servicio</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          MyCompi es una plataforma SaaS que proporciona acceso a un equipo de Compis agentes — agentes de inteligencia artificial especializados en distintas áreas (atención al cliente, marketing, ventas, operaciones, análisis de datos y desarrollo web) — que trabajan de forma autónoma para el negocio del cliente.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          MyCompi actúa como plataforma tecnológica. Los Compis son herramientas de inteligencia artificial y no son empleados, representantes ni agentes legales del cliente ni de MyCompi.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>3. Registro y cuenta</h2>
        <ul style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          <li>Para contratar el Servicio debes registrarte proporcionando información veraz, completa y actualizada.</li>
          <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso. Toda actividad bajo tu cuenta es tu responsabilidad.</li>
          <li>Debes ser mayor de 18 años y tener capacidad legal para celebrar contratos.</li>
          <li>MyCompi se reserva el derecho de suspender o cancelar cuentas que infrinjan estos Términos o que se utilicen para fines ilícitos.</li>
        </ul>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>4. Planes y precios</h2>
        <ul style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          <li>Los precios vigentes aparecen en la plataforma y se cobran mensualmente en euros (€).</li>
          <li>El precio incluye todos los impuestos aplicables (IVA).</li>
          <li>Todos los planes se renuevan automáticamente mes a mes salvo cancelación expresa.</li>
          <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de cuenta. La cancelación se hará efectiva al final del período de facturación en curso.</li>
          <li>No hay permanencias ni compromisos a largo plazo.</li>
        </ul>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>5. Pago</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Los pagos se procesan a través de <strong>Stripe</strong>, nuestro procesador de pagos externo. Al contratar aceptas las <a href="https://stripe.com/ssa" target="_blank" rel="noopener">condiciones de Stripe</a>.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Si un pago no se puede procesar (tarjeta declinada, fondos insuficientes), MyCompi intentará cobro de nuevo en los 3 días siguientes. Si no se resuelve, la cuenta quedará suspendida.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Los precios pueden modificarse en cualquier momento. Los cambios se aplicarán a partir del siguiente ciclo de facturación y se comunicarán con al menos 15 días de antelación.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>6. Uso aceptable</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Queda prohibido:</p>
        <ul style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          <li>Usar el Servicio para actividades ilegales, fraude, phishing, distribución de malware o spam.</li>
          <li>Utilizar los Compis para generar contenido ilegal, difamatorio, discriminatorio o que infrinja derechos de terceros.</li>
          <li>Realizar ingeniería inversa, descompilar o acceder al código fuente de la plataforma.</li>
          <li>Revender, redistribuir o ceder el acceso al Servicio sin autorización escrita de MyCompi.</li>
          <li>Usar el Servicio para procesar datos personales de terceros sin cumplir con el RGPD.</li>
        </ul>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>7. Propiedad intelectual</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          MyCompi y todos sus componentes (código, diseño, logos, nombres comerciales) son propiedad de Mycompi LLC y están protegidos por la normativa de propiedad intelectual española y europea.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          El contenido que los Compis generen para ti durante la prestación del Servicio te pertenece, con la excepción de los modelos underlying de IA y la infraestructura de MyCompi.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>8. Limitación de responsabilidad</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          MyCompi se esforzará por prestar el Servicio con la mayor calidad posible. No garantizamos que los Compis produzcan resultados específicos, ya que dependen de los inputs del cliente y de la naturaleza de las tareas.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          MyCompi no será responsable de pérdidas indirectas, consecuenciales o por lucro cesante, salvo en caso de dolo o negligencia grave.
        </p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          La responsabilidad total de MyCompi en cualquier circunstancia no excederá el importe total abonado por el cliente en los 12 meses anteriores al hecho causante.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>9. Garantías y soporte</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          El soporte técnico se presta por email a través de <strong>paco@mycompi.com</strong>. Los Compis funcionan de forma autónoma. MyCompi no interviene en las decisiones que los Compis toman basándose en las instrucciones del cliente.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>10. Modificaciones del servicio y Términos</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          MyCompi puede modificar las características del Servicio o estos Términos en cualquier momento. Los cambios sustanciales se comunicarán con al menos 15 días de antelación por email o mediante aviso en la plataforma. El uso continuado tras la notificación se considerará aceptación.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>11. Cancelación y baja</h2>
        <ul style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', paddingLeft: '1.5rem', fontSize: '0.95rem' }}>
          <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de cuenta o escribiendo a paco@mycompi.com.</li>
          <li>La cancelación surte efecto al final del período de facturación en curso. No hay reembolsos parciales.</li>
          <li>Tras la baja, tu cuenta y datos se eliminarán en un plazo máximo de 30 días, salvo obligación legal de conservación (facturación: 6 años).</li>
          <li>MyCompi puede darte de baja de forma inmediata si incumples estos Términos o la legislación aplicable.</li>
        </ul>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>12. Ley aplicable y jurisdicción</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '1rem', fontSize: '0.95rem' }}>
          Estos Términos se rigen por la legislación española. Para cualquier controversia derivada de estos Términos o del uso del Servicio, ambas partes se someten expresamente a los Juzgados y Tribunales de la ciudad de Madrid (España), con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
        </p>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: C.dark, marginTop: '2rem', marginBottom: '0.75rem' }}>13. Información de la empresa</h2>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}><strong>Mycompi LLC</strong></p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>CIF: B60604238</p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Domicilio: España</p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Email: paco@mycompi.com</p>
        <p style={{ color: '#4B5563', lineHeight: 1.8, marginBottom: '3rem', fontSize: '0.95rem' }}>Web: mycompi.com</p>
      </div>
    </div>
  )
}