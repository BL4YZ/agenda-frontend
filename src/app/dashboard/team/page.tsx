'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';

type Member = { id: number; name: string | null; email: string; role: string; phone: string | null; permissions: Record<string, boolean>; plan_suspended?: boolean };
type ServiceAssignment = { id: number; name: string; duration_minutes: number; price: number; assigned: boolean };

const PERMISSION_DEFS = [
    { key: 'analytics', label: 'Ver métricas', desc: 'Estadísticas, ingresos y reportes del negocio' },
    { key: 'settings',  label: 'Ver configuración', desc: 'Ajustes del negocio y conexión de pagos' },
];

const EMPLOYEE_LIMITS: Record<string, number> = { gratis: 1, pro: 5, negocio: Infinity };

const AVATAR_COLORS = [
    { bg: 'rgba(167,139,250,.15)', color: '#a78bfa' },
    { bg: 'rgba(96,165,250,.15)',  color: '#60a5fa' },
    { bg: 'rgba(52,211,153,.15)', color: '#34d399' },
    { bg: 'rgba(251,191,36,.15)', color: '#fbbf24' },
];

const IcoPlus = (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>);
const IcoX = (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>);
const IcoPencil = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2.5l1.5 1.5L3.5 11H2v-1.5L9 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>);
const IcoTrash = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3.25H11.5M4.5 3.25V2.25A.5.5 0 0 1 5 1.75h3a.5.5 0 0 1 .5.5v1M10.25 3.25l-.5 7.5A.5.5 0 0 1 9.25 11.25H3.75a.5.5 0 0 1-.5-.5l-.5-7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoChev = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 5.5l2.5 3 2.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoBriefcase = (<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.4"/></svg>);
const IcoWarn = (<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3L16.5 15.75H1.5L9 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 7.5v3M9 12.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>);
const IcoPhone = (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1h2.5L5.5 3.5l-1.25.75a6 6 0 0 0 1.5 1.5L6.5 4.5l2.5 1V8a1 1 0 0 1-1 1C3.5 9 1 5.5 1 2a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>);
const IcoMail = (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="2" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M1 3l4 3 4-3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>);
const IcoCopy = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V2.5A1.5 1.5 0 0 0 2.5 1H2a1 1 0 0 0-1 1v.5A1.5 1.5 0 0 0 2.5 4H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>);
const IcoCheck = (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>);

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onChange}
            disabled={disabled}
            style={{
                position: 'relative', width: 40, height: 22, borderRadius: 11,
                border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0,
                background: checked ? 'var(--accent)' : 'rgba(255,255,255,.12)',
                opacity: disabled ? 0.5 : 1,
                transition: 'background .25s',
            }}
        >
            <span style={{
                position: 'absolute', top: 3, left: 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', display: 'block',
                transform: checked ? 'translateX(18px)' : undefined,
                transition: 'transform .25s',
            }} />
        </button>
    );
}

