/**
 * Design tokens → CSS custom properties.
 *
 * The whole look of a built page comes from one object of CSS variables set on
 * the page root. Every block styles itself from those variables and nothing
 * else, which is what lets a palette / font / radius change repaint the entire
 * page without touching a single block.
 */

import type { CSSProperties } from 'react';
import type {
  PageDesign, DesignPreset, FontKey, RadiusKey, DensityKey, WidthKey,
} from '@/types/builder';

// ── Palettes ──────────────────────────────────────────────────────────────────
export interface Palette {
  label: string;
  mode: 'dark' | 'light';
  bg: string; bg2: string; fg: string; fgSoft: string;
  accent: string; accentFg: string; line: string;
}

export const PALETTES: Record<Exclude<DesignPreset, 'custom'>, Palette> = {
  violet: {
    label: 'Violeta', mode: 'dark',
    bg: '#0a0810', bg2: '#141020', fg: '#f5f1ec', fgSoft: '#b0aac2',
    accent: '#8b5cf6', accentFg: '#ffffff', line: 'rgba(196,181,253,0.16)',
  },
  rose: {
    label: 'Rosa', mode: 'dark',
    bg: '#0d0810', bg2: '#1c0f18', fg: '#fdf0f5', fgSoft: '#d0a6bd',
    accent: '#ec4899', accentFg: '#ffffff', line: 'rgba(244,114,182,0.18)',
  },
  amber: {
    label: 'Ámbar', mode: 'dark',
    bg: '#0d0b07', bg2: '#1a150c', fg: '#faf4e8', fgSoft: '#c4b596',
    accent: '#f59e0b', accentFg: '#1a1205', line: 'rgba(252,211,77,0.18)',
  },
  bw: {
    label: 'Blanco y negro', mode: 'dark',
    bg: '#080808', bg2: '#151515', fg: '#f2f2f2', fgSoft: '#a3a3a3',
    accent: '#e8e8e8', accentFg: '#0a0a0a', line: 'rgba(255,255,255,0.14)',
  },
  forest: {
    label: 'Bosque', mode: 'dark',
    bg: '#07110d', bg2: '#0e1d17', fg: '#eef6f1', fgSoft: '#9db5a8',
    accent: '#34d399', accentFg: '#052018', line: 'rgba(52,211,153,0.16)',
  },
  ocean: {
    label: 'Océano', mode: 'dark',
    bg: '#060d16', bg2: '#0d1826', fg: '#eaf2fb', fgSoft: '#93a8c0',
    accent: '#38bdf8', accentFg: '#05121d', line: 'rgba(56,189,248,0.18)',
  },
  green: {
    label: 'Salvia', mode: 'light',
    bg: '#faf6f0', bg2: '#f1ebe0', fg: '#2a2820', fgSoft: '#6b6557',
    accent: '#6e8267', accentFg: '#ffffff', line: 'rgba(42,40,32,0.14)',
  },
  cyan: {
    label: 'Cian', mode: 'light',
    bg: '#f6f8fc', bg2: '#e9eff8', fg: '#0c1424', fgSoft: '#4a5568',
    accent: '#2563eb', accentFg: '#ffffff', line: 'rgba(12,20,36,0.12)',
  },
  sand: {
    label: 'Arena', mode: 'light',
    bg: '#fbf8f4', bg2: '#f2ece2', fg: '#26211b', fgSoft: '#6d6256',
    accent: '#b45309', accentFg: '#ffffff', line: 'rgba(38,33,27,0.13)',
  },
  mono: {
    label: 'Papel', mode: 'light',
    bg: '#ffffff', bg2: '#f4f4f5', fg: '#111113', fgSoft: '#5c5c66',
    accent: '#111113', accentFg: '#ffffff', line: 'rgba(17,17,19,0.14)',
  },
};

// ── Fonts ─────────────────────────────────────────────────────────────────────
export const FONTS: Record<FontKey, { label: string; stack: string; group: string }> = {
  editorial:  { label: 'Editorial',  group: 'Serif',      stack: '"Fraunces", Georgia, serif' },
  playfair:   { label: 'Playfair',   group: 'Serif',      stack: '"Playfair Display", Georgia, serif' },
  'dm-serif': { label: 'DM Serif',   group: 'Serif',      stack: '"DM Serif Display", Georgia, serif' },
  lora:       { label: 'Lora',       group: 'Serif',      stack: '"Lora", Georgia, serif' },
  elegant:    { label: 'Cormorant',  group: 'Serif',      stack: '"Cormorant Garamond", Georgia, serif' },
  modern:     { label: 'Inter Tight', group: 'Sans',      stack: '"Inter Tight", system-ui, sans-serif' },
  montserrat: { label: 'Montserrat', group: 'Sans',       stack: '"Montserrat", system-ui, sans-serif' },
  raleway:    { label: 'Raleway',    group: 'Sans',       stack: '"Raleway", system-ui, sans-serif' },
  poppins:    { label: 'Poppins',    group: 'Sans',       stack: '"Poppins", system-ui, sans-serif' },
  nunito:     { label: 'Nunito',     group: 'Sans',       stack: '"Nunito", system-ui, sans-serif' },
  archivo:    { label: 'Archivo',    group: 'Sans',       stack: '"Archivo", system-ui, sans-serif' },
  oswald:     { label: 'Oswald',     group: 'Condensada', stack: '"Oswald", system-ui, sans-serif' },
  bebas:      { label: 'Bebas Neue', group: 'Condensada', stack: '"Bebas Neue", system-ui, sans-serif' },
  space:      { label: 'Space Grotesk', group: 'Técnica', stack: '"Space Grotesk", system-ui, sans-serif' },
  syne:       { label: 'Syne',       group: 'Técnica',    stack: '"Syne", system-ui, sans-serif' },
};

