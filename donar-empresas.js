/**
 * donar-empresas.js — RECO+
 * ---------------------------------------------------------------
 * Capa ADITIVA: selector de "¿A qué empresa se envía?" en los
 * formularios de donar.html (Quiero donar / Solicito ayuda).
 *
 * Reutiliza la MISMA base de puntos que el mapa (mapa.html): los
 * oficiales en window.RECO_MAP_POINTS (ver map-points-data.js) más
 * los que la comunidad ha sugerido y quedaron guardados en la tabla
 * `puntos_sugeridos` de Supabase — así el selector siempre refleja
 * lo que realmente hay en el mapa, sin mantener una lista aparte.
 *
 * Las opciones se filtran según la categoría elegida en cada
 * formulario (¿Qué vas a donar? / ¿Qué necesitas?), comparando
 * contra el mismo tag de "materials" que usan los puntos del mapa.
 * Si la categoría no tiene un material equivalente (ej. "Muebles",
 * "Juguetes", "Otro") se muestran todas las empresas.
 *
 * No modifica donar.js: solo llena el <select> de empresa
 * (#donacion-empresa / #solicitud-empresa). donar.js lee su valor
 * final igual que lee cualquier otro campo del formulario.
 *
 * Cargar DESPUÉS de map-points-data.js:
 *   <script src="map-points-data.js"></script>
 *   <script src="donar-empresas.js"></script>
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

  // Mismas credenciales públicas (anon key) que ya usa app.js en
  // mapa.html para leer los puntos sugeridos por la comunidad. La
  // "anon key" es pública por diseño (la seguridad real la da RLS,
  // ver supabase-setup.sql) — no es un secreto que se esté filtrando.
  var SUPABASE_URL = "https://eephwthybxjwleajrvnl.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcGh3dGh5Ynhqd2xlYWpydm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Njc0NzQsImV4cCI6MjA5OTU0MzQ3NH0.k8fnOuX9RJ-VEvFBSCU_Uwuqiybk9K_KuZyqMmTqekw";
  var SUPABASE_TABLE = "puntos_sugeridos";

  /* ── Categoría del formulario -> tag de "materials" que usan los
     puntos del mapa. Las categorías que no aparecen acá (Muebles,
     Juguetes, Otro) se quedan sin filtro: se listan todas las
     empresas en vez de arriesgarse a dejar el selector vacío. ── */
  var CATEGORIA_A_MATERIAL = {
    'Ropa y calzado': ['ropa'],
    'Electrónicos': ['electronicos', 'celulares'],
    'Muebles': ['muebles'],
    'Libros y útiles': ['libros', 'utilesescolares', 'papel'],
    'Juguetes': ['juguetes'],
    'Alimentos no perecederos': ['aceite'],
    'Alimentos': ['aceite']
  };

  var empresasPromise = null;

  function fetchSuggestedPoints() {
    return fetch(
      SUPABASE_URL + '/rest/v1/' + SUPABASE_TABLE + '?select=name,type,materials',
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: 'Bearer ' + SUPABASE_ANON_KEY
        }
      }
    )
      .then(function (res) { return res.ok ? res.json() : []; })
      .catch(function (err) {
        console.error('[RECO+] No se pudieron cargar los puntos sugeridos para el selector de empresa:', err);
        return [];
      });
  }

  /* ── Junta los puntos oficiales del mapa con los sugeridos por la
     comunidad en Supabase. Se pide una sola vez por carga de página
     y se reutiliza para ambos formularios (donar / solicitar). ── */
  function getEmpresas() {
    if (empresasPromise) return empresasPromise;

    var oficiales = (window.RECO_MAP_POINTS || []).map(function (p) {
      return { name: p.name, type: p.type, materials: p.materials || [] };
    });

    empresasPromise = fetchSuggestedPoints().then(function (rows) {
      var sugeridas = (rows || []).map(function (r) {
        return { name: r.name, type: r.type, materials: r.materials || [] };
      });
      return oficiales.concat(sugeridas);
    });

    return empresasPromise;
  }

  function tipoLabel(tipo) {
    if (tipo === 'reciclaje') return 'Reciclaje';
    if (tipo === 'donacion') return 'Donación';
    if (tipo === 'acopio') return 'Punto de acopio';
    return 'Otro';
  }

  /* ── Filtra según la categoría elegida. Si esa categoría no tiene
     material equivalente, o el filtro no encuentra ninguna empresa,
     se devuelven TODAS (mejor mostrar de más que dejar el selector
     vacío). ── */
  function filtrarPorCategoria(empresas, categoria) {
    var materiales = CATEGORIA_A_MATERIAL[categoria];
    if (!materiales || !materiales.length) return empresas;

    var filtradas = empresas.filter(function (e) {
      return e.materials.some(function (m) { return materiales.indexOf(m) !== -1; });
    });

    return filtradas.length ? filtradas : empresas;
  }

  /* ── Llena un <select> con las empresas dadas, agrupadas por tipo
     (Reciclaje / Punto de acopio / Donación) y ordenadas por
     nombre dentro de cada grupo. ── */
  function poblarSelect(select, empresas) {
    if (!select) return;

    var valorPrevio = select.value;

    var porTipo = {};
    empresas.forEach(function (e) {
      var key = e.type || 'otro';
      if (!porTipo[key]) porTipo[key] = [];
      porTipo[key].push(e);
    });

    var ordenTipos = ['reciclaje', 'acopio', 'donacion'];
    var html = '<option value="">Selecciona una empresa (opcional)</option>';

    ordenTipos.forEach(function (tipo) {
      var lista = porTipo[tipo];
      if (!lista || !lista.length) return;
      lista.sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
      html += '<optgroup label="' + tipoLabel(tipo) + '">';
      lista.forEach(function (e) {
        html += '<option value="' + e.name.replace(/"/g, '&quot;') + '">' + e.name + '</option>';
      });
      html += '</optgroup>';
    });

    select.innerHTML = html;

    // Si la empresa que ya tenía elegida sigue estando en la nueva
    // lista (ej. el usuario cambió de categoría y volvió), se
    // restaura en vez de resetear el select.
    if (valorPrevio && empresas.some(function (e) { return e.name === valorPrevio; })) {
      select.value = valorPrevio;
    }
  }

  /* ── Conecta un <select> de categoría con su <select> de empresa:
     cada vez que cambia la categoría, refiltra y repuebla. ── */
  function conectar(categoriaSelectId, empresaSelectId) {
    var categoriaSelect = document.getElementById(categoriaSelectId);
    var empresaSelect = document.getElementById(empresaSelectId);
    if (!categoriaSelect || !empresaSelect) return;

    empresaSelect.innerHTML = '<option value="">Cargando empresas...</option>';

    function refrescar() {
      getEmpresas().then(function (empresas) {
        var filtradas = filtrarPorCategoria(empresas, categoriaSelect.value);
        poblarSelect(empresaSelect, filtradas);
      });
    }

    refrescar();
    categoriaSelect.addEventListener('change', refrescar);
  }

  ready(function () {
    conectar('donacion-categoria', 'donacion-empresa');
    conectar('solicitud-categoria', 'solicitud-empresa');
  });
})();
