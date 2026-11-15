import Image from 'next/image';
import Link from 'next/link';
import { LoginForm } from '@/components/admin/LoginForm';

export const metadata = { title: 'Login admin' };

export default function LoginPage() {
  return (
    <main id="contenido" className="flex min-h-svh items-center justify-center px-4 py-12">
      <div className="notch flex w-full max-w-[420px] flex-col gap-6 bg-surface p-8">
        <Image src="/brand/logo-reducido.svg" alt="El Coleccionista" width={120} height={71} className="h-auto w-[120px]" priority />
        <div className="flex flex-col gap-2">
          <span className="font-pixel text-lg font-bold text-gunmetal">Panel</span>
          <h1 className="m-0 font-display text-[40px] font-normal uppercase leading-none">Login admin</h1>
          <p className="m-0 text-sm text-gunmetal">Escribe tu correo y tu contraseña.</p>
        </div>
        <LoginForm />
        <Link href="/" className="text-sm font-semibold">Volver a la tienda</Link>
      </div>
    </main>
  );
}
