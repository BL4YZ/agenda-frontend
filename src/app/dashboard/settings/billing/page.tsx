'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

type Business = {
    id: number;
    subscription_plan: 'gratis' | 'pro' | 'negocio';
    subscription_status: 'active' | 'pending' | 'paused' | 'cancelled' | 'expired';
    subscription_ends_at?: string | null;
    trial_ends_at?: string | null;
    pending_plan?: 'pro' | 'negocio' | null;
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcoCheck = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IcoX = (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2.5 2.5l8 8M10.5 2.5l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);
const IcoWarn = (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L19.5 19H2.5L11 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M11 9v4M11 15.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
);
const IcoSparkles = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <path d="M7 1l1.2 3.8H12L8.9 6.9l1.2 3.8L7 8.6 3.9 10.7l1.2-3.8L2 4.8h3.8L7 1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
    </svg>
);
const IcoCrown = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <path d="M1 11.5h12M2 11.5L1.5 5 4.5 7.5l3.5-5 3.5 5 3-2.5-.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
);
const IcoZap = ({ size = 14 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <path d="M8 1.5L2 7.5h5L5 12.5l7-7H7L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
);
const IcoArrowLeft = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// ── Plan data ─────────────────────────────────────────────────────────────────
type PlanFeature = { text: string; ok: boolean };
type PlanDef = {
    id: 'gratis' | 'pro' | 'negocio';
    label: string;
    priceLabel: string;
    period?: string;
    desc: string;
    badge?: string;
    color: string;
    accent: string;
    border: string;
    featured?: boolean;
    trial?: string;
    features: PlanFeature[];
};

const PLANS: PlanDef[] = [
    {
        id: 'gratis',
        label: 'Gratis',
        priceLabel: '$0',
        period: '/mes',
        desc: 'Para empezar sin costo',
        color: 'var(--fg-2)',
        accent: 'rgba(255,255,255,.04)',
        border: 'var(--line)',
        features: [
            { text: '1 profesional',                    ok: true  },
            { text: '50 citas por mes',                 ok: true  },
            { text: 'Reservas online',                  ok: true  },
            { text: 'Recordatorios por email',          ok: true  },
            { text: 'Página pública (Servicios + Contacto)', ok: true  },
            { text: 'Pagos online (señas)',              ok: false },
            { text: 'Múltiples profesionales',          ok: false },
            { text: 'Estadísticas',                     ok: false },
            { text: 'Tienda, Reseñas y FAQs',           ok: false },
            { text: 'Sucursales',                       ok: false },
        ],
    },
    {
        id: 'pro',
        label: 'Pro',
        priceLabel: '$490',
        period: '/mes',
        desc: 'Para negocios en crecimiento',
        badge: 'Más popular',
        color: '#a78bfa',
        accent: 'rgba(167,139,250,.10)',
        border: 'rgba(167,139,250,.45)',
        featured: true,
        trial: '14 días gratis',
        features: [
            { text: 'Hasta 5 profesionales',            ok: true  },
            { text: 'Citas ilimitadas',                 ok: true  },
            { text: 'Reservas online',                  ok: true  },
            { text: 'Recordatorios por email',          ok: true  },
            { text: 'Pagos online con señas',           ok: true  },
            { text: 'Estadísticas básicas',             ok: true  },
            { text: '14 días de prueba gratis',         ok: true  },
            { text: 'Tienda, Reseñas y FAQs',           ok: true  },
            { text: 'Sucursales',                       ok: false },
            { text: 'Equipo y Galería en pág. pública', ok: false },
            { text: 'Marca propia (logo + color)',      ok: false },
        ],
    },
    {
        id: 'negocio',
        label: 'Negocio',
        priceLabel: '$990',
        period: '/mes',
        desc: 'Para equipos y cadenas',
        color: '#c084fc',
        accent: 'rgba(192,132,252,.08)',
        border: 'rgba(192,132,252,.35)',
        features: [
            { text: 'Profesionales ilimitados',         ok: true },
            { text: 'Citas ilimitadas',                 ok: true },
            { text: 'Reservas online',                  ok: true },
            { text: 'Recordatorios por email',          ok: true },
            { text: 'Pagos online con señas',           ok: true },
            { text: 'Estadísticas avanzadas',           ok: true },
            { text: 'Tienda, Reseñas y FAQs',           ok: true },
            { text: 'Equipo y Galería en pág. pública', ok: true },
            { text: 'Marca propia (logo + color)',      ok: true },
            { text: 'Sucursales ilimitadas',            ok: true },
        ],
    },
];

const STATUS_META = {
    active:    { label: 'Activo',    dot: '#34d399' },
    pending:   { label: 'Pendiente', dot: '#fbbf24' },
    paused:    { label: 'Pausado',   dot: '#fbbf24' },
    cancelled: { label: 'Cancelado', dot: '#f87171' },
    expired:   { label: 'Vencido',   dot: '#f87171' },
};

// ── CancelModal ───────────────────────────────────────────────────────────────
function CancelModal({ onConfirm, onClose, loading }: {
    onConfirm: () => void; onClose: () => void; loading: boolean;
}) {
    return (
        <div className="dash-modal-overlay" onClick={onClose}>
            <div className="dash-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#ef4444' }}>
                        {IcoWarn}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-0)', marginBottom: 8 }}>Cancelar suscripción</h3>
                    <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6, marginBottom: 24 }}>
                        Tu plan seguirá activo hasta el final del período actual. Una vez que venza, pasarás automáticamente al plan <strong style={{ color: 'var(--fg-1)' }}>Gratis</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                        <button onClick={onClose} disabled={loading} className="dbtn" style={{ flex: 1 }}>Mantener plan</button>
                        <button onClick={onConfirm} disabled={loading} className="dbtn dbtn--danger" style={{ flex: 1 }}>
                            {loading ? 'Cancelando…' : 'Sí, cancelar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Billing page ──────────────────────────────────────────────────────────────
export default function BillingPage() {
    const { token } = useAuth();

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading]   = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const [cancelling, setCancelling]   = useState(false);
    const [showCancel, setShowCancel]   = useState(false);

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => setBusiness(res.data))
          .catch(console.error)
          .finally(() => setLoading(false));
    }, [token]);

    const handleSubscribe = async (plan: 'pro' | 'negocio') => {
        setSubscribing(plan);
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/payments/subscription`,
                { plan },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            window.location.href = res.data.init_point;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'Error al iniciar la suscripción.');
            else alert('Error al iniciar la suscripción.');
        } finally { setSubscribing(null); }
    };

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/subscription`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            setBusiness(prev => prev ? { ...prev, subscription_status: 'cancelled', subscription_ends_at: endsAt } : prev);
            setShowCancel(false);
        } catch { alert('Error al cancelar. Intentá de nuevo.'); }
        finally { setCancelling(false); }
    };

    const currentPlan   = business?.subscription_plan ?? 'gratis';
    const currentStatus = business?.subscription_status ?? 'active';
    const effectivePlan = currentStatus === 'expired' ? 'gratis' : currentPlan;
    const pendingPlan   = business?.pending_plan ?? null;
    const statusMeta    = STATUS_META[currentStatus] ?? STATUS_META.active;
    const endsAt        = business?.subscription_ends_at;
    const trialEndsAt   = business?.trial_ends_at;
    const trialDaysLeft = trialEndsAt
        ? Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow">
                        <Link href="/dashboard/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--fg-3)', textDecoration: 'none', fontSize: 11, fontWeight: 500, transition: 'color .15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-1)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}>
                            {IcoArrowLeft} Configuración
                        </Link>
                    </div>
                    <h1 className="dash-page__title">Planes</h1>
                    <p className="dash-page__sub">Elegí el plan que mejor se adapte a tu negocio</p>
                </div>

                {/* Current plan badge */}
                {business && (
                    <div className="dash-page__actions">
                        <div className="gcard" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-1)' }}>Plan actual:</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: PLANS.find(p => p.id === effectivePlan)?.color ?? 'var(--fg-1)' }}>
                                        {PLANS.find(p => p.id === effectivePlan)?.label}
                                    </span>
                                </div>
                                {(effectivePlan !== 'gratis' || currentStatus === 'expired') && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-3)' }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusMeta.dot, display: 'inline-block', flexShrink: 0 }} />
                                        {statusMeta.label}
                                        {endsAt && currentStatus === 'active' && (
                                            <> · se renueva el {new Date(endsAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}</>
                                        )}
                                        {endsAt && currentStatus === 'cancelled' && (
                                            <> · vence el {new Date(endsAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}</>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pending notice */}
            {pendingPlan && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.2)', marginBottom: 28, fontSize: 12, color: '#fbbf24' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fbbf24', flexShrink: 0, display: 'inline-block' }} />
                    Suscripción a <strong style={{ marginLeft: 3 }}>{pendingPlan === 'pro' ? 'Pro' : 'Negocio'}</strong>&nbsp;pendiente de confirmación en MercadoPago.
                </div>
            )}

            {/* Expired notice */}
            {business && currentStatus === 'expired' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', marginBottom: 28 }}>
                    <div style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }}>{IcoWarn}</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: '0 0 5px' }}>
                            Tu plan venció
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0, lineHeight: 1.7 }}>
                            Tu suscripción al plan{' '}
                            <strong style={{ color: 'var(--fg-1)' }}>
                                {PLANS.find(p => p.id === currentPlan)?.label ?? currentPlan}
                            </strong>{' '}
                            venció{endsAt ? <> el <strong style={{ color: 'var(--fg-1)' }}>{new Date(endsAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></> : ''}.
                            {' '}Tu cuenta pasó al plan <strong style={{ color: 'var(--fg-1)' }}>Gratis</strong>.
                            Suscribite nuevamente para recuperar el acceso.
                        </p>
                    </div>
                    <button
                        className="dbtn dbtn--primary dbtn--sm"
                        onClick={() => handleSubscribe(currentPlan as 'pro' | 'negocio')}
                        disabled={!!subscribing}
                        style={{ flexShrink: 0, alignSelf: 'center' }}
                    >
                        {subscribing === currentPlan ? 'Redirigiendo…' : 'Suscribirme'}
                    </button>
                </div>
            )}

            {/* Cancellation notice */}
            {business && currentStatus === 'cancelled' && endsAt && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', marginBottom: 28 }}>
                    <div style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }}>{IcoWarn}</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', margin: '0 0 5px' }}>
                            Suscripción cancelada
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0, lineHeight: 1.7 }}>
                            Tu acceso al plan{' '}
                            <strong style={{ color: 'var(--fg-1)' }}>
                                {PLANS.find(p => p.id === currentPlan)?.label}
                            </strong>{' '}
                            continúa hasta el{' '}
                            <strong style={{ color: 'var(--fg-1)' }}>
                                {new Date(endsAt).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </strong>.
                            {' '}A partir de esa fecha pasarás automáticamente al plan <strong style={{ color: 'var(--fg-1)' }}>Gratis</strong>.
                        </p>
                    </div>
                    <button
                        className="dbtn dbtn--primary dbtn--sm"
                        onClick={() => handleSubscribe(currentPlan as 'pro' | 'negocio')}
                        disabled={!!subscribing}
                        style={{ flexShrink: 0, alignSelf: 'center' }}
                    >
                        {subscribing === currentPlan ? 'Redirigiendo…' : 'Reactivar'}
                    </button>
                </div>
            )}

            {/* Trial notice */}
            {business && currentStatus === 'active' && trialEndsAt && trialDaysLeft !== null && trialDaysLeft > 0 && currentPlan !== 'gratis' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderRadius: 12, background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)', marginBottom: 28 }}>
                    <div style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }}>{IcoWarn}</div>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', margin: '0 0 5px' }}>
                            Período de prueba — {trialDaysLeft} {trialDaysLeft === 1 ? 'día' : 'días'} restantes
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0, lineHeight: 1.7 }}>
                            Tu prueba gratuita del plan{' '}
                            <strong style={{ color: 'var(--fg-1)' }}>{PLANS.find(p => p.id === currentPlan)?.label}</strong>{' '}
                            vence el{' '}
                            <strong style={{ color: 'var(--fg-1)' }}>
                                {new Date(trialEndsAt).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </strong>.
                            {' '}A partir de ahí se facturará el costo mensual.
                        </p>
                    </div>
                </div>
            )}

            {/* Skeleton */}
            {loading && (
                <div className="skel-page" style={{ marginTop: 4 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {[0, 1, 2].map(i => (
                            <div key={i} className="skel-card" style={{ gap: 16, animationDelay: `${i * 0.08}s` }}>
                                <span className="skel" style={{ height: 13, width: '40%' }} />
                                <span className="skel" style={{ height: 36, width: '60%' }} />
                                <span className="skel" style={{ height: 11, width: '80%' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                    {[0,1,2,3,4].map(j => <span key={j} className="skel" style={{ height: 10, width: `${70 + j * 4}%`, animationDelay: `${(i * 5 + j) * 0.04}s` }} />)}
                                </div>
                                <span className="skel" style={{ height: 40, borderRadius: 10, marginTop: 8 }} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pricing grid */}
            {!loading && (
                <div className="pricing-grid">
                    {PLANS.map(plan => {
                        const isCurrent = currentPlan === plan.id;
                        const isActive  = isCurrent && (currentStatus === 'active' || currentStatus === 'pending');

                        // Determine CTA state
                        let ctaLabel: string;
                        let ctaDisabled = false;
                        let ctaAction: (() => void) | null = null;
                        let ctaDanger = false;

                        if (plan.id === 'gratis') {
                            if (isCurrent) {
                                ctaLabel    = 'Plan actual';
                                ctaDisabled = true;
                            } else {
                                ctaLabel    = 'Bajar a Gratis';
                                ctaAction   = () => setShowCancel(true);
                                ctaDanger   = true;
                            }
                        } else if (plan.id === 'pro') {
                            if (isCurrent && isActive) {
                                ctaLabel  = 'Plan actual';
                                ctaDisabled = true;
                            } else if (isCurrent && currentStatus === 'cancelled') {
                                ctaLabel  = 'Reactivar Pro';
                                ctaAction = () => handleSubscribe('pro');
                            } else if (currentPlan === 'negocio') {
                                ctaLabel  = 'Bajar a Pro';
                                ctaAction = () => handleSubscribe('pro');
                            } else {
                                ctaLabel  = plan.trial ? `Empezar gratis · ${plan.priceLabel}/mes` : `Suscribirse · ${plan.priceLabel}/mes`;
                                ctaAction = () => handleSubscribe('pro');
                            }
                        } else {
                            if (isCurrent && isActive) {
                                ctaLabel  = 'Plan actual';
                                ctaDisabled = true;
                            } else if (isCurrent && currentStatus === 'cancelled') {
                                ctaLabel  = 'Reactivar Negocio';
                                ctaAction = () => handleSubscribe('negocio');
                            } else {
                                ctaLabel  = currentPlan === 'pro'
                                    ? `Subir a Negocio · ${plan.priceLabel}/mes`
                                    : `Suscribirse · ${plan.priceLabel}/mes`;
                                ctaAction = () => handleSubscribe('negocio');
                            }
                        }

                        const isLoading = subscribing === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`pricing-card${plan.featured ? ' pricing-card--featured' : ''}${isCurrent && isActive ? ' pricing-card--current' : ''}`}
                                style={{
                                    '--plan-color': plan.color,
                                    '--plan-accent': plan.accent,
                                    '--plan-border': plan.border,
                                } as React.CSSProperties}
                            >
                                {/* Badge — only one at a time, current takes priority */}
                                {isCurrent && isActive ? (
                                    <div className="pricing-card__badge pricing-card__badge--current">Plan actual</div>
                                ) : plan.badge ? (
                                    <div className="pricing-card__badge">{plan.badge}</div>
                                ) : null}

                                {/* Plan header */}
                                <div className="pricing-card__head">
                                    <div className="pricing-card__icon">
                                        {plan.id === 'gratis'  && <IcoZap size={18} />}
                                        {plan.id === 'pro'     && <IcoSparkles size={18} />}
                                        {plan.id === 'negocio' && <IcoCrown size={18} />}
                                    </div>
                                    <div className="pricing-card__label">{plan.label}</div>
                                    <div className="pricing-card__desc">{plan.desc}</div>
                                </div>

                                {/* Price */}
                                <div className="pricing-card__price-wrap">
                                    <span className="pricing-card__price">{plan.priceLabel}</span>
                                    {plan.period && <span className="pricing-card__period">{plan.period}</span>}
                                </div>
                                {plan.trial && (
                                    <div className="pricing-card__trial">{plan.trial}</div>
                                )}

                                {/* Features */}
                                <ul className="pricing-feats">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className={`pricing-feat${feat.ok ? '' : ' pricing-feat--off'}`}>
                                            <span className="pricing-feat__icon">
                                                {feat.ok ? IcoCheck : IcoX}
                                            </span>
                                            {feat.text}
                                        </li>
                                    ))}
                                </ul>

                                {/* Renewal / expiry info for current plan */}
                                {isCurrent && isActive && plan.id !== 'gratis' && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '9px 12px', borderRadius: 10, marginBottom: 10,
                                        background: 'var(--plan-accent, rgba(255,255,255,.04))',
                                        border: '1px solid var(--plan-border, var(--line))',
                                        fontSize: 12,
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--plan-color, var(--fg-3))' }}>
                                            <path d="M12 2v3.5H8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 5.5A5 5 0 1 1 9 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                        </svg>
                                        <span style={{ color: 'var(--fg-2)' }}>
                                            {endsAt
                                                ? <>Se renueva el <strong style={{ color: 'var(--fg-1)' }}>{new Date(endsAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></>
                                                : 'Suscripción mensual activa'
                                            }
                                        </span>
                                    </div>
                                )}
                                {isCurrent && currentStatus === 'cancelled' && endsAt && plan.id !== 'gratis' && (
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '9px 12px', borderRadius: 10, marginBottom: 10,
                                        background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.18)',
                                        fontSize: 12,
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: '#f87171' }}>
                                            <path d="M7 2L12.5 11.5H1.5L7 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                                            <path d="M7 6v2.5M7 10.5v.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                                        </svg>
                                        <span style={{ color: 'var(--fg-2)' }}>
                                            Acceso hasta el <strong style={{ color: '#f87171' }}>{new Date(endsAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                        </span>
                                    </div>
                                )}

                                {/* CTA */}
                                <button
                                    className={`pricing-card__cta dbtn${plan.featured && !ctaDisabled ? ' dbtn--primary' : ''}${ctaDanger ? ' dbtn--danger' : ''}`}
                                    disabled={ctaDisabled || isLoading || !!subscribing || cancelling}
                                    onClick={ctaAction ?? undefined}
                                    style={{ justifyContent: 'center', padding: '11px 16px', width: '100%', marginTop: 'auto' }}
                                >
                                    {isLoading ? 'Redirigiendo…' : ctaLabel}
                                </button>

                                {/* Cancel sub-action */}
                                {isCurrent && isActive && plan.id !== 'gratis' && (
                                    <button
                                        onClick={() => setShowCancel(true)}
                                        disabled={cancelling || !!subscribing}
                                        style={{ fontSize: 11, color: 'var(--fg-3)', background: 'none', border: 0, cursor: 'pointer', marginTop: 8, padding: '4px 0', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                                    >
                                        Cancelar suscripción
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* FAQ / note */}
            {!loading && (
                <div style={{ marginTop: 32, padding: '20px 24px', borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(255,255,255,.02)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg-1)', margin: 0 }}>Preguntas frecuentes</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px 32px' }}>
                        {[
                            { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. Tu plan sigue activo hasta el fin del período ya pagado.' },
                            { q: '¿Los pagos son en pesos argentinos?', a: 'Sí, todos los precios son en ARS y se procesan con MercadoPago.' },
                            { q: '¿Cómo funciona el período de prueba?', a: 'Los primeros 14 días del plan Pro son gratis, sin cargo.' },
                            { q: '¿Puedo cambiar de plan cuando quiera?', a: 'Sí, podés subir o bajar de plan en cualquier momento.' },
                        ].map((faq, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-1)', margin: 0 }}>{faq.q}</p>
                                <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0, lineHeight: 1.5 }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showCancel && (
                <CancelModal loading={cancelling} onConfirm={handleCancel} onClose={() => !cancelling && setShowCancel(false)} />
            )}
        </div>
    );
}
