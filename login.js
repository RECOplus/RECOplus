/**
 * login.js — Micro-interacciones de login.html
 * IIFE aislada, JS defensivo (revisa existencia antes de usar),
 * mismo patrón que index.js / mapa-effects.js del proyecto.
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

  ready(function () {
    var card = document.querySelector('.login-card');
    if (!card) return; // esta página no está presente, no hacer nada

    /* ── Marcar el <html> como sin scroll para que el fondo con
       glow orbs se vea fijo, igual a como se comporta la página
       de referencia (login de una sola pantalla) ── */
    document.documentElement.classList.add('login-page');

    /* ── Partículas de luz dinámicas, mismo patrón que
       addLights() en mapa-effects.js ── */
    var particlesWrap = document.getElementById('loginParticles');
    if (particlesWrap && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
      var count = 16;
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('div');
        dot.className = 'login-particle';
        var size = 3 + Math.random() * 6;
        var x = Math.random() * 100;
        var y = Math.random() * 100;
        var dur = 6 + Math.random() * 8;
        var delay = Math.random() * -dur;
        var opacity = 0.15 + Math.random() * 0.35;
        dot.style.cssText =
          'left:' + x + '%;' +
          'top:' + y + '%;' +
          'width:' + size + 'px;' +
          'height:' + size + 'px;' +
          'opacity:' + opacity + ';' +
          'animation-duration:' + dur + 's, ' + (dur * 0.6) + 's;' +
          'animation-delay:' + delay + 's, ' + delay + 's;';
        particlesWrap.appendChild(dot);
      }
    }

    /* ── Parallax suave de los glow orbs con el mouse ── */
    var orbs = document.querySelectorAll('.login-orb');
    if (orbs.length && window.matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
      document.addEventListener('mousemove', function (e) {
        var x = (e.clientX / window.innerWidth) - 0.5;
        var y = (e.clientY / window.innerHeight) - 0.5;
        orbs.forEach(function (orb, i) {
          var factor = (i + 1) * 16;
          orb.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
        });
      }, { passive: true });
    }

    /* ── Feedback visual simple al enviar (placeholder hasta
       conectar con el backend de autenticación real) ── */
    var form = document.querySelector('.login-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('.login-submit');
        if (btn) {
          btn.style.opacity = '0.7';
          setTimeout(function () { btn.style.opacity = ''; }, 600);
        }
      });
    }
  });
})();