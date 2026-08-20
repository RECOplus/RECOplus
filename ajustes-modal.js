/**
 * ajustes-modal.js — Modal de ajustes de cuenta, accesible desde el
 * botón "Ajustes" del chip de usuario (navbar-auth.js) en CUALQUIER
 * página del sitio. Capa ADITIVA: no modifica navbar-auth.js; se
 * engancha a él escuchando el clic sobre ".nav-user__settings".
 *
 * Secciones: Cuenta (nombre + info personal), Apariencia (tema +
 * tamaño de fuente), Preferencias (idioma + notificaciones +
 * permisos), Privacidad (cerrar sesión + eliminar cuenta).
 *
 * REQUIERE, en cualquier página con navbar-auth.js:
 *   <link rel="stylesheet" href="ajustes-modal.css">
 *   ...
 *   <script src="navbar-auth.js"></script>
 *   <script src="ajustes-modal.js"></script>
 * (usa window.recoAuth y window.recoSupabase ya inicializados)
 */
(function () {
  'use strict';

  var overlayEl = null;
  var modalBuilt = false;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ── Helpers de storage local para ajustes sin backend propio ── */
  function getLS(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function setLS(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  var ICONS = {
    cuenta: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="6.5" r="3.2"/><path d="M3.5 17c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5"/></svg>',
    apariencia: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M3.5 10h2M14.5 10h2M5.5 5.5l1.4 1.4M13.1 13.1l1.4 1.4M14.5 5.5l-1.4 1.4M6.9 13.1l-1.4 1.4"/></svg>',
    preferencias: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3L4.9 4.9"/></svg>',
    privacidad: '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5l6 2.2v4.6c0 4-2.6 6.8-6 8.2-3.4-1.4-6-4.2-6-8.2V4.7z"/></svg>'
  };

  /* ══════════════════════════════════════════════
     CONSTRUCCIÓN DEL MODAL (una sola vez, reutilizable)
     ══════════════════════════════════════════════ */
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'ajustes-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="ajustes-modal" role="dialog" aria-modal="true" aria-labelledby="ajustesTitulo">' +
        '<div class="ajustes-modal__header">' +
          '<h2 class="ajustes-modal__title" id="ajustesTitulo" data-i18n="ajustes.titulo">Ajustes</h2>' +
          '<button type="button" class="ajustes-modal__close" aria-label="Cerrar" data-i18n-title="ajustes.cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="ajustes-modal__body">' +
          '<nav class="ajustes-modal__tabs">' +
            tabBtn('cuenta', ICONS.cuenta, 'ajustes.tab.cuenta', 'Cuenta', true) +
            tabBtn('apariencia', ICONS.apariencia, 'ajustes.tab.apariencia', 'Apariencia') +
            tabBtn('preferencias', ICONS.preferencias, 'ajustes.tab.preferencias', 'Preferencias') +
            tabBtn('privacidad', ICONS.privacidad, 'ajustes.tab.privacidad', 'Privacidad') +
          '</nav>' +
          '<div class="ajustes-modal__panel">' +
            seccionCuenta() +
            seccionApariencia() +
            seccionPreferencias() +
            seccionPrivacidad() +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayEl = overlay;

    wireTabs(overlay);
    wireCierre(overlay);
    wireSeccionCuenta(overlay);
    wireSeccionApariencia(overlay);
    wireSeccionPreferencias(overlay);
    wireSeccionPrivacidad(overlay);

    // El modal se inserta dinámicamente, después de que i18n.js ya
    // corrió su pasada inicial en DOMContentLoaded, así que hay que
    // traducirlo a mano con el idioma actual apenas se construye
    // (applyLang es idempotente: solo actualiza data-i18n presentes
    // en el DOM en ese momento, así que reaplicar el idioma actual
    // es seguro y no afecta al resto de la página).
    if (typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }

    modalBuilt = true;
  }

  function tabBtn(key, icon, i18nKey, label, active) {
    return '<button type="button" class="ajustes-tab" data-tab="' + key + '" data-active="' + (active ? 'true' : 'false') + '">' +
      icon + '<span data-i18n="' + i18nKey + '">' + label + '</span></button>';
  }

  function wireTabs(overlay) {
    var tabs = overlay.querySelectorAll('.ajustes-tab');
    var sections = overlay.querySelectorAll('.ajustes-section');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.setAttribute('data-active', t === tab ? 'true' : 'false'); });
        sections.forEach(function (s) {
          s.setAttribute('data-active', s.getAttribute('data-section') === key ? 'true' : 'false');
        });
      });
    });
  }

  function wireCierre(overlay) {
    overlay.querySelector('.ajustes-modal__close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') closeModal();
    });
  }

  /* ══════════════════════════════════════════════
     ABRIR / CERRAR
     ══════════════════════════════════════════════ */
  function openModal() {
    if (!modalBuilt) buildModal();
    overlayEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    refrescarSeccionCuenta();
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  window.recoAjustes = { open: openModal, close: closeModal };

  /* NOTA: antes había aquí un listener de 'reco:langchange' que
     volvía a llamar a window.applyLang(...) para re-traducir el
     modal si el idioma cambiaba mientras estaba cerrado. Se quitó
     porque causaba un loop infinito: applyLang() ya dispara ese
     mismo evento 'reco:langchange' al terminar, así que este
     listener se retriggereaba a sí mismo sin parar (congelaba la
     pestaña). applyLang() ya re-traduce TODO el documento, incluido
     este modal una vez que está en el DOM, así que no hacía falta. */

  /* ══════════════════════════════════════════════
     ENGANCHE: escucha clics en el botón "Ajustes"
     del chip de usuario, sin importar cuándo se
     inyecte (navbar-auth.js lo crea dinámicamente).
     ══════════════════════════════════════════════ */
  ready(function () {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.nav-user__settings');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
      }
    });
  });

  /* ══════════════════════════════════════════════
     SECCIÓN: CUENTA
     ══════════════════════════════════════════════ */
  function seccionCuenta() {
    return (
      '<section class="ajustes-section" data-section="cuenta" data-active="true">' +
        '<div>' +
          '<p class="ajustes-section__title" data-i18n="ajustes.cuenta.perfil">Perfil</p>' +
          '<div class="ajustes-field" style="margin-top:10px">' +
            '<label for="ajNombre" data-i18n="ajustes.cuenta.nombreLabel">Nombre para mostrar</label>' +
            '<input type="text" id="ajNombre" class="ajustes-input" placeholder="Tu nombre" data-i18n="ajustes.cuenta.nombrePlaceholder" maxlength="60">' +
          '</div>' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label data-i18n="ajustes.cuenta.emailLabel">Correo electrónico</label>' +
          '<input type="email" id="ajEmail" class="ajustes-input" disabled>' +
        '</div>' +
        '<div>' +
          '<button type="button" class="ajustes-btn ajustes-btn--primario" id="ajGuardarPerfil" data-i18n="ajustes.cuenta.guardar">Guardar cambios</button>' +
        '</div>' +
        '<div class="ajustes-status" id="ajCuentaStatus"></div>' +
        '<hr class="ajustes-divider">' +
        '<div>' +
          '<p class="ajustes-section__title" data-i18n="ajustes.cuenta.infoPersonal">Información personal</p>' +
          '<div class="ajustes-field" style="margin-top:10px">' +
            '<label for="ajTelefono" data-i18n="ajustes.cuenta.telefonoLabel">Teléfono (opcional)</label>' +
            '<input type="tel" id="ajTelefono" class="ajustes-input" placeholder="+507 6000-0000" data-i18n="ajustes.cuenta.telefonoPlaceholder">' +
          '</div>' +
          '<div class="ajustes-field" style="margin-top:10px">' +
            '<label for="ajCiudad" data-i18n="ajustes.cuenta.ciudadLabel">Ciudad</label>' +
            '<input type="text" id="ajCiudad" class="ajustes-input" placeholder="Ej. David, Panamá" data-i18n="ajustes.cuenta.ciudadPlaceholder">' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function wireSeccionCuenta(overlay) {
    var nombreInput = overlay.querySelector('#ajNombre');
    var emailInput = overlay.querySelector('#ajEmail');
    var telInput = overlay.querySelector('#ajTelefono');
    var ciudadInput = overlay.querySelector('#ajCiudad');
    var guardarBtn = overlay.querySelector('#ajGuardarPerfil');
    var statusEl = overlay.querySelector('#ajCuentaStatus');

    var tel = getLS('reco-perfil-telefono', '');
    var ciudad = getLS('reco-perfil-ciudad', '');
    if (telInput) telInput.value = tel;
    if (ciudadInput) ciudadInput.value = ciudad;

    guardarBtn.addEventListener('click', function () {
      var tr = typeof window.t === 'function' ? window.t : function (k) { return k; };
      if (!window.recoSupabase || !window.recoSupabase.auth) {
        mostrarStatus(statusEl, 'error', tr('ajustes.cuenta.statusServicioNoDisponible'));
        return;
      }
      guardarBtn.disabled = true;
      guardarBtn.textContent = tr('ajustes.cuenta.guardando');

      setLS('reco-perfil-telefono', telInput ? telInput.value.trim() : '');
      setLS('reco-perfil-ciudad', ciudadInput ? ciudadInput.value.trim() : '');

      var nuevoNombre = nombreInput.value.trim();
      window.recoSupabase.auth.updateUser({ data: { nombre: nuevoNombre } })
        .then(function (res) {
          guardarBtn.disabled = false;
          guardarBtn.textContent = tr('ajustes.cuenta.guardar');
          if (res.error) {
            mostrarStatus(statusEl, 'error', tr('ajustes.cuenta.statusErrorGuardar', { msg: res.error.message }));
            return;
          }
          mostrarStatus(statusEl, 'ok', tr('ajustes.cuenta.statusOk'));
        })
        .catch(function () {
          guardarBtn.disabled = false;
          guardarBtn.textContent = tr('ajustes.cuenta.guardar');
          mostrarStatus(statusEl, 'error', tr('ajustes.cuenta.statusErrorConexion'));
        });
    });
  }

  function refrescarSeccionCuenta() {
    if (!overlayEl || !window.recoAuth) return;
    // Igual que en navbar-auth.js: se usa la sesión verificada contra
    // el servidor para no mostrar datos de una cuenta vieja si el
    // usuario cambió de cuenta de Google recientemente en otra pestaña.
    var getSesion = window.recoAuth.getVerifiedSession || window.recoAuth.getSession;
    getSesion().then(function (session) {
      if (!session || !session.user) return;
      var user = session.user;
      var meta = user.user_metadata || {};
      var nombreInput = overlayEl.querySelector('#ajNombre');
      var emailInput = overlayEl.querySelector('#ajEmail');
      if (nombreInput) nombreInput.value = meta.nombre || meta.full_name || meta.name || '';
      if (emailInput) emailInput.value = user.email || '';
    });
  }

  function mostrarStatus(el, tipo, mensaje) {
    if (!el) return;
    el.textContent = mensaje;
    el.setAttribute('data-tipo', tipo);
    el.setAttribute('data-visible', 'true');
    setTimeout(function () { el.setAttribute('data-visible', 'false'); }, 3500);
  }

  /* ══════════════════════════════════════════════
     SECCIÓN: APARIENCIA
     ══════════════════════════════════════════════ */
  function seccionApariencia() {
    return (
      '<section class="ajustes-section" data-section="apariencia">' +
        '<div class="ajustes-row">' +
          '<div class="ajustes-row__text">' +
            '<p class="ajustes-row__label" data-i18n="ajustes.apariencia.temaLabel">Tema</p>' +
            '<p class="ajustes-row__desc" data-i18n="ajustes.apariencia.temaDesc">Elige cómo se ve RECO+ en este dispositivo.</p>' +
          '</div>' +
          '<div class="ajustes-segmented" id="ajTemaSeg">' +
            '<button type="button" class="ajustes-segmented__opt" data-valor="light" data-i18n="ajustes.apariencia.claro">Claro</button>' +
            '<button type="button" class="ajustes-segmented__opt" data-valor="dark" data-i18n="ajustes.apariencia.oscuro">Oscuro</button>' +
          '</div>' +
        '</div>' +
        '<hr class="ajustes-divider">' +
        '<div class="ajustes-row">' +
          '<div class="ajustes-row__text">' +
            '<p class="ajustes-row__label" data-i18n="ajustes.apariencia.fuenteLabel">Tamaño de fuente</p>' +
            '<p class="ajustes-row__desc" data-i18n="ajustes.apariencia.fuenteDesc">Ajusta el tamaño del texto en todo el sitio.</p>' +
          '</div>' +
          '<div class="ajustes-segmented" id="ajFuenteSeg">' +
            '<button type="button" class="ajustes-segmented__opt" data-valor="sm">A-</button>' +
            '<button type="button" class="ajustes-segmented__opt" data-valor="md">A</button>' +
            '<button type="button" class="ajustes-segmented__opt" data-valor="lg">A+</button>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  var FUENTE_ESCALAS = { sm: '93.75%', md: '100%', lg: '112.5%' };

  function aplicarTamanoFuente(valor) {
    document.documentElement.style.fontSize = FUENTE_ESCALAS[valor] || FUENTE_ESCALAS.md;
    setLS('reco-fontsize', valor);
  }

  function wireSeccionApariencia(overlay) {
    var temaSeg = overlay.querySelector('#ajTemaSeg');
    var fuenteSeg = overlay.querySelector('#ajFuenteSeg');

    function pintarTema() {
      var actual = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      temaSeg.querySelectorAll('.ajustes-segmented__opt').forEach(function (btn) {
        btn.setAttribute('data-active', btn.getAttribute('data-valor') === actual ? 'true' : 'false');
      });
    }
    temaSeg.querySelectorAll('.ajustes-segmented__opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var valor = btn.getAttribute('data-valor');
        var esDark = document.documentElement.classList.contains('dark');
        if ((valor === 'dark') !== esDark) {
          var pill = document.querySelector('.dm-pill') || document.getElementById('darkModeToggle');
          if (pill) pill.click();
        }
        pintarTema();
      });
    });
    pintarTema();

    var fuenteActual = getLS('reco-fontsize', 'md');
    aplicarTamanoFuente(fuenteActual);
    function pintarFuente() {
      fuenteSeg.querySelectorAll('.ajustes-segmented__opt').forEach(function (btn) {
        btn.setAttribute('data-active', btn.getAttribute('data-valor') === getLS('reco-fontsize', 'md') ? 'true' : 'false');
      });
    }
    fuenteSeg.querySelectorAll('.ajustes-segmented__opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        aplicarTamanoFuente(btn.getAttribute('data-valor'));
        pintarFuente();
      });
    });
    pintarFuente();
  }

  /* ══════════════════════════════════════════════
     SECCIÓN: PREFERENCIAS
     ══════════════════════════════════════════════ */
  function seccionPreferencias() {
    return (
      '<section class="ajustes-section" data-section="preferencias">' +
        '<div class="ajustes-row">' +
          '<div class="ajustes-row__text">' +
            '<p class="ajustes-row__label" data-i18n="ajustes.preferencias.idiomaLabel">Idioma</p>' +
            '<p class="ajustes-row__desc" data-i18n="ajustes.preferencias.idiomaDesc">Idioma de la interfaz de RECO+.</p>' +
          '</div>' +
          '<div class="ajustes-segmented" id="ajIdiomaSeg">' +
            '<button type="button" class="ajustes-segmented__opt" data-valor="es">ES</button>' +
            '<button type="button" class="ajustes-segmented__opt" data-valor="en">EN</button>' +
          '</div>' +
        '</div>' +
        '<hr class="ajustes-divider">' +
        '<div class="ajustes-row">' +
          '<div class="ajustes-row__text">' +
            '<p class="ajustes-row__label" data-i18n="ajustes.preferencias.notifLabel">Notificaciones</p>' +
            '<p class="ajustes-row__desc" data-i18n="ajustes.preferencias.notifDesc">Avisos sobre solicitudes, mensajes y novedades.</p>' +
          '</div>' +
          '<button type="button" class="ajustes-switch" id="ajNotifSwitch" data-on="true"><span class="ajustes-switch__knob"></span></button>' +
        '</div>' +
        '<hr class="ajustes-divider">' +
        '<div class="ajustes-row">' +
          '<div class="ajustes-row__text">' +
            '<p class="ajustes-row__label" data-i18n="ajustes.preferencias.ubicacionLabel">Ubicación</p>' +
            '<p class="ajustes-row__desc" data-i18n="ajustes.preferencias.ubicacionDesc">Permite sugerir puntos de reciclaje cercanos a ti.</p>' +
          '</div>' +
          '<button type="button" class="ajustes-switch" id="ajUbicSwitch" data-on="false"><span class="ajustes-switch__knob"></span></button>' +
        '</div>' +
        '<div class="ajustes-row">' +
          '<div class="ajustes-row__text">' +
            '<p class="ajustes-row__label" data-i18n="ajustes.preferencias.camaraLabel">Cámara</p>' +
            '<p class="ajustes-row__desc" data-i18n="ajustes.preferencias.camaraDesc">Necesaria para el escáner de materiales.</p>' +
          '</div>' +
          '<button type="button" class="ajustes-switch" id="ajCamSwitch" data-on="true"><span class="ajustes-switch__knob"></span></button>' +
        '</div>' +
      '</section>'
    );
  }

  function wireSwitch(btn, storageKey, defaultOn, onChange) {
    if (!btn) return;
    var actual = getLS(storageKey, defaultOn ? 'true' : 'false') === 'true';
    btn.setAttribute('data-on', actual ? 'true' : 'false');
    btn.addEventListener('click', function () {
      var nuevo = btn.getAttribute('data-on') !== 'true';
      btn.setAttribute('data-on', nuevo ? 'true' : 'false');
      setLS(storageKey, nuevo ? 'true' : 'false');
      if (onChange) onChange(nuevo);
    });
  }

  function wireSeccionPreferencias(overlay) {
    var idiomaSeg = overlay.querySelector('#ajIdiomaSeg');

    function pintarIdioma() {
      var actual = getLS('reco-lang', 'es');
      idiomaSeg.querySelectorAll('.ajustes-segmented__opt').forEach(function (btn) {
        btn.setAttribute('data-active', btn.getAttribute('data-valor') === actual ? 'true' : 'false');
      });
    }
    idiomaSeg.querySelectorAll('.ajustes-segmented__opt').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var valor = btn.getAttribute('data-valor');
        if (valor !== getLS('reco-lang', 'es') && typeof window.toggleLang === 'function') {
          window.toggleLang();
        }
        pintarIdioma();
      });
    });
    pintarIdioma();
    document.addEventListener('reco:langchange', pintarIdioma);

    wireSwitch(overlay.querySelector('#ajNotifSwitch'), 'reco-pref-notif', true);
    wireSwitch(overlay.querySelector('#ajUbicSwitch'), 'reco-pref-ubicacion', false);
    wireSwitch(overlay.querySelector('#ajCamSwitch'), 'reco-pref-camara', true);
  }

  /* ══════════════════════════════════════════════
     SECCIÓN: PRIVACIDAD (sesión y cuenta)
     ══════════════════════════════════════════════ */
  function seccionPrivacidad() {
    return (
      '<section class="ajustes-section" data-section="privacidad">' +
        '<div>' +
          '<p class="ajustes-section__title" data-i18n="ajustes.privacidad.sesion">Sesión</p>' +
          '<div class="ajustes-row" style="margin-top:10px">' +
            '<div class="ajustes-row__text">' +
              '<p class="ajustes-row__label" data-i18n="ajustes.privacidad.cerrarSesionLabel">Cerrar sesión</p>' +
              '<p class="ajustes-row__desc" data-i18n="ajustes.privacidad.cerrarSesionDesc">Saldrás de tu cuenta en este dispositivo.</p>' +
            '</div>' +
            '<button type="button" class="ajustes-btn" id="ajCerrarSesion" data-i18n="ajustes.privacidad.cerrarSesionBtn">Cerrar sesión</button>' +
          '</div>' +
        '</div>' +
        '<div class="ajustes-danger-zone">' +
          '<div>' +
            '<p class="ajustes-row__label" style="color:#c23a2a" data-i18n="ajustes.privacidad.eliminarLabel">Eliminar cuenta</p>' +
            '<p class="ajustes-row__desc" data-i18n="ajustes.privacidad.eliminarDesc">Esta acción es permanente. Se eliminarán tus datos de RECO+ y no podrás deshacerla.</p>' +
          '</div>' +
          '<button type="button" class="ajustes-btn ajustes-btn--peligro" id="ajEliminarCuenta" data-i18n="ajustes.privacidad.eliminarBtn">Eliminar mi cuenta</button>' +
        '</div>' +
        '<div class="ajustes-status" id="ajPrivacidadStatus"></div>' +
      '</section>'
    );
  }

  function wireSeccionPrivacidad(overlay) {
    var cerrarBtn = overlay.querySelector('#ajCerrarSesion');
    var eliminarBtn = overlay.querySelector('#ajEliminarCuenta');
    var statusEl = overlay.querySelector('#ajPrivacidadStatus');

    cerrarBtn.addEventListener('click', function () {
      var tr = typeof window.t === 'function' ? window.t : function (k) { return k; };
      if (!window.recoAuth) return;
      cerrarBtn.disabled = true;
      cerrarBtn.textContent = tr('ajustes.privacidad.cerrando');
      window.recoAuth.signOut().then(function () {
        window.location.href = 'index.html';
      });
    });

    eliminarBtn.addEventListener('click', function () {
      var tr = typeof window.t === 'function' ? window.t : function (k) { return k; };
      if (eliminarBtn.getAttribute('data-confirmando') !== 'true') {
        eliminarBtn.setAttribute('data-confirmando', 'true');
        eliminarBtn.textContent = tr('ajustes.privacidad.eliminarConfirmar');
        setTimeout(function () {
          eliminarBtn.setAttribute('data-confirmando', 'false');
          eliminarBtn.textContent = tr('ajustes.privacidad.eliminarBtn');
        }, 4000);
        return;
      }
      mostrarStatus(statusEl, 'error', tr('ajustes.privacidad.eliminarStatus'));
      eliminarBtn.setAttribute('data-confirmando', 'false');
      eliminarBtn.textContent = tr('ajustes.privacidad.eliminarBtn');
    });
  }

  window.__recoAjustesInternals = window.__recoAjustesInternals || {};
  window.__recoAjustesInternals.getLS = getLS;
  window.__recoAjustesInternals.setLS = setLS;
})();
