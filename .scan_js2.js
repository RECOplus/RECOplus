const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2];
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.js') && f !== 'i18n.js');

const words = ['Cambiar','Guardar','Cargando','Cancelar','Enviar','Aceptar','Rechazar','Eliminar','Editar',
  'Cerrar','Continuar','Confirmar','Publicar','Aplicar','Quitar','Agregar','Añadir','Subir','Descargar',
  'Copiar','Compartir','Buscar','Filtrar','Ordenar','Ver más','Cargar más','Reintentar','Volver','Siguiente',
  'Anterior','Finalizar','Terminar','Completar','Seleccionar','Elegir','Borrar','Actualizar','Listo',
  'Correcto','Incorrecto','Requerido','Obligatorio','Opcional','Válido','Inválido','Error','Éxito',
  'Cargar','banner','Verificar'];
const wordRe = new RegExp('\\b(' + words.join('|') + ')\\b');
const assignRe = /(innerHTML|textContent|setAttribute\(\s*['"](placeholder|title|aria-label)['"]|alert|\.title\s*=|\.placeholder\s*=)/;

const results = [];
files.forEach(f => {
  const full = path.join(ROOT, f);
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    if (assignRe.test(line) && /['"`][^'"`]*['"`]/.test(line)) {
      // extract quoted substrings and test wordRe on them
      const quoted = line.match(/(['"`])((?:(?!\1).)*)\1/g) || [];
      const hit = quoted.some(q => wordRe.test(q));
      if (hit) results.push({ file: f, line: i + 1, text: trimmed.slice(0, 220) });
    }
  });
});

console.log('Total candidate lines:', results.length);
const byFile = {};
results.forEach(r => { byFile[r.file] = (byFile[r.file] || 0) + 1; });
console.log(JSON.stringify(byFile, null, 2));
fs.writeFileSync(path.join(ROOT, '.i18n-js-scan2.json'), JSON.stringify(results, null, 2));
