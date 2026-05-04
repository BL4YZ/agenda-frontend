'use client';

import FaqItem from './FaqItem';
import { FAQS } from './data';

export default function FAQSection() {
  return (
    <section className="vc-faq container-pad" id="faq">
      <div className="reveal" style={{ textAlign: 'center', marginBottom: 50 }}>
        <span className="eyebrow">— Dudas</span>
        <h2 className="vc-h2" style={{ marginTop: 16 }}>Lo más preguntado.</h2>
      </div>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {FAQS.map((f, i) => (
          <FaqItem key={i} idx={i} q={f.q} a={f.a} />
        ))}
      </div>
    </section>
  );
}
