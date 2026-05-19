'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Check, ArrowLeft, CreditCard, Calendar, Clock, User } from 'lucide-react';

type Employee = { id: number; name: string };
type Business = {
    name?: string;
    brand_color?: string | null;
    payment_mode: 'disabled' | 'deposit' | 'full';
    deposit_percentage: number;
    mp_connected: boolean;
    allow_cash?: boolean;
    allow_transfer?: boolean;
    transfer_info?: string | null;
};
type Step = 'employee' | 'datetime' | 'info' | 'payment' | 'done';

const BASE_STEP_LABELS = ['Profesional', 'Fecha y hora', 'Tus datos'];

function BookingContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const serviceId = searchParams.get('serviceId');
    const serviceName = searchParams.get('serviceName') || 'Servicio';
    const servicePrice = parseFloat(searchParams.get('servicePrice') || '0');
    const branchId = searchParams.get('branchId');

    const [step, setStep] = useState<Step>('employee');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [business, setBusiness] = useState<Business | null>(null);
    const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
    const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'cash' | 'transfer' | ''>('');

    const brandColor = business?.brand_color || '#6366f1';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i + weekOffset * 7));

    const mpEnabled = business && business.payment_mode !== 'disabled' && business.mp_connected;
    const altMethods = business ? [
        ...(business.allow_cash ? [{ value: 'cash' as const, label: 'Efectivo', desc: 'Pagás el día del turno' }] : []),
        ...(business.allow_transfer ? [{ value: 'transfer' as const, label: 'Transferencia', desc: 'Transferís antes del turno' }] : []),
    ] : [];
    const hasMultiplePaymentMethods = (mpEnabled ? 1 : 0) + altMethods.length > 1;
    const needsMpPayment = mpEnabled && (!hasMultiplePaymentMethods || paymentMethod === 'mercadopago');
    const needsPayment = needsMpPayment;
    const stepLabels = needsMpPayment ? [...BASE_STEP_LABELS, 'Pago'] : BASE_STEP_LABELS;
    const stepKeys: Step[] = needsMpPayment ? ['employee', 'datetime', 'info', 'payment'] : ['employee', 'datetime', 'info'];
    const stepIndex = stepKeys.indexOf(step);
    const progress = stepLabels.length <= 1 ? 100 : (stepIndex / (stepLabels.length - 1)) * 100;

    useEffect(() => {
        if (!slug) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}`)
            .then(res => setBusiness(res.data))
            .catch(console.error);
        if (serviceId) {
            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/public/services/${serviceId}/employees${branchId ? `?branchId=${branchId}` : ''}`;
            axios.get(url)
                .then(res => setEmployees(res.data))
                .catch(console.error);
        }
    }, [slug, serviceId, branchId]);

    const handleDateSelect = async (dateStr: string) => {
        setSelectedDate(dateStr);
        setSelectedSlot('');
        setSlots([]);
        setLoadingSlots(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/availability`, {
                params: { date: dateStr, serviceId, employeeId: selectedEmployee?.id },
            });
            setSlots(res.data);
            if (res.data.length === 0) {
                setUnavailableDates(prev => new Set(prev).add(dateStr));
            }
        } catch { setSlots([]); }
        finally { setLoadingSlots(false); }
    };

    const handleSubmitFree = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasMultiplePaymentMethods && !paymentMethod) { setError('Seleccioná un método de pago.'); return; }
        setError('');
        setSubmitting(true);
        const method = hasMultiplePaymentMethods ? paymentMethod : (mpEnabled ? 'mercadopago' : altMethods[0]?.value);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/appointments`, {
                serviceId: parseInt(serviceId!),
                employeeId: selectedEmployee?.id,
                startTime: `${selectedDate}T${selectedSlot}:00`,
                clientName,
                clientEmail,
                paymentMethod: method || undefined,
            });
            setStep('done');
        } catch {
            setError('No se pudo crear la cita. El horario puede no estar disponible.');
        } finally { setSubmitting(false); }
    };

    const handlePay = async () => {
        setError('');
        setSubmitting(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/pay`, {
                serviceId: parseInt(serviceId!),
                employeeId: selectedEmployee?.id,
                startTime: `${selectedDate}T${selectedSlot}:00`,
                clientName,
                clientEmail,
            });
            window.location.href = res.data.init_point;
        } catch {
            setError('No se pudo iniciar el pago. Intenta de nuevo.');
            setSubmitting(false);
        }
    };

    const payAmount = business?.payment_mode === 'deposit'
        ? Math.round(servicePrice * ((business.deposit_percentage ?? 30) / 100) * 100) / 100
        : servicePrice;

    const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 text-sm";

    /* ── Done screen ─────────────────────────────────────────────── */
    if (step === 'done') {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-[#0c0c0f] flex flex-col items-center justify-center px-4 py-16">
                <div className="w-full max-w-sm">
                    {/* Checkmark */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full flex items-center justify-center"
                                style={{ background: `${brandColor}15` }}>
                                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ background: brandColor }}>
                                    <Check size={32} className="text-white" strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2">¡Reserva confirmada!</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
                        Te enviamos los detalles a <strong className="text-slate-700 dark:text-slate-300">{clientEmail}</strong>
                    </p>

                    {/* Summary */}
                    <div className="bg-white dark:bg-[#18181c] rounded-2xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/30 mb-6">
                        <div className="p-1">
                            {[
                                { icon: <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: brandColor }}>{serviceName.charAt(0)}</div>, label: 'Servicio', value: serviceName },
                                { icon: <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/10"><User size={14} className="text-slate-500 dark:text-slate-400" /></div>, label: 'Profesional', value: selectedEmployee?.name || '' },
                                { icon: <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/10"><Calendar size={14} className="text-slate-500 dark:text-slate-400" /></div>, label: 'Fecha', value: format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es }) },
                                { icon: <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/10"><Clock size={14} className="text-slate-500 dark:text-slate-400" /></div>, label: 'Hora', value: selectedSlot },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3 p-3 rounded-xl">
                                    {icon}
                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{label}</span>
                                        <span className="text-sm font-semibold text-slate-800 dark:text-white capitalize truncate ml-4">{value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <a href={`/public/${slug}`}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        Volver al inicio
                    </a>
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-600 mt-12">Reservas online con <span className="font-semibold">Novu</span></p>
            </div>
        );
    }

    /* ── Booking flow ─────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-[#0c0c0f] flex flex-col">

            {/* Top bar */}
            <div className="bg-white dark:bg-[#18181c] border-b border-slate-200/60 dark:border-white/5 px-4 py-3.5 flex items-center gap-3">
                <a href={`/public/${slug}`}
                    className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400 flex-shrink-0">
                    <ArrowLeft size={17} />
                </a>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{business?.name || ''}</p>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{serviceName}</p>
                </div>
                <div className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: brandColor }}>
                    ${servicePrice.toFixed(2)}
                </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white dark:bg-[#18181c] px-4 pb-4 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex justify-between mb-2.5 max-w-xl mx-auto">
                    {stepLabels.map((label, i) => (
                        <span key={i} className="text-[11px] font-medium transition-colors duration-300"
                            style={{ color: i <= stepIndex ? brandColor : '#94a3b8' }}>
                            {label}
                        </span>
                    ))}
                </div>
                <div className="h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden max-w-xl mx-auto">
                    <div className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%`, background: brandColor }} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
                <div className="bg-white dark:bg-[#18181c] rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden">

                    {/* Step: Employee */}
                    {step === 'employee' && (
                        <div className="p-5">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-1">Elegí un profesional</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">¿Con quién querés reservar?</p>
                            {employees.length === 0 ? (
                                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-6">No hay profesionales disponibles para este servicio.</p>
                            ) : (
                                <div className="space-y-2">
                                    {employees.map(emp => (
                                        <button key={emp.id}
                                            onClick={() => { setSelectedEmployee(emp); setUnavailableDates(new Set()); setStep('datetime'); }}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/8 hover:border-transparent transition-all duration-200 text-left group"
                                            style={{}}
                                            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColor}50`, e.currentTarget.style.background = `${brandColor}08`)}
                                            onMouseLeave={e => (e.currentTarget.style.boxShadow = '', e.currentTarget.style.background = '')}>
                                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                                                style={{ background: brandColor, boxShadow: `0 4px 14px ${brandColor}40` }}>
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="flex-1 font-semibold text-slate-800 dark:text-white text-sm">{emp.name}</span>
                                            <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step: Date + time */}
                    {step === 'datetime' && (
                        <div className="p-5">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-1">Elegí fecha y hora</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Con {selectedEmployee?.name}</p>

                            {/* Week navigation */}
                            <div className="flex items-center justify-between mb-3">
                                <button onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); setSelectedDate(''); setSlots([]); setSelectedSlot(''); }}
                                    disabled={weekOffset === 0}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-25 transition-all">
                                    <ChevronLeft size={17} className="text-slate-600 dark:text-slate-300" />
                                </button>
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                                    {format(weekDays[0], "d MMM", { locale: es })} – {format(weekDays[6], "d MMM yyyy", { locale: es })}
                                </span>
                                <button onClick={() => { setWeekOffset(w => w + 1); setSelectedDate(''); setSlots([]); setSelectedSlot(''); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                    <ChevronRight size={17} className="text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>

                            {/* Day grid */}
                            <div className="grid grid-cols-7 gap-1 mb-5">
                                {weekDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const isSelected = selectedDate === dateStr;
                                    const isPast = day < today;
                                    const isUnavailable = unavailableDates.has(dateStr);
                                    const isDisabled = isPast || isUnavailable;
                                    return (
                                        <button key={dateStr} disabled={isDisabled} onClick={() => handleDateSelect(dateStr)}
                                            className="flex flex-col items-center py-2.5 rounded-xl transition-all duration-200"
                                            style={isSelected ? { background: brandColor, boxShadow: `0 4px 16px ${brandColor}45` } : {}}
                                            onMouseEnter={e => !isSelected && !isDisabled && (e.currentTarget.style.background = `${brandColor}12`)}
                                            onMouseLeave={e => !isSelected && (e.currentTarget.style.background = '')}>
                                            <span className="text-[10px] mb-1 capitalize font-medium"
                                                style={{ color: isSelected ? 'rgba(255,255,255,0.75)' : isDisabled ? '#cbd5e1' : '#94a3b8' }}>
                                                {format(day, 'EEE', { locale: es }).slice(0, 2)}
                                            </span>
                                            <span className="text-sm font-bold"
                                                style={{ color: isSelected ? '#fff' : isDisabled ? '#cbd5e1' : '' }}>
                                                {format(day, 'd')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time slots */}
                            {selectedDate && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Horarios disponibles</p>
                                    {loadingSlots ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1,2,3,4,5,6,7,8].map(i => (
                                                <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Sin disponibilidad este día</p>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                            {slots.map(slot => {
                                                const isSel = selectedSlot === slot;
                                                return (
                                                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                                                        className="py-2.5 text-sm rounded-xl font-semibold transition-all duration-200"
                                                        style={isSel
                                                            ? { background: brandColor, color: '#fff', boxShadow: `0 4px 14px ${brandColor}45` }
                                                            : { background: '#f1f5f9', color: '#475569' }}
                                                        onMouseEnter={e => !isSel && (e.currentTarget.style.background = `${brandColor}15`, e.currentTarget.style.color = brandColor)}
                                                        onMouseLeave={e => !isSel && (e.currentTarget.style.background = '#f1f5f9', e.currentTarget.style.color = '#475569')}>
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep('employee')}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    Volver
                                </button>
                                <button disabled={!selectedSlot} onClick={() => setStep('info')}
                                    className="flex-1 py-3 text-white rounded-xl text-sm font-bold disabled:opacity-30 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                                    style={{ background: brandColor, boxShadow: `0 4px 20px ${brandColor}45` }}>
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step: Client info */}
                    {step === 'info' && (
                        <div className="p-5">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-1">Tus datos</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5 capitalize">
                                {format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es })} · {selectedSlot} · {selectedEmployee?.name}
                            </p>

                            <form onSubmit={needsMpPayment && paymentMethod !== 'cash' && paymentMethod !== 'transfer' ? (e) => { e.preventDefault(); setStep('payment'); } : handleSubmitFree} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Nombre completo</label>
                                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                                        className={inputCls} style={{ '--tw-ring-color': brandColor } as React.CSSProperties}
                                        placeholder="Tu nombre completo" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Email</label>
                                    <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                                        className={inputCls}
                                        placeholder="tu@email.com" required />
                                </div>

                                {/* Payment method selector */}
                                {hasMultiplePaymentMethods && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Método de pago</label>
                                        <div className="space-y-2">
                                            {mpEnabled && (
                                                <button type="button" onClick={() => setPaymentMethod('mercadopago')}
                                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${paymentMethod === 'mercadopago' ? 'border-[--bc] bg-[--bc]/10' : 'border-slate-200 dark:border-white/10'}`}
                                                    style={{ '--bc': brandColor } as React.CSSProperties}>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">MercadoPago</p>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500">Pago online seguro</p>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'mercadopago' ? 'border-[--bc]' : 'border-slate-300 dark:border-white/20'}`}
                                                        style={{ '--bc': brandColor } as React.CSSProperties}>
                                                        {paymentMethod === 'mercadopago' && <div className="w-2 h-2 rounded-full" style={{ background: brandColor }} />}
                                                    </div>
                                                </button>
                                            )}
                                            {altMethods.map(m => (
                                                <div key={m.value}>
                                                    <button type="button" onClick={() => setPaymentMethod(m.value)}
                                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${paymentMethod === m.value ? 'border-[--bc] bg-[--bc]/10' : 'border-slate-200 dark:border-white/10'}`}
                                                        style={{ '--bc': brandColor } as React.CSSProperties}>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{m.label}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500">{m.desc}</p>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.value ? 'border-[--bc]' : 'border-slate-300 dark:border-white/20'}`}
                                                            style={{ '--bc': brandColor } as React.CSSProperties}>
                                                            {paymentMethod === m.value && <div className="w-2 h-2 rounded-full" style={{ background: brandColor }} />}
                                                        </div>
                                                    </button>
                                                    {paymentMethod === 'transfer' && m.value === 'transfer' && business?.transfer_info && (
                                                        <div className="mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                            {business.transfer_info}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setStep('datetime')}
                                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        Volver
                                    </button>
                                    <button type="submit" disabled={submitting}
                                        className="flex-1 py-3 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                                        style={{ background: brandColor, boxShadow: `0 4px 20px ${brandColor}45` }}>
                                        {submitting ? 'Reservando...' : (needsMpPayment && paymentMethod !== 'cash' && paymentMethod !== 'transfer') ? 'Continuar al pago' : 'Confirmar reserva'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step: Payment */}
                    {step === 'payment' && (
                        <div className="p-5">
                            <h2 className="font-bold text-slate-900 dark:text-white mb-1">Resumen del pago</h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Serás redirigido a MercadoPago de forma segura.</p>

                            <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 mb-5 space-y-3 text-sm">
                                {[
                                    { label: 'Servicio', value: serviceName },
                                    { label: 'Profesional', value: selectedEmployee?.name },
                                    { label: 'Fecha', value: format(parseISO(selectedDate), "EEEE d 'de' MMMM", { locale: es }) },
                                    { label: 'Hora', value: selectedSlot },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between">
                                        <span className="text-slate-400 dark:text-slate-500">{label}</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{value}</span>
                                    </div>
                                ))}
                                <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex justify-between items-center">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        {business?.payment_mode === 'deposit' ? `Seña (${business.deposit_percentage}%)` : 'Total'}
                                    </span>
                                    <span className="text-xl font-bold" style={{ color: brandColor }}>${payAmount.toFixed(2)}</span>
                                </div>
                                {business?.payment_mode === 'deposit' && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500">El resto se abona en el local.</p>
                                )}
                            </div>

                            {error && <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>}

                            <div className="flex gap-3">
                                <button onClick={() => setStep('info')}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    Volver
                                </button>
                                <button onClick={handlePay} disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#009ee3] hover:bg-[#007eb5] text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-all active:scale-[0.98] shadow-lg shadow-sky-500/25">
                                    <CreditCard size={15} />
                                    {submitting ? 'Redirigiendo...' : 'Pagar con MercadoPago'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center pb-8">
                <p className="text-xs text-slate-400 dark:text-slate-600">
                    Reservas online con <span className="font-semibold text-slate-500 dark:text-slate-500">Novu</span>
                </p>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0c0c0f]">
                <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}
