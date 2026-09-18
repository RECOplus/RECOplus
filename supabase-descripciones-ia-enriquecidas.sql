-- ═══════════════════════════════════════════════════════════════
-- RECO+ — Descripciones enriquecidas para el escáner IA (Gemini)
-- ═══════════════════════════════════════════════════════════════
-- Actualiza SOLO la columna `descripcion_ia` de la tabla `categorias`
-- ya existente. No crea tablas ni toca ninguna otra columna
-- (mensaje_escaner, badge, reciclable, etc. quedan intactos).
--
-- POR QUÉ: descripcion_ia es lo que api/classify.js inyecta en el
-- prompt de Gemini (ver construirPrompt() -- una línea "- id: texto"
-- por categoría). Cuanto más concretos y numerosos los ejemplos de
-- objetos reales en cada descripción, menos ambigüedad entre clases
-- parecidas para el modelo -- en particular:
--   - papel vs. libros vs. cartón (todos son "papel" a primera vista)
--   - electrónicos vs. celulares (un celular ES un electrónico, pero
--     tiene su propia categoría con reglas de reciclaje distintas)
--   - plástico vs. tetrapak (el tetrapak tiene capas de plástico y
--     aluminio, no es "solo plástico")
--   - ropa vs. tela vs. cuero (prendas completas vs. retazos vs.
--     material específico)
--   - vidrio vs. plástico (envases transparentes se confunden fácil)
--
-- Instrucciones:
-- 1. Entra a tu proyecto en supabase.com/dashboard
-- 2. Ve a "SQL Editor" en el menú lateral
-- 3. Pega TODO este archivo y dale a "Run"
-- 4. Los cambios aplican de inmediato: la próxima llamada a
--    /api/classify usará las descripciones nuevas (hay hasta 5 min
--    de caché en memoria del lado de Vercel -- ver CACHE_TTL_MS en
--    api/classify.js -- así que un escaneo inmediato después de
--    correr esto podría todavía usar la versión vieja una vez más).
-- ═══════════════════════════════════════════════════════════════

update categorias set descripcion_ia =
  'envases, botellas y objetos de PLÁSTICO rígido o flexible: botellas de agua/soda/aceite, ' ||
  'frascos y tarrinas de plástico, bolsas y empaques plásticos, cubetas, baldes, tapas de ' ||
  'botella, juguetes de plástico duro, tuberías de PVC, sillas de plástico. NO incluye ' ||
  'envases de cartón laminado con capa plástica/aluminio (eso es tetrapak) ni envases de vidrio.'
  where id = 'plastico';

update categorias set descripcion_ia =
  'envases y objetos de VIDRIO transparente o de color: botellas de vidrio (vino, cerveza, ' ||
  'licor), frascos de vidrio (mermelada, conservas, cosméticos), vasos de vidrio rotos o ' ||
  'enteros, espejos pequeños, floreros de vidrio. Se distingue del plástico por el peso y el ' ||
  'brillo característico del vidrio; si hay duda por reflejo en la foto, el vidrio suele verse ' ||
  'más grueso y con un borde de fundición visible en la boca del envase.'
  where id = 'vidrio';

update categorias set descripcion_ia =
  'objetos de METAL: latas de aluminio (soda, cerveza), latas de conserva de acero/hojalata, ' ||
  'ollas, sartenes y utensilios de cocina metálicos, tapas metálicas, tornillería y piezas de ' ||
  'metal suelto, tubos y varillas metálicas, tapas de olla, llaves. NO incluye electrodomésticos ' ||
  'completos con cables/circuitos (eso es electronicos) ni pilas/baterías (eso es baterias).'
  where id = 'metal';

update categorias set descripcion_ia =
  'PAPEL suelto o en hojas, sin encuadernar como libro: hojas sueltas, sobres, folletos, ' ||
  'volantes, papel de regalo, toallas de papel, papel higiénico usado, bolsas de papel, recibos, ' ||
  'periódico. Se diferencia de "libros" en que NO está encuadernado ni cosido en páginas ' ||
  'formando un volumen, y de "carton" en que es delgado y flexible (no rígido ni corrugado).'
  where id = 'papel';

update categorias set descripcion_ia =
  'LIBROS y revistas encuadernados: libros de tapa dura o blanda con páginas cosidas/pegadas ' ||
  'formando un volumen, revistas, cuadernos y libretas ya usados, catálogos engrapados. La clave ' ||
  'para distinguir de "papel" es que se ve un LOMO y un conjunto de páginas unidas como volumen, ' ||
  'no hojas sueltas. Un cuaderno escolar SIN usar va en utilesescolares, no aquí.'
  where id = 'libros';

update categorias set descripcion_ia =
  'aparatos ELECTRÓNICOS con circuitos, cables o pantalla (que NO sean celulares/tablets, que ' ||
  'tienen su propia categoría): laptops, computadoras de escritorio, monitores, teclados, ' ||
  'mouse, impresoras, televisores, radios, control remoto, reproductores de audio/video, ' ||
  'cargadores y cables sueltos, electrodomésticos como microondas/licuadora/plancha/secadora ' ||
  'de pelo/aspiradora/ventilador eléctrico. La presencia de un cable, batería interna, pantalla ' ||
  'o botones de encendido es la señal clave de que es electronicos y no metal/plastico.'
  where id = 'electronicos';

update categorias set descripcion_ia =
  'TELÉFONOS MÓVILES y tablets específicamente: smartphones, celulares básicos, tablets, ' ||
  'reproductores tipo iPod/MP3 de mano. Un celular es técnicamente un electrónico, pero tiene ' ||
  'esta categoría aparte porque su reciclaje requiere un punto especial distinto (contiene ' ||
  'batería de litio y datos personales). Si el objeto es claramente un teléfono o tablet, usa ' ||
  'SIEMPRE celulares y no electronicos.'
  where id = 'celulares';

