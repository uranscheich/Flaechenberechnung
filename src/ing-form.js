import {grossArea,deductionArea} from './model.js';
import {livingArea,livingEligible} from './living-area.js';
import {escape as esc,num,measure} from './plan.js';
import {polygonParts,partArea} from './area-parts.js';

export const formDeduction=project=>project.formDeduction??.03;
export const formRoomArea=(project,room)=>livingArea(room)*(1-formDeduction(project));
export const formTotal=project=>project.floors.reduce((sum,f)=>sum+f.rooms.reduce((s,r)=>s+formRoomArea(project,r),0),0);
export function formDimensions(room){
 const parts=formParts(room);
 return parts?.length===1&&parts[0].shape==='rectangle'?{length:parts[0].length,width:parts[0].width}:null;
}
export function formParts(room){
 if(room.method==='dimensions')return room.dimensionParts;
 if(['reference','manual'].includes(room.method))return null;
 return polygonParts(room.points);
}
const approach=r=>r.heightZones?'0 / 50 / 100 %':`${num(r.factor*100).replace(',00','')} %`;
function roomRows(project,{floor,room:r}){
 const parts=formParts(r),count=parts?.length||1,span=count>1?` rowspan="${count}"`:'';
 return `<tbody class="ing-room" data-form-room="${esc(r.id)}">${(parts||[null]).map((p,i)=>`<tr>${i===0?`<td${span}>${esc(r.name)}${count>1?`<small>${count} Teilflächen · Σ ${num(grossArea(r))} m²</small>`:''}</td><td${span}>${esc(floor)}</td>`:''}<td class="ing-number">${p?measure(p.length):'—'}</td><td class="ing-number">${p?measure(p.width):'—'}</td><td class="ing-number"><strong>${num(p?partArea(p):grossArea(r))}</strong>${p?.shape==='triangle'?'<small>Dreieck · ÷ 2</small>':!p?'<small>Manueller Ansatz</small>':''}</td>${i===0?`<td${span} class="ing-number">${approach(r)}${r.heightZones?'<small>Höhenzonen</small>':''}</td><td${span} class="ing-number"><strong>${num(formRoomArea(project,r))}</strong>${deductionArea(r)?`<small>§ 3: −${num(deductionArea(r))} m²</small>`:''}</td>`:''}</tr>`).join('')}</tbody>`;
}
export function ingForm(project){
 const all=project.floors.flatMap(f=>f.rooms.map(room=>({floor:f.short||f.name,room})));
 const rows=all.filter(x=>x.room.include&&livingEligible(x.room)),excluded=all.filter(x=>!x.room.include||!livingEligible(x.room));
 const rate=formDeduction(project)*100;
 const meta=(label,value)=>`<div><span>${label}</span><strong>${esc(value||'')}</strong></div>`;
 return `<article class="report-page living-sheet ing-sheet">
  <div class="living-title"><span>BAUFINANZIERUNG · AUFSTELLUNG NACH ING-FORMULAR</span><h2>Wohnflächenberechnung</h2><p>${esc(project.title)} · ${esc(project.subtitle||'')} · Arbeitsstand</p></div>
  <div class="ing-meta">${meta('Antragsteller / Darlehensnehmer',project.applicant)}${meta('Beleihungsobjekt (Anschrift)',project.propertyAddress)}${meta('Vorgangsnummer',project.caseNumber)}</div>
  <div class="ing-table-title">Wohnflächenberechnung <span class="online-only">Grundfläche nach § 3 WoFlV <button class="law-info" data-law="woflv" aria-label="Information zur Wohnflächenverordnung">i</button></span></div>
  <table class="ing-table"><colgroup>${[24,10,10,10,16,12,18].map(w=>`<col style="width:${w}%">`).join('')}</colgroup><thead><tr><th>Zimmer</th><th>Lage im Gebäude<br><small>(EG/OG/DG)</small></th><th>Länge<br><small>(m)</small></th><th>Breite<br><small>(m)</small></th><th>Länge × Breite<br><small>(m²)</small></th><th>Anrechnung</th><th>Wohnfläche<br><small>(m²)${rate?`<br>Grundfläche abzügl. ${num(rate).replace(',00','')} %`:''}</small></th></tr></thead>
  ${rows.map(row=>roomRows(project,row)).join('')}<tbody>
  ${Array.from({length:Math.max(0,14-rows.reduce((sum,{room})=>sum+(formParts(room)?.length||1),0))},()=>'<tr class="blank-row"><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('')}
  <tr class="blank-row"><td>Terrasse / Balkon</td><td></td><td></td><td></td><td></td><td>25 %</td><td></td></tr><tr class="blank-row"><td>Terrasse / Balkon</td><td></td><td></td><td></td><td></td><td>25 %</td><td></td></tr>
  <tr class="ing-excluded"><td>Keller</td><td colspan="6">keine Anrechnung auf die Wohnfläche</td></tr>
  ${excluded.map(({floor,room:r})=>`<tr class="ing-excluded"><td>${esc(r.name)}</td><td colspan="6">${esc(floor)} · keine Anrechnung auf die Wohnfläche${r.id==='dg1'&&!livingEligible(r)?' · Zuordnung als Bodenraum':''}</td></tr>`).join('')}
  </tbody><tfoot><tr><th colspan="6">Gesamtwohnfläche</th><td><strong>${num(formTotal(project))} m²</strong></td></tr></tfoot></table>
  <p class="ing-calculation-note">${rate?`${num(rate).replace(',00','')} % Abzug von der Grundfläche. `:''}Teilflächen werden je Raum addiert; Dreiecke: Grundseite × Höhe ÷ 2. Abzüge nach § 3 und Anrechnung nach § 4 gelten einmal für die Raumsumme. Manuelle Flächenansätze haben keine abgeleiteten Maße. Ergänzte Konturmaße prüfen. Summe aus ungerundeten Einzelwerten.</p>
  <p class="ing-declaration">Ich versichere / Wir versichern, dass alle Angaben wahrheitsgemäß gemacht wurden.</p>
  <div class="ing-signatures"><div><span>${esc([project.place,project.reportDate].filter(Boolean).join(', '))}</span><small>Ort, Datum</small></div><div><span></span><small>Unterschrift Darlehensnehmer</small></div><div><span></span><small>Bei Eigentumswohnungen / WEG-geteilten Objekten: Unterschrift eines Architekten oder Sachverständigen</small></div></div>
 </article>`;
}
