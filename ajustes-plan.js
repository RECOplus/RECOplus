/**
 * ajustes-plan.js — Pestaña "Mi plan" dentro del modal de Ajustes
 * (ajustes-modal.js), visible en CUALQUIER página que ya cargue
 * navbar-auth.js + ajustes-modal.js + suscripcion-planes.js +
 * suscripcion-modal.js, para CUALQUIER usuario con sesión activa
 * (a diferencia de "Mi empresa" en ajustes-empresa.js, que solo
 * aparece si el usuario tiene una fila en `aliados` — el plan de
 * suscripción aplica a cualquier cuenta, individuo o empresa).
 *
 * QUÉ MUESTRA:
 * - Tarjeta resumen del plan actual (nombre, ícono, beneficios).
 * - Uso del escáner con IA hoy (X de Y, con barra de progreso —
 *   solo tiene sentido en planes con límite; en Premium se muestra
 *   "Ilimitado").
 * - Botón "Ver y cambiar de plan", que abre el modal completo de
 *   suscripcion-modal.js (mismas 3 tarjetas que ahí, sin duplicar
 *   ese HTML aquí).
 *
 * Sigue el MISMO patrón que ajustes-empresa.js: envuelve
 * window.recoAjustes.open para inyectar su pestaña cada vez que el
 * modal se abre, y localiza el overlay ya construido por
 * ajustes-modal.js. Capa 100% ADITIVA.
 *
 * REQUIERE, en cualquier página con ajustes-modal.js:
 *   <link rel="stylesheet" href="suscripcion-modal.css">
 *   ...
 *   <script src="ajustes-modal.js"></script>
 *   <script src="suscripcion-planes.js"></script>
 *   <script src="suscripcion-modal.js"></script>
 *   <script src="ajustes-plan.js"></script>
 * (usa window.recoAuth, window.recoSupabase, window.recoPlanes y
 * window.recoSuscripcion ya inicializados)
 */
