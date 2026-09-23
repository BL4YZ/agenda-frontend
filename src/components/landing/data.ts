/* Real data for the landing page */

export interface PlanFeature {
  label: string;
  available: boolean;
  tooltip?: string;
}

export interface Plan {
  name: string;
  price: string;
  desc: string;
  highlight: boolean;
  cta: string;
  features: PlanFeature[];
}

const TOOLTIPS = {
  bizType: 'Configurás tu tipo de negocio (barbería, peluquería, spa, consultorio, fitness u otro) y el sistema activa automáticamente las funciones más relevantes para vos. Podés ajustarlo cuando quieras desde Configuración.',
  modalities: 'Asignás a cada integrante su forma de cobro: porcentaje sobre lo que factura, alquiler fijo de silla, o una combinación mixta. El sistema calcula automáticamente el pago de cada uno al cierre del período.',
  expenses: 'Registrá alquiler, insumos, servicios e impuestos por categoría. Comparalos con tus ingresos para ver el flujo real de caja de tu negocio.',
  commissions: 'Vista consolidada de cuánto le corresponde cobrar a cada integrante en el período, basada en su modalidad y la facturación generada.',
  teamReports: 'Rendimiento detallado de cada profesional: cantidad de citas atendidas, ingresos generados, ticket promedio y monto a pagar.',
  logo: 'Tu logo aparece en la barra superior de tu página pública. Desde el plan Pro.',
  colors: 'Elegir a mano el fondo, el texto, el acento y las líneas, en vez de usar una de las paletas prearmadas. Las 10 paletas y las 15 tipografías están en todos los planes.',
  builder: 'Un editor visual: arrastrás secciones, elegís paleta y tipografía, y ves el resultado en vivo en escritorio, tablet y celular. Guarda solo mientras no publiques, así podés probar sin que tus clientes vean nada.',
  blocks: 'Portada, servicios, horarios, ubicación, contacto, redes, texto, imagen, imagen + texto, beneficios, llamada a la acción, bloque de reserva, separadores y barra de anuncio.',
  blocksPro: 'Suma tienda, reseñas, preguntas frecuentes, video, números destacados, pasos, testimonios y paquetes.',
  blocksNeg: 'Suma equipo, galería, sucursales, marcas y cuenta regresiva.',
  content: 'Los datos que cargás en el panel (servicios, horarios, reseñas, fotos, equipo) se muestran solos dentro de las secciones que elijas: se actualizan sin volver a tocar la página.',
};

