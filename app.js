/* =====================================================
   app.js — Mapa de Reciclaje y Donación
   ===================================================== */

// ── Data ──────────────────────────────────────────────
let POINTS = [

  {
    id: 1,
    name: "Best Metals",
    type: "reciclaje",
    address: "David, Chiriquí",
    distance: 0.5,
    lat: 8.4331,
    lng: -82.4308,
    materials: ["metal", "plasticos"],
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
    materials: ["plasticos", "papel", "vidrio"],
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
    materials: ["plasticos", "papel", "vidrio"],
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
    materials: ["plasticos", "papel", "metal"],
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
    materials: ["electronicos", "plasticos"],
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
    materials: ["plasticos", "papel", "vidrio", "metal"],
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
    materials: ["plasticos", "papel", "vidrio"],
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
    materials: ["organicos"],
    materialIcons: ["🌿"],
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
    materials: ["metal", "plasticos"],
    materialIcons: ["🥫", "🧴"],
    rating: 3.8,
    reviewCount: 19,
    addedAt: "2026-07-01",
  }

];

const FACTS = {
  es: [
    "Reciclar 1 botella de plástico ahorra suficiente energía para iluminar una bombilla por 6 horas.",
    "El papel reciclado usa un 70% menos de energía que el papel fabricado desde cero.",
    "Reciclar una lata de aluminio ahorra energía suficiente para ver TV durante 3 horas.",
    "El vidrio puede reciclarse indefinidamente sin perder calidad ni pureza.",
    "Compostar restos orgánicos reduce hasta un 30% los residuos domésticos enviados a vertederos.",
  ],
  en: [
    "Recycling 1 plastic bottle saves enough energy to power a light bulb for 6 hours.",
    "Recycled paper uses 70% less energy than paper made from scratch.",
    "Recycling one aluminum can saves enough energy to watch TV for 3 hours.",
    "Glass can be recycled indefinitely without losing quality or purity.",
    "Composting organic waste can reduce household garbage sent to landfills by up to 30%.",
  ]
};

function getCurrentFacts() {
  var lang = localStorage.getItem("reco-lang") || "es";
  return FACTS[lang] || FACTS.es;
}

// Helper para las claves i18n NUEVAS que este archivo introduce
// (aún no agregadas a i18n.js). Si t() existe pero no tiene la key,
// muchos sistemas i18n devuelven la propia key tal cual; en ese caso
// usamos el texto en español como respaldo en vez de mostrar la key
// cruda en la interfaz. Las claves que YA existían en app.js antes
// de estos cambios siguen usando el patrón original sin tocar.
function tt(key, fallbackEs) {
  if (typeof t !== "function") return fallbackEs;
  const result = t(key);
  return result === key || result == null ? fallbackEs : result;
}

// ── Base de datos de puntos sugeridos por la comunidad (Supabase) ─
// Todos los visitantes leen y escriben la MISMA tabla en la nube:
// una sugerencia hecha por cualquier persona aparece al instante
// para todos los demás, sin necesitar servidor propio.
//
// ⚠️ CONFIGURACIÓN REQUERIDA: reemplaza estos dos valores con los
// de tu proyecto (Supabase Dashboard → Project Settings → API).
// La "anon key" es pública por diseño (así funciona Supabase: la
// seguridad real la da Row Level Security, ya configurada por
// supabase-setup.sql — no una key secreta).
const SUPABASE_URL = "https://eephwthybxjwleajrvnl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcGh3dGh5Ynhqd2xlYWpydm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Njc0NzQsImV4cCI6MjA5OTU0MzQ3NH0.k8fnOuX9RJ-VEvFBSCU_Uwuqiybk9K_KuZyqMmTqekw";

const SUPABASE_TABLE = "puntos_sugeridos";
const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes("TU-PROYECTO") && !SUPABASE_ANON_KEY.includes("TU-ANON-KEY");

function supabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: "Bearer " + SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };
}

