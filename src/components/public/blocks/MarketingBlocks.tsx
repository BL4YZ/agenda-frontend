'use client';

import { useEffect, useState } from 'react';
import {
  Sparkles, Clock, Award, Heart, Star, Shield, Scissors, Gift, Leaf, Coffee,
  MapPin, Phone, Users, Zap, Check, Smile, Sun, Moon, Droplet, Flame,
  Camera, Music, Palette, Truck, CreditCard, Calendar, ThumbsUp, Crown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BlockComponentProps } from './primitives';
import { SectionHead, CtaRow, Img, Grid, Stars } from './primitives';
import { lines, safeImg } from '@/lib/builder/runtime';

/**
 * Curated icon set for the Beneficios block. A fixed map instead of a dynamic
 * lucide import keeps the public bundle small — the whole library is ~1500
 * icons and a public page has no business shipping them.
 */
export const ICONS: Record<string, LucideIcon> = {
  Sparkles, Clock, Award, Heart, Star, Shield, Scissors, Gift, Leaf, Coffee,
  MapPin, Phone, Users, Zap, Check, Smile, Sun, Moon, Droplet, Flame,
  Camera, Music, Palette, Truck, CreditCard, Calendar, ThumbsUp, Crown,
};
export const ICON_NAMES = Object.keys(ICONS);

function Icon({ name }: { name?: string }) {
  const C = name ? ICONS[name] : undefined;
  if (!C) return null;
  return <C className="pb-icon" strokeWidth={1.5} aria-hidden="true" />;
}

