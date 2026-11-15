import { AdminShell } from '@/components/admin/AdminShell';
import { signOut } from '@/actions/admin';
import { getAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getAdmin();
  if (!user) redirect('/admin/login');
  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-svh max-w-[520px] flex-col justify-center gap-4 px-6">
        <h1 className="m-0 font-display text-[40px] font-normal uppercase leading-none">Sin acceso</h1>
        <p className="m-0 text-gunmetal">Tu usuario no está autorizado para el panel. Pídele a un administrador que te agregue.</p>
        <form action={signOut}>
          <button type="submit" className="min-h-11 cursor-pointer rounded-none border border-cream/50 bg-transparent px-5 text-sm font-semibold text-cream">Cerrar sesión</button>
        </form>
      </main>
    );
  }
  return <AdminShell email={user.email ?? ''}>{children}</AdminShell>;
}
