/**
 * Layout for all /public/* routes.
 * Overrides the root body background so the landing page
 * has full control over its own colours via .pl-page / data-pl-theme.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        // Reset the ambient glow orbs and background injected by RootLayout
        background: 'transparent',
        position: 'relative',
        zIndex: 0,
      }}
    >
      {children}
    </div>
  );
}
