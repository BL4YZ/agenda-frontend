'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  if (!CLIENT_ID) {
    // En desarrollo sin clave configurada, simplemente pasa los children
    return <>{children}</>;
  }
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}