// Trae todos los puntos sugeridos ya guardados en Supabase (visibles
// para todos los visitantes). Si Supabase no está configurado aún, o
// falla la red, seguimos solo con POINTS sin romper nada.
async function fetchPublishedSuggestions() {
  if (!SUPABASE_CONFIGURED) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=*&order=created_at.desc`,
      { headers: supabaseHeaders() }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map(supabaseRowToPoint);
  } catch (e) {
    return [];
  }
}

// Convierte una fila de la tabla Supabase (snake_case) al formato
// que usa POINTS en el resto de app.js (camelCase). El id de la fila
// se desplaza a un rango alto (+100000) para no chocar nunca con los
// ids de POINTS (1-12), mantiéndose numérico para que Number(id) siga
// funcionando en el sistema de valoración por estrellas.
const SUPABASE_ID_OFFSET = 100000;

function supabaseRowToPoint(row) {
  return {
    id: SUPABASE_ID_OFFSET + row.id,
    supabaseId: row.id, // id real en la tabla, por si se necesita después
    name: row.name,
    type: row.type,
    address: row.address,
    distance: 0,
    lat: row.lat,
    lng: row.lng,
    materials: row.materials || [],
    materialIcons: row.material_icons || [],
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    addedAt: (row.created_at || "").slice(0, 10),
    comments: row.comments || "",
    approxLocation: !!row.approx_location,
    suggestedByUser: true,
  };
}

// Mezcla POINTS base + todos los puntos guardados en Supabase
// (evitando duplicar por id).
async function loadAllPoints() {
  const published = await fetchPublishedSuggestions();

  const merged = POINTS.slice();
  const seenIds = new Set(merged.map((p) => p.id));

  published.forEach((p) => {
    if (!seenIds.has(p.id)) {
      merged.push(p);
      seenIds.add(p.id);
    }
  });

  POINTS = merged;
}

// Valida un par de coordenadas escritas a mano en el modal (lat/lng
// ya no se geocodifican automáticamente desde la dirección: el propio
// usuario las escribe, o las rellena con el botón "usar mi ubicación").
// Acepta coma o punto decimal. Devuelve null si no son válidas o están
// fuera de rango, para que quien llama decida cómo avisar al usuario.
function parseCoords(latRaw, lngRaw) {
  const lat = parseFloat(String(latRaw).trim().replace(",", "."));
  const lng = parseFloat(String(lngRaw).trim().replace(",", "."));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

const MATERIAL_ICONS = {
  plasticos: "🧴",
  papel: "📄",
  vidrio: "🍾",
  metal: "🥫",
  ropa: "👕",
  electronicos: "💻",
  organicos: "🌿",
};

// Construye un nuevo punto a partir de los datos del formulario del
// modal, lo INSERTA en Supabase (base de datos real, compartida por
// todos los visitantes) y lo agrega a POINTS + mapa + lista al
// instante para quien lo sugirió, sin esperar a recargar la página.
// `lat`/`lng` ya vienen validadas (escritas a mano o desde el GPS del
// navegador) — ya no se geocodifica la dirección automáticamente.
async function submitSuggestion({ name, address, type, materials, comments, lat, lng }) {
  if (!SUPABASE_CONFIGURED) {
    throw new Error(
      "Supabase no está configurado todavía: define SUPABASE_URL y SUPABASE_ANON_KEY en app.js."
    );
  }

  const finalMaterials = materials.length ? materials : ["organicos"];

  const payload = {
    name: name,
    type: type,
    address: address,
    lat: lat,
    lng: lng,
    materials: finalMaterials,
    material_icons: finalMaterials.map((m) => MATERIAL_ICONS[m] || "♻️"),
    comments: comments || "",
    approx_location: false,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error("No se pudo guardar la sugerencia en Supabase: " + errText);
  }

  const rows = await res.json();
  const newPoint = supabaseRowToPoint(rows[0]);

  POINTS.push(newPoint);
  refreshResults();

  return newPoint;
}

// ── Rating (estrellas) ─────────────────────────────────
function starSVG(kind) {
  // kind: "full" | "half" | "empty"
  if (kind === "full") {
    return `<svg viewBox="0 0 20 20" width="13" height="13" class="star-icon star-full"><path d="M10 1.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L10 15l-5.4 2.9 1-6.1L1.2 7.7l6.1-.9L10 1.2z"/></svg>`;
  }
  if (kind === "half") {
    return `<svg viewBox="0 0 20 20" width="13" height="13" class="star-icon star-half">
      <defs><linearGradient id="halfGrad-${Math.random().toString(36).slice(2,8)}" x1="0" x2="1"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs>
      <path d="M10 1.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L10 15l-5.4 2.9 1-6.1L1.2 7.7l6.1-.9L10 1.2z" fill="url(#halfGrad-${Math.random().toString(36).slice(2,8)})" stroke="currentColor" stroke-width="0.6"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 20 20" width="13" height="13" class="star-icon star-empty"><path d="M10 1.2l2.7 5.6 6.1.9-4.4 4.3 1 6.1L10 15l-5.4 2.9 1-6.1L1.2 7.7l6.1-.9L10 1.2z" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
}

