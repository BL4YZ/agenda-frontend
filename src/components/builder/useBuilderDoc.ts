'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '@/lib/api';
import type { PageDoc, PageSection, BlockType, PlanKey } from '@/types/builder';
import type { Shop } from '@/types/public';
import { docFromLegacy, makeSection, newId } from '@/lib/builder/templates';

const HISTORY_LIMIT = 60;
const AUTOSAVE_MS   = 2500;

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface BuilderState {
  doc: PageDoc | null;
  shop: Shop | null;
  plan: PlanKey;
  loading: boolean;
  error: string | null;

  selectedId: string | null;
  select: (id: string | null) => void;

  dirty: boolean;
  saveState: SaveState;
  saveError: string | null;
  publishedAt: string | null;
  builderEnabled: boolean;

  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  update: (fn: (d: PageDoc) => PageDoc) => void;
  replaceDoc: (d: PageDoc) => void;

  addSection: (type: BlockType, atIndex?: number) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (id: string, toIndex: number) => void;
  toggleHidden: (id: string) => void;
  patchSection: (id: string, patch: Partial<PageSection>) => void;

  save: () => Promise<void>;
  publish: () => Promise<{ dropped: number } | null>;
  unpublish: () => Promise<void>;
}

/** Deep-ish clone that keeps the doc plain-JSON. */
const clone = <T,>(v: T): T => structuredClone(v);

