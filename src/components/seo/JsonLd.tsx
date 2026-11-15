import type { Product } from '@/lib/catalog';
import { inStock } from '@/lib/catalog';
import { SITE_NAME, SITE_URL } from '@/lib/env';

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  // Escapamos "<" para que ningún texto pueda cerrar la etiqueta <script>.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export function organizationJsonLd(instagram: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-principal.svg`,
    slogan: 'Cada tarjeta tiene una historia',
    areaServed: { '@type': 'Country', name: 'Guatemala' },
    sameAs: [`https://instagram.com/${instagram}`],
  };
}

export function websiteJsonLd(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'es-GT',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/tienda?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

function brandOf(name: string): string | undefined {
  if (/panini|donruss|prizm|select/i.test(name)) return 'Panini';
  if (/topps|merlin/i.test(name)) return 'Topps';
  if (/leaf/i.test(name)) return 'Leaf';
  if (/\bSP\b|upper deck/i.test(name)) return 'Upper Deck';
  return undefined;
}

export function productJsonLd(p: Product): Json {
  const url = `${SITE_URL}/producto/${p.slug}`;
  const brand = brandOf(`${p.name} ${p.short_detail}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: p.seo_title || p.name,
    description: p.seo_description || p.short_detail,
    sku: p.slug,
    url,
    image: p.images.map((i) => (i.url.startsWith('http') ? i.url : `${SITE_URL}${i.url}`)),
    category: p.type === 'single_card' ? 'Tarjetas de fútbol coleccionables' : 'Cajas selladas de tarjetas de fútbol',
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'GTQ',
      price: p.price_gtq ?? undefined,
      availability: inStock(p) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      areaServed: 'GT',
    },
  };
}
