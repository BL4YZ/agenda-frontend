'use client';

import { useMemo, useState, useEffect } from 'react';
import type { PageDoc, PageSection, BlockType } from '@/types/builder';
import type { Shop } from '@/types/public';
import { BLOCK_RENDERERS } from './blocks';
import type { BlockCtx } from './blocks';
import { designToCssVars, googleFontsHref } from '@/lib/builder/design';
import { sectionCss, sectionClass, resolveCta, safeImg, DAY_NAMES } from '@/lib/builder/runtime';
import '@/styles/builder.css';

/**
 * Short labels for the auto-derived nav.
 *
 * ⚠️ Deliberately NOT the section's own title. A block's heading is a sentence
 * ("Quiénes te atienden", "Vení a vernos"); nine of those wrap the bar onto two
 * lines and push the reserve button off screen. The map doubles as the list of
 * types that earn a nav slot at all.
 */
const NAV_LABELS: Partial<Record<BlockType, string>> = {
  services: 'Servicios',
  products: 'Tienda',
  pricing:  'Paquetes',
  branches: 'Sucursales',
  team:     'Equipo',
  gallery:  'Galería',
  reviews:  'Reseñas',
  faq:      'Preguntas',
  hours:    'Horarios',
  location: 'Contacto',
  contact:  'Contacto',
};

