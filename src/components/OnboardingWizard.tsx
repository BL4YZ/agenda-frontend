'use client';

import React, { useCallback, useEffect, useReducer } from 'react';
import { createPortal } from 'react-dom';
import { useBusiness, TYPE_PRESETS, type BusinessType, type FeatureFlags } from '@/context/BusinessContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

import StepLayout from './onboarding/StepLayout';
import WelcomeStep from './onboarding/WelcomeStep';
import BusinessStep from './onboarding/BusinessStep';
import FeaturesStep from './onboarding/FeaturesStep';
import ServiceStep from './onboarding/ServiceStep';
import ScheduleStep, { type DayState } from './onboarding/ScheduleStep';
import PaymentStep from './onboarding/PaymentStep';
import DoneStep from './onboarding/DoneStep';

/* ── Constants ──────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'novu_wizard_progress';
const TOTAL_STEPS = 6;

const DEFAULT_DAYS: DayState[] = [
  { enabled: false, start: '09:00', end: '18:00' }, // 0 Dom
  { enabled: true,  start: '09:00', end: '18:00' }, // 1 Lun
  { enabled: true,  start: '09:00', end: '18:00' }, // 2 Mar
  { enabled: true,  start: '09:00', end: '18:00' }, // 3 Mié
  { enabled: true,  start: '09:00', end: '18:00' }, // 4 Jue
  { enabled: true,  start: '09:00', end: '18:00' }, // 5 Vie
  { enabled: false, start: '09:00', end: '18:00' }, // 6 Sáb
];

/* ── State & Reducer ────────────────────────────────────────────────────────── */

type WizardState = {
  currentStep: number;
  businessName: string;
  selectedType: BusinessType | null;
  businessNameError: string;
  flags: FeatureFlags;
  serviceName: string;
  serviceDuration: string;
  servicePrice: string;
  scheduleDays: DayState[];
  allowCash: boolean;
  allowTransfer: boolean;
  saving: boolean;
  error: string;
};

type Action =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_BIZ_NAME'; name: string }
  | { type: 'SET_BIZ_TYPE'; btype: BusinessType; flags: FeatureFlags }
  | { type: 'SET_NAME_ERROR'; err: string }
  | { type: 'TOGGLE_FLAG'; key: keyof FeatureFlags }
  | { type: 'SET_SERVICE_NAME'; v: string }
  | { type: 'SET_SERVICE_DURATION'; v: string }
  | { type: 'SET_SERVICE_PRICE'; v: string }
  | { type: 'TOGGLE_DAY'; i: number }
  | { type: 'SET_DAY_START'; i: number; v: string }
  | { type: 'SET_DAY_END'; i: number; v: string }
  | { type: 'TOGGLE_CASH' }
  | { type: 'TOGGLE_TRANSFER' }
  | { type: 'SET_SAVING'; v: boolean }
  | { type: 'SET_ERROR'; v: string }
  | { type: 'RESTORE'; s: Partial<WizardState> };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'SET_STEP':         return { ...state, currentStep: action.step };
    case 'SET_BIZ_NAME':     return { ...state, businessName: action.name, businessNameError: '' };
    case 'SET_BIZ_TYPE':     return { ...state, selectedType: action.btype, flags: action.flags };
    case 'SET_NAME_ERROR':   return { ...state, businessNameError: action.err };
    case 'TOGGLE_FLAG':      return { ...state, flags: { ...state.flags, [action.key]: !state.flags[action.key] } };
    case 'SET_SERVICE_NAME': return { ...state, serviceName: action.v };
    case 'SET_SERVICE_DURATION': return { ...state, serviceDuration: action.v };
    case 'SET_SERVICE_PRICE': return { ...state, servicePrice: action.v };
    case 'TOGGLE_DAY':       return { ...state, scheduleDays: state.scheduleDays.map((d, i) => i === action.i ? { ...d, enabled: !d.enabled } : d) };
    case 'SET_DAY_START':    return { ...state, scheduleDays: state.scheduleDays.map((d, i) => i === action.i ? { ...d, start: action.v } : d) };
    case 'SET_DAY_END':      return { ...state, scheduleDays: state.scheduleDays.map((d, i) => i === action.i ? { ...d, end: action.v } : d) };
    case 'TOGGLE_CASH':      return { ...state, allowCash: !state.allowCash };
    case 'TOGGLE_TRANSFER':  return { ...state, allowTransfer: !state.allowTransfer };
    case 'SET_SAVING':       return { ...state, saving: action.v };
    case 'SET_ERROR':        return { ...state, error: action.v };
    case 'RESTORE':          return { ...state, ...action.s };
    default:                 return state;
  }
}