export const PLANS: Plan[] = [
  {
    name: 'Gratis',
    price: '$0',
    desc: 'Para empezar, 100% gratis.',
    highlight: false,
    cta: 'Empezar gratis',
    features: [
      { label: '1 profesional incluido',               available: true  },
      { label: 'Hasta 50 citas por mes',               available: true  },
      { label: 'Calendario completo',                   available: true  },
      { label: 'Reservas online 24/7',                  available: true  },
      { label: 'Link personalizado de reservas',        available: true  },
      { label: 'Gestión de servicios y horarios',       available: true  },
      { label: 'Personalización por tipo de negocio',   available: true,  tooltip: TOOLTIPS.bizType },
      { label: 'Editor visual de tu página',            available: true,  tooltip: TOOLTIPS.builder },
      { label: '16 secciones para armarla',             available: true,  tooltip: TOOLTIPS.blocks },
      { label: '10 paletas y 15 tipografías',           available: true  },
      { label: 'Secciones que se llenan solas',         available: true,  tooltip: TOOLTIPS.content },
      { label: 'Citas ilimitadas',                      available: false },
      { label: 'Cobro de señas con MercadoPago',        available: false },
      { label: 'Pago completo en reserva',              available: false },
      { label: 'Métricas e ingresos en tiempo real',    available: false },
      { label: 'Modalidades de compensación al equipo', available: false, tooltip: TOOLTIPS.modalities },
      { label: 'Registro de gastos del negocio',        available: false, tooltip: TOOLTIPS.expenses },
      { label: 'Resumen de comisiones',                 available: false, tooltip: TOOLTIPS.commissions },
      { label: 'Reportes por integrante',               available: false, tooltip: TOOLTIPS.teamReports },
      { label: 'Exportación CSV',                       available: false },
      { label: 'Soporte prioritario',                   available: false },
      { label: 'Múltiples sucursales',                  available: false },
      { label: 'Tu logo en la página',                  available: false, tooltip: TOOLTIPS.logo },
      { label: 'Colores elegidos a mano',               available: false, tooltip: TOOLTIPS.colors },
      { label: 'Exportación Excel y PDF',               available: false },
    ],
  },
  {
    name: 'Pro',
    price: '$490',
    desc: 'Para negocios que quieren crecer.',
    highlight: true,
    cta: 'Iniciar prueba de 14 días',
    features: [
      { label: 'Hasta 5 profesionales',                 available: true  },
      { label: 'Citas ilimitadas',                      available: true  },
      { label: 'Calendario completo',                   available: true  },
      { label: 'Reservas online 24/7',                  available: true  },
      { label: 'Link personalizado de reservas',        available: true  },
      { label: 'Gestión de servicios y horarios',       available: true  },
      { label: 'Personalización por tipo de negocio',   available: true,  tooltip: TOOLTIPS.bizType },
      { label: 'Cobro de señas con MercadoPago',        available: true  },
      { label: 'Pago completo en reserva',              available: true  },
      { label: 'Métricas e ingresos en tiempo real',    available: true  },
      { label: 'Modalidades de compensación al equipo', available: true,  tooltip: TOOLTIPS.modalities },
      { label: 'Registro de gastos del negocio',        available: true,  tooltip: TOOLTIPS.expenses },
      { label: 'Resumen de comisiones',                 available: true,  tooltip: TOOLTIPS.commissions },
      { label: 'Reportes por integrante',               available: true,  tooltip: TOOLTIPS.teamReports },
      { label: 'Exportación CSV',                       available: true  },
      { label: 'Soporte prioritario',                   available: true  },
      { label: 'Editor visual de tu página',            available: true,  tooltip: TOOLTIPS.builder },
      { label: '24 secciones para armarla',             available: true,  tooltip: TOOLTIPS.blocksPro },
      { label: '10 paletas y 15 tipografías',           available: true  },
      { label: 'Secciones que se llenan solas',         available: true,  tooltip: TOOLTIPS.content },
      { label: 'Múltiples sucursales',                  available: false },
      { label: 'Tu logo en la página',                  available: true,  tooltip: TOOLTIPS.logo },
      { label: 'Colores elegidos a mano',               available: false, tooltip: TOOLTIPS.colors },
      { label: 'Exportación Excel y PDF',               available: false },
    ],
  },
  {
    name: 'Negocio',
    price: '$990',
    desc: 'Para operaciones de mayor escala.',
    highlight: false,
    cta: 'Contactar',
    features: [
      { label: 'Profesionales ilimitados',              available: true  },
      { label: 'Citas ilimitadas',                      available: true  },
      { label: 'Calendario completo',                   available: true  },
      { label: 'Reservas online 24/7',                  available: true  },
      { label: 'Link personalizado de reservas',        available: true  },
      { label: 'Gestión de servicios y horarios',       available: true  },
      { label: 'Personalización por tipo de negocio',   available: true,  tooltip: TOOLTIPS.bizType },
      { label: 'Cobro de señas con MercadoPago',        available: true  },
      { label: 'Pago completo en reserva',              available: true  },
      { label: 'Métricas e ingresos en tiempo real',    available: true  },
      { label: 'Modalidades de compensación al equipo', available: true,  tooltip: TOOLTIPS.modalities },
      { label: 'Registro de gastos del negocio',        available: true,  tooltip: TOOLTIPS.expenses },
      { label: 'Resumen de comisiones',                 available: true,  tooltip: TOOLTIPS.commissions },
      { label: 'Reportes por integrante',               available: true,  tooltip: TOOLTIPS.teamReports },
      { label: 'Exportación CSV',                       available: true  },
      { label: 'Soporte prioritario',                   available: true  },
      { label: 'Editor visual de tu página',            available: true,  tooltip: TOOLTIPS.builder },
      { label: 'Las 29 secciones disponibles',          available: true,  tooltip: TOOLTIPS.blocksNeg },
      { label: '10 paletas y 15 tipografías',           available: true  },
      { label: 'Secciones que se llenan solas',         available: true,  tooltip: TOOLTIPS.content },
      { label: 'Múltiples sucursales',                  available: true  },
      { label: 'Tu logo en la página',                  available: true,  tooltip: TOOLTIPS.logo },
      { label: 'Colores elegidos a mano',               available: true,  tooltip: TOOLTIPS.colors },
      { label: 'Exportación Excel y PDF',               available: true  },
      { label: 'Atención personalizada',                available: true  },
    ],
  },
];

