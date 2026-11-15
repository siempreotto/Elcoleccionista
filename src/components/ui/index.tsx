import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-6 font-display uppercase text-[20px] leading-none no-underline rounded-none cursor-pointer transition-transform disabled:cursor-not-allowed disabled:opacity-60';
const variants: Record<Variant, string> = {
  primary: 'bg-cream text-navy shadow-hard hover:text-navy hover:-translate-x-0.5 hover:-translate-y-0.5',
  secondary: 'bg-blue text-cream shadow-hard hover:text-cream hover:-translate-x-0.5 hover:-translate-y-0.5',
  ghost: 'border border-cream/50 bg-navy text-cream font-sans normal-case text-sm font-semibold',
};

export function buttonClass(variant: Variant = 'primary', extra = '') {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Button({ variant = 'primary', className = '', ...props }: ComponentProps<'button'> & { variant?: Variant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ variant = 'primary', className = '', ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

/** Etiqueta de hasta 3 palabras en Pixelify Sans. */
export function PixelLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-pixel text-[18px] font-bold text-gunmetal ${className}`}>{children}</span>;
}

/** Insignia de rareza: solo dorado, solo para rareza o numeración. */
export function RarityBadge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-block bg-gold px-2 py-0.5 text-[13px] font-semibold tracking-[0.04em] text-navy ${className}`}>
      {children}
    </span>
  );
}

export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`text-[13px] font-semibold tracking-[0.04em] text-gunmetal ${className}`}>{children}</span>;
}

export function HandNote({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`font-note text-[30px] font-medium leading-none ${className}`}>{children}</span>;
}

export function SectionTitle({ id, eyebrow, children, className = '' }: { id?: string; eyebrow?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {eyebrow && <PixelLabel>{eyebrow}</PixelLabel>}
      <h2 id={id} className="m-0 font-display text-[40px] font-normal uppercase leading-none md:text-[56px]">
        {children}
      </h2>
    </div>
  );
}

export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Slab vacío para tarjetas sin foto: la letra de la categoría en dorado. */
export function EmptySlab({ letter, label = 'Foto real' }: { letter?: string; label?: string }) {
  return (
    <div className="flex aspect-[5/8] w-[58%] flex-col border-2 border-gunmetal/60">
      <div className="h-[16%] border-b-2 border-gunmetal/60" />
      <div className="m-2.5 flex flex-1 items-center justify-center rounded-[6px] bg-navy p-2 text-center">
        {letter ? (
          <span className="font-display text-[64px] leading-none text-gold">{letter}</span>
        ) : (
          <span className="font-pixel text-sm font-bold text-gunmetal">{label}</span>
        )}
      </div>
    </div>
  );
}
