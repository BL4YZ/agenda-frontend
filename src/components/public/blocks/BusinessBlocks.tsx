'use client';

import { useState } from 'react';
import type { BlockComponentProps } from './primitives';
import { SectionHead, Cta, CtaRow, Img, Grid, Stars, EmptyHint } from './primitives';
import { money, DAY_NAMES, safeImg } from '@/lib/builder/runtime';

// ── Services ──────────────────────────────────────────────────────────────────
export function ServicesBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const services = ctx.shop.services.slice(0, props.limit ?? 60);

  if (services.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Todavía no cargaste servicios. Se muestran acá automáticamente.</EmptyHint>
      </div>
    );
  }

  const layout = props.layout ?? 'cards';
  const showImg = props.showImages !== false && layout !== 'menu';

  const meta = (s: (typeof services)[number]) => (
    <div className="pb-service__meta">
      {props.showDuration !== false && <span>{s.duration_minutes} min</span>}
      {props.showPrices   !== false && <strong>{money(s.price)}</strong>}
    </div>
  );

  if (layout === 'menu') {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <ul className="pb-menu">
          {services.map(s => (
            <li key={s.id}>
              <button type="button" className="pb-menu__row" onClick={() => !ctx.editing && ctx.onReserve(s.id)}>
                <span className="pb-menu__name">
                  {s.name}
                  {s.description && <em>{s.description}</em>}
                </span>
                <span className="pb-menu__dots" aria-hidden="true" />
                <span className="pb-menu__price">
                  {props.showDuration !== false && <i>{s.duration_minutes}′</i>}
                  {props.showPrices !== false && money(s.price)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <ul className="pb-list">
          {services.map(s => (
            <li key={s.id} className="pb-list__row">
              {showImg && (
                <div className="pb-thumb">
                  {safeImg(s.image_url) ? <Img src={s.image_url} alt={s.name} /> : <span>{s.name.charAt(0)}</span>}
                </div>
              )}
              <div className="pb-list__body">
                <h3 className="pb-card__title">{s.name}</h3>
                {s.description && <p className="pb-card__text">{s.description}</p>}
                {meta(s)}
              </div>
              <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm" onClick={() => !ctx.editing && ctx.onReserve(s.id)}>
                Reservar
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // cards / grid
  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 3} colsMobile={props.columnsMobile}>
        {services.map(s => (
          <button key={s.id} type="button" className={`pb-card pb-card--btn${layout === 'grid' ? ' pb-card--photo' : ''}`}
                  onClick={() => !ctx.editing && ctx.onReserve(s.id)}>
            {showImg && (
              <div className="pb-card__media">
                {safeImg(s.image_url)
                  ? <Img src={s.image_url} alt={s.name} className="pb-card__img" />
                  : <span className="pb-card__initial" aria-hidden="true">{s.name.charAt(0)}</span>}
              </div>
            )}
            <div className="pb-card__body">
              <h3 className="pb-card__title">{s.name}</h3>
              {s.description && <p className="pb-card__text">{s.description}</p>}
              {meta(s)}
            </div>
          </button>
        ))}
      </Grid>
    </div>
  );
}

// ── Booking CTA ───────────────────────────────────────────────────────────────
export function BookingCtaBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const variant = props.variant ?? 'band';
  return (
    <div className="pb-container">
      <div className={`pb-band pb-band--${variant}`}>
        <div className="pb-band__text">
          {props.eyebrow  && <span className="pb-eyebrow">{props.eyebrow}</span>}
          {props.title    && <h2 className="pb-h2">{props.title}</h2>}
          {props.subtitle && <p className="pb-sub">{props.subtitle}</p>}
        </div>
        <CtaRow props={props} ctx={ctx} className="pb-band__cta" />
      </div>
    </div>
  );
}

// ── Hours ─────────────────────────────────────────────────────────────────────
export function HoursBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const hours = ctx.shop.hours;

  if (hours.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Cargá tus horarios en la pestaña Horarios para que aparezcan acá.</EmptyHint>
      </div>
    );
  }

  const rows = hours.map(h => ({
    label: h.day_label || DAY_NAMES[h.day_of_week],
    value: h.is_closed || !h.open_time ? 'Cerrado' : `${h.open_time} – ${h.close_time}`,
    today: h.is_today,
    closed: h.is_closed,
  }));

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <dl className={`pb-hours pb-hours--${props.layout ?? 'list'}`}>
        {rows.map((r, i) => (
          <div key={i} className={`pb-hours__row${r.today ? ' is-today' : ''}${r.closed ? ' is-closed' : ''}`}>
            <dt>{r.label}{r.today && <span className="pb-hours__badge">hoy</span>}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Location ──────────────────────────────────────────────────────────────────
export function LocationBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const { shop } = ctx;
  const lat = shop.lat != null ? Number(shop.lat) : null;
  const lng = shop.lng != null ? Number(shop.lng) : null;
  const hasCoords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  // Zoom → bbox half-width. OpenStreetMap's embed takes a box, not a zoom level.
  const delta = 0.02 / Math.pow(1.6, (props.zoom ?? 15) - 15);
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta},${lng + delta},${lat + delta}&layer=mapnik&marker=${lat},${lng}`
    : null;

  if (!shop.address && !hasCoords && !shop.phone) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Agregá tu dirección en la pestaña Contacto para mostrar el mapa.</EmptyHint>
      </div>
    );
  }

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <div className="pb-location">
        <div className="pb-location__info">
          {shop.address && (
            <div className="pb-kv">
              <span className="pb-kv__k">Dirección</span>
              <span className="pb-kv__v">{shop.address}</span>
            </div>
          )}
          {shop.phone && (
            <div className="pb-kv">
              <span className="pb-kv__k">Teléfono</span>
              <a className="pb-kv__v pb-link" href={ctx.editing ? undefined : `tel:${shop.phone}`}>{shop.phone}</a>
            </div>
          )}
          <div className="pb-cta-row">
            {shop.address && (
              <a
                className="pb-btn pb-btn--ghost"
                href={ctx.editing ? undefined : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`}
                target="_blank" rel="noopener noreferrer"
              >
                Cómo llegar
              </a>
            )}
            <Cta action={props.ctaAction ?? 'reserve'} label={props.ctaLabel ?? 'Reservar turno'} href={props.ctaHref} ctx={ctx} />
          </div>
        </div>
        {props.showMap !== false && (mapSrc ? (
          <div className={`pb-location__map pb-map--${props.mapStyle ?? 'standard'}`}>
            <iframe src={mapSrc} title={`Mapa de ${shop.name}`} loading="lazy" />
          </div>
        ) : (
          // Sin coordenadas no hay mapa: el embed de OpenStreetMap toma una caja
          // de coordenadas, no una dirección. Antes simplemente no se dibujaba
          // nada y el dueño no tenía forma de saber por qué.
          <EmptyHint editing={ctx.editing}>
            Todavía no ubicamos «{shop.address}» en el mapa. Abrí la pestaña Contacto
            y volvé a guardar la dirección; si no aparece, agregale ciudad y país.
          </EmptyHint>
        ))}
      </div>
    </div>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
export function ContactBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const { shop } = ctx;
  const wa = (shop.whatsapp || '').replace(/[^\d]/g, '');

  const entries = [
    shop.phone   && { k: 'Teléfono',  v: shop.phone,   href: `tel:${shop.phone}` },
    wa           && { k: 'WhatsApp',  v: shop.whatsapp!, href: `https://wa.me/${wa}`, external: true },
    shop.address && { k: 'Dirección', v: shop.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`, external: true },
  ].filter(Boolean) as { k: string; v: string; href: string; external?: boolean }[];

  if (entries.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Completá teléfono, WhatsApp o dirección en la pestaña Contacto.</EmptyHint>
      </div>
    );
  }

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <div className={`pb-contact pb-contact--${props.layout ?? 'cards'}`}>
        {entries.map(e => (
          <a
            key={e.k} className="pb-contact__item"
            href={ctx.editing ? undefined : e.href}
            {...(e.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span className="pb-contact__k">{e.k}</span>
            <span className="pb-contact__v">{e.v}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Social ────────────────────────────────────────────────────────────────────
export function SocialBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const { shop } = ctx;
  const links = [
    shop.instagram_url && { label: 'Instagram', href: shop.instagram_url },
    shop.tiktok_url    && { label: 'TikTok',    href: shop.tiktok_url },
    shop.facebook_url  && { label: 'Facebook',  href: shop.facebook_url },
  ].filter(Boolean) as { label: string; href: string }[];

  if (links.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Agregá tus redes en la pestaña Contacto.</EmptyHint>
      </div>
    );
  }

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <div className={`pb-social pb-social--${props.layout ?? 'icons'}`}>
        {links.map(l => (
          <a key={l.label} className="pb-social__link" href={ctx.editing ? undefined : l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Products ──────────────────────────────────────────────────────────────────
export function ProductsBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const products = ctx.shop.products.slice(0, props.limit ?? 60);

  if (products.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Cargá productos en la pestaña Productos para que aparezcan acá.</EmptyHint>
      </div>
    );
  }

  const card = (p: (typeof products)[number]) => (
    <article key={p.id} className="pb-card pb-card--product">
      <div className="pb-card__media">
        {safeImg(p.image_url)
          ? <Img src={p.image_url} alt={p.name} className="pb-card__img" />
          : <span className="pb-card__initial" aria-hidden="true">{p.name.charAt(0)}</span>}
        {p.badge && <span className="pb-badge">{p.badge}</span>}
      </div>
      <div className="pb-card__body">
        {p.brand && <span className="pb-card__kicker">{p.brand}</span>}
        <h3 className="pb-card__title">{p.name}</h3>
        {p.description && <p className="pb-card__text">{p.description}</p>}
        {props.showPrices !== false && <div className="pb-card__price">{money(p.price)}</div>}
      </div>
    </article>
  );

  if (props.layout === 'carousel') {
    return (
      <>
        <div className="pb-container"><SectionHead props={props} /></div>
        <div className="pb-rail">{products.map(card)}</div>
      </>
    );
  }

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 3} colsMobile={props.columnsMobile}>{products.map(card)}</Grid>
    </div>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export function ReviewsBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const reviews = ctx.shop.reviews.slice(0, props.limit ?? 30);

  if (reviews.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Cargá reseñas en la pestaña Reseñas para que aparezcan acá.</EmptyHint>
      </div>
    );
  }

  const card = (r: (typeof reviews)[number], key: string | number) => (
    <blockquote key={key} className="pb-quote">
      <Stars n={r.stars} />
      <p className="pb-quote__text">{r.text}</p>
      <footer className="pb-quote__by">
        <span className="pb-avatar" aria-hidden="true">{r.author_initial || r.author_name.charAt(0)}</span>
        <span>
          <strong>{r.author_name}</strong>
          {r.date_label && <em>{r.date_label}</em>}
        </span>
      </footer>
    </blockquote>
  );

  const head = (
    <SectionHead props={{
      ...props,
      subtitle: props.subtitle ?? (ctx.shop.rating != null
        ? `★ ${ctx.shop.rating} de 5 · ${ctx.shop.review_count} reseñas`
        : undefined),
    }} />
  );

  if (props.layout === 'marquee') {
    return (
      <>
        <div className="pb-container">{head}</div>
        <div className="pb-marquee">
          <div className="pb-marquee__track pb-marquee__track--cards">
            {[...reviews, ...reviews].map((r, i) => card(r, i))}
          </div>
        </div>
      </>
    );
  }

  if (props.layout === 'single') {
    return <div className="pb-container pb-align-center">{head}<div className="pb-quote-solo">{card(reviews[0], 0)}</div></div>;
  }

  return (
    <div className="pb-container">
      {head}
      <Grid cols={props.columns ?? 3} colsMobile={props.columnsMobile}>{reviews.map((r, i) => card(r, i))}</Grid>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
export function FaqBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const faqs = ctx.shop.faqs;
  const [open, setOpen] = useState<number | null>(0);

  if (faqs.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Cargá preguntas frecuentes en la pestaña FAQs.</EmptyHint>
      </div>
    );
  }

  const alwaysOpen = props.layout === 'open';

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <div className={`pb-faq pb-faq--${props.layout ?? 'accordion'}`}>
        {faqs.map((f, i) => {
          const isOpen = alwaysOpen || open === i;
          return (
            <div key={f.id} className={`pb-faq__item${isOpen ? ' is-open' : ''}`}>
              <button
                type="button" className="pb-faq__q"
                aria-expanded={isOpen}
                onClick={() => !alwaysOpen && setOpen(open === i ? null : i)}
              >
                <span>{f.question}</span>
                {!alwaysOpen && <span className="pb-faq__chev" aria-hidden="true">＋</span>}
              </button>
              {isOpen && <div className="pb-faq__a"><p>{f.answer}</p></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Team ──────────────────────────────────────────────────────────────────────
export function TeamBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const team = ctx.shop.team;

  if (team.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Marcá integrantes como públicos en la pestaña Equipo.</EmptyHint>
      </div>
    );
  }

  const layout = props.layout ?? 'cards';

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 3} colsMobile={props.columnsMobile} className={`pb-team pb-team--${layout}`}>
        {team.map(m => (
          <article key={m.id} className="pb-person">
            <div className="pb-person__photo">
              {safeImg(m.avatar_url)
                ? <Img src={m.avatar_url} alt={m.name} />
                : <span aria-hidden="true">{m.name.charAt(0)}</span>}
            </div>
            <div className="pb-person__body">
              <h3 className="pb-card__title">{m.name}</h3>
              {m.role && <span className="pb-card__kicker">{m.role}</span>}
              {m.bio && <p className="pb-card__text">{m.bio}</p>}
              {m.years_experience ? <span className="pb-chip">{m.years_experience} años de experiencia</span> : null}
              {m.instagram_handle && (
                <a
                  className="pb-link"
                  href={ctx.editing ? undefined : `https://instagram.com/${m.instagram_handle.replace(/^@/, '')}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  @{m.instagram_handle.replace(/^@/, '')}
                </a>
              )}
            </div>
          </article>
        ))}
      </Grid>
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
export function GalleryBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const images = ctx.shop.gallery ?? [];

  if (images.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Subí fotos en la pestaña Galería.</EmptyHint>
      </div>
    );
  }

  const layout = props.layout ?? 'masonry';
  const tiles = images.map(g => (
    <figure key={g.id} className="pb-tile">
      <Img src={g.image_url} alt={g.caption ?? ''} className="pb-tile__img" />
      {g.caption && <figcaption>{g.caption}</figcaption>}
    </figure>
  ));

  if (layout === 'carousel' || layout === 'strip') {
    return (
      <>
        <div className="pb-container"><SectionHead props={props} /></div>
        <div className={`pb-rail pb-rail--${layout}`}>{tiles}</div>
      </>
    );
  }

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <div
        className={`pb-gallery pb-gallery--${layout}`}
        style={{
          '--pb-cols': String(Math.max(1, Math.min(6, props.columns ?? 3))),
          ...(props.columnsMobile
            ? { '--pb-cols-m': String(Math.max(1, Math.min(6, props.columnsMobile))) }
            : {}),
        } as React.CSSProperties}
      >
        {tiles}
      </div>
    </div>
  );
}

// ── Branches ──────────────────────────────────────────────────────────────────
export function BranchesBlock({ section, ctx }: BlockComponentProps) {
  const { props } = section;
  const branches = ctx.shop.branches;

  if (branches.length === 0) {
    return (
      <div className="pb-container">
        <SectionHead props={props} />
        <EmptyHint editing={ctx.editing}>Creá sucursales en la pestaña Sucursales.</EmptyHint>
      </div>
    );
  }

  return (
    <div className="pb-container">
      <SectionHead props={props} />
      <Grid cols={props.columns ?? 2} colsMobile={props.columnsMobile}>
        {branches.map(b => (
          <article key={b.id} className="pb-card">
            <div className="pb-card__body">
              <h3 className="pb-card__title">{b.name}</h3>
              {b.address && <p className="pb-card__text">{b.address}</p>}
              <button type="button" className="pb-btn pb-btn--ghost pb-btn--sm"
                      onClick={() => !ctx.editing && ctx.onReserve(undefined, b.id)}>
                Reservar en esta sucursal
              </button>
            </div>
          </article>
        ))}
      </Grid>
    </div>
  );
}
