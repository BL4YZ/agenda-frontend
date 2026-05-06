'use client';

import '@/styles/system.css';
import '@/styles/auth.css';
import '@/styles/about.css';
import '@/styles/contact.css';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import AuthBackdrop from '@/components/auth/AuthBackdrop';
import AuthLogo from '@/components/auth/AuthLogo';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Consulta de ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:soporte@miagenda.app?subject=${subject}&body=${body}`;
    setSent(true);
  }

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
            Soporte
          </div>
          <h1 className="about-hero__title">
            Estamos para<br />
            <em>ayudarte.</em>
          </h1>
          <p className="about-hero__sub">
            Respondemos todas las consultas. Si tenés una duda, un problema o
            simplemente querés saber más, escribinos.
          </p>
        </section>

        {/* Canales */}
        <div className="contact-channels">

          <div className="contact-channel">
            <div className="contact-channel__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <p className="contact-channel__label">Email</p>
              <a className="contact-channel__value" href="mailto:soporte@miagenda.app">
                soporte@miagenda.app
              </a>
              <p className="contact-channel__meta">Respondemos en menos de 24 hs hábiles</p>
            </div>
          </div>

          <div className="contact-channel">
            <div className="contact-channel__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <p className="contact-channel__label">Horario de atención</p>
              <p className="contact-channel__value" style={{ color: 'var(--fg-1)' }}>Lunes a viernes, 9:00 – 18:00</p>
              <p className="contact-channel__meta">Hora de Uruguay (UYT, UTC-3)</p>
            </div>
          </div>

        </div>

        {/* Formulario */}
        <div className="about-card" style={{ width: '100%' }}>
          <div className="about-card__edge" aria-hidden="true" />
          <p className="about-card__label">Escribinos</p>
          <h2 className="about-card__title">Envianos tu consulta</h2>
          <p className="about-card__body" style={{ marginBottom: 24 }}>
            Completá el formulario y te responderemos a la brevedad.
          </p>

          {sent ? (
            <div className="contact-sent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
              Tu cliente de correo se abrió con el mensaje listo. También podés escribirnos directamente a{' '}
              <a href="mailto:soporte@miagenda.app" style={{ color: 'var(--accent)' }}>soporte@miagenda.app</a>.
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <div className="contact-form__field">
                  <label className="contact-form__label">Nombre</label>
                  <input
                    className="contact-form__input"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="contact-form__field">
                  <label className="contact-form__label">Email</label>
                  <input
                    className="contact-form__input"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="contact-form__field">
                <label className="contact-form__label">Mensaje</label>
                <textarea
                  className="contact-form__input contact-form__textarea"
                  placeholder="Contanos tu consulta o problema..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  rows={5}
                />
              </div>
              <button type="submit" className="about-cta-primary" style={{ alignSelf: 'flex-start' }}>
                Enviar mensaje
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="auth-meta" style={{ justifyContent: 'center', marginBottom: 8 }}>
          <Link href="/about">Sobre nosotros</Link>
          <span>·</span>
          <Link href="/terms">Términos</Link>
          <span>·</span>
          <Link href="/privacy">Privacidad</Link>
        </div>

      </main>
    </div>
  );
}
