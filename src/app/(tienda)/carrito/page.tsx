import type { Metadata } from 'next';
import { CartView, type CartCatalog } from '@/components/cart/CartView';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getCatalog, inStock } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Tu carrito',
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const { products, categories, settings } = await getCatalog();
  const data: CartCatalog = {
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      type: p.type,
      detail: p.short_detail,
      price: p.price_gtq,
      stock: p.stock,
      available: inStock(p),
      img: p.cover?.url ?? null,
      rarity: p.type === 'single_card' ? (p.tags[0] ?? null) : null,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      combo_with_value_box: c.combo_with_value_box,
      combo_with_mega_box: c.combo_with_mega_box,
      card_alone: c.card_alone,
      stock: c.stock,
    })),
    settings: {
      value_box_price: settings.value_box_price,
      mega_box_price: settings.mega_box_price,
      mega_combo_mode: settings.mega_combo_mode,
      shipping_cost: settings.shipping_cost,
      pickup_point: settings.pickup_point,
      pickup_hours: settings.pickup_hours,
      instagram: settings.instagram,
      whatsapp: settings.whatsapp,
    },
  };
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[1280px] px-4 pb-24 pt-8 sm:px-6">
        <CartView data={data} />
      </main>
    </>
  );
}