export interface FaqEntry {
  q: string;
  a: string;
}

export const FAQS: FaqEntry[] = [
  {
    q: '¿Necesito tarjeta de crédito para empezar?',
    a: 'No para el plan Gratis — creás tu cuenta y empezás de inmediato. Para el plan Pro, la prueba de 14 días se activa desde tu cuenta de MercadoPago: no te cobramos durante el período de prueba y podés cancelar antes de que finalice.',
  },
  {
    q: '¿Mis clientes necesitan instalar algo?',
    a: 'No. Reservan desde el navegador, en cualquier dispositivo. Sin descargas.',
  },
  {
    q: '¿Cómo funcionan los pagos?',
    a: 'Conectás MercadoPago en 2 minutos. Podés cobrar una seña o el total al reservar. El dinero va directo a tu cuenta, sin comisiones adicionales de nuestra parte.',
  },
  {
    q: '¿Puedo gestionar las comisiones de mi equipo?',
    a: 'Sí. Con el plan Pro podés asignar modalidades a cada integrante: comisión por porcentaje, alquiler de silla, o una combinación mixta. El sistema calcula automáticamente cuánto le corresponde a cada uno al cierre del período.',
  },
  {
    q: '¿Qué pasa si tengo varios empleados?',
    a: 'Pro permite hasta 5 colaboradores; Negocio ilimitados. Cada uno con su agenda, horarios, servicios y modalidad de cobro propios.',
  },
  {
    q: '¿Puedo registrar los gastos del negocio?',
    a: 'Sí. Desde el plan Pro podés registrar gastos por categoría (alquiler, insumos, servicios, impuestos) y ver el flujo real de tu negocio junto a los ingresos.',
  },
  {
    q: '¿Puedo armar mi propia página web?',
    a: 'Sí. Novu incluye un editor visual: agregás y ordenás secciones (portada, servicios, galería, reseñas, video, preguntas frecuentes y más), elegís entre 10 paletas y 15 tipografías, y ves el resultado en vivo en escritorio, tablet y celular. Todo se guarda como borrador: tus clientes ven los cambios recién cuando tocás Publicar.',
  },
  {
    q: '¿Tengo que cargar el contenido dos veces?',
    a: 'No. Las secciones de servicios, horarios, equipo, reseñas y galería leen lo que ya tenés cargado en el panel. Si cambiás un precio o agregás un servicio, la página se actualiza sola.',
  },
  {
    q: '¿Qué pasa con mi página actual mientras diseño la nueva?',
    a: 'Sigue online sin cambios. El editor trabaja sobre un borrador aparte y recién la reemplaza cuando publicás. Si después querés volver atrás, un botón devuelve la página anterior sin borrar lo que armaste.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin permanencia. Mantenés acceso hasta el fin del período pagado.',
  },
  {
    q: '¿Funciona para cualquier tipo de negocio?',
    a: 'Sí. Al registrarte elegís tu tipo de negocio y el sistema activa automáticamente las funciones más relevantes. Podés ajustar todo desde Configuración.',
  },
];
