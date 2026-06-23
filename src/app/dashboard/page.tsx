'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import GettingStartedGuide from '@/components/GettingStartedGuide';

/* ── SVG icons needed for this page ───────────────────────────────────────── */
const Icon = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v12M7 10l5 5 5-5M3 21h18"/></svg>,
  ban: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M4.9 4.9l14.2 14.2"/></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  clock: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  user: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  card: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  cal: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  trend: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 7l-10 10-4-4-7 7"/><path d="M16 7h6v6"/></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h0"/></svg>,
  bag: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 8V6a4 4 0 00-8 0v2"/><rect x="3" y="8" width="18" height="13" rx="2"/></svg>,
  back: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>,
  fwd: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
  chevDown: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>,
};

/* ── Types ────────────────────────────────────────────────────────────────── */
type ApiEvent = {
  id: string; title: string; start: string; end: string;
  client_name?: string; client_email?: string; payment_status?: string;
  price?: string; employee_name?: string; employee_id?: number;
  backgroundColor?: string; borderColor?: string; textColor?: string;
  isBlock?: boolean;
};
type SelectedEvent = {
  id: string; title: string; start: Date | null; end: Date | null;
  client_name?: string; client_email?: string; payment_status?: string;
  price?: string; employee_name?: string;
};
type Metrics = {
  total_appointments: string; paid_count: string; full_payment_count: string; pending_count: string;
  free_count: string; revenue_total: string; this_month: string; revenue_month: string;
};
type Service = { id: number; name: string; duration_minutes: number; price: number };
type TeamMember = { id: number; name: string | null; email: string; role: string };
type NewEntryState = { mode: 'block' | 'appointment'; date: string; startTime: string; endTime: string };

const STATUS_COLOR: Record<string, string> = {
  paid:          '#22c55e',
  full_payment:  '#3b82f6',
  pending:       '#f59e0b',
  not_required:  '#8b5cf6',
};
const STATUS_BG: Record<string, string> = {
  paid:          'oklch(0.28 0.12 150 / 0.7)',
  full_payment:  'oklch(0.28 0.12 240 / 0.7)',
  pending:       'oklch(0.3 0.13 70 / 0.7)',
  not_required:  'oklch(0.28 0.1 290 / 0.7)',
};
function colorForStatus(status?: string) {
  return STATUS_COLOR[status ?? ''] ?? STATUS_COLOR.not_required;
}
function bgForStatus(status?: string) {
  return STATUS_BG[status ?? ''] ?? STATUS_BG.not_required;
}

function statusPillClass(status?: string) {
  if (status === 'paid') return 'status-pill status-pill--seal';
  if (status === 'full_payment') return 'status-pill status-pill--paid';
  if (status === 'pending') return 'status-pill status-pill--pending';
  return 'status-pill status-pill--blocked';
}
function statusLabel(status?: string) {
  if (status === 'paid') return 'Seña cobrada';
  if (status === 'full_payment') return 'Pago completo';
  if (status === 'pending') return 'Pago pendiente';
  return 'Sin cobro';
}

// date-fns format() uses the browser's local timezone; this shifts an ISO string
// to a "wall-clock" Date in America/Montevideo so HH:mm renders the correct local hour.
function parseInMVD(iso: string): Date {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Montevideo',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parseInt(parts.find(p => p.type === t)?.value ?? '0');
  return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
}

