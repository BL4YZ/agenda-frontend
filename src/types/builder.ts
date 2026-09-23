/**
 * Page-builder document model.
 *
 * A business's public page is this document, not a fixed component tree.
 * It is edited in /dashboard/landing, stored in `business_pages` and rendered
 * by `components/public/PageRenderer`.
 *
 * ⚠️ Keep the block union in sync with `BLOCKS` in the backend's
 * `pageController.js` — that list is the authority and silently drops any type
 * it does not know.
 */

export type BlockType =
  // Layout & content
  | 'announcement' | 'hero' | 'heading' | 'richText' | 'imageText' | 'image'
  | 'video' | 'spacer' | 'divider'
  // Business data (fed from the shop's real records)
  | 'services' | 'bookingCta' | 'hours' | 'location' | 'contact' | 'social'
  | 'products' | 'reviews' | 'faq' | 'team' | 'gallery' | 'branches'
  // Marketing
  | 'features' | 'stats' | 'steps' | 'testimonials' | 'pricing' | 'logos'
  | 'countdown' | 'cta';

export type PlanKey = 'gratis' | 'pro' | 'negocio';

export type DesignPreset =
  | 'violet' | 'rose' | 'green' | 'cyan' | 'amber' | 'bw'
  | 'sand' | 'forest' | 'ocean' | 'mono' | 'custom';

export type FontKey =
  | 'editorial' | 'playfair' | 'bebas' | 'oswald' | 'elegant' | 'dm-serif'
  | 'raleway' | 'modern' | 'montserrat' | 'nunito' | 'lora' | 'poppins'
  | 'space' | 'syne' | 'archivo';

export type RadiusKey  = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type DensityKey = 'compact' | 'normal' | 'roomy';
export type WidthKey   = 'narrow' | 'normal' | 'wide' | 'full';
export type PadKey     = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AlignKey   = 'left' | 'center' | 'right';
export type BgKind     = 'none' | 'surface' | 'accent' | 'contrast' | 'image' | 'gradient';
export type CtaAction  = 'reserve' | 'link' | 'scroll' | 'whatsapp' | 'phone' | 'none';

export interface DesignColors {
  bg?: string;
  bg2?: string;
  fg?: string;
  fgSoft?: string;
  accent?: string;
  accentFg?: string;
  line?: string;
}

export interface PageDesign {
  preset: DesignPreset;
  mode: 'dark' | 'light';
  fontDisplay: FontKey;
  fontBody: FontKey;
  radius: RadiusKey;
  density: DensityKey;
  width: WidthKey;
  buttonStyle: 'solid' | 'outline' | 'soft' | 'underline';
  buttonRadius: RadiusKey;
  texture: 'none' | 'noise' | 'grid' | 'dots' | 'gradient';
  scale?: number;
  colors?: DesignColors;
}

export interface SectionStyle {
  padTop?: PadKey;
  padBottom?: PadKey;
  align?: AlignKey;
  width?: WidthKey;
  bgKind?: BgKind;
  bgColor?: string;
  bgImage?: string;
  bgOverlay?: number;
  textColor?: string;
  radius?: RadiusKey;
  divider?: 'none' | 'line' | 'fade' | 'wave' | 'slant';
  animate?: 'none' | 'fade' | 'up' | 'zoom';
}

/**
 * One repeatable entry inside a block (a feature, a stat, a plan, a logo…).
 * Deliberately a single loose shape rather than one interface per block: it
 * keeps the generic inspector and the backend sanitizer simple, and the
 * renderers only read the fields they care about.
 */
export interface BlockItem {
  id?: string;
  icon?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  value?: string;
  prefix?: string;
  suffix?: string;
  price?: string;
  badge?: string;
  image?: string;
  href?: string;
  label?: string;
  author?: string;
  role?: string;
  stars?: number;
  color?: string;
  highlight?: boolean;
  features?: string[];
}

export interface BlockProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  layout?: string;
  variant?: string;
  columns?: number;
  limit?: number;
  ctaLabel?: string;
  ctaHref?: string;
  ctaAction?: CtaAction;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryAction?: CtaAction;
  image?: string;
  imageAlt?: string;
  showPrices?: boolean;
  showDuration?: boolean;
  showImages?: boolean;
  showMap?: boolean;
  reverse?: boolean;
  items?: BlockItem[];
  // hero
  height?: 'auto' | 'half' | 'tall' | 'full';
  overlay?: number;
  showRating?: boolean;
  showStatus?: boolean;
  showChips?: boolean;
  videoUrl?: string;
  // video
  url?: string;
  ratio?: '16:9' | '4:3' | '1:1' | '9:16';
  // spacer / divider / countdown / location / announcement
  size?: number;
  style?: 'line' | 'dashed' | 'dots' | 'fade' | 'label';
  target?: string;
  zoom?: number;
  mapStyle?: 'standard' | 'muted' | 'dark';
  dismissible?: boolean;
}

export interface PageSection {
  id: string;
  type: BlockType;
  name?: string;
  hidden?: boolean;
  anchor?: string;
  props: BlockProps;
  style: SectionStyle;
}

export interface PageNav {
  enabled?: boolean;
  sticky?: boolean;
  logoMode?: 'logo' | 'name' | 'both';
  align?: 'left' | 'center' | 'split';
  style?: 'glass' | 'solid' | 'minimal' | 'floating';
  ctaLabel?: string;
  ctaAction?: Exclude<CtaAction, 'scroll'>;
  ctaHref?: string;
  links?: { id?: string; label: string; href: string }[];
}

/** Sin `showNovu`: la atribución a Novu no es opcional. */
export interface PageFooter {
  enabled?: boolean;
  style?: 'minimal' | 'columns' | 'centered' | 'bold';
  text?: string;
  showHours?: boolean;
  showSocial?: boolean;
}

export interface PageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface PageDoc {
  version: 1;
  design: PageDesign;
  seo: PageSeo;
  nav: PageNav;
  footer: PageFooter;
  sections: PageSection[];
}
