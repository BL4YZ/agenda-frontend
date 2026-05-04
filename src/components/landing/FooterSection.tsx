'use client';

import Link from 'next/link';
import MiAgendaLogo from './MiAgendaLogo';

interface FooterLink {
  label: string;
  href?: string;
}

interface FooterColProps {
  title: string;
  links: FooterLink[];
}

function FooterCol({ title, links }: FooterColProps) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-3)', marginBottom: 14 }}>
        {title.toUpperCase()}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map(x => (
          <li key={x.label}>
            {x.href ? (
              <Link href={x.href} style={{ fontSize: 13, color: 'var(--fg-1)', cursor: 'pointer', textDecoration: 'none' }}>{x.label}</Link>
            ) : (
              <a style={{ fontSize: 13, color: 'var(--fg-1)', cursor: 'pointer' }}>{x.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FooterSection() {
  return (
    <footer className="vc-footer">
      <div className="vc-footer-top">
        <div style={{ maxWidth: 360 }}>
          <MiAgendaLogo />
          <p style={{ color: 'var(--fg-2)', marginTop: 16, fontSize: 14 }}>
            La agenda online para profesionales y pequeños negocios.<br />
            Hecho en LATAM, para LATAM.
          </p>
        </div>
        <div className="vc-footer-cols">
          <FooterCol title="Producto"  links={[{label:'Características'},{label:'Precios'},{label:'Integraciones'},{label:'Cambios'}]} />
          <FooterCol title="Recursos"  links={[{label:'Centro de ayuda'},{label:'Blog'},{label:'API'},{label:'Estado'}]} />
          <FooterCol title="Empresa"   links={[{label:'Sobre nosotros',href:'/about'},{label:'Contacto'},{label:'Términos',href:'/terms'},{label:'Privacidad',href:'/privacy'}]} />
        </div>
      </div>

      <div className="vc-footer-bot">
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.12em' }}>
          © {new Date().getFullYear()} MIAGENDA · TODOS LOS DERECHOS RESERVADOS
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" style={{ fontSize: 12, color: 'var(--fg-2)' }}>Iniciar sesión</Link>
          <span style={{ color: 'var(--fg-3)' }}>·</span>
          <Link href="/register" style={{ fontSize: 12, color: 'var(--fg-2)' }}>Registrarse</Link>
        </div>
      </div>
    </footer>
  );
}
