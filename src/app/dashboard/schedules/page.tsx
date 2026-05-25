'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const IcoSave = (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 2h8.586L13 4.414V13H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <rect x="4" y="9" width="7" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="4" y="2" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
);
const IcoClock = (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7.5 4v3.5L9.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
);

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [h, m] = value.split(':');
    const nearestMin = MINUTES.reduce((prev, cur) =>
        Math.abs(parseInt(cur) - parseInt(m)) < Math.abs(parseInt(prev) - parseInt(m)) ? cur : prev
    );
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--line)',
            borderRadius: 8, padding: '5px 10px',
        }}>
            <select
                value={h}
                onChange={e => onChange(`${e.target.value}:${nearestMin}`)}
                style={{ background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
                {HOURS.map(hr => <option key={hr} value={hr}>{hr}</option>)}
            </select>
            <span style={{ color: 'var(--fg-3)', fontSize: 13, fontWeight: 600 }}>:</span>
            <select
                value={nearestMin}
                onChange={e => onChange(`${h}:${e.target.value}`)}
                style={{ background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
                {MINUTES.map(mn => <option key={mn} value={mn}>{mn}</option>)}
            </select>
        </div>
    );
}

type Member = { id: number; name: string; email: string };

const DAYS = [
    { label: 'Domingo', value: 0 },
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
];

type DayState = { enabled: boolean; start: string; end: string };
const defaultDay = (): DayState => ({ enabled: false, start: '09:00', end: '18:00' });

export default function SchedulesPage() {
    const { token, role, userId } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [days, setDays] = useState<DayState[]>(DAYS.map(defaultDay));
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!token) return;
        if (role === 'owner') {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setMembers(res.data);
                    if (res.data.length > 0) setSelectedId(res.data[0].id);
                })
                .catch(console.error)
                .finally(() => setMembersLoading(false));
        } else if (userId) {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setMembers([{ id: res.data.id, name: res.data.name, email: res.data.email }]);
                    setSelectedId(res.data.id);
                })
                .catch(() => setSelectedId(userId))
                .finally(() => setMembersLoading(false));
        }
    }, [token, role, userId]);

    useEffect(() => {
        if (!selectedId || !token) return;
        setLoading(true);
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/schedules/${selectedId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const next = DAYS.map(d => {
                const row = res.data.find((r: { day_of_week: number; start_time: string; end_time: string }) => r.day_of_week === d.value);
                if (row) return { enabled: true, start: row.start_time.slice(0, 5), end: row.end_time.slice(0, 5) };
                return defaultDay();
            });
            setDays(next);
        }).catch(console.error)
        .finally(() => setLoading(false));
    }, [selectedId, token]);

    const toggle = (i: number) => {
        setDays(prev => prev.map((d, idx) => idx === i ? { ...d, enabled: !d.enabled } : d));
    };

    const setTime = (i: number, field: 'start' | 'end', value: string) => {
        setDays(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
    };

    const handleSave = async () => {
        if (!selectedId) return;
        setSaving(true);
        const schedule = DAYS
            .filter((_, i) => days[i].enabled)
            .map(d => {
                const i = DAYS.findIndex(x => x.value === d.value);
                return { day_of_week: d.value, start_time: days[i].start + ':00', end_time: days[i].end + ':00' };
            });
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/schedules/${selectedId}`,
                { schedule },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const selectedMember = members.find(m => m.id === selectedId);

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow">
                        <span className="dash-page__eyebrow-dot" />
                        Equipo
                    </div>
                    <h1 className="dash-page__title">Horarios</h1>
                    <p className="dash-page__sub">Define los días y horas de trabajo de cada profesional</p>
                </div>
                <div className="dash-page__actions">
                    <button
                        className="dbtn dbtn--primary"
                        onClick={handleSave}
                        disabled={saving || !selectedId}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {IcoSave}
                            {saved ? 'Guardado ✓' : saving ? 'Guardando…' : 'Guardar'}
                        </span>
                    </button>
                </div>
            </div>

            {membersLoading ? (
                <div className="skel-page">
                    {/* Member pill skeletons */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        {[80, 110, 90].map((w, i) => (
                            <span key={i} className="skel" style={{ height: 34, width: w, borderRadius: 10, animationDelay: `${i * 0.06}s` }} />
                        ))}
                    </div>
                    {/* Schedule card skeleton */}
                    <div className="skel-card" style={{ padding: 0, gap: 0 }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
                            <span className="skel" style={{ height: 13, width: 120 }} />
                        </div>
                        {DAYS.map((_, i) => (
                            <div key={i} style={{ padding: '14px 20px', borderBottom: i < DAYS.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className="skel" style={{ width: 40, height: 22, borderRadius: 11, flexShrink: 0, animationDelay: `${i * 0.05}s` }} />
                                <span className="skel" style={{ height: 13, width: 70 + (i % 3) * 16, animationDelay: `${i * 0.05 + 0.03}s` }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : members.length === 0 && role === 'owner' ? (
                <div className="empty">
                    No hay empleados todavía.<br />
                    <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>Añade empleados en la sección Equipo.</span>
                </div>
            ) : (
                <>
                    {/* Member selector — solo para owner */}
                    {role === 'owner' && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                            {members.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedId(m.id)}
                                    className={selectedId === m.id ? 'dbtn dbtn--primary' : 'dbtn'}
                                >
                                    {m.name || m.email}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Schedule card */}
                    <div className="gcard" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Card header */}
                        <div style={{
                            padding: '14px 20px',
                            borderBottom: '1px solid var(--line)',
                            display: 'flex', alignItems: 'center', gap: 8,
                            color: 'var(--fg-2)', fontSize: 14, fontWeight: 500,
                        }}>
                            <span style={{ color: 'var(--fg-3)' }}>{IcoClock}</span>
                            {selectedMember?.name || selectedMember?.email || 'Mi horario'}
                        </div>

                        {loading ? (
                            <div>
                                {DAYS.map((_, i) => (
                                    <div key={i} style={{ padding: '14px 20px', borderBottom: i < DAYS.length - 1 ? '1px solid var(--line)' : undefined, display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span className="skel" style={{ width: 40, height: 22, borderRadius: 11, flexShrink: 0, animationDelay: `${i * 0.05}s` }} />
                                        <span className="skel" style={{ height: 13, width: 70 + (i % 3) * 16, animationDelay: `${i * 0.05 + 0.03}s` }} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>
                                {DAYS.map((day, i) => (
                                    <div
                                        key={day.value}
                                        style={{
                                            padding: '12px 20px',
                                            borderBottom: i < DAYS.length - 1 ? '1px solid var(--line)' : undefined,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {/* Toggle */}
                                            <button
                                                onClick={() => toggle(i)}
                                                style={{
                                                    position: 'relative', width: 40, height: 22,
                                                    borderRadius: 11, flexShrink: 0,
                                                    background: days[i].enabled ? 'var(--accent)' : 'rgba(255,255,255,.1)',
                                                    border: 'none', cursor: 'pointer',
                                                    transition: 'background .25s',
                                                }}
                                            >
                                                <span style={{
                                                    position: 'absolute', top: 3, left: 3,
                                                    width: 16, height: 16, borderRadius: '50%',
                                                    background: '#fff',
                                                    transform: days[i].enabled ? 'translateX(18px)' : undefined,
                                                    transition: 'transform .25s',
                                                    display: 'block',
                                                }} />
                                            </button>

                                            <span style={{
                                                fontSize: 14, fontWeight: 500, flex: 1,
                                                color: days[i].enabled ? 'var(--fg-0)' : 'var(--fg-3)',
                                                transition: 'color .2s',
                                            }}>
                                                {day.label}
                                            </span>

                                            {!days[i].enabled && (
                                                <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>No disponible</span>
                                            )}
                                        </div>

                                        {days[i].enabled && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingLeft: 52 }}>
                                                <TimeSelect value={days[i].start} onChange={v => setTime(i, 'start', v)} />
                                                <span style={{ color: 'var(--fg-3)', fontSize: 14 }}>—</span>
                                                <TimeSelect value={days[i].end} onChange={v => setTime(i, 'end', v)} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
