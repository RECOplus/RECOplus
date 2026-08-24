/**
 * RECO+ — Sistema de traducción ES / EN  (v2)
 * Guarda la preferencia en localStorage bajo la clave "reco-lang".
 * Agrega data-i18n="clave" a cualquier elemento para traducirlo automáticamente.
 *
 * Correcciones v2:
 *  - OPTIONs de SELECT usan textContent (no innerHTML) para no romper el DOM.
 *  - Botones con íconos SVG/img solo actualizan el nodo de texto, preservando íconos.
 *  - El desplazamiento del lang-knob se calcula dinámicamente desde el DOM
 *    (compatible con el bubble-nav que usa track 28px / knob 12px).
 *  - Los estilos inyectados ya no sobreescriben lang-track/lang-knob del bubble-nav CSS.
 *  - Cobertura completa: index, mapa, guia, donar, alianzas.
 */

const translations = {
  es: {
    /* ── NAV ── */
    "nav.inicio":   "Inicio",
    "nav.reciclar": "Reciclar",
    "nav.mapa":     "Mapa",
    "nav.guia":     "Guía",
    "nav.donar":    "Donar / Ayuda",
    "nav.blog":     "Blog",
    "nav.alianzas": "Alianzas",
    "nav.contacto": "Contacto",
    "nav.scanner":  "Escáner",
    "nav.unete":    "Únete",
    "nav.ajustes":      "Ajustes",
    "nav.otraCuenta":   "Iniciar con otra cuenta",
    "nav.cerrarSesion": "Cerrar sesión",
    "nav.darkmode.toggle": "Cambiar modo claro/oscuro",
    "nav.lang.toggle":     "Cambiar idioma",
    "nav.accesoRapido":   "Acceso rápido",
    "nav.carousel.anterior":  "Anterior",
    "nav.carousel.siguiente": "Siguiente",
    "nav.cerrarVentana":  "Cerrar ventana",
    "nav.cerrar":         "Cerrar",

    /* ── NOTIFICACIONES ── */
    "notif.titulo":        "Notificaciones",
    "notif.marcarTodas":   "Marcar todas como leídas",
    "notif.vacio":         "No tienes notificaciones todavía.",
    "notif.tiempo.ahora":  "Ahora",
    "notif.tiempo.min":    "min",
    "notif.tiempo.hr":     "h",
    "notif.tiempo.dia":    "d",
    "notif.tiempo.semana": "sem",
    "notif.tiempo.mes":    "mes",

    /* ── NAV: descripciones (tooltip al pasar el cursor) ── */
    "nav.inicio.desc":   "Vuelve a la página principal.",
    "nav.reciclar.desc": "Centros de reciclaje cerca de ti.",
    "nav.donar.desc":    "Comparte lo que ya no usas y cambia vidas.",
    "nav.guia.desc":     "Aprende paso a paso cómo reciclar y donar.",
    "nav.contacto.desc": "Escríbenos, respondemos en menos de 24h.",
    "nav.blog.desc":     "Historias, tips y noticias sobre sostenibilidad.",
    "nav.mapa.desc":     "Explora el mapa de reciclaje y donación.",
    "nav.alianzas.desc": "Empresas que impulsan el cambio.",
    "nav.scanner.desc":  "Identifica el material al instante con IA.",

    /* ── HERO ── */
    "hero.title":       "Conecta, recicla<br>y transforma",
    "hero.subtitle":    "Encuentra puntos de reciclaje, dona lo que ya no usas y ayuda a construir un mundo mejor.",
    "hero.placeholder": "¿Qué deseas reciclar o donar?",
    "hero.search":      "Buscar",
    "hero.mapa":        "Explorar Mapa ",
    "hero.donar":       "Donar ahora ",
    "hero.tienda":      "Ir a la tienda ",
    "hero.alianzas":    "Ver alianzas",
    "hero.mapa.desc":     "Centros de reciclaje cerca de ti.",
    "hero.alianzas.desc": "Empresas que impulsan el cambio.",
    "hero.tienda.desc":   "Canjea tus puntos por premios.",
    "hero.scanner":       "Escáner IA",
    "hero.scanner.desc":  "Identifica el material al instante.",

    /* ── DATOS CURIOSOS ── */
    "curiosidades.title": "Datos curiosos sobre la reciclación",
    "curiosidad.1": "1 botella de plástico puede tardar hasta <strong>450 años</strong> en descomponerse.",
    "curiosidad.2": "Reciclar 1 tonelada de papel salva aproximadamente <strong>17 árboles</strong>.",
    "curiosidad.3": "Reciclar aluminio ahorra hasta un <strong>95% de energía</strong>.",
    "curiosidad.4": "Cada tonelada de plástico reciclado evita la contaminación de <strong>1,000 m³</strong> de agua.",
    "curiosidad.5": "Si reciclamos más, podemos reducir hasta un <strong>30%</strong> las emisiones de gases de efecto invernadero.",

    /* ── ACCIONES ── */
    /* ── BANNER RECICLAR / DONAR ── */
    "rd.reciclar.title": "Reciclar",
    "rd.reciclar.desc":  "Separa tus residuos y llévalos a los puntos de reciclaje.",
    "rd.donar.title":    "Donar",
    "rd.donar.desc":     "Comparte lo que ya no usas y cambia vidas.",
    "rd.saberMas":       "Saber más →",

    "acciones.title":       "¿Qué puedes hacer?",
    "card1.title":          "Encontrar puntos",
    "card1.desc":           "Ubica centros <br> de reciclaje <br> cercanos a ti.",
    "card1.cta":            "Ver mapa →",
    "card2.title":          "Donar",
    "card2.desc":           "Dona objetos que ya no usas <br> y ayuda a quienes  mas <br> lo necesitan.",
    "card2.cta":            "Saber más →",
    "card2.scroll.libros":       "📚 Libros",
    "card2.scroll.electronicos": "🖥️ Electrónicos",
    "card2.scroll.muebles":      "🪑 Muebles",
    "card2.scroll.juguetes":     "🧸 Juguetes",
    "card2.scroll.ropa":         "👗 Ropa",
    "card3.title":          "Solicitar ayuda",
    "card3.desc":           "Pide lo que necesitas <br>o publica una solicitud<br> a tu comunidad.",
    "card3.cta":            "Saber más →",
    "card4.title":          "Guía práctica",
    "card4.desc":           "Aprende paso a paso cómo reciclar, donar y obtener beneficios.",
    "card4.step1":          "Encuentra puntos",
    "card4.step2":          "Dona o recicla",
    "card4.step3":          "Obtén beneficios",
    "card4.cta":            "Ver guía →",
    "card5.title":          "Alianzas",
    "card5.desc":           "Empresas y organizaciones que impulsan el cambio junto a RECO+.",
    "card5.cta":            "Ver alianzas →",
    "card6.title":          "Contáctanos",
    "card6.desc":           "Estamos aquí para ayudarte. Escríbenos y respondemos en menos de 24h.",
    "card6.cta":            "Escribirnos →",
    "card7.title":          "Blog",
    "card7.desc":           "Historias, tips y noticias sobre reciclaje, sostenibilidad y comunidad.",
    "card7.tag1":           "♻️ Reciclaje",
    "card7.tag2":           "🌍 Sostenibilidad",
    "card7.tag3":           "💚 Comunidad",
    "card7.tag4":           "🔋 Tecnología",
    "card7.tag5":           "🌱 Impacto",
    "card7.cta":            "Leer blog →",

    "acc.aria.map":        "Encontrar puntos de reciclaje",
    "acc.aria.donate":     "Donar objetos",
    "acc.aria.help":       "Solicitar ayuda de la comunidad",
    "acc.aria.guide":      "Explorar la guía de reciclaje",
    "acc.aria.allies":     "Ver alianzas y empresas",
    "acc.aria.contact":    "Ir a la página de contacto",
    "acc.aria.blog":       "Explorar el blog de RECO+",

    /* ── STATS ── */
    "stats.personas":  "Personas activas",
    "stats.puntos":    "Puntos de reciclaje",
    "stats.toneladas": "Toneladas recicladas",
    "stats.comunidades":"Comunidades",

    /* ── TIENDA ── */
    "tienda.title":       "Tienda RECOTech",
    "tienda.subtitle":    "Reutiliza tecnología y reduce residuos.",
    "tienda.ver-todos":   "Ver todos los productos →",
    "tienda.badge":       "Destacado",
    "prod1.nombre":       "Tarjeta madre<br>Laptop HP",
    "prod1.estado":       "Buen estado",
    "prod2.nombre":       "Motor de lavadora<br>Whirlpool",
    "prod2.estado":       "Usado",
    "prod3.nombre":       "Webcam<br>Logitech C920",
    "prod3.estado":       "Buen estado",
    "prod4.nombre":       "Pantalla de celular<br>Samsung A50",
    "prod4.estado":       "Usado",
    "prod5.nombre":       "Fuente de poder<br>600W",
    "prod5.estado":       "Buen estado",
    "prod6.nombre":       "Memoria RAM<br>8GB DDR4",
    "prod6.estado":       "Buen estado",
    "tienda.ver-prod":    "Ver producto",
    "trust.segura":       "Compra segura",
    "trust.segura.desc":  "Productos verificados",
    "trust.ahorra":       "Ahorra y reutiliza",
    "trust.ahorra.desc":  "Dale una segunda vida",
    "trust.vende":        "Vende fácil",
    "trust.vende.desc":   "Publica en minutos",
    "trust.comision":     "Comisión accesible",
    "trust.comision.desc":"Solo 10% por venta",

    /* ── CÓMO FUNCIONA ── */
    "comofunciona.title":       "¿Cómo funciona?",
    "comofunciona.step1.title": "Publica",
    "comofunciona.step1.desc":  "Publica lo que quieres reciclar, donar o reutilizar.",
    "comofunciona.step2.title": "Conecta",
    "comofunciona.step2.desc":  "Personas cerca de ti encontrarán tu publicación.",
    "comofunciona.step3.title": "Intercambia",
    "comofunciona.step3.desc":  "Coordina la entrega o recogida de forma fácil y segura.",
    "comofunciona.step4.title": "Impacta",
    "comofunciona.step4.desc":  "Juntos reducimos residuos y construimos un mundo más sostenible.",

    /* ── QUÉ PUEDES DONAR O RECICLAR ── */
    "materiales.title":        "¿Qué puedes donar o reciclar?",
    "materiales.electronicos": "Electrónicos",
    "materiales.ropa":         "Ropa",
    "materiales.libros":       "Libros",
    "materiales.muebles":      "Muebles",
    "materiales.plastico":     "Plástico",
    "materiales.vidrio":       "Vidrio",
    "materiales.juguetes":     "Juguetes",
    "materiales.mas":          "Más",

    /* ── ALIADOS ── */
    "aliados.title":      "Empresas y aliados que confían en nosotros",

    /* ── TESTIMONIOS ── */
    "testimonios.title":  "Lo que dice nuestra comunidad",
    "test1.texto":        "\"Gracias a RECO+ pude encontrar piezas para reparar mi laptop a un precio justo y ayudé al planeta.\"",
    "test2.texto":        "\"Doné ropa y objetos que ya no usaba y saber que ayudó a otra persona me hace feliz.\"",
    "test3.texto":        "\"La plataforma es fácil de usar y el equipo siempre está apoyando a la comunidad.\"",
    "test4.texto":        "\"AMOOO AL PROGRAMADOR!!\"",
    "test5.texto":        "\"Una experiencia impecable: interfaz elegante, procesos claros y un propósito admirable. RECO+ eleva el estándar de lo que significa reciclar con estilo.\"",

    /* ── CTA BANNER ── */
    "cta.title":    "Juntos hacemos la diferencia",
    "cta.desc":     "Cada acción cuenta y juntos podemos construir un mundo más limpio, solidario y sostenible.",
    "cta.btn":      "Únete a la comunidad →",

    /* ── FOOTER ── */
    "footer.tagline":   "El plus que el planeta necesita.",
    "footer.nav":       "Navegación",
    "footer.recursos":  "Recursos",
    "footer.ayuda":     "Centro de ayuda",
    "footer.faq":       "Preguntas frecuentes",
    "footer.terminos":  "Términos y condiciones",
    "footer.privacidad":"Política de privacidad",
    "footer.contacto":  "Contacto",
    "footer.newsletter":"Newsletter",
    "footer.nl.desc":   "Recibe tips, noticias y oportunidades para ayudar.",
    "footer.nl.ph":     "Tu correo electrónico",
    "footer.nl.btn":    "Suscribirme",
    "footer.copy":      "© 2024 RECO+. Todos los derechos reservados.",

    /* ── MAPA (página mapa.html) ── */
    "mapa.hero.title":        "Mapa",
    "mapa.hero.subtitle":     "Explora tu ciudad y encuentra <br>puntos de reciclaje y donación <br>cercanos.",
    "mapa.hero.badge":        "Aprende, actúa y genera impacto positivo.",

    "mapa.header.title":      "<br />Mapa de Reciclaje y Donación",
    "mapa.header.subtitle":   "Explora tu ciudad y encuentra puntos de reciclaje y donación cercanos.<br />Usa los filtros para buscar por tipo de material o servicio.",

    "mapa.search.placeholder":   "Buscar dirección o ubicación",
    "mapa.search.locate.title":  "Usar mi ubicación",

    "mapa.filter.label":        "Filtrar por material:",
    "mapa.filter.label.more":   "Más materiales:",
    "mapa.filter.todos":        "Todos",
    "mapa.filter.more":         "☰ Más filtros",

    "mapa.legend.recycle":   "Puntos de reciclaje",
    "mapa.legend.donation":  "Puntos de donación",
    "mapa.legend.acopio":    "Centros de acopio",
    "mapa.legend.evento":    "Eventos de reciclaje",

    /* Etiquetas de tipo usadas dinámicamente por app.js en cada
       card de resultado (.type-tag) y en el popup del marcador */
    "mapa.type.reciclaje": "Reciclaje",
    "mapa.type.donacion":  "Donación",
    "mapa.type.acopio":    "Acopio",

    /* Textos generados por app.js (lista de resultados, valoración,
       geolocalización, toasts) */
    "mapa.results.empty":       "Sin resultados para este filtro.",
    "mapa.results.locateTooltip": "Tu ubicación",
    "mapa.results.locateError": "No se pudo obtener tu ubicación.",
    "mapa.results.seeallToast": "Mostrando todos los puntos disponibles.",
    "mapa.rate.label":          "Valorar:",
    "mapa.rate.myVote":         "Tu voto:",
    "mapa.rate.thanks":         "¡Gracias!",
    "mapa.rate.ariaLabel":      "Valorar con {n} estrella{s}",
    "mapa.rate.toastNew":       "¡Gracias por tu valoración de {n} ★!",
    "mapa.rate.toastUpdate":    "Actualizaste tu valoración a {n} ★",
    "mapa.modal.submitToast":   "¡Gracias! Tu sugerencia fue enviada 🌱",

    "mapa.tooltip.title": "¿Sabías qué?",
    "mapa.tooltip.fact":  "Reciclar 1 botella de plástico ahorra suficiente energía para iluminar una bombilla por 6 horas.",

    "mapa.sidebar.near":          "Cerca de ti",
    "mapa.sidebar.showing":       "Mostrando",
    "mapa.sidebar.results":       "resultados",
    "mapa.sidebar.sort.cercanos": "Más cercanos",
    "mapa.sidebar.sort.valorados":"Mejor valorados",
    "mapa.sidebar.sort.recientes":"Recientes",
    "mapa.sidebar.seeall":        "Ver todos los resultados",

    "mapa.footer.title": "¿No encuentras un punto?",
    "mapa.footer.desc":  "Sugiérelo y ayuda a crecer nuestra comunidad.",
    "mapa.footer.btn":   "+ Sugerir un punto",

    "mapa.modal.title":          "Sugerir un punto",
    "mapa.modal.desc":           "Ayúdanos a ampliar el mapa de reciclaje y donación.",
    "mapa.modal.ph.nombre":      "Nombre del lugar",
    "mapa.modal.ph.direccion":   "Dirección",
    "mapa.modal.opt.tipo":       "Tipo de punto",
    "mapa.modal.opt.reciclaje":  "Reciclaje",
    "mapa.modal.opt.donacion":   "Donación",
    "mapa.modal.opt.acopio":     "Acopio",
    "mapa.modal.opt.evento":     "Evento",
    "mapa.modal.ph.lat":         "Latitud",
    "mapa.modal.ph.lng":         "Longitud",
    "mapa.modal.useLocation":    "Usar mi ubicación actual",
    "mapa.modal.materiales":     "Materiales que acepta:",
    "mapa.modal.ph.comentarios": "Comentarios adicionales...",
    "mapa.modal.submit":         "Enviar sugerencia",

    /* ── GUÍA (página guia.html) ── */
    "guia.hero.title":    "Aprende, explora y actúa<br>por un <span class=\"gh-accent\">planeta</span> más sostenible.",
    "guia.hero.eyebrow":    "Videos principales",
    "guia.hero.masVideos":  "Más videos",
    "guia.hero.verTodos":   "Ver todos los videos",

    "guia.video1.title": "El poder de reciclar",
    "guia.video1.desc":  "Pequeñas acciones que generan grandes cambios al planeta.",
    "guia.video2.title": "Donar es transformar",
    "guia.video2.desc":  "Tus donaciones pueden mejorar la vida de muchas personas.",
    "guia.video3.title": "Nuestro planeta, nuestro hogar",
    "guia.video3.desc":  "Acciones simples que protegen nuestro planeta cada día.",

    "guia.mini1.title": "Cómo separar correctamente",
    "guia.mini1.desc":  "01:58 · Aprende a clasificar tus residuos",
    "guia.mini2.title": "Qué pasa con tus residuos",
    "guia.mini2.desc":  "02:05 · El viaje hasta su transformación",
    "guia.mini3.title": "Reutilizar para vivir mejor",
    "guia.mini3.desc":  "01:45 · Dale una segunda vida a lo que ya no usas",
    "guia.mini4.title": "Economía circular explicada fácil",
    "guia.mini4.desc":  "02:30 · El ciclo que crea un futuro sostenible",

    "guia.guide.title":    "Guía de reciclaje y donación",
    "guia.guide.subtitle": "Selecciona una categoría para obtener instrucciones paso a paso.",

    /* ── GUÍA: panel interactivo de chips (reciclar/donar) ── */
    "guia.panel.badge.reciclar": "Cómo reciclarlo",
    "guia.panel.badge.donar":    "Cómo donarlo",
    "guia.panel.cta.reciclar":   "Encuentra un punto de reciclaje →",
    "guia.panel.cta.donar":      "Ir a Donar / Ayuda →",

    "guia.chip.plastico.label": "Plástico",
    "guia.chip.plastico.title": "Plástico",
    "guia.chip.plastico.desc":  "El plástico puede tener muchas vidas más si lo reciclas correctamente.",
    "guia.chip.plastico.step1": "Límpialo y enjuágalo",
    "guia.chip.plastico.step2": "Sécalo bien",
    "guia.chip.plastico.step3": "Retira tapas y etiquetas",
    "guia.chip.plastico.step4": "Llévalo a un punto de reciclaje",

    "guia.chip.papel.label": "Papel",
    "guia.chip.papel.title": "Papel y cartón",
    "guia.chip.papel.desc":  "El papel puede reciclarse varias veces antes de perder su fibra útil.",
    "guia.chip.papel.step1": "Retira grapas y clips",
    "guia.chip.papel.step2": "Evita que se moje",
    "guia.chip.papel.step3": "Dóblalo o aplánalo",
    "guia.chip.papel.step4": "Llévalo a un punto de reciclaje",

    "guia.chip.vidrio.label": "Vidrio",
    "guia.chip.vidrio.title": "Vidrio",
    "guia.chip.vidrio.desc":  "El vidrio es 100% reciclable y se puede reutilizar de forma indefinida.",
    "guia.chip.vidrio.step1": "Enjuágalo",
    "guia.chip.vidrio.step2": "Retira tapas metálicas",
    "guia.chip.vidrio.step3": "No lo rompas para transportarlo",
    "guia.chip.vidrio.step4": "Deposítalo en el contenedor de vidrio",

    "guia.chip.metal.label": "Metal",
    "guia.chip.metal.title": "Metal",
    "guia.chip.metal.desc":  "Latas y objetos metálicos se transforman en nuevos productos con enorme ahorro de energía.",
    "guia.chip.metal.step1": "Enjuágalo",
    "guia.chip.metal.step2": "Aplasta las latas si puedes",
    "guia.chip.metal.step3": "Sepáralo de otros materiales",
    "guia.chip.metal.step4": "Llévalo a un punto de reciclaje",

    "guia.chip.electronicos.label": "Electrónicos",
    "guia.chip.electronicos.title": "Electrónicos",
    "guia.chip.electronicos.desc":  "Requieren un manejo especial: nunca los tires con la basura común.",
    "guia.chip.electronicos.step1": "Borra tus datos personales",
    "guia.chip.electronicos.step2": "Retira baterías si es posible",
    "guia.chip.electronicos.step3": "Guárdalo en una caja",
    "guia.chip.electronicos.step4": "Llévalo a un punto especializado",

    "guia.chip.ropa.label": "Ropa y Textiles",
    "guia.chip.ropa.title": "Ropa y textiles",
    "guia.chip.ropa.desc":  "La ropa en buen estado puede donarse; la que no, también puede reciclarse como textil.",
    "guia.chip.ropa.step1": "Verifica que esté limpia",
    "guia.chip.ropa.step2": "Sepárala por tipo",
    "guia.chip.ropa.step3": "Dóblala o empácala",
    "guia.chip.ropa.step4": "Dónala o llévala a un punto textil",

    "guia.chip.libros.label": "Libros",
    "guia.chip.libros.title": "Libros",
    "guia.chip.libros.desc":  "Un libro que ya no lees puede abrirle una puerta a otra persona.",
    "guia.chip.libros.step1": "Revisa que estén completos",
    "guia.chip.libros.step2": "Agrúpalos por tema",
    "guia.chip.libros.step3": "Empácalos bien",
    "guia.chip.libros.step4": "Dónalos a una biblioteca o punto de acopio",

    "guia.chip.donar_ropa.label": "Ropa y calzado",
    "guia.chip.donar_ropa.title": "Ropa y calzado",
    "guia.chip.donar_ropa.desc":  "Dona prendas y calzado en buen estado. Alguien cerca de ti los está esperando.",

    "guia.chip.donar_libros.label": "Libros y útiles",
    "guia.chip.donar_libros.title": "Libros y útiles escolares",
    "guia.chip.donar_libros.desc":  "Libros, cuadernos y material escolar pueden abrirle puertas a otra persona.",

    "guia.chip.juguetes.label": "Juguetes",
    "guia.chip.juguetes.title": "Juguetes",
    "guia.chip.juguetes.desc":  "Un juguete que ya no usas puede alegrarle el día a un niño o niña.",

    "guia.chip.muebles.label": "Muebles",
    "guia.chip.muebles.title": "Muebles",
    "guia.chip.muebles.desc":  "Sillas, mesas o estantes en buen estado pueden encontrar un nuevo hogar.",

    "guia.chip.donar_electronicos.label": "Electrónicos",
    "guia.chip.donar_electronicos.title": "Electrónicos",
    "guia.chip.donar_electronicos.desc":  "Celulares, tablets o computadoras que aún funcionan pueden seguir siendo útiles.",

    "guia.chip.otro.label": "Otro",
    "guia.chip.otro.title": "¿No encuentras tu categoría?",
    "guia.chip.otro.desc":  "Publícala igual: seguro alguien la está buscando.",

    "guia.donarstep.1": "Publicas lo que quieres donar",
    "guia.donarstep.2": "Buscamos a quien lo necesita",
    "guia.donarstep.3": "Coordinan la entrega de forma segura",
    "guia.donarstep.4": "Tu donación genera un cambio real",

    "guia.donatepanel.title":      "¿Qué puedes donar?",
    "guia.donatepanel.subtitle":   "Tus donaciones pueden marcar una gran diferencia.",
    "guia.donatepanel.cat1":       "Ropa",
    "guia.donatepanel.cat2":       "Juguetes",
    "guia.donatepanel.cat3":       "Libros",
    "guia.donatepanel.cat4":       "Útiles",
    "guia.donatepanel.cat5":       "Hogar",
    "guia.donatepanel.cat6":       "Y más",
    "guia.donatepanel.stepslabel": "Pasos para donar",
    "guia.donatepanel.step1":      "Selecciona",
    "guia.donatepanel.step2":      "Limpia y organiza",
    "guia.donatepanel.step3":      "Entrega o agenda",
    "guia.donatepanel.step4":      "Transforma vidas",
    "guia.donatepanel.cta":        "Ir a Donar / Ayuda →",

    "guia.info.title": "¿Sabías qué?",
    "guia.info.text1": "Reciclar 1 tonelada de papel salva aproximadamente <strong>17 árboles</strong> y ahorra miles de litros de agua.",
    "guia.info.text2": "Donar ropa que ya no usas puede ayudar a proteger el medio ambiente y a quienes más lo necesitan.",
    "guia.info.text3": "Una botella de plástico puede tardar hasta <strong>450 años</strong> en descomponerse en el ambiente.",
    "guia.info.text4": "Reciclar una lata de aluminio ahorra suficiente energía para tener un televisor encendido durante <strong>3 horas</strong>.",
    "guia.info.text5": "El vidrio es 100% reciclable y se puede reutilizar <strong>de forma infinita</strong> sin perder calidad.",
    "guia.info.text6": "Cada tonelada de plástico reciclado ahorra cerca de <strong>5,774 kWh</strong> de energía.",

    "guia.impact.title":    "Impacto de tu acción",
    "guia.impact.subtitle": "Cada acción cuenta y genera un impacto real.",

    "guia.tips.title": "Consejos rápidos",
    "guia.tips.li1":   "Reduce lo que consumes.",
    "guia.tips.li2":   "Reutiliza siempre que puedas.",
    "guia.tips.li3":   "Recicla correctamente.",
    "guia.tips.li4":   "Dona lo que ya no uses.",
    "guia.tips.li5":   "Inspira a más personas a actuar.",
    "guia.tips.li6":   "Separa tus residuos desde casa.",
    "guia.tips.li7":   "Lleva tu propia bolsa reutilizable.",
    "guia.tips.li8":   "Evita los plásticos de un solo uso.",
    "guia.tips.li9":   "Comparte lo que aprendes con tu familia.",
    "guia.tips.li10":  "Elige productos con menos empaque.",

    "guia.cta.title":    "Juntos construimos un futuro mejor",
    "guia.cta.subtitle": "Infórmate, aprende y actúa hoy. El cambio empieza contigo.",
    "guia.cta.btn":      "Únete a la comunidad",

    /* ── BIBLIOTECA DE VIDEOS (página videos.html) ── */
    "videos.hero.back":     "Volver a Guía",
    "videos.hero.title":    "Biblioteca de videos",
    "videos.hero.subtitle": "Todo lo que necesitas saber sobre reciclar, donar y vivir de forma más sostenible, explicado en video.",

    "videos.cat.todos":          "Todos",
    "videos.cat.reciclaje":      "Reciclaje",
    "videos.cat.donacion":       "Donación",
    "videos.cat.sostenibilidad": "Sostenibilidad",
    "videos.cat.comunidad":      "Comunidad",

    "videos.results.count": "Mostrando {n} videos",

    "videos.empty.title": "No hay videos en esta categoría",
    "videos.empty.desc":  "Prueba con otra categoría o vuelve a \"Todos\" para ver la biblioteca completa.",

    "videos.search.placeholder":  "Buscar videos…",
    "videos.search.limpiar":      "Limpiar búsqueda",
    "videos.search.empty.title":  "No encontramos videos para “{q}”",
    "videos.search.empty.desc":   "Prueba con otra palabra o borra la búsqueda para ver toda la categoría.",

    "videos.v4.desc":  "Aprende a clasificar cada material antes de llevarlo a un punto de reciclaje.",
    "videos.v5.desc":  "Sigue el viaje de tus residuos desde el contenedor hasta su transformación.",
    "videos.v6.desc":  "Dale una segunda vida a los objetos que ya no usas.",
    "videos.v7.desc":  "Entiende el ciclo que convierte residuos en nuevos recursos.",

    "videos.v8.title": "Cómo donar de forma segura",
    "videos.v8.desc":  "Consejos prácticos para coordinar una donación sin contratiempos.",
    "videos.v9.title": "El impacto de tu donación",
    "videos.v9.desc":  "Conoce a dónde llega lo que compartes y cómo cambia vidas.",
    "videos.v10.title": "Historias que transforman vidas",
    "videos.v10.desc":  "Testimonios reales de personas que reciclan y donan con RECO+.",
    "videos.v11.title": "Comunidades que reciclan juntas",
    "videos.v11.desc":  "Cómo un barrio organizado puede multiplicar su impacto ambiental.",
    "videos.v12.title": "Reduce, reutiliza, recicla",
    "videos.v12.desc":  "Los tres pilares que sostienen un estilo de vida sostenible.",

    "videos.badge.comunidad": "Comunidad",

    /* ── REPRODUCTOR DE VIDEO (video-player-modal.js) ── */
    "videos.player.cerrar": "Cerrar",
    "videos.player.cargando": "Cargando video…",
    "videos.player.error": "No se pudo cargar el video.",
    "videos.player.abrirExterno": "Abrirlo en una pestaña nueva",
    "videos.player.externo": "Este video se reproduce en el sitio original.",
    "videos.player.verOriginal": "Ver en el sitio original",
    "videos.player.titulo": "Reproduciendo video",

    /* ── SUBIR VIDEO (subir-video-modal.js) ── */
    "subirvideo.boton":        "Subir video",
    "subirvideo.titulo":       "Comparte un video",
    "subirvideo.necesitaSesion": "Inicia sesión para poder compartir un video con la comunidad de RECO+.",
    "subirvideo.tituloLabel":  "Título del video",
    "subirvideo.tituloPlaceholder": "Ej. Cómo reciclé mi barrio en un día",
    "subirvideo.descLabel":    "Descripción (opcional)",
    "subirvideo.descPlaceholder": "Cuéntanos brevemente de qué trata...",
    "subirvideo.categoriaLabel": "Categoría",
    "subirvideo.tabLink":      "Por link",
    "subirvideo.tabArchivo":   "Subir archivo",
    "subirvideo.linkLabel":    "Enlace del video",
    "subirvideo.linkPlaceholder": "https://youtube.com/watch?v=...",
    "subirvideo.linkHint":     "Puede ser un link de YouTube, Vimeo o una URL directa a un archivo de video.",
    "subirvideo.dropTitulo":   "Arrastra tu video aquí",
    "subirvideo.dropSub":      "o haz clic para elegir un archivo · MP4, WebM, MOV · máx. 100MB",
    "subirvideo.subiendo":     "Subiendo video…",
    "subirvideo.publicar":     "Enviar video",
    "subirvideo.publicando":   "Publicando…",
    "subirvideo.revisionHint": "Tu video se revisará antes de publicarse en la biblioteca. Te avisaremos si necesitas corregir algo.",
    "subirvideo.videoComunidad": "Video compartido por la comunidad",
    "subirvideo.statusFaltaTitulo": "Escribe un título para tu video.",
    "subirvideo.statusFaltaLink": "Pega el enlace de tu video.",
    "subirvideo.statusLinkInvalido": "Ese enlace no parece válido. Debe empezar con http:// o https://",
    "subirvideo.statusFaltaArchivo": "Elige un archivo de video para subir.",
    "subirvideo.statusTipoInvalido": "Formato no soportado. Usa MP4, WebM, MOV u OGG.",
    "subirvideo.statusMuyGrande": "El archivo supera el límite de 100MB.",
    "subirvideo.statusServicioNoDisponible": "Servicio no disponible en este momento.",
    "subirvideo.statusErrorSubida": "No se pudo subir el archivo. Intenta de nuevo.",
    "subirvideo.statusError":  "No se pudo publicar tu video. Intenta de nuevo.",
    "subirvideo.statusOk":     "¡Gracias! Tu video quedó en revisión y pronto estará en la biblioteca.",
    "subirvideo.statusErrorConexion": "No se pudo conectar. Revisa tu internet.",
    "subirvideo.statusLinkDuplicado": "Este video ya fue compartido antes. No puedes publicarlo de nuevo.",
    "subirvideo.statusArchivoDuplicado": "Este archivo ya fue subido antes. No puedes publicarlo de nuevo.",
    "subirvideo.statusVerificandoLink": "Comprobando si este video ya existe…",
    "subirvideo.statusVerificandoArchivo": "Comprobando si este archivo ya existe…",
    "subirvideo.verificando": "Verificando tu cuenta…",
    "subirvideo.errorVerificacion": "No se pudo verificar tu cuenta. Revisa tu conexión e intenta de nuevo.",

    /* ── DONAR (página donar.html) ── */
    "donar.hero.title":       "Donar /<br>Solicitar ayuda",
    "donar.hero.subtitle":    "Comparte lo que ya no necesitas o pide apoyo a<br>quienes pueden ayudarte. Juntos construimos<br>una comunidad más sólida y sostenible.",
    "donar.hero.badge":       "Pequeñas acciones, gran impacto.",
    "donar.hero.card.title":  "Comunidad que se apoya",
    "donar.hero.card.desc":   "Conecta, comparte y beneficia a miles de personas tu comunidad.",
    "donar.hero.cta1":        "Donar un objeto",
    "donar.hero.cta2":        "Solicitar una donación",

    "donar.tab.donar":        "Quiero donar",
    "donar.tab.solicitar":    "Solicito ayuda",

    "donar.form1.title":      "Quiero donar",
    "donar.form1.desc":       "Ofrece objetos que ya no usas y ponlos a disposición de quien más los necesita.",
    "donar.form2.title":      "Solicito ayuda",
    "donar.form2.desc":       "Publica lo que necesitas y conecta con personas de tu comunidad dispuestas a ayudarte.",

    "donar.form.label.categoria1":     "¿Qué vas a donar?",
    "donar.form.label.categoria2":     "¿Qué necesitas?",
    "donar.form.label.disponibilidad": "¿Disponibilidad?",
    "donar.form.label.descripcion":    "Descripción",
    "donar.form.label.ubicacion":      "Ubicación",
    "donar.form.label.punto":          "Punto funcional",
    "donar.form1.label.foto":          "Foto del artículo",
    "donar.form2.label.foto":          "Foto de referencia",
    "donar.form.opcional":             "(opcional)",

    "donar.form.opt.categoria":      "Selecciona una categoría",
    "donar.form.opt.ropa":           "Ropa y calzado",
    "donar.form.opt.electronicos":   "Electrónicos",
    "donar.form.opt.muebles":        "Muebles",
    "donar.form.opt.libros":         "Libros y útiles",
    "donar.form.opt.juguetes":       "Juguetes",
    "donar.form.opt.alimentos":      "Alimentos no perecederos",
    "donar.form.opt.alimentos2":     "Alimentos",
    "donar.form.opt.materialescolar": "Material escolar",
    "donar.form.opt.higiene":        "Productos de higiene",
    "donar.form.opt.medicinas":      "Medicinas no vencidas",
    "donar.form.opt.otro":           "Otro",

    "donar.form.opt.disponibilidad": "Selecciona disponibilidad",
    "donar.form.opt.inmediata":      "Inmediata",
    "donar.form.opt.cuanto-antes":   "Lo antes posible",
    "donar.form.opt.semana":         "Esta semana",
    "donar.form.opt.mes":            "Este mes",

    "donar.form.ph.ubicacion":  "Tu ciudad o barrio",

    "donar.form.opt.punto1":    "Selecciona punto",
    "donar.form.opt.domicilio": "Entrega en mi domicilio",
    "donar.form.opt.acopio":    "Punto de acopio cercano",
    "donar.form.opt.centro":    "Centro comunitario",

    "donar.form.opt.punto2":    "Selecciona punto de recepción",
    "donar.form.opt.visita":    "Me pueden visitar",
    "donar.form.opt.recojo":    "Recojo en punto de acopio",
    "donar.form.opt.acuerdo":   "Acuerdo con donante",

    "donar.form1.ph.desc": "Describe el artículo: estado, cantidad, detalles importantes...",
    "donar.form2.ph.desc": "Describe qué necesitas, para qué y cualquier detalle relevante...",

    "donar.form.upload.text":  "Arrastra una imagen aquí<br>o <strong>haz clic para subir</strong>",
    "donar.form.terminos":     "Al publicar, aceptas los <a href=\"#\">Términos de uso</a> de RECO+.",
    "donar.form1.submit":      "✔ Publicar donación",
    "donar.form2.submit":      "✔ Publicar solicitud",

    "donar.trust1.title": "Comunidad segura y confiable",
    "donar.trust1.desc":  "Verificamos perfiles y publicaciones.",
    "donar.trust2.title": "Políticas claras",
    "donar.trust2.desc":  "Sabemos qué puedes donar y qué no.",
    "donar.trust3.title": "Comunidad activa",
    "donar.trust3.desc":  "Miles de personas listas para ayudar.",
    "donar.trust4.title": "Impacto y sostenibilidad",
    "donar.trust4.desc":  "Cada acción genera un cambio real.",

    /* ── DONAR: secciones home (elección, pasos, stats, listados, tracker, cta) ── */
    "donar.choice.title":       "🌿 ¿Qué quieres hacer hoy? 🌿",
    "donar.choice.subtitle":    "Elige cómo quieres ayudar o recibir ayuda.",
    "donar.choice.card1.title": "Tengo algo para donar",
    "donar.choice.card1.desc":  "Publica objetos, ropa, libros, electrónicos o lo que ya no usas y conéctate con alguien que lo necesita.",
    "donar.choice.card1.btn":   "Publicar donación →",
    "donar.choice.card2.title": "Necesito algo",
    "donar.choice.card2.desc":  "Solicita los objetos que necesitas para ti o para tu comunidad. Alguien puede tener justo lo que buscas.",
    "donar.choice.card2.btn":   "Publicar solicitud →",

    "donar.steps.title":    "🌿 Conecta una necesidad 🌿",
    "donar.steps.subtitle": "En RECO+ conectamos lo que ya no usas con quien más lo necesita.",
    "donar.steps.s1.title": "1. Publicas",
    "donar.steps.s1.desc":  "Publicas lo que quieres donar.",
    "donar.steps.s2.title": "2. Conectamos",
    "donar.steps.s2.desc":  "Buscamos a la persona que puede necesitarlo.",
    "donar.steps.s3.title": "3. Entregas",
    "donar.steps.s3.desc":  "Coordinan la entrega de forma segura.",
    "donar.steps.s4.title": "4. Impacto",
    "donar.steps.s4.desc":  "Tu donación genera un cambio real.",

    "donar.stats.title":         "Juntos estamos generando un impacto real",
    "donar.stats.objetos":       "Objetos donados",
    "donar.stats.personas":      "Personas ayudadas",
    "donar.stats.comunidades":   "Comunidades conectadas",
    "donar.stats.reutilizados":  "Objetos reutilizados",

    "donar.listings.donaciones.title":   "🌿 Donaciones disponibles",
    "donar.listings.solicitudes.title":  "🌿 Solicitudes de donación",
    "donar.listings.verTodas":           "Ver todas →",

    "donar.campanas.title":              "🌿 Campañas de nuestros aliados 🌿",
    "donar.campanas.subtitle":           "Empresas y centros aliados de RECO+ comparten aquí sus próximas campañas de reciclaje y donación.",
    "donar.campanas.reciclaje.title":    "♻️ Campañas de reciclaje",
    "donar.campanas.donacion.title":     "🎁 Campañas de donación",
    "donar.campanas.verMas":             "Ver más →",
    "donar.campanas.metaCard":           "🎯 Meta:",
    "donar.campanas.errorCargar":        "No se pudieron cargar las campañas por ahora.",
    "donar.campanas.vacio.reciclaje":    "Todavía no hay campañas de reciclaje activas. ¡Sé la primera empresa en publicar una desde Alianzas!",
    "donar.campanas.vacio.donacion":     "Todavía no hay campañas de donación activas. ¡Sé la primera empresa en publicar una desde Alianzas!",

    "donar.campdetalle.kicker.reciclaje": "♻️ Campaña de reciclaje",
    "donar.campdetalle.kicker.donacion":  "🎁 Campaña de donación",
    "donar.campdetalle.meta":             "Meta:",

    "donar.campins.cargando":              "Cargando…",
    "donar.campins.invitado.desc":         "Inicia sesión para inscribirte en esta campaña.",
    "donar.campins.invitado.btn":          "Iniciar sesión →",
    "donar.campins.form.titulo":           "Inscríbete en esta campaña",
    "donar.campins.form.nombreLabel":      "Nombre completo",
    "donar.campins.form.telefonoLabel":    "Teléfono",
    "donar.campins.form.telefonoOpcional": "(opcional)",
    "donar.campins.form.telefonoPh":       "Ej. 6123-4567",
    "donar.campins.form.mensajeLabel":     "Comentario",
    "donar.campins.form.mensajeOpcional":  "(opcional)",
    "donar.campins.form.mensajePh":        "Ej. cuánto material aproximado llevarás, o qué te gustaría donar/aportar",
    "donar.campins.form.submitBtn":        "Inscribirme →",
    "donar.campins.form.enviando":         "Inscribiendo...",
    "donar.campins.form.errorNombre":      "Ingresa tu nombre para inscribirte.",
    "donar.campins.form.errorGenerico":    "No se pudo completar tu inscripción. Intenta de nuevo.",
    "donar.campins.yaInscrito.msg":           "✅ Ya estás inscrito en esta campaña.",
    "donar.campins.yaInscrito.cancelarBtn":   "Cancelar inscripción",
    "donar.campins.yaInscrito.cancelando":    "Cancelando...",
    "donar.campins.yaInscrito.errorCancelar": "No se pudo cancelar tu inscripción. Intenta de nuevo.",
    "donar.campins.confirmCancelar":       "¿Seguro que quieres cancelar tu inscripción a esta campaña?",

    "donar.tracker.title":    "Sigue el camino de tu donación",
    "donar.tracker.subtitle": "Así puedes ver el impacto de tu ayuda.",
    "donar.tracker.s1.title": "Publicada",
    "donar.tracker.s1.desc":  "Tu donación fue publicada con éxito.",
    "donar.tracker.s2.title": "En búsqueda",
    "donar.tracker.s2.desc":  "Buscamos a la persona que puede necesitarlo.",
    "donar.tracker.s3.title": "Encontró receptor",
    "donar.tracker.s3.desc":  "Alguien aceptó tu donación.",
    "donar.tracker.s4.title": "Entregada",
    "donar.tracker.s4.desc":  "La donación fue entregada.",
    "donar.tracker.s5.title": "Impacto generado",
    "donar.tracker.s5.desc":  "Tu ayuda ya está haciendo la diferencia.",

    "donar.ctaBanner.title": "¿Tienes dudas o quieres ayudar de otra forma?",
    "donar.ctaBanner.desc":  "Hablemos y juntos encontramos la mejor manera de colaborar.",
    "donar.ctaBanner.btn":   "Contáctanos →",

    "donar.form.label.empresa": "Empresa a la que se enviará",
    "donar.form.opt.empresa":   "Selecciona una empresa (opcional)",

    "donar.sample.buenEstado":            "Buen estado",
    "donar.sample.necesitaReparacion":    "Necesita reparación",
    "donar.sample.mochila":               "Mochila escolar",
    "donar.sample.laptop":                "Computadora portátil",
    "donar.sample.ropaVariada":           "Ropa variada",
    "donar.sample.utilesEscolares":       "Útiles escolares",
    "donar.sample.seNecesitaComputadora": "Se necesita computadora",
    "donar.sample.ropaNinos":             "Ropa para niños",
    "donar.sample.librosEscolares":       "Libros escolares",
    "donar.sample.educacion":             "Educación",

    "donar.card.verDonacion": "Ver donación →",
    "donar.card.ayudar":      "Ayudar →",

    "donar.mispubs.title":    "Tus publicaciones activas",
    "donar.mispubs.header":   "Tus publicaciones activas",
    "donar.mispubs.cargando": "Cargando...",
    "donar.mispubs.vacio":    "No tienes publicaciones activas.",

    "donar.modal.cerrar": "Cerrar",

    "donar.modalExito.title":       "¡Publicación enviada!",
    "donar.modalExito.desc":        "Tu donación ha sido publicada exitosamente. La comunidad RECO+ ya puede verla.",
    "donar.modalExito.donar.title": "¡Donación publicada!",
    "donar.modalExito.donar.desc":  "Tu donación ha sido publicada exitosamente. La comunidad RECO+ ya puede verla y contactarte.",
    "donar.modalExito.solicitar.title": "¡Solicitud publicada!",
    "donar.modalExito.solicitar.desc":  "Tu solicitud ha sido enviada. Pronto alguien de la comunidad RECO+ podrá ayudarte.",
    "donar.modalError.title": "No se pudo publicar",
    "donar.modalError.desc.donar":     "Ocurrió un error al guardar tu donación. Intenta de nuevo en unos segundos.",
    "donar.modalError.desc.solicitar": "Ocurrió un error al guardar tu solicitud. Intenta de nuevo en unos segundos.",
    "donar.modalLogin.title": "Inicia sesión para continuar",
    "donar.modalLogin.desc":  "Necesitas tener una cuenta para publicar una donación o solicitud en RECO+.",
    "donar.btn.publicando":   "Publicando...",

    "donar.listings.empty.donaciones":  "Aún no hay donaciones publicadas. ¡Sé el primero!",
    "donar.listings.empty.solicitudes": "Aún no hay solicitudes publicadas.",
    "donar.listings.ubicacionSinEspecificar": "Ubicación no especificada",
    "donar.listings.publicadoPor": "Publicado por",
    "donar.listings.puntoEntrega": "Punto de entrega",
    "donar.listings.puntoRecepcion": "Punto de recepción",
    "donar.listings.empresa": "Empresa",
    "donar.listings.sinDescripcion": "Sin descripción adicional.",
    "donar.listings.kicker.donacion": "🌿 Donación disponible",
    "donar.listings.kicker.solicitud": "🙋 Solicitud de ayuda",
    "donar.listings.usuarioGenerico": "Usuario RECO+",

    "donar.time.justoAhora":  "justo ahora",
    "donar.time.haceMin":     "hace {n} min",
    "donar.time.haceHoras":   "hace {n}h",
    "donar.time.haceDias":    "hace {n}d",

    /* ── DONACIONES (página donaciones.html, "Ver todas") ── */
    "donaciones.hero.title":    "Todas las publicaciones",
    "donaciones.hero.subtitle": "Explora todas las donaciones disponibles y las solicitudes de ayuda activas en la comunidad RECO+, con todos sus detalles.",
    "donaciones.filter.todas":       "Todas",
    "donaciones.filter.donaciones":  "🌿 Donaciones",
    "donaciones.filter.solicitudes": "🙋 Solicitudes de ayuda",
    "donaciones.search.placeholder": "Buscar por categoría, descripción o ubicación...",
    "donaciones.count.suffix": "publicaciones activas",
    "donaciones.cargando":     "Cargando publicaciones...",
    "donaciones.error.conexion": "No se pudo conectar con la base de datos. Intenta recargar la página.",
    "donaciones.error.carga":    "Ocurrió un error al cargar las publicaciones. Intenta de nuevo más tarde.",
    "donaciones.sinResultados":  "No se encontraron publicaciones con esos filtros.",
    "donaciones.tipo.donacion":  "🌿 Donación",
    "donaciones.tipo.solicitud": "🙋 Solicitud",

    /* ── ALIANZAS (página alianzas.html) ── */
    "alianzas.hero.title":    "Alianzas /<br>Empresas",
    "alianzas.hero.subtitle": "Espacio dedicado a empresas, fundaciones o centros que colaboran con la plataforma o desean registrarse.",
    "alianzas.hero.badge":    "Juntos generamos más impacto.",

    "alianzas.intro.title":   "Colabora y multiplica el impacto positivo",

    "alianzas.feat1.title": "Colabora con propósito",
    "alianzas.feat1.desc":  "Únete a una red de aliados que impulsan el cambio ambiental y social desde tu organización.",
    "alianzas.feat1.link":  "Conoce más →",
    "alianzas.feat2.title": "Registra tu empresa o fundación",
    "alianzas.feat2.desc":  "Forma parte de RECO+ y muestra tu compromiso con la sostenibilidad ante miles de personas.",
    "alianzas.feat2.link":  "Registrarse →",
    "alianzas.feat3.title": "Visibilidad y comunidad",
    "alianzas.feat3.desc":  "Conecta con miles de personas, comparte tus acciones y fortalece tu impacto en la comunidad.",
    "alianzas.feat3.link":  "Beneficios →",
    "alianzas.feat4.title": "Proyectos y campañas",
    "alianzas.feat4.desc":  "Participa en iniciativas conjuntas y campañas que transforman comunidades y generan impacto real.",
    "alianzas.feat4.link":  "Explorar iniciativas →",

    "alianzas.aliados.title": "Aliados destacados",
    "alianzas.aliados.vacio.titulo": "Todavía no hay aliados con plan Premium",
    "alianzas.aliados.vacio.desc": "Las empresas con plan Premium aparecen aquí, destacadas ante toda la comunidad de RECO+.",
    "alianzas.aliados.vacio.btn": "Conocer el plan Premium →",
    "alianzas.aliados.destacado": "Aliado destacado 🌳",
    "alianzas.tipo.centro_reciclaje": "Centro de reciclaje",
    "alianzas.tipo.empresa_recicladora": "Empresa recicladora",
    "alianzas.tipo.punto_acopio": "Punto de acopio",
    "alianzas.tipo.transportista": "Transportista de residuos",
    "alianzas.tipo.otro": "Aliado RECO+",
    "alianzas.tagline1": "Fundación Ambiental",
    "alianzas.tagline2": "Compromiso real",
    "alianzas.tagline3": "Acciones que cuentan",
    "alianzas.tagline4": "Transformamos juntos",
    "alianzas.tagline5": "Cuidamos el futuro",
    "alianzas.tagline6": "Por un planeta limpio",

    "alianzas.cta.title": "¿Tu empresa quiere marcar la diferencia?",
    "alianzas.cta.desc":  "Regístrate y únete a nuestra comunidad de aliados que construyen un futuro más sostenible.",
    "alianzas.cta.btn":   "Quiero ser aliado →",
    "alianzas.carousel.prev": "Anterior",
    "alianzas.carousel.next": "Siguiente",

    /* ══════════════════════════════════════════
       REGISTRO DE ALIADO (alianzas-registro-modal.js)
       Formulario de 9 pasos para registrar una empresa/aliado.
       ══════════════════════════════════════════ */
    "rae.kicker": "Registro de aliado · Paso {n} de {total}",
    "rae.kicker.simple": "Registro de aliado",
    "rae.btn.atras": "← Atrás",
    "rae.btn.siguiente": "Siguiente →",
    "rae.btn.registrar": "Registrar aliado ✓",
    "rae.btn.enviando": "Enviando...",
    "rae.status.revisaCampos": "Revisa los campos marcados antes de continuar.",
    "rae.confirmCerrar": "¿Seguro que quieres cerrar? Se perderá la información ingresada en este formulario.",

    "rae.step.empresa.titulo": "Información de la empresa",
    "rae.step.contacto.titulo": "Información de contacto",
    "rae.step.ubicacion.titulo": "Ubicación",
    "rae.step.materiales.titulo": "Materiales que reciben",
    "rae.step.servicios.titulo": "Servicios que ofrecen",
    "rae.step.horarios.titulo": "Horarios",
    "rae.step.operativa.titulo": "Información operativa",
    "rae.step.cuenta.titulo": "Cuenta de acceso",
    "rae.step.opcional.titulo": "Información opcional",

    /* ── Paso 1: Empresa ── */
    "rae.tipo.centroReciclaje": "Centro de reciclaje",
    "rae.tipo.empresaRecicladora": "Empresa recicladora",
    "rae.tipo.puntoAcopio": "Punto de acopio",
    "rae.tipo.transportista": "Transportista de residuos",
    "rae.tipo.otro": "Otro",

    "rae.empresa.desc": "Cuéntanos sobre tu empresa o centro de reciclaje para darlo de alta como aliado en RECO+.",
    "rae.empresa.nombreLabel": "Nombre de la empresa o centro de reciclaje",
    "rae.empresa.nombrePh": "Ej. EcoRecicla Panamá",
    "rae.empresa.nombreError": "Ingresa el nombre de la empresa.",
    "rae.empresa.comercialLabel": "Nombre comercial",
    "rae.empresa.comercialOpcional": "(si es diferente)",
    "rae.empresa.comercialPh": "Ej. EcoR",
    "rae.empresa.rucLabel": "Número de registro o RUC",
    "rae.empresa.rucPh": "Ej. 8-888-8888",
    "rae.empresa.rucError": "Ingresa el número de registro o RUC.",
    "rae.empresa.anioLabel": "Año de fundación",
    "rae.empresa.anioOpcional": "(opcional)",
    "rae.empresa.anioPh": "Ej. 2018",
    "rae.empresa.anioError": "Ingresa un año válido (1900–{anio}).",
    "rae.empresa.tipoLabel": "Tipo de empresa",
    "rae.empresa.tipoDefault": "Selecciona un tipo",
    "rae.empresa.tipoError": "Selecciona el tipo de empresa.",
    "rae.empresa.descLabel": "Descripción de la empresa",
    "rae.empresa.descPh": "Cuéntanos a qué se dedica tu empresa, qué la hace diferente y cómo colabora con la comunidad...",
    "rae.empresa.descHint": "{n} / 600 (mínimo 20 caracteres)",
    "rae.empresa.descError": "Escribe una descripción de al menos 20 caracteres.",
    "rae.empresa.logoLabel": "Logo de la empresa",
    "rae.empresa.logoOpcional": "(opcional)",
    "rae.empresa.logoCambiar": "Cambiar logo",
    "rae.empresa.logoSubir": "Subir logo",
    "rae.empresa.logoQuitar": "Quitar",
    "rae.empresa.logoHint": "PNG, JPG o WEBP, hasta 3 MB.",
    "rae.empresa.logoFormatoInvalido": "Formato no válido. Usa PNG, JPG o WEBP.",
    "rae.empresa.logoMuyPesado": "El archivo pesa más de 3 MB. Elige uno más liviano.",

    /* ── Paso 2: Contacto ── */
    "rae.contacto.desc": "¿Cómo puede contactar la comunidad de RECO+ a tu empresa?",
    "rae.contacto.emailLabel": "Correo electrónico",
    "rae.contacto.emailPh": "contacto@tuempresa.com",
    "rae.contacto.emailError": "Ingresa un correo electrónico válido.",
    "rae.contacto.telLabel": "Número de teléfono",
    "rae.contacto.telPh": "+507 6000-0000",
    "rae.contacto.telError": "Ingresa un número de teléfono válido.",
    "rae.contacto.waLabel": "WhatsApp",
    "rae.contacto.waOpcional": "(opcional)",
    "rae.contacto.waPh": "+507 6000-0000",
    "rae.contacto.waError": "Ingresa un número de WhatsApp válido.",
    "rae.contacto.waIgual": "Usar el mismo número que el teléfono",
    "rae.contacto.webLabel": "Sitio web",
    "rae.contacto.webOpcional": "(opcional)",
    "rae.contacto.webPh": "www.tuempresa.com",
    "rae.contacto.webError": "Ingresa un sitio web válido.",

    /* ── Paso 3: Ubicación ── */
    "rae.ubicacion.desc": "¿Dónde se encuentra tu empresa o punto de operación? Esta información se usa para mostrarte en el mapa de RECO+.",
    "rae.ubicacion.provinciaLabel": "Provincia o comarca",
    "rae.ubicacion.provinciaDefault": "Selecciona una provincia",
    "rae.ubicacion.provinciaError": "Selecciona una provincia o comarca.",
    "rae.ubicacion.distritoLabel": "Distrito o ciudad",
    "rae.ubicacion.distritoPh": "Ej. David",
    "rae.ubicacion.distritoError": "Ingresa el distrito o ciudad.",
    "rae.ubicacion.direccionLabel": "Dirección completa",
    "rae.ubicacion.direccionPh": "Calle, número, barrio, referencias cercanas...",
    "rae.ubicacion.direccionError": "Ingresa una dirección completa (mínimo 10 caracteres).",
    "rae.ubicacion.gpsLabel": "Coordenadas GPS",
    "rae.ubicacion.latPh": "Latitud (ej. 8.4331)",
    "rae.ubicacion.lngPh": "Longitud (ej. -82.4308)",
    "rae.ubicacion.gpsError": "Ingresa coordenadas GPS válidas.",
    "rae.ubicacion.usarMiUbicacion": "Usar mi ubicación actual",
    "rae.ubicacion.hintManual": "También puedes escribirlas manualmente si ya las conoces.",
    "rae.ubicacion.sinGeolocalizacion": "Tu navegador no permite obtener la ubicación automáticamente. Escríbela manualmente.",
    "rae.ubicacion.obteniendo": "Obteniendo tu ubicación actual...",
    "rae.ubicacion.obtenidaOk": "Ubicación obtenida correctamente.",
    "rae.ubicacion.obtenidaError": "No se pudo obtener tu ubicación. Escríbela manualmente o revisa los permisos del navegador.",

    /* ── Paso 4: Materiales ── */
    "rae.materiales.desc": "Selecciona todos los materiales que tu empresa o centro recibe. Puedes elegir varios — esto es lo que verán los usuarios al filtrar el mapa.",
    "rae.materiales.error": "Selecciona al menos un material.",
    "rae.chip.seleccionado": "seleccionado",
    "rae.chip.seleccionados": "seleccionados",
    "rae.chip.todos": "Seleccionar todos",
    "rae.chip.ninguno": "Ninguno",

    "rae.mat.plastico": "Plástico",
    "rae.mat.vidrio": "Vidrio",
    "rae.mat.metal": "Metal",
    "rae.mat.papel": "Papel",
    "rae.mat.carton": "Cartón",
    "rae.mat.libros": "Libros",
    "rae.mat.electronicos": "Electrónicos",
    "rae.mat.celulares": "Celulares",
    "rae.mat.baterias": "Baterías",
    "rae.mat.bombillos": "Bombillos",
    "rae.mat.ropa": "Ropa",
    "rae.mat.tela": "Tela",
    "rae.mat.cuero": "Cuero",
    "rae.mat.muebles": "Muebles",
    "rae.mat.juguetes": "Juguetes",
    "rae.mat.utilesescolares": "Útiles escolares",
    "rae.mat.tetrapak": "Tetra Pak",
    "rae.mat.aceite": "Aceite de cocina",

    /* ── Paso 5: Servicios ── */
    "rae.servicios.desc": "¿Qué servicios ofrece tu empresa a la comunidad de RECO+? Selecciona todos los que apliquen.",
    "rae.servicios.error": "Selecciona al menos un servicio.",

    "rae.serv.compraMateriales": "Compra de materiales reciclables",
    "rae.serv.recoleccionDomicilio": "Recolección a domicilio",
    "rae.serv.recoleccionEmpresarial": "Recolección empresarial",
    "rae.serv.transporteResiduos": "Transporte de residuos",
    "rae.serv.destruccionCertificada": "Destrucción certificada",
    "rae.serv.gestionElectronicos": "Gestión de residuos electrónicos",
    "rae.serv.asesoriaAmbiental": "Asesoría ambiental",
    "rae.serv.educacionAmbiental": "Educación ambiental",
    "rae.serv.ventaMateriales": "Venta de materiales reciclados",

    /* ── Paso 6: Horarios ── */
    "rae.horarios.desc": "¿Qué días y en qué horario atiende tu empresa o centro?",
    "rae.horarios.diasLabel": "Días de atención",
    "rae.horarios.todosLosDias": "Todos los días",
    "rae.horarios.lunVie": "Lun–Vie",
    "rae.horarios.diasError": "Selecciona al menos un día de atención.",
    "rae.horarios.aperturaLabel": "Hora de apertura",
    "rae.horarios.aperturaError": "Ingresa la hora de apertura.",
    "rae.horarios.cierreLabel": "Hora de cierre",
    "rae.horarios.cierreError": "Debe ser posterior a la hora de apertura.",
    "rae.dia.lun": "Lun",
    "rae.dia.mar": "Mar",
    "rae.dia.mie": "Mié",
    "rae.dia.jue": "Jue",
    "rae.dia.vie": "Vie",
    "rae.dia.sab": "Sáb",
    "rae.dia.dom": "Dom",

    /* ── Paso 7: Operativa ── */
    "rae.operativa.desc": "Cuéntanos cómo trabaja tu empresa día a día: a quién atiende, cuánto material maneja y cómo paga por él.",
    "rae.operativa.aceptaParticularesLabel": "¿Aceptan particulares?",
    "rae.operativa.aceptaParticularesError": "Indica si aceptan particulares.",
    "rae.operativa.aceptaEmpresasLabel": "¿Aceptan empresas?",
    "rae.operativa.aceptaEmpresasError": "Indica si aceptan empresas.",
    "rae.operativa.cantMinLabel": "Cantidad mínima de material (kg)",
    "rae.operativa.cantMinPh": "Ej. 5",
    "rae.operativa.cantMinError": "Ingresa una cantidad mínima válida.",
    "rae.operativa.cantMaxLabel": "Cantidad máxima (kg)",
    "rae.operativa.cantMaxPh": "Sin límite",
    "rae.operativa.cantMaxError": "Debe ser mayor que la cantidad mínima.",
    "rae.operativa.pagaLabel": "¿Ofrecen pago por materiales?",
    "rae.operativa.pagaError": "Indica si ofrecen pago por materiales.",
    "rae.operativa.metodoLabel": "Método de pago",
    "rae.operativa.metodoError": "Selecciona al menos un método de pago.",
    "rae.toggle.si": "Sí",
    "rae.toggle.no": "No",

    "rae.pago.efectivo": "Efectivo",
    "rae.pago.transferencia": "Transferencia bancaria",
    "rae.pago.yappy": "Yappy",
    "rae.pago.cheque": "Cheque",
    "rae.pago.otro": "Otro",

    /* ── Paso 8: Cuenta ── */
    "rae.cuenta.desc": "Tu empresa quedará registrada con la cuenta de RECO+ que ya tienes iniciada.",
    "rae.cuenta.usuarioLabel": "Nombre de usuario",
    "rae.cuenta.usuarioPh": "Ej. ecorecicla_pa",
    "rae.cuenta.usuarioHint": "Sin espacios; letras, números, guión o guión bajo.",
    "rae.cuenta.usuarioError": "Elige un nombre de usuario válido (mínimo 3 caracteres).",
    "rae.cuenta.emailLabel": "Correo de tu cuenta RECO+",
    "rae.cuenta.emailHint": "Este es el correo de la cuenta con la que iniciaste sesión. Tu empresa quedará ligada a esta cuenta.",
    "rae.cuenta.terminos": "Acepto los <a href=\"#\" target=\"_blank\" rel=\"noopener\">términos y condiciones</a> de RECO+.",
    "rae.cuenta.terminosError": "Debes aceptar los términos y condiciones.",
    "rae.cuenta.privacidad": "Acepto la <a href=\"#\" target=\"_blank\" rel=\"noopener\">política de privacidad</a> de RECO+.",
    "rae.cuenta.privacidadError": "Debes aceptar la política de privacidad.",

    /* ── Paso 9: Opcional ── */
    "rae.opcional.desc": "Esta información es opcional, pero ayuda a que tu perfil de aliado destaque más dentro de RECO+.",
    "rae.opcional.redesLabel": "Redes sociales",
    "rae.opcional.redesError": "Ingresa un enlace válido.",
    "rae.opcional.fotosLabel": "Fotografías del centro de reciclaje",
    "rae.opcional.fotosOpcional": "(opcional, hasta {n})",
    "rae.opcional.fotosHint": "PNG, JPG o WEBP, hasta 3 MB cada una.",
    "rae.opcional.fotosFormatoInvalido": "Algún archivo no es PNG, JPG o WEBP y fue omitido.",
    "rae.opcional.fotosMuyPesado": "Algún archivo pesa más de 3 MB y fue omitido.",
    "rae.opcional.agregar": "Agregar",
    "rae.opcional.videoLabel": "Video de presentación",
    "rae.opcional.videoPh": "Enlace de YouTube, Vimeo, etc.",
    "rae.opcional.videoError": "Ingresa un enlace de video válido.",
    "rae.opcional.coberturaLabel": "Áreas de cobertura",
    "rae.opcional.coberturaDesc": "Provincias o comarcas donde ofrecen recolección o servicio, además de tu ubicación principal.",
    "rae.opcional.residuosLabel": "Cantidad aproximada de residuos procesados al mes (kg)",
    "rae.opcional.residuosPh": "Ej. 250",
    "rae.opcional.residuosError": "Ingresa una cantidad válida.",
    "rae.opcional.misionLabel": "Misión",
    "rae.opcional.misionPh": "¿Cuál es el propósito de tu empresa?",
    "rae.opcional.visionLabel": "Visión",
    "rae.opcional.visionPh": "¿A dónde quiere llegar tu empresa?",
    "rae.opcional.notaCalificaciones": "Las calificaciones y reseñas de otros usuarios se activan automáticamente en tu perfil una vez completado el registro; no se configuran aquí.",

    /* ── Envío final / errores ── */
    "rae.envio.verificandoSesion": "Verificando tu sesión...",
    "rae.envio.sesionExpirada": "Tu sesión expiró. Vuelve a iniciar sesión e intenta el registro de nuevo.",
    "rae.envio.subiendoArchivos": "Subiendo logo y fotos...",
    "rae.envio.guardandoPerfil": "Guardando tu perfil de aliado...",
    "rae.envio.exito": "✓ ¡Listo! Tu empresa quedó registrada. Revisaremos tu perfil y pronto aparecerá como aliado en RECO+.",
    "rae.envio.errorGenerico": "Ocurrió un error inesperado. Intenta de nuevo.",
    "rae.envio.errorDuplicado": "Ya existe un registro de aliado con esos datos (correo o RUC).",
    "rae.envio.errorPermisos": "No se pudo guardar el perfil por un problema de permisos. Contacta a soporte.",
    "rae.envio.errorConexion": "No se pudo conectar. Revisa tu conexión a internet.",
    "rae.envio.errorServicio": "No se pudo conectar con el servicio. Intenta de nuevo más tarde.",

    /* ── Aviso: iniciar sesión primero ── */
    "rae.avisoSesion.titulo": "Inicia sesión primero",
    "rae.avisoSesion.desc": "Para registrar tu empresa como aliado, primero necesitas iniciar sesión (o crear una cuenta) en RECO+. Tu empresa quedará ligada a esa cuenta.",
    "rae.avisoSesion.cancelar": "Cancelar",
    "rae.avisoSesion.irLogin": "Iniciar sesión →",

    /* ── Aviso: ya tienes empresa registrada ── */
    "rae.avisoYaReg.titulo": "Ya tienes una empresa registrada",
    "rae.avisoYaReg.desc1": "Esta cuenta ya tiene una empresa o centro de reciclaje registrado en RECO+. Solo se permite una empresa por cuenta, así que no puedes crear otra desde aquí.",
    "rae.avisoYaReg.desc2": "Si necesitas actualizar los datos de tu empresa, o revisar tu cuenta, puedes hacerlo desde Ajustes.",
    "rae.avisoYaReg.cerrar": "Cerrar",
    "rae.avisoYaReg.irAjustes": "Ir a Ajustes de cuenta →",

    /* ══════════════════════════════════════════
       TUTORIAL — recorrido interactivo (spotlight tour)
       Claves compartidas: tutorial.btn.*, tutorial.step.*,
       tutorial.fab.*, tutorial.done.*
       Claves por página: tutorial.<prefijo>_stepN.*
       (idx_ = index.html)
       ══════════════════════════════════════════ */
    "tutorial.idx_step0.title": "¡Bienvenido a RECO+! 👋",
    "tutorial.idx_step0.desc":  "En un par de minutos te mostramos dónde está todo: el mapa de puntos de reciclaje, cómo donar, pedir ayuda y mucho más. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.idx_step1.title": "Tu barra de navegación",
    "tutorial.idx_step1.desc":  "Desde aquí llegas a cualquier sección: Reciclar, Donar, Guía, Escáner, Mapa y Alianzas. Se queda fija arriba mientras haces scroll, así siempre tienes todo a un clic de distancia.",

    "tutorial.idx_step2.title": "Modo claro / oscuro",
    "tutorial.idx_step2.desc":  "¿Prefieres una interfaz más suave para tus ojos de noche? Prueba tocar este interruptor ahora mismo — el tutorial se adapta al instante al nuevo tema.",

    "tutorial.idx_step3.title": "Cambia de idioma",
    "tutorial.idx_step3.desc":  "RECO+ habla español e inglés. Tócalo para alternar — toda la página, incluido este recorrido, se traduce en tiempo real sin recargar.",

    "tutorial.idx_step4.title": "Únete a la comunidad",
    "tutorial.idx_step4.desc":  "Este botón te lleva a crear tu cuenta. Con tu perfil puedes guardar puntos favoritos, hacer seguimiento a tus donaciones y desbloquear más funciones.",

    "tutorial.idx_step5.title": "Acceso rápido",
    "tutorial.idx_step5.desc":  "Estos accesos directos te llevan al mapa, al escáner con IA o a las alianzas sin tener que buscar en el menú. Ideal cuando ya sabes exactamente qué necesitas hacer.",

    "tutorial.idx_step6.title": "Busca lo que necesitas",
    "tutorial.idx_step6.desc":  "Escribe aquí qué quieres reciclar o donar — por ejemplo \"ropa\" o \"electrónicos\" — y te sugerimos las opciones más relevantes al instante.",

    "tutorial.idx_step7.title": "Datos que te van a sorprender",
    "tutorial.idx_step7.desc":  "Descubre el impacto real del reciclaje: cuánto tarda en descomponerse un plástico, cuántos árboles salvas al reciclar papel y mucho más.",

    "tutorial.idx_step8.title": "Reciclar y donar, un clic más cerca",
    "tutorial.idx_step8.desc":  "Estas dos tarjetas resumen las dos acciones más importantes de la plataforma. Tócalas para ver los puntos de reciclaje cercanos o para empezar a donar hoy mismo.",

    "tutorial.idx_step9.title": "Todo lo que puedes hacer",
    "tutorial.idx_step9.desc":  "Desliza esta tira de tarjetas para descubrir cada función: encontrar puntos, donar, pedir ayuda, leer la guía, ver alianzas y más. Cada tarjeta te lleva directo a la sección correspondiente.",

    "tutorial.idx_step10.title": "¿Cómo funciona RECO+?",
    "tutorial.idx_step10.desc":  "Tres simples pasos: busca lo que necesitas, dona, recicla o solicita ayuda, y genera un impacto real. Así de fácil es sumarte al cambio.",

    "tutorial.idx_step11.title": "Empresas que confían en nosotros",
    "tutorial.idx_step11.desc":  "Conoce a las marcas y organizaciones aliadas que apoyan el movimiento RECO+ y hacen posible este impacto.",

    "tutorial.idx_step12.title": "Lo que dice nuestra comunidad",
    "tutorial.idx_step12.desc":  "Lee experiencias reales de personas que ya donaron, reciclaron o pidieron ayuda a través de la plataforma.",

    "tutorial.idx_step13.title": "El impacto en números",
    "tutorial.idx_step13.desc":  "Estas cifras crecen cada día gracias a personas como tú: usuarios activos, puntos de reciclaje, toneladas recicladas y comunidades unidas.",

    "tutorial.idx_step14.title": "¡Listo, ya conoces RECO+! 🎉",
    "tutorial.idx_step14.desc":  "Explora a tu ritmo. Si en algún momento quieres repetir el recorrido completo, el botón verde flotante siempre estará aquí abajo para ayudarte.",

    "tutorial.btn.next":    "Siguiente",
    "tutorial.btn.prev":    "Anterior",
    "tutorial.btn.finish":  "¡Empezar a explorar!",
    "tutorial.btn.close":   "Cerrar tutorial",
    "tutorial.btn.restart": "Reiniciar tutorial",
    "tutorial.btn.skip":    "Saltar tutorial",

    "tutorial.step.counter":  "Paso {n} de {total}",
    "tutorial.step.progress": "{pct}% completado",
    "tutorial.fab.label":     "Ver tutorial",
    "tutorial.fab.tooltip":   "¿Necesitas ayuda? Reinicia el tutorial",

    "tutorial.done.title": "¡Bien hecho! 🎊",
    "tutorial.done.desc":  "Completaste el recorrido. Ya sabes moverte por RECO+ como un experto.",

    /* ── TUTORIAL: página Reciclar (rec_) ── */
    "tutorial.rec_step0.title": "¡Bienvenido a Reciclar! ♻️",
    "tutorial.rec_step0.desc":  "Te mostramos cómo elegir qué reciclar, usar el escáner con IA y encontrar el centro más cercano. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.rec_step5.title": "Dos formas de empezar",
    "tutorial.rec_step5.desc":  "Ve directo al mapa para encontrar el punto de reciclaje más cercano, o usa el escáner para identificar tu objeto con inteligencia artificial.",

    "tutorial.rec_step6.title": "Elige tu material",
    "tutorial.rec_step6.desc":  "Selecciona el tipo de objeto que quieres reciclar — electrónicos, plástico, vidrio, ropa y mucho más — y te explicamos cómo prepararlo y dónde llevarlo.",

    "tutorial.rec_step7.title": "Escáner inteligente",
    "tutorial.rec_step7.desc":  "Sube o toma una foto de tu objeto y la IA te dirá al instante si es reciclable, en qué categoría entra y cómo prepararlo.",

    "tutorial.rec_step8.title": "Así viaja tu reciclaje",
    "tutorial.rec_step8.desc":  "Desde que usas un objeto hasta que se convierte en materia prima para algo nuevo: conoce los 5 pasos del proceso completo.",

    "tutorial.rec_step9.title": "Centros cerca de ti",
    "tutorial.rec_step9.desc":  "Este mini-mapa te muestra los puntos de reciclaje más cercanos. Tócalo o ve al mapa completo para trazar tu ruta.",

    "tutorial.rec_step10.title": "Cada objeto cuenta",
    "tutorial.rec_step10.desc":  "Cuando quieras, este botón te lleva directo al mapa para empezar a reciclar hoy mismo.",

    "tutorial.rec_step11.title": "¡Listo para reciclar! 🎉",
    "tutorial.rec_step11.desc":  "Ya sabes cómo moverte por esta página. El botón verde flotante siempre estará aquí si quieres repetir el recorrido.",

    /* ── TUTORIAL: página Mapa (map_) ── */
    "tutorial.map_step0.title": "¡Bienvenido al Mapa! 🗺️",
    "tutorial.map_step0.desc":  "Te mostramos cómo buscar, filtrar y encontrar el punto de reciclaje o donación más cercano. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.map_step1.title": "Busca una dirección",
    "tutorial.map_step1.desc":  "Escribe una dirección o ubicación, o toca el botón de ubicación para centrar el mapa donde te encuentras.",

    "tutorial.map_step2.title": "Filtra por material",
    "tutorial.map_step2.desc":  "Toca cualquier chip para ver solo los puntos que reciben ese tipo de material — plástico, papel, vidrio, ropa y más.",

    "tutorial.map_step3.title": "Más materiales",
    "tutorial.map_step3.desc":  "¿No ves lo que buscas? Aquí hay más categorías: cartón, baterías, aceite de cocina y varias más.",

    "tutorial.map_step4.title": "Explora el mapa",
    "tutorial.map_step4.desc":  "Cada marcador es un punto de reciclaje, donación, acopio o evento. Tócalo para ver sus detalles, horarios y materiales que acepta.",

    "tutorial.map_step5.title": "Lee la leyenda",
    "tutorial.map_step5.desc":  "Estos íconos te ayudan a distinguir de un vistazo el tipo de cada punto en el mapa.",

    "tutorial.map_step6.title": "Resultados cerca de ti",
    "tutorial.map_step6.desc":  "Esta lista muestra los puntos más cercanos a tu ubicación, con calificaciones y detalles rápidos.",

    "tutorial.map_step7.title": "Ordena los resultados",
    "tutorial.map_step7.desc":  "Cambia el orden de la lista: más cercanos, mejor valorados o más recientes.",

    "tutorial.map_step8.title": "Ver todos los resultados",
    "tutorial.map_step8.desc":  "Toca aquí para expandir la lista completa de puntos disponibles, sin límite de resultados.",

    "tutorial.map_step9.title": "¿Falta un punto?",
    "tutorial.map_step9.desc":  "Si no encuentras un lugar que conoces, sugiérelo aquí y ayúdanos a hacer crecer el mapa de RECO+.",

    "tutorial.map_step10.title": "¡Listo para explorar! 🎉",
    "tutorial.map_step10.desc":  "Ya sabes cómo moverte por el mapa. El botón verde flotante siempre estará aquí si quieres repetir el recorrido.",

    /* ── TUTORIAL: página Donar (don_) ── */
    "tutorial.don_step0.title": "¡Bienvenido a Donar / Ayuda! 🌿",
    "tutorial.don_step0.desc":  "Te mostramos cómo donar objetos, pedir ayuda y seguir el camino de tu donación. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.don_step1.title": "Dos formas de empezar",
    "tutorial.don_step1.desc":  "Dona un objeto que ya no uses, o solicita una donación si necesitas ayuda. Ambos botones abren el formulario correspondiente.",

    "tutorial.don_step2.title": "¿Qué quieres hacer hoy?",
    "tutorial.don_step2.desc":  "Elige entre publicar algo que quieras donar o pedir algo que necesites de la comunidad.",

    "tutorial.don_step3.title": "El impacto en números",
    "tutorial.don_step3.desc":  "Estas cifras crecen cada día: objetos donados, personas ayudadas, comunidades conectadas y objetos reutilizados.",

    "tutorial.don_step4.title": "Donaciones y solicitudes",
    "tutorial.don_step4.desc":  "Explora lo que la comunidad ya publicó: objetos disponibles para donar, y solicitudes de ayuda activas.",

    "tutorial.don_step5.title": "Campañas de nuestros aliados",
    "tutorial.don_step5.desc":  "Empresas y centros aliados de RECO+ publican aquí sus campañas de reciclaje y donación. Inscríbete si alguna te interesa.",

    "tutorial.don_step6.title": "Sigue el camino de tu donación",
    "tutorial.don_step6.desc":  "Desde que publicas hasta que genera impacto real: así puedes ver en qué etapa va tu donación.",

    "tutorial.don_step7.title": "Una comunidad confiable",
    "tutorial.don_step7.desc":  "Verificamos perfiles, tenemos políticas claras y miles de personas listas para ayudar o recibir ayuda.",

    "tutorial.don_step8.title": "¡Listo para donar! 🎉",
    "tutorial.don_step8.desc":  "Ya sabes cómo moverte por esta página. El botón verde flotante siempre estará aquí si quieres repetir el recorrido.",

    /* ── TUTORIAL: página Guía (gui_) ── */
    "tutorial.gui_step0.title": "¡Bienvenido a la Guía! 📚",
    "tutorial.gui_step0.desc":  "Te mostramos dónde están los videos, las instrucciones paso a paso y los datos que necesitas para reciclar y donar mejor. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.gui_step1.title": "Videos principales",
    "tutorial.gui_step1.desc":  "Estos videos destacados te explican en poco tiempo cómo reciclar, donar y cuidar el planeta.",

    "tutorial.gui_step2.title": "Más contenido y comunidad",
    "tutorial.gui_step2.desc":  "Descubre más videos cortos, o sube el tuyo propio para compartirlo con la comunidad RECO+.",

    "tutorial.gui_step3.title": "Reciclar o donar",
    "tutorial.gui_step3.desc":  "Cambia entre las instrucciones de reciclaje y las de donación con este selector.",

    "tutorial.gui_step4.title": "Elige una categoría",
    "tutorial.gui_step4.desc":  "Toca el material que quieres reciclar o donar para ver instrucciones específicas.",

    "tutorial.gui_step5.title": "Instrucciones paso a paso",
    "tutorial.gui_step5.desc":  "Aquí encuentras cómo prepararlo y dónde llevarlo, además de las categorías más comunes para donar.",

    "tutorial.gui_step6.title": "Datos y consejos",
    "tutorial.gui_step6.desc":  "Descubre curiosidades sobre el reciclaje, el impacto real de la comunidad y consejos rápidos para el día a día.",

    "tutorial.gui_step7.title": "Únete a la comunidad",
    "tutorial.gui_step7.desc":  "Cuando estés listo, crea tu cuenta y empieza a ser parte del cambio junto a miles de personas.",

    "tutorial.gui_step8.title": "¡Listo para aprender! 🎉",
    "tutorial.gui_step8.desc":  "Ya sabes cómo moverte por la guía. El botón verde flotante siempre estará aquí si quieres repetir el recorrido.",

    /* ── TUTORIAL: página Alianzas (ali_) ── */
    "tutorial.ali_step0.title": "¡Bienvenido a Alianzas! 🤝",
    "tutorial.ali_step0.desc":  "Te mostramos cómo registrar tu empresa, explorar iniciativas y conocer a nuestros aliados. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.ali_step1.title": "Colabora y multiplica el impacto",
    "tutorial.ali_step1.desc":  "Este espacio es para empresas, fundaciones o centros que quieren colaborar con RECO+ o ya forman parte de la comunidad.",

    "tutorial.ali_step2.title": "Regístrate o explora iniciativas",
    "tutorial.ali_step2.desc":  "Registra tu empresa como aliado, o descubre las campañas y proyectos conjuntos que ya están en marcha.",

    "tutorial.ali_step3.title": "Aliados destacados",
    "tutorial.ali_step3.desc":  "Conoce a las empresas con plan Premium que apoyan activamente el movimiento RECO+.",

    "tutorial.ali_step4.title": "¿Tu empresa quiere sumarse?",
    "tutorial.ali_step4.desc":  "Toca aquí para registrar tu empresa y unirte a la comunidad de aliados que construyen un futuro más sostenible.",

    "tutorial.ali_step5.title": "¡Listo para colaborar! 🎉",
    "tutorial.ali_step5.desc":  "Ya sabes cómo moverte por esta página. El botón verde flotante siempre estará aquí si quieres repetir el recorrido.",

    /* ── TUTORIAL: página Videos (vid_) ── */
    "tutorial.vid_step0.title": "¡Bienvenido a la Biblioteca de videos! 🎥",
    "tutorial.vid_step0.desc":  "Te mostramos cómo buscar, filtrar y compartir videos sobre reciclaje y donación. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.vid_step1.title": "Busca un video",
    "tutorial.vid_step1.desc":  "Escribe una palabra clave para encontrar rápido el video que buscas.",

    "tutorial.vid_step2.title": "Filtra por categoría",
    "tutorial.vid_step2.desc":  "Elige una categoría para ver solo esos videos, o sube el tuyo propio para compartirlo con la comunidad.",

    "tutorial.vid_step3.title": "Explora la biblioteca",
    "tutorial.vid_step3.desc":  "Toca cualquier video para verlo directamente aquí, sin salir de RECO+.",

    "tutorial.vid_step4.title": "¡Listo para aprender! 🎉",
    "tutorial.vid_step4.desc":  "Ya sabes cómo moverte por la biblioteca de videos. El botón verde flotante siempre estará aquí si quieres repetir el recorrido.",

    /* ── TUTORIAL: página Escáner (esc_) ── */
    "tutorial.esc_step0.title": "¡Bienvenido al Escáner! ✨",
    "tutorial.esc_step0.desc":  "Te mostramos cómo identificar cualquier objeto con inteligencia artificial en segundos. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.esc_step1.title": "Apunta la cámara",
    "tutorial.esc_step1.desc":  "Coloca el objeto dentro del visor. El escáner analiza en vivo lo que la cámara ve.",

    "tutorial.esc_step2.title": "Inicia el escáner",
    "tutorial.esc_step2.desc":  "Toca este botón para activar tu cámara y empezar a identificar materiales al instante.",

    "tutorial.esc_step3.title": "Escáneo preciso con IA",
    "tutorial.esc_step3.desc":  "Si el resultado en vivo no es suficiente, toca aquí para un análisis más exacto con inteligencia artificial.",

    "tutorial.esc_step4.title": "Historial de esta sesión",
    "tutorial.esc_step4.desc":  "Aquí verás todos los objetos que has identificado durante esta sesión de escáneo.",

    "tutorial.esc_step5.title": "¡Listo para escanear! 🎉",
    "tutorial.esc_step5.desc":  "Ya sabes cómo usar el escáner. El botón verde flotante siempre estará aquí si quieres repetir el recorrido.",

    /* ── PÁGINA RECICLAR ── */
    "reciclar.hero.title1": "Recicla hoy,",
    "reciclar.hero.title2": "transforma el mañana.",
    "reciclar.hero.desc":   "Aprende a clasificar tus residuos, descubre dónde reciclar y conoce el impacto positivo que cada acción genera para el planeta.",
    "reciclar.hero.btn1":   "Encontrar punto de reciclaje",
    "reciclar.hero.btn2":   "Escanear objeto",

    "reciclar.materiales.title": "¿Qué deseas reciclar?",
    "reciclar.materiales.sub":   "Selecciona el tipo de material para obtener información.",
    "reciclar.materiales.nota":  "Al seleccionar un material, conocerás cómo prepararlo, dónde llevarlo y qué se obtiene al reciclarlo.",
    "reciclar.mat.electronicos": "Electrónicos",
    "reciclar.mat.celulares":    "Celulares",
    "reciclar.mat.plastico":     "Plástico",
    "reciclar.mat.metal":        "Metal",
    "reciclar.mat.papel":        "Papel",
    "reciclar.mat.vidrio":       "Vidrio",
    "reciclar.mat.ropa":         "Ropa",
    "reciclar.mat.muebles":      "Muebles",
    "reciclar.mat.libros":       "Libros",
    "reciclar.mat.juguetes":     "Juguetes",
    "reciclar.mat.baterias":     "Baterías",
    "reciclar.mat.bombillos":    "Bombillos",
    "reciclar.mat.carton":       "Cartón",
    "reciclar.mat.tetrapak":     "Tetra Pak",
    "reciclar.mat.aceite":       "Aceite de cocina",
    "reciclar.mat.tela":         "Tela",
    "reciclar.mat.cuero":        "Cuero",
    "reciclar.mat.utilesescolares": "Útiles escolares",

    "reciclar.escaner.title": "Escáner inteligente",
    "reciclar.escaner.sub":   "Escanea cualquier objeto y nuestra IA te dirá si es reciclable, en qué categoría pertenece, cómo prepararlo y dónde puedes llevarlo.",
    "reciclar.escaner.drop1": "Toma una foto o sube una imagen",
    "reciclar.escaner.drop2": "JPG, PNG o WEBP (máx. 10MB)",
    "reciclar.escaner.f1": "¿Es reciclable?",
    "reciclar.escaner.f1.aria": "Ver si es reciclable en el panel de información",
    "reciclar.escaner.f2": "Categoría",
    "reciclar.escaner.f2.aria": "Ver la categoría y de qué está hecho en el panel de información",
    "reciclar.escaner.f3": "Dónde llevarlo",
    "reciclar.escaner.f3.aria": "Ver los puntos de entrega en el panel de información",
    "reciclar.escaner.f4": "Cómo prepararlo",
    "reciclar.escaner.f4.aria": "Ver cómo prepararlo en el panel de información",
    "reciclar.escaner.cargandoModelo": "Preparando el motor de reconocimiento (solo la primera vez)…",
    "reciclar.escaner.analizando": "Analizando la imagen…",
    "reciclar.escaner.detectamos": "Detectamos",
    "reciclar.escaner.mensajeReciclable": "✅ Esto se recicla.",
    "reciclar.escaner.mensajePuntoEspecial": "⚠️ Esto se recicla, pero necesita un punto especial.",
    "reciclar.escaner.confianza": "Confianza",
    "reciclar.escaner.bajaConfianza": "No estamos muy seguros. Si no coincide, prueba con otra foto o elige el material manualmente arriba.",
    "reciclar.escaner.verAbajo": "Mira los detalles completos en el panel de abajo ↓",
    "reciclar.escaner.noReconocido": "No pudimos identificar el objeto con seguridad",
    "reciclar.escaner.sugerencia": "Prueba con más luz, acerca el objeto o enfócalo mejor. También puedes elegir la categoría manualmente en la lista de arriba.",
    "reciclar.escaner.error": "No pudimos analizar la imagen",
    "reciclar.escaner.errorTipo": "Ese archivo no es una imagen. Sube una foto en JPG, PNG o WEBP.",
    "reciclar.escaner.errorTamano": "La imagen pesa demasiado. El máximo es 10MB.",
    "reciclar.escaner.errorGeneral": "Ocurrió un problema al analizar la imagen. Verifica tu conexión e inténtalo de nuevo.",

    "reciclar.proceso.title": "Proceso del reciclaje",
    "reciclar.proceso.p1.t": "Objeto",
    "reciclar.proceso.p1.d": "Usas un producto en tu vida diaria.",
    "reciclar.proceso.p2.t": "Clasificación",
    "reciclar.proceso.p2.d": "Separas y clasificas correctamente.",
    "reciclar.proceso.p3.t": "Centro de reciclaje",
    "reciclar.proceso.p3.d": "Los materiales llegan a centros de acopio.",
    "reciclar.proceso.p4.t": "Transformación",
    "reciclar.proceso.p4.d": "Se procesan y convierten en materia prima.",
    "reciclar.proceso.p5.t": "Nuevo producto",
    "reciclar.proceso.p5.d": "Se crean productos para un futuro sostenible.",

    "reciclar.centros.title": "Centros de reciclaje cercanos",
    "reciclar.centros.btn":   "Ver mapa completo",

    "reciclar.calc.title": "Calculadora de impacto",
    "reciclar.calc.sub":   "Ingresa los materiales que reciclaste hoy y descubre tu impacto positivo.",
    "reciclar.calc.f1": "Botellas de plástico",
    "reciclar.calc.f2": "Latas de aluminio",
    "reciclar.calc.f3": "Hojas de papel",
    "reciclar.calc.uds": "uds",
    "reciclar.calc.btn": "Calcular impacto",
    "reciclar.calc.r1":  "Árboles protegidos",
    "reciclar.calc.r1u": "árboles",
    "reciclar.calc.r2":  "Energía ahorrada",
    "reciclar.calc.r3":  "Agua ahorrada",
    "reciclar.calc.r3u": "litros",
    "reciclar.calc.r4":  "CO₂ evitado",
    "reciclar.calc.r4u": "kg",

    "reciclar.historial.title.pre": "Mi",
    "reciclar.historial.title": "Historial de reciclaje",
    "reciclar.historial.nivel": "Nivel actual",
    "reciclar.historial.brote": "Brote",
    "reciclar.historial.s1": "Objetos reciclados",
    "reciclar.historial.s2": "Impacto generado",
    "reciclar.historial.s3": "Puntos acumulados",
    "reciclar.historial.s4": "Insignias ganadas",
    "reciclar.historial.btn": "Ver mi historial completo",

    "reciclar.ctafinal.title": "Cada objeto cuenta.",
    "reciclar.ctafinal.desc":  "Conviértelo en una nueva oportunidad para el planeta.",
    "reciclar.ctafinal.btn":   "Comenzar a reciclar",

    /* ── LOGIN ── */
    "login.title":       "Bienvenido",
    "login.subtitle":    "Tu acción hoy crea el mañana.",
    "login.email":       "Email",
    "login.email.placeholder": "nombre@ejemplo.com",
    "login.password":    "Contraseña",
    "login.password.placeholder": "••••••••",
    "login.forgot":      "¿Olvidaste tu contraseña?",
    "login.submit":      "Iniciar sesión",
    "login.or":          "O continúa con",
    "login.google":      "Google",
    "login.apple":       "Apple",
    "login.noAccount":   "¿No tienes cuenta?",
    "login.register":    "Regístrate",
    "login.brand":       "RECO+",

    /* ── REGISTRO ── */
    "register.title":            "Crea tu cuenta",
    "register.subtitle":         "Únete y empieza a darle una segunda vida a lo que ya no usas.",
    "register.name":             "Nombre completo",
    "register.name.placeholder": "Tu nombre",
    "register.confirmPassword":  "Confirmar contraseña",
    "register.submit":           "Crear cuenta",
    "register.hasAccount":       "¿Ya tienes cuenta?",
    "register.login":            "Inicia sesión",

    /* ── RESET PASSWORD ── */
    "reset.title":               "Nueva contraseña",
    "reset.subtitle":            "Elige una contraseña nueva para tu cuenta.",
    "reset.newPassword":         "Nueva contraseña",
    "reset.confirmPassword":     "Confirmar contraseña",
    "reset.submit":              "Guardar contraseña",
    "reset.backToLogin":         "Volver a iniciar sesión",
    "reset.linkInvalido":        "Este enlace no es válido o ya expiró. Solicita uno nuevo desde la página de inicio de sesión.",
    "reset.errorLongitud":       "La contraseña debe tener al menos 6 caracteres.",
    "reset.errorNoCoincide":     "Las contraseñas no coinciden.",
    "reset.exito":               "¡Contraseña actualizada! Redirigiendo a inicio de sesión…",

    /* ── AJUSTES (modal de cuenta) ── */
    "ajustes.titulo":              "Ajustes",
    "ajustes.cerrar":              "Cerrar",

    "ajustes.tab.cuenta":          "Cuenta",
    "ajustes.tab.apariencia":      "Apariencia",
    "ajustes.tab.preferencias":    "Preferencias",
    "ajustes.tab.privacidad":      "Privacidad",

    "ajustes.cuenta.perfil":              "Perfil",
    "ajustes.cuenta.nombreLabel":         "Nombre para mostrar",
    "ajustes.cuenta.nombrePlaceholder":   "Tu nombre",
    "ajustes.cuenta.emailLabel":          "Correo electrónico",
    "ajustes.cuenta.guardar":             "Guardar cambios",
    "ajustes.cuenta.guardando":           "Guardando…",
    "ajustes.cuenta.infoPersonal":        "Información personal",
    "ajustes.cuenta.telefonoLabel":       "Teléfono (opcional)",
    "ajustes.cuenta.telefonoPlaceholder": "+507 6000-0000",
    "ajustes.cuenta.ciudadLabel":         "Ciudad",
    "ajustes.cuenta.ciudadPlaceholder":   "Ej. David, Panamá",
    "ajustes.cuenta.statusOk":            "Cambios guardados.",
    "ajustes.cuenta.statusServicioNoDisponible": "Servicio no disponible.",
    "ajustes.cuenta.statusErrorGuardar":  "No se pudo guardar: {msg}",
    "ajustes.cuenta.statusErrorConexion": "No se pudo conectar. Intenta de nuevo.",

    "ajustes.apariencia.temaLabel":   "Tema",
    "ajustes.apariencia.temaDesc":    "Elige cómo se ve RECO+ en este dispositivo.",
    "ajustes.apariencia.claro":       "Claro",
    "ajustes.apariencia.oscuro":      "Oscuro",
    "ajustes.apariencia.fuenteLabel": "Tamaño de fuente",
    "ajustes.apariencia.fuenteDesc":  "Ajusta el tamaño del texto en todo el sitio.",

    "ajustes.preferencias.idiomaLabel":       "Idioma",
    "ajustes.preferencias.idiomaDesc":        "Idioma de la interfaz de RECO+.",
    "ajustes.preferencias.notifLabel":        "Notificaciones",
    "ajustes.preferencias.notifDesc":         "Avisos sobre solicitudes, mensajes y novedades.",
    "ajustes.preferencias.ubicacionLabel":    "Ubicación",
    "ajustes.preferencias.ubicacionDesc":     "Permite sugerir puntos de reciclaje cercanos a ti.",
    "ajustes.preferencias.camaraLabel":       "Cámara",
    "ajustes.preferencias.camaraDesc":        "Necesaria para el escáner de materiales.",

    "ajustes.privacidad.sesion":           "Sesión",
    "ajustes.privacidad.cerrarSesionLabel":"Cerrar sesión",
    "ajustes.privacidad.cerrarSesionDesc": "Saldrás de tu cuenta en este dispositivo.",
    "ajustes.privacidad.cerrarSesionBtn":  "Cerrar sesión",
    "ajustes.privacidad.cerrando":         "Cerrando…",
    "ajustes.privacidad.eliminarLabel":    "Eliminar cuenta",
    "ajustes.privacidad.eliminarDesc":     "Esta acción es permanente. Se eliminarán tus datos de RECO+ y no podrás deshacerla.",
    "ajustes.privacidad.eliminarBtn":      "Eliminar mi cuenta",
    "ajustes.privacidad.eliminarConfirmar":"¿Confirmar? Toca de nuevo",
    "ajustes.privacidad.eliminarStatus":   "Para eliminar tu cuenta, escríbenos a soporte.recoplus@gmail.com. (Requiere verificación desde el servidor.)",

    /* ── CONTACTO (página contacto.html) ── */
    "contacto.hero.title":        "Estamos aquí<br>para ayudarte",
    "contacto.hero.desc":         "¿Tienes dudas, sugerencias o quieres trabajar con nosotros? Escríbenos y nos pondremos en contacto contigo lo antes posible.",
    "contacto.perk1.title":       "Respuesta rápida",
    "contacto.perk1.desc":        "Te respondemos en menos de 24 horas",
    "contacto.perk2.title":       "Comprometidos",
    "contacto.perk2.desc":        "Atención cercana y personalizada",
    "contacto.perk3.title":       "Confidencial",
    "contacto.perk3.desc":        "Tus datos están seguros con nosotros",

    "contacto.form.title":            "Envíanos un mensaje",
    "contacto.form.nombreLabel":      "Nombre completo",
    "contacto.form.nombrePh":         "Escribe tu nombre",
    "contacto.form.nombreError":      "Por favor escribe tu nombre.",
    "contacto.form.correoLabel":      "Correo electrónico",
    "contacto.form.correoPh":         "Escribe tu correo",
    "contacto.form.correoError":      "Introduce un correo válido.",
    "contacto.form.asuntoLabel":      "Asunto",
    "contacto.form.asuntoDefault":    "Selecciona un asunto",
    "contacto.form.asunto.reciclaje": "Dudas sobre reciclaje",
    "contacto.form.asunto.donaciones":"Donaciones o alianzas",
    "contacto.form.asunto.pedidos":   "Pedidos de tienda",
    "contacto.form.asunto.problema":  "Reportar un problema",
    "contacto.form.asunto.otro":      "Otro",
    "contacto.form.asuntoError":      "Selecciona un asunto.",
    "contacto.form.mensajeLabel":     "Mensaje",
    "contacto.form.mensajePh":        "Cuéntanos cómo podemos ayudarte...",
    "contacto.form.mensajeError":     "Escribe tu mensaje.",
    "contacto.form.privacidad":       "Acepto la <a href=\"#\">política de privacidad</a> y el tratamiento de mis datos.",
    "contacto.form.submit":           "Enviar mensaje",
    "contacto.form.enviando":         "Enviando...",
    "contacto.form.errorRevisa":      "Por favor revisa los campos marcados antes de continuar.",
    "contacto.form.exito":            "¡Gracias! Tu mensaje fue enviado, te responderemos pronto.",

    "contacto.otras.title":       "Otras formas de contacto",
    "contacto.otras.correo.title":"Correo electrónico",
    "contacto.otras.correo.sub":  "Te responderemos en menos de 24h",
    "contacto.otras.tel.title":   "Teléfono / WhatsApp",
    "contacto.otras.tel.sub":     "Lunes a Viernes de 9:00 a 18:00",
    "contacto.otras.dir.title":   "Dirección",
    "contacto.otras.redes.title": "Redes sociales",
    "contacto.otras.redes.sub":   "Síguenos y escríbenos",

    "contacto.mapa.title": "¿Dónde estamos?",
    "contacto.mapa.desc":  "Visítanos en nuestras oficinas o encuéntranos en el mapa.",
    "contacto.mapa.btn":   "Ver en Google Maps",
    "contacto.mapa.alt":   "Mapa ilustrativo de la ubicación de RECO+",

    "contacto.ayuda.title":         "¿Necesitas ayuda con algo específico?",
    "contacto.ayuda.reciclaje.title":"Dudas sobre reciclaje",
    "contacto.ayuda.reciclaje.desc": "Te ayudamos a reciclar correctamente.",
    "contacto.ayuda.reciclaje.link": "Ir a la guía",
    "contacto.ayuda.donaciones.title":"Donaciones o alianzas",
    "contacto.ayuda.donaciones.desc": "Conoce cómo colaborar con RECO+.",
    "contacto.ayuda.donaciones.link": "Saber más",
    "contacto.ayuda.tienda.title":  "Pedidos de tienda",
    "contacto.ayuda.tienda.desc":   "Consulta sobre envíos, productos y más.",
    "contacto.ayuda.tienda.link":   "Ir a la tienda",
    "contacto.ayuda.reportar.title":"Reportar un problema",
    "contacto.ayuda.reportar.desc": "Ayúdanos a mejorar reportando aquí.",
    "contacto.ayuda.reportar.link": "Reportar",

    "contacto.cta.title": "Juntos hacemos la diferencia",
    "contacto.cta.desc":  "Cada mensaje, idea y colaboración nos acerca a un mundo más limpio, solidario y sostenible.",
    "contacto.cta.btn":   "Únete a la comunidad",

    "contacto.partners.title": "Empresas y aliados que confían en nosotros",

    "contacto.footer.desc":       "Plataforma comunitaria para reciclar, donar y construir un futuro más sostenible.",
    "contacto.footer.nav.inicio": "Inicio",
    "contacto.footer.nav.mapa":   "Mapa",
    "contacto.footer.nav.guia":   "Guía",
    "contacto.footer.nav.donar":  "Donar / Ayuda",
    "contacto.footer.nav.tienda": "Tienda EcoTech",
    "contacto.footer.nav.blog":   "Blog",
    "contacto.footer.nav.nosotros":"Sobre nosotros",
    "contacto.footer.newsletter.desc": "Recibe las últimas novedades sobre sostenibilidad.",

    /* ── SCANNER DEMO (página scanner-demo.html) ── */
    "scannerdemo.eyebrow":        "RECO+ · Escáner",
    "scannerdemo.title":          "¿Qué estás reciclando?",
    "scannerdemo.subtitle":       "Apunta la cámara al objeto. Lo identificamos y te decimos en qué categoría va.",
    "scannerdemo.overlay.inicial":"Toca \"Iniciar escáner\" para activar la cámara.",
    "scannerdemo.overlay.solicitando": "Solicitando acceso a la cámara...",
    "scannerdemo.overlay.cargandoModelo": "Cargando el modelo de reconocimiento (puede tardar unos segundos)...",
    "scannerdemo.overlay.listo":  "Listo. Apunta al objeto.",
    "scannerdemo.overlay.error":  "Ocurrió un problema.",
    "scannerdemo.btn.iniciar":    "Iniciar escáner",
    "scannerdemo.btn.reintentar": "Reintentar",
    "scannerdemo.btn.pausar":     "Pausar",
    "scannerdemo.btn.reanudar":   "Reanudar",
    "scannerdemo.btn.detener":    "Detener cámara",
    "scannerdemo.btn.ia":         "✨ Escaneo preciso (IA)",
    "scannerdemo.btn.iaCapturando": "📸 Capturando...",
    "scannerdemo.btn.iaConsultando": "🔎 Consultando IA...",
    "scannerdemo.btn.volverEscanear": "🔄 Volver a escanear",
    "scannerdemo.resultado.esperando": "Esperando objeto...",
    "scannerdemo.confianza.alta": "IA · confianza alta",
    "scannerdemo.confianza.media": "IA · confianza media",
    "scannerdemo.confianza.baja": "IA · confianza baja",
    "scannerdemo.confianza.ia":   "IA",
    "scannerdemo.confianza.sinCerteza": "Sin certeza",
    "scannerdemo.confianza.detalleSinCerteza": "Acércate más o mejora la iluminación.",
    "scannerdemo.confianza.baja2": "Confianza baja",
    "scannerdemo.confianza.consenso": "Consenso {votos}",
    "scannerdemo.deteccion.gemini": "Gemini detectó: {label}",
    "scannerdemo.deteccion.clasificadoIA": "Clasificado por IA",
    "scannerdemo.deteccion.keyword": "Detectado como \"{kw}\"",
    "scannerdemo.deteccion.sinCategoria": "Sin categoría exacta (visto: \"{top}\")",
    "scannerdemo.historial.title": "Detectados en esta sesión",
    "scannerdemo.historial.vacio": "Aún no se ha detectado nada.",

    /* ── COMENTAR (comentar-modal.js — botón de footer en todas las páginas) ── */
    "comentar.boton":         "Dejar un comentario",
    "comentar.titulo":        "Comparte tu experiencia",
    "comentar.necesitaSesion":"Inicia sesión para poder publicar un comentario y calificar tu experiencia con RECO+.",
    "comentar.ratingLabel":   "Tu calificación",
    "comentar.textoLabel":    "Tu comentario",
    "comentar.textoPlaceholder": "Cuéntanos cómo te ha ido usando RECO+...",
    "comentar.publicar":      "Publicar comentario",
    "comentar.publicando":    "Publicando…",
    "comentar.statusFaltaRating": "Selecciona al menos una estrella.",
    "comentar.statusFaltaTexto":  "Escribe un comentario antes de publicar.",
    "comentar.statusServicioNoDisponible": "Servicio no disponible en este momento.",
    "comentar.statusError":         "No se pudo publicar tu comentario. Intenta de nuevo.",
    "comentar.statusOk":            "¡Gracias por tu comentario!",
    "comentar.statusErrorConexion": "No se pudo conectar. Revisa tu internet.",

    /* ════════════════════════════════════════════════
       CAMPAÑAS (campanas-modal.js — alianzas.html)
       Modal de opciones + wizard de 3 pasos para publicar una
       campaña de reciclaje o donación, y avisos de sesión/aprobación.
       ════════════════════════════════════════════════ */

    /* ── Modal de opciones ("Explorar iniciativas →") ── */
    "campanas.opciones.kicker": "Proyectos y campañas",
    "campanas.opciones.titulo": "Campañas e iniciativas",
    "campanas.opciones.desc": "Descubre campañas de reciclaje y donación de nuestros aliados, o publica la tuya si representas una empresa registrada en RECO+.",
    "campanas.opciones.ver.titulo": "Ver campañas activas",
    "campanas.opciones.ver.desc": "Explora las campañas ya publicadas por empresas aliadas.",
    "campanas.opciones.publicar.titulo": "Publicar una campaña",
    "campanas.opciones.publicar.desc": "Comparte tu próxima campaña de reciclaje o donación.",

    /* ── Avisos: sesión / empresa / aprobación / límite de plan ── */
    "campanas.aviso.kicker": "Publicar campaña",
    "campanas.aviso.cerrar": "Cerrar",
    "campanas.aviso.sesion.titulo": "Inicia sesión primero",
    "campanas.aviso.sesion.msg": "Para publicar una campaña, primero necesitas iniciar sesión con la cuenta de tu empresa aliada.",
    "campanas.aviso.sesion.btn": "Iniciar sesión →",
    "campanas.aviso.servicioNoDisponible.titulo": "Servicio no disponible",
    "campanas.aviso.servicioNoDisponible.msg": "No se pudo conectar con el servicio. Intenta de nuevo más tarde.",
    "campanas.aviso.errorVerificar.titulo": "No se pudo verificar tu empresa",
    "campanas.aviso.errorVerificar.msg": "Ocurrió un problema al revisar tu registro de aliado. Intenta de nuevo.",
    "campanas.aviso.errorVerificarConexion.msg": "Ocurrió un problema de conexión. Intenta de nuevo.",
    "campanas.aviso.registraEmpresa.titulo": "Primero registra tu empresa",
    "campanas.aviso.registraEmpresa.msg": "Todavía no tienes una empresa registrada como aliado de RECO+. Regístrala primero; una vez aprobada podrás publicar campañas.",
    "campanas.aviso.registraEmpresa.btn": "Registrar mi empresa →",
    "campanas.aviso.pendiente.titulo": "Empresa pendiente de aprobación",
    "campanas.aviso.rechazado.msg": "El registro de tu empresa fue rechazado, así que todavía no puedes publicar campañas. Actualiza tus datos desde Ajustes y espera una nueva revisión.",
    "campanas.aviso.pendiente.msg": "Tu empresa está pendiente de revisión. Podrás publicar campañas en cuanto sea aprobada.",
    "campanas.aviso.ajustesBtn": "Ir a Ajustes de cuenta →",
    "campanas.aviso.limite.titulo": "Alcanzaste el límite de tu plan",
    "campanas.aviso.limite.msg": "Tu plan {plan} permite hasta {max} campaña{plural} activa{plural} a la vez. Cierra una campaña existente o mejora tu plan para publicar más.",
    "campanas.aviso.verPlanesBtn": "Ver planes →",

    /* ── Paso 1: Datos de la campaña ── */
    "campanas.paso1.desc": "Cuéntanos de qué trata tu campaña. Aparecerá en Donar una vez que la aprobemos.",
    "campanas.paso1.tipoLabel": "Tipo de campaña",
    "campanas.paso1.tipoReciclaje": "♻️ Reciclaje",
    "campanas.paso1.tipoDonacion": "🎁 Donación",
    "campanas.paso1.tituloLabel": "Título de la campaña",
    "campanas.paso1.tituloPh": "Ej. Recolectón de electrónicos en David",
    "campanas.paso1.tituloError": "Ingresa un título para la campaña.",
    "campanas.paso1.descLabel": "Descripción",
    "campanas.paso1.descPh": "Cuenta de qué trata la campaña, cómo participar y qué se hará con lo recolectado...",
    "campanas.paso1.descHint": "{n} / 500 (mínimo 20 caracteres)",
    "campanas.paso1.descError": "Escribe una descripción de al menos 20 caracteres.",
    "campanas.paso1.bannerLabel": "Banner de la campaña",
    "campanas.paso1.bannerCambiar": "Cambiar banner",
    "campanas.paso1.bannerSubir": "Subir banner",
    "campanas.paso1.bannerQuitar": "Quitar",
    "campanas.paso1.bannerHint": "JPG, PNG o WEBP, máx. 4MB.",
    "campanas.paso1.bannerAlert": "La imagen pesa demasiado (máx. 4MB).",

    /* ── Paso 2: Ubicación y vigencia ── */
    "campanas.paso2.desc": "¿Dónde se lleva a cabo la campaña y durante cuánto tiempo estará activa?",
    "campanas.paso2.provinciaLabel": "Provincia o comarca",
    "campanas.paso2.provinciaDefault": "Selecciona una provincia",
    "campanas.paso2.provinciaError": "Selecciona una provincia.",
    "campanas.paso2.distritoLabel": "Distrito o ciudad",
    "campanas.paso2.distritoError": "Ingresa el distrito o ciudad.",
    "campanas.paso2.direccionLabel": "Dirección o punto de encuentro",
    "campanas.paso2.direccionError": "Ingresa la dirección o punto de encuentro.",
    "campanas.paso2.fechaInicioLabel": "Fecha de inicio",
    "campanas.paso2.fechaInicioError": "Selecciona la fecha de inicio.",
    "campanas.paso2.fechaFinLabel": "Fecha de fin",
    "campanas.paso2.fechaFinErrorDefault": "La fecha de fin debe ser igual o posterior a la de inicio.",
    "campanas.paso2.fechaFinErrorPlan": "Tu plan {plan} permite campañas de hasta {dias} días. Acorta el rango de fechas o mejora tu plan.",

    /* ── Paso 3: Objetivo de la campaña ── */
    "campanas.paso3.desc": "Por último, cuéntanos el objetivo de la campaña.",
    "campanas.paso3.etiquetaReciclaje": "¿Qué materiales se reciben?",
    "campanas.paso3.etiquetaDonacion": "¿Qué categorías se reciben?",
    "campanas.paso3.seleccionados": "seleccionados",
    "campanas.paso3.error": "Selecciona al menos una opción.",
    "campanas.paso3.metaLabel": "Meta de la campaña",
    "campanas.paso3.metaCantidadPh": "Ej. 500",
    "campanas.paso3.metaUnidadPh": "Ej. kg, artículos, personas",
    "campanas.paso3.metaHint": "Ej. \"500\" + \"kg\", o \"200\" + \"artículos\". Se muestra como una barra de progreso en Donar.",

    /* ── Wizard general / envío ── */
    "campanas.kicker": "Publicar campaña · Paso {n} de {total}",
    "campanas.paso.datos.titulo": "Datos de la campaña",
    "campanas.paso.ubicacion.titulo": "Ubicación y vigencia",
    "campanas.paso.objetivo.titulo": "Objetivo de la campaña",
    "campanas.btnAtras": "← Atrás",
    "campanas.btnSiguiente": "Siguiente →",
    "campanas.btnPublicar": "Publicar campaña ✓",
    "campanas.btnPublicando": "Publicando...",
    "campanas.statusRevisa": "Revisa los campos marcados antes de continuar.",
    "campanas.confirmCerrar": "¿Seguro que quieres cerrar? Se perderá la información ingresada en este formulario.",
    "campanas.envio.verificandoSesion": "Verificando tu sesión...",
    "campanas.envio.sesionExpirada": "Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.",
    "campanas.envio.subiendoBanner": "Subiendo banner...",
    "campanas.envio.publicando": "Publicando tu campaña...",
    "campanas.envio.exito": "✓ ¡Campaña enviada! Quedará pendiente de revisión y aparecerá en Donar en cuanto sea aprobada.",
    "campanas.envio.errorPermisos": "No se pudo publicar por un problema de permisos (¿tu empresa sigue aprobada?).",
    "campanas.envio.errorConexion": "No se pudo conectar. Revisa tu conexión a internet.",
    "campanas.envio.errorGenerico": "Ocurrió un error inesperado. Intenta de nuevo.",
    "campanas.envio.errorServicio": "No se pudo conectar con el servicio. Intenta de nuevo más tarde.",

    /* ════════════════════════════════════════════════
       AJUSTES: "Mi empresa" (ajustes-empresa.js)
       ════════════════════════════════════════════════ */
    "ajemp.tab.miEmpresa": "Mi empresa",
    "ajemp.estado.pendiente": "Pendiente de revisión",
    "ajemp.estado.aprobado": "Aprobado",
    "ajemp.estado.rechazado": "Rechazado",
    "ajemp.estadoNota.pendiente": "Tu empresa está en revisión. Aparecerá públicamente en RECO+ en cuanto sea aprobada.",
    "ajemp.estadoNota.aprobado": "Tu empresa ya es visible públicamente como aliado de RECO+.",
    "ajemp.estadoNota.rechazado": "Tu registro fue rechazado. Puedes actualizar los datos y quedará pendiente de una nueva revisión.",

    "ajemp.datos.titulo": "Datos de la empresa",
    "ajemp.datos.nombreLabel": "Nombre de la empresa",
    "ajemp.datos.nombreComercialLabel": "Nombre comercial",
    "ajemp.datos.rucLabel": "Número de registro o RUC",
    "ajemp.datos.tipoLabel": "Tipo de empresa",
    "ajemp.datos.descripcionLabel": "Descripción",
    "ajemp.datos.guardarBtn": "Guardar datos",

    "ajemp.contacto.titulo": "Contacto",
    "ajemp.contacto.telefonoLabel": "Teléfono",
    "ajemp.contacto.whatsappLabel": "WhatsApp",
    "ajemp.contacto.sitioWebLabel": "Sitio web",
    "ajemp.contacto.guardarBtn": "Guardar contacto",

    "ajemp.ubicacion.titulo": "Ubicación",
    "ajemp.ubicacion.provinciaLabel": "Provincia o comarca",
    "ajemp.ubicacion.distritoLabel": "Distrito o ciudad",
    "ajemp.ubicacion.direccionLabel": "Dirección completa",
    "ajemp.ubicacion.guardarBtn": "Guardar ubicación",

    "ajemp.materiales.titulo": "Materiales que reciben",
    "ajemp.servicios.titulo": "Servicios que ofrecen",
    "ajemp.chip.seleccionados": "seleccionados",
    "ajemp.matServ.guardarBtn": "Guardar materiales y servicios",

    "ajemp.borrar.titulo": "Borrar empresa",
    "ajemp.borrar.desc": "Esta acción es permanente: se eliminará el perfil de tu empresa de RECO+ (incluyendo logo y fotos) y dejará de aparecer como aliado. Tu cuenta de usuario NO se elimina.",
    "ajemp.borrar.confirmarLabel": "Escribe {nombre} para confirmar",
    "ajemp.borrar.btn": "Borrar empresa",
    "ajemp.borrar.borrando": "Borrando...",

    "ajemp.status.guardando": "Guardando...",
    "ajemp.status.guardadoOk": "Guardado correctamente.",
    "ajemp.status.errorPermisos": "No se pudo guardar por un problema de permisos.",
    "ajemp.status.errorConexion": "No se pudo conectar. Revisa tu conexión a internet.",
    "ajemp.status.errorGenerico": "Ocurrió un error inesperado. Intenta de nuevo.",
    "ajemp.status.servicioNoDisponible": "Servicio no disponible.",

    "ajemp.tipo.centroReciclaje": "Centro de reciclaje",
    "ajemp.tipo.empresaRecicladora": "Empresa recicladora",
    "ajemp.tipo.puntoAcopio": "Punto de acopio",
    "ajemp.tipo.transportista": "Transportista de residuos",
    "ajemp.tipo.otro": "Otro",

    "ajemp.mat.plastico": "Plástico",
    "ajemp.mat.vidrio": "Vidrio",
    "ajemp.mat.metal": "Metal",
    "ajemp.mat.papel": "Papel",
    "ajemp.mat.carton": "Cartón",
    "ajemp.mat.libros": "Libros",
    "ajemp.mat.electronicos": "Electrónicos",
    "ajemp.mat.celulares": "Celulares",
    "ajemp.mat.baterias": "Baterías",
    "ajemp.mat.bombillos": "Bombillos",
    "ajemp.mat.ropa": "Ropa",
    "ajemp.mat.tela": "Tela",
    "ajemp.mat.cuero": "Cuero",
    "ajemp.mat.muebles": "Muebles",
    "ajemp.mat.juguetes": "Juguetes",
    "ajemp.mat.utilesescolares": "Útiles escolares",
    "ajemp.mat.tetrapak": "Tetra Pak",
    "ajemp.mat.aceite": "Aceite de cocina",

    "ajemp.serv.compraMateriales": "Compra de materiales reciclables",
    "ajemp.serv.recoleccionDomicilio": "Recolección a domicilio",
    "ajemp.serv.recoleccionEmpresarial": "Recolección empresarial",
    "ajemp.serv.transporteResiduos": "Transporte de residuos",
    "ajemp.serv.destruccionCertificada": "Destrucción certificada",
    "ajemp.serv.gestionElectronicos": "Gestión de residuos electrónicos",
    "ajemp.serv.asesoriaAmbiental": "Asesoría ambiental",
    "ajemp.serv.educacionAmbiental": "Educación ambiental",
    "ajemp.serv.ventaMateriales": "Venta de materiales reciclados",

    /* ════════════════════════════════════════════════
       AJUSTES: "Mi plan" (ajustes-plan.js) + suscripcion-planes.js
       ════════════════════════════════════════════════ */
    "ajplan.tab.miPlan": "Mi plan",
    "ajplan.cargando": "Cargando tu plan…",
    "ajplan.uso.label": "Escaneos con IA hoy",
    "ajplan.uso.ilimitado": "Ilimitado",
    "ajplan.planLabel": "Plan {nombre}",
    "ajplan.verCambiarBtn": "Ver y cambiar de plan",

    "planes.gratis.nombre": "Gratis",
    "planes.gratis.precioLabel": "Gratis",
    "planes.gratis.beneficio1": "10 escaneos con IA al día",
    "planes.gratis.beneficio2": "1 campaña activa a la vez",
    "planes.gratis.beneficio3": "Campañas de hasta 3 días de vigencia",
    "planes.basico.nombre": "Básico",
    "planes.basico.beneficio1": "50 escaneos con IA al día",
    "planes.basico.beneficio2": "Hasta 3 campañas activas a la vez",
    "planes.basico.beneficio3": "Campañas de hasta 7 días de vigencia",
    "planes.premium.nombre": "Premium",
    "planes.premium.beneficio1": "Escaneos con IA ilimitados",
    "planes.premium.beneficio2": "Campañas activas ilimitadas",
    "planes.premium.beneficio3": "Campañas de hasta 30 días de vigencia",
    "planes.premium.beneficio4": "Tu empresa aparece en Aliados destacados",
    "planes.limite.ilimitado": "Ilimitado",

    /* ════════════════════════════════════════════════
       RECICLAR: ventanitas de información de material
       (reciclar-material-info.js) — labels fijos + respaldo local
       ════════════════════════════════════════════════ */
    "rminfo.tipoObjeto": "Tipo de objeto:",
    "rminfo.materialesCompuestos": "Materiales que lo componen:",
    "rminfo.tiempoDescomposicion": "Tiempo de descomposición:",
    "rminfo.comoPrepararlo": "Cómo prepararlo",
    "rminfo.dondeLlevarlo": "Dónde llevarlo",
    "rminfo.queSeObtiene": "Qué se obtiene",
    "rminfo.tipsExtra": "Tips extra",
    "rminfo.impacto": "Impacto:",
    "rminfo.verEnMapa": "Ver puntos en el mapa",
    "rminfo.sabiasQue": "¿Sabías que…?",
    "rminfo.esReciclable": "✅ Esto se recicla.",
    "rminfo.puntoEspecial": "⚠️ Esto se recicla, pero necesita un punto especial.",
    "rminfo.sinCategoria": "Sin datos de categoría para este material todavía.",
    "rminfo.anterior": "Anterior",
    "rminfo.siguiente": "Siguiente",
    "rminfo.cerrar": "Cerrar",

    "rminfo.badge.reciclable": "Reciclable",
    "rminfo.badge.reutilizable": "Reutilizable",
    "rminfo.badge.puntoEspecial": "Requiere punto especial",
    "rminfo.badge.reciclableDonable": "Reciclable / Donable",

    "rminfo.lugar.recomendado": "Recomendado",
    "rminfo.lugar.alternativa": "Alternativa",
    "rminfo.lugar.mayorVolumen": "Mayor volumen",
    "rminfo.lugar.obligatorio": "Obligatorio",
    "rminfo.lugar.segunFabricante": "Según fabricante",
    "rminfo.lugar.temporales": "Temporales",
    "rminfo.lugar.siBuenEstado": "Si está en buen estado",
    "rminfo.lugar.ropaDaniada": "Ropa dañada o incompleta",
    "rminfo.lugar.mueblesDaniados": "Muebles dañados",
    "rminfo.lugar.muyDeteriorados": "Si están muy deteriorados",
    "rminfo.lugar.juguetesDaniados": "Juguetes dañados",
    "rminfo.lugar.retazosReparacion": "Retazos y reparación",

    "rminfo.mat.electronicos.badge": "Requiere punto especial",
    "rminfo.mat.electronicos.prep1": "Borra tus datos personales y haz respaldo antes de entregarlo.",
    "rminfo.mat.electronicos.prep2": "Retira baterías o pilas si el dispositivo lo permite.",
    "rminfo.mat.electronicos.prep3": "Entrégalo completo, sin desarmar ni retirar piezas internas.",
    "rminfo.mat.electronicos.lugar1": "Centros de acopio electrónico",
    "rminfo.mat.electronicos.lugar2": "Puntos de marcas participantes",
    "rminfo.mat.electronicos.lugar3": "Campañas municipales de e-waste",
    "rminfo.mat.electronicos.obt1": "Se recuperan metales como oro, cobre y aluminio.",
    "rminfo.mat.electronicos.obt2": "Se evita la filtración de componentes tóxicos al suelo.",
    "rminfo.mat.electronicos.obt3": "Partes reutilizables alargan la vida de otros equipos.",
    "rminfo.mat.electronicos.impacto": "Cada equipo evita contaminación por plomo y mercurio.",

    "rminfo.mat.celulares.badge": "Requiere punto especial",
    "rminfo.mat.celulares.prep1": "Haz respaldo de tus fotos y contactos, luego borra el equipo.",
    "rminfo.mat.celulares.prep2": "Retira la funda, chip SIM y tarjeta de memoria.",
    "rminfo.mat.celulares.prep3": "Si la batería está hinchada, no la manipules: entrégala así.",
    "rminfo.mat.celulares.lugar1": "Puntos de recolección de operadoras",
    "rminfo.mat.celulares.lugar2": "Centros de acopio electrónico",
    "rminfo.mat.celulares.obt1": "Se recuperan metales preciosos de la placa base.",
    "rminfo.mat.celulares.obt2": "Equipos funcionales pueden reacondicionarse y donarse.",
    "rminfo.mat.celulares.obt3": "Se evita que baterías dañadas terminen en rellenos sanitarios.",
    "rminfo.mat.celulares.impacto": "Un celular reciclado recupera hasta 30 materiales distintos.",

    "rminfo.mat.plastico.badge": "Reciclable",
    "rminfo.mat.plastico.prep1": "Enjuaga el envase para retirar restos de comida o líquido.",
    "rminfo.mat.plastico.prep2": "Retira tapas y etiquetas si son de un material distinto.",
    "rminfo.mat.plastico.prep3": "Aplástalo para ahorrar espacio, sin romperlo en pedazos pequeños.",
    "rminfo.mat.plastico.lugar1": "Contenedores de reciclaje municipal",
    "rminfo.mat.plastico.lugar2": "Centros de acopio de plásticos",
    "rminfo.mat.plastico.obt1": "Se transforma en fibra textil, mobiliario o nuevos envases.",
    "rminfo.mat.plastico.obt2": "Reduce la extracción de petróleo para plástico virgen.",
    "rminfo.mat.plastico.obt3": "Disminuye la cantidad de plástico que llega a ríos y mares.",
    "rminfo.mat.plastico.impacto": "Reciclar 1 kg de plástico ahorra cerca de 2 kg de CO₂.",

    "rminfo.mat.metal.badge": "Reciclable",
    "rminfo.mat.metal.prep1": "Enjuaga latas y envases metálicos para quitar residuos.",
    "rminfo.mat.metal.prep2": "Separa tapas de plástico o vidrio si vienen combinadas.",
    "rminfo.mat.metal.prep3": "No es necesario aplastar las latas, pero ayuda al transporte.",
    "rminfo.mat.metal.lugar1": "Contenedores de reciclaje municipal",
    "rminfo.mat.metal.lugar2": "Chatarrerías y centros de acopio metálico",
    "rminfo.mat.metal.obt1": "El metal se funde y reutiliza casi sin perder calidad.",
    "rminfo.mat.metal.obt2": "Ahorra energía frente a la extracción de metal nuevo.",
    "rminfo.mat.metal.obt3": "Reduce la minería y su impacto ambiental asociado.",
    "rminfo.mat.metal.impacto": "El aluminio reciclado usa hasta 95% menos energía que el nuevo.",

    "rminfo.mat.papel.badge": "Reciclable",
    "rminfo.mat.papel.prep1": "Mantenlo seco: el papel mojado no se puede reciclar.",
    "rminfo.mat.papel.prep2": "Retira clips, grapas y espirales metálicas.",
    "rminfo.mat.papel.prep3": "Separa el papel encerado o plastificado, que no aplica aquí.",
    "rminfo.mat.papel.lugar1": "Contenedores de reciclaje municipal",
    "rminfo.mat.papel.lugar2": "Centros de acopio de papel y cartón",
    "rminfo.mat.papel.obt1": "Se convierte en nuevo papel, cartón o empaques.",
    "rminfo.mat.papel.obt2": "Cada tonelada reciclada salva árboles de tala directa.",
    "rminfo.mat.papel.obt3": "Reduce el consumo de agua frente a producir papel virgen.",
    "rminfo.mat.papel.impacto": "Reciclar papel ahorra agua, energía y árboles en pie.",

    "rminfo.mat.vidrio.badge": "Reciclable",
    "rminfo.mat.vidrio.prep1": "Enjuaga el envase y retira tapas metálicas o plásticas.",
    "rminfo.mat.vidrio.prep2": "No es necesario quitar etiquetas de papel.",
    "rminfo.mat.vidrio.prep3": "Envuelve el vidrio roto para evitar accidentes al transportarlo.",
    "rminfo.mat.vidrio.lugar1": "Contenedores de reciclaje municipal",
    "rminfo.mat.vidrio.lugar2": "Centros de acopio de vidrio",
    "rminfo.mat.vidrio.obt1": "El vidrio se funde y reutiliza infinitas veces sin perder calidad.",
    "rminfo.mat.vidrio.obt2": "Se ahorra energía frente a fabricar vidrio desde materia prima.",
    "rminfo.mat.vidrio.obt3": "Se reduce la extracción de arena y otros minerales.",
    "rminfo.mat.vidrio.impacto": "El vidrio es 100% reciclable sin perder pureza ni calidad.",

    "rminfo.mat.ropa.badge": "Reciclable / Donable",
    "rminfo.mat.ropa.prep1": "Lava y seca la ropa antes de entregarla.",
    "rminfo.mat.ropa.prep2": "Separa piezas en buen estado (donación) de las dañadas (textil).",
    "rminfo.mat.ropa.prep3": "Junta pares de zapatos y accesorios para facilitar la entrega.",
    "rminfo.mat.ropa.lugar1": "Fundaciones y bancos de ropa",
    "rminfo.mat.ropa.lugar2": "Puntos de acopio textil",
    "rminfo.mat.ropa.obt1": "Prendas en buen estado ayudan directamente a otras familias.",
    "rminfo.mat.ropa.obt2": "La ropa dañada se transforma en trapos industriales o relleno.",
    "rminfo.mat.ropa.obt3": "Se reduce la demanda de fibras textiles nuevas.",
    "rminfo.mat.ropa.impacto": "Donar una prenda puede darle hasta 3 vidas útiles más.",

    "rminfo.mat.muebles.badge": "Reutilizable",
    "rminfo.mat.muebles.prep1": "Verifica que el mueble esté funcional o fácilmente reparable.",
    "rminfo.mat.muebles.prep2": "Límpialo y, si puedes, toma fotos para facilitar la donación.",
    "rminfo.mat.muebles.prep3": "Desarma piezas grandes solo si esto no daña la estructura.",
    "rminfo.mat.muebles.lugar1": "Fundaciones y bancos de muebles",
    "rminfo.mat.muebles.lugar2": "Puntos de acopio de madera y metal",
    "rminfo.mat.muebles.obt1": "Muebles reutilizables equipan hogares que los necesitan.",
    "rminfo.mat.muebles.obt2": "La madera y el metal se pueden separar y reciclar por tipo.",
    "rminfo.mat.muebles.obt3": "Se evita el volumen de relleno sanitario que ocupan los muebles.",
    "rminfo.mat.muebles.impacto": "Un mueble donado reduce directamente residuos voluminosos.",

    "rminfo.mat.libros.badge": "Reutilizable",
    "rminfo.mat.libros.prep1": "Verifica que estén completos y en buen estado de lectura.",
    "rminfo.mat.libros.prep2": "Retira separadores, notas adhesivas o material suelto.",
    "rminfo.mat.libros.prep3": "Agrúpalos por tema o nivel escolar si vas a donarlos.",
    "rminfo.mat.libros.lugar1": "Bibliotecas comunitarias y escuelas",
    "rminfo.mat.libros.lugar2": "Centros de acopio de papel",
    "rminfo.mat.libros.obt1": "Libros en buen estado llegan a nuevos lectores.",
    "rminfo.mat.libros.obt2": "Los que no se pueden reutilizar se reciclan como papel.",
    "rminfo.mat.libros.obt3": "Se fomenta el acceso a la lectura en comunidades con menos recursos.",
    "rminfo.mat.libros.impacto": "Un libro donado puede pasar por decenas de lectores más.",

    "rminfo.mat.juguetes.badge": "Reutilizable",
    "rminfo.mat.juguetes.prep1": "Límpialos y verifica que funcionen o estén completos.",
    "rminfo.mat.juguetes.prep2": "Junta piezas sueltas del mismo juguete en una bolsa.",
    "rminfo.mat.juguetes.prep3": "Retira pilas si el juguete las usa.",
    "rminfo.mat.juguetes.lugar1": "Fundaciones y campañas de juguetes",
    "rminfo.mat.juguetes.lugar2": "Centros de acopio según material",
    "rminfo.mat.juguetes.obt1": "Juguetes funcionales alegran a otros niños directamente.",
    "rminfo.mat.juguetes.obt2": "Piezas plásticas o metálicas pueden reciclarse por separado.",
    "rminfo.mat.juguetes.obt3": "Se reduce la producción de juguetes nuevos y su huella asociada.",
    "rminfo.mat.juguetes.impacto": "Donar juguetes reduce residuos y genera impacto social directo.",

    "rminfo.mat.baterias.badge": "Requiere punto especial",
    "rminfo.mat.baterias.prep1": "Nunca las tires a la basura común ni al reciclaje mixto.",
    "rminfo.mat.baterias.prep2": "Cubre los polos con cinta si están sueltas, para evitar cortocircuitos.",
    "rminfo.mat.baterias.prep3": "Si están hinchadas o dañadas, transpórtalas con cuidado extra.",
    "rminfo.mat.baterias.lugar1": "Puntos de acopio de baterías",
    "rminfo.mat.baterias.lugar2": "Tiendas de electrónica participantes",
    "rminfo.mat.baterias.obt1": "Se evita la contaminación de suelo y agua por metales pesados.",
    "rminfo.mat.baterias.obt2": "Se recuperan materiales como litio, níquel y cadmio.",
    "rminfo.mat.baterias.obt3": "Se previene el riesgo de incendios por descarte inadecuado.",
    "rminfo.mat.baterias.impacto": "Una sola batería mal desechada puede contaminar litros de agua.",

    "rminfo.mat.bombillos.badge": "Requiere punto especial",
    "rminfo.mat.bombillos.prep1": "Transpórtalos con cuidado para evitar que se rompan.",
    "rminfo.mat.bombillos.prep2": "Si es un bombillo ahorrador o fluorescente, no lo tires con la basura.",
    "rminfo.mat.bombillos.prep3": "Guárdalo en su empaque original si aún lo conservas.",
    "rminfo.mat.bombillos.lugar1": "Puntos de acopio de residuos especiales",
    "rminfo.mat.bombillos.lugar2": "Tiendas de iluminación participantes",
    "rminfo.mat.bombillos.obt1": "Se evita la liberación de mercurio en bombillos fluorescentes.",
    "rminfo.mat.bombillos.obt2": "Se recuperan vidrio y componentes metálicos internos.",
    "rminfo.mat.bombillos.obt3": "Se reduce el riesgo de contaminación en rellenos sanitarios.",
    "rminfo.mat.bombillos.impacto": "Los bombillos fluorescentes requieren manejo especial por su mercurio.",

    "rminfo.mat.carton.badge": "Reciclable",
    "rminfo.mat.carton.prep1": "Desarma o aplasta las cajas para ahorrar espacio.",
    "rminfo.mat.carton.prep2": "Retira cinta adhesiva, grapas y restos de plástico o poliestireno.",
    "rminfo.mat.carton.prep3": "Mantenlo seco: el cartón mojado o engrasado no se puede reciclar.",
    "rminfo.mat.carton.lugar1": "Contenedores de reciclaje municipal",
    "rminfo.mat.carton.lugar2": "Centros de acopio de papel y cartón",
    "rminfo.mat.carton.obt1": "Se convierte en nuevas cajas, empaques o papel reciclado.",
    "rminfo.mat.carton.obt2": "Cada tonelada reciclada reduce la tala de árboles.",
    "rminfo.mat.carton.obt3": "Disminuye el volumen de residuos que llega a los rellenos sanitarios.",
    "rminfo.mat.carton.impacto": "El cartón puede reciclarse hasta 7 veces antes de perder calidad.",
    "rminfo.mat.carton.tip1": "El cartón encerado (como el de pizza con grasa) no se recicla junto al cartón normal.",
    "rminfo.mat.carton.tip2": "Guarda las cajas planas: ocupan menos espacio y facilitan el transporte al punto de acopio.",

    "rminfo.mat.tetrapak.badge": "Reciclable",
    "rminfo.mat.tetrapak.prep1": "Enjuaga el envase para retirar restos de líquido.",
    "rminfo.mat.tetrapak.prep2": "Aplástalo para ahorrar espacio, sin necesidad de desarmarlo.",
    "rminfo.mat.tetrapak.prep3": "Si tiene tapa de plástico, puedes dejarla puesta o separarla según el punto de acopio.",
    "rminfo.mat.tetrapak.lugar1": "Contenedores de reciclaje municipal",
    "rminfo.mat.tetrapak.lugar2": "Centros de acopio especializados en Tetra Pak",
    "rminfo.mat.tetrapak.obt1": "Sus capas de cartón, plástico y aluminio se separan y reutilizan por separado.",
    "rminfo.mat.tetrapak.obt2": "Se transforma en láminas, techos ecológicos o nuevo papel.",
    "rminfo.mat.tetrapak.obt3": "Se reduce la cantidad de envases multicapa en rellenos sanitarios.",
    "rminfo.mat.tetrapak.impacto": "Un envase Tetra Pak combina 3 materiales que pueden recuperarse por separado.",
    "rminfo.mat.tetrapak.tip1": "No es necesario retirar el plástico interior: la planta de reciclaje se encarga de separarlo.",
    "rminfo.mat.tetrapak.tip2": "Evita aplastarlo demasiado si el punto de acopio pide entregarlo armado para facilitar el conteo.",

    "rminfo.mat.aceite.badge": "Requiere punto especial",
    "rminfo.mat.aceite.prep1": "Deja enfriar el aceite antes de manipularlo.",
    "rminfo.mat.aceite.prep2": "Viértelo en una botella plástica limpia y ciérrala bien; nunca lo tires por el drenaje.",
    "rminfo.mat.aceite.prep3": "Evita mezclarlo con agua u otros líquidos para facilitar su reciclaje.",
    "rminfo.mat.aceite.lugar1": "Puntos de acopio de aceite usado",
    "rminfo.mat.aceite.lugar2": "Restaurantes o negocios participantes",
    "rminfo.mat.aceite.obt1": "Se transforma en biodiesel u otros combustibles alternativos.",
    "rminfo.mat.aceite.obt2": "Se evita la contaminación de ríos, mares y sistemas de agua potable.",
    "rminfo.mat.aceite.obt3": "Se previene la obstrucción de tuberías y plantas de tratamiento.",
    "rminfo.mat.aceite.impacto": "Un litro de aceite mal desechado puede contaminar hasta 1,000 litros de agua.",
    "rminfo.mat.aceite.tip1": "Nunca lo mezcles con el aceite de motor u otros químicos: son procesos de reciclaje distintos.",
    "rminfo.mat.aceite.tip2": "Reutiliza el mismo envase varias veces antes de entregarlo, para acumular más cantidad de una vez.",

    "rminfo.mat.tela.badge": "Reciclable / Donable",
    "rminfo.mat.tela.prep1": "Lava y seca bien la tela antes de entregarla.",
    "rminfo.mat.tela.prep2": "Separa retazos limpios y en buen estado de los muy desgastados o manchados.",
    "rminfo.mat.tela.prep3": "Corta o dobla piezas grandes para facilitar el transporte.",
    "rminfo.mat.tela.lugar1": "Puntos de acopio textil",
    "rminfo.mat.tela.lugar2": "Talleres de costura o reciclaje textil",
    "rminfo.mat.tela.obt1": "Se transforma en trapos industriales, relleno o nuevas fibras.",
    "rminfo.mat.tela.obt2": "Retazos en buen estado pueden reutilizarse en manualidades o costura.",
    "rminfo.mat.tela.obt3": "Se reduce la demanda de fibras textiles nuevas.",
    "rminfo.mat.tela.impacto": "Reciclar textiles evita que terminen ocupando espacio en rellenos sanitarios.",
    "rminfo.mat.tela.tip1": "Los retazos pequeños también sirven: no los deseches solo por no ser prendas completas.",
    "rminfo.mat.tela.tip2": "Separa telas sintéticas (poliester, nylon) de las naturales (algodón, lino) si el punto de acopio lo pide.",

    "rminfo.mat.cuero.badge": "Reutilizable",
    "rminfo.mat.cuero.prep1": "Limpia el cuero y verifica que no tenga hongos ni mal olor.",
    "rminfo.mat.cuero.prep2": "Separa piezas grandes (zapatos, carteras, cinturones) de los retazos pequeños.",
    "rminfo.mat.cuero.prep3": "Evita mojarlo antes de entregarlo, ya que puede dañar el material.",
    "rminfo.mat.cuero.lugar1": "Fundaciones y bancos de ropa",
    "rminfo.mat.cuero.lugar2": "Talleres de marroquinería o zapaterías",
    "rminfo.mat.cuero.obt1": "Artículos en buen estado pueden reutilizarse directamente.",
    "rminfo.mat.cuero.obt2": "Los retazos se aprovechan en talleres para reparaciones o piezas nuevas.",
    "rminfo.mat.cuero.obt3": "Se reduce la demanda de cuero nuevo y su proceso de curtido.",
    "rminfo.mat.cuero.impacto": "El curtido de cuero nuevo consume grandes cantidades de agua y químicos.",
    "rminfo.mat.cuero.tip1": "Aplica una capa de acondicionador antes de guardarlo si no lo donas de inmediato, para evitar que se reseque.",
    "rminfo.mat.cuero.tip2": "El cuero sintético (cuerina) no se procesa igual que el cuero real: sepáralos si sabes cuál es cuál.",

    "rminfo.mat.utilesescolares.badge": "Reutilizable",
    "rminfo.mat.utilesescolares.prep1": "Verifica que cuadernos, lápices y colores estén en buen estado o con uso restante.",
    "rminfo.mat.utilesescolares.prep2": "Agrupa por tipo: escritura, dibujo, geometría, mochilas.",
    "rminfo.mat.utilesescolares.prep3": "Limpia estuches y mochilas antes de donarlos.",
    "rminfo.mat.utilesescolares.lugar1": "Escuelas y bibliotecas comunitarias",
    "rminfo.mat.utilesescolares.lugar2": "Fundaciones educativas",
    "rminfo.mat.utilesescolares.obt1": "Útiles en buen estado llegan directamente a estudiantes que los necesitan.",
    "rminfo.mat.utilesescolares.obt2": "Se reduce el desperdicio de materiales escolares aún funcionales.",
    "rminfo.mat.utilesescolares.obt3": "Se facilita el acceso a la educación en comunidades con menos recursos.",
    "rminfo.mat.utilesescolares.impacto": "Donar útiles escolares reduce directamente la barrera económica de estudiar.",
    "rminfo.mat.utilesescolares.tip1": "Los lápices y colores usados a la mitad también sirven: no necesitan estar nuevos.",
    "rminfo.mat.utilesescolares.tip2": "Revisa que marcadores y borradores aún funcionen antes de incluirlos en la donación.",

    /* ════════════════════════════════════════════════
       RECICLAR: botón "Verificar con IA" (reciclar-scanner.js)
       ════════════════════════════════════════════════ */
    "rscan.ia.btnDefault": "✨ Verificar con IA (más preciso)",
    "rscan.ia.verificandoCuota": "Verificando tu cuota…",
    "rscan.ia.limiteAlcanzado": "Límite diario alcanzado",
    "rscan.ia.limiteTitulo": "Alcanzaste tu límite diario de escaneos con IA",
    "rscan.ia.limiteDesc": "Tu plan {plan} incluye {limite} escaneos con IA al día. Mejora tu plan para escanear sin límites.",
    "rscan.ia.verPlanesBtn": "Ver planes →",
    "rscan.ia.consultando": "Consultando IA…",
    "rscan.ia.consultandoDesc": "Consultando el escaneo preciso con IA…",
    "rscan.ia.detecto": "Escaneo preciso (IA) detectó",
    "rscan.ia.confianzaAlta": "Confianza alta",
    "rscan.ia.confianzaMedia": "Confianza media",
    "rscan.ia.confianzaBaja": "Confianza baja",
    "rscan.ia.confianzaGenerica": "IA",
    "rscan.ia.tampocoIdentifico": "La IA tampoco pudo identificarlo con seguridad",
    "rscan.ia.sugerenciaOtraFoto": "Prueba con más luz o un encuadre más cercano, o elige el material manualmente arriba.",
    "rscan.ia.noSePudoConsultar": "No se pudo consultar el escaneo preciso",
    "rscan.ia.intentaDeNuevo": "Intenta de nuevo en unos segundos.",

    /* ════════════════════════════════════════════════
       DONAR: mapeo de categorías guardadas en Supabase
       (donar-listings.js, donaciones-listado.js)
       ════════════════════════════════════════════════ */
    "donar.cat.ropaCalzado": "Ropa y calzado",
    "donar.cat.electronicos": "Electrónicos",
    "donar.cat.muebles": "Muebles",
    "donar.cat.librosUtiles": "Libros y útiles",
    "donar.cat.juguetes": "Juguetes",
    "donar.cat.alimentosNoPerecederos": "Alimentos no perecederos",
    "donar.cat.alimentos": "Alimentos",
    "donar.cat.materialEscolar": "Material escolar",
    "donar.cat.higiene": "Productos de higiene",
    "donar.cat.medicinas": "Medicinas no vencidas",
    "donar.cat.otro": "Otro",

    /* ════════════════════════════════════════════════
       ALIANZAS: aliados destacados (alianzas-destacados.js)
       ════════════════════════════════════════════════ */
    "alid.destacado": "Aliado destacado 🌳",
    "alid.aliadoRecoPlus": "Aliado RECO+",
    "alid.vacio.titulo": "Todavía no hay aliados con plan Premium",
    "alid.vacio.desc": "Las empresas con plan Premium aparecen aquí, destacadas ante toda la comunidad de RECO+.",
    "alid.vacio.btn": "Conocer el plan Premium →",
    "alid.cerrar": "Cerrar",

    /* ════════════════════════════════════════════════════
       LEGAL: Términos y Condiciones (terminos.html)
       ════════════════════════════════════════════════════ */
    "legal.eyebrow": "Legal",
    "legal.terminos.h1": "Términos y Condiciones",
    "legal.terminos.updated": "Última actualización: 16 de agosto de 2026",
    "legal.terminos.intro": "Estas condiciones regulan el uso de la plataforma RECO+ (sitio web, escáner de materiales, mapa, donaciones, alianzas empresariales y demás funciones). Al crear una cuenta o usar RECO+ aceptas estos términos.",

    "legal.terminos.toc.titulo": "Contenido",
    "legal.terminos.toc.1": "1. Aceptación de los términos",
    "legal.terminos.toc.2": "2. Quiénes somos",
    "legal.terminos.toc.3": "3. Descripción del servicio",
    "legal.terminos.toc.4": "4. Registro y cuentas",
    "legal.terminos.toc.5": "5. Cuentas de empresa / aliado",
    "legal.terminos.toc.6": "6. Escáner de materiales con IA",
    "legal.terminos.toc.7": "7. Contenido generado por usuarios",
    "legal.terminos.toc.8": "8. Propiedad intelectual",
    "legal.terminos.toc.9": "9. Planes y suscripciones",
    "legal.terminos.toc.10": "10. Conductas prohibidas",
    "legal.terminos.toc.11": "11. Limitación de responsabilidad",
    "legal.terminos.toc.12": "12. Suspensión y terminación",
    "legal.terminos.toc.13": "13. Modificaciones",
    "legal.terminos.toc.14": "14. Ley aplicable",
    "legal.terminos.toc.15": "15. Contacto",

    "legal.terminos.aviso": "<strong>Aviso:</strong> este documento es una versión base preparada para RECO+ y no constituye asesoría legal. Antes de publicarlo de forma definitiva, te recomendamos que un abogado en Panamá lo revise y lo adapte a la situación real de la empresa.",

    "legal.terminos.s1.h2": "Aceptación de los términos",
    "legal.terminos.s1.p1": "Estos Términos y Condiciones (\"Términos\") constituyen un acuerdo legal entre la persona usuaria (\"tú\", \"usuario\") y RECO+ (\"RECO+\", \"nosotros\"), y regulan el acceso y uso del sitio web, aplicación y demás servicios ofrecidos bajo la marca RECO+ (en conjunto, la \"Plataforma\").",
    "legal.terminos.s1.p2": "Al registrarte, acceder o usar la Plataforma, confirmas que has leído, entendido y aceptado estos Términos, así como nuestra <a href=\"privacidad.html\">Política de Privacidad</a>. Si no estás de acuerdo con alguna parte de estos Términos, no debes usar la Plataforma.",

    "legal.terminos.s2.h2": "Quiénes somos",
    "legal.terminos.s2.p1": "RECO+ es una plataforma comunitaria de reciclaje y donación que opera desde Panamá, con el objetivo de conectar a personas y empresas para facilitar el reciclaje, la donación de artículos y la educación ambiental.",
    "legal.terminos.s2.p2": "Para cualquier consulta relacionada con estos Términos puedes escribirnos a <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>.",

    "legal.terminos.s3.h2": "Descripción del servicio",
    "legal.terminos.s3.p1": "RECO+ ofrece, entre otras, las siguientes funciones:",
    "legal.terminos.s3.li1": "<strong>Mapa de puntos de reciclaje y donación:</strong> ubicaciones sugeridas por la propia comunidad y por aliados.",
    "legal.terminos.s3.li2": "<strong>Escáner de materiales con inteligencia artificial:</strong> identifica el tipo de material a partir de una foto y sugiere cómo reciclarlo.",
    "legal.terminos.s3.li3": "<strong>Donaciones y solicitudes de ayuda:</strong> publicación de artículos para donar y solicitudes de ayuda entre usuarios.",
    "legal.terminos.s3.li4": "<strong>Alianzas empresariales:</strong> registro de empresas y organizaciones aliadas que colaboran con la comunidad.",
    "legal.terminos.s3.li5": "<strong>Guía educativa y videos de la comunidad:</strong> contenido informativo sobre reciclaje y sostenibilidad, incluyendo videos que suben las propias personas usuarias.",
    "legal.terminos.s3.li6": "<strong>Planes de suscripción:</strong> niveles Gratis, Básico y Premium con distintas funciones (ver sección 9).",
    "legal.terminos.s3.p2": "RECO+ puede agregar, modificar o retirar funciones de la Plataforma en cualquier momento, sin que ello genere derecho a compensación alguna.",

    "legal.terminos.s4.h2": "Registro y cuentas de usuario",
    "legal.terminos.s4.p1": "Para usar ciertas funciones de RECO+ debes crear una cuenta mediante correo y contraseña, o iniciando sesión con tu cuenta de Google o Apple.",
    "legal.terminos.s4.li1": "Debes proporcionar información veraz y mantenerla actualizada.",
    "legal.terminos.s4.li2": "Eres responsable de la confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta.",
    "legal.terminos.s4.li3": "El uso de la Plataforma está dirigido a personas mayores de 18 años. Si eres menor de edad, necesitas la supervisión y autorización de un padre, madre o tutor legal.",
    "legal.terminos.s4.li4": "Debes notificarnos de inmediato si detectas un uso no autorizado de tu cuenta.",

    "legal.terminos.s5.h2": "Cuentas de empresa / aliado",
    "legal.terminos.s5.p1": "Las empresas u organizaciones que deseen registrarse como aliadas deben completar el proceso de registro disponible en la sección de Alianzas, que incluye la creación de una cuenta, la carga de información y material gráfico (logo, fotos) y la aceptación de estos Términos en nombre de la empresa.",
    "legal.terminos.s5.p2": "RECO+ puede verificar, aprobar, solicitar información adicional o rechazar el registro de una empresa a su criterio, especialmente cuando la información proporcionada sea incompleta, inexacta o contraria a estos Términos.",

    "legal.terminos.s6.h2": "Escáner de materiales con inteligencia artificial",
    "legal.terminos.s6.p1": "El escáner de materiales utiliza modelos de inteligencia artificial para analizar imágenes y sugerir el tipo de material y su forma de reciclaje o disposición.",
    "legal.terminos.s6.callout": "Los resultados del escáner son <strong>orientativos</strong> y pueden contener errores. RECO+ no garantiza la exactitud de la clasificación y no se hace responsable por decisiones tomadas exclusivamente con base en el resultado del escáner. Ante dudas sobre materiales peligrosos, especiales o de manejo delicado, consulta siempre a la autoridad o centro de acopio correspondiente.",

    "legal.terminos.s7.h2": "Contenido generado por usuarios",
    "legal.terminos.s7.p1": "RECO+ permite publicar contenido generado por la comunidad, incluyendo puntos de reciclaje sugeridos, publicaciones de donación, comentarios y videos.",
    "legal.terminos.s7.li1": "Eres responsable del contenido que publicas y garantizas que tienes derecho a compartirlo.",
    "legal.terminos.s7.li2": "No está permitido publicar contenido falso, engañoso, ofensivo, discriminatorio, violento o que infrinja derechos de terceros.",
    "legal.terminos.s7.li3": "Los videos subidos a la Plataforma pasan por un proceso de moderación, que puede incluir revisión automática mediante inteligencia artificial y, en los casos que lo requieran, revisión manual antes de su publicación definitiva.",
    "legal.terminos.s7.li4": "RECO+ puede eliminar, ocultar o rechazar cualquier contenido que incumpla estos Términos, sin previo aviso.",

    "legal.terminos.s8.h2": "Propiedad intelectual",
    "legal.terminos.s8.p1": "La marca RECO+, el diseño, los textos, gráficos y el software de la Plataforma son propiedad de RECO+ o de sus licenciantes, y están protegidos por las leyes de propiedad intelectual aplicables.",
    "legal.terminos.s8.p2": "El contenido que tú publicas sigue siendo tuyo; al subirlo a RECO+ nos otorgas una licencia no exclusiva, mundial y gratuita para almacenarlo, mostrarlo y distribuirlo dentro de la Plataforma con el fin de operar el servicio.",

    "legal.terminos.s9.h2": "Planes y suscripciones",
    "legal.terminos.s9.p1": "RECO+ ofrece distintos niveles de plan (Gratis, Básico y Premium) con diferentes funciones y límites de uso.",
    "legal.terminos.s9.callout": "<strong>Aviso:</strong> actualmente el proceso de pago de los planes de suscripción es una <strong>simulación (modo demo)</strong> y no procesa cobros reales. Cuando RECO+ habilite pagos reales, esta sección se actualizará para describir el proveedor de pagos, condiciones de facturación, renovación y cancelación.",

    "legal.terminos.s10.h2": "Conductas prohibidas",
    "legal.terminos.s10.p1": "Al usar RECO+ te comprometes a no:",
    "legal.terminos.s10.li1": "Suplantar la identidad de otra persona o empresa.",
    "legal.terminos.s10.li2": "Publicar contenido ilegal, fraudulento o que promueva actividades peligrosas.",
    "legal.terminos.s10.li3": "Intentar vulnerar la seguridad de la Plataforma, sus cuentas o su infraestructura.",
    "legal.terminos.s10.li4": "Usar la Plataforma para enviar spam, contenido malicioso o publicidad no autorizada.",
    "legal.terminos.s10.li5": "Extraer datos de la Plataforma de forma automatizada (scraping) sin autorización expresa.",

    "legal.terminos.s11.h2": "Limitación de responsabilidad",
    "legal.terminos.s11.p1": "RECO+ actúa como intermediario que conecta a personas, comunidades y empresas en torno al reciclaje y la donación. No somos parte de las transacciones, entregas o acuerdos que se realicen entre usuarios, ni garantizamos la disponibilidad, calidad, seguridad o legalidad de los puntos de reciclaje, donaciones o publicaciones de terceros.",
    "legal.terminos.s11.p2": "En la medida permitida por la ley, RECO+ no será responsable por daños indirectos, incidentales o derivados del uso de la Plataforma, incluyendo pérdidas resultantes de interacciones entre usuarios o de la información proporcionada por el escáner con IA.",

    "legal.terminos.s12.h2": "Suspensión y terminación de cuentas",
    "legal.terminos.s12.p1": "Podemos suspender o cancelar tu cuenta si incumples estos Términos, si detectamos actividad fraudulenta, o si es necesario para proteger a la comunidad o a la Plataforma.",
    "legal.terminos.s12.p2": "Puedes solicitar la eliminación de tu cuenta en cualquier momento escribiéndonos a <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>.",

    "legal.terminos.s13.h2": "Modificaciones a estos Términos",
    "legal.terminos.s13.p1": "Podemos actualizar estos Términos periódicamente. Publicaremos la versión vigente en esta página junto con la fecha de última actualización. El uso continuado de la Plataforma después de una modificación implica la aceptación de los nuevos Términos.",

    "legal.terminos.s14.h2": "Ley aplicable y jurisdicción",
    "legal.terminos.s14.p1": "Estos Términos se rigen por las leyes de la República de Panamá. Cualquier controversia relacionada con estos Términos se someterá a los tribunales competentes de Panamá, salvo que la ley aplicable disponga algo distinto.",

    "legal.terminos.s15.h2": "Contacto",
    "legal.terminos.s15.p1": "Si tienes preguntas sobre estos Términos, escríbenos a:",
    "legal.terminos.s15.li1": "Correo: <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>",
    "legal.terminos.s15.li2": "Teléfono / WhatsApp: +507 6399-1249",
    "legal.terminos.s15.li3": "Ubicación: David, Panamá",

    /* ════════════════════════════════════════════════════
       LEGAL: Política de Privacidad (privacidad.html)
       ════════════════════════════════════════════════════ */
    "legal.privacidad.h1": "Política de Privacidad",
    "legal.privacidad.updated": "Última actualización: 16 de agosto de 2026",
    "legal.privacidad.intro": "Esta política explica qué datos personales recopila RECO+, para qué los usamos, con quién los compartimos y qué derechos tienes sobre ellos.",

    "legal.privacidad.toc.titulo": "Contenido",
    "legal.privacidad.toc.1": "1. Responsable del tratamiento",
    "legal.privacidad.toc.2": "2. Alcance y estándares que seguimos",
    "legal.privacidad.toc.3": "3. Datos que recopilamos",
    "legal.privacidad.toc.4": "4. Cómo usamos tus datos",
    "legal.privacidad.toc.5": "5. Con quién compartimos datos",
    "legal.privacidad.toc.6": "6. Almacenamiento y seguridad",
    "legal.privacidad.toc.7": "7. Tus derechos",
    "legal.privacidad.toc.8": "8. Cookies y almacenamiento local",
    "legal.privacidad.toc.9": "9. Menores de edad",
    "legal.privacidad.toc.10": "10. Transferencias internacionales",
    "legal.privacidad.toc.11": "11. Cambios a esta política",
    "legal.privacidad.toc.12": "12. Contacto",

    "legal.privacidad.aviso": "<strong>Aviso:</strong> este documento es una versión base preparada para RECO+ y no constituye asesoría legal. Antes de publicarlo de forma definitiva, te recomendamos que un abogado revise su contenido y lo adapte a la operación real de la plataforma.",

    "legal.privacidad.s1.h2": "Responsable del tratamiento",
    "legal.privacidad.s1.p1": "El responsable del tratamiento de los datos personales recopilados a través de la Plataforma es RECO+, con operación en Panamá.",
    "legal.privacidad.s1.p2": "Para cualquier consulta sobre esta política o el tratamiento de tus datos, puedes escribir a <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>.",

    "legal.privacidad.s2.h2": "Alcance y estándares que seguimos",
    "legal.privacidad.s2.p1": "RECO+ opera principalmente en Panamá. Como estándar de protección de datos, aplicamos los principios del <strong>Reglamento General de Protección de Datos (RGPD)</strong> de la Unión Europea —licitud, minimización de datos, limitación de la finalidad, transparencia y respeto a los derechos de las personas usuarias— además de las disposiciones de protección de datos personales vigentes en Panamá.",
    "legal.privacidad.s2.p2": "Esto significa que, sin importar desde dónde accedas a RECO+, procuramos tratar tus datos personales bajo estos mismos estándares de protección.",

    "legal.privacidad.s3.h2": "Datos que recopilamos",
    "legal.privacidad.s3.li1": "<strong>Datos de registro:</strong> nombre, correo electrónico y contraseña (cifrada), o los datos básicos de perfil que compartes al iniciar sesión con Google o Apple.",
    "legal.privacidad.s3.li2": "<strong>Datos de perfil:</strong> foto o avatar, y, si registras una empresa aliada, el nombre, logo, fotos y demás información de la empresa.",
    "legal.privacidad.s3.li3": "<strong>Contenido que publicas:</strong> puntos de reciclaje sugeridos, publicaciones de donación, comentarios y videos que subas a la Plataforma.",
    "legal.privacidad.s3.li4": "<strong>Imágenes del escáner:</strong> fotos que tomas para identificar materiales con el escáner de IA.",
    "legal.privacidad.s3.li5": "<strong>Datos de ubicación:</strong> si lo autorizas, tu ubicación aproximada para mostrarte puntos de reciclaje o donación cercanos en el mapa.",
    "legal.privacidad.s3.li6": "<strong>Datos de uso:</strong> información técnica básica sobre cómo usas la Plataforma (por ejemplo, páginas visitadas), con fines de funcionamiento y mejora del servicio.",

    "legal.privacidad.s4.h2": "Cómo usamos tus datos",
    "legal.privacidad.s4.p1": "Usamos tus datos personales para:",
    "legal.privacidad.s4.li1": "Crear y administrar tu cuenta, y permitirte iniciar sesión.",
    "legal.privacidad.s4.li2": "Mostrarte el mapa de puntos de reciclaje/donación y resultados personalizados.",
    "legal.privacidad.s4.li3": "Procesar las imágenes del escáner y clasificar el material mediante inteligencia artificial.",
    "legal.privacidad.s4.li4": "Moderar el contenido publicado (incluida la moderación automática de videos) para mantener la Plataforma segura.",
    "legal.privacidad.s4.li5": "Gestionar el registro y la verificación de empresas aliadas.",
    "legal.privacidad.s4.li6": "Enviarte notificaciones relacionadas con tu actividad en la Plataforma.",
    "legal.privacidad.s4.li7": "Responder tus consultas de soporte o contacto.",
    "legal.privacidad.s4.li8": "Cumplir obligaciones legales cuando corresponda.",

    "legal.privacidad.s5.h2": "Con quién compartimos datos",
    "legal.privacidad.s5.p1": "RECO+ se apoya en proveedores externos para operar la Plataforma. Estos proveedores procesan datos en nuestro nombre y bajo nuestras instrucciones:",
    "legal.privacidad.s5.li1": "<strong>Supabase:</strong> almacenamiento de la base de datos, autenticación y archivos (imágenes, logos, videos).",
    "legal.privacidad.s5.li2": "<strong>Google y Apple:</strong> proveedores de inicio de sesión (OAuth), si eliges registrarte con estas cuentas.",
    "legal.privacidad.s5.li3": "<strong>Proveedores de inteligencia artificial (Gemini):</strong> procesamiento de imágenes para el escáner de materiales y para la moderación automática de videos.",
    "legal.privacidad.s5.li4": "<strong>Vercel:</strong> alojamiento de las funciones del servidor (por ejemplo, el escáner y la moderación de videos).",
    "legal.privacidad.s5.p2": "No vendemos tus datos personales a terceros. Solo compartimos datos con estos proveedores en la medida necesaria para operar la Plataforma, o cuando la ley nos lo exija.",

    "legal.privacidad.s6.h2": "Almacenamiento y seguridad",
    "legal.privacidad.s6.p1": "Tus datos se almacenan en la base de datos e infraestructura de almacenamiento de Supabase, con reglas de acceso (Row Level Security) que limitan qué información puede leerse o modificarse según el tipo de usuario.",
    "legal.privacidad.s6.p2": "Aunque aplicamos medidas razonables de seguridad, ningún sistema es 100% infalible. Si detectamos un incidente de seguridad que afecte tus datos, te lo notificaremos conforme a la normativa aplicable.",

    "legal.privacidad.s7.h2": "Tus derechos",
    "legal.privacidad.s7.p1": "Sobre tus datos personales, puedes ejercer los siguientes derechos, alineados con los principios del RGPD:",
    "legal.privacidad.s7.li1": "<strong>Acceso:</strong> saber qué datos tenemos sobre ti.",
    "legal.privacidad.s7.li2": "<strong>Rectificación:</strong> corregir datos inexactos o incompletos.",
    "legal.privacidad.s7.li3": "<strong>Supresión:</strong> solicitar la eliminación de tu cuenta y tus datos.",
    "legal.privacidad.s7.li4": "<strong>Oposición y limitación:</strong> oponerte a ciertos usos de tus datos o solicitar que limitemos su tratamiento.",
    "legal.privacidad.s7.li5": "<strong>Portabilidad:</strong> solicitar una copia de tus datos en un formato estructurado.",
    "legal.privacidad.s7.p2": "Para ejercer cualquiera de estos derechos, escríbenos a <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>. Responderemos en un plazo razonable.",

    "legal.privacidad.s8.h2": "Cookies y almacenamiento local",
    "legal.privacidad.s8.p1": "RECO+ utiliza almacenamiento local del navegador (localStorage) para recordar preferencias como el idioma o el modo claro/oscuro, y para mantener tu sesión iniciada.",
    "legal.privacidad.s8.p2": "Como la Plataforma se sirve desde dos dominios distintos (GitHub Pages y Vercel), usamos un mecanismo de \"puente de sesión\" que transfiere de forma segura los datos de tu sesión al cambiar de dominio, ya que el almacenamiento local no se comparte automáticamente entre dominios diferentes.",

    "legal.privacidad.s9.h2": "Menores de edad",
    "legal.privacidad.s9.p1": "RECO+ está dirigido a personas mayores de 18 años. No recopilamos intencionalmente datos de menores de edad sin el consentimiento de un padre, madre o tutor legal. Si tienes conocimiento de que un menor nos ha proporcionado datos personales sin dicho consentimiento, contáctanos para eliminarlos.",

    "legal.privacidad.s10.h2": "Transferencias internacionales de datos",
    "legal.privacidad.s10.p1": "Algunos de nuestros proveedores (Supabase, Google, Apple, Vercel y los servicios de inteligencia artificial que usamos) pueden procesar datos en servidores ubicados fuera de Panamá. En esos casos, procuramos que dichos proveedores mantengan estándares de protección de datos adecuados, en línea con los principios descritos en la sección 2.",

    "legal.privacidad.s11.h2": "Cambios a esta política",
    "legal.privacidad.s11.p1": "Podemos actualizar esta Política de Privacidad periódicamente. Publicaremos la versión vigente en esta página junto con la fecha de última actualización.",

    "legal.privacidad.s12.h2": "Contacto",
    "legal.privacidad.s12.p1": "Si tienes preguntas sobre esta Política de Privacidad o el tratamiento de tus datos, escríbenos a:",
    "legal.privacidad.s12.li1": "Correo: <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>",
    "legal.privacidad.s12.li2": "Teléfono / WhatsApp: +507 6399-1249",
    "legal.privacidad.s12.li3": "Ubicación: David, Panamá",
  },

  en: {
    /* ── NAV ── */
    "nav.inicio":   "Home",
    "nav.reciclar": "Recycle",
    "nav.mapa":     "Map",
    "nav.guia":     "Guide",
    "nav.donar":    "Donate / Help",
    "nav.blog":     "Blog",
    "nav.alianzas": "Alliances",
    "nav.contacto": "Contact",
    "nav.scanner":  "Scanner",
    "nav.unete":    "Join",
    "nav.ajustes":      "Settings",
    "nav.otraCuenta":   "Sign in with another account",
    "nav.cerrarSesion": "Log out",
    "nav.darkmode.toggle": "Switch light/dark mode",
    "nav.lang.toggle":     "Change language",
    "nav.accesoRapido":   "Quick access",
    "nav.carousel.anterior":  "Previous",
    "nav.carousel.siguiente": "Next",
    "nav.cerrarVentana":  "Close window",
    "nav.cerrar":         "Close",

    /* ── NOTIFICATIONS ── */
    "notif.titulo":        "Notifications",
    "notif.marcarTodas":   "Mark all as read",
    "notif.vacio":         "You don't have any notifications yet.",
    "notif.tiempo.ahora":  "Now",
    "notif.tiempo.min":    "m",
    "notif.tiempo.hr":     "h",
    "notif.tiempo.dia":    "d",
    "notif.tiempo.semana": "w",
    "notif.tiempo.mes":    "mo",

    /* ── NAV: descripciones (tooltip al pasar el cursor) ── */
    "nav.inicio.desc":   "Back to the home page.",
    "nav.reciclar.desc": "Recycling centers near you.",
    "nav.donar.desc":    "Share what you no longer use and change lives.",
    "nav.guia.desc":     "Learn step by step how to recycle and donate.",
    "nav.contacto.desc": "Write to us, we reply in under 24h.",
    "nav.blog.desc":     "Stories, tips and news about sustainability.",
    "nav.mapa.desc":     "Explore the recycling and donation map.",
    "nav.alianzas.desc": "Companies driving the change.",
    "nav.scanner.desc":  "Instantly identify the material with AI.",

    /* ── HERO ── */
    "hero.title":       "Connect, recycle<br>and transform",
    "hero.subtitle":    "Find recycling points, donate what you no longer use and help build a better world.",
    "hero.placeholder": "What do you want to recycle or donate?",
    "hero.search":      "Search",
    "hero.mapa":        "Explore Map |",
    "hero.donar":       "Donate now |",
    "hero.tienda":      "Go to store |",
    "hero.alianzas":    "See alliances",
    "hero.mapa.desc":     "Recycling centers near you.",
    "hero.alianzas.desc": "Companies driving the change.",
    "hero.tienda.desc":   "Redeem your points for rewards.",
    "hero.scanner":       "AI Scanner",
    "hero.scanner.desc":  "Instantly identify the material.",

    /* ── DATOS CURIOSOS ── */
    "curiosidades.title": "Fun facts about recycling",
    "curiosidad.1": "A plastic bottle can take up to <strong>450 years</strong> to decompose.",
    "curiosidad.2": "Recycling 1 ton of paper saves approximately <strong>17 trees</strong>.",
    "curiosidad.3": "Recycling aluminum saves up to <strong>95% of the energy</strong>.",
    "curiosidad.4": "Every ton of recycled plastic prevents the pollution of <strong>1,000 m³</strong> of water.",
    "curiosidad.5": "If we recycle more, we can cut greenhouse gas emissions by up to <strong>30%</strong>.",

    /* ── ACCIONES ── */
    /* ── RECYCLE / DONATE BANNER ── */
    "rd.reciclar.title": "Recycle",
    "rd.reciclar.desc":  "Sort your waste and take it to recycling points.",
    "rd.donar.title":    "Donate",
    "rd.donar.desc":     "Share what you no longer use and change lives.",
    "rd.saberMas":       "Learn more →",

    "acciones.title":       "What can you do?",
    "card1.title":          "Find spots",
    "card1.desc":           "Locate recycling <br> centers <br> near you.",
    "card1.cta":            "See map →",
    "card2.title":          "Donate",
    "card2.desc":           "Donate objects you no longer use <br> and help those who need <br> it most.",
    "card2.cta":            "Learn more →",
    "card2.scroll.libros":       "📚 Books",
    "card2.scroll.electronicos": "🖥️ Electronics",
    "card2.scroll.muebles":      "🪑 Furniture",
    "card2.scroll.juguetes":     "🧸 Toys",
    "card2.scroll.ropa":         "👗 Clothes",
    "card3.title":          "Request help",
    "card3.desc":           "Ask for what you need <br>or post a request<br> to your community.",
    "card3.cta":            "Learn more →",
    "card4.title":          "Practical guide",
    "card4.desc":           "Learn step by step how to recycle, donate and earn benefits.",
    "card4.step1":          "Find spots",
    "card4.step2":          "Donate or recycle",
    "card4.step3":          "Earn benefits",
    "card4.cta":            "See guide →",
    "card5.title":          "Alliances",
    "card5.desc":           "Companies and organizations driving change alongside RECO+.",
    "card5.cta":            "See alliances →",
    "card6.title":          "Contact us",
    "card6.desc":           "We're here to help. Write to us and we'll reply within 24h.",
    "card6.cta":            "Write to us →",
    "card7.title":          "Blog",
    "card7.desc":           "Stories, tips and news about recycling, sustainability and community.",
    "card7.tag1":           "♻️ Recycling",
    "card7.tag2":           "🌍 Sustainability",
    "card7.tag3":           "💚 Community",
    "card7.tag4":           "🔋 Technology",
    "card7.tag5":           "🌱 Impact",
    "card7.cta":            "Read blog →",

    "acc.aria.map":        "Find recycling points",
    "acc.aria.donate":     "Donate items",
    "acc.aria.help":       "Request help from the community",
    "acc.aria.guide":      "Explore the recycling guide",
    "acc.aria.allies":     "See alliances and companies",
    "acc.aria.contact":    "Go to the contact page",
    "acc.aria.blog":       "Explore the RECO+ blog",

    /* ── STATS ── */
    "stats.personas":   "Active people",
    "stats.puntos":     "Recycling points",
    "stats.toneladas":  "Tonnes recycled",
    "stats.comunidades":"Communities",

    /* ── TIENDA ── */
    "tienda.title":       "RECOTech Store",
    "tienda.subtitle":    "Reuse technology and reduce waste.",
    "tienda.ver-todos":   "See all products →",
    "tienda.badge":       "Featured",
    "prod1.nombre":       "Motherboard<br>HP Laptop",
    "prod1.estado":       "Good condition",
    "prod2.nombre":       "Washing machine<br>motor Whirlpool",
    "prod2.estado":       "Used",
    "prod3.nombre":       "Webcam<br>Logitech C920",
    "prod3.estado":       "Good condition",
    "prod4.nombre":       "Phone screen<br>Samsung A50",
    "prod4.estado":       "Used",
    "prod5.nombre":       "Power supply<br>600W",
    "prod5.estado":       "Good condition",
    "prod6.nombre":       "RAM Memory<br>8GB DDR4",
    "prod6.estado":       "Good condition",
    "tienda.ver-prod":    "View product",
    "trust.segura":       "Secure purchase",
    "trust.segura.desc":  "Verified products",
    "trust.ahorra":       "Save and reuse",
    "trust.ahorra.desc":  "Give it a second life",
    "trust.vende":        "Sell easily",
    "trust.vende.desc":   "Post in minutes",
    "trust.comision":     "Affordable fee",
    "trust.comision.desc":"Only 10% per sale",

    /* ── CÓMO FUNCIONA ── */
    "comofunciona.title":       "How does it work?",
    "comofunciona.step1.title": "Post",
    "comofunciona.step1.desc":  "Post what you want to recycle, donate or reuse.",
    "comofunciona.step2.title": "Connect",
    "comofunciona.step2.desc":  "People nearby will find your post.",
    "comofunciona.step3.title": "Exchange",
    "comofunciona.step3.desc":  "Coordinate delivery or pickup easily and safely.",
    "comofunciona.step4.title": "Impact",
    "comofunciona.step4.desc":  "Together we reduce waste and build a more sustainable world.",

    /* ── QUÉ PUEDES DONAR O RECICLAR ── */
    "materiales.title":        "What can you donate or recycle?",
    "materiales.electronicos": "Electronics",
    "materiales.ropa":         "Clothes",
    "materiales.libros":       "Books",
    "materiales.muebles":      "Furniture",
    "materiales.plastico":     "Plastic",
    "materiales.vidrio":       "Glass",
    "materiales.juguetes":     "Toys",
    "materiales.mas":          "More",

    /* ── ALIADOS ── */
    "aliados.title":      "Companies and allies that trust us",

    /* ── TESTIMONIOS ── */
    "testimonios.title":  "What our community says",
    "test1.texto":        "\"Thanks to RECO+ I was able to find parts to repair my laptop at a fair price and helped the planet.\"",
    "test2.texto":        "\"I donated clothes and objects I no longer used and knowing it helped someone else makes me happy.\"",
    "test3.texto":        "\"The platform is easy to use and the team is always supporting the community.\"",
    "test4.texto":        "\"I LOOOVE THE DEVELOPER!!\"",
    "test5.texto":        "\"An impeccable experience: elegant interface, clear processes, and an admirable purpose. RECO+ raises the standard of what it means to recycle in style.\"",

    /* ── CTA BANNER ── */
    "cta.title":  "Together we make a difference",
    "cta.desc":   "Every action counts and together we can build a cleaner, more caring and sustainable world.",
    "cta.btn":    "Join the community →",

    /* ── FOOTER ── */
    "footer.tagline":   "The plus the planet needs.",
    "footer.nav":       "Navigation",
    "footer.recursos":  "Resources",
    "footer.ayuda":     "Help center",
    "footer.faq":       "Frequently asked questions",
    "footer.terminos":  "Terms and conditions",
    "footer.privacidad":"Privacy policy",
    "footer.contacto":  "Contact",
    "footer.newsletter":"Newsletter",
    "footer.nl.desc":   "Receive tips, news and opportunities to help.",
    "footer.nl.ph":     "Your email address",
    "footer.nl.btn":    "Subscribe",
    "footer.copy":      "© 2024 RECO+. All rights reserved.",

    /* ── MAP (mapa.html page) ── */
    "mapa.hero.title":        "Map",
    "mapa.hero.subtitle":     "Explore your city and find <br>recycling and donation <br>points nearby.",
    "mapa.hero.badge":        "Learn, act and create a positive impact.",

    "mapa.header.title":      "<br />Recycling and Donation Map",
    "mapa.header.subtitle":   "Explore your city and find nearby recycling and donation points.<br />Use the filters to search by material or service type.",

    "mapa.search.placeholder":   "Search address or location",
    "mapa.search.locate.title":  "Use my location",

    "mapa.filter.label":        "Filter by material:",
    "mapa.filter.label.more":   "More materials:",
    "mapa.filter.todos":        "All",
    "mapa.filter.more":         "☰ More filters",

    "mapa.legend.recycle":   "Recycling points",
    "mapa.legend.donation":  "Donation points",
    "mapa.legend.acopio":    "Drop-off centers",
    "mapa.legend.evento":    "Recycling events",

    /* Type labels used dynamically by app.js in each result card
       (.type-tag) and in the marker popup */
    "mapa.type.reciclaje": "Recycling",
    "mapa.type.donacion":  "Donation",
    "mapa.type.acopio":    "Drop-off",

    /* Text generated by app.js (results list, rating, geolocation,
       toasts) */
    "mapa.results.empty":       "No results for this filter.",
    "mapa.results.locateTooltip": "Your location",
    "mapa.results.locateError": "We couldn't get your location.",
    "mapa.results.seeallToast": "Showing all available points.",
    "mapa.rate.label":          "Rate:",
    "mapa.rate.myVote":         "Your rating:",
    "mapa.rate.thanks":         "Thanks!",
    "mapa.rate.ariaLabel":      "Rate {n} star{s}",
    "mapa.rate.toastNew":       "Thanks for your {n}-star rating!",
    "mapa.rate.toastUpdate":    "You updated your rating to {n} ★",
    "mapa.modal.submitToast":   "Thank you! Your suggestion was submitted 🌱",

    "mapa.tooltip.title": "Did you know?",
    "mapa.tooltip.fact":  "Recycling 1 plastic bottle saves enough energy to power a light bulb for 6 hours.",

    "mapa.sidebar.near":          "Near you",
    "mapa.sidebar.showing":       "Showing",
    "mapa.sidebar.results":       "results",
    "mapa.sidebar.sort.cercanos": "Closest",
    "mapa.sidebar.sort.valorados":"Top rated",
    "mapa.sidebar.sort.recientes":"Recent",
    "mapa.sidebar.seeall":        "See all results",

    "mapa.footer.title": "Can't find a point?",
    "mapa.footer.desc":  "Suggest it and help grow our community.",
    "mapa.footer.btn":   "+ Suggest a point",

    "mapa.modal.title":          "Suggest a point",
    "mapa.modal.desc":           "Help us expand the recycling and donation map.",
    "mapa.modal.ph.nombre":      "Place name",
    "mapa.modal.ph.direccion":   "Address",
    "mapa.modal.opt.tipo":       "Point type",
    "mapa.modal.opt.reciclaje":  "Recycling",
    "mapa.modal.opt.donacion":   "Donation",
    "mapa.modal.opt.acopio":     "Drop-off",
    "mapa.modal.opt.evento":     "Event",
    "mapa.modal.ph.lat":         "Latitude",
    "mapa.modal.ph.lng":         "Longitude",
    "mapa.modal.useLocation":    "Use my current location",
    "mapa.modal.materiales":     "Materials accepted:",
    "mapa.modal.ph.comentarios": "Additional comments...",
    "mapa.modal.submit":         "Submit suggestion",

    /* ── GUIDE (guia.html page) ── */
    "guia.hero.title":    "Learn, explore and act<br>for a more sustainable <span class=\"gh-accent\">planet</span>.",
    "guia.hero.eyebrow":    "Featured videos",
    "guia.hero.masVideos":  "More videos",
    "guia.hero.verTodos":   "See all videos",

    "guia.video1.title": "The power of recycling",
    "guia.video1.desc":  "Small actions that create big change for the planet.",
    "guia.video2.title": "Donating is transforming",
    "guia.video2.desc":  "Your donations can improve the lives of many people.",
    "guia.video3.title": "Our planet, our home",
    "guia.video3.desc":  "Simple actions that protect our planet every day.",

    "guia.mini1.title": "How to sort correctly",
    "guia.mini1.desc":  "01:58 · Learn to sort your waste",
    "guia.mini2.title": "What happens to your waste",
    "guia.mini2.desc":  "02:05 · The journey to transformation",
    "guia.mini3.title": "Reuse to live better",
    "guia.mini3.desc":  "01:45 · Give a second life to what you no longer use",
    "guia.mini4.title": "The circular economy, simply explained",
    "guia.mini4.desc":  "02:30 · The cycle that creates a sustainable future",

    "guia.guide.title":    "Recycling and donation guide",
    "guia.guide.subtitle": "Select a category to get step-by-step instructions.",

    /* ── GUIDE: interactive chip panel (recycle/donate) ── */
    "guia.panel.badge.reciclar": "How to recycle it",
    "guia.panel.badge.donar":    "How to donate it",
    "guia.panel.cta.reciclar":   "Find a recycling point →",
    "guia.panel.cta.donar":      "Go to Donate / Help →",

    "guia.chip.plastico.label": "Plastic",
    "guia.chip.plastico.title": "Plastic",
    "guia.chip.plastico.desc":  "Plastic can have many more lives if you recycle it correctly.",
    "guia.chip.plastico.step1": "Clean and rinse it",
    "guia.chip.plastico.step2": "Dry it well",
    "guia.chip.plastico.step3": "Remove caps and labels",
    "guia.chip.plastico.step4": "Take it to a recycling point",

    "guia.chip.papel.label": "Paper",
    "guia.chip.papel.title": "Paper and cardboard",
    "guia.chip.papel.desc":  "Paper can be recycled several times before its fiber wears out.",
    "guia.chip.papel.step1": "Remove staples and clips",
    "guia.chip.papel.step2": "Keep it dry",
    "guia.chip.papel.step3": "Fold or flatten it",
    "guia.chip.papel.step4": "Take it to a recycling point",

    "guia.chip.vidrio.label": "Glass",
    "guia.chip.vidrio.title": "Glass",
    "guia.chip.vidrio.desc":  "Glass is 100% recyclable and can be reused indefinitely.",
    "guia.chip.vidrio.step1": "Rinse it",
    "guia.chip.vidrio.step2": "Remove metal lids",
    "guia.chip.vidrio.step3": "Don't break it to transport it",
    "guia.chip.vidrio.step4": "Drop it in the glass container",

    "guia.chip.metal.label": "Metal",
    "guia.chip.metal.title": "Metal",
    "guia.chip.metal.desc":  "Cans and metal objects become new products with huge energy savings.",
    "guia.chip.metal.step1": "Rinse it",
    "guia.chip.metal.step2": "Crush cans if you can",
    "guia.chip.metal.step3": "Separate it from other materials",
    "guia.chip.metal.step4": "Take it to a recycling point",

    "guia.chip.electronicos.label": "Electronics",
    "guia.chip.electronicos.title": "Electronics",
    "guia.chip.electronicos.desc":  "They need special handling: never throw them out with regular trash.",
    "guia.chip.electronicos.step1": "Erase your personal data",
    "guia.chip.electronicos.step2": "Remove batteries if possible",
    "guia.chip.electronicos.step3": "Store it in a box",
    "guia.chip.electronicos.step4": "Take it to a specialized point",

    "guia.chip.ropa.label": "Clothes and Textiles",
    "guia.chip.ropa.title": "Clothes and textiles",
    "guia.chip.ropa.desc":  "Clothes in good condition can be donated; the rest can also be recycled as textile.",
    "guia.chip.ropa.step1": "Check that it's clean",
    "guia.chip.ropa.step2": "Sort it by type",
    "guia.chip.ropa.step3": "Fold or pack it",
    "guia.chip.ropa.step4": "Donate it or take it to a textile point",

    "guia.chip.libros.label": "Books",
    "guia.chip.libros.title": "Books",
    "guia.chip.libros.desc":  "A book you no longer read can open a door for someone else.",
    "guia.chip.libros.step1": "Check they're complete",
    "guia.chip.libros.step2": "Group them by topic",
    "guia.chip.libros.step3": "Pack them well",
    "guia.chip.libros.step4": "Donate them to a library or collection point",

    "guia.chip.donar_ropa.label": "Clothes and footwear",
    "guia.chip.donar_ropa.title": "Clothes and footwear",
    "guia.chip.donar_ropa.desc":  "Donate clothes and footwear in good condition. Someone near you is waiting for them.",

    "guia.chip.donar_libros.label": "Books and supplies",
    "guia.chip.donar_libros.title": "Books and school supplies",
    "guia.chip.donar_libros.desc":  "Books, notebooks and school supplies can open doors for someone else.",

    "guia.chip.juguetes.label": "Toys",
    "guia.chip.juguetes.title": "Toys",
    "guia.chip.juguetes.desc":  "A toy you no longer use can make a child's day.",

    "guia.chip.muebles.label": "Furniture",
    "guia.chip.muebles.title": "Furniture",
    "guia.chip.muebles.desc":  "Chairs, tables or shelves in good condition can find a new home.",

    "guia.chip.donar_electronicos.label": "Electronics",
    "guia.chip.donar_electronicos.title": "Electronics",
    "guia.chip.donar_electronicos.desc":  "Phones, tablets or computers that still work can still be useful.",

    "guia.chip.otro.label": "Other",
    "guia.chip.otro.title": "Can't find your category?",
    "guia.chip.otro.desc":  "Post it anyway: someone is probably looking for it.",

    "guia.donarstep.1": "You post what you want to donate",
    "guia.donarstep.2": "We find who needs it",
    "guia.donarstep.3": "You coordinate a safe hand-off",
    "guia.donarstep.4": "Your donation creates real change",

    "guia.donatepanel.title":      "What can you donate?",
    "guia.donatepanel.subtitle":   "Your donations can make a big difference.",
    "guia.donatepanel.cat1":       "Clothes",
    "guia.donatepanel.cat2":       "Toys",
    "guia.donatepanel.cat3":       "Books",
    "guia.donatepanel.cat4":       "Supplies",
    "guia.donatepanel.cat5":       "Home",
    "guia.donatepanel.cat6":       "And more",
    "guia.donatepanel.stepslabel": "Steps to donate",
    "guia.donatepanel.step1":      "Select",
    "guia.donatepanel.step2":      "Clean and sort",
    "guia.donatepanel.step3":      "Drop off or schedule",
    "guia.donatepanel.step4":      "Transform lives",
    "guia.donatepanel.cta":        "Go to Donate / Help →",

    "guia.info.title": "Did you know?",
    "guia.info.text1": "Recycling 1 ton of paper saves approximately <strong>17 trees</strong> and thousands of liters of water.",
    "guia.info.text2": "Donating clothes you no longer use can help protect the environment and those who need it most.",
    "guia.info.text3": "A plastic bottle can take up to <strong>450 years</strong> to break down in the environment.",
    "guia.info.text4": "Recycling one aluminum can saves enough energy to power a TV for <strong>3 hours</strong>.",
    "guia.info.text5": "Glass is 100% recyclable and can be reused <strong>endlessly</strong> without losing quality.",
    "guia.info.text6": "Every ton of recycled plastic saves around <strong>5,774 kWh</strong> of energy.",

    "guia.impact.title":    "The impact of your action",
    "guia.impact.subtitle": "Every action counts and creates a real impact.",

    "guia.tips.title": "Quick tips",
    "guia.tips.li1":   "Reduce what you consume.",
    "guia.tips.li2":   "Reuse whenever you can.",
    "guia.tips.li3":   "Recycle correctly.",
    "guia.tips.li4":   "Donate what you no longer use.",
    "guia.tips.li5":   "Inspire more people to take action.",
    "guia.tips.li6":   "Sort your waste at home.",
    "guia.tips.li7":   "Bring your own reusable bag.",
    "guia.tips.li8":   "Avoid single-use plastics.",
    "guia.tips.li9":   "Share what you learn with your family.",
    "guia.tips.li10":  "Choose products with less packaging.",

    "guia.cta.title":    "Together we build a better future",
    "guia.cta.subtitle": "Learn, get informed and act today. Change starts with you.",
    "guia.cta.btn":      "Join the community",

    /* ── VIDEO LIBRARY (videos.html page) ── */
    "videos.hero.back":     "Back to Guide",
    "videos.hero.title":    "Video library",
    "videos.hero.subtitle": "Everything you need to know about recycling, donating, and living more sustainably, explained on video.",

    "videos.cat.todos":          "All",
    "videos.cat.reciclaje":      "Recycling",
    "videos.cat.donacion":       "Donating",
    "videos.cat.sostenibilidad": "Sustainability",
    "videos.cat.comunidad":      "Community",

    "videos.results.count": "Showing {n} videos",

    "videos.empty.title": "No videos in this category",
    "videos.empty.desc":  "Try another category or go back to \"All\" to see the full library.",

    "videos.search.placeholder":  "Search videos…",
    "videos.search.limpiar":      "Clear search",
    "videos.search.empty.title":  "No videos found for “{q}”",
    "videos.search.empty.desc":   "Try a different word or clear the search to see the full category.",

    "videos.v4.desc":  "Learn how to sort each material before taking it to a recycling point.",
    "videos.v5.desc":  "Follow your waste's journey from the bin to its transformation.",
    "videos.v6.desc":  "Give a second life to things you no longer use.",
    "videos.v7.desc":  "Understand the cycle that turns waste into new resources.",

    "videos.v8.title": "How to donate safely",
    "videos.v8.desc":  "Practical tips for coordinating a donation without hiccups.",
    "videos.v9.title": "The impact of your donation",
    "videos.v9.desc":  "See where what you share ends up and how it changes lives.",
    "videos.v10.title": "Stories that change lives",
    "videos.v10.desc":  "Real testimonials from people who recycle and donate with RECO+.",
    "videos.v11.title": "Communities that recycle together",
    "videos.v11.desc":  "How an organized neighborhood can multiply its environmental impact.",
    "videos.v12.title": "Reduce, reuse, recycle",
    "videos.v12.desc":  "The three pillars that support a sustainable lifestyle.",

    "videos.badge.comunidad": "Community",

    /* ── VIDEO PLAYER (video-player-modal.js) ── */
    "videos.player.cerrar": "Close",
    "videos.player.cargando": "Loading video…",
    "videos.player.error": "Couldn't load the video.",
    "videos.player.abrirExterno": "Open in a new tab",
    "videos.player.externo": "This video plays on the original site.",
    "videos.player.verOriginal": "View on the original site",
    "videos.player.titulo": "Playing video",

    /* ── UPLOAD VIDEO (subir-video-modal.js) ── */
    "subirvideo.boton":        "Upload video",
    "subirvideo.titulo":       "Share a video",
    "subirvideo.necesitaSesion": "Sign in to share a video with the RECO+ community.",
    "subirvideo.tituloLabel":  "Video title",
    "subirvideo.tituloPlaceholder": "E.g. How I recycled my neighborhood in a day",
    "subirvideo.descLabel":    "Description (optional)",
    "subirvideo.descPlaceholder": "Briefly tell us what it's about...",
    "subirvideo.categoriaLabel": "Category",
    "subirvideo.tabLink":      "By link",
    "subirvideo.tabArchivo":   "Upload file",
    "subirvideo.linkLabel":    "Video link",
    "subirvideo.linkPlaceholder": "https://youtube.com/watch?v=...",
    "subirvideo.linkHint":     "Can be a YouTube, Vimeo link, or a direct URL to a video file.",
    "subirvideo.dropTitulo":   "Drag your video here",
    "subirvideo.dropSub":      "or click to choose a file · MP4, WebM, MOV · max. 100MB",
    "subirvideo.subiendo":     "Uploading video…",
    "subirvideo.publicar":     "Submit video",
    "subirvideo.publicando":   "Publishing…",
    "subirvideo.revisionHint": "Your video will be reviewed before appearing in the library. We'll let you know if anything needs fixing.",
    "subirvideo.videoComunidad": "Video shared by the community",
    "subirvideo.statusFaltaTitulo": "Write a title for your video.",
    "subirvideo.statusFaltaLink": "Paste your video's link.",
    "subirvideo.statusLinkInvalido": "That link doesn't look valid. It should start with http:// or https://",
    "subirvideo.statusFaltaArchivo": "Choose a video file to upload.",
    "subirvideo.statusTipoInvalido": "Unsupported format. Use MP4, WebM, MOV or OGG.",
    "subirvideo.statusMuyGrande": "The file exceeds the 100MB limit.",
    "subirvideo.statusServicioNoDisponible": "Service unavailable right now.",
    "subirvideo.statusErrorSubida": "Couldn't upload the file. Try again.",
    "subirvideo.statusError":  "Couldn't publish your video. Try again.",
    "subirvideo.statusOk":     "Thanks! Your video is under review and will be in the library soon.",
    "subirvideo.statusErrorConexion": "Couldn't connect. Check your internet.",
    "subirvideo.statusLinkDuplicado": "This video has already been shared before. You can't publish it again.",
    "subirvideo.statusArchivoDuplicado": "This file has already been uploaded before. You can't publish it again.",
    "subirvideo.statusVerificandoLink": "Checking if this video already exists…",
    "subirvideo.statusVerificandoArchivo": "Checking if this file already exists…",
    "subirvideo.verificando": "Verifying your account…",
    "subirvideo.errorVerificacion": "Couldn't verify your account. Check your connection and try again.",

    /* ── DONAR (donar.html page) ── */
    "donar.hero.title":       "Donate /<br>Request help",
    "donar.hero.subtitle":    "Share what you no longer need or ask for support from<br>those who can help you. Together we build<br>a stronger, more sustainable community.",
    "donar.hero.badge":       "Small actions, big impact.",
    "donar.hero.card.title":  "A community that supports",
    "donar.hero.card.desc":   "Connect, share and benefit thousands of people in your community.",
    "donar.hero.cta1":        "Donate an item",
    "donar.hero.cta2":        "Request a donation",

    "donar.tab.donar":        "I want to donate",
    "donar.tab.solicitar":    "I need help",

    "donar.form1.title":      "I want to donate",
    "donar.form1.desc":       "Offer items you no longer use and make them available to those who need them most.",
    "donar.form2.title":      "I need help",
    "donar.form2.desc":       "Post what you need and connect with people in your community willing to help you.",

    "donar.form.label.categoria1":     "What are you donating?",
    "donar.form.label.categoria2":     "What do you need?",
    "donar.form.label.disponibilidad": "Availability?",
    "donar.form.label.descripcion":    "Description",
    "donar.form.label.ubicacion":      "Location",
    "donar.form.label.punto":          "Pickup/drop-off point",
    "donar.form1.label.foto":          "Item photo",
    "donar.form2.label.foto":          "Reference photo",
    "donar.form.opcional":             "(optional)",

    "donar.form.opt.categoria":      "Select a category",
    "donar.form.opt.ropa":           "Clothes and footwear",
    "donar.form.opt.electronicos":   "Electronics",
    "donar.form.opt.muebles":        "Furniture",
    "donar.form.opt.libros":         "Books and supplies",
    "donar.form.opt.juguetes":       "Toys",
    "donar.form.opt.alimentos":      "Non-perishable food",
    "donar.form.opt.alimentos2":     "Food",
    "donar.form.opt.materialescolar": "School supplies",
    "donar.form.opt.higiene":        "Hygiene products",
    "donar.form.opt.medicinas":      "Unexpired medication",
    "donar.form.opt.otro":           "Other",

    "donar.form.opt.disponibilidad": "Select availability",
    "donar.form.opt.inmediata":      "Immediate",
    "donar.form.opt.cuanto-antes":   "As soon as possible",
    "donar.form.opt.semana":         "This week",
    "donar.form.opt.mes":            "This month",

    "donar.form.ph.ubicacion":  "Your city or neighborhood",

    "donar.form.opt.punto1":    "Select point",
    "donar.form.opt.domicilio": "Delivery at my home",
    "donar.form.opt.acopio":    "Nearby drop-off point",
    "donar.form.opt.centro":    "Community center",

    "donar.form.opt.punto2":    "Select pickup point",
    "donar.form.opt.visita":    "They can visit me",
    "donar.form.opt.recojo":    "Pickup at drop-off point",
    "donar.form.opt.acuerdo":   "Arrange with donor",

    "donar.form1.ph.desc": "Describe the item: condition, quantity, important details...",
    "donar.form2.ph.desc": "Describe what you need, what for, and any relevant details...",

    "donar.form.upload.text":  "Drag an image here<br>or <strong>click to upload</strong>",
    "donar.form.terminos":     "By publishing, you accept RECO+'s <a href=\"#\">Terms of use</a>.",
    "donar.form1.submit":      "✔ Publish donation",
    "donar.form2.submit":      "✔ Publish request",

    "donar.trust1.title": "Safe and trustworthy community",
    "donar.trust1.desc":  "We verify profiles and posts.",
    "donar.trust2.title": "Clear policies",
    "donar.trust2.desc":  "We know what you can and can't donate.",
    "donar.trust3.title": "Active community",
    "donar.trust3.desc":  "Thousands of people ready to help.",
    "donar.trust4.title": "Impact and sustainability",
    "donar.trust4.desc":  "Every action creates real change.",

    /* ── DONAR: home sections (choice, steps, stats, listings, tracker, cta) ── */
    "donar.choice.title":       "🌿 What do you want to do today? 🌿",
    "donar.choice.subtitle":    "Choose how you want to help or receive help.",
    "donar.choice.card1.title": "I have something to donate",
    "donar.choice.card1.desc":  "Post items, clothes, books, electronics or anything you no longer use and connect with someone who needs it.",
    "donar.choice.card1.btn":   "Post a donation →",
    "donar.choice.card2.title": "I need something",
    "donar.choice.card2.desc":  "Request the items you need for yourself or your community. Someone might have exactly what you're looking for.",
    "donar.choice.card2.btn":   "Post a request →",

    "donar.steps.title":    "🌿 Connect a need 🌿",
    "donar.steps.subtitle": "At RECO+ we connect what you no longer use with those who need it most.",
    "donar.steps.s1.title": "1. You post",
    "donar.steps.s1.desc":  "You post what you want to donate.",
    "donar.steps.s2.title": "2. We connect",
    "donar.steps.s2.desc":  "We find the person who may need it.",
    "donar.steps.s3.title": "3. You deliver",
    "donar.steps.s3.desc":  "You coordinate a safe handoff.",
    "donar.steps.s4.title": "4. Impact",
    "donar.steps.s4.desc":  "Your donation creates real change.",

    "donar.stats.title":         "Together we're creating a real impact",
    "donar.stats.objetos":       "Items donated",
    "donar.stats.personas":      "People helped",
    "donar.stats.comunidades":   "Communities connected",
    "donar.stats.reutilizados":  "Items reused",

    "donar.listings.donaciones.title":   "🌿 Available donations",
    "donar.listings.solicitudes.title":  "🌿 Donation requests",
    "donar.listings.verTodas":           "See all →",

    "donar.campanas.title":              "🌿 Campaigns from our allies 🌿",
    "donar.campanas.subtitle":           "Allied companies and centers on RECO+ share their upcoming recycling and donation campaigns here.",
    "donar.campanas.reciclaje.title":    "♻️ Recycling campaigns",
    "donar.campanas.donacion.title":     "🎁 Donation campaigns",
    "donar.campanas.verMas":             "See more →",
    "donar.campanas.metaCard":           "🎯 Target:",
    "donar.campanas.errorCargar":        "Campaigns couldn't be loaded right now.",
    "donar.campanas.vacio.reciclaje":    "No active recycling campaigns yet. Be the first company to publish one from Alliances!",
    "donar.campanas.vacio.donacion":     "No active donation campaigns yet. Be the first company to publish one from Alliances!",

    "donar.campdetalle.kicker.reciclaje": "♻️ Recycling campaign",
    "donar.campdetalle.kicker.donacion":  "🎁 Donation campaign",
    "donar.campdetalle.meta":             "Target:",

    "donar.campins.cargando":              "Loading…",
    "donar.campins.invitado.desc":         "Sign in to join this campaign.",
    "donar.campins.invitado.btn":          "Sign in →",
    "donar.campins.form.titulo":           "Join this campaign",
    "donar.campins.form.nombreLabel":      "Full name",
    "donar.campins.form.telefonoLabel":    "Phone",
    "donar.campins.form.telefonoOpcional": "(optional)",
    "donar.campins.form.telefonoPh":       "E.g. 6123-4567",
    "donar.campins.form.mensajeLabel":     "Comment",
    "donar.campins.form.mensajeOpcional":  "(optional)",
    "donar.campins.form.mensajePh":        "E.g. the approximate amount of material you'll bring, or what you'd like to donate/contribute",
    "donar.campins.form.submitBtn":        "Join →",
    "donar.campins.form.enviando":         "Joining...",
    "donar.campins.form.errorNombre":      "Enter your name to join.",
    "donar.campins.form.errorGenerico":    "Couldn't complete your registration. Try again.",
    "donar.campins.yaInscrito.msg":           "✅ You're already registered for this campaign.",
    "donar.campins.yaInscrito.cancelarBtn":   "Cancel registration",
    "donar.campins.yaInscrito.cancelando":    "Cancelling...",
    "donar.campins.yaInscrito.errorCancelar": "Couldn't cancel your registration. Try again.",
    "donar.campins.confirmCancelar":       "Are you sure you want to cancel your registration for this campaign?",

    "donar.tracker.title":    "Follow your donation's journey",
    "donar.tracker.subtitle": "This is how you can see the impact of your help.",
    "donar.tracker.s1.title": "Posted",
    "donar.tracker.s1.desc":  "Your donation was posted successfully.",
    "donar.tracker.s2.title": "Searching",
    "donar.tracker.s2.desc":  "We're looking for the person who may need it.",
    "donar.tracker.s3.title": "Recipient found",
    "donar.tracker.s3.desc":  "Someone accepted your donation.",
    "donar.tracker.s4.title": "Delivered",
    "donar.tracker.s4.desc":  "The donation was delivered.",
    "donar.tracker.s5.title": "Impact created",
    "donar.tracker.s5.desc":  "Your help is already making a difference.",

    "donar.ctaBanner.title": "Have questions or want to help another way?",
    "donar.ctaBanner.desc":  "Let's talk and find the best way for you to help.",
    "donar.ctaBanner.btn":   "Contact us →",

    "donar.form.label.empresa": "Company it will be sent to",
    "donar.form.opt.empresa":   "Select a company (optional)",

    "donar.sample.buenEstado":            "Good condition",
    "donar.sample.necesitaReparacion":    "Needs repair",
    "donar.sample.mochila":               "School backpack",
    "donar.sample.laptop":                "Laptop computer",
    "donar.sample.ropaVariada":           "Assorted clothing",
    "donar.sample.utilesEscolares":       "School supplies",
    "donar.sample.seNecesitaComputadora": "Computer needed",
    "donar.sample.ropaNinos":             "Kids' clothing",
    "donar.sample.librosEscolares":       "School books",
    "donar.sample.educacion":             "Education",

    "donar.card.verDonacion": "View donation →",
    "donar.card.ayudar":      "Help →",

    "donar.mispubs.title":    "Your active posts",
    "donar.mispubs.header":   "Your active posts",
    "donar.mispubs.cargando": "Loading...",
    "donar.mispubs.vacio":    "You don't have any active posts.",

    "donar.modal.cerrar": "Close",

    "donar.modalExito.title":       "Post submitted!",
    "donar.modalExito.desc":        "Your donation has been posted successfully. The RECO+ community can already see it.",
    "donar.modalExito.donar.title": "Donation posted!",
    "donar.modalExito.donar.desc":  "Your donation has been posted successfully. The RECO+ community can already see it and contact you.",
    "donar.modalExito.solicitar.title": "Request posted!",
    "donar.modalExito.solicitar.desc":  "Your request has been sent. Someone from the RECO+ community will be able to help you soon.",
    "donar.modalError.title": "Couldn't be posted",
    "donar.modalError.desc.donar":     "An error occurred while saving your donation. Try again in a few seconds.",
    "donar.modalError.desc.solicitar": "An error occurred while saving your request. Try again in a few seconds.",
    "donar.modalLogin.title": "Sign in to continue",
    "donar.modalLogin.desc":  "You need an account to post a donation or request on RECO+.",
    "donar.btn.publicando":   "Posting...",

    "donar.listings.empty.donaciones":  "No donations posted yet. Be the first!",
    "donar.listings.empty.solicitudes": "No requests posted yet.",
    "donar.listings.ubicacionSinEspecificar": "Location not specified",
    "donar.listings.publicadoPor": "Posted by",
    "donar.listings.puntoEntrega": "Drop-off point",
    "donar.listings.puntoRecepcion": "Pickup point",
    "donar.listings.empresa": "Company",
    "donar.listings.sinDescripcion": "No additional description.",
    "donar.listings.kicker.donacion": "🌿 Available donation",
    "donar.listings.kicker.solicitud": "🙋 Help request",
    "donar.listings.usuarioGenerico": "RECO+ User",

    "donar.time.justoAhora":  "just now",
    "donar.time.haceMin":     "{n} min ago",
    "donar.time.haceHoras":   "{n}h ago",
    "donar.time.haceDias":    "{n}d ago",

    /* ── DONACIONES (donaciones.html page, "See all") ── */
    "donaciones.hero.title":    "All posts",
    "donaciones.hero.subtitle": "Explore all available donations and active help requests in the RECO+ community, with full details.",
    "donaciones.filter.todas":       "All",
    "donaciones.filter.donaciones":  "🌿 Donations",
    "donaciones.filter.solicitudes": "🙋 Help requests",
    "donaciones.search.placeholder": "Search by category, description or location...",
    "donaciones.count.suffix": "active posts",
    "donaciones.cargando":     "Loading posts...",
    "donaciones.error.conexion": "Couldn't connect to the database. Try reloading the page.",
    "donaciones.error.carga":    "An error occurred while loading posts. Try again later.",
    "donaciones.sinResultados":  "No posts found for these filters.",
    "donaciones.tipo.donacion":  "🌿 Donation",
    "donaciones.tipo.solicitud": "🙋 Request",

    /* ── ALIANZAS (alianzas.html page) ── */
    "alianzas.hero.title":    "Alliances /<br>Companies",
    "alianzas.hero.subtitle": "A space for companies, foundations, or centers that collaborate with the platform or wish to register.",
    "alianzas.hero.badge":    "Together we create more impact.",

    "alianzas.intro.title":   "Collaborate and multiply positive impact",

    "alianzas.feat1.title": "Collaborate with purpose",
    "alianzas.feat1.desc":  "Join a network of allies driving environmental and social change from your organization.",
    "alianzas.feat1.link":  "Learn more →",
    "alianzas.feat2.title": "Register your company or foundation",
    "alianzas.feat2.desc":  "Become part of RECO+ and show your commitment to sustainability to thousands of people.",
    "alianzas.feat2.link":  "Register →",
    "alianzas.feat3.title": "Visibility and community",
    "alianzas.feat3.desc":  "Connect with thousands of people, share your actions, and strengthen your impact in the community.",
    "alianzas.feat3.link":  "Benefits →",
    "alianzas.feat4.title": "Projects and campaigns",
    "alianzas.feat4.desc":  "Take part in joint initiatives and campaigns that transform communities and create real impact.",
    "alianzas.feat4.link":  "Explore initiatives →",

    "alianzas.aliados.title": "Featured allies",
    "alianzas.aliados.vacio.titulo": "No Premium allies yet",
    "alianzas.aliados.vacio.desc": "Companies with a Premium plan appear here, featured for the whole RECO+ community.",
    "alianzas.aliados.vacio.btn": "Learn about the Premium plan →",
    "alianzas.aliados.destacado": "Featured ally 🌳",
    "alianzas.tipo.centro_reciclaje": "Recycling center",
    "alianzas.tipo.empresa_recicladora": "Recycling company",
    "alianzas.tipo.punto_acopio": "Collection point",
    "alianzas.tipo.transportista": "Waste transporter",
    "alianzas.tipo.otro": "RECO+ ally",
    "alianzas.tagline1": "Environmental Foundation",
    "alianzas.tagline2": "Real commitment",
    "alianzas.tagline3": "Actions that count",
    "alianzas.tagline4": "Transforming together",
    "alianzas.tagline5": "Caring for the future",
    "alianzas.tagline6": "For a clean planet",

    "alianzas.cta.title": "Does your company want to make a difference?",
    "alianzas.cta.desc":  "Sign up and join our community of allies building a more sustainable future.",
    "alianzas.cta.btn":   "I want to be an ally →",
    "alianzas.carousel.prev": "Previous",
    "alianzas.carousel.next": "Next",

    /* ══════════════════════════════════════════
       ALLY REGISTRATION (alianzas-registro-modal.js)
       9-step form to register a company/ally.
       ══════════════════════════════════════════ */
    "rae.kicker": "Ally registration · Step {n} of {total}",
    "rae.kicker.simple": "Ally registration",
    "rae.btn.atras": "← Back",
    "rae.btn.siguiente": "Next →",
    "rae.btn.registrar": "Register ally ✓",
    "rae.btn.enviando": "Sending...",
    "rae.status.revisaCampos": "Review the highlighted fields before continuing.",
    "rae.confirmCerrar": "Are you sure you want to close? The information entered in this form will be lost.",

    "rae.step.empresa.titulo": "Company information",
    "rae.step.contacto.titulo": "Contact information",
    "rae.step.ubicacion.titulo": "Location",
    "rae.step.materiales.titulo": "Materials they accept",
    "rae.step.servicios.titulo": "Services they offer",
    "rae.step.horarios.titulo": "Hours",
    "rae.step.operativa.titulo": "Operational information",
    "rae.step.cuenta.titulo": "Access account",
    "rae.step.opcional.titulo": "Optional information",

    /* ── Step 1: Company ── */
    "rae.tipo.centroReciclaje": "Recycling center",
    "rae.tipo.empresaRecicladora": "Recycling company",
    "rae.tipo.puntoAcopio": "Drop-off point",
    "rae.tipo.transportista": "Waste transporter",
    "rae.tipo.otro": "Other",

    "rae.empresa.desc": "Tell us about your company or recycling center to register it as an ally on RECO+.",
    "rae.empresa.nombreLabel": "Company or recycling center name",
    "rae.empresa.nombrePh": "E.g. EcoRecicla Panama",
    "rae.empresa.nombreError": "Enter the company name.",
    "rae.empresa.comercialLabel": "Trade name",
    "rae.empresa.comercialOpcional": "(if different)",
    "rae.empresa.comercialPh": "E.g. EcoR",
    "rae.empresa.rucLabel": "Registration number or tax ID",
    "rae.empresa.rucPh": "E.g. 8-888-8888",
    "rae.empresa.rucError": "Enter the registration number or tax ID.",
    "rae.empresa.anioLabel": "Founding year",
    "rae.empresa.anioOpcional": "(optional)",
    "rae.empresa.anioPh": "E.g. 2018",
    "rae.empresa.anioError": "Enter a valid year (1900–{anio}).",
    "rae.empresa.tipoLabel": "Company type",
    "rae.empresa.tipoDefault": "Select a type",
    "rae.empresa.tipoError": "Select the company type.",
    "rae.empresa.descLabel": "Company description",
    "rae.empresa.descPh": "Tell us what your company does, what makes it different, and how it collaborates with the community...",
    "rae.empresa.descHint": "{n} / 600 (minimum 20 characters)",
    "rae.empresa.descError": "Write a description of at least 20 characters.",
    "rae.empresa.logoLabel": "Company logo",
    "rae.empresa.logoOpcional": "(optional)",
    "rae.empresa.logoCambiar": "Change logo",
    "rae.empresa.logoSubir": "Upload logo",
    "rae.empresa.logoQuitar": "Remove",
    "rae.empresa.logoHint": "PNG, JPG or WEBP, up to 3 MB.",
    "rae.empresa.logoFormatoInvalido": "Invalid format. Use PNG, JPG or WEBP.",
    "rae.empresa.logoMuyPesado": "The file is over 3 MB. Choose a lighter one.",

    /* ── Step 2: Contact ── */
    "rae.contacto.desc": "How can the RECO+ community reach your company?",
    "rae.contacto.emailLabel": "Email address",
    "rae.contacto.emailPh": "contact@yourcompany.com",
    "rae.contacto.emailError": "Enter a valid email address.",
    "rae.contacto.telLabel": "Phone number",
    "rae.contacto.telPh": "+507 6000-0000",
    "rae.contacto.telError": "Enter a valid phone number.",
    "rae.contacto.waLabel": "WhatsApp",
    "rae.contacto.waOpcional": "(optional)",
    "rae.contacto.waPh": "+507 6000-0000",
    "rae.contacto.waError": "Enter a valid WhatsApp number.",
    "rae.contacto.waIgual": "Use the same number as the phone",
    "rae.contacto.webLabel": "Website",
    "rae.contacto.webOpcional": "(optional)",
    "rae.contacto.webPh": "www.yourcompany.com",
    "rae.contacto.webError": "Enter a valid website.",

    /* ── Step 3: Location ── */
    "rae.ubicacion.desc": "Where is your company or operating point located? This information is used to show you on the RECO+ map.",
    "rae.ubicacion.provinciaLabel": "Province or region",
    "rae.ubicacion.provinciaDefault": "Select a province",
    "rae.ubicacion.provinciaError": "Select a province or region.",
    "rae.ubicacion.distritoLabel": "District or city",
    "rae.ubicacion.distritoPh": "E.g. David",
    "rae.ubicacion.distritoError": "Enter the district or city.",
    "rae.ubicacion.direccionLabel": "Full address",
    "rae.ubicacion.direccionPh": "Street, number, neighborhood, nearby landmarks...",
    "rae.ubicacion.direccionError": "Enter a full address (minimum 10 characters).",
    "rae.ubicacion.gpsLabel": "GPS coordinates",
    "rae.ubicacion.latPh": "Latitude (e.g. 8.4331)",
    "rae.ubicacion.lngPh": "Longitude (e.g. -82.4308)",
    "rae.ubicacion.gpsError": "Enter valid GPS coordinates.",
    "rae.ubicacion.usarMiUbicacion": "Use my current location",
    "rae.ubicacion.hintManual": "You can also type them manually if you already know them.",
    "rae.ubicacion.sinGeolocalizacion": "Your browser doesn't allow getting your location automatically. Type it manually.",
    "rae.ubicacion.obteniendo": "Getting your current location...",
    "rae.ubicacion.obtenidaOk": "Location obtained successfully.",
    "rae.ubicacion.obtenidaError": "We couldn't get your location. Type it manually or check your browser permissions.",

    /* ── Step 4: Materials ── */
    "rae.materiales.desc": "Select all the materials your company or center accepts. You can choose several — this is what users will see when filtering the map.",
    "rae.materiales.error": "Select at least one material.",
    "rae.chip.seleccionado": "selected",
    "rae.chip.seleccionados": "selected",
    "rae.chip.todos": "Select all",
    "rae.chip.ninguno": "None",

    "rae.mat.plastico": "Plastic",
    "rae.mat.vidrio": "Glass",
    "rae.mat.metal": "Metal",
    "rae.mat.papel": "Paper",
    "rae.mat.carton": "Cardboard",
    "rae.mat.libros": "Books",
    "rae.mat.electronicos": "Electronics",
    "rae.mat.celulares": "Phones",
    "rae.mat.baterias": "Batteries",
    "rae.mat.bombillos": "Light bulbs",
    "rae.mat.ropa": "Clothes",
    "rae.mat.tela": "Fabric",
    "rae.mat.cuero": "Leather",
    "rae.mat.muebles": "Furniture",
    "rae.mat.juguetes": "Toys",
    "rae.mat.utilesescolares": "School supplies",
    "rae.mat.tetrapak": "Tetra Pak",
    "rae.mat.aceite": "Cooking oil",

    /* ── Step 5: Services ── */
    "rae.servicios.desc": "What services does your company offer the RECO+ community? Select all that apply.",
    "rae.servicios.error": "Select at least one service.",

    "rae.serv.compraMateriales": "Purchase of recyclable materials",
    "rae.serv.recoleccionDomicilio": "Home pickup",
    "rae.serv.recoleccionEmpresarial": "Business pickup",
    "rae.serv.transporteResiduos": "Waste transport",
    "rae.serv.destruccionCertificada": "Certified destruction",
    "rae.serv.gestionElectronicos": "E-waste management",
    "rae.serv.asesoriaAmbiental": "Environmental consulting",
    "rae.serv.educacionAmbiental": "Environmental education",
    "rae.serv.ventaMateriales": "Sale of recycled materials",

    /* ── Step 6: Hours ── */
    "rae.horarios.desc": "What days and hours is your company or center open?",
    "rae.horarios.diasLabel": "Days open",
    "rae.horarios.todosLosDias": "Every day",
    "rae.horarios.lunVie": "Mon–Fri",
    "rae.horarios.diasError": "Select at least one day open.",
    "rae.horarios.aperturaLabel": "Opening time",
    "rae.horarios.aperturaError": "Enter the opening time.",
    "rae.horarios.cierreLabel": "Closing time",
    "rae.horarios.cierreError": "Must be later than the opening time.",
    "rae.dia.lun": "Mon",
    "rae.dia.mar": "Tue",
    "rae.dia.mie": "Wed",
    "rae.dia.jue": "Thu",
    "rae.dia.vie": "Fri",
    "rae.dia.sab": "Sat",
    "rae.dia.dom": "Sun",

    /* ── Step 7: Operations ── */
    "rae.operativa.desc": "Tell us how your company works day to day: who it serves, how much material it handles, and how it pays for it.",
    "rae.operativa.aceptaParticularesLabel": "Do you accept individuals?",
    "rae.operativa.aceptaParticularesError": "Indicate whether you accept individuals.",
    "rae.operativa.aceptaEmpresasLabel": "Do you accept businesses?",
    "rae.operativa.aceptaEmpresasError": "Indicate whether you accept businesses.",
    "rae.operativa.cantMinLabel": "Minimum material amount (kg)",
    "rae.operativa.cantMinPh": "E.g. 5",
    "rae.operativa.cantMinError": "Enter a valid minimum amount.",
    "rae.operativa.cantMaxLabel": "Maximum amount (kg)",
    "rae.operativa.cantMaxPh": "No limit",
    "rae.operativa.cantMaxError": "Must be greater than the minimum amount.",
    "rae.operativa.pagaLabel": "Do you pay for materials?",
    "rae.operativa.pagaError": "Indicate whether you pay for materials.",
    "rae.operativa.metodoLabel": "Payment method",
    "rae.operativa.metodoError": "Select at least one payment method.",
    "rae.toggle.si": "Yes",
    "rae.toggle.no": "No",

    "rae.pago.efectivo": "Cash",
    "rae.pago.transferencia": "Bank transfer",
    "rae.pago.yappy": "Yappy",
    "rae.pago.cheque": "Check",
    "rae.pago.otro": "Other",

    /* ── Step 8: Account ── */
    "rae.cuenta.desc": "Your company will be registered with the RECO+ account you're already signed in with.",
    "rae.cuenta.usuarioLabel": "Username",
    "rae.cuenta.usuarioPh": "E.g. ecorecicla_pa",
    "rae.cuenta.usuarioHint": "No spaces; letters, numbers, hyphen or underscore.",
    "rae.cuenta.usuarioError": "Choose a valid username (minimum 3 characters).",
    "rae.cuenta.emailLabel": "Your RECO+ account email",
    "rae.cuenta.emailHint": "This is the email of the account you're signed in with. Your company will be linked to this account.",
    "rae.cuenta.terminos": "I accept RECO+'s <a href=\"#\" target=\"_blank\" rel=\"noopener\">terms and conditions</a>.",
    "rae.cuenta.terminosError": "You must accept the terms and conditions.",
    "rae.cuenta.privacidad": "I accept RECO+'s <a href=\"#\" target=\"_blank\" rel=\"noopener\">privacy policy</a>.",
    "rae.cuenta.privacidadError": "You must accept the privacy policy.",

    /* ── Step 9: Optional ── */
    "rae.opcional.desc": "This information is optional, but it helps your ally profile stand out more on RECO+.",
    "rae.opcional.redesLabel": "Social media",
    "rae.opcional.redesError": "Enter a valid link.",
    "rae.opcional.fotosLabel": "Recycling center photos",
    "rae.opcional.fotosOpcional": "(optional, up to {n})",
    "rae.opcional.fotosHint": "PNG, JPG or WEBP, up to 3 MB each.",
    "rae.opcional.fotosFormatoInvalido": "Some file wasn't PNG, JPG or WEBP and was skipped.",
    "rae.opcional.fotosMuyPesado": "Some file was over 3 MB and was skipped.",
    "rae.opcional.agregar": "Add",
    "rae.opcional.videoLabel": "Presentation video",
    "rae.opcional.videoPh": "YouTube, Vimeo link, etc.",
    "rae.opcional.videoError": "Enter a valid video link.",
    "rae.opcional.coberturaLabel": "Coverage areas",
    "rae.opcional.coberturaDesc": "Provinces or regions where you offer pickup or service, in addition to your main location.",
    "rae.opcional.residuosLabel": "Approximate waste processed per month (kg)",
    "rae.opcional.residuosPh": "E.g. 250",
    "rae.opcional.residuosError": "Enter a valid amount.",
    "rae.opcional.misionLabel": "Mission",
    "rae.opcional.misionPh": "What's the purpose of your company?",
    "rae.opcional.visionLabel": "Vision",
    "rae.opcional.visionPh": "Where does your company want to go?",
    "rae.opcional.notaCalificaciones": "Ratings and reviews from other users turn on automatically on your profile once registration is complete; they're not configured here.",

    /* ── Final submission / errors ── */
    "rae.envio.verificandoSesion": "Verifying your session...",
    "rae.envio.sesionExpirada": "Your session expired. Sign in again and try registering once more.",
    "rae.envio.subiendoArchivos": "Uploading logo and photos...",
    "rae.envio.guardandoPerfil": "Saving your ally profile...",
    "rae.envio.exito": "✓ Done! Your company was registered. We'll review your profile and it will soon appear as an ally on RECO+.",
    "rae.envio.errorGenerico": "An unexpected error occurred. Try again.",
    "rae.envio.errorDuplicado": "An ally registration with that information (email or tax ID) already exists.",
    "rae.envio.errorPermisos": "The profile couldn't be saved due to a permissions issue. Contact support.",
    "rae.envio.errorConexion": "Couldn't connect. Check your internet connection.",
    "rae.envio.errorServicio": "Couldn't connect to the service. Try again later.",

    /* ── Notice: sign in first ── */
    "rae.avisoSesion.titulo": "Sign in first",
    "rae.avisoSesion.desc": "To register your company as an ally, you first need to sign in (or create an account) on RECO+. Your company will be linked to that account.",
    "rae.avisoSesion.cancelar": "Cancel",
    "rae.avisoSesion.irLogin": "Sign in →",

    /* ── Notice: already have a registered company ── */
    "rae.avisoYaReg.titulo": "You already have a registered company",
    "rae.avisoYaReg.desc1": "This account already has a company or recycling center registered on RECO+. Only one company per account is allowed, so you can't create another one from here.",
    "rae.avisoYaReg.desc2": "If you need to update your company's details or review your account, you can do so from Settings.",
    "rae.avisoYaReg.cerrar": "Close",
    "rae.avisoYaReg.irAjustes": "Go to account Settings →",

    /* ══════════════════════════════════════════
       TUTORIAL — interactive spotlight tour
       ══════════════════════════════════════════ */
    "tutorial.idx_step0.title": "Welcome to RECO+! 👋",
    "tutorial.idx_step0.desc":  "In a couple of minutes we'll show you where everything is: the recycling map, how to donate, how to ask for help, and more. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.idx_step1.title": "Your navigation bar",
    "tutorial.idx_step1.desc":  "From here you can reach any section: Recycle, Donate, Guide, Scanner, Map and Alliances. It stays fixed at the top as you scroll, so everything is always one click away.",

    "tutorial.idx_step2.title": "Light / dark mode",
    "tutorial.idx_step2.desc":  "Prefer a softer interface for your eyes at night? Try tapping this switch right now — the tutorial adapts instantly to the new theme.",

    "tutorial.idx_step3.title": "Switch language",
    "tutorial.idx_step3.desc":  "RECO+ speaks Spanish and English. Tap it to switch — the whole page, including this tour, translates in real time without reloading.",

    "tutorial.idx_step4.title": "Join the community",
    "tutorial.idx_step4.desc":  "This button takes you to create your account. With your profile you can save favorite spots, track your donations, and unlock more features.",

    "tutorial.idx_step5.title": "Quick access",
    "tutorial.idx_step5.desc":  "These shortcuts take you straight to the map, the AI scanner, or alliances without digging through the menu. Perfect when you already know exactly what you need to do.",

    "tutorial.idx_step6.title": "Search for what you need",
    "tutorial.idx_step6.desc":  "Type here what you'd like to recycle or donate — for example \"clothes\" or \"electronics\" — and we'll suggest the most relevant options instantly.",

    "tutorial.idx_step7.title": "Facts that will surprise you",
    "tutorial.idx_step7.desc":  "Discover the real impact of recycling: how long plastic takes to break down, how many trees you save by recycling paper, and more.",

    "tutorial.idx_step8.title": "Recycle and donate, one click closer",
    "tutorial.idx_step8.desc":  "These two cards sum up the platform's two most important actions. Tap them to see nearby recycling points or to start donating today.",

    "tutorial.idx_step9.title": "Everything you can do",
    "tutorial.idx_step9.desc":  "Swipe through this strip of cards to discover every feature: finding points, donating, asking for help, reading the guide, viewing alliances, and more. Each card takes you straight to that section.",

    "tutorial.idx_step10.title": "How does RECO+ work?",
    "tutorial.idx_step10.desc":  "Three simple steps: search for what you need, donate, recycle or request help, and make a real impact. That's how easy it is to join the change.",

    "tutorial.idx_step11.title": "Companies that trust us",
    "tutorial.idx_step11.desc":  "Meet the partner brands and organizations that support the RECO+ movement and make this impact possible.",

    "tutorial.idx_step12.title": "What our community says",
    "tutorial.idx_step12.desc":  "Read real experiences from people who have already donated, recycled, or asked for help through the platform.",

    "tutorial.idx_step13.title": "Our impact in numbers",
    "tutorial.idx_step13.desc":  "These numbers grow every day thanks to people like you: active users, recycling points, tons recycled, and communities united.",

    "tutorial.idx_step14.title": "All set, you know RECO+ now! 🎉",
    "tutorial.idx_step14.desc":  "Explore at your own pace. Whenever you want to repeat the full tour, the floating green button will always be here to help.",

    "tutorial.btn.next":    "Next",
    "tutorial.btn.prev":    "Back",
    "tutorial.btn.finish":  "Start exploring!",
    "tutorial.btn.close":   "Close tutorial",
    "tutorial.btn.restart": "Restart tutorial",
    "tutorial.btn.skip":    "Skip tutorial",

    "tutorial.step.counter":  "Step {n} of {total}",
    "tutorial.step.progress": "{pct}% complete",
    "tutorial.fab.label":     "View tutorial",
    "tutorial.fab.tooltip":   "Need help? Restart the tutorial",

    "tutorial.done.title": "Well done! 🎊",
    "tutorial.done.desc":  "You completed the tour. You now know your way around RECO+ like a pro.",

    /* ── TUTORIAL: Recycle page (rec_) ── */
    "tutorial.rec_step0.title": "Welcome to Recycle! ♻️",
    "tutorial.rec_step0.desc":  "We'll show you how to pick what to recycle, use the AI scanner, and find the nearest center. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.rec_step5.title": "Two ways to start",
    "tutorial.rec_step5.desc":  "Go straight to the map to find the nearest recycling point, or use the scanner to identify your item with artificial intelligence.",

    "tutorial.rec_step6.title": "Choose your material",
    "tutorial.rec_step6.desc":  "Select the type of item you want to recycle — electronics, plastic, glass, clothing, and more — and we'll explain how to prepare it and where to take it.",

    "tutorial.rec_step7.title": "Smart scanner",
    "tutorial.rec_step7.desc":  "Upload or take a photo of your item and the AI will instantly tell you if it's recyclable, what category it falls into, and how to prepare it.",

    "tutorial.rec_step8.title": "How your recycling travels",
    "tutorial.rec_step8.desc":  "From the moment you use an item until it becomes raw material for something new — discover the 5 steps of the full process.",

    "tutorial.rec_step9.title": "Centers near you",
    "tutorial.rec_step9.desc":  "This mini-map shows the nearest recycling points. Tap it or go to the full map to trace your route.",

    "tutorial.rec_step10.title": "Every item counts",
    "tutorial.rec_step10.desc":  "Whenever you're ready, this button takes you straight to the map to start recycling today.",

    "tutorial.rec_step11.title": "Ready to recycle! 🎉",
    "tutorial.rec_step11.desc":  "You now know your way around this page. The floating green button will always be here if you want to repeat the tour.",

    /* ── TUTORIAL: Map page (map_) ── */
    "tutorial.map_step0.title": "Welcome to the Map! 🗺️",
    "tutorial.map_step0.desc":  "We'll show you how to search, filter, and find the nearest recycling or donation point. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.map_step1.title": "Search an address",
    "tutorial.map_step1.desc":  "Type an address or location, or tap the location button to center the map on where you are.",

    "tutorial.map_step2.title": "Filter by material",
    "tutorial.map_step2.desc":  "Tap any chip to see only the points that accept that type of material — plastic, paper, glass, clothing, and more.",

    "tutorial.map_step3.title": "More materials",
    "tutorial.map_step3.desc":  "Can't find what you're looking for? Here are more categories: cardboard, batteries, cooking oil, and several others.",

    "tutorial.map_step4.title": "Explore the map",
    "tutorial.map_step4.desc":  "Every marker is a recycling, donation, drop-off, or event point. Tap it to see its details, hours, and accepted materials.",

    "tutorial.map_step5.title": "Check the legend",
    "tutorial.map_step5.desc":  "These icons help you tell the type of each point on the map at a glance.",

    "tutorial.map_step6.title": "Results near you",
    "tutorial.map_step6.desc":  "This list shows the points closest to your location, with ratings and quick details.",

    "tutorial.map_step7.title": "Sort the results",
    "tutorial.map_step7.desc":  "Change how the list is sorted: closest, top rated, or most recent.",

    "tutorial.map_step8.title": "See all results",
    "tutorial.map_step8.desc":  "Tap here to expand the full list of available points, with no limit on results.",

    "tutorial.map_step9.title": "Missing a point?",
    "tutorial.map_step9.desc":  "If you can't find a place you know, suggest it here and help us grow the RECO+ map.",

    "tutorial.map_step10.title": "Ready to explore! 🎉",
    "tutorial.map_step10.desc":  "You now know your way around the map. The floating green button will always be here if you want to repeat the tour.",

    /* ── TUTORIAL: Donate page (don_) ── */
    "tutorial.don_step0.title": "Welcome to Donate / Help! 🌿",
    "tutorial.don_step0.desc":  "We'll show you how to donate items, ask for help, and track your donation's journey. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.don_step1.title": "Two ways to start",
    "tutorial.don_step1.desc":  "Donate an item you no longer use, or request a donation if you need help. Both buttons open the matching form.",

    "tutorial.don_step2.title": "What do you want to do today?",
    "tutorial.don_step2.desc":  "Choose between posting something you want to donate or asking for something you need from the community.",

    "tutorial.don_step3.title": "Our impact in numbers",
    "tutorial.don_step3.desc":  "These numbers grow every day: items donated, people helped, communities connected, and items reused.",

    "tutorial.don_step4.title": "Donations and requests",
    "tutorial.don_step4.desc":  "Explore what the community has already posted: available donations, and active help requests.",

    "tutorial.don_step5.title": "Campaigns from our allies",
    "tutorial.don_step5.desc":  "Allied companies and centers on RECO+ post their recycling and donation campaigns here. Join one if it interests you.",

    "tutorial.don_step6.title": "Follow your donation's journey",
    "tutorial.don_step6.desc":  "From the moment you post it until it creates real impact — this is how you can track where your donation stands.",

    "tutorial.don_step7.title": "A trustworthy community",
    "tutorial.don_step7.desc":  "We verify profiles, have clear policies, and thousands of people ready to help or receive help.",

    "tutorial.don_step8.title": "Ready to donate! 🎉",
    "tutorial.don_step8.desc":  "You now know your way around this page. The floating green button will always be here if you want to repeat the tour.",

    /* ── TUTORIAL: Guide page (gui_) ── */
    "tutorial.gui_step0.title": "Welcome to the Guide! 📚",
    "tutorial.gui_step0.desc":  "We'll show you where to find the videos, step-by-step instructions, and the facts you need to recycle and donate better. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.gui_step1.title": "Featured videos",
    "tutorial.gui_step1.desc":  "These featured videos quickly explain how to recycle, donate, and care for the planet.",

    "tutorial.gui_step2.title": "More content and community",
    "tutorial.gui_step2.desc":  "Discover more short videos, or upload your own to share with the RECO+ community.",

    "tutorial.gui_step3.title": "Recycle or donate",
    "tutorial.gui_step3.desc":  "Switch between recycling instructions and donation instructions with this toggle.",

    "tutorial.gui_step4.title": "Choose a category",
    "tutorial.gui_step4.desc":  "Tap the material you want to recycle or donate to see specific instructions.",

    "tutorial.gui_step5.title": "Step-by-step instructions",
    "tutorial.gui_step5.desc":  "Here you'll find how to prepare it and where to take it, plus the most common donation categories.",

    "tutorial.gui_step6.title": "Facts and tips",
    "tutorial.gui_step6.desc":  "Discover fun facts about recycling, the community's real impact, and quick everyday tips.",

    "tutorial.gui_step7.title": "Join the community",
    "tutorial.gui_step7.desc":  "When you're ready, create your account and become part of the change alongside thousands of people.",

    "tutorial.gui_step8.title": "Ready to learn! 🎉",
    "tutorial.gui_step8.desc":  "You now know your way around the guide. The floating green button will always be here if you want to repeat the tour.",

    /* ── TUTORIAL: Alliances page (ali_) ── */
    "tutorial.ali_step0.title": "Welcome to Alliances! 🤝",
    "tutorial.ali_step0.desc":  "We'll show you how to register your company, explore initiatives, and meet our allies. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.ali_step1.title": "Collaborate and multiply the impact",
    "tutorial.ali_step1.desc":  "This space is for companies, foundations, or centers that want to collaborate with RECO+ or are already part of the community.",

    "tutorial.ali_step2.title": "Register or explore initiatives",
    "tutorial.ali_step2.desc":  "Register your company as an ally, or discover the joint campaigns and projects already underway.",

    "tutorial.ali_step3.title": "Featured allies",
    "tutorial.ali_step3.desc":  "Meet the Premium-plan companies actively supporting the RECO+ movement.",

    "tutorial.ali_step4.title": "Want your company to join?",
    "tutorial.ali_step4.desc":  "Tap here to register your company and join the community of allies building a more sustainable future.",

    "tutorial.ali_step5.title": "Ready to collaborate! 🎉",
    "tutorial.ali_step5.desc":  "You now know your way around this page. The floating green button will always be here if you want to repeat the tour.",

    /* ── TUTORIAL: Videos page (vid_) ── */
    "tutorial.vid_step0.title": "Welcome to the Video Library! 🎥",
    "tutorial.vid_step0.desc":  "We'll show you how to search, filter, and share videos about recycling and donating. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.vid_step1.title": "Search for a video",
    "tutorial.vid_step1.desc":  "Type a keyword to quickly find the video you're looking for.",

    "tutorial.vid_step2.title": "Filter by category",
    "tutorial.vid_step2.desc":  "Pick a category to see only those videos, or upload your own to share with the community.",

    "tutorial.vid_step3.title": "Explore the library",
    "tutorial.vid_step3.desc":  "Tap any video to watch it right here, without leaving RECO+.",

    "tutorial.vid_step4.title": "Ready to learn! 🎉",
    "tutorial.vid_step4.desc":  "You now know your way around the video library. The floating green button will always be here if you want to repeat the tour.",

    /* ── TUTORIAL: Scanner page (esc_) ── */
    "tutorial.esc_step0.title": "Welcome to the Scanner! ✨",
    "tutorial.esc_step0.desc":  "We'll show you how to identify any object with artificial intelligence in seconds. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.esc_step1.title": "Point the camera",
    "tutorial.esc_step1.desc":  "Place the object inside the viewfinder. The scanner analyzes what the camera sees live.",

    "tutorial.esc_step2.title": "Start the scanner",
    "tutorial.esc_step2.desc":  "Tap this button to turn on your camera and start identifying materials instantly.",

    "tutorial.esc_step3.title": "Precise AI scan",
    "tutorial.esc_step3.desc":  "If the live result isn't enough, tap here for a more accurate analysis powered by artificial intelligence.",

    "tutorial.esc_step4.title": "This session's history",
    "tutorial.esc_step4.desc":  "Here you'll see every object you've identified during this scanning session.",

    "tutorial.esc_step5.title": "Ready to scan! 🎉",
    "tutorial.esc_step5.desc":  "You now know how to use the scanner. The floating green button will always be here if you want to repeat the tour.",

    /* ── RECYCLE PAGE ── */
    "reciclar.hero.title1": "Recycle today,",
    "reciclar.hero.title2": "transform tomorrow.",
    "reciclar.hero.desc":   "Learn to sort your waste, find out where to recycle, and discover the positive impact every action makes for the planet.",
    "reciclar.hero.btn1":   "Find a recycling point",
    "reciclar.hero.btn2":   "Scan object",

    "reciclar.materiales.title": "What do you want to recycle?",
    "reciclar.materiales.sub":   "Select the material type to get information.",
    "reciclar.materiales.nota":  "Once you select a material, you'll learn how to prepare it, where to take it, and what it becomes when recycled.",
    "reciclar.mat.electronicos": "Electronics",
    "reciclar.mat.celulares":    "Phones",
    "reciclar.mat.plastico":     "Plastic",
    "reciclar.mat.metal":        "Metal",
    "reciclar.mat.papel":        "Paper",
    "reciclar.mat.vidrio":       "Glass",
    "reciclar.mat.ropa":         "Clothing",
    "reciclar.mat.muebles":      "Furniture",
    "reciclar.mat.libros":       "Books",
    "reciclar.mat.juguetes":     "Toys",
    "reciclar.mat.baterias":     "Batteries",
    "reciclar.mat.bombillos":    "Light bulbs",
    "reciclar.mat.carton":       "Cardboard",
    "reciclar.mat.tetrapak":     "Tetra Pak",
    "reciclar.mat.aceite":       "Cooking oil",
    "reciclar.mat.tela":         "Fabric",
    "reciclar.mat.cuero":        "Leather",
    "reciclar.mat.utilesescolares": "School supplies",

    "reciclar.escaner.title": "Smart scanner",
    "reciclar.escaner.sub":   "Scan any object and our AI will tell you if it's recyclable, its category, how to prepare it, and where to take it.",
    "reciclar.escaner.drop1": "Take a photo or upload an image",
    "reciclar.escaner.drop2": "JPG, PNG or WEBP (max. 10MB)",
    "reciclar.escaner.f1": "Is it recyclable?",
    "reciclar.escaner.f1.aria": "See if it's recyclable in the information panel",
    "reciclar.escaner.f2": "Category",
    "reciclar.escaner.f2.aria": "See the category and what it's made of in the information panel",
    "reciclar.escaner.f3": "Where to take it",
    "reciclar.escaner.f3.aria": "See drop-off points in the information panel",
    "reciclar.escaner.f4": "How to prepare it",
    "reciclar.escaner.f4.aria": "See how to prepare it in the information panel",
    "reciclar.escaner.cargandoModelo": "Preparing the recognition engine (first time only)…",
    "reciclar.escaner.analizando": "Analyzing the image…",
    "reciclar.escaner.detectamos": "We detected",
    "reciclar.escaner.mensajeReciclable": "✅ This is recyclable.",
    "reciclar.escaner.mensajePuntoEspecial": "⚠️ This is recyclable, but needs a special drop-off point.",
    "reciclar.escaner.confianza": "Confidence",
    "reciclar.escaner.bajaConfianza": "We're not fully sure. If this doesn't match, try another photo or choose the material manually above.",
    "reciclar.escaner.verAbajo": "See the full details in the panel below ↓",
    "reciclar.escaner.noReconocido": "We couldn't confidently identify the object",
    "reciclar.escaner.sugerencia": "Try better lighting, get closer to the object, or focus it better. You can also choose the category manually from the list above.",
    "reciclar.escaner.error": "We couldn't analyze the image",
    "reciclar.escaner.errorTipo": "That file isn't an image. Upload a JPG, PNG or WEBP photo.",
    "reciclar.escaner.errorTamano": "The image is too large. The maximum is 10MB.",
    "reciclar.escaner.errorGeneral": "Something went wrong analyzing the image. Check your connection and try again.",

    "reciclar.proceso.title": "The recycling process",
    "reciclar.proceso.p1.t": "Object",
    "reciclar.proceso.p1.d": "You use a product in your daily life.",
    "reciclar.proceso.p2.t": "Sorting",
    "reciclar.proceso.p2.d": "You separate and sort it correctly.",
    "reciclar.proceso.p3.t": "Recycling center",
    "reciclar.proceso.p3.d": "Materials arrive at collection centers.",
    "reciclar.proceso.p4.t": "Transformation",
    "reciclar.proceso.p4.d": "Materials are processed into raw material.",
    "reciclar.proceso.p5.t": "New product",
    "reciclar.proceso.p5.d": "New products are made for a sustainable future.",

    "reciclar.centros.title": "Nearby recycling centers",
    "reciclar.centros.btn":   "View full map",

    "reciclar.calc.title": "Impact calculator",
    "reciclar.calc.sub":   "Enter what you recycled today and discover your positive impact.",
    "reciclar.calc.f1": "Plastic bottles",
    "reciclar.calc.f2": "Aluminum cans",
    "reciclar.calc.f3": "Sheets of paper",
    "reciclar.calc.uds": "units",
    "reciclar.calc.btn": "Calculate impact",
    "reciclar.calc.r1":  "Trees protected",
    "reciclar.calc.r1u": "trees",
    "reciclar.calc.r2":  "Energy saved",
    "reciclar.calc.r3":  "Water saved",
    "reciclar.calc.r3u": "liters",
    "reciclar.calc.r4":  "CO₂ avoided",
    "reciclar.calc.r4u": "kg",

    "reciclar.historial.title.pre": "My",
    "reciclar.historial.title": "Recycling history",
    "reciclar.historial.nivel": "Current level",
    "reciclar.historial.brote": "Sprout",
    "reciclar.historial.s1": "Items recycled",
    "reciclar.historial.s2": "Impact generated",
    "reciclar.historial.s3": "Points earned",
    "reciclar.historial.s4": "Badges earned",
    "reciclar.historial.btn": "See full history",

    "reciclar.ctafinal.title": "Every object counts.",
    "reciclar.ctafinal.desc":  "Turn it into a new opportunity for the planet.",
    "reciclar.ctafinal.btn":   "Start recycling",

    /* ── LOGIN ── */
    "login.title":       "Welcome",
    "login.subtitle":    "Your action today creates tomorrow.",
    "login.email":       "Email",
    "login.email.placeholder": "name@example.com",
    "login.password":    "Password",
    "login.password.placeholder": "••••••••",
    "login.forgot":      "Forgot your password?",
    "login.submit":      "Sign in",
    "login.or":          "Or continue with",
    "login.google":      "Google",
    "login.apple":       "Apple",
    "login.noAccount":   "Don't have an account?",
    "login.register":    "Sign up",
    "login.brand":       "RECO+",

    /* ── REGISTER ── */
    "register.title":            "Create your account",
    "register.subtitle":         "Join us and give a second life to what you no longer use.",
    "register.name":             "Full name",
    "register.name.placeholder": "Your name",
    "register.confirmPassword":  "Confirm password",
    "register.submit":           "Create account",
    "register.hasAccount":       "Already have an account?",
    "register.login":            "Sign in",

    /* ── RESET PASSWORD ── */
    "reset.title":               "New password",
    "reset.subtitle":            "Choose a new password for your account.",
    "reset.newPassword":         "New password",
    "reset.confirmPassword":     "Confirm password",
    "reset.submit":              "Save password",
    "reset.backToLogin":         "Back to sign in",
    "reset.linkInvalido":        "This link isn't valid or has expired. Request a new one from the sign-in page.",
    "reset.errorLongitud":       "Password must be at least 6 characters long.",
    "reset.errorNoCoincide":     "Passwords don't match.",
    "reset.exito":               "Password updated! Redirecting to sign in…",

    /* ── SETTINGS (account modal) ── */
    "ajustes.titulo":              "Settings",
    "ajustes.cerrar":              "Close",

    "ajustes.tab.cuenta":          "Account",
    "ajustes.tab.apariencia":      "Appearance",
    "ajustes.tab.preferencias":    "Preferences",
    "ajustes.tab.privacidad":      "Privacy",

    "ajustes.cuenta.perfil":              "Profile",
    "ajustes.cuenta.nombreLabel":         "Display name",
    "ajustes.cuenta.nombrePlaceholder":   "Your name",
    "ajustes.cuenta.emailLabel":          "Email address",
    "ajustes.cuenta.guardar":             "Save changes",
    "ajustes.cuenta.guardando":           "Saving…",
    "ajustes.cuenta.infoPersonal":        "Personal information",
    "ajustes.cuenta.telefonoLabel":       "Phone (optional)",
    "ajustes.cuenta.telefonoPlaceholder": "+507 6000-0000",
    "ajustes.cuenta.ciudadLabel":         "City",
    "ajustes.cuenta.ciudadPlaceholder":   "E.g. David, Panama",
    "ajustes.cuenta.statusOk":            "Changes saved.",
    "ajustes.cuenta.statusServicioNoDisponible": "Service unavailable.",
    "ajustes.cuenta.statusErrorGuardar":  "Couldn't save: {msg}",
    "ajustes.cuenta.statusErrorConexion": "Couldn't connect. Please try again.",

    "ajustes.apariencia.temaLabel":   "Theme",
    "ajustes.apariencia.temaDesc":    "Choose how RECO+ looks on this device.",
    "ajustes.apariencia.claro":       "Light",
    "ajustes.apariencia.oscuro":      "Dark",
    "ajustes.apariencia.fuenteLabel": "Font size",
    "ajustes.apariencia.fuenteDesc":  "Adjust the text size across the whole site.",

    "ajustes.preferencias.idiomaLabel":       "Language",
    "ajustes.preferencias.idiomaDesc":        "RECO+ interface language.",
    "ajustes.preferencias.notifLabel":        "Notifications",
    "ajustes.preferencias.notifDesc":         "Alerts about requests, messages and updates.",
    "ajustes.preferencias.ubicacionLabel":    "Location",
    "ajustes.preferencias.ubicacionDesc":     "Allows suggesting recycling points near you.",
    "ajustes.preferencias.camaraLabel":       "Camera",
    "ajustes.preferencias.camaraDesc":        "Needed for the material scanner.",

    "ajustes.privacidad.sesion":           "Session",
    "ajustes.privacidad.cerrarSesionLabel":"Log out",
    "ajustes.privacidad.cerrarSesionDesc": "You'll be signed out on this device.",
    "ajustes.privacidad.cerrarSesionBtn":  "Log out",
    "ajustes.privacidad.cerrando":         "Logging out…",
    "ajustes.privacidad.eliminarLabel":    "Delete account",
    "ajustes.privacidad.eliminarDesc":     "This action is permanent. Your RECO+ data will be deleted and cannot be recovered.",
    "ajustes.privacidad.eliminarBtn":      "Delete my account",
    "ajustes.privacidad.eliminarConfirmar":"Confirm? Tap again",
    "ajustes.privacidad.eliminarStatus":   "To delete your account, email us at soporte.recoplus@gmail.com. (Requires server-side verification.)",

    /* ── CONTACT (contacto.html page) ── */
    "contacto.hero.title":        "We're here<br>to help you",
    "contacto.hero.desc":         "Have questions, suggestions, or want to work with us? Write to us and we'll get in touch as soon as possible.",
    "contacto.perk1.title":       "Fast response",
    "contacto.perk1.desc":        "We reply in under 24 hours",
    "contacto.perk2.title":       "Committed",
    "contacto.perk2.desc":        "Close, personalized attention",
    "contacto.perk3.title":       "Confidential",
    "contacto.perk3.desc":        "Your data is safe with us",

    "contacto.form.title":            "Send us a message",
    "contacto.form.nombreLabel":      "Full name",
    "contacto.form.nombrePh":         "Write your name",
    "contacto.form.nombreError":      "Please write your name.",
    "contacto.form.correoLabel":      "Email address",
    "contacto.form.correoPh":         "Write your email",
    "contacto.form.correoError":      "Enter a valid email.",
    "contacto.form.asuntoLabel":      "Subject",
    "contacto.form.asuntoDefault":    "Select a subject",
    "contacto.form.asunto.reciclaje": "Recycling questions",
    "contacto.form.asunto.donaciones":"Donations or alliances",
    "contacto.form.asunto.pedidos":   "Store orders",
    "contacto.form.asunto.problema":  "Report a problem",
    "contacto.form.asunto.otro":      "Other",
    "contacto.form.asuntoError":      "Select a subject.",
    "contacto.form.mensajeLabel":     "Message",
    "contacto.form.mensajePh":        "Tell us how we can help you...",
    "contacto.form.mensajeError":     "Write your message.",
    "contacto.form.privacidad":       "I accept the <a href=\"#\">privacy policy</a> and the processing of my data.",
    "contacto.form.submit":           "Send message",
    "contacto.form.enviando":         "Sending...",
    "contacto.form.errorRevisa":      "Please review the highlighted fields before continuing.",
    "contacto.form.exito":            "Thank you! Your message was sent, we'll reply soon.",

    "contacto.otras.title":       "Other ways to reach us",
    "contacto.otras.correo.title":"Email",
    "contacto.otras.correo.sub":  "We'll reply in under 24h",
    "contacto.otras.tel.title":   "Phone / WhatsApp",
    "contacto.otras.tel.sub":     "Monday to Friday, 9:00 to 18:00",
    "contacto.otras.dir.title":   "Address",
    "contacto.otras.redes.title": "Social media",
    "contacto.otras.redes.sub":   "Follow us and write to us",

    "contacto.mapa.title": "Where are we?",
    "contacto.mapa.desc":  "Visit us at our offices or find us on the map.",
    "contacto.mapa.btn":   "View on Google Maps",
    "contacto.mapa.alt":   "Illustrative map of RECO+'s location",

    "contacto.ayuda.title":         "Need help with something specific?",
    "contacto.ayuda.reciclaje.title":"Recycling questions",
    "contacto.ayuda.reciclaje.desc": "We'll help you recycle correctly.",
    "contacto.ayuda.reciclaje.link": "Go to the guide",
    "contacto.ayuda.donaciones.title":"Donations or alliances",
    "contacto.ayuda.donaciones.desc": "Learn how to collaborate with RECO+.",
    "contacto.ayuda.donaciones.link": "Learn more",
    "contacto.ayuda.tienda.title":  "Store orders",
    "contacto.ayuda.tienda.desc":   "Questions about shipping, products and more.",
    "contacto.ayuda.tienda.link":   "Go to store",
    "contacto.ayuda.reportar.title":"Report a problem",
    "contacto.ayuda.reportar.desc": "Help us improve by reporting here.",
    "contacto.ayuda.reportar.link": "Report",

    "contacto.cta.title": "Together we make a difference",
    "contacto.cta.desc":  "Every message, idea and collaboration brings us closer to a cleaner, more caring and sustainable world.",
    "contacto.cta.btn":   "Join the community",

    "contacto.partners.title": "Companies and allies that trust us",

    "contacto.footer.desc":       "Community platform to recycle, donate and build a more sustainable future.",
    "contacto.footer.nav.inicio": "Home",
    "contacto.footer.nav.mapa":   "Map",
    "contacto.footer.nav.guia":   "Guide",
    "contacto.footer.nav.donar":  "Donate / Help",
    "contacto.footer.nav.tienda": "EcoTech Store",
    "contacto.footer.nav.blog":   "Blog",
    "contacto.footer.nav.nosotros":"About us",
    "contacto.footer.newsletter.desc": "Get the latest sustainability news.",

    /* ── SCANNER DEMO (scanner-demo.html page) ── */
    "scannerdemo.eyebrow":        "RECO+ · Scanner",
    "scannerdemo.title":          "What are you recycling?",
    "scannerdemo.subtitle":       "Point the camera at the object. We'll identify it and tell you which category it belongs to.",
    "scannerdemo.overlay.inicial":"Tap \"Start scanner\" to turn on the camera.",
    "scannerdemo.overlay.solicitando": "Requesting camera access...",
    "scannerdemo.overlay.cargandoModelo": "Loading the recognition model (this may take a few seconds)...",
    "scannerdemo.overlay.listo":  "Ready. Point at the object.",
    "scannerdemo.overlay.error":  "Something went wrong.",
    "scannerdemo.btn.iniciar":    "Start scanner",
    "scannerdemo.btn.reintentar": "Retry",
    "scannerdemo.btn.pausar":     "Pause",
    "scannerdemo.btn.reanudar":   "Resume",
    "scannerdemo.btn.detener":    "Stop camera",
    "scannerdemo.btn.ia":         "✨ Precise scan (AI)",
    "scannerdemo.btn.iaCapturando": "📸 Capturing...",
    "scannerdemo.btn.iaConsultando": "🔎 Asking AI...",
    "scannerdemo.btn.volverEscanear": "🔄 Scan again",
    "scannerdemo.resultado.esperando": "Waiting for object...",
    "scannerdemo.confianza.alta": "AI · high confidence",
    "scannerdemo.confianza.media": "AI · medium confidence",
    "scannerdemo.confianza.baja": "AI · low confidence",
    "scannerdemo.confianza.ia":   "AI",
    "scannerdemo.confianza.sinCerteza": "Not sure",
    "scannerdemo.confianza.detalleSinCerteza": "Get closer or improve lighting.",
    "scannerdemo.confianza.baja2": "Low confidence",
    "scannerdemo.confianza.consenso": "Consensus {votos}",
    "scannerdemo.deteccion.gemini": "Gemini detected: {label}",
    "scannerdemo.deteccion.clasificadoIA": "Classified by AI",
    "scannerdemo.deteccion.keyword": "Detected as \"{kw}\"",
    "scannerdemo.deteccion.sinCategoria": "No exact category (saw: \"{top}\")",
    "scannerdemo.historial.title": "Detected this session",
    "scannerdemo.historial.vacio": "Nothing detected yet.",

    /* ── COMENTAR (comentar-modal.js — footer button on every page) ── */
    "comentar.boton":         "Leave a comment",
    "comentar.titulo":        "Share your experience",
    "comentar.necesitaSesion":"Sign in to post a comment and rate your experience with RECO+.",
    "comentar.ratingLabel":   "Your rating",
    "comentar.textoLabel":    "Your comment",
    "comentar.textoPlaceholder": "Tell us how your experience with RECO+ has been...",
    "comentar.publicar":      "Post comment",
    "comentar.publicando":    "Posting…",
    "comentar.statusFaltaRating": "Select at least one star.",
    "comentar.statusFaltaTexto":  "Write a comment before posting.",
    "comentar.statusServicioNoDisponible": "Service unavailable right now.",
    "comentar.statusError":         "Couldn't post your comment. Try again.",
    "comentar.statusOk":            "Thanks for your comment!",
    "comentar.statusErrorConexion": "Couldn't connect. Check your internet.",

    /* ════════════════════════════════════════════════
       CAMPAIGNS (campanas-modal.js — alianzas.html)
       Options modal + 3-step wizard to publish a recycling or
       donation campaign, plus session/approval notices.
       ════════════════════════════════════════════════ */

    /* ── Options modal ("Explore initiatives →") ── */
    "campanas.opciones.kicker": "Projects and campaigns",
    "campanas.opciones.titulo": "Campaigns and initiatives",
    "campanas.opciones.desc": "Discover recycling and donation campaigns from our allies, or publish your own if you represent a company registered on RECO+.",
    "campanas.opciones.ver.titulo": "View active campaigns",
    "campanas.opciones.ver.desc": "Explore campaigns already published by allied companies.",
    "campanas.opciones.publicar.titulo": "Publish a campaign",
    "campanas.opciones.publicar.desc": "Share your next recycling or donation campaign.",

    /* ── Notices: session / company / approval / plan limit ── */
    "campanas.aviso.kicker": "Publish campaign",
    "campanas.aviso.cerrar": "Close",
    "campanas.aviso.sesion.titulo": "Sign in first",
    "campanas.aviso.sesion.msg": "To publish a campaign, you first need to sign in with your allied company's account.",
    "campanas.aviso.sesion.btn": "Sign in →",
    "campanas.aviso.servicioNoDisponible.titulo": "Service unavailable",
    "campanas.aviso.servicioNoDisponible.msg": "Couldn't connect to the service. Try again later.",
    "campanas.aviso.errorVerificar.titulo": "We couldn't verify your company",
    "campanas.aviso.errorVerificar.msg": "There was a problem checking your ally registration. Try again.",
    "campanas.aviso.errorVerificarConexion.msg": "There was a connection problem. Try again.",
    "campanas.aviso.registraEmpresa.titulo": "Register your company first",
    "campanas.aviso.registraEmpresa.msg": "You don't have a company registered as a RECO+ ally yet. Register it first; once approved you'll be able to publish campaigns.",
    "campanas.aviso.registraEmpresa.btn": "Register my company →",
    "campanas.aviso.pendiente.titulo": "Company pending approval",
    "campanas.aviso.rechazado.msg": "Your company's registration was rejected, so you can't publish campaigns yet. Update your details from Settings and wait for a new review.",
    "campanas.aviso.pendiente.msg": "Your company is pending review. You'll be able to publish campaigns once it's approved.",
    "campanas.aviso.ajustesBtn": "Go to account Settings →",
    "campanas.aviso.limite.titulo": "You reached your plan's limit",
    "campanas.aviso.limite.msg": "Your {plan} plan allows up to {max} active campaign{plural} at a time. Close an existing campaign or upgrade your plan to publish more.",
    "campanas.aviso.verPlanesBtn": "View plans →",

    /* ── Step 1: Campaign details ── */
    "campanas.paso1.desc": "Tell us what your campaign is about. It will appear on Donate once we approve it.",
    "campanas.paso1.tipoLabel": "Campaign type",
    "campanas.paso1.tipoReciclaje": "♻️ Recycling",
    "campanas.paso1.tipoDonacion": "🎁 Donation",
    "campanas.paso1.tituloLabel": "Campaign title",
    "campanas.paso1.tituloPh": "E.g. Electronics collection drive in David",
    "campanas.paso1.tituloError": "Enter a title for the campaign.",
    "campanas.paso1.descLabel": "Description",
    "campanas.paso1.descPh": "Explain what the campaign is about, how to take part, and what will be done with what's collected...",
    "campanas.paso1.descHint": "{n} / 500 (minimum 20 characters)",
    "campanas.paso1.descError": "Write a description of at least 20 characters.",
    "campanas.paso1.bannerLabel": "Campaign banner",
    "campanas.paso1.bannerCambiar": "Change banner",
    "campanas.paso1.bannerSubir": "Upload banner",
    "campanas.paso1.bannerQuitar": "Remove",
    "campanas.paso1.bannerHint": "JPG, PNG or WEBP, max. 4MB.",
    "campanas.paso1.bannerAlert": "The image is too large (max. 4MB).",

    /* ── Step 2: Location and duration ── */
    "campanas.paso2.desc": "Where does the campaign take place, and how long will it run?",
    "campanas.paso2.provinciaLabel": "Province or region",
    "campanas.paso2.provinciaDefault": "Select a province",
    "campanas.paso2.provinciaError": "Select a province.",
    "campanas.paso2.distritoLabel": "District or city",
    "campanas.paso2.distritoError": "Enter the district or city.",
    "campanas.paso2.direccionLabel": "Address or meeting point",
    "campanas.paso2.direccionError": "Enter the address or meeting point.",
    "campanas.paso2.fechaInicioLabel": "Start date",
    "campanas.paso2.fechaInicioError": "Select the start date.",
    "campanas.paso2.fechaFinLabel": "End date",
    "campanas.paso2.fechaFinErrorDefault": "The end date must be on or after the start date.",
    "campanas.paso2.fechaFinErrorPlan": "Your {plan} plan allows campaigns of up to {dias} days. Shorten the date range or upgrade your plan.",

    /* ── Step 3: Campaign goal ── */
    "campanas.paso3.desc": "Lastly, tell us the campaign's goal.",
    "campanas.paso3.etiquetaReciclaje": "What materials are accepted?",
    "campanas.paso3.etiquetaDonacion": "What categories are accepted?",
    "campanas.paso3.seleccionados": "selected",
    "campanas.paso3.error": "Select at least one option.",
    "campanas.paso3.metaLabel": "Campaign target",
    "campanas.paso3.metaCantidadPh": "E.g. 500",
    "campanas.paso3.metaUnidadPh": "E.g. kg, items, people",
    "campanas.paso3.metaHint": "E.g. \"500\" + \"kg\", or \"200\" + \"items\". Shown as a progress bar on Donate.",

    /* ── General wizard / submission ── */
    "campanas.kicker": "Publish campaign · Step {n} of {total}",
    "campanas.paso.datos.titulo": "Campaign details",
    "campanas.paso.ubicacion.titulo": "Location and duration",
    "campanas.paso.objetivo.titulo": "Campaign goal",
    "campanas.btnAtras": "← Back",
    "campanas.btnSiguiente": "Next →",
    "campanas.btnPublicar": "Publish campaign ✓",
    "campanas.btnPublicando": "Publishing...",
    "campanas.statusRevisa": "Review the highlighted fields before continuing.",
    "campanas.confirmCerrar": "Are you sure you want to close? The information entered in this form will be lost.",
    "campanas.envio.verificandoSesion": "Verifying your session...",
    "campanas.envio.sesionExpirada": "Your session expired. Sign in again and try once more.",
    "campanas.envio.subiendoBanner": "Uploading banner...",
    "campanas.envio.publicando": "Publishing your campaign...",
    "campanas.envio.exito": "✓ Campaign sent! It will be pending review and will appear on Donate once approved.",
    "campanas.envio.errorPermisos": "Couldn't publish due to a permissions issue (is your company still approved?).",
    "campanas.envio.errorConexion": "Couldn't connect. Check your internet connection.",
    "campanas.envio.errorGenerico": "An unexpected error occurred. Try again.",
    "campanas.envio.errorServicio": "Couldn't connect to the service. Try again later.",

    /* ════════════════════════════════════════════════
       SETTINGS: "My company" (ajustes-empresa.js)
       ════════════════════════════════════════════════ */
    "ajemp.tab.miEmpresa": "My company",
    "ajemp.estado.pendiente": "Pending review",
    "ajemp.estado.aprobado": "Approved",
    "ajemp.estado.rechazado": "Rejected",
    "ajemp.estadoNota.pendiente": "Your company is under review. It will appear publicly on RECO+ once approved.",
    "ajemp.estadoNota.aprobado": "Your company is now publicly visible as a RECO+ ally.",
    "ajemp.estadoNota.rechazado": "Your registration was rejected. You can update the details and it will be pending a new review.",

    "ajemp.datos.titulo": "Company details",
    "ajemp.datos.nombreLabel": "Company name",
    "ajemp.datos.nombreComercialLabel": "Trade name",
    "ajemp.datos.rucLabel": "Registration number or Tax ID",
    "ajemp.datos.tipoLabel": "Company type",
    "ajemp.datos.descripcionLabel": "Description",
    "ajemp.datos.guardarBtn": "Save details",

    "ajemp.contacto.titulo": "Contact",
    "ajemp.contacto.telefonoLabel": "Phone",
    "ajemp.contacto.whatsappLabel": "WhatsApp",
    "ajemp.contacto.sitioWebLabel": "Website",
    "ajemp.contacto.guardarBtn": "Save contact",

    "ajemp.ubicacion.titulo": "Location",
    "ajemp.ubicacion.provinciaLabel": "Province or region",
    "ajemp.ubicacion.distritoLabel": "District or city",
    "ajemp.ubicacion.direccionLabel": "Full address",
    "ajemp.ubicacion.guardarBtn": "Save location",

    "ajemp.materiales.titulo": "Materials they accept",
    "ajemp.servicios.titulo": "Services they offer",
    "ajemp.chip.seleccionados": "selected",
    "ajemp.matServ.guardarBtn": "Save materials and services",

    "ajemp.borrar.titulo": "Delete company",
    "ajemp.borrar.desc": "This action is permanent: your company's profile on RECO+ (including logo and photos) will be deleted and it will stop appearing as an ally. Your user account will NOT be deleted.",
    "ajemp.borrar.confirmarLabel": "Type {nombre} to confirm",
    "ajemp.borrar.btn": "Delete company",
    "ajemp.borrar.borrando": "Deleting...",

    "ajemp.status.guardando": "Saving...",
    "ajemp.status.guardadoOk": "Saved successfully.",
    "ajemp.status.errorPermisos": "Couldn't save due to a permissions issue.",
    "ajemp.status.errorConexion": "Couldn't connect. Check your internet connection.",
    "ajemp.status.errorGenerico": "An unexpected error occurred. Try again.",
    "ajemp.status.servicioNoDisponible": "Service unavailable.",

    "ajemp.tipo.centroReciclaje": "Recycling center",
    "ajemp.tipo.empresaRecicladora": "Recycling company",
    "ajemp.tipo.puntoAcopio": "Collection point",
    "ajemp.tipo.transportista": "Waste transporter",
    "ajemp.tipo.otro": "Other",

    "ajemp.mat.plastico": "Plastic",
    "ajemp.mat.vidrio": "Glass",
    "ajemp.mat.metal": "Metal",
    "ajemp.mat.papel": "Paper",
    "ajemp.mat.carton": "Cardboard",
    "ajemp.mat.libros": "Books",
    "ajemp.mat.electronicos": "Electronics",
    "ajemp.mat.celulares": "Cell phones",
    "ajemp.mat.baterias": "Batteries",
    "ajemp.mat.bombillos": "Light bulbs",
    "ajemp.mat.ropa": "Clothes",
    "ajemp.mat.tela": "Fabric",
    "ajemp.mat.cuero": "Leather",
    "ajemp.mat.muebles": "Furniture",
    "ajemp.mat.juguetes": "Toys",
    "ajemp.mat.utilesescolares": "School supplies",
    "ajemp.mat.tetrapak": "Tetra Pak",
    "ajemp.mat.aceite": "Cooking oil",

    "ajemp.serv.compraMateriales": "Purchase of recyclable materials",
    "ajemp.serv.recoleccionDomicilio": "Home pickup",
    "ajemp.serv.recoleccionEmpresarial": "Business pickup",
    "ajemp.serv.transporteResiduos": "Waste transport",
    "ajemp.serv.destruccionCertificada": "Certified destruction",
    "ajemp.serv.gestionElectronicos": "E-waste management",
    "ajemp.serv.asesoriaAmbiental": "Environmental consulting",
    "ajemp.serv.educacionAmbiental": "Environmental education",
    "ajemp.serv.ventaMateriales": "Sale of recycled materials",

    /* ════════════════════════════════════════════════
       SETTINGS: "My plan" (ajustes-plan.js) + suscripcion-planes.js
       ════════════════════════════════════════════════ */
    "ajplan.tab.miPlan": "My plan",
    "ajplan.cargando": "Loading your plan…",
    "ajplan.uso.label": "AI scans today",
    "ajplan.uso.ilimitado": "Unlimited",
    "ajplan.planLabel": "{nombre} Plan",
    "ajplan.verCambiarBtn": "View and change plan",

    "planes.gratis.nombre": "Free",
    "planes.gratis.precioLabel": "Free",
    "planes.gratis.beneficio1": "10 AI scans per day",
    "planes.gratis.beneficio2": "1 active campaign at a time",
    "planes.gratis.beneficio3": "Campaigns up to 3 days long",
    "planes.basico.nombre": "Basic",
    "planes.basico.beneficio1": "50 AI scans per day",
    "planes.basico.beneficio2": "Up to 3 active campaigns at a time",
    "planes.basico.beneficio3": "Campaigns up to 7 days long",
    "planes.premium.nombre": "Premium",
    "planes.premium.beneficio1": "Unlimited AI scans",
    "planes.premium.beneficio2": "Unlimited active campaigns",
    "planes.premium.beneficio3": "Campaigns up to 30 days long",
    "planes.premium.beneficio4": "Your company appears in Featured Allies",
    "planes.limite.ilimitado": "Unlimited",

    /* ════════════════════════════════════════════════
       RECYCLE: material info windows (reciclar-material-info.js)
       Fixed labels + local fallback content
       ════════════════════════════════════════════════ */
    "rminfo.tipoObjeto": "Object type:",
    "rminfo.materialesCompuestos": "Materials it's made of:",
    "rminfo.tiempoDescomposicion": "Decomposition time:",
    "rminfo.comoPrepararlo": "How to prepare it",
    "rminfo.dondeLlevarlo": "Where to take it",
    "rminfo.queSeObtiene": "What you get",
    "rminfo.tipsExtra": "Extra tips",
    "rminfo.impacto": "Impact:",
    "rminfo.verEnMapa": "See points on the map",
    "rminfo.sabiasQue": "Did you know…?",
    "rminfo.esReciclable": "✅ This is recyclable.",
    "rminfo.puntoEspecial": "⚠️ This is recyclable, but needs a special drop-off point.",
    "rminfo.sinCategoria": "No category data for this material yet.",
    "rminfo.anterior": "Previous",
    "rminfo.siguiente": "Next",
    "rminfo.cerrar": "Close",

    "rminfo.badge.reciclable": "Recyclable",
    "rminfo.badge.reutilizable": "Reusable",
    "rminfo.badge.puntoEspecial": "Needs a special drop-off point",
    "rminfo.badge.reciclableDonable": "Recyclable / Donatable",

    "rminfo.lugar.recomendado": "Recommended",
    "rminfo.lugar.alternativa": "Alternative",
    "rminfo.lugar.mayorVolumen": "Higher volume",
    "rminfo.lugar.obligatorio": "Required",
    "rminfo.lugar.segunFabricante": "Depends on brand",
    "rminfo.lugar.temporales": "Temporary",
    "rminfo.lugar.siBuenEstado": "If in good condition",
    "rminfo.lugar.ropaDaniada": "Damaged or incomplete clothing",
    "rminfo.lugar.mueblesDaniados": "Damaged furniture",
    "rminfo.lugar.muyDeteriorados": "If very worn",
    "rminfo.lugar.juguetesDaniados": "Damaged toys",
    "rminfo.lugar.retazosReparacion": "Scraps and repair",

    "rminfo.mat.electronicos.badge": "Needs a special drop-off point",
    "rminfo.mat.electronicos.prep1": "Erase your personal data and back it up before handing it over.",
    "rminfo.mat.electronicos.prep2": "Remove batteries if the device allows it.",
    "rminfo.mat.electronicos.prep3": "Hand it over whole, without disassembling or removing internal parts.",
    "rminfo.mat.electronicos.lugar1": "E-waste collection centers",
    "rminfo.mat.electronicos.lugar2": "Participating brand drop-off points",
    "rminfo.mat.electronicos.lugar3": "Municipal e-waste campaigns",
    "rminfo.mat.electronicos.obt1": "Metals like gold, copper, and aluminum are recovered.",
    "rminfo.mat.electronicos.obt2": "Prevents toxic components from leaching into the soil.",
    "rminfo.mat.electronicos.obt3": "Reusable parts extend the life of other devices.",
    "rminfo.mat.electronicos.impacto": "Every device recycled avoids lead and mercury pollution.",

    "rminfo.mat.celulares.badge": "Needs a special drop-off point",
    "rminfo.mat.celulares.prep1": "Back up your photos and contacts, then wipe the device.",
    "rminfo.mat.celulares.prep2": "Remove the case, SIM card, and memory card.",
    "rminfo.mat.celulares.prep3": "If the battery is swollen, don't handle it: hand it over as-is.",
    "rminfo.mat.celulares.lugar1": "Carrier collection points",
    "rminfo.mat.celulares.lugar2": "E-waste collection centers",
    "rminfo.mat.celulares.obt1": "Precious metals are recovered from the motherboard.",
    "rminfo.mat.celulares.obt2": "Working devices can be refurbished and donated.",
    "rminfo.mat.celulares.obt3": "Prevents damaged batteries from ending up in landfills.",
    "rminfo.mat.celulares.impacto": "A recycled phone recovers up to 30 different materials.",

    "rminfo.mat.plastico.badge": "Recyclable",
    "rminfo.mat.plastico.prep1": "Rinse the container to remove food or liquid residue.",
    "rminfo.mat.plastico.prep2": "Remove caps and labels if made of a different material.",
    "rminfo.mat.plastico.prep3": "Flatten it to save space, without breaking it into small pieces.",
    "rminfo.mat.plastico.lugar1": "Municipal recycling bins",
    "rminfo.mat.plastico.lugar2": "Plastic collection centers",
    "rminfo.mat.plastico.obt1": "It's turned into textile fiber, furniture, or new containers.",
    "rminfo.mat.plastico.obt2": "Reduces oil extraction for virgin plastic.",
    "rminfo.mat.plastico.obt3": "Cuts down the amount of plastic reaching rivers and oceans.",
    "rminfo.mat.plastico.impacto": "Recycling 1 kg of plastic saves about 2 kg of CO₂.",

    "rminfo.mat.metal.badge": "Recyclable",
    "rminfo.mat.metal.prep1": "Rinse cans and metal containers to remove residue.",
    "rminfo.mat.metal.prep2": "Separate plastic or glass lids if combined.",
    "rminfo.mat.metal.prep3": "Crushing cans isn't required, but it helps with transport.",
    "rminfo.mat.metal.lugar1": "Municipal recycling bins",
    "rminfo.mat.metal.lugar2": "Scrapyards and metal collection centers",
    "rminfo.mat.metal.obt1": "Metal is melted down and reused with almost no quality loss.",
    "rminfo.mat.metal.obt2": "Saves energy compared to extracting new metal.",
    "rminfo.mat.metal.obt3": "Reduces mining and its associated environmental impact.",
    "rminfo.mat.metal.impacto": "Recycled aluminum uses up to 95% less energy than new aluminum.",

    "rminfo.mat.papel.badge": "Recyclable",
    "rminfo.mat.papel.prep1": "Keep it dry: wet paper can't be recycled.",
    "rminfo.mat.papel.prep2": "Remove clips, staples, and metal spirals.",
    "rminfo.mat.papel.prep3": "Separate waxed or laminated paper, which doesn't apply here.",
    "rminfo.mat.papel.lugar1": "Municipal recycling bins",
    "rminfo.mat.papel.lugar2": "Paper and cardboard collection centers",
    "rminfo.mat.papel.obt1": "It's turned into new paper, cardboard, or packaging.",
    "rminfo.mat.papel.obt2": "Every ton recycled saves trees from being cut down.",
    "rminfo.mat.papel.obt3": "Reduces water use compared to producing virgin paper.",
    "rminfo.mat.papel.impacto": "Recycling paper saves water, energy, and standing trees.",

    "rminfo.mat.vidrio.badge": "Recyclable",
    "rminfo.mat.vidrio.prep1": "Rinse the container and remove metal or plastic lids.",
    "rminfo.mat.vidrio.prep2": "No need to remove paper labels.",
    "rminfo.mat.vidrio.prep3": "Wrap broken glass to avoid injuries during transport.",
    "rminfo.mat.vidrio.lugar1": "Municipal recycling bins",
    "rminfo.mat.vidrio.lugar2": "Glass collection centers",
    "rminfo.mat.vidrio.obt1": "Glass is melted down and reused endlessly without losing quality.",
    "rminfo.mat.vidrio.obt2": "Saves energy compared to making glass from raw materials.",
    "rminfo.mat.vidrio.obt3": "Reduces the extraction of sand and other minerals.",
    "rminfo.mat.vidrio.impacto": "Glass is 100% recyclable without losing purity or quality.",

    "rminfo.mat.ropa.badge": "Recyclable / Donatable",
    "rminfo.mat.ropa.prep1": "Wash and dry the clothes before handing them over.",
    "rminfo.mat.ropa.prep2": "Separate items in good condition (donation) from damaged ones (textile).",
    "rminfo.mat.ropa.prep3": "Pair up shoes and accessories to make drop-off easier.",
    "rminfo.mat.ropa.lugar1": "Foundations and clothing banks",
    "rminfo.mat.ropa.lugar2": "Textile collection points",
    "rminfo.mat.ropa.obt1": "Items in good condition directly help other families.",
    "rminfo.mat.ropa.obt2": "Damaged clothing is turned into industrial rags or filling.",
    "rminfo.mat.ropa.obt3": "Reduces demand for new textile fibers.",
    "rminfo.mat.ropa.impacto": "Donating a garment can give it up to 3 more useful lives.",

    "rminfo.mat.muebles.badge": "Reusable",
    "rminfo.mat.muebles.prep1": "Check that the furniture is functional or easily repairable.",
    "rminfo.mat.muebles.prep2": "Clean it and, if you can, take photos to make donating easier.",
    "rminfo.mat.muebles.prep3": "Only disassemble large pieces if it won't damage the structure.",
    "rminfo.mat.muebles.lugar1": "Foundations and furniture banks",
    "rminfo.mat.muebles.lugar2": "Wood and metal collection points",
    "rminfo.mat.muebles.obt1": "Reusable furniture equips homes that need it.",
    "rminfo.mat.muebles.obt2": "Wood and metal can be separated and recycled by type.",
    "rminfo.mat.muebles.obt3": "Reduces the landfill volume that furniture takes up.",
    "rminfo.mat.muebles.impacto": "A donated piece of furniture directly reduces bulky waste.",

    "rminfo.mat.libros.badge": "Reusable",
    "rminfo.mat.libros.prep1": "Check that they're complete and in good readable condition.",
    "rminfo.mat.libros.prep2": "Remove bookmarks, sticky notes, or loose material.",
    "rminfo.mat.libros.prep3": "Group them by topic or grade level if you're donating them.",
    "rminfo.mat.libros.lugar1": "Community libraries and schools",
    "rminfo.mat.libros.lugar2": "Paper collection centers",
    "rminfo.mat.libros.obt1": "Books in good condition reach new readers.",
    "rminfo.mat.libros.obt2": "Ones that can't be reused are recycled as paper.",
    "rminfo.mat.libros.obt3": "Encourages access to reading in communities with fewer resources.",
    "rminfo.mat.libros.impacto": "A donated book can pass through dozens more readers.",

    "rminfo.mat.juguetes.badge": "Reusable",
    "rminfo.mat.juguetes.prep1": "Clean them and check that they work or are complete.",
    "rminfo.mat.juguetes.prep2": "Gather loose pieces of the same toy into a bag.",
    "rminfo.mat.juguetes.prep3": "Remove batteries if the toy uses them.",
    "rminfo.mat.juguetes.lugar1": "Toy foundations and drives",
    "rminfo.mat.juguetes.lugar2": "Collection centers by material",
    "rminfo.mat.juguetes.obt1": "Working toys directly bring joy to other children.",
    "rminfo.mat.juguetes.obt2": "Plastic or metal parts can be recycled separately.",
    "rminfo.mat.juguetes.obt3": "Reduces production of new toys and its associated footprint.",
    "rminfo.mat.juguetes.impacto": "Donating toys reduces waste and creates direct social impact.",

    "rminfo.mat.baterias.badge": "Needs a special drop-off point",
    "rminfo.mat.baterias.prep1": "Never throw them in regular trash or mixed recycling.",
    "rminfo.mat.baterias.prep2": "Cover the terminals with tape if loose, to prevent short circuits.",
    "rminfo.mat.baterias.prep3": "If swollen or damaged, transport them with extra care.",
    "rminfo.mat.baterias.lugar1": "Battery collection points",
    "rminfo.mat.baterias.lugar2": "Participating electronics stores",
    "rminfo.mat.baterias.obt1": "Prevents soil and water pollution from heavy metals.",
    "rminfo.mat.baterias.obt2": "Materials like lithium, nickel, and cadmium are recovered.",
    "rminfo.mat.baterias.obt3": "Prevents fire risk from improper disposal.",
    "rminfo.mat.baterias.impacto": "A single improperly discarded battery can contaminate liters of water.",

    "rminfo.mat.bombillos.badge": "Needs a special drop-off point",
    "rminfo.mat.bombillos.prep1": "Transport them carefully to avoid breakage.",
    "rminfo.mat.bombillos.prep2": "If it's a CFL or fluorescent bulb, don't throw it in the trash.",
    "rminfo.mat.bombillos.prep3": "Keep it in its original packaging if you still have it.",
    "rminfo.mat.bombillos.lugar1": "Special waste collection points",
    "rminfo.mat.bombillos.lugar2": "Participating lighting stores",
    "rminfo.mat.bombillos.obt1": "Prevents mercury release from fluorescent bulbs.",
    "rminfo.mat.bombillos.obt2": "Glass and internal metal parts are recovered.",
    "rminfo.mat.bombillos.obt3": "Reduces landfill contamination risk.",
    "rminfo.mat.bombillos.impacto": "Fluorescent bulbs need special handling because of their mercury content.",

    "rminfo.mat.carton.badge": "Recyclable",
    "rminfo.mat.carton.prep1": "Break down or flatten boxes to save space.",
    "rminfo.mat.carton.prep2": "Remove tape, staples, and any plastic or styrofoam residue.",
    "rminfo.mat.carton.prep3": "Keep it dry: wet or greasy cardboard can't be recycled.",
    "rminfo.mat.carton.lugar1": "Municipal recycling bins",
    "rminfo.mat.carton.lugar2": "Paper and cardboard collection centers",
    "rminfo.mat.carton.obt1": "It's turned into new boxes, packaging, or recycled paper.",
    "rminfo.mat.carton.obt2": "Every ton recycled reduces tree felling.",
    "rminfo.mat.carton.obt3": "Cuts down the volume of waste reaching landfills.",
    "rminfo.mat.carton.impacto": "Cardboard can be recycled up to 7 times before losing quality.",
    "rminfo.mat.carton.tip1": "Waxed cardboard (like greasy pizza boxes) isn't recycled with regular cardboard.",
    "rminfo.mat.carton.tip2": "Keep boxes flat: they take up less space and make transport to the drop-off point easier.",

    "rminfo.mat.tetrapak.badge": "Recyclable",
    "rminfo.mat.tetrapak.prep1": "Rinse the container to remove liquid residue.",
    "rminfo.mat.tetrapak.prep2": "Flatten it to save space, no need to take it apart.",
    "rminfo.mat.tetrapak.prep3": "If it has a plastic cap, you can leave it on or remove it depending on the drop-off point.",
    "rminfo.mat.tetrapak.lugar1": "Municipal recycling bins",
    "rminfo.mat.tetrapak.lugar2": "Collection centers specialized in Tetra Pak",
    "rminfo.mat.tetrapak.obt1": "Its cardboard, plastic, and aluminum layers are separated and reused individually.",
    "rminfo.mat.tetrapak.obt2": "It's turned into sheets, eco-friendly roofing, or new paper.",
    "rminfo.mat.tetrapak.obt3": "Reduces the amount of multilayer packaging reaching landfills.",
    "rminfo.mat.tetrapak.impacto": "A Tetra Pak container combines 3 materials that can be recovered separately.",
    "rminfo.mat.tetrapak.tip1": "No need to remove the inner plastic layer: the recycling plant handles that separation.",
    "rminfo.mat.tetrapak.tip2": "Avoid flattening it too much if the drop-off point asks for it assembled, to make counting easier.",

    "rminfo.mat.aceite.badge": "Needs a special drop-off point",
    "rminfo.mat.aceite.prep1": "Let the oil cool before handling it.",
    "rminfo.mat.aceite.prep2": "Pour it into a clean plastic bottle and seal it well; never pour it down the drain.",
    "rminfo.mat.aceite.prep3": "Avoid mixing it with water or other liquids to make recycling easier.",
    "rminfo.mat.aceite.lugar1": "Used oil collection points",
    "rminfo.mat.aceite.lugar2": "Participating restaurants or businesses",
    "rminfo.mat.aceite.obt1": "It's turned into biodiesel or other alternative fuels.",
    "rminfo.mat.aceite.obt2": "Prevents pollution of rivers, oceans, and drinking water systems.",
    "rminfo.mat.aceite.obt3": "Prevents pipe and treatment plant blockages.",
    "rminfo.mat.aceite.impacto": "One liter of improperly discarded oil can contaminate up to 1,000 liters of water.",
    "rminfo.mat.aceite.tip1": "Never mix it with motor oil or other chemicals: they're recycled through different processes.",
    "rminfo.mat.aceite.tip2": "Reuse the same container several times before handing it over, to gather more at once.",

    "rminfo.mat.tela.badge": "Recyclable / Donatable",
    "rminfo.mat.tela.prep1": "Wash and dry the fabric well before handing it over.",
    "rminfo.mat.tela.prep2": "Separate clean, good-condition scraps from very worn or stained ones.",
    "rminfo.mat.tela.prep3": "Cut or fold large pieces to make transport easier.",
    "rminfo.mat.tela.lugar1": "Textile collection points",
    "rminfo.mat.tela.lugar2": "Sewing or textile recycling workshops",
    "rminfo.mat.tela.obt1": "It's turned into industrial rags, filling, or new fibers.",
    "rminfo.mat.tela.obt2": "Good-condition scraps can be reused for crafts or sewing.",
    "rminfo.mat.tela.obt3": "Reduces demand for new textile fibers.",
    "rminfo.mat.tela.impacto": "Recycling textiles keeps them from taking up landfill space.",
    "rminfo.mat.tela.tip1": "Small scraps are useful too: don't throw them out just for not being full garments.",
    "rminfo.mat.tela.tip2": "Separate synthetic fabrics (polyester, nylon) from natural ones (cotton, linen) if the drop-off point asks.",

    "rminfo.mat.cuero.badge": "Reusable",
    "rminfo.mat.cuero.prep1": "Clean the leather and check it has no mold or bad odor.",
    "rminfo.mat.cuero.prep2": "Separate large pieces (shoes, bags, belts) from small scraps.",
    "rminfo.mat.cuero.prep3": "Avoid getting it wet before handing it over, as it can damage the material.",
    "rminfo.mat.cuero.lugar1": "Foundations and clothing banks",
    "rminfo.mat.cuero.lugar2": "Leather workshops or shoe repair shops",
    "rminfo.mat.cuero.obt1": "Items in good condition can be reused directly.",
    "rminfo.mat.cuero.obt2": "Scraps are used in workshops for repairs or new pieces.",
    "rminfo.mat.cuero.obt3": "Reduces demand for new leather and its tanning process.",
    "rminfo.mat.cuero.impacto": "Tanning new leather uses large amounts of water and chemicals.",
    "rminfo.mat.cuero.tip1": "Apply a layer of conditioner before storing it if you're not donating it right away, to prevent drying out.",
    "rminfo.mat.cuero.tip2": "Synthetic leather isn't processed the same as real leather: separate them if you know which is which.",

    "rminfo.mat.utilesescolares.badge": "Reusable",
    "rminfo.mat.utilesescolares.prep1": "Check that notebooks, pencils, and crayons are in good condition or have life left.",
    "rminfo.mat.utilesescolares.prep2": "Group by type: writing, drawing, geometry, backpacks.",
    "rminfo.mat.utilesescolares.prep3": "Clean pencil cases and backpacks before donating them.",
    "rminfo.mat.utilesescolares.lugar1": "Schools and community libraries",
    "rminfo.mat.utilesescolares.lugar2": "Educational foundations",
    "rminfo.mat.utilesescolares.obt1": "Supplies in good condition go directly to students who need them.",
    "rminfo.mat.utilesescolares.obt2": "Reduces waste of school materials that are still functional.",
    "rminfo.mat.utilesescolares.obt3": "Makes education more accessible in communities with fewer resources.",
    "rminfo.mat.utilesescolares.impacto": "Donating school supplies directly lowers the financial barrier to studying.",
    "rminfo.mat.utilesescolares.tip1": "Half-used pencils and crayons are useful too: they don't need to be new.",
    "rminfo.mat.utilesescolares.tip2": "Check that markers and erasers still work before including them in the donation.",

    /* ════════════════════════════════════════════════
       RECYCLE: "Verify with AI" button (reciclar-scanner.js)
       ════════════════════════════════════════════════ */
    "rscan.ia.btnDefault": "✨ Verify with AI (more accurate)",
    "rscan.ia.verificandoCuota": "Checking your quota…",
    "rscan.ia.limiteAlcanzado": "Daily limit reached",
    "rscan.ia.limiteTitulo": "You've reached your daily AI scan limit",
    "rscan.ia.limiteDesc": "Your {plan} plan includes {limite} AI scans per day. Upgrade your plan to scan without limits.",
    "rscan.ia.verPlanesBtn": "See plans →",
    "rscan.ia.consultando": "Consulting AI…",
    "rscan.ia.consultandoDesc": "Consulting the precise AI scan…",
    "rscan.ia.detecto": "Precise (AI) scan detected",
    "rscan.ia.confianzaAlta": "High confidence",
    "rscan.ia.confianzaMedia": "Medium confidence",
    "rscan.ia.confianzaBaja": "Low confidence",
    "rscan.ia.confianzaGenerica": "AI",
    "rscan.ia.tampocoIdentifico": "The AI couldn't identify it with confidence either",
    "rscan.ia.sugerenciaOtraFoto": "Try with more light or a closer shot, or choose the material manually above.",
    "rscan.ia.noSePudoConsultar": "Couldn't get a precise scan",
    "rscan.ia.intentaDeNuevo": "Try again in a few seconds.",

    /* ════════════════════════════════════════════════
       DONATE: mapping for categories stored in Supabase
       (donar-listings.js, donaciones-listado.js)
       ════════════════════════════════════════════════ */
    "donar.cat.ropaCalzado": "Clothing and footwear",
    "donar.cat.electronicos": "Electronics",
    "donar.cat.muebles": "Furniture",
    "donar.cat.librosUtiles": "Books and supplies",
    "donar.cat.juguetes": "Toys",
    "donar.cat.alimentosNoPerecederos": "Non-perishable food",
    "donar.cat.alimentos": "Food",
    "donar.cat.materialEscolar": "School supplies",
    "donar.cat.higiene": "Hygiene products",
    "donar.cat.medicinas": "Unexpired medicine",
    "donar.cat.otro": "Other",

    /* ════════════════════════════════════════════════
       ALLIANCES: featured allies (alianzas-destacados.js)
       ════════════════════════════════════════════════ */
    "alid.destacado": "Featured ally 🌳",
    "alid.aliadoRecoPlus": "RECO+ Ally",
    "alid.vacio.titulo": "No Premium plan allies yet",
    "alid.vacio.desc": "Companies with a Premium plan appear here, featured to the whole RECO+ community.",
    "alid.vacio.btn": "Learn about the Premium plan →",
    "alid.cerrar": "Close",

    /* ════════════════════════════════════════════════════
       LEGAL: Terms and Conditions (terminos.html)
       ════════════════════════════════════════════════════ */
    "legal.eyebrow": "Legal",
    "legal.terminos.h1": "Terms and Conditions",
    "legal.terminos.updated": "Last updated: August 16, 2026",
    "legal.terminos.intro": "These terms govern the use of the RECO+ platform (website, material scanner, map, donations, business alliances, and other features). By creating an account or using RECO+ you agree to these terms.",

    "legal.terminos.toc.titulo": "Contents",
    "legal.terminos.toc.1": "1. Acceptance of the terms",
    "legal.terminos.toc.2": "2. Who we are",
    "legal.terminos.toc.3": "3. Service description",
    "legal.terminos.toc.4": "4. Registration and accounts",
    "legal.terminos.toc.5": "5. Business / ally accounts",
    "legal.terminos.toc.6": "6. AI material scanner",
    "legal.terminos.toc.7": "7. User-generated content",
    "legal.terminos.toc.8": "8. Intellectual property",
    "legal.terminos.toc.9": "9. Plans and subscriptions",
    "legal.terminos.toc.10": "10. Prohibited conduct",
    "legal.terminos.toc.11": "11. Limitation of liability",
    "legal.terminos.toc.12": "12. Suspension and termination",
    "legal.terminos.toc.13": "13. Modifications",
    "legal.terminos.toc.14": "14. Governing law",
    "legal.terminos.toc.15": "15. Contact",

    "legal.terminos.aviso": "<strong>Notice:</strong> this document is a base version prepared for RECO+ and does not constitute legal advice. Before publishing it as final, we recommend having a lawyer in Panama review it and adapt it to the company's actual situation.",

    "legal.terminos.s1.h2": "Acceptance of the terms",
    "legal.terminos.s1.p1": "These Terms and Conditions (\"Terms\") constitute a legal agreement between the user (\"you\", \"user\") and RECO+ (\"RECO+\", \"we\"), and govern access to and use of the website, application, and other services offered under the RECO+ brand (collectively, the \"Platform\").",
    "legal.terminos.s1.p2": "By registering, accessing, or using the Platform, you confirm that you have read, understood, and accepted these Terms, as well as our <a href=\"privacidad.html\">Privacy Policy</a>. If you do not agree with any part of these Terms, you must not use the Platform.",

    "legal.terminos.s2.h2": "Who we are",
    "legal.terminos.s2.p1": "RECO+ is a community recycling and donation platform operating from Panama, aimed at connecting people and businesses to facilitate recycling, item donation, and environmental education.",
    "legal.terminos.s2.p2": "For any inquiries related to these Terms, you can write to us at <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>.",

    "legal.terminos.s3.h2": "Service description",
    "legal.terminos.s3.p1": "RECO+ offers, among others, the following features:",
    "legal.terminos.s3.li1": "<strong>Map of recycling and donation points:</strong> locations suggested by the community itself and by allies.",
    "legal.terminos.s3.li2": "<strong>AI material scanner:</strong> identifies the type of material from a photo and suggests how to recycle it.",
    "legal.terminos.s3.li3": "<strong>Donations and help requests:</strong> posting items for donation and requests for help between users.",
    "legal.terminos.s3.li4": "<strong>Business alliances:</strong> registration of allied companies and organizations that collaborate with the community.",
    "legal.terminos.s3.li5": "<strong>Educational guide and community videos:</strong> informational content about recycling and sustainability, including videos uploaded by users themselves.",
    "legal.terminos.s3.li6": "<strong>Subscription plans:</strong> Free, Basic, and Premium tiers with different features (see section 9).",
    "legal.terminos.s3.p2": "RECO+ may add, modify, or remove Platform features at any time, without this giving rise to any right to compensation.",

    "legal.terminos.s4.h2": "Registration and user accounts",
    "legal.terminos.s4.p1": "To use certain RECO+ features you must create an account using email and password, or by signing in with your Google or Apple account.",
    "legal.terminos.s4.li1": "You must provide truthful information and keep it up to date.",
    "legal.terminos.s4.li2": "You are responsible for the confidentiality of your password and for all activity carried out from your account.",
    "legal.terminos.s4.li3": "Use of the Platform is intended for people over 18 years of age. If you are a minor, you need the supervision and authorization of a parent or legal guardian.",
    "legal.terminos.s4.li4": "You must notify us immediately if you detect unauthorized use of your account.",

    "legal.terminos.s5.h2": "Business / ally accounts",
    "legal.terminos.s5.p1": "Companies or organizations wishing to register as allies must complete the registration process available in the Alliances section, which includes creating an account, uploading information and graphic material (logo, photos), and accepting these Terms on behalf of the company.",
    "legal.terminos.s5.p2": "RECO+ may verify, approve, request additional information, or reject a company's registration at its discretion, especially when the information provided is incomplete, inaccurate, or contrary to these Terms.",

    "legal.terminos.s6.h2": "AI material scanner",
    "legal.terminos.s6.p1": "The material scanner uses artificial intelligence models to analyze images and suggest the type of material and how to recycle or dispose of it.",
    "legal.terminos.s6.callout": "Scanner results are <strong>indicative only</strong> and may contain errors. RECO+ does not guarantee the accuracy of the classification and is not responsible for decisions made solely based on the scanner's result. If in doubt about hazardous, special, or delicate materials, always consult the relevant authority or collection center.",

    "legal.terminos.s7.h2": "User-generated content",
    "legal.terminos.s7.p1": "RECO+ allows publishing community-generated content, including suggested recycling points, donation posts, comments, and videos.",
    "legal.terminos.s7.li1": "You are responsible for the content you post and guarantee that you have the right to share it.",
    "legal.terminos.s7.li2": "It is not allowed to post false, misleading, offensive, discriminatory, violent content, or content that infringes third-party rights.",
    "legal.terminos.s7.li3": "Videos uploaded to the Platform go through a moderation process, which may include automatic review via artificial intelligence and, when required, manual review before final publication.",
    "legal.terminos.s7.li4": "RECO+ may remove, hide, or reject any content that violates these Terms, without prior notice.",

    "legal.terminos.s8.h2": "Intellectual property",
    "legal.terminos.s8.p1": "The RECO+ brand, design, text, graphics, and Platform software are owned by RECO+ or its licensors, and are protected by applicable intellectual property laws.",
    "legal.terminos.s8.p2": "Content you post remains yours; by uploading it to RECO+ you grant us a non-exclusive, worldwide, royalty-free license to store, display, and distribute it within the Platform for the purpose of operating the service.",

    "legal.terminos.s9.h2": "Plans and subscriptions",
    "legal.terminos.s9.p1": "RECO+ offers different plan tiers (Free, Basic, and Premium) with different features and usage limits.",
    "legal.terminos.s9.callout": "<strong>Notice:</strong> the payment process for subscription plans is currently a <strong>simulation (demo mode)</strong> and does not process real charges. When RECO+ enables real payments, this section will be updated to describe the payment provider, billing terms, renewal, and cancellation.",

    "legal.terminos.s10.h2": "Prohibited conduct",
    "legal.terminos.s10.p1": "By using RECO+ you agree not to:",
    "legal.terminos.s10.li1": "Impersonate another person or company.",
    "legal.terminos.s10.li2": "Post illegal, fraudulent content, or content that promotes dangerous activities.",
    "legal.terminos.s10.li3": "Attempt to compromise the security of the Platform, its accounts, or its infrastructure.",
    "legal.terminos.s10.li4": "Use the Platform to send spam, malicious content, or unauthorized advertising.",
    "legal.terminos.s10.li5": "Extract data from the Platform through automated means (scraping) without express authorization.",

    "legal.terminos.s11.h2": "Limitation of liability",
    "legal.terminos.s11.p1": "RECO+ acts as an intermediary connecting people, communities, and businesses around recycling and donation. We are not party to transactions, deliveries, or agreements made between users, nor do we guarantee the availability, quality, safety, or legality of recycling points, donations, or third-party posts.",
    "legal.terminos.s11.p2": "To the extent permitted by law, RECO+ will not be liable for indirect, incidental, or consequential damages arising from use of the Platform, including losses resulting from interactions between users or from information provided by the AI scanner.",

    "legal.terminos.s12.h2": "Account suspension and termination",
    "legal.terminos.s12.p1": "We may suspend or cancel your account if you violate these Terms, if we detect fraudulent activity, or if necessary to protect the community or the Platform.",
    "legal.terminos.s12.p2": "You can request deletion of your account at any time by writing to us at <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>.",

    "legal.terminos.s13.h2": "Modifications to these Terms",
    "legal.terminos.s13.p1": "We may update these Terms periodically. We will post the current version on this page along with the last updated date. Continued use of the Platform after a modification implies acceptance of the new Terms.",

    "legal.terminos.s14.h2": "Governing law and jurisdiction",
    "legal.terminos.s14.p1": "These Terms are governed by the laws of the Republic of Panama. Any dispute related to these Terms will be submitted to the competent courts of Panama, unless applicable law provides otherwise.",

    "legal.terminos.s15.h2": "Contact",
    "legal.terminos.s15.p1": "If you have questions about these Terms, write to us at:",
    "legal.terminos.s15.li1": "Email: <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>",
    "legal.terminos.s15.li2": "Phone / WhatsApp: +507 6399-1249",
    "legal.terminos.s15.li3": "Location: David, Panama",

    /* ════════════════════════════════════════════════════
       LEGAL: Privacy Policy (privacidad.html)
       ════════════════════════════════════════════════════ */
    "legal.privacidad.h1": "Privacy Policy",
    "legal.privacidad.updated": "Last updated: August 16, 2026",
    "legal.privacidad.intro": "This policy explains what personal data RECO+ collects, what we use it for, who we share it with, and what rights you have over it.",

    "legal.privacidad.toc.titulo": "Contents",
    "legal.privacidad.toc.1": "1. Data controller",
    "legal.privacidad.toc.2": "2. Scope and standards we follow",
    "legal.privacidad.toc.3": "3. Data we collect",
    "legal.privacidad.toc.4": "4. How we use your data",
    "legal.privacidad.toc.5": "5. Who we share data with",
    "legal.privacidad.toc.6": "6. Storage and security",
    "legal.privacidad.toc.7": "7. Your rights",
    "legal.privacidad.toc.8": "8. Cookies and local storage",
    "legal.privacidad.toc.9": "9. Minors",
    "legal.privacidad.toc.10": "10. International data transfers",
    "legal.privacidad.toc.11": "11. Changes to this policy",
    "legal.privacidad.toc.12": "12. Contact",

    "legal.privacidad.aviso": "<strong>Notice:</strong> this document is a base version prepared for RECO+ and does not constitute legal advice. Before publishing it as final, we recommend having a lawyer review its content and adapt it to the platform's actual operations.",

    "legal.privacidad.s1.h2": "Data controller",
    "legal.privacidad.s1.p1": "The controller responsible for processing personal data collected through the Platform is RECO+, operating in Panama.",
    "legal.privacidad.s1.p2": "For any questions about this policy or the processing of your data, you can write to <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>.",

    "legal.privacidad.s2.h2": "Scope and standards we follow",
    "legal.privacidad.s2.p1": "RECO+ operates primarily in Panama. As a data protection standard, we apply the principles of the European Union's <strong>General Data Protection Regulation (GDPR)</strong> — lawfulness, data minimization, purpose limitation, transparency, and respect for users' rights — in addition to the data protection provisions in force in Panama.",
    "legal.privacidad.s2.p2": "This means that, no matter where you access RECO+ from, we strive to handle your personal data under these same protection standards.",

    "legal.privacidad.s3.h2": "Data we collect",
    "legal.privacidad.s3.li1": "<strong>Registration data:</strong> name, email, and password (encrypted), or the basic profile data you share when signing in with Google or Apple.",
    "legal.privacidad.s3.li2": "<strong>Profile data:</strong> photo or avatar, and, if you register an allied company, the name, logo, photos, and other company information.",
    "legal.privacidad.s3.li3": "<strong>Content you post:</strong> suggested recycling points, donation posts, comments, and videos you upload to the Platform.",
    "legal.privacidad.s3.li4": "<strong>Scanner images:</strong> photos you take to identify materials with the AI scanner.",
    "legal.privacidad.s3.li5": "<strong>Location data:</strong> if you authorize it, your approximate location to show you nearby recycling or donation points on the map.",
    "legal.privacidad.s3.li6": "<strong>Usage data:</strong> basic technical information about how you use the Platform (for example, pages visited), for the purpose of operating and improving the service.",

    "legal.privacidad.s4.h2": "How we use your data",
    "legal.privacidad.s4.p1": "We use your personal data to:",
    "legal.privacidad.s4.li1": "Create and manage your account, and let you sign in.",
    "legal.privacidad.s4.li2": "Show you the map of recycling/donation points and personalized results.",
    "legal.privacidad.s4.li3": "Process scanner images and classify the material using artificial intelligence.",
    "legal.privacidad.s4.li4": "Moderate posted content (including automatic video moderation) to keep the Platform safe.",
    "legal.privacidad.s4.li5": "Manage the registration and verification of allied companies.",
    "legal.privacidad.s4.li6": "Send you notifications related to your activity on the Platform.",
    "legal.privacidad.s4.li7": "Respond to your support or contact inquiries.",
    "legal.privacidad.s4.li8": "Comply with legal obligations when applicable.",

    "legal.privacidad.s5.h2": "Who we share data with",
    "legal.privacidad.s5.p1": "RECO+ relies on external providers to operate the Platform. These providers process data on our behalf and under our instructions:",
    "legal.privacidad.s5.li1": "<strong>Supabase:</strong> database storage, authentication, and files (images, logos, videos).",
    "legal.privacidad.s5.li2": "<strong>Google and Apple:</strong> sign-in providers (OAuth), if you choose to register with these accounts.",
    "legal.privacidad.s5.li3": "<strong>Artificial intelligence providers (Gemini):</strong> image processing for the material scanner and for automatic video moderation.",
    "legal.privacidad.s5.li4": "<strong>Vercel:</strong> hosting for server-side functions (for example, the scanner and video moderation).",
    "legal.privacidad.s5.p2": "We do not sell your personal data to third parties. We only share data with these providers to the extent necessary to operate the Platform, or when required by law.",

    "legal.privacidad.s6.h2": "Storage and security",
    "legal.privacidad.s6.p1": "Your data is stored in Supabase's database and storage infrastructure, with access rules (Row Level Security) that limit what information can be read or modified depending on the user type.",
    "legal.privacidad.s6.p2": "Although we apply reasonable security measures, no system is 100% foolproof. If we detect a security incident affecting your data, we will notify you in accordance with applicable regulations.",

    "legal.privacidad.s7.h2": "Your rights",
    "legal.privacidad.s7.p1": "Regarding your personal data, you can exercise the following rights, aligned with GDPR principles:",
    "legal.privacidad.s7.li1": "<strong>Access:</strong> know what data we have about you.",
    "legal.privacidad.s7.li2": "<strong>Rectification:</strong> correct inaccurate or incomplete data.",
    "legal.privacidad.s7.li3": "<strong>Erasure:</strong> request deletion of your account and your data.",
    "legal.privacidad.s7.li4": "<strong>Objection and restriction:</strong> object to certain uses of your data or request that we restrict its processing.",
    "legal.privacidad.s7.li5": "<strong>Portability:</strong> request a copy of your data in a structured format.",
    "legal.privacidad.s7.p2": "To exercise any of these rights, write to us at <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>. We will respond within a reasonable time.",

    "legal.privacidad.s8.h2": "Cookies and local storage",
    "legal.privacidad.s8.p1": "RECO+ uses browser local storage (localStorage) to remember preferences such as language or light/dark mode, and to keep you signed in.",
    "legal.privacidad.s8.p2": "Since the Platform is served from two different domains (GitHub Pages and Vercel), we use a \"session bridge\" mechanism that securely transfers your session data when switching domains, since local storage is not automatically shared across different domains.",

    "legal.privacidad.s9.h2": "Minors",
    "legal.privacidad.s9.p1": "RECO+ is intended for people over 18 years of age. We do not knowingly collect data from minors without the consent of a parent or legal guardian. If you become aware that a minor has provided us with personal data without such consent, please contact us to have it removed.",

    "legal.privacidad.s10.h2": "International data transfers",
    "legal.privacidad.s10.p1": "Some of our providers (Supabase, Google, Apple, Vercel, and the artificial intelligence services we use) may process data on servers located outside Panama. In such cases, we strive to ensure that these providers maintain adequate data protection standards, in line with the principles described in section 2.",

    "legal.privacidad.s11.h2": "Changes to this policy",
    "legal.privacidad.s11.p1": "We may update this Privacy Policy periodically. We will post the current version on this page along with the last updated date.",

    "legal.privacidad.s12.h2": "Contact",
    "legal.privacidad.s12.p1": "If you have questions about this Privacy Policy or the processing of your data, write to us at:",
    "legal.privacidad.s12.li1": "Email: <a href=\"mailto:soporte.recoplus@gmail.com\">soporte.recoplus@gmail.com</a>",
    "legal.privacidad.s12.li2": "Phone / WhatsApp: +507 6399-1249",
    "legal.privacidad.s12.li3": "Location: David, Panama",
  }
};

/* ────────────────────────────────────────────
   Helper t(key, vars) — traduce strings desde JS
   Permite que app.js (u otros scripts) pidan una traducción sin
   depender de data-i18n en el DOM, para textos generados en tiempo
   de ejecución (listas dinámicas, toasts, popups del mapa, etc.).
   Soporta interpolación simple: t("mapa.rate.toastNew", { n: 5 })
   reemplaza {n} dentro del string traducido.
   ──────────────────────────────────────────── */
function t(key, vars) {
  const lang = localStorage.getItem("reco-lang") || "es";
  const dict = translations[lang] || translations.es;
  let str = dict[key] != null ? dict[key] : (translations.es[key] != null ? translations.es[key] : key);
  if (vars) {
    Object.keys(vars).forEach((k) => {
      str = str.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    });
  }
  return str;
}
function currentLang() {
  return localStorage.getItem("reco-lang") || "es";
}

/* ────────────────────────────────────────────
   Motor principal
   ──────────────────────────────────────────── */
function applyLang(lang) {
  const dict = translations[lang];
  if (!dict) return;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (!dict[key]) return;

    // Inputs y textareas: actualizar placeholder, nunca innerHTML
    if ((el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.hasAttribute("placeholder")) {
      el.setAttribute("placeholder", dict[key]);
      return;
    }

    // OPTIONs: usar textContent para no romper el SELECT
    if (el.tagName === "OPTION") {
      el.textContent = dict[key];
      return;
    }

    // Elementos con hijos ícono (ej. SVG + texto, en <button>, <a> u
    // otros): actualizar solo el nodo de texto para no destruir los
    // íconos internos. Antes solo cubría BUTTON, lo que hacía que
    // innerHTML borrara el SVG en <a class="bubble-nav__cta"> (CTA
    // "Únete") y otros enlaces/botones con ícono + texto plano.
    if ((el.tagName === "BUTTON" || el.tagName === "A" || el.tagName === "SPAN" || el.tagName === "DIV") && el.querySelector("svg, img")) {
      // Buscar el primer nodo de texto directo no vacío y actualizarlo
      const textNode = Array.from(el.childNodes).find(
        n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
      );
      if (textNode) {
        textNode.textContent = " " + dict[key];
      } else {
        // Si no hay nodo de texto directo, crear uno al final
        el.appendChild(document.createTextNode(" " + dict[key]));
      }
      return;
    }

    // Resto de elementos: innerHTML (permite <br>, <strong>, etc.)
    el.innerHTML = dict[key];
  });

  // Atributos "title" traducibles (ej. botones con solo ícono)
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (dict[key]) el.setAttribute("title", dict[key]);
  });

  // Atributos "aria-label" traducibles (accesibilidad: lectores de
  // pantalla), capa aditiva independiente de data-i18n-title porque
  // un mismo elemento puede necesitar traducir aria-label sin tener
  // (o sin querer) un title visible al pasar el mouse.
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    if (dict[key]) el.setAttribute("aria-label", dict[key]);
  });

  // Atributos "data-tooltip" traducibles (tooltip custom del bubble-nav)
  document.querySelectorAll("[data-i18n-tooltip]").forEach(el => {
    const key = el.getAttribute("data-i18n-tooltip");
    if (dict[key]) {
      el.setAttribute("data-tooltip", dict[key]);
      // Mini-descripción del nav: nav-preview.js quedó obsoleto (apunta
      // a ".navbar__links a", una clase que ya no existe — el bubble-nav
      // actual usa ".bubble-nav__links a"), así que el hover-card nunca
      // se conecta. Usamos el tooltip nativo del navegador (title) en su
      // lugar: simple, accesible y funciona en las 15 páginas sin
      // depender de esa clase.
      el.setAttribute("title", dict[key]);
    }
  });

  // Atributos "placeholder" traducibles (inputs de búsqueda, formularios)
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });

  // Actualiza el atributo lang del documento
  document.documentElement.setAttribute("lang", lang);

  // Refleja estado visual del toggle
  document.querySelectorAll(".lang-toggle").forEach(btn => {
    btn.setAttribute("data-current", lang);
    const track      = btn.querySelector(".lang-track");
    const knob       = btn.querySelector(".lang-knob");
    const labelLeft  = btn.querySelector(".lang-label-es");
    const labelRight = btn.querySelector(".lang-label-en");

    if (knob && track) {
      // Calcular el recorrido real del knob según el track actual
      const trackW  = track.offsetWidth  || parseInt(getComputedStyle(track).width)  || 28;
      const knobW   = knob.offsetWidth   || parseInt(getComputedStyle(knob).width)   || 12;
      const knobOff = parseInt(getComputedStyle(knob).left) || 2;
      const travel  = Math.max(trackW - knobW - knobOff * 2, 0);

      knob.style.transform = lang === "en" ? `translateX(${travel}px)` : "translateX(0)";
    }

    if (labelLeft)  labelLeft.style.opacity  = lang === "en" ? "0.45" : "1";
    if (labelRight) labelRight.style.opacity = lang === "en" ? "1" : "0.45";
  });

  // Notifica a otros scripts (ej. app.js) que el idioma cambió, para
  // que puedan re-renderizar contenido generado dinámicamente que no
  // usa data-i18n (listas de resultados, popups del mapa, toasts...).
  document.dispatchEvent(new CustomEvent("reco:langchange", { detail: { lang } }));
}

function toggleLang() {
  const current = localStorage.getItem("reco-lang") || "es";
  const next = current === "es" ? "en" : "es";
  localStorage.setItem("reco-lang", next);
  applyLang(next);
}

/* ────────────────────────────────────────────
   Inyectar estilos base del toggle de idioma
   Solo define propiedades que no están en el bubble-nav CSS
   ──────────────────────────────────────────── */
(function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Estilos base para páginas que no tienen bubble-nav CSS */
    .lang-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      border-radius: 999px;
      padding: 4px 10px 4px 8px;
      transition: background 0.2s;
      user-select: none;
    }
    /* lang-track y lang-knob se definen en el CSS de cada página
       (bubble-nav CSS usa 28px/12px). Solo añadir transición si no existe. */
    .lang-knob {
      transition: transform 0.25s cubic-bezier(.4,0,.2,1);
    }
    .lang-label-es,
    .lang-label-en {
      transition: opacity 0.2s;
    }
  `;
  document.head.appendChild(style);
})();

/* ────────────────────────────────────────────
   Inicializar al cargar el DOM
   ──────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("reco-lang") || "es";
  applyLang(saved);
});


/* ── LANG PILL NAV: sincroniza label ES/EN en el bubble nav ── */
/* ── LANG PILL: sincroniza el label ES/EN del nuevo lang-pill ── */
(function() {
  function syncLangPill(lang) {
    var esLabel = document.querySelector('.lang-pill .lang-label-es');
    var enLabel = document.querySelector('.lang-pill .lang-label-en');
    var btn     = document.querySelector('.lang-pill');
    if (!btn) return;
    if (lang === 'en') {
      if (esLabel) esLabel.style.display = 'none';
      if (enLabel) enLabel.style.display = 'inline';
      btn.setAttribute('data-current', 'en');
    } else {
      if (esLabel) esLabel.style.display = 'inline';
      if (enLabel) enLabel.style.display = 'none';
      btn.setAttribute('data-current', 'es');
    }
  }
  /* Patch applyLang to also sync the pill after i18n.js loads */
  document.addEventListener('DOMContentLoaded', function() {
    var saved = localStorage.getItem('reco-lang') || 'es';
    syncLangPill(saved);
    /* Monkey-patch toggleLang to also update pill */
    var origToggle = window.toggleLang;
    if (origToggle) {
      window.toggleLang = function() {
        origToggle();
        var curr = localStorage.getItem('reco-lang') || 'es';
        syncLangPill(curr);
      };
    }
  });
  /* Also patch after scripts load */
  window.addEventListener('load', function() {
    var origToggle = window.toggleLang;
    if (origToggle && !origToggle._patched) {
      window.toggleLang = function() {
        origToggle();
        var curr = localStorage.getItem('reco-lang') || 'es';
        syncLangPill(curr);
      };
      window.toggleLang._patched = true;
    }
  });
})();
