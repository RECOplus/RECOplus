/**
 * testimonios-supabase.js — Capa ADITIVA para el index: carga los
 * testimonios reales publicados vía comentar-modal.js (tabla
 * `testimonios` de Supabase, con aprobado = true) y los agrega como
 * tarjetas .test-card extra en las dos filas del marquee, DESPUÉS
 * de las 3 tarjetas fijas que ya existen en el HTML.
 *
 * No reemplaza testimonios-marquee.js: corre antes que él y prepara
 * el DOM (agrega las tarjetas a #testTrack1 / #testTrack2), así que
 * cuando testimonios-marquee.js mide y clona las filas, ya incluye
 * los testimonios reales.
 *
 * REQUIERE, en index.html, en este orden:
 *   <script src="supabase-config.js"></script>
 *   ...
 *   <script src="testimonios-supabase.js"></script>
 *   <script src="testimonios-marquee.js"></script>
 */
(function () {
  'use strict';

  var AVATAR_FALLBACK_CLASS = 'test-card__avatar--initials';

  function getInitial(name) {
    if (!name) return '?';
    var trimmed = name.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function estrellasHTML(rating) {
    var r = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  }

  function normalizarParaHandle(str) {
    return String(str || '')
      .trim()
      .toLowerCase()
      .replace(/ñ/g, 'n')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes/diacríticos (á->a, é->e, etc.)
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  function buildCard(row) {
    var nombre = row.autor_nombre || 'Usuario RECO+';
    var handle = '@' + normalizarParaHandle(nombre);

    return (
      '<div class="test-card">' +
        '<div class="test-card__header">' +
          '<div class="test-card__avatar ' + AVATAR_FALLBACK_CLASS + '">' + getInitial(nombre) + '</div>' +
          '<div class="test-card__info">' +
            '<span class="test-card__handle">' + escapeHTML(handle || '@usuario') + '</span>' +
          '</div>' +
        '</div>' +
        '<p class="test-card__text">&quot;' + escapeHTML(row.texto) + '&quot;</p>' +
        '<div class="estrellas">' + estrellasHTML(row.rating) + '</div>' +
      '</div>'
    );
  }

  function cargarTestimonios() {
    if (!window.recoSupabase) return;

    var track1 = document.getElementById('testTrack1');
    var track2 = document.getElementById('testTrack2');
    if (!track1 || !track2) return;

    window.recoSupabase
      .from('testimonios')
      .select('autor_nombre, texto, rating, created_at')
      .eq('aprobado', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return;

        // testimonios-marquee.js clona cada #testTrackN dentro de su
        // fila (#testRowN) para el loop infinito, una vez que ya
        // corrió. Si esta función se llama de nuevo (recarga tras
        // publicar un comentario nuevo), hay que actualizar tanto el
        // track original como su clon, o el loop infinito seguiría
        // mostrando la versión vieja la mitad del tiempo.
        var targets1 = [track1].concat(
          Array.prototype.filter.call(
            document.querySelectorAll('#testRow1 > div:not(#testTrack1)'),
            function () { return true; }
          )
        );
        var targets2 = [track2].concat(
          Array.prototype.filter.call(
            document.querySelectorAll('#testRow2 > div:not(#testTrack2)'),
            function () { return true; }
          )
        );

        targets1.concat(targets2).forEach(function (el) {
          el.querySelectorAll('[data-reco-real]').forEach(function (c) { c.remove(); });
        });

        var rows = res.data;
        rows.forEach(function (row, i) {
          var html = buildCard(row);
          var group = i % 2 === 0 ? targets1 : targets2;
          group.forEach(function (target) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            var card = wrapper.firstElementChild;
            card.setAttribute('data-reco-real', 'true');
            target.appendChild(card);
          });
        });
      })
      .catch(function () { /* silencioso: si falla, quedan solo las 3 fijas */ });
  }

  window.recoTestimoniosRecargar = cargarTestimonios;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarTestimonios);
  } else {
    cargarTestimonios();
  }
})();
