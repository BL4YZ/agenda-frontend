import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Integraciones — Novu' };

const INTEGRATIONS = [
  {
    name: 'MercadoPago',
    status: 'Disponible',
    desc: 'Cobrá señas o pagos completos al momento de la reserva. Soporta tarjetas, débito y saldo MP.',
    tag: 'Pagos',
  },
  {
    name: 'Email (Resend)',
    status: 'Disponible',
    desc: 'Recordatorios automáticos y confirmaciones de turno enviados al cliente y al profesional.',
    tag: 'Notificaciones',
  },
  {
    name: 'Google Calendar',
    status: 'Próximamente',
    desc: 'Sincronizá tus citas de Novu con tu calendario de Google automáticamente.',
    tag: 'Calendario',
  },
  {
    name: 'WhatsApp',
    status: 'Próximamente',
    desc: 'Recordatorios y confirmaciones enviados directamente al WhatsApp de tus clientes.',
    tag: 'Notificaciones',
  },
  {
    name: 'Instagram',
    status: 'Próximamente',
    desc: 'Botón de reserva directa desde tu perfil de Instagram.',
    tag: 'Redes sociales',
  },
  {
    name: 'API pública',
    status: 'Próximamente',
    desc: 'Integrá Novu con tus propias herramientas y flujos de trabajo mediante nuestra API REST.',
    tag: 'Desarrolladores',
  },
];

const TAG_COLORS: Record<string, string> = {
  'Pagos':          'rgba(167,139,250,.15)',
  'Notificaciones': 'rgba(96,165,250,.15)',
  'Calendario':     'rgba(52,211,153,.15)',
  'Redes sociales': 'rgba(251,191,36,.15)',
  'Desarrolladores':'rgba(192,132,252,.15)',
};

export default function IntegracionesPage() {
  return (
    <LegalLayout title="Integraciones" lastUpdated="Mayo 2026">
      <div className="legal-highlight">
        Conectá Novu con las herramientas que ya usás en tu negocio.
      </div>
      <div className="legal-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {INTEGRATIONS.map(int => (
            <div key={int.name} style={{ padding: '20px', borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-0)', margin: 0 }}>{int.name}</p>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0,
                  background: int.status === 'Disponible' ? 'rgba(52,211,153,.15)' : 'rgba(255,255,255,.06)',
                  color: int.status === 'Disponible' ? '#34d399' : 'var(--fg-3)',
                }}>
                  {int.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: 0, lineHeight: 1.6 }}>{int.desc}</p>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, width: 'fit-content',
                background: TAG_COLORS[int.tag] ?? 'rgba(255,255,255,.06)', color: 'var(--fg-2)',
              }}>
                {int.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="legal-section">
        <h2>¿Querés sugerir una integración?</h2>
        <p>Escribinos a <strong>hola@novu.uy</strong> contándonos con qué herramientas trabajás y lo evaluamos para una próxima versión.</p>
      </div>
    </LegalLayout>
  );
}
