import type { Review, Shop } from '@/types/public';

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3 7 7 .5-5.5 5 1.7 7L12 17.8 5.8 21.5 7.5 14.5 2 9.5 9 9z"/>
  </svg>
);

interface Props {
  shop: Pick<Shop, 'rating' | 'review_count'>;
  reviews: Review[];
}

export default function PLReviews({ shop, reviews }: Props) {
  if (reviews.length === 0) return null;

  return (
    <section className="pl-section" id="reviews" aria-label="Reseñas de clientes">
      <div className="pl-container">
        <div className="pl-section__head">
          <span className="pl-eyebrow">
            RESEÑAS{shop.rating ? ` · ★ ${shop.rating} / 5` : ''}
            {shop.review_count ? ` · ${shop.review_count} OPINIONES` : ''}
          </span>
          <h2 className="pl-h2">Lo que dicen <em>nuestros clientes</em></h2>
        </div>
        <div className="pl-reviews" role="list">
          {reviews.map(r => (
            <article key={r.id} className="pl-review" role="listitem">
              <span className="pl-review__quote" aria-hidden="true">"</span>
              <div
                className="pl-review__stars"
                aria-label={`${r.stars} de 5 estrellas`}
                role="img"
              >
                {Array.from({ length: r.stars }).map((_, j) => <StarIcon key={j} />)}
              </div>
              <p className="pl-review__text">{r.text}</p>
              <div className="pl-review__author">
                <div className="pl-review__avatar" aria-hidden="true">
                  {r.author_initial ?? r.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="pl-review__author-info">
                  <span className="pl-review__author-name">{r.author_name}</span>
                  {r.date_label && (
                    <span className="pl-review__author-meta">{r.date_label}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
