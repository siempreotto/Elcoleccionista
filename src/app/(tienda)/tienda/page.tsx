import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { breadcrumbJsonLd, JsonLd } from '@/components/seo/JsonLd';
import { FiltersToggle } from '@/components/shop/FiltersToggle';
import { ProductCard, type CardView } from '@/components/shop/ProductCard';
import { WhatsAppBuyButton } from '@/components/shop/WhatsAppBuyButton';
import { COMPETITION_LABEL, getCatalog, inStock, isBox } from '@/lib/catalog';
import { formatQ } from '@/lib/format';
import { comboPrice, comboSavings } from '@/lib/pricing';
import { productCardView, surpriseCardView } from '@/lib/views';
import { productLabel, surpriseLabel } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Tienda: tarjetas de fútbol, cajas selladas y combos',
  description:
    'La vitrina de El Coleccionista en Guatemala: tarjetas de fútbol sueltas con foto real, cajas selladas de Panini y Topps, combos con tarjeta sorpresa y precios en quetzales.',
  alternates: { canonical: '/tienda' },
};

const TABS = [
  { id: 'todo', label: 'Todo' },
  { id: 'combo', label: 'Combos' },
  { id: 'sellado', label: 'Cajas selladas' },
  { id: 'sorpresa', label: 'Tarjeta sorpresa' },
  { id: 'suelta', label: 'Tarjetas sueltas' },
] as const;
type Tab = (typeof TABS)[number]['id'];

const TAGS = [
  { id: 'numerada', label: 'Numerada', tag: 'NUMERADA' },
  { id: 'patch', label: 'Patch', tag: 'PATCH' },
  { id: 'firma', label: 'Firma', tag: 'AUTO' },
  { id: 'rookie', label: 'Rookie', tag: 'ROOKIE' },
  { id: 'paralela', label: 'Paralela', tag: 'PARALELA' },
  { id: 'insert', label: 'Insert', tag: 'INSERT' },
];
const CATS = ['AAA', 'A', 'B', 'C'];
const PER_PAGE = 12;

type Item = {
  key: string;
  kind: 'combo' | 'sellado' | 'sorpresa' | 'suelta';
  view: CardView;
  price: number;
  order: number;
  category: string | null;
  tags: string[];
  competition: string | null;
  available: boolean;
  search: string;
  buy?: string;
};

