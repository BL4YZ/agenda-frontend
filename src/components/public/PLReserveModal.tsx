'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import type { Shop, Service } from '@/types/public';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

/* ── icons ── */
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5 9-11"/>
  </svg>
);

type Step = 0 | 1 | 2 | 3;

interface Employee { id: number; name: string }

interface Props {
  open: boolean;
  onClose: () => void;
  shop: Shop;
  /** Pre-select a service when the modal opens */
  initialServiceId?: number | null;
  /** Filter employees by branch */
  initialBranchId?: number | null;
}

const STEP_TITLES: Record<Step, string> = {
  0: 'Elegí servicio',
  1: 'Elegí fecha y hora',
  2: 'Tus datos',
  3: '¡Listo!',
};
const STEP_SUBS: Record<Step, string> = {
  0: 'Seleccioná el servicio que necesitás',
  1: 'Disponibilidad en tiempo real',
  2: 'Confirmamos tu reserva',
  3: 'Te enviamos los detalles',
};

type PaymentMethodOption = { value: 'mercadopago' | 'cash' | 'transfer'; label: string; desc: string };

function getAvailableMethods(shop: Shop): PaymentMethodOption[] {
  const methods: PaymentMethodOption[] = [];
  if (shop.mp_connected && shop.payment_mode !== 'disabled')
    methods.push({ value: 'mercadopago', label: 'MercadoPago', desc: 'Pago online seguro' });
  if (shop.allow_cash)
    methods.push({ value: 'cash', label: 'Efectivo', desc: 'Pagás el día del turno' });
  if (shop.allow_transfer)
    methods.push({ value: 'transfer', label: 'Transferencia', desc: 'Transferís antes del turno' });
  return methods;
}

