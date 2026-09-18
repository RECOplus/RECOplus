/**
 * suscripcion-planes.js — RECO+
 * ---------------------------------------------------------------
 * ÚNICA fuente de verdad (en el frontend) de los 3 planes de
 * suscripción: nombres, precios, límites y beneficios "de cara al
 * usuario". Cualquier archivo que necesite mostrar/comparar planes
 * (suscripcion-modal.js, la pestaña "Mi plan" de ajustes-modal.js,
 * campanas-modal.js, reciclar-scanner.js, alianzas-destacados.js)
 * importa este objeto en vez de repetir los números a mano.
 *
 * Los mismos topes (10/50/ilimitado escaneos, 1/3/ilimitadas
 * campañas, 3/7/30 días de vigencia) están reforzados del lado del
 * servidor en supabase-suscripciones.sql (funciones plan_efectivo,
 * limite_escaneos_ia y las policies de RLS de `campanas`) — este
 * archivo es solo para pintar la UI; la fuente de verdad real y
 * definitiva vive en Supabase.
 *
 * i18n: nombre, precioLabel y beneficios de cada plan se resuelven
 * en CADA llamada a getPlan() a través de t() (i18n.js, claves
 * "susc.plan.*"), así siempre reflejan el idioma activo en vez de
 * quedar fijos en español. Si i18n.js todavía no cargó, se usa el
 * texto en español como respaldo (ver TEXTOS_RESPALDO), igual que
 * el resto de los módulos del sitio (campanas-modal.js,
 * alianzas-destacados.js, reciclar-scanner.js).
 *
 * Capa 100% aditiva, sin dependencias obligatorias. Cárgalo ANTES de
 * cualquier script que lo use:
 *   <script src="suscripcion-planes.js"></script>
 */
(function () {
  'use strict';

  function tr(key, fallback, vars) {
    if (typeof window.t !== 'function') return fallback;
    var val = window.t(key, vars);
    return (val && val !== key) ? val : fallback;
  }

  // Datos NO traducibles de cada plan (id, ícono, precio numérico,
  // límites de uso). Lo que ve el usuario (nombre, precioLabel,
  // beneficios) vive en TEXTOS_RESPALDO + las claves "susc.plan.*"
  // de i18n.js, y se arma en getPlan().
  var PLANES_BASE = {
    gratis: {
      id: 'gratis',
      icono: '🌱',
      precioMensual: 0,
      escaneosIaPorDia: 10,
      campanasActivasMax: 1,
      duracionCampanaMaxDias: 3,
      destacadoEnAlianzas: false
    },
    basico: {
      id: 'basico',
      icono: '🌿',
      precioMensual: 9.99,
      escaneosIaPorDia: 50,
      campanasActivasMax: 3,
      duracionCampanaMaxDias: 7,
      destacadoEnAlianzas: false
    },
    premium: {
      id: 'premium',
      icono: '🌳',
      precioMensual: 24.99,
      escaneosIaPorDia: -1, // -1 = ilimitado
      campanasActivasMax: -1,
      duracionCampanaMaxDias: 30,
      destacadoEnAlianzas: true
    }
  };

  // Respaldo en español (mismo texto que antes estaba hardcodeado),
  // usado solo si t() todavía no está disponible cuando se llama a
  // getPlan(). También sirve para saber cuántos beneficios tiene
  // cada plan al armar las claves "susc.plan.<id>.beneficioN".
  var TEXTOS_RESPALDO = {
    gratis: {
      nombre: 'Gratis',
      precioLabel: 'Gratis',
      beneficios: [
        '10 escaneos con IA al día',
        '1 campaña activa a la vez',
        'Campañas de hasta 3 días de vigencia'
      ]
    },
    basico: {
      nombre: 'Básico',
      precioLabel: '$9.99/mes',
      beneficios: [
        '50 escaneos con IA al día',
        'Hasta 3 campañas activas a la vez',
        'Campañas de hasta 7 días de vigencia'
      ]
    },
    premium: {
      nombre: 'Premium',
      precioLabel: '$24.99/mes',
      beneficios: [
        'Escaneos con IA ilimitados',
        'Campañas activas ilimitadas',
        'Campañas de hasta 30 días de vigencia',
        'Tu empresa aparece en Aliados destacados'
      ]
    }
  };

  var ORDEN = ['gratis', 'basico', 'premium'];

  function getPlan(id) {
    var base = PLANES_BASE[id] || PLANES_BASE.gratis;
    var textos = TEXTOS_RESPALDO[base.id];

    var beneficios = textos.beneficios.map(function (textoEs, i) {
      return tr('susc.plan.' + base.id + '.beneficio' + (i + 1), textoEs);
    });

    return {
      id: base.id,
      icono: base.icono,
      precioMensual: base.precioMensual,
      escaneosIaPorDia: base.escaneosIaPorDia,
      campanasActivasMax: base.campanasActivasMax,
      duracionCampanaMaxDias: base.duracionCampanaMaxDias,
      destacadoEnAlianzas: base.destacadoEnAlianzas,
      nombre: tr('susc.plan.' + base.id + '.nombre', textos.nombre),
      precioLabel: tr('susc.plan.' + base.id + '.precio', textos.precioLabel),
      beneficios: beneficios
    };
  }

  function formatLimite(numero) {
    return numero === -1 ? tr('susc.ilimitado', 'Ilimitado') : String(numero);
  }

  window.recoPlanes = {
    ORDEN: ORDEN,
    getPlan: getPlan,
    formatLimite: formatLimite
  };
})();
