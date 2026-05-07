'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';
import ImageUpload from '@/components/ImageUpload';

// ── Types ─────────────────────────────────────────────────────────────────────
type ShopTheme = 'violet' | 'rose' | 'green' | 'cyan' | 'amber';

type Profile = {
    tagline: string; lede: string; address: string; phone: string; whatsapp: string;
    instagram_url: string; tiktok_url: string; theme: ShopTheme; cover_url: string;
    about_quote: string; founded_year: string;
};

type Hour = { day_of_week: number; open_time: string; close_time: string; is_closed: boolean };

type Faq     = { id: number; question: string; answer: string; sort_order: number };
type Product = { id: number; name: string; brand: string; price: number | null; image_url: string; badge: string; description: string; is_visible: boolean };
type Review  = { id: number; author_name: string; author_initial: string; stars: number; text: string; date_label: string; is_visible: boolean };

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const THEMES: { value: ShopTheme; label: string; accent: string; bg: string; dot: string }[] = [
    { value: 'violet', label: 'Violeta',  accent: '#7c3aed', bg: 'oklch(0.13 0.03 280)',  dot: '#c4b5fd' },
    { value: 'rose',   label: 'Rosa',     accent: '#be185d', bg: 'oklch(0.13 0.03 350)',  dot: '#fda4af' },
    { value: 'green',  label: 'Verde',    accent: '#047857', bg: 'oklch(0.13 0.03 160)',  dot: '#6ee7b7' },
    { value: 'cyan',   label: 'Cian',     accent: '#0e7490', bg: 'oklch(0.13 0.03 210)',  dot: '#67e8f9' },
    { value: 'amber',  label: 'Ámbar',    accent: '#b45309', bg: 'oklch(0.14 0.04 60)',   dot: '#fcd34d' },
];

const TABS = ['Perfil', 'Tema', 'Horarios', 'FAQs', 'Productos', 'Reseñas'] as const;
type Tab = typeof TABS[number];

// ── Inline SVG icons ──────────────────────────────────────────────────────────
const IcoCheck   = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPlus    = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoTrash   = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v3.5M7.5 6v3.5M3 3.5l.7 7a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const IcoPencil  = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-6 6-2.5.5.5-2.5L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoEye     = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5C2.5 4 4.3 2.5 6.5 2.5S10.5 4 11.5 6.5C10.5 9 8.7 10.5 6.5 10.5S2.5 9 1.5 6.5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>;
const IcoExtLink = <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2h2v2M11 2L6.5 6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M10 7.5V10a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;

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
function SaveBar({ saving, saved, onSave, label = 'Guardar cambios' }: { saving: boolean; saved: boolean; onSave: () => void; label?: string }) {
    return (
        <button
            onClick={onSave}
            disabled={saving}
            className="dbtn dbtn--primary"
            style={{ width: '100%', justifyContent: 'center', padding: 12, marginTop: 4 }}
        >
            {saved ? <>{IcoCheck}<span>Guardado</span></> : saving ? 'Guardando…' : label}
        </button>
    );
}

