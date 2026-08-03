/**
 * donaciones-listado.js — RECO+
 * Capa ADITIVA para donaciones.html ("Ver todas las publicaciones").
 * Carga TODAS las filas activas de la tabla `donaciones` (sin límite
 * de 12 como en el carrusel del home), permite filtrar por tipo
 * (todas / donar / solicitar) y buscar en vivo por categoría,
 * descripción o ubicación.
 *
 * Reutiliza window.dhOpenDetailModal, expuesto por donar-listings.js,
 * para abrir el mismo modal de detalle que usa donar.html — no
 * duplica esa lógica ni su HTML.
 *
 * No modifica donar-listings.js, donar.js ni ningún otro archivo.
 *
 * Cargar DESPUÉS de supabase-config.js y donar-listings.js:
 * <script src="donaciones-listado.js"></script>
 */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  var CATEGORY_EMOJI = {
    'Ropa y calzado': '👕',
    'Electrónicos': '💻',
    'Muebles': '🛋️',
    'Libros y útiles': '📚',
    'Juguetes': '🧸',
    'Alimentos no perecederos': '🥫',
    'Alimentos': '🥫',
    'Otro': '📦'
  };

  function emojiFor(categoria) {
    return CATEGORY_EMOJI[categoria] || '📦';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function timeAgo(dateStr) {
    var diffMs = Date.now() - new Date(dateStr).getTime();
    var mins = Math.floor(diffMs / 60000);
    if (mins < 1) return t('donar.time.justoAhora');
    if (mins < 60) return t('donar.time.haceMin', { n: mins });
    var hours = Math.floor(mins / 60);
    if (hours < 24) return t('donar.time.haceHoras', { n: hours });
    var days = Math.floor(hours / 24);
    if (days < 30) return t('donar.time.haceDias', { n: days });
    return new Date(dateStr).toLocaleDateString(currentLang() === 'en' ? 'en-US' : 'es-PA');
  }

  function disponibilidadBadge(disponibilidad) {
    if (!disponibilidad) return null;
    var val = disponibilidad.toLowerCase();
    if (val.indexOf('inmediata') !== -1 || val.indexOf('antes posible') !== -1) {
      return { text: disponibilidad, cls: 'dl-card-badge--good' };
    }
    return { text: disponibilidad, cls: 'dl-card-badge--warn' };
  }

  /* ── Estado en memoria ── */
  var allRows = [];          // todas las filas activas cargadas de Supabase
  var rowsById = {};         // índice id -> fila, para abrir el modal de detalle
  var currentFilter = 'todas';
  var currentSearch = '';

  function getClient() {
    if (!window.recoSupabase) {
      console.error('[RECO+] recoSupabase no está inicializado. Revisa que supabase-config.js se cargó antes que donaciones-listado.js.');
      return null;
    }
    return window.recoSupabase;
  }

  function buildCardHTML(row) {
    var isDonar = row.tipo === 'donar';
    var img = row.imagen_base64
      ? '<img src="' + row.imagen_base64 + '" alt="' + escapeHtml(row.categoria) + '" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">'
      : emojiFor(row.categoria);

    var badge = disponibilidadBadge(row.disponibilidad);
    var badgeHTML = badge
      ? '<span class="dl-card-badge ' + badge.cls + '">' + escapeHtml(badge.text) + '</span>'
      : '';

    var typeHTML = '<span class="dl-card-type">' + (isDonar ? t('donaciones.tipo.donacion') : t('donaciones.tipo.solicitud')) + '</span>';

    var titulo = row.descripcion
      ? (row.descripcion.length > 46 ? row.descripcion.slice(0, 46) + '…' : row.descripcion)
      : row.categoria;

    var ubicacion = row.ubicacion ? '📍 ' + escapeHtml(row.ubicacion) : '📍 ' + t('donar.listings.ubicacionSinEspecificar');
    var actionLabel = isDonar ? t('donar.card.verDonacion') : t('donar.card.ayudar');

    return (
      '<div class="dl-card ' + (isDonar ? 'dl-card--donar' : 'dl-card--solicitar') + '" data-donacion-id="' + row.id + '">' +
        '<div class="dl-card-img">' + badgeHTML + typeHTML + img + '</div>' +
        '<h4>' + escapeHtml(titulo) + '</h4>' +
        '<p class="dl-card-meta">' + ubicacion + '</p>' +
        '<p class="dl-card-cat">' + escapeHtml(row.categoria) + ' · ' + timeAgo(row.created_at) + '</p>' +
        '<button class="dl-card-btn">' + actionLabel + '</button>' +
      '</div>'
    );
  }

  /* ── Aplica el filtro de tipo + la búsqueda de texto sobre allRows
     y vuelve a pintar el grid. No vuelve a pedir datos a Supabase. ── */
  function applyFiltersAndRender() {
    var grid = document.getElementById('dlGrid');
    var countEl = document.getElementById('dlCount');
    if (!grid) return;

    var term = currentSearch.trim().toLowerCase();

    var filtered = allRows.filter(function (row) {
      if (currentFilter !== 'todas' && row.tipo !== currentFilter) return false;
      if (!term) return true;
      var haystack = [row.categoria, row.descripcion, row.ubicacion]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.indexOf(term) !== -1;
    });

    if (countEl) countEl.textContent = String(filtered.length);

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="dl-empty">' + escapeHtml(t('donaciones.sinResultados')) + '</div>';
      return;
    }

    grid.innerHTML = filtered.map(buildCardHTML).join('');
  }

  /* ── Carga TODAS las filas activas (donar + solicitar) de una sola
     vez desde Supabase, sin límite. ── */
  function loadAll() {
    var client = getClient();
    var grid = document.getElementById('dlGrid');
    if (!client) {
      if (grid) grid.innerHTML = '<div class="dl-empty">' + escapeHtml(t('donaciones.error.conexion')) + '</div>';
      return;
    }

    client
      .from('donaciones')
      .select('*')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando publicaciones:', res.error);
          if (grid) grid.innerHTML = '<div class="dl-empty">' + escapeHtml(t('donaciones.error.carga')) + '</div>';
          return;
        }
        allRows = res.data || [];
        rowsById = {};
        allRows.forEach(function (row) { rowsById[String(row.id)] = row; });
        applyFiltersAndRender();
      });
  }

  /* ── Conecta chips de filtro, buscador y clicks en las tarjetas
     (delegado sobre #dlGrid, ya que se regenera en cada render). ── */
  function setupControls() {
    var chips = document.querySelectorAll('.dl-chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter') || 'todas';
        applyFiltersAndRender();
      });
    });

    var searchInput = document.getElementById('dlSearch');
    if (searchInput) {
      var debounceTimer = null;
      searchInput.addEventListener('input', function () {
        currentSearch = searchInput.value || '';
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFiltersAndRender, 150);
      });
    }

    var grid = document.getElementById('dlGrid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.dl-card-btn') : null;
        if (!btn) return;
        var card = btn.closest('.dl-card[data-donacion-id]');
        if (!card) return;
        var row = rowsById[card.getAttribute('data-donacion-id')];
        if (row && window.dhOpenDetailModal) window.dhOpenDetailModal(row);
      });
    }
  }

  ready(function () {
    setupControls();
    loadAll();
  });
})();
