import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Pagos online — Novu' };

export default function PagosPage() {
  return (
    <LegalLayout title="Cobrar antes de empezar." lastUpdated="">
      <div className="legal-highlight">
        Conectá MercadoPago y empezá a cobrar en el momento de la reserva — antes de que el cliente llegue. Sin cancelaciones de último momento, sin cuentas pendientes.
      </div>

      <div className="legal-section">
        <h2>Cómo funciona</h2>
        <p>Cuando el cliente reserva desde tu página pública, Novu le muestra la pantalla de pago de MercadoPago. El cliente paga con tarjeta, dinero en cuenta o cualquier método disponible en MercadoPago. Una vez confirmado el pago, la reserva queda asentada.</p>
        <p>El dinero va directo a tu cuenta de MercadoPago, sin pasar por Novu.</p>
      </div>

      <div className="legal-section">
        <h2>Dos formas de cobrar</h2>
        <ul>
          <li><strong>Seña (depósito parcial):</strong> el cliente paga un porcentaje para confirmar el turno y el resto lo abona al llegar. Ideal si querés reducir cancelaciones sin exigir el total por adelantado.</li>
          <li><strong>Pago completo:</strong> el cliente paga el 100% al reservar. El turno queda confirmado y pagado en un solo paso.</li>
        </ul>
        <p>Vos elegís cuál usar para cada servicio, o podés dejar los turnos sin cobro online si preferís manejar los pagos de forma presencial.</p>
      </div>

      <div className="legal-section">
        <h2>Sin comisiones adicionales de Novu</h2>
        <p>Novu no cobra comisión sobre tus pagos. El único costo es la comisión estándar de MercadoPago, que es la misma que pagarías si cobrarás vos directamente con su sistema.</p>
      </div>

      <div className="legal-section">
        <h2>Pagos presenciales también</h2>
        <p>Si un cliente prefiere pagar en efectivo o por transferencia, podés registrar ese cobro manualmente desde el dashboard. Así llevás el control de todos los ingresos en un solo lugar, sea cual sea la forma de pago.</p>
      </div>

      <div className="legal-section">
        <h2>Todo el historial en un lugar</h2>
        <p>Desde el dashboard podés ver qué citas están pagas, cuáles tienen seña y cuáles siguen pendientes. También podés filtrar por período y ver el detalle de cada transacción.</p>
      </div>
    </LegalLayout>
  );
}
