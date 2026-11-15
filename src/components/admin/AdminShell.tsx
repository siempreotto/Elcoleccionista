'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/actions/admin';

const MENU = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/combos', label: 'Combos y ajustes' },
  { href: '/admin/pedidos', label: 'Pedidos' },
  { href: '/admin/vending', label: 'Vending' },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="flex flex-col gap-4 border-b border-line bg-ink p-4 lg:sticky lg:top-0 lg:h-svh lg:w-[240px] lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" aria-label="Panel, inicio">
            <Image src="/brand/logo-reducido.svg" alt="El Coleccionista" width={96} height={57} className="h-auto w-[96px]" />
          </Link>
          <span className="font-pixel text-base font-bold text-gunmetal lg:hidden">Panel</span>
        </div>
        <nav aria-label="Panel" className="-mx-1 flex gap-1 overflow-x-auto lg:mx-0 lg:flex-col lg:overflow-visible">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              aria-current={active(m.href) ? 'page' : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center px-3 text-sm font-semibold no-underline ${active(m.href) ? 'bg-cream text-navy hover:text-navy' : 'text-cream'}`}
            >
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden flex-col gap-2 text-sm lg:flex">
          <span className="truncate text-gunmetal">{email}</span>
          <Link href="/" target="_blank" className="font-semibold">Ver la tienda</Link>
          <form action={signOut}>
            <button type="submit" className="min-h-11 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-cream underline">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <main id="contenido" className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">
        {children}
        <div className="mt-12 flex flex-wrap gap-4 border-t border-line pt-6 text-sm lg:hidden">
          <span className="text-gunmetal">{email}</span>
          <Link href="/" className="font-semibold">Ver la tienda</Link>
          <form action={signOut}>
            <button type="submit" className="min-h-11 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-cream underline">Cerrar sesión</button>
          </form>
        </div>
      </main>
    </div>
  );
}
