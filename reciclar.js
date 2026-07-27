// ===========================
// RECICLAR PAGE — reciclar.js
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.rc-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  /* ---- Selección de material ---- */
  const materials = document.querySelectorAll('.rc-material');
  materials.forEach(m => {
    m.addEventListener('click', () => {
      materials.forEach(x => x.classList.remove('active'));
      m.classList.add('active');
    });
  });

  /* ---- Escáner: click en el área abre el input ---- */
  const scanDrop = document.getElementById('rcScannerDrop');
  const scanInput = document.getElementById('rcScanInput');
  const scanBtnHero = document.getElementById('rcScanBtn');
  if (scanDrop && scanInput) {
    scanDrop.addEventListener('click', () => scanInput.click());
  }
  if (scanBtnHero) {
    scanBtnHero.addEventListener('click', () => {
      document.querySelector('.rc-scanner__drop')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ---- Calculadora de impacto ---- */
  const calcBtn = document.getElementById('rcCalcBtn');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const botellas = parseFloat(document.getElementById('rcBotellas').value) || 0;
      const latas = parseFloat(document.getElementById('rcLatas').value) || 0;
      const hojas = parseFloat(document.getElementById('rcHojas').value) || 0;

      // Factores de impacto aproximados por unidad
      const arboles = (hojas * 0.006 + botellas * 0.02).toFixed(1);
      const energia = (botellas * 0.15 + latas * 0.25).toFixed(2);
      const agua = (botellas * 6 + latas * 3).toFixed(0);
      const co2 = (botellas * 0.24 + latas * 0.34 + hojas * 0.01).toFixed(1);

      document.getElementById('rcArboles').textContent = arboles;
      document.getElementById('rcEnergia').textContent = energia;
      document.getElementById('rcAgua').textContent = agua;
      document.getElementById('rcCo2').textContent = co2;
    });
  }

  /* ---- Mini mapa (vista previa, no interactivo) ---- */
  const mapEl = document.getElementById('rcMiniMap');
  if (mapEl && window.L) {
    const isDark = document.documentElement.classList.contains('dark');
    const map = L.map('rcMiniMap', {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false
    }).setView([8.4333, -82.4333], 13);

    // Expone la instancia globalmente para que capas aditivas externas
    // (ej. reciclar-theme-sync.js, que cambia el tile al togglear el
    // tema) puedan acceder al mini-mapa sin reestructurar este archivo.
    window.recoMiniMap = map;

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    window.recoMiniMapTileLayer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

    const dotIcon = L.divIcon({
      className: '',
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#2d8c4e;border:2px solid #fff;box-shadow:0 0 0 4px rgba(45,140,78,0.25)"></div>',
      iconSize: [14, 14]
    });
    const pinIcon = L.divIcon({
      className: '',
      html: '<div style="width:10px;height:10px;border-radius:50%;background:#3daa60;border:2px solid #fff"></div>',
      iconSize: [10, 10]
    });

    L.marker([8.4333, -82.4333], { icon: dotIcon }).addTo(map);
    [[8.4380, -82.4280], [8.4290, -82.4390], [8.4400, -82.4400], [8.4260, -82.4260]]
      .forEach(coord => L.marker(coord, { icon: pinIcon }).addTo(map));

    setTimeout(() => map.invalidateSize(), 200);
  }

});