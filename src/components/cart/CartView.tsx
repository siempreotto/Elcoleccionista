'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { placeOrder } from '@/actions/checkout';
import { cart, useCart, type CartItem } from '@/lib/cart/store';
import { formatQ } from '@/lib/format';
import { boxBasePrice, comboPrice, type PricingCategory } from '@/lib/pricing';
import { buttonClass, EmptySlab, HandNote, RarityBadge } from '@/components/ui';

export type CartCatalog = {
  products: {
    id: string;
    slug: string;
    name: string;
    type: 'value_box' | 'mega_box' | 'single_card' | 'accessory';
    detail: string;
    price: number | null;
    stock: number | null;
    available: boolean;
    img: string | null;
    rarity: string | null;
  }[];
  categories: (PricingCategory & { stock: number | null })[];
  settings: {
    value_box_price: number;
    mega_box_price: number;
    mega_combo_mode: string;
    shipping_cost: number | null;
    pickup_point: string | null;
    pickup_hours: string | null;
    instagram: string;
    whatsapp: string | null;
  };
};

const DEPARTMENTS = [
  'Guatemala', 'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'El Progreso', 'Escuintla', 'Huehuetenango',
  'Izabal', 'Jalapa', 'Jutiapa', 'Petén', 'Quetzaltenango', 'Quiché', 'Retalhuleu', 'Sacatepéquez', 'San Marcos',
  'Santa Rosa', 'Sololá', 'Suchitepéquez', 'Totonicapán', 'Zacapa',
];

type Line = {
  item: CartItem;
  title: string;
  subtitle: string;
  badge: string | null;
  img: string | null;
  letter?: string;
  unit: number | null;
  max: number;
  problem: string | null;
};

function resolve(item: CartItem, data: CartCatalog): Line {
  const { products, categories, settings } = data;
  if (item.kind === 'product') {
    const p = products.find((x) => x.id === item.productId);
    if (!p || p.price === null) {
      return { item, title: 'Producto no disponible', subtitle: 'Ya no está en la vitrina', badge: null, img: null, unit: null, max: 0, problem: 'Ya no está disponible. Quítalo para continuar.' };
    }
    const max = p.stock ?? 20;
    return {
      item,
      title: p.name,
      subtitle: p.detail,
      badge: p.rarity,
      img: p.img,
      unit: p.price,
      max,
      problem: !p.available ? 'Se agotó. Quítalo para continuar.' : item.qty > max ? `Solo hay ${max} en existencia.` : null,
    };
  }
  const cat = categories.find((c) => c.id === item.category);
  if (item.kind === 'surprise') {
    if (!cat) return { item, title: 'Categoría no disponible', subtitle: '', badge: null, img: null, unit: null, max: 0, problem: 'Quítalo para continuar.' };
    const max = cat.stock ?? 20;
    return {
      item,
      title: `Tarjeta sorpresa categoría ${cat.id}`,
      subtitle: 'Numerada, patch, firma, rookie, paralela o insert',
      badge: null,
      img: null,
      letter: cat.id,
      unit: cat.card_alone,
      max,
      problem: cat.stock === 0 ? 'Se acabaron las tarjetas de esta categoría.' : item.qty > max ? `Quedan ${max} en esta categoría.` : null,
    };
  }
  const box = products.find((x) => x.id === item.boxProductId);
  if (!box || !cat || (box.type !== 'value_box' && box.type !== 'mega_box')) {
    return { item, title: 'Combo no disponible', subtitle: '', badge: null, img: null, unit: null, max: 0, problem: 'Quítalo para continuar.' };
  }
  const price = comboPrice(box.type, cat, settings);
  const savings = boxBasePrice(box.type, settings) + cat.card_alone - price;
  const max = Math.min(box.stock ?? 20, cat.stock ?? 20);
  return {
    item,
    title: `${box.name} + categoría ${cat.id}`,
    subtitle: `${box.type === 'value_box' ? 'Value box' : 'Mega box'} sellada + tarjeta sorpresa · Ahorras ${formatQ(savings)}`,
    badge: 'COMBO',
    img: box.img,
    unit: price,
    max,
    problem: !box.available || cat.stock === 0 ? 'Este combo se agotó.' : item.qty > max ? `Solo hay ${max} disponibles.` : null,
  };
}

