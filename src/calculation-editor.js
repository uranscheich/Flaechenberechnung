import {formRoomArea,formTotal,formDeduction} from './ing-form.js';
import {grossArea,deductionArea,validateProject} from './model.js';
import {livingEligible,livingArea,livingTotal} from './woflv.js';
import {escape as esc,num} from './plan.js';
import {heightZoneKeys} from './height-zones.js';
import {dimensionDraft,dimensionInputs,parseDimensionParts,readDimensionInputs} from './dimension-editor.js';
import {partsArea} from './area-parts.js';

const decimal=value=>{
  const text=String(value).trim();
  return /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text)?Number(text.replace(',','.')):NaN;
};
const inputValue=n=>Number(n.toFixed(9));
export function calculationDraft(project){
  return {
    applicant:project.applicant||'',propertyAddress:project.propertyAddress||'',caseNumber:project.caseNumber||'',formDeduction:String(formDeduction(project)*100),
    dwelling:project.dwelling||project.title,
    dwellingCount:project.dwellingCount||'',closed:project.closed||'',
    garages:project.garages??'',stores:project.stores??'',
    place:project.place||'',reportDate:project.reportDate||'',
    rooms:project.floors.flatMap(f=>f.rooms.map(r=>({id:r.id,name:r.name,...dimensionDraft(r),
      gross:String(inputValue(grossArea(r))),deduction:String(inputValue(deductionArea(r))),
      factor:String(inputValue(r.factor*100)),include:r.include,eligible:livingEligible(r),
      zones:{enabled:!!r.heightZones,...Object.fromEntries(heightZoneKeys.map(key=>[key,r.heightZones?String(inputValue(r.heightZones[key])):'']))}})))
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
    const name=String(entry.name).trim(),deduction=decimal(entry.deduction),factor=decimal(entry.factor);
    let gross=decimal(entry.gross),parts;
    if(entry.basis==='dimensions'){
      try{parts=parseDimensionParts(entry,decimal);gross=partsArea(parts);}catch(error){errors.push(`${name||r.name}: ${error.message}`);}
    }else if(entry.basis!==undefined&&entry.basis!=='area')errors.push(`${name||r.name}: Berechnungsbasis prüfen.`);
    if(!name||name.length>100)errors.push(`${r.name}: Bitte eine Bezeichnung mit höchstens 100 Zeichen eingeben.`);
    if(!Number.isFinite(gross)||gross<0||gross>1e6)errors.push(`${name||r.name}: Grundfläche muss eine Zahl zwischen 0 und 1.000.000 sein.`);
    if(!Number.isFinite(deduction)||deduction<0||deduction>gross)errors.push(`${name||r.name}: Der Abzug muss zwischen 0 und der Grundfläche liegen.`);
    if(!entry.zones?.enabled&&(!Number.isFinite(factor)||factor<0||factor>100))errors.push(`${name||r.name}: Ansatz muss zwischen 0 und 100 % liegen.`);
    if(typeof entry.include!=='boolean'||typeof entry.eligible!=='boolean')errors.push(`${r.name}: Zuordnung prüfen.`);
    r.name=name;r.factor=factor/100;r.include=entry.include;r.livingEligible=entry.eligible;
    if(entry.basis==='dimensions'&&parts){r.method='dimensions';r.dimensionParts=parts;}
    else if(Math.abs(gross-grossArea(r))>1e-8||r.method==='dimensions'&&entry.basis==='area'){r.method='manual';r.manualArea=gross;}
    if(Math.abs(deduction-deductionArea(r))>1e-8)r.manualDeduction=deduction;
    if(entry.zones){
      if(entry.zones.enabled){r.heightZones=Object.fromEntries(heightZoneKeys.map(key=>[key,decimal(entry.zones[key])]));r.factor=1;}
      else delete r.heightZones;
    }
  }
  for(const [field,max] of [['applicant',200],['propertyAddress',300],['caseNumber',100],['dwelling',200],['place',100],['reportDate',30]]){
    if(draft[field]===undefined)continue;
    const value=String(draft[field]??'').trim();
    if(value.length>max)errors.push('Die Wohnungsangaben sind zu lang.');
    next[field]=value;
  }
  for(const field of ['garages','stores']){
    if(draft[field]===undefined)continue;
    const raw=String(draft[field]??'').trim(),value=raw===''?'':decimal(raw);
    if(value!==''&&(!Number.isInteger(value)||value<0||value>999))errors.push('Anzahl der Garagen und Geräteräume: ganze Zahl von 0 bis 999.');
    next[field]=value;
  }
  if(draft.dwellingCount!==undefined&&!['','1','2','more'].includes(draft.dwellingCount)||draft.closed!==undefined&&!['','yes','no'].includes(draft.closed))errors.push('Angaben zur Wohnung prüfen.');
  if(draft.dwellingCount!==undefined)next.dwellingCount=draft.dwellingCount;if(draft.closed!==undefined)next.closed=draft.closed;
  if(draft.formDeduction!==undefined){if(!['0','3'].includes(draft.formDeduction))errors.push('Der Abzug von der Grundfläche muss 0 oder 3 % betragen.');else next.formDeduction=Number(draft.formDeduction)/100;}
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
    <div class="editor-total"><small>WOHNFLÄCHENBERECHNUNG</small><strong id="draftLivingTotal">${num(formTotal(project))} <em>m²</em></strong><small id="draftBaseTotal">Vor Abzug: ${num(livingTotal(project))} m²</small></div></div>
    <div class="editor-meta">
      ${field('applicant','Antragsteller / Darlehensnehmer',draft.applicant,200)}
      ${field('propertyAddress','Beleihungsobjekt (Anschrift)',draft.propertyAddress,300)}
      ${field('caseNumber','Vorgangsnummer',draft.caseNumber,100)}
      <label>Abzug von der Grundfläche<select data-meta="formDeduction"><option value="3" ${draft.formDeduction==='3'?'selected':''}>Grundfläche abzügl. 3 %</option><option value="0" ${draft.formDeduction==='0'?'selected':''}>Ohne pauschalen Abzug (0 %)</option></select></label>
      ${field('place','Ort',draft.place,100)}${field('reportDate','Datum für die Unterschrift',draft.reportDate,30)}
    </div>
    ${atticGuidance(project)}
    <div class="editor-table-scroll"><table class="editor-table"><thead><tr><th>Geschoss / Raum</th><th>Maßansatz / Grundfläche</th><th>Abzug § 3 <small>m²</small></th><th>Ansatz § 4 <small>%</small></th><th>Zuordnung</th><th>Wohnfläche <small>m²</small></th></tr></thead><tbody>
    ${project.floors.map(f=>f.rooms.map(r=>{const d=entries.get(r.id);return `<tr data-edit-room="${esc(r.id)}"><td><small class="editor-floor">${esc(f.short||f.name)}</small><input data-field="name" aria-label="${esc(f.short)} ${esc(r.name)} Bezeichnung" value="${esc(r.name)}" maxlength="100"><select class="calculation-basis" data-field="basis" aria-label="${esc(f.short)} ${esc(r.name)} Berechnung"><option value="dimensions" ${d.basis==='dimensions'?'selected':''}>Nach Längen &amp; Breiten</option><option value="area" ${d.basis==='area'?'selected':''}>Fläche direkt eingeben</option></select>${!r.verified?'<small class="contour-note">Maße aus ergänzter Kontur</small>':''}${r.method==='dimensions'&&Math.abs(grossArea(r)-r.reference)>.005?`<small class="contour-note">Vorlage: ${num(r.reference)} m²</small>`:''}</td>
    <td>${dimensionInputs(r,d,f.short||f.name)}</td>
    ${[['deduction','Abzug',d.deduction],['factor','Ansatz',d.factor]].map(([name,label,value])=>`<td><input data-field="${name}" aria-label="${esc(f.short)} ${esc(r.name)} ${label}" inputmode="decimal" value="${esc(value)}" autocomplete="off" ${name==='factor'&&r.heightZones?'disabled':''}>${name==='factor'?`<small data-zone-factor-note ${r.heightZones?'':'hidden'}>Höhenzonen</small>`:''}</td>`).join('')}
    <td class="editor-checks"><label><input type="checkbox" data-field="include" ${r.include?'checked':''}> Im Projekt</label><label><input type="checkbox" data-field="eligible" ${d.eligible?'checked':''}> Wohnfläche</label></td><td><output data-result>${num(formRoomArea(project,r))}</output></td></tr>`}).join('')).join('')}
    </tbody></table></div>
    ${heightEditors(project,draft)}
    <div class="editor-help"><span><b>Länge × Breite ergibt die Grundfläche.</b> Verwinkelte Räume werden in Teilflächen zerlegt; bei Dreiecken gilt Grundseite × Höhe ÷ 2. Ergänzte Maße bitte prüfen. „Fläche direkt eingeben“ erhält einen manuellen Ansatz. Geänderte Berechnungsmaße verändern die gezeichnete Kontur nicht. Mit „Im Projekt“ und „Wohnfläche“ Räume den Summen zuordnen.</span><button id="applyCalculation" class="primary">Änderungen übernehmen</button></div>
    <p id="calculationStatus" class="editor-status" role="status" aria-live="polite">Gespeicherter Projektstand geladen.</p><div id="calculationErrors" class="editor-errors" role="alert" hidden></div>
  </section>`;
}

export function readCalculationEditor(root){
  const draft={rooms:[...root.querySelectorAll('[data-edit-room]')].map(row=>{
    const entry={id:row.dataset.editRoom};
    for(const input of row.querySelectorAll('[data-field]'))entry[input.dataset.field]=input.type==='checkbox'?input.checked:input.value;
    entry.parts=readDimensionInputs(row);
    return entry;
  })};
  for(const input of root.querySelectorAll('[data-meta]'))draft[input.dataset.meta]=input.value;
  for(const group of root.querySelectorAll('[data-height-room]')){
    const entry=draft.rooms.find(r=>r.id===group.dataset.heightRoom);
    entry.zones={enabled:group.querySelector('[data-use-zones]').checked};
    for(const input of group.querySelectorAll('[data-zone]'))entry.zones[input.dataset.zone]=input.value;
  }
  return draft;
}

function atticGuidance(project){
 if(!project.floors.some(f=>f.id==='dg'))return '';
 return `<aside class="attic-guidance"><strong>Dachboden &amp; Dachschrägen</strong><p>Ein Bodenraum zählt nach § 2 Abs. 3 Nr. 1 d WoFlV nicht zur Wohnfläche. Geschlossenheit allein begründet keinen 50-%-Ansatz. Bei zulässiger Wohnnutzung gelten je Teilfläche: unter 1 m Höhe 0 %, von 1 bis unter 2 m 50 %, ab 2 m 100 %. Eine weitere pauschale Kürzung auf 25 % folgt daraus nicht.</p><p>Die Vorlage zeigt 1,50-m-Linien. Für eine Berechnung nach Raumhöhe fehlen damit die Flächen der 1-m- und 2-m-Zonen. Diese können unten eingetragen werden. Die Zuordnung „Wohnfläche“ bleibt eine eigene Auswahl.</p><button class="text-action" data-law="woflv">Gesetzesgrundlage ansehen ↗</button></aside>`;
}
function heightEditors(project,draft){
 const candidates=project.floors.flatMap(f=>f.rooms.filter(r=>f.id==='dg'||r.heightZones).map(r=>({f,r})));
 return candidates.map(({f,r})=>{const d=draft.rooms.find(x=>x.id===r.id);return `<details class="height-zone-editor" data-height-room="${esc(r.id)}" ${r.heightZones?'open':''}><summary>${esc(f.short||f.name)} · ${esc(r.name)}: Höhenzonen bearbeiten</summary><p>Teilflächen in m² nach Abzügen gemäß § 3 eingeben. Ihre Summe muss der Grundfläche minus §-3-Abzug entsprechen. Die Höhengewichtung ersetzt den pauschalen Prozentansatz. Anschließend wird der gewählte Abzug von der Grundfläche berücksichtigt.</p><label class="height-toggle"><input type="checkbox" data-use-zones ${d.zones.enabled?'checked':''}> Nach lichter Raumhöhe berechnen</label><fieldset ${d.zones.enabled?'':'disabled'}><legend>Teilflächen nach Raumhöhe</legend>${[['under1','Unter 1 m · 0 %'],['between1and2','1 bis unter 2 m · 50 %'],['from2','Ab 2 m · 100 %']].map(([key,label])=>`<label>${label}<input data-zone="${key}" aria-label="${esc(f.short||f.name)} ${esc(r.name)} ${label}" inputmode="decimal" value="${esc(d.zones[key])}" placeholder="m²"></label>`).join('')}</fieldset></details>`}).join('');
}
