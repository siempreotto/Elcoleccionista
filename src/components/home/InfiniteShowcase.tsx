import type { ShowcaseCard } from './UniverseWheel';
import { PixelLabel } from '@/components/ui';

/** Vitrina infinita: fila en perspectiva que avanza sola (60 s), con la lista duplicada. */
export function InfiniteShowcase({ cards }: { cards: ShowcaseCard[] }) {
  const row = cards.length ? [...cards, ...cards] : [];
  return (
    <section aria-labelledby="vitrina-titulo" className="relative border-t border-gunmetal/30 pt-28">
      <div className="relative z-[2] mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-6 px-6">
        <div className="flex flex-col gap-3">
          <PixelLabel className="text-xl">Nivel 03</PixelLabel>
          <h2 id="vitrina-titulo" className="m-0 font-display text-[clamp(40px,6vw,88px)] font-normal uppercase leading-[0.95]">
            La vitrina no se detiene
          </h2>
        </div>
        <p className="m-0 max-w-[380px] text-[17px]">Todas las semanas entran tarjetas nuevas. Escríbenos si buscas una en particular.</p>
      </div>
      <div aria-hidden="true" className="ec-filabox relative overflow-hidden [perspective:1100px]">
        <div className="p3d ec-filatrack absolute left-[-4%] top-[90px] origin-left [transform:rotateY(36deg)_rotateX(8deg)]">
          <div className="p3d ec-row flex w-max gap-11">
            {row.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                className="ec-tile block max-w-none flex-none [transform:rotateY(-44deg)]"
                src={c.url}
                alt=""
                loading="lazy"
                decoding="async"
                width={400}
                height={500}
                style={{ width: 400, height: 500 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
