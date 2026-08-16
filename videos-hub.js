/**
 * videos-hub.js
 * Lógica de la biblioteca de videos (videos.html): construye los
 * chips de categoría a partir de RECO_VIDEOS_DATA, filtra el grid,
 * soporta deep-link a un video puntual (?v=id) o a una categoría
 * (?cat=clave) y se re-renderiza al cambiar de idioma.
 *
 * Capa 100% aditiva. Requiere que videos-data.js se cargue antes:
 * <script src="videos-data.js"></script>
 * <script src="videos-hub.js"></script>
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function tr(key, fallback) {
    return (typeof window.t === "function") ? window.t(key) : fallback;
  }

  var PLAY_ICON = '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M6 4.5v11l9-5.5-9-5.5z"/></svg>';

  var DATA = window.RECO_VIDEOS_DATA || { categories: [], videos: [] };
  var currentFilter = "todos";
  var currentSearch = "";

  function chipsWrap() { return document.getElementById("vhChips"); }
  function gridWrap() { return document.getElementById("vhGrid"); }
  function emptyState() { return document.getElementById("vhEmpty"); }
  function countLabel() { return document.getElementById("vhCount"); }
  function searchInput() { return document.getElementById("vhSearchInput"); }
  function searchClearBtn() { return document.getElementById("vhSearchClear"); }

  // Quita acentos y pasa a minúsculas para que la búsqueda encuentre
  // "donacion" aunque el texto real diga "Donación", etc.
  function normalize(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function buildChips() {
    var wrap = chipsWrap();
    if (!wrap) return;
    wrap.innerHTML = "";

    var allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "vh-chip" + (currentFilter === "todos" ? " active" : "");
    allChip.dataset.key = "todos";
    allChip.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" width="16" height="16"><rect x="3" y="3" width="6" height="6" rx="1.2"/><rect x="11" y="3" width="6" height="6" rx="1.2"/><rect x="3" y="11" width="6" height="6" rx="1.2"/><rect x="11" y="11" width="6" height="6" rx="1.2"/></svg><span>' + tr("videos.cat.todos", "Todos") + "</span>";
    allChip.addEventListener("click", function () { setFilter("todos"); });
    wrap.appendChild(allChip);

    DATA.categories.forEach(function (cat) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "vh-chip" + (currentFilter === cat.key ? " active" : "");
      chip.dataset.key = cat.key;
      chip.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">' + cat.icon + "</svg><span>" + tr(cat.labelKey, cat.fallback) + "</span>";
      chip.addEventListener("click", function () { setFilter(cat.key); });
      wrap.appendChild(chip);
    });
  }

  function catLabel(key) {
    var cat = DATA.categories.filter(function (c) { return c.key === key; })[0];
    if (!cat) return key;
    return tr(cat.labelKey, cat.fallback);
  }

  function getFiltered(filter, query) {
    var list = (filter === "todos")
      ? DATA.videos
      : DATA.videos.filter(function (v) { return v.category === filter; });

    var q = normalize(query);
    if (!q) return list;

    return list.filter(function (video) {
      var title = video.titleKey ? tr(video.titleKey, video.titleFallback) : video.titleFallback;
      var desc = video.descKey ? tr(video.descKey, video.descFallback) : video.descFallback;
      var haystack = normalize(title) + " " + normalize(desc) + " " + normalize(catLabel(video.category));
      return haystack.indexOf(q) !== -1;
    });
  }

  function revealCards() {
    var cards = document.querySelectorAll(".vh-card");
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          o.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      cards.forEach(function (el) { obs.observe(el); });
    } else {
      cards.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  function renderGrid(highlightId) {
    var grid = gridWrap();
    if (!grid) return;
    var list = getFiltered(currentFilter, currentSearch);

    grid.innerHTML = "";
    list.forEach(function (video) {
      var card = document.createElement("article");
      card.className = "vh-card" + (video.isCommunity ? " vh-card--community" : "");
      card.dataset.id = video.id;
      card.dataset.variant = video.variant;
      var badgeHTML = video.duration
        ? '<span class="vh-card__badge">' + video.duration + "</span>"
        : (video.isCommunity ? '<span class="vh-card__badge">' + tr("videos.badge.comunidad", "Comunidad") + "</span>" : "");
      var titleText = video.titleKey ? tr(video.titleKey, video.titleFallback) : video.titleFallback;
      var descText = video.descKey ? tr(video.descKey, video.descFallback) : video.descFallback;
      card.innerHTML =
        '<div class="vh-card__thumb">' +
          '<span class="vh-card__cat">' + catLabel(video.category) + "</span>" +
          '<span class="vh-card__icon">' + PLAY_ICON + "</span>" +
          badgeHTML +
        "</div>" +
        '<div class="vh-card__body">' +
          '<h3 class="vh-card__title">' + titleText + "</h3>" +
          '<p class="vh-card__desc">' + descText + "</p>" +
        "</div>";
      grid.appendChild(card);
    });

    var empty = emptyState();
    if (empty) {
      empty.classList.toggle("is-visible", list.length === 0);
      var isSearching = currentSearch.trim().length > 0;
      var titleEl = empty.querySelector("strong");
      var descEl = empty.querySelector("span");
      if (titleEl && descEl) {
        if (isSearching) {
          titleEl.textContent = tr("videos.search.empty.title", "No encontramos videos para \u201c{q}\u201d").replace("{q}", currentSearch.trim());
          descEl.textContent = tr("videos.search.empty.desc", "Prueba con otra palabra o borra la búsqueda para ver toda la categoría.");
        } else {
          titleEl.textContent = tr("videos.empty.title", "No hay videos en esta categoría");
          descEl.textContent = tr("videos.empty.desc", "Prueba con otra categoría o vuelve a \"Todos\" para ver la biblioteca completa.");
        }
      }
    }

    var count = countLabel();
    if (count) count.textContent = tr("videos.results.count", "Mostrando {n} videos").replace("{n}", list.length);

    revealCards();

    if (highlightId) {
      var target = grid.querySelector('[data-id="' + highlightId + '"]');
      if (target) {
        target.classList.add("is-visible");
        window.setTimeout(function () {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.classList.add("vh-card--highlight");
          window.setTimeout(function () { target.classList.remove("vh-card--highlight"); }, 2800);
        }, 60);
      }
    }
  }

  function setFilter(key, opts) {
    currentFilter = key;
    var wrap = chipsWrap();
    if (wrap) {
      wrap.querySelectorAll(".vh-chip").forEach(function (c) {
        c.classList.toggle("active", c.dataset.key === key);
      });
    }
    renderGrid(opts && opts.highlightId);

    if (!(opts && opts.skipHistory) && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (key === "todos") url.searchParams.delete("cat");
      else url.searchParams.set("cat", key);
      url.searchParams.delete("v");
      window.history.replaceState({}, "", url);
    }
  }

  function updateClearBtnVisibility() {
    var clearBtn = searchClearBtn();
    if (clearBtn) clearBtn.classList.toggle("is-visible", currentSearch.trim().length > 0);
  }

  function setSearch(query, opts) {
    currentSearch = query || "";
    var input = searchInput();
    if (input && input.value !== currentSearch) input.value = currentSearch;
    updateClearBtnVisibility();
    renderGrid();

    if (!(opts && opts.skipHistory) && window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      if (currentSearch.trim()) url.searchParams.set("buscar", currentSearch.trim());
      else url.searchParams.delete("buscar");
      url.searchParams.delete("v");
      window.history.replaceState({}, "", url);
    }
  }

  function wireSearch() {
    var input = searchInput();
    var clearBtn = searchClearBtn();
    if (!input || input._recoWired) return;
    input._recoWired = true;

    var debounceTimer;
    input.addEventListener("input", function () {
      window.clearTimeout(debounceTimer);
      var value = input.value;
      debounceTimer = window.setTimeout(function () { setSearch(value); }, 200);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        window.clearTimeout(debounceTimer);
        setSearch("");
        input.blur();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        window.clearTimeout(debounceTimer);
        setSearch("");
        input.focus();
      });
    }
  }

  function refreshOnLangChange() {
    buildChips();
    var input = searchInput();
    if (input) input.placeholder = tr("videos.search.placeholder", "Buscar videos…");
    renderGrid();
  }
  document.addEventListener("reco:langchange", refreshOnLangChange);

  // Permite a capas aditivas (ej. videos-supabase.js) pedir un
  // re-render del grid después de inyectar videos nuevos en
  // RECO_VIDEOS_DATA.videos una vez que ya cargó de forma asíncrona.
  window.recoVideosHubRefresh = function () {
    renderGrid();
  };

  ready(function () {
    if (!gridWrap()) return;

    var params = new URLSearchParams(window.location.search);
    var videoId = params.get("v");
    var catParam = params.get("cat");
    var searchParam = params.get("buscar");

    buildChips();
    wireSearch();

    if (searchParam) {
      currentSearch = searchParam;
      var input = searchInput();
      if (input) input.value = searchParam;
      updateClearBtnVisibility();
    }

    if (videoId) {
      var video = DATA.videos.filter(function (v) { return v.id === videoId; })[0];
      if (video) {
        setFilter(video.category, { skipHistory: true, highlightId: video.id });
      } else {
        setFilter("todos", { skipHistory: true });
      }
    } else if (catParam && DATA.categories.some(function (c) { return c.key === catParam; })) {
      setFilter(catParam, { skipHistory: true });
    } else {
      setFilter("todos", { skipHistory: true });
    }
  });
})();
