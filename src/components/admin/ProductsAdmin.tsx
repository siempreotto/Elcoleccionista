'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { revalidateCatalog } from '@/actions/admin';
import type { Database, Json } from '@/lib/database.types';
import { formatQ, slugify } from '@/lib/format';
import { browserClient } from '@/lib/supabase/browser';
import type { AdminProduct } from '@/lib/admin-data';
import { SeoPreview } from './SeoPreview';

type PType = Database['public']['Enums']['product_type'];
const TYPES: { id: PType; label: string }[] = [
  { id: 'value_box', label: 'Value box' },
  { id: 'mega_box', label: 'Mega box' },
  { id: 'single_card', label: 'Tarjeta suelta' },
  { id: 'accessory', label: 'Accesorio' },
];
const TAGS = ['AUTO', 'NUMERADA', 'PATCH', 'ROOKIE', 'PARALELA', 'INSERT'];
const COMPETITIONS = [
  { id: '', label: 'Sin definir' },
  { id: 'selecciones', label: 'Selecciones' },
  { id: 'ligas_europeas', label: 'Ligas europeas' },
  { id: 'mls', label: 'MLS' },
  { id: 'liga_mx', label: 'Liga MX' },
];
const IMAGE_KINDS = [
  { id: 'frente', label: 'Frente' },
  { id: 'firma', label: 'Firma' },
  { id: 'reverso', label: 'Reverso' },
  { id: 'otra', label: 'Otra' },
];

const input = 'h-11 w-full rounded-none border border-gunmetal/60 bg-navy px-3 text-[15px] text-cream';
const lbl = 'flex flex-col gap-1.5 text-sm font-semibold';
const small = 'text-[13px] font-semibold tracking-[0.04em] text-gunmetal';

type Spec = { k: string; v: string };
type Draft = {
  name: string;
  slug: string;
  type: PType;
  short_detail: string;
  price_gtq: string;
  stock: string;
  published: boolean;
  featured: boolean;
  tags: string[];
  combo_category: string;
  competition: string;
  packs: string;
  cards_per_pack: string;
  seo_title: string;
  seo_description: string;
  specs: Spec[];
  story_title: string;
  story_note: string;
  story_body: string;
  ref_price_gtq: string;
  ref_price_source: string;
  ref_price_date: string;
  sort_order: string;
};

const toDraft = (p?: AdminProduct): Draft => ({
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  type: p?.type ?? 'single_card',
  short_detail: p?.short_detail ?? '',
  price_gtq: p?.price_gtq?.toString() ?? '',
  stock: p?.stock?.toString() ?? (p ? '' : '1'),
  published: p?.published ?? false,
  featured: p?.featured ?? false,
  tags: p?.tags ?? [],
  combo_category: p?.combo_category ?? '',
  competition: p?.competition ?? '',
  packs: p?.packs?.toString() ?? '',
  cards_per_pack: p?.cards_per_pack?.toString() ?? '',
  seo_title: p?.seo_title ?? '',
  seo_description: p?.seo_description ?? '',
  specs: Array.isArray(p?.specs) ? (p!.specs as Spec[]) : [],
  story_title: p?.story_title ?? '',
  story_note: p?.story_note ?? '',
  story_body: p?.story_body ?? '',
  ref_price_gtq: p?.ref_price_gtq?.toString() ?? '',
  ref_price_source: p?.ref_price_source ?? '',
  ref_price_date: p?.ref_price_date ?? '',
  sort_order: p?.sort_order?.toString() ?? '0',
});

const intOrNull = (s: string) => (s.trim() === '' ? null : Math.max(0, Math.round(Number(s))));

