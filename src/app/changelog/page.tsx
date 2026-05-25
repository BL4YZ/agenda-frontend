import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Cambios — Novu' };

const ENTRIES = [
  {
    version: 'v2.0',
    date: 'Mayo 2026',
    tag: 'Nuevo',
    tagColor: '#34d399',
    items: [
      'Editor de página pública reorganizado en 10 pestañas: Identidad, Diseño, Contacto, Horarios, FAQs, Productos, Reseñas, Galería, Equipo y Sucursales.',
      'Sección "Sobre nosotros" activable/desactivable desde el editor.',
      'Nuevo campo de Facebook en redes sociales — se muestra en el footer de tu página pública.',
      'Selector de tipografía mejorado: previsualización de cada fuente con muestra real.',
      'Diseño de paleta de temas renovado con previsualización en miniatura.',
      'Indicador de estado en tiempo real (Abierto / Cerrado) en el hero de la página pública, calculado con el timezone del visitante.',
      'Aviso en el editor de horarios cuando aún no se han guardado los datos por primera vez.',
      'Sección de fondo de la página pública simplificada: color sólido en lugar de degradado animado.',
    ],
  },
  {
    version: 'v1.9',
    date: 'Mayo 2026',
    tag: 'Mejora',
    tagColor: '#60a5fa',
    items: [
      'Calendario del dashboard con drag & drop — mové citas arrastrándolas directamente.',
      'Tarjetas de métricas clickeables: accedé a la vista filtrada de citas con un click.',
      'Páginas informativas del footer: Características, Integraciones, Centro de ayuda, Blog y Estado del sistema.',
      'Fecha de renovación o vencimiento de suscripción visible en la página de Planes.',
      'Modo claro mejorado en la página de Planes: contraste y legibilidad corregidos.',
    ],
  },
  {
    version: 'v1.8',
    date: 'Mayo 2026',
    tag: 'Nuevo',
    tagColor: '#34d399',
    items: [
      'Wizard de onboarding rediseñado — configurá tu negocio en 6 pasos guiados.',
      'Historial de pagos de comisiones con filtros por período y empleado.',
      'Exportación de métricas a CSV compatible con Excel.',
      'Cashflow: nueva vista de ingresos vs. gastos por día/semana/mes.',
      'Paginación en la lista de citas de métricas.',
    ],
  },
  {
    version: 'v1.7',
    date: 'Abril 2026',
    tag: 'Mejora',
    tagColor: '#60a5fa',
    items: [
      'Calendario de reservas cambiado a vista mensual.',
      'Modo claro mejorado en toda la app: contraste en tarjetas de planes, toggles y chips.',
      'Fecha de renovación de suscripción visible en la página de Planes.',
      'Gastos: corrección de fecha "Invalid Date" y desplegable de categorías.',
    ],
  },
  {
    version: 'v1.6',
    date: 'Marzo 2026',
    tag: 'Nuevo',
    tagColor: '#34d399',
    items: [
      'Módulo de finanzas: gastos, comisiones y métricas.',
      'Página pública de reservas con 5 temas personalizables.',
      'Galería de fotos y sección de equipo en la página pública.',
      'Sucursales: soporte para múltiples locales.',
    ],
  },
  {
    version: 'v1.5',
    date: 'Febrero 2026',
    tag: 'Mejora',
    tagColor: '#60a5fa',
    items: [
      'Pagos con MercadoPago: señas y cobro completo.',
      'Recordatorios automáticos por email.',
      'Modalidades de compensación del equipo (empleado, comisión, alquiler, mixto).',
    ],
  },
  {
    version: 'v1.0',
    date: 'Enero 2026',
    tag: 'Lanzamiento',
    tagColor: '#a78bfa',
    items: [
      'Lanzamiento público de Novu.',
      'Agenda, servicios, equipo y horarios.',
      'Planes Gratis, Pro y Negocio.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <LegalLayout title="Cambios" lastUpdated="21 de mayo de 2026">
      <div className="legal-highlight">
        Todas las novedades, mejoras y correcciones de Novu, ordenadas por versión.
      </div>
      {ENTRIES.map(entry => (
        <div key={entry.version} className="legal-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>{entry.version}</h2>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: `${entry.tagColor}22`, color: entry.tagColor }}>
              {entry.tag}
            </span>
            <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{entry.date}</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entry.items.map((item, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </LegalLayout>
  );
}
