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
 *
 * NOTA (cambio de arquitectura): la función "Subir video" (comunidad)
 * fue removida del sitio. Estos 9 videos son los que estaban con
 * estado 'aprobado' en la tabla videos_usuario de Supabase — se
 * congelaron aquí como contenido estático, con título/descripción
 * en español (fallback) e inglés (vía titleKey/descKey en i18n.js,
 * igual que el resto del sitio), para que el toggle ES/EN los
 * traduzca sin depender de ningún backend.
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

  // Biblioteca de videos: contenido estático, en el orden en que
  // aparecían por fecha de creación en Supabase (más reciente primero).
  // "duration" queda null (no lo teníamos registrado); "videoUrl" abre
  // el video original en el modal reproductor del sitio.
  var VIDEOS = [
    {
      id: "v16", category: "donacion", duration: null, variant: 1,
      titleKey: "videos.v16.titulo", titleFallback: "Recycled Today, Brighter Tomorrow",
      descKey: "videos.v16.desc", descFallback: "Enseña a los niños las tres R: reducir, reutilizar y reciclar. También muestra cómo donar ropa que ya no se necesita para que otras personas puedan aprovecharla.",
      videoUrl: "https://www.pbs.org/video/recycled-today-brighter-tomorrow-u5yfei/"
    },
    {
      id: "v20", category: "reciclaje", duration: null, variant: 2,
      titleKey: "videos.v20.titulo", titleFallback: "¿Cómo reciclar? Aprende con Nacho las 3 R del reciclaje",
      descKey: "videos.v20.desc", descFallback: "Nacho explica de forma entretenida cómo reducir, reutilizar y reciclar para cuidar el planeta y generar menos basura.",
      videoUrl: "https://www.youtube.com/watch?v=WVrxkF6TcQU"
    },
    {
      id: "v19", category: "reciclaje", duration: null, variant: 3,
      titleKey: "videos.v19.titulo", titleFallback: "Reducir, Reutilizar y Reciclar. Para mejorar el mundo",
      descKey: "videos.v19.desc", descFallback: "Explica de manera sencilla las tres R y enseña a los niños cómo reducir desperdicios, reutilizar objetos y reciclar materiales para cuidar el planeta.",
      videoUrl: "https://www.youtube.com/watch?v=cvakvfXj0KE"
    },
    {
      id: "v18", category: "reciclaje", duration: null, variant: 1,
      titleKey: "videos.v18.titulo", titleFallback: "¡Reutilicen!",
      descKey: "videos.v18.desc", descFallback: "Elmo y Ernie muestran cómo reutilizar objetos, como una botella de agua, para crear cosas nuevas y divertidas en lugar de desecharlos.",
      videoUrl: "https://sesameworkshop.org/resources/reutilicen/"
    },
    {
      id: "v17", category: "donacion", duration: null, variant: 2,
      titleKey: "videos.v17.titulo", titleFallback: "Ayudar a los demás",
      descKey: "videos.v17.desc", descFallback: "Elmo enseña diferentes formas de ayudar a las personas de la comunidad, incluyendo donar juguetes y ropa en buen estado que ya no usamos.",
      videoUrl: "https://sesameworkshop.org/resources/ayudar-los-demas/"
    },
    {
      id: "v10", category: "reciclaje", duration: null, variant: 3,
      titleKey: "videos.v10.titulo", titleFallback: "¿Qué es el reciclaje y por qué es importante?",
      descKey: "videos.v10.desc", descFallback: "El video explica las consecuencias de dejar de reciclar y cómo esto afecta al medio ambiente, aumentando la contaminación y el desperdicio de recursos.",
      videoUrl: "https://youtu.be/d84Sbs5IVzc"
    },
    {
      id: "v9", category: "reciclaje", duration: null, variant: 1,
      titleKey: "videos.v9.titulo", titleFallback: "¿Qué sucede con la basura que generamos?",
      descKey: "videos.v9.desc", descFallback: "El video explica las consecuencias de la generación excesiva de basura y destaca la importancia del reciclaje para reducir la contaminación y proteger el medio ambiente.",
      videoUrl: "https://youtu.be/Rn7mCLIew6c"
    },
    {
      id: "v8", category: "reciclaje", duration: null, variant: 2,
      titleKey: "videos.v8.titulo", titleFallback: "¿Cómo reciclar?",
      descKey: "videos.v8.desc", descFallback: "El video explica la importancia del reciclaje y la correcta separación de los residuos, promoviendo hábitos responsables para cuidar y proteger el medio ambiente.",
      videoUrl: "https://youtu.be/YiHTNfKJwAw"
    },
    {
      id: "v1", category: "reciclaje", duration: null, variant: 3,
      titleKey: "videos.v1.titulo", titleFallback: "que es reciclar",
      descKey: "videos.v1.desc", descFallback: "que es reciclar",
      videoUrl: "https://youtu.be/uaI3PLmAJyM"
    }
  ];

  global.RECO_VIDEOS_DATA = { categories: CATEGORIES, videos: VIDEOS };
})(window);
