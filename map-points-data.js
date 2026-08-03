/**
 * map-points-data.js — RECO+
 * ---------------------------------------------------------------
 * Fuente única de los puntos "oficiales" del mapa (recicladoras,
 * puntos de acopio y ONGs de donación) — los mismos que antes
 * vivían embebidos como POINTS dentro de app.js.
 *
 * Se separan a este archivo aparte para poder reutilizarlos en
 * otras páginas (ej. donar.html, para el selector de "¿A qué
 * empresa se envía?") sin necesidad de cargar Leaflet ni el resto
 * de la lógica de app.js, que asume que existe un <div id="map">.
 *
 * app.js sigue siendo el dueño de POINTS en tiempo de ejecución
 * (le agrega los puntos sugeridos por la comunidad desde Supabase,
 * aplica valoraciones, etc.) — este archivo solo aporta los datos
 * base, expuestos como window.RECO_MAP_POINTS.
 *
 * Cargar ANTES de app.js (en mapa.html) o de donar-empresas.js
 * (en donar.html):
 *   <script src="map-points-data.js"></script>
 */
window.RECO_MAP_POINTS = [

  {
    id: 1,
    name: "Best Metals",
    type: "reciclaje",
    address: "David, Chiriquí",
    distance: 0.5,
    lat: 8.4331,
    lng: -82.4308,
    materials: ["metal", "plastico"],
    materialIcons: ["🥫", "🧴"],
    rating: 4.5,
    reviewCount: 128,
    addedAt: "2026-06-20",
  },

  {
    id: 2,
    name: "Reciclaje Joselyne",
    type: "reciclaje",
    address: "David, Chiriquí",
    distance: 1.0,
    lat: 8.4295,
    lng: -82.4317,
    materials: ["plastico", "papel", "vidrio"],
    materialIcons: ["🧴", "📄", "🍾"],
    rating: 4.8,
    reviewCount: 94,
    addedAt: "2026-07-05",
  },

  {
    id: 3,
    name: "Recimetal Chiriqui",
    type: "acopio",
    address: "David, Chiriquí",
    distance: 1.5,
    lat: 8.4279,
    lng: -82.4330,
    materials: ["metal", "electronicos"],
    materialIcons: ["🥫", "💻"],
    rating: 3.9,
    reviewCount: 41,
    addedAt: "2026-05-12",
  },

  {
    id: 4,
    name: "Boquete Recycling",
    type: "reciclaje",
    address: "Boquete, Chiriquí",
    distance: 2.3,
    lat: 8.7801,
    lng: -82.4332,
    materials: ["plastico", "papel", "vidrio"],
    materialIcons: ["🧴", "📄", "🍾"],
    rating: 4.2,
    reviewCount: 67,
    addedAt: "2026-06-28",
  },

  {
    id: 5,
    name: "Tierras Altas Recicla",
    type: "reciclaje",
    address: "Volcán, Chiriquí",
    distance: 3.1,
    lat: 8.7724,
    lng: -82.6388,
    materials: ["plastico", "papel", "metal"],
    materialIcons: ["🧴", "📄", "🥫"],
    rating: 4.0,
    reviewCount: 23,
    addedAt: "2026-04-30",
  },

  {
    id: 6,
    name: "Recicla Panama",
    type: "reciclaje",
    address: "Pacora, Panamá",
    distance: 4.5,
    lat: 9.1038,
    lng: -79.2901,
    materials: ["electronicos", "plastico"],
    materialIcons: ["💻", "🧴"],
    rating: 3.6,
    reviewCount: 52,
    addedAt: "2026-07-08",
  },

  {
    id: 7,
    name: "Grun Panama",
    type: "reciclaje",
    address: "Juan Díaz, Panamá",
    distance: 5.2,
    lat: 9.0469,
    lng: -79.4499,
    materials: ["plastico", "papel", "vidrio", "metal"],
    materialIcons: ["🧴", "📄", "🍾", "🥫"],
    rating: 4.7,
    reviewCount: 210,
    addedAt: "2026-03-15",
  },

  {
    id: 8,
    name: "ECOSPOT – LEAFSINC",
    type: "reciclaje",
    address: "Multiplaza, Panamá",
    distance: 5.9,
    lat: 8.9826,
    lng: -79.5197,
    materials: ["plastico", "papel", "vidrio"],
    materialIcons: ["🧴", "📄", "🍾"],
    rating: 4.9,
    reviewCount: 356,
    addedAt: "2026-07-10",
  },

  {
    id: 9,
    name: "Cruz Roja Panameña",
    type: "donacion",
    address: "Ciudad de Panamá",
    distance: 6.3,
    lat: 8.9935,
    lng: -79.5190,
    materials: ["ropa"],
    materialIcons: ["👕"],
    rating: 4.6,
    reviewCount: 489,
    addedAt: "2026-02-01",
  },

  {
    id: 10,
    name: "Casa Esperanza",
    type: "donacion",
    address: "Ciudad de Panamá",
    distance: 6.8,
    lat: 8.9981,
    lng: -79.5142,
    materials: ["ropa", "electronicos"],
    materialIcons: ["👕", "💻"],
    rating: 4.3,
    reviewCount: 87,
    addedAt: "2026-06-02",
  },

  {
    id: 11,
    name: "Banco De Alimentos Panamá",
    type: "donacion",
    address: "Ciudad de Panamá",
    distance: 7.1,
    lat: 9.0201,
    lng: -79.4820,
    materials: ["aceite"],
    materialIcons: ["🍶"],
    rating: 4.4,
    reviewCount: 156,
    addedAt: "2026-05-25",
  },

  {
    id: 12,
    name: "Recicladora Panama Oeste",
    type: "acopio",
    address: "Burunga, Panamá Oeste",
    distance: 8.4,
    lat: 8.9512,
    lng: -79.6803,
    materials: ["metal", "plastico"],
    materialIcons: ["🥫", "🧴"],
    rating: 3.8,
    reviewCount: 19,
    addedAt: "2026-07-01",
  }

];
