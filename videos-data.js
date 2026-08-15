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

  // Biblioteca de videos. Los primeros 7 (v1–v7) son los mismos que ya
  // se muestran en el hero de guia.html, para que el flujo "ver video
  // desde Guía" lleve al usuario exactamente a ese video en la biblioteca.
  var VIDEOS = [
    {
      id: "v1", category: "reciclaje", duration: "02:45", variant: 1,
      titleKey: "guia.video1.title", titleFallback: "El poder de reciclar",
      descKey: "guia.video1.desc", descFallback: "Pequeñas acciones que generan grandes cambios al planeta."
    },
    {
      id: "v2", category: "donacion", duration: "03:10", variant: 2,
      titleKey: "guia.video2.title", titleFallback: "Donar es transformar",
      descKey: "guia.video2.desc", descFallback: "Tus donaciones pueden mejorar la vida de muchas personas."
    },
    {
      id: "v3", category: "sostenibilidad", duration: "02:20", variant: 3,
      titleKey: "guia.video3.title", titleFallback: "Nuestro planeta, nuestro hogar",
      descKey: "guia.video3.desc", descFallback: "Acciones simples que protegen nuestro planeta cada día."
    },
    {
      id: "v4", category: "reciclaje", duration: "01:58", variant: 2,
      titleKey: "guia.mini1.title", titleFallback: "Cómo separar correctamente",
      descKey: "videos.v4.desc", descFallback: "Aprende a clasificar cada material antes de llevarlo a un punto de reciclaje."
    },
    {
      id: "v5", category: "reciclaje", duration: "02:05", variant: 3,
      titleKey: "guia.mini2.title", titleFallback: "Qué pasa con tus residuos",
      descKey: "videos.v5.desc", descFallback: "Sigue el viaje de tus residuos desde el contenedor hasta su transformación."
    },
    {
      id: "v6", category: "sostenibilidad", duration: "01:45", variant: 1,
      titleKey: "guia.mini3.title", titleFallback: "Reutilizar para vivir mejor",
      descKey: "videos.v6.desc", descFallback: "Dale una segunda vida a los objetos que ya no usas."
    },
    {
      id: "v7", category: "sostenibilidad", duration: "02:30", variant: 2,
      titleKey: "guia.mini4.title", titleFallback: "Economía circular explicada fácil",
      descKey: "videos.v7.desc", descFallback: "Entiende el ciclo que convierte residuos en nuevos recursos."
    },
    {
      id: "v8", category: "donacion", duration: "02:12", variant: 3,
      titleKey: "videos.v8.title", titleFallback: "Cómo donar de forma segura",
      descKey: "videos.v8.desc", descFallback: "Consejos prácticos para coordinar una donación sin contratiempos."
    },
    {
      id: "v9", category: "donacion", duration: "03:02", variant: 1,
      titleKey: "videos.v9.title", titleFallback: "El impacto de tu donación",
      descKey: "videos.v9.desc", descFallback: "Conoce a dónde llega lo que compartes y cómo cambia vidas."
    },
    {
      id: "v10", category: "comunidad", duration: "02:38", variant: 2,
      titleKey: "videos.v10.title", titleFallback: "Historias que transforman vidas",
      descKey: "videos.v10.desc", descFallback: "Testimonios reales de personas que reciclan y donan con RECO+."
    },
    {
      id: "v11", category: "comunidad", duration: "01:52", variant: 3,
      titleKey: "videos.v11.title", titleFallback: "Comunidades que reciclan juntas",
      descKey: "videos.v11.desc", descFallback: "Cómo un barrio organizado puede multiplicar su impacto ambiental."
    },
    {
      id: "v12", category: "sostenibilidad", duration: "02:15", variant: 1,
      titleKey: "videos.v12.title", titleFallback: "Reduce, reutiliza, recicla",
      descKey: "videos.v12.desc", descFallback: "Los tres pilares que sostienen un estilo de vida sostenible."
    }
  ];

  global.RECO_VIDEOS_DATA = { categories: CATEGORIES, videos: VIDEOS };
})(window);
