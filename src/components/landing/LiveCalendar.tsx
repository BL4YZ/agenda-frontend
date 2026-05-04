'use client';

import { useState, useEffect } from 'react';

interface Appointment {
  d: number;
  h: number;
  dur: number;
  label: string;
  client: string;
  color: 'v' | 'p';
}

interface LiveCalendarProps {
  density?: number;
}

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const SLOT_H_PCT = (100 / HOURS.length).toFixed(4);

const INITIAL: Appointment[] = [
  { d: 0, h: 1, dur: 1, label: 'Corte + barba',    client: 'M. López', color: 'v' },
  { d: 1, h: 3, dur: 1, label: 'Sesión coaching',  client: 'A. Ruiz',  color: 'v' },
  { d: 2, h: 0, dur: 2, label: 'Diseño uñas',      client: 'L. Pérez', color: 'p' },
  { d: 3, h: 5, dur: 1, label: 'Consulta',         client: 'R. Díaz',  color: 'v' },
];

const ADDITIONS: Appointment[] = [
  { d: 4, h: 2, dur: 1, label: 'Masaje 60min',     client: 'P. Soto',  color: 'p' },
  { d: 0, h: 4, dur: 1, label: 'Color + lavado',   client: 'C. Vega',  color: 'v' },
  { d: 5, h: 6, dur: 1, label: 'Limpieza facial',  client: 'J. Mora',  color: 'p' },
  { d: 2, h: 7, dur: 1, label: 'Asesoría',         client: 'F. Ríos',  color: 'v' },
  { d: 4, h: 5, dur: 2, label: 'Tratamiento',      client: 'B. Cruz',  color: 'p' },
];

