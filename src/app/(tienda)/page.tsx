import Image from 'next/image';
import Link from 'next/link';
import { ComboCTA } from '@/components/home/ComboCTA';
import { ComboSelector } from '@/components/home/ComboSelector';
import { HeroBoxSequence } from '@/components/home/HeroBoxSequence';
import { InfiniteShowcase } from '@/components/home/InfiniteShowcase';
import { GlossaryGuide, HowWeWork, InstagramBlock, VendingSection } from '@/components/home/StaticSections';
import { UniverseWheel, type ShowcaseCard } from '@/components/home/UniverseWheel';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JsonLd, organizationJsonLd, websiteJsonLd } from '@/components/seo/JsonLd';
import { WhatsAppBuyButton } from '@/components/shop/WhatsAppBuyButton';
import { ProductCard } from '@/components/shop/ProductCard';
import { ArrowIcon, Label, PixelLabel, RarityBadge, SectionTitle } from '@/components/ui';
import { getCatalog, isBox } from '@/lib/catalog';
import { formatQ } from '@/lib/format';
import { comboPrice } from '@/lib/pricing';
import { productCardView, toBoxLite } from '@/lib/views';
import { productLabel } from '@/lib/whatsapp';

export const revalidate = 300;

export default async function HomePage() {
  const { products, featured, categories, settings } = await getCatalog();

  const showcase: ShowcaseCard[] = featured
    .filter((p) => p.cover)
    .map((p) => ({ url: p.cover!.url, alt: p.cover!.alt, href: p.published ? `/producto/${p.slug}` : null }));

  const boxes = products
    .filter(isBox)
    .sort((a, b) => (a.type === b.type ? a.sort_order - b.sort_order : a.type === 'value_box' ? -1 : 1))
    .map(toBoxLite);

  const newest = products
    .filter((p) => p.type === 'single_card')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4);

  const cheapest = categories[0];
  const pricing = {
    value_box_price: settings.value_box_price,
    mega_box_price: settings.mega_box_price,
    mega_combo_mode: settings.mega_combo_mode,
  };

  return (
    <>
      <JsonLd data={[organizationJsonLd(settings.instagram), websiteJsonLd()]} />
      <SiteHeader floating />
      <main id="contenido">
        <HeroBoxSequence />
        {showcase.length > 0 && <UniverseWheel cards={showcase} />}
        {showcase.length > 0 && <InfiniteShowcase cards={showcase} />}

        {newest.length > 0 && (
          <section aria-labelledby="nuevas-titulo" className="mx-auto max-w-[1280px] px-6 pb-28 pt-24">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionTitle id="nuevas-titulo" eyebrow="Recién llegadas">Lo nuevo en la vitrina</SectionTitle>
              <Link href="/tienda?tipo=suelta" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold">
                Ver toda la tienda <ArrowIcon />
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
              {newest.map((p) => (
                <ProductCard key={p.id} v={productCardView(p)} />
              ))}
            </div>
          </section>
        )}

        {boxes.length > 0 && categories.length > 0 && (
          <section id="cajas" aria-labelledby="cajas-titulo" className="bg-surface">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6 py-24">
              <div className="flex flex-wrap items-end justify-between gap-8">
                <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-4">
                  <PixelLabel>Combos El Coleccionista</PixelLabel>
                  <h2 id="cajas-titulo" className="m-0 font-display text-[44px] font-normal uppercase leading-none md:text-[64px]">
                    Caja + tarjeta.
                    <br />
                    Tu hit va asegurado.
                  </h2>
                  <p className="m-0 max-w-[620px] text-lg">
                    Tú no te preocupes: nuestro objetivo es que abrir cada caja sea especial, y sabemos que detrás de cada tarjeta hay una
                    historia. Por eso cada combo trae una caja sellada y una tarjeta sorpresa de la categoría que elijas.
                  </p>
                </div>
                <div className="flex flex-[0_1_380px] flex-col gap-2.5">
                  <Label>EN CADA CATEGORÍA PUEDE SALIR</Label>
                  <div className="flex flex-wrap gap-2">
                    {['NUMERADA', 'PATCH', 'FIRMA', 'ROOKIE', 'PARALELA', 'INSERT'].map((t) => (
                      <RarityBadge key={t} className="px-2.5 py-1">{t}</RarityBadge>
                    ))}
                  </div>
                </div>
              </div>

              <ComboSelector boxes={boxes} categories={categories} settings={pricing} whatsapp={settings.whatsapp} />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                {categories.map((c) => (
                  <article key={c.id} className="flex flex-col gap-3 border border-gunmetal/40 p-6">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-[44px] leading-none">{c.id}</span>
                      <span className="font-pixel text-[15px] font-bold text-gunmetal">Categoría</span>
                    </div>
                    <span className="flex-1 text-sm">{c.blurb}</span>
                    <div className="flex items-baseline justify-between border-t border-gunmetal/30 pt-3">
                      <span className="text-sm text-gunmetal">En combo</span>
                      <span className="font-display text-[28px]">{formatQ(comboPrice('value_box', c, pricing))}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-gunmetal">Tarjeta sola</span>
                      <span className="text-[15px] font-semibold">{formatQ(c.card_alone)}</span>
                    </div>
                  </article>
                ))}
              </div>
              <p className="m-0 text-sm text-gunmetal">
                En cada categoría puede salir una tarjeta numerada, patch, firma (autógrafo), rookie, paralela o insert. La C también puede ser una
                base de un jugador top.
              </p>
            </div>
          </section>
        )}

        {boxes.length > 0 && (
          <section id="selladas" aria-labelledby="selladas-titulo" className="mx-auto max-w-[1280px] px-6 pt-28">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <SectionTitle id="selladas-titulo" eyebrow="Producto sellado">Cajas selladas</SectionTitle>
              <Link href="/tienda?tipo=sellado" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold">
                Ver en la tienda <ArrowIcon />
              </Link>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
              {boxes.map((b) => (
                <article key={b.id} className="flex flex-col gap-3.5">
                  <Link href={`/producto/${b.slug}`} className="lift relative block aspect-square bg-surface">
                    {b.img && (
                      <Image src={b.img} alt={b.alt} fill sizes="(max-width: 640px) 90vw, 300px" className="object-contain p-6" />
                    )}
                  </Link>
                  <div className="flex flex-col gap-1.5">
                    <Label>{b.type === 'value_box' ? 'VALUE BOX' : 'MEGA BOX'}</Label>
                    <Link href={`/producto/${b.slug}`} className="font-display text-2xl uppercase leading-[1.05] no-underline">
                      {b.name}
                    </Link>
                    <span className="text-sm text-gunmetal">{b.detail}</span>
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="pt-2 font-display text-[28px] leading-none">{formatQ(b.price)}</span>
                    <WhatsAppBuyButton phone={settings.whatsapp} product={productLabel(b)} disabled={!b.available} />
                  </div>
                  {cheapest && <ComboCTA boxId={b.id} from={formatQ(comboPrice(b.type, cheapest, pricing))} />}
                </article>
              ))}
            </div>
          </section>
        )}

        <GlossaryGuide />
        <HowWeWork />
        <VendingSection />
        <InstagramBlock handle={settings.instagram} />
      </main>
    </>
  );
}
