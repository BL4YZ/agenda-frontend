'use client';

import { useMemo, useState } from 'react';
import {
  Copy, Eye, EyeOff, GripVertical, Lock, Plus, Search, Trash2, X,
} from 'lucide-react';
import type { PageDoc, PageSection, BlockType, PlanKey } from '@/types/builder';
import {
  BLOCK_LIST, BLOCK_DEFS, CATEGORY_LABELS, PLAN_LABEL, blockAllowed, type BlockDef,
} from '@/lib/builder/blocks';

// ── Add-block drawer ──────────────────────────────────────────────────────────
function AddDrawer({ doc, plan, onAdd, onClose }: {
  doc: PageDoc; plan: PlanKey; onAdd: (t: BlockType) => void; onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const used = useMemo(() => new Set(doc.sections.map(s => s.type)), [doc.sections]);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (b: BlockDef) =>
      !needle || b.label.toLowerCase().includes(needle) || b.hint.toLowerCase().includes(needle);

    return (Object.keys(CATEGORY_LABELS) as BlockDef['category'][])
      .map(cat => ({ cat, blocks: BLOCK_LIST.filter(b => b.category === cat && match(b)) }))
      .filter(g => g.blocks.length > 0);
  }, [q]);

  return (
    <div className="st-drawer">
      <div className="st-drawer__h">
        <div className="st-search">
          <Search size={13} />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar sección…" />
        </div>
        <button type="button" className="st-icon-btn" onClick={onClose} aria-label="Cerrar"><X size={14} /></button>
      </div>

      <div className="st-drawer__b">
        {groups.map(g => (
          <div key={g.cat} className="st-drawer__group">
            <span className="st-drawer__cat">{CATEGORY_LABELS[g.cat]}</span>
            {g.blocks.map(b => {
              const allowed = blockAllowed(b.type, plan);
              const taken   = b.unique && used.has(b.type);
              const disabled = !allowed || taken;
              return (
                <button
                  key={b.type} type="button"
                  className={`st-block${disabled ? ' is-disabled' : ''}`}
                  disabled={disabled}
                  onClick={() => { onAdd(b.type); onClose(); }}
                  title={taken ? 'Esta sección solo puede aparecer una vez' : b.hint}
                >
                  <span className="st-block__t">
                    {b.label}
                    {!allowed && <span className="st-tag"><Lock size={9} /> {PLAN_LABEL[b.plan]}</span>}
                    {allowed && taken && <span className="st-tag">Ya está</span>}
                    {b.dataDriven && allowed && !taken && <span className="st-tag st-tag--soft">Automático</span>}
                  </span>
                  <span className="st-block__h">{b.hint}</span>
                </button>
              );
            })}
          </div>
        ))}
        {groups.length === 0 && <p className="st-note">Ninguna sección coincide con “{q}”.</p>}
      </div>
    </div>
  );
}

// ── Section list ──────────────────────────────────────────────────────────────
export default function SectionList({
  doc, plan, selectedId, onSelect, onAdd, onRemove, onDuplicate, onMove, onToggleHidden,
}: {
  doc: PageDoc;
  plan: PlanKey;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (t: BlockType, at?: number) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, to: number) => void;
  onToggleHidden: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const label = (s: PageSection) => s.name || BLOCK_DEFS[s.type]?.label || s.type;

  return (
    <div className="st-sections">
      <div className="st-sections__h">
        <span>Secciones</span>
        <button type="button" className="st-btn st-btn--sm" onClick={() => setAdding(true)}>
          <Plus size={13} /> Agregar
        </button>
      </div>

      <ol className="st-sections__list">
        {doc.sections.map((s, i) => {
          const allowed = blockAllowed(s.type, plan);
          return (
            <li
              key={s.id}
              className={[
                'st-srow',
                selectedId === s.id ? 'is-sel' : '',
                s.hidden ? 'is-hidden' : '',
                dragId === s.id ? 'is-drag' : '',
                overIdx === i ? 'is-over' : '',
              ].filter(Boolean).join(' ')}
              draggable
              onDragStart={() => setDragId(s.id)}
              onDragEnd={() => { setDragId(null); setOverIdx(null); }}
              onDragOver={e => { e.preventDefault(); setOverIdx(i); }}
              onDrop={() => { if (dragId) onMove(dragId, i); setDragId(null); setOverIdx(null); }}
            >
              <GripVertical size={13} className="st-srow__grip" />
              <button type="button" className="st-srow__main" onClick={() => onSelect(s.id)}>
                <span className="st-srow__name">{label(s)}</span>
                <span className="st-srow__type">
                  {BLOCK_DEFS[s.type]?.label}
                  {!allowed && <span className="st-tag"><Lock size={9} /> {PLAN_LABEL[BLOCK_DEFS[s.type].plan]}</span>}
                </span>
              </button>
              <div className="st-srow__acts">
                <button type="button" className="st-icon-btn" title={s.hidden ? 'Mostrar' : 'Ocultar'}
                        onClick={() => onToggleHidden(s.id)}>
                  {s.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button type="button" className="st-icon-btn" title="Duplicar" onClick={() => onDuplicate(s.id)}>
                  <Copy size={13} />
                </button>
                <button type="button" className="st-icon-btn st-icon-btn--danger" title="Eliminar"
                        onClick={() => onRemove(s.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {doc.sections.length === 0 && (
        <p className="st-note">Tu página está vacía. Agregá una sección para empezar.</p>
      )}

      <button type="button" className="st-add st-add--wide" onClick={() => setAdding(true)}>
        <Plus size={13} /> Agregar sección
      </button>

      {adding && <AddDrawer doc={doc} plan={plan} onAdd={t => onAdd(t)} onClose={() => setAdding(false)} />}
    </div>
  );
}
