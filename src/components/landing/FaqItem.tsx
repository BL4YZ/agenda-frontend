'use client';

import { useState } from 'react';

interface FaqItemProps {
  q: string;
  a: string;
  idx: number;
}

export default function FaqItem({ q, a, idx }: FaqItemProps) {
  const [open, setOpen] = useState(idx === 0);
  const answerId = `faq-answer-${idx}`;
  const buttonId = `faq-question-${idx}`;

  return (
    <div style={{ borderBottom: '1px solid var(--line)', padding: '24px 0' }}>
      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 500 }}>
        <button
          id={buttonId}
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', width: '100%', justifyContent: 'space-between',
            alignItems: 'center', gap: 24, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0, textAlign: 'left',
            color: 'var(--fg-0)', fontSize: 19, fontWeight: 500,
            fontFamily: 'inherit',
          }}
        >
          <span>{q}</span>
          <span
            aria-hidden="true"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: open ? 'var(--accent)' : 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: open ? 'white' : 'var(--fg-1)',
              transform: open ? 'rotate(45deg)' : 'rotate(0)',
              transition: 'all 0.4s var(--ease-out)',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={answerId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!open}
        style={{
          maxHeight: open ? 200 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.5s var(--ease-out), opacity 0.4s var(--ease-out), margin-top 0.4s',
          marginTop: open ? 14 : 0,
        }}
      >
        <p style={{ color: 'var(--fg-2)', fontSize: 15, lineHeight: 1.6, maxWidth: 640 }}>{a}</p>
      </div>
    </div>
  );
}
