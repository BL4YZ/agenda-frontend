'use client';

import { useState, useEffect } from 'react';
import type { BlockComponentProps } from './primitives';
import { SectionHead, Cta, CtaRow, Img, Grid } from './primitives';
import { paragraphs, openStatus, videoEmbed, RATIO, safeImg } from '@/lib/builder/runtime';

// ── Announcement ──────────────────────────────────────────────────────────────
export function AnnouncementBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const [closed, setClosed] = useState(false);
  if (closed || !props.text) return null;

  return (
    <div className="pb-announce">
      <span>{props.text}</span>
      <Cta action={props.ctaAction} label={props.ctaLabel} href={props.ctaHref} ctx={ctx} variant="ghost" className="pb-btn--tiny" />
      {props.dismissible && (
        <button type="button" className="pb-announce__x" aria-label="Cerrar aviso" onClick={() => setClosed(true)}>×</button>
      )}
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function HeroBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const { shop } = ctx;
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  // Client-only: the open/closed state depends on the visitor's clock, and
  // computing it during render would mismatch the server HTML.
  useEffect(() => { setStatus(openStatus(shop.hours)); }, [shop.hours]);

  const layout = props.layout ?? 'cover';
  const title  = props.title || shop.tagline || shop.name;
  const lede   = props.subtitle || shop.lede;
  const image  = safeImg(props.image) ?? safeImg(shop.cover_url);

  const meta = (
    <div className="pb-hero__meta">
      {props.showRating !== false && shop.rating != null && (
        <div className="pb-hero__meta-item">
          <span className="pb-hero__meta-k">Calificación</span>
          <span className="pb-hero__meta-v">★ {shop.rating}
            {shop.review_count ? <em> · {shop.review_count} reseñas</em> : null}
          </span>
        </div>
      )}
      {props.showStatus !== false && status && (
        <div className="pb-hero__meta-item">
          <span className="pb-hero__meta-k">Estado</span>
          <span className={`pb-hero__meta-v${status.open ? ' is-open' : ''}`}>
            {status.open ? '● ' : '○ '}{status.label}
          </span>
        </div>
      )}
    </div>
  );

  const text = (
    <div className="pb-hero__text">
      {props.eyebrow && <div className="pb-hero__badge"><span className="pb-hero__dot" aria-hidden="true" />{props.eyebrow}</div>}
      <h1 className="pb-hero__title">{title}</h1>
      {lede && <p className="pb-hero__lede">{lede}</p>}
      <CtaRow props={props} ctx={ctx} />
      {meta}
    </div>
  );

  if (layout === 'split') {
    return (
      <div className="pb-hero pb-hero--split" data-height={props.height ?? 'tall'}>
        <div className="pb-container pb-hero__split">
          {text}
          <div className="pb-hero__figure">
            {image
              ? <Img src={image} alt={shop.name} className="pb-hero__figure-img" />
              : <div className="pb-hero__figure-ph" aria-hidden="true">{shop.name.charAt(0)}</div>}
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'minimal') {
    return (
      <div className="pb-hero pb-hero--minimal" data-height={props.height ?? 'half'}>
        <div className="pb-container pb-align-center">{text}</div>
      </div>
    );
  }

  if (layout === 'card') {
    return (
      <div className="pb-hero pb-hero--card" data-height={props.height ?? 'tall'}>
        <div
          className="pb-hero__bg"
          style={image ? { backgroundImage: `url("${image.replace(/"/g, '%22')}")` } : undefined}
          aria-hidden="true"
        />
        <div className="pb-hero__scrim" style={{ opacity: props.overlay ?? 0.45 }} aria-hidden="true" />
        <div className="pb-container">
          <div className="pb-hero__card">{text}</div>
        </div>
      </div>
    );
  }

  // cover
  return (
    <div className="pb-hero pb-hero--cover" data-height={props.height ?? 'tall'}>
      <div
        className="pb-hero__bg"
        style={image ? { backgroundImage: `url("${image.replace(/"/g, '%22')}")` } : undefined}
        aria-hidden="true"
      />
      <div className="pb-hero__scrim" style={{ opacity: props.overlay ?? 0.55 }} aria-hidden="true" />
      {props.showChips !== false && (
        <>
          {shop.rating != null && (
            <div className="pb-hero__chip pb-hero__chip--a" aria-hidden="true">★ {shop.rating}</div>
          )}
          {shop.services.length > 0 && (
            <div className="pb-hero__chip pb-hero__chip--b" aria-hidden="true">{shop.services.length} servicios</div>
          )}
        </>
      )}
      <div className="pb-hero__content"><div className="pb-container">{text}</div></div>
    </div>
  );
}

// ── Heading ───────────────────────────────────────────────────────────────────
export function HeadingBlock({ section }: BlockComponentProps) {
  return <div className="pb-container"><SectionHead props={section.props} /></div>;
}

// ── Rich text ─────────────────────────────────────────────────────────────────
export function RichTextBlock({ section }: BlockComponentProps) {
  const { props } = section;
  const paras = paragraphs(props.text);
  return (
    <div className="pb-container pb-prose-wrap">
      <SectionHead props={{ eyebrow: props.eyebrow, title: props.title }} />
      <div className={`pb-prose pb-prose--${props.variant ?? 'normal'}`}>
        {paras.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}

// ── Image + text ──────────────────────────────────────────────────────────────
export function ImageTextBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  return (
    <div className="pb-container">
      <div className={`pb-split${props.reverse ? ' pb-split--reverse' : ''}`}>
        <div className="pb-split__media">
          {safeImg(props.image)
            ? <Img src={props.image} alt={props.imageAlt} className="pb-split__img" />
            : <div className="pb-split__ph" aria-hidden="true" />}
        </div>
        <div className="pb-split__body">
          {props.eyebrow && <span className="pb-eyebrow">{props.eyebrow}</span>}
          {props.title   && <h2 className="pb-h2">{props.title}</h2>}
          <div className="pb-prose">
            {paragraphs(props.text).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <CtaRow props={props} ctx={ctx} />
        </div>
      </div>
    </div>
  );
}

// ── Image ─────────────────────────────────────────────────────────────────────
export function ImageBlock({ section }: BlockComponentProps) {
  const { props } = section;
  if (!safeImg(props.image)) return null;
  const variant = props.variant ?? 'contained';
  const figure = (
    <figure className={`pb-figure pb-figure--${variant}`}>
      <Img src={props.image} alt={props.imageAlt} className="pb-figure__img" />
      {props.text && <figcaption className="pb-figure__cap">{props.text}</figcaption>}
    </figure>
  );
  return variant === 'full' ? figure : <div className="pb-container">{figure}</div>;
}

// ── Video ─────────────────────────────────────────────────────────────────────
export function VideoBlock({ section }: BlockComponentProps) {
  const { props } = section;
  const src = videoEmbed(props.url);
  return (
    <div className="pb-container">
      <SectionHead props={{ eyebrow: props.eyebrow, title: props.title }} />
      {src ? (
        <div className="pb-video" style={{ aspectRatio: RATIO[props.ratio ?? '16:9'] }}>
          <iframe
            src={src}
            title={props.title || 'Video'}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <p className="pb-empty">Pegá un enlace de YouTube o Vimeo para mostrar el video.</p>
      )}
    </div>
  );
}

// ── Spacer / divider ──────────────────────────────────────────────────────────
export function SpacerBlock({ section }: BlockComponentProps) {
  return <div style={{ height: Math.max(0, Math.min(400, section.props.size ?? 64)) }} aria-hidden="true" />;
}

export function DividerBlock({ section }: BlockComponentProps) {
  const { props } = section;
  if (props.style === 'label' && props.text) {
    return (
      <div className="pb-container">
        <div className="pb-rule pb-rule--label"><span>{props.text}</span></div>
      </div>
    );
  }
  return <div className="pb-container"><div className={`pb-rule pb-rule--${props.style ?? 'line'}`} /></div>;
}

// ── Logos ─────────────────────────────────────────────────────────────────────
export function LogosBlock({ section }: BlockComponentProps) {
  const { props } = section;
  const items = (props.items ?? []).filter(i => i.title || i.image);
  if (items.length === 0) return null;

  const cell = (it: (typeof items)[number], key: string) => {
    const inner = it.image
      ? <Img src={it.image} alt={it.title ?? ''} className="pb-logo__img" />
      : <span className="pb-logo__name">{it.title}</span>;
    return it.href
      ? <a key={key} className="pb-logo" href={it.href} target="_blank" rel="noopener noreferrer">{inner}</a>
      : <div key={key} className="pb-logo">{inner}</div>;
  };

  if (props.layout === 'grid') {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <Grid cols={props.columns ?? 4} className="pb-logos-grid">
          {items.map((it, i) => cell(it, String(i)))}
        </Grid>
      </div>
    );
  }

  return (
    <>
      <div className="pb-container"><SectionHead props={props} /></div>
      <div className="pb-marquee" aria-hidden="true">
        <div className="pb-marquee__track">
          {[...items, ...items].map((it, i) => cell(it, String(i)))}
        </div>
      </div>
    </>
  );
}
