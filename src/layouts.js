import {mirrorPoints,mirrorLayout} from './mirror.js';
import {building as b,sideOffset,facadeOffset,innerWidth,innerDepth} from './architecture.js';
const t=b.partition, W=innerWidth(), D=innerDepth();
const rightHandPoints={
 eg1:[[0,0],[W,0],[W,3.455],[4.01,3.455],[4.01,5.65],[2.885,5.65],[2.885,6.64],[0,6.64]],
 eg2:[[0,6.755],[2.885,6.755],[2.885,D],[0,D]],
 eg3:[[3,7.285],[4.315,7.285],[4.315,8.425],[W,8.425],[W,D],[3,D]],
 eg4:[[4.43,6.755],[W,6.755],[W,8.31],[4.43,8.31]],
 eg5:[[3,5.765],[4.315,5.765],[4.315,7.285],[3,7.285]],
 // Store: stepped door reveals, recess around the stair core and diagonal
 // stair boundary. Unlabelled detail lengths remain a traced contour.
 eg6:[[W,3.63],[4.24,3.63],[4.24,3.695],[4.125,3.695],[4.125,4.455],[4.24,4.455],[4.24,4.58],[4.74,4.58],[4.74,5.35],[W,4.75]],
 eg7:[[4.43,D+facadeOffset()],[W,D+facadeOffset()],[W,D+facadeOffset()+.885],[4.43,D+facadeOffset()+.885]],
 og1:[[0,0],[2.76,0],[2.76,4.765],[0,4.765]],
 og2:[[2.875,0],[W,0],[W,3.455],[2.875,3.455]],
 og3:[[0,4.88],[3.01,4.88],[3.01,D],[0,D]],
 og4:[[3.125,6.755],[W,6.755],[W,D],[3.125,D]],
 og5:[[2.875,3.63],[4.2,3.63],[4.2,4.65],[4.55,4.65],[4.55,5.65],[4.2,5.65],[4.2,6.64],[3.125,6.64],[3.125,4.88],[2.875,4.88]],
 dg1:[[0,2.175],[W,2.175],[W,7.975],[0,7.975]]
};
export const planPoints=Object.fromEntries(Object.entries(rightHandPoints).map(([id,p])=>[id,mirrorPoints(p)]));
const opening=(id,offset,width,hinge='start',swing='negative',rooms=[])=>({id,kind:'door',offset,width,hinge,swing,rooms});
const window=(id,offset,width)=>({id,kind:'window',offset,width});
const wall=(id,from,to,openings=[],thickness=t,exterior=false)=>({id,from,to,thickness,openings,exterior});
function envelope(floor){const sx=sideOffset(),fy=facadeOffset();const north=floor==='eg'?[opening('garden',1.23,.95,'start','positive',['outside','eg1']),window('garden-glazing',2.18,2.5)]:[window('child-1-window',1.1,1.05),window('child-2-window',3.7,1.05)];const south=[window('south-window',.78,1.5),...(floor==='eg'?[opening('entrance',3.13,1.1,'start','negative',['outside','eg3'])]:[window('bath-window',4.48,.8)])];return [wall('north',[-sx,-fy],[W+sx,-fy],north,fy,true),wall('south',[-sx,D],[W+sx,D],south,fy,true),wall('west',[-sx,0],[-sx,D],[],sx,true),wall('east',[W,0],[W,D],[],sx,true)]}
function rightHandLayout(id){const walls=id==='dg'?[wall('west',[-sideOffset(),2.175],[-sideOffset(),7.975],[],sideOffset(),true),wall('east',[W,2.175],[W,7.975],[],sideOffset(),true)]:envelope(id);
 if(id==='eg')walls.push(
  wall('living-kitchen',[0,6.64],[2.885,6.64]),
  wall('circulation-west',[2.885,5.65],[2.885,D],[opening('kitchen',1.845,.885,'end','negative',['eg2','eg3'])]),
  wall('hall-north',[2.885,5.65],[4.01,5.65],[opening('living-hall',.125,.885,'end','negative',['eg1','eg5'])]),
  wall('store-north',[4.24,3.455],[W,3.455],[],.175),
  wall('store-head',[4.01,3.455],[4.24,3.455],[],.24),
  wall('store-west',[4.01,3.455],[4.01,4.695],[opening('store',.24,.76,'end','negative',['eg1','eg6'])]),
  wall('store-reveal',[4.125,4.455],[4.24,4.455],[],.24),
  wall('store-recess',[4.24,4.58],[4.74,4.58]),
  wall('stair-core-west',[4.625,4.695],[4.625,5.65]),
  wall('hall-return',[4.01,4.695],[4.01,5.65]),
  wall('stair-core-south',[4.01,5.65],[4.74,5.65]),
  wall('wc-north',[4.315,6.64],[W,6.64]),
  wall('wc-west',[4.315,6.755],[4.315,8.31],[opening('wc',.795,.76,'end','negative',['eg3','eg4'])]),
  wall('wc-south',[4.315,8.31],[W,8.31]),
  wall('annex-west',[4.315,D+facadeOffset()],[4.315,D+facadeOffset()+1]),
  wall('annex-east',[W,D+facadeOffset()],[W,D+facadeOffset()+1],[],sideOffset()),
  wall('annex-south',[4.315,D+facadeOffset()+.885],[W+sideOffset(),D+facadeOffset()+.885])
 );
 if(id==='og')walls.push(
  wall('child-divider',[2.76,0],[2.76,4.765],[opening('child-1',3.78,.885,'end','negative',['og1','og5'])]),
  wall('child-2-south',[2.875,3.455],[W,3.455],[opening('child-2',.25,.885,'start','negative',['og2','og5'])],.175),
  wall('child-1-south',[0,4.765],[3.125,4.765]),
  wall('bedroom-hall',[3.01,4.88],[3.01,6.755],[opening('bedroom',.75,.885,'start','negative',['og3','og5'])]),
  wall('bedroom-bath',[3.01,6.755],[3.01,D]),
  wall('bath-north',[3.125,6.64],[W,6.64],[opening('bath',0,.76,'start','positive',['og4','og5'])])
 );
 return {walls,stairs:id==='og'?[[4.2,3.63],[W,3.63],[W,6.64],[4.2,6.64],[4.2,5.65],[4.55,5.65],[4.55,4.65],[4.2,4.65]]:id==='eg'?[[W,4.75],[4.74,5.35],[4.74,5.765],[4.315,5.765],[4.315,6.64],[W,6.64]]:[]};
}
export function wallLength(w){return Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1])}
export function wallSegments(w){const parts=[];let from=0;for(const o of [...w.openings].sort((a,b)=>a.offset-b.offset)){if(o.offset>from)parts.push([from,o.offset]);from=o.offset+o.width}if(from<wallLength(w))parts.push([from,wallLength(w)]);return parts}
export function openingGeometry(w,o){const vertical=w.from[0]===w.to[0],dir=vertical?[0,1]:[1,0],normal=vertical?[1,0]:[0,1],at=o.offset+(o.hinge==='end'?o.width:0),face=o.swing==='positive'?w.thickness:0;const hinge=w.from.map((n,i)=>n+dir[i]*at+normal[i]*face);const closed=dir.map(n=>n*o.width*(o.hinge==='end'?-1:1)),opened=normal.map(n=>n*o.width*(o.swing==='positive'?1:-1));return {hinge,closed:hinge.map((n,i)=>n+closed[i]),opened:hinge.map((n,i)=>n+opened[i]),sweep:closed[0]*opened[1]-closed[1]*opened[0]>0?1:0}}

export function floorLayout(id){return mirrorLayout(rightHandLayout(id))}
