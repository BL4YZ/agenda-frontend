'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

function CancelarContent() {
  const params = useSearchParams();
  const id    = params.get('id');
  const token = params.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id || !token) { setStatus('error'); setMessage('Link inválido.'); return; }
    axios.delete(`${API}/api/public/appointments/cancel`, { params: { id, token } })
      .then(r => { setStatus('success'); setMessage(r.data.message); })
      .catch(err => {
        const msg = err.response?.data?.message ?? 'Ocurrió un error.';
        setStatus(err.response?.status === 404 ? 'already' : 'error');
        setMessage(msg);
      });
  }, [id, token]);

  const icons = {
    loading: '⏳',
    success: '✅',
    error:   '❌',
    already: 'ℹ️',
  };

  const titles = {
    loading: 'Cancelando tu cita…',
    success: '¡Cita cancelada!',
    error:   'No pudimos cancelar',
    already: 'Cita no encontrada',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: 440, width: '100%', background: '#fff', borderRadius: 24,
        padding: '48px 40px', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>{icons[status]}</div>
        <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: '#1e293b' }}>
          {titles[status]}
        </h1>
        <p style={{ margin: '0 0 32px', color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>
          {status === 'loading' ? 'Por favor esperá un momento…' : message}
        </p>
        {status !== 'loading' && (
          <a
            href="/"
            style={{
              display: 'inline-block', padding: '12px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontWeight: 600, fontSize: 15, textDecoration: 'none',
            }}
          >
            Volver al inicio
          </a>
        )}
      </div>
    </div>
  );
}

export default function CancelarPage() {
  return (
    <Suspense>
      <CancelarContent />
    </Suspense>
  );
}
