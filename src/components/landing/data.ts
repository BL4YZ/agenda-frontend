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
  reminders: 'Al reservar, tu cliente recibe un email con los datos de la cita y un link para cancelarla. Dos horas antes le llega un recordatorio.',
  bizType: 'Configurás tu tipo de negocio (barbería, peluquería, spa, consultorio, fitness u otro) y el panel muestra primero lo que más vas a usar. Lo podés cambiar cuando quieras desde Configuración.',
  modalities: 'Asignás a cada integrante su forma de cobro: porcentaje sobre lo que factura, alquiler fijo de silla, o una combinación mixta. Al cierre del período, Novu calcula cuánto le toca a cada uno.',
  expenses: 'Registrá alquiler, insumos, servicios e impuestos por categoría. Comparalos con tus ingresos para ver el flujo real de caja de tu negocio.',
  commissions: 'Vista consolidada de cuánto le corresponde cobrar a cada integrante en el período, basada en su modalidad y la facturación generada.',
  teamReports: 'Rendimiento detallado de cada profesional: cantidad de citas atendidas, ingresos generados, ticket promedio y monto a pagar.',
  logo: 'Tu logo aparece en la barra superior de tu página pública. Desde el plan Pro.',
  colors: 'Elegir a mano el fondo, el texto, el acento y las líneas, en vez de usar una de las paletas prearmadas. Las 10 paletas y las 15 tipografías están en todos los planes.',
  builder: 'Un editor visual: arrastrás secciones, elegís paleta y tipografía, y ves el resultado en vivo en escritorio, tablet y celular. Los cambios quedan en borrador hasta que publicás, así que podés probar sin que tus clientes vean nada.',
  blocks: 'Portada, servicios, horarios, ubicación, contacto, redes, texto, imagen, imagen + texto, beneficios, llamada a la acción, bloque de reserva, separadores y barra de anuncio.',
  blocksPro: 'Suma tienda, reseñas, preguntas frecuentes, video, números destacados, pasos, testimonios y paquetes.',
  blocksNeg: 'Suma equipo, galería, sucursales, marcas y cuenta regresiva.',
  content: 'Los datos que cargás en el panel (servicios, horarios, reseñas, fotos, equipo) se muestran solos dentro de las secciones que elijas: se actualizan sin volver a tocar la página.',
};

