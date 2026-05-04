'use client';

import { useTimeAuth } from './hooks';

interface AuthVisualProps {
  mode: 'login' | 'signup';
}

const APPOINTMENTS = [
  { day: 0, hour: '09:00', name: 'Camila R.',  service: 'Corte + Color', color: '#a78bfa' },
  { day: 1, hour: '11:30', name: 'Andrés M.',  service: 'Consulta',      color: '#67e8f9' },
  { day: 2, hour: '15:00', name: 'Sofía P.',   service: 'Manicure',      color: '#fda4af' },
  { day: 3, hour: '10:00', name: 'Tomás G.',   service: 'Masaje',        color: '#86efac' },
  { day: 4, hour: '16:30', name: 'Lucía F.',   service: 'Facial',        color: '#fbbf24' },
] as const;

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function AuthVisual({ mode }: AuthVisualProps) {
  const t = useTimeAuth(60);
  const tick = Math.floor(t / 60);
  const visibleCount = Math.min(
    APPOINTMENTS.length,
    Math.floor(tick / 12) % (APPOINTMENTS.length + 3),
  );

  return (
    <div className="auth-visual" aria-hidden="true">
      <div className="auth-visual__inner">
        <div className="auth-visual__eyebrow">
          <span className="auth-visual__dot" />
          {mode === 'signup' ? 'Empieza en 30 segundos' : 'Bienvenido de vuelta'}
        </div>

        <h2 className="auth-visual__headline">
          {mode === 'signup' ? (
            <>
              Tu agenda <em>se llena sola.</em>
              <br />
              Tú solo cobras.
            </>
          ) : (
            <>
              Mientras dormías,
              <br />
              <em>4 citas nuevas.</em>
            </>
          )}
        </h2>

        <div className="auth-cal">
          <div className="auth-cal__head">
            <div className="auth-cal__month">Esta semana</div>
            <div className="auth-cal__live">
              <span className="auth-cal__live-dot" />
              en vivo
            </div>
          </div>
          <div className="auth-cal__grid">
            {DAYS.map((d, i) => (
              <div key={i} className="auth-cal__col">
                <div className="auth-cal__dayname">{d}</div>
                <div className="auth-cal__daynum">{8 + i}</div>
                <div className="auth-cal__slots">
                  {APPOINTMENTS.filter(a => a.day === i).map((a, idx) => {
                    const apptIndex = APPOINTMENTS.indexOf(a);
                    const visible = apptIndex < visibleCount;
                    return (
                      <div
                        key={idx}
                        className={`auth-cal__appt${visible ? ' is-in' : ''}`}
                        style={{ '--appt-color': a.color } as React.CSSProperties}
                      >
                        <div className="auth-cal__appt-time">{a.hour}</div>
                        <div className="auth-cal__appt-name">{a.name}</div>
                        <div className="auth-cal__appt-svc">{a.service}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
