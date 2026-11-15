'use client';
import { COMBO_EVENT, type ComboSelectDetail } from './ComboSelector';

/** Botón "Llévala en combo": preselecciona la caja con categoría C y baja al selector. */
export function ComboCTA({ boxId, from }: { boxId: string; from: string }) {
  return (
    <a
      href="#cajas"
      onClick={() => {
        window.dispatchEvent(new CustomEvent<ComboSelectDetail>(COMBO_EVENT, { detail: { boxId, category: 'C' } }));
      }}
      className="ec-combo-btn flex flex-col gap-2 border-2 border-gold bg-blue px-4 py-3.5 text-cream no-underline shadow-hard"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="bg-gold px-2 py-[3px] text-[11px] font-semibold tracking-[0.06em] text-navy">HIT ASEGURADO</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F7F4E8" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
      <span className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-[22px] uppercase leading-[1.05]">Llévala en combo</span>
        <span className="font-display text-2xl leading-none text-gold">desde {from}</span>
      </span>
      <span className="text-[13px] font-medium leading-[1.35]">+ una tarjeta especial: autógrafo, numerada o patch</span>
    </a>
  );
}
