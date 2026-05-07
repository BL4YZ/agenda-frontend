'use client';

import { useState } from 'react';

const PLACEHOLDER_ITEMS = [
  { lg: true, n: '01' }, { n: '02' }, { n: '03' },
  { n: '04' }, { n: '05' }, { n: '06' },
];

interface GalleryImage {
  url: string;
  alt?: string;
}

interface Props {
  images?: GalleryImage[];
}

export default function PLGallery({ images }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (images && images.length === 0) return null;

  const items = images ?? PLACEHOLDER_ITEMS.map((_, i) => ({ url: '', alt: `Foto ${i + 1}` }));

  return (
    <>
      <section className="pl-section pl-section--tight" aria-label="Galería">
        <div className="pl-container">
          <div className="pl-section__head">
            <span className="pl-eyebrow">PORTFOLIO</span>
            <h2 className="pl-h2">Trabajos <em>recientes</em></h2>
          </div>
          <div className="pl-gallery" role="list">
            {(images ? items : PLACEHOLDER_ITEMS).map((it, i) => {
              const hasImage = images && (it as GalleryImage).url;
              return (
                <div
                  key={i}
                  className={`pl-gallery__item${('lg' in it && (it as { lg?: boolean }).lg) ? ' pl-gallery__item--lg' : ''}`}
                  role="listitem"
                  onClick={() => hasImage && setLightbox((it as GalleryImage).url)}
                  style={hasImage ? { cursor: 'pointer' } : undefined}
                  tabIndex={hasImage ? 0 : undefined}
                  aria-label={hasImage ? `Ver foto ${i + 1}` : undefined}
                  onKeyDown={e => e.key === 'Enter' && hasImage && setLightbox((it as GalleryImage).url)}
                >
                  {hasImage
                    ? <img src={(it as GalleryImage).url} alt={(it as GalleryImage).alt ?? `Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    : <>
                        <div className="pl-gallery__item-ph" aria-hidden="true">{i + 1}</div>
                        <div className="pl-gallery__item-num" aria-hidden="true">FOTO {('n' in it ? (it as { n: string }).n : String(i + 1).padStart(2, '0'))}</div>
                      </>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'oklch(0.04 0 0 / 0.92)', backdropFilter: 'blur(16px)',
            display: 'grid', placeItems: 'center', cursor: 'zoom-out',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setLightbox(null)}
          onKeyDown={e => e.key === 'Escape' && setLightbox(null)}
        >
          <img
            src={lightbox} alt="Imagen ampliada"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain' }}
          />
        </div>
      )}
    </>
  );
}
