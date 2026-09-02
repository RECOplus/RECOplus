/**
 * session-bridge.js — Puente de sesión Y de Modo Optimizado entre los
 * dos dominios de RECO+.
 *
 * RECO+ está desplegado en DOS orígenes distintos:
 *   - https://recoplus.github.io/rEcOPlus-Final/   (GitHub Pages)
 *   - https://r-ec-o-plus-final.vercel.app/        (Vercel)
 *
 * localStorage está aislado por origen (es una protección del propio
 * navegador, no un bug), así que tanto la sesión de Supabase como la
 * preferencia de Modo Optimizado (perf-mode.js, key "reco-perf-mode")
 * guardadas en un dominio NO existen para el otro. Sin este puente:
 *   a) al cruzar de dominio el usuario "pierde" la sesión — y si en
 *      algún momento inició sesión ahí con OTRA cuenta, ve esa cuenta
 *      vieja en vez de estar desconectado (bug original de este archivo).
 *   b) si activó Modo Optimizado en un dominio, al cruzar al otro
 *      (ej. navbar "Reciclar"/"Guía"/"Escáner" → Vercel) el modo se
 *      apaga solo, porque ese dominio nunca vio el localStorage del
 *      primero.
 *
 * CÓMO FUNCIONA (mismo mecanismo para ambos, un solo viaje de ida):
 * 1) SALIDA: escucha (en fase de captura, antes que cualquier otro
 *    handler) los clics en cualquier <a> cuyo href apunte al OTRO
 *    dominio de RECO+. SIEMPRE adjunta el estado actual de perf-mode
 *    (rb_pm=1/0, lectura síncrona de localStorage). Si además hay
 *    sesión activa, adjunta el access_token y el refresh_token.
 * 2) ENTRADA: al cargar cualquier página, si la URL trae esos
 *    parámetros: aplica rb_pm de inmediato (clase perf-mode en <html>
 *    + localStorage, y sincroniza window.RecoPerf/el pill del navbar
 *    si perf-mode.js ya corrió) y llama a supabase.auth.setSession()
 *    para reconstruir la sesión si vinieron tokens. Limpia los
 *    parámetros de la URL de inmediato (history.replaceState) para no
 *    dejarlos visibles ni reenviarlos si el usuario recarga o
 *    comparte el link.
 *
 * REQUIERE, en TODAS las páginas, cargarse DESPUÉS de supabase-config.js
 * y ANTES de navbar-auth.js. También debe cargarse DESPUÉS de
 * perf-mode.js si se quiere que la entrada sincronice el pill del
 * navbar sin esperar a DOMContentLoaded (no es obligatorio: si
 * perf-mode.js aún no corrió, este archivo espera a DOMContentLoaded
 * y sincroniza igual):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   <script src="session-bridge.js"></script>
 *   ...
 *   <script src="navbar-auth.js"></script>
 *   ...
 *   <script defer src="perf-mode.js"></script>
 *
 * Capa ADITIVA: no modifica auth.js, navbar-auth.js, supabase-config.js
 * ni perf-mode.js (solo lee/llama a su API pública window.RecoPerf).
 */
(function () {
  'use strict';

  var DOMINIOS_RECO = [
    'recoplus.github.io',
    'r-ec-o-plus-final.vercel.app'
  ];

  var PARAM_AT = 'rb_at'; // rb = "reco bridge", at = access_token
  var PARAM_RT = 'rb_rt'; // rt = refresh_token
  var PARAM_PM = 'rb_pm'; // rb = "reco bridge", pm = perf-mode ("1"/"0")
  var PERF_STORAGE_KEY = 'reco-perf-mode'; // misma key que usa perf-mode.js

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
    var pm = url.searchParams.get(PARAM_PM);

    if (!at && !rt && pm === null) return;

    // Limpia los parámetros de la URL de inmediato, ANTES de esperar
    // la respuesta de Supabase. Son tokens de sesión: cuanto menos
    // tiempo queden visibles en la barra de direcciones / historial,
    // mejor. Si algo falla más abajo, el usuario simplemente no
    // queda logueado en este dominio (igual que antes de este puente).
    url.searchParams.delete(PARAM_AT);
    url.searchParams.delete(PARAM_RT);
    url.searchParams.delete(PARAM_PM);
    window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);

    // Modo Optimizado (perf-mode): no depende de Supabase ni de sesión,
    // así que se aplica siempre que venga en la URL, tenga o no tokens
    // de auth el mismo link. Mismo mecanismo que perf-mode.js usa al
    // cargar normalmente (clase en <html> + localStorage), pero acá
    // además avisa a perf-mode.js si ya se inyectó (por si este script
    // corre después) para que sincronice el pill del navbar sin esperar
    // a que el usuario lo togglee manualmente.
    if (pm === '1' || pm === '0') {
      var pmOn = pm === '1';
      document.documentElement.classList.toggle('perf-mode', pmOn);
      try {
        localStorage.setItem(PERF_STORAGE_KEY, pmOn ? 'true' : 'false');
      } catch (e) {}
      if (window.RecoPerf && typeof window.RecoPerf.set === 'function') {
        window.RecoPerf.set(pmOn, { silent: true });
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          if (window.RecoPerf && typeof window.RecoPerf.set === 'function') {
            window.RecoPerf.set(pmOn, { silent: true });
          }
        });
      }
    }

    if (!at || !rt) return;

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

      // Modo Optimizado: lectura síncrona de localStorage (no depende
      // de sesión/recoAuth), se adjunta siempre para que el estado
      // viaje igual al dominio destino en cualquier escenario.
      var pmOn = false;
      try {
        pmOn = localStorage.getItem(PERF_STORAGE_KEY) === 'true';
      } catch (e2) {}
      destino.searchParams.set(PARAM_PM, pmOn ? '1' : '0');

      if (!window.recoAuth) {
        // Sin recoAuth no hay tokens de sesión que resolver de forma
        // asíncrona: se navega ya mismo al `destino` actualizado en
        // memoria (el href original del <a> aún no tiene rb_pm).
        e.preventDefault();
        window.location.href = destino.href;
        return;
      }

      // No podemos esperar de forma síncrona a getSession() dentro
      // del evento de clic (es una Promise), así que: prevenimos la
      // navegación por defecto, resolvemos la sesión, y navegamos
      // manualmente en cuanto tengamos la respuesta (con o sin
      // tokens — si no hay sesión, el link funciona igual que antes,
      // ya con rb_pm incluido).
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
