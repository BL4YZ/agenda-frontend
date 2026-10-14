'use client';

import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Check, ChevronDown, GripVertical, Layers, Loader2, Monitor,
  Menu, Palette as PaletteIcon, Plus, Settings, Smartphone, Tablet,
} from 'lucide-react';
import { PALETTES } from '@/lib/builder/design';
import { useAnimatedNumber, useInView } from './hooks';

interface BookingRow {
  id: number;
  t: string;
  s: string;
  c: string;
  col: number;
  paid: boolean;
  isNew?: boolean;
}

const BOOKINGS_INITIAL: Omit<BookingRow, 'id' | 'paid'>[] = [
  { t: '15:30', s: 'Corte + barba',   c: 'Andrea M.', col: 290 },
  { t: '16:30', s: 'Color completo',  c: 'Pedro V.',  col: 320 },
  { t: '18:00', s: 'Limpieza facial', c: 'Lucía R.',  col: 270 },
];

const BOOKINGS_INCOMING: Omit<BookingRow, 'id' | 'paid'>[] = [
  { t: '11:00', s: 'Manicura',        c: 'Sofía G.',   col: 320 },
  { t: '17:00', s: 'Masaje 60 min',   c: 'Martín L.',  col: 270 },
  { t: '10:30', s: 'Corte',           c: 'Diego F.',   col: 290 },
  { t: '19:00', s: 'Consulta',        c: 'Valentina S.', col: 320 },
  { t: '12:15', s: 'Barba',           c: 'Nicolás P.', col: 290 },
  { t: '14:00', s: 'Alisado',         c: 'Carla B.',   col: 270 },
];

const BOOKINGS_VISIBLE = 5; // the 5th sits under the bottom fade, so it leaves smoothly

