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
  brand: 'Personalizá la página pública de reservas con tu propio logo y color de marca. Tus clientes verán tu identidad, no la nuestra.',
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
      { label: 'Marca propia (logo y color)',           available: false, tooltip: TOOLTIPS.brand },
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
      { label: 'Múltiples sucursales',                  available: false },
      { label: 'Marca propia (logo y color)',           available: false, tooltip: TOOLTIPS.brand },
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
      { label: 'Múltiples sucursales',                  available: true  },
      { label: 'Marca propia (logo y color)',           available: true,  tooltip: TOOLTIPS.brand },
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
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Sin permanencia. Mantenés acceso hasta el fin del período pagado.',
  },
  {
    q: '¿Funciona para cualquier tipo de negocio?',
    a: 'Sí. Al registrarte elegís tu tipo de negocio y el sistema activa automáticamente las funciones más relevantes. Podés ajustar todo desde Configuración.',
  },
];
