'use client';
import { useEffect, useRef } from 'react';
import { preload } from 'react-dom';
import { clamp01, easeInOutCubic as ease, sectionProgress, usePrefersReducedMotion, useScrollFrame } from '@/lib/motion';

const FRAME_COUNT = 85;
const frameSrc = (i: number) => `/hero/s${String(i).padStart(3, '0')}.webp`;
// En el último cuadro la tarjeta mide 58.9% del alto y su centro está en (50.5%, 51.4%).
const CARD_HEIGHT_PCT = 0.589;
const HD_W = 522;
const HD_H = 683;
const SPARKS = 14;

/**
 * Hero con scroll: la caja se abre (85 cuadros en canvas), la cámara se acerca a la tarjeta,
 * se funde con la tarjeta HD de Suárez y entramos al universo. Valores de renderVals() de Main.dc.html.
 */
export function HeroBoxSequence() {
  preload(frameSrc(0), { as: 'image', fetchPriority: 'high' });
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<(SVGSVGElement | null)[]>([]);
  const frames = useRef<HTMLImageElement[]>([]);
  const want = useRef(0);
  const drawn = useRef(-1);
  const reduced = usePrefersReducedMotion();

  const draw = (i: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    let k = i;
    while (k >= 0 && !(frames.current[k]?.complete && frames.current[k].naturalWidth)) k--;
    if (k < 0 || k === drawn.current) return;
    cv.getContext('2d')?.drawImage(frames.current[k], 0, 0, cv.width, cv.height);
    drawn.current = k;
  };

  // Cuadro 0 de inmediato; el resto se precarga en orden después del primer paint.
  useEffect(() => {
    const load = (i: number) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => {
        if (i <= want.current && i > drawn.current) draw(want.current);
      };
      im.src = frameSrc(i);
      frames.current[i] = im;
    };
    load(0);
    const start = () => {
      for (let i = 1; i < FRAME_COUNT; i++) load(i);
    };
    if (document.readyState === 'complete') {
      const id = window.setTimeout(start, 150);
      return () => window.clearTimeout(id);
    }
    window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  useScrollFrame(() => {
    const section = sectionRef.current;
    if (!section) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const p = reduced ? 0.76 : sectionProgress(section);

    const frame = Math.round(clamp01((p - 0.03) / 0.63) * (FRAME_COUNT - 1));
    want.current = reduced ? FRAME_COUNT - 1 : frame;
    draw(want.current);

    const pw = Math.min(1000, 0.92 * vw, (4 / 3) * 0.84 * vh);
    const ph = pw * 0.75;
    const ow = Math.min(360, 0.62 * vw, (0.6 * vh * HD_W) / HD_H);
    const oh = (ow * HD_H) / HD_W;
    const sEnd = Math.max(1, oh / (CARD_HEIGHT_PCT * ph));
    const b = ease(clamp01((p - 0.36) / 0.32));
    const c = ease(clamp01((p - 0.66) / 0.08));
    const d = ease(clamp01((p - 0.8) / 0.2));
    const tx = -0.005 * pw * b;
    const ty = (-0.08 * vh - 0.014 * ph) * b;

    const photo = photoRef.current;
    if (photo) {
      photo.style.width = `${pw}px`;
      photo.style.height = `${ph}px`;
      photo.style.marginLeft = `${-pw / 2}px`;
      photo.style.marginTop = `${-ph / 2}px`;
      photo.style.transform = `translate(${tx}px, ${ty}px) scale(${1 + (sEnd - 1) * b})`;
      photo.style.opacity = String(1 - c);
    }
    const intro = introRef.current;
    if (intro) {
      intro.style.opacity = reduced ? '1' : String(1 - clamp01(p / 0.06));
      intro.style.transform = reduced ? 'none' : `translateY(${-50 * clamp01(p / 0.06)}px)`;
    }
    if (hintRef.current) hintRef.current.style.opacity = reduced ? '0' : String(1 - clamp01(p / 0.04));
    const card = cardRef.current;
    if (card) {
      card.style.width = `${ow}px`;
      card.style.transform = `rotateX(${12 * (1 - c)}deg) scale(${1 + 3.2 * d})`;
      card.style.opacity = String(c * (1 - d));
    }
    if (captionRef.current) captionRef.current.style.opacity = String(clamp01((p - 0.72) / 0.06) * (1 - clamp01(d * 4)));
    sparksRef.current.forEach((el, i) => {
      if (!el) return;
      const ang = i * (360 / SPARKS) + (i % 2) * 9;
      const dist = 140 + 620 * d + (i % 3) * 40;
      el.style.transform = `translate(-50%, -50%) rotate(${ang}deg) translateY(${-dist}px) scale(${0.6 + 1.8 * d})`;
      el.style.opacity = String(clamp01(d * 5) * (1 - clamp01((d - 0.75) / 0.25)));
    });
  }, [reduced]);

  return (
    <section ref={sectionRef} id="ec-intro" className="ec-intro relative" aria-label="Abre la caja">
      <div className="ec-stage sticky top-0 flex items-center justify-center overflow-hidden [perspective:1600px]">
        <div ref={introRef} className="absolute left-0 right-0 top-[10vh] z-[5] flex flex-col items-center gap-2.5 px-6 text-center">
          <span className="font-pixel text-xl font-bold text-gunmetal">Nivel 01</span>
          <h1 className="m-0 max-w-[820px] font-display text-[clamp(40px,5vw,72px)] font-normal uppercase leading-[0.98]">
            Cada tarjeta tiene una historia
          </h1>
        </div>

        <div
          ref={photoRef}
          className="absolute left-1/2 top-[58%] [transform-origin:50.5%_51.4%] [mask-image:radial-gradient(closest-side,#000_78%,transparent_100%)] [-webkit-mask-image:radial-gradient(closest-side,#000_78%,transparent_100%)]"
          style={{ width: 'min(1000px, 92vw)', aspectRatio: '4 / 3' }}
        >
          <canvas
            ref={canvasRef}
            width={960}
            height={720}
            role="img"
            aria-label="Se abre la caja de El Coleccionista y aparece la tarjeta autografiada de Luis Suárez"
            className="absolute inset-0 block h-full w-full"
          />
        </div>

        <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-0 w-0">
          {Array.from({ length: SPARKS }, (_, i) => (
            <svg
              key={i}
              ref={(el) => {
                sparksRef.current[i] = el;
              }}
              width="18"
              height="18"
              viewBox="0 0 3 3"
              className="absolute left-0 top-0"
              style={{ opacity: 0 }}
            >
              <rect x="1" y="0" width="1" height="3" fill="#FFC632" />
              <rect x="0" y="1" width="3" height="1" fill="#FFC632" />
            </svg>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center [perspective:1200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={cardRef}
            src="/hero/suarez-card-flat.webp"
            alt="Tarjeta autografiada de Luis Suárez, Leaf Metal"
            width={HD_W}
            height={HD_H}
            decoding="async"
            className="h-auto rounded-[10px]"
            style={{ width: 'min(360px, 62vw)', opacity: 0 }}
          />
        </div>

        <div className="pointer-events-none absolute bottom-[6vh] left-0 right-0 flex justify-center">
          <div ref={captionRef} className="flex flex-col items-center gap-1" style={{ opacity: 0 }}>
            <span className="font-note text-[34px] font-medium leading-none">esta sí nos hizo gritar</span>
            <span className="text-[13px] font-semibold tracking-[0.04em] text-gunmetal">LUIS SUÁREZ · LEAF METAL · AUTO</span>
          </div>
        </div>

        <div ref={hintRef} className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-gunmetal">DESLIZA PARA ABRIR LA CAJA</span>
          <svg className="ec-hint" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F7F4E8" strokeWidth="2" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
