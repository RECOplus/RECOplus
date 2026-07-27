/**
 * registro-auth.js — Conecta el form de registro.html a auth.js / Supabase.
 * Capa ADITIVA: se carga DESPUÉS de login.js (registro.html reutiliza
 * login.js para las mismas micro-interacciones visuales).
 *
 * Orden de carga esperado en registro.html:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="auth.js"></script>
 *   ...
 *   <script src="login.js"></script>
 *   <script src="registro-auth.js"></script>
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

  function markFieldInvalid(wrap, invalid) {
    var field = wrap && wrap.closest('.login-field');
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
    if (!form) return;
    // Distingue registro.html de login.html por un campo exclusivo de registro
    var nameInput = document.getElementById('registerName');
    if (!nameInput) return; // esto es login.html, no registro.html

    if (!window.recoAuth) {
      console.error('[RECO+] recoAuth no está disponible. Revisa que auth.js se cargó antes que registro-auth.js.');
      return;
    }

    var emailInput = document.getElementById('registerEmail');
    var passInput = document.getElementById('registerPass');
    var passConfirmInput = document.getElementById('registerPassConfirm');
    var submitBtn = form.querySelector('.login-submit');

    /* ── Si ya hay sesión activa, no tiene sentido quedarse en registro ── */
    window.recoAuth.getSession().then(function (session) {
      if (session) {
        window.location.href = 'index.html';
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAlert(form);
      [nameInput, emailInput, passInput, passConfirmInput].forEach(function (input) {
        markFieldInvalid(input.closest('.login-field__wrap'), false);
      });

      var nombre = nameInput.value.trim();
      var email = emailInput.value.trim();
      var password = passInput.value;
      var passwordConfirm = passConfirmInput.value;

      if (!nombre) {
        markFieldInvalid(nameInput.closest('.login-field__wrap'), true);
        showAlert(form, 'error', 'Escribe tu nombre completo.');
        nameInput.focus();
        return;
      }
      if (!email || !isValidEmail(email)) {
        markFieldInvalid(emailInput.closest('.login-field__wrap'), true);
        showAlert(form, 'error', 'Escribe un email válido.');
        emailInput.focus();
        return;
      }
      if (!password || password.length < 6) {
        markFieldInvalid(passInput.closest('.login-field__wrap'), true);
        showAlert(form, 'error', 'La contraseña debe tener al menos 6 caracteres.');
        passInput.focus();
        return;
      }
      if (password !== passwordConfirm) {
        markFieldInvalid(passConfirmInput.closest('.login-field__wrap'), true);
        showAlert(form, 'error', 'Las contraseñas no coinciden.');
        passConfirmInput.focus();
        return;
      }

      setButtonLoading(submitBtn, true);
      [nameInput, emailInput, passInput, passConfirmInput].forEach(function (input) {
        input.disabled = true;
      });

      window.recoAuth.signUp(email, password, { nombre: nombre }).then(function (result) {
        setButtonLoading(submitBtn, false);
        [nameInput, emailInput, passInput, passConfirmInput].forEach(function (input) {
          input.disabled = false;
        });

        if (!result.ok) {
          showAlert(form, 'error', result.message);
          return;
        }

        if (result.session) {
          // Confirmación de email desactivada: entra directo.
          showAlert(form, 'success', '¡Cuenta creada! Redirigiendo…');
          setTimeout(function () {
            window.location.href = 'index.html';
          }, 700);
        } else {
          // Por si en el futuro activas confirmación de email.
          showAlert(form, 'success', 'Revisa tu correo (' + email + ') para confirmar tu cuenta.');
          form.reset();
        }
      });
    });

    /* ── Botones sociales (Google / Apple) — mismo flujo que login,
       ya que en Supabase signIn/signUp con OAuth es la misma llamada. ── */
    var socialBtns = document.querySelectorAll('.login-social__btn');
    if (socialBtns[0]) {
      socialBtns[0].addEventListener('click', function () {
        setButtonLoading(socialBtns[0], true);
        window.recoAuth.signInWithGoogle().then(function (result) {
          if (!result.ok) {
            setButtonLoading(socialBtns[0], false);
            showAlert(form, 'error', result.message);
          }
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
  });
})();
