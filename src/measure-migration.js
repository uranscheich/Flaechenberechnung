import {grossArea,deductionArea,initialProject} from './model.js';
import {polygonParts,partsArea} from './area-parts.js';

const same=(a,b)=>a.length===b.length&&a.every((p,i)=>p.every((n,j)=>Math.abs(n-b[i][j])<1e-7));
export function migrateMeasureBasis(project){
 if((project.calculationRevision||0)>=1)return project;
 const defaults=new Map(initialProject().floors.flatMap(f=>f.rooms.map(r=>[r.id,r])));
 for(const f of project.floors)for(const r of f.rooms){
  const standard=defaults.get(r.id);
  const originalReference=r.method==='reference'&&standard&&same(r.points,standard.points)&&Math.abs(r.reference-standard.reference)<1e-7;
  if(r.method==='manual'||r.method==='dimensions'||!(originalReference||r.method==='geometry'||r.method===undefined))continue;
  const parts=polygonParts(r.points),area=partsArea(parts);
  // Keep intentional overrides and valid existing height-zone/section-3 totals.
  if(!parts.length||parts.length>100||deductionArea(r)>area||r.heightZones&&Math.abs(grossArea(r)-area)>1e-6)continue;
  r.dimensionParts=parts;r.method='dimensions';
 }
 project.calculationRevision=1;
 return project;
}
