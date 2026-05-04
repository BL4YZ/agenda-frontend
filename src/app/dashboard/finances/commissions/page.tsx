'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

type Row = {
    id: number;
    name: string;
    email: string;
    modality: 'employee' | 'commission' | 'rental' | 'mixed';
    commission_rate: string | null;
    rental_amount: string | null;
    rental_period: string | null;
    appointment_count: string;
    total_revenue: string;
    payout: string;
};

const MODALITY_LABELS: Record<string, string> = {
    employee:   'Empleado',
    commission: 'Comisión %',
    rental:     'Alquiler',
    mixed:      'Mixto',
};

const MODALITY_COLORS: Record<string, string> = {
    employee:   'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
    commission: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    rental:     'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    mixed:      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
};

const fmt = (n: string | number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n));

function thisMonthRange() {
    const now = new Date();
    return {
        from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
        to:   new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
    };
}

function modalityDetail(row: Row): string {
    if (row.modality === 'commission') return `${row.commission_rate ?? 0}%`;
    if (row.modality === 'rental')     return `${fmt(row.rental_amount ?? 0)}/${row.rental_period === 'weekly' ? 'sem.' : 'mes'}`;
    if (row.modality === 'mixed')      return `${fmt(row.rental_amount ?? 0)} + ${row.commission_rate ?? 0}%`;
    return '—';
}

export default function CommissionsPage() {
    const { token } = useAuth();
    const [rows, setRows]             = useState<Row[]>([]);
    const [loading, setLoading]       = useState(true);
    const [{ from, to }, setRange]    = useState(thisMonthRange());

    const load = () => {
        if (!token) return;
        setLoading(true);
        axios.get(`http://localhost:3000/api/commissions/summary?from=${from}&to=${to}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setRows(res.data.rows ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, [token, from, to]);

    const totalRevenue = rows.reduce((s, r) => s + Number(r.total_revenue), 0);
    const totalPayout  = rows.reduce((s, r) => s + Number(r.payout), 0);

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-white/5">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Comisiones y alquileres</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Resumen de lo que cada integrante generó y lo que le corresponde cobrar/pagar.
                    </p>
                </div>
            </div>

            <div className="flex-1 px-6 py-6 max-w-4xl w-full mx-auto space-y-6">
                {/* Range */}
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Período:</span>
                    <div className="flex items-center gap-2">
                        <input type="date" value={from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
                            className="px-3 py-1.5 text-sm bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                        <span className="text-slate-400">→</span>
                        <input type="date" value={to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
                            className="px-3 py-1.5 text-sm bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">No hay integrantes con modalidad configurada.</p>
                        <a href="/dashboard/team/modalities" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline mt-2">
                            Configurar modalidades →
                        </a>
                    </div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06]">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ingresos generados</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(totalRevenue)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06]">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total a pagar/cobrar</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{fmt(totalPayout)}</p>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl border border-slate-200/50 dark:border-white/[0.06] overflow-hidden bg-white/70 dark:bg-white/[0.02]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200/50 dark:border-white/[0.06]">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Integrante</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modalidad</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Citas</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ingresos</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">A pagar/cobrar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/40 dark:divide-white/[0.04]">
                                        {rows.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                            {row.name[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-slate-900 dark:text-white">{row.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${MODALITY_COLORS[row.modality]}`}>
                                                            {MODALITY_LABELS[row.modality]}
                                                        </span>
                                                        {row.modality !== 'employee' && (
                                                            <span className="text-xs text-slate-400 dark:text-slate-500">{modalityDetail(row)}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">
                                                    {row.appointment_count}
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-medium text-slate-900 dark:text-white">
                                                    {fmt(row.total_revenue)}
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    {row.modality === 'employee' ? (
                                                        <span className="text-slate-400 dark:text-slate-500">—</span>
                                                    ) : (
                                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                            {fmt(row.payout)}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {rows.length > 1 && (
                                        <tfoot>
                                            <tr className="border-t border-slate-200/50 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                                                <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-slate-900 dark:text-white">{fmt(totalRevenue)}</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(totalPayout)}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            * Los alquileres se muestran como monto fijo configurado. Los integrantes tipo "Empleado" no generan pago automático.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