function renderStars(rating) {
  const r = Math.max(0, Math.min(5, rating || 0));
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let html = "";
  for (let i = 0; i < full; i++) html += starSVG("full");
  if (half) html += starSVG("half");
  for (let i = 0; i < empty; i++) html += starSVG("empty");
  return html;
}

function buildRatingHTML(p) {
  if (typeof p.rating !== "number") return "";
  return `
    <div class="result-rating" title="${p.rating.toFixed(1)} / 5">
      <span class="result-rating-stars">${renderStars(p.rating)}</span>
      <span class="result-rating-value">${p.rating.toFixed(1)}</span>
      <span class="result-rating-count">(${p.reviewCount || 0})</span>
    </div>
  `;
}

// ── User Ratings (valorar puntos) ──────────────────────
// Guarda: por cada punto, el rating "base" original (sin votos del
// usuario), la suma acumulada de reviews originales, y los votos
// que el propio usuario ha ido dando en este navegador. Con eso se
// recalcula un promedio real cada vez que alguien vota, y además
// recordamos qué le puso el usuario a cada punto para pintar sus
// estrellas ya marcadas si vuelve.
const RATINGS_KEY = "reco-user-ratings"; // { [pointId]: { myVote: 1-5, votes: [added by everyone in this browser] } }

function loadUserRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveUserRatings(data) {
  try {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(data));
  } catch (e) {
    /* localStorage no disponible: la valoración solo dura la sesión */
  }
}

let userRatings = loadUserRatings();

// Aplica las valoraciones guardadas a POINTS, recalculando el
// promedio (rating) y el número de reseñas (reviewCount) de forma
// acumulativa a partir del rating/reviewCount original del punto.
function applyStoredRatings() {
  POINTS.forEach((p) => {
    const stored = userRatings[p.id];
    if (!stored) return;

    if (p._baseRating == null) {
      p._baseRating = p.rating || 0;
      p._baseReviewCount = p.reviewCount || 0;
    }

    const baseSum = p._baseRating * p._baseReviewCount;
    const myVote = stored.myVote;
    const newCount = p._baseReviewCount + 1;
    const newAvg = (baseSum + myVote) / newCount;

    p.rating = Math.round(newAvg * 10) / 10;
    p.reviewCount = newCount;
    p.myVote = myVote;
  });
}

// Registra (o actualiza) el voto del usuario para un punto y
// refresca el rating de ese punto en memoria + en localStorage.
function rateFacility(pointId, stars) {
  const p = POINTS.find((pt) => pt.id === pointId);
  if (!p) return;

  if (p._baseRating == null) {
    p._baseRating = p.rating || 0;
    p._baseReviewCount = p.reviewCount || 0;
  }

  const hadPreviousVote = !!userRatings[pointId];
  userRatings[pointId] = { myVote: stars };
  saveUserRatings(userRatings);

  const baseSum = p._baseRating * p._baseReviewCount;
  const newCount = p._baseReviewCount + 1;
  p.rating = Math.round(((baseSum + stars) / newCount) * 10) / 10;
  p.reviewCount = newCount;
  p.myVote = stars;

  showToast(
    typeof t === "function"
      ? (hadPreviousVote ? t("mapa.rate.toastUpdate", { n: stars }) : t("mapa.rate.toastNew", { n: stars }))
      : hadPreviousVote
      ? `Actualizaste tu valoración a ${stars} ★`
      : `¡Gracias por tu valoración de ${stars} ★!`
  );

  refreshResults();
}

