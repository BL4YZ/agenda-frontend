'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="vc-cta">
      <div className="vc-cta-glow" />
      <div className="reveal" style={{ position: 'relative', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>— Empezá hoy</div>
        <h2 className="vc-h-final">
          Creá tu cuenta<br />
          y recibí tu primera reserva<br />
          <em>hoy mismo.</em>
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary">Crear cuenta gratis</Link>
          <a href="mailto:hola@novu.uy" className="btn btn-ghost">Escribinos</a>
        </div>
        <div className="mono" style={{ marginTop: 32, fontSize: 12, letterSpacing: '0.14em', color: 'var(--fg-2)' }}>
          PLAN GRATIS SIN VENCIMIENTO · 14 DÍAS DE PRUEBA EN PRO · SIN PERMANENCIA
        </div>
      </div>
    </section>
  );
}