export default function LiveCalendar({ density = 1 }: LiveCalendarProps) {
  const [slots, setSlots] = useState<Appointment[]>(INITIAL);
  const [pulseIdx, setPulseIdx] = useState(-1);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setSlots(prev => {
        if (idx >= ADDITIONS.length) { idx = 0; return INITIAL; }
        const next = [...prev, ADDITIONS[idx]];
        setPulseIdx(next.length - 1);
        idx += 1;
        return next;
      });
    }, 2200 / density);
    return () => clearInterval(interval);
  }, [density]);

  return (
    <div className="live-cal">
      <div className="live-cal-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.08em' }}>
          agenda · semana 17
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div className="live-pill"><span className="live-dot" /> EN VIVO</div>
        </div>
      </div>

      <div className="live-cal-grid">
        <div className="live-cal-hours">
          {HOURS.map(h => <div key={h} className="hour mono">{h}</div>)}
        </div>
        <div className="live-cal-days">
          {DAYS.map((d, i) => (
            <div key={i} className="day-col">
              <div className="day-head">
                <span className="mono day-letter">{d}</span>
                <span className="day-num">{12 + i}</span>
              </div>
              <div className="day-slots">
                {HOURS.map((_, hi) => <div key={hi} className="slot-line" />)}
                {slots.filter(s => s.d === i).map((s, si) => {
                  const allIdx = slots.indexOf(s);
                  const isNew = allIdx === pulseIdx;
                  return (
                    <div
                      key={`${i}-${s.h}-${si}`}
                      className={`appt appt-${s.color}${isNew ? ' appt-new' : ''}`}
                      style={{
                        top: `${(s.h / HOURS.length) * 100}%`,
                        height: `${(s.dur / HOURS.length) * 100}%`,
                      }}
                    >
                      <div className="appt-label">{s.label}</div>
                      <div className="appt-client mono">{s.client}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .live-cal {
          width: 100%; height: 100%;
          display: flex; flex-direction: column;
          font-family: var(--font-body); color: var(--fg-1);
          border-radius: var(--r-lg); overflow: hidden;
          background: linear-gradient(180deg, oklch(0.18 0.04 280 / 0.6), oklch(0.12 0.03 280 / 0.7));
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-floating), 0 1px 0 oklch(1 0 0 / 0.08) inset;
        }
        [data-theme="light"] .live-cal {
          background: linear-gradient(180deg, oklch(1 0 0 / 0.85), oklch(0.96 0.02 280 / 0.85));
        }
        .live-cal-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid var(--glass-border);
        }
        .live-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.16em;
          color: var(--fg-1); padding: 4px 8px; border-radius: 100px;
          background: oklch(0.6 0.2 145 / 0.12); border: 1px solid oklch(0.6 0.2 145 / 0.3);
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: oklch(0.7 0.2 145); box-shadow: 0 0 8px oklch(0.7 0.2 145);
          animation: livePulse 1.4s infinite;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        .live-cal-grid { flex: 1; display: grid; grid-template-columns: 56px 1fr; min-height: 0; }
        .live-cal-hours {
          display: flex; flex-direction: column; padding-top: 38px;
          border-right: 1px solid var(--glass-border);
        }
        .live-cal-hours .hour { flex: 1; font-size: 10px; color: var(--fg-3); padding: 0 10px; letter-spacing: 0.04em; }
        .live-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); }
        .day-col { display: flex; flex-direction: column; border-right: 1px solid var(--glass-border); min-width: 0; }
        .day-col:last-child { border-right: none; }
        .day-head { display: flex; align-items: baseline; gap: 6px; padding: 10px 8px; border-bottom: 1px solid var(--glass-border); }
        .day-letter { font-size: 10px; color: var(--fg-3); letter-spacing: 0.1em; }
        .day-num { font-size: 13px; color: var(--fg-0); font-weight: 600; }
        .day-slots { flex: 1; position: relative; }
        .slot-line { height: ${SLOT_H_PCT}%; border-bottom: 1px dashed var(--glass-border); }
        .appt {
          position: absolute; left: 4px; right: 4px; padding: 6px 8px; border-radius: 8px;
          font-size: 10px; line-height: 1.2; overflow: hidden;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          animation: apptIn 0.7s var(--ease-out);
        }
        .appt-v {
          background: linear-gradient(135deg, oklch(0.55 0.22 290 / 0.85), oklch(0.45 0.2 280 / 0.85));
          border: 1px solid oklch(0.7 0.2 290 / 0.6); color: white;
          box-shadow: 0 4px 12px -2px oklch(0.5 0.22 290 / 0.5), 0 0 0 1px oklch(1 0 0 / 0.1) inset;
        }
        .appt-p {
          background: linear-gradient(135deg, oklch(0.6 0.2 320 / 0.85), oklch(0.5 0.2 310 / 0.85));
          border: 1px solid oklch(0.7 0.2 320 / 0.6); color: white;
          box-shadow: 0 4px 12px -2px oklch(0.5 0.22 320 / 0.5), 0 0 0 1px oklch(1 0 0 / 0.1) inset;
        }
        .appt-new { animation: apptIn 0.7s var(--ease-out), apptGlow 1.4s ease-out; }
        .appt-label { font-weight: 600; color: white; font-size: 10.5px; }
        .appt-client { font-size: 9px; opacity: 0.85; margin-top: 2px; letter-spacing: 0.03em; }
        @keyframes apptIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.92); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes apptGlow {
          0%   { box-shadow: 0 0 0 0   oklch(0.7 0.25 290 / 0.6), 0 4px 12px -2px oklch(0.5 0.22 290 / 0.5); }
          100% { box-shadow: 0 0 0 18px oklch(0.7 0.25 290 / 0),  0 4px 12px -2px oklch(0.5 0.22 290 / 0.5); }
        }

        /* ── Responsive: mobile ── */
        @media (max-width: 600px) {
          /* Mostrar solo 5 días (L-V), ocultar Sáb y Dom */
          .live-cal-days { grid-template-columns: repeat(5, 1fr); }
          .day-col:nth-child(6),
          .day-col:nth-child(7) { display: none; }

          .live-cal-head { padding: 10px 12px; }
          .live-cal-hours { display: none; }
          .live-cal-grid { grid-template-columns: 1fr; }
          .day-head { padding: 6px 4px; gap: 3px; }
          .day-letter { font-size: 9px; }
          .day-num { font-size: 11px; }
          .appt { padding: 3px 4px; border-radius: 5px; }
          .appt-label { font-size: 8.5px; }
          .appt-client { display: none; }
        }
      `}</style>
    </div>
  );
}
