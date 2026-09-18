/**
 * campanas-modal.js — RECO+
 * ---------------------------------------------------------------
 * Ventana ("ventanita") de "Campañas e iniciativas", abierta desde
 * el link "Explorar iniciativas →" de la tarjeta "Proyectos y
 * campañas" en alianzas.html (id="btnExplorarIniciativas").
 *
 * Al tocarlo aparecen 2 opciones:
 *   1) "Ver campañas activas"   → lleva a donar.html, sección
 *      #campanas-empresas (ver donar-campanas.js).
 *   2) "Publicar una campaña"   → solo para una cuenta con sesión
 *      activa Y una fila 'aprobada' en `aliados`. Si no cumple, se
 *      muestra un aviso explicando qué falta en vez del formulario.
 *      Si cumple, abre un formulario de 3 pasos (datos generales,
 *      ubicación y vigencia, objetivo de la campaña) que inserta en
 *      la tabla `campanas` (ver supabase-campanas.sql).
 *
 * Reutiliza las clases .rae-* de alianzas-registro-modal.css (ya
 * cargado en alianzas.html) para heredar el mismo look del modal de
 * registro de aliado, y las variables CSS globales de darkmode.js.
 *
 * REQUIERE en alianzas.html, en este orden:
 *   <link rel="stylesheet" href="alianzas-registro-modal.css">
 *   <link rel="stylesheet" href="campanas-modal.css">
 *   ...
 *   <script src="auth.js"></script>
 *   <script src="alianzas-registro-modal.js"></script>
 *   <script src="campanas-modal.js"></script>
 * (usa window.recoAuth y window.recoSupabase ya inicializados)
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

  // Envoltorio de window.t() (definido en i18n.js) con respaldo por si
  // este script se cargara antes que i18n.js: devuelve la clave tal
  // cual para no romper el render (mejor una clave visible que un
  // "undefined").
  function t(key, vars) {
    if (typeof window.t === 'function') return window.t(key, vars);
    return key;
  }

  // URL de donar.html donde se muestran las campañas aprobadas
  // (misma convención de enlaces absolutos que usa el resto del
  // sitio — ver index.html/alianzas.html).
  var URL_DONAR_CAMPANAS = 'https://recoplus.github.io/RECOplus/donar.html#campanas-empresas';

  /* Mismos 18 ids de `categorias` que usan el escáner, el mapa y
     ajustes-empresa.js — así una campaña de reciclaje queda
     compatible con esos mismos filtros. */
  var MATERIALES_DISPONIBLES = [
    { id: 'plastico', nombre: 'Plástico', icono: '🧴' },
    { id: 'vidrio', nombre: 'Vidrio', icono: '🍾' },
    { id: 'metal', nombre: 'Metal', icono: '🥫' },
    { id: 'papel', nombre: 'Papel', icono: '📄' },
    { id: 'carton', nombre: 'Cartón', icono: '📦' },
    { id: 'libros', nombre: 'Libros', icono: '📚' },
    { id: 'electronicos', nombre: 'Electrónicos', icono: '💻' },
    { id: 'celulares', nombre: 'Celulares', icono: '📱' },
    { id: 'baterias', nombre: 'Baterías', icono: '🔋' },
    { id: 'bombillos', nombre: 'Bombillos', icono: '💡' },
    { id: 'ropa', nombre: 'Ropa', icono: '👕' },
    { id: 'tela', nombre: 'Tela', icono: '🧵' },
    { id: 'cuero', nombre: 'Cuero', icono: '🥾' },
    { id: 'muebles', nombre: 'Muebles', icono: '🪑' },
    { id: 'juguetes', nombre: 'Juguetes', icono: '🧸' },
    { id: 'utilesescolares', nombre: 'Útiles escolares', icono: '✏️' },
    { id: 'tetrapak', nombre: 'Tetra Pak', icono: '🧃' },
    { id: 'aceite', nombre: 'Aceite de cocina', icono: '🛢️' }
  ];

  /* Categorías de donación: mismas opciones que ya usa el
     formulario "Quiero donar" de donar.html (donacion-categoria),
     con un id propio (no hay tabla `categorias` para donaciones). */
  var CATEGORIAS_DONACION = [
    { id: 'ropa', nombre: 'Ropa y calzado', icono: '👕' },
    { id: 'electronicos', nombre: 'Electrónicos', icono: '💻' },
    { id: 'muebles', nombre: 'Muebles', icono: '🛋️' },
    { id: 'libros', nombre: 'Libros y útiles', icono: '📚' },
    { id: 'juguetes', nombre: 'Juguetes', icono: '🧸' },
    { id: 'alimentos', nombre: 'Alimentos no perecederos', icono: '🥫' },
    { id: 'material_escolar', nombre: 'Material escolar', icono: '✏️' },
    { id: 'higiene', nombre: 'Productos de higiene', icono: '🧼' },
    { id: 'medicinas', nombre: 'Medicinas no vencidas', icono: '💊' },
    { id: 'otro', nombre: 'Otro', icono: '📦' }
  ];

  var PROVINCIAS_PANAMA = [
    'Bocas del Toro', 'Chiriquí', 'Coclé', 'Colón', 'Darién', 'Herrera',
    'Los Santos', 'Panamá', 'Panamá Oeste', 'Veraguas',
    'Comarca Emberá-Wounaan', 'Comarca Guna Yala', 'Comarca Ngäbe-Buglé',
    'Comarca Guna de Madugandí', 'Comarca Guna de Wargandí'
  ];

  /* ══════════════════════════════════════════════
     VENTANITA DE OPCIONES
     ══════════════════════════════════════════════ */
  var overlayOpciones = null;

  function buildOpcionesModal() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="campOpcTitulo" style="max-width:460px">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker" id="campOpcKicker">' + t('campanas.opciones.kicker') + '</p>' +
            '<h2 class="rae-modal__title" id="campOpcTitulo">' + t('campanas.opciones.titulo') + '</h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="campOpcClose" aria-label="' + t('nav.cerrar') + '">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__body">' +
          '<p class="rae-step__desc" id="campOpcDesc">' + t('campanas.opciones.desc') + '</p>' +
          '<div class="camp-opciones">' +
            '<button type="button" class="camp-opcion" id="campOpcVer">' +
              '<span class="camp-opcion__icon">🔍</span>' +
              '<span class="camp-opcion__texto"><strong id="campOpcVerTitulo">' + t('campanas.opciones.ver.titulo') + '</strong><small id="campOpcVerDesc">' + t('campanas.opciones.ver.desc') + '</small></span>' +
              '<span class="camp-opcion__arrow">→</span>' +
            '</button>' +
            '<button type="button" class="camp-opcion" id="campOpcPublicar">' +
              '<span class="camp-opcion__icon">📢</span>' +
              '<span class="camp-opcion__texto"><strong id="campOpcPublicarTitulo">' + t('campanas.opciones.publicar.titulo') + '</strong><small id="campOpcPublicarDesc">' + t('campanas.opciones.publicar.desc') + '</small></span>' +
              '<span class="camp-opcion__arrow">→</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayOpciones = overlay;

    function cerrar() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }

    document.addEventListener('reco:langchange', function () {
      if (!overlayOpciones) return;
      overlayOpciones.querySelector('#campOpcKicker').textContent = t('campanas.opciones.kicker');
      overlayOpciones.querySelector('#campOpcTitulo').textContent = t('campanas.opciones.titulo');
      overlayOpciones.querySelector('#campOpcDesc').textContent = t('campanas.opciones.desc');
      overlayOpciones.querySelector('#campOpcVerTitulo').textContent = t('campanas.opciones.ver.titulo');
      overlayOpciones.querySelector('#campOpcVerDesc').textContent = t('campanas.opciones.ver.desc');
      overlayOpciones.querySelector('#campOpcPublicarTitulo').textContent = t('campanas.opciones.publicar.titulo');
      overlayOpciones.querySelector('#campOpcPublicarDesc').textContent = t('campanas.opciones.publicar.desc');
      overlayOpciones.querySelector('#campOpcClose').setAttribute('aria-label', t('nav.cerrar'));
    });

    overlay.querySelector('#campOpcClose').addEventListener('click', cerrar);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) cerrar();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') cerrar();
    });

    overlay.querySelector('#campOpcVer').addEventListener('click', function () {
      cerrar();
      window.location.href = URL_DONAR_CAMPANAS;
    });

    overlay.querySelector('#campOpcPublicar').addEventListener('click', function () {
      cerrar();
      requireAliadoAprobado();
    });
  }

  function abrirOpciones() {
    if (!overlayOpciones) buildOpcionesModal();
    overlayOpciones.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
  }

  /* ══════════════════════════════════════════════
     AVISOS (sesión / sin empresa / empresa no aprobada)
     Un solo overlay genérico y reutilizable, igual de simple que
     los avisos de alianzas-registro-modal.js.
     ══════════════════════════════════════════════ */
  var avisoEl = null;

  function buildAviso() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');
    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="campAvisoTitulo" style="max-width:420px">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker" id="campAvisoKicker">' + t('campanas.aviso.kicker') + '</p>' +
            '<h2 class="rae-modal__title" id="campAvisoTitulo"></h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="campAvisoClose" aria-label="' + t('nav.cerrar') + '">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__body"><p class="rae-step__desc" id="campAvisoMsg"></p></div>' +
        '<div class="rae-modal__footer">' +
          '<button type="button" class="rae-btn" id="campAvisoCancelar">' + t('campanas.aviso.cerrar') + '</button>' +
          '<button type="button" class="rae-btn rae-btn--primario" id="campAvisoAccion" style="display:none"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    avisoEl = overlay;

    function cerrar() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }
    overlay.querySelector('#campAvisoClose').addEventListener('click', cerrar);
    overlay.querySelector('#campAvisoCancelar').addEventListener('click', cerrar);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });

    document.addEventListener('reco:langchange', function () {
      if (!avisoEl) return;
      avisoEl.querySelector('#campAvisoKicker').textContent = t('campanas.aviso.kicker');
      avisoEl.querySelector('#campAvisoCancelar').textContent = t('campanas.aviso.cerrar');
      avisoEl.querySelector('#campAvisoClose').setAttribute('aria-label', t('nav.cerrar'));
      // Título / mensaje / botón de acción: se re-traducen solo si el
      // aviso sigue abierto con las claves de la última llamada
      // (avisoUltimo), para no perder el mensaje de error en curso.
      if (avisoUltimo) {
        avisoEl.querySelector('#campAvisoTitulo').textContent = t(avisoUltimo.tituloKey, avisoUltimo.vars);
        avisoEl.querySelector('#campAvisoMsg').textContent = t(avisoUltimo.mensajeKey, avisoUltimo.vars);
        var btn = avisoEl.querySelector('#campAvisoAccion');
        if (avisoUltimo.accionKey) btn.textContent = t(avisoUltimo.accionKey);
      }
    });
  }

  // Recuerda las claves (no el texto ya traducido) del último aviso
  // abierto con abrirAvisoClaves, para poder re-traducirlo en caliente
  // si el idioma cambia mientras el aviso sigue en pantalla.
  var avisoUltimo = null;

  /* accion: { texto, onClick } opcional — si no se pasa, solo se ve el botón de cerrar.
     Mantiene la firma original con texto ya resuelto, para el único
     caso (error de Supabase ya traducido) que no tiene clave i18n. */
  function abrirAviso(titulo, mensaje, accion) {
    avisoUltimo = null;
    if (!avisoEl) buildAviso();
    avisoEl.querySelector('#campAvisoTitulo').textContent = titulo;
    avisoEl.querySelector('#campAvisoMsg').textContent = mensaje;
    var btnAccion = avisoEl.querySelector('#campAvisoAccion');
    // Se clona el botón para limpiar cualquier listener de una
    // apertura anterior antes de engancharle uno nuevo.
    var btnNuevo = btnAccion.cloneNode(true);
    btnAccion.parentNode.replaceChild(btnNuevo, btnAccion);
    if (accion) {
      btnNuevo.style.display = '';
      btnNuevo.textContent = accion.texto;
      btnNuevo.addEventListener('click', function () {
        avisoEl.setAttribute('data-open', 'false');
        document.body.style.overflow = '';
        accion.onClick();
      });
    } else {
      btnNuevo.style.display = 'none';
    }
    avisoEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
  }

  /* Variante que recibe CLAVES i18n en vez de texto ya resuelto, para
     los avisos que sí tienen traducción (todos salvo los errores
     crudos de Supabase). vars se pasa a t() para interpolar (ej.
     {plan}, {max}, {dias}). accionKey es opcional. */
  function abrirAvisoClaves(tituloKey, mensajeKey, vars, accionKey, onClick) {
    avisoUltimo = { tituloKey: tituloKey, mensajeKey: mensajeKey, vars: vars, accionKey: accionKey };
    abrirAviso(
      t(tituloKey, vars),
      t(mensajeKey, vars),
      accionKey ? { texto: t(accionKey), onClick: onClick } : null
    );
  }

  /* ══════════════════════════════════════════════
     VERIFICACIÓN: sesión activa + aliado aprobado + límite de plan
     ══════════════════════════════════════════════ */
  var aliadoActual = null; // { id, nombre_empresa, estado } del usuario con sesión activa

  // Plan efectivo del usuario en el momento de abrir el wizard (se
  // recalcula cada vez que se intenta publicar). validarPaso2 lo usa
  // para el tope de días de vigencia según el plan — ver
  // supabase-suscripciones.sql (mismos números reforzados por RLS).
  var planActualCache = null;

  function requireAliadoAprobado() {
    if (!window.recoAuth) {
      console.error('[RECO+] recoAuth no está disponible. Revisa que auth.js se cargó antes que campanas-modal.js.');
      return;
    }

    window.recoAuth.getVerifiedSession().then(function (sesion) {
      if (!sesion || !sesion.user) {
        abrirAvisoClaves(
          'campanas.aviso.sesion.titulo',
          'campanas.aviso.sesion.msg',
          null,
          'campanas.aviso.sesion.btn',
          function () { window.location.href = 'login.html'; }
        );
        return;
      }

      var client = window.recoSupabase;
      if (!client) {
        abrirAvisoClaves('campanas.aviso.servicioNoDisponible.titulo', 'campanas.aviso.servicioNoDisponible.msg', null, null, null);
        return;
      }

      client.from('aliados').select('id,nombre_empresa,estado').eq('user_id', sesion.user.id).maybeSingle().then(function (res) {
        if (res.error) {
          abrirAvisoClaves('campanas.aviso.errorVerificar.titulo', 'campanas.aviso.errorVerificar.msg', null, null, null);
          return;
        }

        if (!res.data) {
          abrirAvisoClaves(
            'campanas.aviso.registraEmpresa.titulo',
            'campanas.aviso.registraEmpresa.msg',
            null,
            'campanas.aviso.registraEmpresa.btn',
            function () {
              if (window.recoRegistroAliado && typeof window.recoRegistroAliado.open === 'function') {
                window.recoRegistroAliado.open();
              } else {
                var trigger = document.getElementById('btnRegistrarEmpresaAliado');
                if (trigger) trigger.click();
              }
            }
          );
          return;
        }

        if (res.data.estado !== 'aprobado') {
          var mensajeKey = res.data.estado === 'rechazado' ? 'campanas.aviso.rechazado.msg' : 'campanas.aviso.pendiente.msg';
          abrirAvisoClaves('campanas.aviso.pendiente.titulo', mensajeKey, null, 'campanas.aviso.ajustesBtn', function () {
            if (window.recoAjustes && typeof window.recoAjustes.open === 'function') window.recoAjustes.open();
          });
          return;
        }

        aliadoActual = res.data;
        verificarLimitePlanYAbrir(sesion.user.id);
      }).catch(function () {
        abrirAvisoClaves('campanas.aviso.errorVerificar.titulo', 'campanas.aviso.errorVerificarConexion.msg', null, null, null);
      });
    }).catch(function () {
      abrirAvisoClaves(
        'campanas.aviso.sesion.titulo',
        'campanas.aviso.sesion.msg',
        null,
        'campanas.aviso.sesion.btn',
        function () { window.location.href = 'login.html'; }
      );
    });
  }

  /* Antes de abrir el formulario de 3 pasos, revisa cuántas campañas
     activas tiene ya el usuario y las compara contra el tope de su
     plan (ver suscripcion-planes.js). Esto es solo la validación del
     lado del cliente para dar feedback inmediato con un CTA a
     suscripcion-modal.js — el tope real, infranqueable, ya lo
     refuerza la policy de INSERT de `campanas` en
     supabase-suscripciones.sql. Si algo falla al consultar (sin
     conexión, funciones no cargadas), se deja pasar: el peor caso es
     que el INSERT final sea rechazado por RLS con un mensaje claro. */
  function verificarLimitePlanYAbrir(userId) {
    if (!window.recoSuscripcion || !window.recoPlanes || !window.recoSupabase) {
      planActualCache = null;
      openModalPublicar();
      return;
    }

    window.recoSuscripcion.getPlanActual().then(function (planId) {
      var plan = window.recoPlanes.getPlan(planId);
      planActualCache = plan;

      if (plan.campanasActivasMax === -1) {
        openModalPublicar();
        return;
      }

      window.recoSupabase.from('campanas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('activa', true)
        .in('estado', ['pendiente', 'aprobado'])
        .then(function (res) {
          var activas = (res && typeof res.count === 'number') ? res.count : 0;
          if (activas >= plan.campanasActivasMax) {
            var plural = plan.campanasActivasMax === 1 ? '' : 's';
            abrirAvisoClaves(
              'campanas.aviso.limite.titulo',
              'campanas.aviso.limite.msg',
              { plan: plan.nombre, max: plan.campanasActivasMax, plural: plural },
              'campanas.aviso.verPlanesBtn',
              function () {
                if (window.recoSuscripcion && typeof window.recoSuscripcion.open === 'function') window.recoSuscripcion.open();
              }
            );
            return;
          }
          openModalPublicar();
        })
        .catch(function () { openModalPublicar(); });
    }).catch(function () { openModalPublicar(); });
  }

  /* ══════════════════════════════════════════════
     PASO 1 — DATOS DE LA CAMPAÑA
     ══════════════════════════════════════════════ */
  function renderPaso1(data) {
    data = data || {};
    var tipo = data.tipo || 'reciclaje';
    return (
      '<div class="rae-step" data-step="datos">' +
        '<p class="rae-step__desc">' + t('campanas.paso1.desc') + '</p>' +

        '<div class="rae-field">' +
          '<label>' + t('campanas.paso1.tipoLabel') + ' <span class="rae-required">*</span></label>' +
          '<div class="camp-tipo-toggle" id="campTipoToggle">' +
            '<button type="button" class="camp-tipo-btn' + (tipo === 'reciclaje' ? ' camp-tipo-btn--active' : '') + '" data-tipo="reciclaje">♻️ ' + t('campanas.paso1.tipoReciclaje') + '</button>' +
            '<button type="button" class="camp-tipo-btn' + (tipo === 'donacion' ? ' camp-tipo-btn--active' : '') + '" data-tipo="donacion">🎁 ' + t('campanas.paso1.tipoDonacion') + '</button>' +
          '</div>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="campTitulo">' + t('campanas.paso1.tituloLabel') + ' <span class="rae-required">*</span></label>' +
          '<input type="text" id="campTitulo" class="rae-input" placeholder="' + t('campanas.paso1.tituloPh') + '" maxlength="100" value="' + esc(data.titulo) + '">' +
          '<span class="rae-error" id="campTituloError">' + t('campanas.paso1.tituloError') + '</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="campDescripcion">' + t('campanas.paso1.descLabel') + ' <span class="rae-required">*</span></label>' +
          '<textarea id="campDescripcion" class="rae-input rae-textarea" placeholder="' + t('campanas.paso1.descPh') + '" maxlength="500">' + esc(data.descripcion) + '</textarea>' +
          '<span class="rae-hint" id="campDescripcionHint">' + t('campanas.paso1.descHint', { n: data.descripcion ? data.descripcion.length : 0 }) + '</span>' +
          '<span class="rae-error" id="campDescripcionError">' + t('campanas.paso1.descError') + '</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label>' + t('campanas.paso1.bannerLabel') + ' <span class="rae-optional">(opcional)</span></label>' +
          '<div class="rae-logo-row">' +
            '<div class="rae-logo-preview camp-banner-preview" id="campBannerPreview">' +
              (data.bannerDataUrl
                ? '<img src="' + data.bannerDataUrl + '" alt="' + t('campanas.paso1.bannerLabel') + '">'
                : '<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="4" width="15" height="12" rx="1.5"/><circle cx="7" cy="8.5" r="1.4"/><path d="M17.5 13.5l-4-4-3 3-2.5-2.5-5.5 5.5"/></svg>') +
            '</div>' +
            '<div class="rae-logo-actions">' +
              '<button type="button" class="rae-btn rae-btn--sm" id="campBannerBtn">' + (data.bannerDataUrl ? t('campanas.paso1.bannerCambiar') : t('campanas.paso1.bannerSubir')) + '</button>' +
              '<button type="button" class="rae-btn rae-btn--sm rae-btn--ghost" id="campBannerRemoveBtn" style="' + (data.bannerDataUrl ? '' : 'display:none') + '">' + t('campanas.paso1.bannerQuitar') + '</button>' +
              '<span class="rae-hint">' + t('campanas.paso1.bannerHint') + '</span>' +
            '</div>' +
            '<input type="file" id="campBannerInput" accept="image/*" style="display:none">' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function leerArchivoComoDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function wirePaso1(body, data) {
    var toggle = body.querySelector('#campTipoToggle');
    toggle.addEventListener('click', function (e) {
      var btn = e.target.closest('.camp-tipo-btn');
      if (!btn) return;
      data.tipo = btn.getAttribute('data-tipo');
      toggle.querySelectorAll('.camp-tipo-btn').forEach(function (b) {
        b.classList.toggle('camp-tipo-btn--active', b === btn);
      });
    });

    var descTextarea = body.querySelector('#campDescripcion');
    var descHint = body.querySelector('#campDescripcionHint');
    descTextarea.addEventListener('input', function () {
      descHint.textContent = t('campanas.paso1.descHint', { n: descTextarea.value.length });
    });

    var bannerInput = body.querySelector('#campBannerInput');
    var bannerBtn = body.querySelector('#campBannerBtn');
    var bannerRemoveBtn = body.querySelector('#campBannerRemoveBtn');
    var bannerPreview = body.querySelector('#campBannerPreview');

    bannerBtn.addEventListener('click', function () { bannerInput.click(); });
    bannerInput.addEventListener('change', function () {
      var file = bannerInput.files && bannerInput.files[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        window.alert(t('campanas.paso1.bannerAlert'));
        bannerInput.value = '';
        return;
      }
      leerArchivoComoDataUrl(file).then(function (dataUrl) {
        data.bannerDataUrl = dataUrl;
        bannerPreview.innerHTML = '<img src="' + dataUrl + '" alt="' + t('campanas.paso1.bannerLabel') + '">';
        bannerBtn.textContent = t('campanas.paso1.bannerCambiar');
        bannerRemoveBtn.style.display = '';
      });
    });
    bannerRemoveBtn.addEventListener('click', function () {
      data.bannerDataUrl = null;
      bannerInput.value = '';
      bannerPreview.innerHTML = '<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="4" width="15" height="12" rx="1.5"/><circle cx="7" cy="8.5" r="1.4"/><path d="M17.5 13.5l-4-4-3 3-2.5-2.5-5.5 5.5"/></svg>';
      bannerBtn.textContent = t('campanas.paso1.bannerSubir');
      bannerRemoveBtn.style.display = 'none';
    });
  }

  function marcarError(input, errorEl, mostrar) {
    input.classList.toggle('rae-input--invalid', mostrar);
    if (errorEl) errorEl.setAttribute('data-visible', mostrar ? 'true' : 'false');
  }

  function validarPaso1(body) {
    var ok = true;
    var titulo = body.querySelector('#campTitulo');
    if (!titulo.value.trim()) { marcarError(titulo, body.querySelector('#campTituloError'), true); ok = false; }
    else marcarError(titulo, body.querySelector('#campTituloError'), false);

    var desc = body.querySelector('#campDescripcion');
    if (desc.value.trim().length < 20) { marcarError(desc, body.querySelector('#campDescripcionError'), true); ok = false; }
    else marcarError(desc, body.querySelector('#campDescripcionError'), false);

    return ok;
  }

  function recolectarPaso1(body, data) {
    data.titulo = body.querySelector('#campTitulo').value.trim();
    data.descripcion = body.querySelector('#campDescripcion').value.trim();
    data.tipo = data.tipo || 'reciclaje';
    // bannerDataUrl ya se guarda directo en `data` desde wirePaso1
  }

  /* ══════════════════════════════════════════════
     PASO 2 — UBICACIÓN Y VIGENCIA
     ══════════════════════════════════════════════ */
  function renderPaso2(data) {
    data = data || {};
    var opciones = PROVINCIAS_PANAMA.map(function (p) {
      var sel = data.provincia === p ? ' selected' : '';
      return '<option value="' + p + '"' + sel + '>' + p + '</option>';
    }).join('');

    return (
      '<div class="rae-step" data-step="ubicacion">' +
        '<p class="rae-step__desc">' + t('campanas.paso2.desc') + '</p>' +

        '<div class="rae-field">' +
          '<label for="campProvincia">' + t('campanas.paso2.provinciaLabel') + ' <span class="rae-required">*</span></label>' +
          '<select id="campProvincia" class="rae-input">' +
            '<option value="">' + t('campanas.paso2.provinciaDefault') + '</option>' + opciones +
          '</select>' +
          '<span class="rae-error" id="campProvinciaError">' + t('campanas.paso2.provinciaError') + '</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="campDistrito">' + t('campanas.paso2.distritoLabel') + ' <span class="rae-required">*</span></label>' +
          '<input type="text" id="campDistrito" class="rae-input" maxlength="80" value="' + esc(data.distrito) + '">' +
          '<span class="rae-error" id="campDistritoError">' + t('campanas.paso2.distritoError') + '</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="campDireccion">' + t('campanas.paso2.direccionLabel') + ' <span class="rae-required">*</span></label>' +
          '<textarea id="campDireccion" class="rae-input rae-textarea" style="min-height:64px" maxlength="240">' + esc(data.direccion) + '</textarea>' +
          '<span class="rae-error" id="campDireccionError">' + t('campanas.paso2.direccionError') + '</span>' +
        '</div>' +

        '<div class="rae-row">' +
          '<div class="rae-field">' +
            '<label for="campFechaInicio">' + t('campanas.paso2.fechaInicioLabel') + ' <span class="rae-required">*</span></label>' +
            '<input type="date" id="campFechaInicio" class="rae-input" value="' + esc(data.fechaInicio) + '">' +
            '<span class="rae-error" id="campFechaInicioError">' + t('campanas.paso2.fechaInicioError') + '</span>' +
          '</div>' +
          '<div class="rae-field">' +
            '<label for="campFechaFin">' + t('campanas.paso2.fechaFinLabel') + ' <span class="rae-required">*</span></label>' +
            '<input type="date" id="campFechaFin" class="rae-input" value="' + esc(data.fechaFin) + '">' +
            '<span class="rae-error" id="campFechaFinError">' + t('campanas.paso2.fechaFinErrorDefault') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePaso2(body) { /* sin listeners especiales; la validación corre al avanzar */ }

  function validarPaso2(body) {
    var ok = true;
    var campos = [
      ['campProvincia', 'campProvinciaError'],
      ['campDistrito', 'campDistritoError'],
      ['campDireccion', 'campDireccionError'],
      ['campFechaInicio', 'campFechaInicioError']
    ];
    campos.forEach(function (par) {
      var input = body.querySelector('#' + par[0]);
      var errorEl = body.querySelector('#' + par[1]);
      if (!input.value.trim()) { marcarError(input, errorEl, true); ok = false; }
      else marcarError(input, errorEl, false);
    });

    var fin = body.querySelector('#campFechaFin');
    var inicio = body.querySelector('#campFechaInicio').value;
    var finError = body.querySelector('#campFechaFinError');
    var MENSAJE_FIN_DEFAULT = t('campanas.paso2.fechaFinErrorDefault');

    if (!fin.value.trim() || (inicio && fin.value < inicio)) {
      finError.textContent = MENSAJE_FIN_DEFAULT;
      marcarError(fin, finError, true);
      ok = false;
    } else if (planActualCache && inicio && fin.value) {
      // Refuerzo del lado del cliente del mismo tope que aplica RLS
      // en supabase-suscripciones.sql (duración máxima por plan).
      var dias = Math.round((new Date(fin.value) - new Date(inicio)) / 86400000);
      if (dias > planActualCache.duracionCampanaMaxDias) {
        finError.textContent = t('campanas.paso2.fechaFinErrorPlan', { plan: planActualCache.nombre, dias: planActualCache.duracionCampanaMaxDias });
        marcarError(fin, finError, true);
        ok = false;
      } else {
        finError.textContent = MENSAJE_FIN_DEFAULT;
        marcarError(fin, finError, false);
      }
    } else {
      finError.textContent = MENSAJE_FIN_DEFAULT;
      marcarError(fin, finError, false);
    }

    return ok;
  }

  function recolectarPaso2(body, data) {
    data.provincia = body.querySelector('#campProvincia').value;
    data.distrito = body.querySelector('#campDistrito').value.trim();
    data.direccion = body.querySelector('#campDireccion').value.trim();
    data.fechaInicio = body.querySelector('#campFechaInicio').value;
    data.fechaFin = body.querySelector('#campFechaFin').value;
  }

  /* ══════════════════════════════════════════════
     PASO 3 — OBJETIVO DE LA CAMPAÑA
     (materiales si es reciclaje, categorías si es donación)
     ══════════════════════════════════════════════ */
  function renderPaso3(data) {
    data = data || {};
    var tipo = (CAMP_STATE.datos && CAMP_STATE.datos.tipo) || 'reciclaje';
    var catalogo = tipo === 'donacion' ? CATEGORIAS_DONACION : MATERIALES_DISPONIBLES;
    var seleccion = data.items || [];

    var chips = catalogo.map(function (c) {
      var activo = seleccion.indexOf(c.id) !== -1;
      return (
        '<button type="button" class="rae-chip' + (activo ? ' rae-chip--active' : '') + '" data-item-id="' + c.id + '">' +
          '<span class="rae-chip__icon">' + c.icono + '</span><span>' + c.nombre + '</span>' +
        '</button>'
      );
    }).join('');

    var etiquetaObjetivo = tipo === 'donacion' ? '¿Qué categorías se reciben?' : '¿Qué materiales se reciben?';

    return (
      '<div class="rae-step" data-step="objetivo">' +
        '<p class="rae-step__desc">Por último, cuéntanos el objetivo de la campaña.</p>' +

        '<div class="rae-field">' +
          '<div class="rae-chip-head">' +
            '<label style="margin:0">' + etiquetaObjetivo + ' <span class="rae-required">*</span></label>' +
            '<span class="rae-chip-count" id="campObjetivoCount">' + seleccion.length + ' seleccionados</span>' +
          '</div>' +
          '<div class="rae-chip-grid" id="campObjetivoGrid">' + chips + '</div>' +
          '<span class="rae-error" id="campObjetivoError" data-visible="' + (seleccion.length ? 'false' : 'false') + '">Selecciona al menos una opción.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label>Meta de la campaña <span class="rae-optional">(opcional)</span></label>' +
          '<div class="rae-row">' +
            '<div class="rae-field" style="margin-bottom:0">' +
              '<input type="number" id="campMetaCantidad" class="rae-input" placeholder="Ej. 500" min="0" value="' + esc(data.metaCantidad) + '">' +
            '</div>' +
            '<div class="rae-field" style="margin-bottom:0">' +
              '<input type="text" id="campMetaUnidad" class="rae-input" placeholder="Ej. kg, artículos, personas" maxlength="30" value="' + esc(data.metaUnidad) + '">' +
            '</div>' +
          '</div>' +
          '<span class="rae-hint">Ej. "500" + "kg", o "200" + "artículos". Se muestra como una barra de progreso en Donar.</span>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePaso3(body, data) {
    if (!data.items) data.items = [];
    var grid = body.querySelector('#campObjetivoGrid');
    var count = body.querySelector('#campObjetivoCount');
    grid.addEventListener('click', function (e) {
      var chip = e.target.closest('.rae-chip');
      if (!chip) return;
      var activo = chip.classList.toggle('rae-chip--active');
      var id = chip.getAttribute('data-item-id');
      if (activo) {
        if (data.items.indexOf(id) === -1) data.items.push(id);
      } else {
        data.items = data.items.filter(function (x) { return x !== id; });
      }
      count.textContent = data.items.length + ' seleccionados';
    });
  }

  function validarPaso3(body, data) {
    var seleccionados = data.items || [];
    var errorEl = body.querySelector('#campObjetivoError');
    var grid = body.querySelector('#campObjetivoGrid');
    if (!seleccionados.length) {
      if (errorEl) errorEl.setAttribute('data-visible', 'true');
      if (grid) grid.classList.add('rae-chip-grid--invalid');
      return false;
    }
    if (errorEl) errorEl.setAttribute('data-visible', 'false');
    if (grid) grid.classList.remove('rae-chip-grid--invalid');
    return true;
  }

  function recolectarPaso3(body, data) {
    data.metaCantidad = body.querySelector('#campMetaCantidad').value.trim();
    data.metaUnidad = body.querySelector('#campMetaUnidad').value.trim();
    // data.items ya se mantiene actualizado desde wirePaso3
  }

  /* ══════════════════════════════════════════════
     WIZARD: definición de pasos + navegación
     ══════════════════════════════════════════════ */
  var CAMP_STEPS = [
    { key: 'datos', titulo: 'Datos de la campaña', render: renderPaso1, wire: wirePaso1, validate: validarPaso1, recolectar: recolectarPaso1 },
    { key: 'ubicacion', titulo: 'Ubicación y vigencia', render: renderPaso2, wire: wirePaso2, validate: validarPaso2, recolectar: recolectarPaso2 },
    { key: 'objetivo', titulo: 'Objetivo de la campaña', render: renderPaso3, wire: wirePaso3, validate: null, recolectar: recolectarPaso3 }
  ];

  var overlayPublicar = null;
  var modalPublicarBuilt = false;
  var currentStepIndex = 0;
  var CAMP_STATE = {};
  var envioCompletado = false;

  function buildModalPublicar() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="campTitulo">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker">Publicar campaña · Paso <span id="campPasoActual">1</span> de <span id="campPasoTotal">' + CAMP_STEPS.length + '</span></p>' +
            '<h2 class="rae-modal__title" id="campTitulo"></h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="campClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__progress-track"><div class="rae-modal__progress-bar" id="campProgressBar"></div></div>' +
        '<div class="rae-modal__body" id="campBody"></div>' +
        '<div class="rae-modal__status" id="campStatus"></div>' +
        '<div class="rae-modal__footer">' +
          '<button type="button" class="rae-btn" id="campBtnAtras">← Atrás</button>' +
          '<button type="button" class="rae-btn rae-btn--primario" id="campBtnSiguiente">Siguiente →</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayPublicar = overlay;

    overlay.querySelector('#campClose').addEventListener('click', pedirCierre);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) pedirCierre(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') pedirCierre();
    });

    overlay.querySelector('#campBtnAtras').addEventListener('click', irAtras);
    overlay.querySelector('#campBtnSiguiente').addEventListener('click', irSiguiente);

    modalPublicarBuilt = true;
  }

  function renderStep(index) {
    var paso = CAMP_STEPS[index];
    var body = overlayPublicar.querySelector('#campBody');
    var titulo = overlayPublicar.querySelector('#campTitulo');
    var pasoActualEl = overlayPublicar.querySelector('#campPasoActual');
    var progressBar = overlayPublicar.querySelector('#campProgressBar');
    var atrasBtn = overlayPublicar.querySelector('#campBtnAtras');
    var siguienteBtn = overlayPublicar.querySelector('#campBtnSiguiente');
    var closeBtn = overlayPublicar.querySelector('#campClose');
    var status = overlayPublicar.querySelector('#campStatus');

    if (!CAMP_STATE[paso.key]) CAMP_STATE[paso.key] = {};

    titulo.textContent = paso.titulo;
    pasoActualEl.textContent = String(index + 1);
    progressBar.style.width = (((index + 1) / CAMP_STEPS.length) * 100) + '%';
    atrasBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
    atrasBtn.disabled = false;
    siguienteBtn.disabled = false;
    siguienteBtn.style.display = '';
    siguienteBtn.textContent = (index === CAMP_STEPS.length - 1) ? 'Publicar campaña ✓' : 'Siguiente →';
    closeBtn.disabled = false;
    status.setAttribute('data-visible', 'false');

    body.innerHTML = paso.render(CAMP_STATE[paso.key]);
    body.scrollTop = 0;
    paso.wire(body, CAMP_STATE[paso.key]);
  }

  function irAtras() {
    if (currentStepIndex === 0) return;
    currentStepIndex -= 1;
    renderStep(currentStepIndex);
  }

  function irSiguiente() {
    var paso = CAMP_STEPS[currentStepIndex];
    var body = overlayPublicar.querySelector('#campBody');

    // Se recolecta ANTES de validar el paso 3 (necesita data.items
    // actualizado, que ya vive en CAMP_STATE.objetivo por wirePaso3).
    paso.recolectar(body, CAMP_STATE[paso.key]);

    var valido = paso.validate ? paso.validate(body, CAMP_STATE[paso.key]) : true;
    if (!valido) {
      mostrarStatus('error', 'Revisa los campos marcados antes de continuar.');
      return;
    }

    if (currentStepIndex < CAMP_STEPS.length - 1) {
      currentStepIndex += 1;
      renderStep(currentStepIndex);
      return;
    }

    enviarCampanaFinal();
  }

  function mostrarStatus(tipo, mensaje) {
    var status = overlayPublicar.querySelector('#campStatus');
    status.textContent = mensaje;
    status.setAttribute('data-tipo', tipo);
    status.setAttribute('data-visible', 'true');
  }

  function deshabilitarNavegacion(deshabilitado) {
    var siguienteBtn = overlayPublicar.querySelector('#campBtnSiguiente');
    var atrasBtn = overlayPublicar.querySelector('#campBtnAtras');
    var closeBtn = overlayPublicar.querySelector('#campClose');
    siguienteBtn.disabled = deshabilitado;
    atrasBtn.disabled = deshabilitado;
    closeBtn.disabled = deshabilitado;
    siguienteBtn.textContent = deshabilitado ? 'Publicando...' : 'Publicar campaña ✓';
  }

  /* ── Sube el banner (si hay) al bucket "campanas", dentro de una
     carpeta con el id del usuario — mismo patrón que
     subirArchivoAliado() en alianzas-registro-modal.js ── */
  function dataUrlABlob(dataUrl) {
    var partes = dataUrl.split(',');
    var mimeMatch = partes[0].match(/:(.*?);/);
    var mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    var binario = atob(partes[1]);
    var bytes = new Uint8Array(binario.length);
    for (var i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return { blob: new Blob([bytes], { type: mime }), mime: mime };
  }

  function extensionDeMime(mime) {
    if (mime === 'image/png') return 'png';
    if (mime === 'image/webp') return 'webp';
    return 'jpg';
  }

  function subirBanner(client, userId, dataUrl) {
    if (!dataUrl) return Promise.resolve(null);
    var info = dataUrlABlob(dataUrl);
    var ext = extensionDeMime(info.mime);
    var ruta = userId + '/banner-' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.' + ext;
    return client.storage.from('campanas').upload(ruta, info.blob, { contentType: info.mime, upsert: false }).then(function (res) {
      if (res.error) throw res.error;
      var pub = client.storage.from('campanas').getPublicUrl(ruta);
      return pub && pub.data ? pub.data.publicUrl : null;
    });
  }

  function traducirErrorEnvio(err) {
    if (!err) return 'Ocurrió un error inesperado. Intenta de nuevo.';
    var msg = (err.message || '').toLowerCase();
    if (msg.indexOf('row-level security') !== -1 || msg.indexOf('policy') !== -1) return 'No se pudo publicar por un problema de permisos (¿tu empresa sigue aprobada?).';
    if (msg.indexOf('network') !== -1 || msg.indexOf('fetch') !== -1) return 'No se pudo conectar. Revisa tu conexión a internet.';
    return err.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  function enviarCampanaFinal() {
    var client = window.recoSupabase;
    if (!client || !window.recoAuth || !aliadoActual) {
      mostrarStatus('error', 'No se pudo conectar con el servicio. Intenta de nuevo más tarde.');
      return;
    }

    var datos = CAMP_STATE.datos || {};
    var ubicacion = CAMP_STATE.ubicacion || {};
    var objetivo = CAMP_STATE.objetivo || {};

    deshabilitarNavegacion(true);
    mostrarStatus('ok', 'Verificando tu sesión...');

    window.recoAuth.getVerifiedSession().then(function (sesion) {
      var userId = sesion && sesion.user && sesion.user.id;
      if (!userId) throw { mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.' };
      return userId;
    }).then(function (userId) {
      mostrarStatus('ok', 'Subiendo banner...');
      return subirBanner(client, userId, datos.bannerDataUrl).then(function (bannerUrl) {
        mostrarStatus('ok', 'Publicando tu campaña...');

        var payload = {
          aliado_id: aliadoActual.id,
          user_id: userId,
          tipo: datos.tipo || 'reciclaje',
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          banner_url: bannerUrl,
          fecha_inicio: ubicacion.fechaInicio,
          fecha_fin: ubicacion.fechaFin,
          provincia: ubicacion.provincia,
          distrito: ubicacion.distrito,
          direccion: ubicacion.direccion,
          materiales: datos.tipo === 'donacion' ? [] : (objetivo.items || []),
          categorias_donacion: datos.tipo === 'donacion' ? (objetivo.items || []) : [],
          meta_cantidad: objetivo.metaCantidad ? Number(objetivo.metaCantidad) : null,
          meta_unidad: objetivo.metaUnidad || null
        };

        return client.from('campanas').insert([payload]);
      });
    }).then(function (resInsert) {
      if (resInsert.error) throw { mensaje: traducirErrorEnvio(resInsert.error) };

      envioCompletado = true;
      mostrarStatus('ok', '✓ ¡Campaña enviada! Quedará pendiente de revisión y aparecerá en Donar en cuanto sea aprobada.');
      overlayPublicar.querySelector('#campBtnSiguiente').style.display = 'none';
      overlayPublicar.querySelector('#campBtnAtras').style.visibility = 'hidden';
      overlayPublicar.querySelector('#campClose').disabled = false;
    }).catch(function (err) {
      deshabilitarNavegacion(false);
      var mensaje = (err && err.mensaje) || traducirErrorEnvio(err);
      mostrarStatus('error', mensaje);
    });
  }

  function hayDatosSinGuardar() {
    var d = CAMP_STATE.datos;
    return !!(d && (d.titulo || d.descripcion || d.bannerDataUrl));
  }

  function pedirCierre() {
    if (!envioCompletado && hayDatosSinGuardar()) {
      var ok = window.confirm('¿Seguro que quieres cerrar? Se perderá la información ingresada en este formulario.');
      if (!ok) return;
    }
    closeModalPublicar();
  }

  function openModalPublicar() {
    if (!modalPublicarBuilt) buildModalPublicar();
    currentStepIndex = 0;
    CAMP_STATE = {};
    envioCompletado = false;
    renderStep(currentStepIndex);
    overlayPublicar.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeModalPublicar() {
    if (!overlayPublicar) return;
    overlayPublicar.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════════════
     ENGANCHE: link "Explorar iniciativas →"
     ══════════════════════════════════════════════ */
  ready(function () {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('#btnExplorarIniciativas');
      if (trigger) {
        e.preventDefault();
        abrirOpciones();
      }
    });
  });
})();
