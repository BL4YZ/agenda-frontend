'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

function FailureContent() {
    const searchParams = useSearchParams();
    const appointmentId = searchParams.get('id');

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="glass rounded-3xl p-10 max-w-md w-full text-center shadow-2xl shadow-black/10 dark:shadow-black/30 animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                    <XCircle size={32} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pago no completado</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    No se procesó el pago. Tu reserva no fue confirmada. Puedes intentarlo de nuevo.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => window.history.back()}
                        className="px-5 py-2.5 glass border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02]">
                        Volver
                    </button>
                </div>
                {appointmentId && (
                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-4">Ref: #{appointmentId}</p>
                )}
            </div>
        </div>
    );
}

export default function PaymentFailurePage() {
    return <Suspense><FailureContent /></Suspense>;
}
