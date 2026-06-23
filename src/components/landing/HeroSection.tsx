'use client';

import Link from 'next/link';
import { RefObject } from 'react';
import LiveCalendar from './LiveCalendar';

interface HeroSectionProps {
  heroRef: RefObject<HTMLElement | null>;
  mp: { x: number; y: number };
}

function MiniMonth() {
  const highlighted = [4, 7, 11, 14, 18, 22, 25, 28];
  return (
    <div style={{ padding: 18, height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--fg-0)' }}>
          Abril 2026
        </div>
        <div className="mono" style={{ fontSize: 9.5, color: 'var(--fg-3)', letterSpacing: '0.1em' }}>
          VISTA MES
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 }}>
        {Array(35).fill(0).map((_, i) => {
          const d = i - 1;
          const has = highlighted.includes(d);
          const today = d === 14;
          return (
            <div key={i} style={{
              aspectRatio: '1',
              borderRadius: 6,
              background: today ? 'var(--accent)' : has ? 'oklch(0.55 0.22 290 / 0.18)' : 'transparent',
              border: today ? 'none' : has ? '1px solid oklch(0.7 0.2 290 / 0.3)' : '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10,
              color: today ? 'white' : has ? 'var(--fg-1)' : 'var(--fg-3)',
              fontFamily: 'var(--font-mono)',
              opacity: d < 1 || d > 30 ? 0.3 : 1,
            }}>
              {d > 0 && d <= 30 ? d : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HeroSection({ heroRef, mp }: HeroSectionProps) {
  return (
    <section ref={heroRef as RefObject<HTMLElement>} className="vc-hero" id="producto">
      <div className="vc-hero-l">
        <div className="vc-eyeline reveal">
          <span className="vc-eyeline-bar" />
          <span className="mono">PARA NEGOCIOS DE SERVICIOS · 2026</span>
        </div>

        <h1 className="vc-h1">
          <span className="vc-h1-part vc-h1-out">Tu tiempo</span>
          <span className="vc-h1-part vc-h1-mid">deja de perderse</span>
          <span className="vc-h1-part vc-h1-bright">aquí.</span>
        </h1>

        <p className="vc-hero-sub">
          Novu toma reservas, envía recordatorios, cobra pagos y te muestra cómo va tu negocio.
          Sin instalar nada. Sin contratar a nadie.
        </p>

        <div className="vc-cta-row">
          <Link href="/register" className="btn btn-primary">
            Empezar gratis
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="vc-hero-r">
        <div
          className="vc-card-stack"
          style={{ transform: `translate3d(${mp.x * -10}px, ${mp.y * -10}px, 0)` }}
        >
          <div
            className="vc-stack-back glass"
            style={{ transform: `translate(-${30 - mp.x * 10}px, ${30 - mp.y * 10}px) rotate(-4deg)` }}
          >
            <MiniMonth />
          </div>
          <div
            className="vc-stack-front"
            style={{ transform: `translate(${mp.x * 10}px, ${mp.y * 10}px) rotate(2deg)` }}
          >
            <LiveCalendar />
          </div>
          <div
            className="vc-stack-noti glass-strong"
            style={{ transform: `translate(${mp.x * 24}px, ${mp.y * 24}px) rotate(-3deg)` }}
          >
            <div className="vc-noti-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-0)' }}>Pago recibido</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--fg-2)' }}>$ 17.500 · Andrea M.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
