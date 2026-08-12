/**
 * ajustes-suscripcion.js — RECO+
 * ---------------------------------------------------------------
 * Pestaña "Mi plan" dentro del modal de Ajustes (ajustes-modal.js),
 * visible en CUALQUIER página que ya cargue navbar-auth.js +
 * ajustes-modal.js + suscripcion-planes.js + suscripcion-modal.js,
 * para cualquier cuenta CON sesión activa.
 *
 * A diferencia de "Mi empresa" (ajustes-empresa.js), que solo
 * aparece si hay una fila en `aliados`, "Mi plan" aparece siempre
 * que haya sesión: todo usuario tiene un plan, aunque nunca se haya
 * suscrito (el respaldo es 'gratis' — ver suscripcion-planes.js).
 *
 * Muestra:
 *   - Tarjeta resumen del plan actual (mismo look que el modal de
 *     suscripción — reutiliza las clases .susc-* de suscripcion-
 *     modal.css).
 *   - Barra de uso del escáner con IA hoy (X de Y escaneos), leída
 *     con la función escaneos_ia_hoy() de supabase-suscripciones.sql
 *     vía RPC. Si el plan es Premium, muestra "Ilimitados" en vez
 *     de barra.
 *   - Botón "Cambiar de plan" que cierra Ajustes y abre
 *     window.recoSuscripcion.open() (el modal con las 3 tarjetas).
 *
 * Capa 100% ADITIVA: no modifica ajustes-modal.js, suscripcion-
 * modal.js ni sus CSS. Se engancha por fuera envolviendo
 * window.recoAjustes.open, igual que ajustes-empresa.js — por eso
 * DEBE cargarse DESPUÉS de ajustes-modal.js y de suscripcion-
 * planes.js / suscripcion-modal.js (en cualquier orden respecto a
 * ajustes-empresa.js, si existe).
 *
 * REQUIERE, en cualquier página con ajustes-modal.js:
 *   <link rel="stylesheet" href="suscripcion-modal.css">
 *   ...
 *   <script src="ajustes-modal.js"></script>
 *   <script src="suscripcion-planes.js"></script>
 *   <script src="suscripcion-modal.js"></script>
 *   <script src="ajustes-suscripcion.js"></script>
 * (usa window.recoAuth, window.recoSupabase, window.recoPlanes y
 * window.recoSuscripcion ya inicializados)
 */