(function () {
  'use strict';

  var TAB_KEY = 'miplan';
  var tabInjected = false;

  var ICON_PLAN = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5l6 2.2v4.6c0 4-2.6 6.8-6 8.2-3.4-1.4-6-4.2-6-8.2V4.7z"/><path d="M7.3 10l1.8 1.8 3.6-3.9"/></svg>';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  function renderSeccionPlan() {
    return (
      '<section class="ajustes-section" data-section="' + TAB_KEY + '">' +
        '<div class="susc-resumen" id="ajplanResumen">' +
          '<span class="susc-resumen__icon">⏳</span>' +
          '<div class="susc-resumen__texto"><div class="susc-resumen__titulo">Cargando tu plan…</div></div>' +
        '</div>' +
        '<div id="ajplanUso"></div>' +
        '<div style="margin-top:16px">' +
          '<button type="button" class="ajustes-btn ajustes-btn--primario" id="ajplanVerBtn">Ver y cambiar de plan</button>' +
        '</div>' +
      '</section>'
    );
  }

  function renderUso(plan, usados) {
    if (plan.escaneosIaPorDia === -1) {
      return (
        '<div class="susc-uso">' +
          '<div class="susc-uso__label"><span>Escaneos con IA hoy</span><span>Ilimitado</span></div>' +
        '</div>'
      );
    }
    var pct = Math.min(100, Math.round((usados / plan.escaneosIaPorDia) * 100));
    var lleno = usados >= plan.escaneosIaPorDia;
    return (
      '<div class="susc-uso">' +
        '<div class="susc-uso__label"><span>Escaneos con IA hoy</span><span>' + usados + ' / ' + plan.escaneosIaPorDia + '</span></div>' +
        '<div class="susc-uso__track"><div class="susc-uso__bar' + (lleno ? ' susc-uso__bar--lleno' : '') + '" style="width:' + pct + '%"></div></div>' +
      '</div>'
    );
  }

  function refrescarContenido(seccionEl, userId) {
    var resumenEl = seccionEl.querySelector('#ajplanResumen');
    var usoEl = seccionEl.querySelector('#ajplanUso');

    window.recoSuscripcion.getPlanActual().then(function (planId) {
      var plan = window.recoPlanes.getPlan(planId);
      resumenEl.innerHTML =
        '<span class="susc-resumen__icon">' + plan.icono + '</span>' +
        '<div class="susc-resumen__texto">' +
          '<div class="susc-resumen__titulo">Plan ' + plan.nombre + '</div>' +
          '<div class="susc-resumen__desc">' + plan.beneficios.join(' · ') + '</div>' +
        '</div>';

      var client = window.recoSupabase;
      if (!client || plan.escaneosIaPorDia === -1) {
        usoEl.innerHTML = renderUso(plan, 0);
        return;
      }

      client.rpc('escaneos_ia_hoy', { uid: userId }).then(function (res) {
        var usados = (!res.error && typeof res.data === 'number') ? res.data : 0;
        usoEl.innerHTML = renderUso(plan, usados);
      }).catch(function () {
        usoEl.innerHTML = renderUso(plan, 0);
      });
    });
  }

  /* ══════════════════════════════════════════════
     INYECCIÓN de la pestaña "Mi plan"
     ══════════════════════════════════════════════ */
  function insertarPestanaPlan(overlay, userId) {
    var tabsNav = overlay.querySelector('.ajustes-modal__tabs');
    var panel = overlay.querySelector('.ajustes-modal__panel');
    if (!tabsNav || !panel) return;

    var tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'ajustes-tab';
    tabBtn.setAttribute('data-tab', TAB_KEY);
    tabBtn.setAttribute('data-active', 'false');
    tabBtn.innerHTML = ICON_PLAN + '<span>Mi plan</span>';
    // "Mi plan" se ubica justo después de "Cuenta" (segunda pestaña),
    // no al final, para que quede visible sin tener que hacer scroll
    // horizontal en la barra de pestañas.
    var tabCuenta = tabsNav.querySelector('.ajustes-tab[data-tab="cuenta"]');
    if (tabCuenta && tabCuenta.nextSibling) {
      tabsNav.insertBefore(tabBtn, tabCuenta.nextSibling);
    } else {
      tabsNav.appendChild(tabBtn);
    }

    var wrapper = document.createElement('div');
    wrapper.innerHTML = renderSeccionPlan();
    var seccionEl = wrapper.firstElementChild;
    panel.appendChild(seccionEl);

    tabBtn.addEventListener('click', function () {
      overlay.querySelectorAll('.ajustes-tab').forEach(function (t) {
        t.setAttribute('data-active', t === tabBtn ? 'true' : 'false');
      });
      overlay.querySelectorAll('.ajustes-section').forEach(function (s) {
        s.setAttribute('data-active', s === seccionEl ? 'true' : 'false');
      });
      refrescarContenido(seccionEl, userId);
    });

    seccionEl.querySelector('#ajplanVerBtn').addEventListener('click', function () {
      window.recoSuscripcion.open();
    });

    refrescarContenido(seccionEl, userId);
    tabInjected = true;

    // Si el usuario cambia de plan desde el modal completo (mientras
    // Ajustes sigue abierto detrás), refresca el resumen sin que el
    // usuario tenga que cerrar y reabrir Ajustes.
    window.recoSuscripcion.onPlanChange(function () {
      refrescarContenido(seccionEl, userId);
    });
  }

  function quitarPestanaPlan(overlay) {
    var tab = overlay.querySelector('.ajustes-tab[data-tab="' + TAB_KEY + '"]');
    var seccion = overlay.querySelector('.ajustes-section[data-section="' + TAB_KEY + '"]');
    if (tab) tab.remove();
    if (seccion) seccion.remove();
    tabInjected = false;
  }

  /* ══════════════════════════════════════════════
     ENGANCHE: envuelve window.recoAjustes.open (mismo patrón que
     ajustes-empresa.js). Se registra DESPUÉS de ese script si
     ambos están presentes, así que el orden en el <head>/<body>
     debe ser: ajustes-modal.js → ajustes-empresa.js → ajustes-plan.js
     (no es estrictamente obligatorio entre empresa/plan, pero
     mantiene el mismo orden de pestañas siempre).
     ══════════════════════════════════════════════ */
  ready(function () {
    if (!window.recoAjustes || typeof window.recoAjustes.open !== 'function') {
      console.error('[RECO+] recoAjustes no está disponible. Revisa que ajustes-modal.js se cargó antes que ajustes-plan.js.');
      return;
    }
    if (!window.recoSuscripcion || !window.recoPlanes) {
      console.error('[RECO+] recoSuscripcion/recoPlanes no están disponibles. Revisa que suscripcion-planes.js y suscripcion-modal.js se cargaron antes que ajustes-plan.js.');
      return;
    }

    var openOriginal = window.recoAjustes.open;
    window.recoAjustes.open = function () {
      openOriginal();
      var overlay = document.querySelector('.ajustes-overlay');
      if (!overlay || !window.recoAuth) return;

      var getSesion = window.recoAuth.getVerifiedSession || window.recoAuth.getSession;
      getSesion().then(function (session) {
        if (!session || !session.user) {
          if (tabInjected) quitarPestanaPlan(overlay);
          return;
        }
        if (!tabInjected) {
          insertarPestanaPlan(overlay, session.user.id);
        } else {
          var seccionEl = overlay.querySelector('.ajustes-section[data-section="' + TAB_KEY + '"]');
          if (seccionEl) refrescarContenido(seccionEl, session.user.id);
        }
      }).catch(function () {});
    };
  });
})();
