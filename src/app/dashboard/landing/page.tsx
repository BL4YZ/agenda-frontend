'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';
import ImageUpload from '@/components/ImageUpload';

// ── Types ─────────────────────────────────────────────────────────────────────
type ShopTheme = 'violet' | 'rose' | 'green' | 'cyan' | 'amber' | 'bw';
type ShopFont  = 'editorial' | 'elegant' | 'modern';

type Profile = {
    tagline: string; lede: string; address: string; phone: string; whatsapp: string;
    instagram_url: string; tiktok_url: string; theme: ShopTheme; font: ShopFont | null; cover_url: string;
    about_image_url: string; about_quote: string; founded_year: string;
};

type Hour = { day_of_week: number; open_time: string; close_time: string; is_closed: boolean };

type Faq     = { id: number; question: string; answer: string; sort_order: number };
type Product = { id: number; name: string; brand: string; price: number | null; image_url: string; badge: string; description: string; is_visible: boolean };
type Review  = { id: number; author_name: string; author_initial: string; stars: number; text: string; date_label: string; is_visible: boolean };

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const THEMES: { value: ShopTheme; label: string; accent: string; bg: string; dot: string; dark: boolean }[] = [
    { value: 'violet', label: 'Violeta', accent: '#8b5cf6', bg: '#0a0810', dot: '#c4b5fd', dark: true  },
    { value: 'rose',   label: 'Rosa',    accent: '#db2777', bg: '#0d0810', dot: '#f472b6', dark: true  },
    { value: 'green',  label: 'Verde',   accent: '#6e8267', bg: '#faf6f0', dot: '#86a98a', dark: false },
    { value: 'cyan',   label: 'Cian',    accent: '#2563eb', bg: '#f6f8fc', dot: '#06b6d4', dark: false },
    { value: 'amber',  label: 'Ámbar',   accent: '#d97706', bg: '#0d0b07', dot: '#fcd34d', dark: true  },
    { value: 'bw',     label: 'B & N',   accent: '#e8e8e8', bg: '#080808', dot: '#c0c0c0', dark: true  },
];

const FONTS: { value: ShopFont; label: string; family: string; sample: string }[] = [
    { value: 'editorial', label: 'Editorial',  family: '"Fraunces", Georgia, serif',                  sample: 'Aa' },
    { value: 'elegant',   label: 'Elegante',   family: '"Cormorant Garamond", Georgia, serif',         sample: 'Aa' },
    { value: 'modern',    label: 'Moderna',    family: '"Inter Tight", system-ui, sans-serif',         sample: 'Aa' },
];

const TABS = ['Perfil', 'Tema', 'Horarios', 'FAQs', 'Productos', 'Reseñas', 'Galería', 'Equipo'] as const;
type Tab = typeof TABS[number];

const PLAN_RANK = { gratis: 0, pro: 1, negocio: 2 } as const;
type PlanKey = keyof typeof PLAN_RANK;

const TAB_PLAN: Record<Tab, PlanKey> = {
    'Perfil':    'gratis',
    'Tema':      'gratis',
    'Horarios':  'gratis',
    'FAQs':      'pro',
    'Productos': 'pro',
    'Reseñas':   'pro',
    'Galería':   'negocio',
    'Equipo':    'negocio',
};

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const IcoCheck   = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPlus    = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoTrash   = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v3.5M7.5 6v3.5M3 3.5l.7 7a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const IcoPencil  = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-6 6-2.5.5.5-2.5L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoEye     = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5C2.5 4 4.3 2.5 6.5 2.5S10.5 4 11.5 6.5C10.5 9 8.7 10.5 6.5 10.5S2.5 9 1.5 6.5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>;
const IcoExtLink = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2h2v2M11 2L6.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 7.5V10a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// ── Revalidate public page cache after saves ──────────────────────────────────
async function revalidatePublicPage(slug: string) {
    if (!slug) return;
    try {
        await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
        });
    } catch { /* non-critical */ }
}

// ── Field helper ──────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="fg-field">
            <span className="fg-field__label">{label}</span>
            {children}
        </div>
    );
}

