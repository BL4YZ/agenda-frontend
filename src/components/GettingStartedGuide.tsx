'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBusiness } from '@/context/BusinessContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const DISMISS_KEY = 'miagenda_guide_dismissed';

type StepStatus = 'done' | 'pending' | 'optional' | 'loading';

type Step = {
    id: string;
    title: string;
    desc: string;
    status: StepStatus;
    href?: string;
    action?: string;
    tag?: string;
};

const IcoDone     = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#22c55e"/><path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPending  = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.3"/></svg>;
const IcoOptional = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2"/></svg>;
const IcoLoading  = () => <span style={{ display:'inline-block', width:14, height:14, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.15)', borderTopColor:'rgba(255,255,255,0.4)', animation:'spin 0.8s linear infinite' }} />;
const IcoArrow    = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoChev     = ({ open }: { open: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default function GettingStartedGuide() {
    const { business } = useBusiness();
    const { userId }   = useAuth();
    const [dismissed, setDismissed] = useState(false);
    const [open, setOpen]           = useState(true);
    const [hasServices, setHasServices]   = useState<boolean | null>(null);
    const [hasSchedules, setHasSchedules] = useState<boolean | null>(null);
    const [linkCopied, setLinkCopied]     = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
            setLinkCopied(localStorage.getItem('miagenda_link_shared') === '1');
        }
    }, []);

    useEffect(() => {
        api.get('/services').then(r => setHasServices(r.data.length > 0)).catch(() => setHasServices(false));
    }, []);

    useEffect(() => {
        if (!userId) return;
        api.get(`/schedules/${userId}`).then(r => setHasSchedules(r.data.length > 0)).catch(() => setHasSchedules(false));
    }, [userId]);

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY, '1');
        setDismissed(true);
    };

    const copyLink = () => {
        if (!business) return;
        const url = `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/public/${business.slug}`;
        navigator.clipboard.writeText(url);
        localStorage.setItem('miagenda_link_shared', '1');
        setLinkCopied(true);
    };

    if (dismissed || !business) return null;

    const mpConnected = business.mp_connected;
    const isPro = business.subscription_plan === 'pro' || business.subscription_plan === 'negocio';

    const steps: Step[] = [
        {
            id: 'business',
            title: 'Crear tu negocio',
            desc: 'Ya configuraste el nombre y tipo de negocio. ¡Buen comienzo!',
            status: 'done',
        },
        {
            id: 'services',
            title: 'Agregar tus servicios',
            desc: 'Definí qué ofrecés: nombre, duración y precio. Tus clientes los verán al reservar.',
            status: hasServices === null ? 'loading' : hasServices ? 'done' : 'pending',
            href: '/dashboard/services',
            action: 'Ir a Servicios',
        },
        {
            id: 'schedules',
            title: 'Configurar tus horarios',
            desc: 'Indicá en qué días y horarios atendés para que las reservas estén disponibles.',
            status: hasSchedules === null ? 'loading' : hasSchedules ? 'done' : 'pending',
            href: '/dashboard/schedules',
            action: 'Ir a Horarios',
        },
        {
            id: 'link',
            title: 'Compartir tu link de reservas',
            desc: 'Enviá tu página de reservas a tus clientes por WhatsApp, Instagram o donde quieras.',
            status: linkCopied ? 'done' : 'pending',
            action: linkCopied ? 'Copiado ✓' : 'Copiar link',
        },
        {
            id: 'mp',
            title: 'Conectar MercadoPago',
            desc: isPro
                ? 'Cobrá señas o el total al momento de la reserva. Directo a tu cuenta, sin comisiones extra.'
                : 'Disponible en Plan Pro. Cobrá señas o el pago completo al reservar.',
            status: mpConnected ? 'done' : 'optional',
            href: isPro ? '/dashboard/settings' : undefined,
            action: isPro ? 'Conectar' : undefined,
            tag: isPro ? undefined : 'Pro',
        },
    ];

    const loaded  = steps.filter(s => s.status !== 'loading');
    const done    = loaded.filter(s => s.status === 'done').length;
    const total   = steps.length;
    const allDone = loaded.length === total && done === total;
    const pct     = Math.round((done / total) * 100);

    return (
        <div style={{
            margin: '0 0 24px',
            borderRadius: 16,
            border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
            background: 'var(--glass-bg, rgba(255,255,255,0.03))',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                }}
            >
                {/* Progress ring */}
                <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3"/>
                        <circle
                            cx="20" cy="20" r="16" fill="none"
                            stroke={allDone ? '#22c55e' : '#6366f1'} strokeWidth="3"
                            strokeDasharray={`${(pct / 100) * 100.53} 100.53`}
                            strokeLinecap="round"
                            transform="rotate(-90 20 20)"
                            style={{ transition: 'stroke-dasharray .4s ease' }}
                        />
                    </svg>
                    <span style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: allDone ? '#22c55e' : '#a5b4fc',
                    }}>{done}/{total}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--fg-0)' }}>
                        {allDone ? '¡Todo listo! Tu negocio está configurado 🎉' : 'Comenzá a configurar tu negocio'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--fg-3)' }}>
                        {allDone ? 'Completaste todos los pasos de configuración.' : `${done} de ${total} pasos completados`}
                    </p>
                </div>

                <span style={{ color: 'var(--fg-3)', flexShrink: 0 }}><IcoChev open={open} /></span>
            </button>

            {/* Progress bar */}
            <div style={{ height: 2, background: 'rgba(99,102,241,0.1)', margin: '0 20px' }}>
                <div style={{
                    height: '100%', borderRadius: 2,
                    background: allDone ? '#22c55e' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    width: `${pct}%`, transition: 'width .4s ease',
                }}/>
            </div>

            {/* Steps */}
            {open && (
                <div style={{ padding: '8px 0 4px' }}>
                    {steps.map((step, i) => (
                        <div key={step.id} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 14,
                            padding: '12px 20px',
                            borderTop: i === 0 ? '1px solid transparent' : '1px solid var(--glass-border, rgba(255,255,255,0.05))',
                            opacity: step.status === 'done' ? 0.65 : 1,
                            transition: 'opacity .2s',
                        }}>
                            {/* Icon */}
                            <div style={{ marginTop: 2, flexShrink: 0 }}>
                                {step.status === 'done'     && <IcoDone />}
                                {step.status === 'pending'  && <IcoPending />}
                                {step.status === 'optional' && <IcoOptional />}
                                {step.status === 'loading'  && <IcoLoading />}
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                    <span style={{
                                        fontSize: 13, fontWeight: 600,
                                        color: step.status === 'done' ? 'var(--fg-2)' : 'var(--fg-0)',
                                        textDecoration: step.status === 'done' ? 'line-through' : 'none',
                                    }}>{step.title}</span>
                                    {step.tag && (
                                        <span style={{
                                            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                                            background: 'rgba(139,92,246,.15)', color: '#a78bfa',
                                            border: '1px solid rgba(139,92,246,.2)', letterSpacing: '0.05em',
                                        }}>{step.tag}</span>
                                    )}
                                    {step.status === 'optional' && !step.tag && (
                                        <span style={{ fontSize: 10, color: 'var(--fg-3)', fontStyle: 'italic' }}>opcional</span>
                                    )}
                                </div>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5 }}>{step.desc}</p>
                            </div>

                            {/* CTA */}
                            {step.status !== 'done' && step.status !== 'loading' && step.action && (
                                step.id === 'link' ? (
                                    <button
                                        onClick={copyLink}
                                        disabled={linkCopied}
                                        style={{
                                            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                            background: 'rgba(99,102,241,.1)', color: '#818cf8',
                                            border: '1px solid rgba(99,102,241,.2)', cursor: linkCopied ? 'default' : 'pointer',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {step.action} {!linkCopied && <IcoArrow />}
                                    </button>
                                ) : step.href ? (
                                    <Link href={step.href} style={{
                                        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                        background: 'rgba(99,102,241,.1)', color: '#818cf8',
                                        border: '1px solid rgba(99,102,241,.2)', textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {step.action} <IcoArrow />
                                    </Link>
                                ) : null
                            )}
                        </div>
                    ))}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 20px 12px' }}>
                        <button
                            onClick={dismiss}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 11, color: 'var(--fg-3)', padding: '4px 0',
                            }}
                        >
                            No mostrar más
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
