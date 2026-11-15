'use client';
import Link from 'next/link';
import { useState } from 'react';
import { cart } from '@/lib/cart/store';

type Item = { kind: 'product'; productId: string } | { kind: 'surprise'; category: string };

export function AddToCartButton({
  item,
  disabled = false,
  label = 'Agregar',
  size = 'sm',
  maxQty,
}: {
  item: Item;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'lg';
  maxQty?: number;
}) {
  const [added, setAdded] = useState(false);
  const cls =
    size === 'lg'
      ? 'h-[60px] w-full font-display text-[22px] uppercase'
      : 'min-h-11 px-[18px] text-sm font-semibold';
  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          cart.add(item, maxQty);
          setAdded(true);
        }}
        className={`${cls} cursor-pointer rounded-none border-0 bg-cream text-navy shadow-hard disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {disabled ? 'Agotado' : label}
      </button>
      <span aria-live="polite" className="text-sm">
        {added && (
          <>
            Listo, está en tu carrito. <Link href="/carrito" className="font-semibold">Ver carrito</Link>
          </>
        )}
      </span>
    </span>
  );
}
