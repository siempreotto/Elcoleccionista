'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { revalidateCatalog } from '@/actions/admin';
import type { Tables } from '@/lib/database.types';
import { formatQ } from '@/lib/format';
import { comboPrice, comboSavings } from '@/lib/pricing';
import { browserClient } from '@/lib/supabase/browser';

type Cat = Tables<'combo_categories'>;
type Settings = Tables<'settings'>;
const input = 'h-11 w-full rounded-none border border-gunmetal/60 bg-navy px-3 text-[15px] text-cream';
const lbl = 'flex flex-col gap-1.5 text-sm font-semibold';
const small = 'text-[13px] font-semibold tracking-[0.04em] text-gunmetal';
const num = (s: string) => (s.trim() === '' ? null : Math.max(0, Math.round(Number(s))));

export function CombosEditor({ categories, settings, assigned }: { categories: Cat[]; settings: Settings; assigned: Record<string, number> }) {
  const router = useRouter();
  const [s, setS] = useState(settings);
  const [cats, setCats] = useState(categories);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sb = browserClient();
  const pricing = { value_box_price: s.value_box_price, mega_box_price: s.mega_box_price, mega_combo_mode: s.mega_combo_mode };

  const setCat = (id: string, values: Partial<Cat>) => setCats((list) => list.map((c) => (c.id === id ? { ...c, ...values } : c)));

  async function save() {
    setBusy(true);
    setMsg(null);
    const st = await sb
      .from('settings')
      .update({
        value_box_price: s.value_box_price,
        mega_box_price: s.mega_box_price,
        mega_combo_mode: s.mega_combo_mode,
        whatsapp: s.whatsapp?.trim() || null,
        instagram: s.instagram.trim().replace(/^@/, '') || 'elcoleccionistacom',
        shipping_cost: s.shipping_cost,
        pickup_point: s.pickup_point?.trim() || null,
        pickup_hours: s.pickup_hours?.trim() || null,
      })
      .eq('id', true);
    const results = await Promise.all(
      cats.map((c) =>
        sb
          .from('combo_categories')
          .update({
            combo_with_value_box: c.combo_with_value_box,
            combo_with_mega_box: c.combo_with_mega_box,
            card_alone: c.card_alone,
            stock: c.stock,
            blurb: c.blurb,
          })
          .eq('id', c.id),
      ),
    );
    setBusy(false);
    const err = st.error ?? results.find((r) => r.error)?.error;
    if (err) return setMsg(`No se guardó: ${err.message}`);
    await revalidateCatalog();
    setMsg('Guardado. La tienda ya muestra los nuevos precios.');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[44px] font-normal uppercase leading-none">Combos y tarjetas sorpresa</h1>
        <p className="m-0 max-w-[720px] text-gunmetal">
          Precios por categoría y cuántas tarjetas tienes disponibles para armar combos. El precio con mega box suma la diferencia entre mega box y
          value box, salvo que elijas ponerlo a mano.
        </p>
      </div>

      <section className="grid max-w-[720px] gap-4 sm:grid-cols-3">
        <label className={lbl}>
          <span className={small}>VALUE BOX SOLA (Q)</span>
          <input type="number" min={0} value={s.value_box_price} onChange={(e) => setS({ ...s, value_box_price: num(e.target.value) ?? 0 })} className={input} />
        </label>
        <label className={lbl}>
          <span className={small}>MEGA BOX SOLA (Q)</span>
          <input type="number" min={0} value={s.mega_box_price} onChange={(e) => setS({ ...s, mega_box_price: num(e.target.value) ?? 0 })} className={input} />
        </label>
        <label className={lbl}>
          <span className={small}>COMBO CON MEGA BOX</span>
          <select value={s.mega_combo_mode} onChange={(e) => setS({ ...s, mega_combo_mode: e.target.value })} className={input}>
            <option value="diferencia">Automático (+ diferencia)</option>
            <option value="manual">Precio manual</option>
          </select>
        </label>
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {cats.map((c) => (
          <article key={c.id} className="flex flex-col gap-3 border border-line p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[44px] leading-none">{c.id}</span>
              <span className="font-pixel text-[15px] font-bold text-gunmetal">Categoría</span>
            </div>
            <label className={lbl}>
              Combo con value box (Q)
              <input type="number" min={0} value={c.combo_with_value_box} onChange={(e) => setCat(c.id, { combo_with_value_box: num(e.target.value) ?? 0 })} className={input} />
            </label>
            {s.mega_combo_mode === 'manual' && (
              <label className={lbl}>
                Combo con mega box (Q)
                <input type="number" min={0} value={c.combo_with_mega_box ?? ''} onChange={(e) => setCat(c.id, { combo_with_mega_box: num(e.target.value) })} className={input} />
              </label>
            )}
            <label className={lbl}>
              Tarjeta sola (Q)
              <input type="number" min={0} value={c.card_alone} onChange={(e) => setCat(c.id, { card_alone: num(e.target.value) ?? 0 })} className={input} />
            </label>
            <label className={lbl}>
              Tarjetas disponibles <span className="font-normal text-gunmetal">(vacío = sin límite)</span>
              <input type="number" min={0} value={c.stock ?? ''} onChange={(e) => setCat(c.id, { stock: num(e.target.value) })} className={input} />
            </label>
            <label className={lbl}>
              Texto
              <textarea value={c.blurb} rows={2} onChange={(e) => setCat(c.id, { blurb: e.target.value })} className="w-full rounded-none border border-gunmetal/60 bg-navy p-3 text-[15px] text-cream" />
            </label>
            <dl className="m-0 flex flex-col gap-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-gunmetal">Combo con mega box:</dt><dd className="m-0 font-semibold">{formatQ(comboPrice('mega_box', c, pricing))}</dd></div>
              <div className="flex justify-between"><dt className="text-gunmetal">El cliente ahorra (value):</dt><dd className="m-0 font-semibold">{formatQ(comboSavings('value_box', c, pricing))}</dd></div>
              <div className="flex justify-between"><dt className="text-gunmetal">El cliente ahorra (mega):</dt><dd className="m-0 font-semibold">{formatQ(comboSavings('mega_box', c, pricing))}</dd></div>
              <div className="flex justify-between"><dt className="text-gunmetal">Tarjetas sueltas asignadas:</dt><dd className="m-0 font-semibold">{assigned[c.id] ?? 0}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      <section className="flex max-w-[720px] flex-col gap-4">
        <h2 className="m-0 font-display text-[32px] font-normal uppercase leading-none">Ajustes de la tienda</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={lbl}>
            WhatsApp (con código de país)
            <input value={s.whatsapp ?? ''} placeholder="+502 5555 5555" onChange={(e) => setS({ ...s, whatsapp: e.target.value })} className={input} />
          </label>
          <label className={lbl}>
            Instagram (sin @)
            <input value={s.instagram} onChange={(e) => setS({ ...s, instagram: e.target.value })} className={input} />
          </label>
          <label className={lbl}>
            Costo de envío (Q) <span className="font-normal text-gunmetal">(vacío = se confirma por WhatsApp)</span>
            <input type="number" min={0} value={s.shipping_cost ?? ''} onChange={(e) => setS({ ...s, shipping_cost: num(e.target.value) })} className={input} />
          </label>
          <label className={lbl}>
            Punto para recoger <span className="font-normal text-gunmetal">(vacío = sin opción de recoger)</span>
            <input value={s.pickup_point ?? ''} onChange={(e) => setS({ ...s, pickup_point: e.target.value })} className={input} />
          </label>
          <label className={lbl}>
            Horario para recoger
            <input value={s.pickup_hours ?? ''} onChange={(e) => setS({ ...s, pickup_hours: e.target.value })} className={input} />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" disabled={busy} onClick={save} className="min-h-[52px] cursor-pointer rounded-none border-0 bg-cream px-6 font-display text-xl uppercase text-navy shadow-hard disabled:opacity-60">
          {busy ? 'Guardando' : 'Guardar cambios'}
        </button>
        <span aria-live="polite" className="text-sm font-semibold">{msg}</span>
      </div>
    </div>
  );
}
