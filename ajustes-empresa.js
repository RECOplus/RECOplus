/**
 * ajustes-empresa.js — Pestaña "Mi empresa" dentro del modal de
 * Ajustes (ajustes-modal.js), visible en CUALQUIER página que ya
 * cargue navbar-auth.js + ajustes-modal.js, cuando la cuenta con
 * sesión activa tiene una fila en la tabla `aliados` (ver
 * supabase-setup.sql y alianzas-registro-modal.js, que es donde se
 * crea esa fila la primera vez).
 *
 * QUÉ HACE:
 * - Al abrir el modal de Ajustes (window.recoAjustes.open), este
 *   script escucha ese mismo evento y consulta `aliados` por el
 *   user_id de la sesión activa.
 * - Si existe fila: inyecta dinámicamente una pestaña más ("Mi
 *   empresa") al lado de Cuenta/Apariencia/Preferencias/Privacidad,
 *   con: tarjeta resumen (logo, nombre, tipo, estado de aprobación),
 *   edición de datos básicos, contacto, ubicación, materiales y
 *   servicios, y una zona de peligro para borrar la empresa
 *   (confirmando al escribir el nombre exacto).
 * - Si NO existe fila (el usuario no tiene empresa registrada), no
 *   se agrega nada: el modal se ve exactamente igual que antes.
 * - Si el usuario borra su empresa, la pestaña se retira del modal
 *   en caliente (sin recargar la página).
 *
 * Capa 100% ADITIVA: no modifica ajustes-modal.js ni ajustes-modal.css.
 * Se engancha por fuera, reutilizando window.recoAjustes / los
 * elementos ya creados por ese script (overlay, .ajustes-modal__tabs,
 * .ajustes-modal__panel), y por eso DEBE cargarse DESPUÉS de
 * ajustes-modal.js.
 *
 * REQUIERE, en cualquier página con ajustes-modal.js:
 *   <link rel="stylesheet" href="ajustes-empresa.css">
 *   ...
 *   <script src="ajustes-modal.js"></script>
 *   <script src="ajustes-empresa.js"></script>
 * (usa window.recoAuth y window.recoSupabase ya inicializados)
 */
