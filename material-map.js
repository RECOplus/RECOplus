/**
 * material-map.js
 * ---------------------------------------------------------------
 * Traduce las predicciones de MobileNet (ImageNet, ~1000 clases,
 * en inglés, a veces con labels separados por comas como
 * "water bottle, water flask") a las 12 categorías de materiales
 * de RECO+.
 *
 * IMPORTANTE — Fuente de verdad de "¿es reciclable?":
 * Los `id` usados aquí (plastico, vidrio, metal, papel, libros,
 * electronicos, celulares, ropa, muebles, juguetes, baterias,
 * bombillos) son EXACTAMENTE los mismos que los `id` de la tabla
 * `categorias` en Supabase. Esto es a propósito: MATERIALES de este
 * archivo solo aporta el color/icono para la UI del escáner y sirve
 * de respaldo si Supabase no responde; el badge, el mensaje al
 * usuario y si requiere punto especial se cargan en vivo desde
 * Supabase por scanner-core.js (ver `_categoriasSupabase`). Si algún
 * día cambias/agregas una categoría, hazlo en la tabla `categorias`
 * y agrega aquí solo el color/icono correspondiente con el MISMO id.
 *
 * Uso:
 *   import { mapLabelToMaterial } from './material-map.js';
 *   const material = mapLabelToMaterial("water bottle, water flask");
 *   // -> { id: 'plastico', nombre: 'Plástico', confianzaAjustada: true }
 *
 * No requiere dependencias. Es un archivo aditivo: no toca nada
 * existente de RECO+, solo se importa donde se necesite.
 * ---------------------------------------------------------------
 */

// -----------------------------------------------------------------
// 1. Los 12 materiales reales de la tabla `categorias` de Supabase.
//    nombre/color/icono son solo presentación local (respaldo); el
//    resto de metadatos (badge, mensaje, reciclable, punto especial)
//    se sobreescriben en vivo desde Supabase cuando están disponibles.
// -----------------------------------------------------------------
export const MATERIALES = {
  plastico: { id: 'plastico', nombre: 'Plástico', color: '#3aa8ff', icono: '♳' },
  vidrio: { id: 'vidrio', nombre: 'Vidrio', color: '#2fbf71', icono: '🍾' },
  metal: { id: 'metal', nombre: 'Metal', color: '#b0b7c0', icono: '🥫' },
  papel: { id: 'papel', nombre: 'Papel', color: '#d9b26a', icono: '📄' },
  libros: { id: 'libros', nombre: 'Libros', color: '#b5793a', icono: '📚' },
  electronicos: { id: 'electronicos', nombre: 'Electrónicos', color: '#c04dcc', icono: '🔌' },
  celulares: { id: 'celulares', nombre: 'Celulares', color: '#9b59d6', icono: '📱' },
  ropa: { id: 'ropa', nombre: 'Ropa', color: '#e07a9c', icono: '👕' },
  muebles: { id: 'muebles', nombre: 'Muebles', color: '#8a6d4a', icono: '🪑' },
  juguetes: { id: 'juguetes', nombre: 'Juguetes', color: '#f2994a', icono: '🧸' },
  baterias: { id: 'baterias', nombre: 'Baterías', color: '#e0483a', icono: '🔋' },
  bombillos: { id: 'bombillos', nombre: 'Bombillos', color: '#e8c547', icono: '💡' },
  no_reciclable: { id: 'no_reciclable', nombre: 'No identificado', color: '#7a7a7a', icono: '🚫' },
  // Estado especial: no es que el objeto no sea reciclable, es que el
  // modelo no tiene confianza suficiente en NINGUNA de sus predicciones
  // para siquiera aventurar una categoría. Se distingue de
  // 'no_reciclable' porque el mensaje correcto para el usuario es
  // "acércate más o mejora la luz", no "esto no se recicla".
  sin_confianza: { id: 'sin_confianza', nombre: 'No estoy seguro', color: '#a8a8a8', icono: '❓' },
};

