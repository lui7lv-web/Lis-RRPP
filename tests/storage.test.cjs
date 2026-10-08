// Pruebas de integración de la lógica real con DOM y almacenamiento simulados.
// No reemplazan la revisión visual en un navegador.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');
class Element {
 constructor(){this.value='';this.textContent='';this.hidden=false;this.children=[];this.style={};this.dataset={};this.handlers={};this.validity={typeMismatch:false};}
 addEventListener(n,f){this.handlers[n]=f;} append(...children){this.children.push(...children);} replaceChildren(){this.children=[];} setAttribute(){} focus(){} showModal(){this.open=true;} close(){this.open=false;}
}
function boot(storage){
 const els={}; const get=id=>els[id]??=new Element();const form=get('form');form.elements={};
 for(const k of ['organization','contact','role','email','phone','service','status','nextAction','followUp','notes'])form.elements[k]=new Element();
 form.reset=()=>{for(const e of Object.values(form.elements))e.value='';form.elements.status.value='Contacto inicial';};form.reset();
 const sandbox={document:{getElementById:get,createElement:()=>new Element()},localStorage:storage,window:{addEventListener(){}},setInterval(){},crypto:require('node:crypto').webcrypto,Date,Intl,Set,JSON};
 vm.createContext(sandbox);
 vm.runInContext(source.replace('  initialize();\n})();','  initialize();\n  globalThis.testAPI={records:()=>records,timing,today,dateValid,editRecord,askDelete};\n})();'),sandbox);
 return {els,get,form,api:sandbox.testAPI,submit:()=>form.handlers.submit({preventDefault(){}})};
}
const stored={};let failWrite=false,failRead=false;
const storage={getItem(k){if(failRead)throw Error('bloqueado');return stored[k]??null;},setItem(k,v){if(failWrite)throw Error('sin espacio');stored[k]=v;}};
let a=boot(storage), key='lis-rrpp.opportunities.v1',passed=0;
function check(name,fn){fn();passed++;console.log('OK '+name);}
check('Primer inicio con cinco ejemplos guardados',()=>{assert.equal(a.api.records().length,5);assert.ok(a.api.records().every(r=>r.isExample));assert.ok(stored[key]);});
check('Clasificación de fechas y exclusión de cerradas',()=>{assert.deepEqual(Array.from(a.api.records(),a.api.timing),['overdue','today','future','closed','closed']);assert.equal(a.get('open-count').textContent,3);assert.equal(a.get('late-count').textContent,1);assert.equal(a.get('won-count').textContent,1);assert.equal(a.get('list').children[0].dataset.id,'ejemplo-1');});
check('Fechas de calendario válidas',()=>{assert.ok(a.api.dateValid('2024-02-29'));assert.ok(!a.api.dateValid('2025-02-29'));assert.ok(!a.api.dateValid('2026-13-01'));});
check('Validación de obligatorios, correo, acción y fecha',()=>{a.api.editRecord();a.submit();assert.match(a.get('form-error').textContent,/organización/);Object.assign(a.form.elements.organization,{value:'Prueba'});a.form.elements.contact.value='Contacto';a.form.elements.service.value='Gestión de crisis';a.form.elements.email.value='inválido';a.submit();assert.match(a.get('form-error').textContent,/correo/);a.form.elements.email.value='';a.submit();assert.match(a.get('form-error').textContent,/próxima acción/);a.form.elements.nextAction.value='Llamar';a.submit();assert.match(a.get('form-error').textContent,/fecha/);});
check('Creación con fecha pasada y campos opcionales vacíos',()=>{a.form.elements.followUp.value='2020-01-01';a.submit();assert.equal(a.api.records().length,6);assert.equal(a.get('late-count').textContent,2);const r=a.api.records()[5];assert.ok(r.id&&r.createdAt&&r.updatedAt);assert.equal(r.email,'');});
const created=a.api.records()[5];a=boot(storage);
check('Persistencia tras reinicializar',()=>{assert.equal(a.api.records().length,6);assert.equal(a.api.records()[5].id,created.id);});
check('Edición conserva identidad y creación; cerrado sin acción ni fecha',()=>{a.api.editRecord(created.id);a.form.elements.status.value='Ganado';a.form.elements.nextAction.value='';a.form.elements.followUp.value='';a.submit();const r=a.api.records().find(r=>r.id===created.id);assert.equal(r.createdAt,created.createdAt);assert.equal(r.status,'Ganado');assert.equal(a.get('open-count').textContent,3);assert.equal(a.get('late-count').textContent,1);assert.equal(a.get('won-count').textContent,2);});
check('Fallo de escritura conserva formulario y datos, sin aviso falso',()=>{failWrite=true;a.api.editRecord(created.id);a.form.elements.organization.value='Sin guardar';a.submit();assert.match(a.get('form-error').textContent,/No se guardaron/);assert.equal(a.get('editor').open,true);assert.equal(a.form.elements.organization.value,'Sin guardar');assert.equal(a.api.records()[5].organization,'Prueba');assert.equal(a.get('notice').textContent,'');assert.equal(a.get('storage-error').hidden,false);});
check('Fallo de eliminación mantiene registro e indicadores',()=>{a.api.askDelete(created.id);a.get('confirm-delete').handlers.click();assert.equal(a.api.records().length,6);assert.match(a.get('delete-error').textContent,/No se eliminó/);assert.equal(a.get('won-count').textContent,2);failWrite=false;});
check('Eliminación actualiza indicadores',()=>{a.get('confirm-delete').handlers.click();assert.equal(a.api.records().length,5);assert.equal(a.get('won-count').textContent,1);});
check('Búsqueda normaliza tildes y filtro combinado',()=>{a.get('search').value='brujula';a.get('search').handlers.input();assert.equal(a.get('list').children.length,1);assert.equal(a.get('list').children[0].dataset.id,'ejemplo-4');a.get('filter').value='Reunión';a.get('filter').handlers.change();assert.match(a.get('list').children[0].children[0].textContent,/No encontramos/);a.get('search').value='';a.get('filter').value='';});
check('Vaciar todos y recargar no recrea ejemplos',()=>{for(const r of [...a.api.records()]){a.api.askDelete(r.id);a.get('confirm-delete').handlers.click();}a=boot(storage);assert.equal(a.api.records().length,0);assert.equal(a.get('open-count').textContent,0);assert.equal(a.get('won-count').textContent,0);assert.match(a.get('list').children[0].children[0].textContent,/Tu próxima relación/);});
check('Almacenamiento dañado conservado',()=>{stored[key]='dañado';a=boot(storage);assert.equal(a.get('new').disabled,true);assert.equal(stored[key],'dañado');assert.equal(a.get('storage-error').hidden,false);});
check('Error de lectura informa y bloquea edición',()=>{failRead=true;a=boot(storage);assert.equal(a.get('new').disabled,true);assert.equal(a.api.records().length,0);failRead=false;});
check('Primer inicio con fallo de escritura no muestra ejemplos como resultados',()=>{delete stored[key];failWrite=true;a=boot(storage);assert.equal(a.api.records().length,0);assert.equal(a.get('open-count').textContent,0);assert.equal(a.get('new').disabled,true);});
console.log(`${passed} pruebas aprobadas.`);
