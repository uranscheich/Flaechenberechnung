import {partsArea,validateParts} from './area-parts.js';
import {heightZoneKeys} from './height-zones.js';

// Section drawing, original plan: symmetrical 35° roof; the DG room is
// bounded by the two 1.50 m lines. Only that existing room is calculated.
export const sectionRoofProfile=()=>({pitchDegrees:35,edgeHeight:1.5});
export function validateRoofProfile(profile){
 if(!profile||!Number.isFinite(profile.pitchDegrees)||profile.pitchDegrees<=0||profile.pitchDegrees>=90||!Number.isFinite(profile.edgeHeight)||profile.edgeHeight<0||profile.edgeHeight>10)throw Error('Ungültige Angaben zur Dachneigung oder lichten Randhöhe.');
 return profile;
}
export function roofHeightZones({length,width},profile){
 validateRoofProfile(profile);
 if(!Number.isFinite(length)||!Number.isFinite(width)||length<=0||width<=0)throw Error('DG: Gültige Länge und Breite für den Höhenansatz erforderlich.');
 const slope=Math.tan(profile.pitchDegrees*Math.PI/180),area=length*width;
 const above=height=>Math.max(0,length-2*Math.max(0,(height-profile.edgeHeight)/slope))*width;
 const above1=above(1),above2=above(2);
 return {under1:area-above1,between1and2:above1-above2,from2:above2};
}
const decimal=value=>{const s=String(value??'').trim();return /^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(s)?Number(s.replace(',','.')):NaN;};
const text=n=>String(Number(n.toFixed(9)));
export function activateHeightDraft(entry,profile,{replace=false}={}){
 const next=structuredClone(entry);
 next.include=true;next.eligible=true;next.factor='100';next.zones={...next.zones,enabled:true};
 if(!replace&&heightZoneKeys.some(key=>String(next.zones[key]??'').trim()!==''))return {entry:next,message:'Vorhandene Höhenzonen beibehalten. Der Raum ist zur Wohnfläche zugeordnet.'};
 try{
  if(!profile)throw Error('Für diesen Raum liegen keine Dachangaben vor. Höhenzonen bitte eintragen.');
  const parts=validateParts((next.parts||[]).map(p=>({shape:p.shape,length:decimal(p.length),width:decimal(p.width)})));
  if(parts.length!==1||parts[0].shape!=='rectangle')throw Error('Für diesen Maßansatz Höhenzonen bitte direkt eintragen.');
  const gross=next.basis==='dimensions'?partsArea(parts):decimal(next.gross),deduction=decimal(next.deduction);
  if(!Number.isFinite(gross)||Math.abs(gross-partsArea(parts))>1e-6)throw Error('DG-Grundfläche und Maßansatz weichen ab. Höhenzonen bitte direkt eintragen.');
  if(deduction!==0)throw Error('Abzüge nach § 3 müssen den Höhenzonen zugeordnet werden. Die Teilflächen nach Abzug bitte direkt eintragen.');
  const zones=roofHeightZones(parts[0],profile);
  next.zones={enabled:true,...Object.fromEntries(heightZoneKeys.map(key=>[key,text(zones[key])]))};
  return {entry:next,message:`DG-Maße übernommen: ${profile.pitchDegrees}° Dachneigung, ${String(profile.edgeHeight).replace('.',',')} m Randhöhe. Der Raum ist zur Wohnfläche zugeordnet.`};
 }catch(error){return {entry:next,message:error.message};}
}
