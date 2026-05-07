import type { Shop } from '@/types/public';

const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'name' | 'slug' | 'logo_url'>;
  onReserve: () => void;
}

export default function PLNav({ shop, onReserve }: Props) {
  return (
    <nav className="pl-nav" role="navigation" aria-label="Navegación principal">
      <a className="pl-nav__brand" href={`/public/${shop.slug}`} aria-label={`Inicio de ${shop.name}`}>
        <div className="pl-nav__brand-mark">
          {shop.logo_url
            ? <img src={shop.logo_url} alt={shop.name} />
            : shop.name[0]}
        </div>
        <span>{shop.name}</span>
      </a>
      <div className="pl-nav__links" role="list">
        {[
          { href: '#servicios', label: 'Servicios' },
          { href: '#tienda',    label: 'Tienda' },
          { href: '#equipo',    label: 'Equipo' },
          { href: '#reviews',   label: 'Reseñas' },
          { href: '#contacto',  label: 'Contacto' },
        ].map(({ href, label }) => (
          <a key={href} className="pl-nav__link" href={href} role="listitem">{label}</a>
        ))}
      </div>
      <button className="pl-nav__cta" onClick={onReserve} aria-label="Abrir formulario de reserva">
        <CalIcon /> Reservar turno
      </button>
    </nav>
  );
}
