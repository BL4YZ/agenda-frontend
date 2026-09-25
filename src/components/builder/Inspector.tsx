'use client';

import { useState } from 'react';
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import type { PageSection, BlockItem, BlockProps, SectionStyle, CtaAction } from '@/types/builder';
import { BLOCK_DEFS, type Control } from '@/lib/builder/blocks';
import { newId } from '@/lib/builder/templates';

// ── Field primitives ──────────────────────────────────────────────────────────
/**
 * One labelled field.
 *
 * The hint sits OUTSIDE the <label> on purpose: inside, it becomes part of
 * the control's accessible name, so a screen reader announces the field as
 * "Titulo Lo que se ve en la pestana del navegador y en Google". The label
 * still wraps the control, so the association needs no id plumbing.
 */
export function Row({ label, children, hint }: { label?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="st-field">
      <label className="st-field__row">
        {label && <span className="st-field__label">{label}</span>}
        {children}
      </label>
      {hint && <span className="st-field__hint">{hint}</span>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`st-toggle${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
      <span className="st-toggle__track"><span className="st-toggle__knob" /></span>
      <span>{label}</span>
    </button>
  );
}

function Segmented<T extends string>({ value, options, onChange }: {
  value: T | undefined; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="st-seg">
      {options.map(o => (
        <button key={o.value} type="button"
                className={`st-seg__b${value === o.value ? ' is-on' : ''}`}
                onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Collapse({ title, children, defaultOpen = true, aside }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; aside?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="st-collapse">
      <button type="button" className="st-collapse__h" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <ChevronDown size={14} className={open ? 'is-open' : ''} />
        <span>{title}</span>
        {aside}
      </button>
      {open && <div className="st-collapse__b">{children}</div>}
    </section>
  );
}

const CTA_ACTIONS: { value: CtaAction; label: string }[] = [
  { value: 'reserve',  label: 'Abrir reserva' },
  { value: 'link',     label: 'Ir a un enlace' },
  { value: 'scroll',   label: 'Bajar a una sección' },
  { value: 'whatsapp', label: 'Abrir WhatsApp' },
  { value: 'phone',    label: 'Llamar' },
  { value: 'none',     label: 'Sin botón' },
];

// ── Generic control renderer ──────────────────────────────────────────────────
type Bag = Record<string, unknown>;

function ControlField({ ctrl, bag, set }: { ctrl: Control; bag: Bag; set: (key: string, value: unknown) => void }) {
  switch (ctrl.k) {
    case 'note':
      return <p className="st-note">{ctrl.text}</p>;

    case 'text':
      return (
        <Row label={ctrl.label} hint={ctrl.hint}>
          <input className="st-input" value={(bag[ctrl.key] as string) ?? ''}
                 placeholder={ctrl.placeholder}
                 onChange={e => set(ctrl.key, e.target.value)} />
        </Row>
      );

    case 'textarea':
      return (
        <Row label={ctrl.label} hint={ctrl.hint}>
          <textarea className="st-input st-input--area" rows={ctrl.rows ?? 4}
                    value={(bag[ctrl.key] as string) ?? ''}
                    placeholder={ctrl.placeholder}
                    onChange={e => set(ctrl.key, e.target.value)} />
        </Row>
      );

    case 'number': {
      const v = (bag[ctrl.key] as number | undefined) ?? ctrl.min;
      return (
        <Row label={ctrl.label}>
          <div className="st-range">
            <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step ?? 1} value={v}
                   onChange={e => set(ctrl.key, Number(e.target.value))} />
            <span className="st-range__v">{v}{ctrl.suffix ? ` ${ctrl.suffix}` : ''}</span>
          </div>
        </Row>
      );
    }

    case 'toggle':
      return <Toggle label={ctrl.label} checked={bag[ctrl.key] !== false} onChange={v => set(ctrl.key, v)} />;

    case 'select':
      return (
        <Row label={ctrl.label}>
          <select className="st-input st-select" value={(bag[ctrl.key] as string) ?? ''}
                  onChange={e => set(ctrl.key, e.target.value)}>
            {ctrl.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Row>
      );

    case 'image':
      return (
        <div className="st-field">
          <ImageUpload label={ctrl.label} value={(bag[ctrl.key] as string) ?? ''}
                       onChange={url => set(ctrl.key, url)} previewHeight={110} />
        </div>
      );

    case 'color':
      return (
        <Row label={ctrl.label}>
          <ColorField name={ctrl.label} value={(bag[ctrl.key] as string) ?? ''} onChange={v => set(ctrl.key, v)} />
        </Row>
      );

    case 'cta': {
      const action = (bag[ctrl.actionKey] as CtaAction) ?? 'reserve';
      return (
        <div className="st-group">
          <span className="st-group__t">{ctrl.label}</span>
          <Row>
            <select className="st-input st-select" value={action}
                    onChange={e => set(ctrl.actionKey, e.target.value)}>
              {CTA_ACTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Row>
          {action !== 'none' && (
            <Row>
              <input className="st-input" placeholder="Texto del botón"
                     value={(bag[ctrl.labelKey] as string) ?? ''}
                     onChange={e => set(ctrl.labelKey, e.target.value)} />
            </Row>
          )}
          {(action === 'link' || action === 'scroll') && (
            <Row hint={action === 'scroll' ? 'Usá #id-de-la-seccion' : 'Empezá con https://'}>
              <input className="st-input" placeholder={action === 'scroll' ? '#servicios' : 'https://…'}
                     value={(bag[ctrl.hrefKey] as string) ?? ''}
                     onChange={e => set(ctrl.hrefKey, e.target.value)} />
            </Row>
          )}
        </div>
      );
    }

    case 'items':
      return (
        <ItemsField
          label={ctrl.label} addLabel={ctrl.addLabel} titleKey={ctrl.titleKey} fields={ctrl.fields}
          items={(bag[ctrl.key] as BlockItem[]) ?? []}
          onChange={next => set(ctrl.key, next)}
        />
      );

    default:
      return null;
  }
}

/**
 * Colour input paired with a text field so a token like `oklch(...)` is typable.
 *
 * The two inputs need distinct accessible names: they sit inside one <label>,
 * so without them a screen reader (and any by-label lookup) announces two
 * controls with the same name and no way to tell the swatch from the value.
 */
export function ColorField({ value, onChange, name }: {
  value: string; onChange: (v: string) => void; name?: string;
}) {
  const isHex = /^#[0-9a-f]{6}$/i.test(value);
  const low = name?.toLowerCase();
  return (
    <div className="st-color" data-testid={name ? `color-${low}` : undefined}>
      <input type="color" value={isHex ? value : '#888888'} onChange={e => onChange(e.target.value)}
             aria-label={low ? `Elegir ${low}` : 'Elegir color'} />
      <input className="st-input" value={value} placeholder="#8b5cf6" onChange={e => onChange(e.target.value)}
             aria-label={name ? `${name} en hexadecimal` : undefined} />
      {value && <button type="button" className="st-icon-btn" onClick={() => onChange('')} title="Quitar">×</button>}
    </div>
  );
}

// ── Repeatable items ──────────────────────────────────────────────────────────
function ItemsField({ label, addLabel, titleKey, fields, items, onChange }: {
  label: string; addLabel: string; titleKey: string; fields: Control[];
  items: BlockItem[]; onChange: (next: BlockItem[]) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const patch = (i: number, key: string, value: unknown) =>
    onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div className="st-items">
      <div className="st-items__h">
        <span className="st-field__label">{label}</span>
        <span className="st-items__count">{items.length}</span>
      </div>

      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <div
            key={it.id ?? i}
            className={`st-item${open ? ' is-open' : ''}${dragIdx === i ? ' is-drag' : ''}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragEnd={() => setDragIdx(null)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null) move(dragIdx, i); setDragIdx(null); }}
          >
            <div className="st-item__h">
              <GripVertical size={13} className="st-item__grip" />
              <button type="button" className="st-item__title" onClick={() => setOpenIdx(open ? null : i)}>
                {(it[titleKey as keyof BlockItem] as string) || `Sin título ${i + 1}`}
              </button>
              <button type="button" className="st-icon-btn" title="Eliminar"
                      onClick={() => { onChange(items.filter((_, j) => j !== i)); setOpenIdx(null); }}>
                <Trash2 size={13} />
              </button>
            </div>
            {open && (
              <div className="st-item__b">
                {fields.map((f, k) => (
                  <ControlField key={k} ctrl={f} bag={it as Bag} set={(key, v) => patch(i, key, v)} />
                ))}
                {/* Pricing plans carry a bullet list; every other item type ignores it. */}
                {'features' in it || fields.some(f => 'key' in f && f.key === 'price') ? (
                  <Row label="Incluye (uno por línea)">
                    <textarea
                      className="st-input st-input--area" rows={4}
                      value={(it.features ?? []).join('\n')}
                      onChange={e => patch(i, 'features', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                    />
                  </Row>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" className="st-add" onClick={() => {
        onChange([...items, { id: newId() }]);
        setOpenIdx(items.length);
      }}>
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

// ── Section style panel ───────────────────────────────────────────────────────
const PADS = [
  { value: 'none', label: '0' }, { value: 'xs', label: 'XS' }, { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },   { value: 'lg', label: 'L' },  { value: 'xl', label: 'XL' },
] as const;

function StylePanel({ style, onChange }: { style: SectionStyle; onChange: (patch: Partial<SectionStyle>) => void }) {
  return (
    <>
      <Row label="Espacio arriba">
        <Segmented value={style.padTop ?? 'md'} options={PADS as unknown as { value: string; label: string }[]}
                   onChange={v => onChange({ padTop: v as SectionStyle['padTop'] })} />
      </Row>
      <Row label="Espacio abajo">
        <Segmented value={style.padBottom ?? 'md'} options={PADS as unknown as { value: string; label: string }[]}
                   onChange={v => onChange({ padBottom: v as SectionStyle['padBottom'] })} />
      </Row>
      <Row label="Alineación">
        <Segmented value={style.align ?? 'left'} options={[
          { value: 'left', label: 'Izquierda' }, { value: 'center', label: 'Centro' }, { value: 'right', label: 'Derecha' },
        ]} onChange={v => onChange({ align: v as SectionStyle['align'] })} />
      </Row>
      <Row label="Ancho del contenido">
        <Segmented value={style.width ?? 'normal'} options={[
          { value: 'narrow', label: 'Angosto' }, { value: 'normal', label: 'Normal' },
          { value: 'wide', label: 'Ancho' },     { value: 'full', label: 'Total' },
        ]} onChange={v => onChange({ width: v as SectionStyle['width'] })} />
      </Row>
      <Row label="Fondo">
        <select className="st-input st-select" value={style.bgKind ?? 'none'}
                onChange={e => onChange({ bgKind: e.target.value as SectionStyle['bgKind'] })}>
          <option value="none">Igual que la página</option>
          <option value="surface">Tono alterno</option>
          <option value="accent">Color de acento</option>
          <option value="contrast">Invertido</option>
          <option value="gradient">Degradado</option>
          <option value="image">Imagen</option>
        </select>
      </Row>
      {style.bgKind === 'image' && (
        <>
          <div className="st-field">
            <ImageUpload label="Imagen de fondo" value={style.bgImage ?? ''}
                         onChange={url => onChange({ bgImage: url })} previewHeight={90} />
          </div>
          <Row label="Oscurecer">
            <div className="st-range">
              <input type="range" min={0} max={1} step={0.05} value={style.bgOverlay ?? 0.5}
                     onChange={e => onChange({ bgOverlay: Number(e.target.value) })} />
              <span className="st-range__v">{Math.round((style.bgOverlay ?? 0.5) * 100)}%</span>
            </div>
          </Row>
        </>
      )}
      <Row label="Color de fondo propio">
        <ColorField name="Color de fondo" value={style.bgColor ?? ''} onChange={v => onChange({ bgColor: v })} />
      </Row>
      <Row label="Borde inferior">
        <Segmented value={style.divider ?? 'none'} options={[
          { value: 'none', label: 'Nada' }, { value: 'line', label: 'Línea' },
          { value: 'fade', label: 'Degradado' }, { value: 'slant', label: 'Diagonal' }, { value: 'wave', label: 'Curva' },
        ]} onChange={v => onChange({ divider: v as SectionStyle['divider'] })} />
      </Row>
      {/* Siete opciones no entran en un segmentado de 299px de ancho. */}
      <Row label="Animación al aparecer" hint="Se ejecuta al llegar a la sección bajando. En la vista previa no se muestra.">
        <select className="st-input st-select" value={style.animate ?? 'none'}
                onChange={e => onChange({ animate: e.target.value as SectionStyle['animate'] })}>
          <option value="none">Nada</option>
          <option value="fade">Fundido</option>
          <option value="up">Subir</option>
          <option value="left">Entrar desde la izquierda</option>
          <option value="right">Entrar desde la derecha</option>
          <option value="zoom">Acercar</option>
          <option value="blur">Desenfoque</option>
        </select>
      </Row>
    </>
  );
}

// ── Inspector ─────────────────────────────────────────────────────────────────
export default function Inspector({ section, onPatch }: {
  section: PageSection;
  onPatch: (patch: Partial<PageSection>) => void;
}) {
  const def = BLOCK_DEFS[section.type];
  if (!def) return null;

  const setProp = (key: string, value: unknown) =>
    onPatch({ props: { ...section.props, [key]: value } as BlockProps });

  return (
    <div className="st-inspector">
      <div className="st-inspector__head">
        <h3>{def.label}</h3>
        <p>{def.hint}</p>
      </div>

      <Collapse title="Contenido">
        {def.controls.map((c, i) => (
          <ControlField key={i} ctrl={c} bag={section.props as unknown as Bag} set={setProp} />
        ))}
      </Collapse>

      <Collapse title="Diseño de la sección" defaultOpen={false}>
        <StylePanel style={section.style} onChange={patch => onPatch({ style: { ...section.style, ...patch } })} />
      </Collapse>

      <Collapse title="Avanzado" defaultOpen={false}>
        <Row label="Nombre interno" hint="Solo lo ves vos, en la lista de secciones.">
          <input className="st-input" value={section.name ?? ''}
                 placeholder={def.label}
                 onChange={e => onPatch({ name: e.target.value })} />
        </Row>
        <Row label="Ancla" hint="Para enlazar a esta sección: #mi-ancla">
          <input className="st-input" value={section.anchor ?? ''}
                 placeholder={section.id}
                 onChange={e => onPatch({ anchor: e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase() })} />
        </Row>
      </Collapse>
    </div>
  );
}
