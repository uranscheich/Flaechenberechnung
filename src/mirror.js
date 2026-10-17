import {innerWidth} from './architecture.js';
const tidy=n=>Number(n.toFixed(9));
export const mirrorPoint=([x,y])=>[tidy(innerWidth()-x),y];
export const mirrorPoints=points=>points.map(mirrorPoint);
export function mirrorWall(w){const v=w.from[0]===w.to[0],length=Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]);return {...w,id:w.exterior?(w.id==='east'?'west':w.id==='west'?'east':w.id):w.id,from:v?[tidy(innerWidth()-w.from[0]-w.thickness),w.from[1]]:mirrorPoint(w.to),to:v?[tidy(innerWidth()-w.to[0]-w.thickness),w.to[1]]:mirrorPoint(w.from),openings:w.openings.map(o=>({...o,offset:v?o.offset:tidy(length-o.offset-o.width),...(o.kind==='door'?{hinge:v?o.hinge:o.hinge==='start'?'end':'start',swing:v?(o.swing==='positive'?'negative':'positive'):o.swing}:{})}))}}
export function mirrorLayout(layout){return {...layout,walls:layout.walls.map(mirrorWall),stairs:mirrorPoints(layout.stairs)}}
