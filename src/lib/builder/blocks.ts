/**
 * Block registry — the single description of every block the builder offers.
 *
 * One entry drives all three surfaces: the "add block" catalog, the inspector
 * controls on the right, and the defaults a freshly added block starts with.
 * Adding a block means adding an entry here, a renderer in
 * `components/public/blocks/`, and its type to `BLOCKS` in the backend's
 * `pageController.js` (which is the authority and drops anything it doesn't
 * know).
 */

import type { BlockType, BlockProps, PlanKey, SectionStyle } from '@/types/builder';

// ── Inspector controls ────────────────────────────────────────────────────────
export type Control =
  | { k: 'text';     key: string; label: string; placeholder?: string; hint?: string }
  | { k: 'textarea'; key: string; label: string; rows?: number; placeholder?: string; hint?: string }
  | { k: 'number';   key: string; label: string; min: number; max: number; step?: number; suffix?: string }
  | { k: 'toggle';   key: string; label: string; hint?: string }
  | { k: 'select';   key: string; label: string; options: { value: string; label: string }[] }
  | { k: 'image';    key: string; label: string }
  | { k: 'color';    key: string; label: string }
  | { k: 'cta';      label: string; actionKey: string; labelKey: string; hrefKey: string }
  | { k: 'items';    key: string; label: string; addLabel: string; titleKey: string; fields: Control[] }
  | { k: 'note';     text: string };

export interface BlockDef {
  type: BlockType;
  label: string;
  hint: string;
  category: 'layout' | 'content' | 'business' | 'marketing';
  plan: PlanKey;
  icon: string;
  /** Renders records the business already has (services, team, reviews…). */
  dataDriven?: boolean;
  /** Only one of these may exist on a page. */
  unique?: boolean;
  defaults: BlockProps;
  defaultStyle?: SectionStyle;
  controls: Control[];
}

// ── Shared control fragments ──────────────────────────────────────────────────
const headingControls: Control[] = [
  { k: 'text',     key: 'eyebrow',  label: 'Etiqueta', placeholder: 'SERVICIOS', hint: 'Texto corto arriba del título' },
  { k: 'text',     key: 'title',    label: 'Título' },
  { k: 'textarea', key: 'subtitle', label: 'Subtítulo', rows: 2 },
];

const columnsControl = (max = 4): Control =>
  ({ k: 'number', key: 'columns', label: 'Columnas', min: 1, max, suffix: 'col' });

const layoutControl = (options: { value: string; label: string }[]): Control =>
  ({ k: 'select', key: 'layout', label: 'Disposición', options });

const itemTextFields: Control[] = [
  { k: 'text',     key: 'title', label: 'Título' },
  { k: 'textarea', key: 'text',  label: 'Texto', rows: 3 },
];

