'use client';

interface MiAgendaLogoProps {
  size?: number;
}

export default function MiAgendaLogo({ size = 28 }: MiAgendaLogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: 'linear-gradient(135deg, var(--v-400), var(--v-700))',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 0 1px oklch(1 0 0 / 0.18) inset, 0 8px 18px -4px var(--accent-glow)',
        position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 20%, oklch(1 0 0 / 0.4), transparent 60%)',
        }} />
        <svg
          width={size * 0.55} height={size * 0.55}
          viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.4" strokeLinecap="round"
        >
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M3 10h18M8 3v4M16 3v4" />
          <circle cx="12" cy="15" r="1.5" fill="white" />
        </svg>
      </div>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: '-0.02em',
        color: 'var(--fg-0)',
      }}>
        MiAgenda
      </span>
    </div>
  );
}
