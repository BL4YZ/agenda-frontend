/**
 * Starter documents.
 *
 * `docFromLegacy` is the important one: it rebuilds the pre-builder landing as
 * a document, so a business that opens the builder for the first time sees the
 * page it already had — not a blank canvas — and can start moving things around
 * from there.
 */

import type { PageDoc, PageSection, BlockType, PlanKey } from '@/types/builder';
import type { Shop } from '@/types/public';
import { BLOCK_DEFS, blockAllowed } from './blocks';
import { DEFAULT_DESIGN } from './design';

let seq = 0;
export const newId = () => `s${Date.now().toString(36)}${(seq++).toString(36)}`;

/** A section pre-filled with its block's defaults. */
export function makeSection(type: BlockType, overrides: Partial<PageSection> = {}): PageSection {
  const def = BLOCK_DEFS[type];
  return {
    id: newId(),
    type,
    props: { ...structuredClone(def.defaults), ...(overrides.props ?? {}) },
    style: { ...(def.defaultStyle ?? {}), ...(overrides.style ?? {}) },
    ...(overrides.name ? { name: overrides.name } : {}),
    ...(overrides.anchor ? { anchor: overrides.anchor } : {}),
  };
}

const baseDoc = (sections: PageSection[], design: Partial<PageDoc['design']> = {}): PageDoc => ({
  version: 1,
  design: { ...DEFAULT_DESIGN, ...design },
  seo: {},
  nav: { enabled: true, sticky: true, logoMode: 'both', align: 'split', style: 'glass', ctaLabel: 'Reservar', ctaAction: 'reserve' },
  footer: { enabled: true, style: 'columns', showHours: true, showSocial: true },
  sections,
});

// ── Templates ─────────────────────────────────────────────────────────────────
export interface Template {
  key: string;
  label: string;
  hint: string;
  plan: PlanKey;
  build: () => PageDoc;
}

export const TEMPLATES: Template[] = [
  {
    key: 'classic', label: 'Clásico', plan: 'gratis',
    hint: 'Portada, servicios, sobre nosotros, horarios y contacto. El punto de partida seguro.',
    build: () => baseDoc([
      makeSection('hero'),
      makeSection('services'),
      makeSection('richText', { props: { eyebrow: 'SOBRE NOSOTROS', title: 'Quiénes somos' } }),
      makeSection('features'),
      makeSection('hours'),
      makeSection('location'),
      makeSection('cta'),
    ]),
  },
  {
    key: 'minimal', label: 'Minimal', plan: 'gratis',
    hint: 'Una sola pantalla: quién sos, qué ofrecés y cómo reservar.',
    build: () => baseDoc([
      makeSection('hero', { props: { layout: 'minimal', height: 'half', showChips: false } }),
      makeSection('services', { props: { layout: 'menu', showImages: false } }),
      makeSection('hours', { props: { layout: 'compact' } }),
      makeSection('contact', { props: { layout: 'inline' } }),
    ], { preset: 'mono', mode: 'light', fontDisplay: 'archivo', fontBody: 'archivo', radius: 'sm', buttonRadius: 'sm' }),
  },
  {
    key: 'studio', label: 'Estudio', plan: 'pro',
    hint: 'Visual y editorial: portada dividida, galería, equipo y testimonios.',
    build: () => baseDoc([
      makeSection('hero', { props: { layout: 'split', height: 'tall' } }),
      makeSection('imageText'),
      makeSection('services', { props: { layout: 'grid' } }),
      makeSection('gallery'),
      makeSection('team'),
      makeSection('reviews'),
      makeSection('faq'),
      makeSection('location'),
      makeSection('cta'),
    ], { preset: 'sand', mode: 'light', fontDisplay: 'playfair', fontBody: 'raleway', density: 'roomy' }),
  },
  {
    key: 'shop', label: 'Catálogo', plan: 'pro',
    hint: 'Pensado para quien además vende productos: tienda arriba y reservas abajo.',
    build: () => baseDoc([
      makeSection('announcement'),
      makeSection('hero', { props: { layout: 'card' } }),
      makeSection('products'),
      makeSection('services'),
      makeSection('stats'),
      makeSection('reviews', { props: { layout: 'marquee' } }),
      makeSection('bookingCta'),
      makeSection('location'),
    ], { preset: 'forest', fontDisplay: 'syne', fontBody: 'space' }),
  },
  {
    key: 'blank', label: 'En blanco', plan: 'gratis',
    hint: 'Solo la portada. Armá el resto desde cero.',
    build: () => baseDoc([makeSection('hero')]),
  },
];

// ── Legacy migration ──────────────────────────────────────────────────────────
/**
 * Rebuilds the fixed pre-builder landing as a document, keeping only the
 * sections that business actually had content for. What the old page decided
 * with `shop.x.length > 0` checks is decided here once, at migration time.
 */
export function docFromLegacy(shop: Shop): PageDoc {
  const plan: PlanKey = shop.plan ?? 'gratis';
  const has = (type: BlockType, cond: boolean) => cond && blockAllowed(type, plan);

  const sections: PageSection[] = [makeSection('hero', {
    props: {
      eyebrow: shop.eyebrow || undefined,
      title: shop.tagline || undefined,
      subtitle: shop.lede || undefined,
      image: shop.cover_url || undefined,
    },
  })];

  if (!shop.about_hidden && (shop.about_quote || shop.about_image_url)) {
    sections.push(makeSection(shop.about_image_url ? 'imageText' : 'richText', {
      props: {
        eyebrow: 'SOBRE NOSOTROS',
        title: shop.founded_year ? `Desde ${shop.founded_year}` : 'Quiénes somos',
        text: shop.about_quote || '',
        ...(shop.about_image_url ? { image: shop.about_image_url } : {}),
      },
    }));
  }

  if (shop.services.length > 0) sections.push(makeSection('services'));
  if (has('branches', shop.branches.length > 0)) sections.push(makeSection('branches'));
  if (has('products', shop.products.length > 0)) sections.push(makeSection('products'));
  if (has('team',     shop.team.length > 0))     sections.push(makeSection('team'));
  if (has('gallery',  (shop.gallery?.length ?? 0) > 0)) sections.push(makeSection('gallery'));
  if (has('reviews',  shop.reviews.length > 0))  sections.push(makeSection('reviews'));
  if (shop.address || shop.lat || shop.phone)    sections.push(makeSection('location'));
  if (shop.hours.length > 0)                     sections.push(makeSection('hours'));
  if (has('faq',      shop.faqs.length > 0))     sections.push(makeSection('faq'));
  sections.push(makeSection('cta'));

  const doc = baseDoc(sections);
  // The legacy page's theme/font live on the business row — carry them over so
  // the first render in the builder matches what is live right now.
  if (shop.theme && shop.theme in { violet: 1, rose: 1, green: 1, cyan: 1, amber: 1, bw: 1 }) {
    doc.design.preset = shop.theme;
    doc.design.mode = ['green', 'cyan'].includes(shop.theme) ? 'light' : 'dark';
  }
  if (shop.font) doc.design.fontDisplay = shop.font;
  if (shop.brand_color) doc.design.colors = { accent: shop.brand_color };

  return doc;
}
