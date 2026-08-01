/**
 * donar-mis-publicaciones.js — RECO+
 * ---------------------------------------------------------------
 * Capa ADITIVA, SOLO para donar.html: mini menú en la navbar (botón
 * con el símbolo de reciclaje ♻️) donde el usuario ve sus propias
 * publicaciones ACTIVAS — tanto donaciones como solicitudes de
 * ayuda (tabla `donaciones`, estado = 'activa', filtradas por su
 * user_id).
 *
 * Reutiliza:
 * - window.recoAuth.getSession() (auth.js) para saber quién es.
 * - window.dhOpenDetailModal (donar-listings.js) para abrir el
 *   mismo modal de detalle al tocar una publicación de la lista.
 * - window.dhOpenFormModal (DonarHome.js) para el botón "Publicar"
 *   del estado vacío.
 *
 * Cargar DESPUÉS de auth.js, supabase-config.js y donar-listings.js:
 *   <script src="donar-mis-publicaciones.js"></script>
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
    return str.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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

  function itemHTML(row) {
    var titulo = row.descripcion
      ? (row.descripcion.length > 34 ? row.descripcion.slice(0, 34) + '…' : row.descripcion)
      : row.categoria;
    var img = row.imagen_base64
      ? '<img src="' + row.imagen_base64 + '" alt="">'
      : emojiFor(row.categoria);
    var ubicacion = row.ubicacion ? '📍 ' + escapeHtml(row.ubicacion) : 'Ubicación no especificada';

    return (
      '<button type="button" class="mis-pubs-item" data-id="' + row.id + '">' +
        '<span class="mis-pubs-item-emoji">' + img + '</span>' +
        '<span class="mis-pubs-item-text">' +
          '<strong>' + escapeHtml(titulo) + '</strong>' +
          '<small>' + ubicacion + '</small>' +
        '</span>' +
      '</button>'
    );
  }

  function emptyStateHTML() {
    return (
      '<div class="mis-pubs-empty">' +
        'Aún no tienes publicaciones activas.<br>' +
        '<button type="button" class="mis-pubs-empty-btn" id="misPubsEmptyBtn">Publicar algo</button>' +
      '</div>'
    );
  }

  function loginRequiredHTML() {
    return '<div class="mis-pubs-empty">Inicia sesión para ver tus publicaciones activas.</div>';
  }

  function loadingHTML() {
    return '<div class="mis-pubs-empty">Cargando...</div>';
  }

  function errorHTML() {
    return '<div class="mis-pubs-empty">No se pudieron cargar tus publicaciones. Intenta de nuevo.</div>';
  }

  ready(function () {
    var btn = document.getElementById('misPubsBtn');
    var wrap = document.getElementById('misPubsWrap');
    var dropdown = document.getElementById('misPubsDropdown');
    var body = document.getElementById('misPubsBody');
    if (!btn || !wrap || !dropdown || !body) return;

    var isOpen = false;

    function closeDropdown() {
      isOpen = false;
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }

    function renderRows(rows) {
      if (!rows || !rows.length) {
        body.innerHTML = emptyStateHTML();
        var emptyBtn = document.getElementById('misPubsEmptyBtn');
        if (emptyBtn) {
          emptyBtn.addEventListener('click', function () {
            closeDropdown();
            if (window.dhOpenFormModal) window.dhOpenFormModal('donar');
          });
        }
        btn.classList.remove('has-items');
        return;
      }

      btn.classList.add('has-items');

      var donaciones = rows.filter(function (r) { return r.tipo === 'donar'; });
      var solicitudes = rows.filter(function (r) { return r.tipo === 'solicitar'; });

      var html = '';
      if (donaciones.length) {
        html += '<div class="mis-pubs-group-label">🌿 Tus donaciones</div>';
        html += donaciones.map(itemHTML).join('');
      }
      if (solicitudes.length) {
        html += '<div class="mis-pubs-group-label">🙋 Tus solicitudes de ayuda</div>';
        html += solicitudes.map(itemHTML).join('');
      }
      body.innerHTML = html;

      // Índice rápido id -> fila, para abrir el modal de detalle
      var byId = {};
      rows.forEach(function (r) { byId[String(r.id)] = r; });

      body.querySelectorAll('.mis-pubs-item').forEach(function (el) {
        el.addEventListener('click', function () {
          var row = byId[el.getAttribute('data-id')];
          closeDropdown();
          if (row && window.dhOpenDetailModal) window.dhOpenDetailModal(row);
        });
      });
    }

    function loadMisPublicaciones() {
      if (!window.recoSupabase || !window.recoAuth) {
        body.innerHTML = errorHTML();
        return;
      }

      body.innerHTML = loadingHTML();

      window.recoAuth.getSession().then(function (session) {
        if (!session || !session.user) {
          body.innerHTML = loginRequiredHTML();
          btn.classList.remove('has-items');
          return;
        }

        window.recoSupabase
          .from('donaciones')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('estado', 'activa')
          .order('created_at', { ascending: false })
          .then(function (res) {
            if (res.error) {
              console.error('[RECO+] Error cargando tus publicaciones:', res.error);
              body.innerHTML = errorHTML();
              return;
            }
            renderRows(res.data);
          });
      });
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      isOpen = !isOpen;
      dropdown.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) loadMisPublicaciones();
    });

    document.addEventListener('click', function (e) {
      if (isOpen && !wrap.contains(e.target)) closeDropdown();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeDropdown();
    });

    // Si el usuario publica algo nuevo mientras el menú está abierto
    // en otra pestaña de este mismo flujo, no hace falta refrescar en
    // vivo: cada vez que se abre se vuelve a pedir a Supabase.
  });
})();
