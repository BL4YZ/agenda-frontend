'use client';

import React from 'react';
import type { BusinessType } from '@/context/BusinessContext';

const BIZ_TYPES: { value: BusinessType; label: string; icon: string }[] = [
  { value: 'barberia',    label: 'Barbería',            icon: '✂️' },
  { value: 'peluqueria',  label: 'Peluquería / Salón',  icon: '💇' },
  { value: 'estetica',    label: 'Estética / Spa',       icon: '✨' },
  { value: 'manicura',    label: 'Manicura / Nail Art',  icon: '💅' },
  { value: 'consultorio', label: 'Consultorio / Salud',  icon: '🩺' },
  { value: 'fitness',     label: 'Fitness / Bienestar',  icon: '🏋️' },
  { value: 'otro',        label: 'Otro',                 icon: '🏪' },
];

type Props = {
  businessName: string;
  onNameChange: (v: string) => void;
  nameError: string;
  selectedType: BusinessType | null;
  onTypeSelect: (t: BusinessType) => void;
  onContinue: () => void;
  onBack: () => void;
  saving: boolean;
};

export default function BusinessStep({ businessName, onNameChange, nameError, selectedType, onTypeSelect, onContinue, onBack, saving }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-0)', margin: '0 0 6px' }}>Tu negocio</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>¿Cómo se llama y de qué tipo es?</p>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
          Nombre del negocio
        </label>
        <input
          type="text"
          value={businessName}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Ej: Estudio Valeria"
          className="fg-field__input"
          autoFocus
        />
        {nameError && (
          <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{nameError}</p>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 10 }}>
          Tipo de negocio
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          {BIZ_TYPES.map(t => {
            const active = selectedType === t.value;
            return (
              <button
                key={t.value}
                onClick={() => onTypeSelect(t.value)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 4, padding: '12px 12px',
                  borderRadius: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  border: `2px solid ${active ? 'var(--accent)' : 'var(--line-strong)'}`,
                  background: active ? 'oklch(from var(--accent) l c h / 0.12)' : 'var(--glass-bg)',
                  color: active ? 'var(--accent)' : 'var(--fg-1)',
                  transition: 'border-color .15s, background .15s',
                }}
              >
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button onClick={onBack} className="dbtn" style={{ flex: '0 0 auto', padding: '12px 20px' }}>
          ← Atrás
        </button>
        <button
          onClick={onContinue}
          disabled={saving || !businessName.trim() || !selectedType}
          className="dbtn dbtn--primary"
          style={{ flex: 1, justifyContent: 'center', padding: '12px 0' }}
        >
          {saving ? 'Guardando...' : 'Continuar →'}
        </button>
      </div>
    </div>
  );
}
