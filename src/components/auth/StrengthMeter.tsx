'use client';

import { useMemo } from 'react';

interface StrengthMeterProps {
  value: string;
}

export default function StrengthMeter({ value }: StrengthMeterProps) {
  const score = useMemo(() => {
    let s = 0;
    if (value.length >= 8) s++;
    if (/[A-Z]/.test(value)) s++;
    if (/[0-9]/.test(value)) s++;
    if (/[^a-zA-Z0-9]/.test(value)) s++;
    return s;
  }, [value]);

  const labels = ['', 'Débil', 'Aceptable', 'Buena', 'Excelente'];
  const colors = ['#3a334a', '#f87171', '#fbbf24', '#a78bfa', '#86efac'];

  return (
    <div className="strength" aria-label={`Seguridad de contraseña: ${labels[score] || 'insuficiente'}`}>
      <div className="strength__bars" aria-hidden="true">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="strength__bar"
            style={{
              background: i < score ? colors[score] : undefined,
              opacity: i < score ? 1 : 0.25,
            }}
          />
        ))}
      </div>
      <div className="strength__label" style={{ color: score > 0 ? colors[score] : undefined }}>
        {labels[score] || 'Mín. 8 caracteres, 1 mayúscula y 1 carácter especial'}
      </div>
    </div>
  );
}
