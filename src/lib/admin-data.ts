import 'server-only';
import type { Tables } from '@/lib/database.types';
import { imageUrl } from '@/lib/images';
import { serverClient } from '@/lib/supabase/server';

export type AdminImage = Tables<'product_images'> & { url: string };
export type AdminProduct = Tables<'products'> & { product_images: AdminImage[] };

export async function loadAdminCatalog() {
  const sb = await serverClient();
  const [products, categories, settings] = await Promise.all([
    sb.from('products').select('*, product_images(*)').order('sort_order').order('created_at', { ascending: false }),
    sb.from('combo_categories').select('*').order('position'),
    sb.from('settings').select('*').maybeSingle(),
  ]);
  const list: AdminProduct[] = (products.data ?? []).map((p) => ({
    ...p,
    product_images: [...(p.product_images ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ ...i, url: imageUrl(i.storage_path) as string })),
  }));
  return { products: list, categories: categories.data ?? [], settings: settings.data };
}

export type Pending = { kind: string; name: string; href: string };

export function pendingOf(products: AdminProduct[], categories: Tables<'combo_categories'>[]): Pending[] {
  const out: Pending[] = [];
  for (const p of products) {
    const href = `/admin/productos?editar=${p.id}`;
    const box = p.type === 'value_box' || p.type === 'mega_box';
    if (p.price_gtq === null) out.push({ kind: 'Falta precio', name: p.name, href });
    if (p.stock === null && !box) out.push({ kind: 'Falta inventario', name: p.name, href });
    if (p.stock === 0 && p.published) out.push({ kind: 'Agotado', name: p.name, href });
    if (box && p.stock !== null && p.stock > 0 && p.stock <= 2) out.push({ kind: 'Poco inventario', name: p.name, href });
    if (p.product_images.length === 0) out.push({ kind: 'Sin foto', name: p.name, href });
    if (p.seo_description.trim().length === 0) out.push({ kind: 'Sin descripción', name: p.name, href });
  }
  for (const c of categories) {
    if (c.stock === 0) out.push({ kind: 'Categoría sin tarjetas', name: `Categoría ${c.id}`, href: '/admin/combos' });
  }
  return out;
}
