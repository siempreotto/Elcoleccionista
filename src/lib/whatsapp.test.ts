import { describe, expect, it } from 'vitest';
import { buyMessage, comboLabel, productLabel, surpriseLabel, waBuyLink } from './whatsapp';

describe('whatsapp', () => {
  it('arma el enlace wa.me con el número sin símbolos y el mensaje codificado', () => {
    const url = waBuyLink('+(502)58658187', 'la value box Topps Chrome UEFA 2025/26 de Q550');
    expect(url?.startsWith('https://wa.me/50258658187?text=')).toBe(true);
    expect(decodeURIComponent(url!.split('text=')[1])).toBe(
      'Hola Otto, estoy interesado en la value box Topps Chrome UEFA 2025/26 de Q550. ¿Me podrías dar más información para adquirir?',
    );
  });
  it('sin número no hay enlace', () => {
    expect(waBuyLink(null, 'x')).toBeNull();
  });
  it('etiquetas por tipo de producto', () => {
    expect(productLabel({ type: 'mega_box', name: 'Panini Prizm FIFA World Cup 2026', price_gtq: 750 })).toBe('la mega box Panini Prizm FIFA World Cup 2026 de Q750');
    expect(productLabel({ type: 'single_card', name: 'Luis Suárez', short_detail: 'Leaf Metal · Autógrafo', price_gtq: 3500 })).toBe('la tarjeta Luis Suárez (Leaf Metal · Autógrafo) de Q3,500');
    expect(comboLabel('Topps Chrome UEFA 2025/26', 'value_box', 'A', 850)).toBe('el combo Topps Chrome UEFA 2025/26 (value box) + tarjeta sorpresa categoría A de Q850');
    expect(surpriseLabel('AAA', 1300)).toBe('la tarjeta sorpresa categoría AAA de Q1,300');
    expect(buyMessage('x')).toContain('Hola Otto, estoy interesado en x.');
  });
});
