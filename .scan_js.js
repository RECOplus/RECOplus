const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = process.argv[2];
const src = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
const sandbox = { document:{addEventListener:()=>{},head:{appendChild:()=>{}},createElement:()=>({style:{}}),querySelector:()=>null,querySelectorAll:()=>[]}, localStorage:{getItem:()=>null,setItem:()=>{}}, console };
sandbox.window=sandbox; sandbox.addEventListener=()=>{};
const ctx=vm.createContext(sandbox);
vm.runInContext(src, ctx, {filename:'i18n.js'});
const t = JSON.parse(vm.runInContext('JSON.stringify(translations)', ctx));

const search = ['Registrar aliado', 'Borrar empresa', 'Cargando empresas', 'Cargando tu plan', 'Publicar comentario'];
Object.keys(t.es).forEach(k => {
  const v = t.es[k];
  if (typeof v === 'string' && search.some(s => v.includes(s))) {
    console.log(k, '| ES:', JSON.stringify(v), '| EN:', JSON.stringify(t.en[k]));
  }
});
