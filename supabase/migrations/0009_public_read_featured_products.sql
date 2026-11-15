-- Las tarjetas marcadas para la vitrina se ven en la rueda del Inicio aunque aún no tengan precio.
-- place_order exige published, así que no se pueden comprar hasta publicarse.
drop policy products_select on public.products;
create policy products_select on public.products for select to anon, authenticated
  using (published or featured or (select private.is_admin()));
drop policy product_images_select on public.product_images;
create policy product_images_select on public.product_images for select to anon, authenticated
  using (
    exists (select 1 from public.products p where p.id = product_id and (p.published or p.featured))
    or (select private.is_admin())
  );
