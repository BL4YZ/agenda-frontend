'use client';

import Link from 'next/link';
import { RefObject } from 'react';
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
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <span style={{
          fontFamily: 'Inter Tight, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: 'var(--fg-0)',
        }}>NOV</span>
        <svg width="22" height="22" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <g transform="translate(15, 12)">
            <line x1="14" y1="0" x2="14" y2="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <line x1="56" y1="0" x2="56" y2="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M 0 8 L 0 54 Q 0 76 22 76 L 48 76 Q 70 76 70 54 L 70 8" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="22" x2="60" y2="22" stroke="currentColor" strokeWidth="3" opacity="0.55" />
            <circle cx="22" cy="38" r="3.5" fill="currentColor" opacity="0.55" />
            <circle cx="48" cy="38" r="3.5" fill="currentColor" opacity="0.55" />
            <circle cx="22" cy="54" r="3.5" fill="currentColor" opacity="0.35" />
            <circle cx="48" cy="54" r="4.5" fill="#e6c87a" />
          </g>
        </svg>
      </div>
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
