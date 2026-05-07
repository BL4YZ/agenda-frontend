'use client';

import { useState, lazy, Suspense } from 'react';
import type { Shop } from '@/types/public';
import '@/styles/public.css';

import PLNav      from './PLNav';
import PLHero     from './PLHero';
import PLAbout    from './PLAbout';
import PLServices from './PLServices';
import PLFooter   from './PLFooter';

// Lazy-load below-fold sections
const PLProducts     = lazy(() => import('./PLProducts'));
const PLTeam         = lazy(() => import('./PLTeam'));
const PLGallery      = lazy(() => import('./PLGallery'));
const PLReviews      = lazy(() => import('./PLReviews'));
const PLLocation     = lazy(() => import('./PLLocation'));
const PLFaq          = lazy(() => import('./PLFaq'));
const PLReserveModal = lazy(() => import('./PLReserveModal'));

/** JSON-LD LocalBusiness schema */
function JsonLd({ shop }: { shop: Shop }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shop.name,
    description: shop.lede,
    url: `https://miagenda.com.uy/public/${shop.slug}`,
    ...(shop.logo_url && { image: shop.logo_url }),
    ...(shop.phone && { telephone: shop.phone }),
    ...(shop.address && { address: { '@type': 'PostalAddress', streetAddress: shop.address } }),
    ...(shop.lat && shop.lng && { geo: { '@type': 'GeoCoordinates', latitude: shop.lat, longitude: shop.lng } }),
    ...(shop.rating && shop.review_count && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: shop.rating,
        reviewCount: shop.review_count,
      },
    }),
    openingHoursSpecification: shop.hours
      .filter(h => !h.is_closed)
      .map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][h.day_of_week]}`,
        opens: h.open_time,
        closes: h.close_time,
      })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios',
      itemListElement: shop.services.map((s, i) => ({
        '@type': 'Offer',
        position: i + 1,
        name: s.name,
        description: s.description,
        price: s.price,
        priceCurrency: 'UYU',
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface Props {
  shop: Shop;
}

export default function PublicLanding({ shop }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<number | null>(null);

  const openReserve = (serviceId?: number) => {
    setPreselectedServiceId(serviceId ?? null);
    setModalOpen(true);
  };

  // If brand_color is set, override --pl-accent for this business
  const accentOverride = shop.brand_color
    ? ({ '--pl-accent': shop.brand_color, '--pl-accent-2': shop.brand_color } as React.CSSProperties)
    : undefined;

  return (
    <>
      <JsonLd shop={shop} />
      <div
        className="pl-page"
        data-pl-theme={shop.theme ?? 'violet'}
        style={accentOverride}
        id="top"
      >
        {/* Animated background */}
        <div className="pl-bg" aria-hidden="true">
          <div className="pl-bg__blob pl-bg__blob--a"/>
          <div className="pl-bg__blob pl-bg__blob--b"/>
          <div className="pl-bg__blob pl-bg__blob--c"/>
          <div className="pl-bg__noise"/>
        </div>

        <PLNav shop={shop} onReserve={() => openReserve()} />
        <PLHero shop={shop} onReserve={() => openReserve()} />
        <PLAbout shop={shop} />
        <PLServices shop={shop} services={shop.services} onReserve={openReserve} />

        <Suspense fallback={null}>
          <PLProducts products={shop.products} />
          <PLTeam team={shop.team} />
          <PLGallery />
          <PLReviews shop={shop} reviews={shop.reviews} />
          <PLLocation shop={shop} hours={shop.hours} />
          <PLFaq faqs={shop.faqs} />
        </Suspense>

        <PLFooter shop={shop} />

        <Suspense fallback={null}>
          {modalOpen && (
            <PLReserveModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              shop={shop}
              initialServiceId={preselectedServiceId}
            />
          )}
        </Suspense>
      </div>
    </>
  );
}
