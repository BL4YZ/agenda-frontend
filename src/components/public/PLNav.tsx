'use client';

import { useState, useEffect } from 'react';
import type { Shop } from '@/types/public';

const CalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export interface NavSection {
  href: string;
  label: string;
}

interface Props {
  shop: Pick<Shop, 'name' | 'slug' | 'logo_url'>;
  sections: NavSection[];
  onReserve: () => void;
}

export default function PLNav({ shop, sections, onReserve }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  const handleLinkClick = () => setMenuOpen(false);

  const handleReserve = () => {
    setMenuOpen(false);
    onReserve();
  };

  return (
    <>
      <nav className="pl-nav" role="navigation" aria-label="Navegación principal">
        <a className="pl-nav__brand" href={`/public/${shop.slug}`} aria-label={`Inicio de ${shop.name}`}>
          <div className="pl-nav__brand-mark">
            {shop.logo_url
              ? <img src={shop.logo_url} alt={shop.name} />
              : shop.name[0]}
          </div>
          <span>{shop.name}</span>
        </a>
        {sections.length > 0 && (
          <div className="pl-nav__links" role="list">
            {sections.map(({ href, label }) => (
              <a key={href} className="pl-nav__link" href={href} role="listitem">{label}</a>
            ))}
          </div>
        )}
        <button className="pl-nav__cta" onClick={onReserve} aria-label="Abrir formulario de reserva">
          <CalIcon /> Reservar turno
        </button>
        {sections.length > 0 && (
          <button
            className="pl-nav__hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div className="pl-nav__backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div className="pl-nav__mobile-menu" role="dialog" aria-label="Menú de navegación">
            {sections.map(({ href, label }) => (
              <a
                key={href}
                className="pl-nav__mobile-link"
                href={href}
                onClick={handleLinkClick}
              >
                {label}
              </a>
            ))}
            <button className="pl-nav__mobile-cta" onClick={handleReserve}>
              <CalIcon /> Reservar turno
            </button>
          </div>
        </>
      )}
    </>
  );
}
