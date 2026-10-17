const epsilon=1e-9;
const tidy=n=>Number(n.toFixed(12));
export const partArea=part=>part.length*part.width/(part.shape==='triangle'?2:1);
export const partsArea=parts=>parts.reduce((sum,part)=>sum+partArea(part),0);
export function validateParts(parts){
 if(!Array.isArray(parts)||!parts.length||parts.length>100||parts.some(p=>!p||!['rectangle','triangle'].includes(p.shape)||!Number.isFinite(p.length)||!Number.isFinite(p.width)||p.length<=0||p.width<=0||p.length>1000||p.width>1000))throw Error('Teilflächen: positive Längen und Breiten bis 1.000 m eingeben.');
 return parts;
}

// Sweep a simple polygon in horizontal bands. Each band is a rectangle plus
// edge triangles, or two triangles when its top and bottom do not overlap.
// Unlike a bounding box, these parts preserve niches and diagonal boundaries.
export function polygonParts(points){
 const levels=[...new Set(points.map(p=>p[1]))].sort((a,b)=>a-b),parts=[];
 const add=(shape,length,width,x,y)=>{if(length>epsilon&&width>epsilon)parts.push({shape,length:tidy(length),width:tidy(width),x:tidy(x),y:tidy(y)});};
 for(let i=1;i<levels.length;i++){
  const y0=levels[i-1],y1=levels[i],mid=(y0+y1)/2,height=y1-y0;
  const edges=points.flatMap((a,j)=>{const b=points[(j+1)%points.length];if(mid<=Math.min(a[1],b[1])||mid>=Math.max(a[1],b[1]))return [];const x=y=>a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]);return [{top:x(y0),bottom:x(y1),mid:x(mid)}];}).sort((a,b)=>a.mid-b.mid);
  if(edges.length%2)throw Error('Raumkontur lässt sich nicht in Teilflächen zerlegen.');
  for(let j=0;j<edges.length;j+=2){
   const l=edges[j],r=edges[j+1],left=Math.max(l.top,l.bottom),right=Math.min(r.top,r.bottom);
   if(right>=left-epsilon){
    add('rectangle',height,Math.max(0,right-left),left,y0);
    add('triangle',height,Math.abs(l.bottom-l.top),Math.min(l.top,l.bottom),y0);
    add('triangle',height,Math.abs(r.bottom-r.top),right,y0);
   }else{
    add('triangle',height,r.top-l.top,l.top,y0);
    add('triangle',height,r.bottom-l.bottom,l.bottom,y0);
   }
  }
 }
 const merged=[];
 for(const part of parts){
  const prior=part.shape==='rectangle'&&merged.find(p=>p.shape==='rectangle'&&Math.abs(p.x-part.x)<epsilon&&Math.abs(p.width-part.width)<epsilon&&Math.abs(p.y+p.length-part.y)<epsilon);
  if(prior)prior.length=tidy(prior.length+part.length);else merged.push({...part});
 }
 return merged.map(({shape,length,width})=>({shape,length,width}));
}
