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
      modalTitle.textContent = '¡Donación publicada!';
      modalMsg.textContent = 'Tu donación ha sido publicada exitosamente. La comunidad RECO+ ya puede verla y contactarte.';
    } else {
      modalTitle.textContent = '¡Solicitud publicada!';
      modalMsg.textContent = 'Tu solicitud ha sido enviada. Pronto alguien de la comunidad RECO+ podrá ayudarte.';
    }
    modal.classList.add('open');
  }

  /* Modal reutilizado para avisar que hace falta iniciar sesión antes
     de publicar (mismo overlay/estructura visual que el de éxito). */
  function openLoginRequiredModal() {
    modalTitle.textContent = 'Inicia sesión para continuar';
    modalMsg.textContent = 'Necesitas tener una cuenta para publicar una donación o solicitud en RECO+.';
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
    btn.textContent = loadingText;
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

  /* ---- SUBMIT DONAR ---- */
  const btnDonar = document.getElementById('btnDonar');
  if (btnDonar) {
    btnDonar.addEventListener('click', async () => {
      const categoriaEl = document.getElementById('donacion-categoria');
      const categoria = categoriaEl ? categoriaEl.value : '';
      if (!categoria) {
        shakeBtn(btnDonar);
        return;
      }

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
        modalTitle.textContent = 'No se pudo publicar';
        modalMsg.textContent = 'Ocurrió un error al guardar tu donación. Intenta de nuevo en unos segundos.';
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
      const categoriaEl = document.getElementById('solicitud-categoria');
      const categoria = categoriaEl ? categoriaEl.value : '';
      if (!categoria) {
        shakeBtn(btnSolicitar);
        return;
      }

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
        modalTitle.textContent = 'No se pudo publicar';
        modalMsg.textContent = 'Ocurrió un error al guardar tu solicitud. Intenta de nuevo en unos segundos.';
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