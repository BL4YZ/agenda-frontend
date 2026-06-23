'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="vc-cta">
      <div className="vc-cta-glow" />
      <div className="reveal" style={{ position: 'relative', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>— Tu próximo movimiento</div>
        <h2 className="vc-h-final">
          Empezar es <em>fácil.</em><br />
          Cambiar tu negocio,<br />
          también puede serlo.
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary">Empezar gratis</Link>
          <a href="mailto:hola@novu.uy" className="btn btn-ghost">Hablar con nosotros</a>
        </div>
        <div className="mono" style={{ marginTop: 32, fontSize: 12, letterSpacing: '0.14em', color: 'var(--fg-2)' }}>
          PLAN FREE SIEMPRE GRATIS · 14 DÍAS DE PRUEBA EN PLAN PRO · CANCELÁ CUANDO QUIERAS
        </div>
      </div>
    </section>
  );
}
