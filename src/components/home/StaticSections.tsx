import Image from 'next/image';
import { PixelLabel, RarityBadge, SectionTitle } from '@/components/ui';
import { VendingWaitlistForm } from './VendingWaitlistForm';

const TERMS = [
  { sigla: 'RC', titulo: 'Rookie card', texto: 'RC es la tarjeta que marca el debut de un jugador en una colección oficial.' },
  { sigla: 'AUTO', titulo: 'Autógrafo', texto: 'Lleva la firma del jugador, sobre la tarjeta o en una etiqueta adherida.' },
  { sigla: '10/50', titulo: 'Numerada', texto: 'Trae un número de serie: 10/50 es la décima de solo cincuenta.' },
  { sigla: 'PATCH', titulo: 'Patch', texto: 'Incluye un pedazo de tela de una camiseta usada por el jugador.' },
];

export function GlossaryGuide() {
  return (
    <section id="aprende" aria-labelledby="aprende-titulo" className="mx-auto max-w-[1280px] px-6 py-28">
      <div className="mb-10 flex flex-col gap-2">
        <SectionTitle id="aprende-titulo" eyebrow="Guía">Antes de abrir tu primer sobre</SectionTitle>
        <p className="mb-0 mt-2 max-w-[620px] text-[17px]">Lo que dice una tarjeta, explicado como te lo contaría un amigo que sabe.</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {TERMS.map((t) => (
          <article key={t.sigla} className="notch flex min-h-[220px] flex-col gap-4 bg-surface px-6 py-7">
            <RarityBadge className="self-start px-2.5 py-1">{t.sigla}</RarityBadge>
            <h3 className="m-0 font-display text-[26px] font-normal uppercase leading-[1.05]">{t.titulo}</h3>
            <p className="m-0 text-[15px]">{t.texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HowWeWork() {
  const items = [
    {
      t: 'Fotos reales',
      d: 'Lo que ves es la tarjeta que recibes: frente, reverso y esquinas.',
      icon: (
        <>
          <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
          <circle cx="12" cy="13" r="3.5" />
        </>
      ),
    },
    {
      t: 'Precio claro',
      d: 'Así está su condición, y este es el precio. Sin vueltas.',
      icon: (
        <>
          <path d="M3 12l9-9h8v8l-9 9z" />
          <circle cx="15.5" cy="8.5" r="1.5" />
        </>
      ),
    },
    { t: 'Te acompañamos', d: 'Escríbenos antes de comprar y te contamos la historia de cada tarjeta.', icon: <path d="M4 5h16v11H9l-5 4z" /> },
  ];
  return (
    <section aria-labelledby="promesa-titulo" className="border-y border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap gap-12 px-6 py-[72px]">
        <h2 id="promesa-titulo" className="m-0 flex-[1_1_280px] font-display text-[44px] font-normal uppercase leading-[1.02]">
          Así trabajamos
        </h2>
        <div className="grid flex-[3_1_640px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
          {items.map((i) => (
            <div key={i.t} className="flex flex-col gap-2.5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F7F4E8" strokeWidth="1.8" aria-hidden="true">
                {i.icon}
              </svg>
              <span className="text-[17px] font-semibold">{i.t}</span>
              <span className="text-[15px] text-gunmetal">{i.d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VendingSection() {
  return (
    <section id="vending" aria-labelledby="vending-titulo" className="mx-auto max-w-[1280px] px-6 py-28">
      <div className="notch flex flex-wrap items-stretch bg-surface">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col justify-center gap-5 p-7 md:p-14">
          <PixelLabel>Próximamente</PixelLabel>
          <h2 id="vending-titulo" className="m-0 font-display text-[40px] font-normal uppercase leading-none md:text-[56px]">
            La vitrina sale a la calle
          </h2>
          <p className="m-0 max-w-[460px] text-[17px]">
            Estamos preparando máquinas de El Coleccionista en Ciudad de Guatemala. Déjanos tu correo y te avisamos dónde abrimos la primera.
          </p>
          <VendingWaitlistForm />
        </div>
        <div className="relative min-h-[360px] min-w-0 flex-[1_1_420px]">
          <Image
            src="/photos/caja-mensaje.webp"
            alt="Caja de El Coleccionista abierta con la frase Cada tarjeta tiene una historia"
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export function InstagramBlock({ handle }: { handle: string }) {
  return (
    <section className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-6 pb-28 text-center">
      <span className="font-note text-[40px] font-medium leading-[1.1]">las aperturas, en vivo</span>
      <a
        href={`https://instagram.com/${handle}`}
        rel="noopener"
        className="break-all font-display text-[clamp(32px,6vw,80px)] uppercase leading-none no-underline"
      >
        @{handle}
      </a>
    </section>
  );
}
