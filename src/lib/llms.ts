import 'server-only';
import { getCatalog, TYPE_LABEL, type Catalog } from '@/lib/catalog';
import { SITE_URL } from '@/lib/env';
import { formatQ } from '@/lib/format';
import { comboPrice } from '@/lib/pricing';

function header(c: Catalog) {
  const s = c.settings;
  const pricing = { value_box_price: s.value_box_price, mega_box_price: s.mega_box_price, mega_combo_mode: s.mega_combo_mode };
  const lines = [
    '# El Coleccionista',
    '',
    '> Tienda en línea de tarjetas de fútbol coleccionables en Guatemala (elcoleccionista.shop). Vendemos cajas selladas de Panini y Topps, combos de caja más tarjeta sorpresa y tarjetas sueltas con foto real. Precios en quetzales (GTQ). Lema: "Cada tarjeta tiene una historia".',
    '',
    'Coleccionamos por el gusto de coleccionar: no presentamos ninguna tarjeta como inversión. Los autógrafos y paralelos que mencionan las cajas son posibles, no garantizados.',
    '',
    '## Cómo comprar',
    '',
    `- Tienda: ${SITE_URL}/tienda`,
    '- Pago: transferencia o depósito bancario, o pago al recibir. Coordinamos la entrega por WhatsApp.',
    `- Entrega: envío a domicilio a cualquier departamento de Guatemala${s.shipping_cost !== null ? ` (${formatQ(s.shipping_cost)})` : ''}${s.pickup_point ? ` o recoger en ${s.pickup_point}` : ''}.`,
    `- Instagram: https://instagram.com/${s.instagram}`,
    '',
    '## Combos: caja sellada + tarjeta sorpresa',
    '',
    `Value box sola: ${formatQ(s.value_box_price)}. Mega box sola: ${formatQ(s.mega_box_price)}. En cada categoría puede salir una tarjeta numerada, patch, firma (autógrafo), rookie, paralela o insert.`,
    '',
    ...c.categories.map(
      (k) =>
        `- Categoría ${k.id}: combo con value box ${formatQ(comboPrice('value_box', k, pricing))}, con mega box ${formatQ(comboPrice('mega_box', k, pricing))}, tarjeta sorpresa sola ${formatQ(k.card_alone)}. ${k.blurb}`,
    ),
  ];
  return lines;
}

export async function llmsTxt(full: boolean) {
  const c = await getCatalog();
  const lines = header(c);
  const groups: [string, typeof c.products][] = [
    ['Cajas selladas', c.products.filter((p) => p.type === 'value_box' || p.type === 'mega_box')],
    ['Tarjetas sueltas', c.products.filter((p) => p.type === 'single_card')],
    ['Accesorios', c.products.filter((p) => p.type === 'accessory')],
  ];
  for (const [title, list] of groups) {
    if (!list.length) continue;
    lines.push('', `## ${title}`, '');
    for (const p of list) {
      const url = `${SITE_URL}/producto/${p.slug}`;
      const avail = p.stock === null || p.stock > 0 ? 'disponible' : 'agotado';
      if (!full) {
        lines.push(`- [${p.name}](${url}): ${TYPE_LABEL[p.type].toLowerCase()}, ${p.short_detail}. ${formatQ(p.price_gtq)}, ${avail}.`);
      } else {
        lines.push(`### ${p.seo_title || p.name}`, '', `URL: ${url}`, `Tipo: ${TYPE_LABEL[p.type].toLowerCase()}`, `Precio: ${formatQ(p.price_gtq)} (GTQ), ${avail}`);
        if (p.packs && p.cards_per_pack) lines.push(`Contenido: ${p.packs} sobres de ${p.cards_per_pack} tarjetas (${p.packs * p.cards_per_pack} en total)`);
        if (p.tags.length) lines.push(`Etiquetas: ${p.tags.join(', ')}`);
        lines.push('', p.seo_description || p.short_detail);
        if (p.story_body) lines.push('', p.story_body);
        lines.push('');
      }
    }
  }
  if (!full) lines.push('', '## Más detalle', '', `- [Descripciones completas de cada producto](${SITE_URL}/llms-full.txt)`);
  return lines.join('\n') + '\n';
}
