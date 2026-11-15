'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { clamp01, easeInOutCubic as ease, sectionProgress, usePrefersReducedMotion, useScrollFrame } from '@/lib/motion';
import { buttonClass } from '@/components/ui';

export type ShowcaseCard = { url: string; alt: string; href: string | null };

/** Rueda de slabs: gira sola (48 s) y con el scroll pasa de rotateX(64°) con aspas a plana y de frente. */
export function UniverseWheel({ cards }: { cards: ShowcaseCard[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<(HTMLImageElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const step = 360 / Math.max(1, cards.length);

  useScrollFrame(() => {
    const section = sectionRef.current;
    if (!section) return;
    const q = reduced ? 1 : sectionProgress(section);
    const u = ease(clamp01(q / 0.7));
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const k = Math.min(1, Math.min(vw - 24, 0.46 * vh * 1.1) / 600);
    if (wheelRef.current) wheelRef.current.style.transform = `rotateX(${64 * (1 - u)}deg) scale(${k * (0.78 + 0.22 * u)})`;
    const blade = 80 * (1 - u);
    tilesRef.current.forEach((el, i) => {
      if (el) el.style.transform = `rotate(${i * step}deg) translateY(-206px) translateX(22px) rotateY(${blade}deg)`;
    });
    if (textRef.current) {
      textRef.current.style.opacity = String(0.25 + 0.75 * clamp01(q / 0.35));
      textRef.current.style.transform = `translateY(${40 * (1 - clamp01(q / 0.35))}px)`;
    }
  }, [reduced, cards.length]);

  return (
    <section ref={sectionRef} id="ec-universo" className="ec-uni relative" aria-labelledby="universo-titulo">
      <div className="ec-stage sticky top-0 mx-auto box-border flex max-w-[1360px] flex-wrap content-center items-center justify-center gap-x-6 gap-y-4 overflow-hidden px-6 pb-4 pt-[88px]">
        <div ref={textRef} className="flex max-w-[480px] flex-[1_1_340px] flex-col gap-3 md:gap-5">
          <span className="font-pixel text-xl font-bold text-gunmetal">Nivel 02</span>
          <h2 id="universo-titulo" className="m-0 font-display text-[clamp(48px,6vw,92px)] font-normal uppercase leading-[0.95]">
            Bienvenido al universo
          </h2>
          <p className="m-0 max-w-[420px] text-base md:text-lg">
            RC, autógrafos, patches y numeradas. Cada una con foto real, su condición y el precio de frente.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/tienda" className={buttonClass('primary', 'min-h-[52px] px-[26px]')}>Entrar a la vitrina</Link>
            <Link href="/#aprende" className={buttonClass('secondary', 'min-h-[52px] px-[26px]')}>Qué significa cada una</Link>
          </div>
        </div>
        <div className="ec-wheelbox relative flex min-w-0 flex-[1_1_520px] items-center justify-center [perspective:1400px]">
          <div ref={wheelRef} className="p3d relative h-0 w-0">
            <div className="p3d ec-spin absolute left-0 top-0 h-0 w-0">
              {cards.map((c, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.url + i}
                  ref={(el) => {
                    tilesRef.current[i] = el;
                  }}
                  className="ec-tile absolute block max-w-none"
                  src={c.url}
                  alt={c.alt}
                  decoding="async"
                  width={132}
                  height={165}
                  style={{ left: -66, top: -82, width: 132, height: 165, transform: `rotate(${i * step}deg) translateY(-206px) translateX(22px) rotateY(80deg)` }}
                />
              ))}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-reducido.svg" alt="" width={128} height={76} className="absolute h-auto max-w-none" style={{ left: -64, top: -38, width: 128 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
