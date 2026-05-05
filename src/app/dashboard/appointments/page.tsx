'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';

type Appointment = {
    id: string;
    title: string;
    start: string;
    end: string;
    client_name?: string;
    client_email?: string;
    payment_status?: string;
    price?: string;
    amount_paid?: string;
    employee_name?: string;
};

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'paid', label: 'Seña cobrada' },
    { value: 'full_payment', label: 'Pago completo' },
    { value: 'pending', label: 'Pago pendiente' },
    { value: 'not_required', label: 'Sin cobro' },
];

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
    paid:         { label: 'Seña cobrada',   cls: 'status-pill status-pill--seal' },
    full_payment: { label: 'Pago completo',  cls: 'status-pill status-pill--paid' },
    pending:      { label: 'Pago pendiente', cls: 'status-pill status-pill--pending' },
    not_required: { label: 'Sin cobro',      cls: 'status-pill status-pill--blocked' },
};

const STATUS_DROPDOWN_OPTS = [
    { value: 'paid',         label: 'Seña cobrada',   cls: 'status-pill status-pill--seal' },
    { value: 'full_payment', label: 'Pago completo',  cls: 'status-pill status-pill--paid' },
    { value: 'pending',      label: 'Pago pendiente', cls: 'status-pill status-pill--pending' },
    { value: 'not_required', label: 'Sin cobro',      cls: 'status-pill status-pill--blocked' },
];

