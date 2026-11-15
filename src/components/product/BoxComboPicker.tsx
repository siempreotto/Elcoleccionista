'use client';
import Link from 'next/link';
import { useState } from 'react';
import { cart } from '@/lib/cart/store';
import { formatQ } from '@/lib/format';
import { comboPrice, comboSavings, type BoxType, type PricingCategory, type PricingSettings } from '@/lib/pricing';

type Cat = PricingCategory & { blurb: string; stock: number | null };

/** CTA de combo en la ficha de una caja: elige categoría y agrega caja + tarjeta sorpresa. */
export function BoxComboPicker({ boxId, boxType, categories, settings, disabled }: { boxId: string; boxType: BoxType; categories: Cat[]; settings: PricingSettings; disabled: boolean }) {
  const [cat, setCat] = useState(categories[0]?.id ?? 'C');
  const [added, setAdded] = useState(false);
  const c = categories.find((x) => x.id === cat) ?? categories[0];
  if (!c) return null;
  return (
    <div className="flex flex-col gap-4 border-2 border-gold bg-blue p-5 text-cream shadow-hard">
      <div className="flex items-center justify-between gap-2">
        <span className="bg-gold px-2 py-[3px] text-[11px] font-semibold tracking-[0.06em] text-navy">HIT ASEGURADO</span>
        <span className="text-[13px] font-semibold">AHORRAS {formatQ(comboSavings(boxType, c, settings))}</span>
      </div>
      <div>
        <h2 className="m-0 font-display text-[28px] font-normal uppercase leading-none">Llévala en combo</h2>
        <p className="mb-0 mt-2 text-sm">+ una tarjeta especial de la categoría que elijas: autógrafo, numerada o patch.</p>
      </div>
      <div role="radiogroup" aria-label="Categoría de la tarjeta" className="grid grid-cols-4 gap-2">
        {categories.map((x) => {
          const on = x.id === c.id;
          return (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                setCat(x.id);
                setAdded(false);
              }}
              className={`flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-none px-1 ${on ? 'border-2 border-cream bg-cream text-navy' : 'border border-cream/50 bg-transparent text-cream'}`}
            >
              <span className="font-display text-2xl leading-none">{x.id}</span>
              <span className="text-[13px] font-semibold">{formatQ(comboPrice(boxType, x, settings))}</span>
            </button>
          );
        })}
      </div>
      <span className="text-sm">{c.blurb}</span>
      <button
        type="button"
        disabled={disabled || c.stock === 0}
        onClick={() => {
          cart.add({ kind: 'combo', boxProductId: boxId, category: c.id });
          setAdded(true);
        }}
        className="h-14 cursor-pointer rounded-none border-0 bg-cream font-display text-xl uppercase text-navy shadow-hard disabled:cursor-not-allowed disabled:opacity-60"
      >
        Agregar combo · {formatQ(comboPrice(boxType, c, settings))}
      </button>
      <span aria-live="polite" className="text-sm">
        {added && (
          <>
            Listo, tu combo está en el carrito. <Link href="/carrito" className="font-semibold text-cream">Ver carrito</Link>
          </>
        )}
      </span>
    </div>
  );
}
