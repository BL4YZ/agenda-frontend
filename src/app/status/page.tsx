import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Estado del sistema — Novu' };

/**
 * Manually maintained status page.
 *
 * ⚠️ There is no uptime monitor behind this. An earlier version printed per-service
 * uptime percentages and a "última verificación" stamp built from `new Date()` at
 * render time — both read as live measurements and neither was one. Until a real
 * probe exists, this page states only what someone on the team can actually
 * confirm, and says plainly that it is updated by hand.
 *
 * To report an incident: set the component's `status`, fill `note`, move
 * `UPDATED_AT` to today, and add an entry to `INCIDENTS`.
 */

type Status = 'Operacional' | 'Degradado' | 'Incidente parcial' | 'No operacional';

/** Bump this whenever anything below changes. Format: YYYY-MM-DD. */
const UPDATED_AT = '2026-09-22';

const SERVICES: { name: string; status: Status; note?: string }[] = [
  { name: 'Aplicación web',           status: 'Operacional' },
  { name: 'API',                      status: 'Operacional' },
  { name: 'Reservas online',          status: 'Operacional' },
  { name: 'Pagos (MercadoPago)',      status: 'Operacional' },
  { name: 'Notificaciones por email', status: 'Operacional' },
  { name: 'Carga de imágenes',        status: 'Operacional' },
  { name: 'Editor de páginas',        status: 'Operacional' },
];

const INCIDENTS: { date: string; title: string; detail: string }[] = [];

const STATUS_DOT: Record<Status, string> = {
  'Operacional':       '#34d399',
  'Degradado':         '#fbbf24',
  'Incidente parcial': '#fb923c',
  'No operacional':    '#f87171',
};

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' });

export default function StatusPage() {
  const allOk = SERVICES.every(s => s.status === 'Operacional');

  return (
    <LegalLayout title="Estado del sistema" lastUpdated={formatDate(UPDATED_AT)}>
      {/* Overall status banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, marginBottom: 24,
        background: allOk ? 'rgba(52,211,153,.08)' : 'rgba(251,191,36,.08)',
        border: `1px solid ${allOk ? 'rgba(52,211,153,.25)' : 'rgba(251,191,36,.25)'}`,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: allOk ? '#34d399' : '#fbbf24', flexShrink: 0, display: 'inline-block' }} />
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: allOk ? '#34d399' : '#fbbf24', margin: '0 0 2px' }}>
            {allOk ? 'Sin incidentes conocidos' : 'Hay un servicio con problemas'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>
            Actualizado el {formatDate(UPDATED_AT)} por el equipo de Novu
          </p>
        </div>
      </div>

      <div className="legal-section">
        <h2>Servicios</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {SERVICES.map(service => (
            <div key={service.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[service.status], flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{service.name}</span>
                {service.note && <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>— {service.note}</span>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_DOT[service.status], whiteSpace: 'nowrap' }}>
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="legal-section">
        <h2>Historial de incidentes</h2>
        {INCIDENTS.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>
            No registramos ningún incidente todavía. Cuando haya uno, lo publicamos acá con la fecha
            y qué pasó.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {INCIDENTS.map(i => (
              <div key={i.date + i.title}>
                <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '0 0 2px' }}>{formatDate(i.date)}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', margin: '0 0 4px' }}>{i.title}</p>
                <p style={{ fontSize: 13, color: 'var(--fg-2)', margin: 0 }}>{i.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="legal-section">
        <h2>Cómo se arma esta página</h2>
        <p>
          Todavía no tenemos un monitor automático publicando acá: esta página la mantiene el equipo
          a mano y la actualizamos cuando detectamos o resolvemos un problema. Si algo no te funciona
          y acá figura todo en verde, escribinos igual — probablemente no nos enteramos.
        </p>
      </div>

      <div className="legal-section">
        <h2>Reportar un problema</h2>
        <p>Si experimentás algún inconveniente, escribinos a <strong>hola@novu.uy</strong> o contactanos por nuestros canales de soporte.</p>
      </div>
    </LegalLayout>
  );
}