// ── ProfileTab ────────────────────────────────────────────────────────────────
function ProfileTab({ token }: { token: string | null }) {
    const empty: Profile = {
        tagline: '', lede: '', address: '', phone: '', whatsapp: '',
        instagram_url: '', tiktok_url: '', theme: 'violet', cover_url: '',
        about_quote: '', founded_year: '',
    };
    const [form, setForm] = useState<Profile>(empty);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/profile`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
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

            <div className="gcard">
                <div className="gcard__head"><h3 className="gcard__title">Imagen de portada</h3></div>
                <div className="gcard__body">
                    <ImageUpload
                        value={form.cover_url}
                        onChange={url => setForm(f => ({ ...f, cover_url: url }))}
                        placeholder="https://…"
                        previewHeight={180}
                    />
                </div>
            </div>

            <SaveBar saving={saving} saved={saved} onSave={handleSave} />
        </div>
    );
}

// ── ThemeTab ──────────────────────────────────────────────────────────────────
function ThemeTab({ token }: { token: string | null }) {
    const [selected, setSelected] = useState<ShopTheme>('violet');
    const [loading, setLoading]   = useState(true);
    const [saving, setSaving]     = useState(false);
    const [saved, setSaved]       = useState(false);

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/profile`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setSelected(r.data.theme ?? 'violet'))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/profile`, { theme: selected }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="skel-page"><span className="skel" style={{ height: 220 }} /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head">
                    <h3 className="gcard__title">Paleta de color</h3>
                    <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Define la apariencia de tu página pública</span>
                </div>
                <div className="gcard__body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
                        {THEMES.map(t => {
                            const active = selected === t.value;
                            return (
                                <button
                                    key={t.value}
                                    onClick={() => setSelected(t.value)}
                                    style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                        padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                                        border: `2px solid ${active ? t.accent : 'var(--line)'}`,
                                        background: active ? `${t.bg}` : 'var(--glass-bg)',
                                        gap: 10, transition: 'all .15s',
                                        outline: 'none',
                                    }}
                                >
                                    {/* Color swatch row */}
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <span style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, border: '1px solid rgba(255,255,255,.08)', display: 'block' }} />
                                        <span style={{ width: 28, height: 28, borderRadius: 8, background: t.accent, display: 'block' }} />
                                        <span style={{ width: 28, height: 28, borderRadius: 8, background: t.dot, display: 'block' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: active ? t.dot : 'var(--fg-1)' }}>{t.label}</span>
                                        {active && (
                                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        const t = THEMES.find(x => x.value === selected)!;
                        return (
                            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)', marginBottom: 20 }}>
                                <div style={{ background: t.bg, padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <span style={{ width: 30, height: 8, borderRadius: 4, background: t.dot, opacity: 0.9 }} />
                                        <span style={{ width: 60, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.15)' }} />
                                    </div>
                                    <div style={{ height: 18, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,.8)', marginTop: 4 }} />
                                    <div style={{ height: 11, width: '75%', borderRadius: 4, background: 'rgba(255,255,255,.3)' }} />
                                    <div style={{ height: 11, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,.2)' }} />
                                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                        <span style={{ padding: '7px 18px', borderRadius: 8, background: t.accent, fontSize: 11, color: '#fff', fontWeight: 600, display: 'inline-block' }}>
                                            Reservar turno
                                        </span>
                                    </div>
                                </div>
                                <div style={{ padding: '8px 20px', background: 'rgba(255,255,255,.03)', borderTop: '1px solid rgba(255,255,255,.06)', fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.dot, display: 'inline-block' }} />
                                    Vista previa · Tema {t.label}
                                </div>
                            </div>
                        );
                    })()}

                    <SaveBar saving={saving} saved={saved} onSave={handleSave} label="Guardar tema" />
                </div>
            </div>
        </div>
    );
}

// ── HoursTab ──────────────────────────────────────────────────────────────────
const DEFAULT_HOURS: Hour[] = DAY_LABELS.map((_, i) => ({
    day_of_week: i,
    open_time: '09:00',
    close_time: '18:00',
    is_closed: i === 0,
}));

function HoursTab({ token }: { token: string | null }) {
    const [hours, setHours] = useState<Hour[]>(DEFAULT_HOURS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

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

    const update = (i: number, patch: Partial<Hour>) =>
        setHours(hs => hs.map((h, idx) => idx === i ? { ...h, ...patch } : h));

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/hours`, { hours }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="skel-page"><div className="skel-card"><span className="skel" style={{ height: 320 }} /></div></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="gcard">
                <div className="gcard__head"><h3 className="gcard__title">Horario de atención</h3></div>
                <div className="gcard__body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {hours.map((h, i) => (
                            <div
                                key={h.day_of_week}
                                style={{
                                    display: 'grid', gridTemplateColumns: '100px 1fr',
                                    alignItems: 'center', gap: 12,
                                    padding: '10px 0',
                                    borderBottom: i < 6 ? '1px solid var(--line)' : 'none',
                                    opacity: h.is_closed ? 0.5 : 1, transition: 'opacity .2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        id={`day-${i}`}
                                        checked={!h.is_closed}
                                        onChange={e => update(i, { is_closed: !e.target.checked })}
                                        style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
                                    />
                                    <label htmlFor={`day-${i}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-1)', cursor: 'pointer', userSelect: 'none' }}>
                                        {DAY_LABELS[h.day_of_week]}
                                    </label>
                                </div>
                                {h.is_closed ? (
                                    <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>Cerrado</span>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="time"
                                            value={h.open_time}
                                            onChange={e => update(i, { open_time: e.target.value })}
                                            className="fg-field__input"
                                            style={{ width: 100, padding: '6px 10px', fontSize: 13 }}
                                        />
                                        <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>–</span>
                                        <input
                                            type="time"
                                            value={h.close_time}
                                            onChange={e => update(i, { close_time: e.target.value })}
                                            className="fg-field__input"
                                            style={{ width: 100, padding: '6px 10px', fontSize: 13 }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <SaveBar saving={saving} saved={saved} onSave={handleSave} label="Guardar horarios" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── FaqsTab ───────────────────────────────────────────────────────────────────
function FaqsTab({ token }: { token: string | null }) {
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

function ProductsTab({ token }: { token: string | null }) {
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
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar este producto?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/products/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProducts(p => p.filter(x => x.id !== id));
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

function ReviewsTab({ token }: { token: string | null }) {
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
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta reseña?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/landing/reviews/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews(rv => rv.filter(x => x.id !== id));
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingAdminPage() {
    const { token } = useAuth();
    const { business } = useBusiness();
    const [tab, setTab] = useState<Tab>('Perfil');

    const slug = business?.slug ?? '';
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
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
                {TABS.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: tab === t ? 600 : 400,
                            color: tab === t ? 'var(--fg-0)' : 'var(--fg-3)',
                            borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                            marginBottom: -1, transition: 'all .15s',
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'Perfil'    && <ProfileTab  token={token} />}
            {tab === 'Tema'      && <ThemeTab    token={token} />}
            {tab === 'Horarios'  && <HoursTab    token={token} />}
            {tab === 'FAQs'      && <FaqsTab     token={token} />}
            {tab === 'Productos' && <ProductsTab token={token} />}
            {tab === 'Reseñas'   && <ReviewsTab  token={token} />}
        </div>
    );
}
