'use server';
import { revalidateTag } from 'next/cache';
import { anonClient, CATALOG_TAG } from '@/lib/supabase/public';

export type CheckoutInput = {
  customer: {
    name: string;
    whatsapp: string;
    email?: string;
    delivery: 'envio' | 'recoger';
    department?: string;
    address?: string;
    payment_method: 'transferencia' | 'contra_entrega';
    notes?: string;
  };
  items: (
    | { kind: 'product'; product_id: string; qty: number }
    | { kind: 'combo'; box_product_id: string; category: string; qty: number }
    | { kind: 'surprise'; category: string; qty: number }
  )[];
};

export type CheckoutResult =
  | { ok: true; code: string; total: number; deliveryPending: boolean }
  | { ok: false; error: string };

const UUID = /^[0-9a-f-]{36}$/i;
const CATS = ['C', 'B', 'A', 'AAA'];

/**
 * Crea el pedido con public.place_order(): la base lee los precios vigentes,
 * valida inventario, descuenta y devuelve el código. Nunca usamos precios del cliente.
 */
export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const c = input?.customer;
  if (!c || !Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: 'Tu carrito está vacío.' };
  const items = input.items
    .slice(0, 30)
    .map((i) => {
      const qty = Math.max(1, Math.min(20, Math.floor(Number(i.qty) || 1)));
      if (i.kind === 'product' && UUID.test(i.product_id)) return { kind: 'product', product_id: i.product_id, qty };
      if (i.kind === 'combo' && UUID.test(i.box_product_id) && CATS.includes(i.category))
        return { kind: 'combo', box_product_id: i.box_product_id, category: i.category, qty };
      if (i.kind === 'surprise' && CATS.includes(i.category)) return { kind: 'surprise', category: i.category, qty };
      return null;
    })
    .filter(Boolean);
  if (items.length === 0) return { ok: false, error: 'Tu carrito está vacío.' };

  const customer = {
    name: String(c.name ?? '').slice(0, 120),
    whatsapp: String(c.whatsapp ?? '').slice(0, 20),
    email: String(c.email ?? '').slice(0, 254),
    delivery: c.delivery === 'recoger' ? 'recoger' : 'envio',
    department: String(c.department ?? '').slice(0, 120),
    address: String(c.address ?? '').slice(0, 400),
    payment_method: c.payment_method === 'contra_entrega' ? 'contra_entrega' : 'transferencia',
    notes: String(c.notes ?? '').slice(0, 1000),
  };

  const { data, error } = await anonClient().rpc('place_order', { payload: { customer, items } });
  if (error) {
    // Los mensajes de place_order están escritos para el cliente.
    const known = error.code === 'P0001' && error.message;
    if (!known) console.error('[checkout]', error.code, error.message);
    return { ok: false, error: known || 'No pudimos crear tu pedido. Intenta de nuevo o escríbenos.' };
  }
  const r = data as { code: string; total: number; delivery_cost_pending: boolean };
  revalidateTag(CATALOG_TAG);
  return { ok: true, code: r.code, total: r.total, deliveryPending: r.delivery_cost_pending };
}
