'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';
import type { AxiosError } from 'axios';

/* ── Types ──────────────────────────────────────────────────────────────────── */

export type FeatureFlags = {
    showModalities:   boolean;
    showExpenses:     boolean;
    showCommissions:  boolean;
    showTeamReports:  boolean;
};

export type BusinessType =
    | 'barberia' | 'peluqueria' | 'estetica'
    | 'manicura' | 'consultorio' | 'fitness' | 'otro';

export type Business = {
    id: number;
    name: string;
    slug: string;
    business_type: BusinessType | null;
    feature_flags: Partial<FeatureFlags>;
    has_seen_onboarding: boolean;
    subscription_plan: 'gratis' | 'pro' | 'negocio';
    subscription_status: string;
    subscription_ends_at: string | null;
    trial_ends_at: string | null;
    payment_mode: string;
    deposit_percentage: number;
    mp_connected: boolean;
    mp_currency: string;
    logo_url: string | null;
    brand_color: string | null;
};

export type OnboardingProgress = {
    hasService: boolean | null;
    hasSchedule: boolean | null;
};

type BusinessContextValue = {
    business: Business | null;
    featureFlags: FeatureFlags;
    isOnboarded: boolean;
    onboardingProgress: OnboardingProgress;
    loading: boolean;
    refetch: () => void;
    updateBusiness: (data: Partial<Business & { feature_flags: FeatureFlags }>) => Promise<void>;
};

/* ── Presets ─────────────────────────────────────────────────────────────────── */

export const TYPE_PRESETS: Record<BusinessType, FeatureFlags> = {
    barberia:    { showModalities: true,  showExpenses: true,  showCommissions: true,  showTeamReports: true  },
    peluqueria:  { showModalities: true,  showExpenses: true,  showCommissions: true,  showTeamReports: true  },
    estetica:    { showModalities: true,  showExpenses: true,  showCommissions: true,  showTeamReports: true  },
    manicura:    { showModalities: true,  showExpenses: true,  showCommissions: true,  showTeamReports: true  },
    consultorio: { showModalities: false, showExpenses: true,  showCommissions: false, showTeamReports: true  },
    fitness:     { showModalities: false, showExpenses: true,  showCommissions: false, showTeamReports: false },
    otro:        { showModalities: false, showExpenses: true,  showCommissions: false, showTeamReports: false },
};

export const DEFAULT_FLAGS: FeatureFlags = {
    showModalities: false, showExpenses: true, showCommissions: false, showTeamReports: false,
};

function resolveFlags(business: Business | null): FeatureFlags {
    if (!business) return DEFAULT_FLAGS;
    const isPro = (business.subscription_plan === 'pro' || business.subscription_plan === 'negocio')
        && business.subscription_status !== 'expired';
    const stored = business.feature_flags ?? {};
    const merged = { ...DEFAULT_FLAGS, ...stored };
    if (!isPro) {
        return { ...merged, showModalities: false, showExpenses: false, showCommissions: false, showTeamReports: false };
    }
    return merged;
}

/* ── Context ─────────────────────────────────────────────────────────────────── */

const BusinessContext = createContext<BusinessContextValue>({
    business: null,
    featureFlags: DEFAULT_FLAGS,
    isOnboarded: false,
    onboardingProgress: { hasService: null, hasSchedule: null },
    loading: true,
    refetch: () => {},
    updateBusiness: async () => {},
});

export function BusinessProvider({ children }: { children: React.ReactNode }) {
    const { token, userId, isLoading: authLoading } = useAuth();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading]   = useState(true);
    const [hasService, setHasService]   = useState<boolean | null>(null);
    const [hasSchedule, setHasSchedule] = useState<boolean | null>(null);

    const fetch = useCallback(() => {
        if (authLoading) return; // wait for AuthContext to finish reading localStorage
        if (!token) { setLoading(false); return; }
        setLoading(true);
        api.get<Business>('/businesses/me')
            .then(res => setBusiness(res.data))
            .catch(() => setBusiness(null))
            .finally(() => setLoading(false));
    }, [token, authLoading]);

    useEffect(() => { fetch(); }, [fetch]);

    const businessId = business?.id ?? null;

    // Fetch onboarding progress once business is loaded
    useEffect(() => {
        if (!businessId) return;
        api.get('/services')
            .then(r => setHasService(Array.isArray(r.data) && r.data.length > 0))
            .catch(() => setHasService(false));
    }, [businessId]);

    useEffect(() => {
        if (!userId || !businessId) return;
        api.get(`/schedules/${userId}`)
            .then(r => setHasSchedule(Array.isArray(r.data) && r.data.length > 0))
            .catch((err: AxiosError) => {
                if (err.response?.status === 403) setHasSchedule(null);
                else setHasSchedule(false);
            });
    }, [userId, businessId]);

    const updateBusiness = useCallback(async (data: Partial<Business & { feature_flags: FeatureFlags }>) => {
        const res = await api.patch<Business>('/businesses/me', data);
        setBusiness(prev => prev ? { ...prev, ...res.data } : res.data);
    }, []);

    return (
        <BusinessContext.Provider value={{
            business,
            featureFlags: resolveFlags(business),
            isOnboarded: !!(business?.has_seen_onboarding || business?.business_type),
            onboardingProgress: { hasService, hasSchedule },
            loading,
            refetch: fetch,
            updateBusiness,
        }}>
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() { return useContext(BusinessContext); }
