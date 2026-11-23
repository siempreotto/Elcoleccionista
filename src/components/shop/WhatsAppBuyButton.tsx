import { waBuyLink } from '@/lib/whatsapp';

/** Botón de compra: abre WhatsApp con el mensaje del producto. Sirve en Server y Client Components. */
export function WhatsAppBuyButton({
  phone,
  product,
  label = 'Comprar',
  size = 'sm',
  disabled = false,
  className = '',
}: {
  phone: string | null;
  product: string;
  label?: string;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
}) {
  const href = waBuyLink(phone, product);
  const cls =
    size === 'lg'
      ? 'flex h-[60px] w-full items-center justify-center font-display text-[22px] uppercase'
      : 'inline-flex min-h-11 items-center justify-center px-[18px] text-sm font-semibold';
  if (disabled || !href) {
    return (
      <span aria-disabled="true" className={`${cls} cursor-not-allowed bg-cream text-navy opacity-60 shadow-hard ${className}`}>
        {disabled ? 'Agotado' : label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={`${label} por WhatsApp: ${product}`}
      className={`${cls} bg-cream text-navy no-underline shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-navy ${className}`}
    >
      {label}
    </a>
  );
}
