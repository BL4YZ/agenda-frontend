'use client';

import React from 'react';

export type DayState = { enabled: boolean; start: string; end: string };

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type Props = {
  days: DayState[];
  onToggleDay: (i: number) => void;
  onStartChange: (i: number, v: string) => void;
  onEndChange: (i: number, v: string) => void;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
  saving: boolean;
};

export default function ScheduleStep({ days, onToggleDay, onStartChange, onEndChange, onContinue, onSkip, onBack, saving }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--fg-0)', margin: '0 0 6px' }}>Tus horarios</h2>
        <p style={{ fontSize: 14, color: 'var(--fg-2)', margin: 0 }}>
          ¿Qué días y en qué horario atendés?
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {days.map((day, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: 'var(--glass-bg)', border: '1px solid var(--line-strong)',
              opacity: day.enabled ? 1 : 0.5,
              transition: 'opacity .15s',
            }}
          >
            <button
              onClick={() => onToggleDay(i)}
              className={`dtoggle${day.enabled ? ' is-on' : ''}`}
              style={{ flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', minWidth: 32 }}>
              {DAY_LABELS[i]}
            </span>
            {day.enabled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <input
                  type="time"
                  value={day.start}
                  onChange={e => onStartChange(i, e.target.value)}
                  className="fg-field__input"
                  style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                />
                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>–</span>
                <input
                  type="time"
                  value={day.end}
                  onChange={e => onEndChange(i, e.target.value)}
                  className="fg-field__input"
                  style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                />
              </div>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--fg-3)', flex: 1 }}>Cerrado</span>
            )}
          </div>
        ))}
      </div>

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
