'use client';

import { useMouseParallaxAuth } from './hooks';

export default function AuthBackdrop() {
  const mp = useMouseParallaxAuth();
  return (
    <div className="auth-backdrop" aria-hidden="true">
      <div className="auth-grid" />
      <div
        className="auth-blob auth-blob--a"
        style={{ transform: `translate3d(${mp.x * 40}px, ${mp.y * 30}px, 0)` }}
      />
      <div
        className="auth-blob auth-blob--b"
        style={{ transform: `translate3d(${mp.x * -60}px, ${mp.y * -40}px, 0)` }}
      />
      <div
        className="auth-blob auth-blob--c"
        style={{ transform: `translate3d(${mp.x * 25}px, ${mp.y * -50}px, 0)` }}
      />
      <div className="auth-noise" />
    </div>
  );
}
