import {test} from 'node:test';
import assert from 'node:assert/strict';
import {roofHeightZones,activateHeightDraft,sectionRoofProfile} from '../src/roof-zones.js';
import {initialProject,validateProject,grossArea} from '../src/model.js';
import {calculationDraft,applyCalculationDraft} from '../src/calculation-editor.js';
import {heightZoneArea,heightZoneResult} from '../src/height-zones.js';
import {formTotal,formRoomArea,ingForm} from '../src/ing-form.js';
import {migrateProject} from '../src/migrations.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Symmetrischer 45°-Schnitt liefert bekannte 0/50/100-Prozent-Streifen',()=>{
 const zones=roofHeightZones({length:6,width:4},{pitchDegrees:45,edgeHeight:0});
 near(zones.under1,8);near(zones.between1and2,8);near(zones.from2,8);near(heightZoneResult(zones),12);
 const low=roofHeightZones({length:1,width:4},{pitchDegrees:45,edgeHeight:1.5});near(low.between1and2,4);near(low.from2,0);
 const tall=roofHeightZones({length:6,width:4},{pitchDegrees:35,edgeHeight:2});near(tall.from2,24);near(tall.between1and2,0);
});
test('Aktivieren übernimmt die DG-Maße und fügt den Raum samt Höhenansatz in die WFB ein',()=>{
 const p=initialProject(),before=structuredClone(p),draft=calculationDraft(p),index=draft.rooms.findIndex(r=>r.id==='dg1');
 draft.rooms[index].include=false;
 const initialized=activateHeightDraft(draft.rooms[index],p.floors[2].rooms[0].roofProfile);draft.rooms[index]=initialized.entry;
 assert.equal(initialized.entry.include,true);assert.equal(initialized.entry.eligible,true);assert.ok(initialized.message.includes('35°'));
 const result=applyCalculationDraft(p,draft);assert.deepEqual(result.errors,[]);assert.deepEqual(p,before);
 const r=result.project.floors[2].rooms[0];near(heightZoneArea(r.heightZones),grossArea(r));assert.equal(r.heightZones.under1,0);
 near(r.heightZones.between1and2,8.126162158);near(r.heightZones.from2,24.875837842);near(formRoomArea(result.project,r),28.07075135337);
 near(formTotal(result.project)-formTotal(p),formRoomArea(result.project,r));
 const body=ingForm(result.project).split('data-form-room="dg1">')[1].split('</tbody>')[0];
 for(const value of ['Dachboden','DG','5,80','5,69','8,13','24,88','28,07','Höhenzonen:'])assert.ok(body.includes(value),value);
 assert.ok(!body.includes('keine Anrechnung'));
 const restored=validateProject(JSON.parse(JSON.stringify(result.project)));assert.deepEqual(restored.floors[2].rooms[0].roofProfile,r.roofProfile);assert.deepEqual(restored.floors[2].rooms[0].heightZones,r.heightZones);
});
test('Automatische Höhenzonen folgen geänderten DG-Berechnungsmaßen',()=>{
 const entry=calculationDraft(initialProject()).rooms.find(r=>r.id==='dg1');entry.parts[0].length='6';entry.parts[0].width='4';
 const result=activateHeightDraft(entry,{pitchDegrees:45,edgeHeight:0});
 assert.deepEqual(result.entry.zones,{enabled:true,under1:'8',between1and2:'8',from2:'8'});
});
test('DG lässt sich nach Speichern und Laden nur mit aktiver Höhenberechnung zur WFB hinzufügen',()=>{
 const p=initialProject(),draft=calculationDraft(p),index=draft.rooms.findIndex(r=>r.id==='dg1');
 draft.rooms[index]=activateHeightDraft(draft.rooms[index],p.floors[2].rooms[0].roofProfile).entry;
 const active=applyCalculationDraft(p,draft).project,off=calculationDraft(active);off.rooms[index].zones.enabled=false;
 const removed=applyCalculationDraft(active,off);assert.deepEqual(removed.errors,[]);near(formTotal(removed.project),formTotal(p));assert.ok(!ingForm(removed.project).includes('Dachboden'));
 const loaded=validateProject(JSON.parse(JSON.stringify(removed.project))),on=calculationDraft(loaded);
 on.rooms[index]=activateHeightDraft(on.rooms[index],loaded.floors[2].rooms[0].roofProfile).entry;
 const restored=applyCalculationDraft(loaded,on);assert.deepEqual(restored.errors,[]);near(formTotal(restored.project),formTotal(active));assert.ok(ingForm(restored.project).includes('data-form-room="dg1"'));
});
test('Eigene und unvollständige Höheneingaben werden bei erneutem Aktivieren nicht überschrieben',()=>{
 const entry=calculationDraft(initialProject()).rooms.find(r=>r.id==='dg1');
 entry.zones={enabled:false,under1:'0',between1and2:'10',from2:'23,002'};const before=structuredClone(entry);
 const result=activateHeightDraft(entry,sectionRoofProfile());assert.deepEqual(entry,before);assert.deepEqual(result.entry.zones,{...before.zones,enabled:true});
 entry.zones={enabled:false,under1:'',between1and2:'7,5',from2:''};assert.equal(activateHeightDraft(entry,sectionRoofProfile()).entry.zones.between1and2,'7,5');
 const recalculated=activateHeightDraft(entry,sectionRoofProfile(),{replace:true});assert.equal(recalculated.entry.zones.between1and2,'8.126162158');
});
test('Fehlende Dachdaten, abweichende Direktflächen und nicht zugeordnete Abzüge erzeugen keine erfundenen Zonen',()=>{
 for(const modify of [e=>{e.basis='area';e.gross='30';},e=>{e.deduction='1';},e=>{e.parts.push({...e.parts[0]});}]){
  const entry=calculationDraft(initialProject()).rooms.find(r=>r.id==='dg1');modify(entry);
  const result=activateHeightDraft(entry,sectionRoofProfile());assert.equal(result.entry.zones.from2,'');assert.equal(result.entry.zones.between1and2,'');assert.ok(!result.message.includes('DG-Maße übernommen'));
 }
 const entry=calculationDraft(initialProject()).rooms.find(r=>r.id==='dg1');assert.equal(activateHeightDraft(entry,undefined).entry.zones.from2,'');
 for(const profile of [{pitchDegrees:0,edgeHeight:1.5},{pitchDegrees:90,edgeHeight:1.5},{pitchDegrees:35,edgeHeight:-1}])assert.throws(()=>roofHeightZones({length:6,width:4},profile));
});
test('Ältere Standardprojekte erhalten das Dachprofil; eigene Konturen und Dachprofile bleiben erhalten',()=>{
 const p=initialProject();delete p.floors[2].rooms[0].roofProfile;
 const next=migrateProject(p);assert.deepEqual(next.floors[2].rooms[0].roofProfile,sectionRoofProfile());assert.deepEqual(next,migrateProject(next));
 p.floors[2].rooms[0].points[0][0]=5.5;assert.equal(migrateProject(p).floors[2].rooms[0].roofProfile,undefined);
 p.floors[2].rooms[0].roofProfile={pitchDegrees:40,edgeHeight:1.2};assert.deepEqual(migrateProject(p).floors[2].rooms[0].roofProfile,p.floors[2].rooms[0].roofProfile);
 p.floors[2].rooms[0].roofProfile.pitchDegrees=100;assert.throws(()=>validateProject(p));
});
