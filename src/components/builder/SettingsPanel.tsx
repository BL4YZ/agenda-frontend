'use client';

import { useState } from 'react';
import type { PageDoc, PageNav, PageFooter, PageSeo, PlanKey } from '@/types/builder';
import { TEMPLATES } from '@/lib/builder/templates';
import { PLAN_RANK, PLAN_LABEL } from '@/lib/builder/blocks';
import { Collapse, Row } from './Inspector';

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`st-toggle${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
      <span className="st-toggle__track"><span className="st-toggle__knob" /></span>
      <span>{label}</span>
    </button>
  );
}

function Seg<T extends string>({ value, options, onChange }: {
  value: T | undefined; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="st-seg">
      {options.map(o => (
        <button key={o.value} type="button" className={`st-seg__b${value === o.value ? ' is-on' : ''}`}
                onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export default function SettingsPanel({ doc, plan, slug, onNav, onFooter, onSeo, onApplyTemplate }: {
  doc: PageDoc;
  plan: PlanKey;
  slug: string | null;
  onNav: (patch: Partial<PageNav>) => void;
  onFooter: (patch: Partial<PageFooter>) => void;
  onSeo: (patch: Partial<PageSeo>) => void;
  onApplyTemplate: (key: string) => void;
}) {
  const [confirming, setConfirming] = useState<string | null>(null);

  return (
    <div className="st-inspector">
      <div className="st-inspector__head">
        <h3>Ajustes de la página</h3>
        <p>Barra superior, pie de página y cómo se ve al compartirla.</p>
      </div>

      <Collapse title="Barra superior">
        <Toggle label="Mostrar barra superior" checked={doc.nav.enabled !== false} onChange={v => onNav({ enabled: v })} />
        {doc.nav.enabled !== false && (
          <>
            <Toggle label="Fija al hacer scroll" checked={doc.nav.sticky !== false} onChange={v => onNav({ sticky: v })} />
            <Row label="Estilo">
              <Seg value={doc.nav.style ?? 'glass'} options={[
                { value: 'glass', label: 'Vidrio' }, { value: 'solid', label: 'Sólida' },
                { value: 'minimal', label: 'Minimal' }, { value: 'floating', label: 'Flotante' },
              ]} onChange={v => onNav({ style: v })} />
            </Row>
            <Row label="Marca">
              <Seg value={doc.nav.logoMode ?? 'both'} options={[
                { value: 'logo', label: 'Solo logo' }, { value: 'name', label: 'Solo nombre' }, { value: 'both', label: 'Ambos' },
              ]} onChange={v => onNav({ logoMode: v })} />
            </Row>
            <Row label="Texto del botón">
              <input className="st-input" value={doc.nav.ctaLabel ?? ''} placeholder="Reservar"
                     onChange={e => onNav({ ctaLabel: e.target.value })} />
            </Row>
            <p className="st-note">
              Los enlaces del menú se arman solos con las secciones que tengan título.
            </p>
          </>
        )}
      </Collapse>

      <Collapse title="Pie de página" defaultOpen={false}>
        <Toggle label="Mostrar pie de página" checked={doc.footer.enabled !== false} onChange={v => onFooter({ enabled: v })} />
        {doc.footer.enabled !== false && (
          <>
            <Row label="Estilo">
              <Seg value={doc.footer.style ?? 'columns'} options={[
                { value: 'columns', label: 'Columnas' }, { value: 'centered', label: 'Centrado' }, { value: 'minimal', label: 'Minimal' },
              ]} onChange={v => onFooter({ style: v })} />
            </Row>
            <Row label="Texto">
              <textarea className="st-input st-input--area" rows={3} value={doc.footer.text ?? ''}
                        placeholder="Una línea sobre el negocio"
                        onChange={e => onFooter({ text: e.target.value })} />
            </Row>
            <Toggle label="Mostrar horarios"  checked={doc.footer.showHours !== false}  onChange={v => onFooter({ showHours: v })} />
            <Toggle label="Mostrar redes"     checked={doc.footer.showSocial !== false} onChange={v => onFooter({ showSocial: v })} />
            <p className="st-note">
              El enlace «Hecho con Novu» va siempre al pie y no se puede quitar,
              tampoco apagando el pie de página.
            </p>
          </>
        )}
      </Collapse>

      <Collapse title="Buscadores y redes" defaultOpen={false}>
        <Row label="Título" hint="Lo que se ve en la pestaña del navegador y en Google.">
          <input className="st-input" value={doc.seo.title ?? ''} onChange={e => onSeo({ title: e.target.value })} />
        </Row>
        <Row label="Descripción" hint="Máximo unas 160 letras.">
          <textarea className="st-input st-input--area" rows={3} value={doc.seo.description ?? ''}
                    onChange={e => onSeo({ description: e.target.value })} />
        </Row>
        <Toggle label="Pedir a Google que no la indexe" checked={doc.seo.noindex === true}
                onChange={v => onSeo({ noindex: v })} />
        {slug && <p className="st-note">Tu dirección: novu.uy/public/{slug}</p>}
      </Collapse>

      <Collapse title="Empezar de nuevo" defaultOpen={false}>
        <p className="st-note">
          Aplicar una plantilla reemplaza todas las secciones y el diseño actual.
          Podés deshacer con Ctrl+Z mientras no cierres el editor.
        </p>
        {TEMPLATES.map(t => {
          const locked = PLAN_RANK[t.plan] > PLAN_RANK[plan];
          return (
            <div key={t.key} className="st-template">
              <div>
                <strong>{t.label}{locked && <span className="st-tag">{PLAN_LABEL[t.plan]}</span>}</strong>
                <span>{t.hint}</span>
              </div>
              {confirming === t.key ? (
                <div className="st-template__confirm">
                  <button type="button" className="st-btn st-btn--sm st-btn--danger"
                          onClick={() => { onApplyTemplate(t.key); setConfirming(null); }}>
                    Reemplazar
                  </button>
                  <button type="button" className="st-btn st-btn--sm" onClick={() => setConfirming(null)}>Cancelar</button>
                </div>
              ) : (
                <button type="button" className="st-btn st-btn--sm" disabled={locked}
                        onClick={() => setConfirming(t.key)}>
                  Usar
                </button>
              )}
            </div>
          );
        })}
      </Collapse>
    </div>
  );
}
