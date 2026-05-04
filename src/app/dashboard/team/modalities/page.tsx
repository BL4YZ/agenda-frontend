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
        axios.get('http://localhost:3000/api/team', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setMembers(res.data.filter((m: Member) => m.role === 'employee' && !m.plan_suspended)))
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
                `http://localhost:3000/api/team/${selected.id}/modality`,
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
                    <div className="max-w-lg mx-auto px-6 py-8">
                            <div className="flex items-center gap-3 mb-8">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold">
                                    {(selected.name || selected.email)[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selected.name || selected.email}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{selected.email}</p>
                                </div>
                            </div>

                            {/* Modality selector */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Modalidad de compensación
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['employee', 'commission', 'rental', 'mixed'] as Modality[]).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setModality(m)}
                                            className={`px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all duration-200 ${
                                                modality === m
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                                    : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                            }`}
                                        >
                                            <span className="font-semibold block mb-0.5">{MODALITY_LABELS[m]}</span>
                                            <span className="text-[11px] opacity-70">
                                                {m === 'employee'   && 'Sueldo fijo externo'}
                                                {m === 'commission' && '% de cada cita'}
                                                {m === 'rental'     && 'Paga alquiler fijo'}
                                                {m === 'mixed'      && 'Alquiler + comisión'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Commission rate */}
                            {(modality === 'commission' || modality === 'mixed') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Porcentaje de comisión
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                            value={commissionRate}
                                            onChange={e => setCommissionRate(e.target.value)}
                                            placeholder="0"
                                            className="w-full px-4 py-2.5 pr-10 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                        El integrante recibe este porcentaje del precio de cada cita que atiende.
                                    </p>
                                </div>
                            )}

                            {/* Rental amount */}
                            {(modality === 'rental' || modality === 'mixed') && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        Monto de alquiler
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="100"
                                            value={rentalAmount}
                                            onChange={e => setRentalAmount(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-8 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {(['weekly', 'monthly'] as const).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setRentalPeriod(p)}
                                                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                                                    rentalPeriod === p
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                                        : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                                }`}
                                            >
                                                {p === 'weekly' ? 'Semanal' : 'Mensual'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {modality === 'employee' && (
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] mb-4">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        El integrante figura como empleado. El manejo de su sueldo se realiza externamente.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:scale-100 text-sm flex items-center justify-center gap-2"
                            >
                                {saved ? <><Check className="w-4 h-4" /> Guardado</> : saving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500">Seleccioná un integrante para configurar su modalidad</p>
                  )}
                </div>
            </div>
        </div>
    );
}
