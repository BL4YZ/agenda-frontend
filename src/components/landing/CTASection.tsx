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
          <Link href="/register" className="btn btn-ghost">Agendar demo</Link>
        </div>
        <div className="mono" style={{ marginTop: 32, fontSize: 11, letterSpacing: '0.18em', color: 'var(--fg-3)' }}>
          PLAN FREE SIEMPRE GRATIS · 14 DÍAS DE PRUEBA EN PRO · SIN TARJETA
        </div>
      </div>
    </section>
  );
}
