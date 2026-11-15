import { WaitlistTable } from '@/components/admin/WaitlistTable';
import { serverClient } from '@/lib/supabase/server';

export const metadata = { title: 'Lista de espera de vending' };

export default async function VendingPage() {
  const sb = await serverClient();
  const { data } = await sb.from('vending_waitlist').select('*').order('created_at', { ascending: false });
  return <WaitlistTable rows={data ?? []} />;
}
