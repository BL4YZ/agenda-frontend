'use client';

import { useState } from 'react';

interface FaqItemProps {
  q: string;
  a: string;
  idx: number;
}

export default function FaqItem({ q, a, idx }: FaqItemProps) {
  const [open, setOpen] = useState(idx === 0);

  return (
    <div
      style={{ borderBottom: '1px solid var(--line)', padding: '24px 0', cursor: 'pointer' }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
        <h4 style={{ fontSize: 19, fontWeight: 500 }}>{q}</h4>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'var(--accent)' : 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          color: open ? 'white' : 'var(--fg-1)',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
          transition: 'all 0.4s var(--ease-out)',
          flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
      <div style={{
        maxHeight: open ? 200 : 0,
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.5s var(--ease-out), opacity 0.4s var(--ease-out), margin-top 0.4s',
        marginTop: open ? 14 : 0,
      }}>
        <p style={{ color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.6, maxWidth: 640 }}>{a}</p>
      </div>
    </div>
  );
}