export default function TeamPage() {
    const { token } = useAuth();
    const { business } = useBusiness();
    const plan = (business?.subscription_plan ?? 'gratis') as string;
    const employeeLimit = EMPLOYEE_LIMITS[plan] ?? 1;
    const [members, setMembers] = useState<Member[]>([]);

    const [confirmSelect, setConfirmSelect] = useState<Member | null>(null);
    const [selecting, setSelecting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [addEmail, setAddEmail] = useState('');
    const [addError, setAddError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [editMember, setEditMember] = useState<Member | null>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [services, setServices] = useState<ServiceAssignment[]>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setMembers(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const openMember = async (member: Member) => {
        setSelectedMember(member);
        setServicesLoading(true);
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${member.id}/services`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServices(res.data);
        } catch (err) { console.error(err); }
        finally { setServicesLoading(false); }
    };

    const toggleService = async (service: ServiceAssignment) => {
        if (!selectedMember || togglingId !== null) return;
        setTogglingId(service.id);
        try {
            if (service.assigned) {
                await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${selectedMember.id}/services/${service.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${selectedMember.id}/services`,
                    { serviceId: service.id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, assigned: !s.assigned } : s));
        } catch (err) { console.error(err); }
        finally { setTogglingId(null); }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError('');
        setSubmitting(true);
        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/team/add`, { email: addEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMembers(prev => [...prev, res.data.employee]);
            setAddEmail('');
            setShowAddForm(false);
            if (res.data.tempPassword) setTempPassword(res.data.tempPassword);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setAddError(err.response?.data?.message || 'No se pudo añadir al empleado.');
            else setAddError('No se pudo añadir al empleado.');
        } finally { setSubmitting(false); }
    };

    const openEdit = (member: Member, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMember(member);
        setEditName(member.name || '');
        const raw = member.phone || '';
        setEditPhone(raw.startsWith('+598') ? raw.slice(4) : raw);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editMember) return;
        setSaving(true);
        try {
            const fullPhone = editPhone.trim() ? `+598${editPhone.trim()}` : '';
            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${editMember.id}`,
                { name: editName, phone: fullPhone || null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMembers(prev => prev.map(m => m.id === editMember.id ? res.data : m));
            if (selectedMember?.id === editMember.id) setSelectedMember(res.data);
            setEditMember(null);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (member: Member, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`¿Eliminar a ${member.name || member.email} del equipo?`)) return;
        setDeletingId(member.id);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${member.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(prev => prev.filter(m => m.id !== member.id));
            if (selectedMember?.id === member.id) { setSelectedMember(null); setServices([]); }
        } catch (err) { console.error(err); }
        finally { setDeletingId(null); }
    };

    const handleTogglePerm = async (key: string) => {
        if (!selectedMember || selectedMember.role !== 'employee') return;
        const newPerms = { ...selectedMember.permissions, [key]: !selectedMember.permissions[key] };
        setSelectedMember(prev => prev ? { ...prev, permissions: newPerms } : null);
        setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, permissions: newPerms } : m));
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${selectedMember.id}/permissions`,
                { permissions: newPerms },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch {
            setSelectedMember(prev => prev ? { ...prev, permissions: selectedMember.permissions } : null);
            setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, permissions: selectedMember.permissions } : m));
        }
    };

    const handleSelectActive = async () => {
        if (!confirmSelect) return;
        setSelecting(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/team/select-active/${confirmSelect.id}`, {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMembers(prev => prev.map(m =>
                m.role !== 'employee' ? m :
                m.id === confirmSelect.id ? { ...m, plan_suspended: false } : { ...m, plan_suspended: true }
            ));
            setConfirmSelect(null);
        } catch (err) { console.error(err); }
        finally { setSelecting(false); }
    };

    const displayName = (m: Member) => m.name || m.email;
    const getInitial = (m: Member) => (m.name || m.email).charAt(0).toUpperCase();

    const atGratis  = plan === 'gratis';
    const employees = members.filter(m => m.role === 'employee');
    const suspended = employees.filter(m => m.plan_suspended);
    const selectionDone  = suspended.length > 0;
    const needsSelection = atGratis && employees.length > 1 && !selectionDone;
    const overLimit      = employees.length >= employeeLimit;
    const activeEmployee = selectionDone ? employees.find(m => !m.plan_suspended) : null;

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow">
                        <span className="dash-page__eyebrow-dot" />
                        Equipo
                    </div>
                    <h1 className="dash-page__title">Equipo</h1>
                    <p className="dash-page__sub">Gestiona los profesionales de tu negocio</p>
                </div>
                <div className="dash-page__actions">
                    <button
                        className="dbtn dbtn--primary"
                        onClick={() => setShowAddForm(true)}
                        disabled={atGratis && overLimit}
                        title={atGratis && overLimit ? 'Límite de empleados alcanzado en el plan Gratis' : undefined}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {IcoPlus} Añadir empleado
                        </span>
                    </button>
                </div>
            </div>

            {/* Plan warnings */}
            {needsSelection && (
                <div className="gcard" style={{
                    border: '1px solid rgba(251,191,36,.25)',
                    background: 'rgba(251,191,36,.06)',
                    padding: 0, overflow: 'hidden', marginBottom: 24,
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px' }}>
                        <span style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }}>{IcoWarn}</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                                Tu plan Gratis permite solo 1 empleado activo
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                                Tenés {employees.length} empleados. Elegí cuál conserva acceso al panel y visibilidad pública.
                            </p>
                        </div>
                        <a href="/dashboard/settings?tab=plan" style={{ fontSize: 12, fontWeight: 600, color: '#fbbf24', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                            Ver planes
                        </a>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(251,191,36,.15)' }}>
                        {employees.map(m => (
                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid rgba(251,191,36,.1)' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{m.name || m.email}</p>
                                    {m.name && <p style={{ fontSize: 11, color: 'var(--fg-3)' }}>{m.email}</p>}
                                </div>
                                <button className="dbtn" onClick={() => setConfirmSelect(m)} style={{ fontSize: 12 }}>
                                    Mantener activo
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {atGratis && selectionDone && activeEmployee && (
                <div className="gcard" style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px 18px', marginBottom: 24,
                }}>
                    <span style={{ color: 'var(--fg-3)', flexShrink: 0, marginTop: 1 }}>{IcoWarn}</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
                            Solo <span style={{ color: 'var(--accent)' }}>{activeEmployee.name || activeEmployee.email}</span> tiene acceso activo
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>
                            {suspended.length} empleado{suspended.length !== 1 ? 's' : ''} deshabilitado{suspended.length !== 1 ? 's' : ''}. Actualiza tu plan para restaurarlos.
                        </p>
                    </div>
                    <a href="/dashboard/settings?tab=plan" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                        Ver planes
                    </a>
                </div>
            )}

            {/* Two-column layout */}
            <div className="two-col" style={{ gap: 20, marginBottom: 0 }}>

                {/* Member list */}
                <div className="gcard" style={{ padding: 0, overflow: 'hidden' }}>
                    {loading ? (
                        <div className="skel-page" style={{ padding: '12px 16px' }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} className="skel-row" style={{ padding: '10px 0', animationDelay: `${i * 0.08}s` }}>
                                    <span className="skel" style={{ width: 38, height: 38, borderRadius: '50%' }} />
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                                        <span className="skel" style={{ height: 13, width: `${45 + (i % 3) * 12}%` }} />
                                        <span className="skel" style={{ height: 11, width: `${25 + (i % 2) * 8}%` }} />
                                    </div>
                                    <span className="skel" style={{ height: 22, width: 60, borderRadius: 20 }} />
                                </div>
                            ))}
                        </div>
                    ) : members.length === 0 ? (
                        <div className="empty">
                            No hay empleados todavía.<br />
                            <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>Añade empleados para gestionar citas.</span>
                        </div>
                    ) : (
                        members.map((member, i) => {
                            const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                            const isActive = selectedMember?.id === member.id;
                            return (
                                <div
                                    key={member.id}
                                    onClick={() => openMember(member)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 16px', cursor: 'pointer',
                                        borderBottom: i < members.length - 1 ? '1px solid var(--line)' : undefined,
                                        background: isActive ? 'rgba(167,139,250,.08)' : 'transparent',
                                        transition: 'background .15s',
                                    }}
                                    className="team-row"
                                >
                                    {/* Avatar */}
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 700, flexShrink: 0,
                                        background: av.bg, color: av.color,
                                    }}>
                                        {getInitial(member)}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {displayName(member)}
                                            </p>
                                            {member.plan_suspended && (
                                                <span style={{
                                                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                                                    background: 'rgba(239,68,68,.12)', color: '#ef4444',
                                                    textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                                                }}>
                                                    Deshabilitado
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                                            {member.phone && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fg-3)' }}>
                                                    {IcoPhone} {member.phone}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--fg-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {IcoMail} {member.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                                        <button className="dash-iconbtn" onClick={e => openEdit(member, e)} title="Editar" style={{ color: 'var(--fg-3)' }}>
                                            {IcoPencil}
                                        </button>
                                        <button className="dash-iconbtn" onClick={e => handleDelete(member, e)}
                                            disabled={deletingId === member.id} title="Eliminar" style={{ color: 'var(--fg-3)' }}>
                                            {IcoTrash}
                                        </button>
                                        <span style={{ color: 'var(--fg-3)', marginLeft: 2 }}>{IcoChev}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Service assignment + permissions panel */}
                <div className="gcard" style={{ padding: 0, overflow: 'hidden' }}>
                    {!selectedMember ? (
                        <div style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: 'rgba(255,255,255,.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--fg-3)',
                            }}>
                                {IcoBriefcase}
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-2)' }}>Selecciona un empleado</p>
                            <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>Para ver y asignar sus servicios</p>
                        </div>
                    ) : (
                        <div style={{ overflowY: 'auto', maxHeight: 600 }}>
                            {/* Panel header */}
                            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-0)' }}>{displayName(selectedMember)}</p>
                                <p style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{selectedMember.email}</p>
                            </div>

                            {/* Services */}
                            <div style={{ padding: '12px 18px 4px', fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Servicios asignados
                            </div>
                            {servicesLoading ? (
                                <div style={{ padding: '24px', textAlign: 'center', fontSize: 13, color: 'var(--fg-3)' }}>Cargando…</div>
                            ) : services.length === 0 ? (
                                <div style={{ padding: '14px 18px', fontSize: 13, color: 'var(--fg-3)' }}>No hay servicios en tu negocio.</div>
                            ) : (
                                services.map(service => (
                                    <div key={service.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '12px 18px', borderBottom: '1px solid var(--line)',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.name}</p>
                                            <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{service.duration_minutes} min · ${service.price}</p>
                                        </div>
                                        <Toggle
                                            checked={service.assigned}
                                            onChange={() => toggleService(service)}
                                            disabled={togglingId === service.id}
                                        />
                                    </div>
                                ))
                            )}

                            {/* Permissions — employees only */}
                            {selectedMember.role === 'employee' && (
                                <div style={{ borderTop: '1px solid var(--line)' }}>
                                    <div style={{ padding: '12px 18px 4px', fontSize: 10, fontWeight: 700, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        Acceso al panel
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--fg-3)', padding: '0 18px 10px' }}>Qué secciones puede ver este empleado</p>
                                    {PERMISSION_DEFS.map(perm => {
                                        const active = !!selectedMember.permissions?.[perm.key];
                                        return (
                                            <div key={perm.key} style={{
                                                display: 'flex', alignItems: 'center', gap: 14,
                                                padding: '12px 18px', borderBottom: '1px solid var(--line)',
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)' }}>{perm.label}</p>
                                                    <p style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{perm.desc}</p>
                                                </div>
                                                <Toggle checked={active} onChange={() => handleTogglePerm(perm.key)} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add modal */}
            {showAddForm && (
                <div className="dash-modal-overlay" onClick={() => setShowAddForm(false)}>
                    <div className="dash-modal" onClick={e => e.stopPropagation()}>
                        <div className="dash-modal__head">
                            <h2 className="dash-modal__title">Añadir empleado</h2>
                            <button className="dash-iconbtn" onClick={() => setShowAddForm(false)}>{IcoX}</button>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--fg-3)', marginBottom: 16, marginTop: -4 }}>
                            Si no tiene cuenta, se creará automáticamente.
                        </p>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="fg-field">
                                <span className="fg-field__label">Email del empleado</span>
                                <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)}
                                    className="fg-field__input" placeholder="empleado@email.com" required />
                            </div>
                            {addError && <p style={{ fontSize: 13, color: 'oklch(0.65 0.22 25)', margin: 0 }}>{addError}</p>}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="dbtn" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>Cancelar</button>
                                <button type="submit" className="dbtn dbtn--primary" disabled={submitting} style={{ flex: 1 }}>
                                    {submitting ? 'Añadiendo…' : 'Añadir al equipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editMember && (
                <div className="dash-modal-overlay" onClick={() => setEditMember(null)}>
                    <div className="dash-modal" onClick={e => e.stopPropagation()}>
                        <div className="dash-modal__head">
                            <h2 className="dash-modal__title">Editar empleado</h2>
                            <button className="dash-iconbtn" onClick={() => setEditMember(null)}>{IcoX}</button>
                        </div>
                        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="fg-field">
                                <span className="fg-field__label">Nombre</span>
                                <input value={editName} onChange={e => setEditName(e.target.value)}
                                    className="fg-field__input" placeholder="Nombre completo" />
                            </div>
                            <div className="fg-field">
                                <span className="fg-field__label">Celular</span>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden',
                                    background: 'rgba(255,255,255,.04)',
                                }}>
                                    <span style={{
                                        padding: '9px 12px', fontSize: 13, fontWeight: 500,
                                        color: 'var(--fg-3)', borderRight: '1px solid var(--line)',
                                        background: 'rgba(255,255,255,.03)', flexShrink: 0,
                                    }}>+598</span>
                                    <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                                        style={{ flex: 1, padding: '9px 12px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--fg-0)' }}
                                        placeholder="9X XXX XXX" type="tel" />
                                </div>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--fg-3)' }}>Email: {editMember.email}</p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="dbtn" onClick={() => setEditMember(null)} style={{ flex: 1 }}>Cancelar</button>
                                <button type="submit" className="dbtn dbtn--primary" disabled={saving} style={{ flex: 1 }}>
                                    {saving ? 'Guardando…' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm active selection modal */}
            {confirmSelect && (
                <div className="dash-modal-overlay" onClick={() => setConfirmSelect(null)}>
                    <div className="dash-modal" onClick={e => e.stopPropagation()}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12, marginBottom: 16,
                            background: 'rgba(251,191,36,.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fbbf24',
                        }}>{IcoWarn}</div>
                        <h2 className="dash-modal__title">¿Confirmar selección?</h2>
                        <p style={{ fontSize: 13, color: 'var(--fg-2)', margin: '8px 0 4px' }}>
                            Solo <strong>{confirmSelect.name || confirmSelect.email}</strong> tendrá acceso al panel y visibilidad pública.
                        </p>
                        <p style={{ fontSize: 12, color: 'oklch(0.65 0.22 25)', fontWeight: 500, marginBottom: 20 }}>
                            Esta acción no se puede deshacer sin actualizar tu plan.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="dbtn" onClick={() => setConfirmSelect(null)} disabled={selecting} style={{ flex: 1 }}>Cancelar</button>
                            <button className="dbtn dbtn--primary" onClick={handleSelectActive} disabled={selecting} style={{ flex: 1 }}>
                                {selecting ? 'Confirmando…' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Temp password modal */}
            {tempPassword && (
                <div className="dash-modal-overlay" onClick={() => setTempPassword(null)}>
                    <div className="dash-modal" onClick={e => e.stopPropagation()}>
                        <h2 className="dash-modal__title">Empleado creado</h2>
                        <p style={{ fontSize: 13, color: 'var(--fg-3)', margin: '8px 0 16px' }}>
                            No tenía cuenta, se creó automáticamente. Comparte estas credenciales:
                        </p>
                        <div style={{
                            background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)',
                            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>Contraseña temporal</span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--fg-0)' }}>{tempPassword}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="dbtn dbtn--primary"
                                onClick={() => { navigator.clipboard.writeText(tempPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                {copied ? <>{IcoCheck} Copiado</> : <>{IcoCopy} Copiar</>}
                            </button>
                            <button className="dbtn" onClick={() => setTempPassword(null)} style={{ flex: 1 }}>Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
