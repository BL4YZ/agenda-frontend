/**
 * Runtime helpers shared by every block renderer.
 *
 * ⚠️ `safeUrl` mirrors the backend's allow-list on purpose. The server is the
 * authority — it is what stops a hostile document reaching the database — but
 * the builder renders an unsaved draft straight from local state, which never
 * passed through it. Both layers check, per the project's boundary rule.
 */

import type { CSSProperties } from 'react';
import type { PageSection, SectionStyle, CtaAction, PageDesign } from '@/types/builder';
import type { Shop } from '@/types/public';
import { padPx } from './design';

// ── URL safety ────────────────────────────────────────────────────────────────
const UNSAFE_SCHEME = /^[\s\u0000-\u001F]*(javascript|data|vbscript|file|blob)\s*:/i;
const SAFE_START    = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

export function safeUrl(v?: string | null): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (!t || UNSAFE_SCHEME.test(t)) return undefined;
  return SAFE_START.test(t) ? t : undefined;
}

/** Images may also be a base64 data: URI — uploads are stored that way. */
export function safeImg(v?: string | null): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  if (/^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml);base64,/i.test(t)) return t;
  return safeUrl(t);
}

// ── Call-to-action resolution ─────────────────────────────────────────────────
export interface ResolvedCta {
  label: string;
  /** Set for link-shaped CTAs; when absent the caller renders a <button>. */
  href?: string;
  /** True when the CTA should open the booking modal. */
  reserve?: boolean;
  external?: boolean;
}

export function resolveCta(
  action: CtaAction | undefined,
  label: string | undefined,
  href: string | undefined,
  shop: Shop,
): ResolvedCta | null {
  if (!label || action === 'none') return null;
  switch (action ?? 'reserve') {
    case 'reserve':
      return { label, reserve: true };
    case 'phone':
      return shop.phone ? { label, href: `tel:${shop.phone}` } : null;
    case 'whatsapp': {
      const n = (shop.whatsapp || shop.phone || '').replace(/[^\d]/g, '');
      return n ? { label, href: `https://wa.me/${n}`, external: true } : null;
    }
    case 'scroll': {
      const u = safeUrl(href);
      return u?.startsWith('#') ? { label, href: u } : null;
    }
    case 'link': {
      const u = safeUrl(href);
      return u ? { label, href: u, external: /^https?:\/\//i.test(u) } : null;
    }
    default:
      return null;
  }
}

// ── Section styling ───────────────────────────────────────────────────────────
const WIDTHS: Record<string, string> = {
  narrow: '760px', normal: '1120px', wide: '1360px', full: '100%',
};

/**
 * Turns a section's style object into the wrapper's inline CSS variables.
 * Every value here already passed the sanitizer (colors are matched against a
 * strict pattern, images against the URL allow-list), so none of it can break
 * out of the declaration it lands in.
 */
export function sectionCss(style: SectionStyle, design: PageDesign): CSSProperties {
  const css: Record<string, string> = {
    paddingTop: padPx(style.padTop, 'md'),
    paddingBottom: padPx(style.padBottom, 'md'),
  };

  if (style.width) css['--pb-section-width'] = WIDTHS[style.width] ?? WIDTHS.normal;
  if (style.textColor) css.color = style.textColor;

  switch (style.bgKind) {
    case 'surface':
      css.background = 'var(--pb-bg-2)';
      break;
    case 'accent':
      css.background = 'var(--pb-accent)';
      css.color = style.textColor ?? 'var(--pb-accent-fg)';
      css['--pb-on-accent'] = '1';
      break;
    case 'contrast':
      css.background = design.mode === 'dark' ? 'var(--pb-fg)' : 'var(--pb-fg)';
      css.color = style.textColor ?? 'var(--pb-bg)';
      break;
    case 'gradient':
      css.background = 'linear-gradient(160deg, var(--pb-bg-2), var(--pb-bg))';
      break;
    case 'image':
      if (style.bgImage) {
        css.backgroundImage = `url("${style.bgImage.replace(/"/g, '%22')}")`;
        css.backgroundSize = 'cover';
        css.backgroundPosition = 'center';
      }
      break;
    default:
      break;
  }

  if (style.bgColor && style.bgKind !== 'image') css.background = style.bgColor;

  return css as CSSProperties;
}

export function sectionClass(section: PageSection): string {
  const s = section.style;
  return [
    'pb-section',
    `pb-section--${section.type}`,
    s.align ? `pb-align-${s.align}` : '',
    s.radius ? `pb-r-${s.radius}` : '',
    s.divider && s.divider !== 'none' ? `pb-div-${s.divider}` : '',
    s.bgKind === 'image' ? 'pb-section--bgimage' : '',
  ].filter(Boolean).join(' ');
}

// ── Video embeds ──────────────────────────────────────────────────────────────
/**
 * Only YouTube and Vimeo — the two hosts allowed by `frame-src` in
 * next.config.ts. Anything else returns null rather than rendering an iframe
 * the browser would silently block.
 */
export function videoEmbed(url?: string): string | null {
  const u = safeUrl(url);
  if (!u) return null;
  let parsed: URL;
  try { parsed = new URL(u, 'https://novu.uy'); } catch { return null; }
  const host = parsed.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id = parsed.searchParams.get('v') ?? parsed.pathname.split('/').filter(Boolean).pop();
    return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1);
    return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.split('/').filter(Boolean).pop();
    return id && /^\d{5,15}$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

export const RATIO: Record<string, string> = {
  '16:9': '16 / 9', '4:3': '4 / 3', '1:1': '1 / 1', '9:16': '9 / 16',
};

// ── Misc ──────────────────────────────────────────────────────────────────────
/** Splits a textarea value into paragraphs on blank lines. */
export const paragraphs = (text?: string): string[] =>
  (text ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

/** Splits a textarea value into lines. */
export const lines = (text?: string): string[] =>
  (text ?? '').split('\n').map(l => l.trim()).filter(Boolean);

export const money = (n: number): string =>
  n > 0 ? `$${n.toLocaleString('es-UY')}` : 'Consultar';

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** "Abierto · cierra 19:00" for the hero and the hours block. */
export function openStatus(hours: Shop['hours']): { open: boolean; label: string } | null {
  if (!hours?.length) return null;
  const now = new Date();
  const today = hours.find(h => h.day_of_week === now.getDay());
  if (!today) return null;
  if (today.is_closed || !today.open_time || !today.close_time) return { open: false, label: 'Cerrado hoy' };
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open_time.split(':').map(Number);
  const [ch, cm] = today.close_time.split(':').map(Number);
  if (cur < oh * 60 + om)  return { open: false, label: `Abre a las ${today.open_time}` };
  if (cur >= ch * 60 + cm) return { open: false, label: `Cerró a las ${today.close_time}` };
  return { open: true, label: `Abierto · cierra ${today.close_time}` };
}
