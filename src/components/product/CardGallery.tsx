'use client';
import Image from 'next/image';
import { useState } from 'react';

const KIND_LABEL: Record<string, string> = { frente: 'Frente', firma: 'Detalle de la firma', reverso: 'Reverso', otra: 'Detalle' };

export function CardGallery({ images, name, contain = false }: { images: { url: string; alt: string; kind: string }[]; name: string; contain?: boolean }) {
  const [i, setI] = useState(0);
  const current = images[i];
  return (
    <div className="flex flex-col gap-4">
      <div className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-surface`}>
        {current ? (
          <Image
            src={current.url}
            alt={current.alt || name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className={contain ? 'object-contain p-8' : 'rounded-card object-contain p-4'}
          />
        ) : (
          <span className="font-pixel text-sm font-bold text-gunmetal">Foto real</span>
        )}
      </div>
      {images.length > 1 && (
        <div role="tablist" aria-label="Fotos" className="flex gap-3">
          {images.map((img, n) => (
            <button
              key={img.url + n}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={KIND_LABEL[img.kind] ?? `Foto ${n + 1}`}
              onClick={() => setI(n)}
              className={`relative h-24 w-20 cursor-pointer overflow-hidden rounded-none bg-surface p-0 ${n === i ? 'border-2 border-cream' : 'border border-gunmetal/35'}`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
