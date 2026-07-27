/**
 * RECO+ — tutorial.js  v3.0
 * Recorrido interactivo tipo "spotlight tour" para descubrir la plataforma.
 * - Resalta elementos reales de la página con una máscara oscura + halo verde.
 * - Textos 100% traducidos vía i18n.js (claves "tutorial.*").
 * - Navegable con teclado (← → Enter Esc) y con foco atrapado dentro del tooltip.
 * - Caja compacta: solo bienvenida → pasos → cierre, con Siguiente/Anterior
 *   y un único botón "Reiniciar tutorial completo" (dentro de la caja y en
 *   el botón flotante), sin menú de secciones ni pasos interactivos extra.
 */
(function () {
  'use strict';

  var LANG_KEY = 'reco-lang';
  var SEEN_KEY = 'reco-tutorial-seen';

  /* ────────────────────────────────────────────
     Definición de los pasos del recorrido
     selector: null   → paso centrado (bienvenida / cierre)
     radius:   border-radius aproximado del elemento real
     ──────────────────────────────────────────── */
  var STEPS = [
    { key: 'step0', selector: null, kind: 'welcome' },
    { key: 'step1', selector: '.bubble-nav',          placement: 'bottom', radius: 999, pad: 8,  section: 'nav' },
    { key: 'step2', selector: '#darkModeToggle',      placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },
    { key: 'step3', selector: '.lang-pill',           placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },
    { key: 'step4', selector: '.bubble-nav__cta',     placement: 'bottom', radius: 999, pad: 6,  section: 'nav' },
    { key: 'step5', selector: '#heroMiniNav',         placement: 'bottom', radius: 20,  pad: 10, section: 'search' },
    { key: 'step6', selector: '#heroSearchBar',       placement: 'bottom', radius: 999, pad: 8,  section: 'search' },
    { key: 'step7', selector: '.rd-banners',          placement: 'top',    radius: 22,  pad: 10, section: 'actions' },
    { key: 'step8', selector: '.acc-strip-wrapper',   placement: 'top',    radius: 26,  pad: 12, section: 'actions' },
    { key: 'step9', selector: null, kind: 'finish' }
  ];

  /* Puntos de entrada del menú de secciones → índice de paso donde arrancar */
  var SECTION_START = {
    full:    0,
    nav:     1,
    search:  5,
    actions: 7
  };

  var FALLBACK_ES = {
    'step0.title': '¡Bienvenido a RECO+!', 'step0.desc': 'Te mostramos en unos segundos cómo sacarle el máximo provecho a la plataforma.',
    'btn.next': 'Siguiente', 'btn.prev': 'Anterior', 'btn.finish': 'Finalizar', 'btn.close': 'Cerrar tutorial',
    'btn.restart': 'Reiniciar tutorial', 'btn.skip': 'Saltar tutorial',
    'step.counter': 'Paso {n} de {total}', 'step.progress': '{pct}% completado',
    'fab.label': 'Ver tutorial', 'fab.tooltip': '¿Necesitas ayuda? Reinicia el tutorial'
  };

  var state = {
    active: false,
    index: 0,
    resizeTimer: null,
    lastFocused: null
  };

  var dom = {}; // referencias a nodos creados

  /* ────────────────────────────────────────────
     Utilidades
     ──────────────────────────────────────────── */
  function qs(sel, root) { return (root || document).querySelector(sel); }

  function currentLang() {
    try { return localStorage.getItem(LANG_KEY) || 'es'; } catch (e) { return 'es'; }
  }

  function t(key) {
    try {
      var dict = (typeof translations !== 'undefined') ? translations[currentLang()] : null;
      if (dict && dict['tutorial.' + key]) return dict['tutorial.' + key];
    } catch (e) { /* i18n.js no disponible */ }
    return FALLBACK_ES[key] || '';
  }

  function tStep(stepKey, field) { return t(stepKey + '.' + field); }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  }

  function seen() {
    try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; }
  }
  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* noop */ }
  }

  /* ────────────────────────────────────────────
     Construcción del DOM (una sola vez)
     ──────────────────────────────────────────── */
  function buildDOM() {
    var root = document.createElement('div');
    root.id = 'reco-tutorial-root';

    var backdrop = document.createElement('div');
    backdrop.className = 'reco-tut-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    var spotlight = document.createElement('div');
    spotlight.className = 'reco-tut-spotlight';
    spotlight.setAttribute('aria-hidden', 'true');

    var tooltip = document.createElement('div');
    tooltip.className = 'reco-tut-tooltip';
    tooltip.setAttribute('role', 'dialog');
    tooltip.setAttribute('aria-modal', 'true');
    tooltip.setAttribute('aria-live', 'polite');
    tooltip.innerHTML =
      '<button type="button" class="reco-tut-close" data-action="close">' +
        '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12">' +
          '<line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/>' +
        '</svg>' +
        '<span class="reco-tut-visually-hidden" data-role="close-label"></span>' +
      '</button>' +
      '<div class="reco-tut-eyebrow-row">' +
        '<p class="reco-tut-eyebrow" data-role="eyebrow"></p>' +
        '<span class="reco-tut-progress-pct" data-role="progress-pct"></span>' +
      '</div>' +
      '<div class="reco-tut-progress-track" data-role="progress-track">' +
        '<div class="reco-tut-progress-fill" data-role="progress-fill"></div>' +
      '</div>' +
      '<h3 class="reco-tut-title" data-role="title"></h3>' +
      '<p class="reco-tut-desc" data-role="desc"></p>' +
      '<div class="reco-tut-dots" data-role="dots"></div>' +
      '<div class="reco-tut-actions" data-role="actions">' +
        '<div class="reco-tut-actions-left">' +
          '<button type="button" class="reco-tut-restart-inline" data-action="restart">' +
            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M4 10a6 6 0 1 1 1.8 4.3M4 10V6M4 10h4"/></svg>' +
            '<span data-role="restart-label"></span>' +
          '</button>' +
          '<button type="button" class="reco-tut-skip-inline" data-action="skip">' +
            '<span data-role="skip-label"></span>' +
          '</button>' +
        '</div>' +
        '<div class="reco-tut-actions-right">' +
          '<button type="button" class="reco-tut-prev" data-action="prev"></button>' +
          '<button type="button" class="reco-tut-next" data-action="next">' +
            '<span data-role="next-label"></span>' +
            '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="12" height="12"><path d="M4 10h12M11 5l5 5-5 5"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="reco-tut-arrow" data-role="arrow"></div>';

    root.appendChild(backdrop);
    root.appendChild(spotlight);
    root.appendChild(tooltip);
    document.body.appendChild(root);

    dom.root = root;
    dom.backdrop = backdrop;
    dom.spotlight = spotlight;
    dom.tooltip = tooltip;
    dom.eyebrow = qs('[data-role="eyebrow"]', tooltip);
    dom.progressPct = qs('[data-role="progress-pct"]', tooltip);
    dom.progressTrack = qs('[data-role="progress-track"]', tooltip);
    dom.progressFill = qs('[data-role="progress-fill"]', tooltip);
    dom.title = qs('[data-role="title"]', tooltip);
    dom.desc = qs('[data-role="desc"]', tooltip);
    dom.dots = qs('[data-role="dots"]', tooltip);
    dom.actions = qs('[data-role="actions"]', tooltip);
    dom.arrow = qs('[data-role="arrow"]', tooltip);
    dom.btnPrev = qs('[data-action="prev"]', tooltip);
    dom.btnNext = qs('[data-action="next"]', tooltip);
    dom.nextLabel = qs('[data-role="next-label"]', tooltip);
    dom.btnClose = qs('[data-action="close"]', tooltip);
    dom.closeLabel = qs('[data-role="close-label"]', tooltip);
    dom.btnRestart = qs('[data-action="restart"]', tooltip);
    dom.restartLabel = qs('[data-role="restart-label"]', tooltip);
    dom.btnSkip = qs('[data-action="skip"]', tooltip);
    dom.skipLabel = qs('[data-role="skip-label"]', tooltip);

    backdrop.addEventListener('click', function () { closeTutorial(true); });
    dom.btnClose.addEventListener('click', function () { closeTutorial(true); });
    dom.btnPrev.addEventListener('click', prevStep);
    dom.btnNext.addEventListener('click', function () {
      if (state.index >= STEPS.length - 1) { closeTutorial(true); }
      else { goToStep(state.index + 1); }
    });
    dom.btnRestart.addEventListener('click', function () {
      goToStep(0);
    });
    dom.btnSkip.addEventListener('click', function () { closeTutorial(true); });

    document.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', onResize);
  }

  /* ────────────────────────────────────────────
     Botón flotante (FAB) para relanzar el tour
     ──────────────────────────────────────────── */
  function buildFab() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'reco-tut-fab';
    if (!seen()) fab.classList.add('is-new');
    fab.innerHTML =
      '<span class="reco-tut-fab-ring" aria-hidden="true"></span>' +
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">' +
        '<circle cx="10" cy="10" r="8"/>' +
        '<path d="M7.6 7.5a2.4 2.4 0 114.2 1.6c-.6.6-1.3.9-1.5 1.7-.1.35-.1.7-.1.9"/>' +
        '<circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none"/>' +
      '</svg>' +
      '<span class="reco-tut-visually-hidden" data-role="fab-label"></span>';
    fab.setAttribute('aria-label', t('fab.label'));

    var hint = document.createElement('div');
    hint.className = 'reco-tut-fab-hint';
    hint.textContent = t('fab.tooltip');

    fab.addEventListener('mouseenter', function () { hint.classList.add('is-visible'); });
    fab.addEventListener('mouseleave', function () { hint.classList.remove('is-visible'); });
    fab.addEventListener('focus', function () { hint.classList.add('is-visible'); });
    fab.addEventListener('blur', function () { hint.classList.remove('is-visible'); });

    fab.addEventListener('click', function () {
      fab.classList.remove('is-new');
      hint.classList.remove('is-visible');
      openTutorial(0);
    });
    document.body.appendChild(fab);
    document.body.appendChild(hint);
    dom.fab = fab;
    dom.fabHint = hint;
  }

  function setFabVisible(visible) {
    if (!dom.fab) return;
    dom.fab.classList.toggle('is-hidden', !visible);
  }

  /* ────────────────────────────────────────────
     Textos: refrescar según idioma actual
     ──────────────────────────────────────────── */
  function refreshStaticLabels() {
    dom.btnPrev.innerHTML =
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="14" height="14"><path d="M16 10H4M9 5l-5 5 5 5"/></svg>' +
      '<span class="reco-tut-visually-hidden">' + t('btn.prev') + '</span>';
    dom.closeLabel.textContent = t('btn.close');
    dom.restartLabel.textContent = t('btn.restart');
    dom.skipLabel.textContent = t('btn.skip');
    if (dom.fab) {
      dom.fab.setAttribute('aria-label', t('fab.label'));
      var fabLabel = qs('[data-role="fab-label"]', dom.fab);
      if (fabLabel) fabLabel.textContent = t('fab.label');
    }
    if (dom.fabHint) dom.fabHint.textContent = t('fab.tooltip');
  }

  function buildDots() {
    dom.dots.innerHTML = '';
    STEPS.forEach(function (step, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reco-tut-dot';
      dot.setAttribute('aria-label', (i + 1) + '/' + STEPS.length);
      dot.addEventListener('click', function () { goToStep(i); });
      dom.dots.appendChild(dot);
    });
  }

  function updateDots() {
    var children = dom.dots.children;
    for (var i = 0; i < children.length; i++) {
      children[i].classList.toggle('is-active', i === state.index);
    }
  }

  function updateProgress() {
    var pct = Math.round(((state.index + 1) / STEPS.length) * 100);
    dom.progressFill.style.width = pct + '%';
    dom.progressPct.textContent = t('step.progress').replace('{pct}', pct);
  }

  /* ────────────────────────────────────────────
     Posicionamiento
     ──────────────────────────────────────────── */
  function computePosition(rect, placement) {
    var margin = 18;
    var vw = window.innerWidth, vh = window.innerHeight;
    var tw = dom.tooltip.offsetWidth, th = dom.tooltip.offsetHeight;

    function place(side) {
      switch (side) {
        case 'bottom':
          return { top: rect.bottom + margin, left: rect.left + rect.width / 2 - tw / 2 };
        case 'top':
          return { top: rect.top - margin - th, left: rect.left + rect.width / 2 - tw / 2 };
        case 'right':
          return { top: rect.top + rect.height / 2 - th / 2, left: rect.right + margin };
        case 'left':
          return { top: rect.top + rect.height / 2 - th / 2, left: rect.left - margin - tw };
      }
    }

    var order = [placement, 'bottom', 'top', 'right', 'left'];
    var chosen = null, side = placement;
    for (var i = 0; i < order.length; i++) {
      var p = place(order[i]);
      if (p.top >= 8 && p.top + th <= vh - 8) { chosen = p; side = order[i]; break; }
    }
    if (!chosen) { chosen = place(placement); side = placement; }

    var arrowTargetCenterX = rect.left + rect.width / 2;
    var arrowTargetCenterY = rect.top + rect.height / 2;

    chosen.left = Math.min(Math.max(chosen.left, 8), vw - tw - 8);
    chosen.top = Math.min(Math.max(chosen.top, 8), vh - th - 8);

    return { top: chosen.top, left: chosen.left, side: side, targetCX: arrowTargetCenterX, targetCY: arrowTargetCenterY };
  }

  function positionArrow(pos) {
    dom.arrow.className = 'reco-tut-arrow reco-tut-arrow--' + pos.side;
    var tw = dom.tooltip.offsetWidth, th = dom.tooltip.offsetHeight;
    if (pos.side === 'top' || pos.side === 'bottom') {
      var x = pos.targetCX - pos.left - 7;
      x = Math.min(Math.max(x, 14), tw - 26);
      dom.arrow.style.left = x + 'px';
      dom.arrow.style.top = '';
    } else {
      var y = pos.targetCY - pos.top - 7;
      y = Math.min(Math.max(y, 14), th - 26);
      dom.arrow.style.top = y + 'px';
      dom.arrow.style.left = '';
    }
  }

  function placeSpotlightOnRect(rect, radius, pad) {
    dom.spotlight.style.top = (rect.top - pad) + 'px';
    dom.spotlight.style.left = (rect.left - pad) + 'px';
    dom.spotlight.style.width = (rect.width + pad * 2) + 'px';
    dom.spotlight.style.height = (rect.height + pad * 2) + 'px';
    dom.spotlight.style.borderRadius = (radius >= 999 ? '999px' : radius + 'px');
    dom.spotlight.style.opacity = '1';
  }

  function placeSpotlightCenter() {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    dom.spotlight.style.top = cy + 'px';
    dom.spotlight.style.left = cx + 'px';
    dom.spotlight.style.width = '0px';
    dom.spotlight.style.height = '0px';
    dom.spotlight.style.borderRadius = '999px';
    dom.spotlight.style.opacity = '1';
  }

  /* ────────────────────────────────────────────
     Confeti de cierre
     ──────────────────────────────────────────── */
  function launchConfetti() {
    if (reducedMotion()) return;
    var colors = ['#2d8c4e', '#5ecf82', '#8fe3ac', '#1a5c2a', '#bff2cf'];
    var layer = document.createElement('div');
    layer.className = 'reco-tut-confetti-layer';
    var count = isMobile() ? 26 : 46;
    for (var i = 0; i < count; i++) {
      var piece = document.createElement('span');
      piece.className = 'reco-tut-confetti-piece';
      var x = Math.random() * 100;
      var drift = (Math.random() - 0.5) * 220;
      var dur = 2.4 + Math.random() * 1.6;
      var delay = Math.random() * 0.5;
      var rot = 360 + Math.random() * 540;
      piece.style.left = x + 'vw';
      piece.style.background = colors[i % colors.length];
      piece.style.borderRadius = (i % 3 === 0) ? '50%' : '2px';
      piece.style.setProperty('--tut-confetti-x', drift + 'px');
      piece.style.setProperty('--tut-confetti-r', rot + 'deg');
      piece.style.animationDuration = dur + 's';
      piece.style.animationDelay = delay + 's';
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 4600);
  }

  /* ────────────────────────────────────────────
     Render de un paso
     ──────────────────────────────────────────── */
  function renderStepContent(step) {
    dom.eyebrow.textContent = t('step.counter').replace('{n}', state.index + 1).replace('{total}', STEPS.length);
    dom.title.textContent = tStep(step.key, 'title');
    dom.desc.textContent = tStep(step.key, 'desc');
    dom.btnPrev.style.display = state.index === 0 ? 'none' : '';
    var isLast = state.index === STEPS.length - 1;
    dom.btnSkip.style.display = isLast ? 'none' : '';
    dom.nextLabel.textContent = isLast ? t('btn.finish') : '';
    dom.btnNext.classList.toggle('reco-tut-next--icon-only', !isLast);
    if (!dom.nextVisuallyHidden) {
      dom.nextVisuallyHidden = document.createElement('span');
      dom.nextVisuallyHidden.className = 'reco-tut-visually-hidden';
      dom.btnNext.insertBefore(dom.nextVisuallyHidden, dom.btnNext.firstChild);
    }
    dom.nextVisuallyHidden.textContent = isLast ? '' : t('btn.next');
    updateDots();
    updateProgress();

    // Botón "reiniciar tutorial completo" — siempre visible
    dom.restartLabel.textContent = t('btn.restart');

    if (step.kind === 'finish') {
      launchConfetti();
      markSeen();
    }
  }

  function renderStep(index, keepScroll) {
    var step = STEPS[index];
    dom.tooltip.classList.remove('is-visible');

    if (!step.selector) {
      dom.tooltip.classList.add('reco-tut-tooltip--centered');
      placeSpotlightCenter();
      renderStepContent(step);
      requestAnimationFrame(function () { dom.tooltip.classList.add('is-visible'); });
      focusTooltip();
      return;
    }

    dom.tooltip.classList.remove('reco-tut-tooltip--centered');
    var target = qs(step.selector);
    if (!target) {
      // El elemento no existe en esta página/estado: saltar al siguiente paso válido
      if (index < STEPS.length - 1) { goToStep(index + 1); }
      else { closeTutorial(true); }
      return;
    }

    var rect = target.getBoundingClientRect();
    var margin = 100;
    var visible = rect.top >= margin && rect.bottom <= window.innerHeight - margin;

    function place() {
      var r = target.getBoundingClientRect();
      placeSpotlightOnRect(r, step.radius || 16, step.pad || 8);
      renderStepContent(step);

      if (isMobile()) {
        dom.tooltip.style.top = '';
        dom.tooltip.style.left = '';
      } else {
        dom.tooltip.style.visibility = 'hidden';
        dom.tooltip.classList.add('is-visible');
        var pos = computePosition(r, step.placement || 'bottom');
        dom.tooltip.style.top = pos.top + 'px';
        dom.tooltip.style.left = pos.left + 'px';
        positionArrow(pos);
        dom.tooltip.style.visibility = '';
      }
      requestAnimationFrame(function () { dom.tooltip.classList.add('is-visible'); });
      focusTooltip();
    }

    if (!visible && !keepScroll) {
      target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center', inline: 'center' });
      setTimeout(place, reducedMotion() ? 60 : 440);
    } else {
      place();
    }
  }

  function focusTooltip() {
    // Foco accesible sin saltos bruscos de scroll
    try { dom.btnClose.focus({ preventScroll: true }); } catch (e) { dom.btnClose.focus(); }
  }

  /* ────────────────────────────────────────────
     Navegación
     ──────────────────────────────────────────── */
  function goToStep(index) {
    if (index < 0 || index >= STEPS.length) return;
    state.index = index;
    renderStep(index);
  }
  function prevStep() { if (state.index > 0) goToStep(state.index - 1); }

  function recomputeCurrent() {
    if (!state.active) return;
    var step = STEPS[state.index];
    if (!step.selector) { placeSpotlightCenter(); return; }
    var target = qs(step.selector);
    if (!target) return;
    var r = target.getBoundingClientRect();
    placeSpotlightOnRect(r, step.radius || 16, step.pad || 8);
    if (!isMobile()) {
      var pos = computePosition(r, step.placement || 'bottom');
      dom.tooltip.style.top = pos.top + 'px';
      dom.tooltip.style.left = pos.left + 'px';
      positionArrow(pos);
    }
  }

  function onResize() {
    clearTimeout(state.resizeTimer);
    state.resizeTimer = setTimeout(recomputeCurrent, 120);
  }

  function onKeydown(e) {
    if (!state.active) return;
    if (e.key === 'Escape') { closeTutorial(true); return; }
    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      if (state.index >= STEPS.length - 1) closeTutorial(true);
      else goToStep(state.index + 1);
      return;
    }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); return; }
    if (e.key === 'Tab') { trapFocus(e); }
  }

  function trapFocus(e) {
    var focusables = dom.tooltip.querySelectorAll('button:not([hidden])');
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ────────────────────────────────────────────
     Abrir / cerrar
     ──────────────────────────────────────────── */
  function openTutorial(startIndex) {
    if (!dom.root) buildDOM();
    state.active = true;
    state.lastFocused = document.activeElement;
    dom.root.style.display = '';
    document.documentElement.classList.add('reco-tut-open');
    refreshStaticLabels();
    buildDots();
    setFabVisible(false);
    if (dom.fabHint) dom.fabHint.classList.remove('is-visible');
    goToStep(startIndex || 0);
  }

  function closeTutorial(persistSeen) {
    if (!state.active) return;
    state.active = false;
    dom.tooltip.classList.remove('is-visible');
    dom.spotlight.style.opacity = '0';
    document.documentElement.classList.remove('reco-tut-open');
    if (dom.root) dom.root.style.display = 'none';
    if (persistSeen) markSeen();
    setFabVisible(true);
    if (dom.fab) dom.fab.classList.remove('is-new');
    if (state.lastFocused && typeof state.lastFocused.focus === 'function') {
      try { state.lastFocused.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    }
  }

  /* ────────────────────────────────────────────
     Inicio
     ──────────────────────────────────────────── */
  function initAutoStart() {
    if (seen()) return;
    setTimeout(function () {
      if (!state.active) openTutorial(0);
    }, 1400);
  }

  function hookLanguageChange() {
    var original = window.applyLang;
    if (typeof original !== 'function') return;
    window.applyLang = function (lang) {
      original(lang);
      if (state.active) {
        refreshStaticLabels();
        renderStep(state.index, true);
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildFab();
    hookLanguageChange();
    initAutoStart();
  });

  // API pública mínima, útil para enlazar el tour desde otro control si se desea
  window.RecoTutorial = {
    start: function () { openTutorial(0); },
    goToSection: function (name) {
      if (SECTION_START.hasOwnProperty(name)) openTutorial(SECTION_START[name]);
    },
    close: function () { closeTutorial(true); }
  };
})();