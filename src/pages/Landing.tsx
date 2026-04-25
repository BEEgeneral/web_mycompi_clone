import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ── Brand colours (from extracted CSS) ──────────────────────────────────────
const C = {
  dark:    '#2D3261',
  yellow:  '#FFD054',
  cream:   '#FCF9F1',
  pastel:  '#D1E0F3',
  muted:   '#9CA3AF',
  white:   '#FFFFFF',
  green:   '#22C55E',
  red:     '#DC2626',
  // Agent gradients (from, to)
  laura:   ['#f472b6', '#e11d48'],
  enzo:    ['#60a5fa', '#4f46e5'],
  carlos:  ['#4ade80', '#059669'],
  elena:   ['#fb923c', '#ea580c'],
  diana:   ['#a78bfa', '#7c3aed'],
  marcos:  ['#22d3ee', '#0891b2'],
  daniel:  ['#2d3261', '#2d326180'],
  pelayo:  ['#64748b', '#475569'],
}

// ── Agent data ─────────────────────────────────────────────────────────────
const AGENTS = [
  {
    name: 'Laura', role: 'Atención al Cliente',
    gradient: C.laura,
    stat: 'Respuestas instantáneas',
    desc: 'Un cliente pregunta a las 11pm. Laura responde al momento. Cero esperas, cero frustraciones.',
    initials: 'L',
  },
  {
    name: 'Enzo', role: 'Marketing',
    gradient: C.enzo,
    stat: '+25% leads en 30 días',
    desc: 'Enzo no hace contenido por hacer. Crea campañas que atraen leads reales y convierten.',
    initials: 'E',
  },
  {
    name: 'Carlos', role: 'Ventas',
    gradient: C.carlos,
    stat: '3x más cierres',
    desc: 'Carlos hace follow-up de cada lead automáticamente. Se acabaron los "les escribo mañana".',
    initials: 'C',
  },
  {
    name: 'Elena', role: 'Operaciones',
    gradient: C.elena,
    stat: '80% tiempo ahorrado',
    desc: 'Elena conecta tus herramientas y elimina las tareas manuales. Lo que tardabas 4h en hacer, ella lo hace en 4 minutos.',
    initials: 'E',
  },
  {
    name: 'Diana', role: 'Data & Growth',
    gradient: C.diana,
    stat: 'Reports semanales',
    desc: 'Diana te dice qué funciona y qué no. Decisiones basadas en datos, no en intuición.',
    initials: 'D',
  },
  {
    name: 'Marcos', role: 'Tech & Development',
    gradient: C.marcos,
    stat: 'Desde 1 día',
    desc: 'Marcos crea y mantiene tu presencia online. Páginas, e-commerce, integraciones — sin llamadas.',
    initials: 'M',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Laura respondía a nuestros clientes a las 2am cuando dormíamos. Nunca HubSpot hizo eso por nosotros.',
    name: 'David Ruiz', role: 'CEO, TiendaFarma',
    result: '−60% tickets de soporte',
    initials: 'DR', gradient: C.laura,
  },
  {
    quote: 'Carlos recuperó 3 ventas que habían caído en el olvido. Ningún CRM lo habría hecho tan automáticamente.',
    name: 'María Vega', role: 'Comercial, Asesoría Contable',
    result: '+€8.400 ventas/mes',
    initials: 'MV', gradient: C.carlos,
  },
  {
    quote: 'Elena automatizó el envío de reportes semanales. Antes lo hacíamos entre 2 personas en 4 horas. Ahora, 0.',
    name: 'Jordi Serra', role: 'COO, LogiFast',
    result: '4h → 0h/semana',
    initials: 'JS', gradient: C.elena,
  },
  {
    quote: 'Enzo encontró que nuestros posts del martes convertían 3x más. Cambió la estrategia en una semana.',
    name: 'Lucía Torres', role: 'CMO, ModaPaTi',
    result: '3x CTR en contenido',
    initials: 'LT', gradient: C.enzo,
  },
]