function FBookings() {
  const [rows, setRows] = useState<BookingRow[]>(
    BOOKINGS_INITIAL.map((r, i) => ({ ...r, id: i, paid: true })),
  );

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let next = 0;
    let id = BOOKINGS_INITIAL.length;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const interval = setInterval(() => {
      const row: BookingRow = { ...BOOKINGS_INCOMING[next % BOOKINGS_INCOMING.length], id: id++, paid: false, isNew: true };
      next += 1;
      setRows(prev => [row, ...prev.map(r => ({ ...r, isNew: false }))].slice(0, BOOKINGS_VISIBLE));
      // The deposit lands a moment after the booking, like a real MercadoPago confirmation.
      timers.push(setTimeout(() => {
        setRows(prev => prev.map(r => (r.id === row.id ? { ...r, paid: true } : r)));
      }, 1100));
    }, 2600);

    return () => { clearInterval(interval); timers.forEach(clearTimeout); };
  }, []);

  return (
    <div className="vc-vis vc-vis-bookings glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Últimas reservas</div>
        <span className="vc-badge-live"><span className="vc-live-dot" aria-hidden="true" />EN VIVO</span>
      </div>
      <div className="vc-book-list">
        {rows.map(b => (
          <div key={b.id} className={`vc-book-row${b.isNew ? ' vc-book-new' : ''}`}>
            <div className="mono" style={{ fontSize: 12, color: 'var(--fg-2)', minWidth: 44 }}>{b.t}</div>
            <div
              className="vc-book-bar"
              style={{ width: 4, height: 32, borderRadius: 2, background: `oklch(0.6 0.22 ${b.col})`, color: `oklch(0.65 0.22 ${b.col})` }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{b.s}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{b.c}</div>
            </div>
            {b.paid
              ? <span key="paid" className="vc-badge-paid vc-badge-pop">PAGADO</span>
              : <span key="pending" className="vc-badge-pending">PENDIENTE</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FReminders() {
  return (
    <div className="vc-vis vc-vis-reminders">
      <div className="vc-bubble vc-bubble-r1 glass">
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>EMAIL · AL RESERVAR</div>
        <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.4 }}>
          Hola Andrea, tu cita quedó confirmada para el <b>lunes a las 15:30</b>.
        </div>
      </div>
      <div className="vc-bubble vc-bubble-r2 glass">
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>EMAIL · 2 H ANTES</div>
        <div style={{ fontSize: 13, color: 'var(--fg-1)' }}>Recordatorio: hoy a las 15:30 en Barber Shop Buceo.</div>
      </div>
      <div className="vc-bubble vc-bubble-r3 glass">
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 4 }}>LINK PARA CANCELAR</div>
        <div style={{ fontSize: 13, color: 'var(--fg-1)' }}>¿No podés venir? Cancelá acá y el horario queda libre.</div>
      </div>
    </div>
  );
}

/** Thousands with dots, always ("es" skips grouping on 4-digit numbers: 1450 → "1450"). */
const fmtMoney = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

type PayKind = 'full' | 'dep' | 'local';

const PAY_LABELS: Record<PayKind, string> = {
  full:  'Pagos completos',
  dep:   'Señas',
  local: 'Cobrado en el local',
};

const PAY_INCOMING: { k: PayKind; v: number; who: string }[] = [
  { k: 'dep',   v: 500,  who: 'Seña de Sofía G.' },
  { k: 'full',  v: 1200, who: 'Pago de Martín L.' },
  { k: 'dep',   v: 400,  who: 'Seña de Diego F.' },
  { k: 'local', v: 900,  who: 'Cobro en el local' },
  { k: 'full',  v: 1800, who: 'Pago de Carla B.' },
  { k: 'dep',   v: 600,  who: 'Seña de Nicolás P.' },
];

const PAY_PREV_MONTH = 103600;

function PayRow({ k, amount, total, active, flashId }: { k: PayKind; amount: number; total: number; active: boolean; flashId: number | null }) {
  const shown = useAnimatedNumber(amount, active);
  const pct = active ? (amount / total) * 100 : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: 'var(--fg-1)' }}>{PAY_LABELS[k]}</span>
        <span key={flashId ?? 'idle'} className={`mono${flashId !== null ? ' vc-pay-flash' : ''}`} style={{ color: 'var(--fg-2)' }}>$ {fmtMoney(shown)}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--glass-bg)' }}>
        <div className="vc-pay-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FPayments() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [amounts, setAmounts] = useState<Record<PayKind, number>>({ full: 78600, dep: 31200, local: 17600 });
  const [toast, setToast] = useState<{ id: number; k: PayKind; v: number; who: string } | null>(null);

  const total = amounts.full + amounts.dep + amounts.local;
  const shownTotal = useAnimatedNumber(total, inView, 1400);
  const growth = Math.round((total / PAY_PREV_MONTH - 1) * 100);

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // First payment waits for the opening count-up to finish.
    const interval = setInterval(() => {
      const p = PAY_INCOMING[i % PAY_INCOMING.length];
      const id = i++;
      setToast({ id, ...p });
      setAmounts(a => ({ ...a, [p.k]: a[p.k] + p.v }));
      timers.push(setTimeout(() => setToast(t => (t?.id === id ? null : t)), 2200));
    }, 3200);
    return () => { clearInterval(interval); timers.forEach(clearTimeout); };
  }, [inView]);

  return (
    <div ref={ref} className="vc-vis vc-vis-pay glass">
      {toast && (
        <div key={toast.id} className="vc-pay-toast glass-strong" aria-hidden="true">
          <span className="vc-pay-toast-amt">+ $ {fmtMoney(toast.v)}</span>
          <span style={{ color: 'var(--fg-2)' }}>{toast.who}</span>
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.12em' }}>INGRESOS · OCT 2026</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, marginTop: 6, color: 'var(--fg-0)', letterSpacing: '-0.03em' }}>
          $ {fmtMoney(shownTotal)}
        </div>
        <div style={{ fontSize: 12, color: 'oklch(0.7 0.18 145)', marginTop: 4 }}>↑ {growth}% vs mes anterior</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(Object.keys(PAY_LABELS) as PayKind[]).map(k => (
          <PayRow key={k} k={k} amount={amounts[k]} total={total} active={inView} flashId={toast?.k === k ? toast.id : null} />
        ))}
      </div>
    </div>
  );
}

const KPI_STEPS = [
  { ticket: 1450, rate: 92 },
  { ticket: 1462, rate: 93 },
  { ticket: 1471, rate: 93 },
  { ticket: 1458, rate: 94 },
];