export function ProductsAdmin({ initial, categories, openId }: { initial: AdminProduct[]; categories: string[]; openId: string | null }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState('');
  const [type, setType] = useState<'todos' | PType>('todos');
  const [editing, setEditing] = useState<string | null>(openId);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setItems(initial), [initial]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const shown = useMemo(() => {
    const n = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return items.filter((p) => (type === 'todos' || p.type === type) && (!q || n(`${p.name} ${p.short_detail}`).includes(n(q))));
  }, [items, q, type]);

  const sb = browserClient();

  async function patch(p: AdminProduct, values: Partial<AdminProduct>, msg: string) {
    const before = items;
    setItems((list) => list.map((x) => (x.id === p.id ? { ...x, ...values } : x)));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { product_images, ...row } = values as AdminProduct;
    const { error } = await sb.from('products').update(row).eq('id', p.id);
    if (error) {
      setItems(before);
      setToast(error.message.includes('published_needs_price') ? 'Ponle precio antes de publicar.' : `No se guardó: ${error.message}`);
      return;
    }
    setToast(msg);
    await revalidateCatalog([p.slug]);
  }

  const current = editing === 'new' ? undefined : items.find((p) => p.id === editing);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none">Productos e inventario</h1>
        <button type="button" onClick={() => setEditing('new')} className="min-h-11 cursor-pointer rounded-none border-0 bg-cream px-5 font-display text-lg uppercase text-navy shadow-hard">
          + Nuevo producto
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="buscar-producto">Buscar producto</label>
        <input id="buscar-producto" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto" className={`${input} max-w-[320px]`} />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
          {[{ id: 'todos' as const, label: 'Todos' }, ...TYPES].map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={type === t.id}
              onClick={() => setType(t.id)}
              className={`min-h-11 cursor-pointer rounded-none px-3 text-sm font-semibold ${type === t.id ? 'border-0 bg-cream text-navy' : 'border border-gunmetal/50 bg-transparent text-cream'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="self-center text-sm text-gunmetal">{shown.length} productos</span>
      </div>

      {shown.length === 0 ? (
        <p className="text-gunmetal">No hay productos con ese filtro.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {shown.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 border-b border-line py-4">
              <div className="relative flex h-20 w-16 shrink-0 items-center justify-center bg-surface">
                {p.product_images[0] ? (
                  <Image src={p.product_images[0].url} alt="" fill sizes="64px" className="object-contain p-1" />
                ) : (
                  <span className="text-center text-[11px] text-gunmetal">Sin foto</span>
                )}
              </div>
              <div className="flex min-w-[180px] flex-1 flex-col">
                <span className="font-semibold">{p.name}</span>
                <span className="text-sm text-gunmetal">
                  {TYPES.find((t) => t.id === p.type)?.label} · {p.short_detail}
                </span>
                {p.tags.length > 0 && <span className="text-[12px] font-semibold text-gold">{p.tags.join(' · ')}</span>}
              </div>
              <label className="flex flex-col gap-1">
                <span className={small}>PRECIO (Q)</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  defaultValue={p.price_gtq ?? ''}
                  key={`price-${p.id}-${p.price_gtq}`}
                  aria-label={`Precio de ${p.name}`}
                  onBlur={(e) => {
                    const v = intOrNull(e.target.value);
                    if (v !== p.price_gtq) {
                      if (v === null && p.published) {
                        setToast('Oculta el producto antes de quitarle el precio.');
                        e.target.value = String(p.price_gtq ?? '');
                        return;
                      }
                      patch(p, { price_gtq: v }, `Precio de ${p.name}: ${v === null ? 'sin precio' : formatQ(v)}`);
                    }
                  }}
                  className={`${input} w-28`}
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className={small}>INVENTARIO</span>
                <div className="flex items-center border border-gunmetal/50">
                  <button type="button" aria-label={`Restar uno a ${p.name}`} disabled={!p.stock} onClick={() => patch(p, { stock: Math.max(0, (p.stock ?? 0) - 1) }, 'Inventario actualizado')} className="h-11 w-11 cursor-pointer border-0 bg-transparent text-xl text-cream disabled:opacity-40">−</button>
                  <span className="min-w-12 text-center font-semibold">{p.stock ?? '∞'}</span>
                  <button type="button" aria-label={`Sumar uno a ${p.name}`} onClick={() => patch(p, { stock: (p.stock ?? 0) + 1 }, 'Inventario actualizado')} className="h-11 w-11 cursor-pointer border-0 bg-transparent text-xl text-cream">+</button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={small}>EN LA TIENDA</span>
                <button
                  type="button"
                  aria-pressed={p.published}
                  onClick={() => {
                    if (!p.published && p.price_gtq === null) {
                      setToast('Ponle precio antes de publicar.');
                      return;
                    }
                    patch(p, { published: !p.published }, p.published ? `${p.name} quedó oculto` : `${p.name} está publicado`);
                  }}
                  className={`h-11 min-w-[110px] cursor-pointer rounded-none px-3 text-sm font-semibold ${p.published ? 'border-0 bg-blue text-cream' : 'border border-gunmetal/50 bg-transparent text-gunmetal'}`}
                >
                  {p.published ? 'Publicado' : 'Oculto'}
                </button>
              </div>
              <button type="button" onClick={() => setEditing(p.id)} className="min-h-11 cursor-pointer rounded-none border border-cream/50 bg-transparent px-4 text-sm font-semibold text-cream">
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductEditor
          key={editing}
          product={current}
          categories={categories}
          onClose={() => {
            setEditing(null);
            router.replace('/admin/productos');
          }}
          onSaved={(msg) => {
            setToast(msg);
            router.refresh();
          }}
          onCreated={(id) => setEditing(id)}
        />
      )}

      <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
        {toast && <div className="bg-cream px-5 py-3 text-sm font-semibold text-navy shadow-hard">{toast}</div>}
      </div>
    </div>
  );
}

function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
  onCreated,
}: {
  product?: AdminProduct;
  categories: string[];
  onClose: () => void;
  onSaved: (msg: string) => void;
  onCreated: (id: string) => void;
}) {
  const [d, setD] = useState<Draft>(() => toDraft(product));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState(product?.product_images ?? []);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const sb = browserClient();
  const isCard = d.type === 'single_card';
  const isBoxType = d.type === 'value_box' || d.type === 'mega_box';
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function save(publish?: boolean) {
    setError(null);
    const price = intOrNull(d.price_gtq);
    const published = publish ?? d.published;
    if (!d.name.trim()) return setError('Escribe el nombre.');
    const slug = slugify(d.slug || d.name);
    if (!slug) return setError('Revisa el slug.');
    if (published && price === null) return setError('Ponle precio antes de publicar.');
    if ((d.ref_price_gtq || d.ref_price_source || d.ref_price_date) && !(d.ref_price_gtq && d.ref_price_source && d.ref_price_date)) {
      return setError('El precio de referencia necesita monto, fuente y fecha.');
    }
    const row = {
      name: d.name.trim(),
      slug,
      type: d.type,
      short_detail: d.short_detail.trim(),
      price_gtq: price,
      stock: intOrNull(d.stock),
      published,
      featured: d.featured,
      tags: isCard ? d.tags : [],
      combo_category: isCard && d.combo_category ? d.combo_category : null,
      competition: d.competition || null,
      packs: isBoxType ? intOrNull(d.packs) || null : null,
      cards_per_pack: isBoxType ? intOrNull(d.cards_per_pack) || null : null,
      seo_title: d.seo_title.trim(),
      seo_description: d.seo_description.trim(),
      specs: d.specs.filter((s) => s.k.trim() && s.v.trim()) as unknown as Json,
      story_title: d.story_title.trim(),
      story_note: d.story_note.trim(),
      story_body: d.story_body.trim(),
      ref_price_gtq: intOrNull(d.ref_price_gtq),
      ref_price_source: d.ref_price_source.trim() || null,
      ref_price_date: d.ref_price_date || null,
      sort_order: Number(d.sort_order) || 0,
    };
    setBusy(true);
    const res = product
      ? await sb.from('products').update(row).eq('id', product.id).select('id').single()
      : await sb.from('products').insert(row).select('id').single();
    setBusy(false);
    if (res.error) {
      setError(res.error.code === '23505' ? 'Ya existe un producto con ese slug.' : `No se guardó: ${res.error.message}`);
      return;
    }
    setD((x) => ({ ...x, slug, published }));
    await revalidateCatalog([slug, ...(product && product.slug !== slug ? [product.slug] : [])]);
    onSaved(published && !product?.published ? 'Publicado en la tienda' : 'Guardado');
    if (!product) onCreated(res.data.id);
  }

  async function remove() {
    if (!product || !window.confirm(`¿Eliminar ${product.name}? No se puede deshacer.`)) return;
    setBusy(true);
    const stored = images.filter((i) => !i.storage_path.startsWith('/')).map((i) => i.storage_path);
    const { error } = await sb.from('products').delete().eq('id', product.id);
    if (!error && stored.length) await sb.storage.from('products').remove(stored);
    setBusy(false);
    if (error) return setError(`No se eliminó: ${error.message}`);
    await revalidateCatalog([product.slug]);
    onSaved('Producto eliminado');
    onClose();
  }

  async function upload(files: FileList | null) {
    if (!product || !files?.length) return;
    setBusy(true);
    setError(null);
    let pos = images.reduce((m, i) => Math.max(m, i.position), -1);
    const added: typeof images = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} pesa más de 10 MB.`);
        continue;
      }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${product.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const up = await sb.storage.from('products').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
      if (up.error) {
        setError(`No se subió ${file.name}: ${up.error.message}`);
        continue;
      }
      pos += 1;
      const kind = pos === 0 ? 'frente' : isCard && pos === 1 ? 'firma' : isCard && pos === 2 ? 'reverso' : 'otra';
      const ins = await sb
        .from('product_images')
        .insert({ product_id: product.id, storage_path: path, alt: `${d.name}${d.short_detail ? ', ' + d.short_detail : ''}`, kind, position: pos })
        .select('*')
        .single();
      if (ins.data) {
        const { data } = sb.storage.from('products').getPublicUrl(path);
        added.push({ ...ins.data, url: data.publicUrl });
      }
    }
    setImages((x) => [...x, ...added]);
    setBusy(false);
    await revalidateCatalog([product.slug]);
  }

  async function updateImage(id: string, values: { alt?: string; kind?: string }) {
    setImages((x) => x.map((i) => (i.id === id ? { ...i, ...values } : i)));
    await sb.from('product_images').update(values).eq('id', id);
    if (product) await revalidateCatalog([product.slug]);
  }

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[idx], next[j]] = [next[j], next[idx]];
    const withPos = next.map((im, i) => ({ ...im, position: i }));
    setImages(withPos);
    await Promise.all(withPos.map((im) => sb.from('product_images').update({ position: im.position }).eq('id', im.id)));
    if (product) await revalidateCatalog([product.slug]);
  }

  async function removeImage(id: string) {
    const im = images.find((i) => i.id === id);
    if (!im || !window.confirm('¿Quitar esta foto?')) return;
    await sb.from('product_images').delete().eq('id', id);
    if (!im.storage_path.startsWith('/')) await sb.storage.from('products').remove([im.storage_path]);
    setImages((x) => x.filter((i) => i.id !== id));
    if (product) await revalidateCatalog([product.slug]);
  }

  const seoLen = d.seo_description.length;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-[rgb(7_18_45/0.7)]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-titulo"
        className="flex h-full w-full max-w-[720px] flex-col overflow-y-auto border-l border-line bg-navy"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-navy px-6 py-4">
          <h2 id="editor-titulo" className="m-0 font-display text-[28px] font-normal uppercase leading-none">
            {product ? `Editar: ${product.name}` : 'Nuevo producto'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Cerrar editor" className="h-11 w-11 cursor-pointer border border-gunmetal/50 bg-transparent text-xl text-cream">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-8 px-6 py-6">
          <section className="flex flex-col gap-3">
            <span className={small}>FOTOS</span>
            {!product ? (
              <p className="m-0 text-sm text-gunmetal">Guarda el producto para subir fotos.</p>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {images.map((im, i) => (
                    <div key={im.id} className="flex flex-wrap items-center gap-3 border border-line p-3">
                      <div className="relative h-24 w-20 shrink-0 bg-surface">
                        <Image src={im.url} alt="" fill sizes="80px" className="object-contain" />
                      </div>
                      <div className="flex min-w-[200px] flex-1 flex-col gap-2">
                        <label className="sr-only" htmlFor={`alt-${im.id}`}>Texto alternativo</label>
                        <input id={`alt-${im.id}`} defaultValue={im.alt} placeholder="Texto alternativo (qué se ve en la foto)" onBlur={(e) => e.target.value !== im.alt && updateImage(im.id, { alt: e.target.value })} className={input} />
                        <label className="sr-only" htmlFor={`kind-${im.id}`}>Tipo de foto</label>
                        <select id={`kind-${im.id}`} value={im.kind} onChange={(e) => updateImage(im.id, { kind: e.target.value })} className={input}>
                          {IMAGE_KINDS.map((k) => (
                            <option key={k.id} value={k.id}>{k.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" aria-label="Subir foto" disabled={i === 0} onClick={() => move(i, -1)} className="h-11 w-11 cursor-pointer border border-gunmetal/50 bg-transparent text-cream disabled:opacity-40">↑</button>
                        <button type="button" aria-label="Bajar foto" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="h-11 w-11 cursor-pointer border border-gunmetal/50 bg-transparent text-cream disabled:opacity-40">↓</button>
                        <button type="button" aria-label="Quitar foto" onClick={() => removeImage(im.id)} className="h-11 w-11 cursor-pointer border border-gunmetal/50 bg-transparent text-cream">×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <label className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-gunmetal/60 p-4 text-center">
                  <span className="font-semibold">Subir foto</span>
                  <span className="text-sm text-gunmetal">Foto real, vertical 4:5, fondo navy. Para cajas, PNG sin fondo. Puedes elegir varias.</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
                </label>
              </>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <label className={`${lbl} sm:col-span-2`}>
              Nombre
              <input
                value={d.name}
                onChange={(e) => {
                  set('name', e.target.value);
                  if (!slugTouched) set('slug', slugify(e.target.value));
                }}
                className={input}
              />
            </label>
            <label className={lbl}>
              Tipo
              <select value={d.type} onChange={(e) => set('type', e.target.value as PType)} className={input}>
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className={lbl}>
              Slug (URL)
              <input
                value={d.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', e.target.value);
                }}
                className={input}
              />
            </label>
            <label className={`${lbl} sm:col-span-2`}>
              Detalle
              <input value={d.short_detail} onChange={(e) => set('short_detail', e.target.value)} placeholder="Leaf Metal · Autógrafo" className={input} />
            </label>
            <label className={lbl}>
              Precio (Q)
              <input type="number" min={0} inputMode="numeric" value={d.price_gtq} onChange={(e) => set('price_gtq', e.target.value)} className={input} />
            </label>
            <label className={lbl}>
              Inventario <span className="font-normal text-gunmetal">(vacío = sin control)</span>
              <input type="number" min={0} inputMode="numeric" value={d.stock} onChange={(e) => set('stock', e.target.value)} className={input} />
            </label>
            {isBoxType && (
              <>
                <label className={lbl}>
                  Sobres por caja
                  <input type="number" min={1} value={d.packs} onChange={(e) => set('packs', e.target.value)} className={input} />
                </label>
                <label className={lbl}>
                  Tarjetas por sobre
                  <input type="number" min={1} value={d.cards_per_pack} onChange={(e) => set('cards_per_pack', e.target.value)} className={input} />
                </label>
              </>
            )}
            <label className={lbl}>
              Competencia
              <select value={d.competition} onChange={(e) => set('competition', e.target.value)} className={input}>
                {COMPETITIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className={lbl}>
              Orden en la tienda
              <input type="number" value={d.sort_order} onChange={(e) => set('sort_order', e.target.value)} className={input} />
            </label>
          </section>

          {isCard && (
            <section className="flex flex-col gap-4">
              <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                <legend className={`${small} mb-2`}>QUÉ TIENE LA TARJETA</legend>
                <p className="m-0 text-sm text-gunmetal">Marca solo lo que la tarjeta realmente es.</p>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((t) => {
                    const on = d.tags.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set('tags', on ? d.tags.filter((x) => x !== t) : [...d.tags, t])}
                        className={`min-h-11 cursor-pointer rounded-none px-3 text-[13px] font-semibold tracking-[0.04em] ${on ? 'border-0 bg-gold text-navy' : 'border border-gunmetal/50 bg-transparent text-cream'}`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <label className={lbl}>
                Categoría para combos
                <select value={d.combo_category} onChange={(e) => set('combo_category', e.target.value)} className={input}>
                  <option value="">No entra en combos</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </section>
          )}

          <label className="flex min-h-11 items-center gap-3 text-[15px] font-semibold">
            <input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} className="h-5 w-5 accent-[#F7F4E8]" />
            Mostrar en la vitrina y la rueda del Inicio
          </label>

          <section className="flex flex-col gap-4">
            <span className={small}>DATOS DE LA TARJETA</span>
            {d.specs.map((s, i) => (
              <div key={i} className="flex gap-2">
                <label className="sr-only" htmlFor={`spec-k-${i}`}>Dato</label>
                <input id={`spec-k-${i}`} value={s.k} placeholder="Año" onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} className={`${input} max-w-[180px]`} />
                <label className="sr-only" htmlFor={`spec-v-${i}`}>Valor</label>
                <input id={`spec-v-${i}`} value={s.v} placeholder="2024" onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} className={input} />
                <button type="button" aria-label="Quitar dato" onClick={() => set('specs', d.specs.filter((_, j) => j !== i))} className="h-11 w-11 shrink-0 cursor-pointer border border-gunmetal/50 bg-transparent text-cream">×</button>
              </div>
            ))}
            <button type="button" onClick={() => set('specs', [...d.specs, { k: '', v: '' }])} className="min-h-11 cursor-pointer self-start rounded-none border border-gunmetal/50 bg-transparent px-4 text-sm font-semibold text-cream">
              + Agregar dato
            </button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <span className={`${small} sm:col-span-2`}>LA HISTORIA</span>
            <label className={lbl}>
              Título
              <input value={d.story_title} onChange={(e) => set('story_title', e.target.value)} placeholder="El 9 con el brazalete" className={input} />
            </label>
            <label className={lbl}>
              Nota a mano (una frase corta)
              <input value={d.story_note} onChange={(e) => set('story_note', e.target.value)} placeholder="esta sí nos hizo gritar" className={input} />
            </label>
            <label className={`${lbl} sm:col-span-2`}>
              Texto
              <textarea value={d.story_body} onChange={(e) => set('story_body', e.target.value)} rows={4} className="w-full rounded-none border border-gunmetal/60 bg-navy p-3 text-[15px] text-cream" />
            </label>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <span className={`${small} sm:col-span-3`}>PRECIO DE REFERENCIA (OPCIONAL, SIEMPRE CON FUENTE Y FECHA)</span>
            <label className={lbl}>
              Monto (Q)
              <input type="number" min={0} value={d.ref_price_gtq} onChange={(e) => set('ref_price_gtq', e.target.value)} className={input} />
            </label>
            <label className={lbl}>
              Fuente
              <input value={d.ref_price_source} onChange={(e) => set('ref_price_source', e.target.value)} placeholder="eBay, venta cerrada" className={input} />
            </label>
            <label className={lbl}>
              Fecha
              <input type="date" value={d.ref_price_date} onChange={(e) => set('ref_price_date', e.target.value)} className={input} />
            </label>
          </section>

          <section className="flex flex-col gap-4">
            <span className={small}>SEO Y BÚSQUEDA CON IA</span>
            <label className={lbl}>
              <span className="flex justify-between">
                Título SEO <span className={d.seo_title.length > 60 ? 'text-gold' : 'text-gunmetal'}>{d.seo_title.length}/60</span>
              </span>
              <input value={d.seo_title} onChange={(e) => set('seo_title', e.target.value)} className={input} />
            </label>
            <label className={lbl}>
              <span className="flex justify-between">
                Descripción larga
                <span className={seoLen < 600 || seoLen > 1200 ? 'text-gold' : 'text-gunmetal'}>{seoLen} caracteres</span>
              </span>
              <textarea value={d.seo_description} onChange={(e) => set('seo_description', e.target.value)} rows={7} className="w-full rounded-none border border-gunmetal/60 bg-navy p-3 text-[15px] text-cream" />
              <span className="font-normal text-gunmetal">
                Recomendado: 600 a 1,200 caracteres. Escribe como hablarías con un cliente: nombre completo de la colección, contenido exacto y lo que es posible pero no garantizado.
              </span>
            </label>
            <span className={small}>ASÍ SE VERÍA EN GOOGLE</span>
            <SeoPreview slug={slugify(d.slug || d.name)} title={d.seo_title || d.name} description={d.seo_description} />
          </section>

          {error && <p role="alert" className="m-0 border border-gold p-3 text-sm font-semibold text-gold">{error}</p>}
        </div>

        <div className="sticky bottom-0 mt-auto flex flex-wrap items-center gap-3 border-t border-line bg-navy px-6 py-4">
          {!d.published && (
            <button type="button" disabled={busy} onClick={() => save(true)} className="min-h-11 cursor-pointer rounded-none border-0 bg-cream px-5 font-display text-lg uppercase text-navy shadow-hard disabled:opacity-60">
              Publicar en la tienda
            </button>
          )}
          <button type="button" disabled={busy} onClick={() => save()} className="min-h-11 cursor-pointer rounded-none border-0 bg-blue px-5 font-display text-lg uppercase text-cream shadow-hard disabled:opacity-60">
            {busy ? 'Guardando' : 'Guardar'}
          </button>
          {d.published && (
            <button type="button" disabled={busy} onClick={() => save(false)} className="min-h-11 cursor-pointer rounded-none border border-cream/50 bg-transparent px-4 text-sm font-semibold text-cream">
              Ocultar
            </button>
          )}
          {product && (
            <button type="button" disabled={busy} onClick={remove} className="ml-auto min-h-11 cursor-pointer rounded-none border-0 bg-transparent px-2 text-sm font-semibold text-gunmetal underline">
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
