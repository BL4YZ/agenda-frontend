'use client';

import React from 'react';

type Props = {
  onStart: () => void;
};

export default function WelcomeStep({ onStart }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', fontSize: 32,
      }}>
        📅
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--fg-0)', margin: '0 0 12px', lineHeight: 1.2 }}>
        Bienvenido a Novu
      </h1>
      <p style={{ fontSize: 15, color: 'var(--fg-2)', margin: '0 0 32px', lineHeight: 1.6 }}>
        En unos minutos vas a tener tu agenda lista para recibir turnos.
        <br />Vamos a configurar lo básico juntos.
      </p>
      <button
        onClick={onStart}
        className="dbtn dbtn--primary"
        style={{ padding: '14px 40px', fontSize: 15, fontWeight: 700, borderRadius: 14, width: '100%', justifyContent: 'center' }}
      >
        Empezar →
      </button>
      <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 16 }}>
        Solo toma 3–5 minutos
      </p>
    </div>
  );
}
