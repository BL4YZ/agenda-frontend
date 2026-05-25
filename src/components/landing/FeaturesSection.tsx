'use client';

import { ReactNode } from 'react';

function FBookings() {
  const rows = [
    { t: '15:30', s: 'Corte + barba',   c: 'Andrea M.', col: 290 },
    { t: '16:30', s: 'Color completo',  c: 'Pedro V.',  col: 320 },
    { t: '18:00', s: 'Limpieza facial', c: 'Lucía R.',  col: 270 },
  ];
  return (
    <div className="vc-vis vc-vis-bookings glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Próximas reservas</div>
        <span className="vc-badge-live">· EN VIVO</span>
      </div>
      {rows.map((b, i) => (
        <div key={i} className="vc-book-row">
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', minWidth: 44 }}>{b.t}</div>
          <div style={{ width: 4, height: 32, borderRadius: 2, background: `oklch(0.6 0.22 ${b.col})` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{b.s}</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{b.c}</div>
          </div>
          <span className="vc-badge-paid">PAGADO</span>
        </div>
      ))}
    </div>
  );
}

function FReminders() {
  return (
    <div className="vc-vis vc-vis-reminders">
      <div className="vc-bubble vc-bubble-r1 glass">
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>WHATSAPP · 09:00</div>
        <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.4 }}>
          Hola Andrea 👋 Te recordamos tu cita HOY a las <b>15:30</b>.
        </div>
      </div>
      <div className="vc-bubble vc-bubble-r2 glass">
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>SMS · 14:30</div>
        <div style={{ fontSize: 13, color: 'var(--fg-1)' }}>1 hora para tu cita en Studio Norte.</div>
      </div>
      <div className="vc-bubble vc-bubble-r3 glass">
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>EMAIL · CONFIRMADO</div>
        <div style={{ fontSize: 13, color: 'var(--fg-1)' }}>Tu reserva ha sido confirmada.</div>
      </div>
    </div>
  );
}

function FPayments() {
  const rows = [
    { l: 'Pagos completos', v: '$ 5.200.000', p: 62 },
    { l: 'Depósitos',       v: '$ 2.100.000', p: 25 },
    { l: 'Suscripciones',   v: '$ 1.120.500', p: 13 },
  ];
  return (
    <div className="vc-vis vc-vis-pay glass">
      <div style={{ marginBottom: 18 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.12em' }}>INGRESOS · ABR 2026</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, marginTop: 6, color: 'var(--fg-0)', letterSpacing: '-0.03em' }}>
          $ 8.420.500
        </div>
        <div style={{ fontSize: 12, color: 'oklch(0.7 0.18 145)', marginTop: 4 }}>↑ 18% vs mes anterior</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: 'var(--fg-1)' }}>{r.l}</span>
              <span className="mono" style={{ color: 'var(--fg-2)' }}>{r.v}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--glass-bg)' }}>
              <div style={{ height: '100%', width: `${r.p}%`, background: 'linear-gradient(90deg, var(--v-400), var(--v-600))', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FInsights() {
  const kpis = [
    { l: 'Ocupación', v: '87%', d: '+6 pts',  c: 290 },
    { l: 'Retención', v: '94%', d: 'estable', c: 320 },
  ];
  return (
    <div className="vc-vis vc-vis-insights glass">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ padding: 14, borderRadius: 10, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.12em' }}>{k.l.toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--fg-0)', marginTop: 4 }}>{k.v}</div>
            <div className="mono" style={{ fontSize: 10, color: 'oklch(0.7 0.18 145)' }}>{k.d}</div>
          </div>
        ))}
      </div>
      <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vcg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.22 290)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.5 0.2 290)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 60 Q40 50 80 45 T160 30 T240 35 T320 18 T400 10 L400 80 L0 80 Z" fill="url(#vcg)" />
        <path d="M0 60 Q40 50 80 45 T160 30 T240 35 T320 18 T400 10" stroke="oklch(0.75 0.2 290)" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

interface Feature {
  eb: string;
  t: string;
  d: string;
  visual: ReactNode;
  side: 'l' | 'r';
}

const FEATURES: Feature[] = [
  {
    eb: '01 — RESERVAS', t: 'Tu agenda nunca duerme.',
    d: 'Tus clientes reservan a las 3am, en domingo, durante un corte de luz. Tú te enteras al despertar — con todo confirmado y pagado.',
    visual: <FBookings />, side: 'r',
  },
  {
    eb: '02 — RECORDATORIOS', t: 'Adiós inasistencias.',
    d: 'WhatsApp, SMS y email automáticos a la hora que elijas. Reduce las no-asistencias hasta un 73% — sin levantar el teléfono.',
    visual: <FReminders />, side: 'l',
  },
  {
    eb: '03 — PAGOS', t: 'Cobra antes de empezar.',
    d: 'MercadoPago conectado en 2 minutos. Cobra el total, un depósito o paquetes. Sin comisiones adicionales de nuestra parte.',
    visual: <FPayments />, side: 'r',
  },
  {
    eb: '04 — INSIGHTS', t: 'Tu negocio en una pantalla.',
    d: 'Ingresos del mes, ocupación, retención y proyecciones — sin abrir una hoja de cálculo. Toma decisiones con datos reales.',
    visual: <FInsights />, side: 'l',
  },
];

export default function FeaturesSection() {
  return (
    <section className="vc-features container-pad" id="producto">
      <div className="vc-section-head reveal">
        <span className="eyebrow">— Por qué Novu</span>
        <h2 className="vc-h2">
          Suficientemente <em>simple</em> para usarlo hoy.<br />
          Suficientemente <em>poderoso</em> para escalar.
        </h2>
      </div>

      {FEATURES.map((f, i) => (
        <div key={i} className={`vc-feature reveal vc-feature-${f.side}`}>
          <div className="vc-feature-text">
            <div className="mono vc-f-eb">{f.eb}</div>
            <h3 className="vc-feature-t">{f.t}</h3>
            <p className="vc-feature-d">{f.d}</p>
            <button className="vc-link-btn" aria-label={`Saber más sobre ${f.t}`}>
              Saber más
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="vc-feature-visual">{f.visual}</div>
        </div>
      ))}
    </section>
  );
}
