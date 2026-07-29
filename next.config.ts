import type { NextConfig } from "next";

/* ── Allowlists de terceros ────────────────────────────────────────────────────
   Solo los dominios que el proyecto usa de verdad. Se evita `https:` genérico:
   con una allowlist acotada, una XSS no puede cargar un script ni montar un
   iframe desde cualquier dominio.                                            */
const CLARITY = "https://www.clarity.ms https://*.clarity.ms";
const GOOGLE_AUTH = "https://accounts.google.com https://apis.google.com";
const GOOGLE_MAPS = "https://maps.googleapis.com https://maps.gstatic.com";
const GOOGLE_FONTS = "https://fonts.googleapis.com https://fonts.gstatic.com";
const FONTSHARE = "https://api.fontshare.com https://cdn.fontshare.com";
const MERCADOPAGO = "https://*.mercadopago.com https://*.mercadolibre.com";

// La API vive en otro host (Railway). Sin esto, connect-src bloquea todo axios.
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval': concesión conocida del App Router — la
  // hidratación de Next.js inyecta scripts inline sin nonce en este setup.
  // El trabajo real contra XSS/clickjacking lo hacen la allowlist de terceros,
  // object-src 'none' y frame-ancestors.
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${CLARITY} ${GOOGLE_AUTH} ${GOOGLE_MAPS}`,
  `style-src 'self' 'unsafe-inline' ${GOOGLE_FONTS} ${FONTSHARE}`,
  `font-src 'self' data: ${GOOGLE_FONTS} ${FONTSHARE}`,
  // Los negocios suben logos/portadas a hosts arbitrarios (images.remotePatterns
  // ya permite cualquier https), así que img-src tiene que acompañar.
  "img-src 'self' data: blob: https:",
  `connect-src 'self' ${API} ${CLARITY} ${GOOGLE_AUTH} ${GOOGLE_MAPS}`,
  `frame-src 'self' ${GOOGLE_AUTH} ${MERCADOPAGO}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // ⚠️ Si alguna vez se quiere que los negocios embeban su página de reservas
  // en su propio sitio, ESTA es la línea a relajar (y X-Frame-Options abajo).
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Redundante con frame-ancestors, para navegadores viejos que no leen CSP3.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Sin `preload`: entrar a la lista de precarga de los navegadores es difícil
  // de revertir. max-age + includeSubDomains da el beneficio sin ese compromiso.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // La app no usa ninguna de estas APIs; si una dependencia comprometida las
  // pidiera, el navegador ya las bloquea a nivel de política.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://127.0.0.1:3001', 'http://127.0.0.1'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