// -----------------------------------------------------------------
// 2. Reglas de matching: keyword -> id de material
//    Se evalúan en orden; la primera coincidencia gana. Los ids de
//    `material` deben ser exactamente los de la tabla `categorias`.
//    Las keywords están en inglés porque MobileNet/ImageNet
//    devuelve labels en inglés.
// -----------------------------------------------------------------
const REGLAS = [
  // --- Vidrio ---
  // Nota: en ImageNet, "pop bottle, soda bottle" es la clase de botella
  // plástica retornable (n=1L), no de vidrio. "wine bottle"/"beer bottle"
  // sí son casi siempre de vidrio.
  { material: 'vidrio', keywords: [
    'wine bottle', 'beer bottle', 'beer glass', 'glass', 'jar', 'vase', 'goblet', 'beaker',
  ]},

  // --- Plástico ---
  { material: 'plastico', keywords: [
    'water bottle', 'water jug', 'pop bottle', 'soda bottle',
    'plastic bag', 'shopping basket',
    'pill bottle', 'soap dispenser', 'bucket', 'pail', 'washbasin',
    'lotion', 'syringe',
  ]},

  // --- Papel (incluye cartón: en la tabla `categorias` no existe
  //     'carton' como categoría propia, va dentro de 'papel') ---
  { material: 'papel', keywords: [
    'carton', 'cardboard', 'packet', 'crate',
    'envelope', 'menu', 'notebook',
    'binder', 'paper towel', 'toilet tissue', 'newspaper', 'paper bag',
  ]},

  // --- Libros ---
  // OJO: la clase de ImageNet "notebook, notebook computer" es en
  // realidad una laptop, no un cuaderno de papel — por eso NO se
  // incluye aquí (evita falsos positivos "libro" con computadoras).
  { material: 'libros', keywords: [
    'book jacket', 'comic book',
  ]},

  // --- Metal (latas, utensilios, metal en general) ---
  { material: 'metal', keywords: [
    'pop can', 'beer can', 'soda can', 'tin can', 'can opener',
    'aluminum', 'foil', 'milk can', 'barrel', 'cask',
    'nail', 'screw', 'chain', 'padlock', 'safety pin', 'paperclip',
    'wrench', 'hammer', 'screwdriver', 'frying pan', 'wok', 'radiator',
  ]},

  // --- Celulares (antes que electrónicos para que gane la categoría
  //     más específica) ---
  { material: 'celulares', keywords: [
    'cellular telephone', 'mobile phone', 'ipod', 'hand-held computer',
  ]},

  // --- Electrónicos ---
  { material: 'electronicos', keywords: [
    'laptop', 'notebook computer',
    'desktop computer', 'keyboard', 'computer mouse', 'joystick',
    'remote control', 'cassette player', 'tape player', 'CD player',
    'modem', 'monitor', 'printer', 'scanner', 'hard disc', 'projector',
    'microwave', 'toaster', 'hair dryer', 'electric fan', 'space heater',
    'dishwasher', 'washer, automatic washer', 'vacuum, vacuum cleaner',
    'iron, smoothing iron',
    'dial telephone', 'digital watch', 'digital clock', 'calculator',
    'television', 'radio, wireless',
  ]},

  // --- Baterías ---
  { material: 'baterias', keywords: [
    'battery',
  ]},

  // --- Ropa ---
  { material: 'ropa', keywords: [
    'jersey', 't-shirt', 'sweatshirt', 'cardigan', 'kimono', 'poncho',
    'trench coat', 'jean', 'blue jean', 'denim', 'wool', 'apron',
    'diaper', 'bath towel', 'handkerchief', 'sock', 'pajama', 'sarong',
    'sombrero', 'shoe', 'running shoe', 'loafer', 'sandal', 'cowboy boot',
    'backpack', 'brassiere', 'miniskirt', 'gown', 'cloak',
    'suit, suit of clothes', 'swimming trunks', 'maillot', 'military uniform',
  ]},

  // --- Muebles ---
  { material: 'muebles', keywords: [
    'studio couch', 'rocking chair', 'folding chair', 'wardrobe, closet',
    'file, file cabinet', 'desk', 'dining table', 'four-poster',
    'crib, cot', 'bookcase', 'chiffonier, commode', 'china cabinet',
  ]},

  // --- Juguetes ---
  { material: 'juguetes', keywords: [
    'teddy, teddy bear', 'toyshop', 'jigsaw puzzle', 'yo-yo',
    "rubik's cube", 'balloon', 'kite', 'punching bag',
  ]},

  // Nota: 'bombillos' no tiene una clase directa y fiable en ImageNet,
  // por lo que se deja sin reglas a propósito (igual que en
  // reciclar-scanner.js). El usuario siempre puede elegirlo a mano; el
  // escáneo preciso con IA (Gemini) sí puede identificarlo por contexto.
];

