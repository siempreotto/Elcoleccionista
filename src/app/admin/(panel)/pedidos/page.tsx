import { OrdersTable } from '@/components/admin/OrdersTable';
import { serverClient } from '@/lib/supabase/server';

export const metadata = { title: 'Pedidos' };

export default async function OrdersPage() {
  const sb = await serverClient();
  const { data } = await sb.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(300);
  return <OrdersTable initial={data ?? []} />;
}
