'use client';

import React from 'react';

type Props = {
  serviceName: string;
  serviceDuration: string;
  servicePrice: string;
  onNameChange: (v: string) => void;
  onDurationChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
  saving: boolean;
};

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1:30 hs' },
  { value: '120', label: '2 horas' },
];

export default function ServiceStep({
  serviceName, serviceDuration, servicePrice,
  onNameChange, onDurationChange, onPriceChange,
  onContinue, onSkip, onBack, saving,
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-0)', margin: '0 0 6px' }}>Primer servicio</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>
          Agregá el servicio principal que ofrecés. Podés agregar más desde la sección Servicios.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
            Nombre del servicio
          </label>
          <input
            type="text"
            value={serviceName}
            onChange={e => onNameChange(e.target.value)}
            placeholder="Ej: Corte de pelo"
            className="fg-field__input"
            autoFocus
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 8 }}>
            Duración
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DURATIONS.map(d => {
              const active = serviceDuration === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => onDurationChange(d.value)}
                  style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: `2px solid ${active ? 'var(--accent)' : 'var(--line-strong)'}`,
                    background: active ? 'oklch(from var(--accent) l c h / 0.12)' : 'var(--glass-bg)',
                    color: active ? 'var(--accent)' : 'var(--fg-2)',
                    transition: 'border-color .15s, background .15s',
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
            Precio
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--fg-3)' }}>$</span>
            <input
              type="number"
              min="0"
              step="100"
              value={servicePrice}
              onChange={e => onPriceChange(e.target.value)}
              placeholder="0"
              className="fg-field__input"
              style={{ paddingLeft: 28 }}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}>Dejalo en 0 si todavía no definiste el precio.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} className="dbtn" style={{ flex: '0 0 auto', padding: '12px 20px' }}>
          ← Atrás
        </button>
        <button
          onClick={onContinue}
          disabled={saving || !serviceName.trim()}
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