/** Beyond this the bar gets cramped even with short labels. */
const MAX_AUTO_LINKS = 6;

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

  const mobileMenu = nav.mobileMenu ?? 'panel';
  // En pantalla completa y en cajón el menú tapa la página: dejar que el fondo
  // siga scrolleando detrás es desorientador, y sin Escape no hay forma de
  // salir con teclado.
  const cubrePantalla = mobileMenu !== 'panel';
  useEffect(() => {
    if (!open || !cubrePantalla) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, cubrePantalla]);

  const links = useMemo(() => {
    if (nav.links?.length) return nav.links;
    const seen = new Set<string>();
    const out: { label: string; href: string }[] = [];
    for (const s of doc.sections) {
      const label = NAV_LABELS[s.type];
      // One entry per label: `location` and `contact` are both "Contacto".
      if (s.hidden || !label || seen.has(label)) continue;
      seen.add(label);
      out.push({ label, href: `#${domId(s)}` });
      if (out.length === MAX_AUTO_LINKS) break;
    }
    return out;
  }, [nav.links, doc.sections]);

  /**
   * Navegación a una sección desde el menú.
   *
   * ⚠️ No se deja al navegador. Con el menú a pantalla completa el `body` está
   * con `overflow: hidden` para que el fondo no scrollee; el salto del ancla
   * ocurre mientras ese bloqueo sigue puesto y se pierde — el menú se cerraba y
   * la página no se movía. Acá se cierra primero y se desplaza en el siguiente
   * cuadro, ya sin bloqueo. Sirve igual en la vista previa del editor, donde los
   * enlaces no tienen href.
   */
  const irA = (e: React.MouseEvent, href?: string) => {
    setOpen(false);
    if (!href?.startsWith('#')) return;   // enlaces externos siguen su camino
    e.preventDefault();
    const destino = href.slice(1);
    // Se suelta el bloqueo acá mismo en vez de esperar a que lo haga la limpieza
    // del efecto: así el desplazamiento no depende de cuándo React vacíe el
    // estado. El efecto lo va a restaurar al mismo valor.
    document.body.style.overflow = '';
    requestAnimationFrame(() => {
      document.getElementById(destino)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  /**
   * ¿La barra arranca apoyada sobre una superficie oscura?
   *
   * La barra «minimal» es transparente, así que hereda los colores de la paleta.
   * Con una paleta clara sobre una portada con foto queda texto casi negro sobre
   * la imagen: invisible. Las otras barras no sufren esto porque tienen fondo
   * propio —la de vidrio es el fondo de la página al 72%— y ahí la paleta es la
   * correcta.
   *
   * Solo importa arriba de todo: al scrollear, la barra deja atrás la portada.
   */
  const sobreOscuro = useMemo(() => {
    const primera = doc.sections.find(s => !s.hidden && s.type !== 'announcement');
    if (!primera) return false;
    if (primera.style.bgKind === 'image' && primera.style.bgImage) return true;
    if (primera.type !== 'hero') return false;
    const layout = primera.props.layout ?? 'cover';
    return layout === 'cover' && !!safeImg(primera.props.image);
  }, [doc.sections]);

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
        sobreOscuro && !scrolled ? 'is-over-dark' : '',
        open ? 'is-menu-open' : '',
      ].filter(Boolean).join(' ')}
      data-mobile-menu={mobileMenu}
    >
      <div className="pb-container pb-nav__inner">
        <a className="pb-nav__brand" href="#top">
          {/* eslint-disable-next-line @next/next/no-img-element -- the logo is a business upload (often a data: URI) */}
          {showLogo && <img src={logo} alt="" className="pb-nav__logo" />}
          {showName && <span>{shop.name}</span>}
        </a>

        {links.length > 0 && (
          <nav className={`pb-nav__links${open ? ' is-open' : ''}`} aria-label="Secciones">
            {/* El menú que tapa la pantalla necesita su propio cierre: la
                hamburguesa queda en la barra, chica y separada de lo que
                cierra. En modo panel no hace falta — se ve la página detrás. */}
            {open && cubrePantalla && (
              <button
                type="button" className="pb-nav__close"
                aria-label="Cerrar menú" onClick={() => setOpen(false)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
            {links.map((l, i) => (
              <a
                key={i}
                href={ctx.editing ? undefined : l.href}
                onClick={e => irA(e, l.href)}
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}
        {open && cubrePantalla && (
          <div className="pb-nav__scrim" onClick={() => setOpen(false)} aria-hidden="true" />
        )}

        <div className="pb-nav__right">
          {cta && (cta.reserve
            ? <button type="button" className="pb-btn pb-btn--primary pb-btn--sm" onClick={() => !ctx.editing && ctx.onReserve()}>{cta.label}</button>
            : <a className="pb-btn pb-btn--primary pb-btn--sm" href={ctx.editing ? undefined : cta.href}>{cta.label}</a>
          )}
          {links.length > 0 && (
            <button
              type="button"
              className={`pb-nav__burger${open ? ' is-open' : ''}`}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
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
/**
 * Atribución a Novu. No es configurable a propósito: el documento no tiene
 * ninguna opción para ocultarla, ni siquiera apagando el pie de página — en ese
 * caso se renderiza sola, en una franja mínima.
 */
function NovuCredit({ ctx }: { ctx: BlockCtx }) {
  return (
    <a
      className="pb-link pb-credit__link"
      href={ctx.editing ? undefined : 'https://novu.uy'}
      target="_blank" rel="noopener noreferrer"
    >
      Hecho con Novu
    </a>
  );
}

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
          <NovuCredit ctx={ctx} />
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

  // React iza este <link> al <head>. Solo aparece si el dueño escribió una
  // familia propia; las 15 del catálogo ya vienen en builder.css.
  const fuentePropia = useMemo(() => googleFontsHref(doc.design), [doc.design]);

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
      {fuentePropia && <link rel="stylesheet" href={fuentePropia} />}
      {announcement && (
        <Section section={announcement} doc={doc} ctx={ctx} />
      )}
      {doc.nav.enabled !== false && <PBNav doc={doc} ctx={ctx} />}

      <main>
        {body.map(s => <Section key={s.id} section={s} doc={doc} ctx={ctx} />)}
      </main>

      {doc.footer.enabled !== false
        ? <PBFooter doc={doc} ctx={ctx} />
        : <div className="pb-credit"><div className="pb-container"><NovuCredit ctx={ctx} /></div></div>}
    </div>
  );
}
