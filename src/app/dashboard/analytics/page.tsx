'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { format, parseISO, differenceInDays, endOfMonth, startOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import * as XLSX from 'xlsx';

// ── SVG Icon components ────────────────────────────────────────────────────────
type SvgIconProps = { size?: number; style?: React.CSSProperties; className?: string };

const IcoTrendingUp   = ({ size=14, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={style}><path d="M1 11L5 7l3 2 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 5h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoTrendingDown = ({ size=14, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={style}><path d="M1 3L5 7l3-2 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 9h4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoCalendar     = ({ size=18, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={style}><rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M6 1v4M12 1v4M2 7h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoDollar       = ({ size=18, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={style}><path d="M9 2v14M6 5.5C6 4.12 7.12 3 8.5 3H10c1.38 0 2.5 1.12 2.5 2.5S11.38 8 10 8H8c-1.38 0-2.5 1.12-2.5 2.5S6.62 13 8 13h2c1.38 0 2.5-1.12 2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoBarChart     = ({ size=18, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={style}><path d="M3 15V9M9 15V3M15 15v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoUsers        = ({ size=18, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={style}><circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M1 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M13 4a3 3 0 0 1 0 6M17 16c0-2.76-1.79-5.11-4.25-5.87" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoUserCheck    = ({ size=18, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={style}><circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M1 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M12 11l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoUserPlus     = ({ size=18, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={style}><circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M1 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M14 9v6M11 12h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
const IcoZap          = ({ size=18, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={style}><path d="M10 2L3 10h7l-2 6 8-8h-7l2-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>;
const IcoClock        = ({ size=15, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 15 15" fill="none" style={style}><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 4v3.5L10 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
const IcoStar         = ({ size=15, style }: SvgIconProps) => <svg width={size} height={size} viewBox="0 0 15 15" fill="none" style={style}><path d="M7.5 1l1.75 4.1 4.25.45-3 3 .85 4.45L7.5 11l-3.85 2-1 0 .85-4.45-3-3 4.25-.45L7.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>;

const IcoLock     = (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4"/></svg>);
const IcoLockSm   = (<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><rect x="1.5" y="4" width="6" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M3 4V3a1.5 1.5 0 0 1 3 0v1" stroke="currentColor" strokeWidth="1.1"/></svg>);
const IcoArrowUp  = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 9.5L6.5 4l4.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoArrowDn  = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4L6.5 9.5 11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoDownload = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3.5 6.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 10.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>);
const IcoExcel    = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 9l2-3 2 3M4 4h5M6.5 4v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>);
const IcoPrint    = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 4V1.5h7V4M3 9.5H1.5V5.5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v4H11.5M3 7.5h7v4H3v-4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoChev     = (<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoX        = (<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>);
const IcoCheck    = (<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5L9 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcoLightbulb= (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2a4 4 0 0 1 2.5 7.1V11H4.5V9.1A4 4 0 0 1 7 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>);
const IcoList     = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 4h9M2 7h9M2 10h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>);
const IcoPin      = (<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 12S2 8.5 2 5.5a4.5 4.5 0 0 1 9 0C11 8.5 6.5 12 6.5 12z" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>);
const IcoCursor   = (<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 1l5.5 3.5-3 .5-.5 3L2 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>);
const IcoSpin     = (<span style={{ display:'inline-block', width:12, height:12, borderRadius:'50%', border:'2px solid currentColor', borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }} />);

// ── Types ─────────────────────────────────────────────────────────────────────
type Plan = 'gratis' | 'pro' | 'negocio';
type Business = { name: string; brand_color?: string | null; subscription_plan: string; subscription_status?: string; logo_url?: string | null };
type Summary = { total_appointments: number; paid_count: number; full_payment_count: number; pending_count: number; free_count: number; revenue_total: number; avg_ticket: number };
type PeriodData = { current: Summary; previous: { total_appointments: number; revenue_total: number } };
type RevenuePoint = { period: string; appointments: number; revenue: number };
type EmployeeStat = { employee_id: number; employee_name: string; total_appointments: number; paid_count: number; revenue: number };
type ServiceStat  = { service_id: number; service_name: string; total_appointments: number; paid_count: number; revenue: number };
type BranchStat   = { branch_name: string; total_appointments: number; paid_count: number; revenue: number };
type HeatCell     = { day_of_week: number; hour: number; count: number };
type TopClient    = { client_name: string; client_email: string; total_appointments: number; paid_count: number; revenue: number };
type ClientStats  = { new_clients: number; returning_clients: number; total_unique_clients: number };
type AppRow = { id: number; client_name: string; client_email: string; start_time: string; payment_status: string; amount: number; service_name: string; service_price: number; employee_name: string };
type Employee = { id: number; name: string | null; email: string };

// ── Constants ──────────────────────────────────────────────────────────────────
const RANGES = [
    { key: 'all',        label: 'Todo' },
    { key: 'this_month', label: 'Este mes' },
    { key: '7d',         label: 'Últimos 7 días' },
    { key: '30d',        label: 'Últimos 30 días' },
    { key: '90d',        label: 'Últimos 3 meses' },
    { key: 'this_year',  label: 'Este año' },
    { key: 'prev_month', label: 'Mes anterior' },
    { key: 'custom',     label: 'Personalizado' },
];
const GROUP_BY  = [{ key: 'day', label: 'Día' }, { key: 'week', label: 'Semana' }, { key: 'month', label: 'Mes' }, { key: 'year', label: 'Año' }];
const STATUS_COLORS: Record<string, string> = { paid: '#22c55e', full_payment: '#3b82f6', pending: '#f59e0b', not_required: '#94a3b8' };
const STATUS_LABEL:  Record<string, string> = { paid: 'Cobrado', full_payment: 'Pago completo', pending: 'Pendiente', not_required: 'Sin cobro' };
const STATUS_KEY: Record<string, string> = { Cobrado: 'paid', 'Pago completo': 'full_payment', Pendiente: 'pending', 'Sin cobro': 'not_required' };
const HEATMAP_HOURS = [7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const WEEK_DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const DOW_ORDER = [1,2,3,4,5,6,0];

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(val: number, ref: number) { return ref ? ((val - ref) / ref) * 100 : null; }
function fmtMoney(n: number) { return `$${Number(n).toFixed(2)}`; }

function Delta({ val, ref }: { val: number; ref: number }) {
    const p = pct(val, ref);
    if (p === null) return null;
    const up = p >= 0;
    return (
        <span style={{ display:'flex', alignItems:'center', gap:2, fontSize:12, fontWeight:600, color: up ? '#22c55e' : '#ef4444' }}>
            {up ? IcoArrowUp : IcoArrowDn}
            {Math.abs(p).toFixed(1)}%
        </span>
    );
}

function PlanBadge({ label }: { label: string }) {
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:4, fontSize:10,
            fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
            padding:'2px 8px', borderRadius:99,
            background:'rgba(167,139,250,.15)', color:'var(--accent)',
        }}>
            {IcoLockSm} {label}
        </span>
    );
}

function LockOverlay({ label = 'Plan Pro' }: { label?: string }) {
    return (
        <div style={{
            position:'absolute', inset:0, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', borderRadius:24,
            background:'var(--glass-bg-strong)', backdropFilter:'blur(8px)', zIndex:10,
        }}>
            <span style={{ color:'var(--fg-3)', marginBottom:8 }}>{IcoLock}</span>
            <p style={{ fontSize:14, fontWeight:700, color:'var(--fg-1)' }}>{label}</p>
            <p style={{ fontSize:12, color:'var(--fg-3)', marginTop:2 }}>Actualizá tu plan para acceder</p>
        </div>
    );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span style={{
            display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px',
            borderRadius:8, fontSize:11, fontWeight:600,
            background:'rgba(167,139,250,.15)', color:'var(--accent)',
            border:'1px solid rgba(167,139,250,.2)',
        }}>
            {label}
            <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', display:'flex', padding:0 }}>{IcoX}</button>
        </span>
    );
}

function KPICard({ label, value, sub, icon: Icon, delta, locked, tone = 'purple', onClick }: {
    label: string; value: string; sub?: string; icon: React.ElementType;
    delta?: { val: number; ref: number } | null; locked?: boolean; tone?: string;
    onClick?: () => void;
}) {
    const p = delta && delta.ref ? ((delta.val - delta.ref) / delta.ref) * 100 : null;
    return (
        <div onClick={onClick} className="kpi" style={{ cursor: onClick ? 'pointer' : undefined }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                <div className={`kpi__icon${tone !== 'purple' ? ` kpi__icon--${tone}` : ''}`}>
                    <Icon size={18} />
                </div>
                {locked && <PlanBadge label="Pro" />}
            </div>
            <div className={`kpi__value${value.length > 8 ? ' kpi__value--small' : ''}`}>{value}</div>
            <div className="kpi__label">{label}</div>
            {sub && <div className="kpi__hint">{sub}</div>}
            {p !== null && !locked && (
                <div className={`kpi__delta${p < 0 ? ' kpi__delta--down' : ''}`}>
                    {p >= 0 ? '▲' : '▼'} {Math.abs(p).toFixed(1)}%
                </div>
            )}
        </div>
    );
}

// ── CustomSelect ──────────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options }: {
    value: string; onChange: (v: string) => void; options: { key: string; label: string }[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selectedLabel = options.find(o => o.key === value)?.label ?? options[0]?.label ?? '–';
    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    return (
        <div ref={ref} style={{ position:'relative' }}>
            <button type="button" onClick={() => setOpen(o => !o)} className="fg-field__input"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, cursor:'pointer', minWidth:130, textAlign:'left' }}>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{selectedLabel}</span>
                <span style={{ color:'var(--fg-3)', flexShrink:0, transform: open ? 'rotate(180deg)' : undefined, transition:'transform .2s' }}>{IcoChev}</span>
            </button>
            {open && (
                <div style={{
                    position:'absolute', top:'100%', left:0, marginTop:4, zIndex:50,
                    minWidth:'100%', borderRadius:12,
                    border:'1px solid var(--line)', background:'var(--glass-bg-strong)',
                    boxShadow:'0 8px 32px rgba(0,0,0,.5)', overflow:'hidden',
                }}>
                    {options.map(opt => (
                        <button key={opt.key} type="button" onClick={() => { onChange(opt.key); setOpen(false); }}
                            style={{
                                width:'100%', textAlign:'left', padding:'9px 14px', fontSize:12, border:'none',
                                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10,
                                background: opt.key === value ? 'rgba(167,139,250,.12)' : 'transparent',
                                color: opt.key === value ? 'var(--accent)' : 'var(--fg-2)',
                                fontWeight: opt.key === value ? 600 : 400,
                                transition:'background .15s',
                            }}>
                            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{opt.label}</span>
                            {opt.key === value && <span style={{ color:'var(--accent)', flexShrink:0 }}>{IcoCheck}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Tooltips ──────────────────────────────────────────────────────────────────
type TooltipProps = { active?: boolean; payload?: { value: number; name: string }[]; label?: string };

function TooltipBox({ label, children, hint }: { label?: string; children: React.ReactNode; hint?: string }) {
    return (
        <div style={{
            background:'var(--glass-bg-strong)', border:'1px solid var(--line)',
            borderRadius:10, padding:'8px 12px', boxShadow:'0 8px 24px rgba(0,0,0,.4)', fontSize:12,
        }}>
            {label && <p style={{ fontWeight:600, color:'var(--fg-3)', marginBottom:4 }}>{label}</p>}
            {children}
            {hint && (
                <p style={{ fontSize:10, color:'var(--fg-3)', marginTop:6, paddingTop:6, borderTop:'1px solid var(--line)', display:'flex', alignItems:'center', gap:4 }}>
                    {IcoCursor} {hint}
                </p>
            )}
        </div>
    );
}
function RevenueTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <TooltipBox label={label} hint="Clic para filtrar este período">
            {payload.map(p => <p key={p.name} style={{ fontWeight:700, color:'var(--fg-0)' }}>{p.name === 'revenue' ? fmtMoney(p.value) : `${p.value} citas`}</p>)}
        </TooltipBox>
    );
}
function EmployeeTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <TooltipBox label={label} hint="Clic para filtrar por profesional">
            <p style={{ fontWeight:700, color:'var(--fg-0)' }}>{fmtMoney(payload[0]?.value ?? 0)}</p>
        </TooltipBox>
    );
}
function ServiceTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <TooltipBox label={label}>
            {payload.map(p => <p key={p.name} style={{ fontWeight:700, color:'var(--fg-0)' }}>{p.name === 'revenue' ? fmtMoney(p.value) : `${p.value} cita${p.value !== 1 ? 's' : ''}`}</p>)}
        </TooltipBox>
    );
}
function AccumTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <TooltipBox label={label}>
            <p style={{ fontWeight:700, color:'var(--fg-0)' }}>Acumulado: {fmtMoney(payload[0]?.value ?? 0)}</p>
        </TooltipBox>
    );
}
function DonutTooltip({ active, payload }: TooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <TooltipBox hint="Clic para filtrar citas">
            <p style={{ fontWeight:700, color:'var(--fg-0)' }}>{payload[0]?.name}: {payload[0]?.value} citas</p>
        </TooltipBox>
    );
}

// ── ChartReady ────────────────────────────────────────────────────────────────
// Renders children only after the container has valid pixel dimensions, preventing
// Recharts from logging the "width(-1) height(-1)" warning on initial mount.
function ChartReady({ height, children, style }: { height: number; children: React.ReactNode; style?: React.CSSProperties }) {
    const ref = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (el.clientWidth > 0) { setReady(true); return; }
        const ro = new ResizeObserver(entries => {
            if (entries[0]?.contentRect.width > 0) { setReady(true); ro.disconnect(); }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ height, minWidth: 0, ...style }}>
            {ready && children}
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const { token, role, permissions, profileLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [businessFetchDone, setBusinessFetchDone] = useState(false);
    const [business, setBusiness] = useState<Business | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        if (profileLoading) return;
        if (role === 'employee' && !permissions.analytics) {
            router.replace('/dashboard');
        }
    }, [role, permissions, profileLoading, router]);

    // Redirect removed employees (business_id = NULL → GET /businesses/me returns null)
    useEffect(() => {
        if (!businessFetchDone || profileLoading) return;
        if (!business && role === 'employee') {
            router.replace('/dashboard');
        }
    }, [business, businessFetchDone, profileLoading, role, router]);

    const [periodData, setPeriodData]       = useState<PeriodData | null>(null);
    const [revenueData, setRevenueData]     = useState<RevenuePoint[]>([]);
    const [employeeStats, setEmployeeStats] = useState<EmployeeStat[]>([]);
    const [serviceStats, setServiceStats]   = useState<ServiceStat[]>([]);
    const [branchStats, setBranchStats]     = useState<BranchStat[]>([]);
    const [heatmapData, setHeatmapData]     = useState<HeatCell[]>([]);
    const [topClients, setTopClients]       = useState<TopClient[]>([]);
    const [clientStats, setClientStats]     = useState<ClientStats | null>(null);
    const [appointments, setAppointments]   = useState<AppRow[]>([]);

    const [loadingMain, setLoadingMain]     = useState(true);
    const [loadingCharts, setLoadingCharts] = useState(false);

    const [range, setRange]                       = useState('all');
    const [customFrom, setCustomFrom]             = useState('');
    const [customTo, setCustomTo]                 = useState('');
    const [groupBy, setGroupBy]                   = useState('day');
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [paymentType, setPaymentType]           = useState('');
    const [chartType, setChartType]               = useState<'bar' | 'line' | 'acum'>('bar');

    const [showTable, setShowTable]                   = useState(false);
    const [tableClientFilter, setTableClientFilter]   = useState<string | null>(null);
    const [tableStatusFilter, setTableStatusFilter]   = useState<string | null>(null);
    const [topClientsSortBy, setTopClientsSortBy]     = useState<'appointments' | 'revenue'>('appointments');

    const tableRef     = useRef<HTMLDivElement>(null);
    const kpiRef       = useRef<HTMLDivElement>(null);
    const revenueRef   = useRef<HTMLDivElement>(null);
    const chartsRowRef = useRef<HTMLDivElement>(null);
    const heatmapRef   = useRef<HTMLDivElement>(null);
    const topRowRef    = useRef<HTMLDivElement>(null);
    const [exportingPdf, setExportingPdf] = useState(false);

    const plan: Plan = (business?.subscription_plan as Plan) || 'gratis';
    const brandColor = business?.brand_color || '#6366f1';
    const isExpired  = business?.subscription_status === 'expired';
    const isPro     = (plan === 'pro' || plan === 'negocio') && !isExpired;
    const isNegocio = plan === 'negocio' && !isExpired;
    const h = { Authorization: `Bearer ${token}` };

    const queryParams = useCallback(() => {
        const p: Record<string, string> = { range };
        if (range === 'custom' && customFrom) p.from = customFrom;
        if (range === 'custom' && customTo)   p.to   = customTo;
        if (selectedEmployee) p.employeeId = selectedEmployee;
        if (paymentType)      p.paymentType = paymentType;
        return p;
    }, [range, customFrom, customTo, selectedEmployee, paymentType]);

    useEffect(() => {
        setMounted(true);
        if (!token) return;
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/businesses/me`, { headers: h })
            .then(r => setBusiness(r.data))
            .catch(console.error)
            .finally(() => setBusinessFetchDone(true));
        if (role === 'owner') {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, { headers: h })
                .then(r => setEmployees(r.data))
                .catch(console.error);
        }
    }, [token]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        const currentPlan = (business?.subscription_plan as Plan) || 'gratis';
        const expired = business?.subscription_status === 'expired';
        if (currentPlan === 'gratis' || expired) {
            // Free plan: fetch summary only (all-time), no advanced charts
            try {
                const sumRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/summary`, { headers: h, params: { range: 'all' } });
                setPeriodData(sumRes.data);
            } catch { /* ignore */ }
            setLoadingMain(false); setLoadingCharts(false); return;
        }
        setLoadingCharts(true);
        const p = queryParams();
        const gbp = { ...p, groupBy };
        try {
            const [sumRes, revRes, empRes, svcRes, listRes, heatRes, topRes, branchRes, clientRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/summary`,            { headers: h, params: p }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/revenue-over-time`,  { headers: h, params: gbp }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/by-employee`,        { headers: h, params: p }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/by-service`,         { headers: h, params: p }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/appointments-list`,  { headers: h, params: p }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/heatmap`,            { headers: h, params: p }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/top-clients`,        { headers: h, params: p }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/by-branch`,          { headers: h, params: p }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/client-stats`,       { headers: h, params: p }),
            ]);
            setPeriodData(sumRes.data);
            setRevenueData(revRes.data);
            setEmployeeStats(empRes.data);
            setServiceStats(svcRes.data);
            setAppointments(Array.isArray(listRes.data) ? listRes.data : (listRes.data?.data ?? []));
            setHeatmapData(heatRes.data);
            setTopClients(topRes.data);
            setBranchStats(branchRes.data);
            setClientStats(clientRes.data);
            setTableClientFilter(null);
            setTableStatusFilter(null);
        } catch (err) { console.error(err); }
        finally { setLoadingMain(false); setLoadingCharts(false); }
    }, [token, queryParams, groupBy, business]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const projectedRevenue = useMemo(() => {
        if (range !== 'this_month' || !periodData?.current) return null;
        const now = new Date();
        const ms = startOfMonth(now);
        const me = endOfMonth(now);
        const elapsed = Math.max(1, differenceInDays(now, ms) + 1);
        const total   = differenceInDays(me, ms) + 1;
        return (periodData.current.revenue_total / elapsed) * total;
    }, [range, periodData]);

    const insights = useMemo(() => {
        if (!periodData) return [];
        const curr = periodData.current;
        const prev = periodData.previous;
        const list: { icon: React.ElementType; text: string; color: string; action?: () => void; actionLabel?: string }[] = [];

        if (prev?.revenue_total > 0) {
            const g = pct(curr.revenue_total, prev.revenue_total);
            if (g !== null) list.push({ icon: g >= 0 ? IcoTrendingUp : IcoTrendingDown, text: `Ingresos ${g >= 0 ? '+' : ''}${g.toFixed(1)}% vs el período anterior`, color: g >= 0 ? '#22c55e' : '#ef4444' });
        }
        if (curr.pending_count > 0) {
            const pendingTotal = appointments.filter(a => a.payment_status === 'pending').reduce((s, a) => s + Number(a.service_price), 0);
            list.push({
                icon: IcoZap,
                text: `${curr.pending_count} señas pendientes — ${fmtMoney(pendingTotal)} por cobrar`,
                color: '#f59e0b',
                action: () => { setTableStatusFilter('pending'); setShowTable(true); setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); },
                actionLabel: 'Ver citas',
            });
        }
        if (serviceStats.length > 0) {
            const top = serviceStats.reduce((a, b) => a.revenue > b.revenue ? a : b, serviceStats[0]);
            const totalRev = serviceStats.reduce((s, x) => s + x.revenue, 0);
            const sp = totalRev > 0 ? Math.round((top.revenue / totalRev) * 100) : 0;
            list.push({ icon: IcoStar, text: `"${top.service_name}" genera el ${sp}% de tus ingresos`, color: '#a855f7' });
        }
        if (heatmapData.length > 0) {
            const peak = heatmapData.reduce((a, b) => a.count > b.count ? a : b);
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            list.push({ icon: IcoClock, text: `Tu horario pico: ${days[peak.day_of_week]} a las ${peak.hour}:00 h`, color: brandColor });
        }
        if (employeeStats.length > 1) {
            const top = employeeStats[0];
            list.push({
                icon: IcoUsers,
                text: `${top.employee_name} lidera con ${fmtMoney(top.revenue)} en ingresos`,
                color: '#06b6d4',
                action: () => { setSelectedEmployee(String(top.employee_id)); },
                actionLabel: 'Filtrar',
            });
        }
        if (clientStats) {
            const total = clientStats.total_unique_clients ?? 0;
            if (total > 0 && clientStats.returning_clients > 0) {
                const rPct = Math.round((clientStats.returning_clients / total) * 100);
                list.push({ icon: IcoUserCheck, text: `${rPct}% de tus clientes son recurrentes (${clientStats.returning_clients} de ${total})`, color: '#22c55e' });
            }
        }
        return list;
    }, [periodData, appointments, serviceStats, heatmapData, employeeStats, clientStats, brandColor]);

    const sortedTopClients = useMemo(() => {
        return [...topClients].sort((a, b) =>
            topClientsSortBy === 'revenue' ? b.revenue - a.revenue : b.total_appointments - a.total_appointments
        );
    }, [topClients, topClientsSortBy]);

    const filteredAppointments = useMemo(() => {
        return appointments.filter(a => {
            if (tableClientFilter && a.client_email !== tableClientFilter) return false;
            if (tableStatusFilter && a.payment_status !== tableStatusFilter) return false;
            return true;
        });
    }, [appointments, tableClientFilter, tableStatusFilter]);

    const exportCSV = () => {
        const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const row = (...cells: unknown[]) => cells.map(q).join(',');
        const blank = () => '';
        const curr = periodData?.current;
        const rangeLabel = RANGES.find(r => r.key === range)?.label || range;
        const sections: string[] = [
            row(`RESUMEN — ${business?.name ?? ''} — ${rangeLabel}`), blank(),
            row('Métrica', 'Valor'),
            row('Total citas', curr?.total_appointments ?? 0),
            row('Cobradas (seña)', curr?.paid_count ?? 0),
            row('Pago completo', curr?.full_payment_count ?? 0),
            row('Pendientes', curr?.pending_count ?? 0),
            row('Sin cobro', curr?.free_count ?? 0),
            row('Ingresos totales', `$${Number(curr?.revenue_total ?? 0).toFixed(2)}`),
            row('Ticket promedio', `$${Number(curr?.avg_ticket ?? 0).toFixed(2)}`),
            row('Clientes nuevos', clientStats?.new_clients ?? 0),
            row('Clientes recurrentes', clientStats?.returning_clients ?? 0), blank(),
        ];
        if (employeeStats.length) {
            sections.push(row('POR PROFESIONAL'), blank(), row('Profesional', 'Citas', 'Cobradas', 'Ingresos'),
                ...employeeStats.map(e => row(e.employee_name, e.total_appointments, e.paid_count, `$${Number(e.revenue).toFixed(2)}`)), blank());
        }
        if (serviceStats.length) {
            sections.push(row('POR SERVICIO'), blank(), row('Servicio', 'Citas', 'Cobradas', 'Ingresos'),
                ...serviceStats.map(s => row(s.service_name, s.total_appointments, s.paid_count, `$${Number(s.revenue).toFixed(2)}`)), blank());
        }
        if (topClients.length) {
            sections.push(row('TOP CLIENTES'), blank(), row('Cliente', 'Email', 'Citas', 'Ingresos'),
                ...topClients.map(c => row(c.client_name, c.client_email, c.total_appointments, `$${Number(c.revenue).toFixed(2)}`)), blank());
        }
        sections.push(row('CITAS DETALLADAS'), blank(), row('Fecha','Cliente','Email','Servicio','Profesional','Estado','Monto'),
            ...appointments.map(a => row(format(parseISO(a.start_time),'dd/MM/yyyy HH:mm',{locale:es}), a.client_name, a.client_email, a.service_name, a.employee_name, STATUS_LABEL[a.payment_status]||a.payment_status, `$${Number(a.amount).toFixed(2)}`)));
        const csv = sections.join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `reporte-${business?.name?.replace(/\s+/g,'-') ?? 'negocio'}-${format(new Date(),'yyyy-MM-dd')}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const exportExcel = () => {
        const wb = XLSX.utils.book_new();
        const curr = periodData?.current;
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
            ['Métrica','Valor'],['Total citas',curr?.total_appointments??0],['Cobradas (seña)',curr?.paid_count??0],
            ['Pago completo',curr?.full_payment_count??0],['Pendientes',curr?.pending_count??0],['Sin cobro',curr?.free_count??0],
            ['Ingresos',`$${Number(curr?.revenue_total??0).toFixed(2)}`],['Ticket promedio',`$${Number(curr?.avg_ticket??0).toFixed(2)}`],
            ['Clientes nuevos',clientStats?.new_clients??0],['Clientes recurrentes',clientStats?.returning_clients??0],
        ]), 'Resumen');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
            ['Fecha','Cliente','Email','Servicio','Profesional','Estado','Monto'],
            ...appointments.map(a => [format(parseISO(a.start_time),'dd/MM/yyyy HH:mm',{locale:es}),a.client_name,a.client_email,a.service_name,a.employee_name,STATUS_LABEL[a.payment_status]||a.payment_status,Number(a.amount)]),
        ]), 'Citas');
        if (employeeStats.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Profesional','Citas','Cobradas','Ingresos'],...employeeStats.map(e=>[e.employee_name,e.total_appointments,e.paid_count,Number(e.revenue)])]), 'Por profesional');
        if (serviceStats.length)  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Servicio','Citas','Cobradas','Ingresos'],...serviceStats.map(s=>[s.service_name,s.total_appointments,s.paid_count,Number(s.revenue)])]), 'Por servicio');
        if (topClients.length)    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Cliente','Email','Citas','Ingresos'],...topClients.map(c=>[c.client_name,c.client_email,c.total_appointments,Number(c.revenue)])]), 'Top clientes');
        XLSX.writeFile(wb, `reporte-${format(new Date(),'yyyy-MM-dd')}.xlsx`);
    };

    const exportPDF = async () => {
        setExportingPdf(true);
        const htmlEl  = document.documentElement;
        const wasDark = htmlEl.classList.contains('dark');
        if (wasDark) { htmlEl.classList.remove('dark'); await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))); }
        try {
            const [{ toCanvas }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
            const pdf    = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
            const pageW  = pdf.internal.pageSize.getWidth();
            const pageH  = pdf.internal.pageSize.getHeight();
            const margin = 12;
            const contentW = pageW - margin * 2;
            const rangeLabel = RANGES.find(r => r.key === range)?.label || range;
            const biz = business?.name || 'Negocio';
            const hdrColor = brandColor.startsWith('#') ? [parseInt(brandColor.slice(1,3),16),parseInt(brandColor.slice(3,5),16),parseInt(brandColor.slice(5,7),16)] : [99,102,241];
            pdf.setFillColor(hdrColor[0],hdrColor[1],hdrColor[2]);
            pdf.rect(0,0,pageW,26,'F');
            pdf.setTextColor(255,255,255);
            pdf.setFontSize(15); pdf.setFont('helvetica','bold');
            pdf.text(biz,margin,12);
            pdf.setFontSize(8.5); pdf.setFont('helvetica','normal');
            pdf.text(`Reporte de métricas · ${rangeLabel} · ${format(new Date(),"dd 'de' MMMM yyyy",{locale:es})}`,margin,20);
            let y = 32;
            const addSection = async (ref: React.RefObject<HTMLDivElement | null>, label?: string) => {
                if (!ref.current) return;
                if (label) { pdf.setTextColor(148,163,184); pdf.setFontSize(7); pdf.setFont('helvetica','bold'); pdf.text(label.toUpperCase(),margin,y+1); y += 5; }
                const canvas = await toCanvas(ref.current, { pixelRatio:2, backgroundColor:'#ffffff', filter:(node) => !(node as Element).classList?.contains('recharts-tooltip-wrapper') });
                const imgW = contentW, imgH = (canvas.height * imgW) / canvas.width;
                if (y + imgH > pageH - margin) { pdf.addPage(); y = margin; }
                pdf.addImage(canvas.toDataURL('image/png'),'PNG',margin,y,imgW,imgH);
                y += imgH + 5;
            };
            await addSection(kpiRef);
            await addSection(revenueRef,'Ingresos en el tiempo');
            await addSection(chartsRowRef);
            await addSection(heatmapRef,'Mapa de ocupación');
            await addSection(topRowRef,'Top clientes');
            pdf.save(`reporte-${biz.replace(/\s+/g,'-')}-${format(new Date(),'yyyy-MM-dd')}.pdf`);
        } finally { if (wasDark) htmlEl.classList.add('dark'); setExportingPdf(false); }
    };

    const curr = periodData?.current;
    const prev = periodData?.previous;
    const conversionRate = curr && curr.total_appointments > 0 ? ((curr.paid_count + (curr.full_payment_count ?? 0)) / curr.total_appointments) * 100 : 0;

    const donutData = curr ? [
        { name:'Cobrado',       value:curr.paid_count,              color:STATUS_COLORS.paid,         status:'paid' },
        { name:'Pago completo', value:curr.full_payment_count??0,   color:STATUS_COLORS.full_payment, status:'full_payment' },
        { name:'Pendiente',     value:curr.pending_count,           color:STATUS_COLORS.pending,      status:'pending' },
        { name:'Sin cobro',     value:curr.free_count,              color:STATUS_COLORS.not_required, status:'not_required' },
    ].filter(d => d.value > 0) : [];

    const fmtPeriodLabel = (period: string) => {
        try {
            const d = new Date(period);
            if (groupBy === 'year')  return format(d, 'yyyy');
            if (groupBy === 'month') return format(d, 'MMM yy', { locale: es });
            if (groupBy === 'week')  return `${format(d, 'dd/MM')}`;
            return format(d, 'dd/MM');
        } catch { return period; }
    };
    const chartData = revenueData.map(p => ({ ...p, label: fmtPeriodLabel(p.period) }));

    const cumulativeData = useMemo(() => {
        let running = 0;
        return chartData.map(d => ({ ...d, cumulative: (running += d.revenue) }));
    }, [chartData]);

    const heatMap: Record<string, number> = {};
    heatmapData.forEach(h => { heatMap[`${h.day_of_week}-${h.hour}`] = h.count; });
    const heatMax = Math.max(...heatmapData.map(h => h.count), 1);

    const handleChartBarClick = (data: RevenuePoint & { label: string }) => {
        if (!data?.period) return;
        const d = new Date(data.period);
        let from = '', to = '';
        if (groupBy === 'day') { from = to = format(d,'yyyy-MM-dd'); }
        else if (groupBy === 'week') { from = format(startOfWeek(d,{weekStartsOn:1}),'yyyy-MM-dd'); to = format(endOfWeek(d,{weekStartsOn:1}),'yyyy-MM-dd'); }
        else if (groupBy === 'month') { from = format(startOfMonth(d),'yyyy-MM-dd'); to = format(endOfMonth(d),'yyyy-MM-dd'); }
        else { from = `${format(d,'yyyy')}-01-01`; to = `${format(d,'yyyy')}-12-31`; }
        setRange('custom'); setCustomFrom(from); setCustomTo(to);
    };

    const handleDonutClick = (data: { name: string; status: string }) => {
        const s = data?.status;
        if (!s) return;
        if (tableStatusFilter === s) { setTableStatusFilter(null); } else {
            setTableStatusFilter(s); setShowTable(true);
            setTimeout(() => tableRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
        }
    };
    const handleEmployeeBarClick = (data: EmployeeStat) => {
        if (!data?.employee_id) return;
        setSelectedEmployee(prev => prev === String(data.employee_id) ? '' : String(data.employee_id));
    };
    const handleClientRowClick = (client: TopClient) => {
        if (tableClientFilter === client.client_email) { setTableClientFilter(null); } else {
            setTableClientFilter(client.client_email); setShowTable(true);
            setTimeout(() => tableRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
        }
    };

    const hasLocalFilters = tableClientFilter !== null || tableStatusFilter !== null;
    const activeEmployeeName = employees.find(e => String(e.id) === selectedEmployee)?.name || employees.find(e => String(e.id) === selectedEmployee)?.email;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="dash-page">

            {/* Header */}
            <div className="dash-page__head">
                <div className="dash-page__title-wrap">
                    <div className="dash-page__eyebrow"><span className="dash-page__eyebrow-dot"/>Análisis</div>
                    <h1 className="dash-page__title">Métricas</h1>
                    <p className="dash-page__sub">Analizá el rendimiento de tu negocio</p>
                </div>
                <div className="dash-page__actions">
                    {selectedEmployee && (
                        <button className="dbtn" onClick={() => setSelectedEmployee('')}
                            style={{ display:'flex', alignItems:'center', gap:5, color:'var(--accent)' }}>
                            {IcoX} {activeEmployeeName}
                        </button>
                    )}
                    {isPro && (
                        <button className="dbtn" onClick={exportCSV}
                            style={{ display:'flex', alignItems:'center', gap:5 }}>
                            {IcoDownload} CSV
                        </button>
                    )}
                    {isNegocio && (<>
                        <button className="dbtn" onClick={exportExcel}
                            style={{ display:'flex', alignItems:'center', gap:5 }}>
                            {IcoExcel} Excel
                        </button>
                        <button className="dbtn" onClick={exportPDF} disabled={exportingPdf}
                            style={{ display:'flex', alignItems:'center', gap:5 }}>
                            {exportingPdf ? <>{IcoSpin} Generando…</> : <>{IcoPrint} PDF</>}
                        </button>
                    </>)}
                    {!isPro && <PlanBadge label="Pro" />}
                </div>
            </div>

            {/* Plan info banner */}
            {!isPro && (
                <div style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:24,
                    padding:'12px 16px', borderRadius:14,
                    background:'linear-gradient(135deg, rgba(139,92,246,.12) 0%, rgba(99,102,241,.08) 100%)',
                    border:'1px solid rgba(139,92,246,.25)',
                }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <span style={{
                            display:'flex', alignItems:'center', justifyContent:'center',
                            width:30, height:30, borderRadius:8, flexShrink:0,
                            background:'rgba(139,92,246,.15)', color:'#a78bfa',
                        }}>{IcoLock}</span>
                        <div>
                            <p style={{ fontSize:12, fontWeight:700, color:'var(--fg-0)', marginBottom:1 }}>Plan Gratis — Vista limitada</p>
                            <p style={{ fontSize:11, color:'var(--fg-3)', lineHeight:1.4 }}>
                                Solo ves el total del mes actual. <strong style={{ color:'#a78bfa', fontWeight:600 }}>Pro</strong> desbloquea filtros, gráficas y heatmap · <strong style={{ color:'#a78bfa', fontWeight:600 }}>Negocio</strong> suma reportes por empleado y exportación Excel/PDF.
                            </p>
                        </div>
                    </div>
                    <a href="/dashboard/settings" style={{
                        flexShrink:0, padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:600,
                        background:'rgba(139,92,246,.2)', color:'#c4b5fd',
                        border:'1px solid rgba(139,92,246,.3)', textDecoration:'none', whiteSpace:'nowrap',
                        transition:'background .15s',
                    }}>Ver planes</a>
                </div>
            )}

            {/* Filter bar */}
            <div style={{ position:'relative' }}>
                <div className="filter-form" style={{ opacity: !isPro ? 0.6 : 1, pointerEvents: !isPro ? 'none' : undefined }}>
                    <div className="fg-field">
                        <span className="fg-field__label">Período</span>
                        <CustomSelect value={range} onChange={v => { setRange(v); if (v !== 'custom') { setCustomFrom(''); setCustomTo(''); } }} options={RANGES} />
                    </div>
                    {range === 'custom' && (<>
                        <div className="fg-field">
                            <span className="fg-field__label">Desde</span>
                            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="fg-field__input" />
                        </div>
                        <div className="fg-field">
                            <span className="fg-field__label">Hasta</span>
                            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="fg-field__input" />
                        </div>
                    </>)}
                    <div className="fg-field">
                        <span className="fg-field__label">Agrupar</span>
                        <CustomSelect value={groupBy} onChange={setGroupBy} options={GROUP_BY} />
                    </div>
                    {isNegocio && employees.length > 0 && (
                        <div className="fg-field">
                            <span className="fg-field__label">Profesional</span>
                            <CustomSelect value={selectedEmployee} onChange={setSelectedEmployee}
                                options={[{ key:'', label:'Todos' },...employees.map(e => ({ key:String(e.id), label:e.name||e.email }))]} />
                        </div>
                    )}
                    <div className="fg-field">
                        <span className="fg-field__label">Estado pago</span>
                        <CustomSelect value={paymentType} onChange={setPaymentType}
                            options={[{key:'',label:'Todos'},{key:'paid',label:'Cobrado'},{key:'full_payment',label:'Pago completo'},{key:'pending',label:'Pendiente'},{key:'free',label:'Sin cobro'}]} />
                    </div>
                    {isPro && (
                        <button className="dbtn dbtn--primary" onClick={fetchData} style={{ alignSelf:'flex-end' }}>
                            Aplicar
                        </button>
                    )}
                </div>
                {!isPro && <LockOverlay label="Plan Pro" />}
            </div>

            {/* KPI Cards */}
            <div ref={kpiRef} className="kpi-grid kpi-grid--3">
                <KPICard label="Total citas" icon={IcoCalendar} tone="purple"
                    value={loadingMain ? '–' : String(curr?.total_appointments ?? 0)}
                    delta={curr && prev ? { val:curr.total_appointments, ref:prev.total_appointments } : null}
                    onClick={isPro ? () => { setShowTable(true); setTimeout(() => tableRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100); } : undefined} />
                <KPICard label="Ingresos totales" icon={IcoDollar} tone="green"
                    value={loadingMain ? '–' : fmtMoney(curr?.revenue_total ?? 0)}
                    delta={curr && prev ? { val:curr.revenue_total, ref:prev.revenue_total } : null}
                    onClick={isPro ? () => { setTableStatusFilter('paid'); setShowTable(true); setTimeout(() => tableRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),100); } : undefined} />
                <KPICard label="Ticket promedio" icon={IcoTrendingUp} tone="cyan"
                    value={loadingMain ? '–' : fmtMoney(curr?.avg_ticket ?? 0)} locked={!isPro} />
                <KPICard label="Tasa de cobro" icon={IcoBarChart} tone="purple"
                    value={loadingMain ? '–' : `${conversionRate.toFixed(0)}%`}
                    sub={!loadingMain ? `${(curr?.paid_count??0)+(curr?.full_payment_count??0)} de ${curr?.total_appointments??0} cobradas` : undefined}
                    locked={!isPro} />
                <KPICard label="Proyección del mes" icon={IcoZap} tone="orange"
                    value={loadingMain ? '–' : projectedRevenue != null ? fmtMoney(projectedRevenue) : '—'}
                    sub={projectedRevenue != null ? 'Estimado al fin de mes' : 'Solo disponible en "Este mes"'}
                    locked={!isPro} />
                <KPICard label="Clientes únicos" icon={IcoUserPlus} tone="rose"
                    value={loadingMain ? '–' : String(clientStats?.total_unique_clients ?? 0)}
                    sub={!loadingMain && clientStats ? `${clientStats.new_clients} nuevos · ${clientStats.returning_clients} recurrentes` : undefined}
                    locked={!isPro} />
            </div>

            {/* Insights */}
            {isPro && insights.length > 0 && (
                <div style={{ marginBottom:24 }}>
                    <div className="dash-page__eyebrow" style={{ marginBottom:10 }}>
                        <span style={{ color:'#fbbf24' }}>{IcoLightbulb}</span>
                        Insights automáticos
                    </div>
                    <div className="insights">
                        {insights.map((ins, i) => (
                            <div key={i} className="insight">
                                <div className="insight__icon">
                                    <ins.icon size={15} />
                                </div>
                                <div>
                                    <p className="insight__text">{ins.text}</p>
                                    {ins.action && (
                                        <button onClick={ins.action} className="insight__cta" style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                                            {ins.actionLabel} →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Time series chart */}
            <div ref={revenueRef} className="gcard" style={{ position:'relative', overflow:'hidden', marginBottom:24 }}>
                {!isPro && <LockOverlay label="Plan Pro" />}
                <div className="gcard__head">
                    <div>
                        <h3 className="gcard__title">Ingresos en el tiempo</h3>
                        <p className="gcard__sub">
                            {RANGES.find(r => r.key === range)?.label}
                            {isPro && <span> · Clic en barra para filtrar ese período</span>}
                        </p>
                    </div>
                    <div className="tab-pills">
                        {(['bar','line','acum'] as const).map(t => (
                            <button key={t} onClick={() => setChartType(t)} className={chartType === t ? 'is-active' : ''}>
                                {t === 'bar' ? 'Barras' : t === 'line' ? 'Línea' : 'Área'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="gcard__body">
                {mounted && (
                    <ChartReady height={260}>
                        {loadingCharts ? (
                            <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <div style={{ width:24, height:24, borderRadius:'50%', border:`2px solid ${brandColor}`, borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }} />
                            </div>
                        ) : chartData.length === 0 ? (
                            <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--fg-3)' }}>Sin datos para este período</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'bar' ? (
                                    <BarChart data={chartData} margin={{top:4,right:4,left:0,bottom:4}}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="label" tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} />
                                        <YAxis tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={55} />
                                        <Tooltip cursor={{fill:'rgba(255,255,255,0.04)'}} content={<RevenueTooltip />} />
                                        <Bar dataKey="revenue" fill={brandColor} radius={[6,6,0,0]}
                                            activeBar={{fill:brandColor,fillOpacity:0.75}} style={{cursor:'pointer'}}
                                            onClick={(data) => handleChartBarClick(data as unknown as RevenuePoint & {label:string})} />
                                    </BarChart>
                                ) : chartType === 'line' ? (
                                    <LineChart data={chartData} margin={{top:4,right:4,left:0,bottom:4}}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="label" tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} />
                                        <YAxis tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={55} />
                                        <Tooltip content={<RevenueTooltip />} />
                                        <Line dataKey="revenue" stroke={brandColor} strokeWidth={2.5} dot={{r:4,fill:brandColor,strokeWidth:0,cursor:'pointer'}}
                                            activeDot={{r:6,fill:brandColor,style:{cursor:'pointer'}}}
                                            onClick={(data) => handleChartBarClick((data as unknown as {payload: RevenuePoint & {label:string}})?.payload)} />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={cumulativeData} margin={{top:4,right:4,left:0,bottom:4}}>
                                        <defs>
                                            <linearGradient id="accumGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={brandColor} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={brandColor} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="label" tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} />
                                        <YAxis tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} width={55} />
                                        <Tooltip content={<AccumTooltip />} />
                                        <Area dataKey="cumulative" stroke={brandColor} strokeWidth={2.5} fill="url(#accumGrad)"
                                            dot={{r:4,fill:brandColor,strokeWidth:0}} activeDot={{r:6,fill:brandColor}} />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        )}
                    </ChartReady>
                )}
                </div>
            </div>

            {/* Row: payment donut + employee chart */}
            <div ref={chartsRowRef} className="two-col">
                {/* Donut */}
                <div className="gcard" style={{ position:'relative', overflow:'hidden' }}>
                    {!isPro && <LockOverlay label="Plan Pro" />}
                    <div className="gcard__head">
                        <div>
                            <h3 className="gcard__title">Estado de pagos</h3>
                            <p className="gcard__sub">Distribución del período{isPro && <span> · Clic en segmento para filtrar</span>}</p>
                        </div>
                    </div>
                    <div className="gcard__body">
                    {mounted && (
                        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                            <ChartReady height={140} style={{ width:140, flexShrink:0 }}>
                                {donutData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={donutData} dataKey="value" cx="50%" cy="50%"
                                                innerRadius={42} outerRadius={65} paddingAngle={3} strokeWidth={0}
                                                style={{cursor:'pointer'}}
                                                onClick={(data) => handleDonutClick(data as unknown as {name:string;status:string})}>
                                                {donutData.map((d, i) => (
                                                    <Cell key={i} fill={d.color} opacity={tableStatusFilter ? (tableStatusFilter === d.status ? 1 : 0.35) : 1} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<DonutTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        <div style={{ width:80, height:80, borderRadius:'50%', border:'4px solid rgba(255,255,255,.08)' }} />
                                    </div>
                                )}
                            </ChartReady>
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                {[{label:'Cobrado',val:curr?.paid_count??0,color:STATUS_COLORS.paid,status:'paid'},{label:'Pago completo',val:curr?.full_payment_count??0,color:STATUS_COLORS.full_payment,status:'full_payment'},{label:'Pendiente',val:curr?.pending_count??0,color:STATUS_COLORS.pending,status:'pending'},{label:'Sin cobro',val:curr?.free_count??0,color:STATUS_COLORS.not_required,status:'not_required'}].map(({ label, val, color, status }) => (
                                    <button key={label} onClick={() => handleDonutClick({name:label,status})}
                                        style={{
                                            display:'flex', alignItems:'center', gap:8, border:'none', cursor:'pointer',
                                            borderRadius:8, padding:'4px 6px', margin:'-4px -6px',
                                            background: tableStatusFilter === status ? 'rgba(255,255,255,.06)' : 'transparent',
                                            transition:'background .15s',
                                        }}>
                                        <div style={{ width:10, height:10, borderRadius:'50%', flexShrink:0, background:color }} />
                                        <span style={{ fontSize:11, color:'var(--fg-3)', width:88, textAlign:'left' }}>{label}</span>
                                        <span style={{ fontSize:14, fontWeight:700, color:'var(--fg-0)' }}>{val}</span>
                                        {tableStatusFilter === status && <span style={{ color:'var(--fg-3)', marginLeft:2 }}>{IcoX}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>
                </div>

                {/* Employee chart */}
                <div className="gcard" style={{ position:'relative', overflow:'hidden' }}>
                    {!isNegocio && <LockOverlay label="Plan Negocio" />}
                    <div className="gcard__head">
                        <div>
                            <h3 className="gcard__title">Por profesional</h3>
                            <p className="gcard__sub">Ingresos por persona{isNegocio && <span> · Clic para filtrar</span>}</p>
                        </div>
                    </div>
                    <div className="gcard__body">
                    {mounted && (
                        <ChartReady height={160}>
                            {employeeStats.length === 0
                                ? <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--fg-3)' }}>Sin datos</div>
                                : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={employeeStats.slice(0,5)} layout="vertical" margin={{top:0,right:20,left:0,bottom:0}}>
                                            <XAxis type="number" tick={{fontSize:10,fill:'#666'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
                                            <YAxis type="category" dataKey="employee_name" tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} width={80} />
                                            <Tooltip cursor={{fill:'rgba(255,255,255,0.04)'}} content={<EmployeeTooltip />} />
                                            <Bar dataKey="revenue" radius={[0,6,6,0]} style={{cursor:'pointer'}} activeBar={{fill:brandColor,fillOpacity:0.75}}
                                                onClick={(data) => handleEmployeeBarClick(data as unknown as EmployeeStat)}>
                                                {employeeStats.slice(0,5).map((e,i) => (
                                                    <Cell key={i} fill={brandColor} opacity={selectedEmployee ? (selectedEmployee === String(e.employee_id) ? 1 : 0.35) : 1} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                        </ChartReady>
                    )}
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div ref={heatmapRef} className="gcard" style={{ position:'relative', overflow:'hidden', marginBottom:24 }}>
                {!isPro && <LockOverlay label="Plan Pro" />}
                <div className="gcard__head">
                    <div>
                        <h3 className="gcard__title">Mapa de ocupación</h3>
                        <p className="gcard__sub">Demanda por hora y día de la semana</p>
                    </div>
                </div>
                <div className="gcard__body">
                {mounted && (
                    <div style={{ overflowX:'auto' }}>
                        <div style={{ minWidth:480 }}>
                            <div style={{ display:'grid', gap:4, marginBottom:4, gridTemplateColumns:'36px repeat(7, 1fr)' }}>
                                <div />
                                {WEEK_DAYS.map(d => (
                                    <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'var(--fg-3)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{d}</div>
                                ))}
                            </div>
                            {HEATMAP_HOURS.map(hour => (
                                <div key={hour} style={{ display:'grid', gap:4, marginBottom:4, gridTemplateColumns:'36px repeat(7, 1fr)' }}>
                                    <div style={{ fontSize:10, color:'var(--fg-3)', textAlign:'right', paddingRight:8, lineHeight:'20px' }}>{hour}:00</div>
                                    {DOW_ORDER.map(dow => {
                                        const count = heatMap[`${dow}-${hour}`] || 0;
                                        const intensity = count / heatMax;
                                        return (
                                            <div key={dow} title={count ? `${count} cita${count!==1?'s':''} · ${WEEK_DAYS[DOW_ORDER.indexOf(dow)]} ${hour}:00` : `Sin citas · ${WEEK_DAYS[DOW_ORDER.indexOf(dow)]} ${hour}:00`}
                                                style={{ height:20, borderRadius:6, border:'1px solid rgba(255,255,255,.04)', cursor:'default', background: count ? `${brandColor}${Math.round(Math.max(0.2,intensity)*255).toString(16).padStart(2,'0')}` : 'transparent' }} />
                                        );
                                    })}
                                </div>
                            ))}
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, justifyContent:'flex-end' }}>
                                <span style={{ fontSize:10, color:'var(--fg-3)' }}>Menos</span>
                                {[0.15,0.35,0.55,0.75,1].map(op => (
                                    <div key={op} style={{ width:16, height:16, borderRadius:4, background:`${brandColor}${Math.round(op*255).toString(16).padStart(2,'0')}` }} />
                                ))}
                                <span style={{ fontSize:10, color:'var(--fg-3)' }}>Más</span>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>

            {/* Row: top clients + by branch */}
            <div ref={topRowRef} className="two-col">
                {/* Top clients */}
                <div className="gcard" style={{ position:'relative', overflow:'hidden' }}>
                    {!isPro && <LockOverlay label="Plan Pro" />}
                    <div className="gcard__head">
                        <div>
                            <h3 className="gcard__title">Top clientes</h3>
                            <p className="gcard__sub">
                                {topClientsSortBy === 'appointments' ? 'Por cantidad de citas' : 'Por ingresos generados'}
                                {isPro && <span> · Clic para filtrar citas</span>}
                            </p>
                        </div>
                        <div className="tab-pills">
                            {(['appointments','revenue'] as const).map(s => (
                                <button key={s} onClick={() => setTopClientsSortBy(s)} className={topClientsSortBy === s ? 'is-active' : ''}>
                                    {s === 'appointments' ? 'Citas' : 'Ingresos'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="gcard__body">
                    {sortedTopClients.length === 0 ? (
                        <p style={{ textAlign:'center', fontSize:13, color:'var(--fg-3)', padding:'24px 0' }}>Sin datos</p>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {sortedTopClients.map((client, i) => {
                                const maxVal = topClientsSortBy === 'revenue' ? (sortedTopClients[0]?.revenue||1) : (sortedTopClients[0]?.total_appointments||1);
                                const barW = topClientsSortBy === 'revenue' ? (client.revenue/maxVal)*100 : (client.total_appointments/maxVal)*100;
                                const isSelected = tableClientFilter === client.client_email;
                                return (
                                    <button key={i} onClick={() => handleClientRowClick(client)}
                                        style={{
                                            display:'flex', alignItems:'center', gap:10, border:'none', cursor:'pointer',
                                            borderRadius:10, padding:'6px 8px', margin:'-6px -8px',
                                            background: isSelected ? 'rgba(167,139,250,.08)' : 'transparent',
                                            textAlign:'left', transition:'background .15s',
                                        }}>
                                        <span style={{ fontSize:10, fontWeight:700, color:'var(--fg-3)', width:16, textAlign:'right', flexShrink:0 }}>{i+1}</span>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                                                <span style={{ fontSize:12, fontWeight:600, color: isSelected ? 'var(--accent)' : 'var(--fg-0)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                    {client.client_name}
                                                </span>
                                                <span style={{ fontSize:11, fontWeight:700, color:'var(--fg-2)', flexShrink:0, marginLeft:8 }}>
                                                    {topClientsSortBy === 'revenue' ? fmtMoney(client.revenue) : `${client.total_appointments} cita${client.total_appointments!==1?'s':''}`}
                                                </span>
                                            </div>
                                            <div style={{ height:5, background:'rgba(255,255,255,.08)', borderRadius:99, overflow:'hidden' }}>
                                                <div style={{ height:'100%', borderRadius:99, width:`${barW}%`, background: isSelected ? 'var(--accent)' : brandColor, transition:'width .5s' }} />
                                            </div>
                                        </div>
                                        {isSelected && <span style={{ color:'var(--fg-3)', flexShrink:0 }}>{IcoX}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    </div>
                </div>

                {/* By branch */}
                <div className="gcard" style={{ position:'relative', overflow:'hidden' }}>
                    {!isNegocio && <LockOverlay label="Plan Negocio" />}
                    <div className="gcard__head">
                        <div>
                            <h3 className="gcard__title">Por sucursal</h3>
                            <p className="gcard__sub">Rendimiento por sede</p>
                        </div>
                    </div>
                    <div className="gcard__body">
                    {branchStats.length === 0 ? (
                        <p style={{ textAlign:'center', fontSize:13, color:'var(--fg-3)', padding:'24px 0' }}>Sin datos</p>
                    ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                            {branchStats.map((branch, i) => {
                                const maxRev = Math.max(...branchStats.map(b => b.revenue), 1);
                                const barW = branch.revenue > 0 ? (branch.revenue/maxRev)*100 : 0;
                                return (
                                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                                        <div style={{ width:32, height:32, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`${brandColor}15`, color:brandColor }}>
                                            {IcoPin}
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6, gap:8 }}>
                                                <span style={{ fontSize:12, fontWeight:600, color:'var(--fg-0)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{branch.branch_name}</span>
                                                <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                                                    <span style={{ fontSize:10, color:'var(--fg-3)' }}>{branch.total_appointments} cita{branch.total_appointments!==1?'s':''}</span>
                                                    <span style={{ fontSize:12, fontWeight:700, color:'var(--fg-1)' }}>{fmtMoney(branch.revenue)}</span>
                                                </div>
                                            </div>
                                            <div style={{ height:5, background:'rgba(255,255,255,.08)', borderRadius:99, overflow:'hidden' }}>
                                                <div style={{ height:'100%', borderRadius:99, width:`${barW}%`, background:brandColor, transition:'width .5s' }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* By service */}
            <div className="gcard" style={{ position:'relative', overflow:'hidden', marginBottom:24 }}>
                {!isNegocio && <LockOverlay label="Plan Negocio" />}
                <div className="gcard__head">
                    <div>
                        <h3 className="gcard__title">Por servicio</h3>
                        <p className="gcard__sub">Citas e ingresos por servicio</p>
                    </div>
                </div>
                <div className="gcard__body">
                {mounted && (
                    <ChartReady height={200}>
                        {serviceStats.length === 0
                            ? <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--fg-3)' }}>Sin datos</div>
                            : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={serviceStats.slice(0,8)} layout="vertical" margin={{top:0,right:20,left:0,bottom:0}}>
                                        <XAxis type="number" tick={{fontSize:10,fill:'#666'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`} />
                                        <YAxis type="category" dataKey="service_name" tick={{fontSize:11,fill:'#666'}} axisLine={false} tickLine={false} width={110} />
                                        <Tooltip cursor={{fill:'rgba(255,255,255,0.04)'}} content={<ServiceTooltip />} />
                                        <Bar dataKey="total_appointments" fill={`${brandColor}60`} radius={[0,6,6,0]} name="citas" activeBar={{fill:brandColor,fillOpacity:0.45}} />
                                        <Bar dataKey="revenue" fill={brandColor} radius={[0,6,6,0]} name="revenue" activeBar={{fill:brandColor,fillOpacity:0.75}} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                    </ChartReady>
                )}
                </div>
            </div>

            {/* Data table */}
            <div ref={tableRef} className="gcard" style={{ position:'relative', padding:0, overflow:'hidden' }}>
                {!isPro && <LockOverlay label="Plan Pro" />}
                <div className="gcard__head" style={{ borderBottom:'1px solid var(--line)' }}>
                    <div>
                        <h3 className="gcard__title">Detalle de citas</h3>
                        <p className="gcard__sub">
                            {hasLocalFilters ? `${filteredAppointments.length} de ${appointments.length} registros` : `${appointments.length} registros`}
                        </p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        {hasLocalFilters && (
                            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                                {tableClientFilter && (
                                    <FilterChip label={topClients.find(c => c.client_email === tableClientFilter)?.client_name || tableClientFilter} onRemove={() => setTableClientFilter(null)} />
                                )}
                                {tableStatusFilter && (
                                    <FilterChip label={STATUS_LABEL[tableStatusFilter] || tableStatusFilter} onRemove={() => setTableStatusFilter(null)} />
                                )}
                                <button onClick={() => { setTableClientFilter(null); setTableStatusFilter(null); }}
                                    style={{ fontSize:10, fontWeight:600, color:'oklch(0.65 0.22 25)', background:'none', border:'none', cursor:'pointer' }}>
                                    Limpiar
                                </button>
                            </div>
                        )}
                        <button onClick={() => setShowTable(t => !t)}
                            style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:'var(--fg-3)', background:'none', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
                            {IcoList} {showTable ? 'Ocultar' : 'Ver tabla'}
                        </button>
                    </div>
                </div>
                {showTable && filteredAppointments.length > 0 && (
                    <div style={{ overflowX:'auto' }}>
                        <table className="dtable">
                            <thead>
                                <tr>
                                    {['Fecha','Cliente','Servicio','Profesional','Estado','Monto'].map(col => <th key={col}>{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.slice(0,200).map(a => (
                                    <tr key={a.id}>
                                        <td style={{ whiteSpace:'nowrap', color:'var(--fg-2)' }}>{format(parseISO(a.start_time),'dd/MM/yy HH:mm',{locale:es})}</td>
                                        <td>
                                            <button onClick={() => handleClientRowClick({client_name:a.client_name,client_email:a.client_email,total_appointments:0,paid_count:0,revenue:0})}
                                                style={{ fontWeight:500, color:'var(--fg-1)', background:'none', border:'none', cursor:'pointer', fontSize:'inherit' }}>
                                                {a.client_name}
                                            </button>
                                        </td>
                                        <td style={{ color:'var(--fg-2)' }}>{a.service_name}</td>
                                        <td style={{ color:'var(--fg-2)' }}>{a.employee_name}</td>
                                        <td>
                                            <button onClick={() => { const s = a.payment_status; setTableStatusFilter(prev => prev === s ? null : s); }}
                                                style={{ padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, cursor:'pointer', border:'none', background:`${STATUS_COLORS[a.payment_status]}18`, color:STATUS_COLORS[a.payment_status] }}>
                                                {STATUS_LABEL[a.payment_status] || a.payment_status}
                                            </button>
                                        </td>
                                        <td style={{ fontWeight:700, color:'var(--fg-0)' }}>{fmtMoney(a.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAppointments.length > 200 && (
                            <p style={{ textAlign:'center', fontSize:11, color:'var(--fg-3)', padding:'12px 0' }}>Mostrando 200 de {filteredAppointments.length} registros. Exportá para ver todos.</p>
                        )}
                    </div>
                )}
                {showTable && filteredAppointments.length === 0 && (
                    <p style={{ textAlign:'center', fontSize:13, color:'var(--fg-3)', padding:32 }}>
                        {hasLocalFilters ? 'Sin resultados para el filtro aplicado.' : 'Sin citas en este período.'}
                    </p>
                )}
            </div>
        </div>
    );
}
