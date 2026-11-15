import type { Category, Product } from '@/lib/catalog';
import { inStock, TYPE_LABEL } from '@/lib/catalog';
import { formatQ } from '@/lib/format';
import type { CardView } from '@/components/shop/ProductCard';

/** Rareza mostrada en dorado: la numeración si viene en el detalle (8/25), si no la primera etiqueta. */
export function rarityOf(p: Product): string | null {
  const num = p.short_detail.match(/\b\d+\/\d+\b/);
  if (p.tags.includes('NUMERADA') && num) return num[0];
  return p.tags[0] ?? null;
}

export function productCardView(p: Product): CardView {
  const box = p.type === 'value_box' || p.type === 'mega_box';
  const available = inStock(p);
  return {
    href: p.published ? `/producto/${p.slug}` : null,
    img: p.cover?.url ?? null,
    alt: p.cover?.alt ?? p.name,
    rarity: box ? null : rarityOf(p),
    status: box ? TYPE_LABEL[p.type] + (available ? '' : ' · AGOTADA') : available ? 'DISPONIBLE' : 'AGOTADA',
    name: p.name,
    detail: p.short_detail,
    price: p.published ? formatQ(p.price_gtq) : '',
    contain: box,
    emptyLetter: p.combo_category ?? undefined,
  };
}

export function surpriseCardView(c: Category): CardView {
  return {
    href: `/tienda?tipo=sorpresa#sorpresa-${c.id}`,
    img: null,
    alt: `Tarjeta sorpresa categoría ${c.id}`,
    status: c.stock === 0 ? 'AGOTADA' : 'TARJETA SORPRESA',
    name: `Categoría ${c.id}`,
    detail: 'Numerada, patch, firma, rookie, paralela o insert',
    price: formatQ(c.card_alone),
    emptyLetter: c.id,
  };
}

export type BoxLite = {
  id: string;
  slug: string;
  name: string;
  type: 'value_box' | 'mega_box';
  detail: string;
  price: number | null;
  img: string | null;
  alt: string;
  available: boolean;
};

export function toBoxLite(p: Product): BoxLite {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type as BoxLite['type'],
    detail: p.short_detail,
    price: p.price_gtq,
    img: p.cover?.url ?? null,
    alt: p.cover?.alt ?? p.name,
    available: inStock(p),
  };
}