// -----------------------------------------------------------------
// 3. Normalización de labels de MobileNet
//    ml5.js / MobileNet a veces devuelve algo como:
//    "water bottle, water flask" (sinónimos separados por coma)
//    Esta función separa, limpia y evalúa cada variante.
// -----------------------------------------------------------------
function normalizarLabel(labelCrudo) {
  if (!labelCrudo || typeof labelCrudo !== 'string') return [];
  return labelCrudo
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// -----------------------------------------------------------------
// 4. Función principal de mapeo
// -----------------------------------------------------------------
/**
 * @param {string} labelMobileNet - label crudo devuelto por MobileNet
 * @param {number} [confianza] - probabilidad 0-1 devuelta por el modelo
 * @returns {{
 *   id: string,
 *   nombre: string,
 *   color: string,
 *   icono: string,
 *   labelOriginal: string,
 *   coincidenciaKeyword: string|null,
 *   confianzaBaja: boolean
 * }}
 */
export function mapLabelToMaterial(labelMobileNet, confianza = 1) {
  const variantes = normalizarLabel(labelMobileNet);

  for (const variante of variantes) {
    for (const regla of REGLAS) {
      // saltar keywords explícitamente excluidas (falsos positivos conocidos)
      if (regla.excluye && regla.excluye.some((ex) => variante.includes(ex))) {
        continue;
      }
      const match = regla.keywords.find((kw) => variante.includes(kw));
      if (match) {
        const material = MATERIALES[regla.material];
        return {
          ...material,
          labelOriginal: labelMobileNet,
          coincidenciaKeyword: match,
          confianzaBaja: confianza < 0.4,
        };
      }
    }
  }

  // Sin coincidencia -> no reciclable / desconocido (no se descarta,
  // se muestra igual para que el usuario decida)
  return {
    ...MATERIALES.no_reciclable,
    nombre: 'No identificado',
    labelOriginal: labelMobileNet,
    coincidenciaKeyword: null,
    confianzaBaja: confianza < 0.4,
  };
}

/**
 * Procesa el array completo de predicciones que devuelve
 * ml5.js MobileNet (classifier.classify) y regresa la mejor
 * coincidencia de material ya traducida.
 *
 * @param {Array<{label: string, confidence: number}>} predicciones
 * @param {Object} [opciones]
 * @param {number} [opciones.confianzaMinima] - si la predicción top-1
 *   tiene menos confianza que esto, se reporta 'sin_confianza' en vez
 *   de forzar una categoría poco fiable. Por defecto 0.15 (15%): un
 *   valor bajo a propósito, porque MobileNet reparte probabilidad
 *   entre 1000 clases y rara vez supera 30-40% incluso acertando.
 */
export function resolverMaterialDesdePredicciones(predicciones, opciones = {}) {
  if (!Array.isArray(predicciones) || predicciones.length === 0) {
    return null;
  }

  const confianzaMinima = opciones.confianzaMinima ?? 0.15;

  // Si ni siquiera la predicción más fuerte del modelo alcanza el
  // umbral mínimo, no tiene sentido intentar mapear ninguna: el modelo
  // literalmente no sabe qué está viendo (ej. imagen borrosa, objeto
  // fuera de encuadre, poca luz). Se reporta explícitamente en vez de
  // arriesgar una categoría al azar.
  if (predicciones[0].confidence < confianzaMinima) {
    return {
      ...MATERIALES.sin_confianza,
      labelOriginal: predicciones[0].label,
      coincidenciaKeyword: null,
      confianzaBaja: true,
    };
  }

  // Intenta con las 3 primeras predicciones por si la top-1
  // no es una keyword conocida pero la top-2/3 sí.
  for (const pred of predicciones.slice(0, 3)) {
    const resultado = mapLabelToMaterial(pred.label, pred.confidence);
    if (resultado.id !== 'no_reciclable') {
      return resultado;
    }
  }

  // Ninguna de las 3 mejores coincidió: devuelve la top-1 sin match
  return mapLabelToMaterial(predicciones[0].label, predicciones[0].confidence);
}