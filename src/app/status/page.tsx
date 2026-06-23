import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Estado del sistema — Novu' };

const SERVICES = [
  { name: 'Aplicación web',          status: 'Operacional', uptime: '99.9%' },
  { name: 'API',                     status: 'Operacional', uptime: '99.8%' },
  { name: 'Reservas online',         status: 'Operacional', uptime: '99.9%' },
  { name: 'Pagos (MercadoPago)',      status: 'Operacional', uptime: '99.7%' },
  { name: 'Notificaciones por email', status: 'Operacional', uptime: '99.6%' },
  { name: 'Carga de imágenes',        status: 'Operacional', uptime: '99.8%' },
];

const STATUS_DOT: Record<string, string> = {
  'Operacional':         '#34d399',
  'Degradado':           '#fbbf24',
  'Incidente parcial':   '#fb923c',
  'No operacional':      '#f87171',
};

export default function StatusPage() {
  const allOk = SERVICES.every(s => s.status === 'Operacional');

  return (
    <LegalLayout title="Estado del sistema" lastUpdated={new Date().toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}>
      {/* Overall status banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, marginBottom: 24,
        background: allOk ? 'rgba(52,211,153,.08)' : 'rgba(251,191,36,.08)',
        border: `1px solid ${allOk ? 'rgba(52,211,153,.25)' : 'rgba(251,191,36,.25)'}`,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: allOk ? '#34d399' : '#fbbf24', flexShrink: 0, display: 'inline-block' }} />
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: allOk ? '#34d399' : '#fbbf24', margin: '0 0 2px' }}>
            {allOk ? 'Todos los sistemas operacionales' : 'Algunos sistemas degradados'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>
            Última verificación: {new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="legal-section">
        <h2>Servicios</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          {SERVICES.map(service => (
            <div key={service.name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 10, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[service.status] ?? '#fff', flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{service.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{service.uptime} uptime</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_DOT[service.status] ?? 'var(--fg-3)' }}>
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="legal-section">
        <h2>Historial de incidentes</h2>
        <p style={{ fontSize: 13, color: 'var(--fg-3)', fontStyle: 'italic' }}>
          No hubo incidentes en los últimos 90 días.
        </p>
      </div>

      <div className="legal-section">
        <h2>Reportar un problema</h2>
        <p>Si experimentás algún inconveniente, escribinos a <strong>soporte@novu.app</strong> o contactanos por nuestros canales de soporte.</p>
      </div>
    </LegalLayout>
  );
}