(function () {
  'use strict';

  var TAB_KEY = 'miplan';
  var tabInjected = false;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  var ICON_PLAN = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5l6 2.2v4.6c0 4-2.6 6.8-6 8.2-3.4-1.4-6-4.2-6-8.2V4.7z"/><path d="M7.3 10l1.9 1.9L13 8"/></svg>';
  var CHECK_SVG = '<svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.2l3 3 6-6.4"/></svg>';

  /* ══════════════════════════════════════════════
     LECTURA: uso de escaneos IA hoy (RPC escaneos_ia_hoy)
     ══════════════════════════════════════════════ */
  function fetchUsoIA(userId) {
    if (!window.recoSupabase) return Promise.resolve(null);
    return window.recoSupabase.rpc('escaneos_ia_hoy', { uid: userId })
      .then(function (res) {
        if (res.error || typeof res.data !== 'number') return null;
        return res.data;
      })
      .catch(function () { return null; });
  }

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  function renderSeccionPlan(planId, usados) {
    var plan = window.recoPlanes.getPlan(planId);
    var esIlimitado = plan.escaneosIaPorDia === -1;

    var usoHTML;
    if (esIlimitado) {
      usoHTML =
        '<div class="susc-uso"><div class="susc-uso__label">' +
          '<span>Escaneos con IA hoy</span><span>Ilimitados ∞</span>' +
        '</div></div>';
    } else if (usados === null) {
      usoHTML =
        '<div class="susc-uso"><div class="susc-uso__label">' +
          '<span>Escaneos con IA hoy</span><span>—</span>' +
        '</div></div>';
    } else {
      var pct = Math.min(100, Math.round((usados / plan.escaneosIaPorDia) * 100));
      var lleno = usados >= plan.escaneosIaPorDia;
      usoHTML =
        '<div class="susc-uso">' +
          '<div class="susc-uso__label"><span>Escaneos con IA hoy</span><span>' + usados + ' / ' + plan.escaneosIaPorDia + '</span></div>' +
          '<div class="susc-uso__track"><div class="susc-uso__bar' + (lleno ? ' susc-uso__bar--lleno' : '') + '" style="width:' + pct + '%"></div></div>' +
        '</div>';
    }

    var beneficiosHTML = plan.beneficios.map(function (b) {
      return '<li>' + CHECK_SVG + '<span>' + b + '</span></li>';
    }).join('');

    return (
      '<section class="ajustes-section" data-section="' + TAB_KEY + '">' +
        '<div class="susc-resumen">' +
          '<span class="susc-resumen__icon">' + plan.icono + '</span>' +
          '<div class="susc-resumen__texto">' +
            '<div class="susc-resumen__titulo">Tu plan actual: ' + plan.nombre + '</div>' +
            '<div class="susc-resumen__desc">' + plan.precioLabel + '</div>' +
          '</div>' +
        '</div>' +
        usoHTML +
        '<ul class="susc-plan__beneficios" style="margin-top:16px">' + beneficiosHTML + '</ul>' +
        '<div style="margin-top:16px">' +
          '<button type="button" class="ajustes-btn ajustes-btn--primario" id="ajplanCambiarBtn">Cambiar de plan</button>' +
        '</div>' +
      '</section>'
    );
  }

  /* ══════════════════════════════════════════════
     INYECCIÓN / RETIRO de la pestaña (mismo patrón que
     ajustes-empresa.js: se apoya en el overlay/tabs/panel que
     ajustes-modal.js ya construyó).
     ══════════════════════════════════════════════ */
  function insertarPestanaPlan(overlay, planId, usados) {
    var tabsNav = overlay.querySelector('.ajustes-modal__tabs');
    var panel = overlay.querySelector('.ajustes-modal__panel');
    if (!tabsNav || !panel) return;

    var tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'ajustes-tab';
    tabBtn.setAttribute('data-tab', TAB_KEY);
    tabBtn.setAttribute('data-active', 'false');
    tabBtn.innerHTML = ICON_PLAN + '<span>Mi plan</span>';
    tabsNav.appendChild(tabBtn);

    var wrapper = document.createElement('div');
    wrapper.innerHTML = renderSeccionPlan(planId, usados);
    var seccionEl = wrapper.firstElementChild;
    panel.appendChild(seccionEl);

    tabBtn.addEventListener('click', function () {
      overlay.querySelectorAll('.ajustes-tab').forEach(function (t) {
        t.setAttribute('data-active', t === tabBtn ? 'true' : 'false');
      });
      overlay.querySelectorAll('.ajustes-section').forEach(function (s) {
        s.setAttribute('data-active', s === seccionEl ? 'true' : 'false');
      });
    });

    var cambiarBtn = seccionEl.querySelector('#ajplanCambiarBtn');
    if (cambiarBtn) {
      cambiarBtn.addEventListener('click', function () {
        if (window.recoAjustes && typeof window.recoAjustes.close === 'function') window.recoAjustes.close();
        if (window.recoSuscripcion && typeof window.recoSuscripcion.open === 'function') window.recoSuscripcion.open();
      });
    }

    tabInjected = true;
  }

  function quitarPestanaPlan() {
    if (!window.__recoAjustesOverlayEl) return;
    var overlay = window.__recoAjustesOverlayEl;
    var tab = overlay.querySelector('.ajustes-tab[data-tab="' + TAB_KEY + '"]');
    var seccion = overlay.querySelector('.ajustes-section[data-section="' + TAB_KEY + '"]');
    if (tab) tab.remove();
    if (seccion) seccion.remove();
    tabInjected = false;
  }

  /* ══════════════════════════════════════════════
     SINCRONIZACIÓN: cada vez que se abre Ajustes, se lee el plan
     actual + el uso de hoy y se inyecta/refresca la pestaña.
     ══════════════════════════════════════════════ */
  function consultarYSincronizar() {
    if (!window.recoAuth || !window.recoSupabase || !window.recoPlanes) return;
    var getSesion = window.recoAuth.getVerifiedSession || window.recoAuth.getSession;

    getSesion().then(function (session) {
      var overlay = window.__recoAjustesOverlayEl;
      if (!overlay) return;

      if (!session || !session.user) {
        if (tabInjected) quitarPestanaPlan();
        return;
      }

      var userId = session.user.id;
      var planPromise = (window.recoSuscripcion && typeof window.recoSuscripcion.getPlanActual === 'function')
        ? window.recoSuscripcion.getPlanActual()
        : Promise.resolve('gratis');

      Promise.all([planPromise, fetchUsoIA(userId)]).then(function (resultados) {
        var planId = resultados[0];
        var usados = resultados[1];

        if (tabInjected) {
          var seccionVieja = overlay.querySelector('.ajustes-section[data-section="' + TAB_KEY + '"]');
          var eraActiva = seccionVieja && seccionVieja.getAttribute('data-active') === 'true';
          quitarPestanaPlan();
          insertarPestanaPlan(overlay, planId, usados);
          if (eraActiva) {
            var tabNueva = overlay.querySelector('.ajustes-tab[data-tab="' + TAB_KEY + '"]');
            if (tabNueva) tabNueva.click();
          }
        } else {
          insertarPestanaPlan(overlay, planId, usados);
        }
      });
    }).catch(function () { /* sin sesión verificable, no se muestra la pestaña */ });
  }

  /* ══════════════════════════════════════════════
     ENGANCHE: envuelve window.recoAjustes.open (mismo patrón que
     ajustes-empresa.js; ambos wrappers conviven sin problema sin
     importar el orden de carga entre ellos).
     ══════════════════════════════════════════════ */
  ready(function () {
    if (!window.recoAjustes || typeof window.recoAjustes.open !== 'function') {
      console.error('[RECO+] recoAjustes no está disponible. Revisa que ajustes-modal.js se cargó antes que ajustes-suscripcion.js.');
      return;
    }

    var openOriginal = window.recoAjustes.open;
    window.recoAjustes.open = function () {
      openOriginal();
      window.__recoAjustesOverlayEl = document.querySelector('.ajustes-overlay');
      consultarYSincronizar();
    };
  });
})();
