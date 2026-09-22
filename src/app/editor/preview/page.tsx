'use client';

/**
 * Preview frame for the page builder.
 *
 * Rendered inside an iframe so real CSS breakpoints react to the device width
 * the owner picked, instead of a transform-scaled fake. The document arrives
 * from the parent over postMessage on every keystroke; nothing is fetched from
 * the draft API here.
 */

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { PageDoc } from '@/types/builder';
import type { Shop } from '@/types/public';
import PageRenderer from '@/components/public/PageRenderer';

export interface PreviewMessage {
  source: 'novu-builder';
  doc: PageDoc;
  selectedId: string | null;
}

function Preview() {
  const params = useSearchParams();
  const slug = params.get('slug');
  const [shop, setShop] = useState<Shop | null>(null);
  const [doc, setDoc] = useState<PageDoc | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/landing`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled) setShop(d); })
      .catch(() => { if (!cancelled) setShop(null); });
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Same-origin only. The frame is sandboxed to this app by frame-ancestors,
      // but an origin check costs nothing and keeps the contract explicit.
      if (e.origin !== window.location.origin) return;
      const data = e.data as PreviewMessage | undefined;
      if (data?.source !== 'novu-builder') return;
      setDoc(data.doc);
      setSelectedId(data.selectedId);
    };
    window.addEventListener('message', onMessage);
    // Tell the parent we are ready for the first document.
    window.parent?.postMessage({ source: 'novu-preview', ready: true }, window.location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Clicking a section selects it in the editor's list.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest('[data-section-id]');
      const id = el?.getAttribute('data-section-id');
      if (id) window.parent?.postMessage({ source: 'novu-preview', selectId: id }, window.location.origin);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Outline the section being edited.
  useEffect(() => {
    document.querySelectorAll('[data-section-id]').forEach(el => {
      el.classList.toggle('pb-selected', el.getAttribute('data-section-id') === selectedId);
    });
  }, [selectedId, doc]);

  const noop = useCallback(() => {}, []);

  if (!slug) return <p style={{ padding: 24, fontFamily: 'system-ui' }}>Falta el identificador del negocio.</p>;
  if (!shop || !doc) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', fontFamily: 'system-ui', color: '#888' }}>
        Cargando vista previa…
      </div>
    );
  }

  return (
    <>
      <PageRenderer doc={doc} shop={shop} onReserve={noop} editing />
      <style>{`
        html, body { margin: 0; }
        [data-section-id] { cursor: default; }
        [data-section-id]:hover { outline: 1px dashed color-mix(in oklab, var(--pb-accent) 60%, transparent); outline-offset: -1px; }
        .pb-selected { outline: 2px solid var(--pb-accent) !important; outline-offset: -2px; }
      `}</style>
    </>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <Preview />
    </Suspense>
  );
}
