'use client';

const STEPS = [
  { n: '01', t: 'Cargá tu negocio', d: 'Tus servicios con duración y precio, los horarios de atención y, si trabajás con más gente, tu equipo. Un asistente te guía en cada paso.' },
  { n: '02', t: 'Compartí tu link', d: 'Tu página queda en novu.uy/public/tu-negocio. Ponela en la bio de Instagram, en tu perfil de Google o mandala por WhatsApp.' },
  { n: '03', t: 'Recibí reservas',  d: 'Las citas entran a tu agenda, los clientes reciben su confirmación y su recordatorio, y si activaste los pagos, la seña ya está cobrada.' },
];

export default function StepsSection() {
  return (
    <section className="vc-steps container-pad">
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
        <span className="eyebrow">— Cómo funciona</span>
        <h2 className="vc-h2" style={{ marginTop: 16 }}>Empezás a recibir reservas <em>el mismo día.</em></h2>
      </div>
      <div className="vc-steps-grid">
        {STEPS.map(s => (
          <div key={s.n} className="vc-step glass reveal">
            <div className="vc-step-n mono">{s.n}</div>
            <h3 className="vc-step-t">{s.t}</h3>
            <p className="vc-step-d">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