export default function PLReserveModal({ open, onClose, shop, initialServiceId, initialBranchId }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [svc, setSvc] = useState<Service | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slot, setSlot] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'cash' | 'transfer' | ''>('');

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = 'pl-modal-title';

  /* pre-select service if provided */
  useEffect(() => {
    if (open && initialServiceId) {
      const found = shop.services.find(s => s.id === initialServiceId);
      if (found) { setSvc(found); setStep(1); }
    }
    if (!open) {
      // reset state when closed
      setStep(0); setSvc(null); setEmployees([]); setEmployeeId('');
      setMonthOffset(0); setSelectedDate(''); setSlots([]); setSlot('');
      setClientName(''); setClientPhone(''); setClientEmail('');
      setSubmitting(false); setError(''); setPaymentMethod('');
    }
  }, [open, initialServiceId, shop.services]);

  /* focus trap */
  useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const modal = modalRef.current;
    if (!modal) return;

    const focusable = () => Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.closest('[hidden]'));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const els = focusable();
      if (!els.length) return;
      const first = els[0]; const last = els[els.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, step]);

  /* block body scroll */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* fetch employees when service is chosen, filtered by branch if provided */
  useEffect(() => {
    if (!svc) return;
    const url = initialBranchId
      ? `${API}/api/public/services/${svc.id}/employees?branchId=${initialBranchId}`
      : `${API}/api/public/services/${svc.id}/employees`;
    axios.get(url)
      .then(r => setEmployees(r.data))
      .catch(() => setEmployees([]));
  }, [svc, initialBranchId]);

  /* fetch availability */
  const fetchSlots = useCallback(async (date: string) => {
    if (!svc) return;
    setLoadingSlots(true); setSlots([]); setSlot('');
    try {
      const params: Record<string, unknown> = { date, serviceId: svc.id };
      if (employeeId) params.employeeId = employeeId;
      const r = await axios.get(`${API}/api/public/businesses/${shop.slug}/availability`, { params });
      setSlots(r.data);
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  }, [svc, employeeId, shop.slug]);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Monthly calendar
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth  = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 0).getDate();
  const firstDow     = (firstOfMonth.getDay() + 6) % 7; // Mon=0 … Sun=6
  const calendarDays: (Date | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), i + 1)),
  ];
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const handleSubmit = async () => {
    if (!svc || !selectedDate || !slot || !clientName || !clientPhone || !clientEmail) return;
    const availableMethods = getAvailableMethods(shop);
    if (availableMethods.length > 1 && !paymentMethod) {
      setError('Seleccioná un método de pago.');
      return;
    }
    setError(''); setSubmitting(true);
    try {
      const resolvedEmployeeId = employeeId || employees[0]?.id;
      const method = availableMethods.length === 1 ? availableMethods[0].value : paymentMethod;
      await axios.post(`${API}/api/public/businesses/${shop.slug}/appointments`, {
        serviceId: svc.id,
        employeeId: resolvedEmployeeId,
        startTime: `${selectedDate}T${slot}:00`,
        clientName,
        clientPhone,
        clientEmail,
        paymentMethod: method || undefined,
      });
      setStep(3);
    } catch {
      setError('No se pudo confirmar la reserva. El horario puede no estar disponible.');
    } finally { setSubmitting(false); }
  };

  if (!open) return null;

  return (
    <div
      className="pl-modal-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      role="presentation"
    >
      <div
        className="pl-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Header */}
        <div className="pl-modal__head">
          <div>
            <h3 className="pl-modal__title" id={titleId}>{STEP_TITLES[step]}</h3>
            <p className="pl-modal__sub">{STEP_SUBS[step]}</p>
          </div>
          <button
            ref={closeBtnRef}
            className="pl-modal__close"
            onClick={onClose}
            aria-label="Cerrar modal de reserva"
          >×</button>
        </div>

        {/* Progress */}
        <div className="pl-step-row" role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={3} aria-label={`Paso ${step + 1} de 4`}>
          {([0, 1, 2, 3] as Step[]).map(i => (
            <div key={i} className={`pl-step${i < step ? ' is-done' : ''}${i === step ? ' is-current' : ''}`} />
          ))}
        </div>

        {/* ── Step 0: Choose service ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shop.services.map(s => (
              <button
                key={s.id}
                onClick={() => { setSvc(s); setStep(1); }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px', borderRadius: 12,
                  background: 'var(--pl-glass)', border: '1px solid var(--pl-glass-border)',
                  cursor: 'pointer', fontFamily: 'inherit', color: 'var(--pl-fg)', textAlign: 'left',
                  transition: 'border-color 0.2s',
                }}
                aria-label={`Seleccionar ${s.name}, ${s.duration_minutes} minutos${s.price > 0 ? `, $${s.price.toLocaleString('es-UY')}` : ''}`}
              >
                <div>
                  <div style={{ fontFamily: 'var(--pl-font-display)', fontSize: 16, fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--pl-fg-mute)', fontFamily: 'var(--pl-font-mono)', marginTop: 3 }}>
                    ⏱ {s.duration_minutes} MIN
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--pl-font-display)', fontWeight: 600, color: 'var(--pl-accent)' }}>
                  {s.price > 0 ? `$${s.price.toLocaleString('es-UY')}` : '—'}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Step 1: Date / time ── */}
        {step === 1 && svc && (
          <div>
            {employees.length > 1 && (
              <div className="pl-modal__field">
                <label className="pl-modal__label" htmlFor="employee-select">PROFESIONAL</label>
                <select
                  id="employee-select"
                  className="pl-modal__input"
                  value={employeeId}
                  onChange={e => {
                    setEmployeeId(e.target.value ? Number(e.target.value) : '');
                    if (selectedDate) fetchSlots(selectedDate);
                  }}
                >
                  <option value="">Cualquiera disponible</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Month nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--pl-fg)', cursor: 'pointer', padding: 4, borderRadius: 8 }}
                disabled={monthOffset === 0}
                onClick={() => { setMonthOffset(m => Math.max(0, m - 1)); setSelectedDate(''); setSlots([]); setSlot(''); }}
                aria-label="Mes anterior"
              >‹</button>
              <span style={{ fontFamily: 'var(--pl-font-mono)', fontSize: 11, color: 'var(--pl-fg-mute)', textTransform: 'capitalize' }}>
                {format(firstOfMonth, "MMMM yyyy", { locale: es })}
              </span>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--pl-fg)', cursor: 'pointer', padding: 4, borderRadius: 8 }}
                onClick={() => { setMonthOffset(m => m + 1); setSelectedDate(''); setSlots([]); setSlot(''); }}
                aria-label="Mes siguiente"
              >›</button>
            </div>

            {/* Day grid */}
            <div className="pl-day-grid" style={{ marginBottom: 18 }} role="group" aria-label="Seleccioná un día">
              {['L','M','X','J','V','S','D'].map(d => (
                <div key={d} style={{
                  textAlign: 'center', fontSize: 10, color: 'var(--pl-fg-mute)',
                  padding: '4px 0', fontFamily: 'var(--pl-font-mono)', letterSpacing: '0.12em',
                }} aria-hidden="true">{d}</div>
              ))}
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr = format(day, 'yyyy-MM-dd');
                const isPast   = day < today;
                const isSunday = day.getDay() === 0;
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    className={`pl-day${isSelected ? ' is-active' : ''}`}
                    disabled={isPast || isSunday}
                    onClick={() => { setSelectedDate(dateStr); fetchSlots(dateStr); }}
                    aria-label={format(day, "EEEE d 'de' MMMM", { locale: es })}
                    aria-pressed={isSelected}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <>
                <div style={{ fontFamily: 'var(--pl-font-mono)', fontSize: 11, color: 'var(--pl-fg-mute)', marginBottom: 8 }}>
                  HORARIOS DISPONIBLES
                </div>
                {loadingSlots ? (
                  <div className="pl-slots">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} style={{
                        height: 36, borderRadius: 8,
                        background: 'var(--pl-glass)', animation: 'plFadeIn 1s ease infinite alternate',
                      }} />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--pl-fg-mute)', textAlign: 'center', padding: '12px 0' }}>
                    Sin disponibilidad este día
                  </p>
                ) : (
                  <div className="pl-slots" role="group" aria-label="Horarios disponibles">
                    {slots.map(s => (
                      <button
                        key={s}
                        className={`pl-slot${slot === s ? ' is-active' : ''}`}
                        onClick={() => setSlot(s)}
                        aria-pressed={slot === s}
                        aria-label={`Hora ${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="pl-btn" style={{ flex: 1 }} onClick={() => setStep(0)}>Atrás</button>
              <button
                className="pl-btn pl-btn--primary"
                style={{ flex: 2, justifyContent: 'center' }}
                disabled={!selectedDate || !slot}
                onClick={() => setStep(2)}
              >
                Continuar <ArrowIcon />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Customer data ── */}
        {step === 2 && svc && (
          <div>
            <div className="pl-modal__field">
              <label className="pl-modal__label" htmlFor="modal-name">NOMBRE COMPLETO *</label>
              <input
                id="modal-name"
                className="pl-modal__input"
                type="text"
                placeholder="Tu nombre"
                required
                autoComplete="name"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
              />
            </div>
            <div className="pl-modal__field">
              <label className="pl-modal__label" htmlFor="modal-phone">TELÉFONO *</label>
              <input
                id="modal-phone"
                className="pl-modal__input"
                type="tel"
                placeholder="+598 99 000 000"
                required
                autoComplete="tel"
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
              />
            </div>
            <div className="pl-modal__field">
              <label className="pl-modal__label" htmlFor="modal-email">EMAIL *</label>
              <input
                id="modal-email"
                className="pl-modal__input"
                type="email"
                placeholder="email@ejemplo.com"
                required
                autoComplete="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
              />
            </div>

            {/* Payment method selector */}
            {(() => {
              const methods = getAvailableMethods(shop);
              if (methods.length <= 1) return null;
              return (
                <div className="pl-modal__field">
                  <label className="pl-modal__label">MÉTODO DE PAGO</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {methods.map(m => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setPaymentMethod(m.value)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                          fontFamily: 'inherit', textAlign: 'left',
                          border: `1px solid ${paymentMethod === m.value ? 'var(--pl-accent)' : 'var(--pl-glass-border)'}`,
                          background: paymentMethod === m.value ? 'oklch(0.3 0.06 280 / 0.25)' : 'var(--pl-glass)',
                          transition: 'border-color .2s, background .2s',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: paymentMethod === m.value ? 'var(--pl-accent)' : 'var(--pl-fg)' }}>{m.label}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--pl-fg-mute)', marginTop: 2 }}>{m.desc}</div>
                        </div>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${paymentMethod === m.value ? 'var(--pl-accent)' : 'var(--pl-glass-border)'}`,
                          background: paymentMethod === m.value ? 'var(--pl-accent)' : 'transparent',
                          display: 'grid', placeItems: 'center',
                        }}>
                          {paymentMethod === m.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                        </div>
                      </button>
                    ))}
                    {paymentMethod === 'transfer' && shop.transfer_info && (
                      <div style={{
                        padding: '12px 14px', borderRadius: 12, fontSize: 12.5, lineHeight: 1.6,
                        background: 'var(--pl-glass)', border: '1px solid var(--pl-glass-border)',
                        color: 'var(--pl-fg-soft)', whiteSpace: 'pre-wrap',
                      }}>
                        {shop.transfer_info}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Summary */}
            <div className="pl-modal__summary">
              <div className="pl-modal__summary-label">RESUMEN</div>
              <div>{svc.name} · {svc.duration_minutes} min</div>
              <div style={{ color: 'var(--pl-fg-soft)', fontSize: 12, marginTop: 2 }}>
                {format(new Date(selectedDate + 'T00:00'), "EEEE d 'de' MMMM", { locale: es })} a las {slot}
              </div>
              {employees.length > 0 && employeeId && (
                <div style={{ color: 'var(--pl-fg-soft)', fontSize: 12, marginTop: 2 }}>
                  Con {employees.find(e => e.id === employeeId)?.name ?? 'profesional asignado'}
                </div>
              )}
              <div className="pl-modal__summary-total">
                <strong>Total</strong>
                <strong style={{ color: 'var(--pl-accent)' }}>
                  {svc.price > 0 ? `$${svc.price.toLocaleString('es-UY')}` : 'Sin cargo'}
                </strong>
              </div>
            </div>

            {error && (
              <p role="alert" style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="pl-btn" style={{ flex: 1 }} onClick={() => setStep(1)}>Atrás</button>
              <button
                className="pl-btn pl-btn--primary"
                style={{ flex: 2, justifyContent: 'center' }}
                disabled={submitting || !clientName || !clientPhone || !clientEmail}
                onClick={handleSubmit}
                aria-busy={submitting}
              >
                {submitting ? 'Confirmando…' : <>{' '}Confirmar reserva <ArrowIcon /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto 18px',
              background: 'linear-gradient(135deg, #6ee7b7, #059669)',
              display: 'grid', placeItems: 'center',
            }} aria-hidden="true">
              <CheckIcon />
            </div>
            <h3 style={{
              fontFamily: 'var(--pl-font-display)', fontSize: 24,
              margin: 0, fontWeight: 500,
            }}>¡Reserva confirmada!</h3>
            <p style={{ color: 'var(--pl-fg-soft)', fontSize: 14, margin: '8px 0 18px' }}>
              Te enviamos la confirmación a <strong>{clientEmail}</strong>. Desde ese email podés cancelar si necesitás. ¡Te esperamos!
            </p>
            <button className="pl-btn pl-btn--primary" style={{ justifyContent: 'center' }} onClick={onClose}>
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