export function CartView({ data }: { data: CartCatalog }) {
  const items = useCart();
  const lines = items.map((i) => resolve(i, data));
  const [delivery, setDelivery] = useState<'envio' | 'recoger'>('envio');
  const [payment, setPayment] = useState<'transferencia' | 'contra_entrega'>('transferencia');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; total: number; deliveryPending: boolean } | null>(null);
  const [pending, start] = useTransition();
  const { settings } = data;
  const pickupAvailable = Boolean(settings.pickup_point);

  const subtotal = lines.reduce((s, l) => s + (l.unit ?? 0) * l.item.qty, 0);
  const count = lines.reduce((n, l) => n + l.item.qty, 0);
  const shippingKnown = settings.shipping_cost !== null;
  const deliveryCost = delivery === 'envio' ? settings.shipping_cost ?? 0 : 0;
  const blocked = lines.some((l) => l.problem);

  if (done) {
    return (
      <section aria-labelledby="pedido-ok" className="mx-auto flex max-w-[640px] flex-col items-center gap-6 py-16 text-center">
        <span className="font-pixel text-lg font-bold text-gunmetal">Pedido recibido</span>
        <h1 id="pedido-ok" className="m-0 font-display text-[48px] font-normal uppercase leading-none md:text-[64px]">Ya viene en camino</h1>
        <p className="m-0 text-lg">
          Tu código de pedido es <strong className="font-display text-2xl tracking-wide">{done.code}</strong>. Total {formatQ(done.total)}
          {done.deliveryPending ? ' más el envío, que te confirmamos por WhatsApp' : ''}.
        </p>
        <p className="m-0 text-gunmetal">
          Te escribimos para coordinar el pago y la entrega. Mientras tanto, cuéntanos en Instagram qué te salió.
        </p>
        <HandNote className="text-[34px]">cada tarjeta tiene una historia</HandNote>
        <Link href="/" className={buttonClass('primary', 'min-h-[52px]')}>Volver al inicio</Link>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="mx-auto flex max-w-[640px] flex-col items-center gap-6 py-16 text-center">
        <h1 className="m-0 font-display text-[48px] font-normal uppercase leading-none">Tu carrito está vacío</h1>
        <p className="m-0 text-gunmetal">Arma un combo o elige una caja sellada: la vitrina te espera.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/tienda" className={buttonClass('primary', 'min-h-[52px]')}>Ver la tienda</Link>
          <Link href="/#cajas" className={buttonClass('secondary', 'min-h-[52px]')}>Armar un combo</Link>
        </div>
      </section>
    );
  }

  const submit = (form: FormData) => {
    setError(null);
    start(async () => {
      const res = await placeOrder({
        customer: {
          name: String(form.get('name') ?? ''),
          whatsapp: String(form.get('whatsapp') ?? ''),
          email: String(form.get('email') ?? ''),
          delivery,
          department: String(form.get('department') ?? ''),
          address: String(form.get('address') ?? ''),
          payment_method: payment,
          notes: String(form.get('notes') ?? ''),
        },
        items: items.map((i) =>
          i.kind === 'product'
            ? { kind: 'product', product_id: i.productId, qty: i.qty }
            : i.kind === 'combo'
              ? { kind: 'combo', box_product_id: i.boxProductId, category: i.category, qty: i.qty }
              : { kind: 'surprise', category: i.category, qty: i.qty },
        ),
      });
      if (res.ok) {
        cart.clear();
        setDone({ code: res.code, total: res.total, deliveryPending: res.deliveryPending });
        window.scrollTo({ top: 0 });
      } else {
        setError(res.error);
      }
    });
  };

  const input = 'h-12 w-full rounded-none border border-gunmetal/60 bg-navy px-3 text-[15px] text-cream';
  const lbl = 'flex flex-col gap-1.5 text-sm font-semibold';
  const stepTitle = 'm-0 font-display text-[28px] font-normal uppercase leading-none';
  const option = (on: boolean) =>
    `flex min-h-[72px] cursor-pointer flex-col justify-center gap-1 border px-4 py-3 text-left ${on ? 'border-cream bg-surface' : 'border-gunmetal/50 bg-transparent'}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none md:text-[64px]">Tu carrito</h1>
        <Link href="/tienda" className="inline-flex min-h-11 items-center text-sm font-semibold">Seguir viendo la vitrina</Link>
      </div>

      <form action={submit} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-10">
          <ul className="m-0 flex list-none flex-col p-0">
            {lines.map((l) => (
              <li key={l.item.key} className="flex gap-4 border-b border-line py-5">
                <div className="relative flex h-[120px] w-24 shrink-0 items-center justify-center bg-surface">
                  {l.img ? (
                    <Image src={l.img} alt="" fill sizes="96px" className="object-contain p-2" />
                  ) : (
                    <EmptySlab letter={l.letter} />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {l.badge && <RarityBadge className="self-start">{l.badge}</RarityBadge>}
                  <span className="font-display text-[22px] uppercase leading-[1.05]">{l.title}</span>
                  <span className="text-sm text-gunmetal">{l.subtitle}</span>
                  {l.problem && <span className="text-sm font-semibold text-gold" role="alert">{l.problem}</span>}
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <div className="flex items-center border border-gunmetal/50" role="group" aria-label={`Cantidad de ${l.title}`}>
                      <button type="button" aria-label="Quitar uno" onClick={() => cart.setQty(l.item.key, l.item.qty - 1)} className="h-11 w-11 cursor-pointer border-0 bg-transparent text-xl text-cream">−</button>
                      <span className="min-w-8 text-center font-semibold" aria-live="polite">{l.item.qty}</span>
                      <button type="button" aria-label="Agregar uno" disabled={l.item.qty >= l.max} onClick={() => cart.setQty(l.item.key, l.item.qty + 1)} className="h-11 w-11 cursor-pointer border-0 bg-transparent text-xl text-cream disabled:opacity-40">+</button>
                    </div>
                    <button type="button" onClick={() => cart.remove(l.item.key)} className="min-h-11 cursor-pointer border-0 bg-transparent text-sm text-gunmetal underline">
                      Quitar
                    </button>
                  </div>
                </div>
                <span className="font-display text-2xl leading-none">{l.unit !== null ? formatQ(l.unit * l.item.qty) : ''}</span>
              </li>
            ))}
          </ul>

          <fieldset id="entrega" className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className={stepTitle}>1. Entrega</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Entrega">
              <button type="button" role="radio" aria-checked={delivery === 'envio'} onClick={() => setDelivery('envio')} className={option(delivery === 'envio')}>
                <span className="font-semibold text-cream">Envío a domicilio</span>
                <span className="text-sm text-gunmetal">
                  A cualquier departamento de Guatemala{shippingKnown ? ` · ${formatQ(settings.shipping_cost)}` : '. Te confirmamos el costo por WhatsApp.'}
                </span>
              </button>
              {pickupAvailable && (
                <button type="button" role="radio" aria-checked={delivery === 'recoger'} onClick={() => setDelivery('recoger')} className={option(delivery === 'recoger')}>
                  <span className="font-semibold text-cream">Recoger en persona</span>
                  <span className="text-sm text-gunmetal">
                    {settings.pickup_point}
                    {settings.pickup_hours ? ` · ${settings.pickup_hours}` : ''}
                  </span>
                </button>
              )}
            </div>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className={stepTitle}>2. Tus datos</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className={lbl}>
                Nombre completo
                <input name="name" required minLength={2} maxLength={120} autoComplete="name" className={input} />
              </label>
              <label className={lbl}>
                WhatsApp
                <input name="whatsapp" required type="tel" inputMode="tel" pattern="\+?[0-9 \(\)\-]{8,20}" placeholder="+502 5555 5555" autoComplete="tel" className={input} />
              </label>
              <label className={`${lbl} sm:col-span-2`}>
                Correo (opcional)
                <input name="email" type="email" autoComplete="email" className={input} />
              </label>
              {delivery === 'envio' && (
                <>
                  <label className={lbl}>
                    Departamento
                    <select name="department" required className={input} defaultValue="Guatemala">
                      {DEPARTMENTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label className={lbl}>
                    Dirección de entrega
                    <input name="address" required maxLength={400} autoComplete="street-address" placeholder="Municipio, zona, calle y número" className={input} />
                  </label>
                </>
              )}
              <label className={`${lbl} sm:col-span-2`}>
                Notas (opcional)
                <textarea name="notes" maxLength={1000} rows={3} className="w-full rounded-none border border-gunmetal/60 bg-navy p-3 text-[15px] text-cream" />
              </label>
            </div>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
            <legend className={stepTitle}>3. Pago</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Método de pago">
              <button type="button" role="radio" aria-checked={payment === 'transferencia'} onClick={() => setPayment('transferencia')} className={option(payment === 'transferencia')}>
                <span className="font-semibold text-cream">Transferencia o depósito bancario</span>
                <span className="text-sm text-gunmetal">Te enviamos los datos de la cuenta por WhatsApp.</span>
              </button>
              <button type="button" role="radio" aria-checked={payment === 'contra_entrega'} onClick={() => setPayment('contra_entrega')} className={option(payment === 'contra_entrega')}>
                <span className="font-semibold text-cream">Pago al recibir</span>
                <span className="text-sm text-gunmetal">Pagas cuando tengas tu pedido en la mano.</span>
              </button>
            </div>
          </fieldset>
        </div>

        <aside aria-label="Resumen" className="flex h-fit flex-col gap-4 bg-surface p-6 lg:sticky lg:top-28">
          <h2 className="m-0 font-display text-[28px] font-normal uppercase leading-none">Resumen</h2>
          <div className="flex justify-between text-[15px]">
            <span>Subtotal · {count} {count === 1 ? 'artículo' : 'artículos'}</span>
            <span className="font-semibold">{formatQ(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[15px]">
            <span>{delivery === 'envio' ? 'Envío' : 'Recoger en persona'}</span>
            <span className="font-semibold">{delivery === 'recoger' ? 'Sin costo' : shippingKnown ? formatQ(deliveryCost) : 'Por confirmar'}</span>
          </div>
          <div className="flex items-baseline justify-between border-t border-gunmetal/40 pt-4">
            <span className="text-[15px] font-semibold">Total</span>
            <span className="font-display text-[40px] leading-none">{formatQ(subtotal + deliveryCost)}</span>
          </div>
          {error && (
            <p role="alert" className="m-0 border border-gold p-3 text-sm font-semibold text-gold">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || blocked}
            className="h-[60px] cursor-pointer rounded-none border-0 bg-cream font-display text-[22px] uppercase text-navy shadow-hard disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Enviando pedido' : 'Confirmar pedido'}
          </button>
          <p className="m-0 text-sm text-gunmetal">
            Revisamos cada tarjeta antes de enviarla. Si algo no coincide con la foto, te escribimos antes de despachar.
          </p>
        </aside>
      </form>
    </div>
  );
}
