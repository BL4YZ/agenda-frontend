import type { Shop, BusinessHour } from '@/types/public';

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'name' | 'address' | 'phone' | 'lat' | 'lng'>;
  hours: BusinessHour[];
}

function MapEmbed({ shop }: { shop: Props['shop'] }) {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const mapsUrl = shop.lat && shop.lng
    ? `https://maps.google.com/?q=${shop.lat},${shop.lng}`
    : shop.address
      ? `https://maps.google.com/?q=${encodeURIComponent(shop.address)}`
      : null;

  if (mapsKey && (shop.lat && shop.lng)) {
    return (
      <iframe
        title={`Mapa de ${shop.name}`}
        src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${shop.lat},${shop.lng}&zoom=15`}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  if (mapsKey && shop.address) {
    return (
      <iframe
        title={`Mapa de ${shop.name}`}
        src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(shop.address)}&zoom=15`}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  // Fallback: styled placeholder + "Cómo llegar" link
  return (
    <div className="pl-map__placeholder" aria-label={`Mapa de ubicación — ${shop.address ?? shop.name}`}>
      <svg width="100%" height="100%" viewBox="0 0 400 380" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, opacity: 0.55 }} aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 22} y1="0" x2={i * 22} y2="380" stroke="oklch(0.6 0.08 290 / 0.15)" strokeWidth="1"/>
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 22} x2="400" y2={i * 22} stroke="oklch(0.6 0.08 290 / 0.15)" strokeWidth="1"/>
        ))}
        <path d="M50 100 Q150 150 200 180 T380 240" stroke="oklch(0.7 0.15 290 / 0.5)" strokeWidth="3" fill="none"/>
        <path d="M0 220 Q120 180 220 200 T400 160" stroke="oklch(0.7 0.15 290 / 0.4)" strokeWidth="2" fill="none"/>
      </svg>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
          background: 'linear-gradient(135deg, var(--pl-accent), var(--pl-accent-2))',
          boxShadow: '0 0 40px var(--pl-accent)', display: 'grid', placeItems: 'center',
          border: '3px solid var(--pl-glass-strong)',
        }}>
          <span style={{ transform: 'rotate(45deg)', color: 'white', fontFamily: 'var(--pl-font-display)', fontWeight: 700, fontSize: 22 }}>
            {shop.name[0]}
          </span>
        </div>
        <div style={{
          padding: '7px 14px', background: 'var(--pl-glass-strong)', border: '1px solid var(--pl-glass-border)',
          borderRadius: 999, backdropFilter: 'blur(16px)', fontSize: 12, fontWeight: 500,
        }}>
          {shop.name}
        </div>
      </div>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          style={{
            position: 'absolute', bottom: 18, right: 18, padding: '8px 14px', borderRadius: 999,
            background: 'var(--pl-glass-strong)', border: '1px solid var(--pl-glass-border)',
            color: 'var(--pl-fg)', fontSize: 12, textDecoration: 'none', backdropFilter: 'blur(16px)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
          Cómo llegar <ArrowIcon />
        </a>
      )}
    </div>
  );
}

export default function PLLocation({ shop, hours }: Props) {
  const mapsUrl = shop.address
    ? `https://maps.google.com/?q=${encodeURIComponent(shop.address)}`
    : null;

  return (
    <section className="pl-section" id="contacto" aria-label="Ubicación y contacto">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">UBICACIÓN & CONTACTO</span>
          <h2 className="pl-h2"><em>Encontranos</em> acá</h2>
        </div>
        <div className="pl-location">
          <div className="pl-location__info">
            {shop.address && (
              <div className="pl-location__row">
                <div className="pl-location__row-icon"><PinIcon /></div>
                <div>
                  <div className="pl-location__row-title">DIRECCIÓN</div>
                  <div className="pl-location__row-val">{shop.address}</div>
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="pl-location__row-sub"
                      style={{ color: 'var(--pl-accent)', textDecoration: 'none' }}>
                      Ver en Google Maps →
                    </a>
                  )}
                </div>
              </div>
            )}
            {shop.phone && (
              <div className="pl-location__row">
                <div className="pl-location__row-icon"><PhoneIcon /></div>
                <div>
                  <div className="pl-location__row-title">CONTACTO</div>
                  <div className="pl-location__row-val">{shop.phone}</div>
                  <div className="pl-location__row-sub">Llamadas y WhatsApp</div>
                </div>
              </div>
            )}
            {hours.length > 0 && (
              <div className="pl-location__row">
                <div className="pl-location__row-icon"><ClockIcon /></div>
                <div style={{ flex: 1 }}>
                  <div className="pl-location__row-title">HORARIOS</div>
                  <div className="pl-hours" style={{ marginTop: 8 }} aria-label="Horarios de atención">
                    {hours.map((h, i) => (
                      <div
                        key={i}
                        className={`pl-hours__row${h.is_today ? ' is-today' : ''}${h.is_closed ? ' is-closed' : ''}`}
                      >
                        <span className="pl-hours__day">{h.day_label}</span>
                        <span className="pl-hours__val">
                          {h.is_closed
                            ? 'Cerrado'
                            : `${h.open_time} – ${h.close_time}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pl-map">
            <MapEmbed shop={shop} />
          </div>
        </div>
      </div>
    </section>
  );
}
