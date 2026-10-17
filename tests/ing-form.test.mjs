import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialProject,validateProject} from '../src/model.js';
import {livingTotal} from '../src/living-area.js';
import {formTotal,formRoomArea,formDimensions,ingForm} from '../src/ing-form.js';
import {calculationDraft,applyCalculationDraft} from '../src/calculation-editor.js';

test('ING-Formularabzug bleibt von Grundflächen und gesetzlichen Abzügen getrennt',()=>{
 const p=initialProject(),base=livingTotal(p);assert.ok(Math.abs(formTotal(p)-base*.97)<1e-10);
 assert.equal(livingTotal(p),base);p.formDeduction=0;assert.equal(formTotal(p),base);
 assert.throws(()=>validateProject({...p,formDeduction:.5}));
});
test('Formularabzug folgt §3-Abzug und Höhengewichtung genau einmal',()=>{
 const p=initialProject(),r=p.floors[2].rooms[0];r.method='manual';r.manualArea=33;r.manualDeduction=3;r.livingEligible=true;r.heightZones={under1:6,between1and2:10,from2:14};
 assert.equal(formRoomArea(p,r),19*.97);assert.equal(r.manualDeduction,3);
});
test('Oberer Formularabschnitt enthält Bankangaben, Tabelle, Ausschlüsse und Unterschriften',()=>{
 const p=initialProject();p.applicant='<Antragsteller>';p.propertyAddress='Musterstraße 1';p.caseNumber='123';
 const html=ingForm(p);for(const label of ['Antragsteller / Darlehensnehmer','Beleihungsobjekt (Anschrift)','Vorgangsnummer','Länge × Breite','Grundfläche abzügl. 3 %','Gesamtwohnfläche','Unterschrift Darlehensnehmer','Zuordnung als Bodenraum'])assert.ok(html.includes(label),label);
 assert.ok(html.includes('&lt;Antragsteller&gt;'));assert.ok(!html.includes('Vorgaben zur Berechnung der Wohnfläche'));assert.ok(!html.includes('Von der Behörde auszufüllen'));
 assert.equal(formDimensions(p.floors[0].rooms[0]),null);const d=formDimensions(p.floors[0].rooms[1]);assert.ok(Math.abs(d.length-2.885)<1e-10&&Math.abs(d.width-2.885)<1e-10);
});
test('Bankangaben und Auswahl des Formularabzugs bleiben im gespeicherten Projekt erhalten',()=>{
 const p=initialProject(),d=calculationDraft(p);d.applicant='Familie Muster';d.propertyAddress='Musterstraße 1';d.caseNumber='123';d.formDeduction='0';
 const {project:next,errors}=applyCalculationDraft(p,d);assert.deepEqual(errors,[]);const restored=validateProject(JSON.parse(JSON.stringify(next)));assert.equal(restored.applicant,'Familie Muster');assert.equal(restored.formDeduction,0);assert.equal(formTotal(restored),livingTotal(restored));
});
