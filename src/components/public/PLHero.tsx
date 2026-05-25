'use client';

import { useState, useEffect } from 'react';
import type { Shop, BusinessHour } from '@/types/public';

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

function getOpenStatus(hours: BusinessHour[]): { open: boolean; label: string } | null {
  if (!hours.length) return null;
  const now = new Date();
  const today = hours.find(h => h.day_of_week === now.getDay());
  if (!today) return null;
  if (today.is_closed || !today.open_time || !today.close_time) {
    return { open: false, label: 'Cerrado hoy' };
  }
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open_time.split(':').map(Number);
  const [ch, cm] = today.close_time.split(':').map(Number);
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  if (cur < open)  return { open: false, label: `Abre a las ${today.open_time}` };
  if (cur >= close) return { open: false, label: `Cerró a las ${today.close_time}` };
  return { open: true, label: `Abierto · cierra ${today.close_time}` };
}

interface Props {
  shop: Pick<Shop, 'name' | 'slug' | 'tagline' | 'eyebrow' | 'lede' | 'phone' | 'rating' | 'review_count' | 'cover_url' | 'services' | 'hours'>;
  onReserve: () => void;
}

export default function PLHero({ shop, onReserve }: Props) {
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    setStatus(getOpenStatus(shop.hours));
  }, [shop.hours]);

  const titleWords = shop.tagline ? shop.tagline.split(' ') : [shop.name];
  const titleHead = titleWords.slice(0, -1).join(' ');
  const titleTail = titleWords.slice(-1)[0];

  return (
    <section className="pl-hero" aria-label="Portada">

      {/* Full-screen background */}
      <div
        className="pl-hero__bg"
        style={shop.cover_url ? { backgroundImage: `url(${shop.cover_url})` } : undefined}
        aria-hidden="true"
      />
      <div className="pl-hero__overlay" aria-hidden="true" />

      {/* Decorative floating chips */}
      {shop.rating && (
        <div className="pl-hero__chip pl-hero__chip--b" aria-hidden="true">
          <span className="pl-hero__chip-star">★</span>
          {shop.rating}
          {shop.review_count ? <span className="pl-hero__chip-mute"> · {shop.review_count}</span> : null}
        </div>
      )}
      {shop.services.length > 0 && (
        <div className="pl-hero__chip pl-hero__chip--c" aria-hidden="true">
          <span className="pl-hero__chip-dot" />
          {shop.services.length} servicios
        </div>
      )}

      {/* Main content — bottom-left */}
      <div className="pl-hero__content">
        <div className="pl-container">
          <div className="pl-hero__text">
            {shop.eyebrow && (
              <div className="pl-hero__badge">
                <span className="pl-hero__badge-dot" aria-hidden="true" />
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
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', fontWeight: 400 }}>
                        · {shop.review_count} reseñas
                      </span>
                    )}
                  </span>
                </div>
              )}
              {status && (
                <div className="pl-hero__meta-item">
                  <span className="pl-hero__meta-label">Estado</span>
                  <span
                    className={`pl-hero__meta-val${status.open ? ' pl-hero__meta-val--green' : ''}`}
                    style={status.open ? undefined : { color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}
                    aria-label={status.label}
                  >
                    {status.open ? '● ' : '○ '}{status.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