// ── Scales ────────────────────────────────────────────────────────────────────
const RADIUS: Record<RadiusKey, string> = {
  none: '0px', sm: '6px', md: '14px', lg: '22px', xl: '32px', full: '999px',
};

const DENSITY: Record<DensityKey, { pad: number; gap: number }> = {
  compact: { pad: 0.72, gap: 0.8 },
  normal:  { pad: 1,    gap: 1 },
  roomy:   { pad: 1.35, gap: 1.25 },
};

const WIDTH: Record<WidthKey, string> = {
  narrow: '760px', normal: '1120px', wide: '1360px', full: '100%',
};

export const PAD_SCALE: Record<string, number> = {
  none: 0, xs: 28, sm: 52, md: 88, lg: 132, xl: 180,
};

export const DEFAULT_DESIGN: PageDesign = {
  preset: 'violet',
  mode: 'dark',
  fontDisplay: 'editorial',
  fontBody: 'modern',
  radius: 'md',
  density: 'normal',
  width: 'normal',
  buttonStyle: 'solid',
  buttonRadius: 'full',
  texture: 'none',
  scale: 1,
};

/** Resolves preset + per-colour overrides into the final palette. */
export function resolvePalette(design: PageDesign): Palette {
  const base = PALETTES[(design.preset === 'custom' ? 'violet' : design.preset)] ?? PALETTES.violet;
  const c = design.colors ?? {};
  return {
    ...base,
    mode: design.mode ?? base.mode,
    bg:       c.bg       || base.bg,
    bg2:      c.bg2      || base.bg2,
    fg:       c.fg       || base.fg,
    fgSoft:   c.fgSoft   || base.fgSoft,
    accent:   c.accent   || base.accent,
    accentFg: c.accentFg || base.accentFg,
    line:     c.line     || base.line,
  };
}

/**
 * The single style object applied to the page root. Blocks read only these,
 * so there is exactly one place where the design system is materialised.
 */
export function designToCssVars(design: PageDesign): CSSProperties {
  const p = resolvePalette(design);
  const d = DENSITY[design.density] ?? DENSITY.normal;
  const scale = design.scale ?? 1;

  return {
    '--pb-bg': p.bg,
    '--pb-bg-2': p.bg2,
    '--pb-fg': p.fg,
    '--pb-fg-soft': p.fgSoft,
    '--pb-accent': p.accent,
    '--pb-accent-fg': p.accentFg,
    '--pb-line': p.line,
    '--pb-font-display': FONTS[design.fontDisplay]?.stack ?? FONTS.editorial.stack,
    '--pb-font-body': FONTS[design.fontBody]?.stack ?? FONTS.modern.stack,
    '--pb-radius': RADIUS[design.radius] ?? RADIUS.md,
    '--pb-radius-btn': RADIUS[design.buttonRadius] ?? RADIUS.full,
    '--pb-pad-scale': String(d.pad),
    '--pb-gap-scale': String(d.gap),
    '--pb-width': WIDTH[design.width] ?? WIDTH.normal,
    '--pb-scale': String(scale),
    // Surfaces are derived so a custom palette never needs seven more pickers.
    '--pb-surface': p.mode === 'dark'
      ? 'color-mix(in oklab, var(--pb-fg) 6%, transparent)'
      : 'color-mix(in oklab, var(--pb-fg) 4%, transparent)',
    '--pb-surface-strong': p.mode === 'dark'
      ? 'color-mix(in oklab, var(--pb-fg) 10%, var(--pb-bg))'
      : 'color-mix(in oklab, var(--pb-fg) 6%, var(--pb-bg))',
    '--pb-shadow': p.mode === 'dark'
      ? '0 30px 70px -30px rgba(0,0,0,0.75)'
      : '0 24px 60px -28px rgba(20,20,30,0.28)',
  } as CSSProperties;
}

/** Section vertical padding, in px, after the density multiplier. */
export function padPx(key: string | undefined, fallback: string): string {
  const v = PAD_SCALE[key ?? fallback] ?? PAD_SCALE[fallback] ?? 88;
  return `calc(${v}px * var(--pb-pad-scale, 1))`;
}
