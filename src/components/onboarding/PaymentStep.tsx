'use client';

import React from 'react';
import Link from 'next/link';

type Props = {
  plan: 'gratis' | 'pro' | 'negocio';
  mpConnected: boolean;
  allowCash: boolean;
  allowTransfer: boolean;
  onCashToggle: () => void;
  onTransferToggle: () => void;
  onMpConnect: () => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
  saving: boolean;
};

export default function PaymentStep({
  plan, mpConnected, allowCash, allowTransfer,
  onCashToggle, onTransferToggle, onMpConnect,
  onContinue, onSkip, onBack, saving,
}: Props) {
  const isPro = plan === 'pro' || plan === 'negocio';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-0)', margin: '0 0 6px' }}>Cobros</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>
          ¿Cómo vas a cobrar los turnos?
        </p>
      </div>

      {!isPro ? (
        /* Locked overlay for free plan */
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ filter: 'blur(3px)', pointerEvents: 'none', padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--line-strong)', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>Efectivo</span>
              <div className="dtoggle is-on" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>Transferencia</span>
              <div className="dtoggle" />
            </div>
            <div style={{ height: 44, borderRadius: 12, background: 'var(--line-strong)' }} />
          </div>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            background: 'oklch(from var(--bg) l c h / 0.75)', backdropFilter: 'blur(2px)',
            borderRadius: 16,
          }}>
            <span style={{ fontSize: 28 }}>🔒</span>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-0)', margin: 0, textAlign: 'center' }}>
              Disponible en el plan Pro
            </p>
            <p style={{ fontSize: 12, color: 'var(--fg-2)', margin: 0, textAlign: 'center' }}>
              Activá cobros online, efectivo y transferencias.
            </p>
            <Link
              href="/dashboard/settings/billing"
              className="dbtn dbtn--primary"
              style={{ padding: '10px 24px', fontSize: 13, borderRadius: 10, textDecoration: 'none', display: 'inline-flex' }}
            >
              Ver planes →
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Cash toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 12,
            background: 'var(--glass-bg)', border: '1px solid var(--line-strong)',
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>💵 Efectivo</span>
              <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '2px 0 0' }}>Aceptar pagos en efectivo en el local.</p>
            </div>
            <button onClick={onCashToggle} className={`dtoggle${allowCash ? ' is-on' : ''}`} />
          </div>

          {/* Transfer toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 12,
            background: 'var(--glass-bg)', border: '1px solid var(--line-strong)',
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>🏦 Transferencia</span>
              <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '2px 0 0' }}>El cliente recibe datos bancarios al reservar.</p>
            </div>
            <button onClick={onTransferToggle} className={`dtoggle${allowTransfer ? ' is-on' : ''}`} />
          </div>

          {/* MP connect */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 12,
            background: 'var(--glass-bg)', border: '1px solid var(--line-strong)',
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>💳 MercadoPago</span>
              <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '2px 0 0' }}>
                {mpConnected ? 'Cuenta conectada ✓' : 'Cobros online con tarjeta o MP.'}
              </p>
            </div>
            {!mpConnected && (
              <button
                onClick={onMpConnect}
                className="dbtn"
                style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0 }}
              >
                Conectar
              </button>
            )}
            {mpConnected && (
              <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>✓</span>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} className="dbtn" style={{ flex: '0 0 auto', padding: '12px 20px' }}>
          ← Atrás
        </button>
        <button
          onClick={onContinue}
          disabled={saving}
          className="dbtn dbtn--primary"
          style={{ flex: 1, justifyContent: 'center', padding: '12px 0' }}
        >
          {saving ? 'Guardando...' : 'Continuar →'}
        </button>
      </div>
      <button onClick={onSkip} style={{ fontSize: 13, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'center' }}>
        Saltar este paso por ahora
      </button>
    </div>
  );
}
