'use client';
import { useState, type ReactNode } from 'react';

/** En celular los filtros se abren con un botón; en escritorio siempre están visibles. */
export function FiltersToggle({ active, children }: { active: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="panel-filtros"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 cursor-pointer items-center justify-between border border-gunmetal/50 bg-transparent px-4 text-sm font-semibold text-cream lg:hidden"
      >
        <span>Filtros{active ? ` (${active})` : ''}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div id="panel-filtros" className={`${open ? 'flex' : 'hidden'} flex-col gap-4 lg:flex`}>
        {children}
      </div>
    </>
  );
}
