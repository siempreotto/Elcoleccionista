export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * URL pública del sitio. Orden: NEXT_PUBLIC_SITE_URL si está definida; si no, el dominio de
 * producción que Vercel asigna al proyecto (cambia solo cuando se conecta elcoleccionista.shop).
 */
const vercelProd = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || (vercelProd ? `https://${vercelProd}` : 'https://elcoleccionista.shop')
).replace(/\/$/, '');
export const SITE_NAME = 'El Coleccionista';
