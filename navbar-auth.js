/**
 * navbar-auth.js — Refleja el estado de sesión (Supabase Auth) en la
 * bubble navbar de CUALQUIER página del sitio. Capa ADITIVA: no
 * modifica navbar.js ni navbar.css, solo actúa sobre el DOM ya
 * renderizado por ellos.
 *
 * QUÉ HACE:
 * - Si hay sesión activa: busca el link que apunta a "login.html"
 *   dentro de .bubble-nav__actions y lo reemplaza por un chip de
 *   usuario (foto de perfil real si el proveedor la entrega, si no
 *   un círculo con la inicial + nombre) con menú desplegable:
 *   Ajustes, Iniciar con otra cuenta, Cerrar sesión.
 * - Si no hay sesión: no toca nada, la navbar se queda como está
 *   (con su link/CTA de login normal).
 * - Se re-ejecuta ante cualquier cambio de sesión (login en otra
 *   pestaña, logout, expiración de token) vía recoAuth.onAuthChange.
 *
 * REQUIERE, en este orden, en CADA página que use la navbar:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   ...
 *   <script src="navbar.js"></script>
 *   <script src="navbar-auth.js"></script>
 * y el CSS:
 *   <link rel="stylesheet" href="navbar-auth.css">
 *
 * IMPORTANTE — QUÉ BUSCAR SI NO FUNCIONA EN TU index.html:
 * Este script busca, dentro de ".bubble-nav__actions", el primer
 * <a> cuyo href contenga "login.html" (o un botón/elemento con
 * data-nav-login). Si tu link de login en index.html está armado
 * distinto (ej. sin ese href, o con una ruta como "/login"), dime
 * cómo se ve ese fragmento de HTML y ajusto el selector.
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

  function getInitial(name) {
    if (!name) return '?';
    var trimmed = name.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  }

  function getDisplayName(user) {
    if (!user) return '';
    var meta = user.user_metadata || {};
    return meta.nombre || meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'Usuario');
  }

  /* Google/Apple entregan la foto de perfil en distintas claves de
     user_metadata según el proveedor y el momento; probamos todas
     las variantes conocidas antes de caer al avatar con inicial. */
  function getAvatarUrl(user) {
    if (!user) return null;
    var meta = user.user_metadata || {};
    return meta.avatar_url || meta.picture || null;
  }

  function findLoginSlot() {
    var actions = document.querySelector('.bubble-nav__actions');
    if (!actions) return null;

    // 1) Marcador explícito, si algún día lo agregas al HTML:
    var explicit = actions.querySelector('[data-nav-login]');
    if (explicit) return explicit;

    // 2) Cualquier link que apunte a login.html:
    var links = actions.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href').indexOf('login.html') !== -1) {
        return links[i];
      }
    }
    return null;
  }

  function buildAvatarMarkup(user, name) {
    var avatarUrl = getAvatarUrl(user);
    if (avatarUrl) {
      // onerror: si la foto falla al cargar (ej. link caducado de
      // Google), reemplazamos por el círculo con inicial al vuelo
      // para no dejar un ícono roto en la navbar.
      return '<img class="nav-user__avatar nav-user__avatar--photo" src="' + avatarUrl + '" alt="" referrerpolicy="no-referrer" ' +
        'onerror="this.outerHTML=\'<span class=&quot;nav-user__avatar&quot;>' + getInitial(name) + '</span>\'">';
    }
    return '<span class="nav-user__avatar">' + getInitial(name) + '</span>';
  }

  function buildUserChip(user) {
    var name = getDisplayName(user);
    var wrap = document.createElement('div');
    wrap.className = 'nav-user';
    wrap.setAttribute('data-open', 'false');

    wrap.innerHTML =
      '<button class="nav-user__btn" type="button" aria-haspopup="true" aria-expanded="false">' +
        buildAvatarMarkup(user, name) +
        '<span class="nav-user__name">' + name + '</span>' +
        '<svg class="nav-user__chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" width="11" height="11" stroke-linecap="round"><path d="M5 7l5 5 5-5"/></svg>' +
      '</button>' +
      '<div class="nav-user__menu" role="menu">' +
        '<button type="button" class="nav-user__settings" role="menuitem">' +
          '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4M15.1 15.1l-1.4-1.4M6.3 6.3L4.9 4.9"/></svg>' +
          '<span data-i18n="nav.ajustes">Ajustes</span>' +
        '</button>' +
        '<button type="button" class="nav-user__switch" role="menuitem">' +
          '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 6.5L17 10l-3.5 3.5M17 10H7"/><path d="M6.5 13.5L3 10l3.5-3.5M3 10h10"/></svg>' +
          '<span data-i18n="nav.otraCuenta">Iniciar con otra cuenta</span>' +
        '</button>' +
        '<button type="button" class="nav-user__logout" role="menuitem">' +
          '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 17.5H4a1 1 0 01-1-1v-13a1 1 0 011-1h3.5"/><path d="M13.5 14l4-4-4-4M17.2 10H7.5"/></svg>' +
          '<span data-i18n="nav.cerrarSesion">Cerrar sesión</span>' +
        '</button>' +
      '</div>';

    var btn = wrap.querySelector('.nav-user__btn');
    var settingsBtn = wrap.querySelector('.nav-user__settings');
    var switchBtn = wrap.querySelector('.nav-user__switch');
    var logoutBtn = wrap.querySelector('.nav-user__logout');

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

    settingsBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      window.location.href = 'ajustes.html';
    });

    switchBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      switchBtn.disabled = true;
      var label = switchBtn.querySelector('span');
      if (label) label.textContent = 'Redirigiendo…';
      window.recoAuth.switchAccount();
    });

    logoutBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var label = logoutBtn.querySelector('span');
      if (label) label.textContent = 'Cerrando…';
      window.recoAuth.signOut().then(function () {
        window.location.href = 'index.html';
      });
    });

    return wrap;
  }

  function applySession(session) {
    var slot = findLoginSlot();
    var existingChip = document.querySelector('.nav-user');

    if (session && session.user) {
      var chip = buildUserChip(session.user);
      if (slot) {
        slot.replaceWith(chip);
      } else if (!existingChip) {
        // No encontramos el link de login (ej. ya fue reemplazado,
        // o el markup de esta página es distinto): lo agregamos al
        // final de las acciones para no perder la información de sesión.
        var actions = document.querySelector('.bubble-nav__actions');
        if (actions) actions.appendChild(chip);
      } else {
        existingChip.replaceWith(chip);
      }
    } else if (existingChip) {
      // Se cerró sesión: si ya reemplazamos el chip antes en esta
      // carga de página, lo simple y confiable es recargar para que
      // navbar.js reconstruya el link de login original desde el HTML.
      window.location.reload();
    }
  }

  ready(function () {
    if (!window.recoAuth) {
      console.error('[RECO+] recoAuth no está disponible. Revisa que auth.js se cargó antes que navbar-auth.js.');
      return;
    }

    window.recoAuth.getSession().then(function (session) {
      applySession(session);
    });

    window.recoAuth.onAuthChange(function (session) {
      applySession(session);
    });
  });
})();