const FAQ = [
  { q: '¿Qué es exactamente un Profesional de MyCompi?', a: 'Es un profesional especializado en un área — Marketing, Ventas, Atención al Cliente, etc. No es un chatbot genérico. Tiene memoria, conoce tu negocio y ejecuta tareas concretas: responder dudas de clientes, crear contenido, hacer follow-up de leads, generar informes. Trabaja de forma autónoma y reporta resultados.', cat: 'General' },
  { q: '¿Necesito conocimientos técnicos para usarlo?', a: 'No. Configuras todo desde tu panel en minutos. Si tienes dudas, el equipo de soporte te ayuda. No necesitamos acceso a tus sistemas.', cat: 'General' },
  { q: '¿Cómo se diferencia de contratar a alguien?', a: 'Un profesional de MyCompi no enferma, no pide vacaciones, no se distrae, trabaja 24/7 y cuesta €49/mes. No sustituye al 100% de una persona — pero sí puede hacer el trabajo de un junior en muchas tareas repetitivas, por una fracción del coste.', cat: 'General' },
  { q: '¿Mis clientes sabrán que es un profesional automatizado?', a: 'Depende de cómo lo configuremos. En atención al cliente responde como cualquier profesional — pero con más consistencia y velocidad. En otros roles trabaja en segundo plano.', cat: 'General' },
  { q: '¿Cuánto tarda en estar operativo?', a: 'Tu primer Compi está operativo en menos de 30 minutos. Un equipo completo, en 24 horas. Empezar es elegir tu plan y contarnos qué necesitas.', cat: 'General' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin contratos, sin permanencia. Cancelas desde tu panel cuando quieras. No hay penalty ni costes de salida.', cat: 'Pagos' },
  { q: '¿Cómo funciona el pago?', a: 'Pago mensual con tarjeta a través de Stripe. Datos 100% seguros. Sin sorpresas: el precio que ves es el que pagas.', cat: 'Pagos' },
  { q: '¿Hay factura fiscal?', a: 'Sí. Stripe genera factura automática con todos los datos fiscales que necesites (CIF, dirección, IVA).', cat: 'Pagos' },
  { q: '¿Qué pasa si el profesional se equivoca?', a: 'Las acciones irreversibles siempre requieren tu aprobación. Además, el director de tu equipo supervisa y escala cuando algo está fuera de alcance o implica decisiones de negocio.', cat: 'Técnico' },
  { q: '¿Qué pasa si necesito una funcionalidad que no existe?', a: 'Lo evaluamos y lo implementamos si tiene sentido para otros clientes. Roadmap abierto: tú puedes pedir funcionalidades y priorizamos según la demanda.', cat: 'Técnico' },
  { q: '¿Mis datos están seguros?', a: 'Tus datos se almacenan en servidores seguros (Neon PostgreSQL + Render). No compartimos información con terceros. Cumple con GDPR.', cat: 'Técnico' },
]

// ── Agent photos ───────────────────────────────────────────────────────────
const AGENT_PHOTOS: Record<string, string> = {
  'Daniel Herrera': '/assets/agent-daniel.jpg',
  'Pelayo': '/assets/agent-pelayo.jpg',
  'Laura': '/assets/agent-laura.jpg',
  'Enzo': '/assets/agent-enzo.jpg',
  'Carlos': '/assets/agent-carlos.jpg',
  'Elena': '/assets/agent-elena.jpg',
  'Diana': '/assets/agent-diana.jpg',
  'Marcos': '/assets/agent-marcos.jpg',
  'Lucía': '/assets/agent-lucia.jpg',
  'Paco': '/assets/agent-paco.jpg',
}

// ── Avatar with photo or gradient fallback ─────────────────────────────────
function Avatar({ initials, gradient, size = 80, name }: { initials: string; gradient: string[]; size?: number; name?: string }) {
  const photo = name ? AGENT_PHOTOS[name] : undefined
  const [f, t] = gradient
  if (photo) {
    return (
      <img src={photo} alt={name || initials} style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
      }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${f}, ${t})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.white, fontWeight: 700, fontSize: size * 0.3,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ── CSS styles ──────────────────────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'Poppins', 'Montserrat', 'Inter', system-ui, sans-serif",
    background: C.cream,
    color: C.dark,
    WebkitFontSmoothing: 'antialiased',
    overflowX: 'hidden' as const,
  },
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.85rem 1rem',
    borderBottom: `1px solid ${C.pastel}`,
    background: C.dark,
    position: 'sticky' as const, top: 0, zIndex: 100,
  },
  brand: { fontSize: '1.5rem', fontWeight: 800, color: C.white },
  brandAccent: { color: C.yellow },
  navLinks: { display: 'flex', gap: '1.5rem', alignItems: 'center' as const },
  navLink: { color: C.pastel, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' },
  navCta: {
    background: C.yellow, color: C.dark,
    padding: '0.45rem 1.1rem', borderRadius: 8, fontSize: '0.85rem',
    textDecoration: 'none', fontWeight: 700, minHeight: 44, minWidth: 44,
    display: 'inline-flex', alignItems: 'center',
  },
  navLinkMobile: {
    color: C.white, fontSize: '1.3rem', fontWeight: 500,
    textDecoration: 'none', padding: '0.5rem 0',
    borderBottom: `1px solid ${C.pastel}`,
  },
  navCtaMobile: {
    background: C.yellow, color: C.dark,
    padding: '0.85rem', borderRadius: 10, fontSize: '1rem',
    textDecoration: 'none', fontWeight: 700, textAlign: 'center' as const, minHeight: 44, minWidth: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 1rem', width: '100%', boxSizing: 'border-box' as const },
  section: { padding: '4rem 0' },
  badge: {
    display: 'inline-block',
    padding: '0.35rem 1rem',
    background: C.dark,
    color: C.yellow,
    borderRadius: 9999,
    fontSize: '0.8rem', fontWeight: 700,
    marginBottom: '1.5rem',
  },
  h1: {
    fontSize: 'clamp(2rem, 6vw, 3.5rem)',
    fontWeight: 900, lineHeight: 1.1,
    marginBottom: '1.5rem', color: C.dark,
  },
  h2: {
    fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
    fontWeight: 800, marginBottom: '1rem', color: C.dark,
  },
  h3: { fontSize: '1.2rem', fontWeight: 700, color: C.dark },
  p: { color: '#4B5563', lineHeight: 1.7, fontSize: '1rem' },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '0.85rem 2rem', borderRadius: 10,
    background: C.dark, color: C.white, fontWeight: 700,
    fontSize: '1rem', textDecoration: 'none', minHeight: 48, minWidth: 48,
  },
  btnOutline: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '0.85rem 2rem', borderRadius: 10,
    background: 'transparent', color: C.dark,
    border: `2px solid ${C.pastel}`, fontWeight: 600,
    fontSize: '1rem', textDecoration: 'none', minHeight: 48, minWidth: 48,
  },
  divider: { height: 1, background: C.pastel, margin: '0.5rem 0' },
}

