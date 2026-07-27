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

  if (closeModal) {
    closeModal.addEventListener('click', () => modal.classList.remove('open'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  /* ---- SUBMIT DONAR ---- */
  const btnDonar = document.getElementById('btnDonar');
  if (btnDonar) {
    btnDonar.addEventListener('click', () => {
      const categoria = document.getElementById('donacion-categoria').value;
      if (!categoria) {
        shakeBtn(btnDonar);
        return;
      }
      openModal(true);
    });
  }

  /* ---- SUBMIT SOLICITAR ---- */
  const btnSolicitar = document.getElementById('btnSolicitar');
  if (btnSolicitar) {
    btnSolicitar.addEventListener('click', () => {
      openModal(false);
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