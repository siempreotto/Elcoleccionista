import Image from 'next/image';
import Link from 'next/link';
import { EmptySlab, Label, RarityBadge } from '@/components/ui';

export type CardView = {
  href: string | null;
  img: string | null;
  alt: string;
  rarity?: string | null;
  status: string;
  name: string;
  detail: string;
  price: string;
  emptyLetter?: string;
  contain?: boolean;
};

/** Ficha de la vitrina: foto real 4:5, rareza en dorado, nombre en Anton y precio. */
export function ProductCard({ v, priority = false }: { v: CardView; priority?: boolean }) {
  const body = (
    <>
      <div className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-surface ${v.contain ? 'p-6' : ''}`}>
        {v.img ? (
          <Image
            src={v.img}
            alt={v.alt}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
            className={v.contain ? 'object-contain p-6' : 'rounded-card object-cover'}
            priority={priority}
          />
        ) : (
          <EmptySlab letter={v.emptyLetter} />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex min-h-[22px] flex-wrap items-center gap-2">
          {v.rarity && <RarityBadge>{v.rarity}</RarityBadge>}
          <Label>{v.status}</Label>
        </div>
        <span className="font-display text-[26px] uppercase leading-[1.05]">{v.name}</span>
        <span className="text-sm text-gunmetal">{v.detail}</span>
        {v.price && <span className="pt-1 font-display text-2xl leading-none">{v.price}</span>}
      </div>
    </>
  );
  return v.href ? (
    <Link href={v.href} className="lift flex flex-col gap-4 text-cream no-underline hover:text-cream">
      {body}
    </Link>
  ) : (
    <div className="flex flex-col gap-4">{body}</div>
  );
}
