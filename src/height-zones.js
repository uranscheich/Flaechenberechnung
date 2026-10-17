export const heightZoneKeys=['under1','between1and2','from2'];
export const heightZoneArea=z=>heightZoneKeys.reduce((sum,key)=>sum+z[key],0);
export const heightZoneResult=z=>z.between1and2*.5+z.from2;
export function validateHeightZones(z,netArea){
 if(!z||heightZoneKeys.some(key=>!Number.isFinite(z[key])||z[key]<0))throw Error('Höhenzonen: Bitte drei nicht negative Teilflächen eingeben.');
 if(Math.abs(heightZoneArea(z)-netArea)>1e-6)throw Error('Höhenzonen: Die Summe muss der Grundfläche nach §-3-Abzug entsprechen.');
 return z;
}
