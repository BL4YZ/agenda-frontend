'use client';

import React from 'react';

type Props = {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  canSkip: boolean;
  onSkip: () => void;
  saving: boolean;
  children: React.ReactNode;
};

export default function StepLayout({ currentStep, totalSteps, stepLabel, canSkip, onSkip, saving, children }: Props) {
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-3)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Paso {currentStep} de {totalSteps} · {stepLabel}
          </span>
          {canSkip && (
            <button
              onClick={onSkip}
              disabled={saving}
              style={{ fontSize: 12, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', opacity: saving ? 0.5 : 1 }}
            >
              Saltar por ahora →
            </button>
          )}
        </div>
        <div style={{ height: 3, borderRadius: 99, background: 'var(--line-strong)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            borderRadius: 99,
            background: 'var(--accent)',
            width: `${pct}%`,
            transition: 'width 0.35s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>
      </div>
      {children}
    </div>
  );
}
