"""Genera supabase/seed.sql a partir de _handoff/data/seed.json.

Las imágenes iniciales se sirven desde public/catalog (storage_path empieza con '/').
Las fotos que se suban desde el CMS van al bucket `products` de Supabase Storage.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
seed = json.load(open(os.path.join(ROOT, '_handoff/data/seed.json'), encoding='utf-8'))

def q(v):
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, int):
        return str(v)
    if isinstance(v, (list, dict)):
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"

def arr(xs):
    return "array[" + ",".join(q(x) for x in xs) + "]::text[]" if xs else "'{}'::text[]"

COMPETITION = {
    'panini-select-2025-26-value-box': 'selecciones',
    'panini-select-2025-26-mega-box': 'selecciones',
    'panini-prizm-fifa-world-cup-2026-mega-box': 'selecciones',
    'topps-chrome-bundesliga-2025-26-value-box': 'ligas_europeas',
    'topps-chrome-uefa-2025-26-value-box': 'ligas_europeas',
    'topps-merlin-premier-league-2026-value-box': 'ligas_europeas',
    'topps-premier-league-flagship-2026-27-value-box': 'ligas_europeas',
    'luis-suarez-leaf-metal': 'selecciones',
    'enner-valencia-panini-prizm-fifa-world-cup-2026': 'selecciones',
    'cristiano-ronaldo-donruss-road-to-fifa-world-cup-2026': 'selecciones',
    'alphonso-davies-2020-topps-living-uefa-champions-league-169': 'ligas_europeas',
    'rookie-arsenal-56-topps-chrome-uefa-champions-league': 'ligas_europeas',
    'aaron-herrera-topps-mls': 'mls',
}

ALT = {
    'luis-suarez-leaf-metal': 'Tarjeta autografiada de Luis Suárez, Leaf Metal',
    'enner-valencia-panini-prizm-fifa-world-cup-2026': 'Tarjeta autografiada de Enner Valencia, Panini Prizm FIFA World Cup 2026',
    'andres-iniesta-leaf-glory-of-the-game': 'Tarjeta autografiada de Andrés Iniesta, Leaf Glory of the Game Global Graphs, numerada 8/25',
    'cristiano-ronaldo-donruss-road-to-fifa-world-cup-2026': 'Tarjeta de Cristiano Ronaldo, Donruss Road to FIFA World Cup 2026, inserto Zero Gravity',
    'alphonso-davies-2020-topps-living-uefa-champions-league-169': 'Tarjeta de Alphonso Davies, 2020 Topps Living UEFA Champions League #169, calificada PSA 9',
    'marco-pappa-sp-game-used': 'Tarjeta de Marco Pappa, SP Game Used, con patch de camiseta',
    'rookie-arsenal-56-topps-chrome-uefa-champions-league': 'Tarjeta rookie del Arsenal #56, Topps Chrome UEFA Champions League',
    'aaron-herrera-topps-mls': 'Tarjeta de Aaron Herrera, Topps MLS',
    'carlos-ruiz-sp-game-used': 'Tarjeta de Carlos Ruiz, SP Game Used',
}

EXTRA = {
    'luis-suarez-leaf-metal': {
        'specs': [
            {'k': 'Jugador', 'v': 'Luis Suárez'},
            {'k': 'Selección', 'v': 'Uruguay'},
            {'k': 'Colección', 'v': 'Leaf Metal'},
            {'k': 'Tipo', 'v': 'Autógrafo'},
            {'k': 'Protección', 'v': 'Estuche magnético'},
        ],
        'story_title': 'El 9 con el brazalete',
        'story_note': 'esta sí nos hizo gritar',
        'story_body': 'En esta foto Suárez lleva la 9 de Uruguay y el brazalete de capitán. La firma va en el recuadro blanco, en tinta azul, sobre un fondo rojo de cristales que brilla distinto con cada luz.',
    },
}

out = ['-- Generado por scripts/build-seed-sql.py. Idempotente: se puede correr de nuevo.', 'begin;']
s = seed['pricing']
out.append(f"insert into public.settings (id, value_box_price, mega_box_price, mega_combo_mode) values (true, {s['value_box']}, {s['mega_box']}, 'diferencia') on conflict (id) do nothing;")
for i, c in enumerate(seed['combo_categories']):
    out.append(
        "insert into public.combo_categories (id, combo_with_value_box, card_alone, stock, blurb, position) values "
        f"({q(c['id'])}, {c['combo_with_value_box']}, {c['card_alone']}, {q(c['stock'])}, {q(c['blurb'])}, {i}) on conflict (id) do nothing;"
    )
for i, p in enumerate(seed['products']):
    is_card = p['type'] == 'single_card'
    published = bool(p['published']) and p['price_gtq'] is not None
    ex = EXTRA.get(p['slug'], {})
    cols = {
        'slug': q(p['slug']), 'name': q(p['name']), 'type': q(p['type']) + '::public.product_type',
        'short_detail': q(p['short_detail']), 'price_gtq': q(p['price_gtq']), 'stock': q(p['stock']),
        'published': q(published), 'featured': q(is_card),
        'seo_title': q(p.get('seo_title') or ''), 'seo_description': q(p.get('seo_description') or ''),
        'packs': q(p.get('packs')), 'cards_per_pack': q(p.get('cards_per_pack')),
        'tags': arr(p.get('tags') or []), 'combo_category': q(p.get('combo_category')),
        'competition': q(COMPETITION.get(p['slug'])),
        'specs': q(ex.get('specs', [])), 'story_title': q(ex.get('story_title', '')),
        'story_note': q(ex.get('story_note', '')), 'story_body': q(ex.get('story_body', '')),
        'sort_order': str(i * 10),
    }
    out.append(
        f"insert into public.products ({', '.join(cols)}) values ({', '.join(cols.values())}) on conflict (slug) do nothing;"
    )
    img = p['image']
    base = os.path.splitext(os.path.basename(img))[0]
    path = f"/catalog/{'cards' if is_card else 'boxes'}/{base}.webp"
    alt = ALT.get(p['slug']) or f"Caja sellada {p['name']}, {'value box' if p['type']=='value_box' else 'mega box'}"
    out.append(
        "insert into public.product_images (product_id, storage_path, alt, kind, position) "
        f"select id, {q(path)}, {q(alt)}, 'frente', 0 from public.products where slug = {q(p['slug'])} "
        "and not exists (select 1 from public.product_images pi where pi.product_id = products.id);"
    )
out.append('commit;')
open(os.path.join(ROOT, 'supabase/seed.sql'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(len(out), 'líneas')
