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

/**
 * URL del optimizador de imágenes de Next para un ancho dado (debe estar en deviceSizes o imageSizes).
 * Útil para <img> con transformaciones 3D donde next/image no encaja.
 */
export function optimized(url: string, width: 128 | 256 | 384 | 640 | 750, quality = 70): string {
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}
