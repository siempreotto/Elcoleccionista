create index products_listing_idx on public.products (published, type, sort_order);
create index products_tags_idx on public.products using gin (tags);
create index products_combo_category_idx on public.products (combo_category);
create index product_images_product_idx on public.product_images (product_id, position);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);
create index order_items_combo_box_idx on public.order_items (combo_box_product_id);
create index order_items_combo_category_idx on public.order_items (combo_category);
create index orders_created_at_idx on public.orders (created_at desc);
