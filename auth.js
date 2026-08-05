/**
 * auth.js — Módulo central de autenticación de RECO+.
 * Envuelve Supabase Auth (email/contraseña, Google, Apple, reset
 * de contraseña, sesión) en funciones simples y reutilizables por
 * cualquier página del sitio.
 *
 * REQUIERE, en este orden, antes de este script:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *
 * Expone: window.recoAuth = {
 *   signUp, signIn, signInWithGoogle, signInWithApple,
 *   sendPasswordReset, updatePassword, signOut,
 *   getSession, onAuthChange
 * }
 */
(function () {
  'use strict';

  /* ── Bandera de sesión de recuperación (vía evento en tiempo real) ──
     Cuando alguien llega desde el link de "olvidé mi contraseña",
     Supabase crea una sesión temporal y dispara el evento
     PASSWORD_RECOVERY. Esto cubre el caso en que la página carga
     justo cuando el link se procesa. */
  var isRecoverySession = false;

  function getClient() {
    if (!window.recoSupabase) {
      console.error('[RECO+] recoSupabase no está inicializado. Revisa que supabase-config.js se cargó antes que auth.js.');
      return null;
    }
    return window.recoSupabase;
  }

  /* ── Calcula la URL base correcta para redirects (OAuth, reset de
     contraseña, confirmación de email) ──
     window.location.origin por sí solo NO alcanza en sitios como
     GitHub Pages de proyecto (usuario.github.io/repo/), porque origin
     solo trae protocolo+host, sin la carpeta "/repo/". Si se usa solo
     origin, el redirect apunta a una URL que no existe en el sitio y
     Supabase, al no reconocerla como URL permitida, cae de vuelta a la
     Site URL configurada en el dashboard (que puede ser localhost).
     Esta función arma la base a partir de la carpeta actual, así que
     funciona igual en GitHub Pages con subcarpeta, en Vercel (raíz) y
     en localhost. */
  function getRedirectBase() {
    var path = window.location.pathname;
    var dir = path.substring(0, path.lastIndexOf('/') + 1);
    return window.location.origin + dir;
  }

  /* ── Decodifica el access_token (JWT) de una sesión y revisa su
     campo "amr" (Authentication Methods Reference). Cuando la sesión
     viene de un link de recuperación, Supabase incluye el método
     "recovery" ahí. Esto detecta la sesión de recuperación incluso
     si YA estaba guardada en localStorage antes de que la página
     cargara (ej. el usuario cerró la pestaña sin cambiar la
     contraseña y volvió más tarde) — caso que el evento en tiempo
     real por sí solo NO cubre, porque ese evento solo se dispara la
     primera vez que Supabase procesa el link, no en cargas futuras. */
  function sessionIsRecoveryByToken(session) {
    if (!session || !session.access_token) return false;
    try {
      var parts = session.access_token.split('.');
      if (parts.length < 2) return false;
      var payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      var payload = JSON.parse(payloadJson);
      var amr = payload.amr || [];
      for (var i = 0; i < amr.length; i++) {
        if (amr[i] && amr[i].method === 'recovery') return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Se registra apenas el cliente existe, antes de cualquier otra
  // lógica de la página, para no perder el evento si llega temprano.
  (function watchRecoveryEvent() {
    var client = getClient();
    if (!client) return;
    client.auth.onAuthStateChange(function (event, session) {
      if (event === 'PASSWORD_RECOVERY') {
        isRecoverySession = true;
      }
      if (event === 'SIGNED_OUT') {
        isRecoverySession = false;
      }
      // Refuerzo: en cualquier evento con sesión (incluyendo la
      // restauración automática de una sesión guardada), revisa el
      // token directamente. Esto es lo que cubre el caso de sesión
      // "vieja" de recovery que ya estaba en localStorage.
      if (session && sessionIsRecoveryByToken(session)) {
        isRecoverySession = true;
      }
    });
  })();

  /* ── Traductor simple de errores comunes de Supabase Auth a
     mensajes en español, para mostrar en la UI ── */
  function translateAuthError(error) {
    if (!error) return '';
    var msg = (error.message || '').toLowerCase();

    if (msg.indexOf('invalid login credentials') !== -1) {
      return 'Email o contraseña incorrectos.';
    }
    if (msg.indexOf('email not confirmed') !== -1) {
      return 'Debes confirmar tu correo antes de iniciar sesión.';
    }
    if (msg.indexOf('user already registered') !== -1 || msg.indexOf('already registered') !== -1) {
      return 'Ya existe una cuenta con ese correo. Intenta iniciar sesión.';
    }
    if (msg.indexOf('password should be at least') !== -1 || msg.indexOf('password') !== -1 && msg.indexOf('least') !== -1) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (msg.indexOf('unable to validate email address') !== -1 || msg.indexOf('invalid email') !== -1) {
      return 'Ese email no parece válido.';
    }
    if (msg.indexOf('rate limit') !== -1 || msg.indexOf('too many') !== -1) {
      return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
    }
    if (msg.indexOf('network') !== -1 || msg.indexOf('fetch') !== -1) {
      return 'No se pudo conectar. Revisa tu conexión a internet.';
    }
    // Fallback: mostrar el mensaje original de Supabase si no lo reconocemos.
    return error.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  /* ── REGISTRO con email + contraseña ──
     extraData: objeto opcional guardado en user_metadata (ej. { nombre }) */
  function signUp(email, password, extraData) {
    var client = getClient();
    if (!client) return Promise.resolve({ ok: false, message: 'Servicio no disponible.' });

    return client.auth.signUp({
      email: email,
      password: password,
      options: {
        data: extraData || {},
        emailRedirectTo: getRedirectBase() + 'login.html'
      }
    }).then(function (res) {
      if (res.error) {
        return { ok: false, message: translateAuthError(res.error), error: res.error };
      }
      // Con confirmación de email DESACTIVADA (tu caso actual), Supabase
      // devuelve una sesión activa de inmediato tras el signUp.
      var hasSession = !!(res.data && res.data.session);
      return { ok: true, session: hasSession ? res.data.session : null, user: res.data.user };
    }).catch(function (err) {
      return { ok: false, message: translateAuthError(err), error: err };
    });
  }

  /* ── LOGIN con email + contraseña ── */
  function signIn(email, password) {
    var client = getClient();
    if (!client) return Promise.resolve({ ok: false, message: 'Servicio no disponible.' });

    return client.auth.signInWithPassword({
      email: email,
      password: password
    }).then(function (res) {
      if (res.error) {
        return { ok: false, message: translateAuthError(res.error), error: res.error };
      }
      return { ok: true, session: res.data.session, user: res.data.user };
    }).catch(function (err) {
      return { ok: false, message: translateAuthError(err), error: err };
    });
  }

  /* ── LOGIN / REGISTRO con Google (OAuth) ──
     Redirige fuera de la página; al volver, Supabase deja la sesión
     activa automáticamente (detectSessionInUrl: true en el cliente). */
  function signInWithGoogle(opts) {
    var client = getClient();
    if (!client) return Promise.resolve({ ok: false, message: 'Servicio no disponible.' });

    var forceSelect = opts && opts.switchAccount;
    var oauthOptions = { redirectTo: getRedirectBase() + 'index.html' };
    if (forceSelect) {
      // Fuerza a Google a mostrar el selector de cuentas en vez de
      // reusar automáticamente la sesión de Google ya activa en el
      // navegador. Necesario para "Iniciar con otra cuenta".
      oauthOptions.queryParams = { prompt: 'select_account' };
    }

    return client.auth.signInWithOAuth({
      provider: 'google',
      options: oauthOptions
    }).then(function (res) {
      if (res.error) return { ok: false, message: translateAuthError(res.error), error: res.error };
      return { ok: true }; // el navegador redirige; no hay más que hacer aquí
    }).catch(function (err) {
      return { ok: false, message: translateAuthError(err), error: err };
    });
  }

  /* ── LOGIN / REGISTRO con Apple (OAuth) ── */
  function signInWithApple() {
    var client = getClient();
    if (!client) return Promise.resolve({ ok: false, message: 'Servicio no disponible.' });

    return client.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: getRedirectBase() + 'index.html' }
    }).then(function (res) {
      if (res.error) return { ok: false, message: translateAuthError(res.error), error: res.error };
      return { ok: true };
    }).catch(function (err) {
      return { ok: false, message: translateAuthError(err), error: err };
    });
  }

  /* ── Enviar correo de recuperación de contraseña ──
     redirectTo apunta a reset-password.html, donde el usuario
     escribirá su nueva contraseña. */
  function sendPasswordReset(email) {
    var client = getClient();
    if (!client) return Promise.resolve({ ok: false, message: 'Servicio no disponible.' });

    return client.auth.resetPasswordForEmail(email, {
      redirectTo: getRedirectBase() + 'reset-password.html'
    }).then(function (res) {
      if (res.error) return { ok: false, message: translateAuthError(res.error), error: res.error };
      return { ok: true };
    }).catch(function (err) {
      return { ok: false, message: translateAuthError(err), error: err };
    });
  }

  /* ── Actualizar contraseña (usado en reset-password.html, después
     de que el usuario llega desde el link del correo) ── */
  function updatePassword(newPassword) {
    var client = getClient();
    if (!client) return Promise.resolve({ ok: false, message: 'Servicio no disponible.' });

    return client.auth.updateUser({ password: newPassword }).then(function (res) {
      if (res.error) return { ok: false, message: translateAuthError(res.error), error: res.error };
      // La contraseña ya se cambió: esta sesión pasa a ser una
      // sesión normal, no de recuperación.
      isRecoverySession = false;
      return { ok: true, user: res.data.user };
    }).catch(function (err) {
      return { ok: false, message: translateAuthError(err), error: err };
    });
  }

  /* ── Cerrar sesión ── */
  function signOut() {
    var client = getClient();
    if (!client) return Promise.resolve({ ok: false });

    return client.auth.signOut().then(function (res) {
      if (res.error) return { ok: false, message: translateAuthError(res.error), error: res.error };
      return { ok: true };
    }).catch(function (err) {
      return { ok: false, message: translateAuthError(err), error: err };
    });
  }

  /* ── Obtener sesión actual (para navbar-auth.js y guards de página) ── */
  function getSession() {
    var client = getClient();
    if (!client) return Promise.resolve(null);

    return client.auth.getSession().then(function (res) {
      var session = res.data ? res.data.session : null;
      // Refuerzo adicional: revisa el token aquí también, por si el
      // evento onAuthStateChange todavía no corrió cuando se llama
      // a getSession() (ej. justo al cargar la página).
      if (session && sessionIsRecoveryByToken(session)) {
        isRecoverySession = true;
      }
      return session;
    }).catch(function () {
      return null;
    });
  }

  /* ── Sesión verificada contra el servidor (no el caché local) ──
     client.auth.getSession() lee directo de localStorage y puede
     devolver un token "viejo" si, por ejemplo, hay varias pestañas
     abiertas y una de ellas todavía no se enteró de un cambio de
     cuenta (logout + login con otra cuenta de Google) hecho en otra
     pestaña. client.auth.getUser() sí hace una llamada real a
     Supabase para validar el token y devuelve el usuario actual de
     verdad, así que es lo correcto para pintar el chip de la navbar
     (donde mostrar la cuenta equivocada, aunque sea un instante, es
     confuso). Es un poco más lento que getSession() porque implica
     red, por eso getSession() se deja como estaba para otros usos. */
  function getVerifiedSession() {
    var client = getClient();
    if (!client) return Promise.resolve(null);

    return client.auth.getUser().then(function (res) {
      if (res.error || !res.data || !res.data.user) return null;
      // Combina el usuario verificado con la sesión local (para
      // tener access_token disponible si algo más lo necesita), pero
      // el objeto "user" que importa para pintar la UI es el fresco.
      return client.auth.getSession().then(function (sesRes) {
        var session = sesRes.data ? sesRes.data.session : null;
        if (!session) return { user: res.data.user };
        session.user = res.data.user;
        return session;
      });
    }).catch(function () {
      return null;
    });
  }

  /* ── Suscribirse a cambios de sesión (login/logout en cualquier
     pestaña, expiración de token, etc.) ──
     callback(session) recibe null si no hay sesión. */
  function onAuthChange(callback) {
    var client = getClient();
    if (!client) return null;

    var sub = client.auth.onAuthStateChange(function (_event, session) {
      callback(session);
    });
    return sub;
  }

  /* ── ¿La sesión activa (si existe) es de recuperación de
     contraseña, no un login normal? ── */
  function isPasswordRecovery() {
    return isRecoverySession;
  }

  /* ── Cerrar sesión actual e iniciar el flujo de Google forzando
     el selector de cuentas, para "Iniciar con otra cuenta" desde
     el menú del navbar. Solo cubre Google por ahora (es el único
     proveedor social activo); si más adelante se activa Apple,
     se puede extender con el mismo patrón. ── */
  function switchAccount() {
    return signOut().then(function () {
      return signInWithGoogle({ switchAccount: true });
    });
  }

  window.recoAuth = {
    signUp: signUp,
    signIn: signIn,
    signInWithGoogle: signInWithGoogle,
    signInWithApple: signInWithApple,
    sendPasswordReset: sendPasswordReset,
    updatePassword: updatePassword,
    signOut: signOut,
    switchAccount: switchAccount,
    getSession: getSession,
    getVerifiedSession: getVerifiedSession,
    onAuthChange: onAuthChange,
    isPasswordRecovery: isPasswordRecovery
  };
})();