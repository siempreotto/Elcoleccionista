import { describe, expect, it } from 'vitest';
import { comboPrice, comboSavings } from './pricing';
import { formatQ } from './format';

const s = { value_box_price: 550, mega_box_price: 750, mega_combo_mode: 'diferencia' };
const cats = [
  { id: 'C', combo_with_value_box: 600, combo_with_mega_box: null, card_alone: 800 },
  { id: 'B', combo_with_value_box: 700, combo_with_mega_box: null, card_alone: 900 },
  { id: 'A', combo_with_value_box: 850, combo_with_mega_box: null, card_alone: 1100 },
  { id: 'AAA', combo_with_value_box: 999, combo_with_mega_box: null, card_alone: 1300 },
];

describe('pricing', () => {
  it('combo con value box usa el precio de la categoría', () => {
    expect(cats.map((c) => comboPrice('value_box', c, s))).toEqual([600, 700, 850, 999]);
  });
  it('combo con mega box suma la diferencia mega − value', () => {
    expect(cats.map((c) => comboPrice('mega_box', c, s))).toEqual([800, 900, 1050, 1199]);
  });
  it('modo manual usa combo_with_mega_box cuando existe', () => {
    const m = { ...s, mega_combo_mode: 'manual' };
    expect(comboPrice('mega_box', { ...cats[0], combo_with_mega_box: 777 }, m)).toBe(777);
    expect(comboPrice('mega_box', cats[0], m)).toBe(800);
  });
  it('ahorro = caja + tarjeta sola − combo (tabla del brief)', () => {
    expect(cats.map((c) => comboSavings('value_box', c, s))).toEqual([750, 750, 800, 851]);
  });
  it('formatQ', () => {
    expect(formatQ(1350)).toBe('Q1,350');
    expect(formatQ(999)).toBe('Q999');
  });
});