export function useBuilderDoc(slug: string | null): BuilderState {
  const [doc, setDoc]   = useState<PageDoc | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [plan, setPlan] = useState<PlanKey>('gratis');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [builderEnabled, setBuilderEnabled] = useState(false);

  const past   = useRef<PageDoc[]>([]);
  const future = useRef<PageDoc[]>([]);
  // The stacks live in refs (they must not re-render on every push), but their
  // sizes are state so `canUndo` / `canRedo` recompute when they change.
  const [hist, setHist] = useState({ past: 0, future: 0 });
  const syncHist = useCallback(() => setHist({ past: past.current.length, future: future.current.length }), []);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const docRef = useRef<PageDoc | null>(null);
  docRef.current = doc;

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // The public endpoint is what the visitor sees, so previewing through it
        // guarantees the builder never shows data the plan would hide.
        const [pageRes, shopRes] = await Promise.all([
          api.get('/landing/page'),
          slug
            ? fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/landing`, { cache: 'no-store' })
                .then(r => (r.ok ? r.json() : null))
            : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const shopData: Shop | null = shopRes ?? null;
        setShop(shopData);
        setPlan(pageRes.data?.plan ?? 'gratis');
        setPublishedAt(pageRes.data?.published_at ?? null);
        setBuilderEnabled(pageRes.data?.builder_enabled === true);

        // No draft yet → rebuild the landing the business already has, so the
        // first thing the owner sees is their own page, not an empty canvas.
        const initial: PageDoc | null =
          pageRes.data?.doc ?? (shopData ? docFromLegacy(shopData) : null);

        setDoc(initial);
        setSelectedId(initial?.sections[0]?.id ?? null);
        setDirty(!pageRes.data?.doc && !!initial);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar la página.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  // ── History + mutation ──────────────────────────────────────────────────────
  const update = useCallback((fn: (d: PageDoc) => PageDoc) => {
    setDoc(prev => {
      if (!prev) return prev;
      past.current.push(clone(prev));
      if (past.current.length > HISTORY_LIMIT) past.current.shift();
      future.current = [];
      syncHist();
      setDirty(true);
      return fn(clone(prev));
    });
  }, [syncHist]);

  const replaceDoc = useCallback((d: PageDoc) => update(() => clone(d)), [update]);

  const undo = useCallback(() => {
    setDoc(prev => {
      const last = past.current.pop();
      if (!last || !prev) return prev;
      future.current.push(clone(prev));
      syncHist();
      setDirty(true);
      return last;
    });
  }, [syncHist]);

  const redo = useCallback(() => {
    setDoc(prev => {
      const next = future.current.pop();
      if (!next || !prev) return prev;
      past.current.push(clone(prev));
      syncHist();
      setDirty(true);
      return next;
    });
  }, [syncHist]);

  // ── Section operations ──────────────────────────────────────────────────────
  const addSection = useCallback((type: BlockType, atIndex?: number) => {
    const section = makeSection(type);
    update(d => {
      const at = atIndex ?? d.sections.length;
      d.sections.splice(at, 0, section);
      return d;
    });
    setSelectedId(section.id);
  }, [update]);

  const removeSection = useCallback((id: string) => {
    update(d => ({ ...d, sections: d.sections.filter(s => s.id !== id) }));
    setSelectedId(cur => (cur === id ? null : cur));
  }, [update]);

  const duplicateSection = useCallback((id: string) => {
    const copyId = newId();
    update(d => {
      const i = d.sections.findIndex(s => s.id === id);
      if (i < 0) return d;
      d.sections.splice(i + 1, 0, { ...clone(d.sections[i]), id: copyId });
      return d;
    });
    setSelectedId(copyId);
  }, [update]);

  const moveSection = useCallback((id: string, toIndex: number) => {
    update(d => {
      const from = d.sections.findIndex(s => s.id === id);
      if (from < 0) return d;
      const to = Math.max(0, Math.min(d.sections.length - 1, toIndex));
      if (from === to) return d;
      const [moved] = d.sections.splice(from, 1);
      d.sections.splice(to, 0, moved);
      return d;
    });
  }, [update]);

  const toggleHidden = useCallback((id: string) => {
    update(d => ({
      ...d,
      sections: d.sections.map(s => (s.id === id ? { ...s, hidden: !s.hidden } : s)),
    }));
  }, [update]);

  const patchSection = useCallback((id: string, patch: Partial<PageSection>) => {
    update(d => ({
      ...d,
      sections: d.sections.map(s => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, [update]);

  // ── Persistence ─────────────────────────────────────────────────────────────
  const save = useCallback(async () => {
    const current = docRef.current;
    if (!current) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      const res = await api.put('/landing/page', { doc: current });
      // The server sanitizes; adopting its answer keeps the editor honest about
      // what was actually stored instead of showing values it silently dropped.
      if (res.data?.doc) {
        setDoc(res.data.doc);
        docRef.current = res.data.doc;
      }
      setDirty(false);
      setSaveState('saved');
      setTimeout(() => setSaveState(s => (s === 'saved' ? 'idle' : s)), 2000);
    } catch (e: unknown) {
      setSaveState('error');
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaveError(msg ?? 'No se pudo guardar. Reintentá en unos segundos.');
    }
  }, []);

  const publish = useCallback(async () => {
    const current = docRef.current;
    if (!current) return null;
    setSaveState('saving');
    setSaveError(null);
    try {
      const res = await api.post('/landing/page/publish', { doc: current });
      if (res.data?.doc) {
        setDoc(res.data.doc);
        docRef.current = res.data.doc;
      }
      setDirty(false);
      setBuilderEnabled(true);
      setPublishedAt(new Date().toISOString());
      setSaveState('saved');
      setTimeout(() => setSaveState(s => (s === 'saved' ? 'idle' : s)), 2000);
      return { dropped: res.data?.dropped ?? 0 };
    } catch (e: unknown) {
      setSaveState('error');
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSaveError(msg ?? 'No se pudo publicar.');
      return null;
    }
  }, []);

  const unpublish = useCallback(async () => {
    try {
      await api.post('/landing/page/unpublish');
      setBuilderEnabled(false);
    } catch {
      setSaveError('No se pudo despublicar.');
    }
  }, []);

  // Debounced autosave of the draft. Publishing is always explicit — a draft
  // that saves itself must never reach visitors.
  useEffect(() => {
    if (!dirty || !doc) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => { void save(); }, AUTOSAVE_MS);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [dirty, doc, save]);

  // Keyboard: undo / redo / save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
      else if (k === 's') { e.preventDefault(); void save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, save]);

  // Leaving with unsaved work loses it — the autosave may not have fired yet.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', onLeave);
    return () => window.removeEventListener('beforeunload', onLeave);
  }, [dirty]);

  return useMemo<BuilderState>(() => ({
    doc, shop, plan, loading, error,
    selectedId, select: setSelectedId,
    dirty, saveState, saveError, publishedAt, builderEnabled,
    canUndo: hist.past > 0,
    canRedo: hist.future > 0,
    undo, redo,
    update, replaceDoc,
    addSection, removeSection, duplicateSection, moveSection, toggleHidden, patchSection,
    save, publish, unpublish,
  }), [
    doc, shop, plan, loading, error, selectedId, dirty, saveState, saveError,
    publishedAt, builderEnabled, hist, undo, redo, update, replaceDoc,
    addSection, removeSection, duplicateSection, moveSection, toggleHidden,
    patchSection, save, publish, unpublish,
  ]);
}
