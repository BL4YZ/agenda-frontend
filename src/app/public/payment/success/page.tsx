'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, Loader2 } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('id');
    const [status, setStatus] = useState<'loading' | 'paid' | 'pending'>('loading');

    useEffect(() => {
        if (!appointmentId) return;

        // Polling: espera hasta que el webhook confirme el pago (max ~15s)
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/appointments/${appointmentId}/status`);
                if (res.data.payment_status === 'paid') {
                    setStatus('paid');
                    clearInterval(interval);
                } else if (attempts >= 10) {
                    setStatus('pending');
                    clearInterval(interval);
                }
            } catch {
                clearInterval(interval);
                setStatus('pending');
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [appointmentId]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="glass rounded-3xl p-10 max-w-md w-full text-center shadow-2xl shadow-black/10 dark:shadow-black/30 animate-scale-in">
                {status === 'loading' && (
                    <>
                        <Loader2 size={48} className="mx-auto mb-4 text-indigo-500 animate-spin" />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirmando pago...</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Esto solo tomará un momento.</p>
                    </>
                )}

                {status === 'paid' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Pago confirmado!</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Tu cita ha sido reservada exitosamente. Recibirás un email de confirmación en breve.
                        </p>
                        <a href="/"
                            className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:scale-[1.02]">
                            Volver al inicio
                        </a>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
                            <CheckCircle size={32} className="text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pago en proceso</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Tu pago está siendo procesado. Recibirás un email de confirmación cuando se acredite.
                        </p>
                        <a href="/"
                            className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:scale-[1.02]">
                            Volver al inicio
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return <Suspense><SuccessContent /></Suspense>;
}
