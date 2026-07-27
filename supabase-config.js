/**
 * supabase-config.js — Cliente Supabase ÚNICO y compartido para todo RECO+.
 *
 * Este archivo NO reemplaza el cliente que ya usas en mapa.html: si
 * mapa.html ya crea su propio cliente con la misma URL/anon key, no
 * pasa nada por tener dos instancias (Supabase lo permite), pero lo
 * ideal a futuro es que mapa.html también apunte a este archivo para
 * tener un solo punto de configuración en todo el sitio.
 *
 * REQUIERE que el script de la librería se cargue ANTES que este:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *
 * Expone: window.recoSupabase (instancia lista para usar)
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://eephwthybxjwleajrvnl.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcGh3dGh5Ynhqd2xlYWpydm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5Njc0NzQsImV4cCI6MjA5OTU0MzQ3NH0.k8fnOuX9RJ-VEvFBSCU_Uwuqiybk9K_KuZyqMmTqekw';

  if (typeof window.supabase === 'undefined') {
    console.error(
      '[RECO+] La librería @supabase/supabase-js no está cargada. ' +
      'Agrega <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> ' +
      'ANTES de supabase-config.js en el <head> o antes de </body>.'
    );
    return;
  }

  window.recoSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
})();
