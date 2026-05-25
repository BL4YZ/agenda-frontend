type Props = {
    plan: 'pro' | 'negocio';
};

export default function PlanBadge({ plan }: Props) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 99,
            fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
            background: 'rgba(167,139,250,0.12)',
            color: '#a78bfa',
            border: '1px solid rgba(167,139,250,0.25)',
            flexShrink: 0,
        }}>
            🔒 Solo {plan === 'negocio' ? 'Negocio' : 'Pro'}
        </span>
    );
}