// Botones de estrella clicables/hover para valorar un punto.
function buildRateWidgetHTML(p) {
  const current = p.myVote || 0;
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    const ariaLabel =
      typeof t === "function"
        ? t("mapa.rate.ariaLabel", { n: i, s: i > 1 ? "s" : "" })
        : `Valorar con ${i} estrella${i > 1 ? "s" : ""}`;
    stars += `<button type="button" class="rate-star${i <= current ? " rated" : ""}" data-point-id="${p.id}" data-stars="${i}" aria-label="${ariaLabel}">${starSVG("full")}</button>`;
  }
  const label = typeof t === "function" ? (current ? t("mapa.rate.myVote") : t("mapa.rate.label")) : (current ? "Tu voto:" : "Valorar:");
  const thanks = typeof t === "function" ? t("mapa.rate.thanks") : "¡Gracias!";
  return `
    <div class="result-rate">
      <span class="result-rate-label">${label}</span>
      <span class="result-rate-stars">${stars}</span>
      <span class="result-rate-thanks">${thanks}</span>
    </div>
  `;
}

// Delegación de eventos: click y hover sobre cualquier grupo de
// estrellas de valoración dentro de la lista de resultados.
function initRatingWidget() {
  const list = document.getElementById("resultsList");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".rate-star");
    if (!btn) return;
    e.stopPropagation(); // no disparar el click del <li> (que centra el mapa)

    const pointId = Number(btn.dataset.pointId);
    const stars = Number(btn.dataset.stars);
    rateFacility(pointId, stars);
  });

  // Hover: ilumina las estrellas hasta la posición del cursor.
  list.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".rate-star");
    if (!btn) return;
    const group = btn.closest(".result-rate-stars");
    const hoverValue = Number(btn.dataset.stars);
    [...group.children].forEach((star) => {
      star.classList.toggle("hovered", Number(star.dataset.stars) <= hoverValue);
    });
  });

  list.addEventListener("mouseout", (e) => {
    const group = e.target.closest(".result-rate-stars");
    if (!group) return;
    if (group.contains(e.relatedTarget)) return;
    [...group.children].forEach((star) => star.classList.remove("hovered"));
  });
}

// ── Map markers setup ─────────────────────────────────
const ICON_HTML = {
  reciclaje: `<div style="background:#2d8c4e;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.25)"><img src="img/reciclaje.png" style="transform:rotate(45deg);width:35px;height:35px;object-fit:contain;filter:brightness(0) invert(1)" alt="reciclaje"></div>`,
  donacion:  `<div style="background:#d63a3a;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.25)"><img src="img/corazon.png" style="transform:rotate(45deg);width:35px;height:35px;object-fit:contain" alt="corazon"></div>`,
  acopio:    `<div style="background:#5a8c5a;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.25)"><img src="img/manos v2.png" style="transform:rotate(45deg);width:35px;height:35px;object-fit:contain" alt="manos"></div>`,
};

function makeIcon(type) {
  return L.divIcon({
    className: "",
    html: ICON_HTML[type] || ICON_HTML.reciclaje,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -36],
  });
}

// ── State ─────────────────────────────────────────────
let activeFilter = "todos";
let activeSort = "cercanos";
let markers = [];
let map;
let userLat = null;
let userLng = null;
let resultsExpanded = false;

// ── Init ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadAllPoints();
  applyStoredRatings();
  initMap();
  renderResults(getFilteredSortedPoints());
  initFilters();
  initSort();
  initTooltip();
  initModal();
  initSeeAll();
  initSearch();
  initRatingWidget();
  cycleFacts();
  initLangSync();
});

