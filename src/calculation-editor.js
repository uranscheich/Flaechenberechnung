import {grossArea,deductionArea,validateProject} from './model.js';
import {livingEligible,livingArea,livingTotal} from './woflv.js';
import {escape as esc,num} from './plan.js';

const decimal=value=>{
  const text=String(value).trim();
  return /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)?Number(text.replace(',','.')):NaN;
};
const inputValue=n=>Number(n.toFixed(9));
export function calculationDraft(project){
  return {
    dwelling:project.dwelling||project.title,
    dwellingCount:project.dwellingCount||'',closed:project.closed||'',
    garages:project.garages??'',stores:project.stores??'',
    place:project.place||'',reportDate:project.reportDate||'',
    rooms:project.floors.flatMap(f=>f.rooms.map(r=>({id:r.id,name:r.name,
      gross:String(inputValue(grossArea(r))),deduction:String(inputValue(deductionArea(r))),
      factor:String(inputValue(r.factor*100)),include:r.include,eligible:livingEligible(r)})))
  };
}
// Apply a complete draft atomically. Invalid entries never replace the saved project.
export function applyCalculationDraft(project,draft){
  const next=structuredClone(project),errors=[];
  const rooms=next.floors.flatMap(f=>f.rooms),entries=new Map(draft.rooms.map(r=>[r.id,r]));
  if(entries.size!==rooms.length||draft.rooms.length!==rooms.length)errors.push('Die Raumliste ist unvollständig.');
  for(const r of rooms){
    const entry=entries.get(r.id);
    if(!entry){errors.push(`${r.name}: Raumdaten fehlen.`);continue;}
    const name=String(entry.name).trim(),gross=decimal(entry.gross),deduction=decimal(entry.deduction),factor=decimal(entry.factor);
    if(!name||name.length>100)errors.push(`${r.name}: Bitte eine Bezeichnung mit höchstens 100 Zeichen eingeben.`);
    if(!Number.isFinite(gross)||gross<0||gross>1e6)errors.push(`${name||r.name}: Grundfläche muss eine Zahl zwischen 0 und 1.000.000 sein.`);
    if(!Number.isFinite(deduction)||deduction<0||deduction>gross)errors.push(`${name||r.name}: Der Abzug muss zwischen 0 und der Grundfläche liegen.`);
    if(!Number.isFinite(factor)||factor<0||factor>100)errors.push(`${name||r.name}: Ansatz muss zwischen 0 und 100 % liegen.`);
    if(typeof entry.include!=='boolean'||typeof entry.eligible!=='boolean')errors.push(`${r.name}: Zuordnung prüfen.`);
    r.name=name;r.factor=factor/100;r.include=entry.include;r.livingEligible=entry.eligible;
    if(Math.abs(gross-grossArea(r))>1e-8){r.method='manual';r.manualArea=gross;}
    if(Math.abs(deduction-deductionArea(r))>1e-8)r.manualDeduction=deduction;
  }
  for(const [field,max] of [['dwelling',200],['place',100],['reportDate',30]]){
    const value=String(draft[field]??'').trim();
    if(value.length>max)errors.push('Die Wohnungsangaben sind zu lang.');
    next[field]=value;
  }
  for(const field of ['garages','stores']){
    const raw=String(draft[field]??'').trim(),value=raw===''?'':decimal(raw);
    if(value!==''&&(!Number.isInteger(value)||value<0||value>999))errors.push('Anzahl der Garagen und Geräteräume: ganze Zahl von 0 bis 999.');
    next[field]=value;
  }
  if(!['','1','2','more'].includes(draft.dwellingCount)||!['','yes','no'].includes(draft.closed))errors.push('Angaben zur Wohnung prüfen.');
  next.dwellingCount=draft.dwellingCount;next.closed=draft.closed;
  if(errors.length)return {errors};
  try{validateProject(next);}catch(error){return {errors:[error.message]};}
  return {project:next,errors:[]};
}

