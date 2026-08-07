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
 * ESTADO ACTUAL: Paso 1 de 9 implementado ("Información de la
 * empresa"). Los pasos restantes se agregan de forma incremental
 * añadiendo nuevas entradas al array RAE_STEPS — el motor de
 * navegación (barra de progreso, Atrás/Siguiente, validación) ya
 * está listo para soportarlos sin cambios adicionales.
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
     REGISTRO DE PASOS
     ─────────────────────────────────────────────
     Cada paso: { key, kicker, titulo, render, wire, validate, recolectar }
     Los pasos 4–9 se añaden aquí en próximos mensajes.
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
    }
    // Próximos pasos: materiales, servicios, horarios, operativa,
    // cuenta, opcional.
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
    var status = overlayEl.querySelector('#raeStatus');

    if (!RAE_STATE[paso.key]) RAE_STATE[paso.key] = {};

    titulo.textContent = paso.titulo;
    pasoActualEl.textContent = String(index + 1);
    progressBar.style.width = (((index + 1) / TOTAL_PASOS_PLANEADOS) * 100) + '%';
    atrasBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
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

    if (RAE_STEPS.length < TOTAL_PASOS_PLANEADOS) {
      // Último paso implementado por ahora, pero faltan más en el flujo completo
      mostrarStatus('ok', '✓ Información guardada. Los siguientes pasos del formulario se irán agregando próximamente.');
      return;
    }

    // Todos los 9 pasos están implementados: aquí se conectará el
    // envío final a Supabase.
    mostrarStatus('ok', '✓ ¡Listo! (Envío final pendiente de implementar)');
  }

  function mostrarStatus(tipo, mensaje) {
    var status = overlayEl.querySelector('#raeStatus');
    status.textContent = mensaje;
    status.setAttribute('data-tipo', tipo);
    status.setAttribute('data-visible', 'true');
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
    if (hayDatosSinGuardar()) {
      var ok = window.confirm('¿Seguro que quieres cerrar? Se perderá la información ingresada en este formulario.');
      if (!ok) return;
    }
    closeModal();
  }

  function openModal() {
    if (!modalBuilt) buildModal();
    currentStepIndex = 0;
    RAE_STATE = {};
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

  /* ══════════════════════════════════════════════
     ENGANCHE: botón "Registrarse →" de la tarjeta
     "Registra tu empresa o fundación"
     ══════════════════════════════════════════════ */
  ready(function () {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('#btnRegistrarEmpresaAliado');
      if (trigger) {
        e.preventDefault();
        openModal();
      }
    });
  });
})();