// ── Idioma dinámico ─────────────────────────────────────
// i18n.js traduce automáticamente todo lo que tiene data-i18n en el
// HTML estático, pero la lista de resultados y los popups del mapa
// se generan en JS (innerHTML), así que no se actualizan solos. Al
// recibir el evento "reco:langchange" (disparado por applyLang en
// i18n.js), volvemos a pintar esas partes con el idioma nuevo.
function initLangSync() {
  document.addEventListener("reco:langchange", () => {
    refreshResults(); // vuelve a construir cards + marcadores/popups con t()
  });
}

// ── Map ───────────────────────────────────────────────
function initMap() {

  map = L.map("map", {
    center: [9.3592, -79.9014],
    zoom: 13,
    zoomControl: true,
  });

  // Expone la instancia globalmente para que capas aditivas externas
  // (ej. mapa-theme-sync.js, que cambia el tile al togglear el tema)
  // puedan acceder al mapa sin necesidad de reestructurar este archivo.
  window.recoMap = map;

  // Tile del mapa: OSM claro por defecto, CartoDB Dark Matter si el
  // sitio está en modo oscuro (html.dark, controlado por darkmode.js).
  // mapa-dark-theme.css se encarga del resto (popups, marcador de
  // usuario, etc.) — aquí solo se elige la capa de teselas correcta.
  const isDark = document.documentElement.classList.contains("dark");
  window.recoMapTileLayer = L.tileLayer(
    isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: isDark
        ? '© OpenStreetMap © CARTO'
        : '© OpenStreetMap',
      maxZoom: 19,
    }
  ).addTo(map);

  // Obtener ubicación REAL
  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        userLat = lat;
        userLng = lng;

        // Centrar mapa
        map.setView([lat, lng], 15);

        // Círculo
        L.circle([lat, lng], {
          radius: 1500,
          color: "#2d8c4e",
          fillColor: "#a8dab5",
          fillOpacity: 0.18,
          weight: 1.5,
          dashArray: "6 4",
        }).addTo(map);

        // Marcador usuario — punto azul con pulso, estilo Google Maps
        // (.user-location-marker viene de mapa-dark-theme.css, igual
        // en modo claro y oscuro).
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: "",
            html: '<div class="user-location-marker"><span class="dot-pulse"></span><span class="dot-core"></span></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
          zIndexOffset: 1000,
        })
        .addTo(map)
        .bindTooltip(typeof t === "function" ? t("mapa.results.locateTooltip") : "Tu ubicación", {
          permanent: false,
          direction: "top"
        });

      },

      () => {
        console.log("No se pudo obtener ubicación");
      }

    );

  }

  addMarkers(POINTS);
}

function addMarkers(points) {
  // Remove old
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  points.forEach((p) => {
    const m = L.marker([p.lat, p.lng], { icon: makeIcon(p.type) })
      .addTo(map)
      .bindPopup(buildPopup(p), { maxWidth: 220 });

    m.on("click", () => highlightResult(p.id));
    markers.push(m);
  });
}

function buildPopup(p) {
  const tagClass = p.type === "reciclaje" ? "reciclaje" : p.type === "donacion" ? "donacion" : "acopio";
  const tagLabel = typeof t === "function" ? t(`mapa.type.${p.type}`) : p.type.charAt(0).toUpperCase() + p.type.slice(1);
  const routeLabel = tt("mapa.route.btn", "🧭 Cómo llegar");
  return `
    <div style="font-family:'DM Sans',sans-serif;min-width:170px">
      <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem">
        <strong class="popup-name" style="font-size:.9rem;color:#1a5c2a">${p.name}</strong>
        <span class="popup-tag ${tagClass}" style="font-size:.62rem;background:${tagClass === "reciclaje" ? "#ddf0e3;color:#1a5c2a" : tagClass === "donacion" ? "#dbeeff;color:#1a5a90" : "#ede8f8;color:#5a3a9a"};padding:.12rem .4rem;border-radius:999px;font-weight:700;text-transform:uppercase">${tagLabel}</span>
      </div>
      <p class="popup-address" style="font-size:.74rem;color:#8aab90;margin:0 0 .4rem">${p.address}</p>
      ${typeof p.rating === "number" ? `<p style="font-size:.76rem;color:#8aab90;margin:0 0 .3rem;display:flex;align-items:center;gap:.3rem"><span style="color:#f0b429;display:inline-flex;align-items:center">${renderStars(p.rating)}</span><span class="popup-rating-value" style="font-weight:600">${p.rating.toFixed(1)} (${p.reviewCount || 0})</span></p>` : ""}
      <p class="popup-distance" style="font-size:.78rem;font-weight:700;color:#2d8c4e;margin:0">${p.distance} km</p>
      <div style="margin-top:.4rem;display:flex;gap:.2rem;flex-wrap:wrap">
        ${p.materialIcons.map((ic) => `<span style="font-size:.9rem">${ic}</span>`).join("")}
      </div>
      <button type="button" class="popup-route-btn" data-lat="${p.lat}" data-lng="${p.lng}" data-name="${p.name.replace(/"/g, "&quot;")}">${routeLabel}</button>
    </div>
  `;
}

