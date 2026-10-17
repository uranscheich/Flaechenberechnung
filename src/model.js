export const palette=['#b8c8b1','#d8c9ae','#a9c2c6','#d3b5a5','#c1bbd4','#cbd0c7','#e2d6bc'];
export const polygonArea=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1]},0))/2;
const room=(id,name,ref,points,color,verified=false)=>({id,name,reference:ref,points,color,verified,method:verified?'geometry':'reference',factor:1,include:true,category:'Innenfläche'});
export function initialProject(){return {version:1,title:'Haustyp M',subtitle:'Mittelhaus · Bestandsaufnahme',author:'',notes:'Grundlage: bereitgestellter Bestandsplan. Maße in Metern. Ergänzte Konturen vor Ort prüfen.',floors:[
{id:'eg',name:'Erdgeschoss',short:'EG',rooms:[
room('eg1','Wohnen / Essen',31.69,[[0,0],[5.69,0],[5.69,3.9],[4.25,3.9],[4.25,5],[3.01,5],[3.01,6.65],[0,6.65]],palette[0]),
room('eg2','Küche',8.24,[[0,6.765],[2.885,6.765],[2.885,9.65],[0,9.65]],palette[1],true),
room('eg3','Windfang',4.48,[[3,7.78],[4.315,7.78],[4.315,8.505],[5.69,8.505],[5.69,9.65],[3,9.65]],palette[2]),
room('eg4','WC',1.96,[[4.43,6.95],[5.69,6.95],[5.69,8.39],[4.43,8.39]],palette[3]),
room('eg5','Flur',2,[[3.125,5.115],[4.315,5.115],[4.315,7.665],[3.125,7.665]],palette[4]),
room('eg6','Abstellraum',1.35,[[4.365,4.015],[5.69,4.015],[5.69,4.885],[4.365,4.885]],palette[5]),
room('eg7','Hausanschluss',1.11,[[4.43,9.9],[5.69,9.9],[5.69,10.65],[4.43,10.65]],palette[6])]},
{id:'og',name:'Obergeschoss',short:'OG',rooms:[
room('og1','Kind 01',13.02,[[0,0],[2.76,0],[2.76,3.515],[2.56,3.515],[2.56,4.76],[0,4.76]],palette[0]),
room('og2','Kind 02',9.79,[[2.875,0],[5.69,0],[5.69,3.515],[2.875,3.515]],palette[2],true),
room('og3','Schlafen',14.19,[[0,4.875],[2.79,4.875],[2.79,6.765],[3.01,6.765],[3.01,9.65],[0,9.65]],palette[1]),
room('og4','Bad',7.16,[[3.125,6.765],[5.69,6.765],[5.69,9.65],[3.125,9.65]],palette[3],true),
room('og5','Flur',3.96,[[2.875,3.63],[4.15,3.63],[4.15,6.65],[2.905,6.65],[2.905,4.76],[2.675,4.76],[2.675,3.63]],palette[4])]},
{id:'dg',name:'Dachgeschoss',short:'DG',rooms:[room('dg1','Dachboden',32.67,[[0,2.175],[5.69,2.175],[5.69,7.975],[0,7.975]],palette[1],true)]}
]}}
export function effectiveArea(r){return (r.method==='reference'?r.reference:polygonArea(r.points))*r.factor}
export const total=rooms=>rooms.filter(r=>r.include).reduce((n,r)=>n+effectiveArea(r),0);
export function validateProject(p){if(!p||p.version!==1||typeof p.title!=='string'||p.title.length>200||!Array.isArray(p.floors)||!p.floors.length||p.floors.length>12)throw Error('Ungültiges Projektformat.');const ids=new Set();for(const f of p.floors){if(typeof f.id!=='string'||typeof f.name!=='string'||!Array.isArray(f.rooms)||f.rooms.length>100)throw Error('Ungültiges Geschoss.');for(const r of f.rooms){if(typeof r.id!=='string'||ids.has(r.id)||typeof r.name!=='string'||r.name.length>100||!/^#[0-9a-f]{6}$/i.test(r.color)||!Number.isFinite(r.factor)||r.factor<0||r.factor>1||!Number.isFinite(r.reference)||r.reference<0||typeof r.include!=='boolean'||!['geometry','reference',undefined].includes(r.method)||!Array.isArray(r.points)||r.points.length<3||r.points.length>100||r.points.some(v=>!Array.isArray(v)||v.length!==2||v.some(n=>!Number.isFinite(n)||Math.abs(n)>1000)))throw Error('Ungültige Raumdaten.');if(polygonArea(r.points)<.001||hasSelfIntersection(r.points))throw Error('Raumkontur ist ungültig.');ids.add(r.id)}}return p}
export function hasSelfIntersection(points){const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){if(j===i+1||(i===0&&j===points.length-1))continue;const a=points[i],b=points[(i+1)%points.length],c=points[j],d=points[(j+1)%points.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return true}return false}
export function isRectangle(p){if(p.length!==4)return false;return p.every((a,i)=>{const b=p[(i+1)%4];return (Math.abs(a[0]-b[0])<1e-9)!==(Math.abs(a[1]-b[1])<1e-9)})}
