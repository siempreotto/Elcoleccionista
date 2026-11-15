import { SiteFooter } from '@/components/layout/SiteFooter';
import { getCatalog } from '@/lib/catalog';

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getCatalog();
  return (
    <div className="overflow-x-clip">
      {children}
      <SiteFooter instagram={settings.instagram} whatsapp={settings.whatsapp} />
    </div>
  );
}
