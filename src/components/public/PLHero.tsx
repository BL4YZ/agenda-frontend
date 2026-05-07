import type { Shop } from '@/types/public';

const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'name' | 'slug' | 'tagline' | 'eyebrow' | 'lede' | 'phone' | 'rating' | 'review_count' | 'cover_url'>;
  onReserve: () => void;
}

export default function PLHero({ shop, onReserve }: Props) {
  const titleWords = shop.tagline ? shop.tagline.split(' ') : [shop.name];
  const titleHead = titleWords.slice(0, -1).join(' ');
  const titleTail = titleWords.slice(-1)[0];

  return (
    <section className="pl-hero" aria-label="Portada">
      <div className="pl-container">
        <div className="pl-hero__inner">

          {/* Left: text */}
          <div className="pl-hero__text">
            {shop.eyebrow && (
              <div className="pl-hero__badge">
                <span className="pl-hero__badge-dot" aria-hidden="true"/>
                {shop.eyebrow}
              </div>
            )}
            <h1 className="pl-hero__title">
              {titleHead && <>{titleHead} </>}
              <em>{titleTail}</em>
            </h1>
            {shop.lede && <p className="pl-hero__lede">{shop.lede}</p>}
            <div className="pl-hero__ctas">
              <button className="pl-btn pl-btn--primary" onClick={onReserve} aria-label="Reservar turno online">
                <CalIcon /> Reservar online
              </button>
              {shop.phone && (
                <a className="pl-btn" href={`tel:${shop.phone}`} aria-label={`Llamar al ${shop.phone}`}>
                  <PhoneIcon /> Llamar
                </a>
              )}
            </div>
            <div className="pl-hero__meta" aria-label="Estadísticas del negocio">
              {shop.rating && (
                <div className="pl-hero__meta-item">
                  <span className="pl-hero__meta-label">Rating</span>
                  <span className="pl-hero__meta-val" aria-label={`${shop.rating} de 5 estrellas`}>
                    ★ {shop.rating}{' '}
                    {shop.review_count && (
                      <span style={{ color: 'var(--pl-fg-mute)', fontSize: '13px', fontWeight: 400 }}>
                        · {shop.review_count} reseñas
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="pl-hero__meta-item">
                <span className="pl-hero__meta-label">Estado</span>
                <span className="pl-hero__meta-val pl-hero__meta-val--green" aria-label="Abierto ahora">● Abierto</span>
              </div>
            </div>
          </div>

          {/* Right: visual */}
          <div className="pl-hero__visual" aria-hidden="true">
            <div
              className="pl-hero__photo"
              style={shop.cover_url
                ? { backgroundImage: `url(${shop.cover_url})` }
                : { background: 'linear-gradient(135deg, oklch(0.4 0.15 290), oklch(0.25 0.1 280))' }
              }
            />
            <div className="pl-hero__photo-overlay"/>
            <div className="pl-hero__chip pl-hero__chip--a">
              <span className="pl-hero__chip-dot"/> Disponible hoy
            </div>
            <div className="pl-hero__chip pl-hero__chip--b">
              {shop.rating ? `★ ${shop.rating}` : '★ Excelente'}
            </div>
            <div className="pl-hero__visual-card">
              <div className="pl-hero__visual-card-icon"><CalIcon /></div>
              <div className="pl-hero__visual-card-text">
                <div className="pl-hero__visual-card-title">Reservá en 3 clics</div>
                <div className="pl-hero__visual-card-sub">Confirmación inmediata · Sin llamadas</div>
              </div>
              <ArrowIcon />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
