'use client';

import '@/styles/system.css';
import '@/styles/auth.css';
import '@/styles/legal.css';

import Link from 'next/link';
import AuthBackdrop from '@/components/auth/AuthBackdrop';
import AuthLogo from '@/components/auth/AuthLogo';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="auth-shell">
      <AuthBackdrop />

      <header className="auth-nav">
        <AuthLogo />
        <Link className="auth-nav__back" href="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al inicio
        </Link>
      </header>

      <main className="legal-main">
        <div className="legal-card">
          <div className="auth-card__edge" aria-hidden="true" />
          <div className="legal-card__head">
            <p className="legal-card__date">Última actualización: {lastUpdated}</p>
            <h1 className="legal-card__title">{title}</h1>
          </div>
          <div className="legal-body">
            {children}
          </div>
        </div>

        <div className="auth-meta" style={{ justifyContent: 'center', marginBottom: 24 }}>
          <Link href="/terms">Términos</Link>
          <span>·</span>
          <Link href="/privacy">Privacidad</Link>
          <span>·</span>
          <Link href="/login">Iniciar sesión</Link>
        </div>
      </main>
    </div>
  );
}
