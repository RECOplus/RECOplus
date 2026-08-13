/**
 * donar-campanas.js — RECO+
 * ---------------------------------------------------------------
 * Capa ADITIVA: carga y pinta la sección "Campañas de nuestros
 * aliados" (#campanas-empresas) en donar.html con datos reales de
 * la tabla `campanas` de Supabase — las que publican las empresas
 * aprobadas desde el wizard de campanas-modal.js en alianzas.html.
 *
 * Solo se muestran campañas con estado = 'aprobado' y activa = true
 * (la misma condición que ya exige la policy de SELECT pública en
 * supabase-campanas.sql, así que aunque hubiera un error en el
 * filtro del lado del cliente, RLS no dejaría pasar de más).
 *
 * Separa las campañas en dos carruseles según su tipo:
 *   - #campCarouselReciclaje → tipo = 'reciclaje'
 *   - #campCarouselDonacion  → tipo = 'donacion'
 *
 * Además abre un modal de detalle al tocar "Ver más →" en cualquier
 * tarjeta (#campDetailModal, ya en donar.html), con la info completa
 * de la campaña y la zona de inscripción (tabla
 * `campana_inscripciones`, ver supabase-campana-inscripciones.sql):
 *   - Sin sesión           → invita a iniciar sesión.
 *   - Con sesión, sin fila → formulario para inscribirse.
 *   - Con sesión, con fila → confirmación + botón para darse de baja.
 *
 * No modifica DonarHome.js, donar-listings.js ni donar.js: solo
 * pinta contenido dentro de sus propios contenedores nuevos.
 *
 * REQUIERE en donar.html, después de supabase-config.js y auth.js:
 *   <link rel="stylesheet" href="donar-campanas.css">
 *   ...
 *   <script src="donar-campanas.js"></script>
 * (usa window.recoSupabase y window.recoAuth ya inicializados)
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* Mismos catálogos (id → nombre/ícono) que usa campanas-modal.js
     al publicar, así el detalle muestra los materiales/categorías
     seleccionados con su nombre legible en vez del id crudo. */
  // `key` referencia una entrada del diccionario de i18n.js (t()),
  // así las etiquetas se traducen solas al cambiar de idioma en vez
  // de quedar fijas en español como antes.
  var MATERIALES_DISPONIBLES = {
    plastico: { key: 'rae.mat.plastico', icono: '🧴' },
    vidrio: { key: 'rae.mat.vidrio', icono: '🍾' },
    metal: { key: 'rae.mat.metal', icono: '🥫' },
    papel: { key: 'rae.mat.papel', icono: '📄' },
    carton: { key: 'rae.mat.carton', icono: '📦' },
    libros: { key: 'rae.mat.libros', icono: '📚' },
    electronicos: { key: 'rae.mat.electronicos', icono: '💻' },
    celulares: { key: 'rae.mat.celulares', icono: '📱' },
    baterias: { key: 'rae.mat.baterias', icono: '🔋' },
    bombillos: { key: 'rae.mat.bombillos', icono: '💡' },
    ropa: { key: 'rae.mat.ropa', icono: '👕' },
    tela: { key: 'rae.mat.tela', icono: '🧵' },
    cuero: { key: 'rae.mat.cuero', icono: '🥾' },
    muebles: { key: 'rae.mat.muebles', icono: '🪑' },
    juguetes: { key: 'rae.mat.juguetes', icono: '🧸' },
    utilesescolares: { key: 'rae.mat.utilesescolares', icono: '✏️' },
    tetrapak: { key: 'rae.mat.tetrapak', icono: '🧃' },
    aceite: { key: 'rae.mat.aceite', icono: '🛢️' }
  };

  // Mismas 10 categorías (y las mismas keys de i18n.js) que usa el
  // selector "¿Qué vas a donar?" de donar.html.
  var CATEGORIAS_DONACION = {
    ropa: { key: 'donar.form.opt.ropa', icono: '👕' },
    electronicos: { key: 'donar.form.opt.electronicos', icono: '💻' },
    muebles: { key: 'donar.form.opt.muebles', icono: '🛋️' },
    libros: { key: 'donar.form.opt.libros', icono: '📚' },
    juguetes: { key: 'donar.form.opt.juguetes', icono: '🧸' },
    alimentos: { key: 'donar.form.opt.alimentos', icono: '🥫' },
    material_escolar: { key: 'donar.form.opt.materialescolar', icono: '✏️' },
    higiene: { key: 'donar.form.opt.higiene', icono: '🧼' },
    medicinas: { key: 'donar.form.opt.medicinas', icono: '💊' },
    otro: { key: 'donar.form.opt.otro', icono: '📦' }
  };

  var MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Formatea "2026-09-01" como "1 sep" (sin depender de Date() con
  // huso horario, que puede correr el día en algunos navegadores al
  // parsear fechas "YYYY-MM-DD" como UTC).
  function formatFechaCorta(fechaStr) {
    if (!fechaStr) return '';
    var partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    var dia = parseInt(partes[2], 10);
    var mes = MESES_CORTOS[parseInt(partes[1], 10) - 1] || '';
    return dia + ' ' + mes;
  }

  function formatFechaLarga(fechaStr) {
    if (!fechaStr) return '';
    var partes = fechaStr.split('-');
    if (partes.length !== 3) return fechaStr;
    var dia = parseInt(partes[2], 10);
    var mes = MESES_LARGOS[parseInt(partes[1], 10) - 1] || '';
    return dia + ' de ' + mes + ' de ' + partes[0];
  }

  function rangoVigencia(row, largo) {
    var formateador = largo ? formatFechaLarga : formatFechaCorta;
    var ini = formateador(row.fecha_inicio);
    var fin = formateador(row.fecha_fin);
    if (ini && fin) return ini + ' – ' + fin;
    return ini || fin || '';
  }

  function nombreEmpresa(row) {
    // El join `aliados(nombre_empresa)` de Supabase-js devuelve un
    // objeto (o array, según la relación) en row.aliados.
    if (!row.aliados) return '';
    if (Array.isArray(row.aliados)) return (row.aliados[0] && row.aliados[0].nombre_empresa) || '';
    return row.aliados.nombre_empresa || '';
  }

  function catalogoDe(row) {
    return row.tipo === 'donacion' ? CATEGORIAS_DONACION : MATERIALES_DISPONIBLES;
  }

  function itemsDe(row) {
    var arr = row.tipo === 'donacion' ? row.categorias_donacion : row.materiales;
    return Array.isArray(arr) ? arr : [];
  }

  /* ── Caché en memoria de las campañas ya cargadas, indexada por
     id. Se usa para llenar el modal de detalle sin volver a pedirle
     el registro a Supabase cuando el usuario toca "Ver más →". ── */
  var rowsCache = {};

  function buildCardHTML(row) {
    var esReciclaje = row.tipo === 'reciclaje';
    var emojiTipo = esReciclaje ? '♻️' : '🎁';
    var badgeTexto = esReciclaje ? t('mapa.type.reciclaje') : t('mapa.type.donacion');
    var badgeClase = esReciclaje ? 'camp-card__badge--reciclaje' : 'camp-card__badge--donacion';

    var bannerStyle = row.banner_url ? ' style="background-image:url(\'' + escapeHtml(row.banner_url) + '\')"' : '';
    var bannerClase = row.banner_url ? 'camp-card__banner' : 'camp-card__banner camp-card__banner--sin-foto';
    var bannerContenido = row.banner_url ? '' : emojiTipo;

    var empresa = nombreEmpresa(row);
    var empresaHTML = empresa ? '<p class="camp-card__empresa">🏢 ' + escapeHtml(empresa) + '</p>' : '';

    var ubicacion = [row.distrito, row.provincia].filter(Boolean).join(', ');
    var vigencia = rangoVigencia(row, false);

    var metaHTML = '';
    if (ubicacion || vigencia) {
      var partes = [];
      if (ubicacion) partes.push('<span class="camp-card__meta-item">📍 ' + escapeHtml(ubicacion) + '</span>');
      if (vigencia) partes.push('<span class="camp-card__meta-item">📅 ' + escapeHtml(vigencia) + '</span>');
      metaHTML = '<p class="camp-card__meta">' + partes.join('<span class="camp-card__meta-sep">·</span>') + '</p>';
    }

    var metaGoalHTML = '';
    if (row.meta_cantidad) {
      var unidad = row.meta_unidad ? escapeHtml(row.meta_unidad) : '';
      metaGoalHTML = '<p class="camp-card__meta-goal">' + t('donar.campanas.metaCard') + ' ' + row.meta_cantidad + (unidad ? ' ' + unidad : '') + '</p>';
    }

    return (
      '<div class="camp-card dh-glass dn-reveal is-visible" data-campana-id="' + row.id + '">' +
        '<div class="' + bannerClase + '"' + bannerStyle + '>' +
          '<span class="camp-card__badge ' + badgeClase + '">' + emojiTipo + ' ' + badgeTexto + '</span>' +
          (row.banner_url ? '' : bannerContenido) +
        '</div>' +
        '<div class="camp-card__body">' +
          empresaHTML +
          '<h4 class="camp-card__title">' + escapeHtml(row.titulo) + '</h4>' +
          '<p class="camp-card__desc">' + escapeHtml(row.descripcion) + '</p>' +
          metaHTML +
          metaGoalHTML +
          '<button type="button" class="dh-card-btn camp-card__btn">' + t('donar.campanas.verMas') + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function emptyStateHTML(mensaje) {
    return '<div class="camp-card--empty dh-glass"><p>' + escapeHtml(mensaje) + '</p></div>';
  }

  function renderCarousel(trackId, rows, emptyMsg) {
    var track = document.getElementById(trackId);
    if (!track) return;

    if (!rows || rows.length === 0) {
      track.innerHTML = emptyStateHTML(emptyMsg);
      return;
    }

    rows.forEach(function (row) { rowsCache[String(row.id)] = row; });

    track.innerHTML = rows.map(buildCardHTML).join('');
  }

  function getClient() {
    if (!window.recoSupabase) {
      console.error('[RECO+] recoSupabase no está inicializado. Revisa que supabase-config.js se cargó antes que donar-campanas.js.');
      return null;
    }
    return window.recoSupabase;
  }

  function cargarCampanas() {
    var client = getClient();
    if (!client) return;

    // Nota: aunque ya se filtra por estado/activa acá, la policy de
    // SELECT pública en `campanas` exige exactamente lo mismo, así
    // que esto es solo para no traer filas de más — no es la única
    // barrera de seguridad.
    client
      .from('campanas')
      .select('*, aliados(nombre_empresa, logo_url)')
      .eq('tipo', 'reciclaje')
      .eq('estado', 'aprobado')
      .eq('activa', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando campañas de reciclaje:', res.error);
          renderCarousel('campCarouselReciclaje', [], t('donar.campanas.errorCargar'));
          return;
        }
        renderCarousel('campCarouselReciclaje', res.data, t('donar.campanas.vacio.reciclaje'));
      });

    client
      .from('campanas')
      .select('*, aliados(nombre_empresa, logo_url)')
      .eq('tipo', 'donacion')
      .eq('estado', 'aprobado')
      .eq('activa', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(function (res) {
        if (res.error) {
          console.error('[RECO+] Error cargando campañas de donación:', res.error);
          renderCarousel('campCarouselDonacion', [], t('donar.campanas.errorCargar'));
          return;
        }
        renderCarousel('campCarouselDonacion', res.data, t('donar.campanas.vacio.donacion'));
      });
  }

  // Expuesto por si otra capa (ej. tras aprobar una campaña desde un
  // futuro panel admin) quiere refrescar sin recargar la página.
  window.dhRefreshCampanas = cargarCampanas;

  /* ── Flechas de los 2 carruseles nuevos (mismo patrón que el
     carrusel de aliados en alianzas.html: scrollBy sobre el track
     indicado por data-target). ── */
  function wireCarouselArrows() {
    var botones = document.querySelectorAll('.camp-car-prev, .camp-car-next');
    botones.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var track = document.getElementById(targetId);
        if (!track) return;
        var delta = btn.classList.contains('camp-car-prev') ? -260 : 260;
        track.scrollBy({ left: delta, behavior: 'smooth' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════════
     MODAL DE DETALLE + INSCRIPCIÓN
     ══════════════════════════════════════════════════════════════ */

  function imageOrEmojiLarge(row) {
    var emoji = row.tipo === 'reciclaje' ? '♻️' : '🎁';
    if (row.banner_url) {
      return '<img src="' + escapeHtml(row.banner_url) + '" alt="' + escapeHtml(row.titulo) + '">';
    }
    return '<span class="donar-detail-emoji">' + emoji + '</span>';
  }

  function chipsHTML(row) {
    var catalogo = catalogoDe(row);
    var items = itemsDe(row);
    if (!items.length) return '';
    var chips = items.map(function (id) {
      var info = catalogo[id];
      var nombre = info ? t(info.key) : id;
      var icono = info ? info.icono : '•';
      return '<span class="camp-detail-chip">' + icono + ' ' + escapeHtml(nombre) + '</span>';
    }).join('');
    return '<div class="camp-detail-chips">' + chips + '</div>';
  }

  // Fila de la campaña actualmente abierta en el modal de detalle (o
  // null si está cerrado). Se usa para poder volver a pintar el modal
  // con el idioma nuevo si el usuario cambia ES/EN mientras lo tiene
  // abierto (ver el listener de "reco:langchange" al final del archivo).
  var currentDetailRow = null;

  function openCampDetailModal(row) {
    var overlay = document.getElementById('campDetailModal');
    if (!overlay || !row) return;

    currentDetailRow = row;
    var esReciclaje = row.tipo === 'reciclaje';

    var kicker = document.getElementById('campDetailKicker');
    if (kicker) kicker.textContent = esReciclaje ? t('donar.campdetalle.kicker.reciclaje') : t('donar.campdetalle.kicker.donacion');

    var imgWrap = document.getElementById('campDetailImg');
    if (imgWrap) imgWrap.innerHTML = imageOrEmojiLarge(row);

    var titleEl = document.getElementById('campDetailTitle');
    if (titleEl) titleEl.textContent = row.titulo || '';

    var metaEl = document.getElementById('campDetailMeta');
    if (metaEl) {
      var metaRows = [];
      var empresa = nombreEmpresa(row);
      if (empresa) metaRows.push('<div><span class="donar-detail-meta-ic">🏢</span>' + escapeHtml(empresa) + '</div>');

      var ubicacion = [row.distrito, row.provincia].filter(Boolean).join(', ');
      if (ubicacion) metaRows.push('<div><span class="donar-detail-meta-ic">📍</span>' + escapeHtml(ubicacion) + '</div>');
      if (row.direccion) metaRows.push('<div><span class="donar-detail-meta-ic">📌</span>' + escapeHtml(row.direccion) + '</div>');

      var vigencia = rangoVigencia(row, true);
      if (vigencia) metaRows.push('<div><span class="donar-detail-meta-ic">📅</span>' + escapeHtml(vigencia) + '</div>');

      if (row.meta_cantidad) {
        var unidad = row.meta_unidad ? escapeHtml(row.meta_unidad) : '';
        metaRows.push('<div><span class="donar-detail-meta-ic">🎯</span>' + t('donar.campdetalle.meta') + ' ' + row.meta_cantidad + (unidad ? ' ' + unidad : '') + '</div>');
      }

      metaEl.innerHTML = metaRows.join('') + chipsHTML(row);
    }

    var descEl = document.getElementById('campDetailDesc');
    if (descEl) descEl.textContent = row.descripcion || '';

    overlay.classList.add('open');
    document.body.classList.add('dh-modal-lock');

    renderInscribirZona(row);
  }

  function closeCampDetailModal() {
    var overlay = document.getElementById('campDetailModal');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.classList.remove('dh-modal-lock');
    currentDetailRow = null;
  }

  /* ── Zona de inscripción: 3 estados posibles ── */

  function inscribirZonaEl() {
    return document.getElementById('campInscribirZona');
  }

  function zonaCargandoHTML() {
    return '<p class="camp-inscribir__cargando">' + t('donar.campins.cargando') + '</p>';
  }

  function zonaInvitadoHTML() {
    return (
      '<div class="camp-inscribir camp-inscribir--guest">' +
        '<p>' + t('donar.campins.invitado.desc') + '</p>' +
        '<button type="button" class="dh-card-btn" id="campInsLoginBtn">' + t('donar.campins.invitado.btn') + '</button>' +
      '</div>'
    );
  }

  function zonaFormularioHTML(nombrePrefill) {
    return (
      '<div class="camp-inscribir">' +
        '<h4 class="camp-inscribir__title">' + t('donar.campins.form.titulo') + '</h4>' +
        '<div class="camp-inscribir__field">' +
          '<label for="campInsNombre">' + t('donar.campins.form.nombreLabel') + '</label>' +
          '<input type="text" id="campInsNombre" class="donar-input" maxlength="120" value="' + escapeHtml(nombrePrefill) + '">' +
        '</div>' +
        '<div class="camp-inscribir__field">' +
          '<label for="campInsTelefono">' + t('donar.campins.form.telefonoLabel') + ' <span class="donar-optional">' + t('donar.campins.form.telefonoOpcional') + '</span></label>' +
          '<input type="tel" id="campInsTelefono" class="donar-input" maxlength="30" placeholder="' + t('donar.campins.form.telefonoPh') + '">' +
        '</div>' +
        '<div class="camp-inscribir__field">' +
          '<label for="campInsMensaje">' + t('donar.campins.form.mensajeLabel') + ' <span class="donar-optional">' + t('donar.campins.form.mensajeOpcional') + '</span></label>' +
          '<textarea id="campInsMensaje" class="donar-input donar-textarea" maxlength="300" placeholder="' + t('donar.campins.form.mensajePh') + '"></textarea>' +
        '</div>' +
        '<p class="camp-inscribir__status" id="campInsStatus"></p>' +
        '<button type="button" class="dh-card-btn" id="campInsSubmitBtn">' + t('donar.campins.form.submitBtn') + '</button>' +
      '</div>'
    );
  }

  function zonaYaInscritoHTML() {
    return (
      '<div class="camp-inscribir camp-inscribir--ok">' +
        '<p>' + t('donar.campins.yaInscrito.msg') + '</p>' +
        '<p class="camp-inscribir__status" id="campInsStatus"></p>' +
        '<button type="button" class="camp-inscribir__cancel" id="campInsCancelarBtn">' + t('donar.campins.yaInscrito.cancelarBtn') + '</button>' +
      '</div>'
    );
  }

  function nombrePrefillDe(user) {
    var meta = user && user.user_metadata;
    if (!meta) return '';
    return meta.nombre || meta.full_name || meta.name || '';
  }

  function wireFormularioInscripcion(row, user) {
    var zona = inscribirZonaEl();
    if (!zona) return;
    var submitBtn = zona.querySelector('#campInsSubmitBtn');
    var statusEl = zona.querySelector('#campInsStatus');

    submitBtn.addEventListener('click', function () {
      var nombre = zona.querySelector('#campInsNombre').value.trim();
      var telefono = zona.querySelector('#campInsTelefono').value.trim();
      var mensaje = zona.querySelector('#campInsMensaje').value.trim();

      if (!nombre) {
        statusEl.textContent = t('donar.campins.form.errorNombre');
        statusEl.setAttribute('data-tipo', 'error');
        return;
      }

      var client = getClient();
      if (!client) return;

      submitBtn.disabled = true;
      submitBtn.textContent = t('donar.campins.form.enviando');
      statusEl.textContent = '';
      statusEl.removeAttribute('data-tipo');

      client.from('campana_inscripciones').insert({
        campana_id: row.id,
        user_id: user.id,
        nombre: nombre,
        email: user.email || '',
        telefono: telefono || null,
        mensaje: mensaje || null
      }).then(function (res) {
        if (res.error) {
          submitBtn.disabled = false;
          submitBtn.textContent = t('donar.campins.form.submitBtn');
          // 23505 = ya existe una fila con esa (campana_id, user_id) —
          // pudo pasar si el usuario tenía dos pestañas abiertas.
          if (res.error.code === '23505') {
            zona.innerHTML = zonaYaInscritoHTML();
            wireYaInscrito(row, user);
            return;
          }
          statusEl.textContent = t('donar.campins.form.errorGenerico');
          statusEl.setAttribute('data-tipo', 'error');
          return;
        }
        zona.innerHTML = zonaYaInscritoHTML();
        wireYaInscrito(row, user);
      });
    });
  }

  function wireYaInscrito(row, user) {
    var zona = inscribirZonaEl();
    if (!zona) return;
    var cancelarBtn = zona.querySelector('#campInsCancelarBtn');
    var statusEl = zona.querySelector('#campInsStatus');

    cancelarBtn.addEventListener('click', function () {
      var ok = window.confirm(t('donar.campins.confirmCancelar'));
      if (!ok) return;

      var client = getClient();
      if (!client) return;

      cancelarBtn.disabled = true;
      cancelarBtn.textContent = t('donar.campins.yaInscrito.cancelando');

      client.from('campana_inscripciones').delete()
        .eq('campana_id', row.id)
        .eq('user_id', user.id)
        .then(function (res) {
          if (res.error) {
            cancelarBtn.disabled = false;
            cancelarBtn.textContent = t('donar.campins.yaInscrito.cancelarBtn');
            if (statusEl) {
              statusEl.textContent = t('donar.campins.yaInscrito.errorCancelar');
              statusEl.setAttribute('data-tipo', 'error');
            }
            return;
          }
          zona.innerHTML = zonaFormularioHTML(nombrePrefillDe(user));
          wireFormularioInscripcion(row, user);
        });
    });
  }

  function renderInscribirZona(row) {
    var zona = inscribirZonaEl();
    if (!zona) return;
    zona.innerHTML = zonaCargandoHTML();

    if (!window.recoAuth) {
      console.error('[RECO+] recoAuth no está disponible. Revisa que auth.js se cargó antes que donar-campanas.js.');
      zona.innerHTML = '';
      return;
    }

    window.recoAuth.getVerifiedSession().then(function (sesion) {
      var user = sesion && sesion.user;
      if (!user) {
        zona.innerHTML = zonaInvitadoHTML();
        var loginBtn = zona.querySelector('#campInsLoginBtn');
        if (loginBtn) loginBtn.addEventListener('click', function () { window.location.href = 'login.html'; });
        return;
      }

      var client = getClient();
      if (!client) return;

      client.from('campana_inscripciones').select('id')
        .eq('campana_id', row.id)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(function (res) {
          if (res.data) {
            zona.innerHTML = zonaYaInscritoHTML();
            wireYaInscrito(row, user);
          } else {
            zona.innerHTML = zonaFormularioHTML(nombrePrefillDe(user));
            wireFormularioInscripcion(row, user);
          }
        });
    }).catch(function () {
      zona.innerHTML = zonaInvitadoHTML();
      var loginBtn = zona.querySelector('#campInsLoginBtn');
      if (loginBtn) loginBtn.addEventListener('click', function () { window.location.href = 'login.html'; });
    });
  }

  /* ── Conecta los clicks de "Ver más →" (delegado sobre los dos
     carruseles, así funciona igual con las tarjetas que se
     re-renderizan cada vez que cargarCampanas() recarga) y los
     cierres del modal (X, click fuera, Escape). ── */
  function setupDetailModal() {
    ['campCarouselReciclaje', 'campCarouselDonacion'].forEach(function (trackId) {
      var track = document.getElementById(trackId);
      if (!track) return;
      track.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.camp-card__btn') : null;
        if (!btn) return;
        var card = btn.closest('.camp-card[data-campana-id]');
        if (!card) return;
        var row = rowsCache[card.getAttribute('data-campana-id')];
        if (row) openCampDetailModal(row);
      });
    });

    var overlay = document.getElementById('campDetailModal');
    var closeX = document.getElementById('campDetailClose');

    if (closeX) closeX.addEventListener('click', closeCampDetailModal);
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeCampDetailModal();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) closeCampDetailModal();
    });
  }

  /* ── Idioma dinámico ──
     Las tarjetas de campañas y el modal de detalle/inscripción se
     generan en JS (innerHTML), así que no se actualizan solos como
     el resto del HTML estático con data-i18n. Al recibir el evento
     "reco:langchange" (disparado por applyLang en i18n.js) volvemos
     a pedir y pintar las campañas, y si el modal de detalle sigue
     abierto, también lo repintamos con el idioma nuevo. */
  function initLangSync() {
    document.addEventListener('reco:langchange', function () {
      cargarCampanas();
      if (currentDetailRow) openCampDetailModal(currentDetailRow);
    });
  }

  ready(cargarCampanas);
  ready(wireCarouselArrows);
  ready(setupDetailModal);
  ready(initLangSync);
})();
