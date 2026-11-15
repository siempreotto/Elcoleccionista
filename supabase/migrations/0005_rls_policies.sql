alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.combo_categories enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.vending_waitlist enable row level security;
alter table public.admins enable row level security;

-- Catálogo: el público ve lo publicado; los admins ven todo.
create policy products_select on public.products for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy products_insert on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy products_update on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy products_delete on public.products for delete to authenticated
  using ((select public.is_admin()));

create policy product_images_select on public.product_images for select to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and p.published)
    or (select public.is_admin())
  );
create policy product_images_insert on public.product_images for insert to authenticated
  with check ((select public.is_admin()));
create policy product_images_update on public.product_images for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy product_images_delete on public.product_images for delete to authenticated
  using ((select public.is_admin()));

create policy combo_categories_select on public.combo_categories for select to anon, authenticated
  using (true);
create policy combo_categories_insert on public.combo_categories for insert to authenticated
  with check ((select public.is_admin()));
create policy combo_categories_update on public.combo_categories for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy combo_categories_delete on public.combo_categories for delete to authenticated
  using ((select public.is_admin()));

create policy settings_select on public.settings for select to anon, authenticated
  using (true);
create policy settings_update on public.settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Pedidos: solo admins. El público crea pedidos únicamente con public.place_order().
create policy orders_admin_select on public.orders for select to authenticated
  using ((select public.is_admin()));
create policy orders_admin_update on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy orders_admin_delete on public.orders for delete to authenticated
  using ((select public.is_admin()));
create policy order_items_admin_select on public.order_items for select to authenticated
  using ((select public.is_admin()));

-- Lista de espera: el público solo inserta.
create policy vending_waitlist_insert on public.vending_waitlist for insert to anon, authenticated
  with check (true);
create policy vending_waitlist_admin_select on public.vending_waitlist for select to authenticated
  using ((select public.is_admin()));
create policy vending_waitlist_admin_delete on public.vending_waitlist for delete to authenticated
  using ((select public.is_admin()));

create policy admins_select on public.admins for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Precio de combo: única fuente de verdad en la base (src/lib/pricing.ts replica esta regla).
create or replace function public.combo_price(box_type public.product_type, category_id text)
returns integer
language plpgsql
stable
set search_path = ''
as $$
declare
  s public.settings;
  c public.combo_categories;
begin
  select * into s from public.settings where id;
  select * into c from public.combo_categories where id = category_id;
  if c.id is null then
    raise exception 'Categoría de combo inválida';
  end if;
  if box_type = 'value_box' then
    return c.combo_with_value_box;
  elsif box_type = 'mega_box' then
    if s.mega_combo_mode = 'manual' and c.combo_with_mega_box is not null then
      return c.combo_with_mega_box;
    end if;
    return c.combo_with_value_box + (s.mega_box_price - s.value_box_price);
  end if;
  raise exception 'Solo las value box y las mega box entran en combo';
end;
$$;

create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  cust jsonb := payload -> 'customer';
  items jsonb := payload -> 'items';
  it jsonb;
  s public.settings;
  p public.products;
  b public.products;
  c public.combo_categories;
  v_qty integer;
  v_price integer;
  v_subtotal integer := 0;
  v_delivery public.delivery_method;
  v_delivery_cost integer := 0;
  v_pending boolean := false;
  v_order_id uuid;
  v_code text;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_lines jsonb := '[]'::jsonb;
  v_name text := btrim(coalesce(cust ->> 'name', ''));
  v_whatsapp text := btrim(coalesce(cust ->> 'whatsapp', ''));
  v_email text := nullif(btrim(coalesce(cust ->> 'email', '')), '');
  v_address text := nullif(btrim(coalesce(cust ->> 'address', '')), '');
  v_department text := nullif(btrim(coalesce(cust ->> 'department', '')), '');
  v_payment text := cust ->> 'payment_method';
  v_notes text := nullif(btrim(coalesce(cust ->> 'notes', '')), '');
