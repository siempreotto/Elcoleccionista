import Link from 'next/link';
import { loadAdminCatalog, pendingOf } from '@/lib/admin-data';
import { formatQ } from '@/lib/format';

export const metadata = { title: 'Resumen' };

export default async function AdminHome() {
  const { products, categories } = await loadAdminCatalog();
  const published = products.filter((p) => p.published).length;
  const units = products.reduce((n, p) => n + (p.stock ?? 0), 0);
  const value = products.reduce((n, p) => n + (p.stock ?? 0) * (p.price_gtq ?? 0), 0);
  const comboCards = categories.some((c) => c.stock === null) ? null : categories.reduce((n, c) => n + (c.stock ?? 0), 0);
  const pending = pendingOf(products, categories);
  const kpis = [
    { label: 'Productos publicados', value: String(published), note: `de ${products.length} en total` },
    { label: 'Unidades en inventario', value: String(units), note: 'Solo productos con inventario definido' },
    { label: 'Valor del inventario', value: formatQ(value), note: 'Precio de venta × unidades' },
    { label: 'Tarjetas para combos', value: comboCards === null ? 'Sin límite' : String(comboCards), note: 'Suma de las 4 categorías' },
  ];
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none">Resumen</h1>
        <Link href="/admin/productos?nuevo=1" className="inline-flex min-h-11 items-center bg-cream px-5 font-display text-lg uppercase text-navy no-underline shadow-hard hover:text-navy">
          + Nuevo producto
        </Link>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-2 border border-line p-5">
            <span className="text-[13px] font-semibold tracking-[0.04em] text-gunmetal">{k.label.toUpperCase()}</span>
            <span className="font-display text-[40px] leading-none">{k.value}</span>
            <span className="text-sm text-gunmetal">{k.note}</span>
          </div>
        ))}
      </div>
      <section aria-labelledby="pendientes" className="flex flex-col gap-4">
        <h2 id="pendientes" className="m-0 font-display text-[32px] font-normal uppercase leading-none">
          Pendientes <span className="text-gunmetal">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="m-0 text-gunmetal">Todo en orden: cada producto publicado tiene precio e inventario.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {pending.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
                <span className="flex flex-wrap items-center gap-3">
                  <span className="min-w-[170px] text-[13px] font-semibold tracking-[0.04em] text-gunmetal">{a.kind.toUpperCase()}</span>
                  <span className="font-semibold">{a.name}</span>
                </span>
                <Link href={a.href} className="inline-flex min-h-11 items-center text-sm font-semibold">Resolver</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
