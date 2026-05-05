'use client';

import '@/styles/system.css';
import '@/styles/auth.css';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import AuthBackdrop from './AuthBackdrop';
import AuthLogo from './AuthLogo';
import AuthVisual from './AuthVisual';
import GlassInput from './GlassInput';
import StrengthMeter from './StrengthMeter';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPwd?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pwd: string): string | undefined {
  if (pwd.length < 8)          return 'Mínimo 8 caracteres.';
  if (!/[A-Z]/.test(pwd))      return 'Incluí al menos 1 mayúscula.';
  if (!/[0-9]/.test(pwd))      return 'Incluí al menos 1 número.';
  if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Incluí al menos 1 carácter especial.';
  return undefined;
}

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      setServerError('');
      setGoogleLoading(true);
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/auth/google`, {
          access_token: tokenResponse.access_token,
        });
        if (res.data.token) login(res.data.token);
      } catch {
        setServerError('Error al registrarse con Google. Intentá de nuevo.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setServerError('Error al registrarse con Google. Intentá de nuevo.'),
  });

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!name.trim())           errs.name = 'Ingresá el nombre de tu negocio.';
    if (!validateEmail(email))  errs.email = 'Ingresá un email válido.';
    const pwdErr = validatePassword(pwd);
    if (pwdErr)                 errs.password = pwdErr;
    if (!pwdErr && pwd !== confirmPwd) errs.confirmPwd = 'Las contraseñas no coinciden.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    if (!accepted) {
      setServerError('Debes aceptar los Términos y la Política de Privacidad.');
      return;
    }

    setLoading(true);
    try {
      /* TODO: el backend actualmente acepta { email, password }.
         Agregar businessName al endpoint POST /api/users/register
         para que quede: { email, password, businessName }            */
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        email,
        password: pwd,
        businessName: name.trim(),
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(
          err.response?.data?.message || 'Error al registrarse. Verificá los datos.',
        );
      } else {
        setServerError('Error al registrarse. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell" data-mode="signup">
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

      <main className="auth-main">
        <AuthVisual mode="signup" />

        <section className="auth-form-wrap">
          <div className="auth-card">
            <div className="auth-card__edge" aria-hidden="true" />

            <div className="auth-card__head">
              <div className="auth-card__eyebrow">
                <span className="auth-card__pulse" />
                Crea tu cuenta · Gratis
              </div>
              <h1 className="auth-card__title">
                Empieza a llenar
                <br />
                tu agenda hoy.
              </h1>
              <p className="auth-card__sub">14 días Pro gratis. Sin tarjeta.</p>
            </div>

            {success ? (
              <div className="auth-success-banner" role="status" aria-live="polite">
                ✓ ¡Cuenta creada! Revisá tu correo para verificar tu cuenta antes de ingresar.
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                <div aria-live="polite" aria-atomic="true">
                  {serverError && (
                    <div className="auth-error-banner">{serverError}</div>
                  )}
                </div>

                <GlassInput
                  id="signup-name"
                  label="Nombre del negocio"
                  type="text"
                  placeholder="Ej. Estudio Camila"
                  name="businessName"
                  autoFocus
                  autoComplete="organization"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) setErrors(p => ({ ...p, name: undefined }));
                  }}
                  error={errors.name}
                />

                <GlassInput
                  id="signup-email"
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  name="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(p => ({ ...p, email: undefined }));
                  }}
                  error={errors.email}
                />

                <div className="auth-pwd-block">
                  <GlassInput
                    id="signup-password"
                    label="Contraseña"
                    type="password"
                    placeholder="••••••••"
                    name="password"
                    autoComplete="new-password"
                    value={pwd}
                    onChange={e => {
                      setPwd(e.target.value);
                      if (errors.password) setErrors(p => ({ ...p, password: undefined }));
                      if (errors.confirmPwd) setErrors(p => ({ ...p, confirmPwd: undefined }));
                    }}
                    error={errors.password}
                  />
                  <StrengthMeter value={pwd} />
                </div>

                <GlassInput
                  id="signup-confirm-password"
                  label="Confirmá tu contraseña"
                  type="password"
                  placeholder="••••••••"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPwd}
                  onChange={e => {
                    setConfirmPwd(e.target.value);
                    if (errors.confirmPwd) setErrors(p => ({ ...p, confirmPwd: undefined }));
                  }}
                  error={errors.confirmPwd}
                />

                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={e => setAccepted(e.target.checked)}
                  />
                  <span className="auth-remember__box" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6.5L5 9.5L10 3.5" />
                    </svg>
                  </span>
                  Acepto los{' '}
                  <Link href="/terms">Términos</Link> y la{' '}
                  <Link href="/privacy">Privacidad</Link>
                </label>

                <button type="submit" className="auth-cta" disabled={loading}>
                  <span>{loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}</span>
                  {!loading && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                <div className="auth-divider">
                  <span>o continúa con</span>
                </div>

                <div className="auth-social" style={{ gridTemplateColumns: '1fr' }}>
                  <button
                    type="button"
                    className="auth-social__btn"
                    onClick={() => googleLogin()}
                    disabled={googleLoading || loading}
                  >
                    {googleLoading ? (
                      <span>Conectando…</span>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.7-.4-3.5z" />
                        </svg>
                        Continuar con Google
                      </>
                    )}
                  </button>
                </div>

                <div className="auth-foot">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login">Inicia sesión</Link>
                </div>
              </form>
            )}
          </div>

          <div className="auth-meta">
            <Link href="/terms">Términos</Link>
            <span>·</span>
            <Link href="/privacy">Privacidad</Link>
            <span>·</span>
            <a href="mailto:soporte@miagenda.app">Soporte</a>
          </div>
        </section>
      </main>
    </div>
  );
}
