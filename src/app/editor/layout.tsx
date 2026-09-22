'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * The builder lives outside /dashboard so it gets the whole viewport — the
 * dashboard's sidebar and topbar would eat the canvas. The preview route is
 * nested here too, which is what lets the iframe share the session.
 */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