function FInsights() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => setStep(s => (s + 1) % KPI_STEPS.length), 3600);
    return () => clearInterval(interval);
  }, [inView]);

  const ticket = useAnimatedNumber(KPI_STEPS[step].ticket, inView, 1400);
  const rate = useAnimatedNumber(KPI_STEPS[step].rate, inView, 1400);

  const kpis = [
    { l: 'Ticket promedio', v: `$ ${fmtMoney(ticket)}`, d: '+8% vs mes anterior' },
    { l: 'Tasa de cobro',   v: `${Math.round(rate)}%`,  d: '+4 pts' },
  ];
  return (
    <div ref={ref} className={`vc-vis vc-vis-insights glass${inView ? ' vc-chart-on' : ''}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ padding: 14, borderRadius: 10, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.12em' }}>{k.l.toUpperCase()}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, color: 'var(--fg-0)', marginTop: 4 }}>{k.v}</div>
            <div className="mono" style={{ fontSize: 10, color: 'oklch(0.7 0.18 145)' }}>{k.d}</div>
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)', letterSpacing: '0.12em', marginBottom: 6 }}>PROYECCIÓN DEL MES</div>
      <div style={{ position: 'relative', height: 80 }}>
        <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="vcg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.65 0.22 290)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="oklch(0.5 0.2 290)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="vc-chart-area" d="M0 60 Q40 50 80 45 T160 30 T240 35 T320 18 T400 10 L400 80 L0 80 Z" fill="url(#vcg)" />
          <path
            className="vc-chart-line" pathLength={1}
            d="M0 60 Q40 50 80 45 T160 30 T240 35 T320 18 T400 10"
            stroke="oklch(0.75 0.2 290)" strokeWidth="2" fill="none"
          />
        </svg>
        {/* HTML dot: an SVG circle would be squashed by preserveAspectRatio="none" */}
        <span className="vc-chart-dot" style={{ left: '100%', top: `${(10 / 80) * 100}%` }} aria-hidden="true" />
      </div>
    </div>
  );
}

type StudioPalette = keyof typeof PALETTES;
type StudioFocus = 'palette' | 'add' | 'device' | 'publish' | null;

interface StudioStep {
  palette: StudioPalette;
  reviews: boolean;
  device: 'desktop' | 'mobile';
  published: boolean;
  focus: StudioFocus;
}

// A short tour of what an owner actually does in /editor, played on a loop.
const STUDIO_STEPS: StudioStep[] = [
  { palette: 'violet', reviews: false, device: 'desktop', published: false, focus: null },
  { palette: 'rose',   reviews: false, device: 'desktop', published: false, focus: 'palette' },
  { palette: 'rose',   reviews: true,  device: 'desktop', published: false, focus: 'add' },
  { palette: 'forest', reviews: true,  device: 'desktop', published: false, focus: 'palette' },
  { palette: 'forest', reviews: true,  device: 'mobile',  published: false, focus: 'device' },
  { palette: 'sand',   reviews: true,  device: 'mobile',  published: false, focus: 'palette' },
  { palette: 'sand',   reviews: true,  device: 'desktop', published: false, focus: 'device' },
  { palette: 'sand',   reviews: true,  device: 'desktop', published: true,  focus: 'publish' },
  // Same state again so the "Página publicada" confirmation stays up for two beats.
  { palette: 'sand',   reviews: true,  device: 'desktop', published: true,  focus: 'publish' },
];

const STUDIO_PALETTES = Object.keys(PALETTES) as StudioPalette[];

const STUDIO_SERVICES = [
  { n: 'Corte',         d: '30 min', p: '$ 450' },
  { n: 'Corte + barba', d: '45 min', p: '$ 650' },
  { n: 'Barba',         d: '20 min', p: '$ 300' },
];

function FPage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.3);
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setStepIdx(3); return; }
    const interval = setInterval(() => setStepIdx(i => (i + 1) % STUDIO_STEPS.length), 2200);
    return () => clearInterval(interval);
  }, [inView]);

  // Every edit autosaves as a draft, like the real studio.
  useEffect(() => {
    if (stepIdx === 0 || STUDIO_STEPS[stepIdx].published) return;
    setSaving(true);
    const t = setTimeout(() => setSaving(false), 800);
    return () => clearTimeout(t);
  }, [stepIdx]);

  const step = STUDIO_STEPS[stepIdx];
  const pal = PALETTES[step.palette];

  // Keep the chosen palette in view, like a user scrolling the real panel.
  useEffect(() => {
    const panel = panelRef.current;
    const card = panel?.querySelector<HTMLElement>(`[data-pal="${step.palette}"]`);
    if (!panel || !card) return;
    const top = card.offsetTop - panel.offsetTop;
    const target = top + card.offsetHeight > panel.clientHeight ? top - panel.clientHeight / 2 : 0;
    panel.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [step.palette]);
  const pageVars = {
    '--sp-bg': pal.bg, '--sp-bg2': pal.bg2, '--sp-fg': pal.fg, '--sp-soft': pal.fgSoft,
    '--sp-accent': pal.accent, '--sp-accent-fg': pal.accentFg, '--sp-line': pal.line,
  } as CSSProperties;

  const sections = [
    { name: 'Portada' },
    { name: 'Servicios' },
    { name: 'Horarios' },
    ...(step.reviews ? [{ name: 'Reseñas', isNew: true }] : []),
    { name: 'Ubicación' },
  ];

  return (
    <div ref={ref} className="vc-vis vc-studio glass" aria-hidden="true">
      {/* ── Topbar ── */}
      <div className="vc-st-top">
        <div className="vc-st-top-l">
          <ArrowLeft size={12} />
          <span className="vc-st-title">Editor de tu página</span>
          <span className={`vc-st-save${saving ? ' is-saving' : ''}`}>
            {saving ? <Loader2 size={10} className="vc-st-spin" /> : <Check size={10} />}
            {saving ? 'Guardando…' : 'Guardado'}
          </span>
        </div>
        <div className={`vc-st-devices${step.focus === 'device' ? ' vc-st-focus' : ''}`}>
          <span className={step.device === 'desktop' ? 'is-on' : ''}><Monitor size={11} /></span>
          <span><Tablet size={11} /></span>
          <span className={step.device === 'mobile' ? 'is-on' : ''}><Smartphone size={11} /></span>
        </div>
        <span className={`vc-st-publish${step.focus === 'publish' ? ' vc-st-focus' : ''}`}>
          {step.published ? 'Publicado' : 'Publicar'}
        </span>
      </div>

      <div className="vc-st-body">
        {/* ── Section list ── */}
        <div className="vc-st-left">
          <div className="vc-st-left-h">
            <span>Secciones</span>
            <span className={`vc-st-add${step.focus === 'add' ? ' vc-st-focus' : ''}`}><Plus size={9} /> Agregar</span>
          </div>
          {sections.map(s => (
            <div key={s.name} className={`vc-st-srow${'isNew' in s && step.focus === 'add' ? ' is-new' : ''}`}>
              <GripVertical size={10} className="vc-st-grip" />
              <span className="vc-st-sname">{s.name}</span>
            </div>
          ))}
        </div>

        {/* ── Canvas: the page repaints from the palette, like --pb-* on a real page ── */}
        <div className="vc-st-canvas">
          <div className={`vc-st-page is-${step.device}`} style={pageVars}>
            {/* Hero mirrors the real public page: floating nav pill over a full-bleed photo */}
            <div className="vc-st-hero">
              <div className="vc-st-nav">
                <span className="vc-st-logo">BSB</span>
                <span className="vc-st-nav-r">
                  <span className="vc-st-btn-ghost">Reservar</span>
                  <Menu size={10} />
                </span>
              </div>
              <div className="vc-st-hero-txt">
                <div className="vc-st-h">Barber Shop Buceo</div>
                <div className="vc-st-sub">Más que un corte, una experiencia que vas a recordar.</div>
                <div className="vc-st-ctas">
                  <span className="vc-st-btn">Reservar online</span>
                  <span className="vc-st-btn-line">Llamar</span>
                </div>
                <div className="vc-st-status"><em>ESTADO</em><span>● Abierto · cierra 18:00</span></div>
              </div>
            </div>
            <div className="vc-st-block">
              <div className="vc-st-eb">SERVICIOS</div>
              <div className="vc-st-h2">Lo que ofrecemos</div>
              {STUDIO_SERVICES.map(sv => (
                <div key={sv.n} className="vc-st-svc">
                  <span>{sv.n}<em>{sv.d}</em></span>
                  <b>{sv.p}</b>
                </div>
              ))}
            </div>
            {step.reviews && (
              <div className={`vc-st-block${step.focus === 'add' ? ' is-new' : ''}`}>
                <div className="vc-st-eb">RESEÑAS</div>
                <div className="vc-st-review">
                  <span className="vc-st-stars">★★★★★</span>
                  “Excelente atención, reservé desde el celular en un minuto.”
                </div>
              </div>
            )}
          </div>
          {step.published && (
            <div className="vc-st-toast"><Check size={11} /> Página publicada</div>
          )}
        </div>

        {/* ── Design panel (same markup as DesignPanel: tabs · head · Paleta grid) ── */}
        <div className="vc-st-right">
          <div className="vc-st-tabs">
            <span><Layers size={9} /> Sección</span>
            <span className="is-on"><PaletteIcon size={9} /> Diseño</span>
            <span><Settings size={9} /> Ajustes</span>
          </div>
          <div ref={panelRef} className="vc-st-right-body">
            <div className="vc-st-head">
              <b>Diseño de la página</b>
              <span>Los cambios acá repintan todas las secciones a la vez.</span>
            </div>
            <div className="vc-st-collapse"><ChevronDown size={9} /> Paleta</div>
            <div className="vc-st-palettes">
              {STUDIO_PALETTES.map(k => (
                <div key={k} data-pal={k} className={`vc-st-palette${step.palette === k ? ' is-on' : ''}`}>
                  <span className="vc-st-chips" style={{ background: PALETTES[k].bg }}>
                    <i style={{ background: PALETTES[k].accent }} />
                    <i style={{ background: PALETTES[k].fg }} />
                    <i style={{ background: PALETTES[k].bg2 }} />
                  </span>
                  {PALETTES[k].label}
                </div>
              ))}
            </div>
            <div className="vc-st-collapse is-closed"><ChevronDown size={9} /> Colores propios</div>
            <div className="vc-st-collapse is-closed"><ChevronDown size={9} /> Tipografía</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Feature {
  eb: string;
  t: string;
  d: string;
  href?: string;
  visual: ReactNode;
  side: 'l' | 'r';
}

const FEATURES: Feature[] = [
  {
    eb: '01 — RESERVAS ONLINE', t: 'Tus clientes reservan solos.',
    d: 'Compartís un link y cada cliente elige servicio, profesional y horario, a la hora que sea. Solo ve los horarios libres, así que no hay turnos superpuestos. La cita aparece en tu agenda y, si lo conectás, también en Google Calendar.',
    href: '/features/reservas', visual: <FBookings />, side: 'r',
  },
  {
    eb: '02 — RECORDATORIOS', t: 'Menos clientes que se olvidan.',
    d: 'Al reservar, el cliente recibe un email de confirmación con un link para cancelar si no puede ir. Dos horas antes le llega un recordatorio. No tenés que mandar nada a mano.',
    href: '/features/recordatorios', visual: <FReminders />, side: 'l',
  },
  {
    eb: '03 — PAGOS', t: 'Cobrá la seña al reservar.',
    d: 'Conectás tu cuenta de MercadoPago y elegís si cobrar una seña o el total en el momento de la reserva. El dinero entra directo a tu cuenta y Novu no cobra comisión por cada pago. Disponible desde el plan Pro.',
    href: '/features/pagos', visual: <FPayments />, side: 'r',
  },
  {
    eb: '04 — NÚMEROS DEL NEGOCIO', t: 'Sabés cuánto ganás cada mes.',
    d: 'Ingresos, ticket promedio, tasa de cobro y una proyección de cómo va a cerrar el mes. También podés anotar los gastos del local y ver cuánto le corresponde a cada integrante del equipo, sea por porcentaje o por alquiler de silla.',
    href: '/features/metricas', visual: <FInsights />, side: 'l',
  },
  {
    eb: '05 — TU PÁGINA WEB', t: 'Tu página, sin programar.',
    d: 'Armás la página de tu negocio sumando secciones: portada, servicios, horarios, galería, reseñas y más. Los servicios y precios salen de lo que ya cargaste en el panel, así que no los escribís dos veces. Nada cambia para tus clientes hasta que tocás Publicar.',
    visual: <FPage />, side: 'r',
  },
];

export default function FeaturesSection() {
  return (
    <section className="vc-features container-pad" id="producto">
      <div className="vc-section-head reveal">
        <span className="eyebrow">— Qué incluye</span>
        <h2 className="vc-h2">
          Todo lo que pasa entre la reserva<br />
          y el <em>cobro</em>, en orden.
        </h2>
      </div>

      {FEATURES.map((f, i) => (
        <div key={i} className={`vc-feature reveal vc-feature-${f.side}`}>
          <div className="vc-feature-text">
            <div className="mono vc-f-eb">{f.eb}</div>
            <h3 className="vc-feature-t">{f.t}</h3>
            <p className="vc-feature-d">{f.d}</p>
            {f.href && (
              <Link href={f.href} className="vc-link-btn" aria-label={`Saber más sobre ${f.t}`}>
                Saber más
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
          <div className="vc-feature-visual">{f.visual}</div>
        </div>
      ))}
    </section>
  );
}