update categorias set descripcion_ia =
  'prendas de vestir COMPLETAS y calzado: camisas, pantalones, vestidos, chaquetas, ropa ' ||
  'interior, medias, zapatos, sandalias, botas, gorras, cinturones de tela. Se diferencia de ' ||
  '"tela" en que es una PRENDA terminada y reconocible (no un retazo o rollo de tela suelta), ' ||
  'y de "cuero" en que el material principal es textil, no cuero/piel.'
  where id = 'ropa';

update categorias set descripcion_ia =
  'MUEBLES y mobiliario: sillas, mesas, sofás, estantes, libreros, cómodas, camas, escritorios, ' ||
  'armarios/roperos, sillas de oficina. Objetos grandes pensados para sentarse, apoyar cosas o ' ||
  'guardar cosas, típicamente de madera, metal tapizado o combinación de materiales.'
  where id = 'muebles';

update categorias set descripcion_ia =
  'JUGUETES de cualquier material: muñecos, peluches, figuras de acción, rompecabezas, bloques ' ||
  'de construcción, autos de juguete, pelotas de juguete, juegos de mesa. Si el objeto es ' ||
  'claramente un juguete infantil (aunque esté hecho de plástico o tela), usa esta categoría en ' ||
  'vez de plastico/ropa/tela.'
  where id = 'juguetes';

update categorias set descripcion_ia =
  'PILAS y BATERÍAS sueltas, de cualquier tamaño o tipo: pilas AA/AAA/botón, baterías ' ||
  'recargables, power banks, baterías de auto, packs de batería de laptop/herramienta ' ||
  'eléctrica. NO incluye el aparato completo que las contiene (un celular con su batería adentro ' ||
  'va en celulares, no aquí) -- esta categoría es para la pila/batería EXTRAÍDA y suelta.'
  where id = 'baterias';

update categorias set descripcion_ia =
  'BOMBILLOS y focos de iluminación de cualquier tipo: bombillos incandescentes, focos ahorradores ' ||
  '(fluorescentes compactos, con forma de espiral), tubos fluorescentes rectos, focos LED. Se ' ||
  'reconocen por la forma de bulbo de vidrio con una base roscada o de pines metálicos.'
  where id = 'bombillos';

-- ─────────────────────────────────────────────────────────────
-- Categorías adicionales presentes en el frontend (reciclar.html:
-- carton, tetrapak, aceite, tela, cuero, utilesescolares) que NO
-- estaban en el respaldo local CATEGORIAS_RESPALDO de api/classify.js
-- pero sí en la tabla real de Supabase. Se enriquecen igual por
-- consistencia -- si alguna de estas filas no existe todavía en tu
-- tabla, el UPDATE correspondiente simplemente no afecta filas (no
-- da error).
-- ─────────────────────────────────────────────────────────────
update categorias set descripcion_ia =
  'CARTÓN rígido o corrugado: cajas de cartón, cajas de cereal/zapatos, cartón corrugado con ' ||
  'ondulado visible entre dos capas planas, tubos de cartón. Se diferencia de "papel" en que es ' ||
  'RÍGIDO y más grueso, no una hoja flexible; y del tetrapak en que NO tiene una capa brillante ' ||
  'de plástico/aluminio por dentro (el cartón puro es opaco y fibroso al corte).'
  where id = 'carton';

update categorias set descripcion_ia =
  'envases TETRA PAK (cartón laminado con plástico y aluminio): cajas de leche, jugo, crema de ' ||
  'leche o caldo con la forma característica de "ladrillo" o prisma rectangular, con un pico o ' ||
  'tapa plástica. Aunque por fuera parecen cartón, tienen capas internas de plástico/aluminio ' ||
  'que impiden reciclarlos como cartón o plástico normal -- por eso tienen categoría propia.'
  where id = 'tetrapak';

update categorias set descripcion_ia =
  'ACEITE de cocina usado: aceite vegetal usado guardado en botella o envase, restos de fritura. ' ||
  'Se identifica por el líquido aceitoso visible dentro de un envase (a menudo una botella ' ||
  'reutilizada), nunca el envase vacío solo (eso sería plastico/vidrio).'
  where id = 'aceite';

update categorias set descripcion_ia =
  'TELA suelta, retazos o rollos de tela SIN forma de prenda terminada: retazos de tela, rollos ' ||
  'de género, cortinas, sábanas, manteles, trapos, telas de tapicería. Se diferencia de "ropa" en ' ||
  'que NO tiene forma de prenda de vestir reconocible (cuello, mangas, etc.), es material textil ' ||
  'plano o en rollo.'
  where id = 'tela';

update categorias set descripcion_ia =
  'objetos de CUERO o piel (natural o sintética) que NO sean ropa: bolsos, carteras, billeteras, ' ||
  'cinturones anchos tipo accesorio, mochilas de cuero, fundas de cuero, correas de reloj de ' ||
  'cuero, sillas de montar. Si el material principal visible es cuero/piel y el objeto es un ' ||
  'accesorio (no una prenda de vestir), usa esta categoría en vez de ropa.'
  where id = 'cuero';

update categorias set descripcion_ia =
  'ÚTILES ESCOLARES nuevos o en buen estado: cuadernos y libretas SIN usar o con hojas en ' ||
  'blanco, lápices, lapiceros, borradores, reglas, mochilas escolares, estuches, colores, ' ||
  'tijeras escolares. Se diferencia de "libros" en que son materiales para ESCRIBIR/DIBUJAR, no ' ||
  'contenido ya impreso y encuadernado.'
  where id = 'utilesescolares';
