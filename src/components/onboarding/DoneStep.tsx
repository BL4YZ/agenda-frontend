'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
  businessName: string;
  publicUrl: string;
  plan: 'gratis' | 'pro' | 'negocio';
  onFinish: () => void;
  saving: boolean;
};

const CONFETTI_COLORS = ['#818cf8', '#a78bfa', '#c084fc', '#60a5fa', '#34d399', '#fbbf24', '#f472b6'];

export default function DoneStep({ businessName, publicUrl, plan, onFinish, saving }: Props) {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confettiFall {
        0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(320px) rotate(720deg); opacity: 0; }
      }
      .wz-confetti-piece {
        position: absolute;
        width: 8px; height: 8px;
        border-radius: 2px;
        animation: confettiFall linear forwards;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;
    return () => { style.remove(); };
  }, []);

  const pieces = Array.from({ length: 48 }, (_, i) => ({
    left: `${(i * 2.1 + Math.random() * 4) % 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${(i * 0.06) % 1.8}s`,
    duration: `${1.2 + (i % 5) * 0.25}s`,
    size: `${6 + (i % 3) * 3}px`,
  }));

  return (
    <div style={{ textAlign: 'center', padding: '8px 0 16px', position: 'relative', overflow: 'hidden' }}>
      {/* Confetti */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {pieces.map((p, i) => (
          <div
            key={i}
            className="wz-confetti-piece"
            style={{
              left: p.left, top: 0,
              background: p.color,
              width: p.size, height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', fontSize: 32,
      }}>
        🎉
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--fg-0)', margin: '0 0 12px', lineHeight: 1.2 }}>
        ¡{businessName || 'Tu negocio'} está listo!
      </h1>
      <p style={{ fontSize: 15, color: 'var(--fg-2)', margin: '0 0 24px', lineHeight: 1.6 }}>
        Tu agenda está configurada y lista para recibir turnos.
      </p>

      {publicUrl && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 24,
          background: 'var(--glass-bg)', border: '1px solid var(--line-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '0 0 2px' }}>Tu página de reservas</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {publicUrl}
            </p>
          </div>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="dbtn"
            style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0, textDecoration: 'none' }}
          >
            Ver →
          </a>
        </div>
      )}

      {plan === 'gratis' && (
        <div style={{
          padding: '12px 16px', borderRadius: 12, marginBottom: 20,
          background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
        }}>
          <p style={{ fontSize: 13, color: '#a78bfa', margin: 0 }}>
            💜 Con el plan Pro desbloqueás pagos online, reportes de equipo y más.
          </p>
        </div>
      )}

      <button
        onClick={onFinish}
        disabled={saving}
        className="dbtn dbtn--primary"
        style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 15, fontWeight: 700, borderRadius: 14 }}
      >
        {saving ? 'Finalizando...' : 'Ir al dashboard →'}
      </button>
    </div>
  );
}
