'use client';
import { useActionState } from 'react';
import { joinWaitlist, type WaitlistState } from '@/actions/waitlist';

export function VendingWaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, null);
  return (
    <form action={action} className="flex flex-wrap gap-3 pt-2">
      <label htmlFor="correo-vending" className="sr-only">Tu correo</label>
      <input
        id="correo-vending"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@correo.com"
        className="h-[52px] flex-[1_1_240px] rounded-none border border-gunmetal/60 bg-navy px-4 text-[15px] text-cream"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-[52px] cursor-pointer rounded-none border-0 bg-cream px-7 font-display text-xl uppercase text-navy shadow-hard disabled:opacity-60"
      >
        {pending ? 'Enviando' : 'Avísame'}
      </button>
      <p aria-live="polite" className={`m-0 w-full text-sm ${state?.ok ? 'text-cream' : 'text-gold'}`}>
        {state?.message}
      </p>
    </form>
  );
}