// ── Registry ──────────────────────────────────────────────────────────────────
export const BLOCK_DEFS: Record<BlockType, BlockDef> = {

  // ─────────── Layout & content ───────────
  announcement: {
    type: 'announcement', label: 'Barra de anuncio', category: 'layout', plan: 'gratis',
    icon: 'Megaphone', unique: true,
    hint: 'Franja fina arriba de todo para una promo o un aviso.',
    defaults: { text: 'Envíos sin costo esta semana', ctaLabel: 'Ver más', ctaAction: 'none', dismissible: true },
    controls: [
      { k: 'text',   key: 'text',        label: 'Mensaje' },
      { k: 'cta',    label: 'Enlace',    actionKey: 'ctaAction', labelKey: 'ctaLabel', hrefKey: 'ctaHref' },
      { k: 'toggle', key: 'dismissible', label: 'Se puede cerrar' },
    ],
  },

  hero: {
    type: 'hero', label: 'Portada', category: 'layout', plan: 'gratis',
    icon: 'Image', unique: true,
    hint: 'La primera pantalla: imagen de fondo, título y botón de reserva.',
    defaults: {
      layout: 'cover', height: 'tall', overlay: 0.55,
      showRating: true, showStatus: true, showChips: true,
      ctaLabel: 'Reservar online', ctaAction: 'reserve',
      secondaryLabel: 'Llamar', secondaryAction: 'phone',
    },
    controls: [
      layoutControl([
        { value: 'cover',   label: 'Imagen a pantalla completa' },
        { value: 'split',   label: 'Dividido (texto + imagen)' },
        { value: 'minimal', label: 'Minimal centrado' },
        { value: 'card',    label: 'Tarjeta flotante' },
      ]),
      { k: 'select', key: 'height', label: 'Altura', options: [
        { value: 'auto', label: 'Automática' }, { value: 'half', label: 'Media pantalla' },
        { value: 'tall', label: 'Alta' },       { value: 'full', label: 'Pantalla completa' },
      ]},
      { k: 'text',     key: 'eyebrow',  label: 'Etiqueta', placeholder: 'Desde 2019', hint: 'Texto corto arriba del título' },
      { k: 'text',     key: 'title',    label: 'Título', placeholder: 'Se usa el nombre del negocio si lo dejás vacío' },
      { k: 'textarea', key: 'subtitle', label: 'Subtítulo', rows: 3 },
      { k: 'image',    key: 'image',    label: 'Imagen de fondo' },
      { k: 'number',   key: 'overlay',  label: 'Oscurecer imagen', min: 0, max: 1, step: 0.05 },
      { k: 'cta',      label: 'Botón principal',  actionKey: 'ctaAction',       labelKey: 'ctaLabel',       hrefKey: 'ctaHref' },
      { k: 'cta',      label: 'Botón secundario', actionKey: 'secondaryAction', labelKey: 'secondaryLabel', hrefKey: 'secondaryHref' },
      { k: 'toggle',   key: 'showRating', label: 'Mostrar calificación' },
      { k: 'toggle',   key: 'showStatus', label: 'Mostrar si está abierto ahora' },
      { k: 'toggle',   key: 'showChips',  label: 'Mostrar datos sobre la imagen',
        hint: 'Calificación y cantidad de servicios, en burbujas flotantes' },
    ],
  },

  heading: {
    type: 'heading', label: 'Título', category: 'content', plan: 'gratis',
    icon: 'Heading',
    hint: 'Un encabezado suelto para separar partes de la página.',
    defaults: { eyebrow: '', title: 'Un título', subtitle: '' },
    controls: headingControls,
  },

  richText: {
    type: 'richText', label: 'Texto', category: 'content', plan: 'gratis',
    icon: 'AlignLeft',
    hint: 'Uno o varios párrafos. Ideal para contar tu historia.',
    defaults: { title: 'Sobre nosotros', text: 'Contá quién sos, qué hacés y por qué.', variant: 'normal' },
    controls: [
      { k: 'text',     key: 'eyebrow', label: 'Etiqueta', hint: 'Texto corto arriba del título' },
      { k: 'text',     key: 'title',   label: 'Título' },
      { k: 'textarea', key: 'text',    label: 'Texto', rows: 8, placeholder: 'Una línea en blanco separa párrafos.' },
      { k: 'select',   key: 'variant', label: 'Tamaño', options: [
        { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Grande' }, { value: 'quote', label: 'Cita destacada' },
      ]},
    ],
  },

  imageText: {
    type: 'imageText', label: 'Imagen + texto', category: 'content', plan: 'gratis',
    icon: 'Columns2',
    hint: 'Media pantalla de imagen, media de texto. Se puede invertir.',
    defaults: {
      title: 'Nuestro espacio', text: 'Describí el lugar, el equipo o el proceso.',
      reverse: false, ctaAction: 'none',
    },
    controls: [
      { k: 'image',    key: 'image',    label: 'Imagen' },
      { k: 'text',     key: 'imageAlt', label: 'Texto alternativo', placeholder: 'Descripción para lectores de pantalla' },
      { k: 'text',     key: 'eyebrow',  label: 'Etiqueta', hint: 'Texto corto arriba del título' },
      { k: 'text',     key: 'title',    label: 'Título' },
      { k: 'textarea', key: 'text',     label: 'Texto', rows: 6 },
      { k: 'toggle',   key: 'reverse',  label: 'Imagen a la derecha' },
      { k: 'cta',      label: 'Botón',  actionKey: 'ctaAction', labelKey: 'ctaLabel', hrefKey: 'ctaHref' },
    ],
  },

  image: {
    type: 'image', label: 'Imagen', category: 'content', plan: 'gratis',
    icon: 'ImagePlus',
    hint: 'Una imagen sola, al ancho que elijas.',
    defaults: { variant: 'contained' },
    controls: [
      { k: 'image',  key: 'image',    label: 'Imagen' },
      { k: 'text',   key: 'imageAlt', label: 'Texto alternativo' },
      { k: 'text',   key: 'text',     label: 'Epígrafe' },
      { k: 'select', key: 'variant',  label: 'Ancho', options: [
        { value: 'contained', label: 'Dentro del contenedor' },
        { value: 'full',      label: 'De borde a borde' },
        { value: 'narrow',    label: 'Angosto' },
      ]},
    ],
  },

  video: {
    type: 'video', label: 'Video', category: 'content', plan: 'pro',
    icon: 'Play',
    hint: 'Un video de YouTube o Vimeo incrustado.',
    defaults: { ratio: '16:9' },
    controls: [
      { k: 'text',   key: 'url',   label: 'URL del video', placeholder: 'https://youtube.com/watch?v=…' },
      { k: 'text',   key: 'title', label: 'Título' },
      { k: 'select', key: 'ratio', label: 'Proporción', options: [
        { value: '16:9', label: '16:9 — apaisado' }, { value: '4:3', label: '4:3' },
        { value: '1:1',  label: '1:1 — cuadrado' },  { value: '9:16', label: '9:16 — vertical' },
      ]},
      { k: 'note', text: 'Solo se aceptan enlaces de YouTube y Vimeo.' },
    ],
  },

  spacer: {
    type: 'spacer', label: 'Espacio', category: 'layout', plan: 'gratis',
    icon: 'MoveVertical',
    hint: 'Aire vertical entre dos secciones.',
    defaults: { size: 64 },
    defaultStyle: { padTop: 'none', padBottom: 'none' },
    controls: [{ k: 'number', key: 'size', label: 'Altura', min: 0, max: 400, step: 4, suffix: 'px' }],
  },

  divider: {
    type: 'divider', label: 'Separador', category: 'layout', plan: 'gratis',
    icon: 'Minus',
    hint: 'Una línea, con o sin etiqueta al medio.',
    defaults: { style: 'line' },
    defaultStyle: { padTop: 'xs', padBottom: 'xs' },
    controls: [
      { k: 'select', key: 'style', label: 'Estilo', options: [
        { value: 'line', label: 'Línea' }, { value: 'dashed', label: 'Punteada' },
        { value: 'dots', label: 'Puntos' }, { value: 'fade', label: 'Degradada' },
        { value: 'label', label: 'Con etiqueta' },
      ]},
      { k: 'text', key: 'text', label: 'Etiqueta' },
    ],
  },

  // ─────────── Business data ───────────
  services: {
    type: 'services', label: 'Servicios', category: 'business', plan: 'gratis',
    icon: 'Scissors', dataDriven: true,
    hint: 'Tus servicios reales. Se actualizan solos al editarlos en Servicios.',
    defaults: {
      eyebrow: 'SERVICIOS', title: 'Lo que ofrecemos',
      layout: 'cards', columns: 3, showPrices: true, showDuration: true, showImages: true,
    },
    controls: [
      ...headingControls,
      layoutControl([
        { value: 'cards', label: 'Tarjetas' }, { value: 'list', label: 'Lista' },
        { value: 'menu',  label: 'Menú (precio a la derecha)' }, { value: 'grid', label: 'Grilla con foto' },
      ]),
      columnsControl(4),
      { k: 'toggle', key: 'showPrices',   label: 'Mostrar precios' },
      { k: 'toggle', key: 'showDuration', label: 'Mostrar duración' },
      { k: 'toggle', key: 'showImages',   label: 'Mostrar imágenes' },
      { k: 'number', key: 'limit',        label: 'Máximo a mostrar', min: 1, max: 60 },
      { k: 'note',   text: 'El contenido viene de la sección Servicios del panel.' },
    ],
  },

  bookingCta: {
    type: 'bookingCta', label: 'Bloque de reserva', category: 'business', plan: 'gratis',
    icon: 'CalendarCheck',
    hint: 'Una franja grande con el botón de reservar.',
    defaults: {
      title: 'Reservá tu turno', subtitle: 'Elegí el servicio y el horario que te queden cómodos.',
      ctaLabel: 'Reservar ahora', ctaAction: 'reserve', variant: 'band',
    },
    defaultStyle: { bgKind: 'accent' },
    controls: [
      ...headingControls,
      { k: 'cta',    label: 'Botón', actionKey: 'ctaAction', labelKey: 'ctaLabel', hrefKey: 'ctaHref' },
      { k: 'select', key: 'variant', label: 'Estilo', options: [
        { value: 'band', label: 'Franja ancha' }, { value: 'card', label: 'Tarjeta' }, { value: 'split', label: 'Texto + botón en línea' },
      ]},
    ],
  },

  hours: {
    type: 'hours', label: 'Horarios', category: 'business', plan: 'gratis',
    icon: 'Clock', dataDriven: true,
    hint: 'Tu horario semanal, con el día de hoy destacado.',
    defaults: { eyebrow: 'HORARIOS', title: 'Cuándo abrimos', layout: 'list' },
    controls: [
      ...headingControls,
      layoutControl([
        { value: 'list', label: 'Lista' }, { value: 'grid', label: 'Grilla' }, { value: 'compact', label: 'Compacto' },
      ]),
      { k: 'note', text: 'El contenido viene de la pestaña Horarios.' },
    ],
  },

  location: {
    type: 'location', label: 'Ubicación', category: 'business', plan: 'gratis',
    icon: 'MapPin', dataDriven: true,
    hint: 'Dirección, mapa y cómo llegar.',
    defaults: { eyebrow: 'DÓNDE ESTAMOS', title: 'Vení a vernos', showMap: true, zoom: 15, mapStyle: 'standard' },
    controls: [
      ...headingControls,
      { k: 'toggle', key: 'showMap',  label: 'Mostrar mapa' },
      { k: 'number', key: 'zoom',     label: 'Zoom del mapa', min: 1, max: 20 },
      { k: 'select', key: 'mapStyle', label: 'Estilo del mapa', options: [
        { value: 'standard', label: 'Estándar' }, { value: 'muted', label: 'Apagado' }, { value: 'dark', label: 'Oscuro' },
      ]},
      { k: 'note', text: 'La dirección viene de la pestaña Contacto.' },
    ],
  },

  contact: {
    type: 'contact', label: 'Contacto', category: 'business', plan: 'gratis',
    icon: 'Phone', dataDriven: true,
    hint: 'Teléfono, WhatsApp, email y dirección como botones.',
    defaults: { eyebrow: 'CONTACTO', title: 'Hablemos', layout: 'cards' },
    controls: [
      ...headingControls,
      layoutControl([
        { value: 'cards', label: 'Tarjetas' }, { value: 'inline', label: 'En línea' }, { value: 'stack', label: 'Apilado' },
      ]),
    ],
  },

  social: {
    type: 'social', label: 'Redes sociales', category: 'business', plan: 'gratis',
    icon: 'Share2', dataDriven: true,
    hint: 'Links a Instagram, TikTok y Facebook.',
    defaults: { title: 'Seguinos', layout: 'icons' },
    controls: [
      ...headingControls,
      layoutControl([
        { value: 'icons', label: 'Solo íconos' }, { value: 'buttons', label: 'Botones con nombre' },
      ]),
      { k: 'note', text: 'Las URLs vienen de la pestaña Contacto.' },
    ],
  },

  products: {
    type: 'products', label: 'Tienda', category: 'business', plan: 'pro',
    icon: 'ShoppingBag', dataDriven: true,
    hint: 'Los productos que cargaste, en grilla o carrusel.',
    defaults: { eyebrow: 'TIENDA', title: 'Productos', layout: 'grid', columns: 3, showPrices: true },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'grid', label: 'Grilla' }, { value: 'carousel', label: 'Carrusel' }, { value: 'list', label: 'Lista' }]),
      columnsControl(4),
      { k: 'toggle', key: 'showPrices', label: 'Mostrar precios' },
      { k: 'number', key: 'limit',      label: 'Máximo a mostrar', min: 1, max: 60 },
    ],
  },

  reviews: {
    type: 'reviews', label: 'Reseñas', category: 'business', plan: 'pro',
    icon: 'Star', dataDriven: true,
    hint: 'Las reseñas cargadas en el panel, con su promedio.',
    defaults: { eyebrow: 'RESEÑAS', title: 'Lo que dicen', layout: 'cards', columns: 3 },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'cards', label: 'Tarjetas' }, { value: 'marquee', label: 'Cinta en movimiento' }, { value: 'single', label: 'Una por vez' }]),
      columnsControl(4),
      { k: 'number', key: 'limit', label: 'Máximo a mostrar', min: 1, max: 30 },
    ],
  },

  faq: {
    type: 'faq', label: 'Preguntas frecuentes', category: 'business', plan: 'pro',
    icon: 'HelpCircle', dataDriven: true,
    hint: 'Tus FAQs en acordeón.',
    defaults: { eyebrow: 'DUDAS', title: 'Preguntas frecuentes', layout: 'accordion' },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'accordion', label: 'Acordeón' }, { value: 'open', label: 'Todas abiertas' }, { value: 'two-col', label: 'Dos columnas' }]),
    ],
  },

  team: {
    type: 'team', label: 'Equipo', category: 'business', plan: 'negocio',
    icon: 'Users', dataDriven: true,
    hint: 'Los integrantes marcados como públicos.',
    defaults: { eyebrow: 'EQUIPO', title: 'Quiénes te atienden', layout: 'cards', columns: 3 },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'cards', label: 'Tarjetas' }, { value: 'circles', label: 'Retratos circulares' }, { value: 'rows', label: 'Filas' }]),
      columnsControl(4),
    ],
  },

  gallery: {
    type: 'gallery', label: 'Galería', category: 'business', plan: 'negocio',
    icon: 'Images', dataDriven: true,
    hint: 'Las fotos que subiste a la galería.',
    defaults: { eyebrow: 'GALERÍA', title: 'Nuestro trabajo', layout: 'masonry', columns: 3 },
    controls: [
      ...headingControls,
      layoutControl([
        { value: 'masonry', label: 'Mosaico' }, { value: 'grid', label: 'Grilla pareja' },
        { value: 'carousel', label: 'Carrusel' }, { value: 'strip', label: 'Cinta horizontal' },
      ]),
      columnsControl(5),
    ],
  },

  branches: {
    type: 'branches', label: 'Sucursales', category: 'business', plan: 'negocio',
    icon: 'Building2', dataDriven: true,
    hint: 'Tus locales, cada uno con su botón de reserva.',
    defaults: { eyebrow: 'SUCURSALES', title: 'Dónde encontrarnos', layout: 'cards', columns: 2 },
    controls: [...headingControls, columnsControl(3)],
  },

  // ─────────── Marketing ───────────
  features: {
    type: 'features', label: 'Beneficios', category: 'marketing', plan: 'gratis',
    icon: 'Sparkles',
    hint: 'Grilla de puntos fuertes, con ícono, título y texto.',
    defaults: {
      eyebrow: 'POR QUÉ NOSOTROS', title: 'Lo que nos distingue', columns: 3, layout: 'cards',
      items: [
        { id: 'f1', icon: 'Sparkles', title: 'Atención personalizada', text: 'Nos tomamos el tiempo que cada cliente necesita.' },
        { id: 'f2', icon: 'Clock',    title: 'Puntualidad',            text: 'Respetamos tu horario. Sin esperas.' },
        { id: 'f3', icon: 'Award',    title: 'Productos premium',      text: 'Trabajamos solo con primeras marcas.' },
      ],
    },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'cards', label: 'Tarjetas' }, { value: 'plain', label: 'Sin recuadro' }, { value: 'rows', label: 'Filas' }]),
      columnsControl(4),
      { k: 'items', key: 'items', label: 'Beneficios', addLabel: 'Agregar beneficio', titleKey: 'title', fields: [
        { k: 'text', key: 'icon', label: 'Ícono', placeholder: 'Sparkles, Clock, Award…' },
        ...itemTextFields,
      ]},
    ],
  },

  stats: {
    type: 'stats', label: 'Números', category: 'marketing', plan: 'pro',
    icon: 'TrendingUp',
    hint: 'Cifras destacadas: años, clientes, servicios.',
    defaults: {
      title: 'En números', columns: 4, layout: 'plain',
      items: [
        { id: 's1', value: '8',    suffix: '',   title: 'Años de experiencia' },
        { id: 's2', value: '2.400', suffix: '+', title: 'Clientes atendidos' },
        { id: 's3', value: '4.9',  suffix: '',   title: 'Calificación promedio' },
        { id: 's4', value: '12',   suffix: '',   title: 'Servicios disponibles' },
      ],
    },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'plain', label: 'Sin recuadro' }, { value: 'cards', label: 'Tarjetas' }, { value: 'band', label: 'Franja' }]),
      columnsControl(4),
      { k: 'items', key: 'items', label: 'Números', addLabel: 'Agregar número', titleKey: 'title', fields: [
        { k: 'text', key: 'prefix', label: 'Prefijo' },
        { k: 'text', key: 'value',  label: 'Número' },
        { k: 'text', key: 'suffix', label: 'Sufijo' },
        { k: 'text', key: 'title',  label: 'Etiqueta' },
      ]},
      { k: 'note', text: 'Usá cifras que puedas respaldar — aparecen en tu página pública.' },
    ],
  },

  steps: {
    type: 'steps', label: 'Pasos', category: 'marketing', plan: 'pro',
    icon: 'ListOrdered',
    hint: 'Cómo funciona, en pasos numerados.',
    defaults: {
      eyebrow: 'CÓMO FUNCIONA', title: 'Reservar es simple', layout: 'horizontal',
      items: [
        { id: 'p1', title: 'Elegí el servicio', text: 'Mirá la lista y el precio.' },
        { id: 'p2', title: 'Elegí día y hora',  text: 'Solo ves los horarios libres.' },
        { id: 'p3', title: 'Listo',             text: 'Te llega la confirmación al instante.' },
      ],
    },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }, { value: 'timeline', label: 'Línea de tiempo' }]),
      { k: 'items', key: 'items', label: 'Pasos', addLabel: 'Agregar paso', titleKey: 'title', fields: itemTextFields },
    ],
  },

  testimonials: {
    type: 'testimonials', label: 'Testimonios', category: 'marketing', plan: 'pro',
    icon: 'Quote',
    hint: 'Citas que escribís vos. Distinto de Reseñas, que sale del panel.',
    defaults: {
      eyebrow: 'TESTIMONIOS', title: 'Lo que nos cuentan', columns: 3, layout: 'cards',
      items: [{ id: 't1', text: 'Escribí acá el comentario de un cliente.', author: 'Nombre', role: 'Cliente', stars: 5 }],
    },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'cards', label: 'Tarjetas' }, { value: 'big', label: 'Una grande' }, { value: 'marquee', label: 'Cinta en movimiento' }]),
      columnsControl(3),
      { k: 'items', key: 'items', label: 'Testimonios', addLabel: 'Agregar testimonio', titleKey: 'author', fields: [
        { k: 'textarea', key: 'text',   label: 'Comentario', rows: 3 },
        { k: 'text',     key: 'author', label: 'Nombre' },
        { k: 'text',     key: 'role',   label: 'Referencia', placeholder: 'Cliente desde 2022' },
        { k: 'number',   key: 'stars',  label: 'Estrellas', min: 0, max: 5 },
        { k: 'image',    key: 'image',  label: 'Foto' },
      ]},
      { k: 'note', text: 'Publicá solo comentarios reales, con permiso de la persona.' },
    ],
  },

  pricing: {
    type: 'pricing', label: 'Paquetes', category: 'marketing', plan: 'pro',
    icon: 'Tags',
    hint: 'Planes o combos con su lista de beneficios.',
    defaults: {
      eyebrow: 'PAQUETES', title: 'Elegí tu combo', columns: 3,
      items: [
        { id: 'pk1', title: 'Básico',  price: '$900',  text: 'Lo esencial.',        features: ['Servicio principal', 'Duración 45 min'] },
        { id: 'pk2', title: 'Completo', price: '$1.500', text: 'El más elegido.',   features: ['Servicio principal', 'Extra incluido', 'Duración 90 min'], highlight: true },
        { id: 'pk3', title: 'Premium', price: '$2.400', text: 'La experiencia entera.', features: ['Todo lo anterior', 'Producto de regalo'] },
      ],
    },
    controls: [
      ...headingControls,
      columnsControl(4),
      { k: 'items', key: 'items', label: 'Paquetes', addLabel: 'Agregar paquete', titleKey: 'title', fields: [
        { k: 'text',     key: 'title',     label: 'Nombre' },
        { k: 'text',     key: 'price',     label: 'Precio' },
        { k: 'text',     key: 'badge',     label: 'Etiqueta', placeholder: 'Más elegido' },
        { k: 'textarea', key: 'text',      label: 'Descripción', rows: 2 },
        { k: 'toggle',   key: 'highlight', label: 'Destacar' },
      ]},
      { k: 'note', text: 'Los beneficios de cada paquete se editan como texto, uno por línea, dentro del paquete.' },
    ],
  },

  logos: {
    type: 'logos', label: 'Marcas', category: 'marketing', plan: 'negocio',
    icon: 'Boxes',
    hint: 'Logos de las marcas con las que trabajás.',
    defaults: { title: 'Trabajamos con', layout: 'marquee', items: [] },
    controls: [
      ...headingControls,
      layoutControl([{ value: 'marquee', label: 'Cinta en movimiento' }, { value: 'grid', label: 'Grilla' }]),
      { k: 'items', key: 'items', label: 'Marcas', addLabel: 'Agregar marca', titleKey: 'title', fields: [
        { k: 'text',  key: 'title', label: 'Nombre' },
        { k: 'image', key: 'image', label: 'Logo' },
        { k: 'text',  key: 'href',  label: 'Enlace' },
      ]},
    ],
  },

  countdown: {
    type: 'countdown', label: 'Cuenta regresiva', category: 'marketing', plan: 'negocio',
    icon: 'Timer',
    hint: 'Un contador hacia una fecha: promo, apertura, evento.',
    defaults: { title: 'La promo termina en', ctaLabel: 'Aprovechar', ctaAction: 'reserve' },
    defaultStyle: { bgKind: 'contrast' },
    controls: [
      ...headingControls,
      { k: 'text', key: 'target', label: 'Fecha límite', placeholder: '2026-12-31T23:59' },
      { k: 'cta',  label: 'Botón', actionKey: 'ctaAction', labelKey: 'ctaLabel', hrefKey: 'ctaHref' },
    ],
  },

  cta: {
    type: 'cta', label: 'Llamada a la acción', category: 'marketing', plan: 'gratis',
    icon: 'MousePointerClick',
    hint: 'Un cierre fuerte con uno o dos botones.',
    defaults: {
      title: '¿Listo para reservar?', subtitle: 'Elegí el horario que te quede cómodo.',
      ctaLabel: 'Reservar turno', ctaAction: 'reserve',
      secondaryLabel: 'Escribinos', secondaryAction: 'whatsapp',
      variant: 'centered',
    },
    controls: [
      ...headingControls,
      { k: 'cta',    label: 'Botón principal',  actionKey: 'ctaAction',       labelKey: 'ctaLabel',       hrefKey: 'ctaHref' },
      { k: 'cta',    label: 'Botón secundario', actionKey: 'secondaryAction', labelKey: 'secondaryLabel', hrefKey: 'secondaryHref' },
      { k: 'select', key: 'variant', label: 'Estilo', options: [
        { value: 'centered', label: 'Centrado' }, { value: 'card', label: 'Tarjeta' }, { value: 'band', label: 'Franja a todo ancho' },
      ]},
    ],
  },
};

export const BLOCK_LIST = Object.values(BLOCK_DEFS);

export const CATEGORY_LABELS: Record<BlockDef['category'], string> = {
  layout:    'Estructura',
  content:   'Contenido',
  business:  'Tu negocio',
  marketing: 'Marketing',
};

export const PLAN_RANK: Record<PlanKey, number> = { gratis: 0, pro: 1, negocio: 2 };
export const PLAN_LABEL: Record<PlanKey, string> = { gratis: 'Gratis', pro: 'Pro', negocio: 'Negocio' };

export const blockAllowed = (type: BlockType, plan: PlanKey): boolean =>
  PLAN_RANK[BLOCK_DEFS[type]?.plan ?? 'gratis'] <= PLAN_RANK[plan];
