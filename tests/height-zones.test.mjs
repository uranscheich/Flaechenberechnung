import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialProject,validateProject,effectiveArea} from '../src/model.js';
import {livingArea,livingForm} from '../src/woflv.js';
import {calculationDraft,applyCalculationDraft} from '../src/calculation-editor.js';
import {heightZoneResult,validateHeightZones} from '../src/height-zones.js';

test('Dachschrägen werden mit 0/50/100 % gewichtet, ohne zweite Halbierung',()=>{
 const p=initialProject(),r=p.floors[2].rooms[0];
 r.method='manual';r.manualArea=30;r.factor=.5;
 r.heightZones={under1:6,between1and2:10,from2:14};
 validateProject(p);assert.equal(heightZoneResult(r.heightZones),19);assert.equal(effectiveArea(r),19);
 assert.equal(livingArea(r),0);r.livingEligible=true;assert.equal(livingArea(r),19);
});
test('Die Höhenzonen schließen nach §3-Abzug; Abzug wird nicht ein zweites Mal abgezogen',()=>{
 const p=initialProject(),draft=calculationDraft(p),r=draft.rooms.find(r=>r.id==='dg1');
 r.gross='33';r.deduction='3';r.factor='50';r.eligible=true;
 r.zones={enabled:true,under1:'6',between1and2:'10',from2:'14'};
 const result=applyCalculationDraft(p,draft);assert.deepEqual(result.errors,[]);
 const next=result.project.floors[2].rooms[0];assert.equal(next.factor,1);assert.equal(livingArea(next),19);
 const html=livingForm(result.project);assert.ok(html.includes('<td>Dachboden</td><td>DG</td>'));assert.ok(html.includes('0 / 50 / 100 %'));assert.ok(html.includes('18,43'));
 const restored=validateProject(JSON.parse(JSON.stringify(result.project)));assert.deepEqual(restored.floors[2].rooms[0].heightZones,next.heightZones);
});
test('Fehlende oder nicht schließende Höhenzonen verhindern das Übernehmen',()=>{
 for(const zones of [{under1:0,between1and2:10,from2:10},{under1:-1,between1and2:10,from2:21},{under1:0,between1and2:NaN,from2:30}])assert.throws(()=>validateHeightZones(zones,30));
 const p=initialProject(),draft=calculationDraft(p),before=structuredClone(p),r=draft.rooms.find(r=>r.id==='dg1');
 r.zones={enabled:true,under1:'',between1and2:'10',from2:'20'};
 const result=applyCalculationDraft(p,draft);assert.ok(result.errors.length);assert.equal(result.project,undefined);assert.deepEqual(p,before);assert.equal(r.zones.under1,'');
});
test('Höhenzonen können deaktiviert werden; der gewählte pauschale Ansatz gilt wieder',()=>{
 const p=initialProject(),r=p.floors[2].rooms[0];r.method='manual';r.manualArea=30;r.heightZones={under1:6,between1and2:10,from2:14};r.livingEligible=true;
 const draft=calculationDraft(p),entry=draft.rooms.find(r=>r.id==='dg1');entry.zones.enabled=false;entry.factor='50';
 const {project:next,errors}=applyCalculationDraft(p,draft);assert.deepEqual(errors,[]);assert.equal(next.floors[2].rooms[0].heightZones,undefined);assert.equal(livingArea(next.floors[2].rooms[0]),15);
});
