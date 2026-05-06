'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';
import { Plus, Trash2, X } from 'lucide-react';

type Expense = {
    id: number;
    category: string;
    amount: string;
    date: string;
    description: string | null;
    created_at: string;
};

const CATEGORIES = [
    { value: 'alquiler',   label: 'Alquiler',   color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
    { value: 'insumos',    label: 'Insumos',     color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' },
    { value: 'servicios',  label: 'Servicios',   color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400' },
    { value: 'sueldos',    label: 'Sueldos',     color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
    { value: 'impuestos',  label: 'Impuestos',   color: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400' },
    { value: 'otros',      label: 'Otros',       color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300' },
];

const catMeta = (value: string) => CATEGORIES.find(c => c.value === value) ?? CATEGORIES[5];

const fmt = (n: string | number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n));

function thisMonthRange() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { from, to };
}

function UpgradeGate({ feature }: { feature: string }) {
    return (
        <div className="flex flex-col flex-1 items-center justify-center py-24 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500">
                    <path d="M12 15v-3m0-3h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{feature} requiere Plan Pro</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                Actualizá tu plan para acceder a esta función y desbloquear todas las herramientas de gestión.
            </p>
            <a
                href="/dashboard/settings?tab=plan"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
            >
                Ver planes
            </a>
        </div>
    );
}

export default function ExpensesPage() {
    const { token } = useAuth();
    const { business } = useBusiness();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading]   = useState(true);
    const [{ from, to }, setRange] = useState(thisMonthRange());
    const [showForm, setShowForm] = useState(false);

    // Form fields
    const [fCategory, setFCategory]     = useState('alquiler');
    const [fAmount, setFAmount]         = useState('');
    const [fDate, setFDate]             = useState(new Date().toISOString().slice(0, 10));
    const [fDescription, setFDescription] = useState('');
    const [fError, setFError]           = useState('');
    const [fSaving, setFSaving]         = useState(false);

    const [deletingId, setDeletingId] = useState<number | null>(null);

    const load = () => {
        if (!token) return;
        setLoading(true);
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses?from=${from}&to=${to}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setExpenses(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(load, [token, from, to]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setFError('');
        if (!fAmount || isNaN(Number(fAmount)) || Number(fAmount) <= 0) { setFError('Ingresá un monto válido.'); return; }
        setFSaving(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`,
                { category: fCategory, amount: Number(fAmount), date: fDate, description: fDescription || null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowForm(false);
            setFAmount(''); setFDescription(''); setFCategory('alquiler');
            load();
        } catch {
            setFError('No se pudo guardar el gasto.');
        } finally {
            setFSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

    const byCategory = CATEGORIES.map(cat => ({
        ...cat,
        total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + Number(e.amount), 0),
    })).filter(c => c.total > 0);

    const isPro = business?.subscription_plan === 'pro' || business?.subscription_plan === 'negocio';
    if (!isPro) return <UpgradeGate feature="Gastos" />;

    return (
        <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/50 dark:border-white/5">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Gastos</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Registrá los gastos del negocio.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-4 h-4" /> Nuevo gasto
                </button>
            </div>

            <div className="flex-1 px-6 py-6 max-w-3xl w-full mx-auto space-y-6">
                {/* Date range */}
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

                {/* Summary cards */}
                {expenses.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06]">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total del período</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(total)}</p>
                        </div>
                        {byCategory.map(c => (
                            <div key={c.value} className="p-4 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06]">
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
                                <p className="text-base font-semibold text-slate-900 dark:text-white mt-2">{fmt(c.total)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">No hay gastos registrados en este período.</p>
                        <button onClick={() => setShowForm(true)} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            + Agregar primero gasto
                        </button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {expenses.map(exp => {
                            const meta = catMeta(exp.category);
                            return (
                                <li key={exp.id} className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/[0.06] group">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                {new Date(exp.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{exp.description}</p>
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white flex-shrink-0">{fmt(exp.amount)}</span>
                                    <button
                                        onClick={() => handleDelete(exp.id)}
                                        disabled={deletingId === exp.id}
                                        className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Add form modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Nuevo gasto</h2>
                            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoría</label>
                                <select
                                    value={fCategory}
                                    onChange={e => setFCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                                >
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monto</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                                    <input
                                        type="number" min="0" step="0.01"
                                        value={fAmount} onChange={e => setFAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-8 pr-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha</label>
                                <input
                                    type="date" value={fDate} onChange={e => setFDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descripción <span className="text-slate-400 font-normal">(opcional)</span></label>
                                <input
                                    type="text" value={fDescription} onChange={e => setFDescription(e.target.value)}
                                    placeholder="Ej: Pago de alquiler del local"
                                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm transition-all"
                                />
                            </div>
                            {fError && <p className="text-sm text-red-500 dark:text-red-400">{fError}</p>}
                            <button
                                type="submit" disabled={fSaving}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:scale-100 text-sm"
                            >
                                {fSaving ? 'Guardando...' : 'Guardar gasto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
