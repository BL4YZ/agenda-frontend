'use client';

import { useState, Suspense } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
        if (!/(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password)) {
            setError('La contraseña debe contener al menos una mayúscula y un carácter especial (!@#$%^&*).'); return;
        }
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, { token, password });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Ocurrió un error. Por favor intentá de nuevo.');
            } else {
                setError('Ocurrió un error. Por favor intentá de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center py-2">
                <p className="text-sm text-red-500 dark:text-red-400 mb-4">Enlace inválido o expirado.</p>
                <Link href="/forgot-password" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Solicitar un nuevo enlace
                </Link>
            </div>
        );
    }

    return (
        <>
            {success ? (
                <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">¡Contraseña actualizada!</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Tu contraseña fue cambiada correctamente. Serás redirigido al inicio de sesión en unos segundos.
                    </p>
                    <Link href="/login" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        Ir al inicio de sesión
                    </Link>
                </div>
            ) : (
                <>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nueva contraseña</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Elegí una contraseña segura para tu cuenta.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Nueva contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-11 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                                Mínimo 8 caracteres, una mayúscula y un carácter especial.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Confirmar contraseña
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 dark:text-red-400 animate-fade-in">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:scale-100 text-sm mt-2"
                        >
                            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                        </button>
                    </form>
                </>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm animate-scale-in">
                <div className="text-center mb-8">
                    <span className="text-2xl font-bold text-gradient">MiAgenda</span>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Restablecer contraseña</p>
                </div>
                <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/30">
                    <Suspense fallback={<div className="text-center text-sm text-slate-400">Cargando...</div>}>
                        <ResetPasswordContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
