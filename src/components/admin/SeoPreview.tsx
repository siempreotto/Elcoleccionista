import { SITE_URL } from '@/lib/env';

/** Vista previa estilo Google: URL, título y primeros 155 caracteres. */
export function SeoPreview({ slug, title, description }: { slug: string; title: string; description: string }) {
  const host = SITE_URL.replace(/^https?:\/\//, '');
  const snippet = description.length > 155 ? description.slice(0, 155).trimEnd() + '…' : description;
  return (
    <div className="flex flex-col gap-1 bg-cream p-4 text-[#202124]">
      <span className="text-[13px] text-[#4d5156]">{host} › producto › {slug || 'slug'}</span>
      <span className="text-lg leading-tight text-[#1a0dab]">{(title || 'Título SEO').slice(0, 70)}</span>
      <span className="text-sm leading-snug text-[#4d5156]">{snippet || 'La descripción aparece aquí.'}</span>
    </div>
  );
}
