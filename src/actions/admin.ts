'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/supabase/server';
import { CATALOG_TAG } from '@/lib/supabase/public';

/** El CMS escribe con el cliente del navegador (RLS: solo admins) y luego refresca la tienda. */
export async function revalidateCatalog(slugs: string[] = []) {
  const { isAdmin } = await getAdmin();
  if (!isAdmin) return { ok: false };
  revalidateTag(CATALOG_TAG);
  revalidatePath('/', 'layout');
  slugs.forEach((s) => revalidatePath(`/producto/${s}`));
  return { ok: true };
}

export async function signOut() {
  const { supabase } = await getAdmin();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
