import { SUPABASE_URL } from '@/lib/env';

/**
 * Las imágenes iniciales viven en /public/catalog (rutas que empiezan con "/").
 * Las que se suben desde el CMS viven en el bucket público `products` de Supabase Storage.
 */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
}
