'use client';

import type { Shop, Branch } from '@/types/public';

const PinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <path d="M12 21s-7-7.5-7-12a7 7 0 0114 0c0 4.5-7 12-7 12z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'slug'>;
  branches: Branch[];
  onReserve: (branchId: number) => void;
}

export default function PLBranches({ branches, onReserve }: Props) {
  if (branches.length === 0) return null;

  return (
    <section className="pl-section" id="sucursales" aria-label="Sucursales">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">· SUCURSALES</span>
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
                <div className="pl-branch-card__header">
                  <div className="pl-branch-card__pin" aria-hidden="true">
                    <PinIcon />
                  </div>
                  <span className="pl-branch-card__num">0{i + 1}</span>
                </div>
                <div className="pl-branch-card__body">
                  <h3 className="pl-branch-card__name">{branch.name}</h3>
                  {branch.address && (
                    <p className="pl-branch-card__address">{branch.address}</p>
                  )}
                </div>
                <div className="pl-branch-card__foot">
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pl-branch-card__maps"
                    >
                      Ver en Maps <ArrowIcon />
                    </a>
                  ) : <span />}
                  <button
                    className="pl-btn pl-btn--primary pl-branch-card__cta"
                    onClick={() => onReserve(branch.id)}
                  >
                    <CalIcon /> Reservar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
