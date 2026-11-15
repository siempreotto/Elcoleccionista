create type public.product_type as enum ('value_box', 'mega_box', 'single_card', 'accessory');
create type public.order_status as enum ('nuevo', 'confirmado', 'pagado', 'enviado', 'entregado', 'cancelado');
create type public.delivery_method as enum ('envio', 'recoger');
create type public.order_item_kind as enum ('product', 'combo', 'surprise');
