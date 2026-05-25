import type { Shop } from '@/types/public';

interface Props {
  shop: Pick<Shop, 'name' | 'lede' | 'about_quote' | 'about_image_url' | 'about_hidden'>;
}

export default function PLAbout({ shop }: Props) {
  if (shop.about_hidden) return null;

  const quote = shop.about_quote ||
    (shop.lede
      ? `"${shop.lede.slice(0, 80)}${shop.lede.length > 80 ? '…' : ''}"`
      : `"Más que un servicio — una experiencia que <em>recordarás</em>."`);

  return (
    <section className="pl-section" id="sobre" aria-label="Sobre nosotros">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">SOBRE NOSOTROS</span>
        </div>
        <div className="pl-about">
          <div
            className="pl-about__photo"
            role="img"
            aria-label={`Foto de ${shop.name}`}
            style={shop.about_image_url
              ? { backgroundImage: `url(${shop.about_image_url})` }
              : { background: 'linear-gradient(135deg, oklch(0.5 0.18 290 / 0.7), oklch(0.3 0.1 280 / 0.5))' }
            }
          >
            {!shop.about_image_url && (
              <div style={{
                position: 'absolute', inset: '50%', display: 'grid', placeItems: 'center',
                fontFamily: 'var(--pl-font-display)', fontStyle: 'italic', fontSize: 120,
                color: 'var(--pl-accent)', opacity: 0.3, transform: 'translate(-50%,-50%)',
              }}>
                {shop.name[0]}
              </div>
            )}
          </div>
          <div className="pl-about__text">
            <p
              className="pl-about__quote"
              dangerouslySetInnerHTML={{ __html: quote }}
            />
            {shop.lede && <p className="pl-about__body">{shop.lede}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
