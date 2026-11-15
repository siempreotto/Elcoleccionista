create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status public.order_status not null default 'nuevo',
  customer_name text not null,
  whatsapp text not null,
  email text,
  delivery public.delivery_method not null,
  address text,
  department text,
  payment_method text not null check (payment_method in ('transferencia', 'contra_entrega')),
  subtotal integer not null check (subtotal >= 0),
  delivery_cost integer not null default 0 check (delivery_cost >= 0),
  delivery_cost_pending boolean not null default false,
  total integer not null check (total >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  kind public.order_item_kind not null,
  description text not null,
  qty integer not null check (qty > 0),
  unit_price integer not null check (unit_price >= 0),
  combo_box_product_id uuid references public.products (id) on delete set null,
  combo_category text references public.combo_categories (id) on update cascade on delete set null
);

create table public.vending_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);
create unique index vending_waitlist_email_key on public.vending_waitlist (lower(email));