const IcoChev = (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IcoTrash = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1.75 3.5H12.25M5.25 3.5V2.333A.583.583 0 0 1 5.833 1.75h2.334A.583.583 0 0 1 8.75 2.333V3.5M11.083 3.5l-.583 8.167A.583.583 0 0 1 9.917 12.25H4.083a.583.583 0 0 1-.583-.583L2.917 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IcoClock = (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5.5 3v2.5L7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
);
const IcoUser = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1.5 10.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
);
const IcoSearch = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
);
const IcoX = (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

function StatusDropdown({ appt, open, onToggle, onSelect }: {
    appt: Appointment;
    open: boolean;
    onToggle: () => void;
    onSelect: (status: string) => void;
}) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const pill = appt.payment_status ? STATUS_PILL[appt.payment_status] : null;

    const handleToggle = () => {
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, left: rect.left });
        }
        onToggle();
    };

    return (
        <div id={`row-status-${appt.id}`} style={{ display: 'inline-block' }}>
            <button
                ref={triggerRef}
                onClick={handleToggle}
                className={pill?.cls ?? 'status-pill status-pill--blocked'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', border: 'none', background: 'inherit' }}
            >
                {pill?.label ?? '—'}
                <span style={{ opacity: 0.6, marginLeft: 2 }}>{IcoChev}</span>
            </button>
            {open && pos && createPortal(
                <div
                    onMouseDown={e => e.stopPropagation()}
                    style={{
                        position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
                        minWidth: 176, borderRadius: 12,
                        border: '1px solid var(--line)',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,.45)',
                        overflow: 'hidden',
                    }}
                >
                    {STATUS_DROPDOWN_OPTS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onSelect(opt.value)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px', fontSize: 12, fontWeight: 500,
                                border: 'none', cursor: 'pointer',
                                background: appt.payment_status === opt.value ? 'rgba(167,139,250,.08)' : 'transparent',
                                transition: 'background .15s',
                            }}
                            className={opt.cls}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

export default function AppointmentsPage() {
    const { token } = useAuth();
    const searchParams = useSearchParams();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusOpen, setStatusOpen] = useState(false);
    const statusRef = useRef<HTMLDivElement>(null);
    const [openRowStatus, setOpenRowStatus] = useState<string | null>(null);

    const [status, setStatus] = useState(searchParams.get('status') ?? 'all');
    const [from, setFrom] = useState(searchParams.get('from') ?? '');
    const [to, setTo] = useState(searchParams.get('to') ?? '');
    const [search, setSearch] = useState('');

    const fetchAppts = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (status !== 'all') params.status = status;
            if (from) params.from = from;
            if (to) params.to = to + 'T23:59:59';
            if (search) params.search = search;

            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setAppointments(res.data);
        } finally {
            setLoading(false);
        }
    }, [token, status, from, to, search]);

    useEffect(() => { fetchAppts(); }, [fetchAppts]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
                setStatusOpen(false);
            }
            setOpenRowStatus(prev => {
                if (!prev) return prev;
                const el = document.getElementById(`row-status-${prev}`);
                return el && el.contains(e.target as Node) ? prev : null;
            });
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const title = status === 'paid'         ? 'Señas cobradas'
        : status === 'full_payment'          ? 'Pagos completos'
        : status === 'pending'               ? 'Pagos pendientes'
        : status === 'not_required'          ? 'Citas sin cobro'
        : 'Todas las citas';

    const clearFilters = () => { setStatus('all'); setFrom(''); setTo(''); setSearch(''); };
    const hasFilters = status !== 'all' || from || to || search;

    const handleStatusChange = async (id: string, newStatus: string) => {
        setOpenRowStatus(null);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, payment_status: newStatus } : a));
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}/status`,
                { payment_status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch { fetchAppts(); }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar esta cita? Esta acción no se puede deshacer.')) return;
        setAppointments(prev => prev.filter(a => a.id !== id));
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch { fetchAppts(); }
    };

    const formatAmount = (appt: Appointment) => {
        if (appt.amount_paid) return `$${parseFloat(appt.amount_paid).toLocaleString('es-UY', { minimumFractionDigits: 0 })}`;
        if (appt.price) return `$${parseFloat(appt.price).toLocaleString('es-UY', { minimumFractionDigits: 0 })}`;
        return null;
    };

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow">
                        <span className="dash-page__eyebrow-dot" />
                        Agenda
                    </div>
                    <h1 className="dash-page__title">{title}</h1>
                    <p className="dash-page__sub">
                        {appointments.length} resultado{appointments.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="filter-form">
                {/* Buscar cliente */}
                <div className="fg-field fg-field--grow">
                    <span className="fg-field__label">Buscar cliente</span>
                    <div style={{ position: 'relative' }}>
                        <span style={{
                            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                            color: 'var(--fg-3)', pointerEvents: 'none', display: 'flex',
                        }}>
                            {IcoSearch}
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Nombre o email…"
                            className="fg-field__input"
                            style={{ paddingLeft: 32 }}
                        />
                    </div>
                </div>

                {/* Estado */}
                <div className="fg-field" ref={statusRef} style={{ position: 'relative' }}>
                    <span className="fg-field__label">Estado</span>
                    <button
                        type="button"
                        onClick={() => setStatusOpen(o => !o)}
                        className="fg-field__input"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: 8, cursor: 'pointer', textAlign: 'left',
                        }}
                    >
                        <span>{STATUS_OPTIONS.find(o => o.value === status)?.label}</span>
                        <span style={{
                            color: 'var(--fg-3)',
                            transform: statusOpen ? 'rotate(180deg)' : undefined,
                            transition: 'transform .2s',
                        }}>
                            {IcoChev}
                        </span>
                    </button>
                    {statusOpen && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
                            zIndex: 20, borderRadius: 12,
                            border: '1px solid var(--line)',
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(24px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,.45)',
                            overflow: 'hidden',
                        }}>
                            {STATUS_OPTIONS.map(o => (
                                <button key={o.value} type="button"
                                    onClick={() => { setStatus(o.value); setStatusOpen(false); }}
                                    style={{
                                        width: '100%', textAlign: 'left', padding: '10px 14px',
                                        fontSize: 13, border: 'none', cursor: 'pointer',
                                        background: status === o.value ? 'rgba(167,139,250,.12)' : 'transparent',
                                        color: status === o.value ? 'var(--accent)' : 'var(--fg-1)',
                                        fontWeight: status === o.value ? 600 : 400,
                                    }}
                                >{o.label}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desde */}
                <div className="fg-field">
                    <span className="fg-field__label">Desde</span>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="fg-field__input" />
                </div>

                {/* Hasta */}
                <div className="fg-field">
                    <span className="fg-field__label">Hasta</span>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="fg-field__input" />
                </div>

                {hasFilters && (
                    <button onClick={clearFilters} className="dbtn" style={{ alignSelf: 'flex-end' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {IcoX} Limpiar
                        </span>
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="skel-page">
                    {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="skel-card" style={{ animationDelay: `${i * 0.08}s` }}>
                            <div className="skel-row">
                                <span className="skel" style={{ width: 36, height: 36, borderRadius: 10 }} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <span className="skel" style={{ height: 13, width: `${55 + (i % 3) * 12}%` }} />
                                    <span className="skel" style={{ height: 11, width: `${35 + (i % 2) * 10}%` }} />
                                </div>
                                <span className="skel" style={{ height: 22, width: 72, borderRadius: 20 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <div className="empty">No hay citas con los filtros seleccionados.</div>
            ) : (
                <>
                    {/* Mobile: cards */}
                    <div className="dtable-mobile">
                        {appointments.map(appt => {
                            const amount = formatAmount(appt);
                            return (
                                <div key={appt.id} className="gcard" style={{ padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--fg-0)', textTransform: 'capitalize' }}>
                                                {format(parseISO(appt.start), "EEEE d 'de' MMMM", { locale: es })}
                                            </p>
                                            <p style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                {IcoClock}
                                                {format(parseISO(appt.start), 'HH:mm')} – {format(parseISO(appt.end), 'HH:mm')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(appt.id)}
                                            className="dash-iconbtn"
                                            title="Eliminar cita"
                                            style={{ color: 'var(--fg-3)', flexShrink: 0 }}
                                        >
                                            {IcoTrash}
                                        </button>
                                    </div>

                                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-1)', marginBottom: 8 }}>{appt.title}</p>

                                    {appt.client_name && (
                                        <div style={{ marginBottom: 8 }}>
                                            <p style={{ fontSize: 12, color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {IcoUser} {appt.client_name}
                                            </p>
                                            {appt.client_email && (
                                                <p style={{ fontSize: 11, color: 'var(--fg-3)', paddingLeft: 18, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {appt.client_email}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {appt.employee_name && (
                                        <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 10 }}>Profesional: {appt.employee_name}</p>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                                        <StatusDropdown
                                            appt={appt}
                                            open={openRowStatus === appt.id}
                                            onToggle={() => setOpenRowStatus(openRowStatus === appt.id ? null : appt.id)}
                                            onSelect={s => handleStatusChange(appt.id, s)}
                                        />
                                        {amount && (
                                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-0)' }}>{amount}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop: tabla */}
                    <div className="dtable-wrap dtable-desktop">
                        <table className="dtable">
                            <thead>
                                <tr>
                                    <th>Fecha y hora</th>
                                    <th>Servicio</th>
                                    <th>Cliente</th>
                                    <th>Profesional</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'right' }}>Monto</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map(appt => {
                                    const amount = formatAmount(appt);
                                    return (
                                        <tr key={appt.id}>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                <p style={{ fontWeight: 600, color: 'var(--fg-0)', textTransform: 'capitalize', fontSize: 13 }}>
                                                    {format(parseISO(appt.start), "d 'de' MMM yyyy", { locale: es })}
                                                </p>
                                                <p style={{ fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                    {IcoClock}
                                                    {format(parseISO(appt.start), 'HH:mm')} – {format(parseISO(appt.end), 'HH:mm')}
                                                </p>
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 500, color: 'var(--fg-1)' }}>{appt.title}</span>
                                            </td>
                                            <td>
                                                {appt.client_name ? (
                                                    <>
                                                        <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-1)', fontSize: 13 }}>
                                                            {IcoUser} {appt.client_name}
                                                        </p>
                                                        {appt.client_email && (
                                                            <p style={{ fontSize: 11, color: 'var(--fg-3)', paddingLeft: 18, marginTop: 2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {appt.client_email}
                                                            </p>
                                                        )}
                                                    </>
                                                ) : <span style={{ color: 'var(--fg-3)' }}>—</span>}
                                            </td>
                                            <td style={{ color: 'var(--fg-2)' }}>{appt.employee_name ?? '—'}</td>
                                            <td>
                                                <StatusDropdown
                                                    appt={appt}
                                                    open={openRowStatus === appt.id}
                                                    onToggle={() => setOpenRowStatus(openRowStatus === appt.id ? null : appt.id)}
                                                    onSelect={s => handleStatusChange(appt.id, s)}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                {amount
                                                    ? <span style={{ fontWeight: 700, color: 'var(--fg-0)' }}>{amount}</span>
                                                    : <span style={{ color: 'var(--fg-3)' }}>—</span>
                                                }
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(appt.id)}
                                                    className="dash-iconbtn"
                                                    title="Eliminar cita"
                                                    style={{ color: 'var(--fg-3)' }}
                                                >
                                                    {IcoTrash}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
