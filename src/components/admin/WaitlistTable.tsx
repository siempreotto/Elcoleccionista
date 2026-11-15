'use client';
import type { Tables } from '@/lib/database.types';
import { formatDate } from '@/lib/format';

export function WaitlistTable({ rows }: { rows: Tables<'vending_waitlist'>[] }) {
  const download = () => {
    const csv = ['correo,fecha', ...rows.map((r) => `"${r.email.replace(/"/g, '""')}",${r.created_at}`)].join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-vending-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none">Lista de espera de vending</h1>
        <button type="button" disabled={rows.length === 0} onClick={download} className="min-h-11 cursor-pointer rounded-none border-0 bg-cream px-5 font-display text-lg uppercase text-navy shadow-hard disabled:opacity-60">
          Exportar CSV
        </button>
      </div>
      <p className="m-0 text-gunmetal">{rows.length} {rows.length === 1 ? 'correo' : 'correos'}</p>
      <ul className="m-0 flex list-none flex-col p-0">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap justify-between gap-4 border-b border-line py-3 text-[15px]">
            <span className="font-semibold">{r.email}</span>
            <span className="text-gunmetal">{formatDate(r.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
