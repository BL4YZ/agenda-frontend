import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Blog — Novu' };

const POSTS = [
  {
    slug: 'reducir-ausencias',
    date: '10 de junio de 2026',
    title: 'Cómo reducir ausencias sin perseguir a tus clientes',
    desc: 'Las inasistencias no son mala voluntad — casi siempre son olvidos. Te contamos qué hace Novu para que tus clientes lleguen solos y qué podés sumar vos.',
    tag: 'Consejos',
  },
  {
    slug: 'cobros-online',
    date: '28 de mayo de 2026',
    title: 'Cobrar antes de que el cliente llegue: ¿seña o pago completo?',
    desc: 'Aceptar pagos al momento de la reserva reduce cancelaciones y mejora tu flujo de caja. Te explicamos las diferencias y cuándo usar cada opción.',
    tag: 'Finanzas',
  },
  {
    slug: 'pagina-publica',
    date: '15 de mayo de 2026',
    title: '5 cosas que podés hacer hoy en tu página pública para conseguir más reservas',
    desc: 'Tu página de reservas es tu carta de presentación online. Desde reseñas hasta FAQs: todo lo que podés activar para que más clientes reserven solos.',
    tag: 'Crecimiento',
  },
  {
    slug: 'metricas-negocio',
    date: '2 de mayo de 2026',
    title: 'Las métricas que todo negocio de servicios debería mirar cada semana',
    desc: 'No hace falta ser contador. Con tres o cuatro números bien leídos sabés si tu negocio está creciendo, estancado o perdiendo dinero sin darte cuenta.',
    tag: 'Finanzas',
  },
  {
    slug: 'agenda-vs-whatsapp',
    date: '18 de abril de 2026',
    title: 'Agenda online vs. WhatsApp: por qué dejar de coordinar por chat',
    desc: 'Coordinar turnos por WhatsApp parece cómodo hasta que no lo es más. Te mostramos qué se pierde y qué se gana cuando pasás a una agenda online.',
    tag: 'Consejos',
  },
  {
    slug: 'modalidades-compensacion',
    date: '5 de abril de 2026',
    title: 'Modalidades de compensación: ¿cuál le conviene a tu equipo?',
    desc: 'Sueldo fijo, comisión por cita, alquiler de silla o mixto. Analizamos los pros y contras de cada modalidad para que elijas la que mejor se adapta.',
    tag: 'Gestión',
  },
  {
    slug: 'temporada-alta',
    date: '20 de marzo de 2026',
    title: 'Cómo preparar tu negocio para la temporada alta',
    desc: 'Diciembre, semana santa, vacaciones de julio. Cuando llega el pico de demanda, lo último que querés es que la operación te desborde. Así te preparás.',
    tag: 'Gestión',
  },
  {
    slug: 'precios-servicios',
    date: '5 de marzo de 2026',
    title: 'Precios de servicios: cómo saber si estás cobrando bien',
    desc: 'Muchos negocios cobran por lo que creen que el mercado acepta, no por lo que realmente les cuesta. Una guía práctica para fijar precios con cabeza.',
    tag: 'Finanzas',
  },
];

const TAG_COLORS: Record<string, string> = {
  'Consejos':    '#60a5fa',
  'Crecimiento': '#34d399',
  'Gestión':     '#a78bfa',
  'Finanzas':    '#fbbf24',
};

export default function BlogPage() {
  return (
    <LegalLayout title="Blog" lastUpdated="Junio 2026">
      <div className="legal-highlight">
        Consejos, guías y novedades para sacarle más provecho a tu negocio.
      </div>
      <div className="legal-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div className="blog-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                    background: `${TAG_COLORS[post.tag] ?? '#fff'}22`,
                    color: TAG_COLORS[post.tag] ?? 'var(--fg-3)',
                  }}>
                    {post.tag}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{post.date}</span>
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-0)', margin: 0, lineHeight: 1.4 }}>{post.title}</p>
                <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0, lineHeight: 1.7 }}>{post.desc}</p>
                <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Leer artículo →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </LegalLayout>
  );
}
