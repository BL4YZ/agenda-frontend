'use client';

import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingModal from "@/components/OnboardingModal";
import TrialBanner from "@/components/TrialBanner";
import RouteProgress from "@/components/RouteProgress";
import { useAuth } from "@/context/AuthContext";
import { BusinessProvider, useBusiness } from "@/context/BusinessContext";
import { useTheme } from "@/context/ThemeContext";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import "@/styles/system.css";
import "@/styles/dashboard.css";

/* ── SVG icon set (from handoff) ─────────────────────────────────────────── */
const Icon = {
  cal: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
  list: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  team: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0119 7a4 4 0 01-3 3.87"/></svg>,
  finance: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  chev: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"/></svg>,
  help: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h0"/></svg>,
  sun: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  moon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  lock: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
};

/* ── Breadcrumbs map ─────────────────────────────────────────────────────── */
const CRUMBS: Record<string, string[]> = {
  '/dashboard':                      ['Inicio', 'Calendario'],
  '/dashboard/appointments':         ['Inicio', 'Agenda', 'Citas'],
  '/dashboard/services':             ['Inicio', 'Agenda', 'Servicios'],
  '/dashboard/schedules':            ['Inicio', 'Agenda', 'Horarios'],
  '/dashboard/team':                 ['Inicio', 'Equipo', 'Integrantes'],
  '/dashboard/team/modalities':      ['Inicio', 'Equipo', 'Modalidades'],
  '/dashboard/team/reports':         ['Inicio', 'Equipo', 'Reportes'],
  '/dashboard/analytics':            ['Inicio', 'Finanzas', 'Métricas'],
  '/dashboard/finances/expenses':    ['Inicio', 'Finanzas', 'Gastos'],
  '/dashboard/finances/commissions': ['Inicio', 'Finanzas', 'Comisiones'],
  '/dashboard/settings':             ['Inicio', 'Configuración', 'Negocio'],
  '/dashboard/settings/billing':     ['Inicio', 'Configuración', 'Planes'],
  '/dashboard/branches':             ['Inicio', 'Configuración', 'Sucursales'],
};

/* ── Backdrop ────────────────────────────────────────────────────────────── */
function DashBackdrop() {
  return (
    <div className="dash-bg" aria-hidden="true">
      <div className="dash-bg__grid" />
      <div className="dash-bg__blob dash-bg__blob--a" />
      <div className="dash-bg__blob dash-bg__blob--b" />
      <div className="dash-bg__blob dash-bg__blob--c" />
    </div>
  );
}

