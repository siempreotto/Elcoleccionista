import { formatQ } from '@/lib/format';

/**
 * Compra por WhatsApp: cada botón de compra abre un chat con El Coleccionista y un mensaje
 * con el producto elegido. El número sale de settings.whatsapp (editable en el CMS).
 */
export function waDigits(phone: string | null | undefined): string | null {
  const d = (phone ?? '').replace(/\D/g, '');
  return d.length >= 8 ? d : null;
}

export function buyMessage(product: string): string {
  return `Hola Otto, estoy interesado en ${product}. ¿Me podrías dar más información para adquirir?`;
}

export function waBuyLink(phone: string | null | undefined, product: string): string | null {
  const digits = waDigits(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(buyMessage(product))}`;
}

const TYPE_NAME: Record<string, string> = {
  value_box: 'la value box',
  mega_box: 'la mega box',
  single_card: 'la tarjeta',
  accessory: 'el accesorio',
};

/** "la value box Topps Chrome UEFA 2025/26 (Q550)" */
export function productLabel(p: { type: string; name: string; short_detail?: string; detail?: string; price_gtq?: number | null; price?: number | null }): string {
  const detail = p.type === 'single_card' ? (p.short_detail ?? p.detail ?? '') : '';
  const price = p.price_gtq ?? p.price ?? null;
  return `${TYPE_NAME[p.type] ?? ''} ${p.name}${detail ? ` (${detail})` : ''}${price !== null ? ` de ${formatQ(price)}` : ''}`.trim();
}

/** "el combo Topps Chrome UEFA 2025/26 (value box) + tarjeta sorpresa categoría A de Q850" */
export function comboLabel(boxName: string, boxType: string, category: string, price: number): string {
  return `el combo ${boxName} (${boxType === 'mega_box' ? 'mega box' : 'value box'}) + tarjeta sorpresa categoría ${category} de ${formatQ(price)}`;
}

/** "la tarjeta sorpresa categoría A de Q1,100" */
export function surpriseLabel(category: string, price: number): string {
  return `la tarjeta sorpresa categoría ${category} de ${formatQ(price)}`;
}
