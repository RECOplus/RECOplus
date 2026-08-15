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

  function chipsWrap() { return document.getElementById("vhChips"); }
  function gridWrap() { return document.getElementById("vhGrid"); }
  function emptyState() { return document.getElementById("vhEmpty"); }
  function countLabel() { return document.getElementById("vhCount"); }

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

  function getFiltered(filter) {
    if (filter === "todos") return DATA.videos;
    return DATA.videos.filter(function (v) { return v.category === filter; });
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
    var list = getFiltered(currentFilter);

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
    if (empty) empty.classList.toggle("is-visible", list.length === 0);

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

  function refreshOnLangChange() {
    buildChips();
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

    buildChips();

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
