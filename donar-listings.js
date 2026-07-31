/**
 * donar-listings.js — RECO+
 * Capa ADITIVA: reemplaza las tarjetas hardcodeadas de "Donaciones
 * disponibles" y "Solicitudes de donación" en donar.html por datos
 * reales guardados en la tabla `donaciones` de Supabase (ver
 * donar.js, que ahora inserta ahí cada publicación).
 *
 * No modifica donar.js, DonarHome.js ni DonarHome.css: solo pinta
 * contenido dentro de los mismos contenedores (#dhCarouselDonaciones,
 * #dhCarouselSolicitudes) reutilizando las clases .dh-card ya
 * existentes, así que hereda el mismo estilo de vidrio y el mismo
 * carrusel con flechas que ya arma DonarHome.js.
 *
 * Expone: window.dhRefreshListings() — usado por donar.js justo
 * después de publicar con éxito, para que la tarjeta nueva aparezca
 * sin recargar la página.
 *
 * Cargar DESPUÉS de supabase-config.js y DonarHome.js:
 * <script src="donar-listings.js"></script>
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

  /* ── Emoji representativo por categoría (fallback cuando la
     publicación no tiene foto adjunta) ── */
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

  /* ── Texto legible para el badge de disponibilidad ── */
  function disponibilidadBadge(disponibilidad) {
    if (!disponibilidad) return null;
    var val = disponibilidad.toLowerCase();
    if (val.indexOf('inmediata') !== -1 || val.indexOf('antes posible') !== -1) {
      return { text: disponibilidad, cls: 'dh-card-badge--good' };
    }
    return { text: disponibilidad, cls: 'dh-card-badge--warn' };
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
    if (mins < 1) return 'justo ahora';
    if (mins < 60) return 'hace ' + mins + ' min';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return 'hace ' + hours + 'h';
    var days = Math.floor(hours / 24);
    if (days < 30) return 'hace ' + days + 'd';
    return new Date(dateStr).toLocaleDateString('es-PA');
  }

  /* ── Construye el HTML de una tarjeta a partir de una fila de la
     tabla `donaciones`. actionLabel cambia según la columna
     (Donaciones → "Ver donación", Solicitudes → "Ayudar"). ── */
  function buildCardHTML(row, actionLabel) {
    var img = row.imagen_base64
      ? '<img src="' + row.imagen_base64 + '" alt="' + escapeHtml(row.categoria) + '" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">'
      : emojiFor(row.categoria);

    var badge = disponibilidadBadge(row.disponibilidad);
    var badgeHTML = badge
      ? '<span class="dh-card-badge ' + badge.cls + '">' + escapeHtml(badge.text) + '</span>'
      : '';

    var titulo = row.descripcion
      ? (row.descripcion.length > 42 ? row.descripcion.slice(0, 42) + '…' : row.descripcion)
      : row.categoria;

    var ubicacion = row.ubicacion ? '📍 ' + escapeHtml(row.ubicacion) : '📍 Ubicación no especificada';

    return (
      '<div class="dh-card dh-glass dn-reveal is-visible" data-donacion-id="' + row.id + '">' +
        '<div class="dh-card-img">' + badgeHTML + img + '</div>' +
        '<h4>' + escapeHtml(titulo) + '</h4>' +
        '<p class="dh-card-meta">' + ubicacion + '</p>' +
        '<p class="dh-card-cat">' + escapeHtml(row.categoria) + ' · ' + timeAgo(row.created_at) + '</p>' +
        '<button class="dh-card-btn">' + actionLabel + ' →</button>' +
      '</div>'
    );
  }

  function emptyStateHTML(mensaje) {
    return (
      '<div class="dh-card dh-glass dn-reveal is-visible" style="display:flex;align-items:center;justify-content:center;text-align:center;padding:24px 16px;">' +
        '<p class="dh-card-cat" style="margin:0;">' + escapeHtml(mensaje) + '</p>' +
      '</div>'
    );
  }

  function renderList(trackId, rows, actionLabel, emptyMsg) {
    var track = document.getElementById(trackId);
    if (!track) return;

    if (!rows || rows.length === 0) {
      track.innerHTML = emptyStateHTML(emptyMsg);
      return;
    }

    track.innerHTML = rows.map(function (row) {
      return buildCardHTML(row, actionLabel);
    }).join('');
  }

  function getClient() {
    if (!window.recoSupabase) {
      console.error('[RECO+] recoSupabase no está inicializado. Revisa que supabase-config.js se cargó antes que donar-listings.js.');
      return null;
    }
    return window.recoSupabase;
  }

  /* ── Carga y pinta ambos carruseles con datos reales ── */
  function loadListings() {
    var client = getClient();
    if (!client) return;

    client
      .from('donaciones')
      .select('*')
      .eq('tipo', 'donar')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .limit(12)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando donaciones:', res.error);
          return;
        }
        renderList('dhCarouselDonaciones', res.data, 'Ver donación', 'Aún no hay donaciones publicadas. ¡Sé el primero!');
      });

    client
      .from('donaciones')
      .select('*')
      .eq('tipo', 'solicitar')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .limit(12)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando solicitudes:', res.error);
          return;
        }
        renderList('dhCarouselSolicitudes', res.data, 'Ayudar', 'Aún no hay solicitudes publicadas.');
      });
  }

  window.dhRefreshListings = loadListings;

  ready(loadListings);
})();
