import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/env';

export const CATALOG_TAG = 'catalog';

/**
 * Cliente anónimo para leer el catálogo en el servidor.
 * Las respuestas se guardan en la caché de datos de Next con la etiqueta `catalog`;
 * el CMS llama a revalidateTag('catalog') después de cada cambio.
 */
export function publicClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { tags: [CATALOG_TAG], revalidate: 300 } } as RequestInit),
    },
  });
}

/** Cliente anónimo sin caché, para escrituras públicas (pedidos, lista de espera). */
export function anonClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}
