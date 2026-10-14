'use client';

/* Widget de Cloudflare Turnstile (anti-bot).
   El backend valida el token en register, login, forgot-password y reservas
   (middleware/turnstileMiddleware.js), comparando también el `action`.

   Los tokens son de un solo uso: después de cada envío fallido hay que llamar
   a `reset()` del ref para obtener uno nuevo.

   Sin NEXT_PUBLIC_TURNSTILE_SITE_KEY el widget no se renderiza y
   TURNSTILE_ENABLED es false, así los formularios no esperan un token. */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const TURNSTILE_ENABLED = SITE_KEY.length > 0;

export type TurnstileAction = 'register' | 'login' | 'forgot_password' | 'booking';

export interface TurnstileHandle {
  reset: () => void;
}

interface Props {
  action: TurnstileAction;
  onToken: (token: string | null) => void;
  theme?: 'auto' | 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
}

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { scriptPromise = null; reject(new Error('Turnstile no cargó')); };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile(
  { action, onToken, theme = 'auto', className, style },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Ref para no re-renderizar el widget cada vez que cambia la identidad del callback.
  const onTokenRef = useRef(onToken);
  useEffect(() => { onTokenRef.current = onToken; }, [onToken]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }), []);

  useEffect(() => {
    if (!TURNSTILE_ENABLED) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          action,
          theme,
          size: 'flexible',
          language: 'es',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(err => console.error('[Turnstile]', err));

    return () => {
      cancelled = true;
      onTokenRef.current(null);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [action, theme]);

  if (!TURNSTILE_ENABLED) return null;
  return <div ref={containerRef} className={className} style={{ minHeight: 65, ...style }} />;
});

export default Turnstile;
