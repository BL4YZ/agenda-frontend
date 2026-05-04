'use client';

interface TestiProps {
  quote: string;
  name: string;
  role: string;
  stars: number;
}

function Testi({ quote, name, role, stars }: TestiProps) {
  return (
    <div className="vc-testi-card glass reveal">
      <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
        {Array(stars).fill(0).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <p style={{ fontSize: 17, lineHeight: 1.5, color: 'var(--fg-0)', fontFamily: 'var(--font-display)', letterSpacing: '-0.015em', fontWeight: 500 }}>
        &ldquo;{quote}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--v-400), var(--v-700))', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{name}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: '0.06em' }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIALS: TestiProps[] = [
  {
    quote: 'Pasé de perder 4 citas por semana a casi cero. Los recordatorios de WhatsApp lo cambiaron todo.',
    name: 'Camila V.', role: 'Estética · Bogotá', stars: 5,
  },
  {
    quote: 'Mis clientes reservan ellos solos. Yo recupero 2 horas al día que antes perdía respondiendo mensajes.',
    name: 'Roberto P.', role: 'Barbería · CDMX', stars: 5,
  },
  {
    quote: 'Por fin tengo claridad sobre cuánto facturo y por qué servicio. Tomé decisiones que aumentaron 30% mis ingresos.',
    name: 'Lucía M.', role: 'Coaching · Buenos Aires', stars: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="vc-testi container-pad" id="clientes">
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
        <span className="eyebrow">— Voces</span>
        <h2 className="vc-h2" style={{ marginTop: 16 }}>Lo que dicen <em>quienes la usan.</em></h2>
      </div>
      <div className="vc-testi-grid">
        {TESTIMONIALS.map((t, i) => <Testi key={i} {...t} />)}
      </div>
    </section>
  );
}
