/**
 * alianzas-destacados.js — RECO+
 * ---------------------------------------------------------------
 * Reemplaza el carrusel hardcodeado de "Aliados destacados" en
 * alianzas.html por empresas REALES con plan Premium (ver
 * suscripcion-planes.js / supabase-suscripciones.sql), cargadas
 * desde Supabase. Cada tarjeta es clicable y abre un modal con la
 * información de la empresa.
 *
 * CÓMO DECIDE QUIÉN ES "DESTACADO":
 *   1) Lee `suscripciones` (lectura pública — ver policy "Cualquiera
 *      puede leer el plan" en supabase-suscripciones.sql) filtrando
 *      plan = 'premium', y descarta las filas cuyo vigente_hasta ya
 *      venció (mismo criterio que la función plan_efectivo() del
 *      servidor, replicado aquí porque una policy pública no puede
 *      llamar a una función RPC por cada visitante del sitio).
 *   2) Con esos user_id, lee `aliados` filtrando estado = 'aprobado'
 *      (policy pública que ya existía en supabase-setup.sql).
 * Si todavía no hay ningún aliado Premium, se muestra un estado
 * vacío invitando a ser el primero — en vez de dejar el carrusel
 * roto o mostrar empresas de ejemplo falsas.
 *
 * Capa 100% aditiva: no modifica alianzas.js/alianzas.css ni el
 * markup del resto de la página. Reutiliza el contenedor
 * #aliasCarousel que ya existe en alianzas.html (solo reemplaza su
 * contenido) y la clase .aliado-card ya definida en alianzas.css.
 *
 * REQUIERE en alianzas.html, después de supabase-config.js:
 *   <link rel="stylesheet" href="alianzas-registro-modal.css">
 *   <link rel="stylesheet" href="alianzas-destacados.css">
 *   ...
 *   <script src="supabase-config.js"></script>
 *   ...
 *   <script src="alianzas-destacados.js"></script>
 * (usa window.recoSupabase ya inicializado; también usa
 * window.recoPlanes si está disponible, solo para el ícono 🌳 del
 * estado vacío — no es un requisito estricto)
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

  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Traducido vía t() (i18n.js) en vez de strings fijos, para que
  // el estado vacío y las etiquetas de tipo de empresa respeten el
  // idioma activo (ver claves alianzas.tipo.* y alianzas.aliados.*
  // en i18n.js). Fallback a español si t() no está disponible
  // todavía (i18n.js no cargó) o la clave no existe.
  function tr(key, fallback) {
    if (typeof t === 'function') return t(key);
    return fallback;
  }

  var TIPO_EMPRESA_LABEL = {
    centro_reciclaje: 'alianzas.tipo.centro_reciclaje',
    empresa_recicladora: 'alianzas.tipo.empresa_recicladora',
    punto_acopio: 'alianzas.tipo.punto_acopio',
    transportista: 'alianzas.tipo.transportista',
    otro: 'alianzas.tipo.otro'
  };

  function tipoEmpresaLabel(tipo) {
    var key = TIPO_EMPRESA_LABEL[tipo] || TIPO_EMPRESA_LABEL.otro;
    return tr(key, 'Aliado RECO+');
  }

  var LOGO_RESPALDO = 'img/empresa1.png';

  /* ══════════════════════════════════════════════
     CARGA: aliados con plan premium vigente
     ══════════════════════════════════════════════ */
  function cargarAliadosDestacados() {
    var client = window.recoSupabase;
    if (!client) return Promise.resolve([]);

    return client.from('suscripciones').select('user_id, plan, vigente_hasta').eq('plan', 'premium')
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return [];

        var ahora = new Date();
        var userIds = res.data
          .filter(function (fila) { return !fila.vigente_hasta || new Date(fila.vigente_hasta) >= ahora; })
          .map(function (fila) { return fila.user_id; });

        if (!userIds.length) return [];

        return client.from('aliados')
          .select('id, user_id, nombre_empresa, nombre_comercial, logo_url, tipo_empresa, descripcion, provincia, distrito, sitio_web, whatsapp, telefono')
          .eq('estado', 'aprobado')
          .in('user_id', userIds)
          .then(function (res2) {
            return (res2.error || !res2.data) ? [] : res2.data;
          });
      })
      .catch(function () { return []; });
  }

  /* ══════════════════════════════════════════════
     RENDER: tarjetas del carrusel (reutiliza .aliado-card de
     alianzas.css, agregando el modificador clicable)
     ══════════════════════════════════════════════ */
  function renderTarjeta(aliado) {
    var nombre = aliado.nombre_comercial || aliado.nombre_empresa;
    var tagline = tipoEmpresaLabel(aliado.tipo_empresa);
    return (
      '<button type="button" class="aliado-card aliado-card--clicable" data-aliado-id="' + esc(aliado.id) + '">' +
        '<span class="aliado-card__icon">' +
          '<img src="' + esc(aliado.logo_url || LOGO_RESPALDO) + '" alt="' + esc(nombre) + '">' +
        '</span>' +
        '<div>' +
          '<div class="aliado-card__name">' + esc(nombre) + '</div>' +
          '<div class="aliado-card__tagline">' + esc(tagline) + '</div>' +
        '</div>' +
      '</button>'
    );
  }

  function renderVacio() {
    return (
      '<div class="alid-vacio">' +
        '<span class="alid-vacio__icon">🌳</span>' +
        '<p class="alid-vacio__titulo" data-i18n="alianzas.aliados.vacio.titulo">' + esc(tr('alianzas.aliados.vacio.titulo', 'Todavía no hay aliados con plan Premium')) + '</p>' +
        '<p class="alid-vacio__desc" data-i18n="alianzas.aliados.vacio.desc">' + esc(tr('alianzas.aliados.vacio.desc', 'Las empresas con plan Premium aparecen aquí, destacadas ante toda la comunidad de RECO+.')) + '</p>' +
        '<button type="button" class="alid-vacio__btn" data-abrir-suscripcion data-i18n="alianzas.aliados.vacio.btn">' + esc(tr('alianzas.aliados.vacio.btn', 'Conocer el plan Premium →')) + '</button>' +
      '</div>'
    );
  }

  var aliadosCache = {}; // id -> fila completa, para abrir el detalle sin volver a consultar

  function pintarCarousel(aliados) {
    var carousel = document.getElementById('aliasCarousel');
    var wrapper = carousel ? carousel.closest('.alianzas-carousel-wrapper') : null;
    if (!carousel) return;

    // FIX: cada llamada anterior a pintarCarousel() en estado vacío
    // insertaba una tarjeta ".alid-vacio" nueva con insertAdjacentHTML
    // sin quitar la anterior. Si esta funcion se invocaba mas de una
    // vez (p.ej. el listener de "reco:langchange" en ARRANQUE llama a
    // pintarCarousel(ultimosAliados) de nuevo), las tarjetas vacias se
    // iban acumulando una tras otra en vez de reemplazarse. Ahora se
    // limpia cualquier estado vacio previo al principio, sin importar
    // cuantas veces se llame esta funcion ni por que motivo.
    if (wrapper) {
      wrapper.parentNode.querySelectorAll('.alid-vacio').forEach(function (el) {
        el.remove();
      });
    }

    if (!aliados.length) {
      carousel.innerHTML = '';
      if (wrapper) wrapper.classList.add('alianzas-carousel-wrapper--vacio');
      var prevBtn = document.getElementById('prevBtn');
      var nextBtn = document.getElementById('nextBtn');
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      carousel.insertAdjacentHTML('afterend', renderVacio());
      return;
    }

    if (wrapper) wrapper.classList.remove('alianzas-carousel-wrapper--vacio');
    var prevBtnR = document.getElementById('prevBtn');
    var nextBtnR = document.getElementById('nextBtn');
    if (prevBtnR) prevBtnR.style.display = '';
    if (nextBtnR) nextBtnR.style.display = '';

    aliados.forEach(function (a) { aliadosCache[String(a.id)] = a; });
    carousel.innerHTML = aliados.map(renderTarjeta).join('');

    carousel.addEventListener('click', function (e) {
      var card = e.target.closest('[data-aliado-id]');
      if (!card) return;
      var aliado = aliadosCache[card.getAttribute('data-aliado-id')];
      if (aliado) abrirDetalle(aliado);
    });
  }

  /* ══════════════════════════════════════════════
     MODAL DE DETALLE (reutiliza las clases .rae-* de
     alianzas-registro-modal.css, ya cargado en alianzas.html)
     ══════════════════════════════════════════════ */
  var overlayDetalle = null;

  function buildModalDetalle() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');
    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="alidDetalleTitulo" style="max-width:480px">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker" data-i18n="alianzas.aliados.destacado">' + esc(tr('alianzas.aliados.destacado', 'Aliado destacado 🌳')) + '</p>' +
            '<h2 class="rae-modal__title" id="alidDetalleTitulo"></h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="alidDetalleClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__body" id="alidDetalleBody"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlayDetalle = overlay;

    function cerrar() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }
    overlay.querySelector('#alidDetalleClose').addEventListener('click', cerrar);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') cerrar();
    });
  }

  function renderDetalleBody(aliado) {
    var tipoLabel = tipoEmpresaLabel(aliado.tipo_empresa);
    var ubicacion = [aliado.distrito, aliado.provincia].filter(Boolean).join(', ');

    var contactoItems = [];
    if (aliado.sitio_web) contactoItems.push('<a href="' + esc(aliado.sitio_web) + '" target="_blank" rel="noopener">🌐 ' + esc(aliado.sitio_web) + '</a>');
    if (aliado.whatsapp) contactoItems.push('<span>💬 ' + esc(aliado.whatsapp) + '</span>');
    if (aliado.telefono) contactoItems.push('<span>📞 ' + esc(aliado.telefono) + '</span>');

    return (
      '<div class="alid-detalle">' +
        '<div class="alid-detalle__logo"><img src="' + esc(aliado.logo_url || LOGO_RESPALDO) + '" alt="Logo"></div>' +
        '<span class="rae-hint">' + esc(tipoLabel) + (ubicacion ? ' · ' + esc(ubicacion) : '') + '</span>' +
        (aliado.descripcion ? '<p class="rae-step__desc" style="margin-top:10px">' + esc(aliado.descripcion) + '</p>' : '') +
        (contactoItems.length ? '<div class="alid-detalle__contacto">' + contactoItems.join('') + '</div>' : '') +
      '</div>'
    );
  }

  function abrirDetalle(aliado) {
    if (!overlayDetalle) buildModalDetalle();
    overlayDetalle.querySelector('#alidDetalleTitulo').textContent = aliado.nombre_comercial || aliado.nombre_empresa;
    overlayDetalle.querySelector('#alidDetalleBody').innerHTML = renderDetalleBody(aliado);
    overlayDetalle.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
  }

  /* ══════════════════════════════════════════════
     ARRANQUE
     ══════════════════════════════════════════════ */
  var ultimosAliados = null; // cache del último resultado renderizado, para re-pintar en cambio de idioma sin volver a consultar Supabase

  ready(function () {
    cargarAliadosDestacados().then(function (aliados) {
      ultimosAliados = aliados;
      pintarCarousel(aliados);
    });

    // El estado vacío y el modal de detalle se generan con textContent
    // fijo en tiempo de creación (no data-i18n aplicado por applyLang()
    // sobre HTML dinámico ya insertado en modales tipo overlay), así que
    // se re-renderizan explícitamente al cambiar de idioma.
    document.addEventListener('reco:langchange', function () {
      if (ultimosAliados && !ultimosAliados.length) {
        pintarCarousel(ultimosAliados);
      }
      if (overlayDetalle && overlayDetalle.getAttribute('data-open') === 'true') {
        var kicker = overlayDetalle.querySelector('.rae-modal__kicker');
        if (kicker) kicker.textContent = tr('alianzas.aliados.destacado', 'Aliado destacado 🌳');
      }
    });
  });
})();
