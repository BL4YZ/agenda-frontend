import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Reservas online — Novu' };

export default function ReservasPage() {
  return (
    <LegalLayout title="Tu agenda nunca duerme." lastUpdated="">
      <div className="legal-highlight">
        Tus clientes pueden reservar a cualquier hora del día, sin llamarte, sin mandarte un mensaje. Vos te despertás con todo confirmado.
      </div>

      <div className="legal-section">
        <h2>Cómo funciona</h2>
        <p>Cada negocio en Novu tiene su propia página pública con URL única. Desde ahí, el cliente elige el servicio que quiere, el profesional de su preferencia y el horario disponible. En segundos, la reserva queda confirmada para los dos.</p>
        <p>Vos no intervenís en ningún momento. El sistema valida la disponibilidad en tiempo real y bloquea ese horario automáticamente.</p>
      </div>

      <div className="legal-section">
        <h2>Confirmaciones automáticas</h2>
        <p>Cuando se confirma una reserva, el cliente recibe un email de confirmación al instante con todos los detalles: fecha, hora, servicio y nombre del profesional. No hay lugar para confusiones ni malentendidos.</p>
      </div>

      <div className="legal-section">
        <h2>Disponible las 24 horas</h2>
        <p>Tu agenda no tiene horario de atención. Un cliente que recuerda a medianoche que necesita turno puede reservar en ese momento. Sin esperar al lunes, sin depender de que respondas el WhatsApp.</p>
        <p>Esto no solo es más cómodo para el cliente — también te trae reservas que de otra forma perdías.</p>
      </div>

      <div className="legal-section">
        <h2>Control total desde el dashboard</h2>
        <p>Todas las reservas aparecen en tu calendario en tiempo real. Podés ver el día, la semana o el mes de un vistazo. También podés crear citas manualmente, reprogramar o cancelar con un click.</p>
        <p>Si tenés equipo, cada profesional tiene su propia agenda y solo ve sus propias citas.</p>
      </div>

      <div className="legal-section">
        <h2>Sin errores de doble reserva</h2>
        <p>El sistema nunca permite que dos clientes reserven el mismo horario para el mismo profesional. Cuando un horario se ocupa, desaparece automáticamente de la página pública.</p>
      </div>
    </LegalLayout>
  );
}
