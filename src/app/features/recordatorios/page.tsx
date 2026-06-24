import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Recordatorios automáticos — Novu' };

export default function RecordatoriosPage() {
  return (
    <LegalLayout title="Adiós inasistencias." lastUpdated="">
      <div className="legal-highlight">
        La mayoría de las inasistencias no son mala voluntad — son olvidos. Novu envía recordatorios automáticos para que el cliente llegue y vos no pierdas ese tiempo.
      </div>

      <div className="legal-section">
        <h2>Cómo funciona</h2>
        <p>Cada vez que se confirma una reserva, el cliente recibe dos emails automáticos:</p>
        <ul>
          <li><strong>Al reservar:</strong> confirmación inmediata con fecha, hora, servicio y nombre del profesional.</li>
          <li><strong>2 horas antes:</strong> recordatorio de que tiene turno pronto.</li>
        </ul>
        <p>Novu los envía solo. Vos no tenés que hacer nada.</p>
      </div>

      <div className="legal-section">
        <h2>Menos tiempo perdido</h2>
        <p>Un turno que no se presenta es un hueco en tu agenda que no podés rellenar. Con recordatorios automáticos, los clientes llegan más puntuales y las cancelaciones de último momento se reducen notablemente.</p>
      </div>

      <div className="legal-section">
        <h2>Para el cliente y para vos</h2>
        <p>El cliente recibe los emails con el nombre de tu negocio. Parece que vos mismo los enviaste. Para vos, es una menos en la lista de cosas a recordar cada día.</p>
      </div>

      <div className="legal-section">
        <h2>Funciona con cualquier plan</h2>
        <p>Los recordatorios automáticos están disponibles desde el plan gratis. No necesitás configurar nada — en cuanto activás tu cuenta, empiezan a funcionar solos.</p>
      </div>
    </LegalLayout>
  );
}
