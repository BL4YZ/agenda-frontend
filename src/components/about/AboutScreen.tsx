'use client';

import '@/styles/system.css';
import '@/styles/auth.css';
import '@/styles/about.css';

import Link from 'next/link';
import AuthBackdrop from '@/components/auth/AuthBackdrop';
import AuthLogo from '@/components/auth/AuthLogo';

export default function AboutScreen() {
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

      <main className="about-main">

        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero__eyebrow">
            <span className="about-hero__dot" />
            Nuestra historia
          </div>
          <h1 className="about-hero__title">
            Construimos la agenda que<br />
            <em>los negocios merecen.</em>
          </h1>
          <p className="about-hero__sub">
            MiAgenda nació de una frustración simple: los profesionales y pequeños
            negocios perdían tiempo y clientes por no tener una herramienta de
            agendamiento moderna, simple y pensada para ellos.
          </p>
        </section>

        {/* Misión */}
        <div className="about-card">
          <div className="about-card__edge" aria-hidden="true" />
          <p className="about-card__label">Misión</p>
          <h2 className="about-card__title">Automatizar lo que roba tiempo, liberar lo que genera valor.</h2>
          <p className="about-card__body">
            Creemos que un peluquero debería dedicar su energía a cortar cabello, no a
            responder WhatsApps para confirmar turnos. Que una terapeuta debería enfocarse
            en sus pacientes, no en armar planillas de Excel. Que un estudio de yoga
            debería crecer por su comunidad, no por cuánto tiempo le dedica a la
            administración.
          </p>
          <p className="about-card__body" style={{ marginTop: 12 }}>
            MiAgenda automatiza la agenda, los recordatorios, los cobros y los reportes
            para que los profesionales puedan hacer lo que realmente saben hacer.
          </p>
        </div>

        {/* Stats */}
        <div className="about-stats">
          <div className="about-stat">
            <span className="about-stat__num">2026</span>
            <span className="about-stat__label">Año de fundación</span>
          </div>
          <div className="about-stat">
            <span className="about-stat__num">UY</span>
            <span className="about-stat__label">Sede en Uruguay</span>
          </div>
          <div className="about-stat">
            <span className="about-stat__num">∞</span>
            <span className="about-stat__label">Turnos por gestionar</span>
          </div>
        </div>

        {/* Valores */}
        <div style={{ width: '100%' }}>
          <p className="about-card__label" style={{ marginBottom: 16 }}>Valores</p>
          <div className="about-values">

            <div className="about-value">
              <div className="about-value__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <p className="about-value__name">Simplicidad ante todo</p>
              <p className="about-value__desc">
                Una herramienta que necesita capacitación no es una buena herramienta.
                Cada función existe para hacer la vida más fácil, no más compleja.
              </p>
            </div>

            <div className="about-value">
              <div className="about-value__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <p className="about-value__name">Confianza con los datos</p>
              <p className="about-value__desc">
                Los datos de tus clientes son tuyos. Nunca los vendemos ni los
                usamos para otro fin que no sea prestarte el servicio.
              </p>
            </div>

            <div className="about-value">
              <div className="about-value__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 5-5" />
                </svg>
              </div>
              <p className="about-value__name">Construido para el día a día</p>
              <p className="about-value__desc">
                No diseñamos para demos. Diseñamos para el lunes a las 8 AM cuando
                llegan tres turnos a la vez y hay que resolverlo rápido.
              </p>
            </div>

            <div className="about-value">
              <div className="about-value__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="about-value__name">Cerca del cliente</p>
              <p className="about-value__desc">
                Somos un equipo pequeño y accesible. Cuando escribís a soporte,
                te responde alguien que conoce el producto de punta a punta.
              </p>
            </div>

          </div>
        </div>

        {/* CTA */}
        <div className="about-card">
          <div className="about-card__edge" aria-hidden="true" />
          <p className="about-card__label">Únete</p>
          <h2 className="about-card__title">¿Listo para ordenar tu agenda?</h2>
          <p className="about-card__body" style={{ marginBottom: 24 }}>
            Probá MiAgenda con 14 días de Plan Pro incluidos. Sin contratos ni letras chicas.
            Cancelás antes de que termine la prueba y no te cobramos nada.
          </p>
          <div className="about-cta-row">
            <Link href="/register" className="about-cta-primary">
              Empezar gratis
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="mailto:soporte@miagenda.app" className="about-cta-secondary">
              Hablar con el equipo
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-meta" style={{ justifyContent: 'center', marginBottom: 8 }}>
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
