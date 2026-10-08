(() => {
  'use strict';
  const KEY = 'lis-rrpp.opportunities.v1';
  const statuses = ['Contacto inicial', 'Reunión', 'Propuesta', 'Ganado', 'Perdido'];
  const services = ['Comunicación estratégica', 'Relaciones con medios', 'Reputación corporativa', 'Relaciones institucionales', 'Gestión de crisis'];
  const $ = id => document.getElementById(id);
  const form = $('form');
  let records = [], editingId = null, deletingId = null, available = true;
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const dateOffset = n => { const d = new Date(); d.setDate(d.getDate()+n); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const open = r => !['Ganado','Perdido'].includes(r.status);
  const timing = r => !open(r) ? 'closed' : r.followUp < today() ? 'overdue' : r.followUp === today() ? 'today' : 'future';
  const dateText = value => value ? new Intl.DateTimeFormat('es', {day:'numeric',month:'short',year:'numeric'}).format(new Date(`${value}T12:00:00`)) : 'Sin fecha';
  const dateValid = s => { if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; const d = new Date(`${s}T12:00:00`); return !isNaN(d) && `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` === s; };
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
  function examples() {
    const now = new Date().toISOString();
    return [
      ['ejemplo-1','Estudio Horizonte','Ana Torres','Directora','Comunicación estratégica','Contacto inicial','Agendar una reunión de presentación',-3],
      ['ejemplo-2','Fundación Puentes','Diego Molina','Coordinador','Relaciones institucionales','Reunión','Confirmar el alcance de la colaboración',0],
      ['ejemplo-3','Grupo Alameda','Valeria Ríos','Gerente','Reputación corporativa','Propuesta','Dar seguimiento a la propuesta enviada',5],
      ['ejemplo-4','Editorial Brújula','Clara Vega','Directora','Relaciones con medios','Ganado','Coordinar el inicio del proyecto',-2],
      ['ejemplo-5','Colectivo Nexo','Mateo León','Coordinador','Gestión de crisis','Perdido','',-5]
    ].map(([id,organization,contact,role,service,status,nextAction,offset]) => ({id,organization,contact,role,email:'',phone:'',service,status,nextAction,followUp:dateOffset(offset),notes:'Oportunidad ficticia para explorar la demostración.',createdAt:now,updatedAt:now,isExample:true}));
  }
  function storageProblem(message) { $('storage-error').textContent=message; $('storage-error').hidden=false; }
  function persist(next) {
    $('notice').textContent='';
    try { localStorage.setItem(KEY,JSON.stringify({version:1,records:next})); records=next; $('storage-error').hidden=true; return true; }
    catch { storageProblem('No se pudieron guardar los cambios en este navegador. Revisa el espacio disponible o los permisos de almacenamiento e inténtalo de nuevo.'); return false; }
  }
  function validRecord(r) {
    return r && typeof r.id==='string' && r.id && ['organization','contact','role','email','phone','service','status','nextAction','followUp','notes','createdAt','updatedAt'].every(k=>typeof r[k]==='string') && r.organization.trim() && r.contact.trim() && services.includes(r.service) && statuses.includes(r.status) && (!r.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) && (!r.followUp || dateValid(r.followUp)) && (!open(r) || (r.nextAction.trim() && dateValid(r.followUp))) && !isNaN(Date.parse(r.createdAt)) && !isNaN(Date.parse(r.updatedAt));
  }
  function initialize() {
    try {
      const raw=localStorage.getItem(KEY);
      if(raw===null) { const seed=examples(); if(!persist(seed)) { available=false; records=[]; } }
      else { const data=JSON.parse(raw); if(data.version!==1 || !Array.isArray(data.records) || !data.records.every(validRecord) || new Set(data.records.map(r=>r.id)).size!==data.records.length) throw new Error('invalid'); records=data.records; }
    } catch { available=false; storageProblem('No se pudieron leer los datos guardados. Para evitar sobrescribirlos, la edición está desactivada. Revisa el almacenamiento del navegador; si hay datos dañados, consérvalos antes de restablecerlo.'); }
    $('new').disabled=!available;
    render();
  }
  function node(tag,text,className) { const el=document.createElement(tag); if(text!==undefined) el.textContent=text; if(className) el.className=className; return el; }
  function render() {
    $('open-count').textContent=records.filter(open).length;
    $('late-count').textContent=records.filter(r=>timing(r)==='overdue').length;
    $('won-count').textContent=records.filter(r=>r.status==='Ganado').length;
    $('today-label').textContent='Hoy · '+dateText(today());
    const q=normalize($('search').value.trim()), filter=$('filter').value;
    const rank={overdue:0,today:1,future:2,closed:3};
    const visible=records.filter(r=>(!filter || r.status===filter) && (!q || normalize(r.organization+' '+r.contact).includes(q))).sort((a,b)=>rank[timing(a)]-rank[timing(b)] || a.followUp.localeCompare(b.followUp) || a.organization.localeCompare(b.organization,'es'));
    $('results').textContent=`${visible.length} de ${records.length} oportunidades`;
    $('list').replaceChildren();
    if(!visible.length) {
      const empty=node('div',undefined,'empty'); empty.append(node('h3',!available?'Datos no disponibles':records.length?'No encontramos oportunidades':'Tu próxima relación empieza aquí'),node('p',!available?'Consulta el aviso de almacenamiento.':records.length?'Prueba otro nombre o cambia el filtro de estado.':'Selecciona «Nueva oportunidad» para registrar tu primer contacto.')); $('list').append(empty); return;
    }
    for(const r of visible) {
      const t=timing(r), article=node('article',undefined,`opportunity ${t}`); article.dataset.id=r.id;
      const info=node('div'); info.append(node('h3',r.organization,'company'),node('p',r.contact+(r.role?' · '+r.role:''),'contact'),node('div',r.service,'service'));
      const badges=node('div'); badges.style.marginTop='10px'; badges.append(node('span',r.status,`badge ${r.status==='Ganado'?'won':r.status==='Perdido'?'lost':''}`)); if(r.isExample) badges.append(node('span','Ejemplo ficticio','example')); info.append(badges);
      const follow=node('div'); const text=t==='closed'?'Cerrada · Sin alertas':`${t==='overdue'?'Vencido':t==='today'?'Para hoy':'Programado'} · ${dateText(r.followUp)}`;
      follow.append(node('p',text,'follow-status'),node('p',r.nextAction || 'Sin próxima acción', 'next-action'));
      const actions=node('div',undefined,'row-actions'); const edit=node('button','Ver / editar','secondary'); edit.setAttribute('aria-label',`Ver o editar ${r.organization}`); edit.addEventListener('click',()=>editRecord(r.id)); const del=node('button','Eliminar','delete'); del.setAttribute('aria-label',`Eliminar ${r.organization}`); del.addEventListener('click',()=>askDelete(r.id)); actions.append(edit,del); article.append(info,follow,actions); $('list').append(article);
    }
  }
  function requirements() {
    const required=!['Ganado','Perdido'].includes(form.elements.status.value);
    form.elements.nextAction.required=required; form.elements.followUp.required=required;
    $('action-label').textContent='Próxima acción'+(required?' *':' (opcional)'); $('date-label').textContent='Fecha de seguimiento'+(required?' *':' (opcional)');
    $('follow-hint').textContent=required?'Puedes elegir una fecha pasada para registrar un seguimiento pendiente.':'Las oportunidades cerradas no generan alertas de seguimiento.';
  }
  function editRecord(id=null) {
    editingId=id; form.reset(); $('form-error').hidden=true;
    const r=records.find(r=>r.id===id);
    if(r) for(const key of ['organization','contact','role','email','phone','service','status','nextAction','followUp','notes']) form.elements[key].value=r[key];
    $('editor-title').textContent=r?'Consultar / editar oportunidad':'Nueva oportunidad'; $('example-note').hidden=!r?.isExample;
    $('timestamps').textContent=r?`Creada: ${new Date(r.createdAt).toLocaleString('es')} · Actualizada: ${new Date(r.updatedAt).toLocaleString('es')}`:'';
    requirements(); $('editor').showModal(); form.elements.organization.focus();
  }
  function formError(message,field) { $('form-error').textContent=message; $('form-error').hidden=false; if(field) form.elements[field].focus(); }
  form.addEventListener('submit',e=> {
    e.preventDefault(); const data={}; for(const key of ['organization','contact','role','email','phone','service','status','nextAction','followUp','notes']) data[key]=form.elements[key].value.trim();
    for(const [key,label] of [['organization','la organización'],['contact','el nombre del contacto'],['service','el servicio de interés'],['status','el estado']]) if(!data[key]) return formError(`Completa ${label}.`,key);
    if(!statuses.includes(data.status)||!services.includes(data.service)) return formError('Selecciona un servicio y un estado válidos.');
    if(data.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || form.elements.email.validity.typeMismatch)) return formError('Escribe un correo electrónico válido, por ejemplo: nombre@ejemplo.com.','email');
    if(open(data) && !data.nextAction) return formError('Indica la próxima acción para esta oportunidad abierta.','nextAction');
    if((open(data) || data.followUp) && !dateValid(data.followUp)) return formError('Indica una fecha de seguimiento válida.','followUp');
    const previous=records.find(r=>r.id===editingId), now=new Date().toISOString();
    const record={...data,id:previous?.id || crypto.randomUUID(),createdAt:previous?.createdAt || now,updatedAt:now,isExample:previous?.isExample || false};
    const next=previous?records.map(r=>r.id===previous.id?record:r):[...records,record];
    if(!persist(next)) return formError('No se guardaron los cambios. El formulario conserva lo que escribiste para que puedas intentarlo de nuevo.');
    $('editor').close(); render(); $('notice').textContent=previous?'Oportunidad actualizada.':'Oportunidad creada.';
  });
  function askDelete(id) { deletingId=id; const r=records.find(r=>r.id===id); $('delete-description').textContent=`Se eliminará «${r.organization}», contacto: ${r.contact}.`; $('delete-error').hidden=true; $('delete-dialog').showModal(); $('cancel-delete').focus(); }
  $('confirm-delete').addEventListener('click',()=> { if(!persist(records.filter(r=>r.id!==deletingId))) { $('delete-error').textContent='No se eliminó la oportunidad porque falló el almacenamiento. Inténtalo de nuevo.'; $('delete-error').hidden=false; return; } $('delete-dialog').close(); render(); $('notice').textContent='Oportunidad eliminada.'; });
  $('cancel-delete').addEventListener('click',()=>$('delete-dialog').close());
  $('new').addEventListener('click',()=>editRecord());
  for(const id of ['close','cancel']) $(id).addEventListener('click',()=>$('editor').close());
  form.elements.status.addEventListener('change',requirements);
  $('search').addEventListener('input',render); $('filter').addEventListener('change',render);
  window.addEventListener('focus',render); setInterval(render,60000);
  window.addEventListener('storage',e=> { if(e.key===KEY) { available=true; records=[]; initialize(); } });
  initialize();
})();
