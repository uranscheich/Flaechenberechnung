import {test} from 'node:test';
import assert from 'node:assert/strict';
import {polygonParts,partsArea,validateParts} from '../src/area-parts.js';
import {initialProject,grossArea,polygonArea,validateProject} from '../src/model.js';
import {formParts,formTotal,ingForm} from '../src/ing-form.js';
import {calculationDraft,applyCalculationDraft} from '../src/calculation-editor.js';
import {migrateProject} from '../src/migrations.js';
import {planPoints,floorLayout,openingGeometry} from '../src/layouts.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('Maßprodukte zerlegen Rechtecke, Nischen und Diagonalen flächentreu in beiden Laufrichtungen',()=>{
 const polygons=[[[0,0],[4,0],[4,2],[2,2],[2,3],[0,3]],[[0,0],[2,0],[3,2],[1,2]],[[0,0],[1,0],[4,3],[3,3]],[[0,0],[4,0],[4,4],[3,4],[3,1],[1,1],[1,4],[0,4]],...Object.values(planPoints)];
 for(const points of polygons)for(const p of [points,[...points].reverse()]){
  const parts=validateParts(polygonParts(p));near(partsArea(parts),polygonArea(p));
 }
 assert.equal(polygonParts([[0,0],[2,0],[0,3]])[0].shape,'triangle');
 assert.throws(()=>validateParts([{shape:'rectangle',length:0,width:2}]));
 assert.throws(()=>validateParts([{shape:'circle',length:2,width:2}]));
});
test('Jeder Standardraum besitzt Längen und Breiten; die Formularprodukte schließen ohne erfundene Ersatzmaße',()=>{
 const p=validateProject(initialProject());
 for(const f of p.floors)for(const r of f.rooms){const parts=formParts(r);assert.ok(parts?.length,r.name);near(partsArea(parts),grossArea(r));near(partsArea(parts),polygonArea(r.points));}
 const html=ingForm(p);assert.ok(!html.includes('>—</td>'));assert.ok(html.includes('Dreieck · ÷ 2'));assert.ok(html.includes('Teilflächen · Σ'));
});
test('Bearbeitete Längen und Breiten ändern Grundfläche und WFB, ohne Grundriss oder Referenz zu überschreiben',()=>{
 const p=initialProject(),before=structuredClone(p),draft=calculationDraft(p),k=draft.rooms.find(r=>r.id==='eg2');
 k.parts[0].length='3,2';k.parts[0].width='2,5';k.deduction='0,5';k.factor='50';
 const {project:next,errors}=applyCalculationDraft(p,draft);assert.deepEqual(errors,[]);assert.deepEqual(p,before);
 const room=next.floors[0].rooms[1];near(grossArea(room),8);near(formTotal(next)-formTotal(p),(3.75-8.323225)*.97);
 assert.deepEqual(room.points,before.floors[0].rooms[1].points);assert.equal(room.reference,8.32);
 assert.ok(ingForm(next).includes('3,20</td><td class="ing-number">2,50'));
 const restored=validateProject(JSON.parse(JSON.stringify(next)));assert.deepEqual(restored.floors[0].rooms[1].dimensionParts,room.dimensionParts);
});
test('Ungültige Teilmaße und ein zu hoher Abzug verhindern die gesamte Übernahme',()=>{
 for(const value of ['','-1','0','abc','1001']){
  const p=initialProject(),before=structuredClone(p),draft=calculationDraft(p);draft.rooms[0].parts[0].length=value;
  const result=applyCalculationDraft(p,draft);assert.ok(result.errors.length);assert.equal(result.project,undefined);assert.deepEqual(p,before);assert.equal(draft.rooms[0].parts[0].length,value);
 }
 const p=initialProject(),draft=calculationDraft(p),r=draft.rooms.find(r=>r.id==='eg2');r.parts[0].length='0,1';r.deduction='1';assert.ok(applyCalculationDraft(p,draft).errors.length);
});
test('Mehrere Teilflächen erhalten §3-Abzug und Anrechnung genau einmal pro Raum',()=>{
 const p=initialProject(),r=p.floors[0].rooms[0];r.manualDeduction=1;r.factor=.5;
 const html=ingForm(p),body=html.split('data-form-room="eg1">')[1].split('</tbody>')[0];
 assert.equal((body.match(/§ 3:/g)||[]).length,1);assert.equal((body.match(/50 %/g)||[]).length,1);assert.ok(body.includes('rowspan="3"'));
 near(partsArea(formParts(r)),grossArea(r));
});
test('Bereits gespeicherte Referenzräume erhalten Maße einmalig; manuelle und eigene Ansätze bleiben erhalten',()=>{
 const p=initialProject();delete p.calculationRevision;
 for(const f of p.floors)for(const r of f.rooms){r.method=r.verified?'geometry':'reference';delete r.dimensionParts;}
 const manual=p.floors[0].rooms[1];manual.method='manual';manual.manualArea=12.345;
 const own=p.floors[1].rooms[0];own.reference=18;
 const height=p.floors[0].rooms[2];height.heightZones={under1:0,between1and2:0,from2:4.69};
 const next=migrateProject(validateProject(p));validateProject(next);
 assert.equal(next.floors[0].rooms[3].method,'dimensions');assert.equal(next.floors[0].rooms[1].manualArea,12.345);
 assert.equal(next.floors[1].rooms[0].method,'reference');assert.equal(next.floors[1].rooms[0].reference,18);
 assert.equal(next.floors[0].rooms[2].method,'reference');assert.deepEqual(next.floors[0].rooms[2].heightZones,height.heightZones);
 assert.deepEqual(next,migrateProject(next));
});
test('Abstellraum enthält Türlaibungen, Nische und die Diagonale am Treppenkern',()=>{
 const points=planPoints.eg6,walls=floorLayout('eg').walls,front=walls.find(w=>w.id==='store-west');
 assert.ok(points.length>4);assert.ok(points.some((p,i)=>{const q=points[(i+1)%points.length];return p[0]!==q[0]&&p[1]!==q[1];}));
 const door=openingGeometry(front,front.openings[0]);near(front.openings[0].width,.76);near(front.openings[0].offset,.24);near(door.hinge[1],4.455);
 assert.ok(walls.find(w=>w.id==='store-recess'));assert.ok(walls.find(w=>w.id==='stair-core-west'));
 const stairs=floorLayout('eg').stairs;assert.ok(stairs.some(p=>p[0]===0&&p[1]===4.75));assert.ok(stairs.some(p=>p[0]===.95&&p[1]===5.35));
});
test('Revision 3 korrigiert nur unveränderte Standardkonturen am Abstellraum',()=>{
 const p=initialProject();p.geometryRevision=3;delete p.calculationRevision;
 const store=p.floors[0].rooms[5];store.method='manual';store.manualArea=1.72;store.points=[[1.375,4.015],[0,4.015],[0,4.9],[1.375,4.9]];
 const next=migrateProject(p);assert.deepEqual(next.floors[0].rooms[5].points,planPoints.eg6);assert.equal(grossArea(next.floors[0].rooms[5]),1.72);
 store.points[0][0]=1.4;assert.deepEqual(migrateProject(p).floors[0].rooms[5].points,store.points);
});
