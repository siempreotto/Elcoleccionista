'use client';
import Link from 'next/link';
import { useCartCount } from '@/lib/cart/store';

export function CartButton() {
  const count = useCartCount();
  return (
    <Link
      href="/carrito"
      aria-label={count === 1 ? 'Carrito, 1 artículo' : `Carrito, ${count} artículos`}
      className="relative flex h-11 w-11 items-center justify-center bg-cream shadow-hard"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#07122D" strokeWidth="2.2" aria-hidden="true">
        <path d="M3 4h2l2.4 11h11.2L21 7H6.2" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center bg-blue px-1 text-[11px] font-semibold text-cream">
          {count}
        </span>
      )}
    </Link>
  );
}
