/**
 * pago-simulado-modal.js — RECO+
 * ---------------------------------------------------------------
 * Ventana de "pago" para activar el plan Premium. IMPORTANTE: es
 * una DEMO. No se conecta a ninguna pasarela de pago real, no
 * procesa tarjetas, y lo dice de forma explícita y visible en la
 * propia ventana (banner arriba del formulario) — nunca en letra
 * chica ni oculto. El formulario de tarjeta es solo decorativo
 * (inputs deshabilitados): el único control funcional es el botón
 * "Simular pago", que hace upsert directo sobre `suscripciones`
 * (Supabase) con plan='premium' y metodo_pago='simulado', igual que
 * ya hace suscripcion-modal.js con cualquier plan pago — este modal
 * simplemente ofrece la MISMA acción con la forma visual de un
 * checkout, para los flujos donde se interrumpe una acción
 * (subir video, escaneo IA) porque falta Premium.
 *
 * Usa su PROPIO overlay/modal (.psim-overlay, .psim-modal, etc. —
 * ver pago-simulado-modal.css) en vez de las clases .rae-* de
 * alianzas-registro-modal.css, porque ese archivo solo se carga en
 * alianzas.html y este modal se abre desde otras páginas.
 *
 * Se abre desde cualquier página con:
 *   window.recoPagoSimulado.open({ motivo: 'Para subir videos...' })
 *
 * También expone un helper de "gate" para no repetir la lógica de
 * chequear el plan en cada sitio que lo necesite:
 *   window.recoPagoSimulado.requierePremium(function () {
 *     // esto se ejecuta SOLO si el usuario ya es Premium
 *   }, { motivo: 'Para subir videos necesitas el plan Premium.' });
 * Si no es Premium, en vez de ejecutar el callback abre este modal.
 *
 * REQUIERE, en cualquier página:
 *   <link rel="stylesheet" href="pago-simulado-modal.css">
 *   ...
 *   <script src="auth.js"></script>
 *   <script src="suscripcion-planes.js"></script>
 *   <script src="suscripcion-modal.js"></script>
 *   <script src="pago-simulado-modal.js"></script>
 * (usa window.recoAuth, window.recoSupabase, window.recoPlanes y
 * window.recoSuscripcion ya inicializados)
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

  var overlayEl = null;
  var modalBuilt = false;

  /* ══════════════════════════════════════════════
     CONSTRUCCIÓN DEL MODAL
     ══════════════════════════════════════════════ */
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'psim-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="psim-modal" role="dialog" aria-modal="true" aria-labelledby="psimTitulo">' +
        '<div class="psim-modal__header">' +
          '<div>' +
            '<p class="psim-modal__kicker">RECO+ · Modo demo</p>' +
            '<h2 class="psim-modal__title" id="psimTitulo">Activar Premium</h2>' +
          '</div>' +
          '<button type="button" class="psim-modal__close" id="psimClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="psim-modal__body" id="psimBody">' +
          '<div class="psim-banner">' +
            '<span class="psim-banner__icon">🧪</span>' +
            '<span class="psim-banner__texto">' +
              '<span class="psim-banner__titulo">Esto es una simulación</span>' +
              'RECO+ todavía no tiene una pasarela de pago real conectada. Esta pantalla NO cobra nada de tu tarjeta: es solo una demostración de cómo se vería el flujo, para poder probar las funciones Premium del proyecto.' +
            '</span>' +
          '</div>' +
          '<div class="psim-resumen" id="psimResumen"></div>' +
          '<div class="psim-form">' +
            '<div class="psim-field">' +
              '<label for="psimNombre">Nombre en la tarjeta</label>' +
              '<input type="text" id="psimNombre" class="psim-input" placeholder="No se usará — este campo es solo visual" disabled>' +
            '</div>' +
            '<div class="psim-field">' +
              '<label for="psimNumero">Número de tarjeta</label>' +
              '<input type="text" id="psimNumero" class="psim-input" placeholder="•••• •••• •••• ••••" disabled>' +
            '</div>' +
            '<div class="psim-row">' +
              '<div class="psim-field">' +
                '<label for="psimVenc">Vencimiento</label>' +
                '<input type="text" id="psimVenc" class="psim-input" placeholder="MM/AA" disabled>' +
              '</div>' +
              '<div class="psim-field">' +
                '<label for="psimCvv">CVV</label>' +
                '<input type="text" id="psimCvv" class="psim-input" placeholder="•••" disabled>' +
              '</div>' +
            '</div>' +
            '<p class="psim-hint">Los campos de arriba están deshabilitados a propósito: ningún dato de tarjeta se envía ni se guarda. Usa el botón de abajo para simular el pago y activar Premium al instante.</p>' +
            '<button type="button" class="psim-submit-btn" id="psimSubmitBtn">Simular pago y activar Premium</button>' +
            '<button type="button" class="psim-cancelar-btn" id="psimCancelBtn">Cancelar</button>' +
          '</div>' +
        '</div>' +
        '<div class="psim-modal__status" id="psimStatus"></div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayEl = overlay;

    function cerrar() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }
    overlay.querySelector('#psimClose').addEventListener('click', cerrar);
    overlay.querySelector('#psimCancelBtn').addEventListener('click', cerrar);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') cerrar();
    });

    overlay.querySelector('#psimSubmitBtn').addEventListener('click', confirmarPagoSimulado);

    modalBuilt = true;
  }

  function mostrarStatus(tipo, mensaje) {
    var status = overlayEl.querySelector('#psimStatus');
    status.textContent = mensaje;
    status.setAttribute('data-tipo', tipo);
    status.setAttribute('data-visible', 'true');
    setTimeout(function () { status.setAttribute('data-visible', 'false'); }, 4000);
  }

  function renderResumen(motivo) {
    var plan = window.recoPlanes ? window.recoPlanes.getPlan('premium') : null;
    var el = overlayEl.querySelector('#psimResumen');
    if (!plan) {
      el.innerHTML = '';
      return;
    }
    el.innerHTML =
      '<span class="psim-resumen__icon">' + plan.icono + '</span>' +
      '<div>' +
        '<div class="psim-resumen__titulo">Plan ' + plan.nombre + '</div>' +
        '<div class="psim-resumen__precio">' + plan.precioLabel + ' (simulado) · ' + (motivo || 'Desbloquea todas las funciones Premium.') + '</div>' +
      '</div>';
  }

  /* ══════════════════════════════════════════════
     CONFIRMAR "PAGO" (upsert simulado, igual que
     suscripcion-modal.js con cualquier plan pago)
     ══════════════════════════════════════════════ */
  function confirmarPagoSimulado() {
    if (!window.recoAuth) return;

    var btn = overlayEl.querySelector('#psimSubmitBtn');
    var textoOriginal = btn.textContent;

    window.recoAuth.getVerifiedSession().then(function (sesion) {
      var userId = sesion && sesion.user && sesion.user.id;
      if (!userId) {
        mostrarStatus('error', 'Inicia sesión para activar Premium.');
        return;
      }

      var client = window.recoSupabase;
      if (!client) {
        mostrarStatus('error', 'No se pudo conectar con el servicio. Intenta de nuevo más tarde.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Simulando pago…';

      var vigenteHasta = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      client.from('suscripciones')
        .upsert({
          user_id: userId,
          plan: 'premium',
          vigente_hasta: vigenteHasta,
          metodo_pago: 'simulado'
        }, { onConflict: 'user_id' })
        .then(function (res) {
          btn.disabled = false;
          btn.textContent = textoOriginal;

          if (res.error) {
            mostrarStatus('error', 'No se pudo activar Premium. Intenta de nuevo.');
            return;
          }

          mostrarStatus('ok', '✓ Pago simulado — ¡ahora tienes Premium!');
          if (window.recoSuscripcion) {
            // Avisa a cualquier otra parte del sitio ya abierta (barra
            // de plan en Ajustes, etc.) que el plan cambió, igual que
            // hace suscripcion-modal.js.
            window.recoSuscripcion.getPlanActual(); // refresca caché si aplica
          }
          onActivadoCallbacks.forEach(function (cb) { try { cb(); } catch (e) {} });
          setTimeout(closeModal, 1200);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = textoOriginal;
          mostrarStatus('error', 'Ocurrió un problema de conexión. Intenta de nuevo.');
        });
    });
  }

  /* ══════════════════════════════════════════════
     ABRIR / CERRAR
     ══════════════════════════════════════════════ */
  var onActivadoCallbacks = [];

  function openModal(opts) {
    opts = opts || {};
    if (!modalBuilt) buildModal();
    overlayEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    renderResumen(opts.motivo);
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  /* ══════════════════════════════════════════════
     HELPER DE GATE: requierePremium(callback, opts)
     Chequea el plan actual; si ya es Premium ejecuta el callback
     directo. Si no, abre este modal en vez de ejecutarlo. Pensado
     para envolver acciones puntuales (subir video, escaneo IA)
     sin que cada script tenga que repetir la consulta a Supabase.
     ══════════════════════════════════════════════ */
  function requierePremium(callback, opts) {
    opts = opts || {};
    if (!window.recoSuscripcion) {
      // Si el sistema de suscripciones no está cargado en esta
      // página, no se puede verificar el plan: se deja pasar para
      // no romper funcionalidad existente en páginas que aún no
      // integran el sistema de planes.
      callback();
      return;
    }
    window.recoSuscripcion.getPlanActual().then(function (planId) {
      if (planId === 'premium') {
        callback();
      } else {
        openModal({ motivo: opts.motivo });
      }
    });
  }

  window.recoPagoSimulado = {
    open: openModal,
    close: closeModal,
    requierePremium: requierePremium,
    onActivado: function (cb) { if (typeof cb === 'function') onActivadoCallbacks.push(cb); }
  };
})();
