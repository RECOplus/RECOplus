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
 * Capa 100% aditiva, sin dependencias. Cárgalo ANTES de cualquier
 * script que lo use:
 *   <script src="suscripcion-planes.js"></script>
 */
(function () {
  'use strict';

  var PLANES = {
    gratis: {
      id: 'gratis',
      nombre: 'Gratis',
      icono: '🌱',
      precioMensual: 0,
      precioLabel: 'Gratis',
      escaneosIaPorDia: 10,
      campanasActivasMax: 1,
      duracionCampanaMaxDias: 3,
      destacadoEnAlianzas: false,
      beneficios: [
        '10 escaneos con IA al día',
        '1 campaña activa a la vez',
        'Campañas de hasta 3 días de vigencia'
      ]
    },
    basico: {
      id: 'basico',
      nombre: 'Básico',
      icono: '🌿',
      precioMensual: 9.99,
      precioLabel: '$9.99/mes',
      escaneosIaPorDia: 50,
      campanasActivasMax: 3,
      duracionCampanaMaxDias: 7,
      destacadoEnAlianzas: false,
      beneficios: [
        '50 escaneos con IA al día',
        'Hasta 3 campañas activas a la vez',
        'Campañas de hasta 7 días de vigencia'
      ]
    },
    premium: {
      id: 'premium',
      nombre: 'Premium',
      icono: '🌳',
      precioMensual: 24.99,
      precioLabel: '$24.99/mes',
      escaneosIaPorDia: -1, // -1 = ilimitado
      campanasActivasMax: -1,
      duracionCampanaMaxDias: 30,
      destacadoEnAlianzas: true,
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
    return PLANES[id] || PLANES.gratis;
  }

  function formatLimite(numero) {
    return numero === -1 ? 'Ilimitado' : String(numero);
  }

  window.recoPlanes = {
    PLANES: PLANES,
    ORDEN: ORDEN,
    getPlan: getPlan,
    formatLimite: formatLimite
  };
})();
