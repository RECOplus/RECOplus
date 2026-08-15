/**
 * subir-video-modal.js — Botón "Subir video" (guia.html y videos.html)
 * Abre un modal para compartir un video con la comunidad de RECO+,
 * por link externo (YouTube, Vimeo, URL directa) o subiendo un
 * archivo, hacia la tabla `videos_usuario` de Supabase. El video
 * queda "pendiente" hasta que se aprueba a mano (mismo patrón que
 * `aliados` / `campanas`); una vez aprobado, videos-supabase.js lo
 * mezcla automáticamente en la biblioteca de videos.html.
 *
 * Capa 100% aditiva: no crea el botón (ya existe en el HTML de
 * guia.html y videos.html con el atributo [data-subir-video-btn]);
 * solo le agrega el comportamiento de abrir este modal.
 *
 * REQUIERE, en cualquier página con un botón [data-subir-video-btn]:
 *   <link rel="stylesheet" href="subir-video-modal.css">
 *   ...
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   ...
 *   <script src="subir-video-modal.js"></script>
 * (usa window.recoAuth y window.recoSupabase ya inicializados)
 */
(function () {
  'use strict';

  var BUCKET = 'videos-usuario';
  var TABLE = 'videos_usuario';
  var MAX_BYTES = 100 * 1024 * 1024; // 100MB
  var ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
  var ALLOWED_EXT = ['.mp4', '.webm', '.mov', '.ogg', '.ogv'];

  var CATEGORIAS = [
    { key: 'reciclaje', labelKey: 'videos.cat.reciclaje', fallback: 'Reciclaje' },
    { key: 'donacion', labelKey: 'videos.cat.donacion', fallback: 'Donación' },
    { key: 'sostenibilidad', labelKey: 'videos.cat.sostenibilidad', fallback: 'Sostenibilidad' },
    { key: 'comunidad', labelKey: 'videos.cat.comunidad', fallback: 'Comunidad' }
  ];

  var overlayEl = null;
  var modalBuilt = false;
  var activeTab = 'link';
  var archivoSeleccionado = null;
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
      if (val && val !== key) return val;
    }
    return fallback;
  }

  var ICON_UPLOAD_SMALL = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13V4M6.5 7.5L10 4l3.5 3.5"/><path d="M4 13v1.5A1.5 1.5 0 005.5 16h9a1.5 1.5 0 001.5-1.5V13"/></svg>';
  var ICON_LOCK = '<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="9" width="11" height="8" rx="1.5"/><path d="M6.5 9V6.5a3.5 3.5 0 017 0V9"/></svg>';
  var ICON_LINK = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 11.5l3-3M7 13l-1.5 1.5a2.5 2.5 0 01-3.5-3.5L3.5 9.5M13 7l1.5-1.5a2.5 2.5 0 013.5 3.5L16.5 10.5"/></svg>';
  var ICON_FILM = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="14" height="12" rx="1.5"/><path d="M7 4v12M13 4v12M3 8h4M13 8h4M3 12h4M13 12h4"/></svg>';
  var ICON_CLOSE_X = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>';
  var ICON_TRASH = '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6.5 0l.6 9.4a1.5 1.5 0 001.5 1.4h4.8a1.5 1.5 0 001.5-1.4L14.5 6"/></svg>';

  /* ══════════════════════════════════════════════
     WIRE: cualquier botón [data-subir-video-btn]
     ══════════════════════════════════════════════ */
  function wireTriggerButtons() {
    document.querySelectorAll('[data-subir-video-btn]').forEach(function (btn) {
      if (btn._recoSvWired) return;
      btn._recoSvWired = true;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });
  }

  /* ══════════════════════════════════════════════
     CONSTRUCCIÓN DEL MODAL (una sola vez)
     ══════════════════════════════════════════════ */
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'sv-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="sv-modal" role="dialog" aria-modal="true" aria-labelledby="svTitulo">' +
        '<div class="sv-modal__header">' +
          '<h2 class="sv-modal__title" id="svTitulo" data-i18n="subirvideo.titulo">Comparte un video</h2>' +
          '<button type="button" class="sv-modal__close" aria-label="Cerrar" data-i18n-title="ajustes.cerrar">' + ICON_CLOSE_X + '</button>' +
        '</div>' +
        '<div class="sv-modal__body" id="svBody"></div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayEl = overlay;

    overlay.querySelector('.sv-modal__close').addEventListener('click', closeModal);
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
      '<div class="sv-login-prompt">' +
        '<div class="sv-login-prompt__icon">' + ICON_LOCK + '</div>' +
        '<p data-i18n="subirvideo.necesitaSesion">Inicia sesión para poder compartir un video con la comunidad de RECO+.</p>' +
        '<a href="login.html" data-i18n="login.submit">Iniciar sesión</a>' +
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

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function buildCategoriaOptions() {
    return CATEGORIAS.map(function (cat) {
      return '<option value="' + cat.key + '" data-i18n="' + cat.labelKey + '">' + tr(cat.labelKey, cat.fallback) + '</option>';
    }).join('');
  }

  function renderForm(body, user) {
    var name = getDisplayName(user);
    var avatarUrl = getAvatarUrl(user);
    var avatarMarkup = avatarUrl
      ? '<img class="sv-autor__avatar" src="' + avatarUrl + '" alt="" referrerpolicy="no-referrer" onerror="this.outerHTML=\'<span class=&quot;sv-autor__avatar&quot;>' + getInitial(name) + '</span>\'">'
      : '<span class="sv-autor__avatar">' + getInitial(name) + '</span>';

    body.innerHTML =
      '<div class="sv-form">' +
        '<div class="sv-autor">' + avatarMarkup + '<span class="sv-autor__name">' + name + '</span></div>' +

        '<div class="sv-field">' +
          '<label for="svTituloInput" data-i18n="subirvideo.tituloLabel">Título del video</label>' +
          '<input type="text" id="svTituloInput" class="sv-input" maxlength="120" data-i18n="subirvideo.tituloPlaceholder" placeholder="Ej. Cómo reciclé mi barrio en un día">' +
        '</div>' +

        '<div class="sv-field">' +
          '<label for="svDescInput" data-i18n="subirvideo.descLabel">Descripción (opcional)</label>' +
          '<textarea id="svDescInput" class="sv-textarea" maxlength="240" data-i18n="subirvideo.descPlaceholder" placeholder="Cuéntanos brevemente de qué trata..."></textarea>' +
        '</div>' +

        '<div class="sv-field">' +
          '<label for="svCategoriaSelect" data-i18n="subirvideo.categoriaLabel">Categoría</label>' +
          '<select id="svCategoriaSelect" class="sv-select">' + buildCategoriaOptions() + '</select>' +
        '</div>' +

        '<div class="sv-field">' +
          '<div class="sv-tabs">' +
            '<button type="button" class="sv-tab is-active" data-sv-tab="link">' + ICON_LINK + '<span data-i18n="subirvideo.tabLink">Por link</span></button>' +
            '<button type="button" class="sv-tab" data-sv-tab="archivo">' + ICON_FILM + '<span data-i18n="subirvideo.tabArchivo">Subir archivo</span></button>' +
          '</div>' +

          '<div class="sv-tabpanel is-active" data-sv-panel="link">' +
            '<label for="svLinkInput" data-i18n="subirvideo.linkLabel">Enlace del video</label>' +
            '<input type="url" id="svLinkInput" class="sv-input" data-i18n="subirvideo.linkPlaceholder" placeholder="https://youtube.com/watch?v=...">' +
            '<span class="sv-hint" data-i18n="subirvideo.linkHint">Puede ser un link de YouTube, Vimeo o una URL directa a un archivo de video.</span>' +
          '</div>' +

          '<div class="sv-tabpanel" data-sv-panel="archivo">' +
            '<div class="sv-drop" id="svDrop" tabindex="0" role="button">' +
              '<div class="sv-drop__icon">' + ICON_UPLOAD_SMALL + '</div>' +
              '<span class="sv-drop__title" data-i18n="subirvideo.dropTitulo">Arrastra tu video aquí</span>' +
              '<span class="sv-drop__sub" data-i18n="subirvideo.dropSub">o haz clic para elegir un archivo · MP4, WebM, MOV · máx. 100MB</span>' +
              '<div class="sv-drop__file">' +
                '<span class="sv-drop__file-icon">' + ICON_FILM + '</span>' +
                '<span style="min-width:0;flex:1;">' +
                  '<span class="sv-drop__file-name" id="svFileName"></span><br>' +
                  '<span class="sv-drop__file-size" id="svFileSize"></span>' +
                '</span>' +
                '<button type="button" class="sv-drop__remove" id="svFileRemove" aria-label="Quitar archivo">' + ICON_TRASH + '</button>' +
              '</div>' +
              '<input type="file" id="svFileInput" accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg,.ogv">' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<span class="sv-hint" data-i18n="subirvideo.revisionHint">Tu video se revisará antes de publicarse en la biblioteca. Te avisaremos si necesitas corregir algo.</span>' +

        '<button type="button" class="sv-submit-btn" id="svSubmitBtn" data-i18n="subirvideo.publicar">Enviar video</button>' +
        '<div class="sv-status" id="svStatus"></div>' +
      '</div>';

    wireForm(body, user);

    if (typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }
  }

  function setTab(body, tab) {
    activeTab = tab;
    body.querySelectorAll('.sv-tab').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-sv-tab') === tab);
    });
    body.querySelectorAll('.sv-tabpanel').forEach(function (panel) {
      panel.classList.toggle('is-active', panel.getAttribute('data-sv-panel') === tab);
    });
  }

  function isTipoPermitido(file) {
    if (ALLOWED_TYPES.indexOf(file.type) !== -1) return true;
    var nombre = (file.name || '').toLowerCase();
    for (var i = 0; i < ALLOWED_EXT.length; i++) {
      if (nombre.slice(-1 * ALLOWED_EXT[i].length) === ALLOWED_EXT[i]) return true;
    }
    return false;
  }

  function setArchivo(body, file, statusEl) {
    if (!file) return;

    if (!isTipoPermitido(file)) {
      mostrarStatus(statusEl, 'error', tr('subirvideo.statusTipoInvalido', 'Formato no soportado. Usa MP4, WebM, MOV u OGG.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      mostrarStatus(statusEl, 'error', tr('subirvideo.statusMuyGrande', 'El archivo supera el límite de 100MB.'));
      return;
    }

    archivoSeleccionado = file;
    var drop = body.querySelector('#svDrop');
    drop.classList.add('has-file');
    body.querySelector('#svFileName').textContent = file.name;
    body.querySelector('#svFileSize').textContent = formatBytes(file.size);
    ocultarStatus(statusEl);
  }

  function quitarArchivo(body) {
    archivoSeleccionado = null;
    var drop = body.querySelector('#svDrop');
    drop.classList.remove('has-file');
    var input = body.querySelector('#svFileInput');
    if (input) input.value = '';
  }

  function wireForm(body, user) {
    archivoSeleccionado = null;
    setTab(body, 'link');

    body.querySelectorAll('.sv-tab').forEach(function (btn) {
      btn.addEventListener('click', function () { setTab(body, btn.getAttribute('data-sv-tab')); });
    });

    var drop = body.querySelector('#svDrop');
    var fileInput = body.querySelector('#svFileInput');
    var statusEl = body.querySelector('#svStatus');

    drop.addEventListener('click', function (e) {
      if (drop.classList.contains('has-file')) return;
      fileInput.click();
    });
    drop.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !drop.classList.contains('has-file')) {
        e.preventDefault();
        fileInput.click();
      }
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files[0]) setArchivo(body, fileInput.files[0], statusEl);
    });
    drop.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (!drop.classList.contains('has-file')) drop.classList.add('is-dragover');
    });
    drop.addEventListener('dragleave', function () { drop.classList.remove('is-dragover'); });
    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('is-dragover');
      if (drop.classList.contains('has-file')) return;
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) setArchivo(body, file, statusEl);
    });
    body.querySelector('#svFileRemove').addEventListener('click', function (e) {
      e.stopPropagation();
      quitarArchivo(body);
    });

    var submitBtn = body.querySelector('#svSubmitBtn');
    submitBtn.addEventListener('click', function () { handleSubmit(body, user, submitBtn, statusEl); });
  }

  function handleSubmit(body, user, submitBtn, statusEl) {
    var titulo = body.querySelector('#svTituloInput').value.trim();
    var descripcion = body.querySelector('#svDescInput').value.trim();
    var categoria = body.querySelector('#svCategoriaSelect').value;
    var link = body.querySelector('#svLinkInput').value.trim();

    if (!titulo) {
      mostrarStatus(statusEl, 'error', tr('subirvideo.statusFaltaTitulo', 'Escribe un título para tu video.'));
      return;
    }

    if (activeTab === 'link') {
      if (!link) {
        mostrarStatus(statusEl, 'error', tr('subirvideo.statusFaltaLink', 'Pega el enlace de tu video.'));
        return;
      }
      if (!/^https?:\/\//i.test(link)) {
        mostrarStatus(statusEl, 'error', tr('subirvideo.statusLinkInvalido', 'Ese enlace no parece válido. Debe empezar con http:// o https://'));
        return;
      }
    } else {
      if (!archivoSeleccionado) {
        mostrarStatus(statusEl, 'error', tr('subirvideo.statusFaltaArchivo', 'Elige un archivo de video para subir.'));
        return;
      }
    }

    if (!window.recoSupabase) {
      mostrarStatus(statusEl, 'error', tr('subirvideo.statusServicioNoDisponible', 'Servicio no disponible en este momento.'));
      return;
    }

    submitBtn.disabled = true;
    ocultarStatus(statusEl);

    var autorNombre = getDisplayName(user);

    function insertarVideo(videoUrl) {
      submitBtn.textContent = tr('subirvideo.publicando', 'Publicando…');
      return window.recoSupabase.from(TABLE).insert({
        user_id: user.id,
        autor_nombre: autorNombre,
        titulo: titulo,
        descripcion: descripcion || null,
        categoria: categoria,
        tipo: activeTab,
        video_url: videoUrl
      });
    }

    var flujo;

    if (activeTab === 'link') {
      flujo = insertarVideo(link);
    } else {
      submitBtn.textContent = tr('subirvideo.subiendo', 'Subiendo video…');
      var ext = '';
      var puntoIdx = archivoSeleccionado.name.lastIndexOf('.');
      if (puntoIdx !== -1) ext = archivoSeleccionado.name.slice(puntoIdx);
      var pathArchivo = user.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;

      flujo = window.recoSupabase.storage
        .from(BUCKET)
        .upload(pathArchivo, archivoSeleccionado, { cacheControl: '3600', upsert: false })
        .then(function (subidaRes) {
          if (subidaRes.error) {
            return { error: subidaRes.error, _uploadFail: true };
          }
          var pub = window.recoSupabase.storage.from(BUCKET).getPublicUrl(pathArchivo);
          var publicUrl = pub && pub.data ? pub.data.publicUrl : null;
          if (!publicUrl) {
            return { error: { message: 'No se pudo obtener la URL pública.' }, _uploadFail: true };
          }
          return insertarVideo(publicUrl);
        });
    }

    flujo
      .then(function (res) {
        submitBtn.disabled = false;
        submitBtn.textContent = tr('subirvideo.publicar', 'Enviar video');

        if (res && res.error) {
          if (res._uploadFail) {
            mostrarStatus(statusEl, 'error', tr('subirvideo.statusErrorSubida', 'No se pudo subir el archivo. Intenta de nuevo.'));
          } else {
            mostrarStatus(statusEl, 'error', tr('subirvideo.statusError', 'No se pudo publicar tu video. Intenta de nuevo.'));
          }
          return;
        }

        mostrarStatus(statusEl, 'ok', tr('subirvideo.statusOk', '¡Gracias! Tu video quedó en revisión y pronto estará en la biblioteca.'));
        body.querySelector('#svTituloInput').value = '';
        body.querySelector('#svDescInput').value = '';
        body.querySelector('#svLinkInput').value = '';
        quitarArchivo(body);
        setTimeout(closeModal, 1600);
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = tr('subirvideo.publicar', 'Enviar video');
        mostrarStatus(statusEl, 'error', tr('subirvideo.statusErrorConexion', 'No se pudo conectar. Revisa tu internet.'));
      });
  }

  function mostrarStatus(el, tipo, mensaje) {
    if (!el) return;
    el.textContent = mensaje;
    el.setAttribute('data-tipo', tipo);
    el.setAttribute('data-visible', 'true');
  }
  function ocultarStatus(el) {
    if (!el) return;
    el.setAttribute('data-visible', 'false');
  }

  /* ══════════════════════════════════════════════
     ABRIR / CERRAR
     ══════════════════════════════════════════════ */
  function openModal() {
    if (!modalBuilt) buildModal();
    var body = overlayEl.querySelector('#svBody');

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

  window.recoSubirVideo = { open: openModal, close: closeModal };

  document.addEventListener('reco:langchange', function () {
    if (overlayEl && typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }
  });

  ready(wireTriggerButtons);
})();
