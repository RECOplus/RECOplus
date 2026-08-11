/**
 * donar-campanas.js — RECO+
 * ---------------------------------------------------------------
 * Capa ADITIVA: carga y pinta la sección "Campañas de nuestros
 * aliados" (#campanas-empresas) en donar.html con datos reales de
 * la tabla `campanas` de Supabase — las que publican las empresas
 * aprobadas desde el wizard de campanas-modal.js en alianzas.html.
 *
 * Solo se muestran campañas con estado = 'aprobado' y activa = true
 * (la misma condición que ya exige la policy de SELECT pública en
 * supabase-campanas.sql, así que aunque hubiera un error en el
 * filtro del lado del cliente, RLS no dejaría pasar de más).
 *
 * Separa las campañas en dos carruseles según su tipo:
 *   - #campCarouselReciclaje → tipo = 'reciclaje'
 *   - #campCarouselDonacion  → tipo = 'donacion'
 *
 * No modifica DonarHome.js, donar-listings.js ni donar.js: solo
 * pinta contenido dentro de sus propios contenedores nuevos.
 *
 * REQUIERE en donar.html, después de supabase-config.js:
 *   <link rel="stylesheet" href="donar-campanas.css">
 *   ...
 *   <script src="donar-campanas.js"></script>
 * (usa window.recoSupabase ya inicializado por supabase-config.js)
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  // Formatea "2026-09-01" como "1 sep" (sin depender de Date() con
  // huso horario, que puede correr el día en algunos navegadores al
  // parsear fechas "YYYY-MM-DD" como UTC).
  function formatFechaCorta(fechaStr) {
    if (!fechaStr) return '';
    var partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    var dia = parseInt(partes[2], 10);
    var mes = MESES_CORTOS[parseInt(partes[1], 10) - 1] || '';
    return dia + ' ' + mes;
  }

  function rangoVigencia(row) {
    var ini = formatFechaCorta(row.fecha_inicio);
    var fin = formatFechaCorta(row.fecha_fin);
    if (ini && fin) return ini + ' – ' + fin;
    return ini || fin || '';
  }

  function nombreEmpresa(row) {
    // El join `aliados(nombre_empresa)` de Supabase-js devuelve un
    // objeto (o array, según la relación) en row.aliados.
    if (!row.aliados) return '';
    if (Array.isArray(row.aliados)) return (row.aliados[0] && row.aliados[0].nombre_empresa) || '';
    return row.aliados.nombre_empresa || '';
  }

  function buildCardHTML(row) {
    var esReciclaje = row.tipo === 'reciclaje';
    var emojiTipo = esReciclaje ? '♻️' : '🎁';
    var badgeTexto = esReciclaje ? 'Reciclaje' : 'Donación';
    var badgeClase = esReciclaje ? 'camp-card__badge--reciclaje' : 'camp-card__badge--donacion';

    var bannerStyle = row.banner_url ? ' style="background-image:url(\'' + escapeHtml(row.banner_url) + '\')"' : '';
    var bannerClase = row.banner_url ? 'camp-card__banner' : 'camp-card__banner camp-card__banner--sin-foto';
    var bannerContenido = row.banner_url ? '' : emojiTipo;

    var empresa = nombreEmpresa(row);
    var empresaHTML = empresa ? '<p class="camp-card__empresa">🏢 ' + escapeHtml(empresa) + '</p>' : '';

    var ubicacion = [row.distrito, row.provincia].filter(Boolean).join(', ');
    var vigencia = rangoVigencia(row);

    var metaHTML = '';
    if (ubicacion || vigencia) {
      var partes = [];
      if (ubicacion) partes.push('<span class="camp-card__meta-item">📍 ' + escapeHtml(ubicacion) + '</span>');
      if (vigencia) partes.push('<span class="camp-card__meta-item">📅 ' + escapeHtml(vigencia) + '</span>');
      metaHTML = '<p class="camp-card__meta">' + partes.join('<span class="camp-card__meta-sep">·</span>') + '</p>';
    }

    var metaGoalHTML = '';
    if (row.meta_cantidad) {
      var unidad = row.meta_unidad ? escapeHtml(row.meta_unidad) : '';
      metaGoalHTML = '<p class="camp-card__meta-goal">🎯 Meta: ' + row.meta_cantidad + (unidad ? ' ' + unidad : '') + '</p>';
    }

    return (
      '<div class="camp-card dh-glass dn-reveal is-visible">' +
        '<div class="' + bannerClase + '"' + bannerStyle + '>' +
          '<span class="camp-card__badge ' + badgeClase + '">' + emojiTipo + ' ' + badgeTexto + '</span>' +
          (row.banner_url ? '' : bannerContenido) +
        '</div>' +
        '<div class="camp-card__body">' +
          empresaHTML +
          '<h4 class="camp-card__title">' + escapeHtml(row.titulo) + '</h4>' +
          '<p class="camp-card__desc">' + escapeHtml(row.descripcion) + '</p>' +
          metaHTML +
          metaGoalHTML +
        '</div>' +
      '</div>'
    );
  }

  function emptyStateHTML(mensaje) {
    return '<div class="camp-card--empty dh-glass"><p>' + escapeHtml(mensaje) + '</p></div>';
  }

  function renderCarousel(trackId, rows, emptyMsg) {
    var track = document.getElementById(trackId);
    if (!track) return;

    if (!rows || rows.length === 0) {
      track.innerHTML = emptyStateHTML(emptyMsg);
      return;
    }

    track.innerHTML = rows.map(buildCardHTML).join('');
  }

  function getClient() {
    if (!window.recoSupabase) {
      console.error('[RECO+] recoSupabase no está inicializado. Revisa que supabase-config.js se cargó antes que donar-campanas.js.');
      return null;
    }
    return window.recoSupabase;
  }

  function cargarCampanas() {
    var client = getClient();
    if (!client) return;

    // Nota: aunque ya se filtra por estado/activa acá, la policy de
    // SELECT pública en `campanas` exige exactamente lo mismo, así
    // que esto es solo para no traer filas de más — no es la única
    // barrera de seguridad.
    client
      .from('campanas')
      .select('*, aliados(nombre_empresa, logo_url)')
      .eq('tipo', 'reciclaje')
      .eq('estado', 'aprobado')
      .eq('activa', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando campañas de reciclaje:', res.error);
          renderCarousel('campCarouselReciclaje', [], 'No se pudieron cargar las campañas por ahora.');
          return;
        }
        renderCarousel('campCarouselReciclaje', res.data, 'Todavía no hay campañas de reciclaje activas. ¡Sé la primera empresa en publicar una desde Alianzas!');
      });

    client
      .from('campanas')
      .select('*, aliados(nombre_empresa, logo_url)')
      .eq('tipo', 'donacion')
      .eq('estado', 'aprobado')
      .eq('activa', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando campañas de donación:', res.error);
          renderCarousel('campCarouselDonacion', [], 'No se pudieron cargar las campañas por ahora.');
          return;
        }
        renderCarousel('campCarouselDonacion', res.data, 'Todavía no hay campañas de donación activas. ¡Sé la primera empresa en publicar una desde Alianzas!');
      });
  }

  // Expuesto por si otra capa (ej. tras aprobar una campaña desde un
  // futuro panel admin) quiere refrescar sin recargar la página.
  window.dhRefreshCampanas = cargarCampanas;

  /* ── Flechas de los 2 carruseles nuevos (mismo patrón que el
     carrusel de aliados en alianzas.html: scrollBy sobre el track
     indicado por data-target). ── */
  function wireCarouselArrows() {
    var botones = document.querySelectorAll('.camp-car-prev, .camp-car-next');
    botones.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var track = document.getElementById(targetId);
        if (!track) return;
        var delta = btn.classList.contains('camp-car-prev') ? -260 : 260;
        track.scrollBy({ left: delta, behavior: 'smooth' });
      });
    });
  }

  ready(cargarCampanas);
  ready(wireCarouselArrows);
})();