// extra styles for form inputs
const s2 = {
  input: {
    width: '100%', padding: '0.85rem 1rem',
    background: 'rgba(255,255,255,0.08)', border: `1px solid ${C.pastel}40`,
    borderRadius: 8, color: C.white, fontSize: '1rem',
    fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box' as const, minHeight: 48,
  },
}

// ── How It Works steps ─────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    num: '1',
    title: 'Cuéntanos tu negocio',
    desc: 'Describe qué necesitas o pásanos tu URL. Nosotros investigamos tu sector, tu competencia y tus clientes.',
    icon: '💬',
  },
  {
    num: '2',
    title: 'Nosotros montamos el equipo',
    desc: 'En 24h montamos tu equipo de Compis especializados. Cada uno sabe qué hacer, cómo hacerlo y cuándo.',
    icon: '🤖',
  },
  {
    num: '3',
    title: 'Escalas sin límites',
    desc: 'Mientras duermes, tu equipo responde clientes, cierra ventas y genera informes. Tú solo supervisas.',
    icon: '🚀',
  },
]

// ── Social proof testimonials (after agents) ─────────────────────────────
const SOCIAL_PROOF: { quote: string; name: string; role: string; result: string; initials: string; gradient: string[] }[] = [
  {
    quote: 'Pasé de perder 3 horas al día en soporte a cero. Mis clientes esperan menos de 2 minutos respuesta. Y no he contratado a nadie.',
    name: 'Alberto Montoya',
    role: 'Fundador, Consultora Montoya',
    result: '−3h/día en tareas administrativas',
    initials: 'AM',
    gradient: [C.dark, C.dark],
  },
  {
    quote: 'Cerramos el primer mes con 14 leads nuevos directamente atribuidos a Carlos. Eso nunca había pasado con ningún comercial.',
    name: 'Patricia Castejón',
    role: 'CEO, Legaltech Sevilla',
    result: '+€12.000 facturación mensual',
    initials: 'PC',
    gradient: C.carlos,
  },
  {
    quote: 'Tengo un equipo de 6 Compis que trabaja desde las 8am hasta medianoche. Mi anterior секретарь solo trabajaba 8 horas.',
    name: 'Sergi Marquès',
    role: 'Director, Inmobiliaria Costa Brava',
    result: '24/7 atención sin coste de personal',
    initials: 'SM',
    gradient: C.elena,
  },
]

