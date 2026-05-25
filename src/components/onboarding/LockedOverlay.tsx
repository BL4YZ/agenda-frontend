import Link from 'next/link';

type Props = {
    href?: string;
    label?: string;
    message?: string;
};

export default function LockedOverlay({
    href = '/dashboard/settings/billing',
    label = 'Ver Planes',
    message = 'Actualizá tu plan para desbloquear esta sección.',
}: Props) {
    return (
        <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
            borderRadius: 14,
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            background: 'oklch(0.13 0.05 270 / 0.82)',
        }}>
            <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>
                🔒
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--fg-0, #f5f3ff)' }}>Funcionalidad Pro</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-2, #9890b8)', textAlign: 'center', maxWidth: 220, lineHeight: 1.5 }}>{message}</p>
            <Link
                href={href}
                style={{
                    padding: '8px 18px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none',
                }}
            >
                {label} →
            </Link>
        </div>
    );
}
