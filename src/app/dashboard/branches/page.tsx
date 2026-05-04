'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

type Branch = { id: number; name: string; address: string | null; employee_count: number; created_at: string };
type Employee = { id: number; name: string | null; email: string; branch_id: number | null };

const IcoPlus = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const IcoPin = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoCopy = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
const IcoCheck = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>;
const IcoEdit = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>;
const IcoTrash = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
const IcoX = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;

export default function BranchesPage() {
    const { token } = useAuth();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [slug, setSlug] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editBranch, setEditBranch] = useState<Branch | null>(null);
    const [formName, setFormName] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const load = async () => {
            try {
                const [bRes, tRes, bizRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/branches', { headers }),
                    axios.get('http://localhost:3000/api/team', { headers }),
                    axios.get('http://localhost:3000/api/businesses/me', { headers }),
                ]);
                setBranches(bRes.data);
                setEmployees(tRes.data);
                setSlug(bizRes.data?.slug || '');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token]);

    const openCreate = () => {
        setEditBranch(null);
        setFormName('');
        setFormAddress('');
        setShowForm(true);
    };

    const openEdit = (branch: Branch) => {
        setEditBranch(branch);
        setFormName(branch.name);
        setFormAddress(branch.address || '');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const headers = { Authorization: `Bearer ${token}` };
        try {
            if (editBranch) {
                const res = await axios.put(`http://localhost:3000/api/branches/${editBranch.id}`,
                    { name: formName, address: formAddress || null }, { headers });
                setBranches(prev => prev.map(b => b.id === editBranch.id ? { ...b, ...res.data } : b));
            } else {
                const res = await axios.post('http://localhost:3000/api/branches',
                    { name: formName, address: formAddress || null }, { headers });
                setBranches(prev => [...prev, res.data]);
            }
            setShowForm(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await axios.delete(`http://localhost:3000/api/branches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBranches(prev => prev.filter(b => b.id !== id));
            setEmployees(prev => prev.map(e => e.branch_id === id ? { ...e, branch_id: null } : e));
        } catch (err) { console.error(err); }
        finally { setDeletingId(null); }
    };

    const handleAssignBranch = async (employeeId: number, branchId: number | null) => {
        try {
            await axios.patch(`http://localhost:3000/api/branches/employees/${employeeId}`,
                { branchId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, branch_id: branchId } : e));
            setBranches(prev => prev.map(b => {
                const count = employees.filter(e => (e.id === employeeId ? branchId : e.branch_id) === b.id).length;
                return { ...b, employee_count: count };
            }));
        } catch (err) { console.error(err); }
    };

    const copyUrl = (branchId: number) => {
        const url = `http://localhost:3001/public/${slug}?branch=${branchId}`;
        navigator.clipboard.writeText(url);
        setCopiedId(branchId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="dash-page">
            {/* Header */}
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow">
                        <span className="dash-page__eyebrow-dot" />
                        Configuración
                    </div>
                    <h1 className="dash-page__title">Sucursales</h1>
                    <p className="dash-page__sub">Gestioná las ubicaciones de tu negocio</p>
                </div>
                <div className="dash-page__actions">
                    <button className="dbtn dbtn--primary" onClick={openCreate}>
                        {IcoPlus}
                        <span>Nueva sucursal</span>
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <div className="dash-modal-overlay">
                    <div className="dash-modal">
                        <div className="dash-modal__head">
                            <h2 className="dash-modal__title">
                                {editBranch ? 'Editar sucursal' : 'Nueva sucursal'}
                            </h2>
                            <button className="dash-iconbtn" onClick={() => setShowForm(false)}>{IcoX}</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Nombre
                                </label>
                                <input
                                    className="dash-input"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Ej: Sucursal Centro"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Dirección <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span>
                                </label>
                                <input
                                    className="dash-input"
                                    value={formAddress}
                                    onChange={e => setFormAddress(e.target.value)}
                                    placeholder="Ej: 18 de Julio 1234, Montevideo"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button type="button" className="dbtn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowForm(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="dbtn dbtn--primary" style={{ flex: 1, justifyContent: 'center' }} disabled={submitting}>
                                    {submitting ? 'Guardando…' : editBranch ? 'Guardar' : 'Crear sucursal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty">Cargando sucursales…</div>
            ) : branches.length === 0 ? (
                <div className="empty">
                    No hay sucursales todavía.<br />
                    <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>Creá tu primera sucursal para organizar tu equipo por ubicación.</span>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {branches.map(branch => {
                        const branchEmployees = employees.filter(e => e.branch_id === branch.id);
                        const unassigned = employees.filter(e => e.branch_id === null || e.branch_id === undefined);
                        return (
                            <div key={branch.id} className="gcard suc">
                                <div className="suc__head">
                                    <div className="suc__pin">{IcoPin}</div>
                                    <div>
                                        <div className="suc__title">{branch.name}</div>
                                        {branch.address && (
                                            <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{branch.address}</div>
                                        )}
                                    </div>
                                    <div className="suc__actions">
                                        <button
                                            className="dbtn dbtn--sm"
                                            onClick={() => copyUrl(branch.id)}
                                            title="Copiar link"
                                        >
                                            {copiedId === branch.id ? IcoCheck : IcoCopy}
                                            <span>{copiedId === branch.id ? 'Copiado' : 'Link'}</span>
                                        </button>
                                        <button className="dash-iconbtn" onClick={() => openEdit(branch)} title="Editar" style={{ width: 32, height: 32 }}>
                                            {IcoEdit}
                                        </button>
                                        <button
                                            className="dash-iconbtn"
                                            onClick={() => handleDelete(branch.id)}
                                            disabled={deletingId === branch.id}
                                            title="Eliminar"
                                            style={{ width: 32, height: 32, color: deletingId === branch.id ? 'var(--fg-3)' : undefined }}
                                        >
                                            {IcoTrash}
                                        </button>
                                    </div>
                                </div>

                                <div className="suc__pros">
                                    Profesionales ({branchEmployees.length})
                                </div>

                                <div className="suc__chips">
                                    {branchEmployees.map(emp => (
                                        <span key={emp.id} className="suc__chip">
                                            {emp.name || emp.email}
                                            <button
                                                onClick={() => handleAssignBranch(emp.id, null)}
                                                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 0, lineHeight: 1 }}
                                                title="Quitar"
                                            >
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                            </button>
                                        </span>
                                    ))}
                                    {unassigned.map(emp => (
                                        <button
                                            key={emp.id}
                                            onClick={() => handleAssignBranch(emp.id, branch.id)}
                                            style={{
                                                padding: '4px 10px',
                                                background: 'none',
                                                border: '1px dashed var(--line)',
                                                borderRadius: 999,
                                                fontSize: 12,
                                                color: 'var(--fg-3)',
                                                cursor: 'pointer',
                                                transition: 'border-color 0.15s, color 0.15s',
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--fg-3)'; }}
                                        >
                                            + {emp.name || emp.email}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
