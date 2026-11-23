import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { BoxComboPicker } from '@/components/product/BoxComboPicker';
import { CardGallery } from '@/components/product/CardGallery';
import { breadcrumbJsonLd, JsonLd, productJsonLd } from '@/components/seo/JsonLd';
import { WhatsAppBuyButton } from '@/components/shop/WhatsAppBuyButton';
import { ProductCard } from '@/components/shop/ProductCard';
import { HandNote, Label, RarityBadge } from '@/components/ui';
import { COMPETITION_LABEL, getCatalog, getProductBySlug, inStock, isBox, specsOf, TYPE_LABEL } from '@/lib/catalog';
import { SITE_URL } from '@/lib/env';
import { formatQ } from '@/lib/format';
import { productCardView, rarityOf } from '@/lib/views';
import { productLabel } from '@/lib/whatsapp';

export const revalidate = 300;

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: 'Producto no encontrado' };
  const title = p.seo_title || `${p.name} · ${p.short_detail}`;
  const description = (p.seo_description || `${p.name}, ${p.short_detail}. Foto real y precio claro en El Coleccionista, Guatemala.`).slice(0, 300);
  const image = p.cover ? (p.cover.url.startsWith('http') ? p.cover.url : `${SITE_URL}${p.cover.url}`) : undefined;
  return {
    title: { absolute: `${title} · El Coleccionista` },
    description,
    alternates: { canonical: `/producto/${p.slug}` },
    openGraph: { type: 'website', title, description, url: `/producto/${p.slug}`, images: image ? [{ url: image, alt: p.cover?.alt }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, catalog] = await Promise.all([getProductBySlug(slug), getCatalog()]);
  if (!p) notFound();
  const { settings, categories, products } = catalog;
  const box = isBox(p);
  const available = inStock(p);
  const specs = specsOf(p);
  const rarity = box ? null : rarityOf(p);
  const related = products.filter((x) => x.id !== p.id && x.type === p.type).slice(0, 4);
  const pricing = { value_box_price: settings.value_box_price, mega_box_price: settings.mega_box_price, mega_combo_mode: settings.mega_combo_mode };
  const section = box ? { name: 'Cajas selladas', path: '/tienda?tipo=sellado' } : { name: 'Tarjetas sueltas', path: '/tienda?tipo=suelta' };

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(p),
          breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Tienda', path: '/tienda' }, section, { name: p.name, path: `/producto/${p.slug}` }]),
        ]}
      />
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[1280px] px-4 pb-24 pt-8 sm:px-6">
        <nav aria-label="Migas de pan" className="mb-6 flex flex-wrap gap-1 text-sm text-gunmetal">
          <Link href="/" className="text-gunmetal">Inicio</Link> <span aria-hidden="true">/</span>
          <Link href={section.path} className="text-gunmetal">{section.name}</Link> <span aria-hidden="true">/</span>
          <span>{p.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-16">
          <CardGallery images={p.images} name={p.name} contain={box} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              {rarity && <RarityBadge>{rarity}</RarityBadge>}
              <Label>
                {box ? TYPE_LABEL[p.type] : 'TARJETA SUELTA'} · {available ? (p.stock !== null ? `DISPONIBLE · ${p.stock} EN EXISTENCIA` : 'DISPONIBLE') : 'AGOTADA'}
              </Label>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none md:text-[64px]">{p.name}</h1>
              <p className="m-0 text-lg text-gunmetal">{p.short_detail}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-[56px] leading-none">{formatQ(p.price_gtq)}</span>
              {p.ref_price_gtq && p.ref_price_source && p.ref_price_date && (
                <span className="text-sm text-gunmetal">
                  Precio de referencia: {formatQ(p.ref_price_gtq)} · {p.ref_price_source}, {new Date(p.ref_price_date + 'T12:00:00').toLocaleDateString('es-GT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className="flex max-w-[420px] flex-col gap-3">
              <WhatsAppBuyButton
                phone={settings.whatsapp}
                product={productLabel(p)}
                disabled={!available}
                label="Comprar por WhatsApp"
                size="lg"
              />
              <p className="m-0 text-sm text-gunmetal">Se abre WhatsApp con tu mensaje listo para enviar. Ahí coordinamos pago y entrega.</p>
            </div>

            {box && p.packs && p.cards_per_pack && (
              <dl className="m-0 grid grid-cols-3 gap-px border border-line bg-[rgb(137_147_163/0.35)]">
                {[
                  ['Sobres', p.packs],
                  ['Tarjetas por sobre', p.cards_per_pack],
                  ['Tarjetas en total', p.packs * p.cards_per_pack],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1 bg-navy p-4">
                    <dt className="text-[13px] font-semibold tracking-[0.04em] text-gunmetal">{String(k).toUpperCase()}</dt>
                    <dd className="m-0 font-display text-[32px] leading-none">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {box && categories.length > 0 && (
              <BoxComboPicker boxName={p.name} boxType={p.type} categories={categories} settings={pricing} disabled={!available} whatsapp={settings.whatsapp} />
            )}

            {specs.length > 0 && (
              <dl className="m-0 border-t border-line">
                {specs.map((s) => (
                  <div key={s.k} className="flex justify-between gap-4 border-b border-line py-3 text-[15px]">
                    <dt className="text-gunmetal">{s.k}</dt>
                    <dd className="m-0 text-right font-semibold">{s.v}</dd>
                  </div>
                ))}
                {p.competition && (
                  <div className="flex justify-between gap-4 border-b border-line py-3 text-[15px]">
                    <dt className="text-gunmetal">Competencia</dt>
                    <dd className="m-0 text-right font-semibold">{COMPETITION_LABEL[p.competition]}</dd>
                  </div>
                )}
              </dl>
            )}

            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
              <li>Envío a domicilio en Guatemala{settings.shipping_cost !== null ? ` · ${formatQ(settings.shipping_cost)}` : ''}</li>
              {settings.pickup_point && <li>Recoge en {settings.pickup_point}{settings.pickup_hours ? ` · ${settings.pickup_hours}` : ''}</li>}
            </ul>
          </div>
        </div>

        {(p.story_title || p.story_body) && (
          <section aria-labelledby="historia" className="mt-20 grid gap-6 border-t border-line pt-12 md:grid-cols-[1fr_2fr]">
            <div className="flex flex-col gap-3">
              <span className="font-pixel text-lg font-bold text-gunmetal">La historia</span>
              <h2 id="historia" className="m-0 font-display text-[40px] font-normal uppercase leading-none">{p.story_title}</h2>
              {p.story_note && <HandNote className="text-[34px]">{p.story_note}</HandNote>}
            </div>
            <p className="m-0 max-w-[680px] text-lg">{p.story_body}</p>
          </section>
        )}

        {p.seo_description && (
          <section aria-labelledby="descripcion" className="mt-16 border-t border-line pt-12">
            <h2 id="descripcion" className="m-0 mb-4 font-display text-[32px] font-normal uppercase leading-none">
              {box ? 'Qué trae esta caja' : 'Sobre esta tarjeta'}
            </h2>
            <p className="m-0 max-w-[820px] text-[17px] leading-relaxed">{p.seo_description}</p>
            {box && (
              <p className="mb-0 mt-4 max-w-[820px] text-sm text-gunmetal">
                Lo que sale en cada caja es suerte: los autógrafos y paralelos que mencionamos son posibles, no garantizados. Coleccionamos por
                el gusto de coleccionar; ninguna caja es una inversión.
              </p>
            )}
          </section>
        )}

        {related.length > 0 && (
          <section aria-labelledby="relacionados" className="mt-20">
            <h2 id="relacionados" className="m-0 mb-8 font-display text-[40px] font-normal uppercase leading-none">También en la vitrina</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
              {related.map((r) => (
                <ProductCard key={r.id} v={productCardView(r)} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
