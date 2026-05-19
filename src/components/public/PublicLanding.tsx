'use client';

import { useState, lazy, Suspense } from 'react';
import type { Shop, ShopPlan } from '@/types/public';
import type { NavSection } from './PLNav';
import '@/styles/public.css';

import PLNav      from './PLNav';
import PLHero     from './PLHero';
import PLAbout    from './PLAbout';
import PLServices from './PLServices';
import PLFooter   from './PLFooter';

// Lazy-load below-fold sections
const PLBranches     = lazy(() => import('./PLBranches'));
const PLProducts     = lazy(() => import('./PLProducts'));
const PLTeam         = lazy(() => import('./PLTeam'));
const PLGallery      = lazy(() => import('./PLGallery'));
const PLReviews      = lazy(() => import('./PLReviews'));
const PLLocation     = lazy(() => import('./PLLocation'));
const PLFaq          = lazy(() => import('./PLFaq'));
const PLReserveModal = lazy(() => import('./PLReserveModal'));

// Sections available per plan level
const PLAN_SECTIONS: Record<ShopPlan, Set<string>> = {
  gratis:  new Set(['servicios', 'contacto']),
  pro:     new Set(['servicios', 'tienda', 'reviews', 'faq', 'contacto']),
  negocio: new Set(['servicios', 'sucursales', 'tienda', 'equipo', 'galeria', 'reviews', 'faq', 'contacto']),
};

/** JSON-LD LocalBusiness schema */
function JsonLd({ shop }: { shop: Shop }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: shop.name,
    description: shop.lede,
    url: `https://novu.app/public/${shop.slug}`,
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
  const [preselectedBranchId, setPreselectedBranchId] = useState<number | null>(null);

  const openReserve = (serviceId?: number, branchId?: number) => {
    setPreselectedServiceId(serviceId ?? null);
    setPreselectedBranchId(branchId ?? null);
    setModalOpen(true);
  };

  const accentOverride = shop.brand_color
    ? ({ '--pl-accent': shop.brand_color } as React.CSSProperties)
    : undefined;

  // Determine what's accessible for this plan
  const allowed = PLAN_SECTIONS[shop.plan ?? 'gratis'];

  const showBranches  = allowed.has('sucursales') && shop.branches.length > 0;
  const showProducts  = allowed.has('tienda')    && shop.products.length > 0;
  const showTeam      = allowed.has('equipo')     && shop.team.length > 0;
  const showGallery   = allowed.has('galeria')    && (shop.gallery?.length ?? 0) > 0;
  const showReviews   = allowed.has('reviews')    && shop.reviews.length > 0;
  const showLocation  = allowed.has('contacto')   && !!(shop.address || shop.lat || shop.phone);
  const showFaq       = allowed.has('faq')        && shop.faqs.length > 0;

  // Build nav links only for sections that exist AND are allowed
  const navSections: NavSection[] = [
    shop.services.length > 0                       && { href: '#servicios',  label: 'Servicios' },
    showBranches                                   && { href: '#sucursales', label: 'Sucursales' },
    showProducts                                   && { href: '#tienda',     label: 'Tienda' },
    showTeam                                       && { href: '#equipo',    label: 'Equipo' },
    showReviews                                    && { href: '#reviews',   label: 'Reseñas' },
    showLocation                                   && { href: '#contacto',  label: 'Contacto' },
  ].filter(Boolean) as NavSection[];

  return (
    <>
      <JsonLd shop={shop} />
      <div
        className="pl-page"
        data-pl-theme={shop.theme ?? 'violet'}
        {...(shop.font ? { 'data-pl-font': shop.font } : {})}
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

        <PLNav shop={shop} sections={navSections} onReserve={() => openReserve()} />
        <PLHero shop={shop} onReserve={() => openReserve()} />
        <PLAbout shop={shop} />
        <PLServices shop={shop} services={shop.services} onReserve={openReserve} />

        <Suspense fallback={null}>
          {showBranches  && <PLBranches shop={shop} branches={shop.branches} onReserve={(branchId) => openReserve(undefined, branchId)} />}
          {showProducts  && <PLProducts products={shop.products} shop={shop} />}
          {showTeam      && <PLTeam team={shop.team} />}
          {showGallery   && <PLGallery images={shop.gallery.map(g => ({ url: g.image_url, alt: g.caption ?? undefined }))} />}
          {showReviews   && <PLReviews shop={shop} reviews={shop.reviews} />}
          {showLocation  && <PLLocation shop={shop} hours={shop.hours} />}
          {showFaq       && <PLFaq faqs={shop.faqs} />}
        </Suspense>

        <PLFooter shop={shop} />

        <Suspense fallback={null}>
          {modalOpen && (
            <PLReserveModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              shop={shop}
              initialServiceId={preselectedServiceId}
              initialBranchId={preselectedBranchId}
            />
          )}
        </Suspense>
      </div>
    </>
  );
}
