/**
 * RECO+ — Sistema de Búsqueda Global (search.js)
 * Funciona en todas las páginas. Compatible con i18n.js (ES/EN).
 * 
 * Comportamiento:
 *  - En index.html: captura el input del hero y muestra dropdown.
 *    Al seleccionar un resultado redirige a mapa.html?q=..., donar.html?tab=...
 *    o a secciones internas (#tienda, #acciones, etc.)
 *  - En mapa.html: lee ?q= de la URL y activa el filtro del mapa.
 *  - En donar.html: lee ?tab= de la URL y activa el tab correcto.
 */

(function () {
  /* ─────────────────────────────────────────────
     BASE DE DATOS DE RESULTADOS POSIBLES
     Cada entrada tiene:
       keywords_es / keywords_en — palabras clave (minúsculas)
       label_es / label_en       — texto visible en el dropdown
       icon                      — emoji decorativo
       action                    — { type, payload }
         type: "page"      → payload: URL relativa
         type: "map"       → payload: término de filtro para mapa.html
         type: "donar_tab" → payload: "donar" | "solicitar"
         type: "anchor"    → payload: "#id-de-seccion"
  ─────────────────────────────────────────────── */
  const RESULTS_DB = [
    /* ── MAPA / RECICLAJE ─────────────────────── */
    {
      keywords_es: ["mapa","reciclar","reciclaje","punto","puntos","centro","centros","ubicacion","lugar","donde"],
      keywords_en: ["map","recycle","recycling","point","points","center","centers","location","place","where"],
      label_es: "Explorar mapa de reciclaje",
      label_en: "Explore recycling map",
      icon: "📍",
      action: { type: "page", payload: "mapa.html" }
    },
    {
      keywords_es: ["plastico","plasticos","botella","botellas","pet","envase"],
      keywords_en: ["plastic","plastics","bottle","bottles","pet","container"],
      label_es: "Puntos de reciclaje — Plásticos",
      label_en: "Recycling points — Plastics",
      icon: "♻️",
      action: { type: "map", payload: "plasticos" }
    },
    {
      keywords_es: ["papel","carton","cartón","periodico","periódico","libro","libros","revista"],
      keywords_en: ["paper","cardboard","newspaper","book","books","magazine"],
      label_es: "Puntos de reciclaje — Papel",
      label_en: "Recycling points — Paper",
      icon: "📄",
      action: { type: "map", payload: "papel" }
    },
    {
      keywords_es: ["vidrio","botella de vidrio","cristal"],
      keywords_en: ["glass","glass bottle","crystal"],
      label_es: "Puntos de reciclaje — Vidrio",
      label_en: "Recycling points — Glass",
      icon: "🍾",
      action: { type: "map", payload: "vidrio" }
    },
    {
      keywords_es: ["metal","aluminio","lata","latas","hierro","acero","cobre"],
      keywords_en: ["metal","aluminum","can","cans","iron","steel","copper"],
      label_es: "Puntos de reciclaje — Metal",
      label_en: "Recycling points — Metal",
      icon: "🥫",
      action: { type: "map", payload: "metal" }
    },
    {
      keywords_es: ["electronico","electronicos","celular","computador","computadora","laptop","tablet","cable","bateria","baterias","pila","pilas","tecnologia"],
      keywords_en: ["electronic","electronics","phone","computer","laptop","tablet","cable","battery","batteries","technology"],
      label_es: "Puntos de reciclaje — Electrónicos",
      label_en: "Recycling points — Electronics",
      icon: "💻",
      action: { type: "map", payload: "electronicos" }
    },
    {
      keywords_es: ["ropa","zapato","zapatos","calzado","vestimenta","ropa usada","prenda","prendas"],
      keywords_en: ["clothes","clothing","shoe","shoes","footwear","garment","garments","used clothes"],
      label_es: "Puntos de reciclaje — Ropa",
      label_en: "Recycling points — Clothes",
      icon: "👕",
      action: { type: "map", payload: "ropa" }
    },
    {
      keywords_es: ["organico","organicos","compost","comida","residuos organicos","basura organica"],
      keywords_en: ["organic","compost","food","organic waste","organic trash"],
      label_es: "Puntos de reciclaje — Orgánicos",
      label_en: "Recycling points — Organic",
      icon: "🌱",
      action: { type: "map", payload: "organicos" }
    },
    {
      keywords_es: ["donacion","donacion mapa","punto de donacion","puntos de donacion"],
      keywords_en: ["donation","donation map","donation point","donation points"],
      label_es: "Puntos de donación en el mapa",
      label_en: "Donation points on the map",
      icon: "❤️",
      action: { type: "map", payload: "donacion" }
    },

    /* ── DONAR (formulario) ───────────────────── */
    {
      keywords_es: ["donar","dar","entregar","dono","quiero donar","tengo para donar","ofrezco","dona"],
      keywords_en: ["donate","give","deliver","i want to donate","i have to donate","offer","donating"],
      label_es: "Quiero donar algo",
      label_en: "I want to donate something",
      icon: "📦",
      action: { type: "donar_tab", payload: "donar" }
    },
    {
      keywords_es: ["donar ropa","ropa para donar","ropa usada para donar"],
      keywords_en: ["donate clothes","clothes to donate","used clothes donation"],
      label_es: "Donar ropa y calzado",
      label_en: "Donate clothes and footwear",
      icon: "👗",
      action: { type: "donar_tab", payload: "donar" }
    },
    {
      keywords_es: ["donar electronico","donar tecnologia","donar celular","donar laptop","donar computador"],
      keywords_en: ["donate electronics","donate technology","donate phone","donate laptop","donate computer"],
      label_es: "Donar electrónicos",
      label_en: "Donate electronics",
      icon: "📱",
      action: { type: "donar_tab", payload: "donar" }
    },
    {
      keywords_es: ["donar mueble","donar muebles","donar silla","donar mesa"],
      keywords_en: ["donate furniture","donate chair","donate table"],
      label_es: "Donar muebles",
      label_en: "Donate furniture",
      icon: "🪑",
      action: { type: "donar_tab", payload: "donar" }
    },
    {
      keywords_es: ["donar juguete","donar juguetes","donar libro","donar libros","donar utiles"],
      keywords_en: ["donate toys","donate toy","donate books","donate book","donate supplies"],
      label_es: "Donar juguetes, libros o útiles",
      label_en: "Donate toys, books or supplies",
      icon: "🎮",
      action: { type: "donar_tab", payload: "donar" }
    },
    {
      keywords_es: ["donar alimentos","donar comida","donar enlatados","donar granos"],
      keywords_en: ["donate food","donate canned","donate grains","donate groceries"],
      label_es: "Donar alimentos no perecederos",
      label_en: "Donate non-perishable food",
      icon: "🥫",
      action: { type: "donar_tab", payload: "donar" }
    },

    /* ── SOLICITAR AYUDA ──────────────────────── */
    {
      keywords_es: ["ayuda","necesito","pedir","solicitar","solicitud","apoyo","quiero pedir","necesito ayuda","requiero"],
      keywords_en: ["help","need","request","ask","support","i need help","require","assistance"],
      label_es: "Solicitar ayuda o apoyo",
      label_en: "Request help or support",
      icon: "🙏",
      action: { type: "donar_tab", payload: "solicitar" }
    },
    {
      keywords_es: ["necesito ropa","necesito zapatos","necesito calzado"],
      keywords_en: ["need clothes","need shoes","need footwear"],
      label_es: "Pedir ropa o calzado",
      label_en: "Request clothes or footwear",
      icon: "👕",
      action: { type: "donar_tab", payload: "solicitar" }
    },
    {
      keywords_es: ["necesito muebles","necesito silla","necesito cama","necesito mesa"],
      keywords_en: ["need furniture","need chair","need bed","need table"],
      label_es: "Pedir muebles",
      label_en: "Request furniture",
      icon: "🪑",
      action: { type: "donar_tab", payload: "solicitar" }
    },
    {
      keywords_es: ["necesito comida","necesito alimentos","necesito comida","banco de alimentos"],
      keywords_en: ["need food","need groceries","food bank","need meals"],
      label_es: "Pedir alimentos",
      label_en: "Request food",
      icon: "🍽️",
      action: { type: "donar_tab", payload: "solicitar" }
    },

    /* ── PÁGINAS / SECCIONES ──────────────────── */
    {
      keywords_es: ["guia","guía","como funciona","cómo funciona","tutorial","aprender","aprender a reciclar","pasos"],
      keywords_en: ["guide","how it works","how does it work","tutorial","learn","learn to recycle","steps"],
      label_es: "Ver la Guía de RECO+",
      label_en: "See RECO+ Guide",
      icon: "📖",
      action: { type: "page", payload: "guia.html" }
    },
    {
      keywords_es: ["tienda","ecotech","reco tech","producto","productos","comprar","vender","segunda mano","piezas"],
      keywords_en: ["store","ecotech","shop","product","products","buy","sell","second hand","parts"],
      label_es: "Ir a la Tienda RECOTech",
      label_en: "Go to RECOTech Store",
      icon: "🛍️",
      action: { type: "anchor", payload: "#tienda" }
    },
    {
      keywords_es: ["alianzas","empresa","empresas","fundacion","fundación","socio","socios","aliado","aliados","organizacion"],
      keywords_en: ["alliances","company","companies","foundation","partner","partners","ally","allies","organization"],
      label_es: "Ver Alianzas y Empresas",
      label_en: "See Alliances and Companies",
      icon: "🤝",
      action: { type: "page", payload: "alianzas.html" }
    },
    {
      keywords_es: ["contacto","contactar","escribir","mensaje","correo","email","telefono","teléfono"],
      keywords_en: ["contact","reach out","write","message","email","phone"],
      label_es: "Ir a Contacto",
      label_en: "Go to Contact",
      icon: "✉️",
      action: { type: "page", payload: "contacto.html" }
    },
    {
      keywords_es: ["blog","noticias","articulo","artículo","novedades","publicaciones"],
      keywords_en: ["blog","news","article","articles","updates","posts"],
      label_es: "Leer el Blog",
      label_en: "Read the Blog",
      icon: "📰",
      action: { type: "page", payload: "blog.html" }
    },
    {
      keywords_es: ["unirse","unirme","registrar","registro","cuenta","crear cuenta","miembro","comunidad"],
      keywords_en: ["join","sign up","register","account","create account","member","community"],
      label_es: "Únete a RECO+",
      label_en: "Join RECO+",
      icon: "🌿",
      action: { type: "anchor", payload: "#comunidad" }
    },
  ];

  /* ─────────────────────────────────────────────
     FUNCIÓN DE BÚSQUEDA
  ─────────────────────────────────────────────── */
  function searchResults(query) {
    if (!query || query.trim().length < 2) return [];
    const lang = localStorage.getItem("reco-lang") || "es";
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const matches = [];
    for (const entry of RESULTS_DB) {
      const keywords = lang === "en" ? entry.keywords_en : entry.keywords_es;
      const matched = keywords.some(kw => {
        const normKw = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normKw.includes(q) || q.includes(normKw);
      });
      if (matched) {
        matches.push({
          label: lang === "en" ? entry.label_en : entry.label_es,
          icon: entry.icon,
          action: entry.action,
        });
      }
      if (matches.length >= 6) break;
    }
    return matches;
  }

  /* ─────────────────────────────────────────────
     EJECUTAR ACCIÓN AL SELECCIONAR UN RESULTADO
  ─────────────────────────────────────────────── */
  function executeAction(action) {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    if (action.type === "page") {
      window.location.href = action.payload;

    } else if (action.type === "map") {
      // Si ya estamos en mapa.html, activar filtro directamente
      if (currentPage === "mapa.html") {
        applyMapFilter(action.payload);
      } else {
        window.location.href = "mapa.html?q=" + encodeURIComponent(action.payload);
      }

    } else if (action.type === "donar_tab") {
      // Si ya estamos en donar.html, activar tab directamente
      if (currentPage === "donar.html") {
        applyDonarTab(action.payload);
      } else {
        window.location.href = "donar.html?tab=" + action.payload;
      }

    } else if (action.type === "anchor") {
      const anchor = action.payload;
      if (currentPage === "index.html" || currentPage === "") {
        const el = document.querySelector(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "index.html" + anchor;
      }
    }
  }

  /* ─────────────────────────────────────────────
     APLICAR FILTRO EN MAPA (cuando ya estamos en mapa.html)
  ─────────────────────────────────────────────── */
  function applyMapFilter(filterValue) {
    // Activar el chip correspondiente
    const chips = document.querySelectorAll(".chip");
    chips.forEach(chip => {
      chip.classList.remove("active");
      if (chip.dataset.filter === filterValue || 
          (filterValue === "donacion" && chip.dataset.filter === "todos")) {
        chip.classList.add("active");
        chip.click(); // disparar el evento de filtrado existente en app.js
      }
    });
    // Si es "todos" o no hay chip match, resetear
    if (!document.querySelector(`.chip[data-filter="${filterValue}"]`)) {
      const todosChip = document.querySelector('.chip[data-filter="todos"]');
      if (todosChip) todosChip.click();
    }
    // Scroll al mapa
    const mapEl = document.getElementById("map");
    if (mapEl) mapEl.scrollIntoView({ behavior: "smooth" });
  }

  /* ─────────────────────────────────────────────
     APLICAR TAB EN DONAR (cuando ya estamos en donar.html)
  ─────────────────────────────────────────────── */
  function applyDonarTab(tabValue) {
    const targetTab = document.querySelector(`.donar-tab[data-tab="${tabValue}"]`);
    if (targetTab) {
      targetTab.click();
      targetTab.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /* ─────────────────────────────────────────────
     LEER PARÁMETROS DE URL AL CARGAR LA PÁGINA
  ─────────────────────────────────────────────── */
  function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    // mapa.html?q=plasticos
    if (currentPage === "mapa.html") {
      const q = params.get("q");
      if (q) {
        // Esperar a que app.js inicialice el mapa
        const tryApply = (attempts) => {
          const chips = document.querySelectorAll(".chip");
          if (chips.length > 0) {
            applyMapFilter(decodeURIComponent(q));
          } else if (attempts > 0) {
            setTimeout(() => tryApply(attempts - 1), 200);
          }
        };
        setTimeout(() => tryApply(15), 300);
      }
    }

    // donar.html?tab=solicitar
    if (currentPage === "donar.html") {
      const tab = params.get("tab");
      if (tab) {
        const tryApply = (attempts) => {
          const tabEl = document.querySelector(`.donar-tab[data-tab="${tab}"]`);
          if (tabEl) {
            applyDonarTab(tab);
          } else if (attempts > 0) {
            setTimeout(() => tryApply(attempts - 1), 200);
          }
        };
        setTimeout(() => tryApply(10), 300);
      }
    }
  }

  /* ─────────────────────────────────────────────
     CREAR EL DROPDOWN DE RESULTADOS
  ─────────────────────────────────────────────── */
  function createDropdown(inputEl) {
    let dropdown = document.getElementById("reco-search-dropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id = "reco-search-dropdown";
      document.body.appendChild(dropdown);
    }

    // Inyectar estilos si no existen
    if (!document.getElementById("reco-search-styles")) {
      const style = document.createElement("style");
      style.id = "reco-search-styles";
      style.textContent = `
        #reco-search-dropdown {
          position: fixed;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          border: 1.5px solid #e0e0e0;
          z-index: 99999;
          overflow: hidden;
          display: none;
          min-width: 280px;
          max-width: 420px;
        }
        #reco-search-dropdown.visible { display: block; }
        .reco-search-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.15s;
          font-family: Arial, sans-serif;
          font-size: 14px;
          color: #222;
          border-bottom: 1px solid #f0f0f0;
        }
        .reco-search-item:last-child { border-bottom: none; }
        .reco-search-item:hover { background: #e6f4ea; color: #1a5c2a; }
        .reco-search-item .reco-icon { font-size: 18px; flex-shrink: 0; }
        .reco-search-item .reco-label { flex: 1; line-height: 1.3; }
        .reco-search-empty {
          padding: 14px 16px;
          font-size: 13px;
          color: #888;
          font-family: Arial, sans-serif;
          text-align: center;
        }
      `;
      document.head.appendChild(style);
    }

    return dropdown;
  }

  function positionDropdown(dropdown, inputEl) {
    const rect = inputEl.getBoundingClientRect();
    dropdown.style.top  = (rect.bottom + 6) + "px";
    dropdown.style.left = rect.left + "px";
    dropdown.style.width = rect.width + "px";
  }

  function showDropdown(dropdown, results, lang) {
    dropdown.innerHTML = "";
    if (results.length === 0) {
      const empty = document.createElement("div");
      empty.className = "reco-search-empty";
      empty.textContent = lang === "en"
        ? "No results found. Try different keywords."
        : "Sin resultados. Intenta con otras palabras.";
      dropdown.appendChild(empty);
    } else {
      results.forEach(result => {
        const item = document.createElement("div");
        item.className = "reco-search-item";
        item.innerHTML = `
          <span class="reco-icon" aria-hidden="true">${result.icon}</span>
          <span class="reco-label">${result.label}</span>
        `;
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          dropdown.classList.remove("visible");
          executeAction(result.action);
        });
        dropdown.appendChild(item);
      });
    }
    dropdown.classList.add("visible");
  }

  /* ─────────────────────────────────────────────
     CONECTAR BÚSQUEDA A LOS INPUTS DEL HERO (index.html)
     Y AL INPUT DE BÚSQUEDA DEL MAPA (mapa.html)
  ─────────────────────────────────────────────── */
  function attachSearchToInput(inputEl, btnEl) {
    const dropdown = createDropdown(inputEl);
    let debounceTimer;

    inputEl.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const q = inputEl.value.trim();
        const lang = localStorage.getItem("reco-lang") || "es";
        positionDropdown(dropdown, inputEl);
        if (q.length >= 2) {
          const results = searchResults(q);
          showDropdown(dropdown, results, lang);
        } else {
          dropdown.classList.remove("visible");
        }
      }, 180);
    });

    inputEl.addEventListener("focus", () => {
      const q = inputEl.value.trim();
      if (q.length >= 2) {
        positionDropdown(dropdown, inputEl);
        const lang = localStorage.getItem("reco-lang") || "es";
        const results = searchResults(q);
        showDropdown(dropdown, results, lang);
      }
    });

    inputEl.addEventListener("blur", () => {
      setTimeout(() => dropdown.classList.remove("visible"), 200);
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        dropdown.classList.remove("visible");
        const q = inputEl.value.trim();
        if (q.length >= 2) {
          const lang = localStorage.getItem("reco-lang") || "es";
          const results = searchResults(q);
          if (results.length > 0) {
            executeAction(results[0].action);
          }
        }
      }
      if (e.key === "Escape") {
        dropdown.classList.remove("visible");
      }
    });

    // Botón buscar (si existe)
    if (btnEl) {
      btnEl.addEventListener("click", () => {
        const q = inputEl.value.trim();
        if (q.length >= 2) {
          const results = searchResults(q);
          if (results.length > 0) {
            dropdown.classList.remove("visible");
            executeAction(results[0].action);
          }
        }
      });
    }

    // Reposicionar en resize
    window.addEventListener("resize", () => {
      if (dropdown.classList.contains("visible")) {
        positionDropdown(dropdown, inputEl);
      }
    });
  }

  /* ─────────────────────────────────────────────
     INICIALIZACIÓN
  ─────────────────────────────────────────────── */
  function init() {
    // Manejar parámetros de URL primero
    handleURLParams();

    // index.html — barra de búsqueda del hero
    const heroSearch = document.querySelector(".search input");
    const heroBtn    = document.querySelector(".search button");
    if (heroSearch) {
      attachSearchToInput(heroSearch, heroBtn);
    }

    // mapa.html — barra de búsqueda del mapa (también puede tener dropdown)
    const mapaSearch = document.getElementById("searchInput");
    if (mapaSearch) {
      attachSearchToInput(mapaSearch, null);
    }
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();


/* ── HERO SEARCH BAR: búsqueda inline en el index ── */
(function() {
            /* ── Índice de páginas y términos para buscar ── */
            var PAGES = [
                {
                    url: 'mapa.html',
                    icon: '📍',
                    badge: 'Mapa',
                    titleEs: 'Mapa de reciclaje',
                    titleEn: 'Recycling Map',
                    descEs: 'Encuentra puntos de reciclaje cercanos a ti',
                    descEn: 'Find recycling points near you',
                    keywordsEs: ['mapa','ubicacion','punto','reciclaje','cercano','donde','lugar','centro','reciclar'],
                    keywordsEn: ['map','location','point','recycling','nearby','where','place','center']
                },
                {
                    url: 'donar.html',
                    icon: '💚',
                    badge: 'Donar',
                    titleEs: 'Donar / Pedir ayuda',
                    titleEn: 'Donate / Request help',
                    descEs: 'Dona objetos que ya no usas o pide lo que necesitas',
                    descEn: 'Donate unused items or request what you need',
                    keywordsEs: ['donar','donacion','ropa','muebles','electronico','ayuda','objeto','dar','necesito','solicitar','pedir','regalo'],
                    keywordsEn: ['donate','donation','clothes','furniture','electronics','help','give','request','need','gift']
                },
                {
                    url: 'guia.html',
                    icon: '📖',
                    badge: 'Guía',
                    titleEs: 'Guía de reciclaje',
                    titleEn: 'Recycling Guide',
                    descEs: 'Aprende cómo reciclar paso a paso',
                    descEn: 'Learn how to recycle step by step',
                    keywordsEs: ['guia','guía','como','reciclar','plastico','vidrio','papel','carton','metal','organico','aprender','tutorial','paso'],
                    keywordsEn: ['guide','how','recycle','plastic','glass','paper','cardboard','metal','organic','learn','tutorial','step']
                },
                {
                    url: 'alianzas.html',
                    icon: '🤝',
                    badge: 'Alianzas',
                    titleEs: 'Empresas aliadas',
                    titleEn: 'Partner Companies',
                    descEs: 'Organizaciones que apoyan el reciclaje y la sostenibilidad',
                    descEn: 'Organizations supporting recycling and sustainability',
                    keywordsEs: ['alianza','empresa','socio','patrocinador','partner','aliado','organizacion','ecociclo','greentech','repara','biorecicla','tecnoverde'],
                    keywordsEn: ['alliance','company','partner','sponsor','organization']
                },
                {
                    url: 'blog.html',
                    icon: '📝',
                    badge: 'Blog',
                    titleEs: 'Blog de RECO+',
                    titleEn: 'RECO+ Blog',
                    descEs: 'Noticias, tips y artículos sobre sostenibilidad',
                    descEn: 'News, tips and articles about sustainability',
                    keywordsEs: ['blog','articulo','noticia','tip','consejo','sostenibilidad','medio ambiente','impacto','historia'],
                    keywordsEn: ['blog','article','news','tip','advice','sustainability','environment','impact','story']
                },
                {
                    url: 'contacto.html',
                    icon: '✉️',
                    badge: 'Contacto',
                    titleEs: 'Contáctanos',
                    titleEn: 'Contact Us',
                    descEs: 'Escríbenos y te respondemos en menos de 24h',
                    descEn: 'Write to us and we will reply within 24h',
                    keywordsEs: ['contacto','contactar','escribir','correo','email','telefono','mensaje','soporte','ayuda','pregunta'],
                    keywordsEn: ['contact','write','email','phone','message','support','help','question']
                }
            ];

            /* ── Materiales reciclables comunes ── */
            var MATERIALS = [
                { q: 'plástico',    url: 'guia.html#plastico',   icon: '♻️', descEs: 'Ver guía de plásticos',      descEn: 'See plastics guide' },
                { q: 'plastic',     url: 'guia.html#plastico',   icon: '♻️', descEs: 'Ver guía de plásticos',      descEn: 'See plastics guide' },
                { q: 'vidrio',      url: 'guia.html#vidrio',     icon: '🫙', descEs: 'Ver guía de vidrio',          descEn: 'See glass guide' },
                { q: 'glass',       url: 'guia.html#vidrio',     icon: '🫙', descEs: 'Ver guía de vidrio',          descEn: 'See glass guide' },
                { q: 'papel',       url: 'guia.html#papel',      icon: '📄', descEs: 'Ver guía de papel',           descEn: 'See paper guide' },
                { q: 'paper',       url: 'guia.html#papel',      icon: '📄', descEs: 'Ver guía de papel',           descEn: 'See paper guide' },
                { q: 'cartón',      url: 'guia.html#carton',     icon: '📦', descEs: 'Ver guía de cartón',          descEn: 'See cardboard guide' },
                { q: 'cardboard',   url: 'guia.html#carton',     icon: '📦', descEs: 'Ver guía de cartón',          descEn: 'See cardboard guide' },
                { q: 'metal',       url: 'guia.html#metal',      icon: '🔩', descEs: 'Ver guía de metales',         descEn: 'See metals guide' },
                { q: 'ropa',        url: 'donar.html',           icon: '👗', descEs: 'Donar ropa',                  descEn: 'Donate clothes' },
                { q: 'clothes',     url: 'donar.html',           icon: '👗', descEs: 'Donar ropa',                  descEn: 'Donate clothes' },
                { q: 'electronico', url: 'guia.html',            icon: '💻', descEs: 'Guía de electrónicos',        descEn: 'Electronics guide' },
                { q: 'electronic',  url: 'guia.html',            icon: '💻', descEs: 'Guía de electrónicos',        descEn: 'Electronics guide' },
                { q: 'celular',     url: 'guia.html',            icon: '📱', descEs: 'Cómo reciclar tu celular',    descEn: 'How to recycle your phone' },
                { q: 'phone',       url: 'guia.html',            icon: '📱', descEs: 'Cómo reciclar tu celular',    descEn: 'How to recycle your phone' },
                { q: 'bateria',     url: 'guia.html',            icon: '🔋', descEs: 'Dónde desechar baterías',     descEn: 'Where to dispose batteries' },
                { q: 'battery',     url: 'guia.html',            icon: '🔋', descEs: 'Dónde desechar baterías',     descEn: 'Where to dispose batteries' },
                { q: 'mueble',      url: 'donar.html',           icon: '🪑', descEs: 'Donar muebles',               descEn: 'Donate furniture' },
                { q: 'furniture',   url: 'donar.html',           icon: '🪑', descEs: 'Donar muebles',               descEn: 'Donate furniture' },
                { q: 'juguete',     url: 'donar.html',           icon: '🧸', descEs: 'Donar juguetes',              descEn: 'Donate toys' },
                { q: 'toy',         url: 'donar.html',           icon: '🧸', descEs: 'Donar juguetes',              descEn: 'Donate toys' },
                { q: 'libro',       url: 'donar.html',           icon: '📚', descEs: 'Donar libros',                descEn: 'Donate books' },
                { q: 'book',        url: 'donar.html',           icon: '📚', descEs: 'Donar libros',                descEn: 'Donate books' },
            ];

            var input   = document.getElementById('heroSearchInput');
            var btn     = document.getElementById('heroSearchBtn');
            var dropdown = document.getElementById('heroSearchDropdown');
            var results  = document.getElementById('heroSearchResults');
            if (!input || !btn || !dropdown || !results) return;

            var currentLang = function() {
                return localStorage.getItem('reco-lang') || 'es';
            };

            function normalize(str) {
                return str.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9\s]/g, '');
            }

            function search(query) {
                if (!query || query.trim().length < 1) return [];
                var q = normalize(query.trim());
                var lang = currentLang();
                var found = [];

                /* 1. Material matches (exact prefix) */
                MATERIALS.forEach(function(m) {
                    if (normalize(m.q).indexOf(q) === 0 || q.indexOf(normalize(m.q)) === 0) {
                        found.push({
                            url: m.url,
                            icon: m.icon,
                            title: lang === 'en' ? m.descEn : m.descEs,
                            desc:  lang === 'en' ? 'Ver guía / Go to guide' : 'Ver guía',
                            badge: lang === 'en' ? 'Material' : 'Material',
                            type: 'material'
                        });
                    }
                });

                /* 2. Page keyword matches */
                PAGES.forEach(function(p) {
                    var keywords = lang === 'en' ? p.keywordsEn : p.keywordsEs;
                    var titleCheck = normalize(lang === 'en' ? p.titleEn : p.titleEs);
                    var hit = titleCheck.indexOf(q) !== -1 ||
                        keywords.some(function(k) { return k.indexOf(q) !== -1 || q.indexOf(k) !== -1; });
                    if (hit) {
                        found.push({
                            url: p.url,
                            icon: p.icon,
                            title: lang === 'en' ? p.titleEn : p.titleEs,
                            desc:  lang === 'en' ? p.descEn : p.descEs,
                            badge: p.badge,
                            type: 'page'
                        });
                    }
                });

                /* deduplicate by url */
                var seen = {};
                return found.filter(function(r) {
                    if (seen[r.url]) return false;
                    seen[r.url] = true;
                    return true;
                }).slice(0, 6);
            }

            function renderResults(items, query) {
                results.innerHTML = '';
                if (!items.length) {
                    var lang = currentLang();
                    var msg = document.createElement('div');
                    msg.className = 'sg-empty';
                    msg.textContent = lang === 'en'
                        ? 'No results for "' + query + '"'
                        : 'Sin resultados para "' + query + '"';
                    results.appendChild(msg);
                    return;
                }

                var lang = currentLang();
                var pages = items.filter(function(i) { return i.type === 'page'; });
                var mats  = items.filter(function(i) { return i.type === 'material'; });

                if (mats.length) {
                    var lbl = document.createElement('div');
                    lbl.className = 'sg-section-label';
                    lbl.textContent = lang === 'en' ? 'Materials' : 'Materiales';
                    results.appendChild(lbl);
                    mats.forEach(function(r) { results.appendChild(buildRow(r)); });
                }
                if (pages.length) {
                    var lbl2 = document.createElement('div');
                    lbl2.className = 'sg-section-label';
                    lbl2.textContent = lang === 'en' ? 'Pages' : 'Páginas';
                    results.appendChild(lbl2);
                    pages.forEach(function(r) { results.appendChild(buildRow(r)); });
                }
            }

            function buildRow(r) {
                var a = document.createElement('a');
                a.className = 'sg-result';
                a.href = r.url;
                a.innerHTML =
                    '<div class="sg-result__icon">' + r.icon + '</div>' +
                    '<div class="sg-result__info">' +
                        '<div class="sg-result__title">' + r.title + '</div>' +
                        '<div class="sg-result__desc">' + r.desc + '</div>' +
                    '</div>' +
                    '<span class="sg-result__badge">' + r.badge + '</span>';
                return a;
            }

            function showDropdown(items, query) {
                renderResults(items, query);
                dropdown.hidden = false;
            }

            function hideDropdown() {
                dropdown.hidden = true;
                results.innerHTML = '';
            }

            function doSearch() {
                var q = input.value.trim();
                if (!q) { hideDropdown(); return; }
                /* If search.js exists it handles the full search — redirect to it */
                if (typeof window.recoSearch === 'function') {
                    window.recoSearch(q);
                    return;
                }
                /* Otherwise use URL param routing (compatible with search.js pattern) */
                var items = search(q);
                if (items.length === 1) {
                    window.location.href = items[0].url + '?q=' + encodeURIComponent(q);
                } else {
                    showDropdown(items, q);
                }
            }

            var debounceTimer;
            input.addEventListener('input', function() {
                clearTimeout(debounceTimer);
                var q = input.value.trim();
                if (!q) { hideDropdown(); return; }
                debounceTimer = setTimeout(function() {
                    var items = search(q);
                    showDropdown(items, q);
                }, 160);
            });

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
                if (e.key === 'Escape') { hideDropdown(); input.blur(); }
                /* Keyboard nav in dropdown */
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    var rows = results.querySelectorAll('.sg-result');
                    if (!rows.length) return;
                    var active = results.querySelector('.sg-result--active');
                    var idx = -1;
                    rows.forEach(function(r, i) { if (r === active) idx = i; });
                    if (active) active.classList.remove('sg-result--active');
                    if (e.key === 'ArrowDown') idx = (idx + 1) % rows.length;
                    else idx = (idx - 1 + rows.length) % rows.length;
                    rows[idx].classList.add('sg-result--active');
                    rows[idx].focus();
                }
            });

            btn.addEventListener('click', function() { doSearch(); });

            /* Close on outside click */
            document.addEventListener('click', function(e) {
                if (!document.getElementById('heroSearchBar').contains(e.target)) {
                    hideDropdown();
                }
            });
})();