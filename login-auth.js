/**
 * login-auth.js — Conecta el form de login.html a auth.js / Supabase.
 * Capa ADITIVA: se carga DESPUÉS de login.js, no lo reemplaza.
 * login.js sigue encargándose de las micro-interacciones (partículas,
 * parallax); este archivo solo añade el comportamiento real de envío.
 *
 * Orden de carga esperado en login.html:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   ...
 *   <script src="login.js"></script>
 *   <script src="login-auth.js"></script>
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

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ── Inserta (o reemplaza) el mensaje de alerta arriba del form ── */
  function showAlert(form, type, message) {
    clearAlert(form);
    var alert = document.createElement('div');
    alert.className = 'login-alert login-alert--' + type;
    alert.setAttribute('data-login-alert', '');

    var iconSvg = type === 'success'
      ? '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="8"/><path d="M6.5 10.5l2.3 2.3L14 8"/></svg>'
      : '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="8"/><line x1="10" y1="6.5" x2="10" y2="11"/><circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none"/></svg>';

    alert.innerHTML = iconSvg + '<span>' + message + '</span>';
    form.parentNode.insertBefore(alert, form);
  }

  function clearAlert(form) {
    var existing = form.parentNode.querySelector('[data-login-alert]');
    if (existing) existing.remove();
  }

  function markFieldInvalid(fieldWrap, invalid) {
    var field = fieldWrap.closest('.login-field');
    if (!field) return;
    field.classList.toggle('login-field--invalid', !!invalid);
  }

  function setButtonLoading(btn, loading) {
    if (!btn) return;
    btn.setAttribute('data-loading', loading ? 'true' : 'false');
    if (loading && !btn.querySelector('.login-submit__spinner') && !btn.querySelector('.login-social__spinner')) {
      var spinner = document.createElement('span');
      spinner.className = btn.classList.contains('login-submit') ? 'login-submit__spinner' : 'login-social__spinner';
      spinner.setAttribute('aria-hidden', 'true');
      btn.appendChild(spinner);
    }
  }

  ready(function () {
    var form = document.querySelector('.login-form');
    if (!form) return; // no estamos en login.html

    if (!window.recoAuth) {
      console.error('[RECO+] recoAuth no está disponible. Revisa que auth.js se cargó antes que login-auth.js.');
      return;
    }

    var emailInput = document.getElementById('loginEmail');
    var passInput = document.getElementById('loginPass');
    var submitBtn = form.querySelector('.login-submit');
    var forgotLink = document.querySelector('.login-forgot a');

    /* ── Si ya hay sesión activa, no tiene sentido quedarse en login ── */
    window.recoAuth.getSession().then(function (session) {
      if (session) {
        window.location.href = 'index.html';
      }
    });

    /* ── Envío del formulario ── */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAlert(form);
      markFieldInvalid(emailInput.closest('.login-field__wrap'), false);
      markFieldInvalid(passInput.closest('.login-field__wrap'), false);

      var email = emailInput.value.trim();
      var password = passInput.value;

      if (!email || !isValidEmail(email)) {
        markFieldInvalid(emailInput.closest('.login-field__wrap'), true);
        showAlert(form, 'error', 'Escribe un email válido.');
        emailInput.focus();
        return;
      }
      if (!password) {
        markFieldInvalid(passInput.closest('.login-field__wrap'), true);
        showAlert(form, 'error', 'Escribe tu contraseña.');
        passInput.focus();
        return;
      }

      setButtonLoading(submitBtn, true);
      emailInput.disabled = true;
      passInput.disabled = true;

      window.recoAuth.signIn(email, password).then(function (result) {
        setButtonLoading(submitBtn, false);
        emailInput.disabled = false;
        passInput.disabled = false;

        if (!result.ok) {
          showAlert(form, 'error', result.message);
          return;
        }

        showAlert(form, 'success', '¡Bienvenido! Redirigiendo…');
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 700);
      });
    });

    /* ── Botones sociales (Google / Apple) ──
       Son el 1er y 2do botón dentro de .login-social, en ese orden
       en el HTML actual de login.html. */
    var socialBtns = document.querySelectorAll('.login-social__btn');
    if (socialBtns[0]) {
      socialBtns[0].addEventListener('click', function () {
        setButtonLoading(socialBtns[0], true);
        window.recoAuth.signInWithGoogle().then(function (result) {
          if (!result.ok) {
            setButtonLoading(socialBtns[0], false);
            showAlert(form, 'error', result.message);
          }
          // si ok, el navegador redirige a Google; no hay más que hacer aquí
        });
      });
    }
    if (socialBtns[1]) {
      socialBtns[1].addEventListener('click', function () {
        setButtonLoading(socialBtns[1], true);
        window.recoAuth.signInWithApple().then(function (result) {
          if (!result.ok) {
            setButtonLoading(socialBtns[1], false);
            showAlert(form, 'error', result.message);
          }
        });
      });
    }

    /* ── "¿Olvidaste tu contraseña?" ──
       Pide el email (usa el que ya esté escrito en el campo, o
       pregunta con un prompt simple si está vacío) y envía el
       correo de recuperación. */
    if (forgotLink) {
      forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
        clearAlert(form);

        var email = emailInput.value.trim();
        if (!email || !isValidEmail(email)) {
          markFieldInvalid(emailInput.closest('.login-field__wrap'), true);
          showAlert(form, 'error', 'Escribe tu email arriba primero para poder enviarte el enlace de recuperación.');
          emailInput.focus();
          return;
        }

        forgotLink.style.pointerEvents = 'none';
        forgotLink.style.opacity = '0.6';

        window.recoAuth.sendPasswordReset(email).then(function (result) {
          forgotLink.style.pointerEvents = '';
          forgotLink.style.opacity = '';

          if (!result.ok) {
            showAlert(form, 'error', result.message);
            return;
          }
          showAlert(form, 'success', 'Te enviamos un enlace a ' + email + ' para restablecer tu contraseña.');
        });
      });
    }
  });
})();
