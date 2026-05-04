'use client';

import '@/styles/system.css';
import '@/styles/auth.css';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthBackdrop from '@/components/auth/AuthBackdrop';
import AuthLogo from '@/components/auth/AuthLogo';
import api from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de verificación es inválido.');
      return;
    }
    api.get(`/api/users/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'El enlace es inválido o ya fue usado.');
      });
  }, [token]);

  return (
    <div className="auth-shell">
      <AuthBackdrop />
      <header className="auth-nav">
        <AuthLogo />
      </header>
      <main style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: 420 }}>
          <div className="auth-card__edge" aria-hidden="true" />

          {status === 'loading' && (
            <>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
              <h1 className="auth-card__title">Verificando...</h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
              <h1 className="auth-card__title">¡Email verificado!</h1>
              <p style={{ color: 'var(--fg-2)', marginBottom: 28 }}>{message}</p>
              <Link href="/login" className="auth-btn auth-btn--primary" style={{ display: 'block' }}>
                Iniciar sesión →
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
              <h1 className="auth-card__title">Enlace inválido</h1>
              <p style={{ color: 'var(--fg-2)', marginBottom: 28 }}>{message}</p>
              <Link href="/register" className="auth-btn auth-btn--primary" style={{ display: 'block' }}>
                Registrarse de nuevo →
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