(function () {
  'use strict';

  var TAB_KEY = 'miempresa';
  var tabInjected = false;   // true si la pestaña ya está en el DOM del modal
  var currentEmpresa = null; // fila actual de `aliados` (o null)

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var ICON_EMPRESA = '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="14" height="10.5" rx="1.3"/><path d="M7 7V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5V7"/><path d="M3 11.5h14"/></svg>';
  var CHECK_SVG = '<svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.2l3 3 6-6.4"/></svg>';

  /* Mismos catálogos que alianzas-registro-modal.js (mismos ids
     exactos de la tabla `categorias` / columnas de `aliados`), para
     que lo editado aquí quede compatible con el mapa y el escáner. */
  var MATERIALES_DISPONIBLES = [
    { id: 'plastico', nombre: 'Plástico', icono: '🧴' },
    { id: 'vidrio', nombre: 'Vidrio', icono: '🍾' },
    { id: 'metal', nombre: 'Metal', icono: '🥫' },
    { id: 'papel', nombre: 'Papel', icono: '📄' },
    { id: 'carton', nombre: 'Cartón', icono: '📦' },
    { id: 'libros', nombre: 'Libros', icono: '📚' },
    { id: 'electronicos', nombre: 'Electrónicos', icono: '💻' },
    { id: 'celulares', nombre: 'Celulares', icono: '📱' },
    { id: 'baterias', nombre: 'Baterías', icono: '🔋' },
    { id: 'bombillos', nombre: 'Bombillos', icono: '💡' },
    { id: 'ropa', nombre: 'Ropa', icono: '👕' },
    { id: 'tela', nombre: 'Tela', icono: '🧵' },
    { id: 'cuero', nombre: 'Cuero', icono: '🥾' },
    { id: 'muebles', nombre: 'Muebles', icono: '🪑' },
    { id: 'juguetes', nombre: 'Juguetes', icono: '🧸' },
    { id: 'utilesescolares', nombre: 'Útiles escolares', icono: '✏️' },
    { id: 'tetrapak', nombre: 'Tetra Pak', icono: '🧃' },
    { id: 'aceite', nombre: 'Aceite de cocina', icono: '🛢️' }
  ];

  var SERVICIOS_DISPONIBLES = [
    { id: 'compra_materiales', nombre: 'Compra de materiales reciclables', icono: '💰' },
    { id: 'recoleccion_domicilio', nombre: 'Recolección a domicilio', icono: '🚚' },
    { id: 'recoleccion_empresarial', nombre: 'Recolección empresarial', icono: '🏢' },
    { id: 'transporte_residuos', nombre: 'Transporte de residuos', icono: '🚛' },
    { id: 'destruccion_certificada', nombre: 'Destrucción certificada', icono: '🛡️' },
    { id: 'gestion_residuos_electronicos', nombre: 'Gestión de residuos electrónicos', icono: '🖥️' },
    { id: 'asesoria_ambiental', nombre: 'Asesoría ambiental', icono: '🌱' },
    { id: 'educacion_ambiental', nombre: 'Educación ambiental', icono: '🎓' },
    { id: 'venta_materiales_reciclados', nombre: 'Venta de materiales reciclados', icono: '🛒' }
  ];

  var TIPOS_EMPRESA = [
    { valor: 'centro_reciclaje', label: 'Centro de reciclaje' },
    { valor: 'empresa_recicladora', label: 'Empresa recicladora' },
    { valor: 'punto_acopio', label: 'Punto de acopio' },
    { valor: 'transportista', label: 'Transportista de residuos' },
    { valor: 'otro', label: 'Otro' }
  ];

  var PROVINCIAS_PANAMA = [
    'Bocas del Toro', 'Chiriquí', 'Coclé', 'Colón', 'Darién', 'Herrera',
    'Los Santos', 'Panamá', 'Panamá Oeste', 'Veraguas',
    'Comarca Emberá-Wounaan', 'Comarca Guna Yala', 'Comarca Ngäbe-Buglé',
    'Comarca Guna de Madugandí', 'Comarca Guna de Wargandí'
  ];

  var ESTADO_LABEL = {
    pendiente: 'Pendiente de revisión',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado'
  };

  var ESTADO_NOTA = {
    pendiente: 'Tu empresa está en revisión. Aparecerá públicamente en RECO+ en cuanto sea aprobada.',
    aprobado: 'Tu empresa ya es visible públicamente como aliado de RECO+.',
    rechazado: 'Tu registro fue rechazado. Puedes actualizar los datos y quedará pendiente de una nueva revisión.'
  };

  /* ══════════════════════════════════════════════
     RENDER: tarjeta resumen (logo + nombre + tipo + badge estado)
     ══════════════════════════════════════════════ */
  function renderResumen(empresa) {
    var tipoLabel = (TIPOS_EMPRESA.filter(function (t) { return t.valor === empresa.tipo_empresa; })[0] || {}).label || empresa.tipo_empresa || '';
    var estado = empresa.estado || 'pendiente';
    return (
      '<div class="ajemp-card">' +
        '<div class="ajemp-card__logo">' +
          (empresa.logo_url
            ? '<img src="' + esc(empresa.logo_url) + '" alt="Logo">'
            : ICON_EMPRESA) +
        '</div>' +
        '<div class="ajemp-card__info">' +
          '<p class="ajemp-card__nombre">' + esc(empresa.nombre_empresa) + '</p>' +
          '<p class="ajemp-card__tipo">' + esc(tipoLabel) + '</p>' +
        '</div>' +
        '<span class="ajemp-badge" data-estado="' + esc(estado) + '"><span class="ajemp-badge__dot"></span>' + (ESTADO_LABEL[estado] || estado) + '</span>' +
      '</div>' +
      '<p class="ajemp-estado-nota">' + (ESTADO_NOTA[estado] || '') + '</p>'
    );
  }

  /* ══════════════════════════════════════════════
     RENDER: datos básicos (A)
     ══════════════════════════════════════════════ */
  function renderDatosBasicos(empresa) {
    var opciones = TIPOS_EMPRESA.map(function (t) {
      var sel = empresa.tipo_empresa === t.valor ? ' selected' : '';
      return '<option value="' + t.valor + '"' + sel + '>' + t.label + '</option>';
    }).join('');

    return (
      '<div>' +
        '<p class="ajustes-section__title">Datos de la empresa</p>' +
        '<div class="ajustes-field" style="margin-top:10px">' +
          '<label for="ajempNombre">Nombre de la empresa</label>' +
          '<input type="text" id="ajempNombre" class="ajustes-input" maxlength="120" value="' + esc(empresa.nombre_empresa) + '">' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempNombreComercial">Nombre comercial</label>' +
          '<input type="text" id="ajempNombreComercial" class="ajustes-input" maxlength="120" value="' + esc(empresa.nombre_comercial) + '">' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempRuc">Número de registro o RUC</label>' +
          '<input type="text" id="ajempRuc" class="ajustes-input" maxlength="40" value="' + esc(empresa.ruc) + '">' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempTipo">Tipo de empresa</label>' +
          '<select id="ajempTipo" class="ajustes-input">' + opciones + '</select>' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempDescripcion">Descripción</label>' +
          '<textarea id="ajempDescripcion" class="ajustes-input" rows="3" maxlength="600" style="resize:vertical;min-height:76px">' + esc(empresa.descripcion) + '</textarea>' +
        '</div>' +
        '<div>' +
          '<button type="button" class="ajustes-btn ajustes-btn--primario" id="ajempGuardarDatos">Guardar datos</button>' +
        '</div>' +
        '<div class="ajustes-status" id="ajempDatosStatus"></div>' +
      '</div>'
    );
  }

  /* ══════════════════════════════════════════════
     RENDER: contacto (F)
     ══════════════════════════════════════════════ */
  function renderContacto(empresa) {
    return (
      '<div>' +
        '<p class="ajustes-section__title">Contacto</p>' +
        '<div class="ajustes-field" style="margin-top:10px">' +
          '<label for="ajempTelefono">Teléfono</label>' +
          '<input type="tel" id="ajempTelefono" class="ajustes-input" maxlength="30" value="' + esc(empresa.telefono) + '">' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempWhatsapp">WhatsApp</label>' +
          '<input type="tel" id="ajempWhatsapp" class="ajustes-input" maxlength="30" value="' + esc(empresa.whatsapp) + '">' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempSitioWeb">Sitio web</label>' +
          '<input type="text" id="ajempSitioWeb" class="ajustes-input" maxlength="160" value="' + esc(empresa.sitio_web) + '">' +
        '</div>' +
        '<div>' +
          '<button type="button" class="ajustes-btn ajustes-btn--primario" id="ajempGuardarContacto">Guardar contacto</button>' +
        '</div>' +
        '<div class="ajustes-status" id="ajempContactoStatus"></div>' +
      '</div>'
    );
  }

  /* ══════════════════════════════════════════════
     RENDER: ubicación (E)
     ══════════════════════════════════════════════ */
  function renderUbicacion(empresa) {
    var opciones = PROVINCIAS_PANAMA.map(function (p) {
      var sel = empresa.provincia === p ? ' selected' : '';
      return '<option value="' + p + '"' + sel + '>' + p + '</option>';
    }).join('');

    return (
      '<div>' +
        '<p class="ajustes-section__title">Ubicación</p>' +
        '<div class="ajustes-field" style="margin-top:10px">' +
          '<label for="ajempProvincia">Provincia o comarca</label>' +
          '<select id="ajempProvincia" class="ajustes-input">' + opciones + '</select>' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempDistrito">Distrito o ciudad</label>' +
          '<input type="text" id="ajempDistrito" class="ajustes-input" maxlength="80" value="' + esc(empresa.distrito) + '">' +
        '</div>' +
        '<div class="ajustes-field">' +
          '<label for="ajempDireccion">Dirección completa</label>' +
          '<textarea id="ajempDireccion" class="ajustes-input" rows="2" maxlength="240" style="resize:vertical;min-height:60px">' + esc(empresa.direccion) + '</textarea>' +
        '</div>' +
        '<div>' +
          '<button type="button" class="ajustes-btn ajustes-btn--primario" id="ajempGuardarUbicacion">Guardar ubicación</button>' +
        '</div>' +
        '<div class="ajustes-status" id="ajempUbicacionStatus"></div>' +
      '</div>'
    );
  }

  /* ══════════════════════════════════════════════
     RENDER: materiales y servicios (C) — chips + lista
     ══════════════════════════════════════════════ */
  function renderMaterialesServicios(empresa) {
    var materialesSel = empresa.materiales || [];
    var chipsMateriales = MATERIALES_DISPONIBLES.map(function (m) {
      var activo = materialesSel.indexOf(m.id) !== -1;
      return (
        '<button type="button" class="ajemp-chip' + (activo ? ' ajemp-chip--active' : '') + '" data-material-id="' + m.id + '" aria-pressed="' + (activo ? 'true' : 'false') + '">' +
          '<span class="ajemp-chip__icon">' + m.icono + '</span><span>' + m.nombre + '</span>' +
        '</button>'
      );
    }).join('');

    var serviciosSel = empresa.servicios || [];
    var itemsServicios = SERVICIOS_DISPONIBLES.map(function (s) {
      var activo = serviciosSel.indexOf(s.id) !== -1;
      return (
        '<button type="button" class="ajemp-check-item' + (activo ? ' ajemp-check-item--active' : '') + '" data-servicio-id="' + s.id + '" aria-pressed="' + (activo ? 'true' : 'false') + '">' +
          '<span class="ajemp-check-item__box">' + CHECK_SVG + '</span>' +
          '<span class="ajemp-check-item__icon">' + s.icono + '</span>' +
          '<span class="ajemp-check-item__label">' + s.nombre + '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div>' +
        '<p class="ajustes-section__title">Materiales que reciben</p>' +
        '<div class="ajemp-chip-head" style="margin-top:10px">' +
          '<span class="ajemp-chip-count" id="ajempMaterialesCount">' + materialesSel.length + ' seleccionados</span>' +
        '</div>' +
        '<div class="ajemp-chip-grid" id="ajempMaterialesGrid">' + chipsMateriales + '</div>' +
        '<hr class="ajustes-divider" style="margin:16px 0">' +
        '<p class="ajustes-section__title">Servicios que ofrecen</p>' +
        '<div class="ajemp-chip-head" style="margin-top:10px">' +
          '<span class="ajemp-chip-count" id="ajempServiciosCount">' + serviciosSel.length + ' seleccionados</span>' +
        '</div>' +
        '<div class="ajemp-check-list" id="ajempServiciosList">' + itemsServicios + '</div>' +
        '<div style="margin-top:14px">' +
          '<button type="button" class="ajustes-btn ajustes-btn--primario" id="ajempGuardarMatServ">Guardar materiales y servicios</button>' +
        '</div>' +
        '<div class="ajustes-status" id="ajempMatServStatus"></div>' +
      '</div>'
    );
  }

  /* ══════════════════════════════════════════════
     RENDER: zona de peligro — borrar empresa (confirmando nombre)
     ══════════════════════════════════════════════ */
  function renderBorrarEmpresa(empresa) {
    return (
      '<div class="ajustes-danger-zone">' +
        '<div>' +
          '<p class="ajustes-row__label" style="color:#c23a2a">Borrar empresa</p>' +
          '<p class="ajustes-row__desc">Esta acción es permanente: se eliminará el perfil de tu empresa de RECO+ (incluyendo logo y fotos) y dejará de aparecer como aliado. Tu cuenta de usuario NO se elimina.</p>' +
        '</div>' +
        '<div class="ajustes-field ajemp-confirm-input">' +
          '<label for="ajempConfirmNombre">Escribe <span class="ajemp-confirm-nombre">' + esc(empresa.nombre_empresa) + '</span> para confirmar</label>' +
          '<input type="text" id="ajempConfirmNombre" class="ajustes-input" placeholder="' + esc(empresa.nombre_empresa) + '" autocomplete="off">' +
        '</div>' +
        '<button type="button" class="ajustes-btn ajustes-btn--peligro" id="ajempBorrarBtn" disabled>Borrar empresa</button>' +
        '<div class="ajustes-status" id="ajempBorrarStatus"></div>' +
      '</div>'
    );
  }

  /* ══════════════════════════════════════════════
     RENDER: sección completa de la pestaña
     ══════════════════════════════════════════════ */
  function renderSeccionEmpresa(empresa) {
    return (
      '<section class="ajustes-section" data-section="' + TAB_KEY + '">' +
        renderResumen(empresa) +
        '<hr class="ajustes-divider">' +
        renderDatosBasicos(empresa) +
        '<hr class="ajustes-divider">' +
        renderContacto(empresa) +
        '<hr class="ajustes-divider">' +
        renderUbicacion(empresa) +
        '<hr class="ajustes-divider">' +
        renderMaterialesServicios(empresa) +
        '<hr class="ajustes-divider">' +
        renderBorrarEmpresa(empresa) +
      '</section>'
    );
  }

  /* ══════════════════════════════════════════════
     HELPERS de guardado
     ══════════════════════════════════════════════ */
  function mostrarStatus(el, tipo, mensaje) {
    if (!el) return;
    el.textContent = mensaje;
    el.setAttribute('data-tipo', tipo);
    el.setAttribute('data-visible', 'true');
    if (tipo === 'ok') {
      setTimeout(function () { el.setAttribute('data-visible', 'false'); }, 3000);
    }
  }

  function traducirError(err) {
    if (!err) return 'Ocurrió un error inesperado. Intenta de nuevo.';
    var msg = (err.message || '').toLowerCase();
    if (msg.indexOf('row-level security') !== -1 || msg.indexOf('policy') !== -1) return 'No se pudo guardar por un problema de permisos.';
    if (msg.indexOf('network') !== -1 || msg.indexOf('fetch') !== -1) return 'No se pudo conectar. Revisa tu conexión a internet.';
    return err.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  function actualizarFilaEmpresa(userId, payload, btn, statusEl, textoOriginal, onOk) {
    var client = window.recoSupabase;
    if (!client) {
      mostrarStatus(statusEl, 'error', 'Servicio no disponible.');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Guardando...';
    client.from('aliados').update(payload).eq('user_id', userId).then(function (res) {
      btn.disabled = false;
      btn.textContent = textoOriginal;
      if (res.error) {
        mostrarStatus(statusEl, 'error', traducirError(res.error));
        return;
      }
      mostrarStatus(statusEl, 'ok', 'Guardado correctamente.');
      if (onOk) onOk();
    }).catch(function (err) {
      btn.disabled = false;
      btn.textContent = textoOriginal;
      mostrarStatus(statusEl, 'error', traducirError(err));
    });
  }

  /* ══════════════════════════════════════════════
     WIRE: conecta todos los botones/chips de la sección
     ══════════════════════════════════════════════ */
  function wireSeccionEmpresa(seccionEl, userId, empresa) {
    // Datos básicos
    var btnDatos = seccionEl.querySelector('#ajempGuardarDatos');
    var statusDatos = seccionEl.querySelector('#ajempDatosStatus');
    btnDatos.addEventListener('click', function () {
      var payload = {
        nombre_empresa: seccionEl.querySelector('#ajempNombre').value.trim(),
        nombre_comercial: seccionEl.querySelector('#ajempNombreComercial').value.trim() || null,
        ruc: seccionEl.querySelector('#ajempRuc').value.trim(),
        tipo_empresa: seccionEl.querySelector('#ajempTipo').value,
        descripcion: seccionEl.querySelector('#ajempDescripcion').value.trim()
      };
      actualizarFilaEmpresa(userId, payload, btnDatos, statusDatos, 'Guardar datos', function () {
        empresa.nombre_empresa = payload.nombre_empresa;
        empresa.nombre_comercial = payload.nombre_comercial;
        empresa.ruc = payload.ruc;
        empresa.tipo_empresa = payload.tipo_empresa;
        empresa.descripcion = payload.descripcion;
        // El nombre puede cambiar: refresca la tarjeta resumen y el
        // placeholder de confirmación de borrado para que sigan
        // mostrando el nombre actual sin tener que reabrir el modal.
        var tarjeta = seccionEl.querySelector('.ajemp-card');
        var nombreEl = tarjeta && tarjeta.querySelector('.ajemp-card__nombre');
        if (nombreEl) nombreEl.textContent = payload.nombre_empresa;
        var confirmLabel = seccionEl.querySelector('.ajemp-confirm-nombre');
        if (confirmLabel) confirmLabel.textContent = payload.nombre_empresa;
        var confirmInput = seccionEl.querySelector('#ajempConfirmNombre');
        if (confirmInput) confirmInput.setAttribute('placeholder', payload.nombre_empresa);
      });
    });

    // Contacto
    var btnContacto = seccionEl.querySelector('#ajempGuardarContacto');
    var statusContacto = seccionEl.querySelector('#ajempContactoStatus');
    btnContacto.addEventListener('click', function () {
      var payload = {
        telefono: seccionEl.querySelector('#ajempTelefono').value.trim(),
        whatsapp: seccionEl.querySelector('#ajempWhatsapp').value.trim() || null,
        sitio_web: seccionEl.querySelector('#ajempSitioWeb').value.trim() || null
      };
      actualizarFilaEmpresa(userId, payload, btnContacto, statusContacto, 'Guardar contacto');
    });

    // Ubicación
    var btnUbicacion = seccionEl.querySelector('#ajempGuardarUbicacion');
    var statusUbicacion = seccionEl.querySelector('#ajempUbicacionStatus');
    btnUbicacion.addEventListener('click', function () {
      var payload = {
        provincia: seccionEl.querySelector('#ajempProvincia').value,
        distrito: seccionEl.querySelector('#ajempDistrito').value.trim(),
        direccion: seccionEl.querySelector('#ajempDireccion').value.trim()
      };
      actualizarFilaEmpresa(userId, payload, btnUbicacion, statusUbicacion, 'Guardar ubicación');
    });

    // Materiales (chips)
    var gridMateriales = seccionEl.querySelector('#ajempMaterialesGrid');
    var countMateriales = seccionEl.querySelector('#ajempMaterialesCount');
    gridMateriales.addEventListener('click', function (e) {
      var chip = e.target.closest('.ajemp-chip');
      if (!chip) return;
      var activo = chip.classList.toggle('ajemp-chip--active');
      chip.setAttribute('aria-pressed', activo ? 'true' : 'false');
      countMateriales.textContent = gridMateriales.querySelectorAll('.ajemp-chip--active').length + ' seleccionados';
    });

    // Servicios (checklist)
    var listServicios = seccionEl.querySelector('#ajempServiciosList');
    var countServicios = seccionEl.querySelector('#ajempServiciosCount');
    listServicios.addEventListener('click', function (e) {
      var item = e.target.closest('.ajemp-check-item');
      if (!item) return;
      var activo = item.classList.toggle('ajemp-check-item--active');
      item.setAttribute('aria-pressed', activo ? 'true' : 'false');
      countServicios.textContent = listServicios.querySelectorAll('.ajemp-check-item--active').length + ' seleccionados';
    });

    // Guardar materiales + servicios juntos
    var btnMatServ = seccionEl.querySelector('#ajempGuardarMatServ');
    var statusMatServ = seccionEl.querySelector('#ajempMatServStatus');
    btnMatServ.addEventListener('click', function () {
      var materiales = [];
      gridMateriales.querySelectorAll('.ajemp-chip--active').forEach(function (chip) {
        materiales.push(chip.getAttribute('data-material-id'));
      });
      var servicios = [];
      listServicios.querySelectorAll('.ajemp-check-item--active').forEach(function (item) {
        servicios.push(item.getAttribute('data-servicio-id'));
      });
      actualizarFilaEmpresa(userId, { materiales: materiales, servicios: servicios }, btnMatServ, statusMatServ, 'Guardar materiales y servicios');
    });

    // Borrar empresa: el botón solo se habilita si el texto escrito
    // coincide EXACTO con el nombre actual de la empresa.
    var confirmInput = seccionEl.querySelector('#ajempConfirmNombre');
    var borrarBtn = seccionEl.querySelector('#ajempBorrarBtn');
    var borrarStatus = seccionEl.querySelector('#ajempBorrarStatus');

    confirmInput.addEventListener('input', function () {
      borrarBtn.disabled = confirmInput.value.trim() !== (empresa.nombre_empresa || '').trim();
    });

    borrarBtn.addEventListener('click', function () {
      if (confirmInput.value.trim() !== (empresa.nombre_empresa || '').trim()) return;
      var client = window.recoSupabase;
      if (!client) {
        mostrarStatus(borrarStatus, 'error', 'Servicio no disponible.');
        return;
      }
      borrarBtn.disabled = true;
      borrarBtn.textContent = 'Borrando...';
      confirmInput.disabled = true;

      client.from('aliados').delete().eq('user_id', userId).then(function (res) {
        if (res.error) {
          borrarBtn.disabled = false;
          borrarBtn.textContent = 'Borrar empresa';
          confirmInput.disabled = false;
          mostrarStatus(borrarStatus, 'error', traducirError(res.error));
          return;
        }
        // Éxito: retira la pestaña "Mi empresa" del modal en caliente
        // y vuelve a la pestaña de Cuenta para no dejar al usuario
        // mirando una sección que ya no debería existir.
        currentEmpresa = null;
        quitarPestanaEmpresa();
      }).catch(function (err) {
        borrarBtn.disabled = false;
        borrarBtn.textContent = 'Borrar empresa';
        confirmInput.disabled = false;
        mostrarStatus(borrarStatus, 'error', traducirError(err));
      });
    });
  }

  /* ══════════════════════════════════════════════
     INYECCIÓN de la pestaña "Mi empresa" en el modal
     ─────────────────────────────────────────────
     ajustes-modal.js ya construyó su propio overlay/tabs/panel
     antes de que este script actúe (se engancha al mismo evento de
     apertura). Insertamos el botón de pestaña y la sección al
     final de los contenedores ya existentes, y conectamos el click
     nosotros mismos (wireTabs de ajustes-modal.js solo conocía las
     4 pestañas originales al momento de construir el modal).
     ══════════════════════════════════════════════ */
  function insertarPestanaEmpresa(overlay, empresa) {
    var tabsNav = overlay.querySelector('.ajustes-modal__tabs');
    var panel = overlay.querySelector('.ajustes-modal__panel');
    if (!tabsNav || !panel) return;

    var tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'ajustes-tab';
    tabBtn.setAttribute('data-tab', TAB_KEY);
    tabBtn.setAttribute('data-active', 'false');
    tabBtn.innerHTML = ICON_EMPRESA + '<span>Mi empresa</span>';
    tabsNav.appendChild(tabBtn);

    var wrapper = document.createElement('div');
    wrapper.innerHTML = renderSeccionEmpresa(empresa);
    var seccionEl = wrapper.firstElementChild;
    panel.appendChild(seccionEl);

    // Activar esta pestaña también desactiva las demás (mismo
    // comportamiento que wireTabs original de ajustes-modal.js).
    tabBtn.addEventListener('click', function () {
      overlay.querySelectorAll('.ajustes-tab').forEach(function (t) {
        t.setAttribute('data-active', t === tabBtn ? 'true' : 'false');
      });
      overlay.querySelectorAll('.ajustes-section').forEach(function (s) {
        s.setAttribute('data-active', s === seccionEl ? 'true' : 'false');
      });
    });

    var userId = empresa.user_id;
    wireSeccionEmpresa(seccionEl, userId, empresa);

    // Traduce cualquier data-i18n que hubiera quedado (no usamos
    // i18n en esta pestaña por ahora, pero mantenemos el mismo
    // patrón que ajustes-modal.js por si se agrega más adelante).
    if (typeof window.applyLang === 'function' && typeof window.currentLang === 'function') {
      window.applyLang(window.currentLang());
    }

    tabInjected = true;
  }

  function quitarPestanaEmpresa() {
    if (!window.__recoAjustesOverlayEl) return;
    var overlay = window.__recoAjustesOverlayEl;
    var tab = overlay.querySelector('.ajustes-tab[data-tab="' + TAB_KEY + '"]');
    var seccion = overlay.querySelector('.ajustes-section[data-section="' + TAB_KEY + '"]');
    var eraActiva = tab && tab.getAttribute('data-active') === 'true';
    if (tab) tab.remove();
    if (seccion) seccion.remove();
    tabInjected = false;
    if (eraActiva) {
      // Si la pestaña borrada estaba activa, vuelve a "Cuenta" para
      // no dejar el modal sin ninguna sección visible.
      var tabCuenta = overlay.querySelector('.ajustes-tab[data-tab="cuenta"]');
      if (tabCuenta) tabCuenta.click();
    }
  }

  /* ══════════════════════════════════════════════
     ENGANCHE: cada vez que se abre el modal de Ajustes, se
     consulta si el usuario tiene empresa y se inyecta/actualiza la
     pestaña. Como ajustes-modal.js no emite un evento propio de
     "abierto", envolvemos window.recoAjustes.open manteniendo su
     comportamiento original intacto.
     ══════════════════════════════════════════════ */
  function consultarYSincronizar() {
    if (!window.recoAuth || !window.recoSupabase) return;
    var getSesion = window.recoAuth.getVerifiedSession || window.recoAuth.getSession;
    getSesion().then(function (session) {
      if (!session || !session.user) {
        if (tabInjected) quitarPestanaEmpresa();
        return;
      }
      window.recoSupabase.from('aliados').select('*').eq('user_id', session.user.id).maybeSingle().then(function (res) {
        var overlay = window.__recoAjustesOverlayEl;
        if (!overlay) return;
        if (res.data) {
          currentEmpresa = res.data;
          if (tabInjected) {
            var seccionVieja = overlay.querySelector('.ajustes-section[data-section="' + TAB_KEY + '"]');
            var eraActiva = seccionVieja && seccionVieja.getAttribute('data-active') === 'true';
            quitarPestanaEmpresa();
            insertarPestanaEmpresa(overlay, currentEmpresa);
            if (eraActiva) {
              var tabNueva = overlay.querySelector('.ajustes-tab[data-tab="' + TAB_KEY + '"]');
              if (tabNueva) tabNueva.click();
            }
          } else {
            insertarPestanaEmpresa(overlay, currentEmpresa);
          }
        } else if (tabInjected) {
          quitarPestanaEmpresa();
        }
      }).catch(function () { /* si falla la consulta, no se muestra la pestaña */ });
    }).catch(function () { /* sin sesión verificable, no se muestra la pestaña */ });
  }

  ready(function () {
    // Espera a que ajustes-modal.js haya definido window.recoAjustes
    // (se carga justo antes que este script, ver requisitos arriba).
    if (!window.recoAjustes || typeof window.recoAjustes.open !== 'function') {
      console.error('[RECO+] recoAjustes no está disponible. Revisa que ajustes-modal.js se cargó antes que ajustes-empresa.js.');
      return;
    }

    var openOriginal = window.recoAjustes.open;
    window.recoAjustes.open = function () {
      openOriginal();
      // El overlay de ajustes-modal.js no se expone globalmente, así
      // que lo localizamos por su clase apenas se abre (ya existe en
      // el DOM porque openOriginal() ya llamó a buildModal()).
      window.__recoAjustesOverlayEl = document.querySelector('.ajustes-overlay');
      consultarYSincronizar();
    };
  });
})();
