'use client';

import { useBusiness } from '@/context/BusinessContext';
import Link from 'next/link';

export default function TrialBanner() {
    const { business } = useBusiness();

    if (!business?.trial_ends_at) return null;

    const endsAt = new Date(business.trial_ends_at);
    const now = new Date();
    const msLeft = endsAt.getTime() - now.getTime();
    if (msLeft <= 0) return null;

    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    const isUrgent = daysLeft <= 3;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, padding: '8px 16px',
            background: isUrgent
                ? 'linear-gradient(90deg, rgba(239,68,68,.12), rgba(245,158,11,.08))'
                : 'linear-gradient(90deg, rgba(99,102,241,.1), rgba(139,92,246,.08))',
            borderBottom: `1px solid ${isUrgent ? 'rgba(239,68,68,.2)' : 'rgba(99,102,241,.2)'}`,
            fontSize: 12,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* countdown pill */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '3px 10px', borderRadius: 20,
                    background: isUrgent ? 'rgba(239,68,68,.15)' : 'rgba(99,102,241,.15)',
                    border: `1px solid ${isUrgent ? 'rgba(239,68,68,.3)' : 'rgba(99,102,241,.3)'}`,
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: 10 }}>⏱</span>
                    <span style={{
                        fontWeight: 700, fontSize: 13,
                        color: isUrgent ? '#f87171' : '#a78bfa',
                    }}>{daysLeft}</span>
                    <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>
                        {daysLeft === 1 ? 'día' : 'días'}
                    </span>
                </div>
                <span style={{ color: 'var(--fg-2)' }}>
                    {isUrgent
                        ? `Tu prueba de Plan Pro vence pronto — no pierdas el acceso a filtros, gráficas y más.`
                        : `Estás en tu período de prueba del Plan Pro. Disfrutá todas las funciones gratis por ${daysLeft} días más.`}
                </span>
            </div>
            <Link href="/dashboard/settings" style={{
                flexShrink: 0, padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                background: isUrgent ? 'rgba(239,68,68,.15)' : 'rgba(99,102,241,.15)',
                color: isUrgent ? '#f87171' : '#a78bfa',
                border: `1px solid ${isUrgent ? 'rgba(239,68,68,.25)' : 'rgba(99,102,241,.25)'}`,
                textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
                {isUrgent ? 'Suscribirme ahora' : 'Ver plan'}
            </Link>
        </div>
    );
}
