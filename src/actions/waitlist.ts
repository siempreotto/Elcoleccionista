'use server';
import { anonClient } from '@/lib/supabase/public';

export type WaitlistState = { ok: boolean; message: string } | null;

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return { ok: false, message: 'Revisa tu correo.' };
  }
  const { error } = await anonClient().from('vending_waitlist').insert({ email });
  if (error && error.code !== '23505') {
    console.error('[waitlist]', error.message);
    return { ok: false, message: 'No pudimos guardar tu correo. Intenta de nuevo.' };
  }
  return { ok: true, message: 'Listo. Te avisamos cuando abramos la primera máquina.' };
}
