# El Coleccionista

Tienda en línea de tarjetas de fútbol coleccionables en Guatemala (`elcoleccionista.shop`) con CMS propio.

- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 · Supabase (Postgres, Auth, Storage, RLS) · Vercel.
- **Diseño y datos de origen:** `_handoff/` (pantallas `.dc.html`, marca, seed, secuencia del hero). No se publica.

## Desarrollo

```bash
pnpm install
cp .env.example .env.local   # completa la publishable key
pnpm dev
```

Comandos útiles: `pnpm lint`, `pnpm typecheck`, `pnpm test` (reglas de precio) y `pnpm build`.

Sin acceso a Supabase (por ejemplo, en un entorno con red restringida), `EC_CATALOG_FIXTURE=/ruta/catalogo.json pnpm dev` lee el catálogo de un JSON con la misma forma que la base. Nunca se activa en Vercel.

## Cómo está armado

| Área | Dónde |
|---|---|
| Inicio con animaciones (hero con 85 cuadros, rueda, vitrina, combos) | `src/app/(tienda)/page.tsx`, `src/components/home/` |
| Tienda con filtros en la URL | `src/app/(tienda)/tienda/page.tsx` |
| Ficha (tarjeta suelta y caja) | `src/app/(tienda)/producto/[slug]/page.tsx` |
| Carrito (localStorage) y checkout | `src/components/cart/CartView.tsx`, `src/actions/checkout.ts` |
| CMS | `src/app/admin/`, `src/components/admin/` |
| SEO y LLMs | `generateMetadata`, JSON-LD en `src/components/seo/JsonLd.tsx`, `sitemap.ts`, `robots.ts`, `/llms.txt`, `/llms-full.txt` |
| Reglas de precio | `src/lib/pricing.ts` (con pruebas) y `public.combo_price()` en SQL |
| Esquema y RLS | `supabase/migrations/` (aplicadas en el proyecto `el-coleccionista`) |
| Datos iniciales | `supabase/seed.sql` (generado con `scripts/build-seed-sql.py`) |

**Precios:** ningún precio vive en el código. Todo sale de `settings`, `combo_categories` y `products`. Los pedidos se crean solo con `public.place_order()`, que recalcula los precios en la base, valida el inventario y lo descuenta en una transacción. Al cancelar un pedido desde el CMS, el inventario regresa.

**Imágenes:** las del catálogo inicial viven en `public/catalog/`. Las que subes desde el CMS van al bucket público `products` de Supabase Storage.
