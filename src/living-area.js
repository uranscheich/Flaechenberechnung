import {grossArea,effectiveArea} from './model.js';
export const livingEligible=r=>(r.id!=='dg1'||!!r.heightZones)&&(r.livingEligible??!['eg7','dg1'].includes(r.id));
export const livingArea=r=>r.include&&livingEligible(r)?effectiveArea(r):0;
export const livingTotal=p=>p.floors.reduce((n,f)=>n+f.rooms.reduce((a,r)=>a+livingArea(r),0),0);
export function livingRows(project){return project.floors.flatMap(f=>f.rooms.map(r=>({floor:f.short||f.name,room:r,gross:grossArea(r),deduction:grossArea(r)-livingArea(r),result:livingArea(r)})))}