/* ── Confirm modal ────────────────────────────────────────────────────────── */
function ConfirmModal({ title, body, confirmLabel, onConfirm, onClose }: {
  title: string; body: string; confirmLabel: string;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <div className="dash-modal-overlay">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="dash-modal" style={{ maxWidth: 360, position: 'relative', zIndex: 1 }}>
        <h3 className="dash-modal__title" style={{ fontSize: 16, marginBottom: 12 }}>{title}</h3>
        <p style={{ color: 'var(--fg-2)', fontSize: 13, marginBottom: 24 }}>{body}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="dbtn" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancelar</button>
          <button className="dbtn dbtn--danger" style={{ flex: 1, justifyContent: 'center' }} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Event popover ────────────────────────────────────────────────────────── */
function EventPopover({ target, event, onClose, onCancel }: {
  target: HTMLElement | null; event: SelectedEvent | null;
  onClose: () => void; onCancel: (id: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.addEventListener('scroll', onClose, true);
    return () => document.removeEventListener('scroll', onClose, true);
  }, [onClose]);

  if (!event || !target || !event.start || !event.end) return null;

  const rect = target.getBoundingClientRect();
  const top  = rect.bottom + 8;
  const left = Math.min(Math.max(rect.left, 8), window.innerWidth - 272);
  const isBlock = event.id.startsWith('block-');

  const handleConfirmed = async () => {
    try {
      if (isBlock) {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/blocks/${event.id.replace('block-', '')}`);
      } else {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${event.id}`);
      }
      onCancel(event.id); onClose();
    } catch { setShowConfirm(false); }
  };

  return (
    <>
      <div style={{
        position: 'fixed', zIndex: 50, width: 264, top, left,
        padding: 16,
        animation: 'scale-in 0.2s cubic-bezier(0.16,1,0.3,1)',
        background: 'var(--glass-bg-strong)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        boxShadow: '0 20px 60px oklch(0 0 0 / 0.65)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: isBlock ? '#64748b' : colorForStatus(event.payment_status), flexShrink: 0 }} />
            <strong style={{ color: 'var(--fg-0)', fontSize: 13 }}>{event.title}</strong>
          </div>
          <button className="dash-iconbtn" style={{ width: 28, height: 28 }} onClick={onClose}>{Icon.x}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icon.clock}
            {format(event.start, "EEEE d 'de' MMMM", { locale: es })} · {format(event.start, 'HH:mm')} – {format(event.end!, 'HH:mm')}
          </p>
          {event.client_name && (
            <p style={{ fontSize: 12, color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icon.user} {event.client_name}
            </p>
          )}
          {event.payment_status && event.payment_status !== 'not_required' && (
            <span className={statusPillClass(event.payment_status)}>● {statusLabel(event.payment_status)}</span>
          )}
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className="dbtn dbtn--danger dbtn--sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {isBlock ? 'Eliminar bloqueo' : 'Cancelar cita'}
        </button>
      </div>
      {showConfirm && (
        <ConfirmModal
          title={isBlock ? 'Eliminar bloqueo' : 'Cancelar cita'}
          body={isBlock ? 'Se eliminará este bloqueo del calendario.' : '¿Cancelar esta cita? El cliente no será notificado automáticamente.'}
          confirmLabel={isBlock ? 'Eliminar' : 'Cancelar cita'}
          onConfirm={handleConfirmed}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

/* ── Custom select ────────────────────────────────────────────────────────── */
function CustomSelect({ value, onChange, options }: {
  value: string | number;
  onChange: (v: string | number) => void;
  options: { value: string | number; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className="fg-field__select"
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px' }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected?.label ?? '—'}</span>
        <span style={{ flexShrink: 0, marginLeft: 8, opacity: 0.6 }}>{Icon.chevDown}</span>
      </button>
      {open && (
        <div className="gcard" style={{ position: 'absolute', zIndex: 10, marginTop: 4, width: '100%', padding: 4 }}>
          {options.map(opt => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: 8, fontSize: 13,
                background: String(opt.value) === String(value) ? 'oklch(0.28 0.1 290 / 0.4)' : 'transparent',
                color: String(opt.value) === String(value) ? 'var(--accent)' : 'var(--fg-1)',
                border: 0, cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── New entry modal ──────────────────────────────────────────────────────── */
function NewEntryModal({ initial, token, services, team, onClose, onCreated }: {
  initial: NewEntryState; token: string;
  services: Service[]; team: TeamMember[];
  onClose: () => void; onCreated: (event: ApiEvent) => void;
}) {
  const [mode, setMode] = useState<'block' | 'appointment'>(initial.mode);
  const [date, setDate] = useState(initial.date);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [employeeId, setEmployeeId] = useState<string | number>(team[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const [serviceId, setServiceId] = useState<string | number>(services[0]?.id ?? '');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'appointment' && serviceId) {
      const svc = services.find(s => s.id === Number(serviceId));
      if (svc) {
        const [h, m] = startTime.split(':').map(Number);
        const totalMin = h * 60 + m + svc.duration_minutes;
        setEndTime(`${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`);
      }
    }
  }, [serviceId, startTime, mode, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!employeeId) { setError('Seleccioná un profesional.'); return; }
    if (mode === 'appointment' && !serviceId) { setError('Seleccioná un servicio.'); return; }
    setSaving(true);
    try {
      if (mode === 'block') {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/blocks`, {
          employeeId, startTime: `${date}T${startTime}:00`, endTime: `${date}T${endTime}:00`, reason: reason || null,
        }, { headers: { Authorization: `Bearer ${token}` } });
        const emp = team.find(m => m.id === Number(employeeId));
        onCreated({
          id: `block-${res.data.id}`, title: reason || 'Bloqueado',
          start: res.data.start_time, end: res.data.end_time,
          backgroundColor: 'rgba(100,116,139,0.35)', borderColor: '#475569', textColor: '#94a3b8',
          employee_name: emp?.name || emp?.email,
        });
      } else {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/manual`, {
          serviceId: Number(serviceId), employeeId: Number(employeeId),
          startTime: `${date}T${startTime}:00`, clientName: clientName || 'Cliente', clientEmail: clientEmail || null,
        }, { headers: { Authorization: `Bearer ${token}` } });
        onCreated({ ...res.data, backgroundColor: bgForStatus('not_required'), borderColor: colorForStatus('not_required'), textColor: '#ffffff' });
      }
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message || 'Error al guardar.');
      else setError('Error al guardar.');
    } finally { setSaving(false); }
  };

  return (
    <div className="dash-modal-overlay">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="dash-modal" style={{ position: 'relative', zIndex: 1 }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <div className="tab-pills">
            <button className={mode === 'block' ? 'is-active' : ''} type="button" onClick={() => setMode('block')}>
              Bloquear
            </button>
            <button className={mode === 'appointment' ? 'is-active' : ''} type="button" onClick={() => setMode('appointment')}>
              Nueva cita
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <button className="dash-iconbtn" style={{ width: 32, height: 32 }} type="button" onClick={onClose}>{Icon.x}</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg-field">
            <span className="fg-field__label">Profesional</span>
            <CustomSelect value={employeeId} onChange={v => setEmployeeId(v as number)}
              options={team.map(m => ({ value: m.id, label: m.name || m.email }))} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="fg-field" style={{ gridColumn: '1/-1' }}>
              <span className="fg-field__label">Fecha</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="fg-field__input" />
            </div>
            <div className="fg-field">
              <span className="fg-field__label">Inicio</span>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="fg-field__input" />
            </div>
            <div className="fg-field">
              <span className="fg-field__label">{mode === 'block' ? 'Fin' : 'Fin (auto)'}</span>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                readOnly={mode === 'appointment'}
                className="fg-field__input"
                style={mode === 'appointment' ? { opacity: 0.5, cursor: 'not-allowed' } : {}} />
            </div>
          </div>

          {mode === 'block' && (
            <div className="fg-field">
              <span className="fg-field__label">Motivo <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></span>
              <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Almuerzo, reunión..." className="fg-field__input" />
            </div>
          )}

          {mode === 'appointment' && (
            <>
              <div className="fg-field">
                <span className="fg-field__label">Servicio</span>
                <CustomSelect value={serviceId} onChange={v => setServiceId(v as number)}
                  options={services.map(s => ({ value: s.id, label: `${s.name} · ${s.duration_minutes} min` }))} />
              </div>
              <div className="fg-field">
                <span className="fg-field__label">Nombre del cliente</span>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre completo" className="fg-field__input" />
              </div>
              <div className="fg-field">
                <span className="fg-field__label">Email <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span></span>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="cliente@email.com" className="fg-field__input" />
              </div>
            </>
          )}

          {error && <p style={{ color: 'var(--color-error, #ef4444)', fontSize: 12 }}>{error}</p>}

          <button type="submit" disabled={saving}
            className={`dbtn ${mode === 'block' ? '' : 'dbtn--primary'}`}
            style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 4 }}>
            {saving ? 'Guardando...' : mode === 'block' ? 'Bloquear horario' : 'Crear cita'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Mobile day sheet ─────────────────────────────────────────────────────── */
function DaySheet({ date, dayEvents, onClose, onSelectEvent }: {
  date: Date; dayEvents: ApiEvent[];
  onClose: () => void; onSelectEvent: (e: ApiEvent) => void;
}) {
  const startY = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'oklch(0 0 0 / 0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="gcard" style={{
        position: 'relative', borderRadius: '24px 24px 0 0', maxHeight: '70vh', display: 'flex', flexDirection: 'column',
        transform: `translateY(${translateY}px)`, transition: dragging ? 'none' : 'transform 0.3s ease',
      }}
        onTouchStart={e => { startY.current = e.touches[0].clientY; setDragging(true); }}
        onTouchMove={e => { const d = e.touches[0].clientY - startY.current; if (d > 0) setTranslateY(d); }}
        onTouchEnd={() => { setDragging(false); if (translateY > 80) onClose(); else setTranslateY(0); }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--line-strong)' }} />
        </div>
        <div style={{ padding: '12px 20px 14px', borderBottom: '1px solid var(--line)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--fg-0)', textTransform: 'capitalize' }}>
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>{dayEvents.length} cita{dayEvents.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ overflowY: 'auto', paddingBottom: 32 }}>
          {dayEvents.map(e => (
            <button key={e.id} onClick={() => onSelectEvent(e)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', background: 'transparent', border: 0, borderBottom: '1px solid var(--line)',
                textAlign: 'left', cursor: 'pointer',
              }}>
              <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 999, background: colorForStatus(e.payment_status) }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--fg-0)', fontSize: 13 }}>{e.title}</p>
                <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                  {format(parseInMVD(e.start), 'HH:mm')} – {format(parseInMVD(e.end), 'HH:mm')}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { token, role } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [selected, setSelected] = useState<SelectedEvent | null>(null);
  const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [daySheet, setDaySheet] = useState<{ date: Date; events: ApiEvent[] } | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newEntry, setNewEntry] = useState<NewEntryState | null>(null);
  const [filterEmployee, setFilterEmployee] = useState<number | null>(null);
  const [mobileConfirm, setMobileConfirm] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, { headers })
      .then(res => setEvents(prev => [
        ...prev.filter(e => e.isBlock),
        ...res.data.map((e: ApiEvent) => ({
          ...e,
          backgroundColor: bgForStatus(e.payment_status),
          borderColor: colorForStatus(e.payment_status),
          textColor: '#ffffff',
        })),
      ])).catch(console.error);

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/metrics`, { headers })
      .then(res => setMetrics(res.data)).catch(console.error);

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blocks`, { headers })
      .then(res => setEvents(prev => [
        ...prev.filter(e => !e.isBlock),
        ...res.data.map((b: { id: number; employee_id: number; start_time: string; end_time: string; reason: string; employee_name: string }) => ({
          id: `block-${b.id}`, title: b.reason || 'Bloqueado',
          start: b.start_time, end: b.end_time,
          backgroundColor: 'oklch(0.22 0.02 240 / 0.55)', borderColor: '#64748b', textColor: '#94a3b8',
          isBlock: true, editable: false, employee_id: b.employee_id, employee_name: b.employee_name,
        })),
      ])).catch(console.error);

    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, { headers }).then(res => setServices(res.data)).catch(console.error);
    if (role === 'owner') {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, { headers }).then(res => setTeam(res.data)).catch(console.error);
    } else if (role === 'employee') {
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, { headers })
        .then(res => setTeam([{ id: res.data.id, name: res.data.name, email: res.data.email, role: 'employee' }]))
        .catch(console.error);
    }
  }, [token]);

  const openNewEntry = (mode: 'block' | 'appointment', start?: Date, end?: Date) => {
    const now = start ?? new Date();
    const defaultEnd = end ?? new Date(now.getTime() + 60 * 60 * 1000);
    setNewEntry({ mode, date: format(now, 'yyyy-MM-dd'), startTime: format(now, 'HH:mm'), endTime: format(defaultEnd, 'HH:mm') });
  };

  const openEventAsSelected = (e: ApiEvent, el?: HTMLElement) => {
    setPopoverTarget(el ?? null);
    setSelected({
      id: e.id, title: e.title, start: parseInMVD(e.start), end: parseInMVD(e.end),
      client_name: e.client_name, client_email: e.client_email,
      payment_status: e.payment_status, price: e.price, employee_name: e.employee_name,
    });
  };

  const handleEventDrop = async (info: EventDropArg) => {
    if (info.event.extendedProps.isBlock) { info.revert(); return; }
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${info.event.id}/reschedule`,
        { start_time: info.event.startStr, end_time: info.event.endStr },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEvents(prev => prev.map(e =>
        e.id === info.event.id ? { ...e, start: info.event.startStr, end: info.event.endStr } : e
      ));
    } catch {
      info.revert();
    }
  };

  const handleEventResize = async (info: EventResizeDoneArg) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${info.event.id}/reschedule`,
        { start_time: info.event.startStr, end_time: info.event.endStr },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEvents(prev => prev.map(e =>
        e.id === info.event.id ? { ...e, start: info.event.startStr, end: info.event.endStr } : e
      ));
    } catch {
      info.revert();
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const ext = info.event.extendedProps;
    const raw: ApiEvent = {
      id: info.event.id, title: info.event.title,
      start: info.event.startStr, end: info.event.endStr,
      client_name: ext.client_name, client_email: ext.client_email,
      payment_status: ext.payment_status, price: ext.price, employee_name: ext.employee_name,
    };
    if (isMobile) {
      const dateStr = info.event.startStr.slice(0, 10);
      const dayEvents = events.filter(e => e.start.slice(0, 10) === dateStr);
      setDaySheet({ date: parseISO(dateStr), events: dayEvents });
    } else {
      openEventAsSelected(raw, info.el);
    }
  };

  const handleDateClick = (arg: { date: Date; dateStr: string }) => {
    if (!isMobile) return;
    const dayEvents = events.filter(e => e.start.slice(0, 10) === arg.dateStr);
    if (dayEvents.length > 0) setDaySheet({ date: arg.date, events: dayEvents });
  };

  const handleCalendarSelect = (info: { start: Date; end: Date; view: { type: string } }) => {
    const isMonthView = info.view.type === 'dayGridMonth';
    if (isMonthView) openNewEntry('appointment', info.start);
    else openNewEntry('appointment', info.start, info.end);
  };

  const filteredEvents = filterEmployee === null ? events : events.filter(e => e.employee_id === filterEmployee);

  return (
    <div className="dash-page">
      {/* Page header */}
      <div className="dash-page__head">
        <div className="dash-page__title-wrap">
          <div className="dash-page__eyebrow"><span className="dash-page__eyebrow-dot" />Vista general</div>
          <h1 className="dash-page__title">Dashboard</h1>
          <p className="dash-page__sub">Resumen de tu negocio</p>
        </div>
        <div className="dash-page__actions">
          <button className="dbtn" onClick={() => openNewEntry('block')}>
            {Icon.ban}<span>Bloquear</span>
          </button>
          <button className="dbtn dbtn--primary" onClick={() => openNewEntry('appointment')}>
            {Icon.plus}<span>Nueva cita</span>
          </button>
        </div>
      </div>

      {/* Getting Started Guide */}
      <GettingStartedGuide />

      {/* KPI Grid */}
      {!metrics ? (
        <div className="kpi-grid kpi-grid--5">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="kpi" style={{ gap: 10 }}>
              <span className="skel" style={{ width: 36, height: 36, borderRadius: 10, animationDelay: `${i * 0.07}s` }} />
              <span className="skel" style={{ height: 28, width: '55%', borderRadius: 8, animationDelay: `${i * 0.07 + 0.05}s` }} />
              <span className="skel" style={{ height: 11, width: '70%', animationDelay: `${i * 0.07 + 0.1}s` }} />
              <span className="skel" style={{ height: 10, width: '45%', animationDelay: `${i * 0.07 + 0.15}s` }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="kpi-grid kpi-grid--5">
          <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/appointments')}>
            <div className="kpi__icon">{Icon.cal}</div>
            <div className="kpi__value">{metrics.total_appointments}</div>
            <div className="kpi__label">Citas totales</div>
            <div className="kpi__hint">{metrics.this_month} este mes</div>
          </div>
          <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/appointments?status=paid')}>
            <div className="kpi__icon kpi__icon--green">{Icon.bag}</div>
            <div className="kpi__value">{metrics.paid_count}</div>
            <div className="kpi__label">Señas cobradas</div>
            <div className="kpi__hint">pago parcial</div>
          </div>
          <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/appointments?status=full_payment')}>
            <div className="kpi__icon kpi__icon--cyan">{Icon.bag}</div>
            <div className="kpi__value">{metrics.full_payment_count}</div>
            <div className="kpi__label">Pagos completos</div>
            <div className="kpi__hint">pago total</div>
          </div>
          <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/analytics')}>
            <div className="kpi__icon">{Icon.trend}</div>
            <div className="kpi__value kpi__value--small">
              ${parseFloat(metrics.revenue_total).toLocaleString('es-UY', { minimumFractionDigits: 0 })}
            </div>
            <div className="kpi__label">Ingresos totales</div>
            <div className="kpi__hint">${parseFloat(metrics.revenue_month).toLocaleString('es-UY', { minimumFractionDigits: 0 })} este mes</div>
          </div>
          <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/appointments?status=pending')}>
            <div className="kpi__icon kpi__icon--orange">{Icon.alert}</div>
            <div className="kpi__value">{metrics.pending_count}</div>
            <div className="kpi__label">Pagos pendientes</div>
            <div className="kpi__hint">sin confirmar</div>
          </div>
        </div>
      )}

      {/* Filter row */}
      <div className="filter-row">
        <button
          className={`chip${filterEmployee === null ? ' is-active' : ''}`}
          onClick={() => setFilterEmployee(null)}
        >
          Todos
        </button>
        {team.map(m => (
          <button
            key={m.id}
            className={`chip${filterEmployee === m.id ? ' is-active' : ''}`}
            onClick={() => setFilterEmployee(filterEmployee === m.id ? null : m.id)}
          >
            {m.name || m.email}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div className="cal-legend">
          {[
            { color: STATUS_COLOR.paid,          label: 'Seña cobrada' },
            { color: STATUS_COLOR.pending,       label: 'Pago pendiente' },
            { color: STATUS_COLOR.not_required,  label: 'Sin cobro' },
            { color: '#64748b',                  label: 'Bloqueado' },
          ].map(({ color, label }) => (
            <span key={label} className="cal-legend__item">
              <span className="cal-legend__dot" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* FullCalendar wrapped with handoff styles */}
      <div className="dash-fc-wrap">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          timeZone="local"
          events={filteredEvents}
          locale="es"
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          height="auto"
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          eventContent={(arg) => {
            const isGrid = arg.view.type === 'dayGridMonth';
            const status = arg.event.extendedProps.payment_status as string | undefined;
            const isBlock = arg.event.extendedProps.isBlock as boolean | undefined;
            const dotColor = isBlock ? '#64748b' : colorForStatus(status);
            if (isMobile && isGrid) {
              return <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: dotColor }} />;
            }
            const timeStr = arg.event.start
              ? `${String(arg.event.start.getHours()).padStart(2, '0')}:${String(arg.event.start.getMinutes()).padStart(2, '0')}`
              : '';
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '1px 5px', overflow: 'hidden', width: '100%' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor, flexShrink: 0, opacity: 0.9 }} />
                <span style={{ fontSize: 10.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, color: isBlock ? '#94a3b8' : '#fff' }}>
                  {timeStr} {arg.event.title}
                </span>
              </div>
            );
          }}
          editable={!isMobile}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          selectable={!isMobile}
          select={handleCalendarSelect}
          headerToolbar={isMobile
            ? { left: 'prev,next', center: 'title', right: 'today' }
            : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }
          }
        />
      </div>

      {/* Desktop event popover */}
      {selected && !isMobile && (
        <EventPopover
          target={popoverTarget}
          event={selected}
          onClose={() => { setSelected(null); setPopoverTarget(null); }}
          onCancel={id => setEvents(ev => ev.filter(e => String(e.id) !== id))}
        />
      )}

      {/* Mobile day sheet */}
      {daySheet && isMobile && (
        <DaySheet
          date={daySheet.date}
          dayEvents={daySheet.events}
          onClose={() => setDaySheet(null)}
          onSelectEvent={e => {
            setDaySheet(null);
            openEventAsSelected(e);
          }}
        />
      )}

      {/* Mobile event confirm */}
      {mobileConfirm && selected && (
        <ConfirmModal
          title={selected.id.startsWith('block-') ? 'Eliminar bloqueo' : 'Cancelar cita'}
          body={selected.id.startsWith('block-') ? 'Se eliminará este bloqueo.' : '¿Cancelar esta cita?'}
          confirmLabel="Confirmar"
          onConfirm={async () => {
            try {
              if (selected.id.startsWith('block-')) {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/blocks/${selected.id.replace('block-', '')}`);
              } else {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${selected.id}`);
              }
              setEvents(ev => ev.filter(e => String(e.id) !== selected.id));
              setSelected(null); setMobileConfirm(false);
            } catch { setMobileConfirm(false); }
          }}
          onClose={() => setMobileConfirm(false)}
        />
      )}

      {/* New entry modal */}
      {newEntry && token && (
        <NewEntryModal
          initial={newEntry}
          token={token}
          services={services}
          team={team}
          onClose={() => setNewEntry(null)}
          onCreated={event => setEvents(prev => [...prev, event])}
        />
      )}
    </div>
  );
}
