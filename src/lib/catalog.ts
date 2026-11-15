import 'server-only';
import { publicClient } from '@/lib/supabase/public';
import type { Tables } from '@/lib/database.types';
import { imageUrl } from '@/lib/images';

export type ProductRow = Tables<'products'>;
export type ImageRow = Tables<'product_images'>;
export type Category = Tables<'combo_categories'>;
export type Settings = Tables<'settings'>;

export type Product = ProductRow & {
  images: { url: string; alt: string; kind: string }[];
  cover: { url: string; alt: string } | null;
};

export type Spec = { k: string; v: string };

const FALLBACK_SETTINGS: Settings = {
  id: true,
  value_box_price: 0,
  mega_box_price: 0,
  mega_combo_mode: 'diferencia',
  whatsapp: null,
  instagram: 'elcoleccionistacom',
  shipping_cost: null,
  pickup_point: null,
  pickup_hours: null,
  updated_at: new Date(0).toISOString(),
};

function withImages(p: ProductRow & { product_images?: ImageRow[] | null }): Product {
  const imgs = [...(p.product_images ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((i) => ({ url: imageUrl(i.storage_path) as string, alt: i.alt || p.name, kind: i.kind }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { product_images, ...rest } = p;
  return { ...rest, images: imgs, cover: imgs[0] ?? null };
}

type RawCatalog = { products: (ProductRow & { product_images: ImageRow[] })[]; categories: Category[]; settings: Settings };

/**
 * Solo para desarrollo local sin acceso a Supabase: EC_CATALOG_FIXTURE apunta a un JSON con
 * la misma forma que la base. Nunca se activa en producción.
 */
async function readFixture(): Promise<RawCatalog | null> {
  const path = process.env.EC_CATALOG_FIXTURE;
  if (!path || process.env.NODE_ENV === 'production') return null;
  const fs = await import('node:fs/promises');
  return JSON.parse(await fs.readFile(path, 'utf8')) as RawCatalog;
}

function shape(raw: RawCatalog) {
  const all = raw.products.map(withImages);
  return {
    all,
    products: all.filter((p) => p.published),
    featured: all.filter((p) => p.featured),
    categories: raw.categories,
    settings: raw.settings ?? FALLBACK_SETTINGS,
  };
}

/** Todo lo que el público puede leer: publicados y tarjetas marcadas para la vitrina. */
export async function getCatalog() {
  const fixture = await readFixture();
  if (fixture) return shape(fixture);
  const sb = publicClient();
  const [products, categories, settings] = await Promise.all([
    sb.from('products').select('*, product_images(*)').order('sort_order').order('created_at', { ascending: false }),
    sb.from('combo_categories').select('*').order('position'),
    sb.from('settings').select('*').maybeSingle(),
  ]);
  if (products.error) console.error('[catalog] products', products.error.message);
  return shape({
    products: (products.data ?? []) as RawCatalog['products'],
    categories: categories.data ?? [],
    settings: settings.data ?? FALLBACK_SETTINGS,
  });
}

export type Catalog = Awaited<ReturnType<typeof getCatalog>>;

export async function getProductBySlug(slug: string) {
  const fixture = await readFixture();
  if (fixture) return shape(fixture).products.find((p) => p.slug === slug) ?? null;
  const { data } = await publicClient()
    .from('products')
    .select('*, product_images(*)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return data ? withImages(data) : null;
}

export function isBox(p: Pick<ProductRow, 'type'>): p is Pick<ProductRow, 'type'> & { type: 'value_box' | 'mega_box' } {
  return p.type === 'value_box' || p.type === 'mega_box';
}

export function inStock(p: Pick<ProductRow, 'stock'>) {
  return p.stock === null || p.stock > 0;
}

export function specsOf(p: Pick<ProductRow, 'specs'>): Spec[] {
  return Array.isArray(p.specs)
    ? (p.specs as unknown[]).filter(
        (s): s is Spec => !!s && typeof s === 'object' && 'k' in s && 'v' in s,
      )
    : [];
}

export const TYPE_LABEL: Record<ProductRow['type'], string> = {
  value_box: 'VALUE BOX',
  mega_box: 'MEGA BOX',
  single_card: 'TARJETA SUELTA',
  accessory: 'ACCESORIO',
};

export const COMPETITION_LABEL: Record<string, string> = {
  selecciones: 'Selecciones',
  ligas_europeas: 'Ligas europeas',
  mls: 'MLS',
  liga_mx: 'Liga MX',
};
