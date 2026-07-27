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
    "mapa.filter.todos":        "Todos",
    "mapa.filter.plasticos":    "Plásticos",
    "mapa.filter.papel":        "Papel",
    "mapa.filter.vidrio":       "Vidrio",
    "mapa.filter.metal":        "Metal",
    "mapa.filter.ropa":         "Ropa",
    "mapa.filter.electronicos": "Electrónicos",
    "mapa.filter.organicos":    "Orgánicos",
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

    "reciclar.escaner.title": "Escáner inteligente",
    "reciclar.escaner.sub":   "Escanea cualquier objeto y nuestra IA te dirá si es reciclable, en qué categoría pertenece, cómo prepararlo y dónde puedes llevarlo.",
    "reciclar.escaner.drop1": "Toma una foto o sube una imagen",
    "reciclar.escaner.drop2": "JPG, PNG o WEBP (máx. 10MB)",
    "reciclar.escaner.f1": "¿Es reciclable?",
    "reciclar.escaner.f2": "Categoría",
    "reciclar.escaner.f3": "Dónde llevarlo",
    "reciclar.escaner.f4": "Cómo prepararlo",
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
    "mapa.filter.todos":        "All",
    "mapa.filter.plasticos":    "Plastics",
    "mapa.filter.papel":        "Paper",
    "mapa.filter.vidrio":       "Glass",
    "mapa.filter.metal":        "Metal",
    "mapa.filter.ropa":         "Clothes",
    "mapa.filter.electronicos": "Electronics",
    "mapa.filter.organicos":    "Organic",
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

    "reciclar.escaner.title": "Smart scanner",
    "reciclar.escaner.sub":   "Scan any object and our AI will tell you if it's recyclable, its category, how to prepare it, and where to take it.",
    "reciclar.escaner.drop1": "Take a photo or upload an image",
    "reciclar.escaner.drop2": "JPG, PNG or WEBP (max. 10MB)",
    "reciclar.escaner.f1": "Is it recyclable?",
    "reciclar.escaner.f2": "Category",
    "reciclar.escaner.f3": "Where to take it",
    "reciclar.escaner.f4": "How to prepare it",
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

    // Botones con hijos (ej. SVG + texto): actualizar solo el nodo de texto
    // para no destruir los íconos internos
    if (el.tagName === "BUTTON" && el.querySelector("svg, img")) {
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