// ── Results List ──────────────────────────────────────
function renderResults(points) {
  const list = document.getElementById("resultsList");
  const count = document.getElementById("resultCount");
  count.textContent = points.length;

  list.innerHTML = "";

  if (!points.length) {
    list.innerHTML = `<li style="padding:1.5rem 1.1rem;text-align:center;color:var(--text-light);font-size:.85rem">${typeof t === "function" ? t("mapa.results.empty") : "Sin resultados para este filtro."}</li>`;
    return;
  }

  points.forEach((p) => {
    const typeLabel =
      typeof t === "function"
        ? t(`mapa.type.${p.type}`)
        : p.type === "reciclaje" ? "Reciclaje" : p.type === "donacion" ? "Donación" : "Acopio";
    const iconEmoji = p.type === "reciclaje"
      ? `<img src="img/reciclaje.png" style="width:35px;height:35px;object-fit:contain;filter:brightness(0) saturate(100%) invert(35%) sepia(60%) saturate(500%) hue-rotate(90deg)" alt="reciclaje">`
      : p.type === "donacion"
      ? `<img src="img/corazon.png" style="width:50px;height:50px;object-fit:contain" alt="corazon">`
      : `<img src="img/manos v2.png" style="width:35px;height:35px;object-fit:contain" alt="manos">`;

    const li = document.createElement("li");
    li.className = "result-item";
    li.dataset.id = p.id;
    li.innerHTML = `
      <div class="result-icon ${p.type}">${iconEmoji}</div>
      <div class="result-body">
        <div class="result-name-row">
          <span class="result-name">${p.name}</span>
          <span class="type-tag ${p.type === "donacion" ? "donacion" : p.type === "acopio" ? "acopio" : "reciclaje"}">${typeLabel}</span>
        </div>
        <p class="result-address">${p.address}</p>
        ${buildRatingHTML(p)}
        ${buildRateWidgetHTML(p)}
        <div class="result-materials">
          ${p.materialIcons.map((ic) => `<span class="material-icon">${ic}</span>`).join("")}
        </div>
      </div>
      <div class="result-distance">${p.distance} km</div>
    `;
    li.addEventListener("click", () => {
      map.setView([p.lat, p.lng], 16, { animate: true });
      markers.forEach((m) => {
        const pos = m.getLatLng();
        if (Math.abs(pos.lat - p.lat) < 0.001 && Math.abs(pos.lng - p.lng) < 0.001) {
          m.openPopup();
        }
      });
      li.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    list.appendChild(li);
  });
}

function highlightResult(id) {
  document.querySelectorAll(".result-item").forEach((el) => {
    el.style.background = el.dataset.id == id ? "var(--green-pale)" : "";
  });
  const target = document.querySelector(`.result-item[data-id="${id}"]`);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ── Filters ───────────────────────────────────────────
function initFilters() {
  document.getElementById("filterChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    document
      .querySelectorAll("#filterChips .chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");

    activeFilter = chip.dataset.filter;
    applyFilter();
  });
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointDistance(p) {
  // Si tenemos ubicación real del usuario, calculamos distancia real;
  // si no, usamos el campo "distance" fijo que ya trae cada punto.
  if (userLat != null && userLng != null) {
    return haversineKm(userLat, userLng, p.lat, p.lng);
  }
  return p.distance;
}

function sortPoints(points, sortBy) {
  const sorted = points.slice();
  if (sortBy === "valorados") {
    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "recientes") {
    sorted.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  } else {
    // "cercanos" (default)
    sorted.sort((a, b) => pointDistance(a) - pointDistance(b));
  }
  return sorted;
}

function getSearchQuery() {
  const input = document.getElementById("searchInput");
  return input ? input.value.toLowerCase().trim() : "";
}

function getFilteredSortedPoints() {
  let filtered = POINTS;

  if (activeFilter !== "todos") {
    filtered = filtered.filter((p) => p.materials.includes(activeFilter));
  }

  const q = getSearchQuery();
  if (q) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.type.includes(q)
    );
  }

  return sortPoints(filtered, activeSort);
}

function refreshResults() {
  const points = getFilteredSortedPoints();
  renderResults(points);
  addMarkers(points);
}

function applyFilter() {
  refreshResults();
}

// ── Sort ──────────────────────────────────────────────
function initSort() {
  const select = document.getElementById("sortSelect");
  if (!select) return;
  select.addEventListener("change", () => {
    activeSort = select.value;
    refreshResults();
  });
}

// ── Search ────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById("searchInput");

  input.addEventListener("input", () => {
    refreshResults();
  });

  // Locate button
  document.querySelector(".locate-btn").addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        map.setView([userLat, userLng], 15, { animate: true });
        if (activeSort === "cercanos") refreshResults();
      },
      () => alert(typeof t === "function" ? t("mapa.results.locateError") : "No se pudo obtener tu ubicación.")
    );
  });
}