export function calculationEditor(project){
  const draft=calculationDraft(project),entries=new Map(draft.rooms.map(r=>[r.id,r]));
  const field=(name,label,value,max)=>`<label>${label}<input data-meta="${name}" value="${esc(value)}" maxlength="${max}"></label>`;
  return `<section class="calculation-editor online-only" id="calculationEditor" aria-label="Flächenberechnung bearbeiten">
    <div class="editor-heading"><div><span class="eyebrow">VOR DEM EXPORT BEARBEITEN</span><h2>Die Flächen. Bis ins Detail.</h2>
    <p>Werte und Wohnungsangaben hier anpassen und übernehmen. Die Vorschau darunter und das PDF verwenden denselben gespeicherten Stand.</p></div>
    <div class="editor-total"><small>WOHNFLÄCHE · ENTWURF</small><strong id="draftLivingTotal">${num(livingTotal(project))} <em>m²</em></strong></div></div>
    <div class="editor-meta">
      ${field('dwelling','Wohnung / Lage / Haus-Nr.',draft.dwelling,200)}
      <label>Wohnungen im Gebäude<select data-meta="dwellingCount"><option value="">Keine Angabe</option>${[['1','1 Wohnung'],['2','2 Wohnungen'],['more','Mehr als 2 Wohnungen']].map(([v,t])=>`<option value="${v}" ${draft.dwellingCount===v?'selected':''}>${t}</option>`).join('')}</select></label>
      <label>Abgeschlossene Wohnung<select data-meta="closed">${[['','Keine Angabe'],['yes','Ja'],['no','Nein']].map(([v,t])=>`<option value="${v}" ${draft.closed===v?'selected':''}>${t}</option>`).join('')}</select></label>
      ${field('garages','Anzahl Garagen',draft.garages,3)}${field('stores','Anzahl Geräteräume',draft.stores,3)}
      ${field('place','Ort',draft.place,100)}${field('reportDate','Datum für die Unterschrift',draft.reportDate,30)}
    </div>
    <div class="editor-table-scroll"><table class="editor-table"><thead><tr><th>Geschoss / Raum</th><th>Grundfläche <small>m²</small></th><th>Abzug § 3 <small>m²</small></th><th>Ansatz § 4 <small>%</small></th><th>Zuordnung</th><th>Wohnfläche <small>m²</small></th></tr></thead><tbody>
    ${project.floors.map(f=>f.rooms.map(r=>{const d=entries.get(r.id);return `<tr data-edit-room="${esc(r.id)}"><td><small class="editor-floor">${esc(f.short||f.name)}</small><input data-field="name" aria-label="${esc(f.short)} ${esc(r.name)} Bezeichnung" value="${esc(r.name)}" maxlength="100"></td>
    ${[['gross','Grundfläche',d.gross],['deduction','Abzug',d.deduction],['factor','Ansatz',d.factor]].map(([name,label,value])=>`<td><input data-field="${name}" aria-label="${esc(f.short)} ${esc(r.name)} ${label}" inputmode="decimal" value="${esc(value)}" autocomplete="off"></td>`).join('')}
    <td class="editor-checks"><label><input type="checkbox" data-field="include" ${r.include?'checked':''}> Im Projekt</label><label><input type="checkbox" data-field="eligible" ${d.eligible?'checked':''}> Wohnfläche</label></td><td><output data-result>${num(livingArea(r))}</output></td></tr>`}).join('')).join('')}
    </tbody></table></div>
    <div class="editor-help"><span>Ein geänderter Grundflächenwert wird als <b>manueller Ansatz</b> gekennzeichnet. Die Raumkontur bleibt erhalten. Abzug und Prozentansatz werden getrennt berechnet.</span><button id="applyCalculation" class="primary">Änderungen übernehmen</button></div>
    <p id="calculationStatus" class="editor-status" role="status" aria-live="polite">Gespeicherter Projektstand geladen.</p><div id="calculationErrors" class="editor-errors" role="alert" hidden></div>
  </section>`;
}

export function readCalculationEditor(root){
  const draft={rooms:[...root.querySelectorAll('[data-edit-room]')].map(row=>{
    const entry={id:row.dataset.editRoom};
    for(const input of row.querySelectorAll('[data-field]'))entry[input.dataset.field]=input.type==='checkbox'?input.checked:input.value;
    return entry;
  })};
  for(const input of root.querySelectorAll('[data-meta]'))draft[input.dataset.meta]=input.value;
  return draft;
}
