'use client';

const STEPS = [
  { n: '01', t: 'Configura',  d: 'Servicios, horarios y staff. Wizard guiado, plantillas listas.' },
  { n: '02', t: 'Comparte',   d: 'Tu link miagenda.app/tu-negocio. En tu web, bio o WhatsApp.' },
  { n: '03', t: 'Cobra',      d: 'Calendario lleno, pagos automáticos. Tu trabajo es lo único que haces.' },
];

export default function StepsSection() {
  return (
    <section className="vc-steps container-pad">
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
        <span className="eyebrow">— Cómo funciona</span>
        <h2 className="vc-h2" style={{ marginTop: 16 }}>Tres pasos. <em>Cinco minutos.</em></h2>
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
