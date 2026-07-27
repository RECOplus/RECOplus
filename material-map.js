/**
 * material-map.js
 * ---------------------------------------------------------------
 * Traduce las predicciones de MobileNet (ImageNet, ~1000 clases,
 * en inglés, a veces con labels separados por comas como
 * "water bottle, water flask") a las 12 categorías de materiales
 * de RECO+.
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
// 1. Tus 12 materiales (ajusta nombres/ids si difieren de tu overlay)
// -----------------------------------------------------------------
export const MATERIALES = {
  plastico: { id: 'plastico', nombre: 'Plástico', color: '#3aa8ff', icono: '♳' },
  vidrio: { id: 'vidrio', nombre: 'Vidrio', color: '#2fbf71', icono: '🍾' },
  papel: { id: 'papel', nombre: 'Papel', color: '#d9b26a', icono: '📄' },
  carton: { id: 'carton', nombre: 'Cartón', color: '#b5793a', icono: '📦' },
  metal_aluminio: { id: 'metal_aluminio', nombre: 'Aluminio', color: '#b0b7c0', icono: '🥫' },
  metal_ferroso: { id: 'metal_ferroso', nombre: 'Metal ferroso', color: '#8a8f98', icono: '🔩' },
  organico: { id: 'organico', nombre: 'Orgánico', color: '#6cbf3f', icono: '🍂' },
  electronico: { id: 'electronico', nombre: 'Electrónico (RAEE)', color: '#c04dcc', icono: '🔌' },
  textil: { id: 'textil', nombre: 'Textil', color: '#e07a9c', icono: '👕' },
  bateria: { id: 'bateria', nombre: 'Pilas / Baterías', color: '#e0483a', icono: '🔋' },
  aceite: { id: 'aceite', nombre: 'Aceite usado', color: '#caa62f', icono: '🛢️' },
  no_reciclable: { id: 'no_reciclable', nombre: 'No reciclable', color: '#7a7a7a', icono: '🚫' },
  // Estado especial: no es que el objeto no sea reciclable, es que el
  // modelo no tiene confianza suficiente en NINGUNA de sus predicciones
  // para siquiera aventurar una categoría. Se distingue de
  // 'no_reciclable' porque el mensaje correcto para el usuario es
  // "acércate más o mejora la luz", no "esto no se recicla".
  sin_confianza: { id: 'sin_confianza', nombre: 'No estoy seguro', color: '#a8a8a8', icono: '❓' },
};

// -----------------------------------------------------------------
// 2. Reglas de matching: keyword -> id de material
//    Se evalúan en orden; la primera coincidencia gana.
//    Las keywords están en inglés porque MobileNet/ImageNet
//    devuelve labels en inglés.
// -----------------------------------------------------------------
const REGLAS = [
  // --- Vidrio ---
  // Nota: en ImageNet, "pop bottle, soda bottle" es la clase de botella
  // plástica retornable (n=1L), no de vidrio. "wine bottle"/"beer bottle"
  // sí son casi siempre de vidrio.
  { material: 'vidrio', keywords: [
    'wine bottle', 'beer bottle', 'glass', 'jar', 'vase', 'goblet', 'beaker',
  ]},

  // --- Plástico ---
  { material: 'plastico', keywords: [
    'water bottle', 'water jug', 'pop bottle', 'soda bottle',
    'plastic bag', 'shopping basket',
    'pill bottle', 'soap dispenser', 'bucket', 'washbasin',
    'lotion', 'syringe',
  ]},

  // --- Cartón (antes que "paper" para que no lo capture papel) ---
  { material: 'carton', keywords: [
    'carton', 'cardboard', 'packet', 'crate', 'box turtle', // nota abajo
  ], excluye: ['box turtle'] }, // evita falso positivo con animal

  // --- Papel ---
  { material: 'papel', keywords: [
    'envelope', 'menu', 'book jacket', 'comic book', 'notebook',
    'binder', 'paper towel', 'toilet tissue', 'newspaper',
  ]},

  // --- Aluminio / latas ---
  { material: 'metal_aluminio', keywords: [
    'pop can', 'beer can', 'soda can', 'tin can', 'can opener',
    'aluminum', 'foil',
  ]},

  // --- Metal ferroso / metal genérico ---
  { material: 'metal_ferroso', keywords: [
    'nail', 'screw', 'chain', 'padlock', 'safety pin', 'paperclip',
    'wrench', 'hammer', 'screwdriver', 'frying pan', 'wok', 'radiator',
  ]},

  // --- Electrónico / RAEE ---
  { material: 'electronico', keywords: [
    'cellular telephone', 'mobile phone', 'laptop', 'notebook computer',
    'desktop computer', 'keyboard', 'computer mouse', 'joystick',
    'remote control', 'cassette player', 'CD player', 'ipod',
    'modem', 'monitor', 'printer', 'hard disc', 'projector',
    'microwave', 'toaster', 'hair dryer', 'electric fan',
    'dial telephone', 'digital watch', 'digital clock', 'calculator',
    'space heater',
  ]},

  // --- Pilas / Baterías ---
  { material: 'bateria', keywords: [
    'battery',
  ]},

  // --- Textil ---
  { material: 'textil', keywords: [
    'jersey', 'sweatshirt', 'cardigan', 'kimono', 'poncho',
    'trench coat', 'jean', 'wool', 'apron', 'diaper', 'bath towel',
    'handkerchief', 'sock', 'pajama', 'sarong', 'sombrero', 'shoe',
    'running shoe', 'sandal', 'backpack',
  ]},

  // --- Orgánico ---
  { material: 'organico', keywords: [
    'banana', 'orange', 'lemon', 'apple', 'pineapple', 'strawberry',
    'fig', 'corn', 'mushroom', 'artichoke', 'cucumber', 'zucchini',
    'broccoli', 'cauliflower', 'head cabbage', 'bell pepper', 'squash',
  ]},

  // --- Aceite usado ---
  { material: 'aceite', keywords: [
    'oil filter', 'cream', // heurística débil, ver nota
  ]},
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