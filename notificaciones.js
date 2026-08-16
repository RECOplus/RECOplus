/**
 * notificaciones.js — Sistema de notificaciones de RECO+.
 * Capa 100% ADITIVA: no modifica navbar.js/navbar-auth.js, solo
 * actúa sobre el DOM ya renderizado por ellos.
 *
 * QUÉ HACE:
 * - Si hay sesión activa: inyecta una campana 🔔 con badge de
 *   conteo en .bubble-nav__actions, justo antes del chip de usuario
 *   (o del link de login si navbar-auth.js aún no corrió).
 * - Al hacer click, abre un dropdown liquid glass con la lista de
 *   notificaciones (más recientes primero), separadas visualmente
 *   en "no leídas" / "leídas".
 * - Se suscribe a Supabase Realtime (tabla `notificaciones`, filtro
 *   por user_id) para que las notificaciones nuevas aparezcan al
 *   instante sin recargar ni hacer polling.
 * - Al hacer click en una notificación: la marca como leída, y si
 *   tiene `enlace`, navega ahí.
 * - "Marcar todas como leídas" en el header del dropdown.
 *
 * REQUIERE, en este orden, en CADA página que use la navbar:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   ...
 *   <script src="navbar.js"></script>
 *   <script src="navbar-auth.js"></script>
 *   <script src="notificaciones.js"></script>
 * y el CSS:
 *   <link rel="stylesheet" href="notificaciones.css">
 *
 * REQUIERE en Supabase: haber corrido supabase-notificaciones.sql
 * (tabla `notificaciones` + Realtime habilitado sobre ella).
 */
