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

    /* ── NAV: descripciones (tooltip al pasar el cursor) ── */
    "nav.inicio.desc":   "Vuelve a la página principal.",
    "nav.reciclar.desc": "Centros de reciclaje cerca de ti.",
    "nav.donar.desc":    "Comparte lo que ya no usas y cambia vidas.",
    "nav.guia.desc":     "Aprende paso a paso cómo reciclar y donar.",
    "nav.contacto.desc": "Escríbenos, respondemos en menos de 24h.",
    "nav.blog.desc":     "Historias, tips y noticias sobre sostenibilidad.",

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
    "guia.hero.title":    "Guía",
    "guia.hero.subtitle": "Todo lo que necesitas saber para conectar,<br>reciclar y transformar tu comunidad.",
    "guia.hero.badge":    "Aprende, actúa y genera impacto positivo.",

    "guia.steps.intro": "<strong>Explora nuestras guías prácticas en solo <span class=\"highlight\">3 pasos clave</span></strong>",

    "guia.card1.title": "Cómo encontrar<br>puntos de reciclaje",
    "guia.card1.desc":  "Descubre cómo ubicar centros de reciclaje cercanos y contribuir al cuidado del planeta.",
    "guia.card1.li1":   "✅ Usa el mapa interactivo",
    "guia.card1.li2":   "✅ Filtra por tipo de material",
    "guia.card1.li3":   "✅ Obtén direcciones y horarios",
    "guia.card1.cta":   "Ver guía completa →",

    "guia.card2.title": "Cómo donar o<br>solicitar ayuda",
    "guia.card2.desc":  "Conecta con tu comunidad donando objetos o pidiendo ayuda cuando lo necesites.",
    "guia.card2.li1":   "✅ Publica tu solicitud o donación",
    "guia.card2.li2":   "✅ Conecta con personas cercanas",
    "guia.card2.li3":   "✅ Genera impacto social",
    "guia.card2.cta":   "Ver guía completa →",

    "guia.card3.title": "Cómo pagar y obtener<br>beneficios premium",
    "guia.card3.desc":  "Conoce las opciones de pago disponibles y disfruta de beneficios exclusivos en RECO+.",
    "guia.card3.li1":   "✅ Métodos de pago seguros",
    "guia.card3.li2":   "✅ Beneficios por ser premium",
    "guia.card3.li3":   "✅ Gestiona tu suscripción",
    "guia.card3.cta":   "Ver guía completa →",

    "guia.como.title":  "¿Cómo funciona la Tienda EcoTech?",
    "guia.paso1.title": "Publica tu producto",
    "guia.paso1.desc":  "Sube fotos, describe tu producto y establece tu precio.",
    "guia.paso2.title": "Encuentra compradores",
    "guia.paso2.desc":  "Personas interesadas te contactarán a través de la plataforma.",
    "guia.paso3.title": "Gana dinero reciclando",
    "guia.paso3.desc":  "Cierra la venta y recibe tu dinero. Nosotros tomamos una pequeña comisión para mantener la plataforma.",

    "guia.mat.title":    "¿Qué puedes donar?",
    "guia.mat.subtitle": "Conoce qué materiales aceptamos y cuáles no para mantener un proceso seguro y sostenible.",
    "guia.mat.si":       "SÍ se puede donar",
    "guia.si.item1.title": "Ropa y calzado",
    "guia.si.item1.desc":  "En buen estado, limpia y sin roturas graves.",
    "guia.si.item2.title": "Electrónicos funcionales",
    "guia.si.item2.desc":  "Celulares, tablets, computadores que aún funcionen.",
    "guia.si.item3.title": "Libros y útiles escolares",
    "guia.si.item3.desc":  "Libros de texto, cuadernos, colores y materiales de estudio.",
    "guia.si.item4.title": "Muebles en buen estado",
    "guia.si.item4.desc":  "Sillas, mesas, estantes sin daños estructurales.",
    "guia.si.item5.title": "Juguetes",
    "guia.si.item5.desc":  "Completos, limpios y sin piezas peligrosas.",
    "guia.si.item6.title": "Alimentos no perecederos",
    "guia.si.item6.desc":  "Enlatados, granos y productos con fecha de vencimiento vigente.",

    "guia.mat.no": "NO se puede donar",
    "guia.no.item1.title": "Baterías y pilas sueltas",
    "guia.no.item1.desc":  "Representan un riesgo ambiental y deben ir a puntos especializados.",
    "guia.no.item2.title": "Medicamentos",
    "guia.no.item2.desc":  "Vencidos o sin vencer; su manejo requiere protocolos especiales.",
    "guia.no.item3.title": "Productos químicos o inflamables",
    "guia.no.item3.desc":  "Pinturas, solventes, aerosoles u otros materiales peligrosos.",
    "guia.no.item4.title": "Vidrios rotos o espejos",
    "guia.no.item4.desc":  "Representan un riesgo de lesiones durante el transporte.",
    "guia.no.item5.title": "Ropa en muy mal estado",
    "guia.no.item5.desc":  "Prendas con manchas permanentes, rasgaduras graves o mal olor.",
    "guia.no.item6.title": "Alimentos perecederos o vencidos",
    "guia.no.item6.desc":  "Comida fresca sin refrigeración o productos caducados.",

    "guia.mat.nota": "¿Tienes dudas sobre un artículo específico? <a href=\"contacto.html\">Contáctanos</a> y te ayudamos a decidir.",

    "guia.help.title":    "¿Necesitas más ayuda?",
    "guia.help.subtitle": "Estamos aquí para acompañarte en cada paso<br>hacia un mundo más sostenible.",
    "guia.help.soporte":  "Soporte<br>personalizado",
    "guia.help.recursos": "Recursos y<br>tutoriales",
    "guia.help.comunidad":"Comunidad<br>activa",
    "guia.help.cta":      "Ir a Centro de Ayuda →",

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
       ══════════════════════════════════════════ */
    "tutorial.step0.title": "¡Bienvenido a RECO+! 👋",
    "tutorial.step0.desc":  "En menos de un minuto te mostramos dónde está todo: el mapa de puntos de reciclaje, cómo donar y cómo pedir ayuda. Usa los botones de abajo para moverte, y Esc para salir cuando quieras.",

    "tutorial.step1.title": "Tu barra de navegación",
    "tutorial.step1.desc":  "Desde aquí llegas a cualquier sección: Mapa, Guía, Donar y Alianzas. Se queda fija arriba mientras haces scroll, así siempre tienes todo a un clic de distancia.",

    "tutorial.step2.title": "Modo claro / oscuro",
    "tutorial.step2.desc":  "¿Prefieres una interfaz más suave para tus ojos de noche? Prueba tocar este interruptor ahora mismo — el tutorial se adapta al instante al nuevo tema.",

    "tutorial.step3.title": "Cambia de idioma",
    "tutorial.step3.desc":  "RECO+ habla español e inglés. Tócalo para alternar — toda la página, incluido este recorrido, se traduce en tiempo real sin recargar.",

    "tutorial.step4.title": "Únete a la comunidad",
    "tutorial.step4.desc":  "Este botón te lleva a crear tu cuenta. Con tu perfil puedes guardar puntos favoritos, hacer seguimiento a tus donaciones y desbloquear más funciones.",

    "tutorial.step5.title": "Acceso rápido",
    "tutorial.step5.desc":  "Estos accesos directos te llevan al mapa, a donar, a pedir ayuda o a la tienda sin tener que buscar en el menú. Ideal cuando ya sabes exactamente qué necesitas hacer.",

    "tutorial.step6.title": "Busca lo que necesitas",
    "tutorial.step6.desc":  "Escribe aquí qué quieres reciclar o donar — por ejemplo \"ropa\" o \"electrónicos\" — y te sugerimos las opciones más relevantes al instante.",

    "tutorial.step7.title": "Reciclar y donar, un clic más cerca",
    "tutorial.step7.desc":  "Estas dos tarjetas resumen las dos acciones más importantes de la plataforma. Tócalas para ver los puntos de reciclaje cercanos o para empezar a donar hoy mismo.",

    "tutorial.step8.title": "Todo lo que puedes hacer",
    "tutorial.step8.desc":  "Desliza esta tira de tarjetas para descubrir cada función: encontrar puntos, donar, pedir ayuda y más. Cada tarjeta te lleva directo a la sección correspondiente.",

    "tutorial.step9.title": "¡Listo, ya conoces RECO+! 🎉",
    "tutorial.step9.desc":  "Explora a tu ritmo. Si en algún momento quieres repetir el recorrido completo, el botón verde flotante siempre estará aquí abajo para ayudarte.",

    "tutorial.btn.next":    "Siguiente",
    "tutorial.btn.prev":    "Anterior",
    "tutorial.btn.finish":  "¡Empezar a explorar!",
    "tutorial.btn.close":   "Cerrar tutorial",
    "tutorial.btn.restart": "Reiniciar tutorial",

    "tutorial.step.counter":  "Paso {n} de {total}",
    "tutorial.step.progress": "{pct}% completado",
    "tutorial.fab.label":     "Ver tutorial",
    "tutorial.fab.tooltip":   "¿Necesitas ayuda? Reinicia el tutorial",

    "tutorial.done.title": "¡Bien hecho! 🎊",
    "tutorial.done.desc":  "Completaste el recorrido. Ya sabes moverte por RECO+ como un experto.",

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

    /* ── NAV: descripciones (tooltip al pasar el cursor) ── */
    "nav.inicio.desc":   "Back to the home page.",
    "nav.reciclar.desc": "Recycling centers near you.",
    "nav.donar.desc":    "Share what you no longer use and change lives.",
    "nav.guia.desc":     "Learn step by step how to recycle and donate.",
    "nav.contacto.desc": "Write to us, we reply in under 24h.",
    "nav.blog.desc":     "Stories, tips and news about sustainability.",

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
    "guia.hero.title":    "Guide",
    "guia.hero.subtitle": "Everything you need to know to connect,<br>recycle and transform your community.",
    "guia.hero.badge":    "Learn, act and create a positive impact.",

    "guia.steps.intro": "<strong>Explore our practical guides in just <span class=\"highlight\">3 key steps</span></strong>",

    "guia.card1.title": "How to find<br>recycling points",
    "guia.card1.desc":  "Discover how to locate nearby recycling centers and help take care of the planet.",
    "guia.card1.li1":   "✅ Use the interactive map",
    "guia.card1.li2":   "✅ Filter by material type",
    "guia.card1.li3":   "✅ Get directions and hours",
    "guia.card1.cta":   "See full guide →",

    "guia.card2.title": "How to donate or<br>request help",
    "guia.card2.desc":  "Connect with your community by donating items or asking for help when you need it.",
    "guia.card2.li1":   "✅ Post your request or donation",
    "guia.card2.li2":   "✅ Connect with people nearby",
    "guia.card2.li3":   "✅ Create social impact",
    "guia.card2.cta":   "See full guide →",

    "guia.card3.title": "How to pay and get<br>premium benefits",
    "guia.card3.desc":  "Learn about the available payment options and enjoy exclusive benefits on RECO+.",
    "guia.card3.li1":   "✅ Secure payment methods",
    "guia.card3.li2":   "✅ Premium member benefits",
    "guia.card3.li3":   "✅ Manage your subscription",
    "guia.card3.cta":   "See full guide →",

    "guia.como.title":  "How does the EcoTech Store work?",
    "guia.paso1.title": "Post your product",
    "guia.paso1.desc":  "Upload photos, describe your product and set your price.",
    "guia.paso2.title": "Find buyers",
    "guia.paso2.desc":  "Interested people will contact you through the platform.",
    "guia.paso3.title": "Earn money recycling",
    "guia.paso3.desc":  "Close the sale and get paid. We take a small fee to keep the platform running.",

    "guia.mat.title":    "What can you donate?",
    "guia.mat.subtitle": "Find out which materials we accept and which we don't, to keep the process safe and sustainable.",
    "guia.mat.si":       "YES, you can donate",
    "guia.si.item1.title": "Clothes and footwear",
    "guia.si.item1.desc":  "In good condition, clean and without major damage.",
    "guia.si.item2.title": "Working electronics",
    "guia.si.item2.desc":  "Phones, tablets, computers that still work.",
    "guia.si.item3.title": "Books and school supplies",
    "guia.si.item3.desc":  "Textbooks, notebooks, crayons and study materials.",
    "guia.si.item4.title": "Furniture in good condition",
    "guia.si.item4.desc":  "Chairs, tables, shelves with no structural damage.",
    "guia.si.item5.title": "Toys",
    "guia.si.item5.desc":  "Complete, clean and without hazardous parts.",
    "guia.si.item6.title": "Non-perishable food",
    "guia.si.item6.desc":  "Canned goods, grains and products with a valid expiration date.",

    "guia.mat.no": "NO, you cannot donate",
    "guia.no.item1.title": "Loose batteries",
    "guia.no.item1.desc":  "They pose an environmental risk and must go to specialized collection points.",
    "guia.no.item2.title": "Medication",
    "guia.no.item2.desc":  "Expired or not; handling requires special protocols.",
    "guia.no.item3.title": "Chemical or flammable products",
    "guia.no.item3.desc":  "Paints, solvents, aerosols or other hazardous materials.",
    "guia.no.item4.title": "Broken glass or mirrors",
    "guia.no.item4.desc":  "They pose an injury risk during transport.",
    "guia.no.item5.title": "Clothes in very poor condition",
    "guia.no.item5.desc":  "Items with permanent stains, severe tears or bad odor.",
    "guia.no.item6.title": "Perishable or expired food",
    "guia.no.item6.desc":  "Fresh unrefrigerated food or expired products.",

    "guia.mat.nota": "Have questions about a specific item? <a href=\"contacto.html\">Contact us</a> and we'll help you decide.",

    "guia.help.title":    "Need more help?",
    "guia.help.subtitle": "We're here to support you every step<br>toward a more sustainable world.",
    "guia.help.soporte":  "Personalized<br>support",
    "guia.help.recursos": "Resources and<br>tutorials",
    "guia.help.comunidad":"Active<br>community",
    "guia.help.cta":      "Go to Help Center →",

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
    "tutorial.step0.title": "Welcome to RECO+! 👋",
    "tutorial.step0.desc":  "In under a minute we'll show you where everything is: the recycling map, how to donate, and how to ask for help. Use the buttons below to move around, and Esc to exit anytime.",

    "tutorial.step1.title": "Your navigation bar",
    "tutorial.step1.desc":  "From here you can reach any section: Map, Guide, Donate and Alliances. It stays fixed at the top as you scroll, so everything is always one click away.",

    "tutorial.step2.title": "Light / dark mode",
    "tutorial.step2.desc":  "Prefer a softer interface for your eyes at night? Try tapping this switch right now — the tutorial adapts instantly to the new theme.",

    "tutorial.step3.title": "Switch language",
    "tutorial.step3.desc":  "RECO+ speaks Spanish and English. Tap it to switch — the whole page, including this tour, translates in real time without reloading.",

    "tutorial.step4.title": "Join the community",
    "tutorial.step4.desc":  "This button takes you to create your account. With your profile you can save favorite spots, track your donations, and unlock more features.",

    "tutorial.step5.title": "Quick access",
    "tutorial.step5.desc":  "These shortcuts take you straight to the map, donating, asking for help, or the store without digging through the menu. Perfect when you already know exactly what you need to do.",

    "tutorial.step6.title": "Search for what you need",
    "tutorial.step6.desc":  "Type here what you'd like to recycle or donate — for example \"clothes\" or \"electronics\" — and we'll suggest the most relevant options instantly.",

    "tutorial.step7.title": "Recycle and donate, one click closer",
    "tutorial.step7.desc":  "These two cards sum up the platform's two most important actions. Tap them to see nearby recycling points or to start donating today.",

    "tutorial.step8.title": "Everything you can do",
    "tutorial.step8.desc":  "Swipe through this strip of cards to discover every feature: finding points, donating, asking for help, and more. Each card takes you straight to that section.",

    "tutorial.step9.title": "All set, you know RECO+ now! 🎉",
    "tutorial.step9.desc":  "Explore at your own pace. Whenever you want to repeat the full tour, the floating green button will always be here to help.",

    "tutorial.btn.next":    "Next",
    "tutorial.btn.prev":    "Back",
    "tutorial.btn.finish":  "Start exploring!",
    "tutorial.btn.close":   "Close tutorial",
    "tutorial.btn.restart": "Restart tutorial",

    "tutorial.step.counter":  "Step {n} of {total}",
    "tutorial.step.progress": "{pct}% complete",
    "tutorial.fab.label":     "View tutorial",
    "tutorial.fab.tooltip":   "Need help? Restart the tutorial",

    "tutorial.done.title": "Well done! 🎊",
    "tutorial.done.desc":  "You completed the tour. You now know your way around RECO+ like a pro.",

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
    if (dict[key]) el.setAttribute("data-tooltip", dict[key]);
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
