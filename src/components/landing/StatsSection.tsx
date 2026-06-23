'use client';

import { useRef, RefObject } from 'react';
import { useCounter } from './hooks';

interface StatProps {
  v: number;
  s?: string;
  p?: string;
  dec?: number;
  l: string;
  d: string;
  triggerRef: RefObject<HTMLElement | null>;
}

function StatVC({ v, s = '', p = '', dec = 0, l, d, triggerRef }: StatProps) {
  const val = useCounter(v, triggerRef);
  const formatted = dec > 0 ? val.toFixed(dec) : Math.round(val).toLocaleString('es');
  return (
    <div className="vc-stat">
      <div className="vc-stat-v">{p}{formatted}{s}</div>
      <div className="vc-stat-l">{l}</div>
      <div className="mono vc-stat-d">{d}</div>
    </div>
  );
}

const STATS: Omit<StatProps, 'triggerRef'>[] = [
  { v: 73,  s: '%', l: 'Reducción de no-shows',       d: 'Con recordatorios automáticos' },
  { v: 0,   s: '%', l: 'Comisiones adicionales',       d: 'El dinero va directo a vos' },
  { v: 24,  s: '/7', l: 'Reservas online',             d: 'Sin que estés presente' },
  { v: 5,   l: 'Minutos para configurar',              d: 'Wizard guiado paso a paso' },
];

export default function StatsSection() {
  const statsRef = useRef<HTMLElement>(null);

  return (
    <section ref={statsRef} className="vc-stats container-pad" id="clientes">
      <div className="vc-stats-frame">
        <div className="vc-stats-frame-glow" />
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="eyebrow">— Resultados reales</span>
          <h2 className="vc-h2" style={{ marginTop: 16 }}>
            Los números no <em>mienten.</em>
          </h2>
        </div>
        <div className="vc-stats-grid">
          {STATS.map((s, i) => (
            <StatVC key={i} {...s} triggerRef={statsRef} />
          ))}
        </div>
      </div>
    </section>
  );
}
