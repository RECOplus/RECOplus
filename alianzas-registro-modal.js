/**
 * alianzas-registro-modal.js — Ventana modal de registro de
 * empresa/aliado en alianzas.html, abierta desde el botón
 * "Registrarse →" de la tarjeta "Registra tu empresa o fundación"
 * (id="btnRegistrarEmpresaAliado").
 *
 * Formulario en VARIOS PASOS, cada uno su propia "ventana" dentro
 * del mismo modal: no se puede avanzar al siguiente sin completar
 * correctamente el actual. Los datos de cada paso quedan guardados
 * en memoria (RAE_STATE) mientras el modal sigue abierto, así que
 * si el usuario retrocede no pierde lo ya escrito.
 *
 * ESTADO ACTUAL: Pasos 1–9 de 9 implementados — formulario COMPLETO
 * (información de la empresa, contacto, ubicación, materiales que
 * reciben, servicios que ofrecen, horarios, información operativa,
 * cuenta de acceso e información opcional). Los ids de materiales
 * son EXACTAMENTE los de la tabla `categorias` en Supabase (los
 * mismos 18 que usan el escáner y los filtros del mapa — ver
 * material-map.js y mapa-more-filters.js), así que un aliado
 * registrado aquí queda compatible automáticamente con esos
 * filtros.
 *
 * UNA EMPRESA POR CUENTA: `aliados.user_id` es UNIQUE en la base de
 * datos (ver supabase-setup.sql), así que un mismo usuario nunca
 * puede tener dos filas de aliado. Antes de este cambio, si alguien
 * con una empresa ya registrada volvía a hacer clic en
 * "Registrarse →", llenaba el formulario completo de 9 pasos y
 * recién al final se enteraba (con un error crudo de "duplicate
 * key"). Ahora, justo después de confirmar la sesión activa
 * (requireSesionYAbrir) y ANTES de abrir el formulario, se consulta
 * si ese user_id ya tiene una fila en `aliados`. Si ya existe, se
 * muestra un aviso corto en vez del formulario, con un acceso
 * directo a Ajustes de cuenta (window.recoAjustes.open(), inyectado
 * por ajustes-modal.js) para que pueda revisar o gestionar su
 * cuenta/perfil de empresa desde ahí. Ver abrirAvisoYaRegistrado().
 *
 * Capa 100% aditiva: no modifica alianzas.html más allá del id ya
 * agregado al botón, ni ningún otro script del sitio.
 *
 * REQUIERE en alianzas.html:
 *   <link rel="stylesheet" href="alianzas-registro-modal.css">
 *   ...
 *   <script src="alianzas-registro-modal.js"></script>
 */
