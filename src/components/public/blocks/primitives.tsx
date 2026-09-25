'use client';

import type { ReactNode } from 'react';
import type { PageSection, BlockProps as BProps, CtaAction } from '@/types/builder';
import type { Shop } from '@/types/public';
import { resolveCta, safeImg } from '@/lib/builder/runtime';

/** Everything a block needs besides its own section. */
export interface BlockCtx {
  shop: Shop;
  onReserve: (serviceId?: number, branchId?: number) => void;
  /** True inside the builder preview: suppresses navigation and autoplay. */
  editing?: boolean;
}

export interface BlockComponentProps {
  section: PageSection;
  ctx: BlockCtx;
}

/** Section heading — eyebrow, title, subtitle. Skipped entirely when empty. */
export function SectionHead({ props }: { props: BProps }) {
  if (!props.eyebrow && !props.title && !props.subtitle) return null;
  return (
    <header className="pb-head">
      {props.eyebrow  && <span className="pb-eyebrow">{props.eyebrow}</span>}
      {props.title    && <h2 className="pb-h2">{props.title}</h2>}
      {props.subtitle && <p className="pb-sub">{props.subtitle}</p>}
    </header>
  );
}

/**
 * A call-to-action. Renders a <button> for "reserve" and an <a> otherwise —
 * the href has already been through `safeUrl`, and a null result means the CTA
 * simply does not appear rather than rendering a dead control.
 */
export function Cta({
  action, label, href, ctx, variant = 'primary', className = '',
}: {
  action?: CtaAction; label?: string; href?: string;
  ctx: BlockCtx; variant?: 'primary' | 'ghost'; className?: string;
}) {
  const cta = resolveCta(action, label, href, ctx.shop);
  if (!cta) return null;

  const cls = `pb-btn pb-btn--${variant} ${className}`.trim();

  if (cta.reserve) {
    return (
      <button type="button" className={cls} onClick={() => !ctx.editing && ctx.onReserve()}>
        {cta.label}
      </button>
    );
  }
  return (
    <a
      className={cls}
      href={ctx.editing ? undefined : cta.href}
      {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {cta.label}
    </a>
  );
}

/** Both CTAs of a block, in a row. */
export function CtaRow({ props, ctx, className = '' }: { props: BProps; ctx: BlockCtx; className?: string }) {
  const primary   = <Cta action={props.ctaAction}       label={props.ctaLabel}       href={props.ctaHref}       ctx={ctx} />;
  const secondary = <Cta action={props.secondaryAction} label={props.secondaryLabel} href={props.secondaryHref} ctx={ctx} variant="ghost" />;
  if (!primary && !secondary) return null;
  return <div className={`pb-cta-row ${className}`.trim()}>{primary}{secondary}</div>;
}

/** An image that disappears instead of showing a broken box. */
export function Img({ src, alt, className, style }: {
  src?: string; alt?: string; className?: string; style?: React.CSSProperties;
}) {
  const safe = safeImg(src);
  if (!safe) return null;
  // Business images come from arbitrary hosts and base64 uploads; next/image
  // adds nothing here and its optimizer would choke on the data: URIs.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={safe} alt={alt ?? ''} className={className} style={style} loading="lazy" decoding="async" />;
}

/** Placeholder shown in the builder when a data-driven block has no records. */
export function EmptyHint({ editing, children }: { editing?: boolean; children: ReactNode }) {
  if (!editing) return null;
  return <p className="pb-empty">{children}</p>;
}

/** Star row used by reviews and testimonials. */
export function Stars({ n }: { n: number }) {
  const count = Math.max(0, Math.min(5, Math.round(n)));
  if (!count) return null;
  return (
    <span className="pb-stars" aria-label={`${count} de 5 estrellas`}>
      {Array.from({ length: count }, (_, i) => <span key={i} aria-hidden="true">★</span>)}
    </span>
  );
}

const clampCols = (n: number) => String(Math.max(1, Math.min(6, n)));

/** Grid wrapper honouring the block's `columns` prop. */
export function Grid({ cols, colsMobile, children, className = '' }: {
  cols?: number; colsMobile?: number; children: ReactNode; className?: string;
}) {
  return (
    <div
      className={`pb-grid ${className}`.trim()}
      style={{
        '--pb-cols': clampCols(cols ?? 3),
        // Solo se emite si el dueño lo pidió: sin la variable, el CSS de celular
        // usa su valor por defecto y las páginas ya publicadas no se mueven.
        ...(colsMobile ? { '--pb-cols-m': clampCols(colsMobile) } : {}),
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
