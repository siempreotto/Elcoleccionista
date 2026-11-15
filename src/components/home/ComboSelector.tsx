'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { cart } from '@/lib/cart/store';
import { formatQ } from '@/lib/format';
import { comboPrice, comboSavings, separatePrice, type PricingCategory, type PricingSettings } from '@/lib/pricing';
import type { BoxLite } from '@/lib/views';
import { HandNote } from '@/components/ui';
import { optimized } from '@/lib/images';

export const COMBO_EVENT = 'ec:combo-select';
export type ComboSelectDetail = { boxId: string; category: string };

type Cat = PricingCategory & { blurb: string; stock: number | null };

/** Selector en 2 pasos: caja (value o mega) y categoría (C, B, A, AAA). */
export function ComboSelector({ boxes, categories, settings }: { boxes: BoxLite[]; categories: Cat[]; settings: PricingSettings }) {
  const defaultBox = Math.min(2, Math.max(0, boxes.length - 1));
  const [boxIdx, setBoxIdx] = useState(defaultBox);
  const [catId, setCatId] = useState(categories.find((c) => c.id === 'A')?.id ?? categories[0]?.id ?? 'C');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const d = (e as CustomEvent<ComboSelectDetail>).detail;
      const i = boxes.findIndex((b) => b.id === d.boxId);
      if (i >= 0) setBoxIdx(i);
      setCatId(d.category);
      setAdded(false);
    };
    window.addEventListener(COMBO_EVENT, onSelect);
    return () => window.removeEventListener(COMBO_EVENT, onSelect);
  }, [boxes]);

  const box = boxes[boxIdx] ?? boxes[0];
  const cat = useMemo(() => categories.find((c) => c.id === catId) ?? categories[0], [categories, catId]);
  if (!box || !cat) return null;

  const price = comboPrice(box.type, cat, settings);
  const soldOut = !box.available || cat.stock === 0;

  return (
    <div className="notch flex flex-wrap items-stretch bg-navy">
      <div className="relative flex min-h-[320px] min-w-0 flex-[1_1_360px] flex-col items-center justify-center gap-4 px-6 py-8">
        <div aria-hidden="true" className="absolute inset-0 flex select-none items-center justify-center font-display text-[clamp(160px,22vw,300px)] leading-none text-surface">
          {cat.id}
        </div>
        {box.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={optimized(box.img, 384)} alt={box.alt} width={300} height={300} loading="lazy" decoding="async" className="relative block h-auto w-[min(300px,70%)]" />
        )}
        <HandNote className="relative">+ una tarjeta categoría {cat.id}</HandNote>
      </div>
      <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-6 border-gunmetal/25 p-6 md:border-l md:p-10">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-gunmetal" id="combo-caja">
            1 · ELIGE TU CAJA: VALUE BOX O MEGA BOX
          </span>
          <div role="radiogroup" aria-labelledby="combo-caja" className="grid grid-cols-[repeat(auto-fill,minmax(68px,1fr))] gap-2">
            {boxes.map((b, i) => {
              const on = i === boxIdx;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${b.name} · ${b.type === 'value_box' ? 'Value box' : 'Mega box'}`}
                  onClick={() => {
                    setBoxIdx(i);
                    setAdded(false);
                  }}
                  className={`flex min-h-20 cursor-pointer items-center justify-center rounded-none p-2 ${on ? 'border-2 border-cream bg-surface' : 'border border-gunmetal/50 bg-transparent'}`}
                >
                  {b.img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={optimized(b.img, 128)} alt="" width={72} height={72} loading="lazy" decoding="async" className={`h-auto w-full max-w-[72px] ${on ? '' : 'opacity-75'}`} />
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-[15px] font-semibold">
            {box.name} · {box.type === 'value_box' ? 'Value box' : 'Mega box'}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-gunmetal" id="combo-cat">
            2 · ELIGE LA CATEGORÍA DE TU TARJETA
          </span>
          <div role="radiogroup" aria-labelledby="combo-cat" className="grid grid-cols-4 gap-2">
            {categories.map((c) => {
              const on = c.id === cat.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`Categoría ${c.id}, combo ${formatQ(comboPrice(box.type, c, settings))}`}
                  onClick={() => {
                    setCatId(c.id);
                    setAdded(false);
                  }}
                  className={`flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-none px-1 py-2 ${on ? 'border-2 border-cream bg-cream text-navy' : 'border border-gunmetal/50 bg-transparent text-cream'}`}
                >
                  <span className="font-display text-[26px] leading-none">{c.id}</span>
                  <span className={`text-[13px] font-semibold ${on ? '' : 'text-gunmetal'}`}>{formatQ(comboPrice(box.type, c, settings))}</span>
                </button>
              );
            })}
          </div>
          <span className="text-sm text-gunmetal">{cat.blurb}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-gunmetal/40 pt-5">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gunmetal">
              Por separado <s>{formatQ(separatePrice(box.type, cat, settings))}</s>
            </span>
            <span className="font-display text-[56px] leading-none">{formatQ(price)}</span>
            <span className="self-start bg-blue px-2.5 py-1 text-[13px] font-semibold tracking-[0.04em] text-cream">
              AHORRAS {formatQ(comboSavings(box.type, cat, settings))}
            </span>
          </div>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              cart.add({ kind: 'combo', boxProductId: box.id, category: cat.id });
              setAdded(true);
            }}
            className="h-[60px] max-w-[280px] flex-[1_1_200px] cursor-pointer rounded-none border-0 bg-cream font-display text-[22px] uppercase tracking-[0.02em] text-navy shadow-hard disabled:cursor-not-allowed disabled:opacity-60"
          >
            {soldOut ? 'Agotado' : 'Agregar combo'}
          </button>
        </div>
        <div aria-live="polite">
          {added && (
            <div role="status" className="flex items-center justify-between gap-4 border border-gunmetal/50 bg-surface px-4 py-3.5">
              <span className="text-[15px] font-semibold">Listo. Tu combo ya está en el carrito.</span>
              <Link href="/carrito" className="text-sm font-semibold">Ver carrito</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