function initState(business: { name?: string; business_type?: BusinessType | null; feature_flags?: Partial<FeatureFlags>; mp_connected?: boolean } | null): WizardState {
  const btype = business?.business_type ?? null;
  const flags = btype ? { ...TYPE_PRESETS[btype], ...business?.feature_flags } : {
    showExpenses: false, showModalities: false, showCommissions: false, showTeamReports: false,
  };
  return {
    currentStep: 0,
    businessName: business?.name ?? '',
    selectedType: btype,
    businessNameError: '',
    flags: flags as FeatureFlags,
    serviceName: '',
    serviceDuration: '60',
    servicePrice: '',
    scheduleDays: [...DEFAULT_DAYS],
    allowCash: false,
    allowTransfer: false,
    saving: false,
    error: '',
  };
}

/* ── Persist helpers ────────────────────────────────────────────────────────── */

type PersistedKeys = 'currentStep' | 'businessName' | 'selectedType' | 'flags' | 'serviceName' | 'serviceDuration' | 'servicePrice' | 'scheduleDays' | 'allowCash' | 'allowTransfer';

function persist(state: WizardState) {
  const keys: PersistedKeys[] = ['currentStep','businessName','selectedType','flags','serviceName','serviceDuration','servicePrice','scheduleDays','allowCash','allowTransfer'];
  const subset = Object.fromEntries(keys.map(k => [k, state[k]]));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(subset)); } catch { /* noop */ }
}

function loadPersisted(): Partial<WizardState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/* ── Component ──────────────────────────────────────────────────────────────── */

