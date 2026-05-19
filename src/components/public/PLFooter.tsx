import type { Shop } from '@/types/public';

const IgIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
  </svg>
);
const WaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.5c-.3-.2-1.7-.9-2-1s-.5-.1-.7.1-.7.9-.9 1.1-.4.2-.7 0-1.3-.5-2.4-1.5c-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6.3-.4.4-.5.2-.3.3-.5.1-.4 0-.5-.7-1.7-.9-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1 2 3.1 4.9 4.4c.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"/>
    <path d="M12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.8L2 22l5.3-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.9.9-3.1-.2-.3C4 14.8 3.5 13.4 3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5z"/>
  </svg>
);
const TkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.6 6.3a4.8 4.8 0 01-3-1.7 4.8 4.8 0 01-1.1-2.6h-3.4v13.7c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9 1.3-2.9 2.9-2.9c.3 0 .6.1.9.2v-3.5a6.5 6.5 0 00-.9-.1 6.3 6.3 0 100 12.6c3.5 0 6.3-2.8 6.3-6.3V8.6a8 8 0 004.7 1.5V6.7s-.3 0-.6-.4z"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'name' | 'slug' | 'logo_url' | 'instagram_url' | 'whatsapp' | 'tiktok_url'>;
}

export default function PLFooter({ shop }: Props) {
  return (
    <footer className="pl-footer" role="contentinfo">
      <div className="pl-container pl-footer__inner">
        <a className="pl-nav__brand" href={`/public/${shop.slug}`} aria-label={`Inicio de ${shop.name}`}>
          <div className="pl-nav__brand-mark" aria-hidden="true">
            {shop.logo_url ? <img src={shop.logo_url} alt="" /> : shop.name[0]}
          </div>
          <span>{shop.name}</span>
        </a>
        <nav className="pl-footer__social" aria-label="Redes sociales">
          {shop.instagram_url && (
            <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <IgIcon />
            </a>
          )}
          {shop.whatsapp && (
            <a
              href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <WaIcon />
            </a>
          )}
          {shop.tiktok_url && (
            <a href={shop.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <TkIcon />
            </a>
          )}
        </nav>
        <div className="pl-footer__credit">
          RESERVAS ONLINE CON{' '}
          <a href="https://novu.app" target="_blank" rel="noopener noreferrer">NOVU</a>
        </div>
      </div>
    </footer>
  );
}
