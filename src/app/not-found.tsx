import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { buttonClass } from '@/components/ui';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto flex max-w-[640px] flex-col items-center gap-6 px-6 py-24 text-center">
        <span className="font-pixel text-lg font-bold text-gunmetal">Error 404</span>
        <h1 className="m-0 font-display text-[48px] font-normal uppercase leading-none">Esta tarjeta no está en la vitrina</h1>
        <p className="m-0 text-gunmetal">Puede que ya se haya vendido o que el enlace esté mal escrito.</p>
        <Link href="/tienda" className={buttonClass('primary', 'min-h-[52px]')}>Ver la tienda</Link>
      </main>
    </>
  );
}
