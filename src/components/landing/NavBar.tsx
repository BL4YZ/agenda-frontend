'use client';

import Link from 'next/link';
import { RefObject } from 'react';
import MiAgendaLogo from './MiAgendaLogo';
import ThemeToggle from './ThemeToggle';

interface NavBarProps {
  rootRef: RefObject<HTMLDivElement | null>;
}

const NAV_LINKS = [
  { label: 'Producto',  id: 'producto' },
  { label: 'Precios',   id: 'precios' },
  { label: 'FAQ',       id: 'faq' },
];

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function NavBar({ rootRef }: NavBarProps) {
  return (
    <nav className="vc-nav">
      <MiAgendaLogo size={32} />
      <div className="vc-nav-pill glass">
        {NAV_LINKS.map(({ label, id }) => (
          <a
            key={id}
            onClick={(e) => { e.preventDefault(); scrollTo(id); }}
            href={`#${id}`}
          >
            {label}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <ThemeToggle rootRef={rootRef} />
        <Link href="/login" className="vc-nav-entrar" style={{ fontSize: 13, color: 'var(--fg-2)', padding: '8px 12px' }}>
          Entrar
        </Link>
        <Link href="/register" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
          Empezar →
        </Link>
      </div>
    </nav>
  );
}
