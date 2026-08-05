/**
 * session-bridge.js — Puente de sesión entre los dos dominios de RECO+.
 *
 * RECO+ está desplegado en DOS orígenes distintos:
 *   - https://recoplus.github.io/rEcOPlus-Final/   (GitHub Pages)
 *   - https://r-ec-o-plus-final.vercel.app/        (Vercel)
 *
 * localStorage está aislado por origen (es una protección del propio
 * navegador, no un bug), así que la sesión de Supabase guardada en un
 * dominio NO existe para el otro. Sin este puente, al hacer clic en un
 * link de la navbar que cruza de dominio (ej. "Reciclar" desde
 * cualquier página hacia reciclar.html en Vercel), el usuario "pierde"
 * la sesión en el dominio destino — y si en algún momento inició
 * sesión ahí con OTRA cuenta, ve esa cuenta vieja en vez de estar
 * desconectado, que es justo el bug reportado.
 *
 * CÓMO FUNCIONA:
 * 1) SALIDA: escucha (en fase de captura, antes que cualquier otro
 *    handler) los clics en cualquier <a> cuyo href apunte al OTRO
 *    dominio de RECO+. Si hay sesión activa, adjunta el access_token
 *    y el refresh_token como parámetros en la URL antes de navegar.
 * 2) ENTRADA: al cargar cualquier página, si la URL trae esos
 *    parámetros, llama a supabase.auth.setSession() para reconstruir
 *    la sesión en este dominio, y de inmediato limpia los parámetros
 *    de la URL (history.replaceState) para no dejarlos visibles ni
 *    reenviarlos si el usuario recarga o comparte el link.
 *
 * REQUIERE, en TODAS las páginas, cargarse DESPUÉS de supabase-config.js
 * y ANTES de navbar-auth.js:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   <script src="session-bridge.js"></script>
 *   ...
 *   <script src="navbar-auth.js"></script>
 *
 * Capa ADITIVA: no modifica auth.js, navbar-auth.js ni supabase-config.js.
 */
(function () {
  'use strict';

  var DOMINIOS_RECO = [
    'recoplus.github.io',
    'r-ec-o-plus-final.vercel.app'
  ];

  var PARAM_AT = 'rb_at'; // rb = "reco bridge", at = access_token
  var PARAM_RT = 'rb_rt'; // rt = refresh_token

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function esDominioReco(hostname) {
    return DOMINIOS_RECO.indexOf(hostname) !== -1;
  }

  /* ══════════════════════════════════════════════
     ENTRADA: si la URL trae tokens del puente,
     reconstruye la sesión en ESTE dominio.
     ══════════════════════════════════════════════ */
  function procesarEntrada() {
    var url = new URL(window.location.href);
    var at = url.searchParams.get(PARAM_AT);
    var rt = url.searchParams.get(PARAM_RT);

    if (!at || !rt) return;

    // Limpia los parámetros de la URL de inmediato, ANTES de esperar
    // la respuesta de Supabase. Son tokens de sesión: cuanto menos
    // tiempo queden visibles en la barra de direcciones / historial,
    // mejor. Si algo falla más abajo, el usuario simplemente no
    // queda logueado en este dominio (igual que antes de este puente).
    url.searchParams.delete(PARAM_AT);
    url.searchParams.delete(PARAM_RT);
    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);

    if (!window.recoSupabase) {
      console.error('[RECO+] session-bridge: recoSupabase no está inicializado, no se puede restaurar la sesión.');
      return;
    }

    window.recoSupabase.auth.setSession({ access_token: at, refresh_token: rt }).catch(function (err) {
      console.error('[RECO+] session-bridge: no se pudo restaurar la sesión al cruzar de dominio.', err);
    });
  }

  /* ══════════════════════════════════════════════
     SALIDA: intercepta clics en links que cruzan
     a otro dominio de RECO+ y les adjunta la sesión.
     ══════════════════════════════════════════════ */
  function wireSalida() {
    document.addEventListener('click', function (e) {
      // Solo clics normales con botón izquierdo, sin teclas
      // modificadoras (para no romper "abrir en pestaña nueva", etc.)
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var link = e.target.closest('a[href]');
      if (!link) return;

      var destino;
      try {
        destino = new URL(link.href, window.location.href);
      } catch (err) {
        return;
      }

      // Solo nos interesan links que cruzan a OTRO dominio de RECO+
      // (no al mismo dominio actual, no a sitios externos como
      // wa.me, Google Maps, etc.)
      if (destino.hostname === window.location.hostname) return;
      if (!esDominioReco(destino.hostname)) return;
      if (!window.recoAuth) return;

      // No podemos esperar de forma síncrona a getSession() dentro
      // del evento de clic (es una Promise), así que: prevenimos la
      // navegación por defecto, resolvemos la sesión, y navegamos
      // manualmente en cuanto tengamos la respuesta (con o sin
      // tokens — si no hay sesión, el link funciona igual que antes).
      e.preventDefault();

      window.recoAuth.getSession().then(function (session) {
        if (session && session.access_token && session.refresh_token) {
          destino.searchParams.set(PARAM_AT, session.access_token);
          destino.searchParams.set(PARAM_RT, session.refresh_token);
        }
        window.location.href = destino.href;
      }).catch(function () {
        window.location.href = destino.href;
      });
    }, true); // fase de captura: corre antes que otros listeners de clic
  }

  ready(function () {
    procesarEntrada();
    wireSalida();
  });
})();