// ── Tooltip / Facts ───────────────────────────────────
function initTooltip() {
  document.getElementById("tooltipClose").addEventListener("click", () => {
    document.getElementById("mapTooltip").classList.add("hidden");
  });
}

function cycleFacts() {
  let idx = 0;
  const factEl = document.getElementById("tooltipFact");
  factEl.textContent = getCurrentFacts()[idx];

  setInterval(() => {
    const facts = getCurrentFacts();
    idx = (idx + 1) % facts.length;
    const tooltip = document.getElementById("mapTooltip");
    if (!tooltip.classList.contains("hidden")) {
      factEl.style.opacity = 0;
      setTimeout(() => {
        factEl.textContent = facts[idx];
        factEl.style.transition = "opacity .4s";
        factEl.style.opacity = 1;
      }, 250);
    }
  }, 8000);
}

// ── Modal ─────────────────────────────────────────────
function initModal() {
  const overlay = document.getElementById("modalOverlay");

  document.getElementById("suggestBtn").addEventListener("click", () => {
    overlay.classList.add("open");
  });

  document.getElementById("modalClose").addEventListener("click", () => {
    overlay.classList.remove("open");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });

  const submitBtn = document.querySelector(".modal-submit");
  const nameInput = overlay.querySelectorAll(".modal-input")[0];
  const addressInput = overlay.querySelectorAll(".modal-input")[1];
  const latInput = document.getElementById("modalLat");
  const lngInput = document.getElementById("modalLng");
  const useLocationBtn = document.getElementById("modalUseMyLocation");
  const typeSelect = document.getElementById("modalTypeSelect");
  const materialsWrap = document.getElementById("modalMaterials");
  const commentsInput = overlay.querySelector("textarea.modal-input");
  let selectedMaterials = [];

  // Botón "📍 usar mi ubicación": rellena lat/lng con el GPS del
  // navegador, pero los campos siguen siendo editables a mano después.
  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast(tt("mapa.modal.errorGeoUnsupported", "Tu navegador no soporta geolocalización."));
        return;
      }
      useLocationBtn.classList.add("is-loading");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          latInput.value = pos.coords.latitude.toFixed(6);
          lngInput.value = pos.coords.longitude.toFixed(6);
          useLocationBtn.classList.remove("is-loading");
        },
        () => {
          useLocationBtn.classList.remove("is-loading");
          showToast(tt("mapa.modal.errorGeoDenied", "No se pudo obtener tu ubicación."));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  // Chips de materiales: toggle simple, mismo patrón visual que los
  // filtros del mapa (clase .active ya trae su estilo desde el CSS).
  if (materialsWrap) {
    materialsWrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      chip.classList.toggle("active");
      const material = chip.dataset.material;
      if (chip.classList.contains("active")) {
        if (!selectedMaterials.includes(material)) selectedMaterials.push(material);
      } else {
        selectedMaterials = selectedMaterials.filter((m) => m !== material);
      }
    });
  }

  submitBtn.addEventListener("click", async () => {
    const name = (nameInput.value || "").trim();
    const address = (addressInput.value || "").trim();
    const type = typeSelect.value;
    const comments = (commentsInput.value || "").trim();

    if (!name || !address || !type) {
      showToast(tt("mapa.modal.errorRequired", "Completa nombre, dirección y tipo de punto."));
      return;
    }

    const coords = parseCoords(latInput.value, lngInput.value);
    if (!coords) {
      showToast(
        tt(
          "mapa.modal.errorCoords",
          "Escribe una latitud y longitud válidas (o usa el botón 📍)."
        )
      );
      return;
    }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = tt("mapa.modal.sending", "Enviando...");

    try {
      await submitSuggestion({
        name,
        address,
        type: type === "evento" ? "reciclaje" : type,
        materials: selectedMaterials,
        comments,
        lat: coords.lat,
        lng: coords.lng,
      });

      overlay.classList.remove("open");
      nameInput.value = "";
      addressInput.value = "";
      latInput.value = "";
      lngInput.value = "";
      commentsInput.value = "";
      typeSelect.selectedIndex = 0;
      if (materialsWrap) {
        materialsWrap.querySelectorAll(".chip.active").forEach((c) => c.classList.remove("active"));
      }
      selectedMaterials = [];

      showToast(
        typeof t === "function"
          ? t("mapa.modal.submitToast")
          : "¡Gracias! Tu sugerencia fue guardada 🌱"
      );
    } catch (err) {
      console.error("Error al guardar la sugerencia:", err);
      showToast(
        tt(
          "mapa.modal.errorSaving",
          "No se pudo guardar tu sugerencia. Intenta de nuevo en un momento."
        )
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}

// ── Ver todos los resultados ────────────────────────────
// La lista ya muestra todo lo que pasa el filtro/búsqueda activos,
// pero queda limitada a 500px con scroll interno (ver
// liquid-glass-mapa.css). "Ver todos" expande la sidebar para
// desplegar cada resultado sin ese límite, y el botón se convierte
// en "Ver menos" para volver a la vista compacta.
function initSeeAll() {
  const btn = document.getElementById("seeAllBtn");
  const list = document.getElementById("resultsList");
  if (!btn || !list) return;

  btn.addEventListener("click", () => {
    resultsExpanded = !resultsExpanded;
    list.classList.toggle("results-list--expanded", resultsExpanded);
    btn.classList.toggle("is-expanded", resultsExpanded);

    if (resultsExpanded) {
      btn.textContent = tt("mapa.sidebar.seeless", "Ver menos");
      showToast(
        typeof t === "function"
          ? t("mapa.results.seeallToast")
          : "Mostrando todos los puntos disponibles."
      );
    } else {
      btn.textContent = tt("mapa.sidebar.seeall", "Ver todos los resultados");
      list.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

// ── Toast ─────────────────────────────────────────────
function showToast(msg) {
  const old = document.getElementById("toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "5rem",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1a5c2a",
    color: "#fff",
    padding: ".65rem 1.4rem",
    borderRadius: "999px",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: ".85rem",
    fontWeight: "600",
    boxShadow: "0 4px 20px rgba(0,0,0,.2)",
    zIndex: "2000",
    opacity: "0",
    transition: "opacity .3s",
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = "1"; });
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}