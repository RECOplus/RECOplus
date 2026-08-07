/**
 * comentar-modal.js — Botón "Comentar" accesible desde el footer de
 * CUALQUIER página del sitio. Abre un modal para publicar un
 * testimonio (texto + rating de 1 a 5 estrellas) en la tabla
 * `testimonios` de Supabase. Los testimonios publicados aquí se
 * muestran en la sección de Testimonios del index (ver
 * testimonios-marquee.js), que los carga desde la misma tabla.
 *
 * Capa ADITIVA: no modifica el HTML del footer de cada página; el
 * botón se inyecta dinámicamente dentro de <footer>, sin importar
 * su clase (funciona tanto en el footer class="footer" común a la
 * mayoría de páginas, como en el footer propio de contacto.html).
 *
 * REQUIERE, en cualquier página con footer:
 *   <link rel="stylesheet" href="comentar-modal.css">
 *   ...
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   ...
 *   <script src="comentar-modal.js"></script>
 * (usa window.recoAuth y window.recoSupabase ya inicializados)
 */
(function () {
  'use strict';

  var overlayEl = null;
  var modalBuilt = false;
  var estrellaSeleccionada = 0;
  var sesionActual = null;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function tr(key, fallback) {
    if (typeof window.t === 'function') {
      var val = window.t(key);
      // window.t suele devolver la propia key si no encuentra
      // traducción; en ese caso preferimos el fallback en español.
      if (val && val !== key) return val;
    }
    return fallback;
  }

  var ICON_CHAT = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5-3.1 6.5-7 6.5c-.9 0-1.8-.15-2.6-.44L4 17l1.1-3.2C3.8 12.7 3 11.2 3 9.5z"/></svg>';
  var ICON_STAR = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.6l2.47 5.13 5.66.62-4.2 3.87 1.1 5.6L10 13.9l-5.03 2.92 1.1-5.6L1.87 7.35l5.66-.62L10 1.6z"/></svg>';
  var ICON_LOCK = '<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M6.5 9V6.5a3.5 3.5 0 017 0V9"/></svg>';

  /* ══════════════════════════════════════════════
     INYECTAR BOTÓN EN EL FOOTER
     Se agrega como un link más dentro de la columna
     "Recursos" (.footer-col cuyo <h4> es footer.recursos),
     con el mismo estilo que los demás enlaces de esa
     columna. Si por algún motivo esa columna no existe en
     alguna página, cae a la última .footer-col disponible.
     ══════════════════════════════════════════════ */
  function findRecursosCol(footer) {
    // Patrón 1: la mayoría de páginas usa .footer-col con <h4>.
    var cols = footer.querySelectorAll('.footer-col');
    for (var i = 0; i < cols.length; i++) {
      var h4 = cols[i].querySelector('h4');
      if (!h4) continue;
      if (h4.getAttribute('data-i18n') === 'footer.recursos') return cols[i];
      if (h4.textContent && h4.textContent.trim().toLowerCase() === 'recursos') return cols[i];
    }
    if (cols.length) return cols[cols.length - 1];

    // Patrón 2 (p. ej. contacto.html): columnas son <div> genéricos
    // dentro de .footer-grid, encabezados con <h5> en vez de <h4>.
    var headings = footer.querySelectorAll('.footer-grid > div > h5, .footer-grid > div > h4');
    for (var j = 0; j < headings.length; j++) {
      var h = headings[j];
      if (h.getAttribute('data-i18n') === 'footer.recursos') return h.parentElement;
      if (h.textContent && h.textContent.trim().toLowerCase() === 'recursos') return h.parentElement;
    }

    return null;
  }

  function injectFooterButton() {
    var footer = document.querySelector('footer');
    if (!footer) return;
    if (footer.querySelector('.comentar-footer-btn')) return; // ya inyectado

    var col = findRecursosCol(footer);
    if (!col) return;

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'comentar-footer-btn';
    link.id = 'comentarFooterBtn';
    link.innerHTML = ICON_CHAT + '<span data-i18n="comentar.boton">Dejar un comentario</span>';

    link.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });

    col.appendChild(link);

    if (typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }
  }

  /* ══════════════════════════════════════════════
     CONSTRUCCIÓN DEL MODAL (una sola vez)
     ══════════════════════════════════════════════ */
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'comentar-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="comentar-modal" role="dialog" aria-modal="true" aria-labelledby="comentarTitulo">' +
        '<div class="comentar-modal__header">' +
          '<h2 class="comentar-modal__title" id="comentarTitulo" data-i18n="comentar.titulo">Comparte tu experiencia</h2>' +
          '<button type="button" class="comentar-modal__close" aria-label="Cerrar" data-i18n-title="ajustes.cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="comentar-modal__body" id="comentarBody"></div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayEl = overlay;

    overlay.querySelector('.comentar-modal__close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') closeModal();
    });

    modalBuilt = true;
  }

  /* ══════════════════════════════════════════════
     ESTADO: SIN SESIÓN — pedir iniciar sesión
     ══════════════════════════════════════════════ */
  function renderLoginPrompt(body) {
    body.innerHTML =
      '<div class="comentar-login-prompt">' +
        '<div class="comentar-login-prompt__icon">' + ICON_LOCK + '</div>' +
        '<p data-i18n="comentar.necesitaSesion">Inicia sesión para poder publicar un comentario y calificar tu experiencia con RECO+.</p>' +
        '<a href="login.html" data-i18n="nav.unete">Iniciar sesión</a>' +
      '</div>';
  }

  /* ══════════════════════════════════════════════
     ESTADO: CON SESIÓN — formulario
     ══════════════════════════════════════════════ */
  function getDisplayName(user) {
    if (!user) return '';
    var meta = user.user_metadata || {};
    return meta.nombre || meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'Usuario');
  }

  function getAvatarUrl(user) {
    if (!user) return null;
    var meta = user.user_metadata || {};
    return meta.avatar_url || meta.picture || null;
  }

  function getInitial(name) {
    if (!name) return '?';
    var trimmed = name.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  }

  function renderForm(body, user) {
    var name = getDisplayName(user);
    var avatarUrl = getAvatarUrl(user);
    var avatarMarkup = avatarUrl
      ? '<img class="comentar-autor__avatar" src="' + avatarUrl + '" alt="" referrerpolicy="no-referrer" onerror="this.outerHTML=\'<span class=&quot;comentar-autor__avatar&quot;>' + getInitial(name) + '</span>\'">'
      : '<span class="comentar-autor__avatar">' + getInitial(name) + '</span>';

    body.innerHTML =
      '<div class="comentar-form">' +
        '<div class="comentar-autor">' +
          avatarMarkup +
          '<span class="comentar-autor__name">' + name + '</span>' +
        '</div>' +
        '<div class="comentar-field">' +
          '<label data-i18n="comentar.ratingLabel">Tu calificación</label>' +
          '<div class="comentar-estrellas" id="comentarEstrellas"></div>' +
        '</div>' +
        '<div class="comentar-field">' +
          '<label for="comentarTexto" data-i18n="comentar.textoLabel">Tu comentario</label>' +
          '<textarea id="comentarTexto" class="comentar-textarea" maxlength="280" data-i18n="comentar.textoPlaceholder" placeholder="Cuéntanos cómo te ha ido usando RECO+..."></textarea>' +
          '<span class="comentar-textarea-count" id="comentarCount">0 / 280</span>' +
        '</div>' +
        '<button type="button" class="comentar-submit-btn" id="comentarSubmitBtn" data-i18n="comentar.publicar">Publicar comentario</button>' +
        '<div class="comentar-status" id="comentarStatus"></div>' +
      '</div>';

    wireForm(body, user);

    if (typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }
  }

  function wireForm(body, user) {
    estrellaSeleccionada = 0;
    var estrellasWrap = body.querySelector('#comentarEstrellas');
    var textoInput = body.querySelector('#comentarTexto');
    var countEl = body.querySelector('#comentarCount');
    var submitBtn = body.querySelector('#comentarSubmitBtn');
    var statusEl = body.querySelector('#comentarStatus');

    // Construir 5 estrellas
    for (var i = 1; i <= 5; i++) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'comentar-estrella';
      btn.setAttribute('data-valor', String(i));
      btn.setAttribute('aria-label', i + ' estrella' + (i > 1 ? 's' : ''));
      btn.innerHTML = ICON_STAR;
      estrellasWrap.appendChild(btn);
    }

    function pintarEstrellas(hastaValor) {
      var estrellas = estrellasWrap.querySelectorAll('.comentar-estrella');
      estrellas.forEach(function (el) {
        var v = parseInt(el.getAttribute('data-valor'), 10);
        el.classList.toggle('is-active', v <= hastaValor);
      });
    }

    estrellasWrap.querySelectorAll('.comentar-estrella').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        pintarEstrellas(parseInt(el.getAttribute('data-valor'), 10));
      });
      el.addEventListener('click', function () {
        estrellaSeleccionada = parseInt(el.getAttribute('data-valor'), 10);
        pintarEstrellas(estrellaSeleccionada);
      });
    });
    estrellasWrap.addEventListener('mouseleave', function () {
      pintarEstrellas(estrellaSeleccionada);
    });

    textoInput.addEventListener('input', function () {
      countEl.textContent = textoInput.value.length + ' / 280';
    });

    submitBtn.addEventListener('click', function () {
      var texto = textoInput.value.trim();

      if (estrellaSeleccionada < 1) {
        mostrarStatus(statusEl, 'error', tr('comentar.statusFaltaRating', 'Selecciona al menos una estrella.'));
        return;
      }
      if (!texto) {
        mostrarStatus(statusEl, 'error', tr('comentar.statusFaltaTexto', 'Escribe un comentario antes de publicar.'));
        return;
      }
      if (!window.recoSupabase) {
        mostrarStatus(statusEl, 'error', tr('comentar.statusServicioNoDisponible', 'Servicio no disponible en este momento.'));
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = tr('comentar.publicando', 'Publicando…');

      var autorNombre = getDisplayName(user);

      window.recoSupabase
        .from('testimonios')
        .insert({
          user_id: user.id,
          autor_nombre: autorNombre,
          texto: texto,
          rating: estrellaSeleccionada
        })
        .then(function (res) {
          submitBtn.disabled = false;
          submitBtn.textContent = tr('comentar.publicar', 'Publicar comentario');
          if (res.error) {
            mostrarStatus(statusEl, 'error', tr('comentar.statusError', 'No se pudo publicar tu comentario. Intenta de nuevo.'));
            return;
          }
          mostrarStatus(statusEl, 'ok', tr('comentar.statusOk', '¡Gracias por tu comentario!'));
          textoInput.value = '';
          countEl.textContent = '0 / 280';
          estrellaSeleccionada = 0;
          pintarEstrellas(0);
          if (typeof window.recoTestimoniosRecargar === 'function') {
            window.recoTestimoniosRecargar();
          }
          setTimeout(closeModal, 1400);
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = tr('comentar.publicar', 'Publicar comentario');
          mostrarStatus(statusEl, 'error', tr('comentar.statusErrorConexion', 'No se pudo conectar. Revisa tu internet.'));
        });
    });
  }

  function mostrarStatus(el, tipo, mensaje) {
    if (!el) return;
    el.textContent = mensaje;
    el.setAttribute('data-tipo', tipo);
    el.setAttribute('data-visible', 'true');
  }

  /* ══════════════════════════════════════════════
     ABRIR / CERRAR
     ══════════════════════════════════════════════ */
  function openModal() {
    if (!modalBuilt) buildModal();
    var body = overlayEl.querySelector('#comentarBody');

    overlayEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';

    if (!window.recoAuth) {
      renderLoginPrompt(body);
      return;
    }

    var getSesion = window.recoAuth.getVerifiedSession || window.recoAuth.getSession;
    getSesion().then(function (session) {
      sesionActual = session;
      if (session && session.user) {
        renderForm(body, session.user);
      } else {
        renderLoginPrompt(body);
      }
    }).catch(function () {
      renderLoginPrompt(body);
    });
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  window.recoComentar = { open: openModal, close: closeModal };

  document.addEventListener('reco:langchange', function () {
    if (overlayEl && typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }
  });

  ready(injectFooterButton);
})();
