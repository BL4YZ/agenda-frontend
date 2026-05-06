'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useBusiness, TYPE_PRESETS, type BusinessType } from '@/context/BusinessContext';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

type Business = {
    id: number; name: string; slug: string;
    payment_mode: 'disabled' | 'deposit' | 'full';
    deposit_percentage: number;
    mp_connected: boolean;
    mp_currency: string;
    logo_url?: string | null;
    brand_color?: string | null;
    subscription_plan: 'gratis' | 'pro' | 'negocio';
    subscription_status: 'active' | 'pending' | 'paused' | 'cancelled';
    subscription_ends_at?: string | null;
    pending_plan?: 'pro' | 'negocio' | null;
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
type SvgProps = { size?: number; className?: string; style?: React.CSSProperties };

const IcoScissors  = ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.2"/><circle cx="4" cy="10" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5.5L11 1M5.5 8.5L11 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const IcoSparkles  = ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M7 1l1.2 3.8H12L8.9 6.9l1.2 3.8L7 8.6 3.9 10.7l1.2-3.8L2 4.8h3.8L7 1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>;
const IcoHeart     = ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M7 12C7 12 1.5 8.5 1.5 4.5a2.5 2.5 0 0 1 5-0C7 3 7 3 7 3s0 0 0-0a2.5 2.5 0 0 1 5 1.5C12.5 8.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>;
const IcoActivity  = ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M1 7h2.5L5 4.5 7.5 9.5 9 6l1.5 1H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoLayoutGrid= ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>;
const IcoStar      = ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M7 1l1.75 4.1 4.25.45-3 3 .85 4.45L7 11l-3.85 2 .85-4.45-3-3 4.25-.45L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>;
const IcoZap       = ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M8 1.5L2 7.5h5L5 12.5l7-7H7L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>;
const IcoCrown     = ({ size=14 }: SvgProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none"><path d="M1 11.5h12M2 11.5L1.5 5 4.5 7.5l3.5-5 3.5 5 3-2.5-.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>;

const IcoCheck   = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoCopy    = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V2.5A1.5 1.5 0 0 0 2.5 1H2a1 1 0 0 0-1 1v.5A1.5 1.5 0 0 0 2.5 4H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>);
const IcoExtLink = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2h2v2M11 2L6.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 7.5V10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoBldg    = (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 13V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V13M2 13h9M11 13V7a1 1 0 0 0-1-1H8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="4" y="7" width="2" height="2" stroke="currentColor" strokeWidth="1.1"/></svg>);
const IcoCard    = (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 6.5h12" stroke="currentColor" strokeWidth="1.3"/></svg>);
const IcoLink    = (<svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M6 9a3 3 0 0 0 4.5.5l1.5-1.5A3 3 0 0 0 8 4.5L7 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 6a3 3 0 0 0-4.5-.5L3 7A3 3 0 0 0 7 10.5L8 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>);
const IcoLock    = (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3.5" y="8" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 8V6a3 3 0 1 1 6 0v2" stroke="currentColor" strokeWidth="1.4"/></svg>);
const IcoRefresh = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 2v4H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6A5 5 0 1 1 7 2a5 5 0 0 1 4.6 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>);

// ── Data constants ────────────────────────────────────────────────────────────
const PLAN_META = {
    gratis:  { label: 'Gratis',  icon: IcoZap,     color: 'var(--fg-3)', accent: 'rgba(255,255,255,.08)' },
    pro:     { label: 'Pro',     icon: IcoSparkles, color: '#a78bfa',    accent: 'rgba(167,139,250,.1)' },
    negocio: { label: 'Negocio', icon: IcoCrown,    color: '#c084fc',    accent: 'rgba(192,132,252,.1)' },
};

const BIZ_TYPES: { value: BusinessType; label: string; icon: React.ElementType }[] = [
    { value: 'barberia',    label: 'Barbería',             icon: IcoScissors },
    { value: 'peluqueria',  label: 'Peluquería / Salón',   icon: IcoScissors },
    { value: 'estetica',    label: 'Estética / Spa',        icon: IcoSparkles },
    { value: 'manicura',    label: 'Manicura / Nail Art',   icon: IcoStar     },
    { value: 'consultorio', label: 'Consultorio / Salud',   icon: IcoHeart    },
    { value: 'fitness',     label: 'Fitness / Bienestar',   icon: IcoActivity },
    { value: 'otro',        label: 'Otro',                  icon: IcoLayoutGrid },
];

const FLAG_LABELS: { key: string; label: string }[] = [
    { key: 'showModalities',  label: 'Modalidades de compensación' },
    { key: 'showExpenses',    label: 'Registro de gastos' },
    { key: 'showCommissions', label: 'Resumen de comisiones' },
    { key: 'showTeamReports', label: 'Reportes del equipo' },
];

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return <button className={`dtoggle${checked ? ' is-on' : ''}`} onClick={onChange} />;
}