// ── Features ──────────────────────────────────────────────────────────────────
export function FeaturesBlock({ section }: BlockComponentProps) {
  const { props } = section;
  const items = (props.items ?? []).filter(i => i.title || i.text);
  if (items.length === 0) return null;

  const layout = props.layout ?? 'cards';

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 3} colsMobile={props.columnsMobile} className={`pb-features pb-features--${layout}`}>
        {items.map((it, i) => (
          <article key={it.id ?? i} className={layout === 'cards' ? 'pb-card pb-card--pad' : 'pb-plain'}>
            <Icon name={it.icon} />
            {it.title && <h3 className="pb-card__title">{it.title}</h3>}
            {it.text  && <p className="pb-card__text">{it.text}</p>}
          </article>
        ))}
      </Grid>
    </div>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export function StatsBlock({ section }: BlockComponentProps) {
  const { props } = section;
  const items = (props.items ?? []).filter(i => i.value || i.title);
  if (items.length === 0) return null;

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 4} colsMobile={props.columnsMobile} className={`pb-stats pb-stats--${props.layout ?? 'plain'}`}>
        {items.map((it, i) => (
          <div key={it.id ?? i} className={props.layout === 'cards' ? 'pb-card pb-card--pad pb-stat' : 'pb-stat'}>
            <div className="pb-stat__v">
              {it.prefix}{it.value}{it.suffix}
            </div>
            {it.title && <div className="pb-stat__l">{it.title}</div>}
          </div>
        ))}
      </Grid>
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────
export function StepsBlock({ section }: BlockComponentProps) {
  const { props } = section;
  const items = (props.items ?? []).filter(i => i.title || i.text);
  if (items.length === 0) return null;

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <ol className={`pb-steps pb-steps--${props.layout ?? 'horizontal'}`}>
        {items.map((it, i) => (
          <li key={it.id ?? i} className="pb-step">
            <span className="pb-step__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div className="pb-step__body">
              {it.title && <h3 className="pb-card__title">{it.title}</h3>}
              {it.text  && <p className="pb-card__text">{it.text}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
export function TestimonialsBlock({ section }: BlockComponentProps) {
  const { props } = section;
  const items = (props.items ?? []).filter(i => i.text);
  if (items.length === 0) return null;

  const card = (it: (typeof items)[number], key: string | number) => (
    <blockquote key={key} className="pb-quote">
      {it.stars ? <Stars n={it.stars} /> : null}
      <p className="pb-quote__text">{it.text}</p>
      <footer className="pb-quote__by">
        {safeImg(it.image)
          ? <Img src={it.image} alt={it.author ?? ''} className="pb-avatar pb-avatar--img" />
          : <span className="pb-avatar" aria-hidden="true">{(it.author ?? '·').charAt(0)}</span>}
        <span>
          {it.author && <strong>{it.author}</strong>}
          {it.role   && <em>{it.role}</em>}
        </span>
      </footer>
    </blockquote>
  );

  if (props.layout === 'marquee') {
    return (
      <>
        <div className="pb-container"><SectionHead props={props} /></div>
        <div className="pb-marquee">
          <div className="pb-marquee__track pb-marquee__track--cards">
            {[...items, ...items].map((it, i) => card(it, i))}
          </div>
        </div>
      </>
    );
  }

  if (props.layout === 'big') {
    return (
      <div className="pb-container pb-align-center">
        <SectionHead props={props} />
        <div className="pb-quote-solo">{card(items[0], 0)}</div>
      </div>
    );
  }

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 3} colsMobile={props.columnsMobile}>{items.map((it, i) => card(it, i))}</Grid>
    </div>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
export function PricingBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const items = (props.items ?? []).filter(i => i.title);
  if (items.length === 0) return null;

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 3} colsMobile={props.columnsMobile} className="pb-pricing">
        {items.map((it, i) => {
          // Stored as a string[] by the inspector, but a document written by an
          // older client may still carry a single newline-joined string.
          const feats = Array.isArray(it.features) ? it.features : lines(it.text);
          return (
            <article key={it.id ?? i} className={`pb-card pb-card--pad pb-plan${it.highlight ? ' is-featured' : ''}`}>
              {it.badge && <span className="pb-badge pb-badge--top">{it.badge}</span>}
              <h3 className="pb-plan__name">{it.title}</h3>
              {it.price && <div className="pb-plan__price">{it.price}</div>}
              {it.text && !Array.isArray(it.features) ? null : it.text ? <p className="pb-card__text">{it.text}</p> : null}
              {feats.length > 0 && (
                <ul className="pb-plan__list">
                  {feats.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
              )}
              <button type="button" className={`pb-btn ${it.highlight ? 'pb-btn--primary' : 'pb-btn--ghost'}`}
                      onClick={() => !ctx.editing && ctx.onReserve()}>
                {it.label ?? 'Reservar'}
              </button>
            </article>
          );
        })}
      </Grid>
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdown(target?: string) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!target) { setLeft(null); return; }
    const end = new Date(target).getTime();
    if (!Number.isFinite(end)) { setLeft(null); return; }
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return left;
}

export function CountdownBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const left = useCountdown(props.target);

  // Rendered only on the client: the remaining time depends on the visitor's
  // clock, so there is nothing meaningful to emit during SSR.
  if (left === null) {
    return (
      <div className="pb-container pb-align-center">
        <SectionHead props={props} />
        {ctx.editing && <p className="pb-empty">Elegí una fecha límite para que arranque la cuenta regresiva.</p>}
      </div>
    );
  }

  const s = Math.floor(left / 1000);
  const parts = [
    { v: Math.floor(s / 86400),      l: 'días' },
    { v: Math.floor((s % 86400) / 3600), l: 'horas' },
    { v: Math.floor((s % 3600) / 60),    l: 'min' },
    { v: s % 60,                          l: 'seg' },
  ];

  return (
    <div className="pb-container pb-align-center">
      <SectionHead props={props} />
      <div className="pb-countdown">
        {parts.map(p => (
          <div key={p.l} className="pb-countdown__part">
            <span className="pb-countdown__v">{String(p.v).padStart(2, '0')}</span>
            <span className="pb-countdown__l">{p.l}</span>
          </div>
        ))}
      </div>
      <CtaRow props={props} ctx={ctx} />
    </div>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
export function CtaBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const variant = props.variant ?? 'centered';
  return (
    <div className="pb-container">
      <div className={`pb-cta pb-cta--${variant}`}>
        <div>
          {props.eyebrow  && <span className="pb-eyebrow">{props.eyebrow}</span>}
          {props.title    && <h2 className="pb-h2">{props.title}</h2>}
          {props.subtitle && <p className="pb-sub">{props.subtitle}</p>}
        </div>
        <CtaRow props={props} ctx={ctx} />
      </div>
    </div>
  );
}
