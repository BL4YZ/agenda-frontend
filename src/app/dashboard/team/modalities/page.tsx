'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Check, ChevronRight, X } from 'lucide-react';

type Modality = 'employee' | 'commission' | 'rental' | 'mixed';

type Member = {
    id: number;
    name: string | null;
    email: string;
    role: string;
    modality: Modality;
    commission_rate: string | null;
    rental_amount: string | null;
    rental_period: 'weekly' | 'monthly' | null;
    plan_suspended?: boolean;
};

const MODALITY_LABELS: Record<Modality, string> = {
    employee:   'Empleado',
    commission: 'Comisión %',
    rental:     'Alquiler de silla',
    mixed:      'Mixto',
};

const MODALITY_COLORS: Record<Modality, string> = {
    employee:   'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    commission: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    rental:     'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    mixed:      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
};

export default function ModalitiesPage() {
    const { token } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Member | null>(null);

    // Edit form state
    const [modality, setModality]             = useState<Modality>('employee');
    const [commissionRate, setCommissionRate] = useState('');
    const [rentalAmount, setRentalAmount]     = useState('');
    const [rentalPeriod, setRentalPeriod]     = useState<'weekly' | 'monthly'>('monthly');
    const [saving, setSaving]                 = useState(false);
    const [saved, setSaved]                   = useState(false);

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setMembers(res.data.filter((m: Member) => !m.plan_suspended)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const openMember = (m: Member) => {
        setSelected(m);
        setModality(m.modality ?? 'employee');
        setCommissionRate(m.commission_rate ?? '');
        setRentalAmount(m.rental_amount ?? '');
        setRentalPeriod((m.rental_period as 'weekly' | 'monthly') ?? 'monthly');
        setSaved(false);
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const body: Record<string, unknown> = { modality };
            if (modality === 'commission' || modality === 'mixed') body.commission_rate = parseFloat(commissionRate) || null;
            if (modality === 'rental'     || modality === 'mixed') { body.rental_amount = parseFloat(rentalAmount) || null; body.rental_period = rentalPeriod; }

            const res = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/team/${selected.id}/modality`,
                body,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMembers(prev => prev.map(m => m.id === selected.id ? { ...m, ...res.data } : m));
            setSelected(prev => prev ? { ...prev, ...res.data } : null);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-white/5">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Modalidades</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Configurá cómo se compensa a cada integrante del equipo.
                    </p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* ── Member list — ancho fijo en desktop, full en mobile sin selección ── */}
                <div className={`flex-col border-r border-slate-200/50 dark:border-white/5 overflow-y-auto md:w-72 md:flex-shrink-0 ${selected ? 'hidden md:flex' : 'flex w-full'}`}>
                    {loading ? (
                        <div className="flex items-center justify-center flex-1 py-16">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 py-16 px-6 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay integrantes en el equipo.</p>
                        </div>
                    ) : (
                        <ul className="p-3 space-y-1">
                            {members.map(m => (
                                <li key={m.id}>
                                    <button
                                        onClick={() => openMember(m)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                            selected?.id === m.id
                                                ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                                : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                            {(m.name || m.email)[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                {m.name || m.email}
                                            </p>
                                            <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${MODALITY_COLORS[m.modality ?? 'employee']}`}>
                                                {MODALITY_LABELS[m.modality ?? 'employee']}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* ── Right panel — siempre flex-1, muestra editor o placeholder ── */}
                <div className={`flex-1 overflow-y-auto ${!selected ? 'hidden md:flex items-center justify-center' : ''}`}>
                  {selected ? (
                    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 24px' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                            <button
                                onClick={() => setSelected(null)}
                                className="md:hidden"
                                style={{ padding: 6, borderRadius: 8, background: 'var(--glass-bg)', border: '1px solid var(--line)', cursor: 'pointer', color: 'var(--fg-2)', display: 'flex' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #818cf8, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
                                {(selected.name || selected.email)[0].toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-0)', margin: 0 }}>{selected.name || selected.email}</p>
                                <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>{selected.email}</p>
                            </div>
                        </div>

                        {/* Modality selector */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 10 }}>
                                Modalidad de compensación
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {(['employee', 'commission', 'rental', 'mixed'] as Modality[]).map(m => {
                                    const active = modality === m;
                                    return (
                                        <button
                                            key={m}
                                            onClick={() => setModality(m)}
                                            style={{
                                                padding: '12px 14px', borderRadius: 14, textAlign: 'left',
                                                border: `2px solid ${active ? 'var(--accent)' : 'var(--line-strong)'}`,
                                                background: active ? 'oklch(from var(--accent) l c h / 0.12)' : 'var(--glass-bg)',
                                                color: active ? 'var(--accent)' : 'var(--fg-1)',
                                                cursor: 'pointer', fontFamily: 'inherit',
                                                transition: 'border-color .15s, background .15s',
                                            }}
                                        >
                                            <span style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 2 }}>{MODALITY_LABELS[m]}</span>
                                            <span style={{ fontSize: 11, opacity: 0.65, color: 'var(--fg-2)' }}>
                                                {m === 'employee'   && 'Sueldo fijo externo'}
                                                {m === 'commission' && '% de cada cita'}
                                                {m === 'rental'     && 'Paga alquiler fijo'}
                                                {m === 'mixed'      && 'Alquiler + comisión'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Commission rate */}
                        {(modality === 'commission' || modality === 'mixed') && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
                                    Porcentaje de comisión
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number" min="0" max="100" step="0.5"
                                        value={commissionRate} onChange={e => setCommissionRate(e.target.value)}
                                        placeholder="0"
                                        className="fg-field__input"
                                        style={{ paddingRight: 36 }}
                                    />
                                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--fg-3)' }}>%</span>
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 6 }}>
                                    El integrante recibe este porcentaje del precio de cada cita que atiende.
                                </p>
                            </div>
                        )}

                        {/* Rental amount */}
                        {(modality === 'rental' || modality === 'mixed') && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
                                    Monto de alquiler
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--fg-3)' }}>$</span>
                                    <input
                                        type="number" min="0" step="100"
                                        value={rentalAmount} onChange={e => setRentalAmount(e.target.value)}
                                        placeholder="0"
                                        className="fg-field__input"
                                        style={{ paddingLeft: 28 }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    {(['weekly', 'monthly'] as const).map(p => {
                                        const active = rentalPeriod === p;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setRentalPeriod(p)}
                                                style={{
                                                    flex: 1, padding: '8px 0', borderRadius: 10,
                                                    border: `2px solid ${active ? 'var(--accent)' : 'var(--line-strong)'}`,
                                                    background: active ? 'oklch(from var(--accent) l c h / 0.12)' : 'var(--glass-bg)',
                                                    color: active ? 'var(--accent)' : 'var(--fg-2)',
                                                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                                    transition: 'border-color .15s, background .15s',
                                                }}
                                            >
                                                {p === 'weekly' ? 'Semanal' : 'Mensual'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {modality === 'employee' && (
                            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--line-strong)', marginBottom: 16 }}>
                                <p style={{ fontSize: 13, color: 'var(--fg-2)', margin: 0 }}>
                                    El integrante figura como empleado. El manejo de su sueldo se realiza externamente.
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="dbtn dbtn--primary"
                            style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 14 }}
                        >
                            {saved ? <><Check className="w-4 h-4" /> Guardado</> : saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Seleccioná un integrante para configurar su modalidad</p>
                  )}
                </div>
            </div>
        </div>
    );
}
