'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GlassInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  action?: string;
  actionHref?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  name?: string;
  id: string;
  error?: string;
  autoComplete?: string;
}

export default function GlassInput({
  label,
  type = 'text',
  placeholder,
  hint,
  action,
  actionHref,
  value,
  onChange,
  autoFocus,
  name,
  id,
  error,
  autoComplete,
}: GlassInputProps) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const realType = isPwd ? (show ? 'text' : 'password') : type;
  const autoCompleteResolved =
    autoComplete ?? (isPwd ? 'current-password' : type === 'email' ? 'email' : 'off');

  return (
    <label className="gi" htmlFor={id}>
      <div className="gi__top">
        <span className="gi__label">{label}</span>
        {action && actionHref && (
          <Link className="gi__action" href={actionHref}>
            {action}
          </Link>
        )}
        {action && !actionHref && (
          <span className="gi__action">{action}</span>
        )}
      </div>

      <div className={`gi__field${error ? ' gi__field--error' : ''}`}>
        <input
          id={id}
          className="gi__input"
          type={realType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
          autoComplete={autoCompleteResolved}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          aria-invalid={error ? 'true' : undefined}
        />
        {isPwd && (
          <button
            type="button"
            className="gi__eye"
            onClick={() => setShow(v => !v)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {show ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 3l18 18" />
                <path d="M10.5 6.3A9.8 9.8 0 0112 6c5 0 9 4 10 6-0.6 1.2-2 3-4.1 4.5" />
                <path d="M6.1 6.7C3.7 8.1 2.5 10 2 12c1 2 5 6 10 6 1.3 0 2.5-.3 3.6-.7" />
                <path d="M9.9 9.9a3 3 0 004.2 4.2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <div id={`${id}-error`} className="gi__error" role="alert" aria-live="polite">
          {error}
        </div>
      )}
      {hint && !error && (
        <div id={`${id}-hint`} className="gi__hint">
          {hint}
        </div>
      )}
    </label>
  );
}
