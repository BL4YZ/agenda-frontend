import type { TeamMember } from '@/types/public';

const IgIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
  </svg>
);

interface Props {
  team: TeamMember[];
}

export default function PLTeam({ team }: Props) {
  if (team.length === 0) return null;

  return (
    <section className="pl-section" id="equipo" aria-label="Equipo">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">EQUIPO</span>
          <h2 className="pl-h2">Las <em>personas</em> detrás</h2>
          <p className="pl-sub">Profesionales con años de experiencia. Elegí con quién querés atenderte al reservar.</p>
        </div>
        <div className="pl-team" role="list">
          {team.map(t => (
            <article key={t.id} className="pl-teammate" role="listitem">
              <div className="pl-teammate__avatar" aria-hidden="true">
                {t.avatar_url
                  ? <img src={t.avatar_url} alt={t.name} />
                  : t.name.charAt(0).toUpperCase()}
              </div>
              {t.role && <span className="pl-teammate__role">{t.role}</span>}
              <h3 className="pl-teammate__name">{t.name}</h3>
              {t.bio && <p className="pl-teammate__bio">{t.bio}</p>}
              <div className="pl-teammate__stats">
                {t.years_experience && (
                  <span className="pl-teammate__stat">
                    <strong>{t.years_experience}</strong> AÑOS
                  </span>
                )}
                {t.instagram_handle && t.instagram_handle !== '—' && (
                  <span className="pl-teammate__stat">
                    <IgIcon aria-hidden="true"/> {t.instagram_handle}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
