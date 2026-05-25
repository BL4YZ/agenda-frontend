'use client';

import { useRef, useState, useEffect, RefObject } from 'react';
import { useScrollY, useReveal } from './hooks';
import NavBar from './NavBar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import StepsSection from './StepsSection';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import FooterSection from './FooterSection';
import VariantCStyles from './VariantCStyles';

export default function VariantC() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [mp, setMp] = useState({ x: 0, y: 0 });

  const y = useScrollY();
  useReveal();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      setMp({
        x: (e.clientX - r.left) / r.width - 0.5,
        y: (e.clientY - r.top) / r.height - 0.5,
      });
    };
    root.addEventListener('mousemove', onMove);
    return () => root.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={rootRef} className="ma-root vc-root" data-theme="dark" style={{ width: '100%', position: 'relative' }}>
      {/* Skip link */}
      <a href="#main-content" className="vc-skip-link">Saltar al contenido principal</a>

      {/* Liquid background */}
      <div className="vc-bg" />
      <div className="vc-blobs">
        <div
          className="vc-blob vc-blob-1"
          style={{ transform: `translate3d(${mp.x * 80 - y * 0.1}px, ${mp.y * 60 - y * 0.5}px, 0) rotate(${y * 0.05}deg)` }}
        />
        <div
          className="vc-blob vc-blob-2"
          style={{ transform: `translate3d(${-mp.x * 100 + y * 0.05}px, ${mp.y * 80 - y * 0.3}px, 0) rotate(${-y * 0.04}deg)` }}
        />
        <div
          className="vc-blob vc-blob-3"
          style={{ transform: `translate3d(${mp.x * 60}px, ${-y * 0.2}px, 0)` }}
        />
      </div>
      <div className="noise" />

      <div className="scroll-stage vc-stage">
        <NavBar rootRef={rootRef} />

        <main id="main-content">
          <HeroSection heroRef={heroRef} mp={mp} />

          {/* Words marquee — decorativo, oculto para lectores de pantalla */}
          <section className="vc-words" aria-hidden="true">
            <div className="vc-words-track">
              <div className="vc-words-row">
                {Array(2).fill(['reservas', 'pagos', 'recordatorios', 'agenda', 'clientes', 'reportes']).flat().map((w, i) => (
                  <span key={i} className="vc-word">
                    {w}
                    <span className="vc-word-star">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <FeaturesSection />
          <StepsSection />
          <PricingSection />
          <FAQSection />
          <CTASection />
        </main>

        <FooterSection />
      </div>

      <VariantCStyles />
    </div>
  );
}