/* ── Brand ───────────────────────────────────────────────────────────────── */
function DashBrand() {
  return (
    <div className="dash-side__brand">
      <svg width="28" height="28" viewBox="0 0 36 36">
        <defs>
          <linearGradient id="dlg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="32" height="32" rx="9" fill="url(#dlg)" />
        <rect x="9" y="9" width="18" height="18" rx="3" fill="none" stroke="white" strokeWidth="1.4" />
        <circle cx="13" cy="14" r="1.2" fill="white" />
        <rect x="11.5" y="18" width="13" height="1.3" rx="0.7" fill="white" opacity="0.7" />
      </svg>
      <span className="dash-side__brand-word">MiAgenda</span>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
interface SidebarProps {
  hasEquipo: boolean;
  hasFinanzas: boolean;
  canSettings: boolean;
  isOwner: boolean;
  isNegocio: boolean;
  showModalities: boolean;
  showTeamReports: boolean;
  showExpenses: boolean;
  showCommissions: boolean;
  logout: () => void;
  theme: string;
  toggleTheme: () => void;
}

function DashSidebar({
  hasEquipo, hasFinanzas, canSettings, isOwner, isNegocio,
  showModalities, showTeamReports, showExpenses, showCommissions,
  logout, theme, toggleTheme,
}: SidebarProps) {
  const pathname = usePathname();

  const inAgenda = ['/dashboard/appointments', '/dashboard/services', '/dashboard/schedules'].some(p => pathname === p);
  const inTeam   = pathname.startsWith('/dashboard/team');
  const inFin    = pathname.startsWith('/dashboard/analytics') || pathname.startsWith('/dashboard/finances');
  const inCfg    = pathname.startsWith('/dashboard/settings') || pathname === '/dashboard/branches';

  const [open, setOpen] = useState({
    agenda: inAgenda,
    team:   inTeam,
    fin:    inFin,
    cfg:    inCfg,
  });
  const toggle = (k: keyof typeof open) => setOpen(o => ({ ...o, [k]: !o[k] }));

  useEffect(() => {
    setOpen({ agenda: inAgenda, team: inTeam, fin: inFin, cfg: inCfg });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const navItemCls = (href: string) =>
    `dash-nav-item${pathname === href ? ' is-active' : ''}`;
  const navSubCls = (href: string) =>
    `dash-nav-subitem${pathname === href ? ' is-active' : ''}`;
  const navGroupCls = (key: keyof typeof open, paths: string[]) => {
    const active = paths.some(p => pathname === p || pathname.startsWith(p + '/'));
    return `dash-nav-item${open[key] ? ' is-open' : ''}${active ? ' is-active' : ''}`;
  };

  return (
    <aside className="dash-side">
      <DashBrand />
      <nav className="dash-side__nav">

        {/* Calendario */}
        <Link href="/dashboard" className={navItemCls('/dashboard')}>
          <span className="dash-nav-item__icon">{Icon.cal}</span>
          <span>Calendario</span>
        </Link>

        {/* Agenda */}
        <div className="dash-nav-group">
          <button
            className={navGroupCls('agenda', ['/dashboard/appointments', '/dashboard/services', '/dashboard/schedules'])}
            onClick={() => toggle('agenda')}
          >
            <span className="dash-nav-item__icon">{Icon.list}</span>
            <span>Agenda</span>
            <span className="dash-nav-item__chevron">{Icon.chev}</span>
          </button>
          {open.agenda && (
            <div className="dash-nav-sub">
              <Link href="/dashboard/appointments" className={navSubCls('/dashboard/appointments')}>Citas</Link>
              <Link href="/dashboard/services"     className={navSubCls('/dashboard/services')}>Servicios</Link>
              <Link href="/dashboard/schedules"    className={navSubCls('/dashboard/schedules')}>Horarios</Link>
            </div>
          )}
        </div>

        {/* Equipo */}
        {hasEquipo && (
          <div className="dash-nav-group">
            <button
              className={navGroupCls('team', ['/dashboard/team'])}
              onClick={() => toggle('team')}
            >
              <span className="dash-nav-item__icon">{Icon.team}</span>
              <span>Equipo</span>
              <span className="dash-nav-item__chevron">{Icon.chev}</span>
            </button>
            {open.team && (
              <div className="dash-nav-sub">
                <Link href="/dashboard/team" className={navSubCls('/dashboard/team')}>Integrantes</Link>
                {showModalities && (
                  <Link href="/dashboard/team/modalities" className={navSubCls('/dashboard/team/modalities')}>Modalidades</Link>
                )}
                {showTeamReports && (
                  <Link href="/dashboard/team/reports" className={navSubCls('/dashboard/team/reports')}>Reportes</Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Finanzas */}
        {hasFinanzas && (
          <div className="dash-nav-group">
            <button
              className={navGroupCls('fin', ['/dashboard/analytics', '/dashboard/finances'])}
              onClick={() => toggle('fin')}
            >
              <span className="dash-nav-item__icon">{Icon.finance}</span>
              <span>Finanzas</span>
              <span className="dash-nav-item__chevron">{Icon.chev}</span>
            </button>
            {open.fin && (
              <div className="dash-nav-sub">
                <Link href="/dashboard/analytics" className={navSubCls('/dashboard/analytics')}>Métricas</Link>
                {showExpenses && (
                  <Link href="/dashboard/finances/expenses" className={navSubCls('/dashboard/finances/expenses')}>Gastos</Link>
                )}
                {isOwner && showCommissions && (
                  <Link href="/dashboard/finances/commissions" className={navSubCls('/dashboard/finances/commissions')}>Comisiones</Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Configuración */}
        {canSettings && (
          <div className="dash-nav-group">
            <button
              className={navGroupCls('cfg', ['/dashboard/settings', '/dashboard/branches'])}
              onClick={() => toggle('cfg')}
            >
              <span className="dash-nav-item__icon">{Icon.settings}</span>
              <span>Configuración</span>
              <span className="dash-nav-item__chevron">{Icon.chev}</span>
            </button>
            {open.cfg && (
              <div className="dash-nav-sub">
                <Link href="/dashboard/settings" className={navSubCls('/dashboard/settings')}>Negocio</Link>
                <Link href="/dashboard/settings/billing" className={navSubCls('/dashboard/settings/billing')}>Planes</Link>
                {isOwner && isNegocio && (
                  <Link href="/dashboard/branches" className={navSubCls('/dashboard/branches')}>Sucursales</Link>
                )}
              </div>
            )}
          </div>
        )}

      </nav>

      <div className="dash-side__foot">
        <button className="dash-nav-item" onClick={toggleTheme}>
          <span className="dash-nav-item__icon">{theme === 'light' ? Icon.moon : Icon.sun}</span>
          <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
        </button>
        <button className="dash-nav-item" onClick={logout}>
          <span className="dash-nav-item__icon">{Icon.logout}</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

/* ── Search ──────────────────────────────────────────────────────────────── */
interface SearchAppt {
  id: number;
  title: string;
  start: string;
  client_name: string;
  client_email: string;
  payment_status: string;
}

function DashSearch() {
  const { token } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchAppt[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onMouse(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouse);
    return () => document.removeEventListener('mousedown', onMouse);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    const tid = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await axios.get<SearchAppt[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`, {
          params: { search: q },
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data.slice(0, 8));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setBusy(false);
      }
    }, 300);
    return () => clearTimeout(tid);
  }, [query, token]);

  function go(appt: SearchAppt) {
    setOpen(false);
    setQuery('');
    router.push(`/dashboard/appointments?search=${encodeURIComponent(appt.client_name)}`);
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  const showDrop = open && query.trim().length >= 2;

  return (
    <div className="dash-search" ref={wrapRef}>
      {Icon.search}
      <input
        ref={inputRef}
        placeholder="Buscar clientes, citas, servicios…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { if (query.trim().length >= 2 && results.length > 0) setOpen(true); }}
      />
      {busy
        ? <span className="dash-search__spinner" />
        : !query && <span className="dash-search__kbd">⌘K</span>
      }
      {showDrop && (
        <div className="dash-search__drop">
          {results.length === 0 && !busy ? (
            <div className="dash-search__empty">Sin resultados para &ldquo;{query}&rdquo;</div>
          ) : (
            <div className="dash-search__group">
              <div className="dash-search__group-label">Citas</div>
              {results.map(appt => (
                <button key={appt.id} className="dash-search__item" onClick={() => go(appt)}>
                  <div className="dash-search__item-main">
                    <div className="dash-search__item-title">{appt.client_name}</div>
                    <div className="dash-search__item-sub">{appt.title} · {fmt(appt.start)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Topbar ──────────────────────────────────────────────────────────────── */
type NotifItem = { id: string; title: string; start: string; client_name?: string };
type TopPanel = 'help' | 'notif' | 'profile' | null;

function DashTopbar({ crumbs, initial, businessName, role, logout, token }: {
  crumbs: string[]; initial: string; businessName: string;
  role: string | null; logout: () => void; token: string | null;
}) {
  const [open, setOpen] = useState<TopPanel>(null);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [notifSeen, setNotifSeen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch count on mount so the dot appears before the panel is opened
  useEffect(() => {
    if (!token) return;
    const today = new Date().toISOString().slice(0, 10);
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments?from=${today}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const data = res.data.slice(0, 6);
      setNotifs(data);
      setNotifCount(data.length);
    }).catch(() => {});
  }, [token]);

  // Mark as seen and refresh list when panel is opened
  useEffect(() => {
    if (open !== 'notif') return;
    setNotifSeen(true);
    if (!token) return;
    setNotifLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments?from=${today}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const data = res.data.slice(0, 6);
      setNotifs(data);
      setNotifCount(data.length);
    }).catch(() => {})
      .finally(() => setNotifLoading(false));
  }, [open, token]);

  const toggle = (panel: NonNullable<TopPanel>) =>
    setOpen(prev => prev === panel ? null : panel);

  const formatNotifTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' + iso.slice(11, 16);
  };

  return (
    <div className="dash-top">
      <div className="dash-crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className={i === crumbs.length - 1 ? 'dash-crumbs__current' : ''}>{c}</span>
            {i < crumbs.length - 1 && <span className="dash-crumbs__sep">/</span>}
          </React.Fragment>
        ))}
      </div>
      <DashSearch />
      <div className="dash-top__spacer" />

      <div ref={wrapRef} style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>

        {/* Help */}
        <button className={`dash-iconbtn${open === 'help' ? ' is-active' : ''}`} onClick={() => toggle('help')}>
          {Icon.help}
        </button>
        {open === 'help' && (
          <div className="topbar-drop" style={{ right: 140 }}>
            <div className="topbar-drop__head">Centro de ayuda</div>
            <Link href="/dashboard/settings" className="topbar-drop__item" onClick={() => setOpen(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Configuración
            </Link>
            <a href="mailto:soporte@miagenda.app" className="topbar-drop__item" onClick={() => setOpen(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Contactar soporte
            </a>
            <a href="/public" target="_blank" className="topbar-drop__item" onClick={() => setOpen(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              Ver mi página pública
            </a>
          </div>
        )}

        {/* Notifications */}
        <button className={`dash-iconbtn${open === 'notif' ? ' is-active' : ''}`} onClick={() => toggle('notif')}>
          {Icon.bell}
          {notifCount > 0 && !notifSeen && <span className="dash-iconbtn__dot" />}
        </button>
        {open === 'notif' && (
          <div className="topbar-drop" style={{ right: 72, width: 300 }}>
            <div className="topbar-drop__head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Próximas citas</span>
              {notifCount > 0 && (
                <button
                  onClick={() => setNotifSeen(true)}
                  style={{ fontSize: 11, color: 'var(--fg-3)', background: 'none', border: 0, cursor: 'pointer', padding: '2px 6px', borderRadius: 6, transition: 'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-1)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}
                >
                  Marcar leído
                </button>
              )}
            </div>
            {notifLoading ? (
              <div className="skel-page" style={{ padding: '8px 12px' }}>
                {[0,1,2].map(i => (
                  <div key={i} className="skel-row" style={{ gap: 10, padding: '6px 0' }}>
                    <span className="skel" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span className="skel" style={{ height: 11, width: '60%' }} />
                      <span className="skel" style={{ height: 10, width: '45%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
                No hay citas próximas
              </div>
            ) : notifs.map(n => (
              <Link key={n.id} href="/dashboard/appointments" className="topbar-drop__item topbar-drop__item--notif" onClick={() => setOpen(null)}>
                <div className="topbar-drop__notif-icon">
                  {n.title.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
                    {n.client_name && <span>{n.client_name} · </span>}
                    {formatNotifTime(n.start)}
                  </div>
                </div>
              </Link>
            ))}
            <div className="topbar-drop__sep" />
            <Link href="/dashboard/appointments" className="topbar-drop__item topbar-drop__item--footer" onClick={() => setOpen(null)}>
              Ver todas las citas →
            </Link>
          </div>
        )}

        {/* Profile */}
        <button className={`dash-avatar${open === 'profile' ? ' is-active' : ''}`} onClick={() => toggle('profile')}>
          {initial}
        </button>
        {open === 'profile' && (
          <div className="topbar-drop" style={{ right: 0, width: 220 }}>
            <div className="topbar-drop__profile">
              <div className="topbar-drop__avatar">{initial}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg-0)' }}>{businessName}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2, textTransform: 'capitalize' }}>{role ?? 'owner'}</div>
              </div>
            </div>
            <div className="topbar-drop__sep" />
            <Link href="/dashboard/settings" className="topbar-drop__item" onClick={() => setOpen(null)}>
              {Icon.settings} Configuración
            </Link>
            <div className="topbar-drop__sep" />
            <button className="topbar-drop__item topbar-drop__item--danger" onClick={() => { setOpen(null); logout(); }}>
              {Icon.logout} Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Employee blocked screen ─────────────────────────────────────────────── */
function EmployeeBlockedScreen({ suspended, logout }: { suspended: boolean; logout: () => void }) {
  return (
    <div className="dash-modal-overlay" style={{ flexDirection: 'column', gap: 16 }}>
      <div className="dash-modal" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="kpi__icon kpi__icon--orange" style={{ width: 56, height: 56, borderRadius: 16 }}>
          {Icon.lock}
        </div>
        <h1 className="dash-page__title" style={{ fontSize: 24 }}>Sin acceso</h1>
        <p style={{ color: 'var(--fg-2)', fontSize: 14 }}>
          {suspended
            ? 'El dueño del negocio seleccionó a otro empleado como activo en el plan Gratis.'
            : 'El negocio está en el plan Gratis y el dueño aún no ha seleccionado al empleado activo.'}
        </p>
        <p style={{ color: 'var(--fg-3)', fontSize: 12 }}>
          Contacta al dueño para que actualice su plan o te elija como el profesional activo.
        </p>
        <button className="dbtn dbtn--primary" onClick={logout}>
          {Icon.logout}
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}

/* ── Mobile sub-navigation ───────────────────────────────────────────────── */
interface SubNavProps {
  hasEquipo: boolean;
  hasFinanzas: boolean;
  canSettings: boolean;
  isOwner: boolean;
  isNegocio: boolean;
  showModalities: boolean;
  showTeamReports: boolean;
  showExpenses: boolean;
  showCommissions: boolean;
}

function MobileSubNav({
  hasEquipo, hasFinanzas, canSettings, isOwner, isNegocio,
  showModalities, showTeamReports, showExpenses, showCommissions,
}: SubNavProps) {
  const pathname = usePathname();

  const inAgenda = ['/dashboard/appointments', '/dashboard/services', '/dashboard/schedules'].some(p => pathname === p);
  const inTeam   = pathname.startsWith('/dashboard/team');
  const inFin    = pathname.startsWith('/dashboard/analytics') || pathname.startsWith('/dashboard/finances');
  const inCfg    = pathname.startsWith('/dashboard/settings') || pathname === '/dashboard/branches';

  type SubItem = { href: string; label: string };
  let items: SubItem[] = [];

  if (inAgenda) {
    items = [
      { href: '/dashboard/appointments', label: 'Citas' },
      { href: '/dashboard/services',     label: 'Servicios' },
      { href: '/dashboard/schedules',    label: 'Horarios' },
    ];
  } else if (inTeam && hasEquipo) {
    items = [{ href: '/dashboard/team', label: 'Integrantes' }];
    if (showModalities) items.push({ href: '/dashboard/team/modalities', label: 'Modalidades' });
    if (showTeamReports) items.push({ href: '/dashboard/team/reports', label: 'Reportes' });
  } else if (inFin && hasFinanzas) {
    items = [{ href: '/dashboard/analytics', label: 'Métricas' }];
    if (showExpenses) items.push({ href: '/dashboard/finances/expenses', label: 'Gastos' });
    if (isOwner && showCommissions) items.push({ href: '/dashboard/finances/commissions', label: 'Comisiones' });
  } else if (inCfg && canSettings) {
    items = [
      { href: '/dashboard/settings',         label: 'Negocio' },
      { href: '/dashboard/settings/billing', label: 'Planes'  },
    ];
    if (isOwner && isNegocio) items.push({ href: '/dashboard/branches', label: 'Sucursales' });
  }

  if (items.length <= 1) return null;

  return (
    <nav className="dash-mobile-subnav">
      <div className="dash-mobile-subnav__scroll">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`dash-mobile-subnav__item${pathname === item.href ? ' is-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ── Mobile bottom nav ───────────────────────────────────────────────────── */
function MobileNav({ isOwner, hasFinanzas, canSettings, logout }: {
  isOwner: boolean; hasFinanzas: boolean; canSettings: boolean; logout: () => void;
}) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="dash-mobile-nav">
      <Link href="/dashboard" className={`dash-mobile-nav__item${active('/dashboard') && pathname === '/dashboard' ? ' is-active' : ''}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        Inicio
      </Link>
      <Link href="/dashboard/appointments" className={`dash-mobile-nav__item${active('/dashboard/appointments') ? ' is-active' : ''}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        Agenda
      </Link>
      {hasFinanzas && (
        <Link href="/dashboard/analytics" className={`dash-mobile-nav__item${active('/dashboard/analytics') || active('/dashboard/finances') ? ' is-active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
          Métricas
        </Link>
      )}
      {isOwner && (
        <Link href="/dashboard/team" className={`dash-mobile-nav__item${active('/dashboard/team') ? ' is-active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0119 7a4 4 0 01-3 3.87"/></svg>
          Equipo
        </Link>
      )}
      {canSettings && (
        <Link href="/dashboard/settings" className={`dash-mobile-nav__item${active('/dashboard/settings') ? ' is-active' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Config.
        </Link>
      )}
    </nav>
  );
}

/* ── Inner layout ────────────────────────────────────────────────────────── */
function DashboardInner({ children }: { children: React.ReactNode }) {
  const { logout, role, permissions, planSuspended, planBlocked, profileLoading, token } = useAuth();
  const { theme, toggle } = useTheme();
  const { business, featureFlags, isOnboarded, loading } = useBusiness();
  const pathname = usePathname();

  const plan      = business?.subscription_plan ?? 'gratis';
  const isOwner   = role === 'owner';
  const isNegocio = plan === 'negocio';

  if (role === 'employee') {
    if (profileLoading) return null;
    if (planBlocked) return <EmployeeBlockedScreen suspended={planSuspended} logout={logout} />;
  }

  const canAnalytics = isOwner || !!permissions.analytics;
  const canSettings  = isOwner || !!permissions.settings;
  const hasEquipo    = isOwner;
  const hasFinanzas  = canAnalytics && (
    featureFlags.showExpenses || featureFlags.showCommissions || true
  );

  const crumbs  = CRUMBS[pathname] ?? ['Inicio'];
  const initial = (business?.name?.[0] ?? 'A').toUpperCase();

  return (
    <div className="dash-shell ma-root">
      <RouteProgress />
      <DashBackdrop />

      {!loading && isOwner && !isOnboarded && <OnboardingModal />}

      <DashSidebar
        hasEquipo={hasEquipo}
        hasFinanzas={hasFinanzas}
        canSettings={canSettings}
        isOwner={isOwner}
        isNegocio={isNegocio}
        showModalities={featureFlags.showModalities}
        showTeamReports={featureFlags.showTeamReports}
        showExpenses={featureFlags.showExpenses}
        showCommissions={featureFlags.showCommissions}
        logout={logout}
        theme={theme}
        toggleTheme={toggle}
      />

      <div className="dash-main">
        <DashTopbar
          crumbs={crumbs}
          initial={initial}
          businessName={business?.name ?? ''}
          role={role}
          logout={logout}
          token={token}
        />
        <MobileSubNav
          hasEquipo={hasEquipo}
          hasFinanzas={hasFinanzas}
          canSettings={canSettings}
          isOwner={isOwner}
          isNegocio={isNegocio}
          showModalities={featureFlags.showModalities}
          showTeamReports={featureFlags.showTeamReports}
          showExpenses={featureFlags.showExpenses}
          showCommissions={featureFlags.showCommissions}
        />
        <TrialBanner />
        {children}
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav isOwner={isOwner} hasFinanzas={hasFinanzas} canSettings={canSettings} logout={logout} />
    </div>
  );
}

/* ── Layout export ───────────────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <BusinessProvider>
        <DashboardInner>{children}</DashboardInner>
      </BusinessProvider>
    </ProtectedRoute>
  );
}
