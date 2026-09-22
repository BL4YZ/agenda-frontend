'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Check, CloudOff, ExternalLink, Layers, Loader2, Monitor,
  Palette, Redo2, Settings, Smartphone, Tablet, Undo2,
} from 'lucide-react';
import api from '@/lib/api';
import { useBuilderDoc } from '@/components/builder/useBuilderDoc';
import SectionList from '@/components/builder/SectionList';
import Inspector from '@/components/builder/Inspector';
import DesignPanel from '@/components/builder/DesignPanel';
import SettingsPanel from '@/components/builder/SettingsPanel';
import { TEMPLATES } from '@/lib/builder/templates';
import type { PageDoc } from '@/types/builder';
import '@/styles/system.css';
import '@/styles/dashboard.css';
import '@/styles/studio.css';

type Device = 'desktop' | 'tablet' | 'mobile';
type Panel  = 'section' | 'design' | 'settings';

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: '100%', tablet: '834px', mobile: '390px',
};

export default function EditorPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [slugLoaded, setSlugLoaded] = useState(false);
  const [device, setDevice] = useState<Device>('desktop');
  const [panel, setPanel] = useState<Panel>('section');
  const [notice, setNotice] = useState<string | null>(null);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const frameReady = useRef(false);

  useEffect(() => {
    api.get('/landing/slug')
      .then(r => setSlug(r.data?.slug || null))
      .catch(() => setSlug(null))
      .finally(() => setSlugLoaded(true));
  }, []);

  const b = useBuilderDoc(slugLoaded ? slug : null);
  const { doc, selectedId } = b;
  const selected = doc?.sections.find(s => s.id === selectedId) ?? null;

  // ── Preview wiring ──────────────────────────────────────────────────────────
  const pushDoc = useCallback(() => {
    if (!doc || !frameRef.current?.contentWindow) return;
    frameRef.current.contentWindow.postMessage(
      { source: 'novu-builder', doc, selectedId },
      window.location.origin,
    );
  }, [doc, selectedId]);

  useEffect(() => { if (frameReady.current) pushDoc(); }, [pushDoc]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { source?: string; ready?: boolean; selectId?: string } | undefined;
      if (d?.source !== 'novu-preview') return;
      if (d.ready) { frameReady.current = true; pushDoc(); }
      if (d.selectId) { b.select(d.selectId); setPanel('section'); }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [pushDoc, b]);

  // Selecting a section from the list moves the preview to it.
  useEffect(() => {
    if (!selectedId) return;
    const win = frameRef.current?.contentWindow;
    const el = win?.document?.querySelector(`[data-section-id="${CSS.escape(selectedId)}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedId]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const applyTemplate = (key: string) => {
    const t = TEMPLATES.find(x => x.key === key);
    if (t) b.replaceDoc(t.build());
  };

  const onPublish = async () => {
    const res = await b.publish();
    if (!res) return;
    setNotice(res.dropped > 0
      ? `Publicada. ${res.dropped} ${res.dropped === 1 ? 'sección quedó afuera' : 'secciones quedaron afuera'} porque tu plan no las incluye — siguen guardadas acá.`
      : '¡Publicada! Ya es la página que ven tus clientes.');
    setTimeout(() => setNotice(null), 7000);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (b.loading || !slugLoaded) {
    return <div className="st-loading"><Loader2 className="st-spin" size={20} /> Abriendo el editor…</div>;
  }

  if (!slug) {
    return (
      <div className="st-loading st-loading--col">
        <p>Tu negocio todavía no tiene una dirección pública.</p>
        <Link href="/dashboard/landing" className="st-btn st-btn--primary">Elegir dirección</Link>
      </div>
    );
  }

  if (b.error || !doc) {
    return (
      <div className="st-loading st-loading--col">
        <p>{b.error ?? 'No se pudo cargar la página.'}</p>
        <Link href="/dashboard/landing" className="st-btn">Volver</Link>
      </div>
    );
  }

  const saveLabel =
    b.saveState === 'saving' ? 'Guardando…'
    : b.saveState === 'error' ? 'Error al guardar'
    : b.dirty ? 'Cambios sin guardar'
    : 'Todo guardado';

  return (
    <div className="st-root" data-theme="dark">
      {/* ── Topbar ── */}
      <header className="st-top">
        <div className="st-top__l">
          <Link href="/dashboard/landing" className="st-icon-btn" title="Volver al panel"><ArrowLeft size={16} /></Link>
          <span className="st-top__title">Editor de tu página</span>
          <span className={`st-save st-save--${b.saveState}${b.dirty ? ' is-dirty' : ''}`}>
            {b.saveState === 'saving' && <Loader2 size={12} className="st-spin" />}
            {b.saveState === 'error'  && <CloudOff size={12} />}
            {b.saveState !== 'saving' && b.saveState !== 'error' && !b.dirty && <Check size={12} />}
            {saveLabel}
          </span>
        </div>

        <div className="st-top__c">
          {(['desktop', 'tablet', 'mobile'] as Device[]).map(d => (
            <button key={d} type="button" className={`st-icon-btn${device === d ? ' is-on' : ''}`}
                    onClick={() => setDevice(d)}
                    title={d === 'desktop' ? 'Escritorio' : d === 'tablet' ? 'Tablet' : 'Celular'}>
              {d === 'desktop' ? <Monitor size={15} /> : d === 'tablet' ? <Tablet size={15} /> : <Smartphone size={15} />}
            </button>
          ))}
          <span className="st-top__sep" />
          <button type="button" className="st-icon-btn" onClick={b.undo} disabled={!b.canUndo} title="Deshacer (Ctrl+Z)">
            <Undo2 size={15} />
          </button>
          <button type="button" className="st-icon-btn" onClick={b.redo} disabled={!b.canRedo} title="Rehacer (Ctrl+Shift+Z)">
            <Redo2 size={15} />
          </button>
        </div>

        <div className="st-top__r">
          {b.builderEnabled && (
            <a className="st-btn st-btn--sm" href={`/public/${slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={13} /> Ver publicada
            </a>
          )}
          <button type="button" className="st-btn st-btn--sm" onClick={() => void b.save()} disabled={b.saveState === 'saving'}>
            Guardar
          </button>
          <button type="button" className="st-btn st-btn--sm st-btn--primary" onClick={() => void onPublish()}
                  disabled={b.saveState === 'saving'}>
            {b.builderEnabled ? 'Publicar cambios' : 'Publicar'}
          </button>
        </div>
      </header>

      {(notice || b.saveError) && (
        <div className={`st-banner${b.saveError ? ' st-banner--err' : ''}`}>
          {b.saveError ?? notice}
        </div>
      )}

      {!b.builderEnabled && (
        <div className="st-banner st-banner--info">
          Estás editando un borrador. Tus clientes siguen viendo la página anterior hasta que toques <strong>Publicar</strong>.
        </div>
      )}

      {/* ── Body ── */}
      <div className="st-body">
        <aside className="st-left">
          <SectionList
            doc={doc}
            plan={b.plan}
            selectedId={selectedId}
            onSelect={id => { b.select(id); setPanel('section'); }}
            onAdd={t => { b.addSection(t); setPanel('section'); }}
            onRemove={b.removeSection}
            onDuplicate={b.duplicateSection}
            onMove={b.moveSection}
            onToggleHidden={b.toggleHidden}
          />
        </aside>

        <main className="st-canvas">
          <div className="st-frame-wrap" data-device={device}>
            <iframe
              ref={frameRef}
              className="st-frame"
              style={{ width: DEVICE_WIDTH[device] }}
              src={`/editor/preview?slug=${encodeURIComponent(slug)}`}
              title="Vista previa de tu página"
            />
          </div>
        </main>

        <aside className="st-right">
          <div className="st-tabs">
            <button type="button" className={`st-tab${panel === 'section' ? ' is-on' : ''}`} onClick={() => setPanel('section')}>
              <Layers size={13} /> Sección
            </button>
            <button type="button" className={`st-tab${panel === 'design' ? ' is-on' : ''}`} onClick={() => setPanel('design')}>
              <Palette size={13} /> Diseño
            </button>
            <button type="button" className={`st-tab${panel === 'settings' ? ' is-on' : ''}`} onClick={() => setPanel('settings')}>
              <Settings size={13} /> Ajustes
            </button>
          </div>

          <div className="st-right__body">
            {panel === 'section' && (selected
              ? <Inspector section={selected} onPatch={patch => b.patchSection(selected.id, patch)} />
              : <p className="st-note st-note--pad">Elegí una sección en la lista de la izquierda, o hacé clic sobre ella en la vista previa.</p>
            )}
            {panel === 'design' && (
              <DesignPanel doc={doc} plan={b.plan} onChange={patch => b.update(d => ({ ...d, design: { ...d.design, ...patch } }))} />
            )}
            {panel === 'settings' && (
              <SettingsPanel
                doc={doc} plan={b.plan} slug={slug}
                onNav={patch    => b.update(d => ({ ...d, nav:    { ...d.nav, ...patch } }))}
                onFooter={patch => b.update(d => ({ ...d, footer: { ...d.footer, ...patch } }))}
                onSeo={patch    => b.update(d => ({ ...d, seo:    { ...d.seo, ...patch } }))}
                onApplyTemplate={applyTemplate}
              />
            )}
          </div>

          {b.builderEnabled && (
            <div className="st-right__foot">
              <button type="button" className="st-btn st-btn--sm" onClick={() => void b.unpublish()}>
                Volver a la página anterior
              </button>
              <span className="st-field__hint">Despublica el editor sin borrar nada de lo que armaste.</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export type { PageDoc };
