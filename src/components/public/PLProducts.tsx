import type { Product } from '@/types/public';

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

interface Props {
  products: Product[];
}

export default function PLProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="pl-section" id="tienda" aria-label="Tienda">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">TIENDA</span>
          <h2 className="pl-h2">Llevate la <em>experiencia</em> a casa</h2>
          <p className="pl-sub">Productos que usamos en nuestros servicios. Retiro en local o consultá envíos.</p>
        </div>
        <div className="pl-products" role="list">
          {products.map(p => (
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
                <div className="pl-product__price-row">
                  <span className="pl-product__price">${p.price.toLocaleString('es-UY')}</span>
                  <button
                    className="pl-product__add"
                    aria-label={`Agregar ${p.name} al carrito`}
                  >
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
