'use client';

import Link from 'next/link';
import MiAgendaLogo from './MiAgendaLogo';

interface FooterColProps {
  title: string;
  links: string[];
}

function FooterCol({ title, links }: FooterColProps) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-3)', marginBottom: 14 }}>
        {title.toUpperCase()}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map(x => (
          <li key={x}>
            <a style={{ fontSize: 13, color: 'var(--fg-1)', cursor: 'pointer' }}>{x}</a>
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
          <FooterCol title="Producto"  links={['Características', 'Precios', 'Integraciones', 'Cambios']} />
          <FooterCol title="Recursos"  links={['Centro de ayuda', 'Blog', 'API', 'Estado']} />
          <FooterCol title="Empresa"   links={['Sobre nosotros', 'Contacto', 'Términos', 'Privacidad']} />
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
