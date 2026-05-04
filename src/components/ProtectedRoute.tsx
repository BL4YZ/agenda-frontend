'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Si la carga ha terminado y no hay token, redirigir
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    // Mostrar un loader mientras se verifica la sesión
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">Verificando sesión...</p>
            </div>
        );
    }

    // Si hay token, mostrar el contenido protegido
    if (token) {
        return <>{children}</>;
    }

    // Si no hay token y no está cargando, no muestra nada mientras redirige
    return null;
}
