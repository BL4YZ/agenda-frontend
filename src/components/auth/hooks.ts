'use client';

import { useState, useEffect } from 'react';

export function useMouseParallaxAuth() {
  const [m, setM] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setM({ x, y });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return m;
}

export function useTimeAuth(intervalMs = 50) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(v => v + intervalMs), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}
