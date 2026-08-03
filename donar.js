/* ===========================
   DONAR.JS — Lógica de la página Donar
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- TABS ---- */
  const tabs = document.querySelectorAll('.donar-tab');
  const panels = document.querySelectorAll('.donar-form-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Activar tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Mostrar panel correspondiente
      panels.forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`panel-${target}`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  /* ---- DRAG & DROP / CLICK TO UPLOAD (Formulario donar) ---- */
  setupUpload('dropzone', 'fileInput', 'preview-container', 'preview-img', 'removeImg');

  /* ---- DRAG & DROP / CLICK TO UPLOAD (Formulario solicitar) ---- */
  setupUpload('dropzone2', 'fileInput2', null, null, null);

  function setupUpload(dropzoneId, inputId, previewContainerId, previewImgId, removeId) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(inputId);
    if (!dropzone || !fileInput) return;

    // Click sobre el dropzone → abrir selector de archivo
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag over
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    // Drop
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && previewContainerId) showPreview(file, previewContainerId, previewImgId, dropzoneId);
    });

    // Change (selector nativo)
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file && previewContainerId) showPreview(file, previewContainerId, previewImgId, dropzoneId);
    });

    // Botón quitar imagen
    if (removeId) {
      const removeBtn = document.getElementById(removeId);
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          const container = document.getElementById(previewContainerId);
          const dz = document.getElementById(dropzoneId);
          if (container) container.style.display = 'none';
          if (dz) dz.style.display = 'block';
          fileInput.value = '';
        });
      }
    }
  }

  function showPreview(file, containerId, imgId, dropzoneId) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.getElementById(containerId);
      const img = document.getElementById(imgId);
      const dz = document.getElementById(dropzoneId);
      if (img) img.src = e.target.result;
      if (container) container.style.display = 'block';
      if (dz) dz.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  /* ---- MODAL DE ÉXITO ---- */
  const modal = document.getElementById('donarModal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMsg = document.getElementById('modalMsg');

  function openModal(isDonar) {
    if (isDonar) {
      modalTitle.textContent = t('donar.modalExito.donar.title');
      modalMsg.textContent = t('donar.modalExito.donar.desc');
    } else {
      modalTitle.textContent = t('donar.modalExito.solicitar.title');
      modalMsg.textContent = t('donar.modalExito.solicitar.desc');
    }
    modal.classList.add('open');
  }

  /* Modal reutilizado para avisar que hace falta iniciar sesión antes
     de publicar (mismo overlay/estructura visual que el de éxito). */
  function openLoginRequiredModal() {
    modalTitle.textContent = t('donar.modalLogin.title');
    modalMsg.textContent = t('donar.modalLogin.desc');
    modal.classList.add('open');
  }

  if (closeModal) {
    closeModal.addEventListener('click', () => modal.classList.remove('open'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  /* ---- Helper: obtiene el cliente Supabase o avisa si no está listo ---- */
  function getSupabaseClient() {
    if (!window.recoSupabase) {
      console.error('[RECO+] recoSupabase no está inicializado. Revisa que supabase-config.js se cargó antes que donar.js.');
      return null;
    }
    return window.recoSupabase;
  }

  /* ---- Helper: pone un botón en estado "publicando..." ---- */
  function setBtnLoading(btn, loadingText) {
    if (!btn) return null;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = loadingText || t('donar.btn.publicando');
    return function restore() {
      btn.disabled = false;
      btn.textContent = originalText;
    };
  }

  /* ---- Helper: lee el input de imagen (si hay archivo) como base64 ---- */
  function readImageAsBase64(fileInputId) {
    const input = document.getElementById(fileInputId);
    const file = input && input.files && input.files[0];
    if (!file) return Promise.resolve(null);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  /* ---- VALIDACIÓN DE CAMPOS OBLIGATORIOS ----
     Todos los campos de ambos formularios son requeridos (incluida
     la foto). Recorre una lista de ids, marca con .donar-input--error
     los que estén vacíos y hace focus en el primero. Devuelve true
     si todo está completo. */
  function validateRequiredFields(fieldIds, fileInputId) {
    let firstInvalid = null;
    let allValid = true;

    fieldIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const value = (el.value || '').trim();
      if (!value) {
        allValid = false;
        el.classList.add('donar-input--error');
        if (!firstInvalid) firstInvalid = el;
      } else {
        el.classList.remove('donar-input--error');
      }
    });

    // Foto: también obligatoria, se valida contra el <input type="file">
    if (fileInputId) {
      const fileInput = document.getElementById(fileInputId);
      const dropzoneId = fileInput ? fileInput.id === 'fileInput' ? 'dropzone' : 'dropzone2' : null;
      const dropzone = dropzoneId ? document.getElementById(dropzoneId) : null;
      const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
      if (!hasFile) {
        allValid = false;
        if (dropzone) dropzone.classList.add('donar-input--error');
        if (!firstInvalid && dropzone) firstInvalid = dropzone;
      } else if (dropzone) {
        dropzone.classList.remove('donar-input--error');
      }
    }

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof firstInvalid.focus === 'function') firstInvalid.focus();
    }

    return allValid;
  }

  // Quita el resaltado de error apenas el usuario corrige el campo
  document.querySelectorAll('.donar-input').forEach((el) => {
    const clear = () => el.classList.remove('donar-input--error');
    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  });

  /* ---- SUBMIT DONAR ---- */
  const btnDonar = document.getElementById('btnDonar');
  if (btnDonar) {
    btnDonar.addEventListener('click', async () => {
      const camposDonar = [
        'donacion-categoria',
        'donacion-disponibilidad',
        'donacion-descripcion',
        'donacion-ubicacion',
        'donacion-punto'
      ];
      if (!validateRequiredFields(camposDonar, 'fileInput')) {
        shakeBtn(btnDonar);
        return;
      }

      const categoriaEl = document.getElementById('donacion-categoria');
      const categoria = categoriaEl ? categoriaEl.value : '';

      const client = getSupabaseClient();
      if (!client || !window.recoAuth) {
        openLoginRequiredModal();
        return;
      }

      const session = await window.recoAuth.getSession();
      if (!session || !session.user) {
        openLoginRequiredModal();
        return;
      }

      const restoreBtn = setBtnLoading(btnDonar, 'Publicando...');

      const disponibilidad = (document.getElementById('donacion-disponibilidad') || {}).value || null;
      const descripcion = (document.getElementById('donacion-descripcion') || {}).value || null;
      const ubicacion = (document.getElementById('donacion-ubicacion') || {}).value || null;
      const punto = (document.getElementById('donacion-punto') || {}).value || null;
      const empresaDestino = (document.getElementById('donacion-empresa') || {}).value || null;
      const imagenBase64 = await readImageAsBase64('fileInput');

      const autorNombre =
        (session.user.user_metadata && (session.user.user_metadata.nombre || session.user.user_metadata.full_name)) ||
        session.user.email ||
        'Usuario RECO+';

      const { error } = await client.from('donaciones').insert({
        user_id: session.user.id,
        tipo: 'donar',
        categoria: categoria,
        disponibilidad: disponibilidad,
        descripcion: descripcion,
        ubicacion: ubicacion,
        punto_funcional: punto,
        empresa_destino: empresaDestino,
        imagen_base64: imagenBase64,
        autor_nombre: autorNombre
      });

      if (restoreBtn) restoreBtn();

      if (error) {
        console.error('[RECO+] Error al publicar donación:', error);
        modalTitle.textContent = t('donar.modalError.title');
        modalMsg.textContent = t('donar.modalError.desc.donar');
        modal.classList.add('open');
        return;
      }

      openModal(true);
      if (window.dhRefreshListings) window.dhRefreshListings();
    });
  }

  /* ---- SUBMIT SOLICITAR ---- */
  const btnSolicitar = document.getElementById('btnSolicitar');
  if (btnSolicitar) {
    btnSolicitar.addEventListener('click', async () => {
      const camposSolicitar = [
        'solicitud-categoria',
        'solicitud-disponibilidad',
        'solicitud-descripcion',
        'solicitud-ubicacion',
        'solicitud-punto'
      ];
      if (!validateRequiredFields(camposSolicitar, 'fileInput2')) {
        shakeBtn(btnSolicitar);
        return;
      }

      const categoriaEl = document.getElementById('solicitud-categoria');
      const categoria = categoriaEl ? categoriaEl.value : '';

      const client = getSupabaseClient();
      if (!client || !window.recoAuth) {
        openLoginRequiredModal();
        return;
      }

      const session = await window.recoAuth.getSession();
      if (!session || !session.user) {
        openLoginRequiredModal();
        return;
      }

      const restoreBtn = setBtnLoading(btnSolicitar, 'Publicando...');

      const disponibilidad = (document.getElementById('solicitud-disponibilidad') || {}).value || null;
      const descripcion = (document.getElementById('solicitud-descripcion') || {}).value || null;
      const ubicacion = (document.getElementById('solicitud-ubicacion') || {}).value || null;
      const punto = (document.getElementById('solicitud-punto') || {}).value || null;
      const empresaDestino = (document.getElementById('solicitud-empresa') || {}).value || null;
      const imagenBase64 = await readImageAsBase64('fileInput2');

      const autorNombre =
        (session.user.user_metadata && (session.user.user_metadata.nombre || session.user.user_metadata.full_name)) ||
        session.user.email ||
        'Usuario RECO+';

      const { error } = await client.from('donaciones').insert({
        user_id: session.user.id,
        tipo: 'solicitar',
        categoria: categoria,
        disponibilidad: disponibilidad,
        descripcion: descripcion,
        ubicacion: ubicacion,
        punto_funcional: punto,
        empresa_destino: empresaDestino,
        imagen_base64: imagenBase64,
        autor_nombre: autorNombre
      });

      if (restoreBtn) restoreBtn();

      if (error) {
        console.error('[RECO+] Error al publicar solicitud:', error);
        modalTitle.textContent = t('donar.modalError.title');
        modalMsg.textContent = t('donar.modalError.desc.solicitar');
        modal.classList.add('open');
        return;
      }

      openModal(false);
      if (window.dhRefreshListings) window.dhRefreshListings();
    });
  }

  /* ---- Animación de shake al fallar validación ---- */
  function shakeBtn(btn) {
    btn.style.animation = 'none';
    btn.offsetHeight; // reflow
    btn.style.animation = 'shake 0.4s ease';
    btn.addEventListener('animationend', () => {
      btn.style.animation = '';
    }, { once: true });
  }

  // Inyectar keyframe de shake si no existe
  if (!document.getElementById('shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
    `;
    document.head.appendChild(style);
  }

});