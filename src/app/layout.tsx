import type { Metadata, Viewport } from 'next';
import { Anton, Caveat, Inter, Pixelify_Sans } from 'next/font/google';
import { SITE_NAME, SITE_URL } from '@/lib/env';
import './globals.css';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });
const pixelify = Pixelify_Sans({ subsets: ['latin'], weight: '700', variable: '--font-pixelify', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: '500', variable: '--font-caveat', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'El Coleccionista · Tarjetas de fútbol coleccionables en Guatemala',
    template: '%s · El Coleccionista',
  },
  description:
    'Tarjetas de fútbol coleccionables en Guatemala: cajas selladas de Panini y Topps, combos con tarjeta sorpresa y tarjetas sueltas con foto real. Cada tarjeta tiene una historia.',
  applicationName: SITE_NAME,
  icons: { icon: '/brand/avatar.svg' },
  openGraph: {
    type: 'website',
    locale: 'es_GT',
    siteName: SITE_NAME,
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Caja de El Coleccionista abierta' }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#07122D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-GT" className={`${anton.variable} ${inter.variable} ${pixelify.variable} ${caveat.variable}`}>
      <body>
        <a href="#contenido" className="sr-only-focusable fixed left-4 top-4 z-[100] bg-cream px-4 py-3 font-semibold text-navy">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
