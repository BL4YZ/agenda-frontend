'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type Permissions = Record<string, boolean>;

interface AuthContextType {
    token: string | null;
    role: string | null;
    permissions: Permissions;
    businessPlan: string | null;
    planSuspended: boolean;
    planBlocked: boolean;
    isLoading: boolean;
    profileLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    refetchProfile: () => void;
}

function decodeJwtRole(token: string): string | null {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload?.user?.role ?? null;
    } catch { return null; }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<Permissions>({});
    const [businessPlan, setBusinessPlan] = useState<string | null>(null);
    const [planSuspended, setPlanSuspended] = useState(false);
    const [planBlocked, setPlanBlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const router = useRouter();
    const interceptorRef = useRef<number | null>(null);

    const fetchProfile = useCallback(async (tok: string) => {
        setProfileLoading(true);
        try {
            const res = await axios.get('http://localhost:3000/api/users/me', {
                headers: { Authorization: `Bearer ${tok}` },
            });
            setRole(res.data.role ?? null);
            setPermissions(res.data.permissions ?? {});
            setBusinessPlan(res.data.business_plan ?? null);
            setPlanSuspended(res.data.plan_suspended ?? false);
            setPlanBlocked(res.data.plan_blocked ?? false);
        } catch {
            // If the request fails, keep role from JWT and empty permissions
        } finally {
            setProfileLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setRole(null);
        setPermissions({});
        setBusinessPlan(null);
        setPlanSuspended(false);
        setPlanBlocked(false);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        router.push('/login');
    }, [router]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setRole(decodeJwtRole(storedToken));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            fetchProfile(storedToken);
        }
        setIsLoading(false);
    }, [fetchProfile]);

    useEffect(() => {
        interceptorRef.current = axios.interceptors.response.use(
            res => res,
            err => {
                if (err.response?.status === 401) {
                    setToken(null);
                    setRole(null);
                    setPermissions({});
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                    router.push('/login');
                }
                return Promise.reject(err);
            }
        );
        return () => {
            if (interceptorRef.current !== null) {
                axios.interceptors.response.eject(interceptorRef.current);
            }
        };
    }, [router]);

    const login = useCallback((newToken: string) => {
        setToken(newToken);
        setRole(decodeJwtRole(newToken));
        setPermissions({});
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        fetchProfile(newToken);
        router.push('/dashboard');
    }, [router, fetchProfile]);

    const refetchProfile = useCallback(() => {
        if (token) fetchProfile(token);
    }, [token, fetchProfile]);

    const value = { token, role, permissions, businessPlan, planSuspended, planBlocked, isLoading, profileLoading, login, logout, refetchProfile };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
