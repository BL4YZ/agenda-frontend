'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { PLANS, type Plan, type PlanFeature } from './data';

const INITIAL_SHOW = 7;

function Tooltip({ text }: { text: string }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const show = () => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top + window.scrollY, left: r.left + r.width / 2 });
  };

  return (
    <span
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Más información: ${text}`}
      style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 4, cursor: 'help' }}
      onMouseEnter={show}
      onMouseLeave={() => setPos(null)}
      onFocus={show}
      onBlur={() => setPos(null)}
    >
      <span aria-hidden="true" style={{
        width: 14, height: 14, borderRadius: '50%',
        border: '1px solid currentColor',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, opacity: 0.5, flexShrink: 0, lineHeight: 1,
      }}>?</span>

      {mounted && pos && createPortal(
        <span style={{
          position: 'absolute',
          top: pos.top - 8,
          left: pos.left,
          transform: 'translateX(-50%) translateY(-100%)',
          width: 220, padding: '10px 12px',
          background: 'oklch(0.12 0.02 280)', color: 'oklch(0.9 0 0)',
          borderRadius: 12, fontSize: 12, lineHeight: 1.5,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          border: '1px solid oklch(0.25 0.05 280)',
          zIndex: 9999, pointerEvents: 'none', textAlign: 'left',
          whiteSpace: 'normal', fontWeight: 400,
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderWidth: 5, borderStyle: 'solid',
            borderColor: 'oklch(0.12 0.02 280) transparent transparent transparent',
          }} />
        </span>,
        document.body
      )}
    </span>
  );
}

function FeatureItem({ feature }: { feature: PlanFeature }) {
  return (
    <li style={{
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 14,
      color: feature.available ? 'var(--fg-1)' : 'var(--fg-3)',
      opacity: feature.available ? 1 : 0.45,
    }}>
      {feature.available ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, color: 'var(--accent)' }} aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span className="sr-only">Incluido: </span>
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }} aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span className="sr-only">No incluido: </span>
        </>
      )}
      <span style={{ flex: 1 }}>{feature.label}</span>
      {feature.tooltip && <Tooltip text={feature.tooltip} />}
    </li>
  );
}

function VCPrice({ plan, expanded }: { plan: Plan; expanded: boolean }) {
  const { name, price, desc, highlight, cta, features } = plan;
  const visible = expanded ? features : features.slice(0, INITIAL_SHOW);

  return (
    <div className={`vc-price ${highlight ? 'vc-price-feat' : 'glass'} reveal`}>
      {highlight && <div className="vc-price-bg" />}
      <div className="mono vc-price-name">{name.toUpperCase()}</div>
      <div className="vc-price-amt">
        <span className="vc-price-num">{price}</span>
        {price !== '$0' && <span className="vc-price-suf mono">/mes</span>}
      </div>
      <div className="vc-price-tag">{desc}</div>
      <Link
        href="/register"
        className={`btn ${highlight ? 'btn-primary' : 'btn-ghost'}`}
        style={{ width: '100%', justifyContent: 'center', marginTop: 24, display: 'inline-flex' }}
      >
        {cta}
      </Link>
      <ul className="vc-price-feats">
        {visible.map((f, i) => <FeatureItem key={i} feature={f} />)}
      </ul>
    </div>
  );
}

export default function PricingSection() {
  const [expanded, setExpanded] = useState(false);
  const maxHidden = Math.max(...PLANS.map(p => p.features.length)) - INITIAL_SHOW;

  return (
    <section className="vc-pricing container-pad" id="precios">
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
        <span className="eyebrow">— Planes</span>
        <h2 className="vc-h2" style={{ marginTop: 16 }}>Con precios <em>accesibles.</em></h2>
        <p style={{ color: 'var(--fg-2)', marginTop: 16, fontSize: 14 }}>
          Precios en pesos uruguayos · IVA incluido · Cancelá cuando quieras
        </p>
      </div>

      <div className="vc-price-grid" style={{ alignItems: 'start' }}>
        {PLANS.map(plan => <VCPrice key={plan.name} plan={plan} expanded={expanded} />)}
      </div>

      {maxHidden > 0 && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 100,
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              color: 'var(--fg-1)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-strong)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.transform = 'none'; }}
          >
            {expanded ? (
              <><span aria-hidden="true">↑ </span>Ver menos funcionalidades</>
            ) : (
              <><span aria-hidden="true">↓ </span>Comparar todas las funcionalidades</>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