export default function Landing() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [faqFilter, setFaqFilter] = useState('Todas')
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSent, setContactSent] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)
  const [stickyVisible, setStickyVisible] = useState(false)
  const [heroHeight, setHeroHeight] = useState(0)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const heroEl = document.getElementById('hero')
    if (heroEl) setHeroHeight(heroEl.offsetHeight)
    const handleScroll = () => {
      setStickyVisible(window.scrollY > heroHeight)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [heroHeight])

  const cats = ['Todas', 'General', 'Pagos', 'Técnico']
  const filteredFaq = faqFilter === 'Todas' ? FAQ : FAQ.filter(f => f.cat === faqFilter)

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    const EDGE_FUNCTIONS_URL = 'https://fa8w7x4s.functions.insforge.app'
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/contact-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (res.ok) {
        setContactSent(true)
      } else {
        alert('Error al enviar. Inténtalo de nuevo.')
      }
    } catch {
      alert('Error de conexión. Inténtalo de nuevo.')
    }
  }

  const monthlyPrice = 49
  const annualPrice = 390
  const annualMonthly = 32.5

  return (
    <div style={s.page}>
      <style>{`
        html { scroll-behavior: smooth; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        a:hover { text-decoration: none; }
        .agent-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px #2d326120; }
        .faq-item:hover .faq-q { color: #2D3261; }
        input:focus, textarea:focus { outline: none; border-color: #FFD054 !important; box-shadow: 0 0 0 3px #FFD05430; }
        .sticky-cta { transition: transform 0.3s ease, opacity 0.3s ease; }
        @media (max-width: 767px) {
          .agents-grid { grid-template-columns: 1fr !important; }
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
          .team-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── SKIP LINK (WCAG 2.4.1) ── */}
      <a href="#main" style={{
        position: 'absolute', left: '-9999px', top: 'auto',
        width: '1px', height: '1px', overflow: 'hidden',
        zIndex: 9999,
      }}
      onFocus={(e) => { e.currentTarget.style.position = 'fixed'; e.currentTarget.style.left = '1rem'; e.currentTarget.style.top = '1rem'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto'; e.currentTarget.style.padding = '0.75rem 1.25rem'; e.currentTarget.style.background = '#00C853'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderRadius = '8px'; e.currentTarget.style.fontWeight = '700'; e.currentTarget.style.fontSize = '0.9rem'; e.currentTarget.style.zIndex = '99999'; e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'; }}
      onBlur={(e) => { e.currentTarget.style.position = 'absolute'; e.currentTarget.style.left = '-9999px'; e.currentTarget.style.width = '1px'; e.currentTarget.style.height = '1px'; }}
      >Saltar al contenido principal</a>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.png" alt="MyCompi" height="36" style={{ objectFit: 'contain' }} />
        </Link>

        {/* Desktop nav */}
        <div className="desktop-nav" style={s.navLinks}>
          <a href="#servicios" style={s.navLink}>Servicios</a>
          <a href="#equipo" style={s.navLink}>Equipo</a>
          <a href="#precios" style={s.navLink}>Precios</a>
          <a href="#faq" style={s.navLink}>FAQ</a>
          <Link to="/login" style={{ ...s.navLink, color: C.white }}>Acceder</Link>
          <Link to="/registro" style={s.navCta}>Empezar gratis →</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem', flexDirection: 'column', gap: '5px', minWidth: 44, minHeight: 44,
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <div style={{ width: 24, height: 2, background: C.yellow, borderRadius: 2 }} />
          <div style={{ width: 24, height: 2, background: C.yellow, borderRadius: 2 }} />
          <div style={{ width: 24, height: 2, background: C.yellow, borderRadius: 2 }} />
        </button>
      </nav>

      {/* ── MOBILE MENU ──────────────────────────────────────────────────── */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, bottom: 0,
          background: C.dark, zIndex: 99, display: 'flex', flexDirection: 'column',
          padding: '2rem 1.5rem', gap: '1.25rem', overflowX: 'hidden',
        }}>
          <a href="#servicios" style={s.navLinkMobile} onClick={() => setMenuOpen(false)}>Servicios</a>
          <a href="#equipo" style={s.navLinkMobile} onClick={() => setMenuOpen(false)}>Equipo</a>
          <a href="#precios" style={s.navLinkMobile} onClick={() => setMenuOpen(false)}>Precios</a>
          <a href="#faq" style={s.navLinkMobile} onClick={() => setMenuOpen(false)}>FAQ</a>
          <Link to="/login" style={s.navLinkMobile} onClick={() => setMenuOpen(false)}>Acceder</Link>
          <Link to="/registro" style={s.navCtaMobile} onClick={() => setMenuOpen(false)}>Empezar gratis →</Link>
        </div>
      )}

      {/* ── MAIN CONTENT (WCAG 2.4.1 target) ────────────────────────────── */}
      <main id="main">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" style={{ ...s.section, paddingTop: '5rem', textAlign: 'center' as const }}>
        <div style={s.container}>
          <div style={s.badge}>🎁 5 días gratis · Sin compromiso · Cancela cuando quieras</div>
          <h1 style={s.h1}>
            Tu equipo de IA trabaja 24/7<br />
            por €49/mes
          </h1>
          <p style={{ ...s.p, fontSize: '1.05rem', maxWidth: 600, margin: '0 auto 2.5rem', color: '#4B5563' }}>
            Sin permanencias. Sin técnicos. En 5 minutos tienes tu primer Compi.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <Link to="/registro" style={{ ...s.btnPrimary, background: C.yellow, color: C.dark }}>Empezar gratis →</Link>
            <a href="#como-funciona" style={s.btnOutline}>Ver cómo funciona</a>
          </div>
          <p style={{ marginTop: '1.5rem', color: C.muted, fontSize: '0.85rem' }}>
            🔒 Pago seguro con Stripe · Sin permanencia · Cancela cuando quieras · Datos protegidos
          </p>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <section style={{ background: C.pastel, padding: '2rem 0' }}>
        <div style={s.container}>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { num: '500+', label: 'empresas' },
              { num: '4.8/5', label: 'valoración media' },
              { num: '10M+', label: 'mensajes contestados' },
            ].map(stat => (
              <div key={stat.num}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: C.dark }}>{stat.num}</div>
                <div style={{ color: C.dark, fontSize: '0.85rem', fontWeight: 500, opacity: 0.7 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section id="como-funciona" style={{ ...s.section, background: C.white, overflowX: 'hidden' }}>
        <div style={s.container}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: C.dark, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Proceso</p>
            <h2 style={s.h2}>Listo en 3 pasos</h2>
            <p style={{ ...s.p, maxWidth: 500, margin: '0 auto' }}>
              Sin configuración compleja. Sin reuniones de onboarding. Empezar lleva 5 minutos.
            </p>
          </div>
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {HOW_STEPS.map((step, idx) => (
              <div key={step.num} style={{ textAlign: 'center', position: 'relative' }}>
                {/* Connector arrow (desktop only) */}
                {!isMobile && idx < HOW_STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: '36px', right: '-1rem', width: '2rem', color: C.pastel, fontSize: '1.5rem', fontWeight: 700 }}>
                    →
                  </div>
                )}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: `${C.yellow}20`,
                  border: `2px solid ${C.yellow}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem', fontSize: '2rem',
                }}>
                  {step.icon}
                </div>
                <div style={{ display: 'inline-block', background: C.dark, color: C.yellow, borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', marginBottom: '0.75rem' }}>
                  PASO {step.num}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.dark, marginBottom: '0.6rem' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ────────────────────────────────────────────────────── */}
      <section id="servicios" style={{ ...s.section, background: C.cream, overflowX: 'hidden' }}>
        <div style={s.container}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: C.dark, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Servicios</p>
            <h2 style={s.h2}>Cada profesional es un experto en su área</h2>
            <p style={{ ...s.p, maxWidth: 600, margin: '0 auto' }}>
              No son herramientas. Son profesionales con nombre, memoria y objetivos.
              Encajan en tu equipo.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {AGENTS.map(a => (
              <div key={a.name} style={{
                background: C.white, border: `1px solid ${C.pastel}`,
                borderRadius: 16, padding: '1.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                maxWidth: '100%', boxSizing: 'border-box',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px #2d326115'; (e.currentTarget as HTMLDivElement).style.borderColor = C.dark }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.borderColor = C.pastel }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Avatar initials={a.initials} gradient={a.gradient} size={56} name={a.name} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: C.dark }}>{a.name}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, background: `${a.gradient[0]}20`, color: a.gradient[0], padding: '0.15rem 0.5rem', borderRadius: 9999, display: 'inline-block', marginTop: '0.2rem' }}>
                      {a.role}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: a.gradient[0], marginBottom: '0.5rem' }}>{a.stat}</div>
                <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────────────── */}
      <section style={{ ...s.section, background: C.white, overflowX: 'hidden' }}>
        <div style={s.container}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: C.dark, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Resultados reales</p>
            <h2 style={s.h2}>Lo que dicen de nosotros</h2>
            <p style={{ ...s.p, maxWidth: 500, margin: '0 auto' }}>
              No nos crees? Lee lo que dicen los que ya lo usan.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {SOCIAL_PROOF.map(t => (
              <div key={t.name} style={{
                background: C.cream, border: `2px solid ${C.pastel}`,
                borderRadius: 16, padding: '1.75rem',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px #2d326120`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
              >
                <p style={{ fontSize: '0.9rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <Avatar initials={t.initials} gradient={t.gradient} size={44} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.dark }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: C.muted }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', background: `${t.gradient[0]}15`, color: t.gradient[0], fontWeight: 700, fontSize: '0.78rem', padding: '0.3rem 0.7rem', borderRadius: 9999, display: 'inline-block' }}>
                  {t.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ───────────────────────────────────────────────────────── */}
      <section id="precios" style={{ ...s.section, background: C.cream, overflowX: 'hidden' }}>
        <div style={s.container}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: C.dark, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Precios</p>
            <h2 style={s.h2}>Sin sorpresas. Sin permanencia.</h2>
            <p style={{ ...s.p, maxWidth: 480, margin: '0 auto 1.5rem' }}>
              Empieza hoy con 5 días gratis. Sin tarjeta de crédito.
            </p>
            {/* Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: C.white, border: `1px solid ${C.pastel}`, borderRadius: 9999, padding: '0.35rem 0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: !isAnnual ? C.dark : C.muted }}>Mensual</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                style={{
                  width: 44, height: 24, borderRadius: 9999,
                  background: isAnnual ? C.yellow : C.pastel,
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: isAnnual ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: C.white, transition: 'left 0.2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isAnnual ? C.dark : C.muted }}>
                Anual
                <span style={{ background: C.green, color: C.white, fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 9999, marginLeft: '0.3rem' }}>−33%</span>
              </span>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: 760, margin: '0 auto' }}>

            {/* Monthly card */}
            <div style={{
              background: C.white, border: `2px solid ${C.pastel}`,
              borderRadius: 24, padding: '2rem',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: C.dark, marginBottom: '0.5rem' }}>Mensual</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: C.dark }}>€{monthlyPrice}</span>
                  <span style={{ color: C.muted, fontSize: '0.9rem' }}>/mes</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: C.muted, marginTop: '0.25rem' }}>Cancela cuando quieras</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                {[
                  '7 Compis agentes especializados',
                  'Marketing, ventas, atención al cliente',
                  'Reporting y análisis continuo',
                  'Chat con Paco, tu orquestador 24/7',
                  '5 días gratis para probar',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#374151' }}>
                    <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <Link to="/registro" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.85rem', borderRadius: 12,
                background: C.white, color: C.dark,
                border: `2px solid ${C.dark}`, fontWeight: 700,
                fontSize: '0.95rem', textDecoration: 'none', minHeight: 48,
              }}>
                Empezar gratis →
              </Link>
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: C.muted }}>
                Sin tarjeta de crédito
              </p>
            </div>

            {/* Annual card */}
            <div style={{
              background: C.dark, border: `2px solid ${C.dark}`,
              borderRadius: 24, padding: '2rem',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Badge */}
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: C.yellow, color: C.dark,
                fontSize: '0.65rem', fontWeight: 800,
                padding: '0.25rem 0.6rem', borderRadius: 9999,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                ⭐ MEJOR VALOR
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: C.yellow, marginBottom: '0.5rem' }}>Anual</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: C.white }}>€{annualMonthly}</span>
                  <span style={{ color: C.pastel, fontSize: '0.9rem' }}>/mes</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: C.pastel, marginTop: '0.25rem' }}>
                  €{annualPrice}/año — ahórrate €198 al año
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                {[
                  'Todo lo del plan Mensual',
                  '7 Compis agentes especializados',
                  'Prioridad en soporte',
                  'Onboarding personalizado incluido',
                  'Acceso anticipado a nuevas funciones',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: C.pastel }}>
                    <span style={{ color: C.green, fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <Link to="/registro" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.85rem', borderRadius: 12,
                background: C.yellow, color: C.dark,
                border: 'none', fontWeight: 700,
                fontSize: '0.95rem', textDecoration: 'none', minHeight: 48,
              }}>
                Empezar gratis →
              </Link>
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: C.pastel }}>
                Sin tarjeta de crédito · 5 días gratis
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '2rem', color: C.muted, fontSize: '0.82rem' }}>
            🔒 Pago seguro con Stripe · Sin permanencia · Cancela cuando quieras · Datos protegidos
          </p>
        </div>
      </section>

      {/* ── EQUIPO ────────────────────────────────────────────────────────── */}
      <section id="equipo" style={{ ...s.section, background: C.cream, overflowX: 'hidden' }}>
        <div style={s.container}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: C.dark, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Tu equipo de profesionales</p>
            <h2 style={s.h2}>No trabajan para ti. Trabajan contigo.</h2>
            <p style={{ ...s.p, maxWidth: 600, margin: '0 auto' }}>
              Cada profesional tiene un rol claro. Coordinados por un director,
              ejecutan las tareas para que tú puedas concentrarte en lo que importa.
            </p>
          </div>

          {/* Director — centrado arriba */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: C.white, border: `2px solid ${C.dark}`, borderRadius: 20, padding: isMobile ? '1.5rem' : '2rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', maxWidth: 480, width: '100%', boxSizing: 'border-box', flexDirection: isMobile ? 'column' : 'row' }}>
              <Avatar initials="DH" gradient={C.daniel} size={72} name="Daniel Herrera" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.dark }}>Daniel Herrera</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.5rem' }}>Director General</div>
                <p style={{ fontSize: '0.875rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '0.75rem' }}>Coordina todo tu equipo. Toma decisiones estratégicas contigo. Cada lunes te envía un resumen semanal con resultados.</p>
                <div style={{ fontSize: '0.8rem', color: C.dark, fontWeight: 600, background: `${C.yellow}30`, padding: '0.25rem 0.6rem', borderRadius: 6, display: 'inline-block' }}>
                  Coordina todo tu equipo
                </div>
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 1rem' }}>
            <div style={{ width: 2, height: 32, background: C.pastel }} />
          </div>

          {/* Pelayo (Compis Director) — centrado */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ background: C.white, border: `1px solid ${C.pastel}`, borderRadius: 20, padding: isMobile ? '1.25rem' : '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', maxWidth: 420, width: '100%', boxSizing: 'border-box', flexDirection: isMobile ? 'column' : 'row' }}>
              <Avatar initials="P" gradient={C.pelayo} size={56} name="Pelayo" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: C.dark }}>Pelayo</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', marginBottom: '0.4rem' }}>Compis Director</div>
                <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.5 }}>Coordina tu agenda, gestiona emails, prepara reuniones y anticipa lo que necesitas.</p>
              </div>
            </div>
          </div>

          {/* Connector line */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 1rem' }}>
            <div style={{ width: 2, height: 32, background: C.pastel }} />
          </div>

          {/* 6 Specialists — grid 3 columnas */}
          <div className="agents-grid team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {AGENTS.map(a => (
              <div key={a.name} style={{
                background: C.white, border: `1px solid ${C.pastel}`,
                borderRadius: 16, padding: '1.25rem', textAlign: 'center',
                transition: 'transform 0.2s', maxWidth: '100%', boxSizing: 'border-box',
              }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar initials={a.initials} gradient={a.gradient} size={64} name={a.name} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: C.dark, marginTop: '0.75rem' }}>{a.name}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: a.gradient[0], marginBottom: '0.5rem' }}>{a.role}</div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.5 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (original section with name+role style) ─────────── */}
      <section style={{ ...s.section, background: C.white, overflowX: 'hidden' }}>
        <div style={s.container}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ color: C.dark, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Casos reales</p>
            <h2 style={s.h2}>Resultados que puedes verificar</h2>
            <p style={s.p}>Con nombres, empresas y cifras concretas.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: C.cream, border: `2px solid ${C.pastel}`, borderRadius: 16, padding: '1.5rem', transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default', maxWidth: '100%', boxSizing: 'border-box' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 32px #2d326120`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <Avatar initials={t.initials} gradient={t.gradient} size={48} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: C.dark }}>{t.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{t.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#374151', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1rem' }}>"{t.quote}"</p>
                <div style={{ background: `${t.gradient[0]}15`, color: t.gradient[0], fontWeight: 700, fontSize: '0.8rem', padding: '0.3rem 0.7rem', borderRadius: 9999, display: 'inline-block' }}>
                  {t.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ ...s.section, background: C.cream, overflowX: 'hidden' }}>
        <div style={{ ...s.container, maxWidth: 760 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: C.dark, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>FAQ</p>
            <h2 style={s.h2}>Preguntas antes de empezar</h2>
          </div>
          {/* Category filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', justifyContent: 'center' }}>
            {cats.map(cat => (
              <button key={cat} onClick={() => setFaqFilter(cat)} style={{
                padding: '0.4rem 0.9rem', borderRadius: 9999, fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', border: `1px solid ${faqFilter === cat ? C.dark : C.pastel}`,
                background: faqFilter === cat ? C.dark : 'transparent',
                color: faqFilter === cat ? C.white : C.dark,
                transition: 'all 0.15s', minHeight: 40, minWidth: 40,
              }}>
                {cat}
              </button>
            ))}
          </div>
          {/* Questions */}
          <div>
            {filteredFaq.map((item) => {
              const globalIdx = FAQ.indexOf(item)
              return (
                <div key={item.q} style={{ borderBottom: `1px solid ${C.pastel}`, padding: '1.25rem 0' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: C.dark, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', userSelect: 'none' as const }} onClick={() => setOpenFaq(openFaq === globalIdx ? null : globalIdx)}>
                    {item.q}
                    <span style={{ color: C.yellow, fontSize: '1.4rem', fontWeight: 700, flexShrink: 0, lineHeight: 1, transition: 'transform 0.2s', display: 'inline-block', transform: openFaq === globalIdx ? 'rotate(45deg)' : 'none', minWidth: 44, minHeight: 44, textAlign: 'center' as const }}>+</span>
                  </div>
                  {openFaq === globalIdx && (
                    <p style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.75 }}>{item.a}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ──────────────────────────────────────────────────────── */}
      <section id="contacto" style={{ ...s.section, background: C.dark, overflowX: 'hidden' }}>
        <div style={{ ...s.container, maxWidth: 600, textAlign: 'center' }}>
          <h2 style={{ ...s.h2, color: C.white }}>¿Hablamos de tu proyecto?</h2>
          <p style={{ color: C.pastel, marginBottom: '2.5rem' }}>Profesionales que elevan el potencial de tu negocio. Empieza hoy.</p>
          {contactSent ? (
            <div style={{ background: `${C.yellow}20`, border: `1px solid ${C.yellow}`, borderRadius: 12, padding: '2rem', color: C.yellow }}>
              ¡Mensaje enviado! Te respondemos en menos de 24h.
            </div>
          ) : (
            <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              <input required placeholder="Tu nombre" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} style={{ ...s2.input }} />
              <input required type="email" placeholder="tu@empresa.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} style={{ ...s2.input }} />
              <textarea required rows={4} placeholder="Cuéntanos tu proyecto..." value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} style={{ ...s2.input, resize: 'vertical' as const }} />
              <button type="submit" style={{ ...s.btnPrimary, background: C.yellow, color: C.dark, justifyContent: 'center', minHeight: 50, width: '100%' }}>
                Enviar mensaje →
              </button>
            </form>
          )}
          <p style={{ marginTop: '1.5rem', color: C.pastel, fontSize: '0.9rem' }}>hola@mycompi.com</p>
        </div>
      </section>
      </main>

      {/* ── STICKY BOTTOM CTA ─────────────────────────────────────────────── */}
      <div
        className="sticky-cta"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: C.dark,
          padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1rem', zIndex: 200,
          transform: stickyVisible ? 'translateY(0)' : 'translateY(100%)',
          opacity: stickyVisible ? 1 : 0,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
        }}
      >
        <span style={{ color: C.white, fontWeight: 600, fontSize: isMobile ? '0.85rem' : '0.95rem', whiteSpace: 'nowrap' as const }}>
          🎁 5 días gratis — sin tarjeta
        </span>
        <Link
          to="/registro"
          style={{
            background: C.yellow, color: C.dark,
            padding: isMobile ? '0.6rem 1.1rem' : '0.7rem 1.5rem',
            borderRadius: 8, fontWeight: 700, fontSize: '0.85rem',
            textDecoration: 'none', whiteSpace: 'nowrap' as const,
            minHeight: 40,
          }}
        >
          Empezar ahora →
        </Link>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ background: '#1f1f2e', borderTop: `1px solid ${C.pastel}30`, padding: '2rem 0', overflowX: 'hidden' }}>
        <div style={{ ...s.container, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.white, marginBottom: '0.5rem' }}>
              <span style={{ color: C.yellow }}>My</span>Compi
            </div>
            <p style={{ color: C.pastel, fontSize: '0.85rem', opacity: 0.6 }}>Mi futuro es Hoy.</p>
            <p style={{ color: C.pastel, fontSize: '0.8rem', opacity: 0.5, marginTop: '0.25rem' }}>Equipos de Compis agentes especializados para PYMES.</p>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? '2rem' : '3rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.white, marginBottom: '0.75rem' }}>Producto</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[['Equipo', '#equipo'], ['Precios', '#precios'], ['FAQ', '#faq']].map(([label, href]) => (
                  <a key={label} href={href} style={{ color: C.pastel, fontSize: '0.85rem', opacity: 0.7 }}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.white, marginBottom: '0.75rem' }}>Legal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[['Privacidad', '/privacidad'], ['Términos', '/terminos'], ['Cookies', '/cookies'], ['Aviso Legal', '/aviso-legal']].map(([label, href]) => (
                  <Link key={label} to={href} style={{ color: C.pastel, fontSize: '0.85rem', opacity: 0.7 }}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ ...s.container, marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.pastel}20` }}>
          <p style={{ color: C.pastel, fontSize: '0.8rem', opacity: 0.4 }}>
            © 2026 Mycompi LLC — Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
