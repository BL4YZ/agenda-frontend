'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible]   = useState(false);
    const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef    = useRef<number | null>(null);
    const prevPath  = useRef(pathname);

    useEffect(() => {
        if (pathname === prevPath.current) return;
        prevPath.current = pathname;

        // Clear any ongoing animation
        if (timerRef.current)  clearTimeout(timerRef.current);
        if (rafRef.current)    cancelAnimationFrame(rafRef.current);

        // Start: jump to 20% instantly, then ease toward 85%
        setProgress(20);
        setVisible(true);

        let current = 20;
        const ease = () => {
            if (current < 85) {
                current = Math.min(current + (85 - current) * 0.06, 85);
                setProgress(current);
                rafRef.current = requestAnimationFrame(ease);
            }
        };
        rafRef.current = requestAnimationFrame(ease);

        // Complete after a short delay (simulates page done)
        timerRef.current = setTimeout(() => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setProgress(100);
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
        }, 400);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (rafRef.current)   cancelAnimationFrame(rafRef.current);
        };
    }, [pathname]);

    if (!visible && progress === 0) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            height: 2, pointerEvents: 'none',
        }}>
            <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                transition: progress === 100 ? 'width 0.15s ease, opacity 0.3s ease' : 'width 0.1s linear',
                opacity: visible ? 1 : 0,
                boxShadow: '0 0 8px rgba(139,92,246,0.6)',
                borderRadius: '0 2px 2px 0',
            }} />
        </div>
    );
}