// ── SaveBar ───────────────────────────────────────────────────────────────────
function SaveBar({ saving, saved, error, onSave, label = 'Guardar cambios' }: {
    saving: boolean; saved: boolean; error?: string; onSave: () => void; label?: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {error && (
                <p style={{ fontSize: 12, color: '#f87171', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', margin: 0 }}>
                    {error}
                </p>
            )}
            <button
                onClick={onSave}
                disabled={saving}
                className="dbtn dbtn--primary"
                style={{ width: '100%', justifyContent: 'center', padding: 12 }}
            >
                {saved ? <>{IcoCheck}<span>Guardado</span></> : saving ? 'Guardando…' : label}
            </button>
        </div>
    );
}

// ── ProfileTab ────────────────────────────────────────────────────────────────
function ProfileTab({ token, slug }: { token: string | null; slug: string }) {
    const empty: Profile = {
        tagline: '', lede: '', address: '', phone: '', whatsapp: '',
        instagram_url: '', tiktok_url: '', theme: 'violet', font: null, cover_url: '',
        about_image_url: '', about_quote: '', founded_year: '',
    };
    const [form, setForm] = useState<Profile>(empty);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setForm({
                tagline: r.data.tagline ?? '',
                lede: r.data.lede ?? '',
                address: r.data.address ?? '',
                phone: r.data.phone ?? '',
                whatsapp: r.data.whatsapp ?? '',
                instagram_url: r.data.instagram_url ?? '',
                tiktok_url: r.data.tiktok_url ?? '',
                theme: r.data.theme ?? 'violet',
                cover_url: r.data.cover_url ?? '',
                about_image_url: r.data.about_image_url ?? '',
                about_quote: r.data.about_quote ?? '',
                founded_year: r.data.founded_year ? String(r.data.founded_year) : '',
            }))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/profile`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            revalidatePublicPage(slug);
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? `Error ${err.response?.status}: no se pudo guardar. ¿Corriste la migración 002 en Neon?`)
                : 'Error al guardar.';
            setSaveError(msg);
        } finally { setSaving(false); }
    };

    if (loading) return <div className="skel-page"><div className="skel-card"><span className="skel" style={{ height: 360 }} /></div></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head"><h3 className="gcard__title">Información principal</h3></div>
                <div className="gcard__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="Tagline (frase corta debajo del nombre)">
                        <input className="fg-field__input" value={form.tagline} onChange={set('tagline')} placeholder="Ej: Barbería de autor en el centro" maxLength={120} />
                    </Field>
                    <Field label="Lede (descripción SEO, ~150 caracteres)">
                        <textarea className="fg-field__input" value={form.lede} onChange={set('lede')}
                            placeholder="Ej: Cortamos, peinamos y barbamos con estilo. Reservá online."
                            rows={3} maxLength={300} style={{ resize: 'vertical' }} />
                    </Field>
                    <Field label="Frase destacada (sección Sobre nosotros)">
                        <input className="fg-field__input" value={form.about_quote} onChange={set('about_quote')} placeholder="Ej: Cada corte es una obra de arte" maxLength={200} />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Año de fundación">
                            <input className="fg-field__input" value={form.founded_year} onChange={set('founded_year')} placeholder="Ej: 2018" type="number" min={1900} max={2099} />
                        </Field>
                        <Field label="Dirección">
                            <input className="fg-field__input" value={form.address} onChange={set('address')} placeholder="Ej: Av. 18 de Julio 1234" />
                        </Field>
                    </div>
                </div>
            </div>

            <div className="gcard">
                <div className="gcard__head"><h3 className="gcard__title">Contacto y redes</h3></div>
                <div className="gcard__body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <Field label="Teléfono (llamadas)">
                        <input className="fg-field__input" value={form.phone} onChange={set('phone')} placeholder="+598 99 123 456" />
                    </Field>
                    <Field label="WhatsApp (número completo)">
                        <input className="fg-field__input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+598 99 123 456" />
                    </Field>
                    <Field label="URL Instagram">
                        <input className="fg-field__input" value={form.instagram_url} onChange={set('instagram_url')} placeholder="https://instagram.com/mi_negocio" />
                    </Field>
                    <Field label="URL TikTok">
                        <input className="fg-field__input" value={form.tiktok_url} onChange={set('tiktok_url')} placeholder="https://tiktok.com/@mi_negocio" />
                    </Field>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="gcard">
                    <div className="gcard__head"><h3 className="gcard__title">Foto de portada</h3></div>
                    <div className="gcard__body">
                        <ImageUpload value={form.cover_url} onChange={url => setForm(f => ({ ...f, cover_url: url }))} previewHeight={160} />
                    </div>
                </div>
                <div className="gcard">
                    <div className="gcard__head"><h3 className="gcard__title">Foto "Sobre nosotros"</h3></div>
                    <div className="gcard__body">
                        <ImageUpload value={form.about_image_url} onChange={url => setForm(f => ({ ...f, about_image_url: url }))} previewHeight={160} />
                    </div>
                </div>
            </div>

            <SaveBar saving={saving} saved={saved} error={saveError} onSave={handleSave} />
        </div>
    );
}

// ── ThemeTab ──────────────────────────────────────────────────────────────────
function ThemeTab({ token, slug }: { token: string | null; slug: string }) {
    const { business } = useBusiness();
    const plan      = (business?.subscription_plan ?? 'gratis') as PlanKey;
    const isNegocio = (PLAN_RANK[plan] ?? 0) >= PLAN_RANK['negocio'];

    const [selected, setSelected]       = useState<ShopTheme>('violet');
    const [font, setFont]               = useState<ShopFont | null>(null);
    const [brandColor, setBrandColor]   = useState<string | null>(null);  // saved value
    const [brandInput, setBrandInput]   = useState('#6366f1');            // live input
    const [loading, setLoading]         = useState(true);
    const [saving, setSaving]           = useState(false);
    const [saved, setSaved]             = useState(false);
    const [saveError, setSaveError]     = useState('');
    const [savingBrand, setSavingBrand] = useState(false);
    const [savedBrand, setSavedBrand]   = useState(false);
    const [brandError, setBrandError]   = useState('');
    const [logoUrl, setLogoUrl]         = useState('');
    const [savedLogoUrl, setSavedLogoUrl] = useState('');
    const [savingLogo, setSavingLogo]   = useState(false);
    const [savedLogo, setSavedLogo]     = useState(false);
    const [logoError, setLogoError]     = useState('');
    const [savingAll, setSavingAll]     = useState(false);
    const [savedAll, setSavedAll]       = useState(false);

    const publicUrl = slug
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${slug}`
        : '';

    useEffect(() => {
        if (!token) return;
        Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/profile`,  { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`,    { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([profileRes, bizRes]) => {
            setSelected(profileRes.data.theme ?? 'violet');
            setFont(profileRes.data.font ?? null);
            const bc: string | null = bizRes.data?.brand_color ?? null;
            setBrandColor(bc);
            if (bc) setBrandInput(bc);
            const lu: string = bizRes.data?.logo_url ?? '';
            setLogoUrl(lu);
            setSavedLogoUrl(lu);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/profile`, { theme: selected, font: font ?? null }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 4000);
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? `Error ${err.response?.status}: no se pudo guardar.`)
                : 'Error al guardar.';
            setSaveError(msg);
        } finally { setSaving(false); }
    };

    const handleSaveBrand = async () => {
        setSavingBrand(true);
        setBrandError('');
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`,
                { brand_color: brandInput },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBrandColor(brandInput);
            setSavedBrand(true);
            setTimeout(() => setSavedBrand(false), 3000);
            revalidatePublicPage(slug);
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? `Error ${err.response?.status}: no se pudo guardar.`)
                : 'Error al guardar.';
            setBrandError(msg);
        } finally { setSavingBrand(false); }
    };

    const handleClearBrand = async () => {
        setSavingBrand(true);
        setBrandError('');
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`,
                { brand_color: null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBrandColor(null);
            setBrandInput('#6366f1');
            setSavedBrand(true);
            setTimeout(() => setSavedBrand(false), 3000);
            revalidatePublicPage(slug);
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? `Error ${err.response?.status}: no se pudo guardar.`)
                : 'Error al guardar.';
            setBrandError(msg);
        } finally { setSavingBrand(false); }
    };

    const handleSaveLogo = async () => {
        setSavingLogo(true);
        setLogoError('');
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`,
                { logo_url: logoUrl || null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSavedLogoUrl(logoUrl);
            setSavedLogo(true);
            setTimeout(() => setSavedLogo(false), 3000);
            revalidatePublicPage(slug);
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? `Error ${err.response?.status}: no se pudo guardar.`)
                : 'Error al guardar.';
            setLogoError(msg);
        } finally { setSavingLogo(false); }
    };

    const handleSaveAll = async () => {
        setSavingAll(true);
        setSavedAll(false);
        const tasks: Promise<void>[] = [handleSave()];
        if (isNegocio) tasks.push(handleSaveBrand(), handleSaveLogo());
        await Promise.all(tasks);
        setSavedAll(true);
        setSavingAll(false);
        setTimeout(() => setSavedAll(false), 3000);
    };

    if (loading) return <div className="skel-page"><span className="skel" style={{ height: 220 }} /></div>;

    // mini-preview accent: if Negocio and brand color is saved, show live brandInput
    const t = THEMES.find(x => x.value === selected)!;
    const previewAccent = (isNegocio && brandColor !== null) ? brandInput : t.accent;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Paleta de color</h3>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Define la apariencia de tu página pública</span>
                </div>
                <div className="gcard__body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
                        {THEMES.map(th => {
                            const active = selected === th.value;
                            return (
                                <button
                                    key={th.value}
                                    onClick={() => setSelected(th.value)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                                        border: `2px solid ${active ? th.accent : 'var(--line)'}`,
                                        background: active ? `${th.bg}` : 'var(--glass-bg)',
                                        gap: 10, transition: 'all .15s', outline: 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <span style={{ width: 28, height: 28, borderRadius: 8, background: th.bg, border: '1px solid rgba(255,255,255,.08)', display: 'block' }} />
                                        <span style={{ width: 28, height: 28, borderRadius: 8, background: th.accent, display: 'block' }} />
                                        <span style={{ width: 28, height: 28, borderRadius: 8, background: th.dot, display: 'block' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: active ? th.dot : 'var(--fg-1)' }}>{th.label}</span>
                                        {active && (
                                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: th.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Mini preview */}
                    {(() => {
                        const tb = t.dark ? 'rgba(255,255,255,' : 'rgba(0,0,0,';
                        return (
                            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', marginBottom: 20 }}>
                                <div style={{ background: t.bg, padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <span style={{ width: 30, height: 8, borderRadius: 4, background: t.dot, opacity: 0.9 }} />
                                        <span style={{ width: 60, height: 8, borderRadius: 4, background: `${tb}.12)` }} />
                                    </div>
                                    <div style={{ height: 18, width: '55%', borderRadius: 4, background: `${tb}.75)`, marginTop: 4 }} />
                                    <div style={{ height: 11, width: '75%', borderRadius: 4, background: `${tb}.25)` }} />
                                    <div style={{ height: 11, width: '60%', borderRadius: 4, background: `${tb}.16)` }} />
                                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                        <span style={{ padding: '7px 18px', borderRadius: 8, background: previewAccent, fontSize: 11, color: '#fff', fontWeight: 600, display: 'inline-block' }}>
                                            Reservar turno
                                        </span>
                                    </div>
                                </div>
                                <div style={{ padding: '8px 20px', background: `${tb}.03)`, borderTop: `1px solid ${tb}.08)`, fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.dot, display: 'inline-block' }} />
                                    Vista previa · Tema {t.label}
                                    {isNegocio && brandColor && (
                                        <span style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            · Color de marca
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: brandInput, display: 'inline-block', border: '1px solid rgba(255,255,255,.2)' }} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Success banner with link to public page */}
                    {saved && publicUrl && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                            padding: '12px 16px', borderRadius: 10, marginBottom: 12,
                            background: 'rgba(52,211,153,.08)', border: '1px solid rgba(52,211,153,.2)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {IcoCheck}
                                <span style={{ fontSize: 12, color: 'rgb(52,211,153)' }}>Tema guardado correctamente.</span>
                            </div>
                            <a
                                href={publicUrl} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize: 12, color: 'rgb(52,211,153)', textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0 }}
                            >
                                Ver página pública {IcoExtLink}
                            </a>
                        </div>
                    )}

                    {saveError && (
                        <p style={{ fontSize: 12, color: '#f87171', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', marginBottom: 12 }}>
                            {saveError}
                        </p>
                    )}

                </div>
            </div>

            {/* Brand color card — Negocio only */}
            <div className="gcard" style={{ position: 'relative', overflow: 'hidden' }}>
                {!isNegocio && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        backdropFilter: 'blur(4px)',
                        background: 'rgba(10,8,16,.6)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 10, borderRadius: 'inherit',
                    }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(192,132,252,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                            <svg width="19" height="19" viewBox="0 0 22 22" fill="none">
                                <rect x="4" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', margin: 0 }}>Requiere plan Negocio</p>
                        <Link href="/dashboard/settings/billing" className="dbtn dbtn--primary dbtn--sm" style={{ textDecoration: 'none' }}>
                            Ver planes →
                        </Link>
                    </div>
                )}
                <div className="gcard__head">
                    <h3 className="gcard__title">Color de marca</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(192,132,252,.15)', color: '#c084fc', letterSpacing: '0.06em' }}>NEGOCIO</span>
                </div>
                <div className="gcard__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.65, margin: 0 }}>
                        Reemplaza el color de acento del tema elegido en tu página pública. Afecta el botón <em>Reservar turno</em>, el degradado del título del Hero y las etiquetas de acento de los servicios.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Color swatch / native picker trigger */}
                        <div style={{ position: 'relative', width: 44, height: 44, borderRadius: 10, overflow: 'hidden', border: '2px solid var(--line)', flexShrink: 0 }}>
                            <input
                                type="color"
                                value={brandInput}
                                onChange={e => setBrandInput(e.target.value)}
                                style={{ position: 'absolute', inset: '-8px', width: 'calc(100% + 16px)', height: 'calc(100% + 16px)', cursor: 'pointer', border: 'none', padding: 0, background: 'none' }}
                            />
                        </div>
                        {/* Hex input */}
                        <input
                            className="fg-field__input"
                            value={brandInput}
                            onChange={e => setBrandInput(e.target.value)}
                            placeholder="#6366f1"
                            style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', flex: 1 }}
                            maxLength={7}
                        />
                        {brandColor && (
                            <button
                                className="dbtn dbtn--sm"
                                onClick={handleClearBrand}
                                disabled={savingBrand}
                                title="Quitar color de marca y volver al color del tema"
                            >
                                Quitar
                            </button>
                        )}
                    </div>
                    {brandError && (
                        <p style={{ fontSize: 12, color: '#f87171', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', margin: 0 }}>
                            {brandError}
                        </p>
                    )}
                </div>
            </div>

            {/* Logo card — Negocio only */}
            <div className="gcard" style={{ position: 'relative', overflow: 'hidden' }}>
                {!isNegocio && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        backdropFilter: 'blur(4px)',
                        background: 'rgba(10,8,16,.6)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: 10, borderRadius: 'inherit',
                    }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(192,132,252,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                            <svg width="19" height="19" viewBox="0 0 22 22" fill="none">
                                <rect x="4" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M7.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', margin: 0 }}>Requiere plan Negocio</p>
                        <Link href="/dashboard/settings/billing" className="dbtn dbtn--primary dbtn--sm" style={{ textDecoration: 'none' }}>
                            Ver planes →
                        </Link>
                    </div>
                )}
                <div className="gcard__head">
                    <h3 className="gcard__title">Logo del negocio</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(192,132,252,.15)', color: '#c084fc', letterSpacing: '0.06em' }}>NEGOCIO</span>
                </div>
                <div className="gcard__body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.65, margin: 0 }}>
                        Aparece como ícono circular en el nav de tu página pública. Usá una imagen cuadrada (mínimo 128×128 px).
                    </p>
                    {/* Circular nav preview */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                            overflow: 'hidden', border: '2px solid var(--line)',
                            background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: 18,
                        }}>
                            {logoUrl
                                ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ pointerEvents: 'none' }}>?</span>
                            }
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                            Vista previa del ícono en el nav
                            {savedLogoUrl !== logoUrl && <><br/><em style={{ color: '#fbbf24' }}>Cambios sin guardar</em></>}
                        </span>
                    </div>
                    <ImageUpload
                        value={logoUrl}
                        onChange={setLogoUrl}
                        previewHeight={100}
                    />
                    {logoError && (
                        <p style={{ fontSize: 12, color: '#f87171', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', margin: 0 }}>
                            {logoError}
                        </p>
                    )}
                </div>
            </div>

            {/* Tipografía card */}
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Tipografía</h3>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Estilo de letra en tu página pública</span>
                </div>
                <div className="gcard__body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {/* "Por defecto" option — null font */}
                        <button
                            onClick={() => setFont(null)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
                                border: `2px solid ${font === null ? 'var(--accent)' : 'var(--line)'}`,
                                background: font === null ? 'var(--glass-bg)' : 'transparent',
                                gap: 6, transition: 'all .15s', outline: 'none',
                            }}
                        >
                            <span style={{ fontSize: 28, lineHeight: 1, color: 'var(--fg-0)', fontFamily: '"Fraunces", Georgia, serif', fontStyle: 'italic' }}>Aa</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: font === null ? 'var(--accent)' : 'var(--fg-2)' }}>Por defecto</span>
                        </button>
                        {FONTS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setFont(f.value)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
                                    border: `2px solid ${font === f.value ? 'var(--accent)' : 'var(--line)'}`,
                                    background: font === f.value ? 'var(--glass-bg)' : 'transparent',
                                    gap: 6, transition: 'all .15s', outline: 'none',
                                }}
                            >
                                <span style={{ fontSize: 28, lineHeight: 1, color: 'var(--fg-0)', fontFamily: f.family }}>{f.sample}</span>
                                <span style={{ fontSize: 11, fontWeight: 600, color: font === f.value ? 'var(--accent)' : 'var(--fg-2)' }}>{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Unified save button */}
            <button
                className="dbtn dbtn--primary"
                onClick={handleSaveAll}
                disabled={savingAll}
                style={{ width: '100%', justifyContent: 'center', padding: 14 }}
            >
                {savedAll ? <>{IcoCheck}<span>Guardado</span></> : savingAll ? 'Guardando…' : 'Guardar cambios'}
            </button>
        </div>
    );
}

// ── HoursTab ──────────────────────────────────────────────────────────────────
const HOUR_OPTIONS  = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTE_OPTIONS = ['00', '15', '30', '45'];

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [h, m] = value.split(':');
    const nearestMin = MINUTE_OPTIONS.reduce((prev, cur) =>
        Math.abs(parseInt(cur) - parseInt(m)) < Math.abs(parseInt(prev) - parseInt(m)) ? cur : prev
    );
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)',
            borderRadius: 8, padding: '5px 10px',
        }}>
            <select value={h} onChange={e => onChange(`${e.target.value}:${nearestMin}`)}
                style={{ background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', border: 'none', outline: 'none', cursor: 'pointer' }}>
                {HOUR_OPTIONS.map(hr => <option key={hr} value={hr}>{hr}</option>)}
            </select>
            <span style={{ color: 'var(--fg-3)', fontSize: 13, fontWeight: 600 }}>:</span>
            <select value={nearestMin} onChange={e => onChange(`${h}:${e.target.value}`)}
                style={{ background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', border: 'none', outline: 'none', cursor: 'pointer' }}>
                {MINUTE_OPTIONS.map(mn => <option key={mn} value={mn}>{mn}</option>)}
            </select>
        </div>
    );
}

const DEFAULT_HOURS: Hour[] = DAY_LABELS.map((_, i) => ({
    day_of_week: i,
    open_time: '09:00',
    close_time: '18:00',
    is_closed: i === 0,
}));

function HoursTab({ token, slug }: { token: string | null; slug: string }) {
    const [hours, setHours] = useState<Hour[]>(DEFAULT_HOURS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/hours`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                if (r.data.length === 0) return;
                const map = new Map(r.data.map((h: Hour) => [h.day_of_week, h]));
                setHours(DEFAULT_HOURS.map(d => {
                    const h = map.get(d.day_of_week) as Hour | undefined;
                    return h ? {
                        day_of_week: d.day_of_week,
                        open_time:  h.open_time  ? h.open_time.slice(0, 5)  : '09:00',
                        close_time: h.close_time ? h.close_time.slice(0, 5) : '18:00',
                        is_closed:  !!h.is_closed,
                    } : d;
                }));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const toggle = (i: number) =>
        setHours(hs => hs.map((h, idx) => idx === i ? { ...h, is_closed: !h.is_closed } : h));

    const setTime = (i: number, field: 'open_time' | 'close_time', v: string) =>
        setHours(hs => hs.map((h, idx) => idx === i ? { ...h, [field]: v } : h));

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/hours`, { hours }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            revalidatePublicPage(slug);
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? `Error ${err.response?.status}: no se pudo guardar.`)
                : 'Error al guardar.';
            setSaveError(msg);
        } finally { setSaving(false); }
    };

    if (loading) return <div className="skel-page"><div className="skel-card"><span className="skel" style={{ height: 320 }} /></div></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard" style={{ padding: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
                    <h3 className="gcard__title" style={{ margin: 0 }}>Horario de atención</h3>
                </div>
                <div>
                    {hours.map((h, i) => (
                        <div
                            key={h.day_of_week}
                            style={{
                                padding: '12px 20px',
                                borderBottom: i < hours.length - 1 ? '1px solid var(--line)' : 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button
                                    onClick={() => toggle(i)}
                                    style={{
                                        position: 'relative', width: 40, height: 22,
                                        borderRadius: 11, flexShrink: 0,
                                        background: !h.is_closed ? 'var(--accent)' : 'rgba(255,255,255,.1)',
                                        border: 'none', cursor: 'pointer',
                                        transition: 'background .25s',
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute', top: 3, left: 3,
                                        width: 16, height: 16, borderRadius: '50%',
                                        background: '#fff',
                                        transform: !h.is_closed ? 'translateX(18px)' : undefined,
                                        transition: 'transform .25s',
                                        display: 'block',
                                    }} />
                                </button>
                                <span style={{
                                    fontSize: 14, fontWeight: 500, flex: 1,
                                    color: !h.is_closed ? 'var(--fg-0)' : 'var(--fg-3)',
                                    transition: 'color .2s',
                                }}>
                                    {DAY_LABELS[h.day_of_week]}
                                </span>
                                {h.is_closed && (
                                    <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>No disponible</span>
                                )}
                            </div>
                            {!h.is_closed && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingLeft: 52 }}>
                                    <TimeSelect value={h.open_time}  onChange={v => setTime(i, 'open_time', v)} />
                                    <span style={{ color: 'var(--fg-3)', fontSize: 14 }}>—</span>
                                    <TimeSelect value={h.close_time} onChange={v => setTime(i, 'close_time', v)} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ padding: '16px 20px' }}>
                    <SaveBar saving={saving} saved={saved} error={saveError} onSave={handleSave} label="Guardar horarios" />
                </div>
            </div>
        </div>
    );
}

// ── FaqsTab ───────────────────────────────────────────────────────────────────
function FaqsTab({ token, slug }: { token: string | null; slug: string }) {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId]   = useState<number | null>(null);
    const [editQ, setEditQ]     = useState('');
    const [editA, setEditA]     = useState('');
    const [newQ, setNewQ]       = useState('');
    const [newA, setNewA]       = useState('');
    const [adding, setAdding]   = useState(false);
    const [saving, setSaving]   = useState(false);

    const load = useCallback(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/faqs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setFaqs(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async () => {
        if (!newQ.trim() || !newA.trim()) return;
        setSaving(true);
        try {
            const r = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/faqs`,
                { question: newQ.trim(), answer: newA.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFaqs(f => [...f, r.data]);
            setNewQ(''); setNewA(''); setAdding(false);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleUpdate = async (id: number) => {
        setSaving(true);
        try {
            const r = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/faqs/${id}`,
                { question: editQ.trim(), answer: editA.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFaqs(f => f.map(x => x.id === id ? r.data : x));
            setEditId(null);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta FAQ?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/faqs/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setFaqs(f => f.filter(x => x.id !== id));
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="skel-page"><span className="skel" style={{ height: 200 }} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Preguntas frecuentes</h3>
                    <button className="dbtn dbtn--primary dbtn--sm" onClick={() => setAdding(true)}>
                        {IcoPlus}<span>Agregar</span>
                    </button>
                </div>
                <div className="gcard__body">
                    {faqs.length === 0 && !adding && (
                        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>
                            Sin FAQs todavía. Hacé clic en Agregar para crear la primera.
                        </p>
                    )}
                    {faqs.map(faq => (
                        <div key={faq.id} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                            {editId === faq.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <input className="fg-field__input" value={editQ} onChange={e => setEditQ(e.target.value)} placeholder="Pregunta" />
                                    <textarea className="fg-field__input" value={editA} onChange={e => setEditA(e.target.value)} rows={3} style={{ resize: 'vertical' }} placeholder="Respuesta" />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="dbtn dbtn--primary dbtn--sm" onClick={() => handleUpdate(faq.id)} disabled={saving}>{saving ? '…' : 'Guardar'}</button>
                                        <button className="dbtn dbtn--sm" onClick={() => setEditId(null)}>Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', marginBottom: 4 }}>{faq.question}</p>
                                        <p style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5 }}>{faq.answer}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <button className="dbtn dbtn--sm" onClick={() => { setEditId(faq.id); setEditQ(faq.question); setEditA(faq.answer); }}>{IcoPencil}</button>
                                        <button className="dbtn dbtn--sm dbtn--danger" onClick={() => handleDelete(faq.id)}>{IcoTrash}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {adding && (
                        <div style={{ borderTop: faqs.length > 0 ? '1px solid var(--line)' : 'none', paddingTop: faqs.length > 0 ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>Nueva pregunta</p>
                            <input className="fg-field__input" value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="¿Cuál es la pregunta?" />
                            <textarea className="fg-field__input" value={newA} onChange={e => setNewA(e.target.value)} rows={3} style={{ resize: 'vertical' }} placeholder="Respuesta..." />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="dbtn dbtn--primary dbtn--sm" onClick={handleAdd} disabled={saving || !newQ.trim() || !newA.trim()}>{saving ? '…' : 'Guardar FAQ'}</button>
                                <button className="dbtn dbtn--sm" onClick={() => { setAdding(false); setNewQ(''); setNewA(''); }}>Cancelar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── ProductsTab ───────────────────────────────────────────────────────────────
const emptyProduct = { name: '', brand: '', price: '', image_url: '', badge: '', description: '' };

function ProductsTab({ token, slug }: { token: string | null; slug: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading]   = useState(true);
    const [editId, setEditId]     = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ ...emptyProduct });
    const [newForm, setNewForm]   = useState({ ...emptyProduct });
    const [adding, setAdding]     = useState(false);
    const [saving, setSaving]     = useState(false);

    const load = useCallback(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/products`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setProducts(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async () => {
        if (!newForm.name.trim()) return;
        setSaving(true);
        try {
            const r = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/products`,
                { ...newForm, price: newForm.price ? Number(newForm.price) : null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(p => [...p, r.data]);
            setNewForm({ ...emptyProduct });
            setAdding(false);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleUpdate = async (id: number) => {
        setSaving(true);
        try {
            const r = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/products/${id}`,
                { ...editForm, price: editForm.price ? Number(editForm.price) : null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(p => p.map(x => x.id === id ? r.data : x));
            setEditId(null);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleToggleVisible = async (product: Product) => {
        try {
            const r = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/products/${product.id}`,
                { ...product, is_visible: !product.is_visible, price: product.price },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(p => p.map(x => x.id === product.id ? r.data : x));
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/products/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(p => p.filter(x => x.id !== id));
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
    };

    const ProductForm = ({ form, setForm }: { form: typeof emptyProduct; setForm: (f: typeof emptyProduct) => void }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input className="fg-field__input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre *" />
                <input className="fg-field__input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Marca" />
                <input className="fg-field__input" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Precio" min={0} />
                <input className="fg-field__input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Badge (Ej: Nuevo)" />
            </div>
            <ImageUpload
                value={form.image_url}
                onChange={url => setForm({ ...form, image_url: url })}
                previewHeight={100}
                placeholder="URL de imagen"
            />
            <textarea className="fg-field__input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ resize: 'vertical' }} placeholder="Descripción corta" />
        </div>
    );

    if (loading) return <div className="skel-page"><span className="skel" style={{ height: 200 }} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Productos</h3>
                    <button className="dbtn dbtn--primary dbtn--sm" onClick={() => setAdding(true)}>{IcoPlus}<span>Agregar</span></button>
                </div>
                <div className="gcard__body">
                    {products.length === 0 && !adding && (
                        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>
                            Sin productos todavía.
                        </p>
                    )}
                    {products.map(p => (
                        <div key={p.id} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                            {editId === p.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <ProductForm form={editForm} setForm={setEditForm} />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="dbtn dbtn--primary dbtn--sm" onClick={() => handleUpdate(p.id)} disabled={saving}>{saving ? '…' : 'Guardar'}</button>
                                        <button className="dbtn dbtn--sm" onClick={() => setEditId(null)}>Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 0 }}>
                                        {p.image_url && (
                                            <img src={p.image_url} alt={p.name}
                                                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', flexShrink: 0 }}
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        )}
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {p.name}
                                                {p.badge && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'var(--glass-bg)', color: 'var(--fg-3)', border: '1px solid var(--line)' }}>{p.badge}</span>}
                                            </p>
                                            <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                                                {p.brand && <span>{p.brand} · </span>}
                                                {p.price != null && <span style={{ fontFamily: 'var(--font-mono)' }}>${p.price}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                                        <button
                                            className="dbtn dbtn--sm"
                                            onClick={() => handleToggleVisible(p)}
                                            title={p.is_visible ? 'Visible' : 'Oculto'}
                                            style={{ opacity: p.is_visible ? 1 : 0.45 }}
                                        >{IcoEye}</button>
                                        <button className="dbtn dbtn--sm" onClick={() => {
                                            setEditId(p.id);
                                            setEditForm({ name: p.name, brand: p.brand ?? '', price: p.price != null ? String(p.price) : '', image_url: p.image_url ?? '', badge: p.badge ?? '', description: p.description ?? '' });
                                        }}>{IcoPencil}</button>
                                        <button className="dbtn dbtn--sm dbtn--danger" onClick={() => handleDelete(p.id)}>{IcoTrash}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {adding && (
                        <div style={{ borderTop: products.length > 0 ? '1px solid var(--line)' : 'none', paddingTop: products.length > 0 ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>Nuevo producto</p>
                            <ProductForm form={newForm} setForm={setNewForm} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="dbtn dbtn--primary dbtn--sm" onClick={handleAdd} disabled={saving || !newForm.name.trim()}>{saving ? '…' : 'Agregar producto'}</button>
                                <button className="dbtn dbtn--sm" onClick={() => { setAdding(false); setNewForm({ ...emptyProduct }); }}>Cancelar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── ReviewsTab ────────────────────────────────────────────────────────────────
const emptyReview = { author_name: '', stars: '5', text: '', date_label: '' };

function ReviewsTab({ token, slug }: { token: string | null; slug: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId]   = useState<number | null>(null);
    const [editForm, setEditForm] = useState({ ...emptyReview });
    const [newForm, setNewForm]  = useState({ ...emptyReview });
    const [adding, setAdding]    = useState(false);
    const [saving, setSaving]    = useState(false);

    const load = useCallback(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/reviews`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setReviews(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async () => {
        if (!newForm.author_name.trim() || !newForm.text.trim()) return;
        setSaving(true);
        try {
            const r = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/reviews`,
                { ...newForm, stars: Number(newForm.stars) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews(rv => [r.data, ...rv]);
            setNewForm({ ...emptyReview }); setAdding(false);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleUpdate = async (id: number) => {
        setSaving(true);
        try {
            const r = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/reviews/${id}`,
                { ...editForm, stars: Number(editForm.stars) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews(rv => rv.map(x => x.id === id ? r.data : x));
            setEditId(null);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleToggleVisible = async (review: Review) => {
        try {
            const r = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/reviews/${review.id}`,
                { ...review, is_visible: !review.is_visible },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews(rv => rv.map(x => x.id === review.id ? r.data : x));
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta reseña?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/reviews/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews(rv => rv.filter(x => x.id !== id));
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
    };

    const Stars = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
        <div style={{ display: 'flex', gap: 3 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => onChange(String(n))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: n <= Number(value) ? '#fbbf24' : 'var(--line)', padding: 0, lineHeight: 1 }}>
                    ★
                </button>
            ))}
        </div>
    );

    if (loading) return <div className="skel-page"><span className="skel" style={{ height: 200 }} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Reseñas</h3>
                    <button className="dbtn dbtn--primary dbtn--sm" onClick={() => setAdding(true)}>{IcoPlus}<span>Agregar</span></button>
                </div>
                <div className="gcard__body">
                    {reviews.length === 0 && !adding && (
                        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>Sin reseñas todavía.</p>
                    )}
                    {reviews.map(rv => (
                        <div key={rv.id} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                            {editId === rv.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <input className="fg-field__input" value={editForm.author_name} onChange={e => setEditForm(f => ({ ...f, author_name: e.target.value }))} placeholder="Nombre del cliente" />
                                        <input className="fg-field__input" value={editForm.date_label} onChange={e => setEditForm(f => ({ ...f, date_label: e.target.value }))} placeholder="Fecha (Ej: Enero 2024)" />
                                    </div>
                                    <Stars value={editForm.stars} onChange={v => setEditForm(f => ({ ...f, stars: v }))} />
                                    <textarea className="fg-field__input" value={editForm.text} onChange={e => setEditForm(f => ({ ...f, text: e.target.value }))} rows={3} style={{ resize: 'vertical' }} placeholder="Texto de la reseña" />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="dbtn dbtn--primary dbtn--sm" onClick={() => handleUpdate(rv.id)} disabled={saving}>{saving ? '…' : 'Guardar'}</button>
                                        <button className="dbtn dbtn--sm" onClick={() => setEditId(null)}>Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--glass-bg)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--fg-1)', flexShrink: 0 }}>
                                                {rv.author_initial}
                                            </span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{rv.author_name}</span>
                                            <span style={{ color: '#fbbf24', fontSize: 12 }}>{'★'.repeat(rv.stars)}</span>
                                            {rv.date_label && <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{rv.date_label}</span>}
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5 }}>{rv.text}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <button className="dbtn dbtn--sm" onClick={() => handleToggleVisible(rv)} title={rv.is_visible ? 'Visible' : 'Oculta'} style={{ opacity: rv.is_visible ? 1 : 0.45 }}>{IcoEye}</button>
                                        <button className="dbtn dbtn--sm" onClick={() => { setEditId(rv.id); setEditForm({ author_name: rv.author_name, stars: String(rv.stars), text: rv.text, date_label: rv.date_label ?? '' }); }}>{IcoPencil}</button>
                                        <button className="dbtn dbtn--sm dbtn--danger" onClick={() => handleDelete(rv.id)}>{IcoTrash}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {adding && (
                        <div style={{ borderTop: reviews.length > 0 ? '1px solid var(--line)' : 'none', paddingTop: reviews.length > 0 ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)' }}>Nueva reseña</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input className="fg-field__input" value={newForm.author_name} onChange={e => setNewForm(f => ({ ...f, author_name: e.target.value }))} placeholder="Nombre del cliente *" />
                                <input className="fg-field__input" value={newForm.date_label} onChange={e => setNewForm(f => ({ ...f, date_label: e.target.value }))} placeholder="Fecha (Ej: Enero 2024)" />
                            </div>
                            <div>
                                <p style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 4 }}>Estrellas</p>
                                <div style={{ display: 'flex', gap: 3 }}>
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <button key={n} onClick={() => setNewForm(f => ({ ...f, stars: String(n) }))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: n <= Number(newForm.stars) ? '#fbbf24' : 'var(--line)', padding: 0, lineHeight: 1 }}>
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea className="fg-field__input" value={newForm.text} onChange={e => setNewForm(f => ({ ...f, text: e.target.value }))} rows={3} style={{ resize: 'vertical' }} placeholder="Texto de la reseña *" />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="dbtn dbtn--primary dbtn--sm" onClick={handleAdd} disabled={saving || !newForm.author_name.trim() || !newForm.text.trim()}>{saving ? '…' : 'Agregar reseña'}</button>
                                <button className="dbtn dbtn--sm" onClick={() => { setAdding(false); setNewForm({ ...emptyReview }); }}>Cancelar</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── GaleríaTab ────────────────────────────────────────────────────────────────
type GalleryItem = { id: number; image_url: string; caption: string };

function GaleriaTab({ token, slug }: { token: string | null; slug: string }) {
    const [items, setItems]     = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState('');     // URL to add
    const [adding, setAdding]   = useState(false);
    const [saving, setSaving]   = useState(false);

    const load = useCallback(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/gallery`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setItems(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleAdd = async () => {
        if (!pending.trim()) return;
        setSaving(true);
        try {
            const r = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/gallery`,
                { image_url: pending.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setItems(it => [...it, r.data]);
            setPending(''); setAdding(false);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta foto?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/gallery/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setItems(it => it.filter(x => x.id !== id));
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="skel-page"><span className="skel" style={{ height: 200 }} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Galería de trabajos</h3>
                    <button className="dbtn dbtn--primary dbtn--sm" onClick={() => setAdding(true)}>{IcoPlus}<span>Agregar foto</span></button>
                </div>
                <div className="gcard__body">
                    {adding && (
                        <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: 'var(--glass-bg)', border: '1px solid var(--line)' }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 8 }}>Nueva foto</p>
                            <ImageUpload
                                value={pending}
                                onChange={url => setPending(url)}
                                previewHeight={140}
                                placeholder="URL de la imagen"
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                <button className="dbtn dbtn--primary dbtn--sm" onClick={handleAdd} disabled={saving || !pending.trim()}>
                                    {saving ? '…' : 'Agregar a la galería'}
                                </button>
                                <button className="dbtn dbtn--sm" onClick={() => { setAdding(false); setPending(''); }}>Cancelar</button>
                            </div>
                        </div>
                    )}

                    {items.length === 0 && !adding ? (
                        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>
                            Sin fotos todavía. Agregá tus mejores trabajos.
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                            {items.map(item => (
                                <div key={item.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', background: 'var(--glass-bg)', border: '1px solid var(--line)' }}>
                                    <img
                                        src={item.image_url} alt={item.caption || 'Foto'}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                                    />
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{
                                            position: 'absolute', top: 6, right: 6,
                                            width: 26, height: 26, borderRadius: '50%',
                                            background: 'rgba(239,68,68,.85)', border: 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff',
                                        }}
                                        title="Eliminar"
                                    >
                                        {IcoTrash}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── EquipoTab ─────────────────────────────────────────────────────────────────
type TeamMemberAdmin = { id: number; name: string; avatar_url: string; bio: string; years_experience: string; instagram_handle: string; is_public: boolean };

function EquipoTab({ token, slug }: { token: string | null; slug: string }) {
    const [members, setMembers]   = useState<TeamMemberAdmin[]>([]);
    const [loading, setLoading]   = useState(true);
    const [editId, setEditId]     = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Omit<TeamMemberAdmin, 'id' | 'name'>>({ avatar_url: '', bio: '', years_experience: '', instagram_handle: '', is_public: true });
    const [saving, setSaving]     = useState(false);
    const [saved, setSaved]       = useState<number | null>(null);

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/team`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setMembers(r.data.map((m: Record<string, unknown>) => ({
                ...m,
                avatar_url: (m.avatar_url as string) ?? '',
                bio: (m.bio as string) ?? '',
                years_experience: m.years_experience != null ? String(m.years_experience) : '',
                instagram_handle: (m.instagram_handle as string) ?? '',
                is_public: m.is_public !== false,
            }))))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async (id: number) => {
        setSaving(true);
        try {
            const r = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/team/${id}`,
                { ...editForm, years_experience: editForm.years_experience ? Number(editForm.years_experience) : null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMembers(ms => ms.map(m => m.id === id ? {
                ...r.data,
                avatar_url: r.data.avatar_url ?? '',
                bio: r.data.bio ?? '',
                years_experience: r.data.years_experience != null ? String(r.data.years_experience) : '',
                instagram_handle: r.data.instagram_handle ?? '',
                is_public: r.data.is_public !== false,
            } : m));
            setEditId(null);
            setSaved(id);
            setTimeout(() => setSaved(null), 2000);
            revalidatePublicPage(slug);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="skel-page"><span className="skel" style={{ height: 200 }} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Equipo</h3>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Fotos y bios visibles en la página pública</span>
                </div>
                <div className="gcard__body">
                    {members.length === 0 && (
                        <p style={{ fontSize: 13, color: 'var(--fg-3)', textAlign: 'center', padding: '20px 0' }}>
                            No hay integrantes de equipo todavía.
                        </p>
                    )}
                    {members.map(m => (
                        <div key={m.id} style={{ borderBottom: '1px solid var(--line)', padding: '16px 0' }}>
                            {editId === m.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{m.name}</span>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)', marginLeft: 'auto', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={editForm.is_public} onChange={e => setEditForm(f => ({ ...f, is_public: e.target.checked }))}
                                                style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                                            Visible en página pública
                                        </label>
                                    </div>
                                    <ImageUpload
                                        label="Foto de perfil"
                                        value={editForm.avatar_url}
                                        onChange={url => setEditForm(f => ({ ...f, avatar_url: url }))}
                                        previewHeight={120}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <Field label="Años de experiencia">
                                            <input className="fg-field__input" type="number" min={0} max={60} value={editForm.years_experience} onChange={e => setEditForm(f => ({ ...f, years_experience: e.target.value }))} placeholder="Ej: 8" />
                                        </Field>
                                        <Field label="Instagram (sin @)">
                                            <input className="fg-field__input" value={editForm.instagram_handle} onChange={e => setEditForm(f => ({ ...f, instagram_handle: e.target.value }))} placeholder="mi_usuario" />
                                        </Field>
                                    </div>
                                    <Field label="Bio">
                                        <textarea className="fg-field__input" rows={2} style={{ resize: 'vertical' }} value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Contá un poco sobre este profesional…" />
                                    </Field>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="dbtn dbtn--primary dbtn--sm" onClick={() => handleSave(m.id)} disabled={saving}>{saving ? '…' : IcoCheck}<span>{saving ? 'Guardando…' : 'Guardar'}</span></button>
                                        <button className="dbtn dbtn--sm" onClick={() => setEditId(null)}>Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    {m.avatar_url ? (
                                        <img src={m.avatar_url} alt={m.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--line)', flexShrink: 0 }}
                                            onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                                    ) : (
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--glass-bg)', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--fg-3)', flexShrink: 0 }}>
                                            {m.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{m.name}</p>
                                        <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                                            {m.bio ? m.bio.slice(0, 60) + (m.bio.length > 60 ? '…' : '') : 'Sin bio'}
                                            {!m.is_public && <span style={{ marginLeft: 6, color: '#f87171' }}>· Oculto</span>}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                                        {saved === m.id && <span style={{ fontSize: 11, color: '#34d399' }}>{IcoCheck}</span>}
                                        <button className="dbtn dbtn--sm" onClick={() => {
                                            setEditId(m.id);
                                            setEditForm({ avatar_url: m.avatar_url, bio: m.bio, years_experience: m.years_experience, instagram_handle: m.instagram_handle, is_public: m.is_public });
                                        }}>{IcoPencil}</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── LockedTab ─────────────────────────────────────────────────────────────────
function LockedTab({ required }: { required: 'pro' | 'negocio' }) {
    const isPro = required === 'pro';
    const color = isPro ? '#a78bfa' : '#c084fc';
    const bg    = isPro ? 'rgba(167,139,250,.1)' : 'rgba(192,132,252,.1)';
    return (
        <div className="gcard">
            <div className="gcard__body" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'52px 24px', gap:16 }}>
                <div style={{ width:52, height:52, borderRadius:16, background:bg, display:'flex', alignItems:'center', justifyContent:'center', color }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <rect x="4" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M7.5 10V7.5a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                </div>
                <div>
                    <p style={{ fontSize:15, fontWeight:700, color:'var(--fg-0)', marginBottom:6 }}>
                        Requiere plan {isPro ? 'Pro' : 'Negocio'}
                    </p>
                    <p style={{ fontSize:13, color:'var(--fg-3)', lineHeight:1.6, maxWidth:320 }}>
                        {isPro
                            ? 'Mejorá al plan Pro para gestionar Productos, Reseñas y FAQs en tu página pública.'
                            : 'Con el plan Negocio podés mostrar tu Equipo y Galería de trabajos en tu página pública.'}
                    </p>
                </div>
                <Link href="/dashboard/settings/billing" className="dbtn dbtn--primary" style={{ textDecoration:'none' }}>
                    Ver planes y mejorar →
                </Link>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingAdminPage() {
    const { token } = useAuth();
    const { business } = useBusiness();
    const [tab, setTab] = useState<Tab>('Perfil');

    const slug    = business?.slug ?? '';
    const plan    = (business?.subscription_plan ?? 'gratis') as PlanKey;
    const rank    = PLAN_RANK[plan] ?? 0;
    const publicUrl = slug
        ? `${process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')}/public/${slug}`
        : '';

    return (
        <div className="dash-page">
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow"><span className="dash-page__eyebrow-dot" />Página pública</div>
                    <h1 className="dash-page__title">Página pública</h1>
                    <p className="dash-page__sub">Administrá el contenido que ven tus clientes</p>
                </div>
                {publicUrl && (
                    <div className="dash-page__actions">
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="dbtn" style={{ textDecoration: 'none' }}>
                            {IcoExtLink}<span>Ver página</span>
                        </a>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, overflowX: 'auto', marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 0, scrollbarWidth: 'none' }}>
                {TABS.map(t => {
                    const required  = TAB_PLAN[t];
                    const unlocked  = rank >= PLAN_RANK[required];
                    const badge     = !unlocked ? (required === 'pro' ? 'PRO' : 'NEGOCIO') : null;
                    const badgeColor = required === 'pro' ? '#a78bfa' : '#c084fc';
                    const badgeBg   = required === 'pro' ? 'rgba(167,139,250,.15)' : 'rgba(192,132,252,.15)';
                    return (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                                padding: '8px 14px', background: 'none', border: 'none',
                                cursor: unlocked ? 'pointer' : 'default',
                                fontSize: 13, fontWeight: tab === t ? 600 : 400,
                                color: tab === t ? 'var(--fg-0)' : unlocked ? 'var(--fg-3)' : 'var(--fg-3)',
                                borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                                marginBottom: -1, transition: 'all .15s',
                                opacity: unlocked ? 1 : 0.55,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {t}
                            {badge && (
                                <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: badgeBg, color: badgeColor, letterSpacing: '0.06em' }}>
                                    {badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* All tabs stay mounted — CSS hides inactive ones so unsaved state is never lost */}
            <div style={{ display: tab === 'Perfil'    ? 'block' : 'none' }}><ProfileTab  token={token} slug={slug} /></div>
            <div style={{ display: tab === 'Tema'      ? 'block' : 'none' }}><ThemeTab    token={token} slug={slug} /></div>
            <div style={{ display: tab === 'Horarios'  ? 'block' : 'none' }}><HoursTab    token={token} slug={slug} /></div>
            <div style={{ display: tab === 'FAQs'      ? 'block' : 'none' }}>
                {rank >= PLAN_RANK['pro'] ? <FaqsTab token={token} slug={slug} /> : <LockedTab required="pro" />}
            </div>
            <div style={{ display: tab === 'Productos' ? 'block' : 'none' }}>
                {rank >= PLAN_RANK['pro'] ? <ProductsTab token={token} slug={slug} /> : <LockedTab required="pro" />}
            </div>
            <div style={{ display: tab === 'Reseñas'   ? 'block' : 'none' }}>
                {rank >= PLAN_RANK['pro'] ? <ReviewsTab token={token} slug={slug} /> : <LockedTab required="pro" />}
            </div>
            <div style={{ display: tab === 'Galería'   ? 'block' : 'none' }}>
                {rank >= PLAN_RANK['negocio'] ? <GaleriaTab token={token} slug={slug} /> : <LockedTab required="negocio" />}
            </div>
            <div style={{ display: tab === 'Equipo'    ? 'block' : 'none' }}>
                {rank >= PLAN_RANK['negocio'] ? <EquipoTab token={token} slug={slug} /> : <LockedTab required="negocio" />}
            </div>
        </div>
    );
}
