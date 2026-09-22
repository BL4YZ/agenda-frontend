'use client';

import { useMemo, useState, useEffect } from 'react';
import type { PageDoc, PageSection } from '@/types/builder';
import type { Shop } from '@/types/public';
import { BLOCK_RENDERERS } from './blocks';
import type { BlockCtx } from './blocks';
import { designToCssVars } from '@/lib/builder/design';
import { sectionCss, sectionClass, resolveCta, safeImg, DAY_NAMES } from '@/lib/builder/runtime';
import '@/styles/builder.css';

/** Types that earn a slot in the nav when links are auto-derived. */
const NAV_TYPES = new Set([
  'services', 'products', 'team', 'gallery', 'reviews', 'faq',
  'location', 'branches', 'pricing', 'hours', 'contact',
]);

const domId = (s: PageSection) => s.anchor || s.id;

// ── Nav ───────────────────────────────────────────────────────────────────────
function PBNav({ doc, ctx }: { doc: PageDoc; ctx: BlockCtx }) {
  const { nav } = doc;
  const { shop } = ctx;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!nav.sticky) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [nav.sticky]);

  const links = useMemo(() => {
    if (nav.links?.length) return nav.links;
    return doc.sections
      .filter(s => !s.hidden && NAV_TYPES.has(s.type) && s.props.title)
      .map(s => ({ label: s.props.title as string, href: `#${domId(s)}` }));
  }, [nav.links, doc.sections]);

  const cta = resolveCta(nav.ctaAction ?? 'reserve', nav.ctaLabel ?? 'Reservar', nav.ctaHref, shop);
  const logo = safeImg(shop.logo_url);
  const showLogo = nav.logoMode !== 'name' && !!logo;
  const showName = nav.logoMode !== 'logo' || !logo;

  return (
    <header
      className={[
        'pb-nav',
        `pb-nav--${nav.style ?? 'glass'}`,
        `pb-nav--${nav.align ?? 'split'}`,
        nav.sticky ? 'is-sticky' : '',
        scrolled ? 'is-scrolled' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="pb-container pb-nav__inner">
        <a className="pb-nav__brand" href="#top">
          {/* eslint-disable-next-line @next/next/no-img-element -- the logo is a business upload (often a data: URI) */}
          {showLogo && <img src={logo} alt="" className="pb-nav__logo" />}
          {showName && <span>{shop.name}</span>}
        </a>

        {links.length > 0 && (
          <nav className={`pb-nav__links${open ? ' is-open' : ''}`} aria-label="Secciones">
            {links.map((l, i) => (
              <a key={i} href={ctx.editing ? undefined : l.href} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
          </nav>
        )}

        <div className="pb-nav__right">
          {cta && (cta.reserve
            ? <button type="button" className="pb-btn pb-btn--primary pb-btn--sm" onClick={() => !ctx.editing && ctx.onReserve()}>{cta.label}</button>
            : <a className="pb-btn pb-btn--primary pb-btn--sm" href={ctx.editing ? undefined : cta.href}>{cta.label}</a>
          )}
          {links.length > 0 && (
            <button
              type="button" className="pb-nav__burger" aria-label="Abrir menú"
              aria-expanded={open} onClick={() => setOpen(v => !v)}
            >
              <span /><span /><span />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function PBFooter({ doc, ctx }: { doc: PageDoc; ctx: BlockCtx }) {
  const { footer } = doc;
  const { shop } = ctx;
  const year = new Date().getFullYear();

  const social = [
    shop.instagram_url && { label: 'Instagram', href: shop.instagram_url },
    shop.tiktok_url    && { label: 'TikTok',    href: shop.tiktok_url },
    shop.facebook_url  && { label: 'Facebook',  href: shop.facebook_url },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className={`pb-footer pb-footer--${footer.style ?? 'columns'}`}>
      <div className="pb-container">
        <div className="pb-footer__grid">
          <div className="pb-footer__brand">
            <strong>{shop.name}</strong>
            {footer.text && <p>{footer.text}</p>}
            {shop.address && <p>{shop.address}</p>}
            {shop.phone && <a className="pb-link" href={ctx.editing ? undefined : `tel:${shop.phone}`}>{shop.phone}</a>}
          </div>

          {footer.showHours !== false && shop.hours.length > 0 && (
            <div className="pb-footer__col">
              <span className="pb-footer__k">Horarios</span>
              <ul>
                {shop.hours.map(h => (
                  <li key={h.day_of_week} className={h.is_today ? 'is-today' : undefined}>
                    <span>{h.day_label || DAY_NAMES[h.day_of_week]}</span>
                    <span>{h.is_closed || !h.open_time ? 'Cerrado' : `${h.open_time}–${h.close_time}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {footer.showSocial !== false && social.length > 0 && (
            <div className="pb-footer__col">
              <span className="pb-footer__k">Seguinos</span>
              <ul>
                {social.map(s => (
                  <li key={s.label}>
                    <a className="pb-link" href={ctx.editing ? undefined : s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pb-footer__bar">
          <span>© {year} {shop.name}</span>
          {footer.showNovu !== false && (
            <a className="pb-link" href={ctx.editing ? undefined : 'https://novu.uy'} target="_blank" rel="noopener noreferrer">
              Hecho con Novu
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ section, doc, ctx }: { section: PageSection; doc: PageDoc; ctx: BlockCtx }) {
  const Renderer = BLOCK_RENDERERS[section.type];
  if (!Renderer) return null;   // unknown type — a newer document on an older client

  return (
    <section
      id={domId(section)}
      className={sectionClass(section)}
      style={sectionCss(section.style, doc.design)}
      data-block={section.type}
      data-section-id={section.id}
    >
      {section.style.bgKind === 'image' && (
        <div className="pb-section__scrim" style={{ opacity: section.style.bgOverlay ?? 0.5 }} aria-hidden="true" />
      )}
      <div className="pb-section__inner">
        <Renderer section={section} ctx={ctx} />
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export interface PageRendererProps {
  doc: PageDoc;
  shop: Shop;
  onReserve: (serviceId?: number, branchId?: number) => void;
  /** True inside the builder preview: links are inert, nothing navigates away. */
  editing?: boolean;
}

export default function PageRenderer({ doc, shop, onReserve, editing }: PageRendererProps) {
  const ctx: BlockCtx = useMemo(() => ({ shop, onReserve, editing }), [shop, onReserve, editing]);
  const vars = useMemo(() => designToCssVars(doc.design), [doc.design]);

  const visible = doc.sections.filter(s => !s.hidden);
  const announcement = visible.find(s => s.type === 'announcement');
  const body = visible.filter(s => s.type !== 'announcement');

  return (
    <div
      className={`pb-page pb-texture-${doc.design.texture ?? 'none'} pb-btn-${doc.design.buttonStyle ?? 'solid'}`}
      data-pb-mode={doc.design.mode}
      style={vars}
      id="top"
    >
      {announcement && (
        <Section section={announcement} doc={doc} ctx={ctx} />
      )}
      {doc.nav.enabled !== false && <PBNav doc={doc} ctx={ctx} />}

      <main>
        {body.map(s => <Section key={s.id} section={s} doc={doc} ctx={ctx} />)}
      </main>

      {doc.footer.enabled !== false && <PBFooter doc={doc} ctx={ctx} />}
    </div>
  );
}
