import {activateHeightDraft} from './roof-zones.js';
import {syncDimensionInputs} from './dimension-editor.js';
import {formTotal,formRoomArea} from './ing-form.js';
import {reportPages} from './report.js';
import {calculationEditor,readCalculationEditor,applyCalculationDraft} from './calculation-editor.js';
import {lawSummary,livingEligible,livingArea,livingTotal} from './woflv.js';
import {migrateProject} from './migrations.js';
import {measureAudit} from './architecture.js';
import {initialProject,polygonArea,effectiveArea,total,validateProject,deductionArea} from './model.js';
import {planSVG,escape as esc,num} from './plan.js';
const $=s=>document.querySelector(s),key='flaechen-projekt-v1';let project=initialProject(),floorId='eg',selected='eg1',labels=true,dimensions=true,axon=false,zoom=1,furniture=true,storageWarning=false;
try{const saved=localStorage.getItem(key);if(saved)project=validateProject(migrateProject(validateProject(JSON.parse(saved))))}catch{storageWarning=true}
const floor=()=>project.floors.find(f=>f.id===floorId)||project.floors[0];const room=()=>floor().rooms.find(r=>r.id===selected)||floor().rooms[0];
let timer;function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),4500)}
function persist(){try{localStorage.setItem(key,JSON.stringify(project));$('#saveState').textContent='Lokal im Browser gespeichert';return true}catch{$('#saveState').textContent='Speichern nicht möglich — JSON exportieren';toast('Browserspeicher nicht verfügbar. Bitte Projekt als JSON speichern.');return false}}
function download(content,name,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
function setText(s,t){$(s).textContent=t}
function areaMarkup(n){return `${num(n)}<em>m²</em>`}
function render(){const f=floor(),r=room();selected=r?.id;setText('#sideTitle',project.title);setText('#crumbTitle',project.title);$('#floors').innerHTML=project.floors.map(x=>`<button data-floor="${esc(x.id)}" class="${f.id===x.id?'active':''}" ${f.id===x.id?'aria-current="page"':''}><span class="floor-icon">${esc(x.short||x.name.slice(0,2))}</span>${esc(x.name)}<small>${x.rooms.length} Räume</small></button>`).join('');$('#floorTitle').innerHTML=`${esc(f.name)}<span>.</span>`;setText('#canvasCaption',f.name.toUpperCase());setText('#planNo',`M—0${project.floors.indexOf(f)+1}`);$('#floorArea').innerHTML=areaMarkup(total(f.rooms));$('#projectArea').innerHTML=areaMarkup(project.floors.reduce((n,x)=>n+total(x.rooms),0));$('#outerArea').innerHTML=areaMarkup(measureAudit().outerArea);$('#innerArea').innerHTML=areaMarkup(measureAudit().innerArea);setText('#floorMeta',`${f.rooms.filter(x=>x.include).length} Räume einbezogen · Faktoren berücksichtigt`);setText('#methodMeta',f.rooms.some(x=>x.method==='manual')?'Mit manuellen Ansätzen':f.rooms.some(x=>x.method==='reference')?'Geometrie und Planwerte gemischt':'Geometrisch berechnet');setText('#listTotal',num(total(f.rooms))+' m²');$('#planWrap').innerHTML=planSVG(f,{selected,labels,dimensions,axon,furniture});$('#planWrap').style.transform=`scale(${zoom})`;setText('#zoomLabel',Math.round(zoom*100)+' %');$('#roomList').innerHTML=f.rooms.map((x,i)=>`<button class="room-item ${x.id===selected?'active':''} ${x.include?'':'excluded'}" data-room="${esc(x.id)}"><span class="swatch" style="background:${x.color}"></span><span>${esc(x.name)}<small>${String(i+1).padStart(2,'0')} · ${x.method==='manual'?'Manueller Ansatz':x.method==='reference'?'Planwert':x.verified?'Maßberechnung':'Kontur ergänzt'}</small>${!livingEligible(x)?'<small class="room-exclusion">Nicht als Wohnfläche angesetzt</small>':''}</span><b>${num(effectiveArea(x))} m²</b></button>`).join('');}
function openModal(html){$('#modalBody').innerHTML=html;if(!$('#modal').open)$('#modal').showModal()}
document.addEventListener('click',e=>{const f=e.target.closest('[data-floor]'),r=e.target.closest('[data-room]');if(f){floorId=f.dataset.floor;selected='';zoom=1;render()}else if(r){selected=r.dataset.room;render()}});document.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('svg [data-room]')){e.preventDefault();selected=e.target.dataset.room;render()}});
$('#closeModal').onclick=()=>$('#modal').close();$('#labelsToggle').onclick=e=>{labels=!labels;e.currentTarget.setAttribute('aria-pressed',labels);render()};$('#dimensionToggle').onclick=e=>{dimensions=!dimensions;e.currentTarget.setAttribute('aria-pressed',dimensions);render()};$('#furnitureToggle').onclick=e=>{furniture=!furniture;e.currentTarget.setAttribute('aria-pressed',furniture);render()};$('#view2d').onclick=()=>{axon=false;$('#view2d').classList.add('active');$('#viewAxon').classList.remove('active');render()};$('#viewAxon').onclick=()=>{axon=true;$('#viewAxon').classList.add('active');$('#view2d').classList.remove('active');render()};$('#zoomIn').onclick=()=>{zoom=Math.min(zoom+.15,2);render()};$('#zoomOut').onclick=()=>{zoom=Math.max(zoom-.15,.55);render()};$('#zoomReset').onclick=()=>{zoom=1;render()};
$('#saveProject').onclick=()=>download(JSON.stringify(project,null,2),'Flaechenberechnung.json','application/json');$('#loadProject').onclick=()=>$('#projectFile').click();$('#projectFile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>2e6)throw Error('Datei zu groß.');project=validateProject(migrateProject(validateProject(JSON.parse(await file.text()))));floorId=project.floors[0].id;selected='';persist();render();toast('Projekt geladen.')}catch(err){toast('Projekt nicht geladen: '+err.message)}finally{e.target.value=''}};
$('#svgExport').onclick=()=>download(planSVG(floor(),{selected:'',interactive:false}),`Flaechenplan-${floor().id}-${new Date().toISOString().slice(0,10)}.svg`,'image/svg+xml');
$('#csvExport').onclick=()=>{const quote=v=>'"'+String(v).replace(/"/g,'""')+'"';const rows=[['Geschoss','Raum','Geometrie m²','Planwert m²','Berechnungsbasis','Faktor','Einbezogen','Abzugsfläche §3 m²','Ergebnis m²','Wohnfläche vor Abzug m²','Wohnfläche m²','Abzug Grundfläche %'],...project.floors.flatMap(f=>f.rooms.map(r=>[f.name,r.name,num(polygonArea(r.points)),num(r.reference),r.method==='manual'?'Manueller Ansatz':r.method==='reference'?'Planwert':r.method==='dimensions'?'Längen × Breiten':'Geometrie',r.heightZones?'Höhenzonen':num(r.factor),r.include?'Ja':'Nein',num(deductionArea(r)),num(r.include?effectiveArea(r):0),num(livingArea(r)),num(formRoomArea(project,r)),num((project.formDeduction??.03)*100)]))];download('\uFEFF'+rows.map(row=>row.map(quote).join(';')).join('\r\n'),'Flaechenliste.csv','text/csv;charset=utf-8')};
$('#projectSettings').onclick=()=>{openModal(`<div class="settings"><div class="eyebrow">PROJEKTDATEN</div><h2>Dein Plan. Dein Projekt.</h2><label for="titleInput">Projektname</label><input id="titleInput" maxlength="200" value="${esc(project.title)}"><label for="subtitleInput">Beschreibung</label><input id="subtitleInput" maxlength="250" value="${esc(project.subtitle||'')}"><label for="authorInput">Bearbeitet von</label><input id="authorInput" maxlength="100" value="${esc(project.author||'')}"><label for="notesInput">Hinweise für den Flächenplan</label><textarea id="notesInput" maxlength="2000">${esc(project.notes||'')}</textarea><button class="primary" id="saveSettings">Projektdaten übernehmen</button></div>`);$('#saveSettings').onclick=()=>{project.title=$('#titleInput').value.trim()||'Unbenanntes Projekt';project.subtitle=$('#subtitleInput').value;project.author=$('#authorInput').value;project.notes=$('#notesInput').value;persist();render();$('#modal').close()}};

function report(){
 openModal(`<div class="report"><div class="report-toolbar online-only"><div><span class="eyebrow">FLÄCHENPLAN / AUSGABE</span><p>Drei A3-Planblätter und das Wohnflächenblatt in A4. Beim Drucken 100 % und keine Browser-Kopfzeilen wählen.</p></div><div class="report-actions"><button id="toggleCalculation" aria-expanded="true" aria-controls="calculationEditor">Druckansicht</button><button class="primary" id="printReport">Flächenplan drucken / PDF</button></div></div>${calculationEditor(project)}<div id="reportPrintContent">${reportPages(project)}</div></div>`);
 const editor=$('#calculationEditor'),status=$('#calculationStatus'),errors=$('#calculationErrors');
 const checkDraft=()=>applyCalculationDraft(project,readCalculationEditor(editor));
 const showErrors=messages=>{errors.hidden=!messages.length;errors.innerHTML=messages.map(m=>`<p>${esc(m)}</p>`).join('');};
 const apply=()=>{
  const result=checkDraft();showErrors(result.errors);
  if(result.errors.length){status.textContent='Bitte die folgenden Angaben vor der Ausgabe prüfen.';errors.scrollIntoView({block:'nearest'});return false;}
  project=result.project;const saved=persist();render();$('#reportPrintContent').innerHTML=reportPages(project);
  status.textContent=saved?'Änderungen übernommen und lokal gespeichert. Die Druckvorschau ist aktuell.':'Änderungen übernommen. Browserspeicher nicht verfügbar: Projekt bitte als JSON sichern.';
  return true;
 };
 const fillHeight=(group,replace=false)=>{
  const id=group.dataset.heightRoom,row=[...editor.querySelectorAll('[data-edit-room]')].find(r=>r.dataset.editRoom===id);
  const entry=readCalculationEditor(editor).rooms.find(r=>r.id===id),room=project.floors.flatMap(f=>f.rooms).find(r=>r.id===id);
  const result=activateHeightDraft(entry,room.roofProfile,{replace});
  for(const name of ['include','eligible'])row.querySelector(`[data-field="${name}"]`).checked=result.entry[name];
  row.querySelector('[data-field="factor"]').value=result.entry.factor;
  for(const input of group.querySelectorAll('[data-zone]'))input.value=result.entry.zones[input.dataset.zone]??'';
  group.querySelector('[data-use-zones]').checked=true;group.querySelector('fieldset').disabled=false;
  row.querySelector('[data-field="factor"]').disabled=true;row.querySelector('[data-zone-factor-note]').hidden=false;
  group.querySelector('[data-height-status]').textContent=result.message;
 };
 const refreshPreview=()=>{
  const result=checkDraft(),candidate=result.project;
  status.textContent=candidate?'Vorschau aktualisiert. Änderungen noch nicht gespeichert.':'Entwurf unvollständig. Die Vorschau zeigt den letzten gültigen Stand.';
  $('#draftLivingTotal').textContent=candidate?num(formTotal(candidate))+' m²':'—';
  $('#draftBaseTotal').textContent=candidate?'Vor Abzug: '+num(livingTotal(candidate))+' m²':'Vor Abzug: —';
  for(const row of editor.querySelectorAll('[data-edit-room]')){
   const r=candidate?.floors.flatMap(f=>f.rooms).find(r=>r.id===row.dataset.editRoom);
   row.querySelector('[data-result]').textContent=r?num(formRoomArea(candidate,r)):'—';
  }
  if(candidate)$('#reportPrintContent').innerHTML=reportPages(candidate);
  if(!errors.hidden)showErrors(result.errors);
 };
 editor.addEventListener('input',event=>{
  syncDimensionInputs(editor);
  if(event.target.matches('[data-use-zones]')){
   const group=event.target.closest('[data-height-room]');
   if(event.target.checked)fillHeight(group);
   else{
    const row=[...editor.querySelectorAll('[data-edit-room]')].find(r=>r.dataset.editRoom===group.dataset.heightRoom);
    group.querySelector('fieldset').disabled=true;row.querySelector('[data-field="factor"]').disabled=false;row.querySelector('[data-zone-factor-note]').hidden=true;
    group.querySelector('[data-height-status]').textContent='Höhengewichtung ausgeschaltet. Prozentansatz und Zuordnung aus der Raumzeile gelten.';
   }
  }
  refreshPreview();
 });
 editor.addEventListener('click',event=>{
  const button=event.target.closest('[data-recalculate-height]');if(!button)return;
  syncDimensionInputs(editor);fillHeight(button.closest('[data-height-room]'),true);refreshPreview();
 });
 $('#applyCalculation').onclick=apply;
 $('#printReport').onclick=()=>{if(apply())window.print()};
 $('#toggleCalculation').onclick=e=>{editor.hidden=!editor.hidden;e.currentTarget.setAttribute('aria-expanded',!editor.hidden);e.currentTarget.textContent=editor.hidden?'Flächen bearbeiten':'Druckansicht';};
}

$('#measureBtn').onclick=()=>{const a=measureAudit();openModal(`<div class="measure-sheet"><div class="eyebrow">MASSGRUNDLAGE / HAUSTYP M</div><h2>Wandkern, Randmaß und lichte Kontur.</h2><p class="measure-intro">Die korrigierten Kernstärken sind 11,5 cm an Ost/West und 22,5 cm an Nord/Süd. Sie werden getrennt vom gesamten Randmaß der Zeichnung dargestellt.</p><div class="measure-cards"><div><small>ÄUSSERE WANDKANTE</small><strong>5,95 × 10,15 m</strong><b>${num(a.outerArea)} m² · ohne Anbau</b></div><div><small>LICHTE PLANINNENKANTE</small><strong>5,69 × 9,64 m</strong><b>${num(a.innerArea)} m² · inklusive Treppenraum</b></div></div><table class="measure-table"><thead><tr><th>Bauteil / Maßkette</th><th>Herleitung</th><th>Ergebnis</th></tr></thead><tbody><tr><td>Wandkern Ost / West</td><td>Korrigierte Wandstärke</td><td>0,115 m</td></tr><tr><td>Randmaß Ost / West</td><td>0,115 + 0,015 laut Maßkette</td><td>0,130 m</td></tr><tr><td>Innenbreite</td><td>5,95 − 2 × 0,130</td><td>5,69 m</td></tr><tr><td>Wandkern Nord / Süd</td><td>Korrigierte Wandstärke</td><td>0,225 m</td></tr><tr><td>Randmaß Nord / Süd</td><td>25⁵ cm in der Vorlage = 25,5 cm</td><td>0,255 m</td></tr><tr><td>Restmaß zum Kern Nord / Süd</td><td>0,255 − 0,225; Materialaufbau nicht belegt</td><td>0,030 m</td></tr><tr><td>Innentiefe</td><td>10,15 − 2 × 0,255</td><td>9,64 m</td></tr><tr><td>Längsteilmaßkette</td><td>3,455 + 0,175 + 3,01 + 0,115 + 2,885</td><td>9,64 m</td></tr><tr><td>EG · Breite Süd</td><td>1,26 + 0,115 + 1,315 + 0,115 + 2,885</td><td>5,69 m</td></tr><tr><td>OG · Breite Nord</td><td>2,815 + 0,115 + 2,76</td><td>5,69 m</td></tr><tr><td>OG · Breite Süd</td><td>2,565 + 0,115 + 3,01</td><td>5,69 m</td></tr><tr><td>H.A.R. · Außenversatz Süd</td><td>Zusätzlicher Anbau</td><td>1,00 m</td></tr></tbody></table><div class="audit-note"><b>Spiegelung und aktualisierte Maßgrundlage.</b><p>Die klarere Vorlage vom 17.10.2026 zeigt Treppe und WC links, die Küche rechts. Die obere Teilmaßkette lautet 3,455 + 0,175 m. Das gesamte Randmaß von 25,5 cm je Stirnseite ergibt 9,64 m innen. Das DG-Blatt hat eine abweichende Orientierung; die Treppenöffnung ist entsprechend EG/OG links angeordnet. Kernstärken und verbleibende Randmaße werden getrennt gezeigt; ein bestimmter Materialaufbau wird nicht angenommen.</p></div><p class="measure-intro">Die Raumflächen und Türanschläge beziehen sich auf gemeinsame Wandkanten. Ergänzte Längen bleiben gekennzeichnet. Die Originalvorlage ist weder eingebettet noch über den Webserver erreichbar.</p></div>`)};


$('#reportBtn').onclick=report;$('#editWfb').onclick=report;render();if(storageWarning)toast('Gespeicherte Daten konnten nicht geladen werden. Der Bestandsplan wurde geöffnet.');

document.addEventListener('click',e=>{if(e.target.closest('[data-law]')){$('#lawBody').innerHTML=lawSummary();$('#lawModal').showModal()}});$('#closeLaw').onclick=()=>$('#lawModal').close();
