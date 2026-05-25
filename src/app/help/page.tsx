import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Centro de ayuda — Novu' };

const FAQS = [
  {
    section: 'Cuenta y registro',
    items: [
      { q: '¿Cómo creo una cuenta?', a: 'Hacé clic en "Registrarse" en la página de inicio, completá tu nombre, email y contraseña. Después verificá tu email para activar la cuenta.' },
      { q: '¿Puedo cambiar mi contraseña?', a: 'Sí, desde la página de inicio de sesión hacé clic en "¿Olvidaste tu contraseña?" para recibir un link de recuperación por email.' },
      { q: '¿Puedo tener múltiples negocios?', a: 'Actualmente cada cuenta está asociada a un negocio. Si necesitás gestionar múltiples negocios, creá una cuenta por cada uno.' },
    ],
  },
  {
    section: 'Planes y facturación',
    items: [
      { q: '¿Qué incluye el plan Gratis?', a: 'El plan Gratis incluye 1 profesional, hasta 50 citas por mes, reservas online, recordatorios por email y página pública con servicios y contacto.' },
      { q: '¿Cómo funciona el período de prueba?', a: 'El plan Pro incluye 14 días de prueba gratuita. No se cobra nada hasta que termine el período de prueba.' },
      { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Si cancelás, tu plan sigue activo hasta el fin del período ya pagado. Después pasás automáticamente al plan Gratis.' },
      { q: '¿Los pagos son seguros?', a: 'Todos los pagos se procesan a través de MercadoPago. Novu no almacena datos de tarjetas de crédito.' },
    ],
  },
  {
    section: 'Agenda y citas',
    items: [
      { q: '¿Cómo agrega una cita un cliente?', a: 'Desde tu página pública (novu.app/tu-negocio), el cliente elige servicio, profesional, fecha y horario. Recibe una confirmación por email.' },
      { q: '¿Puedo bloquear horarios?', a: 'Sí, desde el calendario podés crear bloqueos para horarios en que no estás disponible (vacaciones, descanso, etc.).' },
      { q: '¿Cómo configuro mis horarios de atención?', a: 'En Agenda → Horarios podés definir qué días y en qué rango horario atendés, por cada integrante del equipo.' },
    ],
  },
  {
    section: 'Página pública',
    items: [
      { q: '¿Cómo personalizo mi página pública?', a: 'En Configuración → Negocio podés editar el nombre, logo, color de marca y elegir el tema visual de tu página.' },
      { q: '¿Puedo agregar reseñas de clientes?', a: 'Sí, en la sección Página pública podés agregar testimonios de clientes que se muestran en tu página.' },
      { q: '¿Qué es la sección FAQ de mi página?', a: 'Podés agregar preguntas y respuestas frecuentes sobre tu negocio para que tus clientes las vean antes de reservar.' },
    ],
  },
];

export default function HelpPage() {
  return (
    <LegalLayout title="Centro de ayuda" lastUpdated="Mayo 2026">
      <div className="legal-highlight">
        Encontrá respuestas a las preguntas más frecuentes sobre Novu. Si no encontrás lo que buscás, escribinos a <strong>hola@novu.app</strong>.
      </div>
      {FAQS.map(section => (
        <div key={section.section} className="legal-section">
          <h2>{section.section}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            {section.items.map((item, i) => (
              <div key={i}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-0)', margin: '0 0 4px' }}>{item.q}</p>
                <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0, lineHeight: 1.7 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="legal-section">
        <h2>¿Necesitás más ayuda?</h2>
        <p>Escribinos a <strong>hola@novu.app</strong> y te respondemos a la brevedad.</p>
      </div>
    </LegalLayout>
  );
}
