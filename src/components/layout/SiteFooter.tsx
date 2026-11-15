import Image from 'next/image';
import Link from 'next/link';

export function SiteFooter({ instagram, whatsapp }: { instagram: string; whatsapp: string | null }) {
  const ig = `https://instagram.com/${instagram}`;
  const wa = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null;
  const head = 'text-[13px] font-semibold tracking-[0.04em] text-gunmetal';
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto flex max-w-[1280px] flex-wrap gap-12 px-6 pb-10 pt-16">
        <div className="flex flex-[2_1_300px] flex-col gap-4">
          <Image src="/brand/logo-principal.svg" alt="El Coleccionista" width={102} height={88} className="h-[88px] w-auto self-start" />
          <p className="m-0 max-w-[340px] text-sm text-gunmetal">
            Coleccionamos por el gusto de coleccionar. No presentamos ninguna tarjeta como inversión.
          </p>
        </div>
        <nav aria-label="Tienda" className="flex flex-[1_1_160px] flex-col gap-2.5 text-sm">
          <span className={head}>TIENDA</span>
          <Link href="/tienda?tipo=suelta">Tarjetas sueltas</Link>
          <Link href="/tienda?tipo=combo">Cajas con hits</Link>
          <Link href="/tienda?tipo=sellado">Sobres y cajas selladas</Link>
          <Link href="/tienda?tipo=sorpresa">Tarjeta sorpresa</Link>
        </nav>
        <nav aria-label="Ayuda" className="flex flex-[1_1_160px] flex-col gap-2.5 text-sm">
          <span className={head}>AYUDA</span>
          <Link href="/carrito#entrega">Envíos y entregas</Link>
          <Link href="/#aprende">Guía para empezar</Link>
          {wa ? <a href={wa}>Contacto por WhatsApp</a> : <a href={ig}>Contacto</a>}
        </nav>
        <nav aria-label="Redes" className="flex flex-[1_1_160px] flex-col gap-2.5 text-sm">
          <span className={head}>SÍGUENOS</span>
          <a href={ig} rel="noopener">Instagram</a>
          {wa && <a href={wa} rel="noopener">WhatsApp</a>}
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 border-t border-gunmetal/25 px-6 pb-8 pt-5 text-[13px] text-gunmetal">
        <span>© {new Date().getFullYear()} El Coleccionista · Guatemala</span>
        <span className="flex flex-wrap items-center gap-5">
          <span>elcoleccionista.shop</span>
          <Link href="/admin" className="inline-flex min-h-11 items-center gap-1.5 text-gunmetal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
            Login admin
          </Link>
        </span>
      </div>
    </footer>
  );
}
