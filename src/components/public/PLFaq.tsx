'use client';

import { useState } from 'react';
import type { Faq } from '@/types/public';

interface Props {
  faqs: Faq[];
}

export default function PLFaq({ faqs }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section className="pl-section" aria-label="Preguntas frecuentes">
      <div className="pl-container" style={{ maxWidth: 760 }}>
        <div className="pl-section__head" style={{ textAlign: 'center', alignItems: 'center' }}>
          <span className="pl-eyebrow">PREGUNTAS FRECUENTES</span>
          <h2 className="pl-h2">¿Tenés <em>dudas</em>?</h2>
        </div>
        <div className="pl-faq" role="list">
          {faqs.map(f => {
            const isOpen = openId === f.id;
            const answerId = `faq-answer-${f.id}`;
            return (
              <div
                key={f.id}
                className="pl-faq__item"
                role="listitem"
                aria-expanded={isOpen}
              >
                <button
                  className="pl-faq__q"
                  role="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', width: '100%', textAlign: 'left',
                    color: 'var(--pl-fg)', padding: 0,
                  }}
                >
                  {f.question}
                </button>
                <div
                  id={answerId}
                  className="pl-faq__a"
                  role="region"
                  aria-labelledby={`faq-q-${f.id}`}
                  hidden={!isOpen}
                >
                  {f.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
