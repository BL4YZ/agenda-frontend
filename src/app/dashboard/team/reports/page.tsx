'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

type ReportRow = {
    id: number;
    name: string;
    email: string;
    modality: string;
    commission_rate: string | null;
    rental_amount: string | null;
    rental_period: string | null;
    appointment_count: string;
    total_revenue: string;
    payout: string;
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

const MODALITY_LABELS: Record<string, string> = {
    employee: 'Empleado', commission: 'Comisión %', rental: 'Alquiler', mixed: 'Mixto',
};

export default function TeamReportsPage() {
    const { token } = useAuth();
    const [rows, setRows]          = useState<ReportRow[]>([]);
    const [loading, setLoading]    = useState(true);
    const [{ from, to }, setRange] = useState(thisMonthRange());

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        axios.get(`http://localhost:3000/api/commissions/summary?from=${from}&to=${to}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setRows(res.data.rows ?? []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token, from, to]);

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-white/5">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Reportes del equipo</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Rendimiento por integrante en el período seleccionado.</p>
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
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No hay integrantes con datos para este período.</p>
                        <Link href="/dashboard/team" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            Ir a Integrantes →
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {rows.map(row => {
                            const rev    = Number(row.total_revenue);
                            const payout = Number(row.payout);
                            const appts  = Number(row.appointment_count);
                            const ticket = appts > 0 ? rev / appts : 0;

                            return (
                                <div key={row.id} className="p-5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold">
                                            {row.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{MODALITY_LABELS[row.modality] ?? row.modality}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">Citas</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{appts}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">Ingresos</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{fmt(rev)}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">Ticket prom.</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{fmt(ticket)}</p>
                                        </div>
                                    </div>
                                    {row.modality !== 'employee' && payout > 0 && (
                                        <div className="mt-3 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-between">
                                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                {row.modality === 'rental' ? 'Alquiler a cobrar' : 'Comisión a pagar'}
                                            </span>
                                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{fmt(payout)}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