(function () {
  'use strict';

  // Total de pasos planeados para todo el flujo (aunque todavía no
  // estén todos implementados en RAE_STEPS). Se usa solo para
  // mostrar "Paso X de 9" y el ancho de la barra de progreso.
  var TOTAL_PASOS_PLANEADOS = 9;

  var overlayEl = null;
  var modalBuilt = false;
  var currentStepIndex = 0;
  var RAE_STATE = {}; // { empresa: {...}, contacto: {...}, ... } — un objeto por paso
  var registroCompletado = false; // true tras un envío final exitoso a Supabase
  var RAE_SESION_ACTUAL = null; // sesión de Supabase Auth vigente al abrir el modal (ver requireSesionYAbrir)

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

  /* ══════════════════════════════════════════════
     PASO 1 — INFORMACIÓN DE LA EMPRESA
     ══════════════════════════════════════════════ */
  var TIPOS_EMPRESA = [
    { valor: 'centro_reciclaje', label: 'Centro de reciclaje' },
    { valor: 'empresa_recicladora', label: 'Empresa recicladora' },
    { valor: 'punto_acopio', label: 'Punto de acopio' },
    { valor: 'transportista', label: 'Transportista de residuos' },
    { valor: 'otro', label: 'Otro' }
  ];

  function renderPasoEmpresa(data) {
    data = data || {};
    var anioActual = new Date().getFullYear();
    var opciones = TIPOS_EMPRESA.map(function (t) {
      var sel = data.tipoEmpresa === t.valor ? ' selected' : '';
      return '<option value="' + t.valor + '"' + sel + '>' + t.label + '</option>';
    }).join('');

    return (
      '<div class="rae-step" data-step="empresa">' +
        '<p class="rae-step__desc">Cuéntanos sobre tu empresa o centro de reciclaje para darlo de alta como aliado en RECO+.</p>' +

        '<div class="rae-field">' +
          '<label for="raeNombreEmpresa">Nombre de la empresa o centro de reciclaje <span class="rae-required">*</span></label>' +
          '<input type="text" id="raeNombreEmpresa" class="rae-input" placeholder="Ej. EcoRecicla Panamá" maxlength="120" value="' + esc(data.nombreEmpresa) + '">' +
          '<span class="rae-error" id="raeNombreEmpresaError">Ingresa el nombre de la empresa.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeNombreComercial">Nombre comercial <span class="rae-optional">(si es diferente)</span></label>' +
          '<input type="text" id="raeNombreComercial" class="rae-input" placeholder="Ej. EcoR" maxlength="120" value="' + esc(data.nombreComercial) + '">' +
        '</div>' +

        '<div class="rae-row">' +
          '<div class="rae-field">' +
            '<label for="raeRUC">Número de registro o RUC <span class="rae-required">*</span></label>' +
            '<input type="text" id="raeRUC" class="rae-input" placeholder="Ej. 8-888-8888" maxlength="40" value="' + esc(data.ruc) + '">' +
            '<span class="rae-error" id="raeRUCError">Ingresa el número de registro o RUC.</span>' +
          '</div>' +
          '<div class="rae-field">' +
            '<label for="raeAnioFundacion">Año de fundación <span class="rae-optional">(opcional)</span></label>' +
            '<input type="number" id="raeAnioFundacion" class="rae-input" placeholder="Ej. 2018" min="1900" max="' + anioActual + '" value="' + esc(data.anioFundacion) + '">' +
            '<span class="rae-error" id="raeAnioFundacionError">Ingresa un año válido (1900–' + anioActual + ').</span>' +
          '</div>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeTipoEmpresa">Tipo de empresa <span class="rae-required">*</span></label>' +
          '<select id="raeTipoEmpresa" class="rae-input">' +
            '<option value="">Selecciona un tipo</option>' +
            opciones +
          '</select>' +
          '<span class="rae-error" id="raeTipoEmpresaError">Selecciona el tipo de empresa.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeDescripcion">Descripción de la empresa <span class="rae-required">*</span></label>' +
          '<textarea id="raeDescripcion" class="rae-input rae-textarea" placeholder="Cuéntanos a qué se dedica tu empresa, qué la hace diferente y cómo colabora con la comunidad..." maxlength="600">' + esc(data.descripcion) + '</textarea>' +
          '<span class="rae-hint" id="raeDescripcionHint">' + (data.descripcion ? data.descripcion.length : 0) + ' / 600 (mínimo 20 caracteres)</span>' +
          '<span class="rae-error" id="raeDescripcionError">Escribe una descripción de al menos 20 caracteres.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label>Logo de la empresa <span class="rae-optional">(opcional)</span></label>' +
          '<div class="rae-logo-row">' +
            '<div class="rae-logo-preview" id="raeLogoPreview">' +
              (data.logoDataUrl
                ? '<img src="' + data.logoDataUrl + '" alt="Logo de la empresa">'
                : '<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="4" width="15" height="12" rx="1.5"/><circle cx="7" cy="8.5" r="1.4"/><path d="M17.5 13.5l-4-4-3 3-2.5-2.5-5.5 5.5"/></svg>') +
            '</div>' +
            '<div class="rae-logo-actions">' +
              '<button type="button" class="rae-btn rae-btn--sm" id="raeLogoBtn">' + (data.logoDataUrl ? 'Cambiar logo' : 'Subir logo') + '</button>' +
              '<button type="button" class="rae-btn rae-btn--sm rae-btn--ghost" id="raeLogoRemoveBtn" style="' + (data.logoDataUrl ? '' : 'display:none') + '">Quitar</button>' +
              '<input type="file" id="raeLogoInput" accept="image/png,image/jpeg,image/webp" style="display:none">' +
              '<p class="rae-hint" id="raeLogoHint">PNG, JPG o WEBP, hasta 3 MB.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePasoEmpresa(container, stateSlice) {
    var descInput = container.querySelector('#raeDescripcion');
    var descHint = container.querySelector('#raeDescripcionHint');
    var logoBtn = container.querySelector('#raeLogoBtn');
    var logoRemoveBtn = container.querySelector('#raeLogoRemoveBtn');
    var logoInput = container.querySelector('#raeLogoInput');
    var logoPreview = container.querySelector('#raeLogoPreview');
    var logoHint = container.querySelector('#raeLogoHint');

    // Contador de caracteres de la descripción
    function actualizarContadorDesc() {
      var len = descInput.value.length;
      descHint.textContent = len + ' / 600 (mínimo 20 caracteres)';
      descHint.classList.toggle('rae-hint--limit', len >= 580);
    }
    descInput.addEventListener('input', actualizarContadorDesc);
    actualizarContadorDesc();

    // Limpia el error de un campo apenas el usuario corrige
    ['raeNombreEmpresa', 'raeRUC', 'raeTipoEmpresa', 'raeAnioFundacion', 'raeDescripcion'].forEach(function (id) {
      var el = container.querySelector('#' + id);
      if (!el) return;
      el.addEventListener('input', function () { limpiarError(container, id); });
      el.addEventListener('change', function () { limpiarError(container, id); });
    });

    // Logo: click en "Subir/Cambiar logo" abre el selector de archivo
    logoBtn.addEventListener('click', function () { logoInput.click(); });

    logoInput.addEventListener('change', function () {
      var file = logoInput.files && logoInput.files[0];
      if (!file) return;

      logoHint.textContent = 'PNG, JPG o WEBP, hasta 3 MB.';
      logoHint.classList.remove('rae-hint--limit');

      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        logoHint.textContent = 'Formato no válido. Usa PNG, JPG o WEBP.';
        logoHint.classList.add('rae-hint--limit');
        logoInput.value = '';
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        logoHint.textContent = 'El archivo pesa más de 3 MB. Elige uno más liviano.';
        logoHint.classList.add('rae-hint--limit');
        logoInput.value = '';
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        stateSlice.logoDataUrl = e.target.result;
        stateSlice.logoFileName = file.name;
        logoPreview.innerHTML = '<img src="' + stateSlice.logoDataUrl + '" alt="Logo de la empresa">';
        logoBtn.textContent = 'Cambiar logo';
        logoRemoveBtn.style.display = '';
      };
      reader.readAsDataURL(file);
    });

    logoRemoveBtn.addEventListener('click', function () {
      stateSlice.logoDataUrl = null;
      stateSlice.logoFileName = null;
      logoInput.value = '';
      logoPreview.innerHTML = '<svg viewBox="0 0 20 20" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="4" width="15" height="12" rx="1.5"/><circle cx="7" cy="8.5" r="1.4"/><path d="M17.5 13.5l-4-4-3 3-2.5-2.5-5.5 5.5"/></svg>';
      logoBtn.textContent = 'Subir logo';
      logoRemoveBtn.style.display = 'none';
    });
  }

  function limpiarError(container, inputId) {
    var input = container.querySelector('#' + inputId);
    var error = container.querySelector('#' + inputId + 'Error');
    if (input) input.classList.remove('rae-input--invalid');
    if (error) error.setAttribute('data-visible', 'false');
  }

  function marcarError(container, inputId) {
    var input = container.querySelector('#' + inputId);
    var error = container.querySelector('#' + inputId + 'Error');
    if (input) input.classList.add('rae-input--invalid');
    if (error) error.setAttribute('data-visible', 'true');
  }

  function validarPasoEmpresa(container) {
    var nombre = container.querySelector('#raeNombreEmpresa').value.trim();
    var ruc = container.querySelector('#raeRUC').value.trim();
    var tipo = container.querySelector('#raeTipoEmpresa').value;
    var anioInput = container.querySelector('#raeAnioFundacion');
    var anio = anioInput.value.trim();
    var descripcion = container.querySelector('#raeDescripcion').value.trim();
    var anioActual = new Date().getFullYear();

    var valido = true;

    if (!nombre) { marcarError(container, 'raeNombreEmpresa'); valido = false; }
    else { limpiarError(container, 'raeNombreEmpresa'); }

    if (!ruc) { marcarError(container, 'raeRUC'); valido = false; }
    else { limpiarError(container, 'raeRUC'); }

    if (!tipo) { marcarError(container, 'raeTipoEmpresa'); valido = false; }
    else { limpiarError(container, 'raeTipoEmpresa'); }

    if (anio) {
      var anioNum = parseInt(anio, 10);
      if (isNaN(anioNum) || anioNum < 1900 || anioNum > anioActual) {
        marcarError(container, 'raeAnioFundacion');
        valido = false;
      } else {
        limpiarError(container, 'raeAnioFundacion');
      }
    } else {
      limpiarError(container, 'raeAnioFundacion');
    }

    if (descripcion.length < 20) { marcarError(container, 'raeDescripcion'); valido = false; }
    else { limpiarError(container, 'raeDescripcion'); }

    return valido;
  }

  function recolectarPasoEmpresa(container, stateSlice) {
    stateSlice.nombreEmpresa = container.querySelector('#raeNombreEmpresa').value.trim();
    stateSlice.nombreComercial = container.querySelector('#raeNombreComercial').value.trim();
    stateSlice.ruc = container.querySelector('#raeRUC').value.trim();
    stateSlice.tipoEmpresa = container.querySelector('#raeTipoEmpresa').value;
    var anio = container.querySelector('#raeAnioFundacion').value.trim();
    stateSlice.anioFundacion = anio ? parseInt(anio, 10) : null;
    stateSlice.descripcion = container.querySelector('#raeDescripcion').value.trim();
    // logoDataUrl / logoFileName ya se guardan directamente en
    // stateSlice desde wirePasoEmpresa apenas se selecciona el archivo.
    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 2 — INFORMACIÓN DE CONTACTO
     ══════════════════════════════════════════════ */
  function renderPasoContacto(data) {
    data = data || {};
    return (
      '<div class="rae-step" data-step="contacto">' +
        '<p class="rae-step__desc">¿Cómo puede contactar la comunidad de RECO+ a tu empresa?</p>' +

        '<div class="rae-field">' +
          '<label for="raeEmailContacto">Correo electrónico <span class="rae-required">*</span></label>' +
          '<input type="email" id="raeEmailContacto" class="rae-input" placeholder="contacto@tuempresa.com" maxlength="140" value="' + esc(data.email) + '">' +
          '<span class="rae-error" id="raeEmailContactoError">Ingresa un correo electrónico válido.</span>' +
        '</div>' +

        '<div class="rae-row">' +
          '<div class="rae-field">' +
            '<label for="raeTelefonoContacto">Número de teléfono <span class="rae-required">*</span></label>' +
            '<input type="tel" id="raeTelefonoContacto" class="rae-input" placeholder="+507 6000-0000" maxlength="30" value="' + esc(data.telefono) + '">' +
            '<span class="rae-error" id="raeTelefonoContactoError">Ingresa un número de teléfono válido.</span>' +
          '</div>' +
          '<div class="rae-field">' +
            '<label for="raeWhatsappContacto">WhatsApp <span class="rae-optional">(opcional)</span></label>' +
            '<input type="tel" id="raeWhatsappContacto" class="rae-input" placeholder="+507 6000-0000" maxlength="30" value="' + esc(data.whatsapp) + '">' +
            '<span class="rae-error" id="raeWhatsappContactoError">Ingresa un número de WhatsApp válido.</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="rae-btn rae-btn--sm rae-btn--ghost" id="raeWhatsappIgual" style="margin:-8px 0 16px;align-self:flex-start">Usar el mismo número que el teléfono</button>' +

        '<div class="rae-field">' +
          '<label for="raeSitioWebContacto">Sitio web <span class="rae-optional">(opcional)</span></label>' +
          '<input type="text" id="raeSitioWebContacto" class="rae-input" placeholder="www.tuempresa.com" maxlength="160" value="' + esc(data.sitioWeb) + '">' +
          '<span class="rae-error" id="raeSitioWebContactoError">Ingresa un sitio web válido.</span>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePasoContacto(container) {
    ['raeEmailContacto', 'raeTelefonoContacto', 'raeWhatsappContacto', 'raeSitioWebContacto'].forEach(function (id) {
      var el = container.querySelector('#' + id);
      if (!el) return;
      el.addEventListener('input', function () { limpiarError(container, id); });
    });

    var telInput = container.querySelector('#raeTelefonoContacto');
    var waInput = container.querySelector('#raeWhatsappContacto');
    var waIgualBtn = container.querySelector('#raeWhatsappIgual');
    waIgualBtn.addEventListener('click', function () {
      waInput.value = telInput.value;
      limpiarError(container, 'raeWhatsappContacto');
    });
  }

  function esTelefonoValido(valor) {
    var digitos = valor.replace(/\D/g, '');
    return digitos.length >= 7 && digitos.length <= 15;
  }

  function esEmailValido(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }

  function esSitioWebValido(valor) {
    // Acepta con o sin protocolo (ej. "www.empresa.com" o "https://empresa.com")
    return /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}([\/?#].*)?$/i.test(valor.trim());
  }

  function validarPasoContacto(container) {
    var email = container.querySelector('#raeEmailContacto').value.trim();
    var telefono = container.querySelector('#raeTelefonoContacto').value.trim();
    var whatsapp = container.querySelector('#raeWhatsappContacto').value.trim();
    var sitioWeb = container.querySelector('#raeSitioWebContacto').value.trim();

    var valido = true;

    if (!email || !esEmailValido(email)) { marcarError(container, 'raeEmailContacto'); valido = false; }
    else { limpiarError(container, 'raeEmailContacto'); }

    if (!telefono || !esTelefonoValido(telefono)) { marcarError(container, 'raeTelefonoContacto'); valido = false; }
    else { limpiarError(container, 'raeTelefonoContacto'); }

    if (whatsapp && !esTelefonoValido(whatsapp)) { marcarError(container, 'raeWhatsappContacto'); valido = false; }
    else { limpiarError(container, 'raeWhatsappContacto'); }

    if (sitioWeb && !esSitioWebValido(sitioWeb)) { marcarError(container, 'raeSitioWebContacto'); valido = false; }
    else { limpiarError(container, 'raeSitioWebContacto'); }

    return valido;
  }

  function recolectarPasoContacto(container, stateSlice) {
    stateSlice.email = container.querySelector('#raeEmailContacto').value.trim();
    stateSlice.telefono = container.querySelector('#raeTelefonoContacto').value.trim();
    stateSlice.whatsapp = container.querySelector('#raeWhatsappContacto').value.trim();
    var sitioWeb = container.querySelector('#raeSitioWebContacto').value.trim();
    if (sitioWeb && !/^https?:\/\//i.test(sitioWeb)) sitioWeb = 'https://' + sitioWeb;
    stateSlice.sitioWeb = sitioWeb;
    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 3 — UBICACIÓN
     ══════════════════════════════════════════════ */
  var PROVINCIAS_PANAMA = [
    'Bocas del Toro', 'Chiriquí', 'Coclé', 'Colón', 'Darién', 'Herrera',
    'Los Santos', 'Panamá', 'Panamá Oeste', 'Veraguas',
    'Comarca Emberá-Wounaan', 'Comarca Guna Yala', 'Comarca Ngäbe-Buglé',
    'Comarca Guna de Madugandí', 'Comarca Guna de Wargandí'
  ];

  function renderPasoUbicacion(data) {
    data = data || {};
    var opciones = PROVINCIAS_PANAMA.map(function (p) {
      var sel = data.provincia === p ? ' selected' : '';
      return '<option value="' + p + '"' + sel + '>' + p + '</option>';
    }).join('');

    return (
      '<div class="rae-step" data-step="ubicacion">' +
        '<p class="rae-step__desc">¿Dónde se encuentra tu empresa o punto de operación? Esta información se usa para mostrarte en el mapa de RECO+.</p>' +

        '<div class="rae-row">' +
          '<div class="rae-field">' +
            '<label for="raeProvincia">Provincia o comarca <span class="rae-required">*</span></label>' +
            '<select id="raeProvincia" class="rae-input">' +
              '<option value="">Selecciona una provincia</option>' +
              opciones +
            '</select>' +
            '<span class="rae-error" id="raeProvinciaError">Selecciona una provincia o comarca.</span>' +
          '</div>' +
          '<div class="rae-field">' +
            '<label for="raeDistrito">Distrito o ciudad <span class="rae-required">*</span></label>' +
            '<input type="text" id="raeDistrito" class="rae-input" placeholder="Ej. David" maxlength="80" value="' + esc(data.distrito) + '">' +
            '<span class="rae-error" id="raeDistritoError">Ingresa el distrito o ciudad.</span>' +
          '</div>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeDireccion">Dirección completa <span class="rae-required">*</span></label>' +
          '<textarea id="raeDireccion" class="rae-input rae-textarea" placeholder="Calle, número, barrio, referencias cercanas..." maxlength="240" style="min-height:72px">' + esc(data.direccion) + '</textarea>' +
          '<span class="rae-error" id="raeDireccionError">Ingresa una dirección completa (mínimo 10 caracteres).</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label>Coordenadas GPS <span class="rae-required">*</span></label>' +
          '<div class="rae-row">' +
            '<div class="rae-field" style="margin-bottom:0">' +
              '<input type="text" inputmode="decimal" id="raeLat" class="rae-input" placeholder="Latitud (ej. 8.4331)" value="' + esc(data.lat) + '">' +
            '</div>' +
            '<div class="rae-field" style="margin-bottom:0">' +
              '<input type="text" inputmode="decimal" id="raeLng" class="rae-input" placeholder="Longitud (ej. -82.4308)" value="' + esc(data.lng) + '">' +
            '</div>' +
          '</div>' +
          '<span class="rae-error" id="raeLatError">Ingresa coordenadas GPS válidas.</span>' +
          '<button type="button" class="rae-btn rae-btn--sm" id="raeUbicarBtn" style="align-self:flex-start;margin-top:4px">' +
            '<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" style="vertical-align:-2px;margin-right:4px"><path d="M10 2a6 6 0 016 6c0 4-6 10-6 10S4 12 4 8a6 6 0 016-6z"/><circle cx="10" cy="8" r="2"/></svg>' +
            'Usar mi ubicación actual' +
          '</button>' +
          '<span class="rae-hint" id="raeUbicarHint">También puedes escribirlas manualmente si ya las conoces.</span>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePasoUbicacion(container) {
    ['raeProvincia', 'raeDistrito', 'raeDireccion'].forEach(function (id) {
      var el = container.querySelector('#' + id);
      if (!el) return;
      var evt = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, function () { limpiarError(container, id); });
    });
    ['raeLat', 'raeLng'].forEach(function (id) {
      var el = container.querySelector('#' + id);
      el.addEventListener('input', function () { limpiarError(container, 'raeLat'); });
    });

    var ubicarBtn = container.querySelector('#raeUbicarBtn');
    var hint = container.querySelector('#raeUbicarHint');
    var latInput = container.querySelector('#raeLat');
    var lngInput = container.querySelector('#raeLng');

    ubicarBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        hint.textContent = 'Tu navegador no permite obtener la ubicación automáticamente. Escríbela manualmente.';
        hint.classList.add('rae-hint--limit');
        return;
      }
      ubicarBtn.disabled = true;
      hint.classList.remove('rae-hint--limit');
      hint.textContent = 'Obteniendo tu ubicación actual...';

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          latInput.value = pos.coords.latitude.toFixed(6);
          lngInput.value = pos.coords.longitude.toFixed(6);
          limpiarError(container, 'raeLat');
          hint.textContent = 'Ubicación obtenida correctamente.';
          ubicarBtn.disabled = false;
        },
        function () {
          hint.textContent = 'No se pudo obtener tu ubicación. Escríbela manualmente o revisa los permisos del navegador.';
          hint.classList.add('rae-hint--limit');
          ubicarBtn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  function validarPasoUbicacion(container) {
    var provincia = container.querySelector('#raeProvincia').value;
    var distrito = container.querySelector('#raeDistrito').value.trim();
    var direccion = container.querySelector('#raeDireccion').value.trim();
    var lat = container.querySelector('#raeLat').value.trim();
    var lng = container.querySelector('#raeLng').value.trim();

    var valido = true;

    if (!provincia) { marcarError(container, 'raeProvincia'); valido = false; }
    else { limpiarError(container, 'raeProvincia'); }

    if (!distrito) { marcarError(container, 'raeDistrito'); valido = false; }
    else { limpiarError(container, 'raeDistrito'); }

    if (direccion.length < 10) { marcarError(container, 'raeDireccion'); valido = false; }
    else { limpiarError(container, 'raeDireccion'); }

    var latNum = parseFloat(lat);
    var lngNum = parseFloat(lng);
    var coordsValidas = lat !== '' && lng !== '' && !isNaN(latNum) && !isNaN(lngNum) &&
      latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
    if (!coordsValidas) { marcarError(container, 'raeLat'); valido = false; }
    else { limpiarError(container, 'raeLat'); }

    return valido;
  }

  function recolectarPasoUbicacion(container, stateSlice) {
    stateSlice.provincia = container.querySelector('#raeProvincia').value;
    stateSlice.distrito = container.querySelector('#raeDistrito').value.trim();
    stateSlice.direccion = container.querySelector('#raeDireccion').value.trim();
    stateSlice.lat = parseFloat(container.querySelector('#raeLat').value.trim());
    stateSlice.lng = parseFloat(container.querySelector('#raeLng').value.trim());
    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 4 — MATERIALES QUE RECIBEN
     ─────────────────────────────────────────────
     Los ids/nombres son EXACTAMENTE los 18 de la tabla `categorias`
     en Supabase (mismos que usan el escáner de IA y los filtros del
     mapa — ver material-map.js y el dropdown "+ Más filtros" en
     mapa-more-filters.js/mapa.html). Los íconos son emoji porque no
     dependen de ningún sprite/SVG externo y ya son el mismo criterio
     visual usado en material-map.js y en los puntos reales insertados
     en puntos_sugeridos (material_icons).
     ══════════════════════════════════════════════ */
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

  function renderPasoMateriales(data) {
    data = data || {};
    var seleccionados = data.materiales || [];
    var chips = MATERIALES_DISPONIBLES.map(function (m) {
      var activo = seleccionados.indexOf(m.id) !== -1;
      return (
        '<button type="button" class="rae-chip' + (activo ? ' rae-chip--active' : '') + '" data-material-id="' + m.id + '" aria-pressed="' + (activo ? 'true' : 'false') + '">' +
          '<span class="rae-chip__icon">' + m.icono + '</span>' +
          '<span>' + m.nombre + '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div class="rae-step" data-step="materiales">' +
        '<p class="rae-step__desc">Selecciona todos los materiales que tu empresa o centro recibe. Puedes elegir varios — esto es lo que verán los usuarios al filtrar el mapa.</p>' +
        '<div class="rae-chip-head">' +
          '<span class="rae-chip-count" id="raeMaterialesCount">' + seleccionados.length + (seleccionados.length === 1 ? ' seleccionado' : ' seleccionados') + '</span>' +
          '<div class="rae-chip-actions">' +
            '<button type="button" id="raeMaterialesTodos">Seleccionar todos</button>' +
            '<span>·</span>' +
            '<button type="button" id="raeMaterialesNinguno">Ninguno</button>' +
          '</div>' +
        '</div>' +
        '<div class="rae-chip-grid" id="raeMaterialesGrid">' + chips + '</div>' +
        '<span class="rae-error" id="raeMaterialesError" style="margin-top:10px">Selecciona al menos un material.</span>' +
      '</div>'
    );
  }

  function wirePasoMateriales(container, stateSlice) {
    var grid = container.querySelector('#raeMaterialesGrid');
    var countEl = container.querySelector('#raeMaterialesCount');
    var todosBtn = container.querySelector('#raeMaterialesTodos');
    var ningunoBtn = container.querySelector('#raeMaterialesNinguno');

    if (!stateSlice.materiales) stateSlice.materiales = [];

    function actualizarContador() {
      var n = grid.querySelectorAll('.rae-chip--active').length;
      countEl.textContent = n + (n === 1 ? ' seleccionado' : ' seleccionados');
    }

    function limpiarErrorGrid() {
      grid.classList.remove('rae-chip-grid--invalid');
      var err = container.querySelector('#raeMaterialesError');
      if (err) err.setAttribute('data-visible', 'false');
    }

    grid.addEventListener('click', function (e) {
      var chip = e.target.closest('.rae-chip');
      if (!chip) return;
      var activo = chip.classList.toggle('rae-chip--active');
      chip.setAttribute('aria-pressed', activo ? 'true' : 'false');
      actualizarContador();
      limpiarErrorGrid();
    });

    todosBtn.addEventListener('click', function () {
      grid.querySelectorAll('.rae-chip').forEach(function (chip) {
        chip.classList.add('rae-chip--active');
        chip.setAttribute('aria-pressed', 'true');
      });
      actualizarContador();
      limpiarErrorGrid();
    });

    ningunoBtn.addEventListener('click', function () {
      grid.querySelectorAll('.rae-chip').forEach(function (chip) {
        chip.classList.remove('rae-chip--active');
        chip.setAttribute('aria-pressed', 'false');
      });
      actualizarContador();
    });
  }

  function validarPasoMateriales(container) {
    var grid = container.querySelector('#raeMaterialesGrid');
    var error = container.querySelector('#raeMaterialesError');
    var activos = grid.querySelectorAll('.rae-chip--active').length;

    if (activos === 0) {
      grid.classList.add('rae-chip-grid--invalid');
      if (error) error.setAttribute('data-visible', 'true');
      return false;
    }
    grid.classList.remove('rae-chip-grid--invalid');
    if (error) error.setAttribute('data-visible', 'false');
    return true;
  }

  function recolectarPasoMateriales(container, stateSlice) {
    var grid = container.querySelector('#raeMaterialesGrid');
    var seleccionados = [];
    grid.querySelectorAll('.rae-chip--active').forEach(function (chip) {
      seleccionados.push(chip.getAttribute('data-material-id'));
    });
    stateSlice.materiales = seleccionados;
    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 5 — SERVICIOS QUE OFRECEN
     ─────────────────────────────────────────────
     Misma mecánica de selección múltiple que el Paso 4, pero en
     formato lista (checkbox + texto) en vez de grid de chips: las
     etiquetas de servicio son más largas ("Recolección a domicilio",
     "Destrucción certificada"...) y se leen mejor en una fila que
     apretadas en un cuadro de 3 columnas.
     ══════════════════════════════════════════════ */
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

  var RAE_CHECK_SVG = '<svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.2l3 3 6-6.4"/></svg>';

  function renderPasoServicios(data) {
    data = data || {};
    var seleccionados = data.servicios || [];
    var items = SERVICIOS_DISPONIBLES.map(function (s) {
      var activo = seleccionados.indexOf(s.id) !== -1;
      return (
        '<button type="button" class="rae-check-item' + (activo ? ' rae-check-item--active' : '') + '" data-servicio-id="' + s.id + '" aria-pressed="' + (activo ? 'true' : 'false') + '">' +
          '<span class="rae-check-item__box">' + RAE_CHECK_SVG + '</span>' +
          '<span class="rae-check-item__icon">' + s.icono + '</span>' +
          '<span class="rae-check-item__label">' + s.nombre + '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div class="rae-step" data-step="servicios">' +
        '<p class="rae-step__desc">¿Qué servicios ofrece tu empresa a la comunidad de RECO+? Selecciona todos los que apliquen.</p>' +
        '<div class="rae-chip-head">' +
          '<span class="rae-chip-count" id="raeServiciosCount">' + seleccionados.length + (seleccionados.length === 1 ? ' seleccionado' : ' seleccionados') + '</span>' +
          '<div class="rae-chip-actions">' +
            '<button type="button" id="raeServiciosTodos">Seleccionar todos</button>' +
            '<span>·</span>' +
            '<button type="button" id="raeServiciosNinguno">Ninguno</button>' +
          '</div>' +
        '</div>' +
        '<div class="rae-check-list" id="raeServiciosList">' + items + '</div>' +
        '<span class="rae-error" id="raeServiciosError" style="margin-top:10px">Selecciona al menos un servicio.</span>' +
      '</div>'
    );
  }

  function wirePasoServicios(container, stateSlice) {
    var list = container.querySelector('#raeServiciosList');
    var countEl = container.querySelector('#raeServiciosCount');
    var todosBtn = container.querySelector('#raeServiciosTodos');
    var ningunoBtn = container.querySelector('#raeServiciosNinguno');

    if (!stateSlice.servicios) stateSlice.servicios = [];

    function actualizarContador() {
      var n = list.querySelectorAll('.rae-check-item--active').length;
      countEl.textContent = n + (n === 1 ? ' seleccionado' : ' seleccionados');
    }

    function limpiarErrorLista() {
      list.classList.remove('rae-check-list--invalid');
      var err = container.querySelector('#raeServiciosError');
      if (err) err.setAttribute('data-visible', 'false');
    }

    list.addEventListener('click', function (e) {
      var item = e.target.closest('.rae-check-item');
      if (!item) return;
      var activo = item.classList.toggle('rae-check-item--active');
      item.setAttribute('aria-pressed', activo ? 'true' : 'false');
      actualizarContador();
      limpiarErrorLista();
    });

    todosBtn.addEventListener('click', function () {
      list.querySelectorAll('.rae-check-item').forEach(function (item) {
        item.classList.add('rae-check-item--active');
        item.setAttribute('aria-pressed', 'true');
      });
      actualizarContador();
      limpiarErrorLista();
    });

    ningunoBtn.addEventListener('click', function () {
      list.querySelectorAll('.rae-check-item').forEach(function (item) {
        item.classList.remove('rae-check-item--active');
        item.setAttribute('aria-pressed', 'false');
      });
      actualizarContador();
    });
  }

  function validarPasoServicios(container) {
    var list = container.querySelector('#raeServiciosList');
    var error = container.querySelector('#raeServiciosError');
    var activos = list.querySelectorAll('.rae-check-item--active').length;

    if (activos === 0) {
      list.classList.add('rae-check-list--invalid');
      if (error) error.setAttribute('data-visible', 'true');
      return false;
    }
    list.classList.remove('rae-check-list--invalid');
    if (error) error.setAttribute('data-visible', 'false');
    return true;
  }

  function recolectarPasoServicios(container, stateSlice) {
    var list = container.querySelector('#raeServiciosList');
    var seleccionados = [];
    list.querySelectorAll('.rae-check-item--active').forEach(function (item) {
      seleccionados.push(item.getAttribute('data-servicio-id'));
    });
    stateSlice.servicios = seleccionados;
    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 6 — HORARIOS
     ─────────────────────────────────────────────
     Días de atención (selección múltiple, mismo patrón de estado
     que Pasos 4/5 pero con chips compactos tipo píldora en vez de
     grid/lista) + hora de apertura/cierre con <input type="time">.
     ══════════════════════════════════════════════ */
  var DIAS_SEMANA = [
    { id: 'lunes', abbr: 'Lun' },
    { id: 'martes', abbr: 'Mar' },
    { id: 'miercoles', abbr: 'Mié' },
    { id: 'jueves', abbr: 'Jue' },
    { id: 'viernes', abbr: 'Vie' },
    { id: 'sabado', abbr: 'Sáb' },
    { id: 'domingo', abbr: 'Dom' }
  ];
  var DIAS_LABORABLES = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  function renderPasoHorarios(data) {
    data = data || {};
    var diasSeleccionados = data.dias || [];
    var chips = DIAS_SEMANA.map(function (d) {
      var activo = diasSeleccionados.indexOf(d.id) !== -1;
      return '<button type="button" class="rae-day-chip' + (activo ? ' rae-day-chip--active' : '') + '" data-dia-id="' + d.id + '" aria-pressed="' + (activo ? 'true' : 'false') + '">' + d.abbr + '</button>';
    }).join('');

    return (
      '<div class="rae-step" data-step="horarios">' +
        '<p class="rae-step__desc">¿Qué días y en qué horario atiende tu empresa o centro?</p>' +

        '<div class="rae-field">' +
          '<label>Días de atención <span class="rae-required">*</span></label>' +
          '<div class="rae-chip-actions" style="margin-bottom:2px">' +
            '<button type="button" id="raeDiasTodos">Todos los días</button>' +
            '<span>·</span>' +
            '<button type="button" id="raeDiasLaborables">Lun–Vie</button>' +
            '<span>·</span>' +
            '<button type="button" id="raeDiasNinguno">Ninguno</button>' +
          '</div>' +
          '<div class="rae-days-row" id="raeDiasGrid">' + chips + '</div>' +
          '<span class="rae-error" id="raeDiasError">Selecciona al menos un día de atención.</span>' +
        '</div>' +

        '<div class="rae-row">' +
          '<div class="rae-field">' +
            '<label for="raeHoraApertura">Hora de apertura <span class="rae-required">*</span></label>' +
            '<input type="time" id="raeHoraApertura" class="rae-input" value="' + esc(data.horaApertura) + '">' +
            '<span class="rae-error" id="raeHoraAperturaError">Ingresa la hora de apertura.</span>' +
          '</div>' +
          '<div class="rae-field">' +
            '<label for="raeHoraCierre">Hora de cierre <span class="rae-required">*</span></label>' +
            '<input type="time" id="raeHoraCierre" class="rae-input" value="' + esc(data.horaCierre) + '">' +
            '<span class="rae-error" id="raeHoraCierreError">Debe ser posterior a la hora de apertura.</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePasoHorarios(container) {
    var grid = container.querySelector('#raeDiasGrid');
    var todosBtn = container.querySelector('#raeDiasTodos');
    var laborablesBtn = container.querySelector('#raeDiasLaborables');
    var ningunoBtn = container.querySelector('#raeDiasNinguno');
    var aperturaInput = container.querySelector('#raeHoraApertura');
    var cierreInput = container.querySelector('#raeHoraCierre');

    function limpiarErrorDias() {
      grid.classList.remove('rae-days-row--invalid');
      var err = container.querySelector('#raeDiasError');
      if (err) err.setAttribute('data-visible', 'false');
    }

    grid.addEventListener('click', function (e) {
      var chip = e.target.closest('.rae-day-chip');
      if (!chip) return;
      var activo = chip.classList.toggle('rae-day-chip--active');
      chip.setAttribute('aria-pressed', activo ? 'true' : 'false');
      limpiarErrorDias();
    });

    todosBtn.addEventListener('click', function () {
      grid.querySelectorAll('.rae-day-chip').forEach(function (chip) {
        chip.classList.add('rae-day-chip--active');
        chip.setAttribute('aria-pressed', 'true');
      });
      limpiarErrorDias();
    });

    laborablesBtn.addEventListener('click', function () {
      grid.querySelectorAll('.rae-day-chip').forEach(function (chip) {
        var activo = DIAS_LABORABLES.indexOf(chip.getAttribute('data-dia-id')) !== -1;
        chip.classList.toggle('rae-day-chip--active', activo);
        chip.setAttribute('aria-pressed', activo ? 'true' : 'false');
      });
      limpiarErrorDias();
    });

    ningunoBtn.addEventListener('click', function () {
      grid.querySelectorAll('.rae-day-chip').forEach(function (chip) {
        chip.classList.remove('rae-day-chip--active');
        chip.setAttribute('aria-pressed', 'false');
      });
    });

    aperturaInput.addEventListener('input', function () {
      limpiarError(container, 'raeHoraApertura');
      limpiarError(container, 'raeHoraCierre');
    });
    cierreInput.addEventListener('input', function () { limpiarError(container, 'raeHoraCierre'); });
  }

  function validarPasoHorarios(container) {
    var grid = container.querySelector('#raeDiasGrid');
    var errorDias = container.querySelector('#raeDiasError');
    var activos = grid.querySelectorAll('.rae-day-chip--active').length;
    var apertura = container.querySelector('#raeHoraApertura').value;
    var cierre = container.querySelector('#raeHoraCierre').value;
    var valido = true;

    if (activos === 0) {
      grid.classList.add('rae-days-row--invalid');
      if (errorDias) errorDias.setAttribute('data-visible', 'true');
      valido = false;
    } else {
      grid.classList.remove('rae-days-row--invalid');
      if (errorDias) errorDias.setAttribute('data-visible', 'false');
    }

    if (!apertura) { marcarError(container, 'raeHoraApertura'); valido = false; }
    else { limpiarError(container, 'raeHoraApertura'); }

    if (!cierre || (apertura && cierre <= apertura)) { marcarError(container, 'raeHoraCierre'); valido = false; }
    else { limpiarError(container, 'raeHoraCierre'); }

    return valido;
  }

  function recolectarPasoHorarios(container, stateSlice) {
    var grid = container.querySelector('#raeDiasGrid');
    var dias = [];
    grid.querySelectorAll('.rae-day-chip--active').forEach(function (chip) {
      dias.push(chip.getAttribute('data-dia-id'));
    });
    stateSlice.dias = dias;
    stateSlice.horaApertura = container.querySelector('#raeHoraApertura').value;
    stateSlice.horaCierre = container.querySelector('#raeHoraCierre').value;
    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 7 — INFORMACIÓN OPERATIVA
     ─────────────────────────────────────────────
     ¿Aceptan particulares? / ¿Aceptan empresas? → toggles Sí/No.
     Cantidad mínima (obligatoria) y máxima (opcional) de material,
     en kilogramos. ¿Ofrecen pago por materiales? → toggle Sí/No que,
     al marcar "Sí", revela (con animación .rae-collapse) el bloque
     de método de pago — selección múltiple con el mismo patrón de
     chips que Materiales/Servicios (Pasos 4/5).
     ══════════════════════════════════════════════ */
  var METODOS_PAGO_DISPONIBLES = [
    { id: 'efectivo', nombre: 'Efectivo', icono: '💵' },
    { id: 'transferencia', nombre: 'Transferencia bancaria', icono: '🏦' },
    { id: 'yappy', nombre: 'Yappy', icono: '📲' },
    { id: 'cheque', nombre: 'Cheque', icono: '🧾' },
    { id: 'otro', nombre: 'Otro', icono: '➕' }
  ];

  function renderToggleSiNo(name, valorActual, labelSi, labelNo) {
    labelSi = labelSi || 'Sí';
    labelNo = labelNo || 'No';
    var activoSi = valorActual === true ? ' rae-toggle-btn--active' : '';
    var activoNo = valorActual === false ? ' rae-toggle-btn--active' : '';
    return (
      '<div class="rae-toggle-row" data-toggle-name="' + name + '">' +
        '<button type="button" class="rae-toggle-btn' + activoSi + '" data-valor="si">' +
          '<svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.2l3 3 6-6.4"/></svg>' +
          '<span>' + labelSi + '</span>' +
        '</button>' +
        '<button type="button" class="rae-toggle-btn' + activoNo + '" data-valor="no">' +
          '<svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>' +
          '<span>' + labelNo + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  function wireToggleSiNo(container, name, onChange) {
    var row = container.querySelector('.rae-toggle-row[data-toggle-name="' + name + '"]');
    if (!row) return;
    row.addEventListener('click', function (e) {
      var btn = e.target.closest('.rae-toggle-btn');
      if (!btn) return;
      row.querySelectorAll('.rae-toggle-btn').forEach(function (b) {
        b.classList.remove('rae-toggle-btn--active');
      });
      btn.classList.add('rae-toggle-btn--active');
      var valor = btn.getAttribute('data-valor') === 'si';
      if (onChange) onChange(valor);
    });
  }

  function leerToggleSiNo(container, name) {
    var row = container.querySelector('.rae-toggle-row[data-toggle-name="' + name + '"]');
    if (!row) return null;
    var activo = row.querySelector('.rae-toggle-btn--active');
    if (!activo) return null;
    return activo.getAttribute('data-valor') === 'si';
  }

  function renderPasoOperativa(data) {
    data = data || {};
    var pagaMateriales = data.pagaMateriales === true;
    var metodosSeleccionados = data.metodosPago || [];
    var chipsMetodos = METODOS_PAGO_DISPONIBLES.map(function (m) {
      var activo = metodosSeleccionados.indexOf(m.id) !== -1;
      return (
        '<button type="button" class="rae-chip' + (activo ? ' rae-chip--active' : '') + '" data-metodo-id="' + m.id + '" aria-pressed="' + (activo ? 'true' : 'false') + '">' +
          '<span class="rae-chip__icon">' + m.icono + '</span>' +
          '<span>' + m.nombre + '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div class="rae-step" data-step="operativa">' +
        '<p class="rae-step__desc">Cuéntanos cómo trabaja tu empresa día a día: a quién atiende, cuánto material maneja y cómo paga por él.</p>' +

        '<div class="rae-field">' +
          '<label>¿Aceptan particulares? <span class="rae-required">*</span></label>' +
          renderToggleSiNo('aceptaParticulares', data.aceptaParticulares) +
          '<span class="rae-error" id="raeAceptaParticularesError">Indica si aceptan particulares.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label>¿Aceptan empresas? <span class="rae-required">*</span></label>' +
          renderToggleSiNo('aceptaEmpresas', data.aceptaEmpresas) +
          '<span class="rae-error" id="raeAceptaEmpresasError">Indica si aceptan empresas.</span>' +
        '</div>' +

        '<div class="rae-row">' +
          '<div class="rae-field">' +
            '<label for="raeCantidadMinima">Cantidad mínima de material (kg) <span class="rae-required">*</span></label>' +
            '<input type="number" id="raeCantidadMinima" class="rae-input" placeholder="Ej. 5" min="0" step="0.1" value="' + esc(data.cantidadMinima) + '">' +
            '<span class="rae-error" id="raeCantidadMinimaError">Ingresa una cantidad mínima válida.</span>' +
          '</div>' +
          '<div class="rae-field">' +
            '<label for="raeCantidadMaxima">Cantidad máxima (kg) <span class="rae-optional">(opcional)</span></label>' +
            '<input type="number" id="raeCantidadMaxima" class="rae-input" placeholder="Sin límite" min="0" step="0.1" value="' + esc(data.cantidadMaxima) + '">' +
            '<span class="rae-error" id="raeCantidadMaximaError">Debe ser mayor que la cantidad mínima.</span>' +
          '</div>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label>¿Ofrecen pago por materiales? <span class="rae-required">*</span></label>' +
          renderToggleSiNo('pagaMateriales', data.pagaMateriales) +
          '<span class="rae-error" id="raePagaMaterialesError">Indica si ofrecen pago por materiales.</span>' +
        '</div>' +

        '<div class="rae-collapse' + (pagaMateriales ? ' rae-collapse--open' : '') + '" id="raeMetodoPagoCollapse">' +
          '<div class="rae-field">' +
            '<label>Método de pago <span class="rae-required">*</span></label>' +
            '<div class="rae-chip-head">' +
              '<span class="rae-chip-count" id="raeMetodosPagoCount">' + metodosSeleccionados.length + (metodosSeleccionados.length === 1 ? ' seleccionado' : ' seleccionados') + '</span>' +
            '</div>' +
            '<div class="rae-chip-grid" id="raeMetodosPagoGrid">' + chipsMetodos + '</div>' +
            '<span class="rae-error" id="raeMetodosPagoError" style="margin-top:10px">Selecciona al menos un método de pago.</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePasoOperativa(container, stateSlice) {
    var collapse = container.querySelector('#raeMetodoPagoCollapse');
    var metodosGrid = container.querySelector('#raeMetodosPagoGrid');
    var metodosCount = container.querySelector('#raeMetodosPagoCount');

    function actualizarContadorMetodos() {
      var n = metodosGrid.querySelectorAll('.rae-chip--active').length;
      metodosCount.textContent = n + (n === 1 ? ' seleccionado' : ' seleccionados');
    }

    wireToggleSiNo(container, 'aceptaParticulares', function () {
      limpiarError(container, 'raeAceptaParticulares');
    });
    wireToggleSiNo(container, 'aceptaEmpresas', function () {
      limpiarError(container, 'raeAceptaEmpresas');
    });
    wireToggleSiNo(container, 'pagaMateriales', function (valor) {
      limpiarError(container, 'raePagaMateriales');
      collapse.classList.toggle('rae-collapse--open', valor === true);
      if (!valor) {
        metodosGrid.querySelectorAll('.rae-chip--active').forEach(function (chip) {
          chip.classList.remove('rae-chip--active');
          chip.setAttribute('aria-pressed', 'false');
        });
        actualizarContadorMetodos();
        metodosGrid.classList.remove('rae-chip-grid--invalid');
        var err = container.querySelector('#raeMetodosPagoError');
        if (err) err.setAttribute('data-visible', 'false');
      }
    });

    metodosGrid.addEventListener('click', function (e) {
      var chip = e.target.closest('.rae-chip');
      if (!chip) return;
      var activo = chip.classList.toggle('rae-chip--active');
      chip.setAttribute('aria-pressed', activo ? 'true' : 'false');
      actualizarContadorMetodos();
      metodosGrid.classList.remove('rae-chip-grid--invalid');
      var err = container.querySelector('#raeMetodosPagoError');
      if (err) err.setAttribute('data-visible', 'false');
    });

    ['raeCantidadMinima', 'raeCantidadMaxima'].forEach(function (id) {
      var el = container.querySelector('#' + id);
      if (!el) return;
      el.addEventListener('input', function () {
        limpiarError(container, 'raeCantidadMinima');
        limpiarError(container, 'raeCantidadMaxima');
      });
    });
  }

  function validarPasoOperativa(container) {
    var valido = true;

    var aceptaParticulares = leerToggleSiNo(container, 'aceptaParticulares');
    if (aceptaParticulares === null) { marcarError(container, 'raeAceptaParticulares'); valido = false; }
    else { limpiarError(container, 'raeAceptaParticulares'); }

    var aceptaEmpresas = leerToggleSiNo(container, 'aceptaEmpresas');
    if (aceptaEmpresas === null) { marcarError(container, 'raeAceptaEmpresas'); valido = false; }
    else { limpiarError(container, 'raeAceptaEmpresas'); }

    var minInput = container.querySelector('#raeCantidadMinima');
    var maxInput = container.querySelector('#raeCantidadMaxima');
    var minVal = minInput.value.trim();
    var maxVal = maxInput.value.trim();
    var minNum = parseFloat(minVal);
    var maxNum = parseFloat(maxVal);

    if (minVal === '' || isNaN(minNum) || minNum < 0) {
      marcarError(container, 'raeCantidadMinima'); valido = false;
    } else {
      limpiarError(container, 'raeCantidadMinima');
    }

    if (maxVal !== '') {
      if (isNaN(maxNum) || maxNum <= minNum) { marcarError(container, 'raeCantidadMaxima'); valido = false; }
      else { limpiarError(container, 'raeCantidadMaxima'); }
    } else {
      limpiarError(container, 'raeCantidadMaxima');
    }

    var pagaMateriales = leerToggleSiNo(container, 'pagaMateriales');
    if (pagaMateriales === null) { marcarError(container, 'raePagaMateriales'); valido = false; }
    else { limpiarError(container, 'raePagaMateriales'); }

    if (pagaMateriales === true) {
      var metodosGrid = container.querySelector('#raeMetodosPagoGrid');
      var error = container.querySelector('#raeMetodosPagoError');
      var activos = metodosGrid.querySelectorAll('.rae-chip--active').length;
      if (activos === 0) {
        metodosGrid.classList.add('rae-chip-grid--invalid');
        if (error) error.setAttribute('data-visible', 'true');
        valido = false;
      } else {
        metodosGrid.classList.remove('rae-chip-grid--invalid');
        if (error) error.setAttribute('data-visible', 'false');
      }
    }

    return valido;
  }

  function recolectarPasoOperativa(container, stateSlice) {
    stateSlice.aceptaParticulares = leerToggleSiNo(container, 'aceptaParticulares');
    stateSlice.aceptaEmpresas = leerToggleSiNo(container, 'aceptaEmpresas');
    var minVal = container.querySelector('#raeCantidadMinima').value.trim();
    var maxVal = container.querySelector('#raeCantidadMaxima').value.trim();
    stateSlice.cantidadMinima = minVal !== '' ? parseFloat(minVal) : null;
    stateSlice.cantidadMaxima = maxVal !== '' ? parseFloat(maxVal) : null;
    stateSlice.pagaMateriales = leerToggleSiNo(container, 'pagaMateriales');

    if (stateSlice.pagaMateriales === true) {
      var metodosGrid = container.querySelector('#raeMetodosPagoGrid');
      var seleccionados = [];
      metodosGrid.querySelectorAll('.rae-chip--active').forEach(function (chip) {
        seleccionados.push(chip.getAttribute('data-metodo-id'));
      });
      stateSlice.metodosPago = seleccionados;
    } else {
      stateSlice.metodosPago = [];
    }

    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 8 — CUENTA DE ACCESO
     ─────────────────────────────────────────────
     Nombre de usuario, correo, contraseña + confirmar (con botón
     mostrar/ocultar y medidor de fortaleza), y aceptación de
     términos y condiciones + política de privacidad (obligatorias,
     checkboxes independientes). Mismo estándar de contraseña que
     registro-auth.js (mínimo 6 caracteres) para quedar compatible
     con window.recoAuth.signUp cuando se conecte el envío final.
     ══════════════════════════════════════════════ */
  var RAE_EYE_SVG = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10z"/><circle cx="10" cy="10" r="2.3"/></svg>';
  var RAE_EYE_OFF_SVG = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 2.5l15 15"/><path d="M8.4 4.3C8.9 4.1 9.5 4 10 4c5.5 0 8.5 6 8.5 6a15 15 0 01-2.7 3.5M5.6 5.6C3.2 7 1.5 10 1.5 10s3 6 8.5 6c1 0 1.9-.2 2.7-.5"/><path d="M8.2 8.2a2.3 2.3 0 003.2 3.2"/></svg>';

  function calcularFortalezaPassword(pw) {
    if (!pw) return 0;
    var puntos = 0;
    if (pw.length >= 6) puntos++;
    if (pw.length >= 10) puntos++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) puntos++;
    if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) puntos++;
    return Math.min(puntos, 4);
  }

  var RAE_FORTALEZA_LABEL = ['', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];

  function renderCheckboxLinea(id, activo, htmlTexto) {
    return (
      '<div class="rae-checkbox-line' + (activo ? ' rae-checkbox-line--active' : '') + '" id="' + id + '" role="checkbox" aria-checked="' + (activo ? 'true' : 'false') + '" tabindex="0">' +
        '<span class="rae-checkbox-line__box">' + RAE_CHECK_SVG + '</span>' +
        '<span class="rae-checkbox-line__text">' + htmlTexto + '</span>' +
      '</div>'
    );
  }

  function wireCheckboxLinea(container, id, onChange) {
    var el = container.querySelector('#' + id);
    if (!el) return;
    function alternar(e) {
      // No alternar si el click fue directamente sobre un enlace interno
      if (e.target.closest('a')) return;
      if (e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') return;
      if (e.type === 'keydown') e.preventDefault();
      var activo = !el.classList.contains('rae-checkbox-line--active');
      el.classList.toggle('rae-checkbox-line--active', activo);
      el.classList.remove('rae-checkbox-line--invalid');
      el.setAttribute('aria-checked', activo ? 'true' : 'false');
      if (onChange) onChange(activo);
    }
    el.addEventListener('click', alternar);
    el.addEventListener('keydown', alternar);
  }

  function renderPasoCuenta(data) {
    data = data || {};
    // El correo YA no se pide: viene fijo de la sesión activa (ver
    // RAE_SESION_ACTUAL más abajo) porque el registro de aliado
    // ahora exige haber iniciado sesión antes de abrir este modal.
    // Por la misma razón no se crea una cuenta nueva aquí, así que
    // tampoco se piden contraseña/confirmar contraseña: la cuenta ya
    // existe y ya tiene su propia contraseña de siempre.
    var correoSesion = (RAE_SESION_ACTUAL && RAE_SESION_ACTUAL.user && RAE_SESION_ACTUAL.user.email) || '';
    return (
      '<div class="rae-step" data-step="cuenta">' +
        '<p class="rae-step__desc">Tu empresa quedará registrada con la cuenta de RECO+ que ya tienes iniciada.</p>' +

        '<div class="rae-field">' +
          '<label for="raeUsuario">Nombre de usuario <span class="rae-required">*</span></label>' +
          '<input type="text" id="raeUsuario" class="rae-input" placeholder="Ej. ecorecicla_pa" maxlength="40" autocomplete="username" value="' + esc(data.usuario) + '">' +
          '<span class="rae-hint">Sin espacios; letras, números, guion o guion bajo.</span>' +
          '<span class="rae-error" id="raeUsuarioError">Elige un nombre de usuario válido (mínimo 3 caracteres).</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeCuentaEmail">Correo de tu cuenta RECO+</label>' +
          '<input type="email" id="raeCuentaEmail" class="rae-input" value="' + esc(correoSesion) + '" disabled>' +
          '<span class="rae-hint">Este es el correo de la cuenta con la que iniciaste sesión. Tu empresa quedará ligada a esta cuenta.</span>' +
        '</div>' +

        '<div style="margin-top:6px">' +
          renderCheckboxLinea('raeAceptaTerminos', data.aceptaTerminos, 'Acepto los <a href="#" target="_blank" rel="noopener">términos y condiciones</a> de RECO+. <span class="rae-required">*</span>') +
          '<span class="rae-error" id="raeAceptaTerminosError" style="margin:-6px 0 10px 31px">Debes aceptar los términos y condiciones.</span>' +

          renderCheckboxLinea('raeAceptaPrivacidad', data.aceptaPrivacidad, 'Acepto la <a href="#" target="_blank" rel="noopener">política de privacidad</a> de RECO+. <span class="rae-required">*</span>') +
          '<span class="rae-error" id="raeAceptaPrivacidadError" style="margin:-6px 0 0 31px">Debes aceptar la política de privacidad.</span>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePasoCuenta(container, stateSlice) {
    var usuarioInput = container.querySelector('#raeUsuario');

    usuarioInput.addEventListener('input', function () { limpiarError(container, 'raeUsuario'); });
    // El campo de correo va "disabled" (viene fijo de la sesión
    // activa), así que no necesita listener de error ni de input.

    wireCheckboxLinea(container, 'raeAceptaTerminos');
    wireCheckboxLinea(container, 'raeAceptaPrivacidad');
  }

  function validarPasoCuenta(container) {
    var valido = true;

    var usuario = container.querySelector('#raeUsuario').value.trim();
    if (!/^[A-Za-z0-9_-]{3,}$/.test(usuario)) { marcarError(container, 'raeUsuario'); valido = false; }
    else { limpiarError(container, 'raeUsuario'); }

    // El correo ya no se valida aquí: viene fijo (disabled) de la
    // sesión activa, garantizada por el guard que abre este modal.

    var terminosEl = container.querySelector('#raeAceptaTerminos');
    var terminosError = container.querySelector('#raeAceptaTerminosError');
    if (!terminosEl.classList.contains('rae-checkbox-line--active')) {
      terminosEl.classList.add('rae-checkbox-line--invalid');
      if (terminosError) terminosError.setAttribute('data-visible', 'true');
      valido = false;
    } else {
      terminosEl.classList.remove('rae-checkbox-line--invalid');
      if (terminosError) terminosError.setAttribute('data-visible', 'false');
    }

    var privacidadEl = container.querySelector('#raeAceptaPrivacidad');
    var privacidadError = container.querySelector('#raeAceptaPrivacidadError');
    if (!privacidadEl.classList.contains('rae-checkbox-line--active')) {
      privacidadEl.classList.add('rae-checkbox-line--invalid');
      if (privacidadError) privacidadError.setAttribute('data-visible', 'true');
      valido = false;
    } else {
      privacidadEl.classList.remove('rae-checkbox-line--invalid');
      if (privacidadError) privacidadError.setAttribute('data-visible', 'false');
    }

    return valido;
  }

  function recolectarPasoCuenta(container, stateSlice) {
    stateSlice.usuario = container.querySelector('#raeUsuario').value.trim();
    // El correo no se lee del input (está disabled): se toma directo
    // de la sesión activa, que es la fuente de verdad.
    stateSlice.email = (RAE_SESION_ACTUAL && RAE_SESION_ACTUAL.user && RAE_SESION_ACTUAL.user.email) || '';
    stateSlice.aceptaTerminos = container.querySelector('#raeAceptaTerminos').classList.contains('rae-checkbox-line--active');
    stateSlice.aceptaPrivacidad = container.querySelector('#raeAceptaPrivacidad').classList.contains('rae-checkbox-line--active');
    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     PASO 9 — INFORMACIÓN OPCIONAL PARA MEJORAR EL PERFIL
     ─────────────────────────────────────────────
     Todo este paso es opcional: no bloquea el registro, pero los
     campos que sí se completan (redes, video, cantidad de residuos)
     se validan con el mismo formato que el resto del formulario si
     el usuario los llena. Reutiliza PROVINCIAS_PANAMA (Paso 3) para
     "Áreas de cobertura" y el mismo patrón de chips de selección
     múltiple que Materiales/Servicios/Método de pago (Pasos 4/5/7).
     Las calificaciones/reseñas NO son un campo: se generan solas
     después del registro, así que aquí solo se muestra una nota.
     ══════════════════════════════════════════════ */
  var RAE_MAX_FOTOS = 6;
  var RAE_X_SVG_SM = '<svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>';
  var RAE_PLUS_SVG = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 4v12M4 10h12"/></svg>';

  var REDES_SOCIALES_DISPONIBLES = [
    { id: 'facebook', elId: 'raeRedFacebook', icono: '📘', placeholder: 'facebook.com/tuempresa' },
    { id: 'instagram', elId: 'raeRedInstagram', icono: '📸', placeholder: 'instagram.com/tuempresa' },
    { id: 'tiktok', elId: 'raeRedTiktok', icono: '🎵', placeholder: 'tiktok.com/@tuempresa' },
    { id: 'linkedin', elId: 'raeRedLinkedin', icono: '💼', placeholder: 'linkedin.com/company/tuempresa' }
  ];

  function renderPasoOpcional(data) {
    data = data || {};
    var redes = data.redesSociales || {};
    var fotos = data.fotos || [];
    var coberturaSeleccionadas = data.areasCobertura || [];

    var redesFilas = REDES_SOCIALES_DISPONIBLES.map(function (r) {
      return (
        '<div class="rae-social-row">' +
          '<span class="rae-social-row__icon">' + r.icono + '</span>' +
          '<div class="rae-field">' +
            '<input type="text" id="' + r.elId + '" class="rae-input" placeholder="' + r.placeholder + '" maxlength="200" value="' + esc(redes[r.id]) + '">' +
            '<span class="rae-error" id="' + r.elId + 'Error">Ingresa un enlace válido.</span>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var chipsCobertura = PROVINCIAS_PANAMA.map(function (p) {
      var activo = coberturaSeleccionadas.indexOf(p) !== -1;
      return '<button type="button" class="rae-chip' + (activo ? ' rae-chip--active' : '') + '" data-provincia-cobertura="' + esc(p) + '" aria-pressed="' + (activo ? 'true' : 'false') + '"><span>' + p + '</span></button>';
    }).join('');

    var fotosThumbs = fotos.map(function (f, i) {
      return (
        '<div class="rae-photo-thumb" data-foto-index="' + i + '">' +
          '<img src="' + f.dataUrl + '" alt="Foto ' + (i + 1) + '">' +
          '<button type="button" class="rae-photo-thumb__remove" data-foto-remove="' + i + '" aria-label="Quitar foto">' + RAE_X_SVG_SM + '</button>' +
        '</div>'
      );
    }).join('');
    var addBtnHtml = '<button type="button" class="rae-photo-add" id="raeFotoAddBtn"' + (fotos.length < RAE_MAX_FOTOS ? '' : ' disabled') + '>' + RAE_PLUS_SVG + '<span>Agregar</span></button>';

    return (
      '<div class="rae-step" data-step="opcional">' +
        '<p class="rae-step__desc">Esta información es opcional, pero ayuda a que tu perfil de aliado destaque más dentro de RECO+.</p>' +

        '<div class="rae-field">' +
          '<label>Redes sociales <span class="rae-optional">(opcional)</span></label>' +
          redesFilas +
        '</div>' +

        '<div class="rae-field">' +
          '<label>Fotografías del centro de reciclaje <span class="rae-optional">(opcional, hasta ' + RAE_MAX_FOTOS + ')</span></label>' +
          '<div class="rae-photo-grid" id="raeFotosGrid">' + fotosThumbs + addBtnHtml + '</div>' +
          '<input type="file" id="raeFotoInput" accept="image/png,image/jpeg,image/webp" multiple style="display:none">' +
          '<span class="rae-hint" id="raeFotosHint">PNG, JPG o WEBP, hasta 3 MB cada una.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeVideoPresentacion">Video de presentación <span class="rae-optional">(opcional)</span></label>' +
          '<input type="text" id="raeVideoPresentacion" class="rae-input" placeholder="Enlace de YouTube, Vimeo, etc." maxlength="200" value="' + esc(data.videoPresentacion) + '">' +
          '<span class="rae-error" id="raeVideoPresentacionError">Ingresa un enlace de video válido.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label>Áreas de cobertura <span class="rae-optional">(opcional)</span></label>' +
          '<p class="rae-hint" style="margin:-2px 0 8px">Provincias o comarcas donde ofrecen recolección o servicio, además de tu ubicación principal.</p>' +
          '<div class="rae-chip-grid" id="raeCoberturaGrid">' + chipsCobertura + '</div>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeResiduosMensuales">Cantidad aproximada de residuos procesados al mes (kg) <span class="rae-optional">(opcional)</span></label>' +
          '<input type="number" id="raeResiduosMensuales" class="rae-input" placeholder="Ej. 250" min="0" step="0.1" value="' + esc(data.residuosMensuales) + '">' +
          '<span class="rae-error" id="raeResiduosMensualesError">Ingresa una cantidad válida.</span>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeMision">Misión <span class="rae-optional">(opcional)</span></label>' +
          '<textarea id="raeMision" class="rae-input rae-textarea" placeholder="¿Cuál es el propósito de tu empresa?" maxlength="400" style="min-height:76px">' + esc(data.mision) + '</textarea>' +
        '</div>' +

        '<div class="rae-field">' +
          '<label for="raeVision">Visión <span class="rae-optional">(opcional)</span></label>' +
          '<textarea id="raeVision" class="rae-input rae-textarea" placeholder="¿A dónde quiere llegar tu empresa?" maxlength="400" style="min-height:76px">' + esc(data.vision) + '</textarea>' +
        '</div>' +

        '<div class="rae-note">' +
          '<span class="rae-note__icon">⭐</span>' +
          '<span>Las calificaciones y reseñas de otros usuarios se activan automáticamente en tu perfil una vez completado el registro; no se configuran aquí.</span>' +
        '</div>' +
      '</div>'
    );
  }

  function wirePasoOpcional(container, stateSlice) {
    if (!stateSlice.redesSociales) stateSlice.redesSociales = {};
    if (!stateSlice.fotos) stateSlice.fotos = [];
    if (!stateSlice.areasCobertura) stateSlice.areasCobertura = [];

    REDES_SOCIALES_DISPONIBLES.forEach(function (r) {
      var el = container.querySelector('#' + r.elId);
      if (!el) return;
      el.addEventListener('input', function () { limpiarError(container, r.elId); });
    });

    var videoInput = container.querySelector('#raeVideoPresentacion');
    videoInput.addEventListener('input', function () { limpiarError(container, 'raeVideoPresentacion'); });

    var residuosInput = container.querySelector('#raeResiduosMensuales');
    residuosInput.addEventListener('input', function () { limpiarError(container, 'raeResiduosMensuales'); });

    var coberturaGrid = container.querySelector('#raeCoberturaGrid');
    coberturaGrid.addEventListener('click', function (e) {
      var chip = e.target.closest('.rae-chip');
      if (!chip) return;
      var activo = chip.classList.toggle('rae-chip--active');
      chip.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });

    var fotosGrid = container.querySelector('#raeFotosGrid');
    var fotoInput = container.querySelector('#raeFotoInput');
    var fotosHint = container.querySelector('#raeFotosHint');

    function reconstruirGridFotos() {
      var addBtnHtml = '<button type="button" class="rae-photo-add" id="raeFotoAddBtn"' + (stateSlice.fotos.length < RAE_MAX_FOTOS ? '' : ' disabled') + '>' + RAE_PLUS_SVG + '<span>Agregar</span></button>';
      var thumbs = stateSlice.fotos.map(function (f, i) {
        return (
          '<div class="rae-photo-thumb" data-foto-index="' + i + '">' +
            '<img src="' + f.dataUrl + '" alt="Foto ' + (i + 1) + '">' +
            '<button type="button" class="rae-photo-thumb__remove" data-foto-remove="' + i + '" aria-label="Quitar foto">' + RAE_X_SVG_SM + '</button>' +
          '</div>'
        );
      }).join('');
      fotosGrid.innerHTML = thumbs + addBtnHtml;
      var nuevoAddBtn = fotosGrid.querySelector('#raeFotoAddBtn');
      if (nuevoAddBtn) nuevoAddBtn.addEventListener('click', function () { fotoInput.click(); });
    }

    var addBtnInicial = fotosGrid.querySelector('#raeFotoAddBtn');
    if (addBtnInicial) addBtnInicial.addEventListener('click', function () { fotoInput.click(); });

    fotosGrid.addEventListener('click', function (e) {
      var removeBtn = e.target.closest('[data-foto-remove]');
      if (!removeBtn) return;
      var idx = parseInt(removeBtn.getAttribute('data-foto-remove'), 10);
      stateSlice.fotos.splice(idx, 1);
      reconstruirGridFotos();
    });

    fotoInput.addEventListener('change', function () {
      var files = Array.prototype.slice.call(fotoInput.files || []);
      if (!files.length) return;
      fotosHint.textContent = 'PNG, JPG o WEBP, hasta 3 MB cada una.';
      fotosHint.classList.remove('rae-hint--limit');

      files.forEach(function (file) {
        if (stateSlice.fotos.length >= RAE_MAX_FOTOS) return;
        if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
          fotosHint.textContent = 'Algún archivo no es PNG, JPG o WEBP y fue omitido.';
          fotosHint.classList.add('rae-hint--limit');
          return;
        }
        if (file.size > 3 * 1024 * 1024) {
          fotosHint.textContent = 'Algún archivo pesa más de 3 MB y fue omitido.';
          fotosHint.classList.add('rae-hint--limit');
          return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          stateSlice.fotos.push({ dataUrl: e.target.result, fileName: file.name });
          reconstruirGridFotos();
        };
        reader.readAsDataURL(file);
      });
      fotoInput.value = '';
    });
  }

  function validarPasoOpcional(container) {
    var valido = true;

    REDES_SOCIALES_DISPONIBLES.forEach(function (r) {
      var el = container.querySelector('#' + r.elId);
      var valor = el.value.trim();
      if (valor && !esSitioWebValido(valor)) { marcarError(container, r.elId); valido = false; }
      else { limpiarError(container, r.elId); }
    });

    var video = container.querySelector('#raeVideoPresentacion').value.trim();
    if (video && !esSitioWebValido(video)) { marcarError(container, 'raeVideoPresentacion'); valido = false; }
    else { limpiarError(container, 'raeVideoPresentacion'); }

    var residuos = container.querySelector('#raeResiduosMensuales').value.trim();
    if (residuos) {
      var residuosNum = parseFloat(residuos);
      if (isNaN(residuosNum) || residuosNum < 0) { marcarError(container, 'raeResiduosMensuales'); valido = false; }
      else { limpiarError(container, 'raeResiduosMensuales'); }
    } else {
      limpiarError(container, 'raeResiduosMensuales');
    }

    return valido;
  }

  function recolectarPasoOpcional(container, stateSlice) {
    var redes = {};
    REDES_SOCIALES_DISPONIBLES.forEach(function (r) {
      var valor = container.querySelector('#' + r.elId).value.trim();
      if (valor && !/^https?:\/\//i.test(valor)) valor = 'https://' + valor;
      redes[r.id] = valor;
    });
    stateSlice.redesSociales = redes;

    var video = container.querySelector('#raeVideoPresentacion').value.trim();
    if (video && !/^https?:\/\//i.test(video)) video = 'https://' + video;
    stateSlice.videoPresentacion = video;

    var coberturaGrid = container.querySelector('#raeCoberturaGrid');
    var cobertura = [];
    coberturaGrid.querySelectorAll('.rae-chip--active').forEach(function (chip) {
      cobertura.push(chip.getAttribute('data-provincia-cobertura'));
    });
    stateSlice.areasCobertura = cobertura;

    var residuos = container.querySelector('#raeResiduosMensuales').value.trim();
    stateSlice.residuosMensuales = residuos !== '' ? parseFloat(residuos) : null;

    stateSlice.mision = container.querySelector('#raeMision').value.trim();
    stateSlice.vision = container.querySelector('#raeVision').value.trim();
    // stateSlice.fotos ya se mantiene actualizado directamente por wirePasoOpcional.

    return stateSlice;
  }

  /* ══════════════════════════════════════════════
     REGISTRO DE PASOS
     ─────────────────────────────────────────────
     Cada paso: { key, kicker, titulo, render, wire, validate, recolectar }
     Los 9 pasos del flujo ya están completos.
     ══════════════════════════════════════════════ */
  var RAE_STEPS = [
    {
      key: 'empresa',
      titulo: 'Información de la empresa',
      render: renderPasoEmpresa,
      wire: wirePasoEmpresa,
      validate: validarPasoEmpresa,
      recolectar: recolectarPasoEmpresa
    },
    {
      key: 'contacto',
      titulo: 'Información de contacto',
      render: renderPasoContacto,
      wire: wirePasoContacto,
      validate: validarPasoContacto,
      recolectar: recolectarPasoContacto
    },
    {
      key: 'ubicacion',
      titulo: 'Ubicación',
      render: renderPasoUbicacion,
      wire: wirePasoUbicacion,
      validate: validarPasoUbicacion,
      recolectar: recolectarPasoUbicacion
    },
    {
      key: 'materiales',
      titulo: 'Materiales que reciben',
      render: renderPasoMateriales,
      wire: wirePasoMateriales,
      validate: validarPasoMateriales,
      recolectar: recolectarPasoMateriales
    },
    {
      key: 'servicios',
      titulo: 'Servicios que ofrecen',
      render: renderPasoServicios,
      wire: wirePasoServicios,
      validate: validarPasoServicios,
      recolectar: recolectarPasoServicios
    },
    {
      key: 'horarios',
      titulo: 'Horarios',
      render: renderPasoHorarios,
      wire: wirePasoHorarios,
      validate: validarPasoHorarios,
      recolectar: recolectarPasoHorarios
    },
    {
      key: 'operativa',
      titulo: 'Información operativa',
      render: renderPasoOperativa,
      wire: wirePasoOperativa,
      validate: validarPasoOperativa,
      recolectar: recolectarPasoOperativa
    },
    {
      key: 'cuenta',
      titulo: 'Cuenta de acceso',
      render: renderPasoCuenta,
      wire: wirePasoCuenta,
      validate: validarPasoCuenta,
      recolectar: recolectarPasoCuenta
    },
    {
      key: 'opcional',
      titulo: 'Información opcional',
      render: renderPasoOpcional,
      wire: wirePasoOpcional,
      validate: validarPasoOpcional,
      recolectar: recolectarPasoOpcional
    }
  ];

  /* ══════════════════════════════════════════════
     CONSTRUCCIÓN DEL MODAL (una sola vez, reutilizable)
     ══════════════════════════════════════════════ */
  function buildModal() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="raeTitulo">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker">Registro de aliado · Paso <span id="raePasoActual">1</span> de <span id="raePasoTotal">' + TOTAL_PASOS_PLANEADOS + '</span></p>' +
            '<h2 class="rae-modal__title" id="raeTitulo"></h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="raeClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__progress-track"><div class="rae-modal__progress-bar" id="raeProgressBar"></div></div>' +
        '<div class="rae-modal__body" id="raeBody"></div>' +
        '<div class="rae-modal__status" id="raeStatus"></div>' +
        '<div class="rae-modal__footer">' +
          '<button type="button" class="rae-btn" id="raeBtnAtras">← Atrás</button>' +
          '<button type="button" class="rae-btn rae-btn--primario" id="raeBtnSiguiente">Siguiente →</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    overlayEl = overlay;

    overlay.querySelector('#raeClose').addEventListener('click', pedirCierre);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) pedirCierre();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.getAttribute('data-open') === 'true') pedirCierre();
    });

    overlay.querySelector('#raeBtnAtras').addEventListener('click', irAtras);
    overlay.querySelector('#raeBtnSiguiente').addEventListener('click', irSiguiente);

    modalBuilt = true;
  }

  /* ══════════════════════════════════════════════
     NAVEGACIÓN ENTRE PASOS
     ══════════════════════════════════════════════ */
  function renderStep(index) {
    var paso = RAE_STEPS[index];
    var body = overlayEl.querySelector('#raeBody');
    var titulo = overlayEl.querySelector('#raeTitulo');
    var pasoActualEl = overlayEl.querySelector('#raePasoActual');
    var progressBar = overlayEl.querySelector('#raeProgressBar');
    var atrasBtn = overlayEl.querySelector('#raeBtnAtras');
    var siguienteBtn = overlayEl.querySelector('#raeBtnSiguiente');
    var closeBtn = overlayEl.querySelector('#raeClose');
    var status = overlayEl.querySelector('#raeStatus');

    if (!RAE_STATE[paso.key]) RAE_STATE[paso.key] = {};

    titulo.textContent = paso.titulo;
    pasoActualEl.textContent = String(index + 1);
    progressBar.style.width = (((index + 1) / TOTAL_PASOS_PLANEADOS) * 100) + '%';
    atrasBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
    atrasBtn.disabled = false;
    siguienteBtn.disabled = false;
    siguienteBtn.style.display = '';
    siguienteBtn.textContent = (index === RAE_STEPS.length - 1) ? 'Registrar aliado ✓' : 'Siguiente →';
    closeBtn.disabled = false;
    status.setAttribute('data-visible', 'false');

    body.innerHTML = paso.render(RAE_STATE[paso.key]);
    body.scrollTop = 0;
    paso.wire(body, RAE_STATE[paso.key]);
  }

  function irAtras() {
    if (currentStepIndex === 0) return;
    currentStepIndex -= 1;
    renderStep(currentStepIndex);
  }

  function irSiguiente() {
    var paso = RAE_STEPS[currentStepIndex];
    var body = overlayEl.querySelector('#raeBody');

    if (!paso.validate(body)) {
      mostrarStatus('error', 'Revisa los campos marcados antes de continuar.');
      return;
    }

    paso.recolectar(body, RAE_STATE[paso.key]);

    if (currentStepIndex < RAE_STEPS.length - 1) {
      // Ya existe el siguiente paso implementado
      currentStepIndex += 1;
      renderStep(currentStepIndex);
      return;
    }

    // Último paso (9 de 9) ya validado y guardado: se envía el
    // registro completo a Supabase (cuenta + archivos + perfil).
    enviarRegistroFinal();
  }

  function mostrarStatus(tipo, mensaje) {
    var status = overlayEl.querySelector('#raeStatus');
    status.textContent = mensaje;
    status.setAttribute('data-tipo', tipo);
    status.setAttribute('data-visible', 'true');
  }

  function deshabilitarNavegacion(deshabilitado) {
    var siguienteBtn = overlayEl.querySelector('#raeBtnSiguiente');
    var atrasBtn = overlayEl.querySelector('#raeBtnAtras');
    var closeBtn = overlayEl.querySelector('#raeClose');
    siguienteBtn.disabled = deshabilitado;
    atrasBtn.disabled = deshabilitado;
    closeBtn.disabled = deshabilitado;
    siguienteBtn.textContent = deshabilitado ? 'Enviando...' : 'Registrar aliado ✓';
  }

  /* ── Convierte un dataURL (como los que guarda el logo/las fotos en
     memoria) a un Blob real, para poder subirlo a Supabase Storage ── */
  function dataUrlABlob(dataUrl) {
    var partes = dataUrl.split(',');
    var mimeMatch = partes[0].match(/:(.*?);/);
    var mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    var binario = atob(partes[1]);
    var bytes = new Uint8Array(binario.length);
    for (var i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
    return { blob: new Blob([bytes], { type: mime }), mime: mime };
  }

  function extensionDeMime(mime) {
    if (mime === 'image/png') return 'png';
    if (mime === 'image/webp') return 'webp';
    return 'jpg';
  }

  /* ── Sube un archivo (logo o foto) al bucket "aliados", dentro de una
     carpeta con el id del usuario, y devuelve su URL pública ── */
  function subirArchivoAliado(client, userId, dataUrl, nombreBase) {
    var info = dataUrlABlob(dataUrl);
    var ext = extensionDeMime(info.mime);
    var ruta = userId + '/' + nombreBase + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6) + '.' + ext;
    return client.storage.from('aliados').upload(ruta, info.blob, { contentType: info.mime, upsert: false }).then(function (res) {
      if (res.error) throw res.error;
      var pub = client.storage.from('aliados').getPublicUrl(ruta);
      return pub && pub.data ? pub.data.publicUrl : null;
    });
  }

  function traducirErrorEnvio(err) {
    if (!err) return 'Ocurrió un error inesperado. Intenta de nuevo.';
    var msg = (err.message || '').toLowerCase();
    if (msg.indexOf('duplicate') !== -1 || msg.indexOf('unique') !== -1) return 'Ya existe un registro de aliado con esos datos (correo o RUC).';
    if (msg.indexOf('row-level security') !== -1 || msg.indexOf('policy') !== -1) return 'No se pudo guardar el perfil por un problema de permisos. Contacta a soporte.';
    if (msg.indexOf('network') !== -1 || msg.indexOf('fetch') !== -1) return 'No se pudo conectar. Revisa tu conexión a internet.';
    return err.message || 'Ocurrió un error inesperado. Intenta de nuevo.';
  }

  /* ── Envío final: crea la cuenta (auth.js), sube logo/fotos a
     Supabase Storage (bucket "aliados") y luego inserta la fila
     completa en la tabla `aliados` (ver supabase-setup.sql). Si la
     cuenta se crea pero falla un paso posterior, el usuario puede
     reintentar "Registrar aliado" de nuevo: signUp con un correo ya
     registrado simplemente devuelve error y se lo mostramos. ── */
  function enviarRegistroFinal() {
    var client = window.recoSupabase;
    if (!client || !window.recoAuth) {
      mostrarStatus('error', 'No se pudo conectar con el servicio. Intenta de nuevo más tarde.');
      return;
    }

    var empresa = RAE_STATE.empresa || {};
    var contacto = RAE_STATE.contacto || {};
    var ubicacion = RAE_STATE.ubicacion || {};
    var materiales = RAE_STATE.materiales || {};
    var servicios = RAE_STATE.servicios || {};
    var horarios = RAE_STATE.horarios || {};
    var operativa = RAE_STATE.operativa || {};
    var cuenta = RAE_STATE.cuenta || {};
    var opcional = RAE_STATE.opcional || {};

    // El registro de aliado ya no crea una cuenta nueva: exige sesión
    // iniciada de antemano (ver requireSesionYAbrir), así que el
    // user_id sale directo de esa sesión vigente. Si por alguna razon
    // se perdió la sesión entre que se abrió el modal y este envío
    // final (ej. expiró el token, o se cerró sesión en otra pestaña),
    // se revisa de nuevo aquí para no insertar con un user_id viejo.
    deshabilitarNavegacion(true);
    mostrarStatus('ok', 'Verificando tu sesión...');

    window.recoAuth.getVerifiedSession().then(function (sesionVigente) {
      var userId = sesionVigente && sesionVigente.user && sesionVigente.user.id;
      if (!userId) {
        throw { mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión e intenta el registro de nuevo.' };
      }
      return userId;
    }).then(function (userId) {
      mostrarStatus('ok', 'Subiendo logo y fotos...');

      var logoPromise = empresa.logoDataUrl
        ? subirArchivoAliado(client, userId, empresa.logoDataUrl, 'logo')
        : Promise.resolve(null);

      var fotosPromise = Promise.all((opcional.fotos || []).map(function (f, i) {
        return subirArchivoAliado(client, userId, f.dataUrl, 'foto-' + i);
      }));

      return Promise.all([logoPromise, fotosPromise]).then(function (resultados) {
        var logoUrl = resultados[0];
        var fotosUrls = resultados[1];

        mostrarStatus('ok', 'Guardando tu perfil de aliado...');

        var payload = {
          user_id: userId,
          nombre_empresa: empresa.nombreEmpresa,
          nombre_comercial: empresa.nombreComercial || null,
          ruc: empresa.ruc,
          tipo_empresa: empresa.tipoEmpresa,
          anio_fundacion: empresa.anioFundacion || null,
          descripcion: empresa.descripcion,
          logo_url: logoUrl,
          email: contacto.email,
          telefono: contacto.telefono,
          whatsapp: contacto.whatsapp || null,
          sitio_web: contacto.sitioWeb || null,
          provincia: ubicacion.provincia,
          distrito: ubicacion.distrito,
          direccion: ubicacion.direccion,
          lat: ubicacion.lat,
          lng: ubicacion.lng,
          materiales: materiales.materiales || [],
          servicios: servicios.servicios || [],
          dias_atencion: horarios.dias || [],
          hora_apertura: horarios.horaApertura,
          hora_cierre: horarios.horaCierre,
          acepta_particulares: operativa.aceptaParticulares,
          acepta_empresas: operativa.aceptaEmpresas,
          cantidad_minima: operativa.cantidadMinima,
          cantidad_maxima: operativa.cantidadMaxima,
          paga_materiales: operativa.pagaMateriales,
          metodos_pago: operativa.metodosPago || [],
          redes_sociales: opcional.redesSociales || {},
          fotos_urls: fotosUrls,
          video_presentacion: opcional.videoPresentacion || null,
          areas_cobertura: opcional.areasCobertura || [],
          residuos_mensuales_kg: opcional.residuosMensuales,
          mision: opcional.mision || null,
          vision: opcional.vision || null
        };

        return client.from('aliados').insert([payload]);
      });
    }).then(function (resInsert) {
      if (resInsert.error) {
        throw { mensaje: traducirErrorEnvio(resInsert.error) };
      }

      registroCompletado = true;
      mostrarStatus('ok', '✓ ¡Listo! Tu empresa quedó registrada. Revisaremos tu perfil y pronto aparecerá como aliado en RECO+.');
      overlayEl.querySelector('#raeBtnSiguiente').style.display = 'none';
      overlayEl.querySelector('#raeBtnAtras').style.visibility = 'hidden';
      overlayEl.querySelector('#raeClose').disabled = false;
    }).catch(function (err) {
      deshabilitarNavegacion(false);
      var mensaje = (err && err.mensaje) || traducirErrorEnvio(err);
      mostrarStatus('error', mensaje);
    });
  }

  /* ══════════════════════════════════════════════
     ABRIR / CERRAR
     ══════════════════════════════════════════════ */
  function hayDatosSinGuardar() {
    var d = RAE_STATE.empresa;
    if (!d) return false;
    return !!(d.nombreEmpresa || d.nombreComercial || d.ruc || d.tipoEmpresa || d.anioFundacion || d.descripcion || d.logoDataUrl);
  }

  function pedirCierre() {
    if (!registroCompletado && hayDatosSinGuardar()) {
      var ok = window.confirm('¿Seguro que quieres cerrar? Se perderá la información ingresada en este formulario.');
      if (!ok) return;
    }
    closeModal();
  }

  function openModal() {
    if (!modalBuilt) buildModal();
    currentStepIndex = 0;
    RAE_STATE = {};
    registroCompletado = false;
    renderStep(currentStepIndex);
    overlayEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlayEl) return;
    overlayEl.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  window.recoRegistroAliado = { open: openModal, close: closeModal };

  // ── AVISO "debes iniciar sesión" ──
  // Se muestra en vez del modal de registro cuando alguien hace clic
  // en "Registrarse →" sin tener sesión activa. Es un overlay aparte
  // y más simple que el modal de pasos (no usa RAE_STATE ni el resto
  // de la maquinaria de pasos).
  var avisoSesionEl = null;

  function buildAvisoSesion() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="raeAvisoTitulo" style="max-width:420px">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker">Registro de aliado</p>' +
            '<h2 class="rae-modal__title" id="raeAvisoTitulo">Inicia sesión primero</h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="raeAvisoClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__body">' +
          '<p class="rae-step__desc">Para registrar tu empresa como aliado, primero necesitas iniciar sesión (o crear una cuenta) en RECO+. Tu empresa quedará ligada a esa cuenta.</p>' +
        '</div>' +
        '<div class="rae-modal__footer">' +
          '<button type="button" class="rae-btn" id="raeAvisoCancelar">Cancelar</button>' +
          '<button type="button" class="rae-btn rae-btn--primario" id="raeAvisoIrLogin">Iniciar sesión →</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    avisoSesionEl = overlay;

    function cerrarAviso() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }

    overlay.querySelector('#raeAvisoClose').addEventListener('click', cerrarAviso);
    overlay.querySelector('#raeAvisoCancelar').addEventListener('click', cerrarAviso);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) cerrarAviso();
    });
    overlay.querySelector('#raeAvisoIrLogin').addEventListener('click', function () {
      window.location.href = 'login.html';
    });
  }

  function abrirAvisoSesion() {
    if (!avisoSesionEl) buildAvisoSesion();
    avisoSesionEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
  }

  // ── AVISO "ya tienes una empresa registrada" ──
  // Se muestra en vez del formulario de 9 pasos cuando la cuenta con
  // sesión activa YA tiene una fila en `aliados` (columna user_id,
  // UNIQUE en la base de datos — ver supabase-setup.sql). Ofrece un
  // acceso directo a Ajustes de cuenta en vez de dejar que la
  // persona llene todo el formulario para toparse recién al final
  // con un error de registro duplicado.
  var avisoYaRegistradoEl = null;

  function buildAvisoYaRegistrado() {
    var overlay = document.createElement('div');
    overlay.className = 'rae-overlay';
    overlay.setAttribute('data-open', 'false');

    overlay.innerHTML =
      '<div class="rae-modal" role="dialog" aria-modal="true" aria-labelledby="raeYaRegTitulo" style="max-width:420px">' +
        '<div class="rae-modal__header">' +
          '<div>' +
            '<p class="rae-modal__kicker">Registro de aliado</p>' +
            '<h2 class="rae-modal__title" id="raeYaRegTitulo">Ya tienes una empresa registrada</h2>' +
          '</div>' +
          '<button type="button" class="rae-modal__close" id="raeYaRegClose" aria-label="Cerrar">' +
            '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="rae-modal__body">' +
          '<p class="rae-step__desc">Esta cuenta ya tiene una empresa o centro de reciclaje registrado en RECO+. Solo se permite una empresa por cuenta, así que no puedes crear otra desde aquí.</p>' +
          '<p class="rae-step__desc">Si necesitas actualizar los datos de tu empresa, o revisar tu cuenta, puedes hacerlo desde Ajustes.</p>' +
        '</div>' +
        '<div class="rae-modal__footer">' +
          '<button type="button" class="rae-btn" id="raeYaRegCancelar">Cerrar</button>' +
          '<button type="button" class="rae-btn rae-btn--primario" id="raeYaRegIrAjustes">Ir a Ajustes de cuenta →</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    avisoYaRegistradoEl = overlay;

    function cerrarAviso() {
      overlay.setAttribute('data-open', 'false');
      document.body.style.overflow = '';
    }

    overlay.querySelector('#raeYaRegClose').addEventListener('click', cerrarAviso);
    overlay.querySelector('#raeYaRegCancelar').addEventListener('click', cerrarAviso);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) cerrarAviso();
    });
    overlay.querySelector('#raeYaRegIrAjustes').addEventListener('click', function () {
      cerrarAviso();
      // ajustes-modal.js expone window.recoAjustes.open() y ya está
      // cargado en alianzas.html; si por alguna razón no está
      // disponible, no rompemos nada, simplemente no pasa nada más
      // (el aviso ya se cerró).
      if (window.recoAjustes && typeof window.recoAjustes.open === 'function') {
        window.recoAjustes.open();
      }
    });
  }

  function abrirAvisoYaRegistrado() {
    if (!avisoYaRegistradoEl) buildAvisoYaRegistrado();
    avisoYaRegistradoEl.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
  }

  // ── Verifica sesión antes de abrir el modal de registro ──
  // El registro de aliado exige sesión activa (el correo de la
  // empresa es el mismo de la cuenta con la que se inició sesión).
  // Por eso, antes de abrir el modal de pasos, se verifica la sesión
  // contra el servidor (getVerifiedSession, no la copia cacheada en
  // localStorage), y LUEGO se consulta si esa cuenta ya tiene una
  // empresa registrada en `aliados`. Solo si hay sesión Y todavía no
  // tiene empresa, se abre el formulario de 9 pasos.
  function requireSesionYAbrir(trigger) {
    if (!window.recoAuth) {
      console.error('[RECO+] recoAuth no está disponible. Revisa que auth.js se cargó antes que alianzas-registro-modal.js.');
      return;
    }

    trigger.style.pointerEvents = 'none';

    window.recoAuth.getVerifiedSession().then(function (sesion) {
      if (!sesion || !sesion.user) {
        trigger.style.pointerEvents = '';
        abrirAvisoSesion();
        return;
      }

      RAE_SESION_ACTUAL = sesion;

      var client = window.recoSupabase;
      if (!client) {
        // Sin cliente de Supabase no podemos verificar de antemano; se
        // deja pasar al formulario (la restricción UNIQUE de la base
        // de datos igual protege contra duplicados en el envío final).
        trigger.style.pointerEvents = '';
        openModal();
        return;
      }

      client.from('aliados').select('id').eq('user_id', sesion.user.id).maybeSingle().then(function (res) {
        trigger.style.pointerEvents = '';
        if (res.data) {
          abrirAvisoYaRegistrado();
        } else {
          openModal();
        }
      }).catch(function () {
        // Si la verificación falla (red, etc.), no bloqueamos el
        // flujo: se deja abrir el formulario y, en el peor caso, el
        // insert final fallaría igual por la restricción UNIQUE.
        trigger.style.pointerEvents = '';
        openModal();
      });
    }).catch(function () {
      trigger.style.pointerEvents = '';
      abrirAvisoSesion();
    });
  }

  /* ══════════════════════════════════════════════
     ENGANCHE: botón "Registrarse →" de la tarjeta
     "Registra tu empresa o fundación"
     ══════════════════════════════════════════════ */
  ready(function () {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('#btnRegistrarEmpresaAliado');
      if (trigger) {
        e.preventDefault();
        requireSesionYAbrir(trigger);
      }
    });
  });
})();