export default function OnboardingWizard() {
  const { business, refetch, updateBusiness } = useBusiness();
  const { userId } = useAuth();

  const [state, dispatch] = useReducer(reducer, business, initState);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = loadPersisted();
    if (saved) dispatch({ type: 'RESTORE', s: saved });
  }, []);

  // Persist on step change
  useEffect(() => {
    persist(state);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentStep]);

  const go = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
    persist({ ...state, currentStep: step });
  }, [state]);

  /* ── Step handlers ────────────────────────────────────────────────────────── */

  const handleStep1Continue = async () => {
    const name = state.businessName.trim();
    if (!name) { dispatch({ type: 'SET_NAME_ERROR', err: 'El nombre es obligatorio.' }); return; }
    if (!state.selectedType) return;
    dispatch({ type: 'SET_SAVING', v: true });
    try {
      if (!business) {
        await api.post('/businesses', { name });
        await refetch();
      } else if (business.name !== name) {
        await updateBusiness({ name } as never);
      }
      go(2);
    } catch {
      dispatch({ type: 'SET_ERROR', v: 'No se pudo guardar el nombre del negocio.' });
    } finally {
      dispatch({ type: 'SET_SAVING', v: false });
    }
  };

  const handleStep2Continue = () => go(3);

  const handleStep3Continue = async () => {
    const name = state.serviceName.trim();
    if (!name) return;
    dispatch({ type: 'SET_SAVING', v: true });
    try {
      await api.post('/services', {
        name,
        duration_minutes: parseInt(state.serviceDuration) || 60,
        price: parseFloat(state.servicePrice) || 0,
      });
      go(4);
    } catch {
      dispatch({ type: 'SET_ERROR', v: 'No se pudo crear el servicio.' });
    } finally {
      dispatch({ type: 'SET_SAVING', v: false });
    }
  };

  const handleStep4Continue = async () => {
    if (!userId) { go(5); return; }
    dispatch({ type: 'SET_SAVING', v: true });
    try {
      const schedule = state.scheduleDays
        .map((d, i) => d.enabled ? { day_of_week: i, start_time: d.start + ':00', end_time: d.end + ':00' } : null)
        .filter(Boolean);
      await api.put(`/schedules/${userId}`, { schedule });
      go(5);
    } catch {
      dispatch({ type: 'SET_ERROR', v: 'No se pudo guardar el horario.' });
    } finally {
      dispatch({ type: 'SET_SAVING', v: false });
    }
  };

  const handleStep5Continue = async () => {
    const isPro = business?.subscription_plan === 'pro' || business?.subscription_plan === 'negocio';
    if (!isPro) { go(6); return; }
    dispatch({ type: 'SET_SAVING', v: true });
    try {
      await api.put('/payments/settings', {
        payment_mode: 'disabled',
        allow_cash: state.allowCash,
        allow_transfer: state.allowTransfer,
      });
      go(6);
    } catch {
      dispatch({ type: 'SET_ERROR', v: 'No se pudieron guardar los ajustes de cobro.' });
    } finally {
      dispatch({ type: 'SET_SAVING', v: false });
    }
  };

  const handleFinish = async () => {
    dispatch({ type: 'SET_SAVING', v: true });
    try {
      await updateBusiness({
        business_type: state.selectedType as never,
        feature_flags: state.flags,
        has_seen_onboarding: true,
      } as never);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
      await refetch();
    } catch {
      dispatch({ type: 'SET_ERROR', v: 'No se pudo finalizar la configuración.' });
    } finally {
      dispatch({ type: 'SET_SAVING', v: false });
    }
  };

  const handleMpConnect = async () => {
    try {
      const res = await api.get<{ url: string }>('/payments/mp/connect');
      window.location.href = res.data.url;
    } catch { /* noop */ }
  };

  /* ── Render ───────────────────────────────────────────────────────────────── */

  const plan = (business?.subscription_plan ?? 'gratis') as 'gratis' | 'pro' | 'negocio';
  const isPro = plan === 'pro' || plan === 'negocio';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const publicUrl = business?.slug ? `${appUrl}/public/${business.slug}` : '';

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <WelcomeStep onStart={() => go(1)} />;

      case 1:
        return (
          <StepLayout currentStep={1} totalSteps={TOTAL_STEPS} stepLabel="Tu negocio" canSkip={false} onSkip={() => {}} saving={state.saving}>
            <BusinessStep
              businessName={state.businessName}
              onNameChange={v => dispatch({ type: 'SET_BIZ_NAME', name: v })}
              nameError={state.businessNameError}
              selectedType={state.selectedType}
              onTypeSelect={t => dispatch({ type: 'SET_BIZ_TYPE', btype: t, flags: isPro ? TYPE_PRESETS[t] : { showExpenses: false, showModalities: false, showCommissions: false, showTeamReports: false } })}
              onContinue={handleStep1Continue}
              onBack={() => go(0)}
              saving={state.saving}
            />
          </StepLayout>
        );

      case 2:
        return (
          <StepLayout currentStep={2} totalSteps={TOTAL_STEPS} stepLabel="Funciones" canSkip={false} onSkip={() => {}} saving={state.saving}>
            <FeaturesStep
              flags={state.flags}
              isPro={isPro}
              onToggle={key => dispatch({ type: 'TOGGLE_FLAG', key })}
              onContinue={handleStep2Continue}
              onBack={() => go(1)}
            />
          </StepLayout>
        );

      case 3:
        return (
          <StepLayout currentStep={3} totalSteps={TOTAL_STEPS} stepLabel="Primer servicio" canSkip={true} onSkip={() => go(4)} saving={state.saving}>
            <ServiceStep
              serviceName={state.serviceName}
              serviceDuration={state.serviceDuration}
              servicePrice={state.servicePrice}
              onNameChange={v => dispatch({ type: 'SET_SERVICE_NAME', v })}
              onDurationChange={v => dispatch({ type: 'SET_SERVICE_DURATION', v })}
              onPriceChange={v => dispatch({ type: 'SET_SERVICE_PRICE', v })}
              onContinue={handleStep3Continue}
              onSkip={() => go(4)}
              onBack={() => go(2)}
              saving={state.saving}
            />
          </StepLayout>
        );

      case 4:
        return (
          <StepLayout currentStep={4} totalSteps={TOTAL_STEPS} stepLabel="Tus horarios" canSkip={true} onSkip={() => go(5)} saving={state.saving}>
            <ScheduleStep
              days={state.scheduleDays}
              onToggleDay={i => dispatch({ type: 'TOGGLE_DAY', i })}
              onStartChange={(i, v) => dispatch({ type: 'SET_DAY_START', i, v })}
              onEndChange={(i, v) => dispatch({ type: 'SET_DAY_END', i, v })}
              onContinue={handleStep4Continue}
              onSkip={() => go(5)}
              onBack={() => go(3)}
              saving={state.saving}
            />
          </StepLayout>
        );

      case 5:
        return (
          <StepLayout currentStep={5} totalSteps={TOTAL_STEPS} stepLabel="Cobros" canSkip={true} onSkip={() => go(6)} saving={state.saving}>
            <PaymentStep
              plan={plan}
              mpConnected={!!business?.mp_connected}
              allowCash={state.allowCash}
              allowTransfer={state.allowTransfer}
              onCashToggle={() => dispatch({ type: 'TOGGLE_CASH' })}
              onTransferToggle={() => dispatch({ type: 'TOGGLE_TRANSFER' })}
              onMpConnect={handleMpConnect}
              onContinue={handleStep5Continue}
              onSkip={() => go(6)}
              onBack={() => go(4)}
              saving={state.saving}
            />
          </StepLayout>
        );

      case 6:
        return (
          <StepLayout currentStep={6} totalSteps={TOTAL_STEPS} stepLabel="¡Listo!" canSkip={false} onSkip={() => {}} saving={state.saving}>
            <DoneStep
              businessName={state.businessName || business?.name || ''}
              publicUrl={publicUrl}
              plan={plan}
              onFinish={handleFinish}
              saving={state.saving}
            />
          </StepLayout>
        );

      default:
        return null;
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--line-strong)',
        borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        width: '100%',
        maxWidth: 520,
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '32px 28px',
      }}>
        {state.error && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 16,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            fontSize: 13, color: '#ef4444',
          }}>
            {state.error}
          </div>
        )}
        {renderStep()}
      </div>
    </div>,
    document.body,
  );
}
