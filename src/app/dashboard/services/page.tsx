'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

type Service = { id: number; name: string; duration_minutes: number; price: string };

const IcoPlus = (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
);
const IcoX = (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
);
const IcoPencil = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
);
const IcoTrash = (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1.75 3.5H12.25M5.25 3.5V2.333A.583.583 0 0 1 5.833 1.75h2.334A.583.583 0 0 1 8.75 2.333V3.5M11.083 3.5l-.583 8.167A.583.583 0 0 1 9.917 12.25H4.083a.583.583 0 0 1-.583-.583L2.917 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IcoClock = (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M6.5 3.5V6.5L8.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
);
const IcoDollar = (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1.5v10M4 4c0-1.105.9-2 2-2h1.5C8.88 2 10 3.12 10 4.5S8.88 7 7.5 7H5.5C4.12 7 3 8.12 3 9.5S4.12 12 5.5 12H7c1.1 0 2-.9 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
);

function ServiceModal({
    title,
    nameVal, setNameVal,
    durationVal, setDurationVal,
    priceVal, setPriceVal,
    error,
    submitting,
    onSubmit,
    onClose,
    submitLabel,
    onDelete,
}: {
    title: string;
    nameVal: string; setNameVal: (v: string) => void;
    durationVal: string; setDurationVal: (v: string) => void;
    priceVal: string; setPriceVal: (v: string) => void;
    error: string;
    submitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    submitLabel: string;
    onDelete?: () => void;
}) {
    return (
        <div className="dash-modal-overlay" onClick={onClose}>
            <div className="dash-modal" onClick={e => e.stopPropagation()}>
                <div className="dash-modal__head">
                    <h2 className="dash-modal__title">{title}</h2>
                    <button className="dash-iconbtn" onClick={onClose}>{IcoX}</button>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="fg-field">
                        <span className="fg-field__label">Nombre</span>
                        <input
                            value={nameVal}
                            onChange={e => setNameVal(e.target.value)}
                            className="fg-field__input"
                            placeholder="Ej: Corte de cabello"
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="fg-field">
                            <span className="fg-field__label">Duración (min)</span>
                            <input
                                type="number"
                                value={durationVal}
                                onChange={e => setDurationVal(e.target.value)}
                                className="fg-field__input"
                                placeholder="60"
                                min="1"
                                required
                            />
                        </div>
                        <div className="fg-field">
                            <span className="fg-field__label">Precio ($)</span>
                            <input
                                type="number"
                                value={priceVal}
                                onChange={e => setPriceVal(e.target.value)}
                                className="fg-field__input"
                                placeholder="50"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>
                    {error && (
                        <p style={{ fontSize: 13, color: 'oklch(0.65 0.22 25)', margin: 0 }}>{error}</p>
                    )}
                    <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                        {onDelete && (
                            <button type="button" className="dbtn dbtn--danger" onClick={onDelete}>
                                Eliminar
                            </button>
                        )}
                        <button type="button" className="dbtn" onClick={onClose} style={{ flex: 1 }}>
                            Cancelar
                        </button>
                        <button type="submit" className="dbtn dbtn--primary" disabled={submitting} style={{ flex: 1 }}>
                            {submitting ? 'Guardando…' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function ServicesPage() {
    const { token } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [price, setPrice] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [editService, setEditService] = useState<Service | null>(null);
    const [editName, setEditName] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editError, setEditError] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);

    useEffect(() => {
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setServices(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/services`,
                { name, duration_minutes: parseInt(duration), price: parseFloat(price) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setServices(prev => [...prev, res.data]);
            setName(''); setDuration(''); setPrice('');
            setShowForm(false);
        } catch {
            setError('Error al crear el servicio.');
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (service: Service, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditService(service);
        setEditName(service.name);
        setEditDuration(String(service.duration_minutes));
        setEditPrice(String(parseFloat(service.price)));
        setEditError('');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editService) return;
        setEditError('');
        setEditSubmitting(true);
        try {
            const res = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/services/${editService.id}`,
                { name: editName, duration_minutes: parseInt(editDuration), price: parseFloat(editPrice) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setServices(prev => prev.map(s => s.id === editService.id ? res.data : s));
            setEditService(null);
        } catch {
            setEditError('Error al actualizar el servicio.');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setServices(prev => prev.filter(s => s.id !== id));
        } catch {
            console.error('Error al eliminar el servicio.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteFromEdit = async () => {
        if (!editService) return;
        if (!window.confirm(`¿Eliminar "${editService.name}"? Esta acción no se puede deshacer.`)) return;
        setEditService(null);
        await handleDelete(editService.id);
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
                    <h1 className="dash-page__title">Servicios</h1>
                    <p className="dash-page__sub">Los servicios que ofrece tu negocio</p>
                </div>
                <div className="dash-page__actions">
                    <button className="dbtn dbtn--primary" onClick={() => setShowForm(true)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {IcoPlus} Nuevo servicio
                        </span>
                    </button>
                </div>
            </div>

            {/* Create modal */}
            {showForm && (
                <ServiceModal
                    title="Nuevo servicio"
                    nameVal={name} setNameVal={setName}
                    durationVal={duration} setDurationVal={setDuration}
                    priceVal={price} setPriceVal={setPrice}
                    error={error}
                    submitting={submitting}
                    onSubmit={handleCreate}
                    onClose={() => { setShowForm(false); setError(''); }}
                    submitLabel="Crear servicio"
                />
            )}

            {/* Edit modal */}
            {editService && (
                <ServiceModal
                    title="Editar servicio"
                    nameVal={editName} setNameVal={setEditName}
                    durationVal={editDuration} setDurationVal={setEditDuration}
                    priceVal={editPrice} setPriceVal={setEditPrice}
                    error={editError}
                    submitting={editSubmitting}
                    onSubmit={handleUpdate}
                    onClose={() => setEditService(null)}
                    submitLabel="Guardar"
                    onDelete={handleDeleteFromEdit}
                />
            )}

            {/* List */}
            <div className="dtable-wrap">
                {loading ? (
                    <div className="empty">Cargando servicios…</div>
                ) : services.length === 0 ? (
                    <div className="empty">
                        No hay servicios todavía.<br />
                        <span style={{ color: 'var(--fg-3)', fontSize: 13 }}>
                            Crea tu primer servicio para que los clientes puedan reservar.
                        </span>
                    </div>
                ) : (
                    <table className="dtable">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Duración</th>
                                <th>Precio</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service.id}>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--fg-0)' }}>{service.name}</span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--fg-2)' }}>
                                            {IcoClock} {service.duration_minutes} min
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--fg-2)' }}>
                                            {IcoDollar} {parseFloat(service.price).toFixed(2)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                            <button
                                                className="dash-iconbtn"
                                                onClick={e => openEdit(service, e)}
                                                title="Editar"
                                                style={{ color: 'var(--fg-3)' }}
                                            >
                                                {IcoPencil}
                                            </button>
                                            <button
                                                className="dash-iconbtn"
                                                onClick={() => handleDelete(service.id)}
                                                disabled={deletingId === service.id}
                                                title="Eliminar"
                                                style={{ color: 'var(--fg-3)' }}
                                            >
                                                {IcoTrash}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