export const PLANS: Plan[] = [
  {
    name: 'Gratis',
    price: '$0',
    desc: 'Para quien trabaja solo y quiere empezar a tomar reservas online.',
    highlight: false,
    cta: 'Empezar gratis',
    features: [
      { label: '1 profesional incluido',               available: true  },
      { label: 'Hasta 50 citas por mes',               available: true  },
      { label: 'Calendario completo',                   available: true  },
      { label: 'Reservas online 24/7',                  available: true  },
      { label: 'Link personalizado de reservas',        available: true  },
      { label: 'Gestión de servicios y horarios',       available: true  },
      { label: 'Confirmación y recordatorio por email', available: true,  tooltip: TOOLTIPS.reminders },
      { label: 'Sincronización con Google Calendar',    available: true  },
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
    desc: 'Para equipos de hasta 5 personas que quieren cobrar online.',
    highlight: true,
    cta: 'Iniciar prueba de 14 días',
    features: [
      { label: 'Hasta 5 profesionales',                 available: true  },
      { label: 'Citas ilimitadas',                      available: true  },
      { label: 'Calendario completo',                   available: true  },
      { label: 'Reservas online 24/7',                  available: true  },
      { label: 'Link personalizado de reservas',        available: true  },
      { label: 'Gestión de servicios y horarios',       available: true  },
      { label: 'Confirmación y recordatorio por email', available: true,  tooltip: TOOLTIPS.reminders },
      { label: 'Sincronización con Google Calendar',    available: true  },
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
    desc: 'Para equipos grandes o negocios con más de una sucursal.',
    highlight: false,
    cta: 'Contactar',
    features: [
      { label: 'Profesionales ilimitados',              available: true  },
      { label: 'Citas ilimitadas',                      available: true  },
      { label: 'Calendario completo',                   available: true  },
      { label: 'Reservas online 24/7',                  available: true  },
      { label: 'Link personalizado de reservas',        available: true  },
      { label: 'Gestión de servicios y horarios',       available: true  },
      { label: 'Confirmación y recordatorio por email', available: true,  tooltip: TOOLTIPS.reminders },
      { label: 'Sincronización con Google Calendar',    available: true  },
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
    a: 'No. El plan Gratis no pide tarjeta y no vence. Si querés probar Pro, la prueba de 14 días se activa con tu cuenta de MercadoPago: no se cobra nada durante la prueba y podés cancelarla antes de que termine.',
  },
  {
    q: '¿Mis clientes tienen que descargar una app?',
    a: 'No. Reservan desde el navegador del celular o la computadora, entrando a tu link. No necesitan crear una cuenta.',
  },
  {
    q: '¿Cómo cobro las reservas?',
    a: 'Desde el plan Pro conectás tu cuenta de MercadoPago y elegís si pedir una seña o el pago completo al reservar. El dinero entra directo a tu cuenta. Novu no cobra comisión por cada pago; solo aplican las tarifas habituales de MercadoPago.',
  },
  {
    q: '¿Mis clientes reciben recordatorios?',
    a: 'Sí, en todos los planes. Al reservar reciben un email de confirmación con un link para cancelar, y dos horas antes de la cita, un recordatorio.',
  },
  {
    q: '¿Puedo ver las citas en Google Calendar?',
    a: 'Sí. Conectás tu cuenta de Google desde Integraciones y cada reserva nueva aparece también en tu Google Calendar.',
  },
  {
    q: '¿Sirve si trabajo con un equipo?',
    a: 'Sí. Pro incluye hasta 5 profesionales y Negocio no tiene límite. Cada uno tiene su agenda, sus horarios y sus servicios, y tus clientes eligen con quién atenderse.',
  },
  {
    q: '¿Puedo calcular lo que le corresponde a cada profesional?',
    a: 'Sí, desde el plan Pro. A cada integrante le asignás cómo cobra: un porcentaje de lo que factura, un alquiler fijo de silla o una combinación de los dos. Al cierre del período, Novu calcula cuánto le toca a cada uno.',
  },
  {
    q: '¿Puedo registrar los gastos del negocio?',
    a: 'Sí, desde el plan Pro. Anotás alquiler, insumos, servicios e impuestos por categoría y los ves al lado de tus ingresos.',
  },
  {
    q: '¿Puedo armar la página web de mi negocio?',
    a: 'Sí, en todos los planes. Con el editor sumás y ordenás secciones (portada, servicios, galería, reseñas, video, preguntas frecuentes y más), elegís entre 10 paletas y 15 tipografías, y ves cómo queda en computadora, tablet y celular.',
  },
  {
    q: '¿Tengo que cargar la información dos veces?',
    a: 'No. Las secciones de servicios, horarios, equipo, reseñas y galería muestran lo que ya cargaste en el panel. Si cambiás un precio o agregás un servicio, la página se actualiza sola.',
  },
  {
    q: '¿Qué pasa con mi página mientras la edito?',
    a: 'Tus clientes siguen viendo la versión publicada. Los cambios quedan en un borrador hasta que tocás Publicar, y si después querés volver a la versión anterior, lo hacés con un botón.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. No hay permanencia. Si cancelás, seguís usando tu plan hasta que termine el período que ya pagaste.',
  },
  {
    q: '¿Funciona para mi tipo de negocio?',
    a: 'Novu está pensado para negocios que trabajan con turnos: barberías, peluquerías, estéticas, spas, consultorios, entrenadores y similares. Al registrarte elegís tu rubro y el panel se adapta a eso.',
  },
];
