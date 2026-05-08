import type { Product, Shop } from '@/types/public';

const CartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61H19a2 2 0 001.95-1.57l1.54-7.42H6"/>
  </svg>
);

interface Props {
  products: Product[];
  shop: Pick<Shop, 'whatsapp' | 'phone' | 'name'>;
}

function getBuyAction(product: Product, shop: Props['shop']): { href: string; label: string } | null {
  const msg = encodeURIComponent(
    `Hola! Me interesa el producto *${product.name}*${product.price ? ` ($${product.price.toLocaleString('es-UY')})` : ''}. ¿Está disponible?`
  );
  if (shop.whatsapp) {
    const num = shop.whatsapp.replace(/\D/g, '');
    return { href: `https://wa.me/${num}?text=${msg}`, label: 'Comprar' };
  }
  if (shop.phone) {
    return { href: `tel:${shop.phone}`, label: 'Llamar' };
  }
  return null;
}

export default function PLProducts({ products, shop }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="pl-section" id="tienda" aria-label="Tienda">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">TIENDA</span>
          <h2 className="pl-h2">Llevate la <em>experiencia</em> a casa</h2>
          <p className="pl-sub">Productos que usamos en nuestros servicios. Retiro en local.</p>
        </div>
        <div className="pl-products" role="list">
          {products.map(p => {
            const action = getBuyAction(p, shop);
            return (
              <article key={p.id} className="pl-product" role="listitem">
                <div className="pl-product__photo" aria-hidden="true">
                  {p.badge && <span className="pl-product__badge">{p.badge}</span>}
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} />
                    : <span>{p.name.charAt(0).toUpperCase()}</span>}
                </div>
                <div className="pl-product__body">
                  {p.brand && <span className="pl-product__brand">{p.brand}</span>}
                  <span className="pl-product__name">{p.name}</span>
                  {p.description && <span className="pl-product__desc">{p.description}</span>}
                  <div className="pl-product__price-row">
                    <span className="pl-product__price">${p.price.toLocaleString('es-UY')}</span>
                    {action && (
                      <a
                        href={action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pl-product__buy"
                        aria-label={`${action.label} ${p.name}`}
                      >
                        <CartIcon /> {action.label}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
