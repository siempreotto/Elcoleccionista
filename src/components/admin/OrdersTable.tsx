'use client';
import { useState } from 'react';
import { revalidateCatalog } from '@/actions/admin';
import type { Tables } from '@/lib/database.types';
import { formatDate, formatQ } from '@/lib/format';
import { browserClient } from '@/lib/supabase/browser';

type Order = Tables<'orders'> & { order_items: Tables<'order_items'>[] };
const STATUSES = ['nuevo', 'confirmado', 'pagado', 'enviado', 'entregado', 'cancelado'] as const;
const LABEL: Record<string, string> = { nuevo: 'Nuevo', confirmado: 'Confirmado', pagado: 'Pagado', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado' };
const PAY: Record<string, string> = { transferencia: 'Transferencia o depósito', contra_entrega: 'Pago al recibir' };

export function OrdersTable({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState<string>('todos');
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const shown = orders.filter((o) => filter === 'todos' || o.status === filter);

  async function setStatus(o: Order, status: Order['status']) {
    if (status === 'cancelado' && !window.confirm(`¿Cancelar el pedido ${o.code}? El inventario regresa a la tienda.`)) return;
    const prev = orders;
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status } : x)));
    const { error } = await browserClient().from('orders').update({ status }).eq('id', o.id);
    if (error) {
      setOrders(prev);
      setMsg(`No se guardó: ${error.message}`);
      return;
    }
    setMsg(`${o.code}: ${LABEL[status]}`);
    if (status === 'cancelado' || o.status === 'cancelado') await revalidateCatalog();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none">Pedidos</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {['todos', ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={`min-h-11 cursor-pointer rounded-none px-3 text-sm font-semibold ${filter === s ? 'border-0 bg-cream text-navy' : 'border border-gunmetal/50 bg-transparent text-cream'}`}
          >
            {s === 'todos' ? 'Todos' : LABEL[s]} ({s === 'todos' ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      <p aria-live="polite" className="m-0 min-h-5 text-sm font-semibold">{msg}</p>
      {shown.length === 0 ? (
        <div className="border border-line p-6">
          <p className="m-0 font-semibold">Sin pedidos</p>
          <p className="mb-0 mt-1 text-sm text-gunmetal">Aquí verás cada pedido con su estado cuando alguien confirme su carrito.</p>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {shown.map((o) => (
            <li key={o.id} className="border-b border-line py-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  aria-expanded={open === o.id}
                  onClick={() => setOpen(open === o.id ? null : o.id)}
                  className="flex min-h-11 min-w-[220px] flex-1 cursor-pointer flex-col items-start border-0 bg-transparent p-0 text-left text-cream"
                >
                  <span className="font-display text-xl leading-none">{o.code}</span>
                  <span className="text-sm text-gunmetal">
                    {o.customer_name} · {formatDate(o.created_at)}
                  </span>
                </button>
                <span className="font-display text-2xl leading-none">{formatQ(o.total)}</span>
                <label className="flex items-center gap-2 text-sm">
                  <span className="sr-only">Estado de {o.code}</span>
                  <select
                    value={o.status}
                    onChange={(e) => setStatus(o, e.target.value as Order['status'])}
                    className="h-11 rounded-none border border-gunmetal/60 bg-navy px-3 text-cream"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{LABEL[s]}</option>
                    ))}
                  </select>
                </label>
              </div>
              {open === o.id && (
                <div className="mt-4 grid gap-6 bg-surface p-5 md:grid-cols-2">
                  <dl className="m-0 flex flex-col gap-2 text-sm">
                    <div><dt className="text-gunmetal">WhatsApp</dt><dd className="m-0"><a href={`https://wa.me/${o.whatsapp.replace(/\D/g, '')}`}>{o.whatsapp}</a></dd></div>
                    {o.email && <div><dt className="text-gunmetal">Correo</dt><dd className="m-0"><a href={`mailto:${o.email}`}>{o.email}</a></dd></div>}
                    <div><dt className="text-gunmetal">Entrega</dt><dd className="m-0">{o.delivery === 'envio' ? `Envío · ${o.department ?? ''} · ${o.address ?? ''}` : 'Recoger en persona'}</dd></div>
                    <div><dt className="text-gunmetal">Pago</dt><dd className="m-0">{PAY[o.payment_method] ?? o.payment_method}</dd></div>
                    {o.notes && <div><dt className="text-gunmetal">Notas</dt><dd className="m-0 whitespace-pre-wrap">{o.notes}</dd></div>}
                  </dl>
                  <div className="flex flex-col gap-2 text-sm">
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                      {o.order_items.map((it) => (
                        <li key={it.id} className="flex justify-between gap-4">
                          <span>{it.qty} × {it.description}</span>
                          <span className="font-semibold">{formatQ(it.unit_price * it.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between border-t border-line pt-2"><span>Subtotal</span><span>{formatQ(o.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Envío</span><span>{o.delivery_cost_pending ? 'Por confirmar' : formatQ(o.delivery_cost)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Total</span><span>{formatQ(o.total)}</span></div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
