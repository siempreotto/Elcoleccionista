import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/catalog';
import { SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getCatalog();
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/tienda`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...products.map((p) => ({
      url: `${SITE_URL}/producto/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: p.type === 'single_card' ? 0.8 : 0.7,
      images: p.images.map((i) => (i.url.startsWith('http') ? i.url : `${SITE_URL}${i.url}`)),
    })),
  ];
}
