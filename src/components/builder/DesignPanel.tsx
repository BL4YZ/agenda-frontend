'use client';

import { Lock } from 'lucide-react';
import type { PageDoc, PageDesign, DesignPreset, FontKey, PlanKey } from '@/types/builder';
import { PALETTES, FONTS, resolvePalette } from '@/lib/builder/design';
import { PLAN_RANK } from '@/lib/builder/blocks';
import { Collapse, ColorField } from './Inspector';

function Row({ label, children, hint }: { label?: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="st-field">
      {label && <span className="st-field__label">{label}</span>}
      {children}
      {hint && <span className="st-field__hint">{hint}</span>}
    </label>
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

const FONT_GROUPS = Object.entries(FONTS).reduce<Record<string, [FontKey, typeof FONTS[FontKey]][]>>((acc, [k, v]) => {
  (acc[v.group] ??= []).push([k as FontKey, v]);
  return acc;
}, {});

function FontSelect({ value, onChange }: { value: FontKey; onChange: (v: FontKey) => void }) {
  return (
    <select className="st-input st-select" value={value}
            style={{ fontFamily: FONTS[value]?.stack }}
            onChange={e => onChange(e.target.value as FontKey)}>
      {Object.entries(FONT_GROUPS).map(([group, fonts]) => (
        <optgroup key={group} label={group}>
          {fonts.map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

export default function DesignPanel({ doc, plan, onChange }: {
  doc: PageDoc;
  plan: PlanKey;
  onChange: (patch: Partial<PageDesign>) => void;
}) {
  const d = doc.design;
  const live = resolvePalette(d);
  // Hand-picked colours are the "marca propia" entitlement. The server strips
  // them from the published copy below Negocio, so locking the controls here
  // keeps the editor from promising something the live page won't show.
  const canCustomColors = PLAN_RANK[plan] >= PLAN_RANK.negocio;

  const setColor = (key: keyof NonNullable<PageDesign['colors']>, v: string) =>
    onChange({ colors: { ...(d.colors ?? {}), [key]: v || undefined }, preset: v ? 'custom' : d.preset });

  return (
    <div className="st-inspector">
      <div className="st-inspector__head">
        <h3>Diseño de la página</h3>
        <p>Los cambios acá repintan todas las secciones a la vez.</p>
      </div>

      <Collapse title="Paleta">
        <div className="st-palettes">
          {(Object.keys(PALETTES) as Exclude<DesignPreset, 'custom'>[]).map(key => {
            const p = PALETTES[key];
            const active = d.preset === key;
            return (
              <button
                key={key} type="button"
                className={`st-palette${active ? ' is-on' : ''}`}
                // Dropping the overrides is the point: picking a preset should
                // actually look like the preset, not like the last custom mix.
                onClick={() => onChange({ preset: key, mode: p.mode, colors: {} })}
                title={p.label}
              >
                <span className="st-palette__chips" style={{ background: p.bg }}>
                  <i style={{ background: p.accent }} />
                  <i style={{ background: p.fg }} />
                  <i style={{ background: p.bg2 }} />
                </span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </Collapse>

      <Collapse title="Colores propios" defaultOpen={false}
                aside={!canCustomColors ? <span className="st-tag"><Lock size={9} /> Negocio</span> : undefined}>
        {canCustomColors ? (
          <p className="st-note">Cualquier color que cambies acá pisa la paleta elegida.</p>
        ) : (
          <p className="st-note">
            Elegir colores a mano es parte del plan Negocio. Podés seguir usando cualquiera
            de las paletas de arriba: esas están incluidas en todos los planes.
          </p>
        )}
        <fieldset className="st-lockable" disabled={!canCustomColors}>
        <Row label="Fondo">        <ColorField value={d.colors?.bg       ?? ''} onChange={v => setColor('bg', v)} /></Row>
        <Row label="Fondo alterno"><ColorField value={d.colors?.bg2      ?? ''} onChange={v => setColor('bg2', v)} /></Row>
        <Row label="Texto">        <ColorField value={d.colors?.fg       ?? ''} onChange={v => setColor('fg', v)} /></Row>
        <Row label="Texto suave">  <ColorField value={d.colors?.fgSoft   ?? ''} onChange={v => setColor('fgSoft', v)} /></Row>
        <Row label="Acento">       <ColorField value={d.colors?.accent   ?? ''} onChange={v => setColor('accent', v)} /></Row>
        <Row label="Sobre acento" hint="El color del texto arriba del acento.">
          <ColorField value={d.colors?.accentFg ?? ''} onChange={v => setColor('accentFg', v)} />
        </Row>
        <Row label="Líneas">       <ColorField value={d.colors?.line     ?? ''} onChange={v => setColor('line', v)} /></Row>
        <Row label="Claro u oscuro" hint="Define cómo se calculan las superficies y sombras.">
          <Seg value={d.mode} options={[{ value: 'dark', label: 'Oscuro' }, { value: 'light', label: 'Claro' }]}
               onChange={v => onChange({ mode: v })} />
        </Row>
        </fieldset>
        <div className="st-preview-strip" style={{ background: live.bg, color: live.fg, borderColor: live.line }}>
          <span style={{ color: live.fgSoft }}>Texto secundario</span>
          <span className="st-preview-strip__btn" style={{ background: live.accent, color: live.accentFg }}>Botón</span>
        </div>
      </Collapse>

      <Collapse title="Tipografía">
        <Row label="Títulos"><FontSelect value={d.fontDisplay} onChange={v => onChange({ fontDisplay: v })} /></Row>
        <Row label="Textos"> <FontSelect value={d.fontBody}    onChange={v => onChange({ fontBody: v })} /></Row>
        <div className="st-type-preview" style={{ fontFamily: FONTS[d.fontDisplay]?.stack }}>
          Aa
          <small style={{ fontFamily: FONTS[d.fontBody]?.stack }}>El zorro marrón salta sobre el perro.</small>
        </div>
        <Row label="Tamaño general">
          <div className="st-range">
            <input type="range" min={0.85} max={1.25} step={0.05} value={d.scale ?? 1}
                   onChange={e => onChange({ scale: Number(e.target.value) })} />
            <span className="st-range__v">{Math.round((d.scale ?? 1) * 100)}%</span>
          </div>
        </Row>
      </Collapse>

      <Collapse title="Formas y espacio">
        <Row label="Redondeo general">
          <Seg value={d.radius} options={[
            { value: 'none', label: '0' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' },
            { value: 'lg', label: 'L' },   { value: 'xl', label: 'XL' },
          ]} onChange={v => onChange({ radius: v })} />
        </Row>
        <Row label="Botones">
          <Seg value={d.buttonStyle} options={[
            { value: 'solid', label: 'Sólido' }, { value: 'outline', label: 'Contorno' },
            { value: 'soft', label: 'Suave' },   { value: 'underline', label: 'Subrayado' },
          ]} onChange={v => onChange({ buttonStyle: v })} />
        </Row>
        <Row label="Redondeo de botones">
          <Seg value={d.buttonRadius} options={[
            { value: 'none', label: 'Recto' }, { value: 'sm', label: 'S' },
            { value: 'md', label: 'M' },       { value: 'full', label: 'Pastilla' },
          ]} onChange={v => onChange({ buttonRadius: v })} />
        </Row>
        <Row label="Aire entre secciones">
          <Seg value={d.density} options={[
            { value: 'compact', label: 'Compacto' }, { value: 'normal', label: 'Normal' }, { value: 'roomy', label: 'Amplio' },
          ]} onChange={v => onChange({ density: v })} />
        </Row>
        <Row label="Ancho de la página">
          <Seg value={d.width} options={[
            { value: 'narrow', label: 'Angosto' }, { value: 'normal', label: 'Normal' },
            { value: 'wide', label: 'Ancho' },     { value: 'full', label: 'Total' },
          ]} onChange={v => onChange({ width: v })} />
        </Row>
        <Row label="Textura de fondo">
          <Seg value={d.texture} options={[
            { value: 'none', label: 'Nada' },   { value: 'grid', label: 'Grilla' },
            { value: 'dots', label: 'Puntos' }, { value: 'noise', label: 'Grano' },
            { value: 'gradient', label: 'Halo' },
          ]} onChange={v => onChange({ texture: v })} />
        </Row>
      </Collapse>
    </div>
  );
}
