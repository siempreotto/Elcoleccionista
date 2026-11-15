create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.combo_categories (
  id text primary key check (id in ('C', 'B', 'A', 'AAA')),
  combo_with_value_box integer not null check (combo_with_value_box >= 0),
  combo_with_mega_box integer check (combo_with_mega_box >= 0),
  card_alone integer not null check (card_alone >= 0),
  stock integer check (stock >= 0),
  blurb text not null default '',
  position integer not null default 0,
  updated_at timestamptz not null default now()
);
comment on column public.combo_categories.combo_with_mega_box is 'Solo se usa si settings.mega_combo_mode = manual.';
comment on column public.combo_categories.stock is 'Tarjetas sorpresa disponibles. null = sin control de inventario.';

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(name) between 1 and 160),
  type public.product_type not null,
  short_detail text not null default '',
  price_gtq integer check (price_gtq >= 0),
  stock integer check (stock >= 0),
  published boolean not null default false,
  featured boolean not null default false,
  seo_title text not null default '',
  seo_description text not null default '',
  packs integer check (packs > 0),
  cards_per_pack integer check (cards_per_pack > 0),
  tags text[] not null default '{}' check (tags <@ array['AUTO','NUMERADA','PATCH','ROOKIE','PARALELA','INSERT']::text[]),
  combo_category text references public.combo_categories (id) on update cascade on delete set null,
  competition text check (competition in ('selecciones', 'ligas_europeas', 'mls', 'liga_mx')),
  specs jsonb not null default '[]'::jsonb check (jsonb_typeof(specs) = 'array'),
  story_title text not null default '',
  story_note text not null default '',
  story_body text not null default '',
  ref_price_gtq integer check (ref_price_gtq >= 0),
  ref_price_source text,
  ref_price_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_needs_price check (not published or price_gtq is not null)
);
comment on column public.products.stock is 'null = sin control de inventario.';
comment on column public.products.featured is 'Mostrar en la rueda y la vitrina del Inicio.';

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger combo_categories_updated_at before update on public.combo_categories
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  kind text not null default 'frente' check (kind in ('frente', 'firma', 'reverso', 'otra')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.settings (
  id boolean primary key default true check (id),
  value_box_price integer not null check (value_box_price >= 0),
  mega_box_price integer not null check (mega_box_price >= 0),
  mega_combo_mode text not null default 'diferencia' check (mega_combo_mode in ('diferencia', 'manual')),
  whatsapp text,
  instagram text not null default 'elcoleccionistacom',
  shipping_cost integer check (shipping_cost >= 0),
  pickup_point text,
  pickup_hours text,
  updated_at timestamptz not null default now()
);
create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();
