'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { browserClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setPending(true);
        setError(null);
        const { error } = await browserClient().auth.signInWithPassword({
          email: String(f.get('email') ?? '').trim(),
          password: String(f.get('password') ?? ''),
        });
        setPending(false);
        if (error) {
          setError('Correo o contraseña incorrectos.');
          return;
        }
        router.replace('/admin');
        router.refresh();
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Correo
        <input name="email" type="email" required autoComplete="username" className="h-12 rounded-none border border-gunmetal/60 bg-navy px-3 text-cream" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Contraseña
        <input name="password" type="password" required autoComplete="current-password" className="h-12 rounded-none border border-gunmetal/60 bg-navy px-3 text-cream" />
      </label>
      {error && <p role="alert" className="m-0 text-sm font-semibold text-gold">{error}</p>}
      <button type="submit" disabled={pending} className="h-[52px] cursor-pointer rounded-none border-0 bg-cream font-display text-xl uppercase text-navy shadow-hard disabled:opacity-60">
        {pending ? 'Entrando' : 'Entrar'}
      </button>
    </form>
  );
}
