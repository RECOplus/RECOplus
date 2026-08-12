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
  var MATERIALES_DISPONIBLES = {
    plastico: { nombre: 'Plástico', icono: '🧴' },
    vidrio: { nombre: 'Vidrio', icono: '🍾' },
    metal: { nombre: 'Metal', icono: '🥫' },
    papel: { nombre: 'Papel', icono: '📄' },
    carton: { nombre: 'Cartón', icono: '📦' },
    libros: { nombre: 'Libros', icono: '📚' },
    electronicos: { nombre: 'Electrónicos', icono: '💻' },
    celulares: { nombre: 'Celulares', icono: '📱' },
    baterias: { nombre: 'Baterías', icono: '🔋' },
    bombillos: { nombre: 'Bombillos', icono: '💡' },
    ropa: { nombre: 'Ropa', icono: '👕' },
    tela: { nombre: 'Tela', icono: '🧵' },
    cuero: { nombre: 'Cuero', icono: '🥾' },
    muebles: { nombre: 'Muebles', icono: '🪑' },
    juguetes: { nombre: 'Juguetes', icono: '🧸' },
    utilesescolares: { nombre: 'Útiles escolares', icono: '✏️' },
    tetrapak: { nombre: 'Tetra Pak', icono: '🧃' },
    aceite: { nombre: 'Aceite de cocina', icono: '🛢️' }
  };

  var CATEGORIAS_DONACION = {
    ropa: { nombre: 'Ropa y calzado', icono: '👕' },
    electronicos: { nombre: 'Electrónicos', icono: '💻' },
    muebles: { nombre: 'Muebles', icono: '🛋️' },
    libros: { nombre: 'Libros y útiles', icono: '📚' },
    juguetes: { nombre: 'Juguetes', icono: '🧸' },
    alimentos: { nombre: 'Alimentos no perecederos', icono: '🥫' },
    material_escolar: { nombre: 'Material escolar', icono: '✏️' },
    higiene: { nombre: 'Productos de higiene', icono: '🧼' },
    medicinas: { nombre: 'Medicinas no vencidas', icono: '💊' },
    otro: { nombre: 'Otro', icono: '📦' }
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
    var badgeTexto = esReciclaje ? 'Reciclaje' : 'Donación';
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
      metaGoalHTML = '<p class="camp-card__meta-goal">🎯 Meta: ' + row.meta_cantidad + (unidad ? ' ' + unidad : '') + '</p>';
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
          '<button type="button" class="dh-card-btn camp-card__btn">Ver más →</button>' +
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
          renderCarousel('campCarouselReciclaje', [], 'No se pudieron cargar las campañas por ahora.');
          return;
        }
        renderCarousel('campCarouselReciclaje', res.data, 'Todavía no hay campañas de reciclaje activas. ¡Sé la primera empresa en publicar una desde Alianzas!');
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
          renderCarousel('campCarouselDonacion', [], 'No se pudieron cargar las campañas por ahora.');
          return;
        }
        renderCarousel('campCarouselDonacion', res.data, 'Todavía no hay campañas de donación activas. ¡Sé la primera empresa en publicar una desde Alianzas!');
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
      var info = catalogo[id] || { nombre: id, icono: '•' };
      return '<span class="camp-detail-chip">' + info.icono + ' ' + escapeHtml(info.nombre) + '</span>';
    }).join('');
    return '<div class="camp-detail-chips">' + chips + '</div>';
  }

  function openCampDetailModal(row) {
    var overlay = document.getElementById('campDetailModal');
    if (!overlay || !row) return;

    var esReciclaje = row.tipo === 'reciclaje';

    var kicker = document.getElementById('campDetailKicker');
    if (kicker) kicker.textContent = esReciclaje ? '♻️ Campaña de reciclaje' : '🎁 Campaña de donación';

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
        metaRows.push('<div><span class="donar-detail-meta-ic">🎯</span>Meta: ' + row.meta_cantidad + (unidad ? ' ' + unidad : '') + '</div>');
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
  }

  /* ── Zona de inscripción: 3 estados posibles ── */

  function inscribirZonaEl() {
    return document.getElementById('campInscribirZona');
  }

  function zonaCargandoHTML() {
    return '<p class="camp-inscribir__cargando">Cargando…</p>';
  }

  function zonaInvitadoHTML() {
    return (
      '<div class="camp-inscribir camp-inscribir--guest">' +
        '<p>Inicia sesión para inscribirte en esta campaña.</p>' +
        '<button type="button" class="dh-card-btn" id="campInsLoginBtn">Iniciar sesión →</button>' +
      '</div>'
    );
  }

  function zonaFormularioHTML(nombrePrefill) {
    return (
      '<div class="camp-inscribir">' +
        '<h4 class="camp-inscribir__title">Inscríbete en esta campaña</h4>' +
        '<div class="camp-inscribir__field">' +
          '<label for="campInsNombre">Nombre completo</label>' +
          '<input type="text" id="campInsNombre" class="donar-input" maxlength="120" value="' + escapeHtml(nombrePrefill) + '">' +
        '</div>' +
        '<div class="camp-inscribir__field">' +
          '<label for="campInsTelefono">Teléfono <span class="donar-optional">(opcional)</span></label>' +
          '<input type="tel" id="campInsTelefono" class="donar-input" maxlength="30" placeholder="Ej. 6123-4567">' +
        '</div>' +
        '<div class="camp-inscribir__field">' +
          '<label for="campInsMensaje">Comentario <span class="donar-optional">(opcional)</span></label>' +
          '<textarea id="campInsMensaje" class="donar-input donar-textarea" maxlength="300" placeholder="Ej. cuánto material aproximado llevarás, o qué te gustaría donar/aportar"></textarea>' +
        '</div>' +
        '<p class="camp-inscribir__status" id="campInsStatus"></p>' +
        '<button type="button" class="dh-card-btn" id="campInsSubmitBtn">Inscribirme →</button>' +
      '</div>'
    );
  }

  function zonaYaInscritoHTML() {
    return (
      '<div class="camp-inscribir camp-inscribir--ok">' +
        '<p>✅ Ya estás inscrito en esta campaña.</p>' +
        '<p class="camp-inscribir__status" id="campInsStatus"></p>' +
        '<button type="button" class="camp-inscribir__cancel" id="campInsCancelarBtn">Cancelar inscripción</button>' +
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
        statusEl.textContent = 'Ingresa tu nombre para inscribirte.';
        statusEl.setAttribute('data-tipo', 'error');
        return;
      }

      var client = getClient();
      if (!client) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Inscribiendo...';
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
          submitBtn.textContent = 'Inscribirme →';
          // 23505 = ya existe una fila con esa (campana_id, user_id) —
          // pudo pasar si el usuario tenía dos pestañas abiertas.
          if (res.error.code === '23505') {
            zona.innerHTML = zonaYaInscritoHTML();
            wireYaInscrito(row, user);
            return;
          }
          statusEl.textContent = 'No se pudo completar tu inscripción. Intenta de nuevo.';
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
      var ok = window.confirm('¿Seguro que quieres cancelar tu inscripción a esta campaña?');
      if (!ok) return;

      var client = getClient();
      if (!client) return;

      cancelarBtn.disabled = true;
      cancelarBtn.textContent = 'Cancelando...';

      client.from('campana_inscripciones').delete()
        .eq('campana_id', row.id)
        .eq('user_id', user.id)
        .then(function (res) {
          if (res.error) {
            cancelarBtn.disabled = false;
            cancelarBtn.textContent = 'Cancelar inscripción';
            if (statusEl) {
              statusEl.textContent = 'No se pudo cancelar tu inscripción. Intenta de nuevo.';
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

  ready(cargarCampanas);
  ready(wireCarouselArrows);
  ready(setupDetailModal);
})();
