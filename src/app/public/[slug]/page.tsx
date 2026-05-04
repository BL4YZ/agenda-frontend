'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Clock, MapPin, ChevronRight } from 'lucide-react';

type Service = { id: number; name: string; duration_minutes: number; price: string };
type Business = { name: string; logo_url?: string | null; brand_color?: string | null };
type Branch = { id: number; name: string; address: string | null };

function ServiceSkeleton() {
    return (
        <div className="divide-y divide-slate-100 dark:divide-white/5">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 py-4 px-1 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-lg w-2/3" />
                        <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-lg w-1/3" />
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex-shrink-0" />
                </div>
            ))}
        </div>
    );
}

function PublicBusinessContent() {
    const [services, setServices] = useState<Service[]>([]);
    const [business, setBusiness] = useState<Business | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;

    const brandColor = business?.brand_color || '#6366f1';

    useEffect(() => {
        if (!slug) return;
        const branchParam = searchParams.get('branch');
        Promise.all([
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}`),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/services`),
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/branches`),
        ]).then(([businessRes, servicesRes, branchesRes]) => {
            setBusiness(businessRes.data);
            setServices(servicesRes.data);
            const branchList: Branch[] = branchesRes.data;
            setBranches(branchList);
            if (branchParam) {
                const matched = branchList.find(b => b.id === parseInt(branchParam));
                if (matched) setSelectedBranch(matched);
            }
        }).catch(() => setError('No se pudo cargar la información del negocio.'))
            .finally(() => setLoading(false));
    }, [slug, searchParams]);

    const hasBranches = branches.length > 0;
    const showBranchSelector = hasBranches && !selectedBranch;

    const bookingUrl = (service: Service) => {
        const base = `/public/${slug}/book?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}&servicePrice=${service.price}`;
        return selectedBranch ? `${base}&branchId=${selectedBranch.id}` : base;
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c0c0f] px-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#18181c] flex flex-col">

            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${brandColor} 0%, ${brandColor}99 100%)` }}>
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.08))' }} />

                <div className="relative px-6 pt-12 pb-20 max-w-xl mx-auto text-center">
                    {loading ? (
                        <div className="w-20 h-20 rounded-3xl bg-white/20 animate-pulse mx-auto mb-5" />
                    ) : business?.logo_url ? (
                        <img src={business.logo_url} alt={business.name}
                            className="h-20 w-auto object-contain mx-auto mb-5 rounded-2xl shadow-2xl" />
                    ) : (
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 text-white text-3xl font-bold shadow-2xl select-none">
                            {business?.name?.charAt(0) ?? '?'}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-7 bg-white/20 rounded-xl w-40 mx-auto animate-pulse" />
                            <div className="h-4 bg-white/15 rounded-lg w-56 mx-auto animate-pulse" />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-3">{business?.name}</h1>
                            {selectedBranch ? (
                                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full">
                                    <MapPin size={13} />
                                    {selectedBranch.name}
                                    <button onClick={() => setSelectedBranch(null)}
                                        className="ml-1 text-white/60 hover:text-white transition-colors leading-none">✕</button>
                                </div>
                            ) : (
                                <p className="text-white/65 text-sm">
                                    {showBranchSelector ? 'Seleccioná una sucursal para continuar' : 'Reservá tu turno en línea, fácil y rápido'}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Content sheet */}
            <div className="rounded-t-[2rem] -mt-8 flex-1">
                <div className="max-w-xl mx-auto px-5 pt-10 pb-10">

                    {/* Branch selector */}
                    {!loading && showBranchSelector && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Sucursales</p>
                            <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {branches.map(branch => (
                                    <button key={branch.id} onClick={() => setSelectedBranch(branch)}
                                        className="w-full flex items-center gap-3 py-4 px-1 text-left group transition-all first:pt-0 last:pb-0">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${brandColor}18` }}>
                                            <MapPin size={17} style={{ color: brandColor }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{branch.name}</p>
                                            {branch.address && (
                                                <p className="text-xs text-slate-400 mt-0.5 truncate">{branch.address}</p>
                                            )}
                                        </div>
                                        <ChevronRight size={15} className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div>
                            <div className="h-3 bg-slate-100 dark:bg-white/5 rounded w-20 mb-5 animate-pulse" />
                            <ServiceSkeleton />
                        </div>
                    )}

                    {/* Services */}
                    {!loading && !showBranchSelector && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">
                                {selectedBranch ? `Servicios — ${selectedBranch.name}` : 'Servicios disponibles'}
                            </p>
                            {services.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 dark:text-slate-500 text-sm">Este negocio aún no tiene servicios publicados.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {services.map(service => (
                                        <a key={service.id} href={bookingUrl(service)}
                                            className="flex items-center gap-4 py-4 px-1 group transition-all first:pt-0 last:pb-0">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-base"
                                                style={{ background: brandColor, boxShadow: `0 6px 18px ${brandColor}38` }}>
                                                {service.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-white text-sm">{service.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock size={11} />{service.duration_minutes} min
                                                    </span>
                                                    <span className="text-xs font-bold" style={{ color: brandColor }}>
                                                        ${parseFloat(service.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-200"
                                                style={{ background: `${brandColor}15` }}>
                                                <ChevronRight size={15} style={{ color: brandColor }} />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto text-center pb-8 pt-2">
                <p className="text-xs text-slate-400 dark:text-slate-600">
                    Reservas online con{' '}
                    <span className="font-semibold text-slate-500 dark:text-slate-500">MiAgenda</span>
                </p>
            </div>
        </div>
    );
}

export default function PublicBusinessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0c0c0f]">
                <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        }>
            <PublicBusinessContent />
        </Suspense>
    );
}
