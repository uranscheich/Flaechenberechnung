import {mirrorPoint} from './mirror.js';
import {building as b} from './architecture.js';
import {floorLayout,wallSegments,openingGeometry} from './layouts.js';
export function structureSVG(id,{X,Y,s}){
 const layout=floorLayout(id),rect=(x,y,w,h,attrs='')=>`<rect x="${X(x)}" y="${Y(y)}" width="${w*s}" height="${h*s}" ${attrs}/>`;
 let walls='',doors='',windows='';
 for(const w of layout.walls){const v=w.from[0]===w.to[0];for(const [a,z] of wallSegments(w)){const x=w.from[0]+(v?0:a),y=w.from[1]+(v?a:0),ww=v?w.thickness:z-a,hh=v?z-a:w.thickness;walls+=rect(x,y,ww,hh,`data-wall="${w.id}" fill="${w.exterior?'#e9ecdf':'#58614f'}" stroke="#364330" stroke-width=".65"`);if(w.exterior){const inset=['east','south'].includes(w.id)?w.thickness-(v?b.sideWall:b.facadeWall):0;walls+=rect(x+(v?inset:0),y+(v?0:inset),v?b.sideWall:ww,v?hh:b.facadeWall,'fill="url(#wallHatch)" stroke="#768367" stroke-width=".3"')}}
 for(const o of w.openings){const x=w.from[0]+(v?0:o.offset),y=w.from[1]+(v?o.offset:0),cross=v?`M${X(x)},${Y(y)}h${w.thickness*s} M${X(x)},${Y(y+o.width)}h${w.thickness*s}`:`M${X(x)},${Y(y)}v${w.thickness*s} M${X(x+o.width)},${Y(y)}v${w.thickness*s}`;const jamb=`<path d="${cross}" fill="none" stroke="#59684f" stroke-width=".75"/>`;if(o.kind==='window'){windows+=jamb+rect(x+(v?w.thickness*.35:0),y+(v?0:w.thickness*.35),v?w.thickness*.3:o.width,v?o.width:w.thickness*.3,'fill="#f9fcf8" stroke="#7d8b72" stroke-width=".65"');continue}const g=openingGeometry(w,o),[hx,hy]=g.hinge,[cx,cy]=g.closed,[ox,oy]=g.opened;doors+=`<g data-door="${o.id}" data-door-wall="${w.id}">${jamb}<path d="M${X(hx)},${Y(hy)}L${X(ox)},${Y(oy)}" fill="none" stroke="#63735a" stroke-width="1"/><path d="M${X(cx)},${Y(cy)}A${o.width*s},${o.width*s} 0 0 ${g.sweep} ${X(ox)},${Y(oy)}" fill="none" stroke="#89977d" stroke-width=".65"/></g>`}
 }
 const MX=x=>X(mirrorPoint([x,0])[0]);
 const p=layout.stairs.map(([x,y])=>`${X(x)},${Y(y)}`).join(' ');let stairs=p?`<polygon points="${p}" fill="#f4f5ed" stroke="#9aa58b" stroke-width=".6"/>`:'';
 if(id==='eg')for(let i=1;i<9;i++)stairs+=`<path d="M${MX(4.43)},${Y(5.015+i*.18)}H${MX(5.69)}" stroke="#9aa58b" stroke-width=".55"/>`;
 if(id==='og'){for(let i=1;i<6;i++){const a=i/6;stairs+=`<path d="M${MX(4.2+(5.69-4.2)*a)},${Y(3.63)}L${MX(4.55)},${Y(4.65)} M${MX(4.55)},${Y(5.65)}L${MX(4.2+(5.69-4.2)*a)},${Y(6.64)}" stroke="#9aa58b" stroke-width=".55"/>`}for(let i=1;i<5;i++)stairs+=`<path d="M${MX(4.55)},${Y(4.65+i*.2)}H${MX(5.69)}" stroke="#9aa58b" stroke-width=".55"/>`}
 return {walls,doors,windows,stairs};
}
