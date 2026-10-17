import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialProject,validateProject,grossArea,deductionArea} from '../src/model.js';
import {calculationDraft,applyCalculationDraft,calculationEditor} from '../src/calculation-editor.js';
import {livingArea,livingTotal,livingForm} from '../src/woflv.js';
import {reportPages} from '../src/report.js';

test('Unveränderte Berechnungsentwürfe erhalten Geometrie und Berechnungsbasis',()=>{
 const p=initialProject(),draft=calculationDraft(p),result=applyCalculationDraft(p,draft);
 assert.deepEqual(result.errors,[]);assert.equal(livingTotal(result.project),livingTotal(p));
 result.project.floors.forEach((f,i)=>assert.deepEqual(f.rooms.map(r=>[r.points,r.method,r.manualArea]),p.floors[i].rooms.map(r=>[r.points,r.method,r.manualArea])));
});
test('Manuelle Grundfläche, Abzug und Ansatz wirken in Vorschau, JSON und Wohnflächenblatt',()=>{
 const p=initialProject(),original=structuredClone(p),draft=calculationDraft(p),kitchen=draft.rooms.find(r=>r.id==='eg2');
 kitchen.name='Küche neu';kitchen.gross='9,5';kitchen.deduction='0,5';kitchen.factor='50';
 draft.dwelling='Wohnung 1';draft.dwellingCount='1';draft.closed='yes';draft.garages='0';draft.stores='1';draft.place='Bremen';draft.reportDate='17.10.2026';
 const result=applyCalculationDraft(p,draft);assert.deepEqual(result.errors,[]);assert.deepEqual(p,original);
 const next=validateProject(JSON.parse(JSON.stringify(result.project))),r=next.floors[0].rooms[1];
 assert.equal(r.method,'manual');assert.equal(grossArea(r),9.5);assert.equal(deductionArea(r),.5);assert.equal(livingArea(r),4.5);
 assert.deepEqual(r.points,p.floors[0].rooms[1].points);assert.equal(r.reference,8.32);
 const html=reportPages(next);assert.ok(html.includes('Manueller Ansatz'));assert.ok(html.includes('Küche neu'));assert.ok(html.includes('4,50 m²'));assert.ok(html.includes('Bremen, 17.10.2026'));
 assert.ok(html.lastIndexOf('living-sheet')>html.lastIndexOf('report-summary'));
 assert.equal(next.garages,0);assert.equal(next.dwellingCount,'1');
});
test('Ungültige Entwürfe bleiben erhalten und verändern keine gespeicherten Raumdaten',()=>{
 for(const [field,value] of [['gross',''],['gross','-1'],['gross','abc'],['deduction','100'],['factor','101'],['factor','0x10'],['name','']]){
  const p=initialProject(),before=structuredClone(p),draft=calculationDraft(p);draft.rooms[0][field]=value;
  const result=applyCalculationDraft(p,draft);assert.equal(result.project,undefined);assert.ok(result.errors.length);assert.deepEqual(p,before);assert.equal(draft.rooms[0][field],value);
 }
});
test('Zuordnungen und §3-Rechteckabzüge bleiben unabhängig von manuellen Abzügen',()=>{
 const p=initialProject(),r=p.floors[0].rooms[0];r.deductions=[{name:'Pfeiler',width:.4,depth:.5}];
 const draft=calculationDraft(p);draft.rooms[0].deduction='0,3';draft.rooms[0].eligible=false;
 const {project:next}=applyCalculationDraft(p,draft),room=next.floors[0].rooms[0];
 assert.deepEqual(room.deductions,r.deductions);assert.equal(deductionArea(room),.3);assert.equal(livingArea(room),0);
 const second=calculationDraft(next);second.rooms[0].eligible=true;second.rooms[0].include=false;
 assert.equal(livingArea(applyCalculationDraft(next,second).project.floors[0].rooms[0]),0);
});
test('Formularfelder sind escaped; Editor und Gesetzesinfo sind nur online',()=>{
 const p=initialProject();p.title='<img src=x onerror=alert(1)>';p.floors[0].rooms[0].name='"<script>';
 const html=calculationEditor(p);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('online-only'));
 assert.ok(livingForm(p).includes('class="online-only">Grundfläche nach § 3 WoFlV'));
});
