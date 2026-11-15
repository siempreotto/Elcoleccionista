**El universo es arcade. La tarjeta es premium. Los detalles son humanos.**

El Coleccionista revende tarjetas de fútbol y acompaña a quien abre su primer sobre y a quien busca una pieza especial. Su lema es "Cada tarjeta tiene una historia". Su dirección visual es **Vitrina**: una sala oscura, un número gigante y la tarjeta real como lo único iluminado.

## Cómo decidir una pieza

1. Elige el volumen: la mayoría del feed es silencio.
2. Elige la plantilla de ese volumen.
3. Pon la tarjeta real y quita todo lo que compita con ella.

| Volumen | Uso | Plantillas | Regla |
|---|---|---|---|
| Silencio | La mayoría | `PostProducto`, `PostFicha`, `PostMarketplace` | Tarjeta, nombre, datos y disponibilidad |
| Media | Frecuente | `PostNumero`, `PostEducacion`, `PostJugador`, `PostApertura` | Un número o una idea, y una tarjeta |
| Fiesta | Excepción | `PostSorteo`, `MarcoEspecial` | El dorado puede dominar |

## Voz

Habla como el amigo que sabe de tarjetas y vive el fútbol. Sé cercano, curioso y conocedor, sin elitismo. Escribe en español, tuteando y en primera persona del plural.

- **Sí:** "Esta sí nos hizo gritar."
- **Sí:** "RC es la tarjeta que marca el debut de un jugador en una colección oficial."
- **Sí:** "Así está su condición, y este es el precio."
- **No:** "¡La locura total!", "inversión segura", "última oportunidad".

Usa mayúsculas en títulos de Anton y en insignias. El texto en Inter va en tipo oración. No uses emojis en las piezas.

**La marca no depende de una persona.** Escribe "El Coleccionista", nunca "Otto el Coleccionista". Identifícala con `@elcoleccionistacom` hasta que cambie a `@elcoleccionista.shop`. El dominio `elcoleccionista.shop` todavía no tiene web.

## Nunca

- Prometas rentabilidad ni presentes una tarjeta como inversión.
- Alteres, redibujes con IA o inventes características de una tarjeta real.
- Uses 1/1, RC, AUTO o PATCH si la tarjeta no lo es.
- Publiques un precio de mercado sin su fuente y fecha.
- Agregues logos de terceros ni fotos de jugadores sin revisar antes su uso.

## Color

- Usa `midnight-navy` como fondo de casi toda pieza.
- Usa `surface-raised` para el número gigante detrás de la tarjeta.
- Escribe en `warm-white`; usa `gunmetal` en líneas finas, datos secundarios y números de `PostNumero`.
- Reserva `arcade-gold` para rareza, numeración y premios, con `on-gold` como texto. Solo domina en `PostSorteo`.
- Usa `electric-blue` en el botón secundario y como acento puntual.
- Reserva `arcade-purple` para el borde de ediciones especiales reales.
- No uses neón, cromo, degradados ni arcoíris.

## Tipografía

- Usa `display-*` (Anton) para títulos, nombres, números y precios.
- Usa `pixel-label` (Pixelify Sans) solo en etiquetas de hasta tres palabras, como "Nivel 01".
- Usa `post-body` y `post-data` (Inter) en plantillas de 1080px, y `body` y `label` en pantalla. Los datos exactos siempre van en Anton o Inter, nunca en Pixelify Sans.
- Usa `note` (Caveat) una vez por pieza como máximo, y no en todas.

## Forma

- Construye sobre una grilla de 8px con los tokens `space-*`. El margen de las plantillas es `space-9`.
- Usa `radius-none` y líneas finas de 1 a 2px. La esquina escalonada (`ec-notch`) va solo en `Panel`.
- Aplica `shadow-hard` únicamente a botones. No uses sombras difuminadas.
- Mantén la tarjeta en el 70–80% de la atención en piezas de producto.
- Trabaja en 1080×1350, 1080×1080 y 1080×1920. En 9:16 deja libres los 250px superiores y los 340px inferiores.

## Imagen y producción

- Usa siempre fotos reales: nítidas y sin deformar, con su información visible. Las imágenes de `assets/Muestras/` solo ocupan el lugar de esa foto y nunca se publican.
- Construye con plantillas editables. Usa IA solo para crear sprites, nunca para generar una tarjeta.
- En video, muestra el slab girando de frente a reverso o varias tarjetas en rueda sobre fondo oscuro.

## Iconografía

- El pixel vive en el logo, la estrella, los sprites y las etiquetas `pixel-label`.
- Usa un solo sprite por pieza, o ninguno. Usa los trazos de `assets/Trazos/` con `Anotacion`.
- Usa `assets/Patrones/` solo en fondos de Stories o separadores, de forma discreta.
- No uses emojis ni otros sistemas de íconos.

## Origen arcade

Un arcade clásico era un cuarto oscuro donde solo brillaban las pantallas; de ahí salen la sala oscura, la paleta corta y el arte intenso reservado para los grandes momentos. La nostalgia está en la atmósfera, no en acumular elementos retro.

## Consumir este sistema

Carga `tokens.css` y `components/bundle.css`, y usa las clases `ec-*`. Los componentes son HTML y CSS, sin JavaScript. Las plantillas miden 1080px de ancho: exporta cada una desde su tamaño real.
