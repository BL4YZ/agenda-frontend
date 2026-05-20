'use client';

const GOLD = '#e6c87a';

interface CalendarBracketProps {
  size?: number;
  strokeColor?: string;
  withToday?: boolean;
}

function CalendarBracket({ size = 28, strokeColor = 'white', withToday = true }: CalendarBracketProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g transform="translate(15, 12)">
        <line x1="14" y1="0" x2="14" y2="10" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="56" y1="0" x2="56" y2="10" stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
        <path
          d="M 0 8 L 0 54 Q 0 76 22 76 L 48 76 Q 70 76 70 54 L 70 8"
          fill="none"
          stroke={strokeColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="10" y1="22" x2="60" y2="22" stroke={strokeColor} strokeWidth="3" opacity="0.55" />
        <circle cx="22" cy="38" r="3.5" fill={strokeColor} opacity="0.55" />
        <circle cx="48" cy="38" r="3.5" fill={strokeColor} opacity="0.55" />
        <circle cx="22" cy="54" r="3.5" fill={strokeColor} opacity={withToday ? 0.35 : 0.45} />
        <circle cx="48" cy="54" r="4.5" fill={withToday ? GOLD : strokeColor} />
      </g>
    </svg>
  );
}

export interface MiAgendaLogoProps {
  size?: number;
  variant?: 'default' | 'icon' | 'inline' | 'wordmark';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function MiAgendaLogo({
  size = 28,
  variant = 'default',
  color = '#f5f1ec',
  className,
  style,
}: MiAgendaLogoProps) {
  const wordmark = (
    <span
      style={{
        fontFamily: 'Inter Tight, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: size * 0.64,
        letterSpacing: '-0.02em',
        color: variant === 'inline' || variant === 'wordmark' ? color : '#f5f1ec',
        lineHeight: 1,
      }}
    >
      MiAgenda
    </span>
  );

  if (variant === 'wordmark') {
    return <span className={className} style={style}>{wordmark}</span>;
  }

  const capsule = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.18) inset, 0 8px 18px -4px rgba(109,40,217,0.4)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 60%)',
        }}
      />
      <CalendarBracket size={size * 0.62} strokeColor="white" withToday />
    </div>
  );

  if (variant === 'icon') {
    return <div className={className} style={style}>{capsule}</div>;
  }

  if (variant === 'inline') {
    return (
      <span
        className={className}
        style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.36, color, ...style }}
      >
        <CalendarBracket size={size} strokeColor="currentColor" withToday />
        {wordmark}
      </span>
    );
  }

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.36, ...style }}
    >
      {capsule}
      {wordmark}
    </div>
  );
}