begin
  if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Tu carrito está vacío';
  end if;
  if jsonb_array_length(items) > 30 then
    raise exception 'Demasiados artículos en un pedido';
  end if;
  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'Escribe tu nombre completo';
  end if;
  if v_whatsapp !~ '^\+?[0-9 ()-]{8,20}$' then
    raise exception 'Revisa tu número de WhatsApp';
  end if;
  if v_email is not null and (length(v_email) > 254 or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'Revisa tu correo';
  end if;
  if v_payment is null or v_payment not in ('transferencia', 'contra_entrega') then
    raise exception 'Elige un método de pago';
  end if;
  if (cust ->> 'delivery') not in ('envio', 'recoger') then
    raise exception 'Elige cómo quieres recibir tu pedido';
  end if;
  v_delivery := (cust ->> 'delivery')::public.delivery_method;
  if v_delivery = 'envio' and (v_address is null or v_department is null) then
    raise exception 'Escribe tu dirección y departamento';
  end if;
  if length(coalesce(v_notes, '')) > 1000 or length(coalesce(v_address, '')) > 400 then
    raise exception 'El texto es demasiado largo';
  end if;

  select * into s from public.settings where id;

  for it in select * from jsonb_array_elements(items) loop
    v_qty := coalesce((it ->> 'qty')::integer, 0);
    if v_qty < 1 or v_qty > 20 then
      raise exception 'Cantidad inválida';
    end if;

    if it ->> 'kind' = 'product' then
      select * into p from public.products
        where id = (it ->> 'product_id')::uuid and published
        for update;
      if p.id is null or p.price_gtq is null then
        raise exception 'Un producto de tu carrito ya no está disponible';
      end if;
      if p.stock is not null then
        if p.stock < v_qty then
          raise exception 'No hay suficiente inventario de %', p.name;
        end if;
        update public.products set stock = stock - v_qty where id = p.id;
      end if;
      v_price := p.price_gtq;
      v_lines := v_lines || jsonb_build_object('kind', 'product', 'product_id', p.id, 'description', p.name, 'qty', v_qty, 'unit_price', v_price);

    elsif it ->> 'kind' = 'combo' then
      select * into b from public.products
        where id = (it ->> 'box_product_id')::uuid and published and type in ('value_box', 'mega_box')
        for update;
      if b.id is null then
        raise exception 'La caja de tu combo ya no está disponible';
      end if;
      select * into c from public.combo_categories where id = it ->> 'category' for update;
      if c.id is null then
        raise exception 'Categoría de combo inválida';
      end if;
      if b.stock is not null then
        if b.stock < v_qty then
          raise exception 'No hay suficiente inventario de %', b.name;
        end if;
        update public.products set stock = stock - v_qty where id = b.id;
      end if;
      if c.stock is not null then
        if c.stock < v_qty then
          raise exception 'Se acabaron las tarjetas de categoría %', c.id;
        end if;
        update public.combo_categories set stock = stock - v_qty where id = c.id;
      end if;
      v_price := public.combo_price(b.type, c.id);
      v_lines := v_lines || jsonb_build_object('kind', 'combo', 'product_id', null, 'combo_box_product_id', b.id, 'combo_category', c.id,
        'description', 'Combo ' || b.name || ' + tarjeta categoría ' || c.id, 'qty', v_qty, 'unit_price', v_price);

    elsif it ->> 'kind' = 'surprise' then
      select * into c from public.combo_categories where id = it ->> 'category' for update;
      if c.id is null then
        raise exception 'Categoría inválida';
      end if;
      if c.stock is not null then
        if c.stock < v_qty then
          raise exception 'Se acabaron las tarjetas de categoría %', c.id;
        end if;
        update public.combo_categories set stock = stock - v_qty where id = c.id;
      end if;
      v_price := c.card_alone;
      v_lines := v_lines || jsonb_build_object('kind', 'surprise', 'combo_category', c.id,
        'description', 'Tarjeta sorpresa categoría ' || c.id, 'qty', v_qty, 'unit_price', v_price);
    else
      raise exception 'Artículo inválido';
    end if;

    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  if v_delivery = 'envio' then
    if s.shipping_cost is null then
      v_pending := true;
    else
      v_delivery_cost := s.shipping_cost;
    end if;
  end if;

  loop
    v_code := 'EC-';
    for i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::integer, 1);
    end loop;
    exit when not exists (select 1 from public.orders where code = v_code);
  end loop;

  insert into public.orders (code, customer_name, whatsapp, email, delivery, address, department,
    payment_method, subtotal, delivery_cost, delivery_cost_pending, total, notes)
  values (v_code, v_name, v_whatsapp, v_email, v_delivery,
    case when v_delivery = 'envio' then v_address end,
    case when v_delivery = 'envio' then v_department end,
    v_payment, v_subtotal, v_delivery_cost, v_pending, v_subtotal + v_delivery_cost, v_notes)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, kind, description, qty, unit_price, combo_box_product_id, combo_category)
  select v_order_id,
         nullif(l ->> 'product_id', '')::uuid,
         (l ->> 'kind')::public.order_item_kind,
         l ->> 'description',
         (l ->> 'qty')::integer,
         (l ->> 'unit_price')::integer,
         nullif(l ->> 'combo_box_product_id', '')::uuid,
         l ->> 'combo_category'
  from jsonb_array_elements(v_lines) l;

  return jsonb_build_object('code', v_code, 'subtotal', v_subtotal, 'delivery_cost', v_delivery_cost,
    'delivery_cost_pending', v_pending, 'total', v_subtotal + v_delivery_cost);
end;
$$;
revoke all on function public.place_order(jsonb) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
revoke all on function public.combo_price(public.product_type, text) from public;
grant execute on function public.combo_price(public.product_type, text) to anon, authenticated;

-- Al cancelar un pedido se devuelve el inventario (y al reactivarlo se vuelve a descontar).
create or replace function public.restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  sign integer;
begin
  if new.status = 'cancelado' and old.status <> 'cancelado' then
    sign := 1;
  elsif old.status = 'cancelado' and new.status <> 'cancelado' then
    sign := -1;
  else
    return new;
  end if;
  update public.products p set stock = greatest(0, p.stock + sign * x.qty)
    from (select coalesce(product_id, combo_box_product_id) pid, sum(qty) qty
          from public.order_items where order_id = new.id group by 1) x
    where p.id = x.pid and p.stock is not null;
  update public.combo_categories c set stock = greatest(0, c.stock + sign * x.qty)
    from (select combo_category cid, sum(qty) qty from public.order_items
          where order_id = new.id and kind in ('combo', 'surprise') group by 1) x
    where c.id = x.cid and c.stock is not null;
  return new;
end;
$$;
revoke all on function public.restock_on_cancel() from public, anon, authenticated;
create trigger orders_restock_on_cancel after update of status on public.orders
  for each row execute function public.restock_on_cancel();
