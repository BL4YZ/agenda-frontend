import type { Shop, Branch } from '@/types/public';

const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M12 21s-7-7-7-12a7 7 0 0114 0c0 5-7 12-7 12z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'slug'>;
  branches: Branch[];
}

export default function PLBranches({ shop, branches }: Props) {
  if (branches.length === 0) return null;

  return (
    <section className="pl-section" id="sucursales" aria-label="Sucursales">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">SUCURSALES</span>
          <h2 className="pl-h2"><em>Nuestras</em> ubicaciones</h2>
          {branches.length > 1 && (
            <p className="pl-section__sub">Elegí la sucursal más cercana para reservar tu turno.</p>
          )}
        </div>
        <div className="pl-branches">
          {branches.map((branch, i) => {
            const mapsUrl = branch.address
              ? `https://maps.google.com/?q=${encodeURIComponent(branch.address)}`
              : null;
            return (
              <div key={branch.id} className="pl-branch-card">
                <div className="pl-branch-card__num">0{i + 1}</div>
                <div className="pl-branch-card__body">
                  <h3 className="pl-branch-card__name">{branch.name}</h3>
                  {branch.address && (
                    <p className="pl-branch-card__address">
                      <PinIcon /> {branch.address}
                    </p>
                  )}
                </div>
                <div className="pl-branch-card__foot">
                  {mapsUrl && (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="pl-branch-card__maps">
                      Ver en Maps <ArrowIcon />
                    </a>
                  )}
                  <a href={`/public/${shop.slug}/book?branch=${branch.id}`} className="pl-btn pl-btn--primary pl-branch-card__cta">
                    Reservar acá
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
