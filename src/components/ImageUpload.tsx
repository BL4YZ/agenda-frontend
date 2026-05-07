'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

interface Props {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
    previewHeight?: number;
}

export default function ImageUpload({
    value,
    onChange,
    label,
    placeholder = 'https://…',
    previewHeight = 140,
}: Props) {
    const { token } = useAuth();
    const inputRef  = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError]         = useState('');

    const handleFile = async (file: File) => {
        setError('');
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await axios.post<{ url: string }>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/uploads`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            onChange(res.data.url);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'Error al subir la imagen.'
                : 'Error al subir la imagen.';
            setError(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {label && <span className="fg-field__label">{label}</span>}

            {/* Preview zone / drop target */}
            <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                    position: 'relative',
                    height: value ? previewHeight : 90,
                    borderRadius: 10,
                    border: '1.5px dashed var(--line)',
                    background: 'var(--glass-bg)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'border-color .2s',
                }}
                onClick={() => inputRef.current?.click()}
            >
                {value ? (
                    <img
                        src={value}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                    />
                ) : (
                    <div style={{ textAlign: 'center', pointerEvents: 'none', padding: '0 12px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 6 }}>
                            <rect x="3" y="3" width="18" height="18" rx="3"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="M21 15l-5-5L5 21"/>
                        </svg>
                        <p style={{ fontSize: 12, color: 'var(--fg-3)', margin: 0 }}>
                            {uploading ? 'Subiendo…' : 'Arrastrá o hacé clic para subir'}
                        </p>
                    </div>
                )}

                {/* Uploading overlay */}
                {uploading && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'oklch(0.09 0.03 280 / 0.75)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="dash-search__spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                    </div>
                )}

                {/* Change overlay on hover when image exists */}
                {value && !uploading && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'oklch(0.09 0.03 280 / 0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background .2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.09 0.03 280 / 0.55)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'oklch(0.09 0.03 280 / 0)')}
                    >
                        <span style={{
                            fontSize: 11, fontWeight: 600, color: '#fff',
                            padding: '5px 12px', borderRadius: 99,
                            background: 'rgba(0,0,0,.5)',
                            opacity: 0, transition: 'opacity .2s',
                            pointerEvents: 'none',
                        }}
                        className="img-upload__change-label"
                        >
                            Cambiar imagen
                        </span>
                    </div>
                )}
            </div>

            {/* URL input */}
            <div style={{ display: 'flex', gap: 6 }}>
                <input
                    className="fg-field__input"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ flex: 1, fontSize: 12 }}
                />
                <button
                    type="button"
                    className="dbtn dbtn--sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    title="Subir archivo"
                    style={{ flexShrink: 0 }}
                >
                    {uploading ? (
                        <span className="dash-search__spinner" style={{ width: 13, height: 13, borderWidth: 1.5 }} />
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M6.5 9V3M4 5.5l2.5-2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 10.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                    )}
                    <span>Subir</span>
                </button>
                {value && (
                    <button
                        type="button"
                        className="dbtn dbtn--sm"
                        onClick={() => onChange('')}
                        title="Quitar imagen"
                        style={{ flexShrink: 0, color: 'var(--fg-3)' }}
                    >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M3 3l7 7M10 3l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                    </button>
                )}
            </div>

            {error && <p style={{ fontSize: 11, color: '#f87171', margin: 0 }}>{error}</p>}

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                style={{ display: 'none' }}
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
}