type SP = Record<string, string | string[] | undefined>;
const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(',') : []).filter(Boolean);
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { products, categories, settings } = await getCatalog();
  const pricing = { value_box_price: settings.value_box_price, mega_box_price: settings.mega_box_price, mega_combo_mode: settings.mega_combo_mode };

  const tab = (TABS.some((t) => t.id === one(sp.tipo)) ? one(sp.tipo) : 'todo') as Tab;
  const cats = list(sp.cat).filter((c) => CATS.includes(c));
  const tagIds = list(sp.tag);
  const tags = TAGS.filter((t) => tagIds.includes(t.id)).map((t) => t.tag);
  const comps = list(sp.comp).filter((c) => c in COMPETITION_LABEL);
  const min = Number(one(sp.min)) || 0;
  const max = Number(one(sp.max)) || 0;
  const onlyAvailable = one(sp.disp) === '1';
  const q = one(sp.q).trim().slice(0, 80);
  const order = one(sp.orden) || 'nuevas';
  const page = Math.max(1, Number(one(sp.p)) || 1);

  const items: Item[] = [];
  categories.forEach((c, i) => {
    const anyAvailable = c.stock !== 0;
    items.push({
      key: `combo-${c.id}`,
      kind: 'combo',
      view: {
        href: '/#cajas',
        img: products.filter(isBox)[i % Math.max(1, products.filter(isBox).length)]?.cover?.url ?? null,
        alt: `Combo caja sellada más tarjeta sorpresa categoría ${c.id}`,
        status: `COMBO · AHORRAS ${formatQ(comboSavings('value_box', c, pricing))}`,
        name: `Combo caja + tarjeta categoría ${c.id}`,
        detail: 'Eliges tu value box o mega box al armarlo',
        price: `desde ${formatQ(comboPrice('value_box', c, pricing))}`,
        contain: true,
      },
      price: comboPrice('value_box', c, pricing),
      order: 0 - i,
      category: c.id,
      tags: [],
      competition: null,
      available: anyAvailable,
      search: `combo caja tarjeta sorpresa categoria ${c.id}`,
    });
    items.push({
      key: `sorpresa-${c.id}`,
      kind: 'sorpresa',
      view: surpriseCardView(c),
      price: c.card_alone,
      order: 0 - i,
      category: c.id,
      tags: [],
      competition: null,
      available: anyAvailable,
      search: `tarjeta sorpresa categoria ${c.id} numerada patch firma rookie paralela insert`,
      buy: surpriseLabel(c.id, c.card_alone),
    });
  });
  products.forEach((p) => {
    const box = isBox(p);
    if (!box && p.type !== 'single_card') return;
    items.push({
      key: p.id,
      kind: box ? 'sellado' : 'suelta',
      view: productCardView(p),
      price: p.price_gtq ?? 0,
      order: Date.parse(p.created_at) || 0,
      category: p.combo_category,
      tags: p.tags,
      competition: p.competition,
      available: inStock(p),
      search: norm(`${p.name} ${p.short_detail} ${p.tags.join(' ')} ${p.seo_title}`),
      buy: productLabel(p),
    });
  });

  let filtered = items.filter((it) => tab === 'todo' || it.kind === tab);
  if (cats.length) filtered = filtered.filter((it) => it.category && cats.includes(it.category));
  if (tags.length) filtered = filtered.filter((it) => tags.some((t) => it.tags.includes(t)));
  if (comps.length) filtered = filtered.filter((it) => it.competition && comps.includes(it.competition));
  if (min) filtered = filtered.filter((it) => it.price >= min);
  if (max) filtered = filtered.filter((it) => it.price <= max);
  if (onlyAvailable) filtered = filtered.filter((it) => it.available);
  if (q) {
    const words = norm(q).split(/\s+/);
    filtered = filtered.filter((it) => words.every((w) => norm(it.search + ' ' + it.view.name).includes(w)));
  }
  filtered.sort((a, b) =>
    order === 'precio-asc' ? a.price - b.price : order === 'precio-desc' ? b.price - a.price : b.order - a.order,
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const href = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const base: Record<string, string> = {
      tipo: tab === 'todo' ? '' : tab,
      cat: cats.join(','),
      tag: tagIds.join(','),
      comp: comps.join(','),
      min: min ? String(min) : '',
      max: max ? String(max) : '',
      disp: onlyAvailable ? '1' : '',
      q,
      orden: order === 'nuevas' ? '' : order,
      p: '',
    };
    Object.entries({ ...base, ...patch }).forEach(([k, v]) => v && params.set(k, v));
    const s = params.toString();
    return s ? `/tienda?${s}` : '/tienda';
  };

  const check = 'h-5 w-5 accent-[#F7F4E8]';
  const fieldset = 'm-0 flex flex-col gap-2 border-0 border-t border-line p-0 pt-4';
  const legend = 'mb-2 p-0 text-[13px] font-semibold tracking-[0.04em] text-gunmetal';

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Tienda', path: '/tienda' }])} />
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[1280px] px-4 pb-24 pt-8 sm:px-6">
        <nav aria-label="Migas de pan" className="mb-4 text-sm text-gunmetal">
          <Link href="/" className="text-gunmetal">Inicio</Link> <span aria-hidden="true">/</span> <span>Tienda</span>
        </nav>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none md:text-[64px]">La vitrina</h1>
          <span className="text-sm text-gunmetal" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <nav aria-label="Tipo de producto" className="mb-8 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={href({ tipo: t.id === 'todo' ? '' : t.id, cat: tab === t.id ? cats.join(',') : '' })}
              aria-current={t.id === tab ? 'page' : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center px-4 text-sm font-semibold no-underline ${t.id === tab ? 'bg-cream text-navy hover:text-navy' : 'border border-gunmetal/50 text-cream'}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row">
          <form method="get" action="/tienda" className="flex flex-col gap-4 lg:w-[260px] lg:shrink-0" aria-label="Filtros">
            {tab !== 'todo' && <input type="hidden" name="tipo" value={tab} />}
            <div className="flex flex-col gap-2">
              <label htmlFor="q" className={legend}>BUSCAR</label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Jugador, colección o caja"
                className="h-11 rounded-none border border-gunmetal/60 bg-navy px-3 text-[15px] text-cream"
              />
            </div>
            <FiltersToggle active={cats.length + tagIds.length + comps.length + (min ? 1 : 0) + (max ? 1 : 0) + (onlyAvailable ? 1 : 0)}>
                <fieldset className={fieldset}>
                  <legend className={legend}>CATEGORÍA</legend>
                  <div className="flex flex-wrap gap-x-4">
                    {CATS.map((c) => (
                      <label key={c} className="flex min-h-11 items-center gap-2 text-[15px]">
                        <input type="checkbox" name="cat" value={c} defaultChecked={cats.includes(c)} className={check} /> {c}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className={fieldset}>
                  <legend className={legend}>TIPO DE TARJETA</legend>
                  <div className="grid grid-cols-2 gap-x-4">
                    {TAGS.map((t) => (
                      <label key={t.id} className="flex min-h-11 items-center gap-2 text-[15px]">
                        <input type="checkbox" name="tag" value={t.id} defaultChecked={tagIds.includes(t.id)} className={check} /> {t.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className={fieldset}>
                  <legend className={legend}>COMPETENCIA</legend>
                  {Object.entries(COMPETITION_LABEL).map(([id, label]) => (
                    <label key={id} className="flex min-h-11 items-center gap-2 text-[15px]">
                      <input type="checkbox" name="comp" value={id} defaultChecked={comps.includes(id)} className={check} /> {label}
                    </label>
                  ))}
                </fieldset>
                <fieldset className={fieldset}>
                  <legend className={legend}>PRECIO (Q)</legend>
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor="min">Precio mínimo</label>
                    <input id="min" name="min" type="number" min={0} inputMode="numeric" placeholder="Mínimo" defaultValue={min || ''} className="h-11 w-full rounded-none border border-gunmetal/60 bg-navy px-3 text-cream" />
                    <label className="sr-only" htmlFor="max">Precio máximo</label>
                    <input id="max" name="max" type="number" min={0} inputMode="numeric" placeholder="Máximo" defaultValue={max || ''} className="h-11 w-full rounded-none border border-gunmetal/60 bg-navy px-3 text-cream" />
                  </div>
                  <label className="flex min-h-11 items-center gap-2 text-[15px]">
                    <input type="checkbox" name="disp" value="1" defaultChecked={onlyAvailable} className={check} /> Solo disponibles
                  </label>
                </fieldset>
                <fieldset className={fieldset}>
                  <label htmlFor="orden" className={legend}>ORDENAR POR</label>
                  <select id="orden" name="orden" defaultValue={order} className="h-11 rounded-none border border-gunmetal/60 bg-navy px-3 text-cream">
                    <option value="nuevas">Recién llegadas</option>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                  </select>
                </fieldset>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="min-h-11 cursor-pointer rounded-none border-0 bg-cream px-5 font-display text-lg uppercase text-navy shadow-hard">
                    Aplicar
                  </button>
                  <Link href={tab === 'todo' ? '/tienda' : `/tienda?tipo=${tab}`} className="inline-flex min-h-11 items-center text-sm font-semibold">
                    Limpiar filtros
                  </Link>
                </div>
            </FiltersToggle>
          </form>

          <div className="min-w-0 flex-1">
            {shown.length === 0 ? (
              <div className="border border-line p-8">
                <p className="m-0 text-lg">No encontramos nada con esos filtros.</p>
                <p className="mb-0 mt-2 text-gunmetal">Escríbenos si buscas una tarjeta en particular: puede venir en camino.</p>
              </div>
            ) : (
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6 p-0">
                {shown.map((it, i) => (
                  <li key={it.key} id={it.kind === 'sorpresa' ? `sorpresa-${it.category}` : undefined} className="flex flex-col gap-3">
                    <ProductCard v={it.kind === 'sorpresa' ? { ...it.view, href: null } : it.view} priority={i < 3} />
                    {it.buy && it.kind !== 'suelta' && (
                      <WhatsAppBuyButton phone={settings.whatsapp} product={it.buy} disabled={!it.available} />
                    )}
                  </li>
                ))}
              </ul>
            )}
            {pages > 1 && (
              <nav aria-label="Paginación" className="mt-10 flex flex-wrap gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={href({ p: n === 1 ? '' : String(n) })}
                    aria-current={n === current ? 'page' : undefined}
                    aria-label={`Página ${n}`}
                    className={`inline-flex h-11 min-w-11 items-center justify-center text-sm font-semibold no-underline ${n === current ? 'bg-cream text-navy' : 'border border-gunmetal/50'}`}
                  >
                    {n}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
