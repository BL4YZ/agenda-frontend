'use client';

import '@/styles/system.css';
import '@/styles/auth.css';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import AuthBackdrop from './AuthBackdrop';
import AuthLogo from './AuthLogo';
import GlassInput from './GlassInput';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validateEmail(email)) {
      setEmailError('Ingresá un email válido.');
      return;
    }
    setEmailError('');
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, { email });
      setSent(true);
    } catch {
      setServerError('Ocurrió un error. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell" data-mode="forgot">
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

      <main className="auth-main" style={{ gridTemplateColumns: '1fr' }}>
        <section className="auth-form-wrap">
          <div className="auth-card">
            <div className="auth-card__edge" aria-hidden="true" />

            {sent ? (
              <div className="auth-card__sent">
                <div className="auth-card__sent-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 8.586 6.414a2 2 0 0 0 2.828 0L22 7" />
                  </svg>
                </div>
                <p className="auth-card__sent-title">Revisá tu correo</p>
                <p className="auth-card__sent-desc">
                  Si <strong>{email}</strong> está registrado recibirás un enlace
                  para restablecer tu contraseña. El enlace expira en 1 hora.
                </p>
                <Link className="auth-back-link" href="/login">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <>
                <div className="auth-card__head">
                  <div className="auth-card__eyebrow">
                    <span className="auth-card__pulse" />
                    Recuperar contraseña
                  </div>
                  <h1 className="auth-card__title">
                    ¿Olvidaste tu
                    <br />
                    contraseña?
                  </h1>
                  <p className="auth-card__sub">
                    Ingresá tu email y te enviamos un enlace para crear una nueva.
                  </p>
                </div>

                <div className="auth-card__body">
                  <div aria-live="polite" aria-atomic="true">
                    {serverError && (
                      <div className="auth-error-banner">{serverError}</div>
                    )}
                  </div>

                  <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <GlassInput
                      id="forgot-email"
                      label="Email"
                      type="email"
                      placeholder="tu@email.com"
                      name="email"
                      autoFocus
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      error={emailError}
                    />

                    <button type="submit" className="auth-cta" disabled={loading}>
                      <span>{loading ? 'Enviando…' : 'Enviar enlace'}</span>
                      {!loading && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </form>

                  <Link className="auth-back-link" href="/login" style={{ justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver al inicio de sesión
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="auth-meta">
            <Link href="/terms">Términos</Link>
            <span>·</span>
            <Link href="/privacy">Privacidad</Link>
            <span>·</span>
            <a href="mailto:hola@novu.uy">Soporte</a>
          </div>
        </section>
      </main>
    </div>
  );
}
