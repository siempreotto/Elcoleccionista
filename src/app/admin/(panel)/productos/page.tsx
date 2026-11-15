import { ProductsAdmin } from '@/components/admin/ProductsAdmin';
import { loadAdminCatalog } from '@/lib/admin-data';

export const metadata = { title: 'Productos e inventario' };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ editar?: string; nuevo?: string }> }) {
  const sp = await searchParams;
  const { products, categories } = await loadAdminCatalog();
  return (
    <ProductsAdmin
      initial={products}
      categories={categories.map((c) => c.id)}
      openId={sp.nuevo ? 'new' : (sp.editar ?? null)}
    />
  );
}