// ── BusinessTypeSection ───────────────────────────────────────────────────────
function BusinessTypeSection() {
    const { business, featureFlags, updateBusiness } = useBusiness();
    const [localType, setLocalType]   = useState<BusinessType | ''>(business?.business_type ?? '');
    const [localFlags, setLocalFlags] = useState({ ...featureFlags });
    const [saving, setSaving]         = useState(false);
    const [saved, setSaved]           = useState(false);

    useEffect(() => {
        if (business) {
            setLocalType(business.business_type ?? '');
            setLocalFlags({ ...featureFlags });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [business?.id]);

    const applyPreset = (type: BusinessType) => {
        setLocalType(type);
        setLocalFlags({ ...TYPE_PRESETS[type] });
    };

    const handleSave = async () => {
        if (!localType) return;
        setSaving(true);
        try {
            await updateBusiness({ business_type: localType as never, feature_flags: localFlags });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally { setSaving(false); }
    };

    return (
        <div className="gcard">
            <div className="gcard__head">
                <h3 className="gcard__title">Tipo de negocio</h3>
            </div>
            <div className="gcard__body">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8, marginBottom:20 }}>
                    {BIZ_TYPES.map(t => {
                        const active = localType === t.value;
                        return (
                            <button key={t.value} onClick={() => applyPreset(t.value)}
                                style={{
                                    display:'flex', alignItems:'center', gap:8, padding:'10px 12px',
                                    borderRadius:10, border:`1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                                    background: active ? 'oklch(0.25 0.08 290 / 0.4)' : 'transparent',
                                    color: active ? 'var(--accent)' : 'var(--fg-2)',
                                    fontSize:12, fontWeight:500, textAlign:'left', cursor:'pointer',
                                    transition:'all .2s',
                                }}>
                                <t.icon />
                                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--fg-3)', marginBottom:12 }}>Funcionalidades activas</div>
                <div style={{ display:'flex', flexDirection:'column', marginBottom:20 }}>
                    {FLAG_LABELS.map(({ key, label }, i) => (
                        <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'10px 0', borderBottom: i < FLAG_LABELS.length - 1 ? '1px solid var(--line)' : '0', fontSize:13 }}>
                            <span style={{ color:'var(--fg-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 }}>{label}</span>
                            <Toggle checked={!!localFlags[key as keyof typeof localFlags]} onChange={() => setLocalFlags(f => ({ ...f, [key]: !f[key as keyof typeof f] }))} />
                        </div>
                    ))}
                </div>

                <button onClick={handleSave} disabled={saving || !localType} className="dbtn dbtn--primary" style={{ width:'100%', justifyContent:'center', padding:12 }}>
                    {saved ? <>{IcoCheck}<span>Guardado</span></> : saving ? 'Guardando…' : <>{IcoRefresh}<span>Guardar tipo y funciones</span></>}
                </button>
            </div>
        </div>
    );
}

// ── SettingsContent ───────────────────────────────────────────────────────────
function SettingsContent() {
    const { token, role, permissions, profileLoading, logout } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (profileLoading) return;
        if (role === 'employee' && !permissions.settings) { router.replace('/dashboard'); }
    }, [role, permissions, profileLoading, router]);

    const [business, setBusiness] = useState<Business | null>(null);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loadingBusiness, setLoadingBusiness] = useState(true);
    const [mpStatus, setMpStatus] = useState<'idle' | 'connected' | 'error'>('idle');

    const [paymentMode, setPaymentMode] = useState<'disabled' | 'deposit' | 'full'>('disabled');
    const [depositPct, setDepositPct] = useState(30);
    const [savingPayment, setSavingPayment] = useState(false);
    const [paymentSaved, setPaymentSaved] = useState(false);
    const [manualToken, setManualToken] = useState('');
    const [savingToken, setSavingToken] = useState(false);

    const [logoUrl, setLogoUrl] = useState('');
    const [brandColor, setBrandColor] = useState('#6366f1');
    const [savingBrand, setSavingBrand] = useState(false);
    const [brandSaved, setBrandSaved] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const mp = searchParams.get('mp');
        if (mp === 'connected') { setMpStatus('connected'); router.replace('/dashboard/settings'); }
        if (mp === 'error')     { setMpStatus('error');     router.replace('/dashboard/settings'); }
        const sub = searchParams.get('subscription');
        if (sub === 'pro' || sub === 'negocio') { router.replace('/dashboard/settings'); }
    }, [searchParams, router]);

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (res.data) {
                    setBusiness(res.data);
                    setPaymentMode(res.data.payment_mode || 'disabled');
                    setDepositPct(res.data.deposit_percentage || 30);
                    setLogoUrl(res.data.logo_url || '');
                    setBrandColor(res.data.brand_color || '#6366f1');
                    localStorage.setItem('business_slug', res.data.slug);
                    localStorage.setItem('business_name', res.data.name);
                    localStorage.setItem('business_id', String(res.data.id));
                }
            }).catch(console.error)
            .finally(() => setLoadingBusiness(false));
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses`, { name }, { headers: { Authorization: `Bearer ${token}` } });
            localStorage.setItem('business_slug', res.data.slug);
            localStorage.setItem('business_name', res.data.name);
            localStorage.setItem('business_id', String(res.data.id));
            setBusiness(res.data);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.message || 'Error al crear el negocio.');
            else setError('Error al crear el negocio.');
        } finally { setSubmitting(false); }
    };

    const handleConnectMp = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/mp/connect`, { headers: { Authorization: `Bearer ${token}` } });
            window.location.href = res.data.url;
        } catch { console.error('Error al conectar MercadoPago'); }
    };

    const handleDisconnectMp = async () => {
        if (!confirm('¿Desconectar MercadoPago?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/mp/disconnect`, { headers: { Authorization: `Bearer ${token}` } });
            setBusiness(prev => prev ? { ...prev, mp_connected: false } : prev);
            setMpStatus('idle');
        } catch (err) { console.error('Error al desconectar MercadoPago', err); alert('No se pudo desconectar. Revisá la consola.'); }
    };

    const handleConnectManual = async () => {
        if (!manualToken.trim()) return;
        setSavingToken(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/mp/manual`, { access_token: manualToken.trim() }, { headers: { Authorization: `Bearer ${token}` } });
            setBusiness(prev => prev ? { ...prev, mp_connected: true } : prev);
            setMpStatus('connected');
            setManualToken('');
        } catch (err) { console.error('Error al conectar:', err); alert('Token inválido o error al conectar.'); }
        finally { setSavingToken(false); }
    };

    const handleSavePayment = async () => {
        setSavingPayment(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/settings`,
                { payment_mode: paymentMode, deposit_percentage: depositPct },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaymentSaved(true);
            setTimeout(() => setPaymentSaved(false), 2000);
            if (business) setBusiness({ ...business, payment_mode: paymentMode, deposit_percentage: depositPct });
        } catch { console.error('Error al guardar configuración de pago'); }
        finally { setSavingPayment(false); }
    };

    const handleSaveBrand = async () => {
        setSavingBrand(true);
        try {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`,
                { logo_url: logoUrl || null, brand_color: brandColor },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBusiness(prev => prev ? { ...prev, logo_url: res.data.logo_url, brand_color: res.data.brand_color } : prev);
            setBrandSaved(true);
            setTimeout(() => setBrandSaved(false), 2000);
        } catch { console.error('Error al guardar marca propia.'); }
        finally { setSavingBrand(false); }
    };

    const handleDeleteAccount = async () => {
        setDeleteError('');
        setDeleting(true);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
                { data: { password: deletePassword }, headers: { Authorization: `Bearer ${token}` } }
            );
            logout();
            router.replace('/');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setDeleteError(err.response?.data?.message || 'Error al eliminar la cuenta.');
            else setDeleteError('Error al eliminar la cuenta.');
        } finally {
            setDeleting(false);
        }
    };

    const publicUrl  = business ? `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/public/${business.slug}` : '';
    const plan       = business?.subscription_plan ?? 'gratis';
    const planMeta   = PLAN_META[plan] ?? PLAN_META.gratis;
    const PlanIcon   = planMeta.icon;
    const isPro      = plan === 'pro' || plan === 'negocio';

    if (loadingBusiness) {
        return (
            <div className="dash-page">
                <div className="dash-page__head">
                    <div className="dash-page__title-wrap">
                        <h1 className="dash-page__title">Configuración</h1>
                        <p className="dash-page__sub">Personalizá tu negocio</p>
                    </div>
                </div>
                <div className="skel-page">
                    {/* Business type card */}
                    <div className="skel-card" style={{ gap: 16 }}>
                        <span className="skel" style={{ height: 13, width: '28%' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {[0, 1, 2].map(i => <span key={i} className="skel" style={{ height: 72, borderRadius: 12, animationDelay: `${i * 0.06}s` }} />)}
                        </div>
                        <span className="skel" style={{ height: 42, borderRadius: 10, width: '100%', animationDelay: '0.18s' }} />
                    </div>
                    {/* Plan card */}
                    <div className="skel-card" style={{ gap: 14 }}>
                        <span className="skel" style={{ height: 13, width: '22%' }} />
                        <span className="skel" style={{ height: 80, borderRadius: 12, animationDelay: '0.06s' }} />
                    </div>
                    {/* Payments card */}
                    <div className="skel-card" style={{ gap: 14 }}>
                        <span className="skel" style={{ height: 13, width: '30%' }} />
                        <span className="skel" style={{ height: 56, borderRadius: 12, animationDelay: '0.06s' }} />
                        <span className="skel" style={{ height: 42, borderRadius: 10, width: '100%', animationDelay: '0.12s' }} />
                    </div>
                </div>
            </div>
        );
    }

    const mpConnected = business?.mp_connected || mpStatus === 'connected';

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow"><span className="dash-page__eyebrow-dot"/>Cuenta</div>
                    <h1 className="dash-page__title">Configuración</h1>
                    <p className="dash-page__sub">Personalizá tu negocio y sus funcionalidades</p>
                </div>
                {business && (
                    <div className="dash-page__actions settings-header-info">
                        <div className="gcard" style={{ padding:'8px 14px', display:'flex', alignItems:'center', gap:10 }}>
                            <div className="kpi__icon" style={{ width:28, height:28, margin:0, borderRadius:7 }}>{IcoBldg}</div>
                            <div>
                                <div style={{ fontSize:13, fontWeight:600 }}>{business.name}</div>
                                <div style={{ fontSize:11, color:'var(--fg-3)' }}>Plan {planMeta.label}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!business ? (
                <div style={{ maxWidth:440 }}>
                    <div className="gcard">
                        <div className="gcard__head">
                            <h3 className="gcard__title">Crear tu negocio</h3>
                        </div>
                        <div className="gcard__body">
                            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                                <div className="fg-field">
                                    <span className="fg-field__label">Nombre del negocio</span>
                                    <input value={name} onChange={e => setName(e.target.value)}
                                        className="fg-field__input" placeholder="Ej: Peluquería Nova" required />
                                </div>
                                {error && <p style={{ fontSize:13, color:'oklch(0.65 0.22 25)' }}>{error}</p>}
                                <button type="submit" disabled={submitting} className="dbtn dbtn--primary" style={{ justifyContent:'center', padding:12 }}>
                                    {submitting ? 'Creando…' : 'Crear negocio'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="col-2-1" style={{ alignItems:'start' }}>

                    {/* Left column: business type + payments */}
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                        <BusinessTypeSection />

                        {/* Payments */}
                        <div className="gcard" style={{ position:'relative' }}>
                            <div className="gcard__head">
                                <h3 className="gcard__title">Pagos online</h3>
                            </div>

                            {!isPro && (
                                <div style={{
                                    position:'absolute', inset:0, borderRadius:16, backdropFilter:'blur(3px)',
                                    background:'oklch(0.09 0.03 280 / 0.88)',
                                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, zIndex:10,
                                }}>
                                    <div className="kpi__icon" style={{ width:44, height:44, borderRadius:14, margin:0 }}>{IcoLock}</div>
                                    <div style={{ textAlign:'center', padding:'0 24px' }}>
                                        <p style={{ fontSize:14, fontWeight:600, color:'var(--fg-0)' }}>Requiere plan Pro</p>
                                        <p style={{ fontSize:12, color:'var(--fg-3)', marginTop:4 }}>Cobrá señas y pagos online con MercadoPago</p>
                                    </div>
                                    <Link href="/dashboard/settings/billing" className="dbtn dbtn--primary" style={{ textDecoration:'none' }}>
                                        <IcoSparkles /><span>Ver planes · desde $490/mes</span>
                                    </Link>
                                </div>
                            )}

                            <div className="gcard__body">
                                {/* Payment mode selector */}
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 }}>
                                    {[
                                        { value:'disabled', label:'Desactivado', desc:'Sin pago previo' },
                                        { value:'deposit',  label:'Seña',        desc:'Pago parcial' },
                                        { value:'full',     label:'Completo',    desc:'Pago total' },
                                    ].map(opt => {
                                        const active = paymentMode === opt.value;
                                        return (
                                            <button key={opt.value} onClick={() => setPaymentMode(opt.value as typeof paymentMode)}
                                                style={{
                                                    padding:'12px 14px', borderRadius:10, textAlign:'left', cursor:'pointer',
                                                    border:`1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                                                    background: active ? 'rgba(139, 92, 246, 0.18)' : 'var(--glass-bg)',
                                                    transition:'all .2s',
                                                }}>
                                                <p style={{ fontSize:12, fontWeight:600, color: active ? 'var(--accent)' : 'var(--fg-1)' }}>{opt.label}</p>
                                                <p style={{ fontSize:11, color:'var(--fg-3)', marginTop:2 }}>{opt.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {paymentMode === 'deposit' && (
                                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                                        <span style={{ fontSize:13, color:'var(--fg-2)', flexShrink:0 }}>Porcentaje de seña</span>
                                        <input type="range" min={10} max={90} step={5} value={depositPct}
                                            onChange={e => setDepositPct(Number(e.target.value))}
                                            style={{ flex:1, accentColor:'var(--accent)' }} />
                                        <strong style={{ fontFamily:'var(--font-mono)', color:'var(--accent)', width:36, textAlign:'right' }}>{depositPct}%</strong>
                                    </div>
                                )}

                                {paymentMode !== 'disabled' && (
                                    <div style={{ marginBottom:16, display:'flex', flexDirection:'column', gap:12 }}>
                                        {/* MP connection card */}
                                        <div style={{
                                            padding:'14px 16px', borderRadius:12,
                                            border:`1px solid ${mpConnected ? 'rgba(52,211,153,.25)' : 'var(--line)'}`,
                                            background: mpConnected ? 'rgba(52,211,153,.05)' : 'rgba(255,255,255,.02)',
                                        }}>
                                            <p style={{ fontSize:13, fontWeight:600, color:'var(--fg-0)' }}>MercadoPago</p>
                                            <p style={{ fontSize:12, marginTop:2, color: mpConnected ? '#34d399' : 'var(--fg-3)' }}>
                                                {mpConnected ? '✓ Cuenta conectada' : 'Sin conectar'}
                                            </p>
                                            {mpStatus === 'error' && <p style={{ fontSize:12, color:'#f87171', marginTop:2 }}>Error al conectar. Intenta de nuevo.</p>}
                                            <div style={{ display:'flex', gap:8, marginTop:10 }}>
                                                {mpConnected && (
                                                    <button onClick={handleDisconnectMp} className="dbtn dbtn--danger" style={{ flex:1 }}>Desconectar</button>
                                                )}
                                                <button onClick={handleConnectMp} className="dbtn dbtn--primary" style={{ flex:1 }}>
                                                    {mpConnected ? 'Reconectar' : 'Conectar con MercadoPago'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sandbox token */}
                                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                                            <p style={{ fontSize:11, color:'var(--fg-3)', fontWeight:500 }}>Modo sandbox (testing)</p>
                                            <input value={manualToken} onChange={e => setManualToken(e.target.value)}
                                                placeholder="Pegar Access Token TEST-..."
                                                className="fg-field__input" style={{ fontSize:12 }} />
                                            <button onClick={handleConnectManual} disabled={savingToken || !manualToken.trim()} className="dbtn" style={{ fontSize:12 }}>
                                                {savingToken ? 'Conectando…' : 'Usar token de prueba'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleSavePayment} disabled={savingPayment} className="dbtn dbtn--primary" style={{ width:'100%', justifyContent:'center', padding:12 }}>
                                    {paymentSaved ? '✓ Guardado' : savingPayment ? 'Guardando…' : 'Guardar configuración de pagos'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column: plan + link + brand */}
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                        {/* Plan card — compact summary, full management on /settings/billing */}
                        <div className="gcard">
                            <div className="gcard__head">
                                <h3 className="gcard__title">Plan y suscripción</h3>
                                <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99, background:planMeta.accent, color:planMeta.color, flexShrink:0 }}>
                                    <PlanIcon size={10} /> {planMeta.label}
                                </span>
                            </div>
                            <div className="gcard__body">
                                <p style={{ fontSize:12, color:'var(--fg-3)', marginBottom:14 }}>
                                    {plan === 'gratis'  && 'Plan gratuito · 1 profesional · 50 citas/mes'}
                                    {plan === 'pro'     && 'Plan Pro · 5 profesionales · Citas ilimitadas · Pagos online'}
                                    {plan === 'negocio' && 'Plan Negocio · Ilimitado · Marca propia · Sucursales'}
                                </p>
                                <Link href="/dashboard/settings/billing" className="dbtn dbtn--primary" style={{ textDecoration:'none', justifyContent:'center', padding:'10px 16px', display:'flex' }}>
                                    {plan === 'gratis' ? 'Ver planes y mejorar →' : 'Administrar suscripción →'}
                                </Link>
                            </div>
                        </div>

                        {/* Public link */}
                        <div className="gcard">
                            <div className="gcard__head">
                                <h3 className="gcard__title">Link público de reservas</h3>
                            </div>
                            <div className="gcard__body">
                                <p style={{ fontSize:12, color:'var(--fg-2)', marginBottom:12 }}>Compartí este link con tus clientes para que puedan reservar online.</p>
                                <div style={{ display:'flex', gap:6 }}>
                                    <input readOnly value={publicUrl}
                                        style={{ flex:1, minWidth:0, background:'var(--glass-bg)', border:'1px solid var(--line)', borderRadius:9, padding:'9px 12px', color:'var(--fg-1)', fontFamily:'var(--font-mono)', fontSize:11 }} />
                                    <button onClick={() => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                        className="dbtn dbtn--primary dbtn--sm">
                                        {copied ? <>{IcoCheck}<span>Copiado</span></> : <>{IcoCopy}<span>Copiar</span></>}
                                    </button>
                                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="dbtn dbtn--sm" style={{ textDecoration:'none' }}>
                                        {IcoExtLink}<span>Ver</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Brand settings — negocio only */}
                        {business.subscription_plan === 'negocio' && (
                            <div className="gcard">
                                <div className="gcard__head">
                                    <h3 className="gcard__title">Marca propia</h3>
                                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:'rgba(192,132,252,.12)', color:'#c084fc' }}>Negocio</span>
                                </div>
                                <div className="gcard__body">
                                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                                        <div className="fg-field">
                                            <span className="fg-field__label">URL del logo</span>
                                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                {logoUrl && (
                                                    <img src={logoUrl} alt="Logo preview" style={{ width:36, height:36, borderRadius:8, objectFit:'contain', background:'rgba(255,255,255,.06)', border:'1px solid var(--line)', flexShrink:0 }}
                                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                )}
                                                <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                                                    placeholder="https://tu-dominio.com/logo.png"
                                                    className="fg-field__input" style={{ flex:1 }} />
                                            </div>
                                        </div>
                                        <div className="fg-field">
                                            <span className="fg-field__label">Color de marca</span>
                                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                                <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                                                    style={{ width:36, height:36, borderRadius:8, border:'1px solid var(--line)', cursor:'pointer', background:'transparent', padding:2, flexShrink:0 }} />
                                                <strong style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--fg-1)' }}>{brandColor}</strong>
                                                <div style={{ display:'flex', alignItems:'center', gap:5, marginLeft:'auto' }}>
                                                    {['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9'].map(c => (
                                                        <button key={c} onClick={() => setBrandColor(c)}
                                                            style={{ width:22, height:22, borderRadius:5, border:`2px solid ${brandColor === c ? c : 'transparent'}`, background:c, cursor:'pointer', transition:'transform .15s' }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={handleSaveBrand} disabled={savingBrand} className="dbtn dbtn--primary" style={{ width:'100%', justifyContent:'center', padding:12 }}>
                                            {brandSaved ? '✓ Guardado' : savingBrand ? 'Guardando…' : 'Guardar marca propia'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Eliminar cuenta */}
            {role === 'owner' && (
                <div style={{ marginTop: 8, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div>
                            <p style={{ fontSize: 13, color: 'var(--fg-2)' }}>¿Ya no necesitás tu cuenta?</p>
                        </div>
                        <button
                            onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteError(''); }}
                            style={{
                                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                                fontSize: 13, color: 'var(--fg-3)',
                                textDecoration: 'underline', textDecorationColor: 'transparent',
                                transition: 'color .2s, text-decoration-color .2s',
                            }}
                            onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#ef4444'; (e.target as HTMLButtonElement).style.textDecorationColor = '#ef4444'; }}
                            onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = 'var(--fg-3)'; (e.target as HTMLButtonElement).style.textDecorationColor = 'transparent'; }}
                        >
                            Eliminar cuenta
                        </button>
                    </div>
                </div>
            )}

            {/* Modal eliminar cuenta */}
            {showDeleteModal && (
                <div className="dash-modal-overlay" onClick={() => { if (!deleting) { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); } }}>
                    <div className="dash-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="dash-modal__head">
                            <h2 className="dash-modal__title">Eliminar cuenta</h2>
                        </div>
                        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <p style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>
                                Esta acción es <strong style={{ color: '#ef4444' }}>permanente e irreversible</strong>. Se eliminarán tu cuenta, tu negocio, todos tus servicios, empleados y citas.
                            </p>
                            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px' }}>
                                <p style={{ fontSize: 12, color: '#f87171' }}>• Tu suscripción activa será cancelada inmediatamente.</p>
                                <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>• Los empleados desvinculados de tu equipo no serán eliminados.</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 12, color: 'var(--fg-3)', marginBottom: 6 }}>Ingresá tu contraseña para confirmar:</p>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && deletePassword && !deleting && handleDeleteAccount()}
                                    placeholder="Contraseña actual"
                                    className="fg-field__input"
                                    autoFocus
                                />
                            </div>
                            {deleteError && <p style={{ fontSize: 12, color: '#ef4444' }}>{deleteError}</p>}
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(''); }}
                                    className="dbtn" style={{ flex: 1 }} disabled={deleting}>
                                    Cancelar
                                </button>
                                <button onClick={handleDeleteAccount}
                                    className="dbtn dbtn--danger" style={{ flex: 1 }}
                                    disabled={deleting || !deletePassword}>
                                    {deleting ? 'Eliminando…' : 'Confirmar eliminación'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense>
            <SettingsContent />
        </Suspense>
    );
}
