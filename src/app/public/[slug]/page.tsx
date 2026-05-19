import { cache }    from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Shop } from '@/types/public';
import PublicLanding from '@/components/public/PublicLanding';

// cache() deduplicates the two calls (generateMetadata + page) within one render
const getShopData = cache(async (slug: string): Promise<Shop | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/${slug}/landing`,
      { cache: 'no-store' }   // always fresh — no ISR, no stale cache
    );
    if (!res.ok) return null;
    return res.json() as Promise<Shop>;
  } catch {
    return null;
  }
});

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopData(slug);
  if (!shop) {
    return { title: 'Negocio no encontrado | Novu' };
  }

  const title = `${shop.name}${shop.tagline ? ` — ${shop.tagline}` : ''} | Novu`;
  const description =
    shop.lede ??
    `Reservá tu turno en ${shop.name} de forma fácil y rápida.${shop.address ? ` ${shop.address}.` : ''}`;
  const ogImage = shop.logo_url ?? shop.cover_url ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title: shop.name,
      description,
      type: 'website',
      url: `/public/${slug}`,
      ...(ogImage && { images: [{ url: ogImage, alt: shop.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: shop.name,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `/public/${slug}` },
  };
}

export default async function PublicLandingPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const shop = await getShopData(slug);

  if (!shop) notFound();

  return <PublicLanding shop={shop} />;
}
