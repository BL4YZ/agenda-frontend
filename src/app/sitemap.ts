import type { MetadataRoute } from 'next';

async function getPublicSlugs(): Promise<string[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/businesses/slugs`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublicSlugs();

  const businessPages: MetadataRoute.Sitemap = slugs.map(slug => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://novu.app'}/public/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://novu.app', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://novu.app/about', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://novu.app/contact', changeFrequency: 'monthly', priority: 0.4 },
  ];

  return [...staticPages, ...businessPages];
}
