/**
 * suscripcion-modal.js — RECO+
 * ---------------------------------------------------------------
 * Ventana modal "Mi plan RECO+": muestra las 3 tarjetas de plan
 * (Gratis / Básico / Premium — ver suscripcion-planes.js) y permite
 * "suscribirse" a Básico o Premium con un solo clic.
 *
 * SIN PASARELA DE PAGO REAL TODAVÍA: el botón "Suscribirme" hace un
 * upsert directo sobre la tabla `suscripciones` de Supabase,
 * simulando el cobro con vigente_hasta = ahora + 30 días. El día
 * que se integre Stripe/otra pasarela, solo hay que reemplazar la
 * función confirmarSuscripcion() de abajo por la llamada real (o un
 * webhook) — el resto del modal, los límites del escáner/campañas y
 * la barra de aliados destacados no necesitan cambiar.
 *
 * Se puede abrir desde cualquier página con:
 *   window.recoSuscripcion.open()
 * (ej. desde campanas-modal.js cuando se alcanza el límite del
 * plan, o desde reciclar-scanner.js cuando se acaban los escaneos
 * IA del día, o desde un botón "Ver planes" en cualquier página).
 *
 * REQUIERE, en cualquier página:
 *   <link rel="stylesheet" href="alianzas-registro-modal.css">
 *   <link rel="stylesheet" href="suscripcion-modal.css">
 *   ...
 *   <script src="auth.js"></script>
 *   <script src="suscripcion-planes.js"></script>
 *   <script src="suscripcion-modal.js"></script>
 * (usa window.recoAuth, window.recoSupabase y window.recoPlanes ya
 * inicializados)
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

  var CHECK_SVG = '<svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.2l3 3 6-6.4"/></svg>';

  var overlayEl = null;
  var modalBuilt = false;
  var planActual = 'gratis'; // se refresca cada vez que se abre el modal
  var onPlanChangeCallbacks = [];

  /* ══════════════════════════════════════════════
     LECTURA DEL PLAN ACTUAL (Supabase, con caché corta)
     ══════════════════════════════════════════════ */

  // Se expone para que otros scripts (ajustes-modal.js/pestaña "Mi
  // plan", campanas-modal.js, reciclar-scanner.js) puedan consultar
  // el plan vigente del usuario sin duplicar la lógica de consulta.
  function fetchPlanActual() {
    if (!window.recoAuth || !window.recoSupabase) return Promise.resolve('gratis');

    return window.recoAuth.getVerifiedSession().then(function (sesion) {
      var userId = sesion && sesion.user && sesion.user.id;
      if (!userId) return 'gratis';

      return window.recoSupabase
        .from('suscripciones')
        .select('plan, vigente_hasta')
        .eq('user_id', userId)
        .maybeSingle()
        .then(function (res) {
          if (res.error || !res.data) return 'gratis';
          var fila = res.data;
          if (fila.plan === 'gratis') return 'gratis';
          if (fila.vigente_hasta && new Date(fila.vigente_hasta) < new Date()) return 'gratis';
          return fila.plan;
        })
        .catch(function () { return 'gratis'; });
    }).catch(function () { return 'gratis'; });
  }

  /* ══════════════════════════════════════════════
     CONSTRUCCIÓN DEL MODAL
     ══════════════════════════════════════════════ */
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="suscTitulo" style="max-width:760px">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker">RECO+</p>' +
            '<h2 class="rae-modal__title" id="suscTitulo">Mi plan</h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="suscClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__body" id="suscBody">' +
          '<div class="susc-resumen" id="suscResumen"></div>' +
          '<div class="susc-planes-grid" id="suscGrid"></div>' +
          '<p class="rae-hint" style="margin-top:12px">Los planes de pago se activan al instante. Por ahora no hay cobro real: es una simulación mientras se integra la pasarela de pago.</p>' +
        '</div>' +
        '<div class="rae-modal__status" id="suscStatus"></div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayEl = overlay;

    function cerrar() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }
    overlay.querySelector('#suscClose').addEventListener('click', cerrar);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') cerrar();
    });

    modalBuilt = true;
  }

  function renderResumen() {
    var el = overlayEl.querySelector('#suscResumen');
    var plan = window.recoPlanes.getPlan(planActual);
    el.innerHTML =
      '<span class="susc-resumen__icon">' + plan.icono + '</span>' +
      '<div class="susc-resumen__texto">' +
        '<div class="susc-resumen__titulo">Tu plan actual: ' + plan.nombre + '</div>' +
        '<div class="susc-resumen__desc">' + plan.beneficios.join(' · ') + '</div>' +
      '</div>';
  }

  function renderPlanCard(plan) {
    var esActual = plan.id === planActual;
    var claseExtra = esActual ? ' susc-plan--actual' : (plan.id === 'premium' ? ' susc-plan--destacado' : '');
    var ribbon = plan.id === 'premium' ? '<span class="susc-plan__ribbon">Más completo</span>' : '';

    var beneficiosHTML = plan.beneficios.map(function (b) {
      return '<li>' + CHECK_SVG + '<span>' + b + '</span></li>';
    }).join('');

    var btnTexto = esActual ? 'Tu plan actual' : (plan.id === 'gratis' ? 'Volver a Gratis' : 'Suscribirme');
    var btnDisabled = esActual ? 'disabled' : '';

    return (
      '<div class="susc-plan' + claseExtra + '" data-plan-id="' + plan.id + '">' +
        ribbon +
        '<span class="susc-plan__icon">' + plan.icono + '</span>' +
        '<h3 class="susc-plan__nombre">' + plan.nombre + '</h3>' +
        '<div class="susc-plan__precio">' + plan.precioLabel + '</div>' +
        '<ul class="susc-plan__beneficios">' + beneficiosHTML + '</ul>' +
        '<button type="button" class="susc-plan__btn" data-elegir-plan="' + plan.id + '" ' + btnDisabled + '>' + btnTexto + '</button>' +
      '</div>'
    );
  }

  function renderGrid() {
    var grid = overlayEl.querySelector('#suscGrid');
    grid.innerHTML = window.recoPlanes.ORDEN.map(function (id) {
      return renderPlanCard(window.recoPlanes.getPlan(id));
    }).join('');

    grid.querySelectorAll('[data-elegir-plan]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        elegirPlan(btn.getAttribute('data-elegir-plan'), btn);
      });
    });
  }

  function mostrarStatus(tipo, mensaje) {
    var status = overlayEl.querySelector('#suscStatus');
    status.textContent = mensaje;
    status.setAttribute('data-tipo', tipo);
    status.setAttribute('data-visible', 'true');
    setTimeout(function () { status.setAttribute('data-visible', 'false'); }, 4000);
  }

  /* ══════════════════════════════════════════════
     ELEGIR / CONFIRMAR PLAN (upsert simulado)
     ══════════════════════════════════════════════ */
  function elegirPlan(planId, btnOrigen) {
    if (!window.recoAuth) return;

    window.recoAuth.getVerifiedSession().then(function (sesion) {
      var userId = sesion && sesion.user && sesion.user.id;
      if (!userId) {
        mostrarStatus('error', 'Inicia sesión para elegir un plan.');
        return;
      }

      var client = window.recoSupabase;
      if (!client) {
        mostrarStatus('error', 'No se pudo conectar con el servicio. Intenta de nuevo más tarde.');
        return;
      }

      var textoOriginal = btnOrigen.textContent;
      btnOrigen.disabled = true;
      btnOrigen.textContent = 'Aplicando…';

      var vigenteHasta = planId === 'gratis'
        ? null
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      client.from('suscripciones')
        .upsert({
          user_id: userId,
          plan: planId,
          vigente_hasta: vigenteHasta,
          metodo_pago: 'simulado'
        }, { onConflict: 'user_id' })
        .then(function (res) {
          btnOrigen.disabled = false;
          btnOrigen.textContent = textoOriginal;

          if (res.error) {
            mostrarStatus('error', 'No se pudo actualizar tu plan. Intenta de nuevo.');
            return;
          }

          planActual = planId;
          renderResumen();
          renderGrid();
          mostrarStatus('ok', '✓ Tu plan ahora es ' + window.recoPlanes.getPlan(planId).nombre + '.');
          onPlanChangeCallbacks.forEach(function (cb) { try { cb(planId); } catch (e) {} });
        })
        .catch(function () {
          btnOrigen.disabled = false;
          btnOrigen.textContent = textoOriginal;
          mostrarStatus('error', 'Ocurrió un problema de conexión. Intenta de nuevo.');
        });
    });
  }

  /* ══════════════════════════════════════════════
     ABRIR / CERRAR
     ══════════════════════════════════════════════ */
  function openModal() {
    if (!modalBuilt) buildModal();
    overlayEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';

    var resumen = overlayEl.querySelector('#suscResumen');
    resumen.innerHTML = '<span class="susc-resumen__icon">⏳</span><div class="susc-resumen__texto"><div class="susc-resumen__titulo">Cargando tu plan…</div></div>';

    fetchPlanActual().then(function (plan) {
      planActual = plan;
      renderResumen();
      renderGrid();
    });
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  window.recoSuscripcion = {
    open: openModal,
    close: closeModal,
    // Para que otros scripts (ajustes-empresa "Mi plan", el escáner,
    // campanas-modal) puedan leer el plan vigente sin reabrir el
    // modal ni duplicar la consulta a Supabase.
    getPlanActual: fetchPlanActual,
    onPlanChange: function (cb) { if (typeof cb === 'function') onPlanChangeCallbacks.push(cb); }
  };

  /* ══════════════════════════════════════════════
     ENGANCHE: cualquier elemento con [data-abrir-suscripcion]
     abre este modal (ej. un botón "Ver planes" en Ajustes o en
     el aviso de límite alcanzado del escáner/campañas).
     ══════════════════════════════════════════════ */
  ready(function () {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-abrir-suscripcion]');
      if (trigger) {
        e.preventDefault();
        openModal();
      }
    });
  });
})();
