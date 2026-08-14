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

  /* ── Etiqueta traducida para la categoría ──
     `categoria` se guarda en Supabase en español (el valor fijo del
     <option>, ver donar.js), así que aquí se mapea a su clave i18n
     (ya preparada en i18n.js, sección "DONAR: mapeo de categorías")
     y se traduce según el idioma actual. CATEGORY_EMOJI de arriba
     sigue usando el valor crudo como llave: no se toca. ── */
  var CATEGORIA_I18N_KEY = {
    'Ropa y calzado': 'donar.cat.ropaCalzado',
    'Electrónicos': 'donar.cat.electronicos',
    'Muebles': 'donar.cat.muebles',
    'Libros y útiles': 'donar.cat.librosUtiles',
    'Juguetes': 'donar.cat.juguetes',
    'Alimentos no perecederos': 'donar.cat.alimentosNoPerecederos',
    'Alimentos': 'donar.cat.alimentos',
    'Material escolar': 'donar.cat.materialEscolar',
    'Productos de higiene': 'donar.cat.higiene',
    'Medicinas no vencidas': 'donar.cat.medicinas',
    'Otro': 'donar.cat.otro'
  };

  function categoriaLabel(categoria) {
    if (!categoria) return categoria;
    var key = CATEGORIA_I18N_KEY[categoria];
    return key ? t(key) : categoria; // valor sin mapear: se muestra tal cual
  }

  /* ── Caché en memoria de las filas ya cargadas (donaciones y
     solicitudes), indexada por id. Se usa para llenar el modal de
     detalle sin tener que volver a pedirle el registro a Supabase
     cuando el usuario toca "Ver donación" / "Ayudar". ── */
  var rowsCache = {};

  /* ── Texto legible para el badge de disponibilidad ──
     El valor viene guardado en Supabase tal cual lo eligió el usuario
     en el <select> (en el idioma en que estaba la página al publicar),
     así que aquí lo reconocemos por palabra clave en ambos idiomas y
     lo volvemos a traducir con t() según el idioma ACTUAL de quien
     está viendo la tarjeta — así una donación publicada en español se
     ve en inglés si el visitante cambió el idioma, y viceversa. ── */
  function disponibilidadBadge(disponibilidad) {
    if (!disponibilidad) return null;
    var val = disponibilidad.toLowerCase();
    var key;
    if (val.indexOf('antes posible') !== -1 || val.indexOf('as soon as possible') !== -1 || val.indexOf('asap') !== -1) {
      key = 'donar.form.opt.cuanto-antes';
    } else if (val.indexOf('inmediata') !== -1 || val.indexOf('immediate') !== -1) {
      key = 'donar.form.opt.inmediata';
    } else if (val.indexOf('esta semana') !== -1 || val.indexOf('this week') !== -1) {
      key = 'donar.form.opt.semana';
    } else if (val.indexOf('este mes') !== -1 || val.indexOf('this month') !== -1) {
      key = 'donar.form.opt.mes';
    }

    if (!key) {
      // Valor no reconocido (dato antiguo o manual): se muestra tal cual.
      return { text: disponibilidad, cls: 'dh-card-badge--warn' };
    }

    var esUrgente = key === 'donar.form.opt.inmediata' || key === 'donar.form.opt.cuanto-antes';
    return { text: t(key), cls: esUrgente ? 'dh-card-badge--good' : 'dh-card-badge--warn' };
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

  /* ── Construye el HTML de una tarjeta a partir de una fila de la
     tabla `donaciones`. actionLabel cambia según la columna
     (Donaciones → "Ver donación", Solicitudes → "Ayudar"). ── */
  function buildCardHTML(row, actionLabel) {
    var catLabel = categoriaLabel(row.categoria);
    var img = row.imagen_base64
      ? '<img src="' + row.imagen_base64 + '" alt="' + escapeHtml(catLabel) + '" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">'
      : emojiFor(row.categoria);

    var badge = disponibilidadBadge(row.disponibilidad);
    var badgeHTML = badge
      ? '<span class="dh-card-badge ' + badge.cls + '">' + escapeHtml(badge.text) + '</span>'
      : '';

    var titulo = row.descripcion
      ? (row.descripcion.length > 42 ? row.descripcion.slice(0, 42) + '…' : row.descripcion)
      : catLabel;

    var ubicacion = row.ubicacion ? '📍 ' + escapeHtml(row.ubicacion) : '📍 ' + t('donar.listings.ubicacionSinEspecificar');

    return (
      '<div class="dh-card dh-glass dn-reveal is-visible" data-donacion-id="' + row.id + '">' +
        '<div class="dh-card-img">' + badgeHTML + img + '</div>' +
        '<h4>' + escapeHtml(titulo) + '</h4>' +
        '<p class="dh-card-meta">' + ubicacion + '</p>' +
        '<p class="dh-card-cat">' + escapeHtml(catLabel) + ' · ' + timeAgo(row.created_at) + '</p>' +
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

    rows.forEach(function (row) { rowsCache[String(row.id)] = row; });

    track.innerHTML = rows.map(function (row) {
      return buildCardHTML(row, actionLabel);
    }).join('');
  }

  /* ── Fecha legible para el modal de detalle (distinta de timeAgo,
     que se usa en la tarjeta chica) ── */
  function formatFechaLarga(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString(currentLang() === 'en' ? 'en-US' : 'es-PA', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  /* ── Imagen grande (o emoji) para la cabecera del modal de detalle ── */
  function imageOrEmojiLarge(row) {
    if (row.imagen_base64) {
      return '<img src="' + row.imagen_base64 + '" alt="' + escapeHtml(categoriaLabel(row.categoria)) + '">';
    }
    return '<span class="donar-detail-emoji">' + emojiFor(row.categoria) + '</span>';
  }

  /* ── Llena y abre el modal de detalle con los datos de una fila.
     Se llama desde el click delegado en las tarjetas ("Ver donación
     →" o "Ayudar →"). ── */
  function openDetailModal(row) {
    var overlay = document.getElementById('donarDetailModal');
    if (!overlay || !row) return;

    var isDonar = row.tipo === 'donar';

    var kicker = document.getElementById('donarDetailKicker');
    if (kicker) kicker.textContent = isDonar ? t('donar.listings.kicker.donacion') : t('donar.listings.kicker.solicitud');

    var imgWrap = document.getElementById('donarDetailImg');
    if (imgWrap) {
      var badge = disponibilidadBadge(row.disponibilidad);
      var badgeHTML = badge ? '<span class="dh-card-badge ' + badge.cls + '">' + escapeHtml(badge.text) + '</span>' : '';
      imgWrap.innerHTML = badgeHTML + imageOrEmojiLarge(row);
    }

    var titleEl = document.getElementById('donarDetailTitle');
    if (titleEl) titleEl.textContent = categoriaLabel(row.categoria) || (isDonar ? t('donar.listings.kicker.donacion') : t('donar.listings.kicker.solicitud'));

    var metaEl = document.getElementById('donarDetailMeta');
    if (metaEl) {
      var metaRows = [];
      metaRows.push('<div><span class="donar-detail-meta-ic">📍</span>' + escapeHtml(row.ubicacion || t('donar.listings.ubicacionSinEspecificar')) + '</div>');
      if (row.punto_funcional) {
        var puntoLabel = isDonar ? t('donar.listings.puntoEntrega') : t('donar.listings.puntoRecepcion');
        metaRows.push('<div><span class="donar-detail-meta-ic">📌</span>' + puntoLabel + ': ' + escapeHtml(row.punto_funcional) + '</div>');
      }
      metaRows.push('<div><span class="donar-detail-meta-ic">🙋</span>' + t('donar.listings.publicadoPor') + ' ' + escapeHtml(row.autor_nombre || t('donar.listings.usuarioGenerico')) + '</div>');
      if (row.empresa_destino) {
        metaRows.push('<div><span class="donar-detail-meta-ic">🏢</span>' + t('donar.listings.empresa') + ': ' + escapeHtml(row.empresa_destino) + '</div>');
      }
      if (row.created_at) {
        metaRows.push('<div><span class="donar-detail-meta-ic">📅</span>' + formatFechaLarga(row.created_at) + '</div>');
      }
      metaEl.innerHTML = metaRows.join('');
    }

    var descEl = document.getElementById('donarDetailDesc');
    if (descEl) descEl.textContent = row.descripcion || t('donar.listings.sinDescripcion');

    overlay.classList.add('open');
    document.body.classList.add('dh-modal-lock');
  }

  function closeDetailModal() {
    var overlay = document.getElementById('donarDetailModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('dh-modal-lock');
  }

  // Expuesto globalmente para que otras capas aditivas (ej.
  // donar-mis-publicaciones.js, el menú de "tus publicaciones
  // activas" en la navbar) puedan abrir el mismo modal de detalle
  // sin duplicar su HTML/lógica.
  window.dhOpenDetailModal = openDetailModal;

  /* ── Conecta los clicks de "Ver donación →" / "Ayudar →" (delegado
     sobre los carruseles, así funciona igual con las tarjetas que
     donar-listings.js va reemplazando cada vez que recarga) y los
     cierres del modal (X, click fuera, Escape). ── */
  function setupDetailModal() {
    ['dhCarouselDonaciones', 'dhCarouselSolicitudes'].forEach(function (trackId) {
      var track = document.getElementById(trackId);
      if (!track) return;
      track.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.dh-card-btn') : null;
        if (!btn) return;
        var card = btn.closest('.dh-card[data-donacion-id]');
        if (!card) return;
        var row = rowsCache[card.getAttribute('data-donacion-id')];
        if (row) openDetailModal(row);
      });
    });

    var overlay = document.getElementById('donarDetailModal');
    var closeX = document.getElementById('donarDetailClose');
    var closeBtn = document.getElementById('donarDetailCloseBtn');

    if (closeX) closeX.addEventListener('click', closeDetailModal);
    if (closeBtn) closeBtn.addEventListener('click', closeDetailModal);
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeDetailModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeDetailModal();
    });
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
      .limit(2)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando donaciones:', res.error);
          return;
        }
        renderList('dhCarouselDonaciones', res.data, t('donar.card.verDonacion').replace(' →', ''), t('donar.listings.empty.donaciones'));
      });

    client
      .from('donaciones')
      .select('*')
      .eq('tipo', 'solicitar')
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .limit(2)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando solicitudes:', res.error);
          return;
        }
        renderList('dhCarouselSolicitudes', res.data, t('donar.card.ayudar').replace(' →', ''), t('donar.listings.empty.solicitudes'));
      });
  }

  window.dhRefreshListings = loadListings;

  ready(loadListings);
  ready(setupDetailModal);

  // Si el visitante cambia el idioma después de que las tarjetas ya
  // se pintaron, las volvemos a pedir/pintar para que el badge de
  // disponibilidad (y el resto de textos armados con t()) se
  // actualicen sin tener que recargar la página.
  document.addEventListener('reco:langchange', loadListings);
})();
