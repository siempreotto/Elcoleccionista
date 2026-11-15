/**
 * Reglas de precio de combos. Replica public.combo_price() de la base,
 * que es la fuente de verdad al crear el pedido. Ningún precio vive en el código:
 * todo sale de `settings` y `combo_categories`.
 */
export type PricingSettings = {
  value_box_price: number;
  mega_box_price: number;
  mega_combo_mode: string;
};

export type PricingCategory = {
  id: string;
  combo_with_value_box: number;
  combo_with_mega_box: number | null;
  card_alone: number;
};

export type BoxType = 'value_box' | 'mega_box';

export function comboPrice(boxType: BoxType, cat: PricingCategory, s: PricingSettings): number {
  if (boxType === 'value_box') return cat.combo_with_value_box;
  if (s.mega_combo_mode === 'manual' && cat.combo_with_mega_box !== null) return cat.combo_with_mega_box;
  return cat.combo_with_value_box + (s.mega_box_price - s.value_box_price);
}

/** Precio de referencia de la caja sola según su tipo. */
export function boxBasePrice(boxType: BoxType, s: PricingSettings): number {
  return boxType === 'value_box' ? s.value_box_price : s.mega_box_price;
}

/** Ahorro mostrado = precio caja + tarjeta sola − combo. */
export function comboSavings(boxType: BoxType, cat: PricingCategory, s: PricingSettings): number {
  return boxBasePrice(boxType, s) + cat.card_alone - comboPrice(boxType, cat, s);
}

export function separatePrice(boxType: BoxType, cat: PricingCategory, s: PricingSettings): number {
  return boxBasePrice(boxType, s) + cat.card_alone;
}
