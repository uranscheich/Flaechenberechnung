import {grossArea,deductionArea,isRectangle} from './model.js';
import {livingArea,livingEligible} from './living-area.js';
import {escape as esc,num,measure} from './plan.js';

export const formDeduction=project=>project.formDeduction??.03;
export const formRoomArea=(project,room)=>livingArea(room)*(1-formDeduction(project));
export const formTotal=project=>project.floors.reduce((sum,f)=>sum+f.rooms.reduce((s,r)=>s+formRoomArea(project,r),0),0);
export function formDimensions(room){
 if(['reference','manual'].includes(room.method)||!isRectangle(room.points))return null;
 const xs=room.points.map(p=>p[0]),ys=room.points.map(p=>p[1]);
 return {length:Math.max(...ys)-Math.min(...ys),width:Math.max(...xs)-Math.min(...xs)};
}
const basis=r=>r.method==='manual'?'Manueller Ansatz':r.method==='reference'?'':isRectangle(r.points)?'':'Polygonfläche';
const approach=r=>r.heightZones?'0 / 50 / 100 %':`${num(r.factor*100).replace(',00','')} %`;
export function ingForm(project){
 const all=project.floors.flatMap(f=>f.rooms.map(room=>({floor:f.short||f.name,room})));
 const rows=all.filter(x=>x.room.include&&livingEligible(x.room)),excluded=all.filter(x=>!x.room.include||!livingEligible(x.room));
 const rate=formDeduction(project)*100;
 const meta=(label,value)=>`<div><span>${label}</span><strong>${esc(value||'')}</strong></div>`;
 return `<article class="report-page living-sheet ing-sheet">
  <div class="living-title"><span>BAUFINANZIERUNG · AUFSTELLUNG NACH ING-FORMULAR</span><h2>Wohnflächenberechnung</h2><p>${esc(project.title)} · ${esc(project.subtitle||'')} · Arbeitsstand</p></div>
  <div class="ing-meta">${meta('Antragsteller / Darlehensnehmer',project.applicant)}${meta('Beleihungsobjekt (Anschrift)',project.propertyAddress)}${meta('Vorgangsnummer',project.caseNumber)}</div>
  <div class="ing-table-title">Wohnflächenberechnung <span class="online-only">Grundfläche nach § 3 WoFlV <button class="law-info" data-law="woflv" aria-label="Information zur Wohnflächenverordnung">i</button></span></div>
  <table class="ing-table"><colgroup>${[24,10,10,10,16,12,18].map(w=>`<col style="width:${w}%">`).join('')}</colgroup><thead><tr><th>Zimmer</th><th>Lage im Gebäude<br><small>(EG/OG/DG)</small></th><th>Länge<br><small>(m)</small></th><th>Breite<br><small>(m)</small></th><th>Länge × Breite<br><small>(m²)</small></th><th>Anrechnung</th><th>Wohnfläche<br><small>(m²)${rate?`<br>Grundfläche abzügl. ${num(rate).replace(',00','')} %`:''}</small></th></tr></thead><tbody>
  ${rows.map(({floor,room:r})=>{const d=formDimensions(r);return `<tr><td>${esc(r.name)}</td><td>${esc(floor)}</td><td>${d?measure(d.length):'—'}</td><td>${d?measure(d.width):'—'}</td><td><strong>${num(grossArea(r))}</strong>${basis(r)?`<small>${esc(basis(r))}</small>`:''}${deductionArea(r)?`<small>§ 3: −${num(deductionArea(r))} m²</small>`:''}</td><td>${approach(r)}${r.heightZones?'<small>Höhenzonen</small>':''}</td><td><strong>${num(formRoomArea(project,r))}</strong></td></tr>`}).join('')}
  ${Array.from({length:Math.max(0,14-rows.length)},()=>'<tr class="blank-row"><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>').join('')}
  <tr class="blank-row"><td>Terrasse / Balkon</td><td></td><td></td><td></td><td></td><td>25 %</td><td></td></tr><tr class="blank-row"><td>Terrasse / Balkon</td><td></td><td></td><td></td><td></td><td>25 %</td><td></td></tr>
  <tr class="ing-excluded"><td>Keller</td><td colspan="6">keine Anrechnung auf die Wohnfläche</td></tr>
  ${excluded.map(({floor,room:r})=>`<tr class="ing-excluded"><td>${esc(r.name)}</td><td colspan="6">${esc(floor)} · keine Anrechnung auf die Wohnfläche${r.id==='dg1'&&!livingEligible(r)?' · Zuordnung als Bodenraum':''}</td></tr>`).join('')}
  </tbody><tfoot><tr><th colspan="6">Gesamtwohnfläche</th><td><strong>${num(formTotal(project))} m²</strong></td></tr></tfoot></table>
  <p class="ing-calculation-note">${rate?`${num(rate).replace(',00','')} % Abzug von der Grundfläche. Abzüge nach § 3 und Höhengewichtung sind gesondert berücksichtigt. `:''}Flächen ohne Rechteckansatz werden ohne Länge und Breite ausgewiesen. Bereits ausgesparte Flächen nicht erneut abziehen. Die Summe wird aus ungerundeten Einzelwerten gebildet.</p>
  <p class="ing-declaration">Ich versichere / Wir versichern, dass alle Angaben wahrheitsgemäß gemacht wurden.</p>
  <div class="ing-signatures"><div><span>${esc([project.place,project.reportDate].filter(Boolean).join(', '))}</span><small>Ort, Datum</small></div><div><span></span><small>Unterschrift Darlehensnehmer</small></div><div><span></span><small>Bei Eigentumswohnungen / WEG-geteilten Objekten: Unterschrift eines Architekten oder Sachverständigen</small></div></div>
 </article>`;
}
