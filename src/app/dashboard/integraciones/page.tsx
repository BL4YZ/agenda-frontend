'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL;

const CalendarIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
);

function GoogleCalendarCard({ token }: { token: string | null }) {
    const params = useSearchParams();
    const [connected, setConnected] = useState<boolean | null>(null);
    const [loading, setLoading]     = useState(false);
    const [toast, setToast]         = useState('');

    useEffect(() => {
        if (!token) return;
        axios.get(`${API}/api/integrations/google/status`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => setConnected(r.data.connected))
            .catch(() => setConnected(false));
    }, [token]);

    useEffect(() => {
        const gcal = params.get('gcal');
        if (gcal === 'connected') setToast('Google Calendar conectado correctamente.');
        if (gcal === 'error')     setToast('Ocurrió un error al conectar. Intentá de nuevo.');
        if (gcal === 'cancelled') setToast('Conexión cancelada.');
        if (gcal) setTimeout(() => setToast(''), 4000);
    }, [params]);

    const handleConnect = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const r = await axios.get(`${API}/api/integrations/google/auth`, { headers: { Authorization: `Bearer ${token}` } });
            window.location.href = r.data.url;
        } catch {
            setToast('Error al iniciar la conexión. Intentá de nuevo.');
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!token || !confirm('¿Desconectar Google Calendar? Las citas ya no se sincronizarán.')) return;
        setLoading(true);
        try {
            await axios.delete(`${API}/api/integrations/google/disconnect`, { headers: { Authorization: `Bearer ${token}` } });
            setConnected(false);
            setToast('Google Calendar desconectado.');
        } catch {
            setToast('Error al desconectar. Intentá de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gcard" style={{ maxWidth: 520 }}>
            {toast && (
                <div style={{
                    padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13,
                    background: toast.includes('Error') || toast.includes('cancelada') ? 'rgba(239,68,68,.12)' : 'rgba(52,211,153,.12)',
                    color:      toast.includes('Error') || toast.includes('cancelada') ? '#f87171' : '#34d399',
                    border:     `1px solid ${toast.includes('Error') || toast.includes('cancelada') ? 'rgba(239,68,68,.25)' : 'rgba(52,211,153,.25)'}`,
                }}>
                    {toast}
                </div>
            )}
            <div className="gcard__head" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center',
                    background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 75%, #EA4335 100%)',
                    flexShrink: 0,
                }}>
                    <CalendarIcon />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h3 className="gcard__title" style={{ margin: 0 }}>Google Calendar</h3>
                        {connected !== null && (
                            <span style={{
                                fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                                background: connected ? 'rgba(52,211,153,.15)' : 'rgba(255,255,255,.06)',
                                color:      connected ? '#34d399' : 'var(--fg-3)',
                            }}>
                                {connected ? 'Conectado' : 'Desconectado'}
                            </span>
                        )}
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--fg-3)' }}>
                        Tus citas se sincronizan automáticamente con tu Google Calendar.
                    </p>
                </div>
            </div>

            <div className="gcard__body" style={{ paddingTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {[
                        'Cada cita nueva aparece en tu Google Calendar al instante.',
                        'Si cancelás una cita en Novu, se elimina del calendario.',
                        'Si reprogramás, el evento se actualiza automáticamente.',
                    ].map((t, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--fg-2)' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                                <circle cx="8" cy="8" r="7.5" stroke="var(--accent)" strokeOpacity=".4"/>
                                <path d="M5 8l2 2 4-4" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {t}
                        </div>
                    ))}
                </div>

                {connected === null ? (
                    <div style={{ height: 38, background: 'var(--hover-bg)', borderRadius: 10, width: 160, animation: 'pulse 1.5s ease infinite' }} />
                ) : connected ? (
                    <button
                        onClick={handleDisconnect}
                        disabled={loading}
                        style={{
                            padding: '9px 20px', borderRadius: 999, border: '1px solid rgba(239,68,68,.3)',
                            background: 'rgba(239,68,68,.08)', color: '#f87171', fontSize: 13, fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? 'Desconectando…' : 'Desconectar'}
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1, borderRadius: 999 }}
                    >
                        {loading ? 'Redirigiendo…' : 'Conectar Google Calendar'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function IntegracionesPage() {
    const { token } = useAuth();

    return (
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Integraciones</h1>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--fg-3)' }}>
                    Conectá Novu con las herramientas que ya usás.
                </p>
            </div>
            <Suspense fallback={null}>
                <GoogleCalendarCard token={token} />
            </Suspense>
        </div>
    );
}
