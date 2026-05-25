import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Blog — Novu' };

const POSTS = [
  {
    date: '15 de mayo de 2026',
    title: 'Cómo reducir ausencias con recordatorios automáticos',
    desc: 'Los recordatorios por email reducen las ausencias hasta un 40%. Te mostramos cómo configurarlos en Novu y qué mensajes funcionan mejor.',
    tag: 'Consejos',
  },
  {
    date: '2 de mayo de 2026',
    title: '5 formas de usar la página pública para conseguir más clientes',
    desc: 'Tu página de reservas es tu carta de presentación online. Desde agregar reseñas hasta compartirla en redes: todo lo que podés hacer para maximizar las reservas.',
    tag: 'Crecimiento',
  },
  {
    date: '18 de abril de 2026',
    title: 'Modalidades de compensación: ¿cuál le conviene a tu equipo?',
    desc: 'Empleado fijo, comisión por cita, alquiler de silla o mixto. Analizamos los pros y contras de cada modalidad para que elijas la que mejor se adapta a tu negocio.',
    tag: 'Gestión',
  },
  {
    date: '5 de abril de 2026',
    title: 'Cobros online en salones y barberías: guía práctica',
    desc: 'Aceptar señas o pagos completos al momento de la reserva reduce cancelaciones y mejora el flujo de caja. Te explicamos cómo activarlo con MercadoPago.',
    tag: 'Finanzas',
  },
];

const TAG_COLORS: Record<string, string> = {
  'Consejos':   '#60a5fa',
  'Crecimiento':'#34d399',
  'Gestión':    '#a78bfa',
  'Finanzas':   '#fbbf24',
};

export default function BlogPage() {
  return (
    <LegalLayout title="Blog" lastUpdated="Mayo 2026">
      <div className="legal-highlight">
        Consejos, guías y novedades para sacarle más provecho a tu negocio.
      </div>
      <div className="legal-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {POSTS.map((post, i) => (
            <div key={i} style={{ padding: '20px 22px', borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <span style={{ fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic' }}>Artículo completo próximamente</span>
            </div>
          ))}
        </div>
      </div>
    </LegalLayout>
  );
}