(function () {
  'use strict';

  var MAX_VISIBLES = 30;
  var bellWrapEl = null;
  var listaEl = null;
  var badgeEl = null;
  var notificaciones = [];
  var sesionActual = null;
  var canalRealtime = null;
  var cargando = false;

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

  /* ══════════════════════════════════════════════
     CATÁLOGO DE TIPOS — ícono + color por `tipo`
     (debe reflejar el enum tipo_notificacion del SQL)
     ══════════════════════════════════════════════ */
  var NOTIF_TIPOS = {
    empresa_aprobada:     { icono: '✅', clase: 'ok' },
    empresa_rechazada:    { icono: '⚠️', clase: 'warn' },
    video_aprobado:       { icono: '🎬', clase: 'ok' },
    video_rechazado:      { icono: '⚠️', clase: 'warn' },
    nuevo_comentario:     { icono: '💬', clase: 'info' },
    nueva_alianza:        { icono: '🤝', clase: 'info' },
    interes_donacion:     { icono: '💚', clase: 'info' },
    donacion_completada:  { icono: '📦', clase: 'ok' },
    nueva_campana:        { icono: '📢', clase: 'info' },
    sistema:              { icono: '🔔', clase: 'info' }
  };

  function getTipoInfo(tipo) {
    return NOTIF_TIPOS[tipo] || NOTIF_TIPOS.sistema;
  }

  /* ══════════════════════════════════════════════
     TIEMPO RELATIVO (ej. "hace 5 min")
     ══════════════════════════════════════════════ */
  function tiempoRelativo(fechaIso) {
    var ahora = Date.now();
    var fecha = new Date(fechaIso).getTime();
    var seg = Math.max(0, Math.floor((ahora - fecha) / 1000));

    if (seg < 60) return tr('notif.tiempo.ahora', 'Ahora');
    var min = Math.floor(seg / 60);
    if (min < 60) return min + tr('notif.tiempo.min', 'min');
    var hrs = Math.floor(min / 60);
    if (hrs < 24) return hrs + tr('notif.tiempo.hr', 'h');
    var dias = Math.floor(hrs / 24);
    if (dias < 7) return dias + tr('notif.tiempo.dia', 'd');
    var semanas = Math.floor(dias / 7);
    if (semanas < 5) return semanas + tr('notif.tiempo.semana', 'sem');
    var meses = Math.floor(dias / 30);
    return meses + tr('notif.tiempo.mes', 'mes');
  }

  /* ══════════════════════════════════════════════
     INYECTAR CAMPANA EN LA NAVBAR
     ══════════════════════════════════════════════ */
  function findInsertPoint() {
    var actions = document.querySelector('.bubble-nav__actions');
    if (!actions) return null;
    // Preferimos insertar justo antes del chip de usuario (si ya lo
    // pintó navbar-auth.js); si no, antes del link/CTA de login.
    var chip = actions.querySelector('.nav-user');
    if (chip) return { actions: actions, before: chip };
    var loginLink = actions.querySelector('a[href*="login.html"]');
    if (loginLink) return { actions: actions, before: loginLink };
    return { actions: actions, before: null };
  }

  function buildBell() {
    var wrap = document.createElement('div');
    wrap.className = 'notif-bell';
    wrap.setAttribute('data-open', 'false');

    wrap.innerHTML =
      '<button class="notif-bell__btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Notificaciones">' +
        '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8a5 5 0 0110 0c0 3.2 1 4.6 1.6 5.3.3.3.1.9-.4.9H3.8c-.5 0-.7-.6-.4-.9C4 12.6 5 11.2 5 8z"/><path d="M8 16.5a2 2 0 004 0"/></svg>' +
        '<span class="notif-bell__badge" id="notifBadge" style="display:none">0</span>' +
      '</button>' +
      '<div class="notif-panel" role="menu">' +
        '<div class="notif-panel__header">' +
          '<span data-i18n="notif.titulo">Notificaciones</span>' +
          '<button type="button" class="notif-panel__markall" id="notifMarkAll" data-i18n="notif.marcarTodas">Marcar todas como leídas</button>' +
        '</div>' +
        '<div class="notif-panel__list" id="notifList">' +
          '<div class="notif-panel__empty" data-i18n="notif.vacio">No tienes notificaciones todavía.</div>' +
        '</div>' +
      '</div>';

    var btn = wrap.querySelector('.notif-bell__btn');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = wrap.getAttribute('data-open') === 'true';
      wrap.setAttribute('data-open', isOpen ? 'false' : 'true');
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });

    document.addEventListener('click', function () {
      wrap.setAttribute('data-open', 'false');
      btn.setAttribute('aria-expanded', 'false');
    });
    wrap.querySelector('.notif-panel').addEventListener('click', function (e) {
      e.stopPropagation();
    });

    wrap.querySelector('#notifMarkAll').addEventListener('click', marcarTodasLeidas);

    badgeEl = wrap.querySelector('#notifBadge');
    listaEl = wrap.querySelector('#notifList');
    bellWrapEl = wrap;

    return wrap;
  }

  function injectBell() {
    if (document.querySelector('.notif-bell')) return; // ya inyectada
    var point = findInsertPoint();
    if (!point) return;
    var bell = buildBell();
    if (point.before) {
      point.actions.insertBefore(bell, point.before);
    } else {
      point.actions.appendChild(bell);
    }
    if (typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }
  }

  function removeBell() {
    var bell = document.querySelector('.notif-bell');
    if (bell) bell.remove();
    bellWrapEl = null;
    listaEl = null;
    badgeEl = null;
  }

  /* ══════════════════════════════════════════════
     RENDER DE LA LISTA
     ══════════════════════════════════════════════ */
  function iconoHtml(tipo) {
    var info = getTipoInfo(tipo);
    return '<span class="notif-item__icon notif-item__icon--' + info.clase + '">' + info.icono + '</span>';
  }

  function renderLista() {
    if (!listaEl) return;

    if (!notificaciones.length) {
      listaEl.innerHTML = '<div class="notif-panel__empty" data-i18n="notif.vacio">No tienes notificaciones todavía.</div>';
      if (typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
        window.applyLang(window.currentLang());
      }
      return;
    }

    listaEl.innerHTML = notificaciones.slice(0, MAX_VISIBLES).map(function (n) {
      return (
        '<button type="button" class="notif-item' + (n.leida ? '' : ' notif-item--unread') + '" data-notif-id="' + n.id + '" data-enlace="' + (n.enlace ? n.enlace.replace(/"/g, '&quot;') : '') + '">' +
          iconoHtml(n.tipo) +
          '<span class="notif-item__body">' +
            '<span class="notif-item__title">' + escHtml(n.titulo) + '</span>' +
            (n.mensaje ? '<span class="notif-item__msg">' + escHtml(n.mensaje) + '</span>' : '') +
            '<span class="notif-item__time">' + tiempoRelativo(n.created_at) + '</span>' +
          '</span>' +
          (n.leida ? '' : '<span class="notif-item__dot" aria-hidden="true"></span>') +
        '</button>'
      );
    }).join('');
  }

  function escHtml(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function actualizarBadge() {
    if (!badgeEl) return;
    var noLeidas = notificaciones.filter(function (n) { return !n.leida; }).length;
    if (noLeidas > 0) {
      badgeEl.textContent = noLeidas > 99 ? '99+' : String(noLeidas);
      badgeEl.style.display = '';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  /* ══════════════════════════════════════════════
     CARGA INICIAL DESDE SUPABASE
     ══════════════════════════════════════════════ */
  function cargarNotificaciones(userId) {
    if (!window.recoSupabase || cargando) return Promise.resolve();
    cargando = true;
    return window.recoSupabase
      .from('notificaciones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_VISIBLES)
      .then(function (res) {
        cargando = false;
        if (res.error) {
          console.error('[RECO+] Error cargando notificaciones:', res.error.message);
          return;
        }
        notificaciones = res.data || [];
        renderLista();
        actualizarBadge();
      })
      .catch(function () { cargando = false; });
  }

  /* ══════════════════════════════════════════════
     ACCIONES: click en una notificación / marcar todas
     ══════════════════════════════════════════════ */
  function marcarComoLeida(id) {
    var n = notificaciones.find(function (x) { return String(x.id) === String(id); });
    if (!n || n.leida) return;
    n.leida = true;
    renderLista();
    actualizarBadge();

    if (!window.recoSupabase) return;
    window.recoSupabase.from('notificaciones').update({ leida: true }).eq('id', id).then(function () {});
  }

  function marcarTodasLeidas() {
    var idsNoLeidas = notificaciones.filter(function (n) { return !n.leida; }).map(function (n) { return n.id; });
    if (!idsNoLeidas.length) return;

    notificaciones.forEach(function (n) { n.leida = true; });
    renderLista();
    actualizarBadge();

    if (!window.recoSupabase || !sesionActual) return;
    window.recoSupabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('user_id', sesionActual.user.id)
      .in('id', idsNoLeidas)
      .then(function () {});
  }

  function onClickLista(e) {
    var item = e.target.closest('.notif-item');
    if (!item) return;
    var id = item.getAttribute('data-notif-id');
    var enlace = item.getAttribute('data-enlace');
    marcarComoLeida(id);
    if (enlace) {
      window.location.href = enlace;
    }
  }

  /* ══════════════════════════════════════════════
     REALTIME — nuevas notificaciones sin recargar
     ══════════════════════════════════════════════ */
  function suscribirRealtime(userId) {
    if (!window.recoSupabase || canalRealtime) return;

    canalRealtime = window.recoSupabase
      .channel('notificaciones-' + userId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: 'user_id=eq.' + userId },
        function (payload) {
          notificaciones.unshift(payload.new);
          if (notificaciones.length > MAX_VISIBLES) notificaciones.length = MAX_VISIBLES;
          renderLista();
          actualizarBadge();
          pulsarCampana();
        }
      )
      .subscribe();
  }

  function desuscribirRealtime() {
    if (canalRealtime && window.recoSupabase) {
      window.recoSupabase.removeChannel(canalRealtime);
    }
    canalRealtime = null;
  }

  function pulsarCampana() {
    if (!bellWrapEl) return;
    var btn = bellWrapEl.querySelector('.notif-bell__btn');
    if (!btn) return;
    btn.classList.add('notif-bell__btn--pulse');
    setTimeout(function () { btn.classList.remove('notif-bell__btn--pulse'); }, 700);
  }

  /* ══════════════════════════════════════════════
     APLICAR SESIÓN (mismo patrón que navbar-auth.js)
     ══════════════════════════════════════════════ */
  function applySession(session) {
    if (session && session.user) {
      sesionActual = session;
      injectBell();
      if (listaEl) listaEl.addEventListener('click', onClickLista);
      cargarNotificaciones(session.user.id).then(function () {
        suscribirRealtime(session.user.id);
      });
    } else {
      sesionActual = null;
      desuscribirRealtime();
      notificaciones = [];
      removeBell();
    }
  }

  ready(function () {
    if (!window.recoAuth) {
      console.error('[RECO+] recoAuth no está disponible. Revisa que auth.js se cargó antes que notificaciones.js.');
      return;
    }

    var getInicial = window.recoAuth.getVerifiedSession || window.recoAuth.getSession;
    getInicial().then(function (session) {
      applySession(session);
    });

    window.recoAuth.onAuthChange(function (session) {
      applySession(session);
    });
  });

  document.addEventListener('reco:langchange', function () {
    if (bellWrapEl && typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }
  });

  // API pública mínima, por si otro módulo necesita forzar un
  // refresco (ej. tras una acción que dispare una notificación
  // propia sin pasar por Realtime).
  window.recoNotificaciones = {
    refrescar: function () {
      if (sesionActual) cargarNotificaciones(sesionActual.user.id);
    }
  };
})();
