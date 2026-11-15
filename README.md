# El Coleccionista: paquete de construcción

Empieza por `PROMPT-CLAUDE-CODE.md`: es el prompt que se pega en Claude Code.

| Carpeta | Qué hay | Uso |
|---|---|---|
| `brand/` | `logo-transparent.png` (PNG sin fondo, para la web), `logo-on-navy.png`, `tokens.json`, `design-system-README.md` (reglas de marca) y `components-bundle.css` (componentes `ec-*` del sistema) | Tokens de Tailwind y reglas de diseño |
| `design-reference/` | `Main`, `Catalogo`, `Producto`, `Carrito` y `Admin` en `.dc.html`, más `canvas.json` | Referencia visual y de lógica. Se abren en un editor de texto; no corren solos |
| `hero-sequence/frames/` | 85 cuadros WebP de 960×720 (`s000`–`s084`) de la caja abriéndose, con la tarjeta real de Suárez compuesta | Hero con scroll del Inicio |
| `hero-sequence/source/` | Video original de IA (solo referencia, **no publicar**: la IA deformó la tarjeta) y `suarez-card-flat.jpg` (la tarjeta HD para el relevo final) | — |
| `hero-sequence/tools/` | `track.py`, `composite.py` y `quads.json` (seguimiento de la tarjeta y composición) | Para regenerar la secuencia si cambia el video |
| `cards/web/` | 9 tarjetas reales de 600×750 en JPG | Rueda, vitrina, catálogo y fichas |
| `cards/originals/` | Las mismas tarjetas en alta resolución | Subir al CMS y hacer zoom en la ficha |
| `boxes/web/` | 7 cajas en WebP con fondo transparente | Cajas selladas y combos |
| `boxes/originals/` | Fotos originales de las cajas, más el frente plano de la Flagship | — |
| `photos/` | Caja cerrada, caja abierta, caja abierta con Suárez, caja con el mensaje, Suárez en su base y stickers | Secciones de marca y Open Graph |
| `data/seed.json` | 16 productos con precio, contenido, etiquetas y descripción SEO de las 7 cajas; categorías de combo y datos del hero | Carga inicial en Supabase |
| `data/seo-cajas.csv` | Título y descripción SEO de cada caja | Revisión rápida |
| `references/` | Videos de referencia de las animaciones (fila infinita y rueda de slabs) | Inspiración, no publicar |

**Pendientes** (también listados en el prompt): precios de combos con mega box, precios y descripciones de las tarjetas sueltas, versión de las cajas Select, envío, WhatsApp y dominio.
