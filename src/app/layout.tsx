import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import GoogleProvider from "@/components/GoogleProvider";

const inter = Inter({ subsets: ["latin"] });

const interTight = Inter_Tight({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
    variable: "--font-inter-tight",
    display: "swap",
});

// Replaces the Google Fonts @import for JetBrains Mono in system.css.
// Satoshi + General Sans (Fontshare) are still loaded via @import in system.css
// until font files are downloaded for next/font/local.
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "MiAgenda",
    description: "Gestión inteligente para tu negocio",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                {/* Prevent flash of wrong theme */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme'),p=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';if((t||p)==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
                    }}
                />
            </head>
            <body className={`${inter.className} ${jetbrainsMono.variable} ${interTight.variable} bg-slate-50 dark:bg-[#07090f] text-slate-900 dark:text-white antialiased transition-colors duration-300`}>
                {/* Ambient glow orbs */}
                <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                    <div className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full bg-violet-200/40 dark:bg-violet-900/15 blur-[120px] transition-colors duration-700" />
                    <div className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] rounded-full bg-blue-200/40 dark:bg-indigo-900/15 blur-[120px] transition-colors duration-700" />
                </div>
                <GoogleProvider>
                    <AuthProvider>
                        <ThemeProvider>
                            {children}
                        </ThemeProvider>
                    </AuthProvider>
                </GoogleProvider>
            </body>
        </html>
    );
}
