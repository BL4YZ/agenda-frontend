'use client';

import { useState } from 'react';
import { Activity, Check, ChevronRight, Heart, LayoutGrid, Scissors, Sparkles, Star, Zap } from 'lucide-react';
import { type BusinessType, type FeatureFlags, TYPE_PRESETS, useBusiness } from '@/context/BusinessContext';
import api from '@/lib/api';

/* ── Business type catalogue ──────────────────────────────────────────────── */

const TYPES: {
    value: BusinessType;
    label: string;
    desc: string;
    icon: React.ElementType;
    color: string;
}[] = [
    { value: 'barberia',    label: 'Barbería',            desc: 'Cortes, arreglo de barba, alquiler de silla',       icon: Scissors,   color: '#6366f1' },
    { value: 'peluqueria',  label: 'Peluquería / Salón',  desc: 'Cortes, coloración, tratamientos y estilismo',      icon: Scissors,   color: '#8b5cf6' },
    { value: 'estetica',    label: 'Estética / Spa',      desc: 'Faciales, masajes, depilación y tratamientos',      icon: Sparkles,   color: '#ec4899' },
    { value: 'manicura',    label: 'Manicura / Nail Art',  desc: 'Uñas gel, acrílicas, diseños y cuidado de manos',  icon: Star,       color: '#f59e0b' },
    { value: 'consultorio', label: 'Consultorio / Salud',  desc: 'Médicos, psicólogos, nutricionistas y terapistas', icon: Heart,      color: '#10b981' },
    { value: 'fitness',     label: 'Fitness / Bienestar',  desc: 'Personal trainers, yoga, pilates y deportes',      icon: Activity,   color: '#3b82f6' },
    { value: 'otro',        label: 'Otro tipo de negocio', desc: 'Cualquier servicio con reservas y turnos',         icon: LayoutGrid, color: '#64748b' },
];

const FLAG_LABELS: { key: keyof FeatureFlags; label: string; desc: string }[] = [
    { key: 'showModalities',  label: 'Modalidades de compensación', desc: 'Comisión %, alquiler de silla, mixto' },
    { key: 'showExpenses',    label: 'Registro de gastos',          desc: 'Alquiler, insumos, servicios, impuestos' },
    { key: 'showCommissions', label: 'Resumen de comisiones',       desc: 'Cuánto le corresponde a cada integrante' },
    { key: 'showTeamReports', label: 'Reportes del equipo',         desc: 'Rendimiento e ingresos por integrante' },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function OnboardingModal() {
    const { updateBusiness } = useBusiness();
    const [step, setStep]         = useState<0 | 1 | 2>(0);
    const [businessName, setBusinessName] = useState('');
    const [nameError, setNameError]       = useState('');
    const [selected, setSelected] = useState<BusinessType | null>(null);
    const [flags, setFlags]       = useState<FeatureFlags | null>(null);
    const [saving, setSaving]     = useState(false);

    const chooseType = (type: BusinessType) => {
        setSelected(type);
        setFlags({ ...TYPE_PRESETS[type] });
    };

    const toggleFlag = (key: keyof FeatureFlags) => {
        setFlags(f => f ? { ...f, [key]: !f[key] } : f);
    };

    const handleNameContinue = async () => {
        const name = businessName.trim();
        if (!name) { setNameError('Ingresá el nombre de tu negocio.'); return; }
        if (name.length < 2) { setNameError('El nombre debe tener al menos 2 caracteres.'); return; }
        setSaving(true);
        try {
            await api.post('/businesses', { name });
            setStep(1);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setNameError(msg || 'Error al crear el negocio. Intentá de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        setSaving(true);
        try {
            await updateBusiness({ has_seen_onboarding: true } as never);
        } finally {
            setSaving(false);
        }
    };

    const handleConfirm = async () => {
        if (!selected || !flags) return;
        setSaving(true);
        try {
            await updateBusiness({ business_type: selected as never, feature_flags: flags, has_seen_onboarding: true } as never);
        } finally {
            setSaving(false);
        }
    };

    const totalSteps = 3;
    const stepLabels = ['Nombre', 'Tipo', 'Funciones'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">

                {/* Header */}
                <div className="px-8 pt-8 pb-6">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-2xl font-bold text-gradient">AgendaPro</span>
                        {step > 0 && (
                            <button
                                onClick={handleSkip}
                                disabled={saving}
                                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-40"
                            >
                                Saltar por ahora
                            </button>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                        {step === 0 && '¿Cómo se llama tu negocio?'}
                        {step === 1 && '¿Qué tipo de negocio tenés?'}
                        {step === 2 && 'Funcionalidades activas'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {step === 0 && 'Este nombre aparecerá en tu página pública de reservas.'}
                        {step === 1 && 'Personalizamos el panel en función de tu negocio. Podés cambiarlo después en Configuración.'}
                        {step === 2 && 'Estas son las funciones que se activarán. Podés ajustarlas ahora o más tarde.'}
                    </p>

                    {/* Steps indicator */}
                    <div className="flex items-center gap-2 mt-5">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 flex-1 ${
                                i === step ? 'bg-indigo-500' : i < step ? 'bg-indigo-200 dark:bg-indigo-500/40' : 'bg-slate-200 dark:bg-white/10'
                            }`} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                        {stepLabels.map((label, i) => (
                            <span key={i} className={`text-[10px] ${i === step ? 'text-indigo-500 font-semibold' : 'text-slate-400'}`}>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Step 0 — business name */}
                {step === 0 && (
                    <div className="px-8 pb-8">
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Ej: Barbería El Tigre, Centro de Estética Sol..."
                                value={businessName}
                                onChange={e => { setBusinessName(e.target.value); setNameError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleNameContinue()}
                                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                                autoFocus
                            />
                            {nameError && (
                                <p className="mt-2 text-xs text-red-500">{nameError}</p>
                            )}
                        </div>
                        <button
                            onClick={handleNameContinue}
                            disabled={saving || !businessName.trim()}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                        >
                            {saving ? 'Creando...' : <>Continuar <ChevronRight className="w-4 h-4" /></>}
                        </button>
                    </div>
                )}

                {/* Step 1 — type selection */}
                {step === 1 && (
                    <div className="px-8 pb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {TYPES.map(t => (
                                <button
                                    key={t.value}
                                    onClick={() => chooseType(t.value)}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 ${
                                        selected === t.value
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                                    }`}
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${t.color}20` }}>
                                        <t.icon className="w-4 h-4" style={{ color: t.color }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-semibold ${selected === t.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                                            {t.label}
                                        </p>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{t.desc}</p>
                                    </div>
                                    {selected === t.value && (
                                        <Check className="w-4 h-4 text-indigo-500 ml-auto flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!selected}
                            className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-sm"
                        >
                            Continuar <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Step 2 — feature flags */}
                {step === 2 && flags && (
                    <div className="px-8 pb-8">
                        <div className="space-y-2 mb-6">
                            {FLAG_LABELS.map(({ key, label, desc }) => (
                                <button
                                    key={key}
                                    onClick={() => toggleFlag(key)}
                                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-left transition-all duration-200"
                                >
                                    <div className={`w-10 h-6 rounded-full flex-shrink-0 relative transition-colors duration-200 ${
                                        flags[key] ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'
                                    }`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                            flags[key] ? 'translate-x-5' : 'translate-x-1'
                                        }`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={saving}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-lg shadow-indigo-500/25 text-sm flex items-center justify-center gap-2"
                            >
                                {saving ? 'Guardando...' : <><Zap className="w-4 h-4" /> Comenzar</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
