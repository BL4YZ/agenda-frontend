import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Características — Novu' };

const FEATURES = [
  {
    category: 'Agenda y turnos',
    items: [
      { name: 'Calendario interactivo', desc: 'Vista semanal y mensual. Creá, editá y mové citas con drag & drop.' },
      { name: 'Reservas online 24/7', desc: 'Tus clientes reservan desde tu página pública sin necesidad de llamarte.' },
      { name: 'Recordatorios por email', desc: 'Recordatorios automáticos enviados al cliente y al profesional antes del turno.' },
      { name: 'Gestión de servicios', desc: 'Definí nombre, duración y precio para cada servicio que ofrecés.' },
    ],
  },
  {
    category: 'Equipo',
    items: [
      { name: 'Múltiples profesionales', desc: 'Agregá empleados y asignales servicios, horarios y permisos individuales.' },
      { name: 'Modalidades de compensación', desc: 'Sueldo fijo, comisión por cita, alquiler de silla o modalidad mixta.' },
      { name: 'Horarios por integrante', desc: 'Cada profesional tiene su propia grilla de disponibilidad.' },
      { name: 'Reportes del equipo', desc: 'Estadísticas de citas, ingresos y rendimiento por integrante.' },
    ],
  },
  {
    category: 'Cobros y finanzas',
    items: [
      { name: 'Pagos online con MercadoPago', desc: 'Cobrá señas o el total al momento de la reserva.' },
      { name: 'Efectivo y transferencia', desc: 'Habilitá métodos de pago offline para tus clientes.' },
      { name: 'Registro de gastos', desc: 'Llevá el control de los gastos del negocio por categoría.' },
      { name: 'Comisiones', desc: 'Calculá y registrá el historial de pagos de comisiones del equipo.' },
    ],
  },
  {
    category: 'Página pública',
    items: [
      { name: 'URL propia', desc: 'Cada negocio tiene su página en novu.app/tu-negocio lista para compartir.' },
      { name: 'Tienda de servicios', desc: 'Mostrá tus servicios con precios y duración para que el cliente elija.' },
      { name: 'Reseñas y FAQs', desc: 'Sumá testimonios y respondé las preguntas más frecuentes de tus clientes.' },
      { name: 'Marca propia', desc: 'Personalizá con tu logo y color de marca. Disponible en plan Negocio.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <LegalLayout title="Características" lastUpdated="Mayo 2026">
      <div className="legal-highlight">
        Todo lo que necesitás para gestionar tu negocio de principio a fin, en un solo lugar.
      </div>
      {FEATURES.map(section => (
        <div key={section.category} className="legal-section">
          <h2>{section.category}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginTop: 8 }}>
            {section.items.map(item => (
              <div key={item.name} style={{ padding: '16px', borderRadius: 12, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-0)', margin: '0 0 6px' }}>{item.name}</p>
                <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </LegalLayout>
  );
}
