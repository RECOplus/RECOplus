/**
 * videos-data.js
 * Fuente única de datos para la biblioteca de videos de RECO+.
 * La usan guia.html (accesos rápidos del hero) y videos.html
 * (biblioteca completa con filtro por categoría).
 *
 * Capa 100% aditiva: no depende de ningún otro script y no modifica
 * el DOM por sí sola. Solo expone window.RECO_VIDEOS_DATA.
 *
 * Cárgalo ANTES de videos-hub.js:
 * <script src="videos-data.js"></script>
 */
(function (global) {
  "use strict";

  // Categorías del filtro. El orden aquí define el orden de los chips.
  var CATEGORIES = [
    { key: "reciclaje",      labelKey: "videos.cat.reciclaje",      fallback: "Reciclaje",
      icon: '<path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"/><circle cx="10" cy="8" r="2"/>' },
    { key: "donacion",       labelKey: "videos.cat.donacion",       fallback: "Donación",
      icon: '<path d="M3 11c0-2.5 2-4 4-3l3 1.5 5-1.5c1.2-.2 2.5.6 2.5 2 0 1.2-.8 2-2 2l-3.5.5"/><path d="M3 11l2 5h3l7-4"/>' },
    { key: "sostenibilidad", labelKey: "videos.cat.sostenibilidad", fallback: "Sostenibilidad",
      icon: '<circle cx="10" cy="10" r="7.5"/><path d="M10 2.5c-2.5 2.5-2.5 12.5 0 15M10 2.5c2.5 2.5 2.5 12.5 0 15" fill="none"/><path d="M2.7 7.3h14.6M2.7 12.7h14.6"/>' },
    { key: "comunidad",      labelKey: "videos.cat.comunidad",      fallback: "Comunidad",
      icon: '<circle cx="6.5" cy="7" r="2.2"/><circle cx="13.5" cy="7" r="2.2"/><path d="M2 17c0-2.8 2-4.8 4.5-4.8s4.5 2 4.5 4.8M9 17c0-2.5 1.8-4.3 4.5-4.3s4.5 1.8 4.5 4.3"/>' }
  ];

  // Biblioteca de videos. Antes contenía videos de demostración
  // estáticos (v1–v12); ahora la biblioteca se llena 100% con
  // videos reales de la comunidad, agregados dinámicamente por
  // videos-supabase.js desde la tabla `videos_usuario` (estado
  // 'aprobado'). Este array empieza vacío a propósito.
  var VIDEOS = [];

  global.RECO_VIDEOS_DATA = { categories: CATEGORIES, videos: VIDEOS };
})(window);
