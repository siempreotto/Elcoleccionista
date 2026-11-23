import Image from 'next/image';
import Link from 'next/link';

/** Barra fija. En el Inicio flota sobre la animación; en las demás páginas tiene fondo. */
export function SiteHeader({ floating = false }: { floating?: boolean }) {
  const navLink =
    'hidden min-h-11 items-center bg-navy px-3 text-sm font-semibold text-cream no-underline hover:text-gold min-[760px]:inline-flex';
  return (
    <header
      className={`${floating ? 'pointer-events-none fixed' : 'sticky border-b border-line bg-navy'} left-0 right-0 top-0 z-50 flex items-center justify-between gap-4 px-4 py-3 sm:px-6`}
    >
      <Link href="/" aria-label="El Coleccionista, inicio" className="pointer-events-auto leading-none">
        <Image
          src="/brand/logo-reducido.svg"
          alt="El Coleccionista · Tarjetas de fútbol"
          width={108}
          height={64}
          priority
          className="h-[46px] w-auto min-[760px]:h-[64px]"
        />
      </Link>
      <nav aria-label="Principal" className="pointer-events-auto flex items-center gap-3">
        <Link href="/#cajas" className={navLink}>Cajas</Link>
        <Link href="/#aprende" className={navLink}>Aprende</Link>
        <Link href="/#vending" className={navLink}>Vending</Link>
        <Link
          href="/tienda"
          className="inline-flex min-h-11 items-center border border-cream/50 bg-navy px-[18px] text-sm font-semibold text-cream no-underline hover:text-gold"
        >
          Tienda
        </Link>
      </nav>
    </header>
  );
}
