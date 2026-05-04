'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

/** Tracks window scroll Y position using rAF throttling */
export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

/** Activates .reveal elements when they enter the viewport */
export function useReveal(containerRef?: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = containerRef?.current ?? null;
    const els = (root ?? document).querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [containerRef]);
}

/** Animates a number from 0 → target when triggerRef enters viewport */
export function useCounter(
  target: number,
  triggerRef: RefObject<HTMLElement | null>,
  duration = 1800
): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = triggerRef?.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - k, 3);
            setVal(target * eased);
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, triggerRef, duration]);
  return val;
}

/** 3D tilt effect on mouse movement */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 8): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`;
    };
    const reset = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', reset);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', reset);
    };
  }, [ref, max]);
}

/** Scroll-linked progress (0–1) for a target element relative to a scroll container */
export function useScrollProgress(
  scrollRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>
): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    const sc = scrollRef.current;
    const tg = targetRef.current;
    if (!sc || !tg) return;
    let raf = 0;
    const update = () => {
      const scRect = sc.getBoundingClientRect();
      const tgRect = tg.getBoundingClientRect();
      const start = tgRect.top - scRect.top - scRect.height;
      const end = tgRect.top - scRect.top + tgRect.height;
      const t = -start / (end - start || 1);
      setP(Math.max(0, Math.min(1, t)));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    sc.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => sc.removeEventListener('scroll', onScroll);
  }, [scrollRef, targetRef]);
  return p;
}

/** Unused ref placeholder — avoids null-check boilerplate in callers */
export function useNullRef<T extends HTMLElement>(): RefObject<T | null> {
  return useRef<T>(null);
}
