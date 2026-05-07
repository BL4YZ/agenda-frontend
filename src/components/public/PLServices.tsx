import type { Shop, Service } from '@/types/public';

const ArrIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 6l6 6-6 6"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'slug'>;
  services: Service[];
  onReserve: (serviceId: number) => void;
}

export default function PLServices({ shop, services, onReserve }: Props) {
  if (services.length === 0) return null;

  return (
    <section className="pl-section" id="servicios" aria-label="Servicios">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">SERVICIOS</span>
          <h2 className="pl-h2">Lo que <em>ofrecemos</em></h2>
          <p className="pl-sub">Cada servicio incluye una experiencia completa. Reservá el que necesites con un par de clics.</p>
        </div>
        <div className="pl-services" role="list">
          {services.map(s => (
            <button
              key={s.id}
              className="pl-service"
              role="listitem"
              onClick={() => onReserve(s.id)}
              aria-label={`Reservar ${s.name} — ${s.duration_minutes} minutos, $${s.price > 0 ? s.price.toLocaleString('es-UY') : 'consultar'}`}
            >
              <div className="pl-service__photo pl-service__photo--ph" aria-hidden="true">
                {s.image_url
                  ? <img src={s.image_url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : s.name.charAt(0).toUpperCase()}
              </div>
              <div className="pl-service__info">
                <span className="pl-service__name">{s.name}</span>
                {s.description && <span className="pl-service__desc">{s.description}</span>}
                <div className="pl-service__meta">
                  <span>⏱ {s.duration_minutes} MIN</span>
                  <span><strong>{s.price > 0 ? `$${s.price.toLocaleString('es-UY')}` : 'CONSULTAR'}</strong></span>
                </div>
              </div>
              <div className="pl-service__btn" aria-hidden="true"><ArrIcon /></div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
