'use client';

import React from 'react';
import type { FeatureFlags } from '@/context/BusinessContext';

const FLAG_ITEMS: { key: keyof FeatureFlags; label: string; desc: string; proOnly: boolean }[] = [
  { key: 'showExpenses',    label: 'Registro de gastos',              desc: 'Lleva el control de los gastos del negocio.',             proOnly: true },
  { key: 'showModalities',  label: 'Modalidades de compensación',     desc: 'Empleados, comisión, alquiler de silla o mixto.',          proOnly: true },
  { key: 'showCommissions', label: 'Resumen de comisiones',           desc: 'Calculá y registrá los pagos de comisiones del equipo.',   proOnly: true },
  { key: 'showTeamReports', label: 'Reportes del equipo',             desc: 'Estadísticas por integrante y rendimiento del equipo.',    proOnly: true },
];

type Props = {
  flags: FeatureFlags;
  isPro: boolean;
  onToggle: (key: keyof FeatureFlags) => void;
  onContinue: () => void;
  onBack: () => void;
};

export default function FeaturesStep({ flags, isPro, onToggle, onContinue, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-0)', margin: '0 0 6px' }}>Funciones</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>
          Activá solo las que uses. Podés cambiarlas en cualquier momento desde Ajustes.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {FLAG_ITEMS.map(item => {
          const locked = item.proOnly && !isPro;
          const checked = flags[item.key];
          return (
            <div
              key={item.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 12,
                background: 'var(--glass-bg)',
                border: '1px solid var(--line-strong)',
                opacity: locked ? 0.6 : 1,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{item.label}</span>
                  {locked && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
                      background: 'rgba(167,139,250,0.15)', color: '#a78bfa', letterSpacing: '0.04em',
                    }}>
                      PRO
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: '2px 0 0' }}>{item.desc}</p>
              </div>
              <button
                onClick={() => !locked && onToggle(item.key)}
                disabled={locked}
                className={`dtoggle${checked ? ' is-on' : ''}`}
                style={{ flexShrink: 0, cursor: locked ? 'not-allowed' : 'pointer' }}
              />
            </div>
          );
        })}
      </div>

      {!isPro && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)',
        }}>
          <p style={{ fontSize: 12, color: '#a78bfa', margin: 0 }}>
            🔒 Las funciones avanzadas están disponibles en el plan Pro. Podés activar tu plan en Ajustes → Facturación.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} className="dbtn" style={{ flex: '0 0 auto', padding: '12px 20px' }}>
          ← Atrás
        </button>
        <button
          onClick={onContinue}
          className="dbtn dbtn--primary"
          style={{ flex: 1, justifyContent: 'center', padding: '12px 0' }}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
