import { CombosEditor } from '@/components/admin/CombosEditor';
import { loadAdminCatalog } from '@/lib/admin-data';

export const metadata = { title: 'Combos y ajustes' };

export default async function CombosPage() {
  const { categories, settings, products } = await loadAdminCatalog();
  const cardsByCat = Object.fromEntries(
    categories.map((c) => [c.id, products.filter((p) => p.combo_category === c.id && p.type === 'single_card').length]),
  );
  if (!settings) return <p>Falta la fila de ajustes en la base.</p>;
  return <CombosEditor categories={categories} settings={settings} assigned={cardsByCat} />;
}
